'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface StripePrice {
  id: string;
  unit_amount: number;
  recurring: { interval: string };
  metadata: { name: string };
}

export default function PricingPage() {
  const { user, loading: loadingAuth } = useAuth();
  const router = useRouter();

  const [monthly, setMonthly] = useState(true);
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { getStripePrices } = await import('@/app/actions/get-stripe-prices'); // Dynamic import
        const fetchedPrices = await getStripePrices();
        if (fetchedPrices) {
          setPrices(fetchedPrices);
        } else {
          setError('Failed to fetch pricing plans.');
        }
      } catch (err) {
        console.error('Failed to fetch prices:', err);
        setError('Failed to load pricing plans.');
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
  }, []);

  const filteredPrices = prices.filter(price =>
    monthly ? price.recurring.interval === 'month' : price.recurring.interval === 'year'
  );

  const formatPrice = (price: StripePrice) => {
    const amount = price.unit_amount / 100;
    return `${amount.toFixed(2)}`;
  };

  const handleSubscribe = async (priceId: string) => {
    if (loadingAuth) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setSubscribing(true);
    setError(null);

    try {
      const { createCheckoutSession } = await import('@/app/actions/create-checkout-session'); // Dynamic import
      const { url, error: sessionError } = await createCheckoutSession(user.uid, priceId);

      if (sessionError) {
        setError(sessionError);
      } else if (url) {
        window.location.assign(url); // Redirect to Stripe Checkout
      } else {
        setError('Something went wrong creating checkout session.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to initiate checkout.');
    } finally {
      setSubscribing(false);
    }
  };

  const renderFeatures = (price: StripePrice) => {
    // This is a placeholder. You should ideally fetch features
    // based on price.metadata or a separate config.
    switch (price.metadata.name.toLowerCase()) {
      case 'basic':
        return (
          <ul className="text-gray-600 space-y-2">
            <li>✓ Up to 100 transactions</li>
            <li>✓ Basic financial analysis</li>
          </ul>
        );
      case 'pro':
        return (
          <ul className="text-gray-600 space-y-2">
            <li>✓ Unlimited transactions</li>
            <li>✓ Advanced financial analysis</li>
            <li>✓ Tax optimization suggestions</li>
          </ul>
        );
      case 'enterprise':
        return (
          <ul className="text-gray-600 space-y-2">
            <li>✓ All Pro features</li>
            <li>✓ Dedicated support</li>
            <li>✓ Custom integrations</li>
          </ul>
        );
      default:
        return null;
    }
  };


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Pricing Plans</h1>

      <div className="flex justify-center mb-8">
        <button
          className={`px-6 py-2 rounded-l-md ${monthly ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setMonthly(true)}
        >
          Monthly
        </button>
        <button
          className={`px-6 py-2 rounded-r-md ${!monthly ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setMonthly(false)}
        >
          Annually
        </button>
      </div>

      {loadingPrices ? (
        <div className="text-center">Loading plans...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPrices.map(price => (
            <div key={price.id} className="border rounded-lg p-6 shadow-md flex flex-col">
              <h2 className="text-xl font-semibold mb-4">{price.metadata.name}</h2>
              <div className="text-3xl font-bold mb-4">${formatPrice(price)}{monthly ? '/mo' : '/yr'}</div>

              <div className="flex-grow mb-6">
                 {renderFeatures(price)}
              </div>

              <button
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                onClick={() => handleSubscribe(price.id)}
                disabled={subscribing || loadingAuth || !user}
              >
                {subscribing ? 'Processing...' : user ? 'Subscribe' : 'Sign In to Subscribe'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}