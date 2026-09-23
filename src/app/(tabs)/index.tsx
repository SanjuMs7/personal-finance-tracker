import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { MonthSwitcher } from '@/components/common/MonthSwitcher';
import { CategoryBarChart, type BarDatum } from '@/components/charts/CategoryBarChart';
import { SemiDonutChart, type ChartSegment } from '@/components/charts/SemiDonutChart';
import { Radius, Spacing } from '@/constants/theme';
import { useMonthNavigation } from '@/hooks/use-month-navigation';
import { useTheme } from '@/hooks/use-theme';
import { colorForIcon, isSameMonth, limitForMonth, totalSpending } from '@/lib/calculations/budget';
import { formatDateGroupLabel, formatFriendlyTime } from '@/lib/formatting/datetime';
import { formatMoney } from '@/lib/formatting/money';
import { useAppStore } from '@/store/useAppStore';

function PlusGlyph({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
      <Line x1={12} y1={5} x2={12} y2={19} />
      <Line x1={5} y1={12} x2={19} y2={12} />
    </Svg>
  );
}

function CompassGlyph({ color }: { color: string }) {
  return (
    <Svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 12l6-6 4 4 8-8" />
      <Path d="M15 2h6v6" />
      <Path d="M3 20h18" />
    </Svg>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);
  const limits = useAppStore((s) => s.limits);

  const nav = useMonthNavigation();
  const monthAnchor = nav.monthAnchor;
  const { width } = useWindowDimensions();
  const [showBars, setShowBars] = useState(false);
  const monthExpenses = useMemo(() => expenses.filter((e) => isSameMonth(e.expenseDate, monthAnchor)), [expenses, monthAnchor]);
  const total = useMemo(() => totalSpending(expenses, monthAnchor), [expenses, monthAnchor]);

  // Arcs follow the Limits grid's order, matching the bar view, so a colour keeps
  // its position in the sweep instead of jumping as the amounts change.
  const chartSegments: ChartSegment[] = useMemo(() => {
    const byCategory = new Map<string, number>();
    monthExpenses.forEach((e) => byCategory.set(e.categoryId, (byCategory.get(e.categoryId) ?? 0) + e.amount));
    return [...categories]
      .sort(
        (a, b) =>
          Number(limitForMonth(limits, b.id, monthAnchor) != null) -
          Number(limitForMonth(limits, a.id, monthAnchor) != null)
      )
      .map((c) => ({ key: c.id, value: byCategory.get(c.id) ?? 0, color: colorForIcon(c.icon) }))
      .filter((s) => s.value > 0);
  }, [categories, monthExpenses, limits, monthAnchor]);

  // A past month is over, so it counts in full; the current one only counts the
  // days that have actually happened.
  const daysElapsed = useMemo(() => {
    const viewed = new Date(monthAnchor);
    const today = new Date(nav.dayAnchor);
    const isCurrent = viewed.getFullYear() === today.getFullYear() && viewed.getMonth() === today.getMonth();
    return isCurrent ? today.getDate() : new Date(viewed.getFullYear(), viewed.getMonth() + 1, 0).getDate();
  }, [monthAnchor, nav.dayAnchor]);

  // Bars follow the Limits grid's order — limited categories first, newest first
  // within each group — so a category keeps its slot as you step through months.
  const dailyAverages: BarDatum[] = useMemo(() => {
    const byCategory = new Map<string, number>();
    monthExpenses.forEach((e) => byCategory.set(e.categoryId, (byCategory.get(e.categoryId) ?? 0) + e.amount));
    return [...categories]
      .sort(
        (a, b) =>
          Number(limitForMonth(limits, b.id, monthAnchor) != null) -
          Number(limitForMonth(limits, a.id, monthAnchor) != null)
      )
      .map((c) => ({
        key: c.id,
        label: c.name,
        icon: c.icon,
        color: colorForIcon(c.icon),
        value: Math.round((byCategory.get(c.id) ?? 0) / daysElapsed),
      }));
  }, [categories, monthExpenses, daysElapsed, limits, monthAnchor]);

  // Grouped by day, newest first, so nothing is hidden just for not being today.
  const sections = useMemo(() => {
    const rows = [...monthExpenses]
      .sort((a, b) => b.expenseDate - a.expenseDate)
      .map((e) => {
        const category = categories.find((c) => c.id === e.categoryId);
        const color = category ? colorForIcon(category.icon) : colors.textSecondary;
        return {
          id: e.id,
          expenseDate: e.expenseDate,
          name: e.name,
          amountDisplay: formatMoney(e.amount),
          categoryName: category?.name ?? 'Uncategorized',
          time: formatFriendlyTime(e.expenseDate),
          icon: category?.icon ?? ('other' as const),
          iconColor: color,
          iconBg: color + '22',
        };
      });

    const groups: { key: string; label: string; rows: typeof rows }[] = [];
    rows.forEach((row) => {
      const key = new Date(row.expenseDate).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.key === key) {
        last.rows.push(row);
      } else {
        groups.push({ key, label: formatDateGroupLabel(row.expenseDate, nav.dayAnchor), rows: [row] });
      }
    });
    return groups;
  }, [monthExpenses, categories, colors.textSecondary, nav.dayAnchor]);

  const hasAnyExpenses = expenses.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <AppText weight="extrabold" style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Spending
          </AppText>
          <MonthSwitcher nav={nav} />
        </View>

        {hasAnyExpenses ? (
          <>
            <Pressable
              onPress={() => setShowBars((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showBars ? 'Show spending breakdown' : 'Show daily average per category'}
              style={[styles.chartCard, { backgroundColor: colors.surface, shadowColor: colors.textPrimary }]}
            >
              {showBars ? (
                <CategoryBarChart
                  data={dailyAverages}
                  total={Math.round(total / daysElapsed)}
                  caption={`Average per day · ${daysElapsed} ${daysElapsed === 1 ? 'day' : 'days'}`}
                  width={width - Spacing.xl * 2 - 40}
                  trackColor={colors.trackColor}
                  textColor={colors.textPrimary}
                  secondaryTextColor={colors.textSecondary}
                />
              ) : (
                <SemiDonutChart
                  segments={chartSegments}
                  total={total}
                  trackColor={colors.trackColor}
                  textColor={colors.textPrimary}
                  secondaryTextColor={colors.textSecondary}
                  width={240}
                />
              )}
            </Pressable>

            <View style={styles.sectionRow}>
              <AppText weight="bold" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Expenses
              </AppText>
              <Pressable
                onPress={() => router.push({ pathname: '/expense/[id]', params: { id: 'new' } })}
                accessibilityRole="button"
                accessibilityLabel="Add expense"
                android_ripple={{ color: 'rgba(255,255,255,0.24)' }}
                style={[styles.addBtn, { backgroundColor: colors.primary, overflow: 'hidden' }]}
              >
                <PlusGlyph color="#fff" />
              </Pressable>
            </View>

            {sections.length === 0 ? (
              <View style={[styles.emptyMonthCard, { backgroundColor: colors.surface, shadowColor: colors.textPrimary }]}>
                <AppText style={{ fontSize: 13.5, color: colors.textSecondary }}>No expenses this month.</AppText>
              </View>
            ) : null}

            {sections.map((section) => (
              <View key={section.key} style={styles.section}>
                <AppText weight="bold" style={[styles.groupLabel, { color: colors.textSecondary }]}>
                  {section.label}
                </AppText>
                <View style={{ gap: Spacing.sm }}>
                  {section.rows.map((row) => (
                    <Pressable
                      key={row.id}
                      onPress={() => router.push({ pathname: '/expense/[id]', params: { id: row.id } })}
                      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                      style={[
                        styles.expenseRow,
                        { backgroundColor: colors.surface, shadowColor: colors.textPrimary, overflow: 'hidden' },
                      ]}
                    >
                      <View style={[styles.expenseIcon, { backgroundColor: row.iconBg }]}>
                        <Icon name={row.icon} color={row.iconColor} size={18} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText weight="bold" numberOfLines={1} style={{ fontSize: 14.5, color: colors.textPrimary }}>
                          {row.name}
                        </AppText>
                        <AppText style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 2 }}>
                          {row.categoryName} · {row.time}
                        </AppText>
                      </View>
                      <AppText weight="bold" style={{ fontSize: 15, color: colors.textPrimary }}>
                        {row.amountDisplay}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : (
          <EmptyState
            icon={<CompassGlyph color={colors.primary} />}
            title="Nothing tracked yet"
            message="Your spending chart appears as soon as you add something."
            actionLabel="+ Add your first expense"
            onAction={() => router.push({ pathname: '/expense/[id]', params: { id: 'new' } })}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  headerTitle: { fontSize: 22, letterSpacing: -0.3 },
  chartCard: {
    borderRadius: Radius.lg,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 15 },
  section: { marginBottom: Spacing.lg },
  groupLabel: { fontSize: 12, letterSpacing: 0.3, marginBottom: Spacing.sm },
  addBtn: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    paddingHorizontal: 14,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  expenseIcon: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  emptyMonthCard: {
    borderRadius: Radius.lg,
    paddingVertical: 28,
    alignItems: 'center',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});
