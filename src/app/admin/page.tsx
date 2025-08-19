"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { grantHighestTierPlan } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

function AdminNavLink({ href, title, description }: { href: string, title: string, description: string }) {
    return (
        <Link href={href} className="block p-4 border rounded-lg hover:bg-secondary transition-colors">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-primary">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
        </Link>
    )
}

export default function AdminPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({ title: "Error", description: "Please enter an email address.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const result = await grantHighestTierPlan(email);
            if (result.success) {
                toast({ title: "Success!", description: result.message });
                setEmail('');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error Granting Plan", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-8">
                <div className="container mx-auto max-w-4xl space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Panel</h1>
                        <p className="text-muted-foreground">Your mission control for FlowBank.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <AdminNavLink 
                            href="/admin/analytics"
                            title="Analytics Dashboard"
                            description="View key metrics, MRR, and user stats."
                        />
                        <AdminNavLink 
                            href="/admin/users"
                            title="User Management"
                            description="View, edit, and manage user roles."
                        />
                        <AdminNavLink 
                            href="/admin/audit-log"
                            title="Subscription Audit Log"
                            description="Track all billing-related events."
                        />
                         <AdminNavLink 
                            href="/admin/blog"
                            title="Blog Post Editor"
                            description="Create and manage content for the blog."
                        />
                        <AdminNavLink 
                            href="/admin/ai-campaign"
                            title="AI Upsell Campaign"
                            description="Target users for AI feature adoption."
                        />
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Grant Premium Plan</CardTitle>
                            <CardDescription>Quickly upgrade a user to the Pro plan for testing or support.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="flex items-end gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="email">User Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Granting...' : 'Grant Pro Plan'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
