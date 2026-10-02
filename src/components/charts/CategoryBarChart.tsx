import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { formatMoney, formatMoneyCompact } from '@/lib/formatting/money';
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
  // Past this many columns a name is cut short more often than not, so the row
  // of labels goes and tapping a bar names it instead.
  const showNames = data.length <= 7;

  const [pickedKey, setPickedKey] = useState<string | null>(null);
  // Looked up rather than stored, so a key left over from another period simply
  // stops matching instead of naming the wrong bar.
  const pickedIndex = showNames ? -1 : data.findIndex((d) => d.key === pickedKey);
  const picked = pickedIndex >= 0 ? data[pickedIndex] : undefined;

  // The label sits under its own bar, free to run across the neighbours because
  // a name is nearly always wider than one column, and clamped so it never
  // slides off either edge of the card. Its real width has to be measured: a
  // fixed-width box would centre the text inside itself, leaving a clamped
  // label sitting well to one side of the bar it belongs to.
  const [labelWidth, setLabelWidth] = useState(0);
  const labelCentre = picked ? (pickedIndex + 0.5) * columnWidth : width / 2;
  const labelLeft = Math.max(0, Math.min(width - labelWidth, labelCentre - labelWidth / 2));
  // Amounts are rounded short (₹1.2k), so they fit however many columns there
  // are; only the type size has to give as the columns narrow.
  const valueFontSize = columnWidth < 34 ? 8.5 : 9.5;

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

      {/* Nothing spent in this period leaves no columns at all, so say so
          rather than drawing an empty axis. */}
      {data.length === 0 ? (
        <View style={[styles.empty, { height: plotHeight }]}>
          <AppText style={{ fontSize: 12.5, color: secondaryTextColor }}>Nothing spent in this period yet</AppText>
        </View>
      ) : (
      <View style={[styles.plot, { height: plotHeight, borderBottomColor: trackColor }]}>
        {data.map((d) => {
          // A zero stays flat; anything above it keeps a sliver so it reads as present.
          const barHeight = max > 0 && d.value > 0 ? Math.max(3, (d.value / max) * (plotHeight - 18)) : 0;
          const column = (
            <>
              <AppText weight="extrabold" numberOfLines={1} style={{ fontSize: valueFontSize, color: d.color, marginBottom: 4 }}>
                {formatMoneyCompact(d.value)}
              </AppText>
              <View style={{ width: barWidth, height: barHeight, backgroundColor: d.color, borderRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
            </>
          );

          // Only a column that has something to say takes the touch; otherwise
          // it stays a plain View so the card underneath keeps flipping the
          // chart wherever you press.
          return showNames ? (
            <View key={d.key} style={styles.column}>{column}</View>
          ) : (
            <Pressable
              key={d.key}
              onPress={() => setPickedKey(d.key)}
              accessibilityRole="button"
              accessibilityLabel={d.label}
              accessibilityState={{ selected: d.key === pickedKey }}
              style={styles.column}
            >
              {column}
            </Pressable>
          );
        })}
      </View>
      )}

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

      {/* Always present once the labels are gone, so naming a bar does not
          shift the chart. */}
      {showNames || data.length === 0 ? null : (
        <View style={styles.pickedRow}>
          <AppText
            weight="bold"
            numberOfLines={1}
            onLayout={(e) => setLabelWidth(e.nativeEvent.layout.width)}
            style={[styles.pickedName, { left: labelLeft, maxWidth: width, color: secondaryTextColor }]}
          >
            {picked ? picked.label : 'Tap a bar for its name'}
          </AppText>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 16 },
  total: { fontSize: 30, letterSpacing: -0.5 },
  caption: { fontSize: 13, marginTop: 2 },
  plot: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1.5 },
  empty: { alignItems: 'center', justifyContent: 'center' },
  // alignSelf overrides the row's flex-end: without it a column is only as tall
  // as its own bar, so a short bar could only be tapped on the bar itself and
  // the space above it fell through to the card behind.
  column: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'flex-end' },
  axis: { flexDirection: 'row', paddingTop: 8 },
  axisItem: { flex: 1, alignItems: 'center', gap: 3 },
  pickedRow: { height: 24, marginTop: 8 },
  pickedName: { position: 'absolute', fontSize: 12 },
});
