export type IconKey =
  | 'food'
  | 'groceries'
  | 'transport'
  | 'shopping'
  | 'home'
  | 'rent'
  | 'entertainment'
  | 'bills'
  | 'travel'
  | 'coffee'
  | 'health'
  | 'education'
  | 'fitness'
  | 'gift'
  | 'savings'
  | 'other';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Category {
  id: string;
  name: string;
  icon: IconKey;
  /** Monthly limit in paise, or null when the category has no limit. */
  monthlyLimit: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  categoryId: string;
  name: string;
  /** Amount in paise. */
  amount: number;
  icon: IconKey;
  /** Unix ms timestamp of when the expense occurred. */
  expenseDate: number;
  createdAt: number;
  updatedAt: number;
}

export type BudgetStatus = 'none' | 'normal' | 'warning' | 'danger';

export interface CategoryWithSpend extends Category {
  spent: number;
  percent: number;
  status: BudgetStatus;
}
