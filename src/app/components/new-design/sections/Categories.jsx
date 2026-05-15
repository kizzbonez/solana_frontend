import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { fetchUniqueCategories } from "@/app/lib/fn_server";
import { ArrowIcon } from "@/app/components/new-design/ui/Icons";
import CategoriesGrid from "./CategoriesGrid";

// Same key + tags as the layout's getCachedCategories → shares the same cache entry.
// Only one fetchUniqueCategories() call happens per cache period regardless of
// how many server components request it.
const getCategoriesCache = unstable_cache(
  () => fetchUniqueCategories(),
  ["layout-categories"],
  { revalidate: 86400, tags: ["layout-data"] },
);

function CategoryCard({ name, description, slug, image, index }) {
  return (
    <Link href={slug ? `/category/${slug}` : "#"} aria-label={name} title={name} prefetch={false}>
      <article
        className="
          rounded-2xl overflow-hidden bg-white dark:bg-stone-900
          shadow-[0_4px_24px_rgba(0,0,0,.10)] dark:shadow-[0_4px_24px_rgba(0,0,0,.4)]
          hover:shadow-[0_12px_48px_rgba(0,0,0,.20)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,.6)]
          hover:-translate-y-1.5 cursor-pointer group
          border border-transparent dark:border-stone-800
          transition-all duration-300
        "
      >
        <div className="relative h-36 sm:h-60 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) calc(50vw - 2rem), calc(33vw - 2rem)"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            quality={40}
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-lg">
              {name}
            </h3>
          </div>
        </div>
        <div className="p-4 pb-5 bg-white dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-fire group-hover:gap-2.5 transition-all duration-200">
            Shop {name} <ArrowIcon />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function Categories() {
  const categories = await getCategoriesCache();

  return (
    <section id="categories" className="py-20 md:py-24 bg-white dark:bg-stone-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[.15em] uppercase font-semibold text-fire mb-2.5">
            Browse by Category
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal dark:text-white mb-3 leading-tight">
            Everything You Need to Create Your Perfect Space
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-base max-w-lg mx-auto leading-relaxed">
            From cozy indoor fireplaces to expansive outdoor setups — shop our
            full collection.
          </p>
        </div>

        <CategoriesGrid total={categories.length}>
          {categories.map((c, i) => (
            <CategoryCard key={c.slug} {...c} index={i} />
          ))}
        </CategoriesGrid>

      </div>
    </section>
  );
}
