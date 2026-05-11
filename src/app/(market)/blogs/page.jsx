const DEFAULT_URL = "https://bbq-blog.onsitestorage.com";
import "@/app/search.css";
import he from "he";
import Link from "next/link";

const Paginator = ({ current_page = 1, total_pages = 1 }) => {
  const cur = parseInt(current_page);
  const total = parseInt(total_pages);
  const isFirst = cur <= 1;
  const isLast = cur >= total;

  return (
    <div className="ais-Pagination">
      <ul className="ais-Pagination-list">
        <li className={`ais-Pagination-item ais-Pagination-item--firstPage${isFirst ? " ais-Pagination-item--disabled" : ""}`}>
          {isFirst ? (
            <span className="ais-Pagination-link" aria-label="First Page">‹‹</span>
          ) : (
            <Link prefetch={false} href={`/blogs?page=1`} className="ais-Pagination-link" aria-label="First Page">‹‹</Link>
          )}
        </li>
        <li className={`ais-Pagination-item ais-Pagination-item--previousPage${isFirst ? " ais-Pagination-item--disabled" : ""}`}>
          {isFirst ? (
            <span className="ais-Pagination-link" aria-label="Previous Page">‹</span>
          ) : (
            <Link prefetch={false} href={`/blogs?page=${cur - 1}`} className="ais-Pagination-link" aria-label="Previous Page">‹</Link>
          )}
        </li>
        {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
          <li key={page} className={`ais-Pagination-item ais-Pagination-item--page${cur === page ? " ais-Pagination-item--selected" : ""}`}>
            <Link prefetch={false} href={`/blogs?page=${page}`} className="ais-Pagination-link" aria-label={`Page ${page}`}>{page}</Link>
          </li>
        ))}
        <li className={`ais-Pagination-item ais-Pagination-item--nextPage${isLast ? " ais-Pagination-item--disabled" : ""}`}>
          {isLast ? (
            <span className="ais-Pagination-link" aria-label="Next Page">›</span>
          ) : (
            <Link prefetch={false} href={`/blogs?page=${cur + 1}`} className="ais-Pagination-link" aria-label="Next Page">›</Link>
          )}
        </li>
        <li className={`ais-Pagination-item ais-Pagination-item--lastPage${isLast ? " ais-Pagination-item--disabled" : ""}`}>
          {isLast ? (
            <span className="ais-Pagination-link" aria-label="Last Page">››</span>
          ) : (
            <Link prefetch={false} href={`/blogs?page=${total}`} className="ais-Pagination-link" aria-label="Last Page">››</Link>
          )}
        </li>
      </ul>
    </div>
  );
};

export async function generateMetadata() {
  const CATEGORY_ID = 2;
  const DEFAULT_BLOG_IMAGE = `https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/uploads/blog-default.png`;

  const res = await fetch(
    `${DEFAULT_URL}/index.php?rest_route=/wp/v2/posts&categories=${CATEGORY_ID}&per_page=1`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      title: "Latest Blog Posts",
      description: "Read the latest blogs about Solana.",
      openGraph: {
        title: "Latest Blog Posts",
        description: "Read the latest blogs about Solana.",
        images: [DEFAULT_BLOG_IMAGE],
      },
      twitter: {
        title: "Latest Blog Posts",
        description: "Read the latest blogs about Solana.",
        images: [DEFAULT_BLOG_IMAGE],
      },
    };
  }

  const posts = await res.json();
  const post = posts[0] || {};

  return {
    title: post.yoast_head_json?.title || "Latest Blog Posts",
    description: post.yoast_head_json?.description || "Read the latest blogs about Solana.",
    openGraph: {
      title: post.yoast_head_json?.og_title || "Latest Blog Posts",
      description: post.yoast_head_json?.og_description || "Read the latest blogs about Solana.",
      images: [post.yoast_head_json?.og_image?.[0]?.url || DEFAULT_BLOG_IMAGE],
      url: `${DEFAULT_URL}/blogs`,
    },
    twitter: {
      title: post.yoast_head_json?.twitter_title || "Latest Blog Posts",
      description: post.yoast_head_json?.twitter_description || "Read the latest blogs about Solana.",
      images: [post.yoast_head_json?.twitter_image || DEFAULT_BLOG_IMAGE],
    },
  };
}

export default async function Blogs({ searchParams }) {
  const urlParams = await searchParams;
  const page = urlParams?.page || 1;
  const perPage = urlParams?.per_page || 12;
  const search = urlParams?.search;
  const CATEGORY_ID = 2;
  const DEFAULT_BLOG_IMAGE = `${DEFAULT_URL}/wp-content/uploads/2025/03/blog-default.png`;

  const res = await fetch(
    `${DEFAULT_URL}/index.php?rest_route=/wp/v2/posts&categories=${CATEGORY_ID}&page=${page}&per_page=${perPage}${
      search ? `&search=${search}` : ""
    }`,
    { cache: "no-store" }
  );

  if (!res.ok)
    return <p className="text-red-500 p-8">Error fetching blog posts.</p>;

  const posts = await res.json();
  const totalPages = res.headers.get("X-WP-TotalPages");

  const postsWithImages = await Promise.all(
    posts.map(async (post) => {
      let featuredImage = DEFAULT_BLOG_IMAGE;
      if (post.featured_media !== 0) {
        try {
          const mediaRes = await fetch(
            `${DEFAULT_URL}/wp-json/wp/v2/media/${post.featured_media}`
          );
          if (mediaRes.ok) {
            const media = await mediaRes.json();
            featuredImage = media.source_url || DEFAULT_BLOG_IMAGE;
          }
        } catch {
          // fall through to default image
        }
      }
      return { ...post, featuredImage };
    })
  );

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-10 md:py-14 antialiased">
      <div className="mx-auto max-w-screen-lg px-4 2xl:px-0">
        <div className="mb-8 md:mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-theme-600 mb-2">
            Our Blog
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Latest Articles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsWithImages.length > 0 ? (
            postsWithImages.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden transition-shadow duration-200 flex flex-col"
              >
                <a href={`/blogs/${post.slug}`} className="block overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={he.decode(post.title.rendered)}
                    title={he.decode(post.title.rendered)}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </a>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                    <a
                      href={`/blogs/${post.slug}`}
                      className="hover:text-theme-600 transition-colors line-clamp-2"
                      title={he.decode(post.title.rendered)}
                    >
                      {he.decode(post.title.rendered)}
                    </a>
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-3 flex-1">
                    {he.decode(post.excerpt.rendered.replace(/<[^>]*>?/gm, ""))}
                  </p>
                  <a
                    href={`/blogs/${post.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-theme-600 hover:text-theme-700 transition-colors"
                    title={he.decode(post.title.rendered)}
                  >
                    Read more
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              </article>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No blog posts available.</p>
          )}
        </div>

        <Paginator total_pages={totalPages} current_page={page} />
      </div>
    </section>
  );
}
