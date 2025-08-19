
'use client'

import { Suspense } from 'react'
import AdminBlogPageContent from './AdminBlogPageContent'
import { Skeleton } from '@/components/ui/skeleton'

function AdminBlogSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
    )
}

export default function AdminBlogPage() {
  return (
    <Suspense fallback={<AdminBlogSkeleton />}>
      <AdminBlogPageContent />
    </Suspense>
  )
}
