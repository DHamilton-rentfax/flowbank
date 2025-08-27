
// Realistic seed data for the demo (no PII)
export type Account = { id: string; name: string; type: "checking" | "savings"; balance: number };
export type Transaction = { id: string; date: string; desc: string; amount: number; category: string };
export type Rule = { id: string; name: string; percent: number; toAccountId: string };
export type Insight = { id: string; title: string; detail: string; impactMonthly: number };
export type TeamMember = { id: string; name: string; role: "Owner" | "CFO" | "Accountant" };

export const accounts: Account[] = [
  { id: "acc_main", name: "Business Checking", type: "checking", balance: 18250.27 },
  { id: "acc_tax", name: "Taxes", type: "savings", balance: 12540.00 },
  { id: "acc_marketing", name: "Marketing", type: "savings", balance: 3890.12 },
  { id: "acc_savings", name: "Profit Savings", type: "savings", balance: 7420.55 },
];

export const transactions: Transaction[] = [
  { id: "t1", date: "2025-08-15", desc: "Stripe Payout", amount: 4200, category: "Income" },
  { id: "t2", date: "2025-08-14", desc: "Google Ads", amount: -650, category: "Marketing" },
  { id: "t3", date: "2025-08-13", desc: "Payroll", amount: -2100, category: "Payroll" },
  { id: "t4", date: "2025-08-12", desc: "AWS", amount: -240, category: "Software" },
  { id: "t5", date: "2025-08-12", desc: "Stripe Payout", amount: 3100, category: "Income" },
];

export const rules: Rule[] = [
  { id: "r_tax", name: "Taxes", percent: 30, toAccountId: "acc_tax" },
  { id: "r_marketing", name: "Marketing", percent: 20, toAccountId: "acc_marketing" },
  { id: "r_profit", name: "Profit Savings", percent: 10, toAccountId: "acc_savings" },
  // Remaining 40% implicitly stays in Business Checking
];

export const insights: Insight[] = [
  { id: "i1", title: "Lower SaaS Spend", detail: "Renegotiate or remove duplicate tools (Figma team seats & cloud backups).", impactMonthly: 180 },
  { id: "i2", title: "Refinance Ads CAC", detail: "Switch 20% of search spend to branded content; expected CAC ↓ ~12%.", impactMonthly: 230 },
  { id: "i3", title: "Quarterly Tax Cushion", detail: "You’re ahead by ~$1,540 in the tax bucket; move 25% to Profit.", impactMonthly: 0 },
];

export const team: TeamMember[] = [
  { id: "u1", name: "Dominique Hamilton", role: "Owner" },
  { id: "u2", name: "Avery Chen", role: "CFO" },
  { id: "u3", name: "Jordan Patel", role: "Accountant" },
];
