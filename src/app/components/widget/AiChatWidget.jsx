"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/app/context/cart";
import { useAuth } from "@/app/context/auth";
import {
  clearAccountHistories,
  clearHistory,
  loadHistory,
  pruneExpiredHistory,
  saveHistory,
} from "@/app/lib/chat-history";

/**
 * Storefront AI assistant — floating button plus a centred modal.
 *
 * Talks to /api/chat, which proxies the backend assistant. The backend owns the
 * conversation: it returns a session_id on the first reply and we echo it back
 * on every following message, so no transcript is reassembled client-side.
 *
 * Positioned bottom-LEFT on purpose. Zoho's live-chat button is fixed at
 * bottom-5 right-5 with z-index 999999; two floating buttons in the same corner
 * is the kind of collision nobody notices until it ships.
 *
 * Speech-to-text uses the browser's own SpeechRecognition API — no dependency,
 * no service, no cost. It is feature-detected and the button simply does not
 * render where the API is missing (Firefox, and any non-HTTPS origin).
 */

const TYPING_SPEED_MS = 12; // per character
/**
 * Session-scoped cache of the region check. Session rather than local storage
 * on purpose: a visitor who travels, or drops a VPN, gets a fresh answer on
 * their next visit instead of being stuck with a stale one indefinitely.
 */
const AVAILABILITY_KEY = "sf:chat-available";
/**
 * How much of a signed-in visitor's stored conversation to read back. Ten
 * exchanges is a conversation someone would recognise as theirs without
 * dragging a month of them into the panel every time it opens.
 */
const HISTORY_LIMIT = 10;
/** /api/chat/products accepts at most this many handles per request. */
const PRODUCT_BATCH_SIZE = 8;
const GREETING =
  "Hi! Ask me anything about the products here — what fits your space, what's in your budget, or how two models compare.";

/** Browser speech recognition, where it exists. */
function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Renders a reply, turning bare URLs into links.
 *
 * The assistant answers with product URLs inline in its prose ("You can view it
 * here: https://…"), so without this the single most useful part of the reply
 * is un-clickable text the shopper has to select and copy.
 *
 * Built as React elements rather than injected HTML — the reply is model
 * output, and handing that to dangerouslySetInnerHTML would make any future
 * prompt injection a scripting hole. Links open in a new tab so the
 * conversation survives the click.
 */
// Split keeps the capture group, so each URL arrives as its own part. The test
// below is deliberately a separate, non-global regex: calling .test() on a /g
// pattern advances lastIndex between calls and would match every other link.
const URL_SPLIT = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;
const IS_URL = /^https?:\/\//;

/**
 * Product URLs the assistant writes are broken: it emits /product/{handle}
 * while this storefront serves /{brand}/product/{handle}, so every one 404s.
 * They are pulled out of the prose and replaced by real cards resolved from the
 * catalogue — so the text keeps its sentence and loses the dead link.
 */
const PRODUCT_URL = /https?:\/\/[^\s<>()]*\/product\/([^\s<>()/?#]+)/gi;

/** Handles the assistant referenced, in the order it mentioned them. */
function extractHandles(text) {
  const handles = [];
  for (const [, handle] of String(text).matchAll(PRODUCT_URL)) {
    let decoded = handle;
    try {
      decoded = decodeURIComponent(handle);
    } catch {
      // Malformed escape — the raw value is still worth trying.
    }
    if (decoded && !handles.includes(decoded)) handles.push(decoded);
  }
  return handles;
}

/**
 * Drops product URLs from the prose; the cards carry them instead.
 *
 * Removing a URL leaves the punctuation that introduced it and a hole where it
 * sat, so the leftovers are tidied too — an empty "( )", a dangling "here:",
 * and the run of blank lines that a stripped list of links turns into.
 */
const stripProductUrls = (text) =>
  String(text)
    .replace(PRODUCT_URL, "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\(\s*\)|\[\s*\]/g, "")
    // The assistant labels its links — "- URL: https://…", "Link: https://…" —
    // so removing the URL strands the label pointing at nothing. Only dropped
    // when the label is all that is left on the line; a sentence ending in the
    // word "link" keeps it.
    .replace(/^[ \t]*[-*•]?[ \t]*(?:url|link|product link|view)[ \t]*:?[ \t]*\n?/gim, "")
    .replace(/[ \t]*([:\-–—])[ \t]*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/**
 * A reply as the transcript should hold it: prose with the dead product URLs
 * taken out, and the handles those URLs named kept alongside.
 *
 * Every assistant message goes through here exactly once, whether it arrived
 * from a live reply or from stored history. That matters because the backend
 * stores what it wrote — product URLs and all — so restored history is raw text
 * in precisely the form a fresh reply arrives in. Handing it straight to the
 * renderer put the model's broken /product/{handle} links back on screen as
 * clickable text, which is the fault that product cards exist to solve.
 *
 * It also means history needs nothing new from the backend: the handles were
 * never lost, they were sitting in the stored prose waiting to be read out.
 */
function normalizeReply(raw) {
  return { text: stripProductUrls(raw), handles: extractHandles(raw) };
}

function RichText({ text }) {
  const parts = String(text).split(URL_SPLIT);
  return parts.map((part, i) =>
    IS_URL.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-current/40 underline-offset-2 hover:decoration-current break-all"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

const money = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : null;

/**
 * A product the assistant recommended, resolved from the catalogue.
 *
 * Price, title and image come from the catalogue rather than from the reply
 * text, so a card can never show a figure the model invented — and the link is
 * the canonical /{brand}/product/{handle} URL, not the /product/{handle} one
 * the assistant writes, which 404s.
 */
function ProductCard({ product, onAdd, adding, added }) {
  const price = money(product.price);
  const was = money(product.was);

  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-2.5 dark:border-zinc-700 dark:bg-zinc-800">
      <a href={product.url} className="shrink-0" aria-label={product.title}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image || "/images/placeholder.webp"}
          alt=""
          loading="lazy"
          className="h-16 w-16 rounded-lg bg-zinc-100 object-contain dark:bg-zinc-900"
        />
      </a>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        <a
          href={product.url}
          className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-900 hover:text-theme-600 dark:text-zinc-100 dark:hover:text-theme-500"
        >
          {product.title}
        </a>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-1.5">
            {price && (
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {price}
              </span>
            )}
            {was && (
              <span className="text-[11px] text-zinc-400 line-through dark:text-zinc-500">
                {was}
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={adding || added}
            className="shrink-0 rounded-lg bg-theme-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-theme-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {added ? "Added ✓" : adding ? "Adding…" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3c4.97 0 9 3.36 9 7.5s-4.03 7.5-9 7.5c-.99 0-1.94-.13-2.83-.38L4 20l1.06-3.18C3.78 15.55 3 13.62 3 11.5 3 6.86 7.03 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AiChatWidget() {
  // The same cart the rest of the storefront uses, so an item added here shows
  // up in the header count and survives to checkout like any other.
  const { addToCart } = useCart() || {};

  // Who the conversation belongs to. `loading` is the important one: auth
  // starts every page as logged-out and resolves a moment later, so acting
  // before it settles would read a signed-in visitor as a guest and hand them
  // the wrong thread.
  const { user, isLoggedIn, loading: authLoading, accessToken } = useAuth() || {};
  const identity = useMemo(() => {
    if (!isLoggedIn || !user) return null;
    // Never the email — see historyKey.
    const id = user.id ?? user.pk ?? user.username;
    return id == null ? null : String(id);
  }, [isLoggedIn, user]);

  // The token that identifies this visitor to the backend, so it can store the
  // conversation against them and hand it back later.
  //
  // Held on a ref rather than read as a dependency: auth rotates the access
  // token every ten minutes, and a rotation must not re-run the effect that
  // loads history — that would refetch the transcript, and overwrite whatever
  // has been said since, every ten minutes for as long as the tab is open.
  // Reading it at call time also means a request always carries the current
  // token rather than whichever one was current when a callback was built.
  const tokenRef = useRef(null);
  tokenRef.current = accessToken || null;

  // Rendered only after mount. The storefront is deliberately readable without
  // JavaScript (see docs/agentic-ai-readiness.md) and a chat button that cannot
  // work without it is noise in that HTML — for crawlers and for anyone with
  // scripting off.
  const [mounted, setMounted] = useState(false);
  // null until the region check answers. The trigger stays hidden meanwhile:
  // showing a button and taking it away a moment later is worse than showing it
  // a moment late.
  const [available, setAvailable] = useState(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  // Ids live on a ref, not a module-level counter. Fast Refresh reloads the
  // module while component state survives, which reset a module counter to 0
  // and handed a new message the same id as the greeting — products then
  // attached to the greeting and rendered above the question.
  const messageSeq = useRef(0);
  const nextMessageId = useCallback(() => `m${++messageSeq.current}`, []);

  const [messages, setMessages] = useState(() => [
    { id: "m0", role: "assistant", text: GREETING },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [listening, setListening] = useState(false);
  // Keyed by handle so two cards for different products don't share a spinner.
  const [addingHandle, setAddingHandle] = useState(null);
  const [addedHandles, setAddedHandles] = useState([]);
  /**
   * Every product the conversation has recommended, keyed by handle.
   *
   * A map rather than one array of "current" suggestions, because cards now
   * belong to the reply that recommended them and several replies are on screen
   * at once. Keying by handle also means a product mentioned twice is fetched
   * once, and a card is drawn the moment its handle resolves regardless of
   * which reply asked for it.
   */
  const [productsByHandle, setProductsByHandle] = useState({});
  const [speechSupported, setSpeechSupported] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const recognitionRef = useRef(null);
  const typingTimerRef = useRef(null);
  // Handles already sent to the catalogue. Keeps a restore from re-requesting
  // what is on screen, and keeps an unrecognised handle from being asked for
  // again every time the conversation is reopened.
  const requestedHandlesRef = useRef(new Set());
  // Bumped on every identity change, so a history response for the person who
  // just signed out cannot land in the session of the one who signed in.
  const historyTicketRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    setSpeechSupported(Boolean(getSpeechRecognition()));
  }, []);

  /**
   * Is the assistant offered where this visitor is?
   *
   * The answer can only come from the server — the layout that mounts this is
   * static across the whole storefront, so nothing in the page knows the
   * visitor's country. Cached for the session so this costs one small request
   * on the first page view and nothing on any navigation after it.
   *
   * Purely presentational. POST /api/chat applies the same rule itself, so this
   * failing open is safe: the worst case is a button that explains why it can't
   * help, which is what happens today anyway.
   */
  useEffect(() => {
    let cancelled = false;

    try {
      const cached = window.sessionStorage.getItem(AVAILABILITY_KEY);
      if (cached !== null) {
        setAvailable(cached === "1");
        return undefined;
      }
    } catch {
      // Private browsing, or storage is disabled. Just ask again.
    }

    fetch("/api/chat/availability")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (typeof data?.available !== "boolean") {
          setAvailable(true);
          return;
        }
        setAvailable(data.available);
        try {
          window.sessionStorage.setItem(AVAILABILITY_KEY, data.available ? "1" : "0");
        } catch {
          /* nothing to cache into — the request just repeats next page */
        }
      })
      .catch(() => {
        // Offline or blocked. Show the widget rather than silently removing it
        // over a transient network fault; the server still has the last word.
        if (!cancelled) setAvailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Clear any in-flight typing animation when the widget goes away.
  useEffect(() => () => clearInterval(typingTimerRef.current), []);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!addToCart || !product?.cartItem) {
        setError("Couldn't add that to the cart. Open the product page instead.");
        return;
      }
      setAddingHandle(product.handle);
      setError(null);
      try {
        const result = await addToCart({ ...product.cartItem, quantity: 1 });
        if (result?.status === "error") {
          setError("Couldn't add that to the cart. Please try again.");
          return;
        }
        setAddedHandles((prev) => [...prev, product.handle]);
      } catch {
        setError("Couldn't add that to the cart. Please try again.");
      } finally {
        setAddingHandle(null);
      }
    },
    [addToCart],
  );

  /**
   * Turns handles into real products, for any reply that mentioned them.
   *
   * Resolution is deliberately detached from which reply asked. Each handle is
   * looked up once and dropped into the map; the cards under a message are then
   * simply whichever of its own handles have arrived. That removes the race the
   * old single shelf had to guard against — a slow lookup landing after a newer
   * reply used to overwrite the wrong reply's products, and now it cannot,
   * because nothing is being overwritten.
   *
   * Cards are always resolved from the catalogue rather than stored with the
   * conversation, so a thread reopened next week shows today's prices and
   * stock, not what was true when the answer was given.
   */
  const resolveHandles = useCallback(async (handles) => {
    // Asked-for, not answered-for: a handle the catalogue does not recognise
    // must not be retried on every restore, and it is the unknown ones that
    // would otherwise be requested forever.
    const fresh = [...new Set((handles || []).filter(Boolean))].filter(
      (h) => !requestedHandlesRef.current.has(h),
    );
    if (!fresh.length) return;
    fresh.forEach((h) => requestedHandlesRef.current.add(h));

    // The endpoint caps a request at 8 handles, which a restored conversation
    // can easily exceed. Chunked here rather than raising the cap: the cap is
    // what bounds a crafted request, and it should not be widened to suit a
    // caller that can just as well ask twice.
    const batches = [];
    for (let i = 0; i < fresh.length; i += PRODUCT_BATCH_SIZE) {
      batches.push(fresh.slice(i, i + PRODUCT_BATCH_SIZE));
    }

    await Promise.all(
      batches.map(async (batch) => {
        try {
          const res = await fetch(
            `/api/chat/products?handles=${encodeURIComponent(batch.join(","))}`,
          );
          if (!res.ok) return;
          const { products } = await res.json();
          if (!products?.length) return;

          setProductsByHandle((prev) => {
            const next = { ...prev };
            products.forEach((p) => {
              next[p.handle] = p;
            });
            return next;
          });
        } catch {
          // Cards are an enhancement — the reply text still stands without them.
        }
      }),
    );
  }, []);

  /** Reveals a reply a character at a time. Skipped for reduced-motion users. */
  const typeOut = useCallback(
    (raw) => {
      clearInterval(typingTimerRef.current);

      // The prose keeps its sentences; the dead product URLs come out and are
      // replaced by cards. Same normalisation restored history goes through.
      const { text, handles } = normalizeReply(raw);

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      // Identify the message by id, not by position. Reading prev.length from
      // inside the updater looks like it yields the new index, but React runs
      // updaters during render rather than at call time — so the value escaped
      // as 0 and the cards were attached to messages[0], the greeting, which is
      // why they rendered above the question instead of under the reply.
      const id = nextMessageId();

      // `full` exists for persistence, not for rendering: the displayed `text`
      // is a growing slice during the animation, so the complete answer could
      // not be recovered from what is on screen when the conversation is
      // written to storage. `handles` is carried for the same reason — the
      // product URLs are gone from the prose by this point.
      const base = { id, role: "assistant", full: text, handles };

      setMessages((prev) => [
        ...prev,
        reduced ? { ...base, text } : { ...base, text: "", typing: true },
      ]);

      // Runs alongside the type-out rather than blocking it, so the text
      // appears immediately and its cards fill in underneath.
      resolveHandles(handles);

      if (reduced) return;

      let i = 0;
      typingTimerRef.current = setInterval(() => {
        // Reveal several characters per tick so long replies don't crawl.
        i = Math.min(text.length, i + 3);
        const slice = text.slice(0, i);
        const done = i >= text.length;

        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, text: slice, typing: !done } : m)),
        );

        if (done) clearInterval(typingTimerRef.current);
      }, TYPING_SPEED_MS);
    },
    [resolveHandles],
  );

  const send = useCallback(
    async (raw) => {
      const message = (raw ?? "").trim();
      if (!message || sending) return;

      setError(null);
      setInput("");
      // Nothing to clear: every reply keeps its own cards, so asking a new
      // question no longer has to take the previous answer's products away.
      setMessages((prev) => [...prev, { id: nextMessageId(), role: "user", text: message }]);
      setSending(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Signed in: the proxy turns this into X-User-Token so the backend
            // files the exchange against this account and it can be read back
            // from /api/chat/history later. A guest simply sends nothing.
            ...(tokenRef.current
              ? { Authorization: `Bearer ${tokenRef.current}` }
              : {}),
          },
          body: JSON.stringify(
            sessionId ? { message, session_id: sessionId } : { message },
          ),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data || typeof data.reply !== "string") {
          setError(
            data?.message ||
              "The assistant is unavailable right now. Please try again.",
          );
          return;
        }

        if (data.session_id) setSessionId(data.session_id);
        typeOut(data.reply);
      } catch {
        setError("Couldn't reach the assistant. Check your connection.");
      } finally {
        setSending(false);
      }
    },
    [sending, sessionId, typeOut],
  );

  // ── Conversation history ───────────────────────────────────────────────────
  //
  // Registered users are getting server-side history; that endpoint does not
  // exist yet. Guests never will have one, so their conversation is kept in
  // this browser for seven days, scoped to who they are — see chat-history.js.

  // Read inside the transition effect, which must not re-run whenever a message
  // is typed. Refs rather than dependencies, so the effect fires on identity
  // changes only.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  // How many messages the stored copy holds. Guards against re-writing an
  // unchanged conversation on every page view, which would keep pushing the
  // seven-day expiry out and make it "seven days since you last visited"
  // rather than "seven days since you last asked something".
  const savedCountRef = useRef(0);

  /** Back to an empty conversation, in memory. */
  const startFresh = useCallback(() => {
    clearInterval(typingTimerRef.current);
    messageSeq.current = 0;
    savedCountRef.current = 0;
    requestedHandlesRef.current = new Set();
    setMessages([{ id: "m0", role: "assistant", text: GREETING }]);
    setSessionId(null);
    setProductsByHandle({});
    setAddedHandles([]);
    setError(null);
  }, []);

  /** Puts a conversation on screen, wherever it was read from. */
  const apply = useCallback(
    ({ messages: restored, sessionId: restoredSession }) => {
      // Two sources arrive here in different states. The locally stored copy
      // has already been normalised — its text is stripped and its handles were
      // saved alongside. Server history has not: it is the reply exactly as the
      // assistant wrote it, product URLs still in the prose.
      //
      // Preferring stored handles and falling back to reading them out of the
      // text covers both without the caller having to say which it is. That
      // fallback is the whole reason restored history can show cards at all —
      // the handles were never lost, only left in the sentence.
      const normalized = restored.map((m) => {
        if (m.role !== "assistant") return m;
        const { text, handles } = normalizeReply(m.text);
        return { ...m, text, handles: m.handles?.length ? m.handles : handles };
      });

      // Continue the id sequence past everything restored. Starting from zero
      // again would hand a new reply the id of an old one, and its cards would
      // attach to the wrong message — the same failure that once put the cards
      // above the question.
      //
      // Server-side ids look like "h3q" and deliberately do not match: they
      // cannot collide with the "m<n>" sequence, so a restored server thread
      // leaves the counter where it is and new messages carry on from m1.
      messageSeq.current = normalized.reduce((max, m) => {
        const n = /^m(\d+)$/.exec(m.id ?? "")?.[1];
        return n ? Math.max(max, Number(n)) : max;
      }, 0);

      setMessages(normalized);
      setSessionId(restoredSession);
      savedCountRef.current = normalized.length;

      // Cards are rebuilt from handles rather than from stored products, so a
      // conversation reopened next week shows today's prices and stock instead
      // of what was true when the answer was given. Every reply's handles are
      // resolved, not just the last one's, because every reply keeps its own
      // cards now.
      setProductsByHandle({});
      requestedHandlesRef.current = new Set();
      resolveHandles(normalized.flatMap((m) => m.handles || []));
    },
    [resolveHandles],
  );

  /** Puts a stored conversation back on screen. Returns whether there was one. */
  const restore = useCallback(
    (who) => {
      const saved = loadHistory(who);
      if (!saved) return false;
      apply(saved);
      return true;
    },
    [apply],
  );

  /**
   * The signed-in visitor's conversation as the backend recorded it.
   *
   * This is what makes an account's history more than a browser's: it survives
   * a cleared cache and follows the person to another device, neither of which
   * localStorage can do. It runs after the local copy has already been put on
   * screen, so the conversation appears instantly and is replaced only if the
   * server actually has something — a slow or failed lookup leaves the local
   * copy exactly where it was, rather than blanking a working panel.
   *
   * `ticket` invalidates a response that arrives after the visitor has signed
   * out or switched account, so one person's transcript can never land in
   * another's session.
   */
  const restoreFromServer = useCallback(
    async (ticket) => {
      const token = tokenRef.current;
      if (!token) return false;

      // Anything typed while this was in flight makes the answer stale — the
      // same race the product shelf guards against, with a whole conversation
      // at stake instead of a card.
      const lengthAtStart = messagesRef.current.length;

      try {
        const res = await fetch(`/api/chat/history?limit=${HISTORY_LIMIT}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 401 here is ordinary rather than exceptional: the access token is
        // rotated every ten minutes and a tab left open overnight holds a stale
        // one. Nothing is shown for it — the local copy is already on screen.
        if (!res.ok) return false;

        const data = await res.json().catch(() => null);
        if (!data?.messages?.length) return false;

        if (historyTicketRef.current !== ticket) return false;
        if (messagesRef.current.length !== lengthAtStart) return false;

        // The greeting is this app's, not the backend's, so it is put back at
        // the head rather than expected to come down the wire.
        apply({
          messages: [{ id: "m0", role: "assistant", text: GREETING }, ...data.messages],
          sessionId: data.sessionId ?? null,
        });
        return true;
      } catch {
        // Offline, or the request was blocked. History is an enhancement; the
        // assistant works without it.
        return false;
      }
    },
    [apply],
  );

  // `undefined` until auth settles — distinct from `null`, which means guest.
  const identityRef = useRef(undefined);

  /**
   * Signing in and out moves the conversation between identities.
   *
   * Gated on authLoading because auth reports logged-out on every first render
   * and resolves a moment later. Acting on that would read a signed-in visitor
   * as a guest, and the fix below would then "sign them out" a tick later and
   * wipe the thread.
   */
  useEffect(() => {
    if (authLoading) return;

    const previous = identityRef.current;
    if (previous === identity) return;
    identityRef.current = identity;

    // Any history request still in flight belonged to the identity we are
    // leaving, and must not be allowed to land in this one.
    const ticket = ++historyTicketRef.current;

    // First settle on this page load: pick up whatever belongs to this visitor.
    if (previous === undefined) {
      pruneExpiredHistory();
      // Loaded signed-out, so no account's conversation belongs in this
      // browser. The logout path below clears it, but only when the widget was
      // mounted at the time — a full navigation to /logout, a closed tab, or a
      // logout in another tab all miss it. Signed out has to mean gone however
      // it happened.
      if (!identity) clearAccountHistories();
      restore(identity);
      // The local copy is on screen already; the account's own record replaces
      // it if the backend has one. This is the path that matters on a new
      // device or after a cleared browser, where there is no local copy at all.
      if (identity) restoreFromServer(ticket);
      return;
    }

    // Guest → signed in. They were mid-conversation, so it comes with them
    // rather than disappearing at the moment they log in. It moves under their
    // identity and the guest copy is deleted, so the next guest on this browser
    // cannot pick up where a signed-in person left off.
    if (previous === null && identity) {
      const carried = messagesRef.current;
      clearHistory(null);
      if (carried.length > 1) {
        // Deliberately NOT replaced by the server copy. What is on screen was
        // asked seconds ago; the stored thread may be a week old, and dropping
        // a live conversation to show an old one at the moment someone signs in
        // is the more surprising of the two. Those messages were sent before
        // there was a token, so the backend holds them against the session
        // rather than the account — everything from here on is filed correctly,
        // and the "New conversation" button reaches the stored thread.
        saveHistory(identity, { messages: carried, sessionId: sessionIdRef.current });
        savedCountRef.current = carried.length;
      } else {
        // Nothing worth carrying, so this is just "sign in and pick up where
        // you left off" — local first, then the account's own record.
        restore(identity);
        restoreFromServer(ticket);
      }
      return;
    }

    // Signed out, or switched account. The previous person's conversation is
    // removed from this browser and the panel starts over. A logged-in thread
    // that survived a logout would be readable by whoever uses the computer
    // next, and "continue where you left off" is not worth that.
    clearHistory(previous);
    startFresh();
    restore(identity);
    if (identity) restoreFromServer(ticket);
  }, [authLoading, identity, restore, restoreFromServer, startFresh]);

  /**
   * Persists on each new message.
   *
   * Keyed on the message count, not the messages themselves: the stored text
   * comes from `full`, which is set once when a reply is created, so the
   * content being saved does not change as that reply types itself out —
   * watching the array would mean a write every few milliseconds for nothing.
   */
  useEffect(() => {
    if (authLoading || identityRef.current === undefined) return;
    if (messages.length <= 1 || messages.length <= savedCountRef.current) return;
    if (saveHistory(identity, { messages, sessionId })) {
      savedCountRef.current = messages.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, sessionId, identity, authLoading]);

  /** Discards the conversation here and in storage. */
  const handleNewChat = useCallback(() => {
    clearHistory(identityRef.current === undefined ? identity : identityRef.current);
    startFresh();
  }, [identity, startFresh]);

  // Keep the newest message in view as it types.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
    // `productsByHandle` is in here too: cards land after their reply has
    // rendered, and without it the panel would stay put and leave them below
    // the fold.
    //
    // Note this only scrolls when a card resolves, which for a restored
    // conversation means landing at the bottom — the newest exchange, which is
    // where someone reopening a thread expects to be.
  }, [messages, sending, error, productsByHandle]);

  // Escape closes; focus moves into the input on open and back to the button on
  // close, so the modal is usable from the keyboard alone.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) buttonRef.current?.focus?.();
  }, [open]);

  // Lock background scroll while the modal is up.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const toggleListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = document.documentElement.lang || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    // Interim results replace the dictated text rather than appending, so the
    // box shows one evolving sentence instead of the same words repeatedly.
    let final = "";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += chunk;
        else interim += chunk;
      }
      setInput((final + interim).trimStart());
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed") {
        setError("Microphone access was blocked. Allow it to use voice input.");
      }
    };
    recognition.onend = () => {
      setListening(false);
      inputRef.current?.focus();
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [listening]);

  // Stop the microphone if the modal closes mid-dictation.
  useEffect(() => {
    if (!open && listening) recognitionRef.current?.stop();
  }, [open, listening]);

  // Adding to the cart as a guest makes the cart ask for an email, and that
  // dialog sits at z-100 while this panel is at z-999999 — so it would open
  // *behind* the chat, greyed out and unreachable. Step aside when it fires.
  // The conversation is component state, not modal state, so reopening the
  // widget brings the whole thread back.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const stepAside = () => setOpen(false);
    window.addEventListener("guestEmailRequired", stepAside);
    return () => window.removeEventListener("guestEmailRequired", stepAside);
  }, []);

  // `available` is null until the region check answers, so this also covers the
  // brief window before it lands.
  if (!mounted || !available) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ask the AI assistant"
        className="fixed bottom-5 left-5 z-[999998] flex h-14 w-14 items-center justify-center rounded-full bg-theme-600 text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-theme-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-400 focus-visible:ring-offset-2 dark:shadow-black/50 dark:focus-visible:ring-offset-zinc-900"
      >
        <ChatIcon className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[999999] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="AI shopping assistant"
            className="flex h-[85svh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[min(36rem,85svh)] sm:max-w-lg sm:rounded-2xl dark:bg-zinc-900"
          >
            <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-600 text-white">
                <ChatIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Shopping assistant
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  Answers about products and availability
                </p>
              </div>
              {/* A conversation that persists for a week needs a way to be
                  forgotten — on a shared computer, that is the only control the
                  person actually has. */}
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNewChat}
                  aria-label="Start a new conversation"
                  title="New conversation"
                  className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              aria-live="polite"
            >
              {messages.map((m, i) => {
                // Only the handles that have actually resolved. An unknown one
                // draws nothing rather than a placeholder, which is what keeps
                // a card from ever pointing at a page that is not there.
                const cards = (m.handles || [])
                  .map((h) => productsByHandle[h])
                  .filter(Boolean);

                return (
                  <div key={m.id ?? i}>
                    <div
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "rounded-br-sm bg-theme-600 text-white"
                            : "rounded-bl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                        }`}
                      >
                        <RichText text={m.text} />
                        {m.typing && (
                          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-current align-middle" />
                        )}
                      </div>
                    </div>

                    {/* The products this particular reply recommended, under
                        the reply itself. Every answer keeps its own, so
                        scrolling back through a restored conversation shows
                        what was suggested at each point rather than only what
                        the most recent question turned up. */}
                    {cards.length > 0 && (
                      <section
                        aria-label="Suggested products"
                        className="mt-2 max-w-[85%] space-y-2"
                      >
                        {cards.map((p) => (
                          <ProductCard
                            key={p.handle}
                            product={p}
                            onAdd={handleAddToCart}
                            adding={addingHandle === p.handle}
                            added={addedHandles.includes(p.handle)}
                          />
                        ))}
                      </section>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-zinc-100 px-3.5 py-3 dark:bg-zinc-800">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </p>
              )}

            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-zinc-200 px-3 py-3 dark:border-zinc-800"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter sends, Shift+Enter makes a new line — the
                    // convention every chat interface uses.
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={listening ? "Listening…" : "Ask about a product…"}
                  maxLength={2000}
                  className="max-h-32 flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-theme-500 focus:outline-none focus:ring-1 focus:ring-theme-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />

                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    aria-label={listening ? "Stop dictation" : "Dictate a message"}
                    aria-pressed={listening}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-400 ${
                      listening
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M12 4a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-5 0v-5A2.5 2.5 0 0 1 12 4Z" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-600 text-white transition hover:bg-theme-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 px-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                AI can make mistakes — check important details before ordering.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
