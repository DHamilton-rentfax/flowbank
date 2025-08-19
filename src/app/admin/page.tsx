
"use client";

import React, 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

function AdminNavLink({ href, title, description, disabled = false }: { href: string, title: string, description: string, disabled?: boolean }) {
    const content = (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-primary">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
    );

    if (disabled) {
        return (
            <div className="block p-4 border rounded-lg bg-secondary/50 cursor-not-allowed opacity-60">
                {content}
            </div>
        )
    }

    return (
        <Link href={href} className="block p-4 border rounded-lg hover:bg-secondary transition-colors">
            {content}
        </Link>
    )
}

export default function AdminPage() {
    const { user } = useAuth();
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-8">
                <div className="container mx-auto max-w-4xl space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Panel</h1>
                        <p className="text-muted-foreground">Welcome, {user?.email || 'Admin'}. Your mission control for FlowBank.</p>
                    </div>

                    <Card>
                         <CardHeader>
                            <CardTitle>Dashboards</CardTitle>
                            <CardDescription>View key metrics, user activity, and system health.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <AdminNavLink 
                                href="/admin/analytics"
                                title="Analytics Dashboard"
                                description="View key metrics, MRR, and user stats."
                            />
                             <AdminNavLink 
                                href="/admin/retention"
                                title="Retention & Churn"
                                description="Analyze user cohorts and churn rates."
                                disabled
                            />
                            <AdminNavLink 
                                href="/admin/funnel"
                                title="Signup Funnel"
                                description="Track user conversion through key stages."
                                disabled
                            />
                             <AdminNavLink 
                                href="/admin/blog-analytics"
                                title="Blog Analytics"
                                description="Measure content performance and impact."
                                disabled
                            />
                        </CardContent>
                    </Card>

                     <Card>
                         <CardHeader>
                            <CardTitle>Management</CardTitle>
                            <CardDescription>Tools for managing users, content, and system settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
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
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>Operations</CardTitle>
                            <CardDescription>Configure and monitor automated system jobs.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                           <AdminNavLink
                                href="/admin/cron-config"
                                title="Cron Job Settings"
                                description="Configure scheduled tasks like daily digests."
                            />
                             <AdminNavLink
                                href="/admin/cron-history"
                                title="Cron Job Run History"
                                description="View the execution history of scheduled tasks."
                            />
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
