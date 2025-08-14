
import type { Post } from './types';

// In a real app, this would come from a CMS or database
export const allPosts: Post[] = [
    {
        slug: 'understanding-profit-first',
        title: 'Understanding the Profit First Method',
        description: 'A deep dive into the cash management methodology that can help your business become permanently profitable.',
        date: '2023-10-26',
        author: 'Jane Doe',
        avatar: 'JD',
        image: 'https://placehold.co/600x400.png',
        readTime: 5,
        published: true,
        content: `
            <p>The Profit First methodology, created by Mike Michalowicz, is a revolutionary way to manage your business's cash flow. Instead of the traditional formula of Sales - Expenses = Profit, Profit First flips it to Sales - Profit = Expenses.</p>
            <p>This simple change ensures you prioritize profitability. By taking a predetermined percentage of your revenue as profit first, you force yourself to run your business on the remaining amount. This encourages frugality, innovation, and efficiency.</p>
            <h2>How to Implement Profit First</h2>
            <ol>
                <li><strong>Set up separate bank accounts:</strong> Create accounts for Income, Profit, Owner's Pay, Taxes, and Operating Expenses.</li>
                <li><strong>Determine your percentages:</strong> Based on your business's current state, decide on allocation percentages for each account.</li>
                <li><strong>Transfer funds regularly:</strong> On a set schedule (e.g., twice a month), transfer funds from your Income account to the others based on your percentages.</li>
            </ol>
            <p>FlowBank is built on this principle, automating the transfers and making it easy to adopt Profit First without the manual hassle.</p>
        `
    },
     {
        slug: 'automating-your-finances',
        title: 'The Power of Automating Your Business Finances',
        description: 'Discover how automation can save you time, reduce errors, and provide a clearer picture of your financial health.',
        date: '2023-11-05',
        author: 'John Smith',
        avatar: 'JS',
        image: 'https://placehold.co/600x400.png',
        readTime: 4,
        published: true,
        content: `
            <p>As a business owner, your time is your most valuable asset. Financial administration, while crucial, can be a significant time sink. This is where automation comes in.</p>
            <p>Automating tasks like income allocation, expense tracking, and savings contributions frees you up to focus on what you do best: growing your business. It also reduces the risk of human error and provides a real-time, accurate view of your cash flow.</p>
            <h2>Benefits of Financial Automation</h2>
            <ul>
                <li><strong>Time Savings:</strong> Spend less time in spreadsheets and more time on strategic initiatives.</li>
                <li><strong>Increased Accuracy:</strong> Eliminate manual data entry errors.</li>
                <li><strong>Real-time Insights:</strong> Know exactly where your money is going at all times.</li>
                <li><strong>Peace of Mind:</strong> Feel confident that your financial obligations (like taxes) are being set aside automatically.</li>
            </ul>
        `
    },
    {
        slug: 'why-your-business-needs-a-tax-account',
        title: 'Why Your Business Needs a Dedicated Tax Account',
        description: 'Learn why setting aside money for taxes in a separate account is one of the smartest financial moves you can make.',
        date: '2023-11-12',
        author: 'Jane Doe',
        avatar: 'JD',
        image: 'https://placehold.co/600x400.png',
        readTime: 3,
        published: true,
        content: `
            <p>For many small business owners, tax time is a stressful scramble. A surprise tax bill can be devastating to your cash flow. The solution is simple: a dedicated bank account for taxes.</p>
            <p>By regularly setting aside a percentage of every single deposit into this account, you ensure the funds are there when the tax authorities come calling. You're not "losing" this money; you're simply quarantining it for its intended purpose.</p>
            <p>This single habit transforms tax time from a moment of panic into a simple, predictable business expense.</p>
        `
    },
     {
        slug: 'unpublished-post',
        title: 'This is an unpublished post',
        description: 'It should not appear on the main blog page.',
        date: '2023-01-01',
        author: 'Admin',
        avatar: 'A',
        image: 'https://placehold.co/600x400.png',
        readTime: 1,
        published: false,
        content: `
            <p>This post should not be visible to the public.</p>
        `
    }
];

export async function getAllPosts() {
    return allPosts.filter(p => p.published);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    return allPosts.find(p => p.slug === slug);
}
