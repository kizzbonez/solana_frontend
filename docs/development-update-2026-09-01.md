# Development update — 26 August to 1 September 2026

**Storefront:** shared Next.js app serving Solana Fireplaces, BBQ Grill Outlet and Outdoor Kitchen Outlet
**Period:** Wed 26 Aug – Tue 1 Sep 2026 · work landed on 28, 31 Aug and 1 Sep
**Previous report:** `docs/development-update-2026-08-18.pdf` (12–18 Aug)

| | |
|---|---|
| Commits | **8** |
| Files changed | 33 |
| Lines added / removed | 1,819 / 117 |
| New modules | 7 |
| Brands affected | all three |

The theme of the period: **moving control out of code and into the admin.** Two
things that previously required a developer and a deploy — hiding a menu item,
and suppressing a brand from the catalogue — are now operator-editable. A third
change makes it possible to clear a live site's cache without holding its
secrets.

---

## 1. Navigation visibility now works — 28 August

### The problem

The menu data has carried a `nav_visibility` flag since the V3 editor was built,
and **nothing on the storefront had ever read it.** All three themes filtered the
navigation by a hardcoded list of names instead:

```js
!["Search", "Home", "Brands", "Current Deals"].includes(name)
```

The only code that honoured the flag — `tui_navbar.jsx` and two siblings — is
imported nowhere, and the one line in `category-helpers.js` was commented out.

This was hidden by a coincidence. `Search` is the single menu item set to
`nav_visibility: false`, and it *appeared* to be correctly hidden — but only
because the string `"Search"` happens to sit in that hardcoded list. The flag had
never done anything.

### What changed

- A **"Show in navigation" toggle** on `/admin/menu-builder/edit/{id}/settings`.
- A shared `isNavVisible()` applied in all three themes, to parent items **and
  their dropdown children**, so a single brand can be hidden without losing its
  parent.
- Hidden pages now **404** rather than rendering empty. `generateMetadata`
  returns nothing and `generateStaticParams` stops prebuilding them, so a hidden
  page cannot advertise a title into a search result that dead-ends.

Absent counts as visible: almost no item carries the field, so treating "missing"
as "hidden" would have emptied the navigation on all three brands at deploy.

Verified against the live menu: hiding *Patio Heaters* removed exactly that item,
and the two hidden Bull pages went from 2 rendered links to 0.

### Related fix: `/brands` was advertising a brand it could not sell

Excluded brands are filtered out of Elasticsearch, but the brand links on
`/brands` come from the Redis menu, which knew nothing about that list. The page
listed **Bull Outdoor Products** while the page behind it rendered empty, and
disagreed with `/categories`, which reads the same list from the catalogue and
did drop it. Now filtered — 42 children before, 41 after.

---

## 2. Catalogue exclusions moved to the admin — 31 August

### The problem

Hiding a brand meant editing an array in `helpers.js` and shipping a deploy.
Worse, the value is inlined at build time, which produced a genuinely confusing
failure: a brand correctly absent from search while still filling a collection
page, because the App Router and Pages Router had compiled different copies of
the list.

### What changed

A new **Catalogue Exclusions** screen at `/admin/catalog-exclusions`, backed by
Redis. Brands are picked from the live catalogue rather than typed — a typo here
fails silently, excluding nothing while looking like it worked.

`exclude_collections` moved with `exclude_brands`; they sit in the same query
block in the same sixteen files, and leaving one static would have been a split
nobody could guess at later.

### Design decisions worth recording

**One global key, deliberately not store-scoped.** Every other Redis key in this
app is prefixed per brand so storefronts cannot read each other's data. This one
is shared on purpose: it describes the shared catalogue rather than one brand's
presentation of it. The screen warns that an edit applies to all three.

**The static list survives as a fallback.** If Redis is empty or unreachable, the
old list still applies — so the failure mode is a stale list rather than every
suppressed brand reappearing on production at once. A stored *empty* array still
means "exclude nothing", or the admin could never clear a list.

**Client components were making the exclusion advisory.** Three recommendation
widgets, the open-box strip and the search context each posted their own copy of
the list. A caller could omit it, and a cached browser bundle carried whatever
list it shipped with. The proxy now applies the authoritative list server-side,
and those copies were removed — keeping them would have made *un-excluding* a
brand impossible.

**A cache bug found only by testing.** The first save worked and the storefront
did not move: `searchkit` caches Elasticsearch responses in Redis keyed by a hash
of the *request body*, which does not change when the exclusion list does. Saving
now purges those keys as well as busting nine cache tags.

Verified both directions: removing Bull made its 28 collection products appear,
putting it back returned them to zero.

---

## 3. Clear a live site's cache from the dev admin — 31 August

Menu and settings changes land in Redis immediately, but each deployment caches
its own render for 24 hours. Clearing locally did nothing for production, and the
only way to clear production was to hold its secret and call it by hand.

The cache screen now has a second control: pick a target site, confirm, and this
deployment makes the call. **The existing button is untouched** — 187 insertions,
zero deletions — because one control that clears either localhost or a live
storefront depending on a dropdown is how the wrong thing gets cleared.

The secret is attached server-side and never reaches the browser. Three guards:
an admin session, development builds only, and a **host allowlist**. That last
one matters — without it, naming any host would make the server hand it
`REVALIDATE_SECRET`.

Verified against the OKO preview: 13 tags busted, 4 paths revalidated, 428 Redis
keys deleted, homepage rebuilt, 2.2 seconds.

---

## 4. Duplicate product detection — 1 September

A new endpoint answers "is anything duplicated in the catalogue, and which
records are they" in one request:

```
/api/catalog/duplicates?published=true&limit=200
```

It checks four dimensions — handle, product ID, title and variant SKU — and
returns the offending records, not just counts. A count says there is a problem;
the records say which copy to delete.

### What it found

Restricted to **published** products, which is what the storefront actually
shows:

| | |
|---|---|
| Live duplicate groups | 48 |
| Live products implicated | 107 |
| Duplicate handles / product IDs | **0** |

Split by whether the SKU is genuinely shared:

- **5 groups — same SKU, prices disagree.** Two live pages for one product at two
  prices. Fix first.
- **29 groups — same SKU, prices agree.** Two live pages competing for the same
  product.
- **14 groups — different SKUs.** Mostly *not* duplicates.

That last category is the trap. `SEDSD3` at $499.99 and `SEDSD3-OB` at $299 is
new against open-box; `BLZ3PRO5PCKGLP` and `…GNG` are propane and natural gas;
`CBB3-LP` and `CBB4-LP` are three- and four-burner packages. Anything matching on
shared titles alone would delete stock you sell.

Full findings, with a named keeper and a reason for each urgent group, are in
**`docs/catalog-duplicates-2026-09-01.md`**.

### Two measurement traps documented

- **Cardinality lies.** `handle` shows 6,686 documents and 6,619 distinct values,
  which looks like 67 duplicates. The exact aggregation finds **none** — the gap
  is HyperLogLog approximation.
- **The default limit hides the problem.** At the default the report shows 25 SKU
  groups over 64 documents; raised, it is 80 groups over 174. Each field now
  returns a `truncated` flag.

---

## 5. Documentation and a build fix — 1 September

**AI chat porting guide** gained a section on how conversation history loads and
renders for signed-in versus guest visitors, and why product cards survive a
refresh. The non-obvious part: the history endpoint returns only text, but the
handles are *inside* that text, because the backend stores the reply exactly as
written. Only handles are persisted, never resolved products, so a reopened
conversation is re-priced from the catalogue.

**A stranded label** was removed from chat replies. The assistant writes
`- URL: https://…`, so stripping the URL left `- URL` pointing at nothing.

**A build failure was caught before deployment.** The exclusions migration wrote
the same relative import path into three files at different directory depths; one
resolved to nothing and the production build failed. Lint did not catch it —
ESLint does not resolve module paths — and dev never exercised that route. Left
alone it would have returned a server error on every collection page. Fixed by
using the path alias, which is depth-independent.

Clean build after the fix: **339/339 static pages, `DYNAMIC_SERVER_USAGE` 0.**

---

## Deployment

All 13 outstanding commits were pushed to **both** remotes on 1 September.
`origin` moved `c55006f → 3dbb973` as a clean fast-forward, so the deployment
pipeline now has everything from this period *and* the previous one — the live
sites had been running pre-18-August code until now.

**After the deploy completes, clear each brand's cache.** The navigation and
exclusion changes read data cached for 24 hours; until that is cleared, the live
sites will keep serving the old menu and the old exclusion list. The new remote
cache tool does this.

---

## Needs attention

### The AI assistant is still open to every country

The US/Canada restriction was lifted on 18 August for demonstration from the
Philippines and **has not been restored**. It is now deploying to production,
where every country can generate model-call spend across all three brands.

Two ways to close it, neither requiring a code change to be written from scratch:

- Set `CHAT_REGION_LOCK=on` in each Vercel project — takes effect without a
  deploy.
- Or delete the `return false` at `src/app/lib/chat-region.js:71` and uncomment
  the line beneath it.

### A live product priced at $0

Product `6049`, `napoleon-rogue-525-gas-grill-r525pk-1`, is published at **$0**.
Unrelated to duplication; it surfaced during that analysis.

### The navigation menu is still shared across all three brands

Menu content is stored without a brand prefix, so the menu editor is one editor
with three front doors: editing navigation, hero, featured content or collections
on any brand changes all three storefronts. Now that the visibility toggle works,
this applies to hiding items too. Documented rather than fixed — the repair is a
data migration as well as a code change.

### `solanafireplaces.com` was unreachable during testing

On 28 August the domain returned a connection reset from this network while the
other two brands responded normally. It resolves to an IP that is neither
Vercel's nor Cloudflare's, unlike its siblings. Worth confirming whether that is
a local network issue or a real DNS/hosting problem.

---

## Commit log

| Date | Ref | Change |
|---|---|---|
| Fri 28 Aug | `5f303b0` | Honour `nav_visibility`; drop excluded brands from listings |
| Fri 28 Aug | `88f9cc5` | 404 menu pages hidden from navigation |
| Mon 31 Aug | `d527293` | Clear a deployed site's cache from the dev admin |
| Mon 31 Aug | `5a52f8e` | Move catalogue exclusions from code to Redis |
| Tue 1 Sep | `b06f98e` | Report duplicate products in the catalogue |
| Tue 1 Sep | `3773a4d` | Filter duplicate report to published products, and write it up |
| Tue 1 Sep | `19fcb56` | Explain history and card rendering; drop stranded link labels |
| Tue 1 Sep | `3dbb973` | Resolve catalog-exclusions through the path alias |

### New files

```
src/app/lib/catalog-exclusions.js                              Redis-backed exclusion lists
src/app/api/catalog-exclusions/route.js                        read/write, with cache busting
src/app/components/admin/catalog-exclusions/…Editor.jsx        the admin screen
src/app/(admin)/admin/catalog-exclusions/page.jsx              its route
src/app/api/catalog/duplicates/route.js                        duplicate detection
src/app/api/cache/clear-remote/route.js                        remote cache clearing
docs/catalog-duplicates-2026-09-01.md                          duplicate findings
```
