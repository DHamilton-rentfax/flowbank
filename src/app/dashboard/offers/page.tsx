
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import { suggestFinancialProducts } from '@/app/actions';
import type { FinancialProduct } from '@/ai/flows/suggest-financial-products';
import { Loader2, Wand2, CreditCard, Briefcase, PiggyBank } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const productIcons: { [key: string]: React.ReactNode } = {
    'Credit Card': <CreditCard />,
    'Business Loan': <Briefcase />,
    'High-Yield Savings Account': <PiggyBank />,
};

function OfferCard({ product }: { product: FinancialProduct }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                             {productIcons[product.productType] || <CreditCard />}
                            <span>{product.productName}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">{product.productType}</CardDescription>
                    </div>
                    <Badge variant="secondary">{product.category}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{product.recommendationReason}</p>
                <ul className="mt-4 space-y-2 text-sm">
                    {product.keyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">✔</span>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default function OffersPage() {
    const { plaidTransactions } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [offers, setOffers] = useState<FinancialProduct[] | null>(null);
    const { toast } = useToast();

    const handleGetOffers = async () => {
        setIsLoading(true);
        setOffers(null);
        const result = await suggestFinancialProducts({ transactions: plaidTransactions });
        setIsLoading(false);

        if (result.success && result.products) {
            setOffers(result.products);
            toast({
                title: "Offers Generated!",
                description: "Your personalized financial offers are ready.",
                className: "bg-accent text-accent-foreground"
            });
        } else {
            toast({
                title: "Failed to Get Offers",
                description: result.error || "Could not generate financial offers.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Personalized Offers</h1>
                    <p className="text-muted-foreground">
                        Discover financial products tailored to your business needs.
                    </p>
                </div>
                <Button onClick={handleGetOffers} disabled={isLoading || plaidTransactions.length === 0}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                    {isLoading ? "Finding Offers..." : "Find My Offers"}
                </Button>
            </div>
            
            {plaidTransactions.length === 0 && !isLoading && !offers && (
                 <Card className="text-center p-8 border-dashed">
                    <CardTitle>Connect Your Bank to See Offers</CardTitle>
                    <CardDescription className="mt-2 max-w-md mx-auto">
                        To get personalized financial product recommendations, please link your bank account and sync your transactions on the dashboard.
                    </CardDescription>
                </Card>
            )}

            {offers && offers.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((product, index) => (
                        <OfferCard key={index} product={product} />
                    ))}
                </div>
            )}

             {offers && offers.length === 0 && !isLoading && (
                 <Card className="text-center p-8 border-dashed">
                    <CardTitle>No Specific Offers Found Yet</CardTitle>
                    <CardDescription className="mt-2 max-w-md mx-auto">
                       We couldn't identify any specific product offers based on your current transaction history, but we're always adding new partners!
                    </CardDescription>
                </Card>
            )}

        </div>
    );
}
