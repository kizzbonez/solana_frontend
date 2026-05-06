export default async function handler(req, res) {
  // 1. Enforce GET method
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { product_id, page = 1 } = req.query;

  // 2. Validate Required Parameters
  if (!product_id) {
    return res.status(400).json({ message: 'product_id is required' });
  }

  try {
    // 3. Construct URL with SearchParams (handles encoding automatically)
    const queryParams = new URLSearchParams({ product_id, page });
    const targetUrl = `${process.env.NEXT_SOLANA_BACKEND_URL}/api/reviews/list?${queryParams}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Store-Domain": process.env.NEXT_PUBLIC_STORE_DOMAIN,
      },
    });

    // 4. Handle Non-JSON or Error Responses
    const contentType = response.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      const errorText = await response.text();
      return res.status(response.status || 500).json({ 
        message: 'Upstream did not return JSON', 
        raw: errorText 
      });
    }

    const data = await response.json();
    
    // 5. Return upstream status and data
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ 
      message: 'Internal Proxy Error', 
      error: error.message 
    });
  }
}