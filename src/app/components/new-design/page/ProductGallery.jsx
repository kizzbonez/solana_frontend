// PRIMARILY USED IN /[slug] page
import React from "react";
import HeroBanner from "@/app/components/new-design/sections/gallery/HeroBanner";
import SubcategoryTabs from "@/app/components/new-design/sections/gallery/SubcategoryTabs";
// import PerfComparisonLayout from "@/app/components/dev/PerfComparisonLayout";
import ProductsSectionV2 from "@/app/components/molecule/ProductsSectionV2";

function ProductGallery({ config, slug, filterType, initialFilterString, initialHits }) {
  return (
    <main>
      <HeroBanner config={config} />
      {config?.root?.url !== "brands" && (
        <SubcategoryTabs subs={config?.subs} />
      )}
      <ProductsSectionV2
        category={slug}
        filterType={filterType}
        initialFilterString={initialFilterString}
        initialHits={initialHits}
      />
    </main>
  );
}

export default ProductGallery;
