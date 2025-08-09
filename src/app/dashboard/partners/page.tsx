
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Scale, BookUser } from "lucide-react";
import Image from "next/image";

const partners = [
    {
        name: "TaxPro Connect",
        service: "Tax Preparation & Advisory",
        description: "Expert tax services for freelancers and small businesses. Maximize deductions and stay compliant year-round.",
        logo: <Scale className="w-8 h-8 text-primary"/>,
        image: "https://placehold.co/600x400.png",
        aiHint: "accountant office"
    },
    {
        name: "Bookkeepify",
        service: "Automated Bookkeeping",
        description: "Effortless bookkeeping that syncs with your accounts, providing monthly reports and financial clarity.",
        logo: <BookUser className="w-8 h-8 text-primary"/>,
        image: "https://placehold.co/600x400.png",
        aiHint: "neat desk"
    },
    {
        name: "Founder's Legal",
        service: "Business Formation & Legal Docs",
        description: "Incorporate your business, get operating agreements, and access legal templates designed for startups.",
        logo: <Building className="w-8 h-8 text-primary"/>,
        image: "https://placehold.co/600x400.png",
        aiHint: "modern law office"
    }
]

function PartnerCard({ partner }: { partner: typeof partners[0] }) {
    return (
        <Card className="flex flex-col overflow-hidden">
             <div className="relative w-full h-40">
                <Image 
                    src={partner.image} 
                    alt={partner.name}
                    fill
                    className="object-cover"
                    data-ai-hint={partner.aiHint}
                />
            </div>
            <CardHeader className="flex flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {partner.logo}
                </div>
                <div>
                    <CardTitle>{partner.name}</CardTitle>
                    <CardDescription>{partner.service}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">{partner.description}</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="outline">Learn More</Button>
            </CardFooter>
        </Card>
    )
}


export default function PartnersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Recommended Partners</h1>
        <p className="text-muted-foreground">
          A curated list of trusted service providers to help you grow your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map(partner => (
            <PartnerCard key={partner.name} partner={partner} />
        ))}
      </div>
    </div>
  );
}
