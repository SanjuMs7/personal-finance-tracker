import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>{icon}</View>
      <AppText weight="extrabold" style={[styles.title, { color: colors.textPrimary }]}>{title}</AppText>
      <AppText style={[styles.message, { color: colors.textSecondary }]}>{message}</AppText>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: Spacing.xxl },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: { fontSize: 17, marginBottom: Spacing.xs },
  message: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', maxWidth: 240, marginBottom: Spacing.xxl },
  action: { paddingHorizontal: 22, alignSelf: 'center' },
});
