import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { BottomSheet } from '@/components/common/BottomSheet';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Icon } from '@/components/common/Icon';
import { IconPickerSheet } from '@/components/common/IconPickerSheet';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { MoveCategoryDialog } from '@/components/limits/MoveCategoryDialog';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoneyInput } from '@/lib/formatting/money';
import { useAppStore } from '@/store/useAppStore';
import type { IconKey } from '@/types';

function CloseGlyph({ color }: { color: string }) {
  return (
    <AppText weight="bold" style={{ color, fontSize: 15, lineHeight: 15 }}>✕</AppText>
  );
}

export default function CategoryFormScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const deleteCategorySimple = useAppStore((s) => s.deleteCategorySimple);
  const deleteCategoryAndReassign = useAppStore((s) => s.deleteCategoryAndReassign);
  const deleteCategoryAndExpenses = useAppStore((s) => s.deleteCategoryAndExpenses);

  const existing = useMemo(() => categories.find((c) => c.id === id), [categories, id]);
  const expenseCount = useMemo(() => expenses.filter((e) => e.categoryId === id).length, [expenses, id]);
  const otherCategories = useMemo(() => categories.filter((c) => c.id !== id), [categories, id]);

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState<IconKey>(existing?.icon ?? 'other');
  const [limitText, setLimitText] = useState(existing?.monthlyLimit != null ? formatMoneyInput(existing.monthlyLimit) : '');

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [simpleDeleteOpen, setSimpleDeleteOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(otherCategories[0]?.id ?? null);

  const isFresh = existing?.name === 'Other' && existing?.icon === 'other' && existing?.monthlyLimit == null && expenseCount === 0;
  const isValid = name.trim().length > 0;

  function close() {
    router.back();
  }

  async function handleSave() {
    if (!existing || !isValid) return;
    const limitValue = limitText.trim() === '' ? null : Math.max(0, Math.round(parseFloat(limitText) * 100));
    await updateCategory(existing.id, { name: name.trim(), icon, monthlyLimit: Number.isNaN(limitValue as number) ? null : limitValue });
    close();
  }

  function promptDelete() {
    if (expenseCount > 0) {
      setMoveTargetId(otherCategories[0]?.id ?? null);
      setMoveDialogOpen(true);
    } else {
      setSimpleDeleteOpen(true);
    }
  }

  async function confirmSimpleDelete() {
    if (existing) await deleteCategorySimple(existing.id);
    setSimpleDeleteOpen(false);
    close();
  }

  async function confirmMoveThenDelete() {
    if (existing && moveTargetId) await deleteCategoryAndReassign(existing.id, moveTargetId);
    setMoveDialogOpen(false);
    close();
  }

  async function confirmDeleteAll() {
    if (existing) await deleteCategoryAndExpenses(existing.id);
    setMoveDialogOpen(false);
    close();
  }

  if (!existing) return null;

  return (
    <>
      <BottomSheet visible onClose={close} maxHeight="80%">
        <View style={styles.header}>
          <AppText weight="extrabold" style={{ fontSize: 17, color: colors.textPrimary }}>
            {isFresh ? 'Add Category' : 'Edit Category'}
          </AppText>
          <Pressable onPress={close} style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}>
            <CloseGlyph color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.iconBlock}>
            <Pressable onPress={() => setIconPickerOpen(true)} style={[styles.iconPreview, { backgroundColor: colors.primarySoft }]}>
              <Icon name={icon} color={colors.primary} size={26} />
            </Pressable>
            <Pressable onPress={() => setIconPickerOpen(true)}>
              <AppText weight="bold" style={{ fontSize: 12.5, color: colors.primary }}>Change Icon</AppText>
            </Pressable>
          </View>

          <View>
            <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 6 }}>Category Name</AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Food"
              placeholderTextColor={colors.textSecondary}
              style={[styles.textInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
            />
          </View>

          <View>
            <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 6 }}>Monthly Limit (optional)</AppText>
            <View style={[styles.limitRow, { backgroundColor: colors.surfaceAlt }]}>
              <AppText weight="bold" style={{ color: colors.textSecondary }}>₹</AppText>
              <TextInput
                value={limitText}
                onChangeText={setLimitText}
                placeholder="No limit"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                style={[styles.limitInput, { color: colors.textPrimary }]}
              />
            </View>
          </View>

          <PrimaryButton label="Save Category" onPress={handleSave} disabled={!isValid} />

          <Pressable onPress={promptDelete} style={styles.deleteBtn}>
            <AppText weight="bold" style={{ fontSize: 13.5, color: colors.danger }}>Delete Category</AppText>
          </Pressable>
        </View>
      </BottomSheet>

      <IconPickerSheet visible={iconPickerOpen} onClose={() => setIconPickerOpen(false)} selected={icon} onSelect={setIcon} />

      <ConfirmDialog
        visible={simpleDeleteOpen}
        title={`Delete "${existing.name}"?`}
        body="This category has no expenses. This can't be undone."
        onCancel={() => setSimpleDeleteOpen(false)}
        onConfirm={confirmSimpleDelete}
      />

      <MoveCategoryDialog
        visible={moveDialogOpen}
        categoryName={existing.name}
        expenseCount={expenseCount}
        otherCategories={otherCategories}
        selectedTargetId={moveTargetId}
        onSelectTarget={setMoveTargetId}
        onCancel={() => setMoveDialogOpen(false)}
        onMoveAndDelete={confirmMoveThenDelete}
        onDeleteAll={confirmDeleteAll}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xs },
  closeBtn: { width: 30, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.lg },
  iconBlock: { alignItems: 'center', gap: 8 },
  iconPreview: { width: 64, height: 64, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  textInput: { width: '100%', paddingVertical: 13, paddingHorizontal: 14, borderRadius: Radius.md, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
  limitRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 13, paddingHorizontal: 14, borderRadius: Radius.md },
  limitInput: { flex: 1, fontSize: 14, padding: 0, fontFamily: 'PlusJakartaSans_700Bold' },
  deleteBtn: { alignItems: 'center', paddingTop: 2 },
});
