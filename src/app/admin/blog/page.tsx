
"use client";

import React, { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css'; // import styles
import dynamic from 'next/dynamic';
import { db } from '@/firebase/client';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getPostBySlug, type Post } from '@/lib/blog';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function AdminBlogPage() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const { toast } = useToast();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (slug) {
            const fetchPost = async () => {
                setIsLoading(true);
                // In a real app, you'd fetch from Firestore
                const post = await getPostBySlug(slug);
                if (post) {
                    setTitle(post.title);
                    setDescription(post.description);
                    setContent(post.content);
                    setIsPublished(post.published || false);
                } else {
                    toast({ title: "Error", description: "Post not found.", variant: "destructive" });
                }
                setIsLoading(false);
            };
            fetchPost();
        }
    }, [slug, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const postSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const postData = {
                title,
                slug: postSlug,
                description,
                content,
                published: isPublished,
                date: new Date().toISOString(),
                author: 'Admin', // In a real app, get this from auth
                avatar: 'A',
                readTime: Math.ceil(content.split(/\s+/).length / 200),
                image: 'https://placehold.co/600x400.png'
            };

            // In a real app, this would use a secure server-side action
            // For now, we write directly from the client for simplicity
            await setDoc(doc(db, 'blogPosts', postSlug), postData, { merge: true });

            toast({ title: "Success!", description: `Post ${slug ? 'updated' : 'created'} successfully.` });
        } catch (error) {
            console.error(error);
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-8">
                <div className="container mx-auto max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>{slug ? 'Edit Post' : 'Create New Post'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <p>Loading post...</p>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post Title" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (SEO)</Label>
                                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short summary for search engines" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content</Label>
                                        <div className="bg-white">
                                            <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: '300px' }} />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-12">
                                        <input type="checkbox" id="isPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                                        <Label htmlFor="isPublished">Publish Post</Label>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : (slug ? 'Update Post' : 'Create Post')}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
