"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { STORE_CONTACT } from "@/app/lib/store_constants";
import { useMenuEditor } from "../MenuEditorContext";
import SelectField from "../SelectField";
import { Divider, Field, Section, Toggle, inputClass } from "../ui";

/**
 * Grouped only for scanning in the dropdown — the stored value is still
 * `label.replaceAll(" ", "-").toLowerCase()`, unchanged from the pill version.
 */
const FILTER_TYPE_GROUPS = [
  {
    group: "Grills",
    items: [
      "Grills",
      "Built-In-Grills",
      "Built-In-Grills-x-Brands",
      "Freestanding-Grills",
      "Freestanding-Grills-x-Brands",
    ],
  },
  {
    group: "Fireplaces",
    items: [
      "Fireplaces",
      "Gas-Fireplaces",
      "Electric-Fireplaces",
      "Shop-All-Fireplaces",
    ],
  },
  { group: "Firepits", items: ["Firepits"] },
  {
    group: "Patio Heaters",
    items: ["Patio-Heaters", "Gas-Patio-Heaters", "Electric-Patio-Heaters"],
  },
  {
    group: "Refrigeration",
    items: [
      "Refrigerators",
      "Compact-Refrigerators",
      "Outdoor-Beverage-Refrigerators",
      "Outdoor-Ice-Makers",
      "Outdoor-Wine-Coolers",
      "Outdoor-Kegerators",
      "Outdoor-Compact-Freezers",
    ],
  },
  {
    group: "Storage",
    items: [
      "Storage",
      "Access-Doors",
      "Storage-Drawers",
      "Door-and-Drawer-Combos",
      "Storage-Pantries",
      "Trash-Bins",
      "Ice-Bins-and-Storage",
      "Propane-Tank-Bins",
      "Paper-Towel-Bins",
      "Warming-Drawers",
      "Spice-Racks",
    ],
  },
  { group: "Other", items: ["Open-box"] },
];

const FILTER_TYPE_OPTIONS = FILTER_TYPE_GROUPS.flatMap(({ group, items }) =>
  items.map((label) => ({
    group,
    label,
    value: label.replaceAll(" ", "-").toLowerCase(),
  })),
);

const imageSlug = (img_string) =>
  img_string.replace("/images/feature/", "").replace(".", "-");

export default function Settings() {
  const { menuItem, feature_images, handleSettingsChange } = useMenuEditor();
  const [collectionList, setCollectionList] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("initial");

  useEffect(() => {
    let cancelled = false;

    const fetchCollectionList = async () => {
      try {
        setFetchStatus("fetching");
        const response = await fetch("/api/collections/collection-list");
        if (!response?.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (cancelled) return;
        setCollectionList(data);
        setFetchStatus("success");
      } catch (error) {
        if (cancelled) return;
        setFetchStatus("error");
        console.error("Failed to fetch collection list:", error);
      }
    };

    fetchCollectionList();
    return () => {
      cancelled = true;
    };
  }, []);

  const collectionOptions = useMemo(
    () =>
      (collectionList || []).map((item) => ({
        value: String(item?.id),
        label: item?.name,
        raw: item,
      })),
    [collectionList],
  );

  const selectedCollection = useMemo(
    () =>
      collectionOptions.find(
        (o) => o.raw?.id === menuItem?.collection_display?.id,
      ) ?? null,
    [collectionOptions, menuItem],
  );

  const selectedFilterType = useMemo(
    () =>
      FILTER_TYPE_OPTIONS.find((o) => o.value === menuItem?.filter_type) ?? null,
    [menuItem],
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title="Navigation">
        <Toggle
          label="Show in navigation"
          name="nav-visibility"
          id="nav-visibility"
          // Absent means visible. Every item predates this toggle, so treating
          // a missing value as "hidden" would empty the nav the moment this
          // shipped — only an explicit false hides anything.
          checked={menuItem?.nav_visibility !== false}
          onChange={handleSettingsChange}
          hint="Turn off to hide this item from the storefront menu. The page itself stays reachable by URL — this controls the menu only. Remember the menu is shared by all three brands, so hiding an item hides it everywhere."
        />
      </Section>

      <Divider />

      <Section title="Pricing">
        <Toggle
          label="Price visible"
          name="price-visibility"
          id="price-visibility"
          checked={menuItem?.price_visibility === "show" || false}
          disabled={menuItem?.nav_type !== "brand"}
          onChange={handleSettingsChange}
          hint='Only available when the menu item&apos;s navigation type is "brand".'
        />
      </Section>

      <Divider />

      <Section
        title="Feature image"
        description="Need another image? Send it to the developer and it will appear here once uploaded."
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full max-w-[280px] shrink-0">
            <div className="relative aspect-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-900">
              {menuItem?.feature_image ? (
                <Image
                  src={menuItem.feature_image}
                  alt={imageSlug(menuItem.feature_image)}
                  fill
                  className="object-contain"
                  sizes="280px"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
                  <ImageOff
                    className="h-6 w-6 text-zinc-300 dark:text-zinc-600"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    No feature image set for this item
                  </span>
                </div>
              )}
            </div>
            <p className="mt-2 break-all font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              {menuItem?.feature_image || "feature_image: (not set)"}
            </p>
          </div>

          <div className="max-h-[300px] flex-1 overflow-y-auto rounded-xl border border-zinc-200 p-3 dark:border-white/10">
            <div className="flex flex-wrap gap-2.5">
              {Array.isArray(feature_images) &&
                feature_images.map((fimg) => {
                  const selected = fimg === menuItem?.feature_image;
                  return (
                    <button
                      type="button"
                      key={`image-wrap-${imageSlug(fimg)}`}
                      title={imageSlug(fimg)}
                      aria-pressed={selected}
                      onClick={() =>
                        handleSettingsChange({
                          target: { name: "feature-image", value: fimg },
                        })
                      }
                      className={`relative aspect-1 w-[86px] overflow-hidden rounded-lg border-2 bg-zinc-100 transition-colors dark:bg-zinc-800 ${
                        selected
                          ? "border-indigo-500 ring-2 ring-indigo-500/30"
                          : "border-transparent hover:border-zinc-300 dark:hover:border-white/20"
                      }`}
                    >
                      <Image
                        src={fimg}
                        alt={imageSlug(fimg)}
                        fill
                        className="object-contain"
                        sizes="86px"
                      />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      <Section title="Product display">
        <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
          <Field
            label="Collection"
            htmlFor="collection-display"
            hint={
              fetchStatus === "error"
                ? "Couldn't load collections — reload to try again."
                : menuItem?.collection_display
                  ? `Stored: ${menuItem.collection_display.name} (id ${menuItem.collection_display.id})`
                  : "collection_display: (not set)"
            }
          >
            <SelectField
              id="collection-display"
              options={collectionOptions}
              value={selectedCollection}
              disabled={fetchStatus !== "success"}
              placeholder={
                fetchStatus === "fetching" ? "Loading…" : "Search collections…"
              }
              onChange={(option) =>
                handleSettingsChange({
                  target: {
                    name: "collection-display",
                    value: option?.raw ?? null,
                  },
                })
              }
            />
          </Field>

          <Field
            label="Filter type"
            htmlFor="filter-type"
            hint="The filter applied to the product grid."
          >
            <SelectField
              id="filter-type"
              options={FILTER_TYPE_OPTIONS}
              value={selectedFilterType}
              placeholder="Search filter types…"
              onChange={(option) =>
                handleSettingsChange({
                  target: { name: "filter-type", value: option?.value ?? "" },
                })
              }
            />
          </Field>
        </div>
      </Section>

      <Divider />

      <Section title="Contact">
        <div className="max-w-xs">
          <Field
            label="Contact Number"
            htmlFor="contact-number"
            hint={`Leaving this blank applies ${STORE_CONTACT}.`}
          >
            <input
              type="text"
              name="contact-number"
              id="contact-number"
              value={menuItem?.contact_number || ""}
              onChange={handleSettingsChange}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}
