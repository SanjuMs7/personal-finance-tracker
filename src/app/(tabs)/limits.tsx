import { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { colorForIcon } from '@/lib/calculations/budget';
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

export default function LimitsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const categories = useAppStore((s) => s.categories);
  const { width } = useWindowDimensions();

  // Categories carrying a limit float to the top; sort is stable, so within each
  // group the store's newest-first order is preserved.
  const ordered = useMemo(
    () => [...categories].sort((a, b) => Number(b.monthlyLimit != null) - Number(a.monthlyLimit != null)),
    [categories]
  );

  // Floored, not exact: Yoga rounds each tile up to a whole physical pixel, and
  // three exact thirds then overflow the row by a pixel and wrap to 2 columns.
  const tileWidth = Math.floor((width - Spacing.xl * 2 - GRID_GAP * 2) / 3);

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
            Set Limits
          </AppText>
        </View>

        {categories.length > 0 ? (
          <View style={styles.grid}>
              {ordered.map((category) => {
                const color = colorForIcon(category.icon);
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => openCategory(category.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${category.name}`}
                    style={({ pressed }) => [styles.tile, { width: tileWidth, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      style={[
                        styles.tileSquare,
                        { width: tileWidth, height: tileWidth, backgroundColor: color + '22' },
                      ]}
                    >
                      <Icon name={category.icon} color={color} size={26} />
                      {category.monthlyLimit != null ? (
                        <AppText
                          weight="bold"
                          numberOfLines={1}
                          style={{ fontSize: 11.5, color: colors.textSecondary, textAlign: 'center', marginTop: 6 }}
                        >
                          {formatMoney(category.monthlyLimit)}
                        </AppText>
                      ) : null}
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  headerTitle: { fontSize: 22, letterSpacing: -0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: GRID_GAP, rowGap: Spacing.xl },
  tile: { alignItems: 'center' },
  tileSquare: { borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  addTile: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
