import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  price: string;
  features: string[];
  cta: string;
  onClick?: () => void;
  badge?: string;
  footnote?: string;
  highlight?: boolean;
};

export function PricingCard({
  title, price, features, cta, onClick, badge, footnote, highlight,
}: Props) {
  return (
    <Card className={`flex h-full flex-col ${highlight ? "ring-2 ring-black" : ""}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-muted-foreground">{title}</CardTitle>
          {badge && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{badge}</span>
          )}
        </div>
        <div className="text-4xl font-bold">{price}</div>
      </CardHeader>

      {/* Let this section grow; pushes footer to the bottom */}
      <CardContent className="flex flex-1 flex-col gap-2">
        <ul className="space-y-1 text-sm">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <span>•</span><span>{f}</span>
            </li>
          ))}
        </ul>
        {/* Spacer to push button down regardless of feature count */}
        <div className="mt-auto" />
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-2">
        <Button onClick={onClick} className="h-11 w-full">{cta}</Button>
        {footnote && (
          <p className="text-center text-xs text-muted-foreground">{footnote}</p>
        )}
      </CardFooter>
    </Card>
  );
}