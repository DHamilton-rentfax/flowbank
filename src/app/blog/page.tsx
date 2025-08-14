
"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { allPosts } from "@/lib/blog";

export default function Blog() {
  const posts = allPosts;
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl py-12 px-4">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">FlowBank Blog</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Insights on financial automation, business growth, and product updates.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.slug} className="overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                    <div className="relative w-full aspect-video">
                        <Image
                        src={post.image}
                        alt={post.title}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full"
                        data-ai-hint="financial blog post"
                        />
                    </div>
                    <CardHeader>
                        <CardTitle className="hover:text-primary transition-colors">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            {new Date(post.date).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })} • {post.readTime} min read
                        </p>
                        <p className="mt-2 line-clamp-3">{post.description}</p>
                    </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
