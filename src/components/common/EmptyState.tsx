import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ORB_SIZE = 132;
const DISC_SIZE = 72;

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.orb}>
        {/* Tinted with the primary colour and fading to transparent, so the orb
            sits on either theme's background without a hardcoded colour. */}
        <Svg width={ORB_SIZE} height={ORB_SIZE} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="emptyOrb" cx="34%" cy="30%" r="72%">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.26} />
              <Stop offset="0.6" stopColor={colors.primary} stopOpacity={0.1} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={ORB_SIZE / 2} cy={ORB_SIZE / 2} r={ORB_SIZE / 2} fill="url(#emptyOrb)" />
        </Svg>

        <View style={[styles.disc, { backgroundColor: colors.surface, shadowColor: colors.textPrimary }]}>{icon}</View>
      </View>

      <AppText weight="extrabold" style={[styles.title, { color: colors.textPrimary }]}>{title}</AppText>
      <AppText style={[styles.message, { color: colors.textSecondary }]}>{message}</AppText>

      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 48, paddingBottom: 56, paddingHorizontal: Spacing.xl },
  orb: { width: ORB_SIZE, height: ORB_SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: { fontSize: 19, marginBottom: Spacing.xs, textAlign: 'center' },
  message: { fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 250, marginBottom: Spacing.xxl },
  action: { borderRadius: 999, paddingVertical: 15 },
});
