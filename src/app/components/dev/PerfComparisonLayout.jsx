"use client";
// DEV ONLY — remove before shipping to production
import {
  Profiler,
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
} from "react";
import ProductsSection from "@/app/components/molecule/ProductsSection";
import ProductsSectionV2 from "@/app/components/molecule/ProductsSectionV2";

const MemoV1 = memo(ProductsSection);
const MemoV2 = memo(ProductsSectionV2);

const initStats = () => ({
  renders: 0,
  mountMs: null,
  avgMs: 0,
  lastMs: 0,
  totalMs: 0,
});

const initRef = () => ({ count: 0, total: 0, mountMs: null });

const ROWS = [
  { label: "Renders", key: "renders", fmt: (v) => (v > 0 ? String(v) : "—") },
  {
    label: "Mount",
    key: "mountMs",
    fmt: (v) => (v != null && v > 0 ? `${v.toFixed(1)}ms` : "—"),
  },
  {
    label: "Avg / render",
    key: "avgMs",
    fmt: (v) => (v > 0 ? `${v.toFixed(2)}ms` : "—"),
  },
  {
    label: "Last render",
    key: "lastMs",
    fmt: (v) => (v > 0 ? `${v.toFixed(2)}ms` : "—"),
  },
  {
    label: "Total time",
    key: "totalMs",
    fmt: (v) => (v > 0 ? `${v.toFixed(1)}ms` : "—"),
  },
];

function pctDiff(v1, v2) {
  if (v1 == null || v2 == null || v1 === 0) return null;
  return ((v2 - v1) / v1) * 100;
}

// PerfPanel owns all display state.
// It registers its own setState into panelSetRef so the parent never needs
// to hold stats state — keeping PerfComparisonLayout state-free and
// preventing the Profiler → setState → re-render → Profiler loop.
function PerfPanel({ panelSetRef, onReset }) {
  const [stats, setStats] = useState({ v1: initStats(), v2: initStats() });
  const [collapsed, setCollapsed] = useState(false);

  // Register this component's setter so the parent can call it directly
  useEffect(() => {
    panelSetRef.current = setStats;
    return () => {
      panelSetRef.current = null;
    };
  }, [panelSetRef]);

  const { v1, v2 } = stats;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[9999] w-[620px] max-w-[96vw] rounded-t-xl shadow-2xl border border-white/10 bg-gray-950/95 backdrop-blur-sm text-white font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-semibold text-[11px] tracking-wide">
            ⚡ React Profiler
          </span>
          <span className="text-white/30 text-[10px]">V1 vs V2 · dev only</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-[10px] transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-[10px] transition-colors"
          >
            {collapsed ? "▲ Show" : "▼ Hide"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 py-3">
          {/* Column headers */}
          <div className="grid grid-cols-[110px_1fr_1fr_72px] gap-x-4 mb-1.5 text-[9px] text-white/30 uppercase tracking-widest">
            <span />
            <span>V1 Original</span>
            <span>V2 Enhanced</span>
            <span>Δ Diff</span>
          </div>

          {ROWS.map(({ label, key, fmt }) => {
            const v1Val = v1[key];
            const v2Val = v2[key];
            const diff = pctDiff(v1Val, v2Val);
            const v2Wins = diff !== null && diff < -2;
            const v2Loses = diff !== null && diff > 2;

            return (
              <div
                key={key}
                className="grid grid-cols-[110px_1fr_1fr_72px] gap-x-4 py-1.5 border-t border-white/5 items-center text-xs"
              >
                <span className="text-white/40 text-[11px]">{label}</span>
                <span className={v2Loses ? "text-green-400" : "text-white/65"}>
                  {fmt(v1Val)}
                </span>
                <span
                  className={
                    v2Wins
                      ? "text-green-400 font-semibold"
                      : v2Loses
                        ? "text-red-400"
                        : "text-white/65"
                  }
                >
                  {fmt(v2Val)}
                </span>
                <span
                  className={
                    v2Wins
                      ? "text-green-400"
                      : v2Loses
                        ? "text-red-400"
                        : "text-white/25"
                  }
                >
                  {diff !== null
                    ? `${diff > 0 ? "+" : ""}${diff.toFixed(0)}%`
                    : "—"}
                </span>
              </div>
            );
          })}

          <p className="mt-2.5 text-[9px] text-white/20">
            Measures React commit time only (actualDuration). Network &amp;
            paint time not included.
          </p>
        </div>
      )}
    </div>
  );
}

export default function PerfComparisonLayout({
  category,
  filterType,
  initialFilterString,
}) {
  // No useState here — keeping this component state-free is what breaks the loop.
  // Profiler fires onRender → we call panelSetRef.current() → only PerfPanel
  // re-renders → PerfComparisonLayout never re-renders → Profiler never fires again.
  const r1 = useRef(initRef());
  const r2 = useRef(initRef());
  const panelSetRef = useRef(null); // set by PerfPanel on mount

  const onRender1 = useCallback((_, phase, actual) => {
    const r = r1.current;
    r.count++;
    r.total += actual;
    if (phase === "mount") r.mountMs = actual;
    panelSetRef.current?.((prev) => ({
      ...prev,
      v1: {
        renders: r.count,
        mountMs: r.mountMs,
        avgMs: r.total / r.count,
        lastMs: actual,
        totalMs: r.total,
      },
    }));
  }, []);

  const onRender2 = useCallback((_, phase, actual) => {
    const r = r2.current;
    r.count++;
    r.total += actual;
    if (phase === "mount") r.mountMs = actual;
    panelSetRef.current?.((prev) => ({
      ...prev,
      v2: {
        renders: r.count,
        mountMs: r.mountMs,
        avgMs: r.total / r.count,
        lastMs: actual,
        totalMs: r.total,
      },
    }));
  }, []);

  const handleReset = useCallback(() => {
    r1.current = initRef();
    r2.current = initRef();
    panelSetRef.current?.({ v1: initStats(), v2: initStats() });
  }, []);

  return (
    <>
      <div className="flex max-w-[1240px] mx-auto">
        {/* V2 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <span className="text-[10px] font-semibold bg-green-100 text-green-700 rounded px-2 py-0.5 font-mono">
              V2 Enhanced
            </span>
          </div>
          <Profiler id="v2" onRender={onRender2}>
            <MemoV2
              category={category}
              filterType={filterType}
              initialFilterString={initialFilterString}
            />
          </Profiler>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 self-stretch mx-1 shrink-0" />

        {/* V1 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 rounded px-2 py-0.5 font-mono">
              V1 Original
            </span>
          </div>
          <Profiler id="v1" onRender={onRender1}>
            <MemoV1 category={category} />
          </Profiler>
        </div>
      </div>

      <PerfPanel panelSetRef={panelSetRef} onReset={handleReset} />
    </>
  );
}
