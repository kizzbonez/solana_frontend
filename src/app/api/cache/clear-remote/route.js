import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/app/lib/admin-auth";

/**
 * Clear another deployment's cache from this one.
 *
 *   GET  /api/cache/clear-remote   -> { enabled, targets }  for the admin UI
 *   POST /api/cache/clear-remote   -> { target } in the body, clears that host
 *
 * The problem this solves: a menu or settings change lands in Redis, which all
 * brands share, but each deployment caches its own render of it for 24 hours.
 * Clearing locally does nothing for production, and the only way to clear
 * production was to hold its REVALIDATE_SECRET and curl it by hand.
 *
 * This does exactly that call, server-side, so the secret is never handed to a
 * browser. It is a separate route rather than a flag on /api/cache/clear
 * because the two do genuinely different things — one mutates this deployment,
 * the other reaches across the network — and folding them together would put a
 * request to an external host one typo away from the ordinary clear button.
 *
 * THREE GUARDS, and none of them is optional:
 *
 *   1. Admin session, same as every other admin API.
 *   2. Development builds only. A deployed brand must not be able to reach
 *      into another deployment, whatever its operator intends.
 *   3. An allowlist of hosts. This attaches a shared secret to an outbound
 *      request, so a free-text domain would be a credential-leaking SSRF: name
 *      any host and this server hands it REVALIDATE_SECRET.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** The remote clear can rebuild a homepage; give it room, but bound it. */
const REMOTE_TIMEOUT_MS = 55_000;

/**
 * Deployments this tool may target.
 *
 * Overridable so a new brand or a preview URL does not need a code change, but
 * never empty: an unset or malformed value means "no targets", not "any host".
 * Failing closed is the whole point of having a list.
 */
const DEFAULT_TARGETS = [
  "solanafireplaces.com",
  "bbqgrilloutlet.com",
  "outdoorkitchenoutlet.com",
  // OKO's Vercel preview. Listed because a preview deployment caches exactly
  // like production does, so a shared-menu change needs clearing there too —
  // and it is the safe place to try this button before pointing it at a live
  // storefront.
  "oko-dev-gamma.vercel.app",
];

/** Host only, lowercased, `www.` removed, port and path discarded. */
const normalizeHost = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "")
    .replace(/:\d+$/, "");

export function allowedTargets() {
  const configured = String(process.env.CACHE_REMOTE_TARGETS ?? "")
    .split(",")
    .map(normalizeHost)
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_TARGETS;
}

/** Development builds only — see the guards note above. */
const isEnabled = () => process.env.NODE_ENV !== "production";

const fail = (error, status) =>
  NextResponse.json({ status: "error", error }, { status });

async function guard(request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return fail("Unauthorized", 401);
  }
  if (!isEnabled()) {
    return fail(
      "Remote cache clearing is available on development builds only.",
      403,
    );
  }
  return null;
}

export async function GET(request) {
  const denied = await guard(request);
  if (denied) return denied;

  return NextResponse.json({
    enabled: true,
    targets: allowedTargets(),
    // Surfaced so the UI can say why the button will not work, rather than
    // letting the operator discover it as a 500 from the far end.
    configured: Boolean(process.env.REVALIDATE_SECRET),
  });
}

export async function POST(request) {
  const denied = await guard(request);
  if (denied) return denied;

  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return fail("REVALIDATE_SECRET is not set on this deployment.", 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Body must be JSON.", 400);
  }

  const target = normalizeHost(body?.target);
  if (!target) return fail("target is required.", 400);

  // Compared after normalising both sides, so www./scheme/port variants of an
  // allowed host are accepted while anything else is refused outright.
  if (!allowedTargets().includes(target)) {
    return fail(
      `${target} is not an allowed target. Add it to CACHE_REMOTE_TARGETS if it should be.`,
      403,
    );
  }

  // Always https and always the normalised host, so neither the scheme nor the
  // hostname can be steered by what was submitted.
  const url = `https://${target}/api/cache/clear?secret=${encodeURIComponent(secret)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
      // A brand's apex domain usually redirects to www. Following it keeps the
      // operator from having to know which form each brand serves.
      redirect: "follow",
    });

    // The far end answers with an HTML error page when something upstream
    // breaks, so parse defensively rather than assuming JSON.
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* not JSON — reported below */
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          status: "error",
          target,
          httpStatus: res.status,
          error:
            res.status === 401
              ? "The remote deployment refused the secret. Its REVALIDATE_SECRET differs from this one."
              : data?.error || `Remote responded ${res.status}.`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      status: "ok",
      target,
      tookMs: Date.now() - startedAt,
      // The remote's own report, passed through rather than reshaped, so this
      // screen shows exactly what its cache screen would.
      remote: data,
    });
  } catch (err) {
    const timedOut = err?.name === "AbortError";
    console.error(`cache/clear-remote: ${target} failed:`, timedOut ? "timeout" : err);
    return fail(
      timedOut
        ? `${target} took too long to respond. It may still be clearing.`
        : `Couldn't reach ${target}.`,
      502,
    );
  } finally {
    clearTimeout(timer);
  }
}
