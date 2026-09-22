import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ label, onPress, disabled, style }: PrimaryButtonProps) {
  const { colors } = useTheme();

  // Every visual property sits in one inline object rather than a StyleSheet
  // entry merged with overrides: a split backgroundColor was dropping out on
  // Android, leaving white label text on an unpainted button.
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      android_ripple={disabled ? undefined : { color: 'rgba(255,255,255,0.24)' }}
      style={[
        {
          alignSelf: 'stretch',
          borderRadius: Radius.md,
          paddingVertical: 15,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: disabled ? colors.buttonDisabled : colors.primary,
        },
        style,
      ]}
    >
      <AppText weight="bold" style={{ fontSize: 14.5, color: disabled ? colors.textSecondary : '#FFFFFF' }}>
        {label}
      </AppText>
    </Pressable>
  );
}
