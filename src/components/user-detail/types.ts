// Interfaces for API response data
export interface Address {
  addressLine1: string;
  addressLine2?: string;
}

export interface UserGoal {
  sipAmount: number;
  goalAmount: number;
  timePeriod: number;
  interestRate: number;
}

export interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  referredBy: string | null;
  referralCode: string;
  deeplink: string | null;
  callingCode: string;
  mobileNumber: string;
  email: string;
  panStatus: string;
  total_investment: number;
  current_balance: number;
  userRole: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gender: string;
  dob: string;
  address: Address;
  userGoal: UserGoal;
  subscription_date: string;
  main_subscription_status: number;
  fromApp?: string;
}

export interface Subscription {
  plan_id: number;
  plan_name: string;
}

export interface Transaction {
  transactionId: string;
  orderType: "BUY" | "SELL";
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
}

export interface StockOrder {
  stockId: number;
  buyQuantity: string;
  sellQuantity: string;
  quantityDifference: string;
  totalValue: number;
  avgValue: number;
  netValue: number;
  "stock.stockName": string;
  "stock.ticker": string;
}

export interface StockDetails {
  portfolioName: string;
  portfolioId: number;
  stockName: string;
  capType: string;
  stockType: string;
  sector: number;
  ticker: string;
  ltp: string;
  balanceQty: number;
  totalQty: number;
  averagePrice: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  investedValue: number;
  currentValue: number;
  stockId: number;
}

export interface PortfolioDetails {
  portfolioId: number;
  portfolioName: string;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  stocks: StockDetails[];
  totalInvestedValue: number;
}

export interface MutualFund {
  portfolioName: string;
  portfolioId: number | null;
  sipId: number;
  stockName: string;
  capType: string;
  stockType: string;
  sector: number;
  ticker: string;
  ltp: string;
  balanceQty: number;
  totalQty: number;
  averagePrice: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  investedValue: number;
  currentValue: number;
  stockId: number;
}

export interface Goal {
  id: number;
  name: string;
  termId: number;
  feePricing: string;
  imageUrl: string;
  description: string;
}

export interface SIP {
  id: number;
  userId: number;
  portfolioId: number;
  goalId: number;
  sipTenure: number;
  sipName: string;
  sipAmount: number;
  goalAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  next_installment_date?: string;      
  previous_installment_date?: string;  
  remaining_installments?: number;    
}

export interface MutualFundDetails {
  portfolioId: number | null;
  portfolioName: string;
  sipId: number;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  mutualFunds: MutualFund[];
  goal: Goal[];
  sip: SIP[];
}

export interface UserTabProps {
  userDetails: UserDetails;
  portfolioDetails: PortfolioDetails[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  stockOrders: StockOrder[];
  mutualFundDetails?: MutualFundDetails[];
  transactionsMF?: MutualFundTransaction[];
  financialPlan?: FinancialPlan;
  questions?: QuestionDefinition[];
}

export interface MutualFundOrder {
  id: number;
  scheme: string;
  schemeName: string;
  state: 'submitted' | 'failed' | 'successful';
  amount: number;
  processed_amount: number;
  failure_code: string | null;
  last_error: string | null;
}

export interface MutualFundTransaction {
  transactionId: string;
  userId: number;
  sipId: number;
  type: string;            
  lumpsumId: number | null; 
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  submittedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: 'FULLY_SUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'FAILED' | 'IN_PROCESS';
  createdAt: string;
  orders: MutualFundOrder[];
}

// Financial Plan Types
export interface QuestionItem {
  questionId?: number;
  value?: string | number | boolean | null;
  option?: string;
  question?: string;
}

export interface QuestionDefinition {
  questionId: number;
  question: string;
  option?: Record<string, string | number | boolean>;
}

export interface FinancialPlan {
  id?: number;
  userId?: number;
  personalDetails?: QuestionItem[];
  financialGoals?: Record<string, QuestionItem[]> | null;
  budgeting?: QuestionItem[] | null;
  assetsLiabilities?: Record<string, QuestionItem[]> | QuestionItem[] | null;
  insurancePlanning?: Record<string, QuestionItem[]> | null;
  healthScore?: Record<string, unknown> | null;
  wealthScore?: Record<string, unknown> | null;
  planPdf?: string;
  createdAt?: string;
  updatedAt?: string;
}