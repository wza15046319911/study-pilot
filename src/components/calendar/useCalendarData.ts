
import { CalendarEvent } from '@/lib/calendar-utils';

// MOCK DATA - In a real app, this might come from an API or JSON file
import { MOCK_EVENTS } from '@/lib/calendar-data';

export function useCalendarData() {
  // In future, fetch logic goes here.
  return {
    events: MOCK_EVENTS,
    loading: false,
    error: null
  };
}
