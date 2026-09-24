import type { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

import * as db from '@/database/queries';
import { monthPeriod } from '@/lib/calculations/period';
import type { Category, CategoryLimit, Expense, IconKey, Period, ThemePreference } from '@/types';

interface AppState {
  database: SQLiteDatabase | null;
  hydrated: boolean;
  categories: Category[];
  expenses: Expense[];
  limits: CategoryLimit[];
  themePreference: ThemePreference;
  /** The spending period the user set. Everything the app counts reads it. */
  period: Period;
  /** Whole periods away from `period` that the screens are showing; 0 is the one
   *  the user set. Kept as an offset so browsing never outlives the session. */
  periodOffset: number;
  /** Set when the user waves away the renew prompt, so it asks once per session. */
  renewDismissed: boolean;

  hydrate: (database: SQLiteDatabase) => Promise<void>;
  setPeriod: (period: Period) => Promise<void>;
  setPeriodOffset: (offset: number) => void;
  dismissRenew: () => void;

  addCategory: (input: { name: string; icon: IconKey }) => Promise<Category>;
  updateCategory: (id: string, input: { name: string; icon: IconKey }) => Promise<void>;
  /** Sets the limit that applies from `effectiveFrom` — a period's start day — onward. */
  setCategoryLimit: (categoryId: string, effectiveFrom: number, amount: number | null) => Promise<void>;
  deleteCategorySimple: (id: string) => Promise<void>;
  deleteCategoryAndReassign: (id: string, targetCategoryId: string) => Promise<void>;
  deleteCategoryAndExpenses: (id: string) => Promise<void>;

  addExpense: (input: { categoryId: string; name: string; amount: number; icon: IconKey; expenseDate: number }) => Promise<Expense>;
  updateExpense: (
    id: string,
    input: { categoryId: string; name: string; amount: number; icon: IconKey; expenseDate: number }
  ) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  setThemePreference: (theme: ThemePreference) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  database: null,
  hydrated: false,
  categories: [],
  expenses: [],
  limits: [],
  themePreference: 'system',
  period: monthPeriod(Date.now()),
  periodOffset: 0,
  renewDismissed: false,

  setPeriodOffset: (offset) => set({ periodOffset: offset }),

  dismissRenew: () => set({ renewDismissed: true }),

  setPeriod: async (period) => {
    const { database } = get();
    // Land on the new period straight away; a fresh one is never a dismissed one.
    set({ period, periodOffset: 0, renewDismissed: false });
    if (!database) return;
    try {
      await db.setPeriod(database, period);
    } catch (err) {
      console.warn('Failed to persist period', err);
    }
  },

  hydrate: async (database) => {
    const [categories, expenses, limits, themePreference, period] = await Promise.all([
      db.getAllCategories(database),
      db.getAllExpenses(database),
      db.getAllLimits(database),
      db.getTheme(database),
      db.getPeriod(database),
    ]);
    set({
      database,
      categories,
      expenses,
      limits,
      themePreference,
      period: period ?? monthPeriod(Date.now()),
      hydrated: true,
    });
  },

  addCategory: async (input) => {
    const { database, categories } = get();
    if (!database) throw new Error('Database not ready');
    const category = await db.createCategory(database, input);
    set({ categories: [category, ...categories] });
    return category;
  },

  updateCategory: async (id, input) => {
    const { database, categories } = get();
    if (!database) throw new Error('Database not ready');
    await db.updateCategory(database, id, input);
    set({
      categories: categories.map((c) => (c.id === id ? { ...c, ...input, updatedAt: Date.now() } : c)),
    });
  },

  setCategoryLimit: async (categoryId, effectiveFrom, amount) => {
    const { database, limits } = get();
    if (!database) throw new Error('Database not ready');
    await db.setCategoryLimit(database, categoryId, effectiveFrom, amount);
    const others = limits.filter((l) => !(l.categoryId === categoryId && l.effectiveFrom === effectiveFrom));
    set({ limits: [...others, { categoryId, effectiveFrom, amount }] });
  },

  deleteCategorySimple: async (id) => {
    const { database, categories, limits } = get();
    if (!database) throw new Error('Database not ready');
    await db.deleteCategory(database, id);
    set({ categories: categories.filter((c) => c.id !== id), limits: limits.filter((l) => l.categoryId !== id) });
  },

  deleteCategoryAndReassign: async (id, targetCategoryId) => {
    const { database, categories, expenses, limits } = get();
    if (!database) throw new Error('Database not ready');
    await db.reassignExpenses(database, id, targetCategoryId);
    await db.deleteCategory(database, id);
    set({
      categories: categories.filter((c) => c.id !== id),
      limits: limits.filter((l) => l.categoryId !== id),
      expenses: expenses.map((e) => (e.categoryId === id ? { ...e, categoryId: targetCategoryId } : e)),
    });
  },

  deleteCategoryAndExpenses: async (id) => {
    const { database, categories, expenses, limits } = get();
    if (!database) throw new Error('Database not ready');
    await db.deleteExpensesByCategory(database, id);
    await db.deleteCategory(database, id);
    set({
      categories: categories.filter((c) => c.id !== id),
      limits: limits.filter((l) => l.categoryId !== id),
      expenses: expenses.filter((e) => e.categoryId !== id),
    });
  },

  addExpense: async (input) => {
    const { database, expenses } = get();
    if (!database) throw new Error('Database not ready');
    const expense = await db.createExpense(database, input);
    set({ expenses: [expense, ...expenses] });
    return expense;
  },

  updateExpense: async (id, input) => {
    const { database, expenses } = get();
    if (!database) throw new Error('Database not ready');
    await db.updateExpense(database, id, input);
    set({
      expenses: expenses.map((e) => (e.id === id ? { ...e, ...input, updatedAt: Date.now() } : e)),
    });
  },

  deleteExpense: async (id) => {
    const { database, expenses } = get();
    if (!database) throw new Error('Database not ready');
    await db.deleteExpense(database, id);
    set({ expenses: expenses.filter((e) => e.id !== id) });
  },

  setThemePreference: async (theme) => {
    const { database } = get();
    if (!database) throw new Error('Database not ready');
    // Repaint first, persist after. Awaiting the SQLite round trip before
    // touching state is what made switching appearance feel sluggish.
    set({ themePreference: theme });
    try {
      await db.setTheme(database, theme);
    } catch (err) {
      console.warn('Failed to persist theme', err);
    }
  },
}));
