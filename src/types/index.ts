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
  | 'recharge'
  | 'other';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Category {
  id: string;
  name: string;
  icon: IconKey;
  createdAt: number;
  updatedAt: number;
}

/**
 * A limit that takes effect in `effectiveMonth` and holds until a later row
 * replaces it. Storing changes this way keeps a past month showing the limit
 * that was actually in force at the time.
 */
export interface CategoryLimit {
  categoryId: string;
  /** Month index: year * 12 + zero-based month. */
  effectiveMonth: number;
  /** Limit in paise, or null when the limit was removed from that month on. */
  amount: number | null;
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
  /** The limit in force for the month being viewed, in paise; null when none. */
  monthlyLimit: number | null;
  spent: number;
  percent: number;
  status: BudgetStatus;
}
