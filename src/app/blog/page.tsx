
"use client";

import Link from "next/link";
import { useEffect, useState } from 'react';
import { getAllPosts, type Post } from "@/lib/blog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

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

function FeaturedPostCard({ post }: { post: Post }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                         <div className="relative w-full h-64 md:h-full min-h-[250px]">
                             <Image 
                                src={post.image} 
                                alt={post.title} 
                                fill
                                className="object-cover"
                                data-ai-hint="financial blog header"
                            />
                         </div>
                         <div className="p-6 sm:p-8 flex flex-col justify-center">
                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
                                {post.title}
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                {post.excerpt}
                            </p>
                            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{post.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2">
                                     <span>{post.author}</span>
                                    <span className="mx-1">·</span>
                                    <span>{post.readTime} min read</span>
                                    <span className="mx-1">·</span>
                                    <span>{post.views} views</span>
                                </div>
                            </div>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const allPosts = getAllPosts();
    setPosts(allPosts);
  }, []);
  
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);


  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">AutoAllocator Insights</h1>
        <p className="mt-2 text-lg text-muted-foreground">Tips and strategies for managing your business finances.</p>
      </header>
       {featuredPost && (
           <section className="mb-12">
            <FeaturedPostCard post={featuredPost} />
           </section>
       )}

      {otherPosts.length > 0 && (
        <section>
            <header className="my-12 pt-6 border-t">
                <h2 className="text-3xl font-bold tracking-tight">More from the Blog</h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {otherPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>
        </section>
      )}
    </div>
  );
}
