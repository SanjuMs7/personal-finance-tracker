import { Text, type TextProps } from 'react-native';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

const FAMILY: Record<Weight, string> = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

interface AppTextProps extends TextProps {
  weight?: Weight;
}

export function AppText({ weight = 'regular', style, ...props }: AppTextProps) {
  return <Text style={[{ fontFamily: FAMILY[weight] }, style]} {...props} />;
}
