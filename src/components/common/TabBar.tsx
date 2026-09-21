import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function HomeGlyph({ color }: { color: string }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 11l8-7 8 7" />
      <Path d="M6 10v10h12V10" />
    </Svg>
  );
}

function LimitsGlyph({ color }: { color: string }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4.5} />
      <Circle cx={12} cy={12} r={1} fill={color} />
    </Svg>
  );
}

function SettingsGlyph({ color }: { color: string }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={4} y1={7} x2={20} y2={7} />
      <Circle cx={15} cy={7} r={2} />
      <Line x1={4} y1={12} x2={20} y2={12} />
      <Circle cx={9} cy={12} r={2} />
      <Line x1={4} y1={17} x2={20} y2={17} />
      <Circle cx={13} cy={17} r={2} />
    </Svg>
  );
}

const GLYPHS: Record<string, (color: string) => React.ReactNode> = {
  index: (color) => <HomeGlyph color={color} />,
  limits: (color) => <LimitsGlyph color={color} />,
  settings: (color) => <SettingsGlyph color={color} />,
};

const LABELS: Record<string, string> = {
  index: 'Home',
  limits: 'Limits',
  settings: 'Settings',
};

interface TabBarState {
  index: number;
  routes: { key: string; name: string }[];
}

// `navigation` is typed loosely: expo-router's tab navigator vendors its own
// internal react-navigation copy, so its precise event types aren't importable here.
export function TabBar({ state, navigation }: { state: TabBarState; navigation: any }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 8 }]} pointerEvents="box-none">
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.navBg,
            shadowColor: isDark ? '#000' : '#14171F',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const color = focused ? colors.primary : colors.textSecondary;
          const glyph = GLYPHS[route.name]?.(color);
          const label = LABELS[route.name] ?? route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.item}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={focused ? { selected: true } : {}}
            >
              {glyph}
              <AppText weight="bold" style={[styles.label, { color }]}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
  },
  bar: {
    height: 64,
    borderRadius: Radius.xl + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  item: { alignItems: 'center', gap: 3 },
  label: { fontSize: 10.5 },
});
