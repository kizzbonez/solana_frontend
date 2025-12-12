// Run this script with: node scripts/boost-popular-searches.js

const keywords = [
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
];

async function boostSearches() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL || 'http://localhost:3000';

  console.log('🚀 Boosting popular searches...');
  console.log(`📊 Keywords to boost: ${keywords.length}`);

  try {
    const response = await fetch(`${BASE_URL}/api/bulk_update_popular_searches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: keywords,
        incrementBy: 100, // Change this to adjust the score boost
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Successfully updated ${data.updated} keywords!`);
      console.log('\n📈 Top 5 results:');
      data.results.slice(0, 5).forEach((item, i) => {
        console.log(`   ${i + 1}. "${item.term}" - Score: ${item.newScore}`);
      });
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

boostSearches();
