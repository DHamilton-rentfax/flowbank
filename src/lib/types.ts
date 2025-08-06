
export type Account = {
  id: string;
  name: string;
  balance: number;
  goal?: {
    name: string;
    targetAmount: number;
  };
};

export type AllocationRule = {
  id: string;
  name: string;
  percentage: number;
};

export type Transaction = {
  id:string;
  date: string;
  totalAmount: number;
  allocations: {
    ruleId: string;
    amount: number;
  }[];
};

export interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    stripePriceId?: string;
}

export interface AddOn {
    id: string;
    name: string;
    description: string;
    price: number;
    stripePriceId: string;
}

export interface UserPlan {
    id: string;
    name: string;
    status: 'active' | 'trialing' | 'cancelled';
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    currentPeriodEnd?: number;
    addOns?: { [key: string]: boolean };
}
