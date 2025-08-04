
import { db } from '@/firebase/client';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

export interface Post {
    id?: string; // Firestore document ID
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    content: string;
    image: string;
    author: string;
    avatar: string;
    readTime: number; // in minutes
    views: number;
}

const postsCollection = collection(db, 'blog_posts');

// Function to get all posts, sorted by date
export async function getAllPosts(): Promise<Post[]> {
    const q = query(postsCollection, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        // To prevent a blank blog on first run, let's add some sample data.
        const samplePosts: Omit<Post, 'id'>[] = [
            {
                slug: 'mastering-cash-flow-a-guide-for-freelancers',
                title: 'Mastering Cash Flow: A Guide for Freelancers',
                excerpt: 'Learn the essential strategies to manage your unpredictable income and build a financially stable freelance career.',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                content: '<p>Freelancing offers freedom, but it also comes with financial uncertainty. This guide will walk you through setting up a system to smooth out your cash flow, handle taxes, and pay yourself consistently. We will cover the core principles of the Profit First system, adapted for the modern freelancer.</p><h2>1. Open the Right Bank Accounts</h2><p>The first step is to set up multiple bank accounts for specific purposes: Income, Operating Expenses, Taxes, and Owner\'s Pay.</p><h2>2. Determine Your Allocation Percentages</h2><p>Based on your business and personal needs, decide what percentage of your income should go into each account. A typical starting point is...</p>',
                image: 'https://placehold.co/800x400.png',
                author: 'Jane Doe',
                avatar: 'JD',
                readTime: 7,
                views: 1250,
            },
            {
                slug: 'why-your-small-business-needs-profit-first',
                title: 'Why Your Small Business Needs to Implement Profit First, Today',
                excerpt: 'The traditional "Sales - Expenses = Profit" formula is broken. Discover how a simple change in your accounting can guarantee profitability.',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                content: '<p>This is a deep dive into the Profit First methodology...</p>',
                image: 'https://placehold.co/800x400.png',
                author: 'John Smith',
                avatar: 'JS',
                readTime: 9,
                views: 2300,
            },
        ];

        for (const post of samplePosts) {
            await addDoc(postsCollection, post);
        }
        // Re-fetch after adding samples
        const newSnapshot = await getDocs(q);
        return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}

// Function to get a single post by its slug
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const q = query(postsCollection, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return undefined;
    }
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as Post;
}

// Function to create a new post
export async function createPost(post: Omit<Post, 'id'>): Promise<string> {
    const existingPost = await getPostBySlug(post.slug);
    if (existingPost) {
        throw new Error("A post with this slug already exists.");
    }
    const docRef = await addDoc(postsCollection, post);
    return docRef.id;
}

// Function to update an existing post
export async function updatePost(id: string, updatedPost: Partial<Post>): Promise<void> {
    if (!id) {
        throw new Error("Post ID is required to update.");
    }
    const postDocRef = doc(db, 'blog_posts', id);
    // Ensure slug is not updated if it's not the main subject of update
    const { slug, ...postData } = updatedPost;
    await setDoc(postDocRef, postData, { merge: true });
}

// Function to delete a post
export async function deletePost(id: string): Promise<void> {
     if (!id) {
        throw new Error("Post ID is required to delete.");
    }
    const postDocRef = doc(db, 'blog_posts', id);
    await deleteDoc(postDocRef);
}
