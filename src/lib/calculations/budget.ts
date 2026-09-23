import { BUDGET_THRESHOLDS, ICON_COLORS } from '@/constants/theme';
import type { BudgetStatus, Category, CategoryLimit, CategoryWithSpend, Expense, IconKey } from '@/types';

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

/** Month index used to order limit rows: year * 12 + zero-based month. */
export function monthIndexOf(timestamp: number): number {
  const d = new Date(timestamp);
  return d.getFullYear() * 12 + d.getMonth();
}

/** The limit in force for `monthAnchor`: the latest row at or before that month. */
export function limitForMonth(limits: CategoryLimit[], categoryId: string, monthAnchor: number): number | null {
  const month = monthIndexOf(monthAnchor);
  let inForce: CategoryLimit | null = null;
  for (const limit of limits) {
    if (limit.categoryId !== categoryId || limit.effectiveMonth > month) continue;
    if (!inForce || limit.effectiveMonth > inForce.effectiveMonth) inForce = limit;
  }
  return inForce?.amount ?? null;
}

export function withSpend(
  categories: Category[],
  expenses: Expense[],
  limits: CategoryLimit[],
  monthAnchor: number = Date.now()
): CategoryWithSpend[] {
  return categories.map((c) => {
    const spent = spentForCategory(c.id, expenses, monthAnchor);
    const monthlyLimit = limitForMonth(limits, c.id, monthAnchor);
    const hasLimit = monthlyLimit != null && monthlyLimit > 0;
    const percent = hasLimit ? Math.round((spent / monthlyLimit) * 100) : 0;
    return { ...c, monthlyLimit, spent, percent, status: statusForPercent(hasLimit, percent) };
  });
}

export function colorForIcon(icon: IconKey): string {
  return ICON_COLORS[icon] ?? ICON_COLORS.other;
}

export function totalSpending(expenses: Expense[], monthAnchor: number = Date.now()): number {
  return expenses.filter((e) => isSameMonth(e.expenseDate, monthAnchor)).reduce((sum, e) => sum + e.amount, 0);
}

/** Midday on the 1st of the month `offset` months away from `anchor` (negative = earlier).
 *  Midday rather than midnight so a DST shift can never tip it into the wrong day. */
export function monthAnchorFor(anchor: number, offset: number): number {
  const d = new Date(anchor);
  return new Date(d.getFullYear(), d.getMonth() + offset, 1, 12, 0, 0, 0).getTime();
}

/** Whole months from `earlier` to `later`; negative when `earlier` is the later of the two. */
export function monthsBetween(earlier: number, later: number): number {
  const a = new Date(earlier);
  const b = new Date(later);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
