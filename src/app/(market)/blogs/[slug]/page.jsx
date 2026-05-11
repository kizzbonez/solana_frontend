const DEFAULT_URL = "https://bbq-blog.onsitestorage.com";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const DEFAULT_BLOG_IMAGE = `https://bbq-spaces.sfo3.digitaloceanspaces.com/uploads/blog-default.png`;

  const res = await fetch(
    `${DEFAULT_URL}/index.php?rest_route=/wp/v2/posts&slug=${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return { title: "Blog Not Found" };

  const posts = await res.json();
  const post = posts[0] || {};

  return {
    title: post.yoast_head_json?.title || post.title?.rendered || "Blog Post",
    description:
      post.yoast_head_json?.description ||
      post.excerpt?.rendered?.replace(/<[^>]*>?/gm, "").substring(0, 150),
    openGraph: {
      title: post.yoast_head_json?.og_title || post.title?.rendered || "Blog Post",
      description:
        post.yoast_head_json?.og_description ||
        post.excerpt?.rendered?.replace(/<[^>]*>?/gm, "").substring(0, 150),
      images: [post.yoast_head_json?.og_image?.[0]?.url || DEFAULT_BLOG_IMAGE],
      url: `${DEFAULT_URL}/blogs/${post.slug}`,
    },
    twitter: {
      title: post.yoast_head_json?.twitter_title || post.title?.rendered || "Blog Post",
      description:
        post.yoast_head_json?.twitter_description ||
        post.excerpt?.rendered?.replace(/<[^>]*>?/gm, "").substring(0, 150),
      images: [post.yoast_head_json?.twitter_image || DEFAULT_BLOG_IMAGE],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const CATEGORY_ID = 2;
  const PER_PAGE = 5;
  const DEFAULT_BLOG_IMAGE = `${DEFAULT_URL}/wp-content/uploads/2025/03/blog-default.png`;

  const res = await fetch(
    `${DEFAULT_URL}/index.php?rest_route=/wp/v2/posts&slug=${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return <p className="text-red-500 p-8">Post not found.</p>;

  const posts = await res.json();
  const post = posts[0];

  if (!post) return <p className="text-gray-500 p-8">No content available.</p>;

  let featuredImage = DEFAULT_BLOG_IMAGE;
  if (post.featured_media !== 0) {
    const mediaRes = await fetch(
      `${DEFAULT_URL}/wp-json/wp/v2/media/${post.featured_media}`
    );
    if (mediaRes.ok) {
      const media = await mediaRes.json();
      featuredImage = media.source_url || DEFAULT_BLOG_IMAGE;
    }
  }

  const otherPostsRes = await fetch(
    `${DEFAULT_URL}/index.php?rest_route=/wp/v2/posts&categories=${CATEGORY_ID}&per_page=${PER_PAGE}`,
    { cache: "no-store" }
  );

  let otherPosts = await otherPostsRes.json();
  otherPosts = otherPosts.filter((p) => p.id !== post.id);

  const otherPostsWithImages = await Promise.all(
    otherPosts.map(async (otherPost) => {
      let imageUrl = DEFAULT_BLOG_IMAGE;
      if (otherPost.featured_media !== 0) {
        const mediaRes = await fetch(
          `${DEFAULT_URL}/wp-json/wp/v2/media/${otherPost.featured_media}`
        );
        if (mediaRes.ok) {
          const media = await mediaRes.json();
          imageUrl = media.source_url || DEFAULT_BLOG_IMAGE;
        }
      }
      return { ...otherPost, imageUrl };
    })
  );

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-10 md:py-14 antialiased">
      <div className="mx-auto max-w-screen-lg px-4 2xl:px-0">
        <a
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-theme-600 hover:text-theme-700 transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Blogs
        </a>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <article className="md:w-2/3">
            <img
              src={featuredImage}
              alt={post.title.rendered}
              className="w-full rounded-2xl mb-6 shadow-sm object-cover"
            />
            <div className="mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-theme-600">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-6">
              {post.title.rendered}
            </h1>
            <div
              className="prose prose-sm sm:prose max-w-none text-gray-700 dark:text-gray-300 pdp-description-wrapper"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </article>

          {/* Sidebar */}
          <aside className="md:w-1/3">
            <div className="sticky top-[140px]">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-theme-500">
                More Articles
              </h2>
              {otherPostsWithImages.length > 0 ? (
                <div className="space-y-4">
                  {otherPostsWithImages.map((otherPost) => (
                    <div
                      key={otherPost.id}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-sm transition-shadow"
                    >
                      <a href={`/blogs/${otherPost.slug}`} className="block overflow-hidden">
                        <img
                          src={otherPost.imageUrl}
                          alt={otherPost.title.rendered}
                          className="w-full h-36 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </a>
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                          <a
                            href={`/blogs/${otherPost.slug}`}
                            className="hover:text-theme-600 transition-colors line-clamp-2"
                          >
                            {otherPost.title.rendered}
                          </a>
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                          {otherPost.excerpt.rendered
                            .replace(/<[^>]*>?/gm, "")
                            .substring(0, 100)}
                          ...
                        </p>
                        <a
                          href={`/blogs/${otherPost.slug}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-theme-600 hover:text-theme-700 transition-colors"
                        >
                          Read more
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No other posts available.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
