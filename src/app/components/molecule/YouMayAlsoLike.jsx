import { useState, useEffect } from "react";
import ProductCard from "@/app/components/atom/ProductCard";
import ProductCardLoader from "@/app/components/atom/ProductCardLoader";
import {
  exclude_brands,
  exclude_collections,
  formatProduct,
} from "@/app/lib/helpers";
import ProductGrid from "@/app/components/new-design/sections/sp/ProductGrid";

export default function YouMayAlsoLike({ displayItems }) {
  const [products, setProducts] = useState([]);

  const makeArray = (n) => {
    return Array.from({ length: n }, (_, i) => i);
  };

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const seed = Date.now();
        const query = {
          size: 4,
          query: {
            function_score: {
              query: {
                bool: {
                  must: [
                    {
                      match_all: {},
                    },
                    {
                      term: {
                        published: true,
                      },
                    },
                  ],
                  must_not: [
                    {
                      terms: {
                        "brand.keyword": exclude_brands,
                      },
                    },
                    {
                      terms: {
                        "collections.name.keyword": exclude_collections,
                      },
                    },
                  ],
                },
              },
              random_score: {
                seed: seed,
                field: "title.keyword",
              },
            },
          },
        };
        const res = await fetch("/api/es/shopify/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });

        // console.log("[YMAL req.res]", res);

        if (!res.ok) {
          setProducts([]);
          throw new Error(`[SHOPIFY SEARCH] Failed`);
        }

        const data = await res.json();

        // console.log("[YMAL DATA]", data);
        const formatted_data = data?.hits?.hits?.map(({ _source }) =>
          formatProduct(_source, "card"),
        );
        // console.log("[YMAL formatted_data]", formatted_data);
        setProducts(formatted_data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRandomProducts();
  }, []);

  return (
    <div className="xl:mt-8">
      <ProductGrid
        title="You May Also Like"
        items={products}
      />
    </div>
  );
}
