import { router, useLocalSearchParams } from 'expo-router';

import { DateRangeSheet } from '@/components/common/DateRangeSheet';
import { usePeriod } from '@/hooks/use-period';

/**
 * The spending period picker, as a route rather than a sheet inside a tab.
 *
 * It has to sit above the floating tab bar, and a React Native <Modal> does not
 * render at all in this app — Fabric plus edge-to-edge leaves it invisible, which
 * is why tapping the dates appeared to do nothing. A transparentModal route is
 * drawn by the root stack, above the tab navigator, and is the same mechanism the
 * category and expense editors already use.
 */
export default function PeriodScreen() {
  const nav = usePeriod();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const renew = mode === 'renew';

  function close() {
    router.back();
  }

  return (
    <DateRangeSheet
      visible
      mode={renew ? 'renew' : 'edit'}
      initial={renew ? nav.suggestion : nav.period}
      today={nav.dayAnchor}
      onClose={close}
      onSave={(next) => {
        nav.setPeriod(next);
        close();
      }}
    />
  );
}
