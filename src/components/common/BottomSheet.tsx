import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type DimensionValue } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Pinned below the scroll area, so actions stay reachable with the keyboard up. */
  footer?: React.ReactNode;
  maxHeight?: DimensionValue;
}

export function BottomSheet({ visible, onClose, children, footer, maxHeight = '78%' }: BottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);
  const [prevVisible, setPrevVisible] = useState(visible);

  // Mount immediately when opening (adjusting state during render, per React's
  // documented pattern for reacting to prop changes without an effect).
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setMounted(true);
  }

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: 220 });
    } else {
      progress.value = withTiming(0, { duration: 180 });
      const timeout = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(timeout);
    }
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 40 }],
    opacity: progress.value,
  }));

  if (!mounted) return null;

  // Rendered in-tree rather than in a RN <Modal>: Android cannot stack sibling
  // Modals, which silently swallowed every nested picker opened from a sheet.
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      {/* keyboard-controller's version, not RN's: under Android edge-to-edge the
          window never resizes, so RN's KeyboardAvoidingView does nothing here. */}
      <KeyboardAvoidingView style={styles.sheetWrap} behavior="padding" pointerEvents="box-none">
        <Animated.View style={[styles.sheet, sheetStyle, { backgroundColor: colors.sheetBg, maxHeight }]}>
          <View style={[styles.handle, { backgroundColor: colors.handle }]} />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, footer ? null : { paddingBottom: 24 + insets.bottom }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { paddingBottom: Spacing.lg + insets.bottom }]}>{footer}</View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(6,8,15,0.5)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },
  // flexShrink lets the sheet hug its content until it reaches maxHeight, then scroll.
  scroll: { flexShrink: 1 },
  scrollContent: { paddingBottom: 8 },
  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg, gap: Spacing.sm },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
});
