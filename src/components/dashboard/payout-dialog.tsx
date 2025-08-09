
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createPayout } from "@/app/actions";
import { useApp } from "@/contexts/app-provider";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function PayoutDialog({ children }: { children: React.ReactNode }) {
    const { accounts } = useApp();
    const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        
        if (!selectedAccountId || isNaN(numericAmount) || numericAmount <= 0) {
            toast({
                title: "Invalid Input",
                description: "Please select an account and enter a positive payout amount.",
                variant: "destructive",
            });
            return;
        }

        if (selectedAccount && numericAmount > selectedAccount.balance) {
            toast({
                title: "Insufficient Balance",
                description: `The "${selectedAccount.name}" account does not have enough funds.`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const result = await createPayout(numericAmount, selectedAccountId);
        setIsLoading(false);

        if (result.success) {
            toast({
                title: "Payout Initiated!",
                description: result.message,
                className: "bg-accent text-accent-foreground",
            });
            setIsOpen(false);
            setAmount("");
            setSelectedAccountId(undefined);
        } else {
             toast({
                title: "Payout Failed",
                description: result.error,
                variant: "destructive",
            });
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Payout</DialogTitle>
                        <DialogDescription>
                            Transfer funds from a virtual account to your bank via Stripe.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="account" className="text-right">
                                From
                            </Label>
                            <Select onValueChange={setSelectedAccountId} value={selectedAccountId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            <div className="flex justify-between w-full">
                                                <span>{acc.name}</span>
                                                <span className="text-muted-foreground ml-4">{formatCurrency(acc.balance)}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <div className="relative col-span-3">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                <Input 
                                    id="amount" 
                                    type="number" 
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)} 
                                    className="pl-6" 
                                    placeholder="0.00" 
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 animate-spin" />}
                            Initiate Payout
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

    