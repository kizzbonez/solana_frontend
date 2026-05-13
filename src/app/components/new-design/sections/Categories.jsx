"use client";
import { useState, useEffect } from "react";
import { useReveal } from "@/app/hooks/useReveal";
import { useSolanaCategories } from "@/app/context/category";
import { ArrowIcon } from "@/app/components/new-design/ui/Icons";
import Image from "next/image";
import Link from "next/link";

const INITIAL_COUNT = 4;

function CategoryCard({ name, description, slug, image, index }) {
  const ref = useReveal();
  return (
    <Link href={slug ? `/category/${slug}` : "#"} aria-label={name} title={name} prefetch={false}>
      <article
        ref={ref}
        className="
          opacity-0 translate-y-6 transition-all duration-700
          rounded-2xl overflow-hidden bg-white dark:bg-stone-900
          shadow-[0_4px_24px_rgba(0,0,0,.10)] dark:shadow-[0_4px_24px_rgba(0,0,0,.4)]
          hover:shadow-[0_12px_48px_rgba(0,0,0,.20)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,.6)]
          hover:-translate-y-1.5 cursor-pointer group
          border border-transparent dark:border-stone-800
        "
      >
        <div className="relative h-36 sm:h-60 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) calc(50vw - 2rem), calc(33vw - 2rem)"
            className="object-cover transition-transform duration-500 hover:scale-105"
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

export default function Categories() {
  const { categories } = useSolanaCategories();
  const hdrRef = useReveal();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Desktop: auto-expand without requiring button click
    if (window.innerWidth >= 640) setShowAll(true);
  }, []);

  const visible = showAll ? categories : categories.slice(0, INITIAL_COUNT);
  const remaining = categories.length - INITIAL_COUNT;

  return (
    <section id="categories" className="py-20 md:py-24 bg-white dark:bg-stone-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          ref={hdrRef}
          className="opacity-0 translate-y-6 transition-all duration-700 text-center mb-12"
        >
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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((c, i) => (
            <CategoryCard key={c.slug} {...c} index={i} />
          ))}
        </div>

        {/* Show All button — mobile only, disappears once expanded */}
        {!showAll && remaining > 0 && (
          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-fire text-fire font-semibold text-sm hover:bg-fire hover:text-white transition-all duration-200"
            >
              Show All Categories ({remaining} more)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
