import { NextResponse } from "next/server";
import { STORE_ID } from "@/app/lib/store";
import { clientKey, withRouteRateLimit } from "@/app/lib/rate-limit";
import { allowedCountries, chatRegion, REGION_MESSAGE } from "@/app/lib/chat-region";
import { userTokenOf } from "@/app/lib/chat-user";

/**
 * POST /api/chat — proxy to the Django backend's assistant.
 *
 * Same shape as the other backend proxies in this app (see pages/api/login.js):
 * the browser never talks to the backend directly, so the backend URL stays
 * server-side and every brand is identified by the X-Store-Domain header rather
 * than by anything the client could set.
 *
 *   in    { message, session_id? }
 *   out   { reply, session_id, took_ms, ... }   — the backend's object, as-is
 *
 * The response is passed through unchanged rather than reshaped. The backend
 * owns that contract, and a proxy that renames fields is a second contract to
 * keep in step. `session_id` comes back on the first reply and is echoed on
 * every following message so the backend can thread the conversation.
 *
 * NOTE (12 Aug 2026): the backend route is not deployed yet. Everything here is
 * written against the agreed contract above; until it lands, this returns a
 * clean 502 that the widget renders as a friendly "unavailable" message rather
 * than a broken UI. Set CHAT_MOCK=1 in a non-production environment to exercise
 * the widget without it.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Model calls are slow but not unbounded. Cut it off before the platform does,
 * so a hung backend surfaces as a typed error instead of an opaque timeout.
 */
const BACKEND_TIMEOUT_MS = 45_000;

const MAX_MESSAGE_LENGTH = 2000;

const fail = (message, status) =>
  NextResponse.json({ error: true, message }, { status });

/** Addresses that mean "this machine", not a visitor. */
const isLoopback = (ip) =>
  !ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("127.");

/**
 * Public address of the machine running the dev server. Resolved once and
 * remembered, so the lookup costs one request per process, not one per chat.
 */
let devPublicIp;

/**
 * The visitor's address.
 *
 * In production this is the client IP the edge put in x-forwarded-for, full
 * stop. In local development there is no network hop — the browser and the
 * server are the same machine — so the honest answer is ::1, and that is what
 * the backend was being told.
 *
 * That is correct but useless for checking the logging works end to end, so in
 * development only, a loopback address is swapped for this machine's real
 * public IP. Guarded on NODE_ENV so it cannot run on a deployed build, where
 * doing so would be actively wrong: every visitor would be logged under the
 * server's own address.
 */
async function resolveClientIp(request) {
  const ip = clientKey(request);

  if (process.env.NODE_ENV === "production" || !isLoopback(ip)) return ip;

  if (devPublicIp !== undefined) return devPublicIp || ip;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = res.ok ? await res.json() : null;
    devPublicIp = typeof data?.ip === "string" ? data.ip : null;
  } catch {
    // Offline, or the lookup is blocked. Fall back to the loopback address —
    // this is a development convenience, not something to fail a request over.
    devPublicIp = null;
  }

  if (devPublicIp) {
    console.info(`chat: dev build — reporting public IP ${devPublicIp} instead of ${ip}`);
  }
  return devPublicIp || ip;
}

/**
 * Canned reply for local UI work while the backend route is missing.
 * Deliberately refuses to run in production — a mocked assistant that reaches
 * real shoppers is worse than a disabled one.
 */
function mockReply(message) {
  return NextResponse.json({
    reply:
      `(mock) You said: "${message}". The backend assistant is not connected ` +
      `yet, so this is a canned reply for testing the widget.`,
    session_id: "mock-session",
    took_ms: 42,
    mock: true,
  });
}

async function handler(request) {
  // Checked before anything else, including reading the body. Each message
  // costs the backend a model call, so a request we are going to refuse should
  // cost as close to nothing as possible.
  const region = chatRegion(request);
  if (!region.allowed) {
    console.info(`chat: refused — country ${region.country ?? "unknown"}`);
    return fail(REGION_MESSAGE, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Body must be JSON.", 400);
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return fail("message is required.", 400);
  if (message.length > MAX_MESSAGE_LENGTH) {
    return fail(`message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`, 400);
  }

  if (process.env.CHAT_MOCK === "1" && process.env.NODE_ENV !== "production") {
    return mockReply(message);
  }

  const base = process.env.NEXT_SOLANA_BACKEND_URL;
  if (!base) {
    return fail("The assistant is not configured.", 503);
  }

  // X-Store-Domain is how the backend knows which of the three brands is
  // asking. Refuse rather than send it empty: a blank value doesn't fail, it
  // leaves the backend to pick a store on its own, and answering BBQ shoppers
  // from Solana's catalogue is worse than answering nobody.
  const storeDomain = process.env.NEXT_PUBLIC_STORE_DOMAIN;
  if (!storeDomain) {
    console.error("chat: NEXT_PUBLIC_STORE_DOMAIN is unset — refusing to proxy");
    return fail("The assistant is not configured for this store.", 503);
  }

  // The assistant authenticates with the collections key, same as the blogs
  // API. The general backend key returns 401 here — verified against the live
  // endpoint, so this is not interchangeable.
  const apiKey = process.env.NEXT_SOLANA_COLLECTIONS_KEY;
  if (!apiKey) {
    console.error("chat: NEXT_SOLANA_COLLECTIONS_KEY is unset — refusing to proxy");
    return fail("The assistant is not configured.", 503);
  }

  const payload = { message };
  // Sent only from the second message onward. The backend issues session_id
  // with the first reply; the client echoes it back and we forward it. Never
  // invented here — a made-up id would either collide or start a phantom
  // conversation.
  if (typeof body?.session_id === "string" && body.session_id.trim()) {
    payload.session_id = body.session_id.trim();
  }

  // Reuses the rate limiter's notion of the client so the address the backend
  // is told about is the same one we throttle on — two definitions of "who is
  // asking" would eventually disagree.
  const clientIp = await resolveClientIp(request);
  if (!clientIp) {
    console.warn("chat: could not determine client IP — sending without X-Client-IP");
  }

  // Who is asking, when they are signed in. This is what makes the conversation
  // recoverable later: the backend files an exchange against a user only when
  // the request carried this, and GET /api/chat/history reads back exactly what
  // was filed. Without it here, that endpoint would authenticate perfectly well
  // and always return nothing.
  //
  // Absent for a guest, and that is the whole design rather than a gap — a
  // guest has no account to store anything against, so their conversation stays
  // in their own browser (see lib/chat-history.js).
  const userToken = userTokenOf(request);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    // Trailing slash is required. Django's route is `api/chat/`, and a POST to
    // the slashless form is a plain 404 rather than the redirect a GET gets.
    const res = await fetch(`${base}/api/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Store-Domain": storeDomain,
        Authorization: `Api-Key ${apiKey}`,
        // The real visitor's address, not this server's. Everything the backend
        // sees comes from here, so without it every conversation would appear
        // to originate from one deployment IP.
        //
        // Omitted rather than sent empty when it cannot be determined: a blank
        // value is not a fallback, it is a wrong answer that looks like one.
        ...(clientIp ? { "X-Client-IP": clientIp } : {}),
        // Same rule: sent when there is a signed-in visitor, omitted entirely
        // for a guest rather than sent empty.
        ...(userToken ? { "X-User-Token": userToken } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    // The backend renders an HTML error page when a route is missing or blows
    // up, so parse defensively rather than assuming JSON comes back.
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* not JSON — handled below */
    }

    if (!res.ok) {
      console.error(`chat: backend responded ${res.status}`);
      return fail(
        res.status === 404
          ? "The assistant is not available yet."
          : "The assistant is temporarily unavailable.",
        502,
      );
    }

    if (!data || typeof data.reply !== "string") {
      console.error("chat: backend returned an unexpected body");
      return fail("The assistant returned an unexpected response.", 502);
    }

    return NextResponse.json(data);
  } catch (err) {
    const timedOut = err?.name === "AbortError";
    console.error("chat: backend request failed:", timedOut ? "timeout" : err);
    return fail(
      timedOut
        ? "The assistant took too long to respond. Try again."
        : "The assistant is temporarily unavailable.",
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const POST = withRouteRateLimit(handler, "chat");

/** Discovery aid — describes the endpoint instead of 405-ing. */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/chat",
    method: "POST",
    store: STORE_ID,
    request: { message: "string (required)", session_id: "string (optional)" },
    response: { reply: "string", session_id: "string", took_ms: "number" },
    auth: "Authorization: Bearer <access token> — optional; identifies a signed-in visitor so the conversation is stored against them",
    availability: "/api/chat/availability",
    history: "/api/chat/history?limit=10 (signed-in visitors only)",
    regions: allowedCountries(),
  });
}
