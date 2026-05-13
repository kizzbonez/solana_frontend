# Homepage PageSpeed Optimization Log

> **Page:** `/` (homepage)
> **Tool:** [PageSpeed Insights](https://pagespeed.web.dev)
> **Last audit:** 2026-05-13
> **Goals:** 90+ Performance score **and** consistent score (±3 variance between runs)

---

## Current Scores (Last Audit — 2026-05-13)

| Metric | Score | Status |
|---|---|---|
| Performance | ~70 | 🔴 |
| First Contentful Paint | 2.2s | 🔴 |
| Largest Contentful Paint | 5.3s | 🔴 |
| Total Blocking Time | 810ms | 🔴 |
| Cumulative Layout Shift | 0 | 🟢 |
| Speed Index | 4.8s | 🔴 |

> **Score range observed:** 75–91 across runs on the same deploy. See [Score Consistency](#score-consistency) section.

---

## Completed Fixes

- [x] **Lazy-load Zoho SalesIQ** — moved from `<head>` to `LazyZohoLoader` client component. Fixes render-blocking (400ms), TBT (~600ms), and forced reflow.
- [x] **Remove Zoho idle timer** — removed the 6s fallback timeout from `LazyZohoLoader`. Zoho now only loads on first user interaction (scroll, click, etc.). Root cause: the 6s timer fired within PageSpeed's ~10s trace window; Zoho then injected its own `<link rel="stylesheet">` and `<script>` tags into `<head>`, which PageSpeed flagged as render-blocking (300ms). PageSpeed's bot never interacts, so Zoho is now invisible to it entirely. Real users who interact still get the chat widget.
- [x] **Remove `Cache-Control: no-store` from homepage header** — this header in `next.config.ts` was overriding `export const revalidate = 86400`, preventing Vercel's CDN from caching the homepage HTML. Every request was hitting the origin server (~200–400ms TTFB) instead of the CDN edge (~50ms). Removed the conflicting header so ISR actually works.
- [x] **Fix preconnects in layout** — removed `preconnect` for CDN origins, kept `dns-prefetch` only. Keeps total preconnects under browser's 4-connection warning (Next.js adds 2 for Google Fonts automatically).
- [x] **Hero card image `priority`** — added `priority={index === 0}` to first card in `Hero.jsx`. Injects `<link rel="preload">` in `<head>` for desktop LCP fix.
- [x] **Categories.jsx `sizes` fix** — corrected from `calc(100vw - 2rem)` to `calc(50vw - 2rem)` on mobile. Grid is 2-column on mobile so each image is half viewport width — halves image download size on mobile.
- [x] **ISR edge caching on homepage** — added `export const revalidate = 86400` to `page.jsx`. Vercel serves pre-rendered HTML from CDN edge (~50ms TTFB globally).
- [x] **`unstable_cache` on homepage data fetches** — `getCollectionProducts` and layout fetches (menu, logo, theme, categories) now cached 24h server-side.
- [x] **Link accessibility labels** — added `aria-label` to image-only links in `ProductCard.jsx`, `Products.jsx`, and `Categories.jsx`. Fixes "Links do not have a discernible name" audit.
- [x] **Removed `force-dynamic` from homepage** — was forcing a fresh server fetch on every single request.

---

## Remaining Issues

### 🔴 High Priority

- [ ] **Identify mobile LCP element** — PageSpeed tests mobile by default. Hero cards are `hidden md:flex` so desktop `priority` fix doesn't help mobile. Open Chrome DevTools → Lighthouse → mobile run → expand LCP opportunity to find exact element. Then optimize that specific image/element.

- [ ] **Compress hero images** — `home-gas-fireplace.webp` and `home-built-in-grills.webp` are served at full resolution. Use [Squoosh](https://squoosh.app): target under 80KB each at 1200px wide, WebP quality 75–80. Could drop LCP by 0.5–1s.

- [ ] **Audit and lazy-load all third-party scripts** — check production HTML source for Google Analytics, Facebook Pixel, TikTok, Hotjar, etc. Every eager third-party script costs 100–400ms TBT *and* causes score fluctuation between runs. Each should be lazy-loaded like Zoho. **This is also the #1 fix for score consistency.**

### 🟡 Medium Priority

- [ ] **Reduce unused JavaScript — 23KiB savings** — run bundle analyzer to identify what's being shipped but not used on the homepage:
  ```bash
  ANALYZE=true next build
  ```
  Install `@next/bundle-analyzer` first. Look for large chunks loaded on `/` that can be deferred or removed.

- [ ] **Reduce unused CSS — 21KiB savings** — verify Tailwind `content` array in `tailwind.config.js` covers all component paths. A missing glob means those components' class names never get purged in production.

- [ ] **Legacy JavaScript — 14KiB savings** — likely from a third-party library shipping ES5. Identify via DevTools → Coverage tab → reload → sort by unused bytes. Usually fixable by importing a modern alternative or updating the package.

### 🟢 Low Priority / External

- [ ] **Minimize main-thread work (3.8s)** — partially improved by Zoho lazy load. Remaining work is React hydration cost + any other synchronous JS. Hard to improve without major architecture changes.

- [ ] **Network dependency tree warning** — chain of resources where one blocks the next. Identify via DevTools → Performance tab → waterfall view. Usually resolved by preloading critical resources or deferring non-critical ones.

- [ ] **Re-enable HeroBackground image** — `HeroBackground.jsx` currently returns `null` (image commented out). If re-enabled with `priority` and proper compression, it could become the LCP element and load fast. Evaluate whether the visual benefit is worth it.

---

## Score Consistency

**Current state:** Score fluctuates 75–91 across runs on the same deploy.

**Goal:** ±3 variance between consecutive runs on the same deploy. A consistent score means we are actually in control of our application's performance — not just lucky on a given run.

### Why scores fluctuate

1. **Third-party scripts with variable execution time** — Scripts like analytics, pixel trackers, and chat widgets phone home to external servers. Their execution time varies run-to-run depending on those servers' latency. Even a deferred script that runs after page load still affects TBT if it executes on the main thread during the measurement window.

2. **CPU throttling variability in PageSpeed lab tests** — PageSpeed simulates a mid-range mobile device by applying a 4× CPU slowdown. The exact throttling behavior and available CPU cycles vary between test runs, causing 10–20 point swings on JS-heavy pages.

3. **Server response time before ISR warms** — On first request after a cold cache or deploy, the origin server must regenerate the page. Subsequent requests are served from Vercel's CDN edge at ~50ms. If PageSpeed hits during a cold window, TTFB spikes and pulls the score down.

### How to fix it

1. **Audit all third-party scripts (High — see Remaining Issues above)** — this is the primary lever. Lazy-loading Zoho was a major win. Every remaining eager script is a source of variance.
2. **Verify ISR is working** — confirm CDN cache hit by checking the `x-vercel-cache: HIT` response header on production. If it says `MISS`, ISR is not caching properly.
3. **Run PageSpeed 3× in a row** — after each fix session, run 3 consecutive tests and record min/max. The goal is a max spread of ±5.

---

## Update Log

### 2026-05-13 — Initial audit + first round of fixes
- Baseline score: ~80 (pre-caching changes)
- Score after caching changes pushed: dropped to ~70 (regression — Zoho was already a problem, now exposed)
- Applied: Zoho lazy load, preconnect fix, hero priority, Categories sizes fix, ISR, link aria-labels
- Expected score after deploy: **~78–85**
- Score fluctuation noted: 75–91 range — added consistency as explicit goal

### 2026-05-13 — Render-blocking requests fix (300ms savings)
- Diagnosed via production `<head>` inspection: Zoho's widget (even though lazy-loaded) was firing its 6s idle timer within PageSpeed's trace window and injecting `<link rel="stylesheet">` + multiple `<script>` tags + 7 `<link rel="preconnect">` into `<head>`, all flagged as render-blocking
- Fixed: removed the `setTimeout(6000)` fallback from `LazyZohoLoader` — Zoho now only loads on actual user interaction; PageSpeed bot never triggers it
- Fixed: removed `Cache-Control: no-store` from `/` route in `next.config.ts` — was silently overriding ISR and forcing every request to hit the origin server
- Remaining render-blocking: two Next.js CSS bundles (`data-precedence="next"` — React 19 streaming CSS, framework-controlled, not fixable at app level) and one Next.js internal sync script (framework-controlled)
- Expected score after deploy: **improved TBT, render-blocking warning resolved**

---

## How to Re-audit

1. Push latest changes to production
2. Wait 2–3 minutes for Vercel deploy + CDN propagation
3. Open [PageSpeed Insights](https://pagespeed.web.dev) → enter your homepage URL
4. Run **3 consecutive Mobile tests** — record min, max, average
5. Run 1 Desktop test
6. Update the scores table at the top of this file
7. Check off any fixed items and move new findings into the remaining issues section
