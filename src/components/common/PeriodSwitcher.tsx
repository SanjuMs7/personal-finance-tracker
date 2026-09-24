import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PeriodNavigation } from '@/hooks/use-period';
import { formatRangeLabel } from '@/lib/formatting/datetime';

function Chevron({ color, direction }: { color: string; direction: 'left' | 'right' }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points={direction === 'left' ? '15 5 8 12 15 19' : '9 5 16 12 9 19'} />
    </Svg>
  );
}

interface PeriodSwitcherProps {
  nav: PeriodNavigation;
  /** Opens the calendar; the label is the only way in, so it is always wired. */
  onEditPeriod: () => void;
}

export function PeriodSwitcher({ nav, onEditPeriod }: PeriodSwitcherProps) {
  const { colors } = useTheme();
  const ended = nav.ended;
  // An expired period has no neighbours worth stepping to — the way out is the
  // calendar, so the arrows stand down and the pill says what to do.
  const back = ended ? false : nav.canGoBack;
  const forward = ended ? false : nav.canGoForward;
  const inkFor = (enabled: boolean) =>
    ended ? colors.danger : enabled ? colors.textPrimary : colors.buttonDisabled;

  return (
    <View style={[styles.wrap, { backgroundColor: ended ? colors.dangerSoft : colors.surfaceAlt }]}>
      <Pressable
        onPress={nav.goBack}
        disabled={!back}
        accessibilityRole="button"
        accessibilityLabel="Previous period"
        accessibilityState={{ disabled: !back }}
        android_ripple={back ? { color: 'rgba(0,0,0,0.12)', borderless: true } : undefined}
        style={styles.btn}
      >
        <Chevron color={inkFor(back)} direction="left" />
      </Pressable>

      <Pressable
        onPress={onEditPeriod}
        accessibilityRole="button"
        accessibilityLabel={ended ? 'Period ended, set new dates' : `${formatRangeLabel(nav.period.start, nav.period.end)}, change dates`}
        style={styles.labelBtn}
      >
        <AppText
          weight="bold"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={[styles.label, { color: ended ? colors.danger : colors.textPrimary }]}
        >
          {ended ? 'Ended · Set dates' : formatRangeLabel(nav.period.start, nav.period.end)}
        </AppText>
      </Pressable>

      <Pressable
        onPress={nav.goForward}
        disabled={!forward}
        accessibilityRole="button"
        accessibilityLabel="Next period"
        accessibilityState={{ disabled: !forward }}
        android_ripple={forward ? { color: 'rgba(0,0,0,0.12)', borderless: true } : undefined}
        style={styles.btn}
      >
        <Chevron color={inkFor(forward)} direction="right" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, paddingHorizontal: 2 },
  btn: { width: 28, height: 34, alignItems: 'center', justifyContent: 'center' },
  labelBtn: { height: 34, justifyContent: 'center', paddingHorizontal: 2 },
  label: { fontSize: 11.5, minWidth: 96, textAlign: 'center', letterSpacing: 0.2 },
});
