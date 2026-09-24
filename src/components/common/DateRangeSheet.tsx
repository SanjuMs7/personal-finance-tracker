import { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { BottomSheet } from '@/components/common/BottomSheet';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { Radius, Spacing, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  addDays,
  dayOf,
  makePeriod,
  monthPeriod,
  monthlyCycleFrom,
  periodLength,
} from '@/lib/calculations/period';
import { formatFullDayLabel, formatMonthTitle } from '@/lib/formatting/datetime';
import type { Period } from '@/types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function Chevron({ color, direction }: { color: string; direction: 'left' | 'right' }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points={direction === 'left' ? '15 5 8 12 15 19' : '9 5 16 12 9 19'} />
    </Svg>
  );
}

function ordinal(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${['th', 'st', 'nd', 'rd'][day % 10] ?? 'th'}`;
}

function sameDay(a: number | null, b: number | null): boolean {
  return a != null && b != null && dayOf(a) === dayOf(b);
}

interface DayCell {
  /** Midday, so it compares directly against a period's normalized ends. */
  ts: number;
  label: string;
  a11y: string;
  outside: boolean;
}

/** Calendar cells for `month`, padded out with the neighbouring months' days so
 *  every week row is full. Labels are built here, once per month, rather than in
 *  the render loop — formatting 42 cells on every keystroke was the whole cost. */
const ROW_HEIGHT = 40;
/** Space for the longest month, held open whatever this one needs. A grid that
 *  changes height re-lays-out the sheet mid-step, which is what the stutter
 *  between months actually was. */
const MAX_ROWS = 6;

function buildWeeks(year: number, month: number): DayCell[][] {
  const lead = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();

  const cells: DayCell[] = [];
  const push = (dayOfMonth: number, outside: boolean) => {
    const d = new Date(year, month, dayOfMonth, 12, 0, 0, 0);
    cells.push({
      ts: d.getTime(),
      label: String(d.getDate()),
      a11y: formatFullDayLabel(d.getTime()),
      outside,
    });
  };

  for (let i = lead; i > 0; i--) push(1 - i, true);
  for (let day = 1; day <= total; day++) push(day, false);
  let tail = 1;
  while (cells.length % 7 !== 0) push(total + tail++, true);

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

interface DayProps {
  cell: DayCell;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  isToday: boolean;
  colors: ThemeColors;
  onPick: (ts: number) => void;
}

/** Memoized so stepping a month or moving an end only re-renders the cells that
 *  actually changed. `cell` comes from the per-month grid, so its identity holds
 *  still across renders, and `colors` is a module constant. */
const Day = memo(function Day({ cell, isStart, isEnd, inRange, isToday, colors, onPick }: DayProps) {
  const selected = isStart || isEnd;
  return (
    <View style={styles.cell}>
      {/* Always mounted, only recoloured: mounting and unmounting up to 42 of
          these on every step cost more than drawing them transparent. */}
      <View
        style={[
          styles.band,
          {
            backgroundColor: inRange ? colors.primarySoft : 'transparent',
            left: isStart ? 3 : 0,
            right: isEnd ? 3 : 0,
            borderTopLeftRadius: isStart ? 999 : 0,
            borderBottomLeftRadius: isStart ? 999 : 0,
            borderTopRightRadius: isEnd ? 999 : 0,
            borderBottomRightRadius: isEnd ? 999 : 0,
          },
        ]}
      />
      <Pressable
        onPress={() => onPick(cell.ts)}
        accessibilityRole="button"
        accessibilityLabel={cell.a11y}
        accessibilityState={{ selected }}
        style={[
          styles.day,
          {
            backgroundColor: selected ? colors.primary : 'transparent',
            borderWidth: isToday && !selected ? 1.5 : 0,
            borderColor: isToday && !selected ? colors.textSecondary : 'transparent',
          },
        ]}
      >
        <AppText
          weight={selected ? 'extrabold' : 'semibold'}
          style={{
            fontSize: 12.5,
            color: selected ? '#FFFFFF' : cell.outside ? colors.buttonDisabled : colors.textPrimary,
          }}
        >
          {cell.label}
        </AppText>
      </Pressable>
    </View>
  );
});

interface Selection {
  start: number | null;
  end: number | null;
  /** Which end the next tap sets. */
  picking: 'start' | 'end';
}

interface DateRangeSheetProps {
  visible: boolean;
  /** 'renew' is the prompt shown after a period has run out. */
  mode?: 'edit' | 'renew';
  /** Selection the sheet opens on. */
  initial: Period;
  today: number;
  onClose: () => void;
  onSave: (period: Period) => void;
}

export function DateRangeSheet({ visible, mode = 'edit', initial, today, onClose, onSave }: DateRangeSheetProps) {
  const { colors } = useTheme();

  // The three parts of a selection move together, so they are one piece of
  // state. That lets `pick` be a single pure updater with a fixed identity,
  // which is what keeps the memoized cells from all re-rendering on each tap.
  const [sel, setSel] = useState<Selection>(() => ({ start: initial.start, end: initial.end, picking: 'start' }));
  const [cursor, setCursor] = useState(initial.start);
  const [wasVisible, setWasVisible] = useState(visible);
  const { start, end, picking } = sel;

  // Reopening starts from the caller's period again, rather than whatever the
  // last visit left behind. Adjusting state during render is React's documented
  // pattern for this, and avoids a wasted pass through an effect.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setSel({ start: initial.start, end: initial.end, picking: 'start' });
      setCursor(initial.start);
    }
  }

  function apply(period: Period) {
    setSel({ start: period.start, end: period.end, picking: 'start' });
    setCursor(period.start);
  }

  const pick = useCallback((ts: number) => {
    const day = dayOf(ts);
    setSel((current) =>
      // A tap before the current start begins a new selection rather than
      // producing a backwards range.
      current.picking === 'start' || current.start == null || day < dayOf(current.start)
        ? { start: day, end: null, picking: 'end' }
        : { start: current.start, end: day, picking: 'start' }
    );
    setCursor(ts);
  }, []);

  const shortcuts: { label: string; period: Period }[] = [
    { label: 'This month', period: monthPeriod(today) },
    { label: 'Last 30 days', period: makePeriod(addDays(today, -29), today) },
    ...(start != null
      ? (() => {
          const cycle = monthlyCycleFrom(start);
          return [
            {
              label: `${ordinal(new Date(cycle.start).getDate())} → ${ordinal(new Date(cycle.end).getDate())}`,
              period: cycle,
            },
          ];
        })()
      : []),
  ];

  const complete = start != null && end != null;
  const length = complete ? periodLength({ start, end }) : 0;

  // Keyed on the month rather than on `cursor` itself: picking a date moves the
  // cursor to that day, which would otherwise rebuild the same month's grid.
  const cursorYear = new Date(cursor).getFullYear();
  const cursorMonth = new Date(cursor).getMonth();
  const weeks = useMemo(() => buildWeeks(cursorYear, cursorMonth), [cursorYear, cursorMonth]);

  // Normalized once here instead of per cell; `start` and `end` are already
  // midday values, and every cell's ts is too, so the loop compares plain numbers.
  const startDay = start != null ? dayOf(start) : null;
  const endDay = end != null ? dayOf(end) : null;
  const todayDay = dayOf(today);

  const footer = (
    <View style={styles.footerRow}>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        style={[styles.cancel, { backgroundColor: colors.surfaceAlt }]}
      >
        <AppText weight="bold" style={{ fontSize: 14.5, color: colors.textPrimary }}>
          {mode === 'renew' ? 'Not now' : 'Cancel'}
        </AppText>
      </Pressable>
      <PrimaryButton
        label={mode === 'renew' ? 'Start period' : 'Save period'}
        disabled={!complete}
        onPress={() => {
          if (start != null && end != null) onSave(makePeriod(start, end));
        }}
        style={styles.save}
      />
    </View>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} footer={footer} maxHeight="92%">
      <View style={styles.body}>
        <AppText weight="extrabold" style={{ fontSize: 17, color: colors.textPrimary }}>
          {mode === 'renew' ? 'Start a new period' : 'Spending period'}
        </AppText>
        <AppText style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 3, lineHeight: 18 }}>
          {mode === 'renew'
            ? 'Your last period has ended. These are the next days of the same length — change them if you like.'
            : 'Pick the days this period runs. Home, Limits and your exports all follow it.'}
        </AppText>

        <View style={styles.chips}>
          {shortcuts.map((s) => {
            const on = sameDay(s.period.start, start) && sameDay(s.period.end, end);
            return (
              <Pressable
                key={s.label}
                onPress={() => apply(s.period)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: on ? colors.primarySoft : colors.surfaceAlt,
                    borderColor: on ? colors.primary : 'transparent',
                    borderWidth: 1,
                  },
                ]}
              >
                <AppText weight="bold" style={{ fontSize: 11.5, color: on ? colors.primary : colors.textSecondary }}>
                  {s.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.readout}>
          {([
            ['STARTS', start, 'start'],
            ['ENDS', end, 'end'],
          ] as const).map(([label, value, which]) => {
            const active = picking === which;
            return (
              <Pressable
                key={which}
                onPress={() =>
                  setSel((current) => ({
                    ...current,
                    picking: which === 'end' && current.start == null ? 'start' : which,
                  }))
                }
                accessibilityRole="button"
                accessibilityLabel={`${label === 'STARTS' ? 'Start' : 'End'} date, ${value != null ? formatFullDayLabel(value) : 'not set'}`}
                style={[
                  styles.leg,
                  {
                    backgroundColor: active ? colors.primarySoft : colors.surfaceAlt,
                    borderColor: active ? colors.primary : 'transparent',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <AppText weight="bold" style={{ fontSize: 9.5, letterSpacing: 0.7, color: colors.textSecondary }}>
                  {label}
                </AppText>
                <AppText
                  weight="bold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={{ fontSize: 13.5, marginTop: 2, color: value != null ? colors.textPrimary : colors.textSecondary }}
                >
                  {value != null ? formatFullDayLabel(value) : 'Tap a date'}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.calHeader}>
          <Pressable
            onPress={() => {
              const d = new Date(cursor);
              setCursor(new Date(d.getFullYear(), d.getMonth() - 1, 1, 12, 0, 0, 0).getTime());
            }}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            android_ripple={{ color: 'rgba(0,0,0,0.12)', borderless: true }}
            style={styles.calNavBtn}
          >
            <Chevron color={colors.textPrimary} direction="left" />
          </Pressable>
          <AppText weight="extrabold" style={{ fontSize: 13.5, color: colors.textPrimary }}>
            {formatMonthTitle(cursor)}
          </AppText>
          <Pressable
            onPress={() => {
              const d = new Date(cursor);
              setCursor(new Date(d.getFullYear(), d.getMonth() + 1, 1, 12, 0, 0, 0).getTime());
            }}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            android_ripple={{ color: 'rgba(0,0,0,0.12)', borderless: true }}
            style={styles.calNavBtn}
          >
            <Chevron color={colors.textPrimary} direction="right" />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((w, i) => (
            <View key={i} style={styles.cell}>
              <AppText weight="bold" style={{ fontSize: 9.5, color: colors.textSecondary }}>
                {w}
              </AppText>
            </View>
          ))}
        </View>

        {/* Rows of seven flexed cells rather than percentage widths: Yoga rounds
            each cell up to a whole pixel, and seven exact sevenths then wrap. */}
        {/* Rows of seven flexed cells rather than percentage widths: Yoga rounds
            each cell up to a whole pixel, and seven exact sevenths then wrap. */}
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((cell) => {
                // Already midday from buildWeeks, so no normalizing needed here.
                const day = cell.ts;
                return (
                  <Day
                    key={day}
                    cell={cell}
                    isStart={day === startDay}
                    isEnd={day === endDay}
                    inRange={startDay != null && endDay != null && day >= startDay && day <= endDay}
                    isToday={day === todayDay}
                    colors={colors}
                    onPick={pick}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <AppText style={{ fontSize: 11.5, color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.md }}>
          {complete ? `${length} ${length === 1 ? 'day' : 'days'} in this period` : 'Now tap the day it ends'}
        </AppText>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: Radius.pill },
  readout: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  leg: { flex: 1, borderRadius: Radius.md, paddingVertical: 9, paddingHorizontal: 12 },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xl, marginBottom: Spacing.sm },
  calNavBtn: { width: 38, height: 34, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', alignItems: 'center' },
  grid: { height: MAX_ROWS * ROW_HEIGHT },
  cell: { flex: 1, height: ROW_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', top: 4, bottom: 4 },
  day: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  footerRow: { flexDirection: 'row', gap: Spacing.sm },
  cancel: { flex: 4, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  save: { flex: 6 },
});
