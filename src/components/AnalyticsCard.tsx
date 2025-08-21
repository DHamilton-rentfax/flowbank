tsx
'use client'

import { useEffect, useState } from 'react'

type Analytics = {
  incomeSplitRuns?: number
  aiInsightsGenerated?: number
  connectedAccounts?: number
  lastUpdated?: string
}

export default function AnalyticsCard() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    async function fetchData() {
      const mod = await import('@/app/actions/get-analytics')
      const analytics = await mod.getAnalyticsSnapshot()
      setData(analytics)
    }
    fetchData()
  }, [])

  if (!data) return <div className="text-sm text-gray-500">Loading analytics...</div>

  return (
    <div className="rounded-xl bg-white shadow p-4 space-y-2">
      <div className="font-semibold text-lg">Usage Summary</div>
      <div>🏦 Bank Accounts Connected: {data.connectedAccounts || 0}</div>
      <div>📊 Income Splits Run: {data.incomeSplitRuns || 0}</div>
      <div>🧠 AI Insights Generated: {data.aiInsightsGenerated || 0}</div>
      <div className="text-xs text-gray-400">
        Last Updated: {data.lastUpdated || 'Unknown'}
      </div>
    </div>
  )
}