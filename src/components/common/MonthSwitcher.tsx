import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MonthNavigation } from '@/hooks/use-month-navigation';
import { formatMonthYearLabel } from '@/lib/formatting/datetime';

function Chevron({ color, direction }: { color: string; direction: 'left' | 'right' }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points={direction === 'left' ? '15 5 8 12 15 19' : '9 5 16 12 9 19'} />
    </Svg>
  );
}

export function MonthSwitcher({ nav }: { nav: MonthNavigation }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceAlt }]}>
      <Pressable
        onPress={nav.goBack}
        disabled={!nav.canGoBack}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        accessibilityState={{ disabled: !nav.canGoBack }}
        android_ripple={nav.canGoBack ? { color: 'rgba(0,0,0,0.12)', borderless: true } : undefined}
        style={styles.btn}
      >
        <Chevron color={nav.canGoBack ? colors.textPrimary : colors.buttonDisabled} direction="left" />
      </Pressable>

      <AppText weight="bold" style={[styles.label, { color: colors.textPrimary }]}>
        {formatMonthYearLabel(nav.monthAnchor)}
      </AppText>

      <Pressable
        onPress={nav.goForward}
        disabled={!nav.canGoForward}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        accessibilityState={{ disabled: !nav.canGoForward }}
        android_ripple={nav.canGoForward ? { color: 'rgba(0,0,0,0.12)', borderless: true } : undefined}
        style={styles.btn}
      >
        <Chevron color={nav.canGoForward ? colors.textPrimary : colors.buttonDisabled} direction="right" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, paddingHorizontal: 2 },
  btn: { width: 32, height: 34, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12.5, minWidth: 62, textAlign: 'center', letterSpacing: 0.2 },
});
