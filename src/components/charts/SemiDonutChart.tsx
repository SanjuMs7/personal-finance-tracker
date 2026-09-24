import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { formatMoney } from '@/lib/formatting/money';

export interface ChartSegment {
  key: string;
  value: number;
  color: string;
}

interface SemiDonutChartProps {
  segments: ChartSegment[];
  total: number;
  caption: string;
  trackColor: string;
  textColor: string;
  secondaryTextColor: string;
  width?: number;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const largeArc = a1 - a0 >= 180 ? 1 : 0;
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

export function SemiDonutChart({ segments, total, caption, trackColor, textColor, secondaryTextColor, width = 240 }: SemiDonutChartProps) {
  // Tall enough that the thicker stroke clears the top edge of the viewBox.
  const height = width * (140 / 240);
  const cx = width / 2;
  const cy = height - 10;
  const r = width * 0.425;
  const strokeWidth = width * 0.096;

  const filtered = segments.filter((s) => s.value > 0);
  const gap = filtered.length > 1 ? 2.5 : 0;
  const spans = filtered.map((seg) => (total > 0 ? (seg.value / total) * 180 : 0));

  const arcs = filtered.map((seg, index) => {
    const startOffset = spans.slice(0, index).reduce((sum, span) => sum + span, 0);
    const a0 = 180 + startOffset + gap / 2;
    const rawA1 = 180 + startOffset + spans[index] - gap / 2;
    const a1 = rawA1 <= a0 ? a0 + 0.5 : rawA1;
    return { d: arcPath(cx, cy, r, a0, a1), color: seg.color, key: seg.key };
  });

  return (
    <View style={{ width, height, alignItems: 'center' }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={arcPath(cx, cy, r, 180, 360)} stroke={trackColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="butt" />
        {arcs.map((arc) => (
          <Path key={arc.key} d={arc.d} stroke={arc.color} strokeWidth={strokeWidth} fill="none" strokeLinecap="butt" />
        ))}
      </Svg>
      <Animated.View entering={FadeIn.duration(400)} style={styles.centerLabel}>
        <AppText weight="extrabold" style={[styles.total, { color: textColor }]}>{formatMoney(total)}</AppText>
        <AppText weight="medium" style={[styles.caption, { color: secondaryTextColor }]}>{caption}</AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerLabel: { position: 'absolute', bottom: 2, alignItems: 'center' },
  total: { fontSize: 30, letterSpacing: -0.5 },
  caption: { fontSize: 13, marginTop: 2 },
});
