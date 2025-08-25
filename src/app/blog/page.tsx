"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Post = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName?: string;
  date?: string;     // ISO
  coverUrl?: string; // optional image
  tags?: string[];
  category?: string; // "Product" | "Finance" | "AI" | "Updates" | "Guides" | etc.
};

const CATEGORIES = ["All", "Product", "Finance", "AI", "Updates", "Guides"];

const FALLBACK_POSTS: Post[] = [
  {
    slug: "automating-profit-splits-with-flowbank",
    title: "Automating Profit Splits with FlowBank",
    excerpt:
      "How to route every deposit into taxes, savings, and operating buckets automatically—no spreadsheets required.",
    authorName: "FlowBank Team",
    date: "2025-07-19",
    category: "Guides",
    tags: ["automation", "splits", "setup"],
  },
  {
    slug: "ai-financial-advisor-what-it-flags",
    title: "AI Financial Advisor: What It Flags (and Why It Helps)",
    excerpt:
      "From duplicate subscriptions to missed write-offs, here’s how AI can save time and money for small teams.",
    authorName: "FlowBank Team",
    date: "2025-07-22",
    category: "AI",
    tags: ["ai", "tips"],
  },
  { slug: "starter-vs-pro-which-plan-is-right",
    title: "Starter vs Pro: Which Plan Is Right for You?",
    excerpt:
      "We break down features like automated allocations, analytics, and priority support so you can choose confidently.",
    authorName: "FlowBank Team",
    date: "2025-08-03",
    category: "Product",
    tags: ["pricing", "plans"],
  },
  { slug: "weekly-insights-to-run-a-lean-business",
    title: "Weekly Insights to Run a Lean Business",
    excerpt:
      "A quick tour of the weekly report—cash in, allocations out, anomalies, and the one-click actions you’ll love.",
    authorName: "FlowBank Team",
    date: "2025-08-09",
    category: "Updates",
    tags: ["insights", "reporting"],
  },
];

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogPage() {
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  // simple client-side pagination
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Try your API first (adjust path to your API if different)
        const res = await fetch("/api/blogs?limit=100", { cache: "no-store" });
        if (!res.ok) throw new Error("blogs api not ready");
        const data = await res.json().catch(() => ({}));
        // Expect either { posts: Post[] } or Post[]
        const posts: Post[] = Array.isArray(data) ? data : Array.isArray(data?.posts) ? data.posts : [];
        if (!cancelled && posts.length) {
          setAllPosts(normalizePosts(posts));
        } else if (!cancelled) {
          setAllPosts(FALLBACK_POSTS);
        }
      } catch {
        if (!cancelled) setAllPosts(FALLBACK_POSTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter + search
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allPosts.filter((p) => {
      const matchesCat = cat === "All" || (p.category || "").toLowerCase() === cat.toLowerCase();
      const matchesQ =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.excerpt || "").toLowerCase().includes(term) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(term)) ||
        (p.authorName || "").toLowerCase().includes(term);
      return matchesCat && matchesQ;
    });
  }, [allPosts, cat, q]);

  // Featured = first 3
  const featured = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const totalPages = Math.max(1, Math.ceil(rest.length / pageSize));
  const pageSlice = rest.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    // Reset to first page whenever filters change
    setPage(1);
  }, [q, cat]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight">FlowBank Blog</h1>
        <p className="mt-3 text-gray-600">
          Guides, product updates, and finance tips for solo founders and growing teams.
        </p>

        {/* Search */}
        <div className="mx-auto mt-6 flex max-w-xl items-center rounded-xl border bg-white p-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, e.g. “AI savings tips”"
            className="w-full rounded-xl px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={() => setQ("")}
            className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        {/* Categories */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                cat === c ? "bg-black text-white" : "hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} tall />)
          : featured.map((p, i) => <FeaturedCard key={p.slug + i} post={p} />)}
      </section>

      {/* Grid */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Latest</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: pageSize }).map((_, i) => <CardSkeleton key={i} />)
            : pageSlice.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((n) => Math.max(1, n - 1))}
              disabled={page === 1}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <div className="rounded-lg border px-3 py-2 text-sm">
              Page <span className="tabular-nums">{page}</span> of{" "}
              <span className="tabular-nums">{totalPages}</span>
            </div>
            <button
              onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
              disabled={page === totalPages}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="mt-12 rounded-2xl border bg-white p-6 text-center shadow-sm">
        <h3 className="text-lg font-semibold">Get new posts in your inbox</h3>
        <p className="mt-1 text-sm text-gray-600">
          No spam. Helpful tips, product updates, and playbooks.
        </p>
        <div className="mx-auto mt-4 flex max-w-md items-center gap-2">
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          />
          <button className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}

/* ----------------- helpers & UI ----------------- */

function normalizePosts(input: Post[]): Post[] {
  return input
    .map((p) => ({
      ...p,
      slug: String(p.slug || p.id || "").trim() || "post-" + Math.random().toString(36).slice(2),
      title: p.title?.trim() || "Untitled",
      excerpt: p.excerpt?.trim() || "",
      authorName: p.authorName || (p as any).author || "Unknown",
      category: p.category || inferCategoryFromTags(p.tags),
    }))
    .sort((a, b) => (new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
}

function inferCategoryFromTags(tags?: string[]) {
  const t = (tags || []).map((x) => x.toLowerCase());
  if (t.some((x) => x.includes("ai"))) return "AI";
  if (t.some((x) => x.includes("guide") || x.includes("how"))) return "Guides";
  if (t.some((x) => x.includes("update") || x.includes("release"))) return "Updates";
  if (t.some((x) => x.includes("finance") || x.includes("tax"))) return "Finance";
  return "Product";
}

function CardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`animate-pulse overflow-hidden rounded-2xl border bg-white shadow-sm ${tall ? "" : ""}`}>
      <div className={`h-40 w-full bg-gray-100 ${tall ? "md:h-56" : ""}`} />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/5 rounded bg-gray-100" />
        <div className="h-3 w-4/5 rounded bg-gray-100" />
        <div className="h-3 w-2/5 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <Cover src={post.coverUrl} alt={post.title} tall />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {post.category ? (
            <span className="rounded-full bg-gray-900/5 px-2 py-0.5">{post.category}</span>
          ) : null}
          {post.date ? <span>{formatDate(post.date)}</span> : null}
          {post.authorName ? <span>• {post.authorName}</span> : null}
        </div>
        <Link href={`/blog/${post.slug}`} className="mt-2 block">
          <h3 className="text-lg font-semibold hover:underline">{post.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-gray-600">{post.excerpt}</p>
        </Link>
        <div className="mt-3 flex flex-wrap gap-2">
          {(post.tags || []).slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <Cover src={post.coverUrl} alt={post.title} />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {post.category ? (
            <span className="rounded-full bg-gray-900/5 px-2 py-0.5">{post.category}</span>
          ) : null}
          {post.date ? <span>{formatDate(post.date)}</span> : null}
          {post.authorName ? <span>• {post.authorName}</span> : null}
        </div>
        <Link href={`/blog/${post.slug}`} className="mt-2 block">
          <h3 className="text-base font-semibold hover:underline">{post.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-gray-600">{post.excerpt}</p>
        </Link>
        <div className="mt-3 flex flex-wrap gap-2">
          {(post.tags || []).slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Cover({ src, alt, tall = false }: { src?: string; alt: string; tall?: boolean }) {
  // Avoid Next/Image domain hassles: use <img> or gradient fallback
  if (!src) {
    return (
      <div
        className={`w-full ${tall ? "h-44 md:h-56" : "h-40"} bg-gradient-to-br from-gray-100 to-gray-200`}
        aria-hidden="true"
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`h-40 w-full object-cover ${tall ? "md:h-56" : ""}`}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = "none";
        // show fallback block if image fails
        const fallback = document.createElement("div");
        fallback.style.width = "100%";
        fallback.style.height = tall ? "14rem" : "10rem";
        fallback.style.background =
          "linear-gradient(135deg, rgba(243,244,246,1) 0%, rgba(229,231,235,1) 100%)";
        el.parentElement?.appendChild(fallback);
      }}
    />
  );
}