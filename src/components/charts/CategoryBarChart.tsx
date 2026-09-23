import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { formatMoney } from '@/lib/formatting/money';
import type { IconKey } from '@/types';

export interface BarDatum {
  key: string;
  label: string;
  icon: IconKey;
  color: string;
  /** Daily average in paise. */
  value: number;
}

interface CategoryBarChartProps {
  data: BarDatum[];
  total: number;
  caption: string;
  width: number;
  trackColor: string;
  textColor: string;
  secondaryTextColor: string;
  plotHeight?: number;
}

export function CategoryBarChart({
  data,
  total,
  caption,
  width,
  trackColor,
  textColor,
  secondaryTextColor,
  plotHeight = 140,
}: CategoryBarChartProps) {
  const columnWidth = data.length > 0 ? width / data.length : width;
  // Past a handful of categories the columns are too narrow for text, so the
  // icons carry the identification on their own.
  const showNames = data.length <= 6;
  const showValues = data.length <= 8;

  const max = data.reduce((m, d) => Math.max(m, d.value), 0);
  const barWidth = Math.max(10, Math.min(30, Math.floor(columnWidth) - 10));

  return (
    <Animated.View entering={FadeIn.duration(260)} style={{ width }}>
      <View style={styles.header}>
        <AppText weight="extrabold" style={[styles.total, { color: textColor }]}>
          {formatMoney(total)}
        </AppText>
        <AppText weight="medium" style={[styles.caption, { color: secondaryTextColor }]}>
          {caption}
        </AppText>
      </View>

      <View style={[styles.plot, { height: plotHeight, borderBottomColor: trackColor }]}>
        {data.map((d) => {
          // A zero stays flat; anything above it keeps a sliver so it reads as present.
          const barHeight = max > 0 && d.value > 0 ? Math.max(3, (d.value / max) * (plotHeight - 18)) : 0;
          return (
            <View key={d.key} style={styles.column}>
              {showValues ? (
                <AppText weight="extrabold" numberOfLines={1} style={{ fontSize: 9.5, color: d.color, marginBottom: 4 }}>
                  {formatMoney(d.value)}
                </AppText>
              ) : null}
              <View style={{ width: barWidth, height: barHeight, backgroundColor: d.color, borderRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
            </View>
          );
        })}
      </View>

      <View style={styles.axis}>
        {data.map((d) => (
          <View key={d.key} style={styles.axisItem}>
            <Icon name={d.icon} color={d.color} size={16} />
            {showNames ? (
              <AppText numberOfLines={1} style={{ fontSize: 9.5, color: secondaryTextColor }}>
                {d.label}
              </AppText>
            ) : null}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 16 },
  total: { fontSize: 30, letterSpacing: -0.5 },
  caption: { fontSize: 13, marginTop: 2 },
  plot: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1.5 },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  axis: { flexDirection: 'row', paddingTop: 8 },
  axisItem: { flex: 1, alignItems: 'center', gap: 3 },
});
