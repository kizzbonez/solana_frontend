"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSolanaCategories } from "@/app/context/category";
import { keys, redisGet, redisSet } from "@/app/lib/redis";
import { updateMenuItemById, updateOrderValues } from "@/app/lib/helpers";

// const defaultMenuKey = keys.default_shopify_menu.value;
const defaultMenuKey = keys.dev_shopify_menu.value;

const MenuEditorContext = createContext(null);

export function useMenuEditor() {
  const ctx = useContext(MenuEditorContext);
  if (!ctx) {
    throw new Error("useMenuEditor must be used inside <MenuEditorProvider>");
  }
  return ctx;
}

/**
 * Holds the draft menu item for the whole editor.
 *
 * This lives in the [menu_id] layout so the draft survives tab navigation -
 * App Router keeps layouts mounted while child routes change, so switching
 * tabs by URL does not discard unsaved edits.
 */
export function MenuEditorProvider({
  menu_id,
  images,
  feature_images,
  children,
}) {
  const { flatCategories } = useSolanaCategories();

  const [menuItem, setMenuItem] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null); // { type, message }

  useEffect(() => {
    if (!Array.isArray(flatCategories) || !menu_id) return;
    const item = flatCategories.find((i) => i?.menu_id === menu_id);
    setMenuItem(item ?? null);
    setStatus(item ? "ready" : "missing");
    setDirty(false);
  }, [flatCategories, menu_id]);

  // Warn before losing unsaved edits - easy to hit now that tabs are URLs.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  /** Every mutation goes through here so `dirty` can't drift out of sync. */
  const patchMenuItem = useCallback((updater) => {
    setMenuItem((prev) => (typeof updater === "function" ? updater(prev) : { ...prev, ...updater }));
    setDirty(true);
  }, []);

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const handleMetaChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      patchMenuItem((prev) => ({
        ...prev,
        ...(name === "meta-title" && { meta_title: value }),
        ...(name === "meta-description" && { meta_description: value }),
      }));
    },
    [patchMenuItem],
  );

  const handleHeroChange = useCallback(
    (e) => {
      const { name, value, checked } = e.target;

      if (name === "main-text") {
        patchMenuItem((prev) => ({
          ...prev,
          banner: { ...prev?.banner, title: value },
        }));
      }

      if (name === "sub-text") {
        patchMenuItem((prev) => ({
          ...prev,
          banner: { ...prev?.banner, tag_line: value },
        }));
      }

      if (name === "notice-visible") {
        patchMenuItem((prev) => ({
          ...prev,
          banner: { ...prev?.banner, notice_visible: checked },
        }));
      }

      if (name === "notice-html") {
        patchMenuItem((prev) => ({
          ...prev,
          banner: { ...prev?.banner, notice_html: value },
        }));
      }

      if (name === "banner-image") {
        patchMenuItem((prev) => ({
          ...prev,
          banner: { ...prev?.banner, img: { src: value, alt: "Banner Image" } },
        }));
      }
    },
    [patchMenuItem],
  );

  const handleFAQChange = useCallback(
    (faqs) => patchMenuItem((prev) => ({ ...prev, faqs })),
    [patchMenuItem],
  );

  const handleSettingsChange = useCallback(
    (e) => {
      const { name, checked, value } = e.target;

      if (name === "contact-number") {
        patchMenuItem((prev) => ({ ...prev, contact_number: value }));
      }

      if (name === "nav-visibility") {
        // Stored as a real boolean, not "show"/"hide" like price_visibility
        // below. The existing menu data already uses `nav_visibility: true`,
        // and matching what is in Redis matters more here than matching the
        // field next to it.
        patchMenuItem((prev) => ({ ...prev, nav_visibility: checked }));
      }

      if (name === "price-visibility") {
        patchMenuItem((prev) => ({
          ...prev,
          price_visibility: checked ? "show" : "hide",
        }));
      }

      if (name === "feature-image") {
        patchMenuItem((prev) => ({ ...prev, feature_image: value }));
      }

      if (name === "collection-display") {
        patchMenuItem((prev) => ({ ...prev, collection_display: value }));
      }

      if (name === "filter-type") {
        patchMenuItem((prev) => ({ ...prev, filter_type: value }));
      }
    },
    [patchMenuItem],
  );

  const handleFeatNavChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "feat-nav") {
        patchMenuItem((prev) => ({ ...prev, feat_nav: value }));
      }
    },
    [patchMenuItem],
  );

  const handleProductCollectionChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === "add-collection-item") {
        patchMenuItem((prev) => ({
          ...prev,
          collections: updateOrderValues([...(prev?.collections || []), value]),
        }));
      }

      if (name === "remove-collection-item") {
        patchMenuItem((prev) => ({
          ...prev,
          collections: updateOrderValues(
            (prev?.collections || []).filter(
              ({ mb_uid }) => mb_uid !== value?.mb_uid,
            ),
          ),
        }));
      }

      if (name === "update-collection-label") {
        patchMenuItem((prev) => ({
          ...prev,
          collections: (prev?.collections || []).map((c) =>
            c?.mb_uid === value?.mb_uid ? value : c,
          ),
        }));
      }

      if (name === "reorder-collections") {
        patchMenuItem((prev) => ({
          ...prev,
          collections: updateOrderValues(value),
        }));
      }
    },
    [patchMenuItem],
  );

  const handleCategoryCollectionChange = useCallback(
    (e) => {
      const { name, value, id } = e.target;

      if (name === "add-category-collection") {
        patchMenuItem((prev) => ({
          ...prev,
          cat_collections: [...(prev?.cat_collections || []), value],
        }));
      }

      if (name === "collection-label-change") {
        patchMenuItem((prev) => ({
          ...prev,
          cat_collections: (prev?.cat_collections || []).map((i) => ({
            ...i,
            label: i?.id === id ? value : i?.label,
          })),
        }));
      }

      if (name === "remove-collection") {
        patchMenuItem((prev) => ({
          ...prev,
          cat_collections: (prev?.cat_collections || []).filter(
            (i) => i?.id !== value,
          ),
        }));
      }

      if (name === "reorder-collections") {
        patchMenuItem((prev) => ({ ...prev, cat_collections: value }));
      }
    },
    [patchMenuItem],
  );

  const save = useCallback(async () => {
    if (!menuItem) return;
    setIsSaving(true);
    try {
      // Re-read first so we merge into the latest stored tree, not a stale copy.
      const data = await redisGet(defaultMenuKey);
      const updated = updateMenuItemById(data, menuItem?.menu_id, menuItem);
      const response = await redisSet(defaultMenuKey, updated);
      if (response?.success) {
        setDirty(false);
        showAlert("success", "Menu object updated successfully.");
      } else {
        showAlert("error", "Failed to update. Please try again.");
      }
    } catch (error) {
      showAlert("error", "Failed to update. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [menuItem, showAlert]);

  const value = useMemo(
    () => ({
      menu_id,
      menuItem,
      status,
      dirty,
      isSaving,
      alert,
      images,
      feature_images,
      flatCategories,
      save,
      handleMetaChange,
      handleHeroChange,
      handleFAQChange,
      handleSettingsChange,
      handleFeatNavChange,
      handleProductCollectionChange,
      handleCategoryCollectionChange,
    }),
    [
      menu_id,
      menuItem,
      status,
      dirty,
      isSaving,
      alert,
      images,
      feature_images,
      flatCategories,
      save,
      handleMetaChange,
      handleHeroChange,
      handleFAQChange,
      handleSettingsChange,
      handleFeatNavChange,
      handleProductCollectionChange,
      handleCategoryCollectionChange,
    ],
  );

  return (
    <MenuEditorContext.Provider value={value}>
      {children}
    </MenuEditorContext.Provider>
  );
}
