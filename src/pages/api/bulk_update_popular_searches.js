import { redis } from "../../app/lib/redis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { keywords, incrementBy = 50 } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        error: "keywords array required",
        example: {
          keywords: [
            "Bull Open Box",
            "Bull Built-In Grills",
            "Bull Freestanding Grills",
            "Bull Side Burners",
            "Bull Storage",
            "Bull Refrigeration",
            "Bull Accessories",
            "Blaze Open Box",
            "Blaze Built-In Grills",
            "Blaze Freestanding Grills",
            "Blaze Side Burners",
            "Blaze Storage",
            "Blaze Refrigeration",
            "Blaze Accessories",
            "Twin Eagles Open Box",
            "Twin Eagles Built-In Grills",
            "Twin Eagles Freestanding Grills",
            "Twin Eagles Side Burners",
            "Twin Eagles Storage",
            "Twin Eagles Refrigeration",
            "Twin Eagles Accessories",
            "Eloquence Open Box",
            "Eloquence Built-In Grills",
            "Eloquence Freestanding Grills",
            "Eloquence Side Burners",
            "Eloquence Storage",
            "Eloquence Refrigeration",
            "Eloquence Accessories",
          ],
          incrementBy: 50, // optional, default 50
        },
      });
    }

    const results = [];

    // Update each keyword's score
    for (const keyword of keywords) {
      const term = keyword.toLowerCase().trim();
      if (!term) continue;

      // Increment the score by the specified amount
      const newScore = await redis.zincrby(
        "popular:searches",
        incrementBy,
        term
      );
      results.push({ term, newScore: parseFloat(newScore) });
    }

    return res.status(200).json({
      success: true,
      updated: results.length,
      results,
    });
  } catch (err) {
    console.error("Error updating popular searches:", err);
    return res.status(500).json({ error: err.message });
  }
}
