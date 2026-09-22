import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

import type { IconKey } from '@/types';

interface IconProps {
  name: IconKey;
  size?: number;
  color: string;
}

/**
 * Small hand-drawn stroke-icon set shared with the approved Artifact prototype,
 * kept intentionally minimal so category icons stay visually consistent.
 */
export function Icon({ name, size = 20, color }: IconProps) {
  const common = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'food':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M7 3v5a2.2 2.2 0 0 0 4.4 0V3" {...common} />
          <Line x1={9.2} y1={3} x2={9.2} y2={6.5} {...common} />
          <Line x1={9.2} y1={10.2} x2={9.2} y2={21} {...common} />
          <Path d="M16.4 3c1.9 2.2 1.9 5.6 0 7.8z" {...common} />
          <Line x1={16.4} y1={10.8} x2={16.4} y2={21} {...common} />
        </Svg>
      );
    case 'groceries':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 5h2l2.2 10h10.2l1.9-7H6.5" {...common} />
          <Circle cx={9} cy={19} r={1.5} {...common} />
          <Circle cx={17} cy={19} r={1.5} {...common} />
        </Svg>
      );
    case 'rent':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21" {...common} />
          <Line x1={3} y1={21} x2={21} y2={21} {...common} />
          <Line x1={8.5} y1={7} x2={10} y2={7} {...common} />
          <Line x1={14} y1={7} x2={15.5} y2={7} {...common} />
          <Line x1={8.5} y1={11.5} x2={10} y2={11.5} {...common} />
          <Line x1={14} y1={11.5} x2={15.5} y2={11.5} {...common} />
          <Path d="M10 21v-4.5h4V21" {...common} />
        </Svg>
      );
    case 'education':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 5l9 4-9 4-9-4 9-4z" {...common} />
          <Path d="M7 11v5c0 1.1 2.2 2 5 2s5-.9 5-2v-5" {...common} />
        </Svg>
      );
    case 'fitness':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 9v6" {...common} />
          <Path d="M19 9v6" {...common} />
          <Rect x={7} y={7} width={3} height={10} rx={1} {...common} />
          <Rect x={14} y={7} width={3} height={10} rx={1} {...common} />
          <Line x1={10} y1={12} x2={14} y2={12} {...common} />
        </Svg>
      );
    case 'gift':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M20 12v9H4v-9" {...common} />
          <Rect x={2.5} y={7.5} width={19} height={4.5} rx={1} {...common} />
          <Line x1={12} y1={21} x2={12} y2={7.5} {...common} />
          <Path d="M12 7.5H7.8a2.4 2.4 0 0 1 0-4.8C11.1 2.7 12 7.5 12 7.5z" {...common} />
          <Path d="M12 7.5h4.2a2.4 2.4 0 0 0 0-4.8C12.9 2.7 12 7.5 12 7.5z" {...common} />
        </Svg>
      );
    case 'savings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Ellipse cx={12} cy={6.5} rx={6.5} ry={2.8} {...common} />
          <Path d="M5.5 6.5v4.7c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8V6.5" {...common} />
          <Path d="M5.5 11.2v4.7c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-4.7" {...common} />
        </Svg>
      );
    case 'transport':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={3} y={11} width={18} height={6} rx={2} {...common} />
          <Circle cx={7.5} cy={18} r={1.6} {...common} />
          <Circle cx={16.5} cy={18} r={1.6} {...common} />
          <Path d="M5 11l2-4h10l2 4" {...common} />
        </Svg>
      );
    case 'shopping':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 8h12l-1 12H7L6 8z" {...common} />
          <Path d="M9 8V6a3 3 0 0 1 6 0v2" {...common} />
        </Svg>
      );
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 11l8-7 8 7" {...common} />
          <Path d="M6 10v10h12V10" {...common} />
        </Svg>
      );
    case 'entertainment':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M10 8l6 4-6 4V8z" {...common} />
        </Svg>
      );
    case 'bills':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={6} y={3} width={12} height={18} rx={1} {...common} />
          <Line x1={9} y1={8} x2={15} y2={8} {...common} />
          <Line x1={9} y1={12} x2={15} y2={12} {...common} />
          <Line x1={9} y1={16} x2={13} y2={16} {...common} />
        </Svg>
      );
    case 'travel':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M21 3L3 10l7 3 3 7L21 3z" {...common} />
          <Path d="M10 13l4-4" {...common} />
        </Svg>
      );
    case 'coffee':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 9h11v6a5 5 0 0 1-5 5H10a4 4 0 0 1-4-4V9z" {...common} />
          <Path d="M17 10h2a2 2 0 0 1 0 4h-2" {...common} />
          <Line x1={8} y1={4} x2={8} y2={6} {...common} />
          <Line x1={12} y1={4} x2={12} y2={6} {...common} />
        </Svg>
      );
    case 'health':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 5 6 5c2 0 3.5 1.2 4 2.3.5-1.1 2-2.3 4-2.3 3.5 0 5 3 3.5 6.5C19 15.65 12 20 12 20z"
            {...common}
          />
        </Svg>
      );
    case 'other':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M11 3l9 9-8 8-9-9V3h8z" {...common} />
          <Circle cx={8.5} cy={6.5} r={1.2} fill={color} stroke="none" />
        </Svg>
      );
  }
}

export const ICON_KEYS: IconKey[] = [
  'food',
  'groceries',
  'transport',
  'shopping',
  'home',
  'rent',
  'bills',
  'entertainment',
  'travel',
  'coffee',
  'health',
  'fitness',
  'education',
  'gift',
  'savings',
  'other',
];

export const ICON_LABELS: Record<IconKey, string> = {
  food: 'Food',
  groceries: 'Groceries',
  transport: 'Transport',
  shopping: 'Shopping',
  home: 'Home',
  rent: 'Rent',
  entertainment: 'Fun',
  bills: 'Bills',
  travel: 'Travel',
  coffee: 'Coffee',
  health: 'Health',
  fitness: 'Fitness',
  education: 'Education',
  gift: 'Gift',
  savings: 'Savings',
  other: 'Other',
};
