# Duplicate products on the storefront

**Index:** `solana_updated_product_index` · **Generated:** 1 September 2026
**Regenerate:** `/api/catalog/duplicates?published=true&limit=200`
(signed into `/admin`, or add `&secret=REVALIDATE_SECRET`)

**Scope: published products only.** Unpublished records are excluded at the
query level, not filtered out afterwards — so a SKU sitting on one live product
and three drafts does not appear here at all. Nobody can reach those drafts, and
counting them buried the handful of products that really are on sale twice.

Records are grouped by **title and variant SKU together**: two products belong to
the same group if they share either. That matters because most real duplicates
differ slightly in title — a mangled `™`, a reordered phrase — while the SKU
stays identical.

---

## The numbers

| | |
|---|---|
| Live duplicate groups | **48** |
| Live products implicated | **107** |
| Same SKU on 2+ live products | **34 groups** ← the real problem |
| Different SKUs, grouped by title | 14 groups ← mostly legitimate |
| Duplicate handles / product IDs | **0** |

For comparison, the unfiltered report showed 84 groups and 185 documents. Well
over half of that was drafts and archived records behind a live product — noise,
for your purposes.

**Reconciling with the endpoint.** Hitting
`/api/catalog/duplicates?published=true` reports **44 duplicate SKUs** and **7
duplicate titles**, not the 48 groups above, and both figures are right. The
endpoint counts each field separately; this document merges them, so a product
sharing a SKU with one record and a title with another lands in a single group.
That merging is what moves 10 of those SKU groups into section 3, where they
turn out to be different products rather than duplicates.

---

## 1. Same SKU, prices disagree — fix these first (5 groups)

Two live pages for one product at two prices. A customer sees whichever they
land on, and the cheaper one wins any comparison feed.

#### SKU `17468`

*Bull Conversion Kit for Angus, Lonestar Select & Outlaw Gas Grills - Natural Gas to Propane - 17468*  ·  *Bull Outdoor Products Conversion Kit For Angus, Lonestar Select & Outlaw Gas Grills - Natural Gas To Propane- 17468*  ·  *Bull Conversion Kit For Angus, Lonestar Select and Outlaw Gas Grills, Natural Gas To Liquid Propane Gas - 17468*

| Product ID | Price | Imgs | Updated | Handle |
|---|---|---|---|---|
| `1830` | $229.15 | 5 | 2026-06-30 | `copy-of-bull-conversion-kit-for-angus-lonestar` |
| `1737` | $229.15 | 2 | 2026-06-30 | `bull-outdoor-products-conversion-kit-for-angus` |
| `6434` | $229.99 | 5 | 2026-06-30 | `bull-conversion-kit-for-angus-lonestar-select-` |

#### SKU `61286`

*Napoleon TRAVELQ≈∏?? PRO285 & 285 GRILL COVER- 61286*  ·  *Napoleon TRAVELQ‚Ñ¢ PRO285 & 285 GRILL COVER- 61286*  ·  *Napoleon TRAVELQ™ PRO285 & 285 GRILL COVER- 61286*

| Product ID | Price | Imgs | Updated | Handle |
|---|---|---|---|---|
| `2961` | $34.99 | 2 | 2026-08-10 | `napoleon-travelq™-pro285-285-grill-cover-61826` |
| `2960` | $33.99 | 2 | 2026-06-30 | `napoleon-travelqy-pro285-285-grill-cover-61826` |
| `2959` | $33.99 | 2 | 2026-06-30 | `napoleon-travelq-n-pro285-285-grill-cover-6182` |

#### SKU `VH42-3-SP4`

*Summerset 4-in Spacer Bracket for 42-in Vent Hood - VH42-3-SP4*

| Product ID | Price | Imgs | Updated | Handle |
|---|---|---|---|---|
| `6615` | $629 | 5 | 2026-08-10 | `summerset-4-in-spacer-bracket-for-42-in-vent-h` |
| `6614` | $1099 | 5 | 2026-08-10 | `summerset-4-in-spacer-bracket-for-42-in-vent-h` |

#### SKU `61427`

*Napoelon Rogue 425 Series Grill Cover (Shelves Up) - 61427*  ·  *Napoleon Rogue 425 Series Grill Cover - 61427*

| Product ID | Price | Imgs | Updated | Handle |
|---|---|---|---|---|
| `2942` | $77.99 | 1 | 2026-08-10 | `napoleon-rogue-425-series-grill-cover-61428` |
| `2941` | $78.99 | 1 | 2026-06-30 | `napoleon-rogue-425-series-grill-cover-61427` |

#### SKU `BBQ-260-DRW3-PTH`

*PCM 260 Series 16 Inch Triple Access Drawer With Paper Towel Holder - BBQ-260-DRW3-PTH*  ·  *PCM 260 Series Triple Access Drawer with Paper Towel Holder - BBQ-260-DRW3-PTH*

| Product ID | Price | Imgs | Updated | Handle |
|---|---|---|---|---|
| `6474` | $639 | 4 | 2026-08-10 | `pcm-260-series-triple-access-drawer-with-paper` |
| `3038` | $829 | 6 | 2026-06-30 | `pcm-260-series-16-inch-triple-access-drawer-wi` |


**Recommendation for each:**

| SKU | Keep | Reason |
|---|---|---|
| `VH42-3-SP4` | *needs a decision* | `6615` ($629) and `6614` ($1,099) are identical in every other respect. Only you know which price is right. |
| `17468` | `6434` | `1830`'s handle literally begins `copy-of-` — a Shopify duplicate. `1737` has 2 images against 5. |
| `61286` | `2961` | Its handle renders `™` correctly; `2960` and `2959` are the same product with the symbol mangled to `y` and `-n-`. |
| `61427` | `2941` | `2942` is wrong twice over: title reads "Napoelon", and its handle ends `-61428` while its SKU is `61427`. |
| `BBQ-260-DRW3-PTH` | `3038` | 6 images against 4 — but check the price first, $829 vs $639 is a real gap. |

Keep one, then **301-redirect the others**. These are live URLs that may be
indexed or linked; a bare 404 throws away whatever authority they carry.

---

## 2. Same SKU, prices agree — 29 groups

Not urgent, but still two live pages competing for the same product: they split
click-through, and Google picks a canonical for you. Same fix — keep the richer
record, redirect the rest.

| SKU | Live copies | Price | Product IDs |
|---|---|---|---|
| `BSABF12N` | 3 | $695 | `3533`, `6425`, `1313` |
| `BSABW16N` | 3 | $1199 | `3534`, `6426`, `1316` |
| `BSAF12DN` | 3 | $389 | `3532`, `6424`, `1311` |
| `BSASL12` | 3 | $335 | `3485`, `6418`, `1312` |
| `BSASL16` | 3 | $355 | `3486`, `1315`, `6419` |
| `VH42-3-SP8` | 2 | $799 | `6624`, `6623` |
| `BH3030010` | 2 | $111 | `1598`, `1464` |
| `BH8080040` | 2 | $398 | `1626`, `6433` |
| `BSAD1722` | 2 | $265 | `3535`, `1410` |
| `BSAD2422` | 2 | $315 | `3536`, `1411` |
| `BSAD2622D` | 2 | $429 | `3439`, `1347` |
| `BSAD3422D` | 2 | $469 | `3440`, `1348` |
| `BSAD4222D` | 2 | $489 | `3441`, `1349` |
| `BSAW1826R` | 2 | $609 | `3443`, `1351` |
| `BSAW1826T` | 2 | $899 | `3543`, `1443` |
| `BSAW2022` | 2 | $529 | `3539`, `1415` |
| `BSAW2022D` | 2 | $559 | `3442`, `1350` |
| `BSAW3422SD` | 2 | $825 | `3537`, `1413` |
| `BSAW4222ST` | 2 | $999 | `3538`, `1414` |
| `C1524BE` | 2 | $701 | `2425`, `2413` |
| `C1524BL` | 2 | $701 | `2427`, `2414` |
| `C1524BR` | 2 | $701 | `2415`, `2424` |
| `RTR1A` | 2 | $149 | `6237`, `6203` |
| `S36TLP + S36CART` | 2 | $9539 | `3374`, `3304` |
| `S48RLP + S48CART` | 2 | $13898 | `3296`, `3295` |
| `STARBBQ-FPOGSR-S` | 2 | $190 | `6491`, `6599` |
| `STARBBQ-RSBBOX` | 2 | $135 | `6492`, `6600` |
| `X-RBF24TRIM36` | 2 | $204.99 | `2028`, `2018` |
| `X-RBF24TRIM40` | 2 | $215.19 | `2029`, `2023` |

---

## 3. Probably not duplicates — 14 groups

These share a **title** but carry **different SKUs**, and are usually real
products you sell separately. Deleting one removes stock.

| Products | SKUs | Title |
|---|---|---|
| 3 | `RVH48-SP8`, `RVH48BSP8`, `RVH48-SPT`, `RVH48-SP4` | RCS 8 x 48" Vent Hood Spacer - RVH48B-SP8 |
| 3 | `CARTCOV-QST36`, `GRILLCOV-QST36` | Summerset 36-in Quest Deluxe Freestanding Grill Cart C |
| 3 | `BLZ3PRO5PCKGLP`, `BLZ3PRO4PCKGLP.3`, `BLZ3PRO5PCKGNG` | Blaze Outdoor Standard Package Pro Lux 34-inch 3 burne |
| 3 | `CBB3-LP + BBQCCbuiltin + C`, `CBB4-LP + BBQCCbuiltin + C`, `CBF4DD-LP + BBQCCfreestand` | Whistler Standard Package 4 burner Built-in gas Grill  |
| 2 | `69009-OB.1`, `69009-OB` | Bull Steer NG (Open Box) |
| 2 | `GRILLCOV-GRID30`, `GRILLCOV-25D` | Summerset - 30" Deluxe Griddle Cover - GRILLCOV-GRID30 |
| 2 | `R525PK-1-OB`, `R525PK-1`, `R525PK-2` | Napoleon Rogue 525 Propane Gas Grill - R525PK-1 |
| 2 | `RST2632`, `RCB2` | RCS Stainless Smoker Tray,RJC26A,RJC32A,RJC32AL,RJC40A |
| 2 | `SEDSD3`, `SEDSD3-OB` | Sedona Professional Grilling System Triple Access Draw |
| 2 | `VDD2-OB`, `VDD2-OB-1` | Renaissance Cooking Systems Double Door, Large (Open B |
| 2 | `VDV2SCL`, `VDV2` | RCS Valiant Stainless Vertical Door-Large-Soft Close-L |
| 2 | `W2024BR`, `WD6024CO`, `WD6024CP` | Infratech W Series Single Element Electric Infrared He |
| 2 | `022-20-N-CB-LBC`, `022-20-N-CB-RBC` | American Fyre Designs 95 Inch Vented Free-Standing Out |
| 2 | `CBF4DD-NG + BBQCCfreestand`, `CBB4-NG + BBQCCbuiltin + C` | Whistler Standard Package 4 burner Built-in gas Grill  |

The recurring patterns are worth recognising:

- **`-LP` / `-NG`** — liquid propane and natural gas versions of one grill.
- **`-OB`** — open-box, legitimately cheaper (`SEDSD3` $499.99 vs `SEDSD3-OB` $299).
- **Burner counts** — `CBB3-LP` and `CBB4-LP` are 3- and 4-burner packages.
- **Chained groups** — A shares a SKU with B, B shares a title with C. The RCS
  vent-hood group is three genuinely different parts whose titles all end in the
  same model number.

The fix here is **clearer titles**, not deletion, so a shopper can tell them
apart without opening both.

---

## Separate finding: a live product priced at $0

`6049` — `napoleon-rogue-525-gas-grill-r525pk-1` — is published with a price of
**$0**. Unrelated to duplication, but it surfaced in the same pass and is worth
fixing before someone orders one.

---

## Where these came from

| Signal | Cause |
|---|---|
| `™` mangled three ways in handles and titles | Encoding mismatch on import — one product ingested as three |
| Handle beginning `copy-of-` | Duplicated in Shopify, never cleaned up |
| Handle number not matching the SKU (`-61428` vs `61427`) | Manual entry error |

The encoding one is the most valuable to fix: normalise `™` on ingest and that
whole class of duplicate stops appearing.

---

## Suggested order

1. **Decide the price** on the 5 groups in section 1.
2. **Merge and redirect** those 5, then work through the 29 in section 2.
3. **Fix `6049`'s $0 price.**
4. **Normalise `™` on import** so section 1 does not refill.
5. **Re-run** `/api/catalog/duplicates?published=true&limit=200` and confirm the
   group count falls.

---

## Caveats

- **Do not bulk-delete on shared SKU alone.** 14 of the 48 groups are different
  products, and the open-box and LP/NG pairs look identical to a script.
- **Redirect, don't delete, anything live.**
- **Use `&limit=200`.** The endpoint returns 25 groups per field by default and
  sets `truncated: true` when it has cut the list short.
- **Snapshot only** — the index as of 1 September 2026. Re-run if an import has
  since gone through.
