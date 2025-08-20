
// In a real app, this data would be fetched from a database or a CMS.
// For this prototype, we're hardcoding it.
// It's designed to loosely match the structure of your stripe catalog config.

const plansAndAddons = {
    plans: [
        {
            id: 'starter',
            name: 'Starter',
            description: 'For individuals and small teams getting started.',
            features: [
                'Automatic income splitting',
                'Connect one bank account',
                'Basic AI allocation suggestions',
                'Email support'
            ],
            prices: [
                { interval: 'month', lookup_key: 'starter_month_usd', amount: 900 },
                { interval: 'year', lookup_key: 'starter_year_usd', amount: 9000 },
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'For growing businesses that need more power and automation.',
            features: [
                'Everything in Starter, plus:',
                'Connect multiple bank accounts',
                'Advanced rule creation',
                'AI Financial Advisor for tax & savings',
                'Priority email & chat support',
            ],
            prices: [
                { interval: 'month', lookup_key: 'pro_month_usd', amount: 2900 },
                { interval: 'year', lookup_key: 'pro_year_usd', amount: 29000 },
            ],
            highlight: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'For large teams with custom needs.',
            features: [
                'Everything in Pro, plus:',
                'Custom onboarding & setup',
                'Dedicated success manager',
                'Team management & roles',
                'Custom integrations (SLA)',
            ],
            prices: [
                { interval: 'month', lookup_key: 'enterprise_month_usd', amount: 24900, customLabel: "Contact Us" },
            ]
        },
    ],
    addons: [
        {
            id: 'ai_optimization',
            name: 'AI Optimization',
            description: "Unlock personalized tax coaching, spending insights, subscription analysis, and savings opportunities—powered by your real transactions.",
            prices: [
                { interval: 'month', lookup_key: 'addon_ai_optimization_month_usd', amount: 1400 },
                { interval: 'year', lookup_key: 'addon_ai_optimization_year_usd', amount: 14000 },
            ]
        },
        {
            id: 'priority_support',
            name: 'Priority Support',
            description: 'Get 24/7 response times and a dedicated Slack channel for your team.',
            prices: [
                { interval: 'month', lookup_key: 'addon_support_month_usd', amount: 1900 },
                { interval: 'year', lookup_key: 'addon_support_year_usd', amount: 19000 },
            ]
        },
    ]
};

export async function getPricingPlans() {
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return plansAndAddons;
}
