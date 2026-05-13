import cat_json from "../data/categoryv5.json"; // solana cherry picked in menu v2

export const solana_categories = cat_json.map((i) => ({
  ...i,
  children: i.links.flatMap((i2) => i2),
}));

export const solana_brands = cat_json.map((i) => ({
  ...i,
  children: i.links.flatMap((i2) => i2),
})).find(i=> i.name==="Brands").children;

export const main_categories = cat_json
  // .filter((i) => i.menu.visible)
  .map((i) => ({
    ...i,
    url: i.menu.href,
    children: i.links.flatMap((i) => i),
  }));

export const bc_categories = [];

export const main_cat_array = main_categories.map((i) => i.menu.href);

export const sub_categories = cat_json
  .flatMap((i) => i.links)
  .flatMap((i) => i);
export const child_categories = sub_categories.flatMap((i) => i.children);

export const flatCategories = [
  ...main_categories,
  ...sub_categories,
  ...child_categories,
];
