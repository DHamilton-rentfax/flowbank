
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPostBySlug, updatePost, createPost, type Post } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function BlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const isNewPost = slug === "new";

  const [post, setPost] = useState<Partial<Post>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    date: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(!isNewPost);

  const { toast } = useToast();

  useEffect(() => {
    if (!isNewPost && typeof slug === 'string') {
      const existingPost = getPostBySlug(slug);
      if (existingPost) {
        setPost(existingPost);
      } else {
        toast({
          title: "Post not found",
          variant: "destructive",
        });
        router.push("/dashboard/blog");
      }
      setIsLoading(false);
    }
  }, [slug, isNewPost, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Basic slugification
    const newSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setPost(prev => ({...prev, slug: newSlug}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.title || !post.slug || !post.content || !post.excerpt) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isNewPost) {
        createPost({
            ...post,
            date: new Date().toISOString()
        } as Post);
        toast({ title: "Post Created!", className: "bg-accent text-accent-foreground" });
      } else {
        updatePost(post as Post);
        toast({ title: "Post Updated!", className: "bg-accent text-accent-foreground" });
      }
      router.push("/dashboard/blog");
      router.refresh(); // Force a refresh of the blog list page
    } catch (error) {
       toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div>Loading post...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/dashboard/blog">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-bold">{isNewPost ? "Create New Post" : "Edit Post"}</h1>
            <p className="text-muted-foreground">
                {isNewPost ? "Fill in the details for your new blog post." : "Make changes to your existing post."}
            </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 grid gap-4">
             <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={post.title} onChange={handleChange} placeholder="Your Post Title" />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" value={post.slug} onChange={handleSlugChange} placeholder="your-post-slug" />
                 <p className="text-xs text-muted-foreground">The URL-friendly version of the title.</p>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" name="excerpt" value={post.excerpt} onChange={handleChange} placeholder="A short summary of the post." />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="content">Content (HTML)</Label>
                <Textarea id="content" name="content" value={post.content} onChange={handleChange} placeholder="<p>Start writing your post content here.</p>" rows={15} />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit">
                <Save className="mr-2" />
                {isNewPost ? "Publish Post" : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
