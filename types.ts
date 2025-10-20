import { Currency } from './constants';

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isNewUser?: boolean;
  hasCompletedTour?: boolean;
  settings?: {
    currency: Currency;
    defaultDashboardView?: TimePeriod;
    actionPin?: string;
    securityQuestion?: string;
    securityAnswer?: string;
  };
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id:string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO string
  description: string;
  goalId?: string;
  isValid?: boolean;
  invalidationReason?: string;
  savingsMeta?: {
    previousAmount: number;
    currentAmount: number;
  }
}

export enum TimePeriod {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly',
}

export interface ChartData {
  name: string;
  income: number;
  expense: number;
}

export interface BackupData {
  transactions: Transaction[];
  habitCheckIns: string[];
  savingsGoals: SavingsGoal[];
  exportedAt: string;
  version: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  createdAt: string; // ISO string
  isDeletable?: boolean;
  unreadNotificationMessage?: string;
  isArchived?: boolean;
}