
'use client'

import * as React from 'react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type BillingToggleProps = {
  value: 'month' | 'year'
  onChange: (val: 'month' | 'year') => void
}

export function BillingToggle({ value, onChange }: BillingToggleProps) {
  const isAnnual = value === 'year'

  return (
    <div className="flex items-center gap-4 justify-center mt-6 mb-8">
      <span className={cn("text-sm font-medium", !isAnnual ? 'text-primary' : 'text-muted-foreground')}>
        Monthly
      </span>
      <Switch
        checked={isAnnual}
        onCheckedChange={(checked) => onChange(checked ? 'year' : 'month')}
        className="data-[state=checked]:bg-primary"
      />
      <span className={cn("text-sm font-medium", isAnnual ? 'text-primary' : 'text-muted-foreground')}>
        Annually <span className="text-xs ml-1 text-muted-foreground">(Save ~16%)</span>
      </span>
    </div>
  )
}
