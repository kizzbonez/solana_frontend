import {
  ES_INDEX,
  exclude_brands,
  exclude_collections,
} from "../../../../app/lib/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    query: { id },
  } = req;

  try {
    const url = `${process.env.NEXT_SOLANA_BACKEND_URL}/api/collections/collection-products/${id}`;
    const key = `Api-Key ${process.env.NEXT_SOLANA_COLLECTIONS_KEY}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Store-Domain": process.env.NEXT_PUBLIC_STORE_DOMAIN,
        Authorization: key,
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text(); // fallback
      return res
        .status(500)
        .json({ message: "Invalid JSON response", raw: text });
    }

    // fetch raw collection
    const raw_collection = await response.json();
    // return res.status(response.status).json(data);

    // fetch collection data
    const ESURL = process.env.NEXT_ES_URL;
    const ESShard = ES_INDEX;
    const ESApiKey = `apiKey ${process.env.NEXT_ES_API_KEY}`;

    const es_query = {
      query: {
        bool: {
          filter: [
            {
              terms: {
                "handle.keyword": raw_collection.map((item) => item?.handle),
              },
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
                "brand.keyword": exclude_brands, // Placeholder for actual array
              },
            },
            {
              terms: {
                "collections.name.keyword": exclude_collections, // Placeholder for actual array
              },
            },
          ],
        },
      },
    };
    const fetchConfig = {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: ESApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(es_query),
    };

    try {
      const response = await fetch(`${ESURL}/${ESShard}/_search`, fetchConfig);
      const data = await response.json();
      // res.status(200).json({query: es_query, data:data}); for dev check
      res.status(200).json(data?.hits?.hits?.map((item) => item?._source));
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch products", error: error.message });
    }
  } catch (error) {
    console.error("Proxy Error:", error);
    return res
      .status(500)
      .json({ message: "Proxy request failed", error: error.message });
  }
}
