
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
  id: string;
  date: string;
  totalAmount: number;
  allocations: {
    ruleId: string;
    amount: number;
  }[];
};
