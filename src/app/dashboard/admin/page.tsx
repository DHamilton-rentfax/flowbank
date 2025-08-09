
"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const UserManagement = dynamic(() => import('@/components/settings/user-management').then(mod => mod.UserManagement), {
    loading: () => <Skeleton className="h-80" />,
    ssr: false,
});


export default function AdminPage() {
    return (
         <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-muted-foreground">
                    Manage users and system settings.
                </p>
            </div>
            <UserManagement />
        </div>
    )
}
