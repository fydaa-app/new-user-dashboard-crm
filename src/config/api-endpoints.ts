/**
 * API Endpoints Configuration
 * 
 * This file contains all API endpoint paths organized by feature.
 * Base URLs are stored in environment variables, and endpoints are defined here.
 */

// Authentication Endpoints
export const AuthEndpoints = {
  LOGIN: "/referrals/login",
  FORGOT_PASSWORD: "/referrals/employee/send-password-reset-otp",
  RESET_PASSWORD: "/referrals/employee/verify-otp-reset-password",
  RESET_PASSWORD_WITH_TOKEN: "/referrals/employee/verify-otp-reset-password",
  VALIDATE_RESET_TOKEN: "/referrals/validate-reset-token",
} as const;

// User Endpoints
export const UserEndpoints = {
  USER_LIST: "/referrals/user-list",
  USER_LIST_MF: "/referrals/user-list-mf", // Fydaa app type
  USER_DETAILS: "/referrals/view-user", // Matches .env NEXT_PUBLIC_USER_DETAILS_ENDPOINT
  LEAD_USER_LIST: "/referrals/lead-user-list",
  LEAD_USER_LIST_MF: "/referrals/lead-user-list-mf", // Fydaa app type
  VIEW_USER_PROFILE: "/referrals/view-profile", // Matches .env NEXT_PUBLIC_VIEW_USER_PROFILE_ENDPOINT
} as const;

// Transaction Endpoints
export const TransactionEndpoints = {
  TRANSACTIONS_LIST: "/referrals/transactions-list",
  TRANSACTIONS_LIST_MF: "/referrals/transactions-list-mf", // Fydaa app type
  TRANSACTIONS_LIST_SIP_MF: "/referrals/transactions-list-sip-mf",
} as const;

// Portfolio & Stock Endpoints (Stock API)
export const StockEndpoints = {
  PORTFOLIO: "/orders/portfolio",
  PORTFOLIO_LIST: "portfolio/portfolioList", // Matches .env NEXT_PUBLIC_PORTFOLIO_ENDPOINT
  PORTFOLIO_LIST_MF: "/referrals/portfolio-list-mf", // Fydaa app type
  PORTFOLIO_CARDS_MF: "/referrals/portfolio-cards-mf", // Fydaa app type - cards/totals only
  STOCK_LIST: "/orders/stock-list",
  USER_XIRR: "/orders/getUserXirrForAllTimePeriods",
  DASHBOARD_LIST: "stock/getDashboardData", // Matches .env NEXT_PUBLIC_DASHBOARD_LIST_ENDPOINT
} as const;

// SIP Endpoints
export const SipEndpoints = {
  ACTIVE_SIP_LIST_MF: "/referrals/active-sip-list-mf",
  INACTIVE_SIP_LIST_MF: "/referrals/inactive-sip-list-mf",
  INVESTED_SIP_LIST_MF: "/referrals/invested-sip-list-mf",
  CANCELLED_SIP_LIST_MF: "/referrals/cancelled-sip-list-mf",
  COMPLETED_SIP_LIST_MF: "/referrals/completed-sip-list-mf",
  IN_PROGRESS_SIP_LIST_MF: "/referrals/inProgress-sip-list-mf",
  PARTIALLY_EXITED_SIP_LIST_MF: "/referrals/partially-exited-sip-list-mf",
  BEHIND_GOALS_SIP_LIST_MF: "/referrals/behind-goals-list",
} as const;

// Dashboard & Analytics Endpoints
export const DashboardEndpoints = {
  // Cards & Summary
  CARD_DATA: "/referrals/cards-data", // Matches .env NEXT_PUBLIC_CARD_ENDPOINT (case sensitive!)
  REVENUE_CARDS: "/referrals/revenue-cards",
  CARD_DATA_MF: "/referrals/cards-data-mf",
  SIP_CARDS_DATA_MF: "/referrals/sip-cards-data-mf",
  TRANSACTIONS_SUMMARY_MF: "/referrals/transactions-summary-mf",
  
  // Goal Cards
  GOAL_CARDS: "/referrals/goal-cards",
  GOALS_BY_CATEGORY: "/referrals/goals-by-category",
  BEHIND_GOALS_LIST: "/referrals/behind-goals-list",
  
  // Packages Analytics
  PACKAGES_ANALYTICS: "/referrals/packages-analytics",
  
  // Charts & Reports
  SALE_ENDPOINT: "/referrals/sales-report",
  SALES_REPORT_MF: "/referrals/sales-report-mf",
  TARGET_ENDPOINT: "/referrals/employee-progress-summary",
  EMPLOYEE_PROGRESS_SUMMARY_MF: "/referrals/employee-progress-summary-mf",
  TARGET_REALITY_CHART: "/referrals/target-reality", // Matches .env NEXT_PUBLIC_TARGET_REALITY_CHART_ENDPOINT (no -chart suffix!)
  TARGET_REALITY_MF: "/referrals/target-reality-mf",
  
  // Top Lists
  TOP_GOALS: "/referrals/top-goals",
  TOP_GOALS_MF: "/referrals/top-goals-mf",
  TOP_PACKAGES: "/referrals/top-packages",
  TOP_PACKAGES_MF: "/referrals/top-packages-mf",
  RECENT_ORDERS: "/referrals/recent-orders",
  RECENT_ORDERS_MF: "/referrals/recent-orders-mf",
} as const;

// Leaderboard Endpoints
export const LeaderboardEndpoints = {
  LEADERBOARD_LIST: "/referrals/leaderboard-list", // Matches .env NEXT_PUBLIC_LEADERBOARD_LIST_ENDPOINT (has -list!)
  LEADERBOARD_LIST_MF: "/referrals/leaderboard-list-mf", // Fydaa app type (if exists)
} as const;

// Admin & Management Endpoints
export const AdminEndpoints = {
  ADMIN_PARTNERS_LIST: "/referrals/admin/partners",
  DESIGNATION_LIST: "/referrals/designation-list",
  ROLE_NAME_MAP: "/referrals/role-name-map",
  ROLE_WISE_EMPLOYEE_LIST: "/referrals/role-wise-employee-list",
  PAYMENTS_LIST: "/referrals/payments-list",
  PAYMENTS_LIST_MF: "/referrals/payments-list-mf", // Fydaa app type
} as const;

// Lead Management Endpoints
export const LeadEndpoints = {
  LEADS: "/referrals/leads",
  LEAD_BY_ID: "/referrals/leads",
  LEAD_STATS: "/referrals/leads/stats",
  UPDATE_LEAD_STATUS: "/referrals/leads",
  ASSIGN_LEAD: "/referrals/leads",
} as const;

// Partner/Payout Endpoints
export const PayoutEndpoints = {
  PARTNER_EARNINGS: "/referrals/partner/earnings",
  PARTNER_EARNINGS_LIST: "/referrals/partner/earnings/list",
  WITHDRAWAL_ACCOUNT_STATUS: "/referrals/partner/withdrawal-account-status",
  SETUP_WITHDRAWAL_ACCOUNT: "/referrals/partner/setup-withdrawal-account",
  WITHDRAW_DIRECT: "/referrals/partner/withdraw-direct",
  CALCULATE_EARNINGS: "/referrals/partner/earnings/calculate",
  CHECK_PENDING_WITHDRAWALS: "/referrals/partner/withdraw/pending-status",
  CHECK_WITHDRAWAL_STATUS: "/referrals/partner/withdraw/check-status",
} as const;

// Mutual Fund Endpoints
export const MutualFundEndpoints = {
  MUTUAL_FUND: "mutualFund", // Matches .env NEXT_PUBLIC_MUTUAL_FUND_ENDPOINT
  ADD_MUTUAL_FUND: "mutualFund", // Matches .env NEXT_PUBLIC_ADD_MUTUAL_FUND_ENDPOINT
  UPDATE_MUTUAL_FUND: "mutualFund", // Matches .env NEXT_PUBLIC_UPDATE_MUTUAL_FUND_ENDPOINT
  MUTUAL_FUND_LIST: "mutualFund/mutual-funds-list", // Matches .env NEXT_PUBLIC_MUTUAL_FUND_LIST_ENDPOINT
  FUND_SCHEMES: "mutualFund/fund-schemes", // Matches .env NEXT_PUBLIC_FUND_SCHEMES_ENDPOINT
  AMC: "mutualFund/amcs", // Matches .env NEXT_PUBLIC_AMC_ENDPOINT
} as const;

// Portfolio Endpoints (Additional)
export const PortfolioEndpoints = {
  ADD_PORTFOLIO: "portfolio", // Matches .env NEXT_PUBLIC_ADD_PORTFOLIO_ENDPOINT
} as const;

// Payment Endpoints
export const PaymentEndpoints = {
  USER_ACCOUNT_LEDGERS: "/subscription/account-ledgers/user",
} as const;

// Financial Plan Endpoints
export const FinancialPlanEndpoints = {
  FINANCIAL_PLAN: "/financial-plan",
  FINANCIAL_PLAN_BY_USER: "/financial-plan/admin/{userId}", // Admin endpoint to fetch plan by userId
  ADMIN_UPDATE_PERSONAL_DETAILS: "/financial-plan/admin/{userId}/personal-details",
  ADMIN_UPDATE_FINANCIAL_GOALS: "/financial-plan/admin/{userId}/financial-goals",
  ADMIN_UPDATE_BUDGETING: "/financial-plan/admin/{userId}/budgeting",
  ADMIN_UPDATE_ASSETS_LIABILITIES: "/financial-plan/admin/{userId}/assets-liabilities",
  ADMIN_UPDATE_INSURANCE_PLANNING: "/financial-plan/admin/{userId}/insurance-planning",
  QUESTIONS: "/financial-plan/questions",
  ADMIN_RECALCULATE_HEALTH_SCORE: "/financial-plan/admin/health-score/recalculate/{userId}",
  ADMIN_RECALCULATE_WEALTH_SCORE: "/financial-plan/admin/wealth-score/recalculate/{userId}",
} as const;

// Export all endpoints as a single object for convenience
export const APIEndpoints = {
  ...AuthEndpoints,
  ...UserEndpoints,
  ...TransactionEndpoints,
  ...StockEndpoints,
  ...SipEndpoints,
  ...DashboardEndpoints,
  ...LeaderboardEndpoints,
  ...AdminEndpoints,
  ...LeadEndpoints,
  ...PayoutEndpoints,
  ...MutualFundEndpoints,
  ...PortfolioEndpoints,
  ...FinancialPlanEndpoints,
  ...PaymentEndpoints,
} as const;

// Type exports for TypeScript autocomplete
export type AuthEndpoint = typeof AuthEndpoints[keyof typeof AuthEndpoints];
export type UserEndpoint = typeof UserEndpoints[keyof typeof UserEndpoints];
export type TransactionEndpoint = typeof TransactionEndpoints[keyof typeof TransactionEndpoints];
export type StockEndpoint = typeof StockEndpoints[keyof typeof StockEndpoints];
export type SipEndpoint = typeof SipEndpoints[keyof typeof SipEndpoints];
export type DashboardEndpoint = typeof DashboardEndpoints[keyof typeof DashboardEndpoints];
export type LeaderboardEndpoint = typeof LeaderboardEndpoints[keyof typeof LeaderboardEndpoints];
export type AdminEndpoint = typeof AdminEndpoints[keyof typeof AdminEndpoints];
export type PayoutEndpoint = typeof PayoutEndpoints[keyof typeof PayoutEndpoints];
export type MutualFundEndpoint = typeof MutualFundEndpoints[keyof typeof MutualFundEndpoints];
export type PortfolioEndpoint = typeof PortfolioEndpoints[keyof typeof PortfolioEndpoints];
export type FinancialPlanEndpoint = typeof FinancialPlanEndpoints[keyof typeof FinancialPlanEndpoints];
export type PaymentEndpoint = typeof PaymentEndpoints[keyof typeof PaymentEndpoints];

