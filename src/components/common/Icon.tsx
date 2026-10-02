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
    case 'recharge':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={4} y={3} width={9.5} height={18} rx={2.2} {...common} />
          <Line x1={7} y1={18} x2={10.5} y2={18} {...common} />
          <Path d="M16.5 8.5a4.5 4.5 0 0 1 0 7" {...common} />
          <Path d="M19.3 6a8 8 0 0 1 0 12" {...common} />
        </Svg>
      );
    case 'fuel':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" {...common} />
          <Line x1={3} y1={21} x2={14} y2={21} {...common} />
          <Line x1={5.5} y1={8.5} x2={11.5} y2={8.5} {...common} />
          <Path d="M13 8h3.5a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 0 3 0v-6l-2.5-3" {...common} />
        </Svg>
      );
    case 'pets':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Ellipse cx={7.5} cy={8} rx={1.7} ry={2.2} {...common} />
          <Ellipse cx={12.5} cy={6.6} rx={1.7} ry={2.2} {...common} />
          <Ellipse cx={17.2} cy={9.6} rx={1.6} ry={2} {...common} />
          <Ellipse cx={4.6} cy={12} rx={1.6} ry={2} {...common} />
          <Path d="M11.8 12.6c2.6 0 4.7 2 4.7 4.2 0 1.9-1.5 2.9-3.2 2.9-1 0-1.3-.4-2.4-.4s-1.4.4-2.4.4c-1.7 0-3.2-1-3.2-2.9 0-2.2 2.1-4.2 4.7-4.2z" {...common} />
        </Svg>
      );
    case 'subscriptions':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M17 2l4 4-4 4" {...common} />
          <Path d="M3 11V9a4 4 0 0 1 4-4h14" {...common} />
          <Path d="M7 22l-4-4 4-4" {...common} />
          <Path d="M21 13v2a4 4 0 0 1-4 4H3" {...common} />
        </Svg>
      );
    case 'clothing':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M8.5 3L5 4.8 3 9l3 1.5V21h12V10.5L21 9l-2-4.2L15.5 3" {...common} />
          <Path d="M8.5 3a3.5 3.5 0 0 0 7 0" {...common} />
        </Svg>
      );
    case 'insurance':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3l7.5 3v5.6c0 4.5-3.2 8.2-7.5 9.4-4.3-1.2-7.5-4.9-7.5-9.4V6L12 3z" {...common} />
          <Path d="M9 12l2.2 2.2L15.5 10" {...common} />
        </Svg>
      );
    case 'kids':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3c3 0 5 2.5 5 5.6S14.5 15 12 15 7 11.7 7 8.6 9 3 12 3z" {...common} />
          <Path d="M10.9 15.2l1.1 1.8 1.1-1.8" {...common} />
          <Path d="M12 17c0 2.2 2.2 1.8 2.2 4" {...common} />
        </Svg>
      );
    case 'repairs':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-8 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-8l-3.7 3.9z" {...common} />
        </Svg>
      );
    case 'grooming':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={6} cy={6} r={3} {...common} />
          <Circle cx={6} cy={18} r={3} {...common} />
          <Line x1={20} y1={4} x2={8.1} y2={15.9} {...common} />
          <Line x1={14.5} y1={14.5} x2={20} y2={20} {...common} />
          <Line x1={8.1} y1={8.1} x2={12} y2={12} {...common} />
        </Svg>
      );
    case 'laundry':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={4} y={3} width={16} height={18} rx={2.2} {...common} />
          <Line x1={4} y1={8} x2={20} y2={8} {...common} />
          <Circle cx={12} cy={14.5} r={4} {...common} />
          <Circle cx={7.2} cy={5.5} r={0.7} fill={color} stroke="none" />
        </Svg>
      );
    case 'charity':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M15.4 3.6a3 3 0 0 0-3.4 1 3 3 0 0 0-5.2 2.6c.4 2 3.2 4 5.2 5.3 2-1.3 4.8-3.3 5.2-5.3a3 3 0 0 0-1.8-3.6z" {...common} />
          <Path d="M3 16.2c1.5 0 2.5-.8 4-.8h3a1.2 1.2 0 0 1 0 2.4H8.5" {...common} />
          <Path d="M21 15.2c-1.8.6-4.4 3.4-6.5 4.4-1.4.7-3.2.5-4.6-.2L3 17.2" {...common} />
        </Svg>
      );
    case 'tax':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21V3z" {...common} />
          <Line x1={9.4} y1={8.4} x2={14.6} y2={13.6} {...common} />
          <Circle cx={9.6} cy={8.6} r={1} {...common} />
          <Circle cx={14.4} cy={13.4} r={1} {...common} />
        </Svg>
      );
    case 'books':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...common} />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...common} />
          <Line x1={9} y1={7} x2={16} y2={7} {...common} />
        </Svg>
      );
    case 'music':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M9 17V5l11-2v12" {...common} />
          <Circle cx={6.5} cy={17.5} r={2.6} {...common} />
          <Circle cx={17.4} cy={15.5} r={2.6} {...common} />
        </Svg>
      );
    case 'games':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M17.3 6H6.7a4 4 0 0 0-4 3.6C2.6 10.3 2 14.5 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.2-1.2a2 2 0 0 1 1.4-.6h4.8a2 2 0 0 1 1.4.6L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.5-.6-5.7-.7-6.4A4 4 0 0 0 17.3 6z" {...common} />
          <Line x1={6.5} y1={11} x2={9.5} y2={11} {...common} />
          <Line x1={8} y1={9.5} x2={8} y2={12.5} {...common} />
          <Circle cx={15.5} cy={12.5} r={0.8} fill={color} stroke="none" />
          <Circle cx={18} cy={10.3} r={0.8} fill={color} stroke="none" />
        </Svg>
      );
    case 'snacks':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={9} {...common} />
          <Circle cx={9.4} cy={9.6} r={0.9} fill={color} stroke="none" />
          <Circle cx={14.6} cy={11} r={0.9} fill={color} stroke="none" />
          <Circle cx={10.8} cy={15} r={0.9} fill={color} stroke="none" />
          <Circle cx={15.4} cy={15.4} r={0.7} fill={color} stroke="none" />
        </Svg>
      );
    case 'parking':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={3} y={3} width={18} height={18} rx={3.5} {...common} />
          <Path d="M10 17V8h3.2a2.9 2.9 0 0 1 0 5.8H10" {...common} />
        </Svg>
      );
    case 'furniture':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4.5 11V8a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" {...common} />
          <Path d="M4.5 11a2.2 2.2 0 0 0-2.2 2.2V17h19.4v-3.8A2.2 2.2 0 0 0 19.5 11a2.2 2.2 0 0 0-2.2 2.2V14H6.7v-.8A2.2 2.2 0 0 0 4.5 11z" {...common} />
          <Line x1={5} y1={17} x2={5} y2={19.5} {...common} />
          <Line x1={19} y1={17} x2={19} y2={19.5} {...common} />
        </Svg>
      );
    case 'loan':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={2.5} y={6} width={19} height={12} rx={2.2} {...common} />
          <Circle cx={12} cy={12} r={2.6} {...common} />
          <Circle cx={6} cy={12} r={0.7} fill={color} stroke="none" />
          <Circle cx={18} cy={12} r={0.7} fill={color} stroke="none" />
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
  recharge: 'Recharge',
  other: 'Miscellaneous',
  fuel: 'Fuel',
  pets: 'Pets',
  subscriptions: 'Subscriptions',
  clothing: 'Clothing',
  insurance: 'Insurance',
  kids: 'Kids',
  repairs: 'Repairs',
  grooming: 'Grooming',
  laundry: 'Laundry',
  charity: 'Charity',
  tax: 'Tax',
  books: 'Books',
  music: 'Music',
  games: 'Games',
  snacks: 'Snacks',
  parking: 'Parking',
  furniture: 'Furniture',
  loan: 'Loan',
};

/**
 * Alphabetical by the label people actually read, so scanning the grid works.
 * Miscellaneous is pinned last: it is the catch-all, not a peer of the rest.
 * Plain comparison rather than localeCompare — every label is ASCII, and Intl
 * is slow enough on Hermes to be worth avoiding even once at startup.
 */
export const ICON_KEYS: IconKey[] = [
  ...(Object.keys(ICON_LABELS) as IconKey[])
    .filter((key) => key !== 'other')
    .sort((a, b) => (ICON_LABELS[a] < ICON_LABELS[b] ? -1 : 1)),
  'other',
];
