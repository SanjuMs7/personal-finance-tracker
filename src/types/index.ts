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

/** An inclusive run of days that spending is measured over. Both ends are
 *  midday timestamps, so a DST shift can never tip either into the next day. */
export interface Period {
  start: number;
  end: number;
}

/**
 * A limit stamped with the start date of the period it was set in, holding
 * until a later row replaces it. Storing changes this way keeps a past period
 * showing the limit that was actually in force at the time.
 */
export interface CategoryLimit {
  categoryId: string;
  /** Start day of the period this limit takes effect in; 0 covers all history. */
  effectiveFrom: number;
  /** Limit in paise, or null when the limit was removed from that period on. */
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
  /** The limit in force for the period being viewed, in paise; null when none. */
  limit: number | null;
  spent: number;
  percent: number;
  status: BudgetStatus;
}
