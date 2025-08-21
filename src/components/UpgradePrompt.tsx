tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface UpgradePromptProps {
  currentPlan: 'free' | 'starter' | 'pro' | 'enterprise'
  requiredPlan: 'starter' | 'pro' | 'enterprise'
}

export function UpgradePrompt({ currentPlan, requiredPlan }: UpgradePromptProps) {
  const router = useRouter()

  const planOrder = ['free', 'starter', 'pro', 'enterprise']
  const shouldUpgrade = planOrder.indexOf(currentPlan) < planOrder.indexOf(requiredPlan)

  if (!shouldUpgrade) return null

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-yellow-50 text-yellow-800">
      <h3 className="font-semibold text-lg">Upgrade Required</h3>
      <p className="text-sm mt-1">
        This feature requires a <strong>{requiredPlan}</strong> plan. You’re currently on the <strong>{currentPlan}</strong> plan.
      </p>
      <div className="mt-3">
        <Button onClick={() => router.push('/pricing')}>Upgrade Now</Button>
      </div>
    </div>
  )
}