import { DarkColors, LightColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store/useAppStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themePreference = useAppStore((s) => s.themePreference);

  const isDark = themePreference === 'system' ? systemScheme === 'dark' : themePreference === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  return { colors, isDark };
}
