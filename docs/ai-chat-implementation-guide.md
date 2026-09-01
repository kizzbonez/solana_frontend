# AI Chat Assistant — Implementation Guide (port to a sibling storefront)

**Source of truth:** this repo (Solana / BBQ / OKO Next.js storefront).
**Audience:** an engineer or agent implementing the identical feature in another
Next.js app that talks to *its own* deployment of the same Django backend, with
*its own* credentials.

Nothing here is brand-specific except the values of environment variables. The
backend contract, the route shapes, the region rule and the client behaviour are
all identical. Copy the design; swap the credentials.

---

## 1. What the feature is

A floating button on every storefront page opens a modal chat panel. The visitor
asks product questions in natural language; a Django-hosted assistant answers.
Replies that mention products are turned into real product cards with an
**Add to cart** button. The assistant is offered **only in the US and Canada on
production**, and to everybody in local development and on preview deployments.

Conversations are kept, by two different mechanisms for two different kinds of
visitor:

- **Signed in** — the backend stores the exchange against the account as it
  happens, and it is read back from `/api/chat/history`. Survives a cleared
  browser and follows the person to another device.
- **Guest** — there is no account to store anything against, so their
  conversation lives in their own browser for seven days.

The browser **never** talks to the backend directly. Every call goes through a
Next.js route handler so the backend URL and API key stay server-side.

```
Browser (AiChatWidget)
  ├── GET  /api/chat/availability     → may I show the button?
  ├── POST /api/chat                  → proxy → POST {BACKEND}/api/chat/
  ├── GET  /api/chat/history?limit=10 → proxy → the account's stored conversation
  └── GET  /api/chat/products?handles → resolve recommended products locally
```

---

## 2. Files to create

| File | Role |
|---|---|
| `src/app/lib/chat-region.js` | Geo rule: who may use the assistant |
| `src/app/lib/chat-history.js` | Browser-side conversation persistence (guests, 7 days) |
| `src/app/lib/chat-user.js` | Reads the signed-in visitor's token off the request |
| `src/app/api/chat/route.js` | POST proxy to the backend assistant |
| `src/app/api/chat/availability/route.js` | GET — is the assistant offered here? |
| `src/app/api/chat/history/route.js` | GET — the account's stored conversation |
| `src/app/api/chat/products/route.js` | GET — resolve product handles into cards |
| `src/app/components/widget/AiChatWidget.jsx` | The whole client UI |

Plus one line in the storefront layout to mount `<AiChatWidget />`.

Existing infrastructure this reuses (present in an app of this shape — implement
equivalents if the target app lacks them):

- `@/app/lib/rate-limit` → `withRouteRateLimit(handler, group)` and `clientKey(request)`
- `@/app/lib/store` → `STORE_ID`
- `@/app/context/cart` → `useCart()` giving `addToCart(item)`
- `@/app/context/auth` → `useAuth()` giving `{ user, isLoggedIn, loading }`
- `@/app/lib/fn_server` → `fetchProduct(handle)` (cached catalogue read)
- `@/app/lib/helpers` → `formatProduct(product, "cart_item")`

---

## 3. Environment variables

The other app has its **own** backend deployment and its **own** keys. Set these
in its environment; do not copy values across.

```dotenv
# Backend base URL — no trailing slash. e.g. https://api.example.com
NEXT_SOLANA_BACKEND_URL=

# The assistant authenticates with the COLLECTIONS key, not the general backend
# key. The general key returns 401 on /api/chat/ — verified against the live
# endpoint. These are not interchangeable. The same key is required on
# /api/chat/history, alongside the per-user X-User-Token.
NEXT_SOLANA_COLLECTIONS_KEY=

# Identifies the brand to the backend, sent as X-Store-Domain. Must be set — an
# empty value does not fail, it lets the backend pick a store on its own.
NEXT_PUBLIC_STORE_DOMAIN=

# Region control. Comma-separated ISO 3166-1 alpha-2. Unset means US,CA.
CHAT_ALLOWED_COUNTRIES=US,CA

# Whether that restriction is enforced. Unset (the normal state) enforces on
# production deployments only.
#   on   force the restriction — reproduce a production refusal locally
#   off  lift it in production without shipping code
# CHAT_REGION_LOCK=

# Local UI work with no backend. Refuses to run when NODE_ENV=production.
# CHAT_MOCK=1
```

If the target app uses different names for the backend URL/key, rename
consistently across all three routes — but keep the *collections key* distinction.

---

## 4. Backend contract

### `POST {BACKEND}/api/chat/`

The **trailing slash is required**. Django routes this as `api/chat/`; a POST to
the slashless form is a plain 404 (a GET gets a redirect, a POST does not).

Request headers:

| Header | Value | Notes |
|---|---|---|
| `Content-Type` | `application/json` | |
| `Accept` | `application/json` | |
| `Authorization` | `Api-Key {NEXT_SOLANA_COLLECTIONS_KEY}` | The `Api-Key` scheme, not `Bearer` |
| `X-Store-Domain` | `{NEXT_PUBLIC_STORE_DOMAIN}` | How the backend picks the brand/catalogue |
| `X-Client-IP` | the real visitor's address | Omit entirely if unknown — never send empty |
| `X-User-Token` | the signed-in visitor's token | **Sent only when signed in.** This is what makes the exchange recoverable later — the backend files it against the account. Omitted for a guest. |

Request body:

```json
{
  "message": "string, required, trimmed, 2000 chars max",
  "session_id": "string, optional — only from the 2nd message onward"
}
```

Response body (passed through to the browser **unchanged**):

```json
{ "reply": "string", "session_id": "string", "took_ms": 123 }
```

The backend owns the conversation. It issues `session_id` with the first reply;
the client stores it and echoes it on every following message. **Never invent a
session id** client- or proxy-side — a made-up id either collides or starts a
phantom conversation. No transcript is reassembled and re-sent.

Do not reshape the response in the proxy. Renaming fields creates a second
contract to keep in step with the backend's.

### `GET {BACKEND}/api/chat/history?limit=10`

The signed-in visitor's stored conversation.

| Header | Value |
|---|---|
| `Accept` | `application/json` |
| `Authorization` | `Api-Key {NEXT_SOLANA_COLLECTIONS_KEY}` |
| `X-Store-Domain` | `{NEXT_PUBLIC_STORE_DOMAIN}` |
| `X-User-Token` | the signed-in visitor's token, **bare** — no `Bearer` prefix |

> **Both credentials are required, and neither is optional.** Probed against the
> live endpoint:
>
> | Sent | Result |
> |---|---|
> | Nothing | `401 {"detail":"Authentication credentials were not provided."}` |
> | `X-User-Token` alone | `401 {"detail":"Authentication credentials were not provided."}` — DRF does not authenticate on this header |
> | `Api-Key` alone | `401 {"error":"login required"}` — past authentication, but no user |
> | `Api-Key` + `X-User-Token` | the conversation |
>
> The two error bodies are worth knowing apart: DRF's `detail` shape means the
> API key is missing or wrong, the custom `error: "login required"` means the key
> was fine and the *user* token was not. A single "401" tells you nothing; these
> tell you which header to go and look at.

Unlike `POST /api/chat/`, the trailing slash is **not** required here — this is a
GET, so Django's `APPEND_SLASH` redirect is followed transparently by `fetch`.
The slashless form in the spec works as given.

`limit` is "the most recent N". Response envelope: tolerate a DRF `results`
wrapper, a bare array, or a `messages` / `history` key — see section 8 for the
normalizer and why it is written defensively.

### Which token is `X-User-Token`?

**The JWT access token.** There is no separate `user_token` to look for — it is
the same value every other user-scoped route in this app forwards as
`Authorization: Bearer`, obtained from `/api/auth/login` and rotated every ten
minutes via `/api/auth/token/refresh`.

In practice that means:

```
auth context   accessToken
     ↓          browser sends  Authorization: Bearer <access token>
Next.js route  userTokenOf(request)  — strips the "Bearer " prefix
     ↓          proxy sends    X-User-Token: <access token>
backend
```

Two consequences worth holding on to:

- **The `Bearer` prefix must be stripped.** `X-User-Token` is not an
  Authorization header and carries no scheme; sending `Bearer eyJ…` there would
  be read as the token itself and match nobody.
- **The token expires, and that is routine.** It is rotated every ten minutes, so
  a stale one is the normal reason `/api/chat/history` answers 401 — which is
  precisely why that case falls back to the local copy silently instead of
  showing an error.

### Product URLs in replies

The assistant writes product links as `/product/{handle}`. This storefront serves
`/{brand}/product/{handle}`, so **every link the model emits 404s**. Do not try to
repair the URL. Extract the handle, strip the URL out of the prose, and resolve
the real product from the local catalogue (section 7).

---

## 5. `POST /api/chat` — the proxy

`src/app/api/chat/route.js`, with `export const dynamic = "force-dynamic"` and
`export const maxDuration = 60`.

Order of operations matters — each step is cheaper than the one after it:

1. **Region check first, before reading the body.** Each message costs the
   backend a model call, so a request we are going to refuse should cost as close
   to nothing as possible. Refused → `403` with the region message.
2. Parse JSON → `400 "Body must be JSON."` on failure.
3. `message` required, trimmed → `400`. Longer than **2000** chars → `400`.
4. `CHAT_MOCK=1` **and** `NODE_ENV !== "production"` → return a canned reply. A
   mocked assistant that reaches real shoppers is worse than a disabled one.
5. Missing `NEXT_SOLANA_BACKEND_URL` → `503`.
6. Missing `NEXT_PUBLIC_STORE_DOMAIN` → `503` + `console.error`. Refuse rather
   than send it blank: answering BBQ shoppers from Solana's catalogue is worse
   than answering nobody.
7. Missing `NEXT_SOLANA_COLLECTIONS_KEY` → `503`.
8. Build the payload; include `session_id` only when the client sent a non-empty
   string.
9. Resolve the client IP (section 6) and forward it as `X-Client-IP`. Read the
   visitor's token from the incoming `Authorization` header and forward it as
   `X-User-Token` — **omitted, never blank, for a guest**. This is the writing
   half of history: without it the backend has nothing to file the exchange
   against, and `/api/chat/history` would authenticate perfectly well and always
   come back empty.
10. `fetch` with an `AbortController` at **45 s** (`BACKEND_TIMEOUT_MS`) — cut it
    off before the platform does, so a hung backend surfaces as a typed error
    instead of an opaque timeout.
11. Read the response as **text**, then try `JSON.parse`. The backend renders an
    HTML error page when a route is missing or blows up, so never assume JSON.
12. `!res.ok` → `502`, message `"The assistant is not available yet."` for a 404,
    otherwise `"The assistant is temporarily unavailable."`
13. Body missing a string `reply` → `502`.
14. Otherwise return the backend object as-is.
15. `catch`: `AbortError` → `"The assistant took too long to respond. Try again."`;
    anything else → `"The assistant is temporarily unavailable."` Both `502`.
16. `finally`: `clearTimeout`.

Error envelope, uniformly: `{ error: true, message }` with the status.

Wrap: `export const POST = withRouteRateLimit(handler, "chat")`.

Also export a `GET` that describes the endpoint instead of 405-ing — a discovery
aid returning `{ endpoint, method, store, request, response, availability, regions }`.

### Rate limiting

Add a `chat` bucket to the limiter, tighter than everything else, because this is
the one bucket that bounds **spend** rather than load:

```js
chat:  { limit: 20,  windowSeconds: 60 },  // a real conversation is a handful/min; past 20 is a script
light: { limit: 300, windowSeconds: 60 },  // availability + products
```

Responses carry `RateLimit-Limit` / `-Remaining` / `-Reset`, and a `429` carries
`Retry-After`. No CAPTCHA — a well-behaved agent reads `Retry-After` and backs
off, where a CAPTCHA just makes it give up.

---

## 6. Client IP forwarding

The backend logs and reasons about the **visitor's** address. Without
`X-Client-IP`, every conversation appears to originate from one deployment IP.

- Reuse the rate limiter's `clientKey(request)` so the address the backend is told
  about is the same one you throttle on. Two definitions of "who is asking" would
  eventually disagree.
- `clientKey` reads the **left-most** `x-forwarded-for` entry (the client;
  everything after is proxy chain), falls back to `x-real-ip`, and normalises
  bracketed IPv6 (`[::1]`), IPv4-mapped IPv6 (`::ffff:203.0.113.42`) and
  `ip:port` forms — otherwise one visitor appears under two or three strings,
  which splits their rate-limit bucket and muddies the backend's log.
- **Development only:** a loopback address (`::1`, `127.*`) is swapped for the
  machine's real public IP via `https://api.ipify.org?format=json` (3 s abort,
  memoised once per process). Guarded on `NODE_ENV === "production"` so it can
  never run on a deployed build — there it would log every visitor under the
  server's own address.
- If no IP can be determined, **omit the header**. A blank value is not a
  fallback, it is a wrong answer that looks like one.

---

## 7. `GET /api/chat/products?handles=a,b,c`

Turns the handles pulled out of a reply into real cards.

- Split on `,`, trim, drop empties and anything over 200 chars, de-duplicate, cap
  at **8** handles (a reply recommends a handful; this bounds a crafted request).
- No handles → `{ products: [] }`.
- Per handle: `fetchProduct(handle)` → `formatProduct(product, "cart_item")`.
  Reuse those rather than querying Elasticsearch again, so a chat card, a listing
  tile and a product page cannot disagree about what something costs.
- Skip anything without `url` and `title`; a per-handle `try/catch` logs and
  returns `null`, so one bad handle cannot fail the batch.
- Return `{ products: [{ handle, title, brand, price, was, image, url, cartItem }] }`,
  where `cartItem` is the full `cart_item` object the cart already consumes — the
  card's button hands the cart exactly what a product page would.

The reason this endpoint exists: a card can never point at a page that does not
exist, and can never show a price the model invented. An unknown handle simply
does not come back, and no card is drawn for it.

Wrap with `withRouteRateLimit(handler, "light")`.

---

## 7b. `GET /api/chat/history?limit=10` — server-side history

`src/app/api/chat/history/route.js`. The read half of storing user–AI queries.

**Out:** `{ messages: [{ id, role, text }], sessionId, count }`.

Order of operations:

1. **Region check**, same as everywhere else. A visitor who cannot use the
   assistant has no conversation to read, and one gate is easier to reason about
   than two.
2. Read the token from `Authorization: Bearer …` via `chat-user.js`. Absent →
   `401 "Sign in to load your conversation history."` Guests are not an error
   case here; they simply have no server history, by design.
3. Missing backend URL / store domain / collections key → `503`.
4. Clamp `limit` — default **10**, max **50**.
5. `fetch` with a **15 s** abort (a log read, not a model call — it does not need
   the assistant's 45 s).
6. Read as text, then `JSON.parse` defensively, exactly as `/api/chat` does.
7. Map the failures deliberately:
   - `401` / `403` → pass through as `401`. **This is the ordinary case, not an
     outage**: the access token rotates every ten minutes and a tab left open
     overnight holds a stale one. The widget falls back to the local copy
     silently.
   - `404` → return an **empty history**, not an error. Nothing stored yet is a
     normal state, and a red banner in front of someone whose only mistake was
     not having chatted before is a bug.
   - anything else → `502`.
8. `Cache-Control: private, no-store`. One person's conversation — the same
   reasoning as `/api/chat/availability`, with considerably more at stake.
9. Rate-limit group `light` — a cheap read with no model call behind it.

### This route reshapes; `/api/chat` does not

A deliberate exception, not an inconsistency. `/api/chat` passes a reply straight
through because the backend owns that contract end to end. Here the target shape
is the **widget's own message array** — an app concern the backend knows nothing
about. The adapting has to happen somewhere, and one place on the server beats
every caller doing it.

### The normalizer

Written to be tolerant, because guessing the envelope wrong shows a signed-in
visitor an empty history rather than an error anyone would notice:

- **Envelope** — a bare array, or `results` (DRF), `messages`, `history`,
  `conversations`, `items`.
- **Records** — a chat log can be kept either way round, and both are handled:
  one row per message (`role` + `text`/`content`/`message`), or one row per
  exchange (`message`/`question`/`prompt` plus `reply`/`answer`/`response`),
  which expands into the question and then the answer.
- **Ordering** — `?limit=10` naturally means "the most recent ten", and a log
  read newest-first would render the conversation backwards. Where every record
  carries a timestamp, sort ascending and the question does not arise. Where none
  does, keep the given order — inventing a reversal on a guess is the same bug in
  the other direction.
- **`sessionId`** — taken from the newest record that names one, falling back to
  the envelope, so a restored conversation is *continued* rather than started
  again alongside itself.
- **Ids** are `h0q`, `h0a`, `h1q`… They deliberately do not match the widget's
  `m<n>` pattern, so a restored server thread cannot collide with locally
  generated ids.

### How the widget uses it

- `useAuth()` also yields `accessToken`. Hold it on a **ref**, not as an effect
  dependency: auth rotates it every ten minutes, and a rotation must not re-run
  the history effect — that would refetch the transcript, and overwrite anything
  said since, every ten minutes for as long as the tab is open. Reading it at
  call time also guarantees a request carries the *current* token rather than
  whichever was current when the callback was built.
- `POST /api/chat` sends `Authorization: Bearer {accessToken}` when signed in.
- `restoreFromServer(ticket)` runs **after** the local copy is already on screen,
  so the conversation appears instantly and is replaced only if the server
  actually has something. A slow or failed lookup leaves the panel exactly as it
  was rather than blanking it.
- Two guards before applying, both the same class of race the product shelf
  already handles:
  - `historyTicketRef` — bumped on every identity change, so a response for the
    person who just signed out can never land in the session of the one who
    signed in.
  - the transcript length is unchanged since the request started, so anything
    typed while it was in flight is not silently wiped.
- The **greeting is prepended locally**. It is this app's, not the backend's.

### Where server history wins, and where it does not

| Situation | What happens |
|---|---|
| Page loads signed in | Local copy first, then the server copy replaces it. This is the path that matters on a new device or after a cleared browser, where there is no local copy at all. |
| Guest signs in **mid-conversation** | The carried thread stays on screen; the server copy does **not** replace it. What is on screen was asked seconds ago and the stored thread may be a week old — dropping a live conversation to show an old one at the moment someone signs in is the more surprising of the two. Those messages were sent before there was a token, so the backend holds them against the session rather than the account; everything from there on is filed correctly, and "New conversation" reaches the stored thread. |
| Guest signs in with **nothing** to carry | Local restore, then the server copy replaces it. |
| Signs out, or switches account | Previous identity's local copy cleared, panel reset, then the new identity's local and server copies loaded. |

### Verified against the running app

```
GET /api/chat/history            → 401 {"error":true,"message":"Sign in to load your conversation history."}
GET /api/chat/history + bad token→ 401 {"error":true,"message":"Your session has expired. Sign in again to load history."}
POST /api/chat as a guest        → still answers normally (no regression from the token change)
```

The second confirms the full round trip: the request reached the backend, was
refused, and was mapped to the fallback-friendly 401 rather than a 502.

---

## 8. Region restriction — US + CA on production only

`src/app/lib/chat-region.js`. This is the specification the other app must match
exactly.

**Why:** the assistant costs money per message and only helps people who can
actually buy — the catalogue ships to the US and Canada.

**What it is not:** this is IP geolocation. A VPN defeats it in both directions —
someone in the US on a UK exit node is refused, someone in the UK on a US exit
node is served. That is fine for what this is: a usage control, keeping spend
pointed at the markets we sell to. It is **not** a security boundary and nothing
downstream may treat it as one.

```js
const DEFAULT_ALLOWED = ["US", "CA"];
const GEO_HEADER   = "x-vercel-ip-country";  // present on every on-platform request; absent locally
const DEBUG_HEADER = "x-debug-country";      // ignored in production
```

**`allowedCountries()`** — parse `CHAT_ALLOWED_COUNTRIES`, uppercase, keep only
`/^[A-Z]{2}$/`, and reject `XX` (what Vercel sends when it cannot place an
address — a non-answer, not a country). An empty or malformed value means *not
configured*, so fall back to `["US","CA"]`. Locking every visitor out is not a
sane reading of a typo.

**`isRegionLocked()`** — `CHAT_REGION_LOCK` overrides both ways (`on|true|1`,
`off|false|0`); otherwise the lock is on when **`VERCEL_ENV === "production"`**.

> Keyed on `VERCEL_ENV`, **not `NODE_ENV`** — and that difference is the whole
> point. Vercel builds preview deployments with `NODE_ENV=production`, so a
> `NODE_ENV` check would enforce on preview URLs too and lock you out of the
> environment you test in. `VERCEL_ENV` distinguishes production / preview /
> development, so only the real thing is gated. If the target app is **not** on
> Vercel, substitute that platform's equivalent variable — do not substitute
> `NODE_ENV`.

**`countryOf(request)`** — outside production, an `X-Debug-Country: GB` header
stands in, because there is no real geolocation locally and the refusal path has
to be testable. Production reads the platform header and nothing else; a
client-supplied country would make the restriction a suggestion.

**`chatRegion(request)`** → `{ allowed, country, locked }`. The country comes back
so callers can log or report *why* something was refused, rather than leaving a
support question that can only be answered by guessing.

**An unknown country is refused when the lock is on.** "US and Canada only" means
denying what cannot be placed; admitting unknowns would make the restriction
trivially avoidable by anything that strips the header. The cost of being wrong
is bounded and visible: if the platform ever stopped sending the header, the
assistant would be off for everyone rather than quietly open to everyone — the
failure you find out about immediately.

**One message everywhere:**
`"The AI assistant is only available in the US and Canada."`

### `GET /api/chat/availability`

Returns `{ available: boolean, country: string | null }` with
`Cache-Control: private, no-store`. That header is not optional: one cached
`available: false` served to a US shopper turns a regional restriction into an
outage.

Why it is a separate endpoint rather than a value baked into the page: the
storefront layout that mounts the widget is statically rendered across ~340
pages. Reading the geolocation header during render would opt every one of them
into dynamic rendering — trading the whole site's static generation for one
button. A tiny per-session request is much the cheaper answer.

The answer is **advisory**. `POST /api/chat` enforces the same rule
independently, so a client that skips this call, caches it forever, or lies about
the result gains nothing.

Wrap with `withRouteRateLimit(handler, "light")`.

### Testing the restriction

| Goal | How |
|---|---|
| Refusal path locally | `curl -H "X-Debug-Country: GB" localhost:3000/api/chat/availability` |
| Full production behaviour locally | `CHAT_REGION_LOCK=on` plus `X-Debug-Country` |
| Disable in production without a deploy | set `CHAT_REGION_LOCK=off` in the dashboard |
| Add a market | `CHAT_ALLOWED_COUNTRIES=US,CA,GB` |

---

## 9. The widget

`src/app/components/widget/AiChatWidget.jsx`, `"use client"`. Mounted once in the
storefront layout, inside the cart and auth providers.

### Placement

Fixed **bottom-left**, `z-[999998]`; the modal is `z-[999999]`. Deliberate: the
live-chat vendor button (Zoho here) is fixed at bottom-right with
`z-index: 999999`. Two floating buttons in the same corner is the kind of
collision nobody notices until it ships. Check where the target app's existing
floating widgets sit before choosing a corner.

### Render gating

```js
if (!mounted || !available) return null;
```

- `mounted` — rendered only after mount. The storefront is deliberately readable
  without JavaScript, and a chat button that cannot work without it is noise in
  that HTML, both for crawlers and for anyone with scripting off.
- `available` — `null` until the region check answers, so the trigger stays hidden
  meanwhile. Showing a button and taking it away a moment later is worse than
  showing it a moment late.

### Availability check

On mount, read `sessionStorage["sf:chat-available"]`; if absent, call
`GET /api/chat/availability` and cache the result for the session. **Session**
storage, not local: a visitor who travels, or drops a VPN, gets a fresh answer on
their next visit instead of being stuck with a stale one indefinitely. Every
storage access is wrapped in `try/catch` (private mode, sandboxed iframes). A
network failure or a non-boolean body → **fail open** (`setAvailable(true)`); the
server still has the last word, and the worst case is a button that explains why
it cannot help.

### Sending

```js
POST /api/chat  { message }                // first message
POST /api/chat  { message, session_id }    // every one after
```

On a successful reply: store `session_id`, then type the reply out. On failure,
show `data.message` if present, else a generic line. A network throw →
`"Couldn't reach the assistant. Check your connection."`

### Message ids

Ids come from a **ref-backed counter** (`messageSeq`), not a module-level one.
Fast Refresh reloads the module while component state survives, which reset a
module counter to 0 and handed a new message the same id as the greeting —
products then attached to the greeting and rendered above the question.

Identify messages **by id, never by position**. Reading `prev.length` inside a
state updater looks like it yields the new index, but React runs updaters during
render rather than at call time, so the value escaped as `0` and cards attached
to `messages[0]`, the greeting.

### Type-out animation

12 ms per tick, 3 characters per tick so long replies do not crawl. Skipped
entirely under `prefers-reduced-motion: reduce`. Clear the interval on unmount
and before starting a new one.

Each assistant message carries three fields:

- `text` — what is on screen (a growing slice during the animation)
- `full` — the complete, URL-stripped reply, for persistence
- `handles` — the product handles extracted from the raw reply

`full` and `handles` exist because neither the complete answer nor the products it
recommended could be recovered from what is on screen mid-animation.

### Reply rendering

- `RichText` splits on a URL regex and builds **React elements** — never
  `dangerouslySetInnerHTML`. The reply is model output; handing that to innerHTML
  would make any future prompt injection a scripting hole. Links get
  `target="_blank" rel="noopener noreferrer"` so the conversation survives a click.
- The split regex is `/g` and must keep its capture group so each URL arrives as
  its own part; the *test* regex is a **separate, non-global** pattern — calling
  `.test()` on a `/g` regex advances `lastIndex` between calls and would match
  every other link.
- `PRODUCT_URL = /https?:\/\/[^\s<>()]*\/product\/([^\s<>()/?#]+)/gi` extracts the
  handles (`decodeURIComponent` in a `try`, falling back to the raw value).
- `stripProductUrls` removes those URLs from the prose **and tidies the wreckage**:
  collapsed spaces, empty `( )` / `[ ]`, dangling trailing `:` `-` `–` `—`, and the
  run of blank lines a stripped list of links turns into. Removing a URL otherwise
  leaves the punctuation that introduced it and a hole where it sat.

### Product shelf

The cards are deliberately **not part of the transcript**. They are a single shelf
at the foot of the panel showing what the assistant is *currently* recommending,
so the conversation above stays a plain back-and-forth and the products are always
in the same place rather than buried at whatever scroll position their reply
happens to sit at.

- `attachProducts(requestId, handles)` runs *alongside* the type-out rather than
  blocking it — the text appears immediately and the shelf fills in beneath.
- `latestReplyRef` guards against a slow lookup for an older answer landing after
  a newer one.
- The shelf clears the moment a new question is asked.
- **Add to cart** calls the app's own `addToCart({ ...cartItem, quantity: 1 })`, so
  an item added here shows up in the header count and survives to checkout like
  any other. Spinner state is keyed by handle so two cards do not share it.

### Guest email dialog collision

Adding to the cart as a guest makes the cart raise a `guestEmailRequired` window
event and open a dialog at `z-100` — which would sit *behind* the chat panel at
`z-999999`, greyed out and unreachable. Listen for the event and close the panel.
The conversation is component state, not modal state, so reopening the widget
brings the whole thread back. Check the target app for the equivalent event.

### Speech to text

The browser's own `SpeechRecognition` / `webkitSpeechRecognition` — no dependency,
no service, no cost. Feature-detected; the button simply does not render where the
API is missing (Firefox, and any non-HTTPS origin). Interim results **replace** the
dictated text rather than appending, so the box shows one evolving sentence
instead of the same words repeatedly. `not-allowed` → an explicit "Microphone
access was blocked" message. Stop the microphone if the modal closes
mid-dictation.

### Accessibility and UX

- `role="dialog"`, `aria-modal="true"`, `aria-label`; the trigger has
  `aria-haspopup="dialog"` and `aria-expanded`.
- Escape closes; focus moves into the input on open and back to the trigger on
  close, so the modal is usable from the keyboard alone.
- Background scroll locked while open (`body.style.overflow`, restored on close).
- Transcript container is `aria-live="polite"` and auto-scrolls on
  `[messages, sending, error, suggestions]` — `suggestions` is in there because the
  shelf lands after the reply renders and would otherwise sit below the fold.
- Enter sends, Shift+Enter makes a newline. `maxLength={2000}`, matching the server.
- While sending, a three-dot bounce.
- Fixed footer line: **"AI can make mistakes — check important details before ordering."**
- Greeting: *"Hi! Ask me anything about the products here — what fits your space,
  what's in your budget, or how two models compare."*

---

## 10. Guest conversation history (7 days, browser-side)

`src/app/lib/chat-history.js`. Signed-in visitors have server-side history
(section 7b). Guests have no account to hang a conversation on, so theirs is kept
in this browser — and it doubles as the instant-render cache for signed-in
visitors, shown while the server copy is still in flight.

### Keys

```
sf:chat-history:{brand-domain}:guest
sf:chat-history:{brand-domain}:u:{userId}
```

- **Brand segment** — in development all storefronts are served from localhost and
  therefore share one `localStorage` origin. In production each brand has its own
  domain and is already isolated, but keying on the domain costs nothing and means
  a developer switching brands does not inherit the previous one's conversation.
- **Identity segment** — this is what makes the login transition safe: signing in
  or out changes which key is read, so one person's conversation cannot appear
  under another's session on a shared computer.
- The identity is the user **id**, never the email — that would write an
  identifier into a storage key readable by every script on the page, for no
  benefit.

### Record

```json
{
  "v": 1,
  "savedAt": 1755500000000,
  "sessionId": "…",
  "messages": [{ "id": "m3", "role": "assistant", "text": "…", "handles": ["…"] }]
}
```

- `HISTORY_TTL_MS` = **7 days**, measured **from the last message**, not the first.
  A thread someone is actively using should not disappear mid-way through because
  it started eight days ago.
- `VERSION` is bumped when the shape changes; anything older is **dropped, not
  migrated**.
- `MAX_MESSAGES` = **60** — well past a real session, far short of the ~5 MB origin
  quota the cart also draws on.
- Stored text prefers `full` over `text`, so closing the tab mid-animation does not
  persist a truncated answer. `typing` is deliberately dropped — a restored
  conversation is finished, not mid-animation.
- **Handles are stored, resolved products are not.** A restored shelf is re-priced
  from the catalogue instead of showing what a card cost a week ago.

### API

`historyKey(identity)`, `loadHistory(identity)`,
`saveHistory(identity, { messages, sessionId })`, `clearHistory(identity)`,
`clearAccountHistories()`, `pruneExpiredHistory()`.

- **Everything is defensive.** `localStorage` *throws* rather than returning null in
  Safari's private mode and in sandboxed iframes; a stored value can be corrupt or
  written by an older build. History is a convenience — nothing in it may throw
  into the widget.
- `loadHistory` validates every record (role in `{user, assistant}`, `text` a
  string) and **deletes** expired, corrupt and outdated entries on the way past,
  rather than leaving them to be re-read on every page view.
- `saveHistory` on a quota failure drops the **oldest half and retries**, in a loop,
  until it fits or there is nothing left. Losing the start of a long conversation
  beats losing all of it, and beats throwing. A single retry is not enough: quota
  is shared with the cart, so a failure means the origin is already close to full.
- `pruneExpiredHistory()` sweeps *every* key this app owns, not just the current
  identity's. Otherwise someone who logs in once and never returns leaves their
  conversation in the browser indefinitely — the case the seven-day limit most
  exists to cover.
- `clearAccountHistories()` removes every signed-in conversation for this brand
  (guest history untouched), and runs whenever the page loads signed-out. The
  logout path clears the account's copy directly, but only when the widget happened
  to be mounted — a full navigation to `/logout`, a tab closed mid-session, or a
  logout in another tab all miss it. Signed out has to mean gone however it
  happened. A merely *resumed* session is unaffected: the refresh token restores
  the identity before this runs.

### Identity transitions (the part that is easy to get wrong)

Gate the whole effect on `authLoading`. Auth reports logged-out on every first
render and resolves a moment later; acting on that reads a signed-in visitor as a
guest, and the logout branch then wipes their thread a tick later.

Track the previous identity in a ref where **`undefined` means "not settled yet"**
and **`null` means "guest"** — they are different states.

| Transition | Behaviour |
|---|---|
| `undefined → x` (first settle) | `pruneExpiredHistory()`; if guest, also `clearAccountHistories()`; then restore `x`'s thread |
| `null → id` (guest signs in) | Carry the in-progress thread across: delete the guest copy, save it under the id. If there was nothing to carry, restore the account's own copy and then the server's. See the precedence table in section 7b for why a *carried* thread is not replaced by the server copy. |
| `id → null` or `id → other` | `clearHistory(previous)`, start fresh, restore the new identity. A logged-in thread that survived a logout would be readable by whoever uses the computer next, and "continue where you left off" is not worth that. |

On restore, continue the id sequence **past everything restored** (`Math.max` over
`/^m(\d+)$/`). Starting from zero again hands a new reply the id of an old one, and
the shelf attaches itself to the wrong message.

Persist keyed on **`messages.length`**, not on the messages array: the stored text
comes from `full`, set once when a reply is created, so watching the array would
mean a write every few milliseconds during the type-out for content that is not
changing. A `savedCountRef` also stops an unchanged conversation being re-written
on every page view, which would keep pushing the expiry out and make it "seven days
since you last *visited*" rather than "since you last *asked something*".

Expose a **New conversation** button (the `+` in the header, shown once there is
more than the greeting). A conversation that persists for a week needs a way to be
forgotten — on a shared computer that is the only control the person actually has.

---

## 11. Porting checklist

- [ ] `chat` and `light` buckets exist in the rate limiter
- [ ] `NEXT_SOLANA_BACKEND_URL`, `NEXT_SOLANA_COLLECTIONS_KEY` (**collections**, not the general key) and `NEXT_PUBLIC_STORE_DOMAIN` set for the target app's own backend
- [ ] `chat-region.js` keys on the platform's production flag, **not `NODE_ENV`**
- [ ] `/api/chat/availability` returns `private, no-store`
- [ ] `POST /api/chat` checks the region **before** parsing the body
- [ ] Backend URL ends `/api/chat/` **with** the trailing slash
- [ ] `Authorization: Api-Key …`, not `Bearer`
- [ ] `X-Client-IP` forwarded, omitted rather than blank; the dev public-IP swap guarded on `NODE_ENV`
- [ ] `session_id` echoed, never invented
- [ ] Backend response passed through unchanged
- [ ] `X-User-Token` sent on **both** `POST /api/chat` (so history is written) and `GET /api/chat/history` (so it can be read) — bare token, no `Bearer` prefix, omitted for guests
- [ ] `/api/chat/history` sends the collections `Api-Key` **as well as** `X-User-Token` — one without the other is a 401
- [ ] History `401` falls back to the local copy silently; `404` returns an empty history, not an error
- [ ] `accessToken` held on a ref so its ten-minute rotation does not re-trigger the history fetch
- [ ] A late history response cannot land in another identity's session (ticket guard)
- [ ] Product URLs stripped from the prose and resolved through `/api/chat/products`
- [ ] Replies rendered as React elements, never `dangerouslySetInnerHTML`
- [ ] Widget corner does not collide with the existing live-chat button
- [ ] History keyed per brand **and** per identity; `undefined` vs `null` identity distinguished
- [ ] Verified: `X-Debug-Country: GB` refuses locally; `CHAT_REGION_LOCK=on` reproduces production

---

## 12. Related documents in this repo

- `docs/chat-region-restriction.md` — the region rule in more depth
- `docs/chat-history.md` — the persistence design in more depth
- `docs/brand-isolation.md` — why `store` is never taken from the client
- `docs/agentic-ai-readiness.md` — why the storefront stays readable without JS

---

## 13. History and product cards, end to end

This section is the one to read if you are implementing the feature elsewhere.
Everything above describes a piece; this describes how a conversation gets back
on screen — including its product cards — after a refresh.

### The two kinds of visitor

|  | Signed in | Guest |
|---|---|---|
| Where the conversation lives | The backend, keyed to the account | `localStorage`, in that browser |
| How long | As long as the backend keeps it | 7 days from the **last** message |
| Survives a cleared browser | Yes | No |
| Follows them to another device | Yes | No |
| Written by | `POST /api/chat` carrying `X-User-Token` | The widget, on each new message |
| Read by | `GET /api/chat/history?limit=10` | `loadHistory(identity)` |

Both paths end in the same place: an array of `{ id, role, text }` handed to one
`apply()` function. Nothing downstream knows or cares which source it came from.

### What happens on page load

```
auth settles (never act before this — see below)
        │
        ├─ guest ──────► loadHistory(null) ──────────► apply()
        │
        └─ signed in ──► loadHistory(userId) ────────► apply()      ← instant, from localStorage
                                    │
                                    └─ then GET /api/chat/history ─► apply()   ← replaces it if the server has more
```

The local copy is rendered **first, even for signed-in visitors**, and the server
copy replaces it when it arrives. That ordering is deliberate: the panel fills
instantly instead of waiting on a network call, and a slow or failed lookup
leaves what is already on screen rather than blanking it. For a signed-in
visitor on a new device there is no local copy, so the server response simply
fills an empty panel.

**Gate everything on `authLoading`.** Auth reports logged-out on the first render
and resolves a moment later. Acting before it settles reads a signed-in visitor
as a guest, and the sign-out branch then wipes their thread. Track the previous
identity in a ref where `undefined` means "not settled yet" and `null` means
"guest" — they are different states and conflating them is the single easiest way
to lose someone's conversation.

### Why product cards survive a refresh

This is the part that looks impossible at first, because the history endpoint
returns only text. It works because **the handles are inside that text**.

The backend stores the reply exactly as the assistant wrote it, product URLs and
all. Stored history is therefore raw text in precisely the form a live reply
arrives in, so the same parser handles both:

```
raw reply (from /api/chat, or from /api/chat/history)
        │
   normalizeReply(raw)
        ├─ handles = extractHandles(raw)      ← /product/{handle} pulled out of the prose
        └─ text    = stripProductUrls(raw)    ← the dead URLs removed from the sentence
        │
   message = { id, role, text, handles }
        │
   resolveHandles(handles) ──► GET /api/chat/products?handles=a,b,c
        │
   productsByHandle[handle] = { title, price, image, url, cartItem }
        │
   cards render under that message, from its own handles
```

Nothing about the cards is persisted. Only handles are stored — never resolved
products — so a conversation reopened next week shows **today's** price and
stock rather than what was true when the answer was given. An item that has
since been delisted simply resolves to nothing and no card is drawn.

Four consequences worth designing for:

- **One normalisation point.** Both sources go through `normalizeReply()`. Skip
  it on the history path and you get the model's `/product/{handle}` links back
  on screen as clickable text, and every one of them 404s.
- **Prefer stored handles, fall back to parsing.** The local copy already has
  `handles` saved alongside; server history does not. `apply()` uses the stored
  ones when present and reads them out of the text otherwise, which covers both
  without the caller declaring which it holds.
- **Key resolved products by handle, not by message.** A map means a product
  mentioned in two replies is fetched once, and — more importantly — a slow
  lookup cannot overwrite the wrong reply's cards, because nothing is being
  overwritten. That removes a race rather than guarding against it.
- **Chunk the lookups.** `/api/chat/products` accepts 8 handles per request. A
  restored conversation easily exceeds that, so batch client-side rather than
  raising the cap — the cap is what bounds a crafted request.

### Cards belong to their message, not to the panel

Every assistant message renders its own cards beneath it, rather than one shelf
at the foot of the panel showing the latest answer's products. With history in
play this is the only arrangement that works: scrolling back through a restored
conversation has to show what was recommended *at each point*, and a single shelf
can only ever show one answer's worth.

### Moving between identities

| Transition | What happens |
|---|---|
| First settle | Prune expired entries; if guest, also clear any account histories left in this browser; restore |
| Guest → signed in, mid-conversation | The thread on screen **stays** and is saved under the account. It was asked seconds ago; the stored thread may be a week old, and replacing a live conversation at the moment someone signs in is the more surprising of the two |
| Guest → signed in, nothing to carry | Restore the account's local copy, then let the server copy replace it |
| Signs out, or switches account | Clear the previous identity's local copy, reset the panel, load the new identity's |

A signed-out browser must retain nothing. On a shared computer, "continue where
you left off" is not worth one person reading another's conversation.

### Guards a late response needs

Two, and both are the same class of bug:

- **An identity ticket**, bumped on every identity change. A history response for
  the person who just signed out must not land in the session of the one who
  signed in.
- **A transcript-length check**, captured when the request starts. Anything typed
  while it was in flight means the answer is stale, and applying it would wipe
  what the visitor just said.
