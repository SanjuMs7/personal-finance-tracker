import { BUDGET_THRESHOLDS, CATEGORY_PALETTE } from '@/constants/theme';
import type { BudgetStatus, Category, CategoryWithSpend, Expense } from '@/types';

export function isSameMonth(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

export function spentForCategory(categoryId: string, expenses: Expense[], monthAnchor: number): number {
  return expenses
    .filter((e) => e.categoryId === categoryId && isSameMonth(e.expenseDate, monthAnchor))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function statusForPercent(hasLimit: boolean, percent: number): BudgetStatus {
  if (!hasLimit) return 'none';
  if (percent >= BUDGET_THRESHOLDS.danger) return 'danger';
  if (percent >= BUDGET_THRESHOLDS.warning) return 'warning';
  return 'normal';
}

export function withSpend(categories: Category[], expenses: Expense[], monthAnchor: number = Date.now()): CategoryWithSpend[] {
  return categories.map((c) => {
    const spent = spentForCategory(c.id, expenses, monthAnchor);
    const hasLimit = c.monthlyLimit != null && c.monthlyLimit > 0;
    const percent = hasLimit ? Math.round((spent / (c.monthlyLimit as number)) * 100) : 0;
    return { ...c, spent, percent, status: statusForPercent(hasLimit, percent) };
  });
}

export function colorForCategoryIndex(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
}

export function totalSpending(expenses: Expense[], monthAnchor: number = Date.now()): number {
  return expenses.filter((e) => isSameMonth(e.expenseDate, monthAnchor)).reduce((sum, e) => sum + e.amount, 0);
}
