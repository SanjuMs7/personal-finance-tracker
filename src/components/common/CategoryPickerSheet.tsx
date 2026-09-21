import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Icon } from '@/components/common/Icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { colorForCategoryIndex } from '@/lib/calculations/budget';
import type { Category } from '@/types';

interface CategoryPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category) => void;
}

function CheckGlyph({ color }: { color: string }) {
  return (
    <AppText weight="bold" style={{ color, fontSize: 16 }}>✓</AppText>
  );
}

export function CategoryPickerSheet({ visible, onClose, categories, selectedId, onSelect }: CategoryPickerSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="70%">
      <View style={styles.header}>
        <AppText weight="extrabold" style={{ fontSize: 16, color: colors.textPrimary }}>Choose Category</AppText>
      </View>
      <View style={styles.list}>
        {categories.map((category, index) => {
          const color = colorForCategoryIndex(index);
          const active = category.id === selectedId;
          return (
            <Pressable
              key={category.id}
              onPress={() => {
                onSelect(category);
                onClose();
              }}
              style={[styles.row, { backgroundColor: active ? colors.primarySoft : 'transparent' }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
                <Icon name={category.icon} color={color} size={16} />
              </View>
              <AppText weight="bold" style={{ flex: 1, fontSize: 14.5, color: colors.textPrimary }}>{category.name}</AppText>
              {active ? <CheckGlyph color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: 10, borderRadius: Radius.md },
  iconWrap: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
});
