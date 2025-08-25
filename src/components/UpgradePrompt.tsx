
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Plan = "free" | "starter" | "pro" | "enterprise";

interface UpgradePromptProps {
  currentPlan: Plan | string | null | undefined; // tolerate unexpected input
  requiredPlan: Exclude<Plan, "free">; // starter | pro | enterprise
}

const RANK: Record<Plan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export function UpgradePrompt({ currentPlan, requiredPlan }: UpgradePromptProps) {
  const router = useRouter();

  // normalize to a valid plan; default to "free" if unknown
  const norm = (p: any): Plan =>
    (typeof p === "string" && ["free", "starter", "pro", "enterprise"].includes(p.toLowerCase()))
      ? (p.toLowerCase() as Plan)
      : "free";

  const userPlan = norm(currentPlan);
  const shouldUpgrade = RANK[userPlan] < RANK[requiredPlan];

  if (!shouldUpgrade) return null;

  return (
    <div className="rounded-lg border bg-yellow-50 p-4 text-yellow-800 shadow-sm">
      <h3 className="text-lg font-semibold">Upgrade Required</h3>
      <p className="mt-1 text-sm">
        This feature requires a <strong>{requiredPlan}</strong> plan. You’re currently on the{" "}
        <strong>{userPlan}</strong> plan.
      </p>
      <div className="mt-3">
        <Button onClick={() => router.push("/pricing")}>Upgrade Now</Button>
      </div>
    </div>
  );
}
