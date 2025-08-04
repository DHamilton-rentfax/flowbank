import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Our Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Insights, tips, and updates from the AutoAllocator team.
        </p>
      </header>
      <div className="grid gap-8">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="group block">
            <Card className="transition-all duration-200 ease-in-out group-hover:border-primary group-hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl group-hover:text-primary">{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4 flex items-center font-medium text-primary">
                  <span>Read More</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}