import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatFriendlyDate, formatFriendlyTime } from '@/lib/formatting/datetime';

interface DateTimeFieldProps {
  value: Date;
  onChange: (date: Date) => void;
}

function combine(date: Date, time: Date): Date {
  const out = new Date(date);
  out.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return out;
}

export function DateTimeField({ value, onChange }: DateTimeFieldProps) {
  const { colors, isDark } = useTheme();
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  function openPicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        onChange: (event, selectedDate) => {
          if (event.type !== 'set' || !selectedDate) return;
          DateTimePickerAndroid.open({
            value,
            mode: 'time',
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type !== 'set' || !selectedTime) return;
              onChange(combine(selectedDate, selectedTime));
            },
          });
        },
      });
    } else {
      setShowIOSPicker((v) => !v);
    }
  }

  return (
    <View>
      <Pressable onPress={openPicker} style={[styles.field, { backgroundColor: colors.surfaceAlt }]}>
        <AppText weight="semibold" style={{ fontSize: 14, color: colors.textPrimary }}>
          {formatFriendlyDate(value.getTime())}, {formatFriendlyTime(value.getTime())}
        </AppText>
      </Pressable>
      {showIOSPicker && Platform.OS === 'ios' ? (
        <DateTimePicker
          value={value}
          mode="datetime"
          display="inline"
          themeVariant={isDark ? 'dark' : 'light'}
          onChange={(_, selected) => {
            if (selected) onChange(selected);
          }}
          style={{ marginTop: 8 }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { width: '100%', paddingVertical: 13, paddingHorizontal: 14, borderRadius: Radius.md },
});
