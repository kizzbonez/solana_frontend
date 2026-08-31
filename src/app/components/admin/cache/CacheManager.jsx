"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Globe,
  Info,
  Layers,
  Lock,
  Trash2,
} from "lucide-react";

const fmtDuration = (ms) =>
  ms == null ? "—" : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;

const fmtWhen = (iso) => {
  if (!iso) return "never";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "unknown" : d.toLocaleString();
};

function StatusRow({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="min-w-0 truncate text-right text-xs font-medium text-zinc-800 dark:text-zinc-200">
        {children}
      </span>
    </div>
  );
}

function Chip({ children, tone = "zinc" }) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * Clear a *different* deployment's cache from this one.
 *
 * Deliberately separate from the button above, in state as well as in markup.
 * That button mutates this deployment; this one reaches across the network to
 * production, and the two should never be one control with a mode — the cost of
 * confusing them is clearing a live storefront while meaning to clear localhost.
 *
 * Rendered only on development builds, matching the server route's own guard.
 * The check here is presentation: the route refuses regardless, so a stale
 * bundle or a hand-made request gains nothing.
 */
function RemoteCacheClear() {
  const [meta, setMeta] = useState(null);
  const [target, setTarget] = useState("");
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (!isDev) return;
    fetch("/api/cache/clear-remote", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.targets?.length) return;
        setMeta(data);
        setTarget((prev) => prev || data.targets[0]);
      })
      .catch(() => {
        /* the section simply stays unusable — nothing to recover here */
      });
  }, [isDev]);

  if (!isDev) return null;

  const run = async () => {
    setRunning(true);
    setConfirming(false);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/cache/clear-remote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.status === "error") {
        setError(data?.error || `Request failed (${res.status}).`);
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e?.message || "Request failed.");
    } finally {
      setRunning(false);
    }
  };

  const remote = result?.remote;

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5 dark:border-amber-500/20 dark:bg-amber-500/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white">
            <Globe className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            Clear a deployed site&apos;s cache
            <span className="rounded-md bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              dev only
            </span>
          </h3>
          <p className="mt-1 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Runs the same clear as above, but against the chosen live site. Use
            after editing the shared menu or store settings, which land in Redis
            immediately while each deployment keeps its own render cached for 24
            hours.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Target site
          </span>
          <select
            value={target}
            onChange={(e) => {
              setTarget(e.target.value);
              setConfirming(false);
              setResult(null);
              setError(null);
            }}
            disabled={!meta?.targets?.length || running}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {(meta?.targets || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            {!meta?.targets?.length && <option value="">No targets configured</option>}
          </select>
        </label>

        {confirming ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={run}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Yes, clear {target}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={running || !target}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} aria-hidden="true" />
            {running ? "Clearing…" : "Clear remote cache"}
          </button>
        )}
      </div>

      {meta && meta.configured === false && (
        <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">
          REVALIDATE_SECRET is not set locally, so this cannot authenticate
          against the remote site.
        </p>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Cleared {result.target} in {fmtDuration(result.tookMs)}
          </p>
          <div className="mt-2 divide-y divide-emerald-100 dark:divide-emerald-500/10">
            <StatusRow label="Tags busted">{remote?.tags?.length ?? "—"}</StatusRow>
            <StatusRow label="Paths revalidated">{remote?.paths?.length ?? "—"}</StatusRow>
            <StatusRow label="Redis keys deleted">
              {remote?.redisKeysDeleted != null
                ? remote.redisKeysDeleted.toLocaleString()
                : "—"}
            </StatusRow>
          </div>
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        <span>
          Only hosts on the server&apos;s allowlist can be targeted, because this
          sends a shared secret to whatever it is pointed at. Add others with
          CACHE_REMOTE_TARGETS.
        </span>
      </p>
    </section>
  );
}

export default function CacheManager() {
  const [info, setInfo] = useState(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/cache/clear", { cache: "no-store" });
      setInfo(await res.json());
    } catch {
      setError("Couldn't load cache status.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // A full sweep deletes Redis keys and then pre-warms the homepage, which can
  // take a few seconds. Tick so the screen doesn't look hung.
  useEffect(() => {
    if (!running) return undefined;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const clearAll = async () => {
    setRunning(true);
    setConfirming(false);
    setError(null);
    try {
      const res = await fetch("/api/cache/clear", { method: "POST" });
      const data = await res.json();
      if (data.status === "error") {
        setError(data.error || "Clear failed.");
      } else if (data.errors?.length) {
        setError(`Completed with problems: ${data.errors.join("; ")}`);
      }
      await load();
    } catch (e) {
      setError(e?.message || "Request failed.");
    } finally {
      setRunning(false);
    }
  };

  const last = info?.last;
  const groups = info?.groups || [];
  const unreachable = info?.unreachable || [];
  const sharedGroups = groups.filter((g) => g.shared);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Cache
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Everything this site caches, and one button to clear it. Use after a
          bulk product import or any change that isn&apos;t showing up on the
          storefront.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {/* ── The button ── */}
      <section className="rounded-xl border border-zinc-200 p-4 sm:p-5 dark:border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white">
              Clear all caches
              {last && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    last.status === "ok"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}
                >
                  {last.status === "ok" ? (
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  )}
                  {last.status === "ok" ? "OK" : "Partial"}
                </span>
              )}
            </h3>
            <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
              Busts every tag and path in the list below, deletes the cached
              Elasticsearch filter responses from Redis, then rebuilds the
              homepage so the next visitor doesn&apos;t wait for it.
            </p>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Store scope:{" "}
              <Chip>{info?.store || "—"}</Chip>
            </p>
          </div>

          {confirming ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Yes, clear everything
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={running}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2
                className={`h-4 w-4 ${running ? "animate-pulse" : ""}`}
                aria-hidden="true"
              />
              {running ? `Clearing… ${elapsed}s` : "Clear all caches"}
            </button>
          )}
        </div>

        {!!sharedGroups.length && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              <strong>Affects all brands.</strong> The Redis keys behind{" "}
              {sharedGroups.map((g) => g.label).join(", ")} are not store-scoped,
              so clearing them here also clears them for the other stores sharing
              this Redis instance. Harmless — they simply repopulate on the next
              request — but expect a brief slowdown site-wide.
            </span>
          </div>
        )}

        <div className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100 pt-2 dark:divide-white/5 dark:border-white/5">
          <StatusRow label="Tags busted">
            {last?.tags?.length ?? "—"}
          </StatusRow>
          <StatusRow label="Paths revalidated">
            {last?.paths?.length ?? "—"}
          </StatusRow>
          <StatusRow label="Redis keys deleted">
            {last?.redisKeysDeleted != null
              ? last.redisKeysDeleted.toLocaleString()
              : "—"}
          </StatusRow>
          <StatusRow label="Homepage pre-warm">
            {last?.warmed == null
              ? "—"
              : last.warmed.ok
                ? "rebuilt"
                : `failed (${last.warmed.status ?? "no response"})`}
          </StatusRow>
          <StatusRow label="Took">{fmtDuration(last?.durationMs)}</StatusRow>
          <StatusRow label="Last cleared">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-400" aria-hidden="true" />
              {fmtWhen(last?.clearedAt)}
            </span>
          </StatusRow>
          {!!last?.errors?.length && (
            <StatusRow label="Errors">
              <span className="text-red-600 dark:text-red-400">
                {last.errors.join("; ")}
              </span>
            </StatusRow>
          )}
        </div>
      </section>

      <RemoteCacheClear />

      {/* ── What gets cleared ── */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
          <Layers className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          What gets cleared
        </h3>
        <div className="mt-2 space-y-2">
          {groups.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-zinc-200 p-3.5 dark:border-white/10"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {g.label}
                  {g.shared && (
                    <span className="ml-2 text-[11px] font-normal text-amber-700 dark:text-amber-400">
                      shared across brands
                    </span>
                  )}
                </p>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  expires on its own in {g.ttl}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {g.blurb}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {g.tags.map((t) => (
                  <Chip key={t}>tag:{t}</Chip>
                ))}
                {g.paths.map(([p]) => (
                  <Chip key={p}>path:{p}</Chip>
                ))}
                {g.redis.map((r) => (
                  <Chip key={r} tone="amber">
                    <Database className="mr-1 h-2.5 w-2.5" aria-hidden="true" />
                    redis:{r}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What it can't reach ── */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
          <Lock className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          What this button cannot clear
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          These live outside the app process. All of them expire on their own —
          the longest wait is 5 minutes.
        </p>
        <div className="mt-2 divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-white/5 dark:border-white/10">
          {unreachable.map((u) => (
            <div key={u.label} className="p-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {u.label}
                </p>
                <Chip>{u.detail}</Chip>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {u.why}
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Everything here also refreshes on its own — most entries within 24
          hours. Clearing is for when you need a change live now. External
          callers (webhooks, the Django admin) can hit{" "}
          <Chip>GET /api/revalidate-all?secret=…</Chip>, which busts the same
          tags and paths but leaves the shared Redis cache alone.
        </span>
      </p>
    </div>
  );
}
