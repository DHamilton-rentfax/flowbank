
import { useTransition } from 'react'
import { createPortalSession } from '@/app/actions/create-portal-session'
import { Button } from '@/components/ui/button'

export function BillingPortalButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() => startTransition(() => createPortalSession())}
      disabled={isPending}
    >
      {isPending ? 'Loading...' : 'Manage Billing'}
    </Button>
  );
}