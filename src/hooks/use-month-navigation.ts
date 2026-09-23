import { useMemo } from 'react';

import { monthAnchorFor, monthsBetween } from '@/lib/calculations/budget';
import { useDayAnchor } from '@/hooks/use-day-anchor';
import { useAppStore } from '@/store/useAppStore';

export interface MonthNavigation {
  /** Timestamp inside the month currently being viewed. */
  monthAnchor: number;
  /** Right now, for Today/Yesterday labels — which the month anchor cannot answer. */
  dayAnchor: number;
  isCurrentMonth: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
}

/**
 * Shared month cursor for Home and Limits. The offset is stored rather than an
 * absolute month, so "one month back" stays correct on its own when the calendar
 * rolls over while the app is open.
 */
export function useMonthNavigation(): MonthNavigation {
  const dayAnchor = useDayAnchor();
  const expenses = useAppStore((s) => s.expenses);
  const monthOffset = useAppStore((s) => s.monthOffset);
  const setMonthOffset = useAppStore((s) => s.setMonthOffset);

  const monthAnchor = useMemo(() => monthAnchorFor(dayAnchor, monthOffset), [dayAnchor, monthOffset]);

  // Stop at the oldest expense: there is nothing to see in the empty months before it.
  const oldestOffset = useMemo(() => {
    if (expenses.length === 0) return 0;
    const oldest = expenses.reduce((min, e) => Math.min(min, e.expenseDate), expenses[0].expenseDate);
    return Math.min(0, monthsBetween(dayAnchor, oldest));
  }, [expenses, dayAnchor]);

  return {
    monthAnchor,
    dayAnchor,
    isCurrentMonth: monthOffset === 0,
    canGoBack: monthOffset > oldestOffset,
    canGoForward: monthOffset < 0,
    goBack: () => setMonthOffset(monthOffset - 1),
    goForward: () => setMonthOffset(monthOffset + 1),
  };
}
