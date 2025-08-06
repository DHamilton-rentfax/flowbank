
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createPaymentLink } from "@/app/actions";
import { useApp } from "@/contexts/app-provider";
import { formatCurrency } from "@/lib/utils";
import { Loader2, PlusCircle, Copy, Check, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";

function CreatePaymentLinkDialog() {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!description || isNaN(numericAmount) || numericAmount <= 0) {
            toast({
                title: "Invalid Input",
                description: "Please enter a valid description and a positive amount.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const result = await createPaymentLink(description, numericAmount);
        setIsLoading(false);

        if (result.success) {
            toast({
                title: "Payment Link Created!",
                description: "Your new payment link is ready to be shared.",
                className: "bg-accent text-accent-foreground",
            });
            setIsOpen(false);
            setDescription("");
            setAmount("");
        } else {
            toast({
                title: "Error",
                description: result.error || "Could not create payment link.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    New Payment Link
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Payment Link</DialogTitle>
                        <DialogDescription>
                            Enter the details for your new payment link. A unique URL will be generated to accept the payment via Stripe.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="e.g., 'Web Design Services'" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">Amount</Label>
                            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="e.g., '1500'" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 animate-spin" />}
                            Create Link
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CopyButton({ text }: { text: string }) {
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
            {isCopied ? <Check className="text-green-500" /> : <Copy />}
        </Button>
    );
}


export default function PaymentsPage() {
    const { paymentLinks, loadingData, userPlan } = useApp();
    const hasStripeAccount = !!userPlan?.stripeSubscriptionId; // A proxy to know if they've connected stripe

    if (loadingData) {
        return <div>Loading payments...</div>
    }

    if (!hasStripeAccount) {
        return (
            <Card className="text-center p-8 border-dashed">
                 <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8"/>
                    </div>
                </div>
                <CardTitle>Stripe Account Required</CardTitle>
                <CardDescription className="mt-2 max-w-md mx-auto">
                    To create payment links and accept money from your clients, you first need to connect your Stripe account.
                </CardDescription>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/settings">Connect Stripe Account</Link>
                </Button>
            </Card>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payments</h1>
                    <p className="text-muted-foreground">Create and manage links to get paid by your clients.</p>
                </div>
                <CreatePaymentLinkDialog />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Payment Links</CardTitle>
                    <CardDescription>A list of all your created payment links.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Created</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentLinks.length > 0 ? (
                                paymentLinks.map((link) => (
                                    <TableRow key={link.id}>
                                        <TableCell>{new Date(link.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-medium">{link.description}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(link.amount)}</TableCell>
                                        <TableCell className="text-center capitalize">{link.status}</TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-1">
                                            <CopyButton text={link.url} />
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        You haven't created any payment links yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
