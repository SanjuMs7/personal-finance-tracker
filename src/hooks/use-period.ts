import { useMemo } from 'react';

import { useDayAnchor } from '@/hooks/use-day-anchor';
import { daysElapsed, hasEnded, periodsBetween, shiftPeriod } from '@/lib/calculations/period';
import { useAppStore } from '@/store/useAppStore';
import type { Period } from '@/types';

export interface PeriodNavigation {
  /** The period being viewed, which the arrows move away from the set one. */
  period: Period;
  /** Right now, for Today/Yesterday labels — which the period cannot answer. */
  dayAnchor: number;
  /** Days of `period` that have happened; a past period counts in full. */
  elapsed: number;
  /** The set period has run out and no new one has been chosen yet. */
  ended: boolean;
  /** The window to offer when it has: the one of the same length that today
   *  falls in, so coming back after months away still lands on now. */
  suggestion: Period;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  setPeriod: (period: Period) => Promise<void>;
}

/**
 * The single spending period Home, Limits and the exports all read. The browsing
 * offset counts whole periods rather than storing absolute dates, so stepping
 * back always lands on a window the same length as the one you set.
 */
export function usePeriod(): PeriodNavigation {
  const dayAnchor = useDayAnchor();
  const expenses = useAppStore((s) => s.expenses);
  const anchor = useAppStore((s) => s.period);
  const offset = useAppStore((s) => s.periodOffset);
  const setPeriodOffset = useAppStore((s) => s.setPeriodOffset);
  const setPeriod = useAppStore((s) => s.setPeriod);

  const period = useMemo(() => (offset === 0 ? anchor : shiftPeriod(anchor, offset)), [anchor, offset]);

  // Rolling one window forward would offer a period that is itself already over
  // if the app went unopened for months, so jump straight to the one holding today.
  const suggestion = useMemo(
    () => shiftPeriod(anchor, Math.max(1, periodsBetween(anchor, dayAnchor))),
    [anchor, dayAnchor]
  );

  // Stop at the oldest expense: there is nothing to see in the empty windows
  // before it.
  const oldestOffset = useMemo(() => {
    if (expenses.length === 0) return 0;
    const oldest = expenses.reduce((min, e) => Math.min(min, e.expenseDate), expenses[0].expenseDate);
    return Math.min(0, periodsBetween(anchor, oldest));
  }, [expenses, anchor]);

  return {
    period,
    dayAnchor,
    elapsed: daysElapsed(period, dayAnchor),
    ended: offset === 0 && hasEnded(anchor, dayAnchor),
    suggestion,
    canGoBack: offset > oldestOffset,
    canGoForward: offset < 0,
    goBack: () => setPeriodOffset(offset - 1),
    goForward: () => setPeriodOffset(offset + 1),
    setPeriod,
  };
}
