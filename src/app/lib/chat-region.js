/**
 * Where the AI assistant is allowed to be used.
 *
 * The assistant costs money per message and is only useful to people who can
 * actually buy — the catalogue ships to the US and Canada — so it is restricted
 * to those two countries in production and left open everywhere else, so it can
 * be developed and demonstrated from anywhere.
 *
 * This is IP geolocation. A VPN defeats it in both directions: someone in the
 * US on a UK exit node is refused, and someone in the UK on a US exit node is
 * served. That is fine for what this is — a usage control, to keep spend
 * pointed at the markets we sell to. It is NOT a security boundary and nothing
 * downstream should treat it as one.
 */

/** Countries served when CHAT_ALLOWED_COUNTRIES says nothing else. */
const DEFAULT_ALLOWED = ["US", "CA"];

/**
 * Vercel's geolocation header. Present on every request into a function on the
 * platform; absent locally, because there is no edge in front of `next dev`.
 */
const GEO_HEADER = "x-vercel-ip-country";

/** Country override for testing. Ignored in production — see countryOf(). */
const DEBUG_HEADER = "x-debug-country";

function header(request, name) {
  const h = request?.headers;
  if (!h) return null;
  if (typeof h.get === "function") return h.get(name);
  const v = h[name];
  return Array.isArray(v) ? v[0] : v ?? null;
}

const clean = (value) => {
  const code = String(value ?? "").trim().toUpperCase();
  // ISO 3166-1 alpha-2. Vercel sends XX when it cannot place an address, which
  // is a non-answer and must not be mistaken for a country.
  return /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : null;
};

/** The served countries, as uppercase ISO codes. */
export function allowedCountries() {
  const configured = String(process.env.CHAT_ALLOWED_COUNTRIES ?? "")
    .split(",")
    .map(clean)
    .filter(Boolean);
  // An empty or malformed value means "not configured", not "serve nobody".
  // Locking every visitor out is not a sane reading of a typo.
  return configured.length ? configured : DEFAULT_ALLOWED;
}

/**
 * Whether the restriction applies to this deployment.
 *
 * Keyed on VERCEL_ENV rather than NODE_ENV, and the difference is the whole
 * point: Vercel builds preview deployments with NODE_ENV=production, so a
 * NODE_ENV check would enforce on preview URLs too and lock us out of the
 * environment we test in. VERCEL_ENV distinguishes production / preview /
 * development, so only the real thing is gated.
 *
 * CHAT_REGION_LOCK overrides both ways: `on` to reproduce the restriction
 * locally, `off` to lift it in production from the dashboard without shipping
 * a code change.
 */
export function isRegionLocked() {
  const override = String(process.env.CHAT_REGION_LOCK ?? "").trim().toLowerCase();
  if (override === "on" || override === "true" || override === "1") return true;
  if (override === "off" || override === "false" || override === "0") return false;

  // ───────────────────────────────────────────────────────────────────────────
  // TEMPORARILY DISABLED — 18 Aug 2026, for demo and testing from the
  // Philippines. With this commented out the assistant is open to every country
  // on production, which is the spend the US/CA restriction exists to bound.
  //
  // TO RESTORE: delete the `return false` below and uncomment the line under
  // it. Nothing else in this file changed, so that single edit puts the
  // restriction back exactly as it was.
  //
  // NOTE: a code change was not actually required for this. Setting
  // CHAT_REGION_LOCK=off in the Vercel dashboard lifts the restriction with no
  // deploy and is reversed just as quickly — which is what the override above
  // is for. Prefer that next time; this edit has to be remembered, and an env
  // var does not.
  // ───────────────────────────────────────────────────────────────────────────
  return false;
  // return process.env.VERCEL_ENV === "production";
}

/**
 * The country this request came from, or null if it cannot be determined.
 *
 * Outside production an x-debug-country header stands in, because there is no
 * real geolocation to read locally and the refusal path needs to be testable.
 * Production reads Vercel's header and nothing else — a client-supplied country
 * would make the restriction a suggestion.
 */
export function countryOf(request) {
  if (process.env.VERCEL_ENV !== "production") {
    const debug = clean(header(request, DEBUG_HEADER));
    if (debug) return debug;
  }
  return clean(header(request, GEO_HEADER));
}

/**
 * Whether this request may use the assistant.
 *
 * Returns { allowed, country, locked } — the country comes back so callers can
 * log or report *why* something was refused, rather than leaving a support
 * question that can only be answered by guessing.
 *
 * An unknown country is refused when the lock is on. "US and Canada only" means
 * denying what cannot be placed; admitting unknowns would make the restriction
 * trivially avoidable by anything that strips the header. The cost of being
 * wrong is bounded and visible: if the platform ever stopped sending the
 * header, the assistant would be off for everyone rather than quietly open to
 * everyone, which is the failure you find out about immediately.
 */
export function chatRegion(request) {
  const country = countryOf(request);
  const locked = isRegionLocked();
  if (!locked) return { allowed: true, country, locked };
  return { allowed: Boolean(country) && allowedCountries().includes(country), country, locked };
}

/** Message shown to a refused visitor. Same words wherever the refusal lands. */
export const REGION_MESSAGE =
  "The AI assistant is only available in the US and Canada.";
