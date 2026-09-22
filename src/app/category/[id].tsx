import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { BottomSheet } from '@/components/common/BottomSheet';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ICON_KEYS, ICON_LABELS, Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { MoveCategoryDialog } from '@/components/limits/MoveCategoryDialog';
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

function ChevronGlyph({ color, direction }: { color: string; direction: 'left' | 'right' }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </Svg>
  );
}

export default function CategoryFormScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const deleteCategorySimple = useAppStore((s) => s.deleteCategorySimple);
  const deleteCategoryAndReassign = useAppStore((s) => s.deleteCategoryAndReassign);
  const deleteCategoryAndExpenses = useAppStore((s) => s.deleteCategoryAndExpenses);

  const isNew = id === 'new';
  const existing = useMemo(() => (isNew ? undefined : categories.find((c) => c.id === id)), [categories, id, isNew]);
  const expenseCount = useMemo(() => expenses.filter((e) => e.categoryId === id).length, [expenses, id]);
  const otherCategories = useMemo(() => categories.filter((c) => c.id !== id), [categories, id]);

  // Each category owns a distinct icon, which is what makes its colour stable.
  const takenIcons = useMemo(
    () => new Set(categories.filter((c) => c.id !== id).map((c) => c.icon)),
    [categories, id]
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState<IconKey>(
    existing?.icon ?? ICON_KEYS.find((k) => !categories.some((c) => c.icon === k)) ?? 'other'
  );
  const [limitText, setLimitText] = useState(existing?.monthlyLimit != null ? formatMoneyInput(existing.monthlyLimit) : '');

  const [iconListOpen, setIconListOpen] = useState(false);
  const [simpleDeleteOpen, setSimpleDeleteOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(otherCategories[0]?.id ?? null);

  const isValid = name.trim().length > 0;

  function close() {
    router.back();
  }

  // Name mirrors the icon on every icon change, whichever control made it.
  function selectIcon(next: IconKey) {
    setIcon(next);
    setName(ICON_LABELS[next]);
  }

  function cycleIcon(direction: 1 | -1) {
    const len = ICON_KEYS.length;
    const start = ICON_KEYS.indexOf(icon);
    for (let step = 1; step <= len; step++) {
      const next = ICON_KEYS[(((start + direction * step) % len) + len) % len];
      if (!takenIcons.has(next)) {
        selectIcon(next);
        return;
      }
    }
  }

  async function handleSave() {
    if (!isValid) return;
    const parsed = limitText.trim() === '' ? null : Math.max(0, Math.round(parseFloat(limitText) * 100));
    const monthlyLimit = parsed === null || Number.isNaN(parsed) ? null : parsed;
    if (isNew) {
      await addCategory({ name: name.trim(), icon, monthlyLimit });
    } else if (existing) {
      await updateCategory(existing.id, { name: name.trim(), icon, monthlyLimit });
    }
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

  if (!isNew && !existing) return null;

  return (
    <>
      <BottomSheet
        visible
        onClose={close}
        maxHeight="88%"
        footer={
          <>
            <PrimaryButton label={isNew ? 'Add Category' : 'Save Category'} onPress={handleSave} disabled={!isValid} />
            {!isNew && (
              <Pressable onPress={promptDelete} style={styles.deleteBtn}>
                <AppText weight="bold" style={{ fontSize: 13.5, color: colors.danger }}>Delete Category</AppText>
              </Pressable>
            )}
          </>
        }
      >
        <View style={styles.header}>
          <AppText weight="extrabold" style={{ fontSize: 17, color: colors.textPrimary }}>
            {isNew ? 'Add Category' : 'Edit Category'}
          </AppText>
          <Pressable onPress={close} style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}>
            <CloseGlyph color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.iconBlock}>
            <View style={styles.iconRow}>
              <Pressable
                onPress={() => cycleIcon(-1)}
                accessibilityRole="button"
                accessibilityLabel="Previous icon"
                android_ripple={{ color: 'rgba(0,0,0,0.12)', borderless: true }}
                style={styles.chevronBtn}
              >
                <ChevronGlyph color={colors.textSecondary} direction="left" />
              </Pressable>

              <Pressable onPress={() => setIconListOpen((v) => !v)} style={[styles.iconPreview, { backgroundColor: colorForIcon(icon) + '22' }]}>
                <Icon name={icon} color={colorForIcon(icon)} size={26} />
              </Pressable>

              <Pressable
                onPress={() => cycleIcon(1)}
                accessibilityRole="button"
                accessibilityLabel="Next icon"
                android_ripple={{ color: 'rgba(0,0,0,0.12)', borderless: true }}
                style={styles.chevronBtn}
              >
                <ChevronGlyph color={colors.textSecondary} direction="right" />
              </Pressable>
            </View>
            <Pressable onPress={() => setIconListOpen((v) => !v)}>
              <AppText weight="bold" style={{ fontSize: 12.5, color: colors.primary }}>
                {iconListOpen ? 'Hide list' : 'See full list'}
              </AppText>
            </Pressable>
          </View>

          {iconListOpen ? (
            <View style={styles.iconGrid}>
              {ICON_KEYS.map((key) => {
                const active = key === icon;
                const taken = takenIcons.has(key);
                return (
                  <Pressable
                    key={key}
                    disabled={taken}
                    onPress={() => {
                      selectIcon(key);
                      setIconListOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={taken ? `${ICON_LABELS[key]}, already used` : ICON_LABELS[key]}
                    accessibilityState={{ disabled: taken }}
                    style={[
                      styles.iconTile,
                      {
                        backgroundColor: colorForIcon(key) + (active ? '33' : '1A'),
                        borderWidth: active ? 2 : 0,
                        borderColor: colorForIcon(key),
                        opacity: taken ? 0.3 : 1,
                      },
                    ]}
                  >
                    <Icon name={key} color={colorForIcon(key)} size={20} />
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={{ fontSize: 9.5, color: colors.textSecondary }}
                    >
                      {ICON_LABELS[key]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

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

        </View>
      </BottomSheet>

      {existing ? (
        <>
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
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xs },
  closeBtn: { width: 30, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.lg },
  iconBlock: { alignItems: 'center', gap: 10 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  chevronBtn: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  iconTile: { width: 66, height: 66, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconPreview: { width: 64, height: 64, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  textInput: { width: '100%', paddingVertical: 13, paddingHorizontal: 14, borderRadius: Radius.md, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' },
  limitRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 13, paddingHorizontal: 14, borderRadius: Radius.md },
  limitInput: { flex: 1, fontSize: 14, padding: 0, fontFamily: 'PlusJakartaSans_700Bold' },
  deleteBtn: { alignItems: 'center', paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
});
