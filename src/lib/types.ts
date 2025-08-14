
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
  destination?: {
    type: 'hold' | 'connected_account' | 'external';
    id: string | null;
  };
};

export type Transaction = {
  id:string;
  date: string;
  amount: number;
  name: string;
  isIncome: boolean;
  allocations?: {
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

export interface AddOn extends Plan {}

export type UserRole = 'admin' | 'editor' | 'user';

export interface UserPlan {
    id: string;
    name: string;
    status?: 'active' | 'trialing' | 'cancelled';
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    currentPeriodEnd?: number;
    role?: UserRole;
}

export interface UserAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    phone?: string;
    businessName?: string;
    address?: UserAddress;
    plan?: UserPlan;
    stripeCustomerId?: string;
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

export interface Post {
    slug: string;
    title: string;
    description: string;
    date: string;
    author: string;
    avatar: string;
    image: string;
    readTime: number;
    content: string; // This will now be HTML
    published?: boolean;
}
