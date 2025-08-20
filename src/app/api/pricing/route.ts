
import { NextResponse } from 'next/server';
import { getPricingProducts, getPricingAddons } from '@/app/actions/get-pricing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interval = (searchParams.get('interval') || 'month') as 'month' | 'year';

    const [plans, addons] = await Promise.all([
      getPricingProducts(interval),
      getPricingAddons(interval)
    ]);

    return NextResponse.json({ plans, addons });

  } catch (error) {
    console.error('API Pricing Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
