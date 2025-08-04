
"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from 'react';
import { getAllPosts, type Post } from "@/lib/blog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

function PostSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-52 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
        </div>
    )
}

const POSTS_PER_PAGE = 3;

export default function BlogIndexPage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const loader = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
        setIsLoading(true);
        const posts = await getAllPosts();
        setAllPosts(posts);
        setIsLoading(false);
    }
    fetchPosts();
  }, []);

  // Set initial posts (featured, trending, initial set for infinite scroll)
  useEffect(() => {
    if (allPosts.length > 0) {
        // The first post is featured, next 3 are trending
        const remainingPosts = allPosts.slice(4); 
        setDisplayedPosts(remainingPosts.slice(0, POSTS_PER_PAGE));
        setHasMore(remainingPosts.length > POSTS_PER_PAGE);
    }
  }, [allPosts]);

  const loadMore = useCallback(() => {
    setIsLoading(true);
    // This logic can now be simpler as we fetch all posts at the beginning.
    // In a real app with pagination, this would fetch the next page from the backend.
    const remainingPosts = allPosts.slice(4);
    const nextPage = page + 1;
    const newPosts = remainingPosts.slice(0, nextPage * POSTS_PER_PAGE);
    
    setDisplayedPosts(newPosts);
    setPage(nextPage);
    setHasMore(newPosts.length < remainingPosts.length);
    setIsLoading(false);
  }, [page, allPosts]);
  
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0
    };

    const observer = new IntersectionObserver((entities) => {
        const target = entities[0];
        if (target.isIntersecting && hasMore && !isLoading) {
            loadMore();
        }
    }, options);

    const currentLoader = loader.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  const featuredPost = allPosts[0];
  const trendingPosts = allPosts.slice(1, 4);

  if (isLoading && allPosts.length === 0) {
    return (
        <div className="container mx-auto max-w-6xl py-12 px-4 space-y-12">
            <header className="mb-12 text-center">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-2" />
            </header>
            <section>
                <Skeleton className="h-80 w-full" />
            </section>
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            </section>
        </div>
    )
  }

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
       
       {trendingPosts.length > 0 && (
        <section className="mb-12">
             <header className="my-12 pt-6 border-t">
                <h2 className="text-3xl font-bold tracking-tight">Trending Posts</h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {trendingPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>
        </section>
       )}

      {displayedPosts.length > 0 && (
        <section>
            <header className="my-12 pt-6 border-t">
                <h2 className="text-3xl font-bold tracking-tight">More from the Blog</h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {displayedPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>
        </section>
      )}

      <div ref={loader} className="py-8">
        {isLoading && hasMore && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
            </div>
        )}
        {!hasMore && displayedPosts.length > 0 && (
            <p className="text-center text-muted-foreground">You've reached the end!</p>
        )}
      </div>
    </div>
  );
}
