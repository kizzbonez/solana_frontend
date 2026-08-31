"use client";
import { useState, useEffect } from "react";
import { formatProduct } from "@/app/lib/helpers";
import ProductGrid from "@/app/components/oko-design/sections/sp/ProductGrid";

export default function YouMayAlsoLike({ displayItems = 4 }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const query = {
          size: displayItems,
          query: {
            function_score: {
              query: {
                bool: {
                  must: [{ match_all: {} }, { term: { published: true } }],
                },
              },
              random_score: { seed: Date.now(), field: "title.keyword" },
            },
          },
        };
        const res = await fetch("/api/es/shopify/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });
        if (!res.ok) return;
        const data = await res.json();
        setProducts(
          data?.hits?.hits?.map(({ _source }) => ({ ...formatProduct(_source, "card"), quantity: 1 }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchRandomProducts();
  }, []);

  return <ProductGrid eyebrow="More to consider" title="You may also like" items={products} />;
}
