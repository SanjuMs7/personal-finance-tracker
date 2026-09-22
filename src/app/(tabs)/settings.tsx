import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { exportExcel } from '@/lib/export/excel';
import { exportPdf } from '@/lib/export/pdf';
import { useAppStore } from '@/store/useAppStore';
import type { ThemePreference } from '@/types';

function GuestGlyph({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </Svg>
  );
}

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

function ExcelGlyph({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3v12" />
      <Path d="M7 10l5 5 5-5" />
      <Path d="M4 19h16" />
    </Svg>
  );
}

function PdfGlyph({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <Path d="M14 3v5h5" />
    </Svg>
  );
}

function CheckGlyph({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 13l4 4L19 7" />
    </Svg>
  );
}

const SEGMENTS: { key: ThemePreference; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

type ExportStage = 'idle' | 'busy' | 'done';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const themePreference = useAppStore((s) => s.themePreference);
  const setThemePreference = useAppStore((s) => s.setThemePreference);
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);

  const [exportOpen, setExportOpen] = useState(false);
  const [stage, setStage] = useState<ExportStage>('idle');
  const [exportLabel, setExportLabel] = useState('');

  async function runExport(kind: 'excel' | 'pdf') {
    setExportLabel(kind === 'excel' ? 'Excel file' : 'PDF report');
    setStage('busy');
    try {
      if (kind === 'excel') {
        await exportExcel(categories, expenses);
      } else {
        await exportPdf(categories, expenses);
      }
      setStage('done');
    } catch (err) {
      console.warn('Export failed', err);
      setStage('idle');
      Alert.alert('Export failed', 'Something went wrong while preparing your file. Please try again.');
    }
  }

  function closeExport() {
    setExportOpen(false);
    setTimeout(() => setStage('idle'), 200);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <AppText weight="extrabold" style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Settings
        </AppText>

        <View style={[styles.card, styles.profileCard, { backgroundColor: colors.surface, shadowColor: colors.textPrimary }]}>
          <View style={[styles.avatar, { backgroundColor: colors.surfaceAlt }]}>
            <GuestGlyph color={colors.textSecondary} />
          </View>
          <AppText weight="bold" style={{ fontSize: 16, color: colors.textPrimary }}>Guest User</AppText>
          <AppText style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
            Your data is currently stored only on this device.
          </AppText>
          <View style={[styles.infoBox, { backgroundColor: colors.surfaceAlt }]}>
            <AppText style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18, textAlign: 'center' }}>
              Sign in later to securely save and access your data across devices.
            </AppText>
          </View>
        </View>

        <AppText weight="bold" style={[styles.sectionLabel, { color: colors.textSecondary }]}>APPEARANCE</AppText>
        <View style={[styles.card, styles.segmentCard, { backgroundColor: colors.surface, shadowColor: colors.textPrimary }]}>
          {SEGMENTS.map((seg) => {
            const active = themePreference === seg.key;
            return (
              <Pressable
                key={seg.key}
                onPress={() => setThemePreference(seg.key)}
                style={[styles.segment, { backgroundColor: active ? colors.primary : 'transparent' }]}
              >
                <AppText weight="bold" style={{ fontSize: 13.5, color: active ? '#fff' : colors.textSecondary }}>
                  {seg.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText weight="bold" style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATA</AppText>
        <Pressable
          onPress={() => setExportOpen(true)}
          android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
          style={[
            styles.card,
            styles.exportRow,
            { backgroundColor: colors.surface, shadowColor: colors.textPrimary, overflow: 'hidden' },
          ]}
        >
          <View style={[styles.exportIcon, { backgroundColor: colors.primarySoft }]}>
            <ExcelGlyph color={colors.primary} />
          </View>
          <AppText weight="bold" style={{ flex: 1, fontSize: 14.5, color: colors.textPrimary }}>Export Data</AppText>
          <ChevronRight color={colors.textSecondary} />
        </Pressable>

        <AppText style={[styles.footer, { color: colors.textSecondary }]}>Personal Finance · v1.0.0</AppText>
      </ScrollView>

      {/* Wrapped in a Modal so the sheet covers the floating tab bar, which the
          navigator renders above this screen. Safe here: nothing nests inside it. */}
      <Modal visible={exportOpen} transparent statusBarTranslucent animationType="fade" onRequestClose={closeExport}>
        <BottomSheet visible={exportOpen} onClose={closeExport} maxHeight="60%">
        <View style={styles.sheetHeader}>
          <AppText weight="extrabold" style={{ fontSize: 17, color: colors.textPrimary }}>Export Data</AppText>
        </View>
        <View style={styles.sheetBody}>
          {stage === 'idle' && (
            <View style={{ gap: Spacing.md }}>
              <Pressable
                onPress={() => runExport('excel')}
                style={[styles.optionRow, { backgroundColor: colors.surfaceAlt }]}
              >
                <View style={[styles.exportIcon, { backgroundColor: colors.excelSoft }]}>
                  <ExcelGlyph color={colors.excelColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight="bold" style={{ fontSize: 14.5, color: colors.textPrimary }}>Excel</AppText>
                  <AppText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Spreadsheet with expenses &amp; category totals
                  </AppText>
                </View>
                <ChevronRight color={colors.textSecondary} />
              </Pressable>
              <Pressable
                onPress={() => runExport('pdf')}
                style={[styles.optionRow, { backgroundColor: colors.surfaceAlt }]}
              >
                <View style={[styles.exportIcon, { backgroundColor: colors.dangerSoft }]}>
                  <PdfGlyph color={colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight="bold" style={{ fontSize: 14.5, color: colors.textPrimary }}>PDF Report</AppText>
                  <AppText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Graphical summary with charts
                  </AppText>
                </View>
                <ChevronRight color={colors.textSecondary} />
              </Pressable>
            </View>
          )}
          {stage === 'busy' && (
            <View style={styles.centerState}>
              <AppText weight="bold" style={{ fontSize: 14, color: colors.textPrimary }}>Preparing {exportLabel}…</AppText>
            </View>
          )}
          {stage === 'done' && (
            <View style={styles.centerState}>
              <View style={[styles.doneIcon, { backgroundColor: colors.primarySoft }]}>
                <CheckGlyph color={colors.primary} />
              </View>
              <AppText weight="bold" style={{ fontSize: 14.5, color: colors.textPrimary, marginBottom: 4 }}>
                {exportLabel} ready
              </AppText>
              <AppText style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 16 }}>Ready to save or share.</AppText>
              <Pressable onPress={closeExport} style={[styles.doneBtn, { backgroundColor: colors.primary }]}>
                <AppText weight="bold" style={{ color: '#fff', fontSize: 13.5 }}>Done</AppText>
              </Pressable>
            </View>
          )}
          </View>
        </BottomSheet>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl },
  headerTitle: { fontSize: 22, letterSpacing: -0.3, marginBottom: Spacing.xl },
  card: {
    borderRadius: Radius.lg,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileCard: { alignItems: 'center', padding: Spacing.xxl, marginBottom: Spacing.xl },
  avatar: { width: 64, height: 64, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  infoBox: { marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, width: '100%' },
  sectionLabel: { fontSize: 12, letterSpacing: 0.5, marginHorizontal: Spacing.xs, marginBottom: Spacing.md, marginTop: Spacing.xs },
  segmentCard: { flexDirection: 'row', padding: 6, gap: 4, marginBottom: Spacing.xl },
  segment: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  exportRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  exportIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  footer: { textAlign: 'center', fontSize: 11.5, marginTop: Spacing.xxl },
  sheetHeader: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xs },
  sheetBody: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg },
  centerState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  doneIcon: { width: 52, height: 52, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  doneBtn: { paddingHorizontal: 24, paddingVertical: 11, borderRadius: Radius.md },
});
