
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAISuggestion } from "@/app/actions";
import type { AllocationRule } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { Wand2 } from "lucide-react";

interface AIPlanGeneratorProps {
  onApplyRules: (rules: AllocationRule[]) => void;
}

export function AIPlanGenerator({ onApplyRules }: AIPlanGeneratorProps) {
  const [businessType, setBusinessType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ plan: any; explanation: string } | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!businessType) {
      toast({
        title: "Business Type Required",
        description: "Please enter a business type to get a suggestion.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestion(null);
    const result = await getAISuggestion({ businessType });
    setIsLoading(false);

    if (result.success && result.plan) {
      setSuggestion({
        plan: result.plan,
        explanation: result.explanation,
      });
    } else {
      toast({
        title: "AI Generation Failed",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };
  
  const handleApply = () => {
    if (!suggestion) return;
    const newRules: AllocationRule[] = Object.entries(suggestion.plan).map(
      ([name, percentage]) => ({
        id: nanoid(),
        name,
        percentage: percentage as number,
      })
    );
    onApplyRules(newRules);
    toast({
      title: "Rules Applied!",
      description: "The AI-suggested rules have been loaded. Review and save them.",
       className: "bg-accent text-accent-foreground",
    })
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Plan Generator</CardTitle>
        <CardDescription>
          Get an AI-powered allocation plan for your business type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="e.g., 'E-commerce Store', 'Coffee Shop'"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          />
        </div>
        {suggestion && (
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <h4 className="font-semibold">Suggested Plan:</h4>
            <div className="space-y-2">
                {Object.entries(suggestion.plan).map(([name, value]) => (
                    <div key={name} className="flex justify-between text-sm">
                        <span>{name}</span>
                        <span className="font-mono">{value}%</span>
                    </div>
                ))}
            </div>
            <h4 className="font-semibold pt-2">Explanation:</h4>
            <p className="text-sm text-muted-foreground">
              {suggestion.explanation}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "Generate Plan"}
        </Button>
        {suggestion && (
          <Button onClick={handleApply} variant="secondary" className="w-full">
            Apply this Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
