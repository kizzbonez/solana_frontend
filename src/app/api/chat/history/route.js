import { NextResponse } from "next/server";
import { chatRegion, REGION_MESSAGE } from "@/app/lib/chat-region";
import { userTokenOf } from "@/app/lib/chat-user";
import { withRouteRateLimit } from "@/app/lib/rate-limit";

/**
 * GET /api/chat/history?limit=10 — the signed-in visitor's past conversation,
 * as the backend recorded it.
 *
 *   out   { messages: [{ id, role, text }], sessionId, count }
 *
 * This is the server-side half of the history story. Guests keep their
 * conversation in localStorage for seven days (see lib/chat-history.js) because
 * there is no account to hang it on; a signed-in visitor's conversation is
 * stored by the backend as it happens, and read back here — so it survives a
 * cleared browser, and follows them to a different device.
 *
 * The backend records a conversation against a user only when POST /api/chat
 * carried an X-User-Token. That is the writing half; without it this endpoint
 * would authenticate perfectly well and always come back empty.
 *
 * UNLIKE /api/chat, this route DOES reshape what the backend returns. That is
 * deliberate rather than inconsistent: /api/chat passes a reply through because
 * the backend owns that contract end to end, whereas here the target shape is
 * the widget's own message array — an app concern the backend knows nothing
 * about. The adapting has to happen somewhere, and one place on the server is
 * better than in every caller.
 */
export const dynamic = "force-dynamic";

const BACKEND_TIMEOUT_MS = 15_000;

/** The spec's example is limit=10; the cap bounds a crafted request. */
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const fail = (message, status) =>
  NextResponse.json({ error: true, message }, { status });

/** Empty is a normal answer — a first conversation has no history. */
const EMPTY = { messages: [], sessionId: null, count: 0 };

const clampLimit = (value) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, n));
};

/**
 * The list of exchanges, wherever the backend chose to put it.
 *
 * Written against the endpoint's live behaviour but deliberately tolerant of
 * the envelope: DRF pagination (`results`), a bare array, and the two obvious
 * key names all mean the same thing here, and guessing wrong would show a
 * signed-in visitor an empty history rather than an error anyone would notice.
 */
function itemsOf(data) {
  if (Array.isArray(data)) return data;
  for (const key of ["results", "messages", "history", "conversations", "items"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

const text = (value) => (typeof value === "string" && value.trim() ? value : null);

/**
 * One stored record into zero, one or two widget messages.
 *
 * A chat log can be kept either way round: one row per message with a role, or
 * one row per exchange holding both halves. Both are handled — an exchange row
 * expands into the question and the answer, in that order, which is the whole
 * point of storing it.
 */
function toMessages(record, index) {
  if (!record || typeof record !== "object") return [];

  const id = (suffix) => `h${index}${suffix}`;

  // One row per message.
  const role = record.role || record.sender || record.type;
  if (role === "user" || role === "assistant") {
    const body = text(record.text ?? record.content ?? record.message);
    return body ? [{ id: id(""), role, text: body }] : [];
  }

  // One row per exchange.
  const asked = text(record.message ?? record.question ?? record.prompt ?? record.query);
  const answered = text(record.reply ?? record.answer ?? record.response);
  const out = [];
  if (asked) out.push({ id: id("q"), role: "user", text: asked });
  if (answered) out.push({ id: id("a"), role: "assistant", text: answered });
  return out;
}

/** Milliseconds, or null when the record carries no usable timestamp. */
function timeOf(record) {
  const raw = record?.created_at ?? record?.timestamp ?? record?.created ?? record?.date;
  const ms = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(ms) ? ms : null;
}

/**
 * The backend's history into the widget's transcript.
 *
 * Ordering is the one thing worth being careful about: `?limit=10` naturally
 * means "the most recent ten", and a log read newest-first would render the
 * conversation backwards. Where every record carries a timestamp the order is
 * decided from the data and the question does not arise. Where none does, the
 * given order is kept — inventing a reversal on a guess would be the same bug
 * in the other direction.
 */
function normalize(data) {
  const raw = itemsOf(data);
  if (!raw.length) return EMPTY;

  const times = raw.map(timeOf);
  const ordered = times.every((t) => t !== null)
    ? raw
        .map((record, i) => ({ record, i, t: times[i] }))
        .sort((a, b) => a.t - b.t || a.i - b.i)
        .map(({ record }) => record)
    : raw;

  const messages = ordered.flatMap(toMessages);

  // The session the backend threads these on, so a restored conversation is
  // continued rather than started again alongside it. Taken from the newest
  // record that names one, falling back to the envelope.
  const sessionId =
    [...ordered].reverse().map((r) => text(r?.session_id)).find(Boolean) ||
    text(data?.session_id) ||
    null;

  return { messages, sessionId, count: messages.length };
}

async function handler(request) {
  // Same rule as the rest of the assistant. A visitor who cannot use it has no
  // conversation to read, and one gate is easier to reason about than two.
  const region = chatRegion(request);
  if (!region.allowed) return fail(REGION_MESSAGE, 403);

  // Guests have no server-side history by design — theirs lives in their own
  // browser. This is "no history for you", not a fault, but it is still a 401:
  // the caller asked for something only an identified user has.
  const token = userTokenOf(request);
  if (!token) return fail("Sign in to load your conversation history.", 401);

  const base = process.env.NEXT_SOLANA_BACKEND_URL;
  const storeDomain = process.env.NEXT_PUBLIC_STORE_DOMAIN;
  // Verified against the live endpoint: X-User-Token alone is refused with
  // DRF's "Authentication credentials were not provided", and the collections
  // key alone gets past authentication only to be told "login required". Both
  // headers are required together — neither is optional.
  const apiKey = process.env.NEXT_SOLANA_COLLECTIONS_KEY;

  if (!base || !storeDomain || !apiKey) {
    console.error("chat/history: backend URL, store domain or collections key is unset");
    return fail("The assistant is not configured.", 503);
  }

  const limit = clampLimit(request.nextUrl.searchParams.get("limit"));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const res = await fetch(`${base}/api/chat/history?limit=${limit}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Api-Key ${apiKey}`,
        "X-Store-Domain": storeDomain,
        // The bare token, not "Bearer <token>" — see userTokenOf().
        "X-User-Token": token,
      },
      cache: "no-store",
      signal: controller.signal,
    });

    // Same defensive parse as /api/chat: the backend answers with an HTML error
    // page when a route is missing or blows up.
    const body = await res.text();
    let data = null;
    try {
      data = JSON.parse(body);
    } catch {
      /* not JSON — handled below */
    }

    if (!res.ok) {
      // An expired or rejected token is the ordinary case here, not an outage:
      // the access token is rotated every ten minutes and a page left open
      // overnight will have a stale one. Passed through as a 401 so the widget
      // can fall back to the local copy silently.
      if (res.status === 401 || res.status === 403) {
        return fail("Your session has expired. Sign in again to load history.", 401);
      }
      // Nothing stored yet reads as a 404 on some backends. That is an empty
      // history, not a failure — returning an error would put a red banner in
      // front of someone whose only mistake was not having chatted before.
      if (res.status === 404) return NextResponse.json(EMPTY);

      console.error(`chat/history: backend responded ${res.status}`);
      return fail("Couldn't load your conversation history.", 502);
    }

    return NextResponse.json(normalize(data), {
      // One person's conversation. Never shared, never stored by anything in
      // between — the same reasoning as /api/chat/availability, with more at
      // stake if it were got wrong.
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    const timedOut = err?.name === "AbortError";
    console.error("chat/history: request failed:", timedOut ? "timeout" : err);
    return fail("Couldn't load your conversation history.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

// A cheap read with no model call behind it, so the light bucket rather than
// the assistant's own — this does not need to bound spend.
export const GET = withRouteRateLimit(handler, "light");
