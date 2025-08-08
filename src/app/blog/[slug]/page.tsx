
"use client";

import { useEffect, useState } from 'react';
import { getPostBySlug, type Post } from "@/lib/blog";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/layout/footer';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      async function fetchPost() {
        setIsLoading(true);
        const foundPost = await getPostBySlug(slug);
        setPost(foundPost || null); // Set to null if not found
        setIsLoading(false);
      }
      fetchPost();
    } else {
        setIsLoading(false);
        setPost(null);
    }
  }, [slug]);

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

  if (post === null) {
    notFound();
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
                            data-ai-hint="small business finances"
                        />
                    </div>
                </header>
                <article
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>
        </main>
        <Footer />
    </div>
  );
}
