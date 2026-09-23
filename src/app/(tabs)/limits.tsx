import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { MonthSwitcher } from '@/components/common/MonthSwitcher';
import { Radius, Spacing } from '@/constants/theme';
import { useMonthNavigation } from '@/hooks/use-month-navigation';
import { useTheme } from '@/hooks/use-theme';
import { colorForIcon, withSpend } from '@/lib/calculations/budget';
import { formatMoney } from '@/lib/formatting/money';
import { useAppStore } from '@/store/useAppStore';

function PlusGlyph({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
      <Line x1={12} y1={5} x2={12} y2={19} />
      <Line x1={5} y1={12} x2={19} y2={12} />
    </Svg>
  );
}

function TargetGlyph({ color }: { color: string }) {
  return (
    <Svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={9} />
      <Circle cx={12} cy={12} r={4.5} />
      <Circle cx={12} cy={12} r={1} fill={color} />
    </Svg>
  );
}

/** Circular progress sitting behind the category icon. */
function ProgressRing({ size, stroke, percent, color, trackColor }: { size: number; stroke: number; percent: number; color: string; trackColor: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const swept = Math.min(percent, 100) / 100;

  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - swept)}
        // Start the sweep at 12 o'clock rather than 3.
        rotation={-90}
        originX={size / 2}
        originY={size / 2}
      />
    </Svg>
  );
}

export default function LimitsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);
  const limits = useAppStore((s) => s.limits);
  const nav = useMonthNavigation();
  const monthAnchor = nav.monthAnchor;
  const { width } = useWindowDimensions();

  // Categories carrying a limit float to the top; sort is stable, so within each
  // group the store's newest-first order is preserved.
  const ordered = useMemo(
    () => withSpend(categories, expenses, limits, monthAnchor).sort((a, b) => Number(b.monthlyLimit != null) - Number(a.monthlyLimit != null)),
    [categories, expenses, limits, monthAnchor]
  );

  // Header summary covers only the categories that actually carry a limit —
  // unlimited spending has nothing to be measured against.
  const summary = useMemo(() => {
    const limited = ordered.filter((c) => c.monthlyLimit != null && c.monthlyLimit > 0);
    if (limited.length === 0) return null;
    return {
      spent: limited.reduce((sum, c) => sum + c.spent, 0),
      limit: limited.reduce((sum, c) => sum + (c.monthlyLimit as number), 0),
    };
  }, [ordered]);

  // Floored, not exact: Yoga rounds each tile up to a whole physical pixel, and
  // three exact thirds then overflow the row by a pixel and wrap to 2 columns.
  const tileWidth = Math.floor((width - Spacing.xl * 2 - GRID_GAP * 2) / 3);
  const ringSize = Math.round(tileWidth * 0.6);

  function openCategory(id: string) {
    router.push({ pathname: '/category/[id]', params: { id } });
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <AppText weight="extrabold" style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Limits
          </AppText>
          <MonthSwitcher nav={nav} />
        </View>

        {summary ? (
          <AppText style={[styles.headerSub, { color: colors.textSecondary }]}>
            {formatMoney(summary.spent)} of {formatMoney(summary.limit)} spent
          </AppText>
        ) : null}

        {categories.length > 0 ? (
          <View style={styles.grid}>
            {ordered.map((category) => {
              const color = colorForIcon(category.icon);
              const hasLimit = category.monthlyLimit != null && category.monthlyLimit > 0;
              // Green while comfortably under, amber from 80%, red at the limit.
              const ringColor =
                category.status === 'danger' ? colors.danger : category.status === 'warning' ? colors.warning : colors.success;

              return (
                <Pressable
                  key={category.id}
                  onPress={() => openCategory(category.id)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    hasLimit
                      ? `Edit ${category.name}, ${formatMoney(category.spent)} of ${formatMoney(category.monthlyLimit as number)} spent`
                      : `Edit ${category.name}, no limit set`
                  }
                  style={({ pressed }) => [styles.tile, { width: tileWidth, opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    style={[
                      styles.tileSquare,
                      { width: tileWidth, height: tileWidth, backgroundColor: colors.surface, shadowColor: colors.textPrimary },
                    ]}
                  >
                    <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
                      {hasLimit ? (
                        <ProgressRing
                          size={ringSize}
                          stroke={RING_STROKE}
                          percent={category.percent}
                          color={ringColor}
                          trackColor={colors.trackColor}
                        />
                      ) : null}
                      <Icon name={category.icon} color={color} size={24} />
                    </View>

                    <AppText
                      weight="bold"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                      style={[
                        styles.tileAmount,
                        { color: category.status === 'danger' ? colors.danger : colors.textSecondary },
                      ]}
                    >
                      {hasLimit ? `${formatMoney(category.spent)} / ${formatMoney(category.monthlyLimit as number)}` : 'No limit'}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => openCategory('new')}
              accessibilityRole="button"
              accessibilityLabel="Add category"
              style={({ pressed }) => [styles.tile, { width: tileWidth, opacity: pressed ? 0.6 : 1 }]}
            >
              <View
                style={[
                  styles.addTile,
                  {
                    width: tileWidth,
                    height: tileWidth,
                    // Set alongside width/style in one object: Android's dashed-border
                    // path ignores a borderColor that arrives on its own.
                    borderColor: colors.textSecondary,
                    borderWidth: 2,
                    borderStyle: 'dashed',
                  },
                ]}
              >
                <PlusGlyph color={colors.textSecondary} size={24} />
              </View>
            </Pressable>
          </View>
        ) : (
          <EmptyState
            icon={<TargetGlyph color={colors.primary} />}
            title="No categories yet"
            message="Create your first spending category to start setting limits."
            actionLabel="+ Add Category"
            onAction={() => openCategory('new')}
          />
        )}
      </ScrollView>
    </View>
  );
}

const GRID_GAP = Spacing.md;
const RING_STROKE = 5;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  headerTitle: { fontSize: 22, letterSpacing: -0.3 },
  headerSub: { fontSize: 12.5, marginBottom: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: GRID_GAP, rowGap: Spacing.xl },
  tile: { alignItems: 'center' },
  tileSquare: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  tileAmount: { fontSize: 10.5, textAlign: 'center', marginTop: 7 },
  addTile: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
