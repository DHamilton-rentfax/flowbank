// src/app/demo/page.tsx
import {
  Banknote,
  BarChart3,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// --- Sample Data for the Demo ---

const demoData = {
  accounts: [
    { name: 'Profit', balance: 1250.75 },
    { name: 'Taxes', balance: 3800.5 },
    { name: 'Owner’s Pay', balance: 7500.0 },
    { name: 'Operating Expenses', balance: 15230.25 },
  ],
  recentTransactions: [
    { id: '1', date: '2024-07-28', name: 'Stripe Payout', amount: 8250.0, isIncome: true },
    { id: '2', date: '2024-07-27', name: 'Vercel Inc.', amount: -20.0, isIncome: false },
    { id: '3', date: '2024-07-27', name: 'Notion Labs', amount: -12.0, isIncome: false },
    { id: '4', date: '2024-07-26', name: 'Google Ads', amount: -150.0, isIncome: false },
    { id: '5', date: '2024-07-25', name: 'Stripe Payout', amount: 4300.0, isIncome: true },
  ],
  aiAnalysis: {
    spendingSummary:
      "Your top spending categories this month are Marketing ($1,250) and SaaS Subscriptions ($210). We've identified two recurring subscriptions for similar design software, which could be an area for savings.",
    savingsSuggestions: [
      {
        title: 'Consolidate Design Subscriptions',
        suggestion:
          'You are subscribed to both Figma ($15/mo) and Sketch ($9/mo). Consolidating to one could save you at least $108 per year.',
        relatedTransactions: ['Figma', 'Sketch'],
      },
      {
        title: 'Switch Vercel to Annual Billing',
        suggestion:
          'You can save 20% on your Vercel hosting costs by switching from a monthly to an annual plan.',
        relatedTransactions: ['Vercel Inc.'],
      },
    ],
    potentialDeductions: [
      {
        transactionName: 'Google Ads',
        transactionDate: '2024-07-26',
        amount: 150.0,
        category: 'Marketing',
        reason:
          'Advertising costs for your business are typically fully deductible.',
      },
      {
        transactionName: 'Vercel Inc.',
        transactionDate: '2024-07-27',
        amount: 20.0,
        category: 'Software/Hosting',
        reason:
          'Hosting and infrastructure costs are considered operational expenses and are deductible.',
      },
    ],
    disclaimer:
      'I am an AI assistant. Please consult a qualified professional for official financial advice.',
  },
  teamMembers: [
      { name: "Alice (You)", email: "alice@example.com", role: "Owner" },
      { name: "Bob", email: "bob@example.com", role: "Admin" },
      { name: "Charlie", email: "charlie@example.com", role: "Member" },
  ]
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function DemoPage() {
  const totalBalance = demoData.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-12">
        <Alert className="rounded-none border-x-0 border-t-0">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>You are viewing the FlowBank Pro Demo!</AlertTitle>
            <AlertDescription>
            This is a pre-populated demo to showcase what FlowBank can do. The data is for illustration only.
            <Button asChild size="sm" className="ml-4">
                <Link href="/signup">Create Your Account</Link>
            </Button>
            </AlertDescription>
        </Alert>

      {/* --- DASHBOARD OVERVIEW --- */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mb-6">Your financial command center.</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">Across all allocation accounts</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allocation Rules</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4 Active</div>
               <p className="text-xs text-muted-foreground">Profit, Taxes, Pay, Opex</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Members</div>
              <p className="text-xs text-muted-foreground">1 Owner, 1 Admin, 1 Member</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4 Suggestions</div>
               <p className="text-xs text-muted-foreground">2 savings, 2 tax deductions</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
             <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoData.recentTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-medium">{tx.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={tx.isIncome ? "default" : "secondary"} className={tx.isIncome ? "bg-green-600/20 text-green-700 hover:bg-green-600/30" : ""}>
                                            {formatCurrency(tx.amount)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Account Balances</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoData.accounts.map(acc => (
                                <TableRow key={acc.name}>
                                    <TableCell className="font-medium">{acc.name}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(acc.balance)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </section>

      {/* --- AI ADVISOR --- */}
       <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight">AI Financial Advisor</h2>
        <p className="text-muted-foreground mb-6">Actionable insights from your transaction data.</p>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Spending Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{demoData.aiAnalysis.spendingSummary}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Potential Tax Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                       {demoData.aiAnalysis.potentialDeductions.map((item, i) => (
                           <div key={i} className="p-4 border rounded-md">
                               <div className="flex justify-between items-start">
                                   <div>
                                       <p className="font-semibold">{item.transactionName} - <span className="text-sm text-muted-foreground">{item.category}</span></p>
                                       <p className="text-sm text-muted-foreground">{item.reason}</p>
                                   </div>
                                   <Badge variant="outline">{formatCurrency(item.amount)}</Badge>
                               </div>
                           </div>
                       ))}
                   </div>
                </CardContent>
            </Card>
        </div>
      </section>

        {/* --- REPORTING --- */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold tracking-tight">Reporting</h2>
        <p className="text-muted-foreground mb-6">Income vs. expenses and category trends.</p>
        <Card>
            <CardHeader>
                <CardTitle>Income vs. Expenses (12 months)</CardTitle>
            </CardHeader>
            <CardContent>
                <Image
                    src="https://picsum.photos/1200/400"
                    alt="Chart showing income vs expenses"
                    width={1200}
                    height={400}
                    className="rounded-lg"
                    data-ai-hint="bar chart finances"
                />
            </CardContent>
        </Card>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="container mx-auto px-4 text-center py-16">
        <h2 className="text-3xl font-bold">Ready to automate your finances?</h2>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Create your account to connect your own bank, set rules, and get real insights.
        </p>
        <Button size="lg" className="mt-6" asChild>
            <Link href="/signup">Get Started for Free</Link>
        </Button>
      </section>
    </div>
  );
}
