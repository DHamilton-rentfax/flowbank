
export interface Post {
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

const BLOG_STORAGE_KEY = 'auto_allocator_blog_posts';

const initialPosts: Post[] = [
    {
        slug: "mastering-cash-flow",
        title: "Mastering Cash Flow: A Small Business Owner's Guide",
        excerpt: "Learn the fundamentals of managing your business's cash flow to ensure financial stability and growth.",
        date: "2024-05-10T12:00:00.000Z",
        image: "https://placehold.co/600x400.png",
        author: "Alex Doe",
        avatar: "A",
        readTime: 5,
        views: 152,
        content: `
            <p>Understanding and managing cash flow is the lifeblood of any small business. It’s about more than just making a profit; it’s about having the cash on hand to meet your obligations. In this guide, we'll break down the basics of cash flow and provide actionable tips to help you take control.</p>
            <h2 class="text-2xl font-semibold mt-6 mb-4">Why Cash Flow Matters</h2>
            <p>Positive cash flow means you have more money coming into your business than going out. This liquidity allows you to pay suppliers, meet payroll, and invest in growth opportunities. Without it, even a profitable business on paper can fail.</p>
            <h2 class="text-2xl font-semibold mt-6 mb-4">Tips for Better Management</h2>
            <ul class="list-disc pl-6 space-y-2">
                <li><strong>Monitor Your Finances Closely:</strong> Regularly review your income and expenses. Use tools to track where your money is going.</li>
                <li><strong>Improve Invoicing:</strong> Send invoices promptly and follow up on late payments. Consider offering incentives for early payment.</li>
                <li><strong>Manage Your Inventory:</strong> Avoid overstocking products that tie up cash. Use inventory management systems to optimize stock levels.</li>
            </ul>
        `
    },
    {
        slug: "profit-first-strategy",
        title: "The Profit First Strategy: A Game-Changer for Your Business",
        excerpt: "Discover how the Profit First methodology can revolutionize your finances by prioritizing profit from day one.",
        date: "2024-05-18T12:00:00.000Z",
        image: "https://placehold.co/600x400.png",
        author: "Jane Smith",
        avatar: "J",
        readTime: 7,
        views: 289,
        content: `
            <p>The traditional accounting formula is Sales - Expenses = Profit. The Profit First method flips this on its head: Sales - Profit = Expenses. This simple change forces you to allocate profit from every sale before you pay your expenses, ensuring your business is always profitable.</p>
            <h2 class="text-2xl font-semibold mt-6 mb-4">How It Works</h2>
            <p>With every deposit, you immediately allocate a predetermined percentage to different accounts: Profit, Owner's Compensation, Taxes, and Operating Expenses. This is exactly what AutoAllocator helps you do automatically!</p>
            <h2 class="text-2xl font-semibold mt-6 mb-4">Getting Started</h2>
            <ol class="list-decimal pl-6 space-y-2">
                <li><strong>Set up the Foundation:</strong> Create separate bank accounts for each allocation category.</li>
                <li><strong>Determine Your Percentages:</strong> Analyze your current financials to set realistic allocation percentages. Our AI Plan Generator can help with this.</li>
                <li><strong>Be Consistent:</strong> Stick to your allocation schedule, typically twice a month.</li>
            </ol>
        `
    },
    {
        slug: "understanding-business-taxes",
        title: "5 Tips for Understanding Small Business Taxes",
        excerpt: "Navigating the world of business taxes doesn't have to be stressful. Here are five tips to help you stay organized and compliant.",
        date: "2024-06-02T12:00:00.000Z",
        image: "https://placehold.co/600x400.png",
        author: "Alex Doe",
        avatar: "A",
        readTime: 6,
        views: 98,
        content: "<p>Tax season can be a headache, but with a little preparation, you can make it a breeze. This post will cover five key tips to help you manage your business's tax obligations effectively.</p>"
    },
    {
        slug: "why-you-need-an-operating-account",
        title: "Why Your Business Needs a Dedicated Operating Account",
        excerpt: "Separating your business and personal finances is crucial. Learn why an operating account is the first step towards financial clarity.",
        date: "2024-06-15T12:00:00.000Z",
        image: "https://placehold.co/600x400.png",
        author: "Sam Rivera",
        avatar: "S",
        readTime: 4,
        views: 112,
        content: "<p>Commingling funds is a common mistake for new entrepreneurs. We'll explore the benefits of having a dedicated account for your day-to-day business expenses.</p>"
    },
    {
        slug: "marketing-budget-for-growth",
        title: "How to Create a Marketing Budget That Drives Growth",
        excerpt: "Investing in marketing is key to growth. This guide will help you create a smart, effective marketing budget for your small business.",
        date: "2024-06-21T12:00:00.000Z",
        image: "https://placehold.co/600x400.png",
        author: "Jane Smith",
        avatar: "J",
        readTime: 8,
        views: 204,
        content: "<p>You have to spend money to make money, especially in marketing. Learn how to build a budget that aligns with your business goals and delivers a real return on investment.</p>"
    },
     {
        slug: "automated-savings-for-entrepreneurs",
        title: "The Power of Automated Savings for Entrepreneurs",
        excerpt: "Setting aside money for the future is vital. Discover how automating your savings can secure your business's long-term financial health.",
        date: "2024-07-01T12:00:00.000Z",
        image: "https://placehold.co/600x400.png",
        author: "Sam Rivera",
        avatar: "S",
        readTime: 5,
        views: 88,
        content: "<p>As an entrepreneur, your income can be unpredictable. Automating your savings is a powerful strategy to build a safety net and invest in future opportunities without having to think about it.</p>"
    }
];

// This function should only be called on the client side.
function getPostsFromStorage(): Post[] {
    if (typeof window === 'undefined') {
        return initialPosts;
    }
    const storedPosts = localStorage.getItem(BLOG_STORAGE_KEY);
    if (storedPosts) {
        try {
            const parsed = JSON.parse(storedPosts);
            // Basic check to see if posts have the new fields
            if (parsed.length > 0 && 'readTime' in parsed[0]) {
                 return parsed;
            }
        } catch (e) {
            // If parsing fails, fall back to initial posts
        }
    }
    // If no posts in storage, or they are outdated, initialize with default posts
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(initialPosts));
    return initialPosts;
}

// This function should only be called on the client side.
function savePostsToStorage(posts: Post[]) {
     if (typeof window !== 'undefined') {
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
     }
}

export function getAllPosts(): Post[] {
    const posts = getPostsFromStorage();
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | undefined {
    const posts = getPostsFromStorage();
    return posts.find(post => post.slug === slug);
}

export function createPost(post: Post) {
    const posts = getPostsFromStorage();
    if (posts.some(p => p.slug === post.slug)) {
        throw new Error("A post with this slug already exists.");
    }
    const newPosts = [...posts, post];
    savePostsToStorage(newPosts);
}

export function updatePost(updatedPost: Post) {
    const posts = getPostsFromStorage();
    const postIndex = posts.findIndex(p => p.slug === updatedPost.slug);
    if (postIndex === -1) {
        // If the slug has changed, we might not find it. Let's try to find by original slug if possible,
        // but for this implementation, we'll assume slug is the primary key and doesn't change post-creation.
        // Or, we can create a new post if the old one isn't found. For simplicity, we error out.
        throw new Error("Post not found.");
    }
    const newPosts = [...posts];
    newPosts[postIndex] = updatedPost;
    savePostsToStorage(newPosts);
}

export function deletePost(slug: string) {
    const posts = getPostsFromStorage();
    const newPosts = posts.filter(p => p.slug !== slug);
    if (posts.length === newPosts.length) {
        throw new Error("Post not found.");
    }
    savePostsToStorage(newPosts);
}
