import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function TrashIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <Path d="M10 11v6" />
      <Path d="M14 11v6" />
    </Svg>
  );
}

export function ConfirmDialog({ visible, title, body, confirmLabel = 'Delete', onCancel, onConfirm }: ConfirmDialogProps) {
  const { colors } = useTheme();
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.card, { backgroundColor: colors.sheetBg }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
            <TrashIcon color={colors.danger} size={22} />
          </View>
          <AppText weight="extrabold" style={[styles.title, { color: colors.textPrimary }]}>{title}</AppText>
          <AppText style={[styles.body, { color: colors.textSecondary }]}>{body}</AppText>
          <View style={styles.row}>
            <Pressable style={[styles.btn, { backgroundColor: colors.surfaceAlt }]} onPress={onCancel}>
              <AppText weight="bold" style={[styles.btnText, { color: colors.textPrimary }]}>Cancel</AppText>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.danger }]} onPress={onConfirm}>
              <AppText weight="bold" style={[styles.btnText, { color: '#fff' }]}>{confirmLabel}</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,8,15,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  card: {
    width: '100%',
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 16, marginBottom: Spacing.xs, textAlign: 'center' },
  body: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center' },
  btnText: { fontSize: 13.5 },
});
