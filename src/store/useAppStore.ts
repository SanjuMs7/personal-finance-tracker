import type { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

import * as db from '@/database/queries';
import type { Category, Expense, IconKey, ThemePreference } from '@/types';

interface AppState {
  database: SQLiteDatabase | null;
  hydrated: boolean;
  categories: Category[];
  expenses: Expense[];
  themePreference: ThemePreference;

  hydrate: (database: SQLiteDatabase) => Promise<void>;

  addCategory: (input: { name: string; icon: IconKey; monthlyLimit: number | null }) => Promise<Category>;
  updateCategory: (id: string, input: { name: string; icon: IconKey; monthlyLimit: number | null }) => Promise<void>;
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
  themePreference: 'system',

  hydrate: async (database) => {
    const [categories, expenses, themePreference] = await Promise.all([
      db.getAllCategories(database),
      db.getAllExpenses(database),
      db.getTheme(database),
    ]);
    set({ database, categories, expenses, themePreference, hydrated: true });
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

  deleteCategorySimple: async (id) => {
    const { database, categories } = get();
    if (!database) throw new Error('Database not ready');
    await db.deleteCategory(database, id);
    set({ categories: categories.filter((c) => c.id !== id) });
  },

  deleteCategoryAndReassign: async (id, targetCategoryId) => {
    const { database, categories, expenses } = get();
    if (!database) throw new Error('Database not ready');
    await db.reassignExpenses(database, id, targetCategoryId);
    await db.deleteCategory(database, id);
    set({
      categories: categories.filter((c) => c.id !== id),
      expenses: expenses.map((e) => (e.categoryId === id ? { ...e, categoryId: targetCategoryId } : e)),
    });
  },

  deleteCategoryAndExpenses: async (id) => {
    const { database, categories, expenses } = get();
    if (!database) throw new Error('Database not ready');
    await db.deleteExpensesByCategory(database, id);
    await db.deleteCategory(database, id);
    set({
      categories: categories.filter((c) => c.id !== id),
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
    await db.setTheme(database, theme);
    set({ themePreference: theme });
  },
}));
