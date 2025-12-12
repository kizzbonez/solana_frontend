import { redis } from "../../app/lib/redis";

export default async function handler(req, res) {
  const { query, limit: limitParam } = req.query;
  const limit = parseInt(limitParam) || 10;
  const maxFetch = 100; // Maximum results to fetch from Redis

  // Fetch more results to filter from
  const fetchLimit = Math.max(limit, query ? maxFetch : limit) - 1;
  const results = await redis.zrange("popular:searches", 0, fetchLimit, {
    withScores: true,
    rev: true, // Get highest scores first
  });

  // Convert from array format to objects
  const formatted = [];
  for (let i = 0; i < results.length; i += 2) {
    formatted.push({
      term: results[i],
      score: parseInt(results[i + 1]),
    });
  }

  // Filter by query if provided
  let filtered = formatted;
  if (query && query.trim()) {
    const searchQuery = query.toLowerCase().trim();
    filtered = formatted.filter((item) =>
      item.term.toLowerCase().includes(searchQuery)
    );
  }

  // Return top results (limited by limit parameter)
  const finalResults = filtered.slice(0, limit);

  console.log("popular", {
    query,
    limit,
    count: finalResults.length,
    results: finalResults,
  });
  res.status(200).json(finalResults);
}
