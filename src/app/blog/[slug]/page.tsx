"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getPostBySlug, type Post } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import SafeImage from "@/components/ui/SafeImage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/layout/footer";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchPost() {
      try {
        setIsLoading(true);
        const found = slug ? await getPostBySlug(slug) : null;
        if (!mounted) return;
        setPost(found ?? null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchPost();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Loading skeleton
  if (isLoading || post === undefined) {
    return (
      <div className="container mx-auto max-w-3xl py-12 px-4">
        <header className="mb-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="w-full aspect-video rounded-lg my-8" />
        </header>
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-full mt-4" />
          <Skeleton className="h-6 w-5/6" />
        </div>
      </div>
    );
  }

  // If not found, do a gentle client redirect back to the blog list
  if (post === null) {
    // use notFound() only in server components; here we redirect
    if (typeof window !== "undefined") router.replace("/blog");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl py-12 px-4">
          <header className="mb-8">
            <Button asChild variant="ghost" className="mb-4 -ml-4">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>

            <h1 className="text-4xl font-bold tracking-tight leading-tight md:text-5xl mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{post.avatar}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{post.author}</span>
              </div>
              <span>•</span>
              <span>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>•</span>
              <span>{post.readTime} min read</span>
            </div>

            <div className="relative w-full h-auto rounded-lg overflow-hidden my-8">
              <SafeImage
                src={post.image}
                alt={post.title}
                width={1200}
                height={600}
                className="object-cover"
                data-ai-hint="small business finances"
              />
            </div>
          </header>

          <article
            className="prose prose-lg dark:prose-invert max-w-none ql-editor"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
