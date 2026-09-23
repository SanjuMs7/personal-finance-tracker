import type { IconKey } from '@/types';

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** One fixed colour per icon. Categories must use distinct icons, so this
 * gives every category a stable colour that never shifts as the list changes. */
export const ICON_COLORS: Record<IconKey, string> = {
  food: '#F5A623',
  groceries: '#16C098',
  transport: '#3A5CFF',
  shopping: '#F472B6',
  home: '#8B5CF6',
  rent: '#6366F1',
  bills: '#EF4444',
  entertainment: '#22B8CF',
  travel: '#0EA5E9',
  coffee: '#B45309',
  health: '#FB7185',
  fitness: '#10B981',
  education: '#A855F7',
  gift: '#D946EF',
  savings: '#0D9488',
  recharge: '#84CC16',
  other: '#64748B',
};

export const LightColors = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF1F7',
  sheetBg: '#FFFFFF',
  textPrimary: '#14171F',
  textSecondary: '#7C818F',
  border: '#E7E9F0',
  handle: '#DEE1EA',
  primary: '#3A5CFF',
  primarySoft: '#E9EDFF',
  trackColor: '#EDEFF5',
  buttonDisabled: '#CFD5E2',
  navBg: 'rgba(255,255,255,0.94)',
  success: '#22C55E',
  warning: '#F5A623',
  warningSoft: '#FDF1DD',
  warningText: '#B9790C',
  danger: '#DC2626',
  dangerSoft: '#FDEAEA',
  excelColor: '#1E9E63',
  excelSoft: '#E4F7ED',
};

export const DarkColors = {
  bg: '#0D0F16',
  surface: '#171A23',
  surfaceAlt: '#1F2330',
  sheetBg: '#1B1E29',
  textPrimary: '#F4F5F9',
  textSecondary: '#8B90A0',
  border: '#272B38',
  handle: '#333949',
  primary: '#6C87FF',
  primarySoft: '#232A4D',
  trackColor: '#242836',
  buttonDisabled: '#333A4C',
  navBg: 'rgba(23,26,35,0.9)',
  success: '#22C55E',
  warning: '#FBBF24',
  warningSoft: '#332A14',
  warningText: '#FBBF24',
  danger: '#EF4444',
  dangerSoft: '#3A1E1E',
  excelColor: '#3FCB84',
  excelSoft: '#173425',
};

export type ThemeColors = typeof LightColors;

/** Budget status thresholds, centralized so they can be tuned in one place. */
export const BUDGET_THRESHOLDS = {
  warning: 80,
  danger: 100,
};
