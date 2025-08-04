
import { getAllPosts } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, FileEdit } from "lucide-react";
import Link from "next/link";

export default function BlogManagementPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage your blog posts.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
          <CardDescription>A list of all your current blog posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.slug} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Published on {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
