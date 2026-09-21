import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { colorForCategoryIndex, withSpend } from '@/lib/calculations/budget';
import { formatMoney } from '@/lib/formatting/money';
import { useAppStore } from '@/store/useAppStore';

function PlusGlyph({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
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

export default function LimitsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);
  const addBlankCategory = useAppStore((s) => s.addBlankCategory);

  const rows = useMemo(() => withSpend(categories, expenses), [categories, expenses]);

  function statusColor(status: string) {
    if (status === 'danger') return colors.danger;
    if (status === 'warning') return colors.warning;
    return colors.primary;
  }

  function statusTextColor(status: string) {
    if (status === 'danger') return colors.danger;
    if (status === 'warning') return isDark ? colors.warning : '#B9790C';
    return colors.textSecondary;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <AppText weight="extrabold" style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Set Limits
          </AppText>
          <Pressable
            onPress={() => addBlankCategory()}
            style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          >
            <PlusGlyph color="#fff" />
          </Pressable>
        </View>

        {rows.length > 0 ? (
          <View style={{ gap: Spacing.md }}>
            {rows.map((row, index) => {
              const color = colorForCategoryIndex(index);
              const hasLimit = row.status !== 'none';
              const subLine = hasLimit
                ? `${formatMoney(row.spent)} / ${formatMoney(row.monthlyLimit ?? 0)} · ${row.percent}%`
                : `No limit · ${formatMoney(row.spent)} spent`;

              return (
                <View key={row.id} style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.textPrimary }]}>
                  <View style={styles.cardTop}>
                    <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
                      <Icon name={row.icon} color={color} size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText weight="bold" style={{ fontSize: 14.5, color: colors.textPrimary }}>
                        {row.name}
                      </AppText>
                      <AppText weight="semibold" style={{ fontSize: 12.5, marginTop: 2, color: hasLimit ? statusTextColor(row.status) : colors.textSecondary }}>
                        {subLine}
                      </AppText>
                    </View>
                    <Pressable
                      onPress={() => router.push({ pathname: '/category/[id]', params: { id: row.id } })}
                      style={[styles.editBtn, { backgroundColor: colors.surfaceAlt }]}
                    >
                      <PencilGlyph color={colors.textSecondary} />
                    </Pressable>
                  </View>
                  {hasLimit ? (
                    <View style={[styles.track, { backgroundColor: colors.trackColor }]}>
                      <View style={[styles.fill, { width: `${Math.min(row.percent, 100)}%`, backgroundColor: statusColor(row.status) }]} />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon={<TargetGlyph color={colors.primary} />}
            title="No categories yet"
            message="Create your first spending category to start setting limits."
            actionLabel="+ Add Category"
            onAction={() => addBlankCategory()}
          />
        )}
      </ScrollView>
    </View>
  );
}

function PencilGlyph({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={12} y1={20} x2={21} y2={20} />
      <Line x1={16.5} y1={3.5} x2={20.5} y2={7.5} />
      <Line x1={7} y1={19} x2={17} y2={9} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  headerTitle: { fontSize: 22, letterSpacing: -0.3 },
  addBtn: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  editBtn: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  track: { height: 8, borderRadius: 6, marginTop: Spacing.md, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
});
