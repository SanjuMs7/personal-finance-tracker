import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { SemiDonutChart, type ChartSegment } from '@/components/charts/SemiDonutChart';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { colorForCategoryIndex, isSameMonth, totalSpending } from '@/lib/calculations/budget';
import { formatFriendlyTime, isToday } from '@/lib/formatting/datetime';
import { formatMoney } from '@/lib/formatting/money';
import { useAppStore } from '@/store/useAppStore';

function MoreGlyph({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color}>
      <Circle cx={5} cy={12} r={2} />
      <Circle cx={12} cy={12} r={2} />
      <Circle cx={19} cy={12} r={2} />
    </Svg>
  );
}

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

  const [monthAnchor] = useState(() => Date.now());
  const monthExpenses = useMemo(() => expenses.filter((e) => isSameMonth(e.expenseDate, monthAnchor)), [expenses, monthAnchor]);
  const total = useMemo(() => totalSpending(expenses, monthAnchor), [expenses, monthAnchor]);

  const chartSegments: ChartSegment[] = useMemo(() => {
    const byCategory = new Map<string, number>();
    monthExpenses.forEach((e) => byCategory.set(e.categoryId, (byCategory.get(e.categoryId) ?? 0) + e.amount));
    return categories
      .map((c, index) => ({ key: c.id, value: byCategory.get(c.id) ?? 0, color: colorForCategoryIndex(index) }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [categories, monthExpenses]);

  const todayRows = useMemo(() => {
    return expenses
      .filter((e) => isToday(e.expenseDate))
      .sort((a, b) => b.expenseDate - a.expenseDate)
      .map((e) => {
        const index = categories.findIndex((c) => c.id === e.categoryId);
        const category = categories[index];
        const color = category ? colorForCategoryIndex(index) : colors.textSecondary;
        return {
          id: e.id,
          name: e.name,
          amountDisplay: formatMoney(e.amount),
          categoryName: category?.name ?? 'Uncategorized',
          time: formatFriendlyTime(e.expenseDate),
          icon: e.icon,
          iconColor: color,
          iconBg: color + '22',
        };
      });
  }, [expenses, categories, colors.textSecondary]);

  const hasAnyExpenses = expenses.length > 0;
  const hasTodayExpenses = todayRows.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <AppText weight="extrabold" style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Personal Finance
          </AppText>
          <View style={[styles.moreBtn, { backgroundColor: colors.surfaceAlt }]}>
            <MoreGlyph color={colors.textSecondary} />
          </View>
        </View>

        {hasAnyExpenses ? (
          <>
            <View style={[styles.chartCard, { backgroundColor: colors.surface, shadowColor: colors.textPrimary }]}>
              <SemiDonutChart
                segments={chartSegments}
                total={total}
                trackColor={colors.trackColor}
                textColor={colors.textPrimary}
                secondaryTextColor={colors.textSecondary}
                width={240}
              />
            </View>

            <AppText weight="bold" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Today&apos;s Expenses
            </AppText>

            {hasTodayExpenses ? (
              <View style={{ gap: Spacing.sm }}>
                {todayRows.map((row) => (
                  <Pressable
                    key={row.id}
                    onPress={() => router.push({ pathname: '/expense/[id]', params: { id: row.id } })}
                    style={({ pressed }) => [
                      styles.expenseRow,
                      { backgroundColor: colors.surface, shadowColor: colors.textPrimary, opacity: pressed ? 0.85 : 1 },
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
            ) : (
              <View style={[styles.noTodayCard, { backgroundColor: colors.surface, shadowColor: colors.textPrimary }]}>
                <AppText weight="semibold" style={{ color: colors.textSecondary, fontSize: 14 }}>
                  No expenses today
                </AppText>
              </View>
            )}
          </>
        ) : (
          <EmptyState
            icon={<CompassGlyph color={colors.primary} />}
            title="No expenses yet"
            message="Start tracking your spending by adding your first expense."
            actionLabel="+ Add Expense"
            onAction={() => router.push({ pathname: '/expense/[id]', params: { id: 'new' } })}
          />
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push({ pathname: '/expense/[id]', params: { id: 'new' } })}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, bottom: insets.bottom + 96, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <PlusGlyph color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  headerTitle: { fontSize: 22, letterSpacing: -0.3 },
  moreBtn: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
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
  sectionTitle: { fontSize: 15, marginBottom: Spacing.md },
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
  noTodayCard: {
    borderRadius: Radius.lg,
    paddingVertical: 28,
    alignItems: 'center',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: Radius.xl - 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3A5CFF',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
