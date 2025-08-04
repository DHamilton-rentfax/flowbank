
"use client";

import { useEffect, useState } from 'react';
import { getPostBySlug, type Post } from "@/lib/blog";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  useEffect(() => {
    if (slug) {
      const foundPost = getPostBySlug(slug);
      setPost(foundPost);
    }
  }, [slug]);

  if (post === undefined) {
    // Still loading
    return <div className="container mx-auto max-w-3xl py-12 px-4">Loading...</div>;
  }

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto max-w-3xl py-12 px-4">
      <header className="mb-8">
        <Button asChild variant="ghost" className="mb-4 -ml-4">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight leading-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Published on {new Date(post.date).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
