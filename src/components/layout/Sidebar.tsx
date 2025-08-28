"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { hasFeatureAccess, Plan } from "@/lib/planFeatures";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for class names

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading, plan } = useAuth();

  const userPlan = plan || "free"; // Default to free if plan is not set

  const navItems = [
    { href: "/dashboard/free", label: "Free Features", feature: "view-dashboard" },
    { href: "/dashboard/starter", label: "Starter Features", feature: "basic-ai" }, // Assuming basic-ai is a feature introduced in Starter
    { href: "/dashboard/pro", label: "Pro Features", feature: "full-ai" }, // Assuming full-ai is a feature introduced in Pro
    { href: "/dashboard/enterprise", label: "Enterprise Features", feature: "team-seats" }, // Assuming team-seats is a feature introduced in Enterprise
    { href: "/dashboard/analytics", label: "Analytics", feature: "analytics" },
    { href: "/dashboard/team", label: "Team Management", feature: "team-seats" },
    { href: "/dashboard/integrations", label: "Integrations", feature: "integrations" },
    { href: "/dashboard/support", label: "Support", feature: "priority-support" }, // Assuming a support page for priority users
  ];

  if (loading || !user) return null; // Don't render sidebar if not authenticated or loading

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-900 p-6 space-y-6">
      <div className="text-2xl font-bold">FlowBank</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          hasFeatureAccess(userPlan as Plan, item.feature) && (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block py-2 px-4 rounded-md",
                pathname === item.href
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              {item.label}
            </Link>
          )
        ))}
      </nav>
    </div>
  );
}