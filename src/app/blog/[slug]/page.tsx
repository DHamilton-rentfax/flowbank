
"use client";

import { useEffect, useState } from 'react';
import { getPostBySlug, type Post } from "@/lib/blog";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
                <span>{new Date(post.date).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}</span>
                 <span>•</span>
                 <span>{post.readTime} min read</span>
            </div>

            <div className="relative w-full h-auto aspect-video rounded-lg overflow-hidden my-8">
                <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill 
                    className="object-cover"
                    data-ai-hint="financial blog header"
                />
            </div>
        </header>
        <article
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
        />
    </div>
  );
}
