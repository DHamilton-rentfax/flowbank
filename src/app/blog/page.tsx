
"use client";

import Link from "next/link";
import { useEffect, useState } from 'react';
import { getAllPosts, type Post } from "@/lib/blog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg">
         <Image 
          src={post.image} 
          alt={post.title} 
          width={400}
          height={250}
          className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="financial blog"
        />
      </div>
      <div className="py-4">
        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {post.title}
        </h3>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
                <AvatarFallback>{post.avatar}</AvatarFallback>
            </Avatar>
            <span>{post.author}</span>
            <span className="mx-1">·</span>
            <span>{post.readTime} min read</span>
            <span className="mx-1">·</span>
            <span>{post.views} views</span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const allPosts = getAllPosts();
    setPosts(allPosts);
  }, []);
  
  const trendingPosts = posts.slice(0, 3);
  const otherPosts = posts.slice(3);


  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Trending</h1>
      </header>
       {trendingPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {trendingPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {otherPosts.length > 0 && (
        <>
            <header className="my-12 pt-6 border-t">
                <h1 className="text-3xl font-bold tracking-tight">More from the Blog</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {otherPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>
        </>
      )}
    </div>
  );
}
