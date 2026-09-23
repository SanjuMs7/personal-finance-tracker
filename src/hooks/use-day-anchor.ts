import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * A timestamp that holds still while a screen sits idle, but catches up whenever
 * the calendar day could have moved on: the app coming back to the foreground,
 * and a timer aimed just past the next midnight.
 *
 * Screens anchor "this month" and "Today" to this rather than to a Date.now()
 * captured at mount, which otherwise leaves the chart on last month and labels
 * yesterday's expenses as Today once the app has been open across a rollover.
 */
export function useDayAnchor(): number {
  const [anchor, setAnchor] = useState(() => Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    function scheduleNextMidnight() {
      const now = Date.now();
      // Same day means the anchor is still good; returning prev skips the re-render.
      setAnchor((prev) => (new Date(prev).toDateString() === new Date(now).toDateString() ? prev : now));

      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer = setTimeout(scheduleNextMidnight, midnight.getTime() - now + 1000);
    }

    scheduleNextMidnight();

    // Timers are unreliable while the app is backgrounded, so re-check on resume.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        clearTimeout(timer);
        scheduleNextMidnight();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return anchor;
}
