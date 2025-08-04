
import { db } from '@/firebase/client';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

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
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}

// Function to get a single post by its slug
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const posts = await getAllPosts(); // This is inefficient but simple for a prototype
    const post = posts.find(p => p.slug === slug);
    return post;
}

// Function to create a new post
export async function createPost(post: Omit<Post, 'id'>): Promise<string> {
    const posts = await getAllPosts();
    if (posts.some(p => p.slug === post.slug)) {
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
    await setDoc(postDocRef, updatedPost, { merge: true });
}

// Function to delete a post
export async function deletePost(id: string): Promise<void> {
     if (!id) {
        throw new Error("Post ID is required to delete.");
    }
    const postDocRef = doc(db, 'blog_posts', id);
    await deleteDoc(postDocRef);
}
