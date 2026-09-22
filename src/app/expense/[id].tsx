import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { BottomSheet } from '@/components/common/BottomSheet';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DateTimeField } from '@/components/common/DateTimeField';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { colorForIcon } from '@/lib/calculations/budget';
import { formatMoneyInput } from '@/lib/formatting/money';
import { useAppStore } from '@/store/useAppStore';
import type { IconKey } from '@/types';

function CloseGlyph({ color }: { color: string }) {
  return (
    <AppText weight="bold" style={{ color, fontSize: 15, lineHeight: 15 }}>✕</AppText>
  );
}

export default function ExpenseFormScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);
  const addExpense = useAppStore((s) => s.addExpense);
  const updateExpense = useAppStore((s) => s.updateExpense);
  const deleteExpense = useAppStore((s) => s.deleteExpense);

  const isNew = id === 'new';
  const existing = useMemo(() => expenses.find((e) => e.id === id), [expenses, id]);

  const [name, setName] = useState(existing?.name ?? '');
  const [amountText, setAmountText] = useState(existing ? formatMoneyInput(existing.amount) : '');
  const [categoryId, setCategoryId] = useState<string | null>(existing?.categoryId ?? null);
  const [date, setDate] = useState(existing ? new Date(existing.expenseDate) : new Date());

  const [categoryListOpen, setCategoryListOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  // Icon and colour are the category's; an expense has none of its own.
  const icon: IconKey = selectedCategory?.icon ?? 'other';
  const chipColor = selectedCategory ? colorForIcon(icon) : colors.textSecondary;

  const amountValue = parseFloat(amountText);
  const isValid = name.trim().length > 0 && !Number.isNaN(amountValue) && amountValue > 0 && !!categoryId;

  function close() {
    router.back();
  }

  async function handleSave() {
    if (!isValid || !categoryId) return;
    const amountPaise = Math.round(amountValue * 100);
    if (isNew) {
      await addExpense({ categoryId, name: name.trim(), amount: amountPaise, icon, expenseDate: date.getTime() });
    } else if (existing) {
      await updateExpense(existing.id, { categoryId, name: name.trim(), amount: amountPaise, icon, expenseDate: date.getTime() });
    }
    close();
  }

  async function handleDelete() {
    if (existing) {
      await deleteExpense(existing.id);
    }
    setDeleteOpen(false);
    close();
  }

  return (
    <>
      <BottomSheet
        visible
        onClose={close}
        maxHeight="88%"
        footer={
          <>
            <PrimaryButton label={isNew ? 'Add Expense' : 'Save Changes'} onPress={handleSave} disabled={!isValid} />
            {!isNew && (
              <Pressable onPress={() => setDeleteOpen(true)} style={styles.deleteBtn}>
                <AppText weight="bold" style={{ fontSize: 13.5, color: colors.danger }}>Delete Expense</AppText>
              </Pressable>
            )}
          </>
        }
      >
        <View style={styles.header}>
          <AppText weight="extrabold" style={{ fontSize: 17, color: colors.textPrimary }}>
            {isNew ? 'Add Expense' : 'Edit Expense'}
          </AppText>
          <Pressable onPress={close} style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}>
            <CloseGlyph color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.amountBlock}>
            <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 6 }}>Amount</AppText>
            <View style={styles.amountRow}>
              <AppText weight="extrabold" style={{ fontSize: 30, color: colors.primary }}>₹</AppText>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                style={[styles.amountInput, { color: colors.textPrimary }]}
                autoFocus={isNew}
              />
            </View>
          </View>

          <View style={styles.field}>
            <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 6 }}>Expense</AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Lunch"
              placeholderTextColor={colors.textSecondary}
              style={[styles.textInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
            />
          </View>

          <View>
            <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 6 }}>Category</AppText>
            <Pressable
              onPress={() => setCategoryListOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="Choose category"
              style={[styles.categoryBtn, { backgroundColor: colors.surfaceAlt }]}
            >
              <View style={[styles.smallIcon, { backgroundColor: chipColor + '22' }]}>
                <Icon name={icon} color={chipColor} size={14} />
              </View>
              <AppText weight="bold" numberOfLines={1} style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary }}>
                {selectedCategory?.name ?? 'Select category'}
              </AppText>
              <AppText weight="bold" style={{ fontSize: 12, color: colors.textSecondary }}>
                {categoryListOpen ? 'Close' : 'Change'}
              </AppText>
            </Pressable>

            {categoryListOpen ? (
              <View style={styles.categoryList}>
                {categories.length === 0 ? (
                  <AppText style={{ fontSize: 12.5, lineHeight: 18, color: colors.textSecondary, textAlign: 'center' }}>
                    No categories yet. Add one in the Limits tab first.
                  </AppText>
                ) : (
                  categories.map((category) => {
                    const catColor = colorForIcon(category.icon);
                    const active = category.id === categoryId;
                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => {
                          setCategoryId(category.id);
                          setCategoryListOpen(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={category.name}
                        style={[styles.categoryRow, { backgroundColor: active ? colors.primarySoft : 'transparent' }]}
                      >
                        <View style={[styles.smallIcon, { backgroundColor: catColor + '22' }]}>
                          <Icon name={category.icon} color={catColor} size={14} />
                        </View>
                        <AppText weight="bold" numberOfLines={1} style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary }}>
                          {category.name}
                        </AppText>
                      </Pressable>
                    );
                  })
                )}
              </View>
            ) : null}
          </View>

          <View style={styles.field}>
            <AppText weight="semibold" style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 6 }}>Date &amp; time</AppText>
            <DateTimeField value={date} onChange={setDate} />
          </View>

        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={deleteOpen}
        title="Delete expense?"
        body="This expense will be permanently removed. This can't be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xs },
  closeBtn: { width: 30, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.lg },
  amountBlock: { alignItems: 'center', marginBottom: Spacing.xs },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amountInput: { minWidth: 140, fontSize: 38, fontFamily: 'PlusJakartaSans_800ExtraBold', textAlign: 'center', padding: 0 },
  field: { gap: 0 },
  textInput: { width: '100%', paddingVertical: 13, paddingHorizontal: 14, borderRadius: Radius.md, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
  categoryList: { marginTop: Spacing.sm, gap: 2 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: 8, borderRadius: Radius.md },
  categoryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 12, paddingHorizontal: 12, borderRadius: Radius.md },
  smallIcon: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { alignItems: 'center', paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
});
