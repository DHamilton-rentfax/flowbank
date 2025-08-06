
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from "@/app/actions";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast({
        title: "Feedback cannot be empty",
        description: "Please write something before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await submitFeedback(feedback);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Feedback Submitted!",
        description: result.message,
        className: "bg-accent text-accent-foreground",
      });
      setFeedback(""); // Clear the textarea
    } else {
      toast({
        title: "Submission Failed",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Share Your Feedback</h1>
        <p className="text-muted-foreground">
          We value your input! Let us know what you think or what we can improve.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Your Feedback</CardTitle>
            <CardDescription>
              What's on your mind? Feature requests, bug reports, or general comments are all welcome.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="I'd love to see a feature that..."
              rows={8}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
              {isLoading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
