'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function BillingPortalButton() {
  const { user } = useAuth()
  const router = useRouter()

  const handleClick = async () => {
    if (!user?.uid) return
    const { createPortalSession } = await import('@/app/actions/create-portal-session')
    const url = await createPortalSession(user.uid)
    if (url) {
      window.location.href = url
    } else {
      alert('No billing portal available.')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Manage Billing
    </button>
  )
}