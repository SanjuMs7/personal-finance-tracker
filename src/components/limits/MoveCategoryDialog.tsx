import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category } from '@/types';

interface MoveCategoryDialogProps {
  visible: boolean;
  categoryName: string;
  expenseCount: number;
  otherCategories: Category[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string) => void;
  onCancel: () => void;
  onMoveAndDelete: () => void;
  onDeleteAll: () => void;
}

export function MoveCategoryDialog({
  visible,
  categoryName,
  expenseCount,
  otherCategories,
  selectedTargetId,
  onSelectTarget,
  onCancel,
  onMoveAndDelete,
  onDeleteAll,
}: MoveCategoryDialogProps) {
  const { colors } = useTheme();
  if (!visible) return null;

  return (
    <Modal visible transparent statusBarTranslucent animationType="fade" onRequestClose={onCancel}>
      <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.card, { backgroundColor: colors.sheetBg }]}>
          <AppText weight="extrabold" style={{ fontSize: 16, color: colors.textPrimary, marginBottom: 6 }}>
            Delete &quot;{categoryName}&quot;?
          </AppText>
          <AppText style={{ fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginBottom: 16 }}>
            This category has {expenseCount} expense{expenseCount === 1 ? '' : 's'}. Move them to another category, or delete them too.
          </AppText>

          {otherCategories.length === 0 ? (
            <AppText style={{ fontSize: 12.5, lineHeight: 18, color: colors.textSecondary, marginBottom: Spacing.lg }}>
              This is your only category, so there is nowhere to move them to.
            </AppText>
          ) : null}

          {otherCategories.length > 0 ? (
            <AppText weight="bold" style={{ fontSize: 11.5, color: colors.textSecondary, letterSpacing: 0.4, marginBottom: 8 }}>
              MOVE EXPENSES TO
            </AppText>
          ) : null}
          <ScrollView style={otherCategories.length > 0 ? styles.list : undefined}>
            {otherCategories.map((c) => {
              const active = c.id === selectedTargetId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => onSelectTarget(c.id)}
                  style={[styles.targetRow, { backgroundColor: active ? colors.primarySoft : 'transparent' }]}
                >
                  <AppText weight="bold" style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary }}>{c.name}</AppText>
                  {active ? <AppText weight="bold" style={{ color: colors.primary }}>✓</AppText> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {otherCategories.length > 0 ? (
            <Pressable
              onPress={onMoveAndDelete}
              disabled={!selectedTargetId}
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: selectedTargetId ? 1 : 0.45 }]}
            >
              <AppText weight="bold" style={{ color: '#fff', fontSize: 13.5 }}>Move &amp; Delete Category</AppText>
            </Pressable>
          ) : null}
          <Pressable onPress={onDeleteAll} style={[styles.dangerBtn, { backgroundColor: colors.dangerSoft }]}>
            <AppText weight="bold" style={{ color: colors.danger, fontSize: 13.5 }}>Delete Category &amp; Its Expenses</AppText>
          </Pressable>
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <AppText weight="bold" style={{ color: colors.textSecondary, fontSize: 13 }}>Cancel</AppText>
          </Pressable>
      </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(6,8,15,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  card: { width: '100%', borderRadius: Radius.xl, padding: Spacing.xxl },
  list: { maxHeight: 160, marginBottom: Spacing.lg },
  targetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderRadius: Radius.sm, marginBottom: 4 },
  primaryBtn: { paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center', marginBottom: 8 },
  dangerBtn: { paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.sm, marginBottom: 8 },
  cancelBtn: { paddingVertical: 6, alignItems: 'center' },
});
