import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { BottomSheet } from '@/components/common/BottomSheet';
import { ICON_KEYS, ICON_LABELS, Icon } from '@/components/common/Icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { IconKey } from '@/types';

interface IconPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  selected: IconKey;
  onSelect: (icon: IconKey) => void;
}

function SearchGlyph({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={11} cy={11} r={7} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} />
    </Svg>
  );
}

export function IconPickerSheet({ visible, onClose, selected, onSelect }: IconPickerSheetProps) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const filtered = ICON_KEYS.filter((k) => term === '' || k.includes(term) || ICON_LABELS[k].toLowerCase().includes(term));

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="74%">
      <View style={styles.header}>
        <AppText weight="extrabold" style={{ fontSize: 16, color: colors.textPrimary }}>Select Icon</AppText>
      </View>
      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceAlt }]}>
          <SearchGlyph color={colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search icons"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>
      </View>
      <View style={styles.grid}>
        {filtered.map((key) => {
          const active = key === selected;
          return (
            <Pressable
              key={key}
              onPress={() => {
                onSelect(key);
                onClose();
              }}
              style={[styles.tile, { backgroundColor: active ? colors.primarySoft : colors.surfaceAlt }]}
            >
              <Icon name={key} color={active ? colors.primary : colors.textPrimary} size={20} />
              <AppText weight="semibold" style={{ fontSize: 10.5, color: active ? colors.primary : colors.textPrimary }}>
                {ICON_LABELS[key]}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  searchWrap: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 14, padding: 0, fontFamily: 'PlusJakartaSans_600SemiBold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  tile: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
