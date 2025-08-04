
"use client";

import Link from "next/link";
import { useEffect, useState } from 'react';
import { getAllPosts, type Post } from "@/lib/blog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setPosts(getAllPosts());
  }, []);

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Our Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Insights, tips, and updates from the AutoAllocator team.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="group block">
            <Card className="transition-all duration-200 ease-in-out group-hover:shadow-lg overflow-hidden h-full flex flex-col">
              <div className="relative w-full h-48">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill
                    className="object-cover"
                    data-ai-hint="financial blog"
                  />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <CardTitle className="text-xl group-hover:text-primary">{post.title}</CardTitle>
                <CardDescription className="mt-2">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
                <CardContent className="p-0 mt-4 flex-grow">
                    <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                 <div className="mt-4 flex items-center font-medium text-primary">
                  <span>Read More</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
