"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContactForm } from '@/app/actions/contactForm';
export default function ContactPage() {
    const { toast } = useToast();
    const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await submitContactForm(form);
            if (result.success) {
                toast({ title: "Submission successful!", description: "Our sales team will get back to you shortly." });
                setForm({ name: "", email: "", company: "", message: "" });
            } else {
                throw new Error(result.error || "An unknown error occurred.");
            }
        } catch (error) {
            const err = error as Error;
            toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-12">
                <div className="container mx-auto max-w-xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">Contact Sales</CardTitle>
                            <CardDescription>
                                Interested in our Enterprise plan or have custom requirements? Fill out the form below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="John Doe" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <Input id="email" type="email" placeholder="you@company.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <Input id="company" placeholder="Acme Inc." value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="message">Tell us what you need</Label>
                                    <Textarea id="message" placeholder="Describe your requirements, team size, etc." rows={4} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
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
