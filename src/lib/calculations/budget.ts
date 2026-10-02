import { BUDGET_THRESHOLDS, ICON_COLORS } from '@/constants/theme';
import { dayOf, isInPeriod } from '@/lib/calculations/period';
import type { BudgetStatus, Category, CategoryLimit, CategoryWithSpend, Expense, IconKey, Period } from '@/types';

export function spentForCategory(categoryId: string, expenses: Expense[], period: Period): number {
  return expenses
    .filter((e) => e.categoryId === categoryId && isInPeriod(e.expenseDate, period))
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * The one order the Limits grid and the Home bars both follow, so a category
 * sits in the same place whichever screen you are on.
 *
 * Categories carrying a limit come first, each group runs A-Z, and the
 * catch-all is pinned to the very end wherever it would otherwise land.
 * Compared lower-case so a lower-case name is not banished after Z.
 */
export function compareForGrid(
  a: { name: string; icon: IconKey; limit: number | null },
  b: { name: string; icon: IconKey; limit: number | null }
): number {
  const aCatchAll = a.icon === 'other';
  const bCatchAll = b.icon === 'other';
  if (aCatchAll !== bCatchAll) return aCatchAll ? 1 : -1;

  const aLimited = a.limit != null;
  const bLimited = b.limit != null;
  if (aLimited !== bLimited) return aLimited ? -1 : 1;

  const aName = a.name.toLowerCase();
  const bName = b.name.toLowerCase();
  return aName < bName ? -1 : aName > bName ? 1 : 0;
}

export function statusForPercent(hasLimit: boolean, percent: number): BudgetStatus {
  if (!hasLimit) return 'none';
  if (percent >= BUDGET_THRESHOLDS.danger) return 'danger';
  if (percent >= BUDGET_THRESHOLDS.warning) return 'warning';
  return 'normal';
}

/** The limit in force for `period`: the latest row stamped at or before its start. */
export function limitForPeriod(limits: CategoryLimit[], categoryId: string, period: Period): number | null {
  const start = dayOf(period.start);
  let inForce: CategoryLimit | null = null;
  for (const limit of limits) {
    if (limit.categoryId !== categoryId || limit.effectiveFrom > start) continue;
    if (!inForce || limit.effectiveFrom > inForce.effectiveFrom) inForce = limit;
  }
  return inForce?.amount ?? null;
}

export function withSpend(
  categories: Category[],
  expenses: Expense[],
  limits: CategoryLimit[],
  period: Period
): CategoryWithSpend[] {
  return categories.map((c) => {
    const spent = spentForCategory(c.id, expenses, period);
    const limit = limitForPeriod(limits, c.id, period);
    const hasLimit = limit != null && limit > 0;
    const percent = hasLimit ? Math.round((spent / limit) * 100) : 0;
    return { ...c, limit, spent, percent, status: statusForPercent(hasLimit, percent) };
  });
}

export function colorForIcon(icon: IconKey): string {
  return ICON_COLORS[icon] ?? ICON_COLORS.other;
}

export function totalSpending(expenses: Expense[], period: Period): number {
  return expenses.filter((e) => isInPeriod(e.expenseDate, period)).reduce((sum, e) => sum + e.amount, 0);
}
