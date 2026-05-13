"use client";
import SubcategoryTabsDropdown from "./SubcategoryTabsDropdown";

function SubcategoryTabs({ subs }) {
  return (
    <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 sticky top-[64px] md:top-[105px] z-10 min-h-[50px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SubcategoryTabsDropdown subs={subs} />
      </div>
    </div>
  );
}

export default SubcategoryTabs;
