import type { SQLiteDatabase } from 'expo-sqlite';

import type { Category, Expense, IconKey, ThemePreference } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  monthly_limit: number | null;
  created_at: number;
  updated_at: number;
}

interface ExpenseRow {
  id: string;
  category_id: string;
  name: string;
  amount: number;
  icon: string;
  expense_date: number;
  created_at: number;
  updated_at: number;
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon as IconKey,
    monthlyLimit: row.monthly_limit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    amount: row.amount,
    icon: row.icon as IconKey,
    expenseDate: row.expense_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllCategories(db: SQLiteDatabase): Promise<Category[]> {
  const rows = await db.getAllAsync<CategoryRow>('SELECT * FROM categories ORDER BY created_at DESC');
  return rows.map(rowToCategory);
}

export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
  const rows = await db.getAllAsync<ExpenseRow>('SELECT * FROM expenses ORDER BY expense_date DESC');
  return rows.map(rowToExpense);
}

export async function createCategory(
  db: SQLiteDatabase,
  input: { name: string; icon: IconKey; monthlyLimit: number | null }
): Promise<Category> {
  const id = generateId();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO categories (id, name, icon, monthly_limit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    input.name,
    input.icon,
    input.monthlyLimit,
    now,
    now
  );
  return { id, name: input.name, icon: input.icon, monthlyLimit: input.monthlyLimit, createdAt: now, updatedAt: now };
}

export async function updateCategory(
  db: SQLiteDatabase,
  id: string,
  input: { name: string; icon: IconKey; monthlyLimit: number | null }
): Promise<void> {
  const now = Date.now();
  await db.runAsync(
    'UPDATE categories SET name = ?, icon = ?, monthly_limit = ?, updated_at = ? WHERE id = ?',
    input.name,
    input.icon,
    input.monthlyLimit,
    now,
    id
  );
}

export async function deleteCategory(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM categories WHERE id = ?', id);
}

export async function reassignExpenses(db: SQLiteDatabase, fromCategoryId: string, toCategoryId: string): Promise<void> {
  await db.runAsync(
    'UPDATE expenses SET category_id = ?, updated_at = ? WHERE category_id = ?',
    toCategoryId,
    Date.now(),
    fromCategoryId
  );
}

export async function deleteExpensesByCategory(db: SQLiteDatabase, categoryId: string): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE category_id = ?', categoryId);
}

export async function createExpense(
  db: SQLiteDatabase,
  input: { categoryId: string; name: string; amount: number; icon: IconKey; expenseDate: number }
): Promise<Expense> {
  const id = generateId();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO expenses (id, category_id, name, amount, icon, expense_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id,
    input.categoryId,
    input.name,
    input.amount,
    input.icon,
    input.expenseDate,
    now,
    now
  );
  return {
    id,
    categoryId: input.categoryId,
    name: input.name,
    amount: input.amount,
    icon: input.icon,
    expenseDate: input.expenseDate,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateExpense(
  db: SQLiteDatabase,
  id: string,
  input: { categoryId: string; name: string; amount: number; icon: IconKey; expenseDate: number }
): Promise<void> {
  const now = Date.now();
  await db.runAsync(
    'UPDATE expenses SET category_id = ?, name = ?, amount = ?, icon = ?, expense_date = ?, updated_at = ? WHERE id = ?',
    input.categoryId,
    input.name,
    input.amount,
    input.icon,
    input.expenseDate,
    now,
    id
  );
}

export async function deleteExpense(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}

export async function getTheme(db: SQLiteDatabase): Promise<ThemePreference> {
  const row = await db.getFirstAsync<{ theme: ThemePreference }>('SELECT theme FROM settings WHERE id = 1');
  return row?.theme ?? 'system';
}

export async function setTheme(db: SQLiteDatabase, theme: ThemePreference): Promise<void> {
  await db.runAsync('UPDATE settings SET theme = ? WHERE id = 1', theme);
}
