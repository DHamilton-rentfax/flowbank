

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

export type UserRole = 'admin' | 'editor' | 'user';

export interface UserPlan {
    id: string;
    name: string;
    status: 'active' | 'trialing' | 'cancelled';
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    stripeAccountId?: string;
    currentPeriodEnd?: number;
    addOns?: { [key: string]: boolean };
    paymentLinks?: number;
    role?: UserRole;
}

export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    plan: UserPlan;
}

export interface PaymentLink {
    id: string;
    userId: string;
    description: string;
    amount: number;
    url: string;
    createdAt: string;
    status: 'active' | 'archived';
}

    