
import { createEvents, EventAttributes } from 'ics';
import { addDays, differenceInDays } from 'date-fns';

export type CalendarCategory = 'UQ' | 'QLD' | 'CN';
export type EventType = 'Holiday' | 'Exam' | 'Admin' | 'Lecture' | 'Other';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  category: CalendarCategory;
  type: EventType;
  description?: string;
  location?: string;
  priority?: number; // Higher number = higher priority
}

export interface ExportSelection {
  includeUQ: boolean;
  includeQLD: boolean;
  includeCN: boolean;
}

/**
 * Generates an ICS string based on selected categories.
 */
export async function generateICS(
  allEvents: CalendarEvent[], 
  selection: ExportSelection
): Promise<string> {
  // 1. Filter events based on selection
  const filteredEvents = allEvents.filter(event => {
    if (event.category === 'UQ' && selection.includeUQ) return true;
    if (event.category === 'QLD' && selection.includeQLD) return true;
    if (event.category === 'CN' && selection.includeCN) return true;
    return false;
  });

  if (filteredEvents.length === 0) {
    return '';
  }

  // 2. Map to 'ics' library format
  const icsEvents: EventAttributes[] = filteredEvents.map(event => {
    const start: [number, number, number, number, number] = [
      event.start.getFullYear(),
      event.start.getMonth() + 1,
      event.start.getDate(),
      event.start.getHours(),
      event.start.getMinutes()
    ];
    
    // Handle end date or duration
    let end: [number, number, number, number, number] | undefined;
    if (event.end) {
       end = [
        event.end.getFullYear(),
        event.end.getMonth() + 1,
        event.end.getDate(),
        event.end.getHours(),
        event.end.getMinutes()
      ];
    } else {
        // Default to same day end if not provided, or let ics handle it (it defaults to 1 day usually if allDay)
        // For accurate robust parsing, if allDay, we often want end to be next day or just start.
        // Let's stick to start only if end is missing.
    }

    return {
      start,
      end,
      title: event.title,
      description: event.description,
      location: event.location,
      categories: [event.category],
      calName: 'Study Pilot Calendar 2026',
      productId: 'study-pilot/ics',
    };
  });

  // 3. Generate ICS string
  return new Promise((resolve, reject) => {
    createEvents(icsEvents, (error, value) => {
      if (error) {
        reject(error);
      }
      resolve(value);
    });
  });
}

/**
 * Detects conflicts (overlaps) for a specific date.
 * Returns an array of event IDs that conflict on this day.
 */
export function getConflictsForDay(date: Date, events: CalendarEvent[]): CalendarEvent[] {
    return events.filter(event => {
        // Simple overlap check: 
        // Event is on this day if:
        // 1. Start is on this day
        // 2. Or Start is before this day and End is after this day
        
        const checkDate = new Date(date).setHours(0,0,0,0);
        const eventStart = new Date(event.start).setHours(0,0,0,0);
        
        let eventEnd = eventStart;
        if (event.end) {
            eventEnd = new Date(event.end).setHours(0,0,0,0);
        }

        return checkDate >= eventStart && checkDate <= eventEnd;
    });
}
