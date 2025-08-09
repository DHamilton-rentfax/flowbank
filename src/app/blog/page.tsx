
"use client";

import Link from "next/link";
import { useEffect, useState, memo } from 'react';
import { getAllPosts, type Post } from "@/lib/blog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/layout/footer";
import { FixedSizeList as List } from 'react-window';

const PostCard = memo(function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg">
         <Image 
          src={post.image} 
          alt={post.title} 
          width={400}
          height={250}
          className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="entrepreneur laptop"
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
});

const FeaturedPostCard = memo(function FeaturedPostCard({ post }: { post: Post }) {
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
                                data-ai-hint="small business finances"
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
});

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

function PostGrid({ posts }: { posts: Post[] }) {
    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const post = posts[index];
        return <div style={style} className="p-4"><PostCard post={post} /></div>
    };
    
    // For a 3-column grid
    const columnCount = 3;
    const rowCount = Math.ceil(posts.length / columnCount);
    
    const RowGrid = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const items = [];
        const startIndex = index * columnCount;
        for (let i = 0; i < columnCount; i++) {
            const postIndex = startIndex + i;
            if (postIndex < posts.length) {
                items.push(<div key={postIndex} className="w-1/3 p-4"><PostCard post={posts[postIndex]} /></div>);
            }
        }
        return <div style={style} className="flex">{items}</div>
    }

    if (typeof window === 'undefined') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {posts.map((post) => <PostCard key={post.slug} post={post} />)}
            </div>
        )
    }

    return (
        <List
            height={Math.min(rowCount, 3) * 380} // Approx height for 3 rows
            itemCount={rowCount}
            itemSize={380} // Approx height of a PostCard
            width="100%"
        >
            {RowGrid}
        </List>
    )
}


export default function BlogIndexPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
      setIsLoading(false);
    }
    fetchPosts();
  }, []);
  
  const featuredPost = posts[0];
  const trendingPosts = posts.slice(1, 4);
  const morePosts = posts.slice(4);

  if (isLoading) {
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
    <div className="flex flex-col min-h-screen">
        <main className="flex-1">
            <div className="container mx-auto max-w-6xl py-12 px-4">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight">FlowBank Insights</h1>
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

            {morePosts.length > 0 && (
                <section>
                    <header className="my-12 pt-6 border-t">
                        <h2 className="text-3xl font-bold tracking-tight">More from the Blog</h2>
                    </header>
                    <PostGrid posts={morePosts} />
                </section>
            )}

            </div>
        </main>
        <Footer />
    </div>
  );
}
