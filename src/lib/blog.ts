
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

const samplePosts: Omit<Post, 'id'>[] = [
    {
        slug: 'how-to-automate-your-finances-and-save-10-hours-every-month',
        title: 'How to Automate Your Finances and Save 10+ Hours Every Month',
        excerpt: 'Discover how financial automation can save you hours, reduce stress, and improve your cash flow—perfect for entrepreneurs.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>Financial automation is the process of using technology to manage your money with minimal manual effort. For busy entrepreneurs, it\'s a game-changer. In this guide, we\'ll explore practical steps to automate your finances, from income splitting to bill payments, so you can focus on what you do best: growing your business.</p><h2>Key Areas for Automation</h2><ul><li>Income Allocation</li><li>Bill Payments</li><li>Savings & Investments</li><li>Expense Tracking</li></ul>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 6,
        views: 1523,
    },
    {
        slug: 'the-ultimate-guide-to-automatic-income-splitting-for-entrepreneurs',
        title: 'The Ultimate Guide to Automatic Income Splitting for Entrepreneurs',
        excerpt: "Learn how to automatically split your income into savings, taxes, and expenses with Flow Bank's smart allocation rules.",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 8,
        views: 987,
    },
    {
        slug: '5-ways-financial-automation-can-boost-your-business-cash-flow',
        title: '5 Ways Financial Automation Can Boost Your Business Cash Flow',
        excerpt: 'Boost your business cash flow with automation—see 5 proven strategies used by top entrepreneurs.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 5,
        views: 746,
    },
    {
        slug: 'from-chaos-to-clarity-automating-your-business-bank-accounts',
        title: 'From Chaos to Clarity: Automating Your Business Bank Accounts',
        excerpt: 'Organize your finances with automated bank rules that simplify business money management.',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 6,
        views: 812,
    },
    {
        slug: 'why-every-small-business-needs-an-automated-payout-system',
        title: 'Why Every Small Business Needs an Automated Payout System',
        excerpt: 'Discover how automated payouts save time, reduce errors, and improve cash flow for small businesses.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 7,
        views: 1102,
    },
    {
        slug: 'instant-payouts-explained-how-to-get-your-money-in-minutes',
        title: 'Instant Payouts Explained: How to Get Your Money in Minutes',
        excerpt: 'Learn how instant payouts work, the costs, and how Flow Bank makes them seamless for your business.',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 5,
        views: 2530,
    },
    {
        slug: 'should-you-offer-instant-payouts-to-clients-pros-and-cons',
        title: 'Should You Offer Instant Payouts to Clients? Pros and Cons',
        excerpt: 'Weigh the pros and cons of offering instant payouts to clients and how it can boost loyalty.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 6,
        views: 654,
    },
    {
        slug: 'the-true-cost-of-instant-payouts-and-how-to-make-them-worth-it',
        title: 'The True Cost of Instant Payouts—and How to Make Them Worth It',
        excerpt: 'Understand instant payout fees and how to make them profitable with Flow Bank.',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 5,
        views: 1345,
    },
    {
        slug: 'how-to-offer-instant-bank-transfers-without-risk',
        title: 'How to Offer Instant Bank Transfers Without Risk',
        excerpt: 'Learn safe ways to offer instant bank transfers to your customers using Stripe and Plaid.',
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 7,
        views: 998,
    },
    {
        slug: 'why-instant-payouts-can-give-your-business-a-competitive-edge',
        title: 'Why Instant Payouts Can Give Your Business a Competitive Edge',
        excerpt: 'Instant payouts can set you apart—see how Flow Bank makes it simple and secure.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 4,
        views: 887,
    },
    {
        slug: 'ai-financial-coaching-how-its-changing-the-game-for-entrepreneurs',
        title: 'AI Financial Coaching: How It’s Changing the Game for Entrepreneurs',
        excerpt: 'See how an AI financial coach can optimize your saving, investing, and tax strategies.',
        date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 8,
        views: 3120,
    },
    {
        slug: 'the-future-of-finance-ai-powered-budgeting-and-tax-planning',
        title: 'The Future of Finance: AI-Powered Budgeting and Tax Planning',
        excerpt: 'Explore how AI is revolutionizing budgeting and tax planning for business owners.',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 7,
        views: 1845,
    },
    {
        slug: 'how-ai-can-help-you-save-more-and-invest-smarter',
        title: 'How AI Can Help You Save More and Invest Smarter',
        excerpt: 'Learn how AI tools can improve your investment strategies and savings habits.',
        date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 6,
        views: 1543,
    },
    {
        slug: 'tax-season-made-easy-with-ai-financial-insights',
        title: 'Tax Season Made Easy with AI Financial Insights',
        excerpt: 'Make tax season stress-free with AI-driven financial insights and tracking.',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 5,
        views: 2231,
    },
    {
        slug: 'what-an-ai-coach-can-teach-you-about-better-money-management',
        title: 'What an AI Coach Can Teach You About Better Money Management',
        excerpt: 'Discover how an AI coach can transform the way you manage your business finances.',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 7,
        views: 1765,
    },
    {
        slug: 'cash-flow-forecasting-for-small-businesses-a-step-by-step-guide',
        title: 'Cash Flow Forecasting for Small Businesses: A Step-by-Step Guide',
        excerpt: 'Learn how to forecast cash flow with ease using Flow Bank’s automation tools.',
        date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 9,
        views: 1432,
    },
    {
        slug: 'the-secret-to-never-missing-a-tax-payment-again',
        title: 'The Secret to Never Missing a Tax Payment Again',
        excerpt: 'Automate your tax savings and avoid late payment penalties with Flow Bank.',
        date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 5,
        views: 1987,
    },
    {
        slug: 'how-to-build-a-business-emergency-fund-automatically',
        title: 'How to Build a Business Emergency Fund Automatically',
        excerpt: 'Set up an automated business emergency fund in minutes with Flow Bank.',
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 6,
        views: 1654,
    },
    {
        slug: 'managing-seasonal-income-with-automated-bank-rules',
        title: 'Managing Seasonal Income with Automated Bank Rules',
        excerpt: 'Smooth out seasonal cash flow with automated bank rules and payouts.',
        date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 7,
        views: 843,
    },
    {
        slug: 'why-separating-business-and-personal-finances-is-crucial',
        title: 'Why Separating Business and Personal Finances Is Crucial',
        excerpt: 'Learn why and how to keep your business and personal finances separate.',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 5,
        views: 2531,
    },
    {
        slug: 'how-to-link-your-bank-accounts-to-flow-bank-in-minutes',
        title: 'How to Link Your Bank Accounts to Flow Bank in Minutes',
        excerpt: 'Securely connect your bank accounts to Flow Bank with Plaid in just minutes.',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 3,
        views: 3012,
    },
    {
        slug: 'stripe-plaid-the-power-duo-behind-flow-bank',
        title: 'Stripe + Plaid: The Power Duo Behind Flow Bank',
        excerpt: 'See how Stripe and Plaid power Flow Bank’s secure and automated payouts.',
        date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 4,
        views: 1899,
    },
    {
        slug: 'the-best-tools-for-managing-business-money-in-2025',
        title: 'The Best Tools for Managing Business Money in 2025',
        excerpt: 'Discover the top financial tools entrepreneurs should use in 2025.',
        date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 6,
        views: 2764,
    },
    {
        slug: 'how-to-set-up-flow-bank-for-your-business-in-under-10-minutes',
        title: 'How to Set Up Flow Bank for Your Business in Under 10 Minutes',
        excerpt: 'Get started with Flow Bank in under 10 minutes—no technical skills needed.',
        date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 5,
        views: 3541,
    },
    {
        slug: 'what-makes-flow-bank-the-best-financial-automation-platform-in-2025',
        title: 'What Makes Flow Bank the Best Financial Automation Platform in 2025',
        excerpt: 'See why Flow Bank is the top choice for automated business finance in 2025.',
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        content: '<p>This is placeholder content for the full blog post.</p>',
        image: 'https://placehold.co/800x400.png',
        author: 'Admin',
        avatar: 'A',
        readTime: 7,
        views: 4012,
    },
];


// Function to get all posts, sorted by date
export async function getAllPosts(): Promise<Post[]> {
    const q = query(postsCollection, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        // To prevent a blank blog on first run, let's add some sample data.
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
