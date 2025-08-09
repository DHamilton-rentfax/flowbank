
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPostBySlug, updatePost, createPost, type Post } from "@/lib/blog";
import { generateAIBlogPost } from "@/app/actions";
import { useApp } from "@/contexts/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, Wand2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";


function AIGeneratorDialog({ onApplyPost, plaidTransactions }: { onApplyPost: (post: Partial<Post>) => void, plaidTransactions: any[] }) {
    const [topic, setTopic] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!topic) {
            toast({ title: "Topic is required", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const result = await generateAIBlogPost({ topic, transactions: plaidTransactions });
        setIsLoading(false);

        if (result.success && result.post) {
            onApplyPost(result.post);
            toast({ title: "Content Generated!", description: "The AI has generated a draft for your post.", className: "bg-accent text-accent-foreground" });
            setIsOpen(false);
            setTopic("");
        } else {
            toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Wand2 className="mr-2" />
                    Generate with AI
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Blog Post with AI</DialogTitle>
                    <DialogDescription>
                        Enter a topic for the blog post. The AI will analyze anonymized transaction data to find trends and write an article.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="topic">Blog Post Topic</Label>
                    <Input 
                        id="topic" 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)} 
                        placeholder="e.g., 'Common Savings Mistakes for Freelancers'" 
                    />
                     <p className="text-xs text-muted-foreground">
                        The AI will use the last 100 transactions from your user base as context.
                    </p>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 animate-spin" />}
                        Generate Content
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function BlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const slugParam = params.slug as string;
  const isNewPost = slugParam === "new";

  const { plaidTransactions } = useApp();

  const [post, setPost] = useState<Partial<Post>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "https://placehold.co/800x400.png",
    date: new Date().toISOString(),
    author: 'Admin',
    avatar: 'A',
    readTime: 5,
    views: 0,
  });
  const [isLoading, setIsLoading] = useState(!isNewPost);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (!isNewPost && slugParam) {
      const fetchPost = async () => {
          setIsLoading(true);
          const existingPost = await getPostBySlug(slugParam);
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
      fetchPost();
    }
  }, [slugParam, isNewPost, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ['readTime', 'views'].includes(name);
    setPost(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setPost(prev => ({...prev, title: value, slug: isNewPost ? newSlug : prev.slug}));
  }

  const handleApplyAIPost = (aiPost: Partial<Post>) => {
    const newSlug = (aiPost.title || "").toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setPost(prev => ({
        ...prev,
        title: aiPost.title || prev.title,
        excerpt: aiPost.excerpt || prev.excerpt,
        content: aiPost.content || prev.content,
        slug: isNewPost ? newSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.title || !post.slug || !post.content || !post.excerpt || !post.image) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isNewPost) {
        await createPost({
            ...post,
            date: new Date().toISOString()
        } as Post);
        toast({ title: "Post Created!", className: "bg-accent text-accent-foreground" });
      } else {
        if (!post.id) {
            throw new Error("Post ID is missing. Cannot update.");
        }
        await updatePost(post.id, post as Post);
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
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Card>
                <CardContent className="p-6 grid gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/blog">
                    <ArrowLeft />
                    <span className="sr-only">Back</span>
                </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{isNewPost ? "Create New Post" : "Edit Post"}</h1>
                    <p className="text-muted-foreground">
                        {isNewPost ? "Fill in the details for your new blog post." : "Make changes to your existing post."}
                    </p>
                </div>
            </div>
            <AIGeneratorDialog onApplyPost={handleApplyAIPost} plaidTransactions={plaidTransactions} />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 grid gap-4">
             <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={post.title} onChange={handleTitleChange} placeholder="Your Post Title" required disabled={isSaving} />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" value={post.slug} readOnly placeholder="your-post-slug" required disabled={true}/>
                 <p className="text-xs text-muted-foreground">The URL-friendly version of the title. Generated automatically.</p>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" name="image" value={post.image} onChange={handleChange} placeholder="https://placehold.co/800x400.png" required disabled={isSaving}/>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" name="excerpt" value={post.excerpt} onChange={handleChange} placeholder="A short summary of the post." required disabled={isSaving} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="content">Content (HTML)</Label>
                <Textarea id="content" name="content" value={post.content} onChange={handleChange} placeholder="<p>Start writing your post content here.</p>" rows={15} required disabled={isSaving} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" name="author" value={post.author} onChange={handleChange} placeholder="John Doe" disabled={isSaving} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="avatar">Avatar Initial</Label>
                    <Input id="avatar" name="avatar" value={post.avatar} onChange={handleChange} placeholder="J" maxLength={2} disabled={isSaving} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="readTime">Read Time (mins)</Label>
                    <Input id="readTime" name="readTime" type="number" value={post.readTime} onChange={handleChange} placeholder="5" disabled={isSaving} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="views">Views</Label>
                    <Input id="views" name="views" type="number" value={post.views} onChange={handleChange} placeholder="123" disabled={isSaving} />
                </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                {isSaving ? "Saving..." : isNewPost ? "Publish Post" : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
