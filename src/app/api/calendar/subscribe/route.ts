
import { NextRequest, NextResponse } from 'next/server';
import { MOCK_EVENTS } from '@/lib/calendar-data';
import { createEvents, EventAttributes } from 'ics';
import { CalendarEvent, ExportSelection } from '@/lib/calendar-utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layers = searchParams.get('layers')?.split(',') || [];

  const selection: ExportSelection = {
    includeUQ: layers.includes('uq'),
    includeQLD: layers.includes('qld'),
    includeCN: layers.includes('cn'),
  };

  // Logic duplicated from client-side generateICS because 'ics' library works slightly differently in node/browser
  // But actually the 'ics' library is universal. We can reuse the filtering logic.
  
  const events = MOCK_EVENTS;
  
  const filteredEvents = events.filter(e => {
    if (e.category === 'UQ' && selection.includeUQ) return true;
    if (e.category === 'QLD' && selection.includeQLD) return true;
    if (e.category === 'CN' && selection.includeCN) return true;
    return false;
  });

  if (filteredEvents.length === 0) {
      return new NextResponse('No events selected', { status: 400 });
  }

  // Transform to ICS format
  const icsEvents = filteredEvents.map(e => {
    const startArr: [number, number, number, number, number] = [
        e.start.getFullYear(),
        e.start.getMonth() + 1,
        e.start.getDate(),
        e.start.getHours(),
        e.start.getMinutes()
    ];
    
    // For all-day events, ics library expects just [y, m, d]
    const icsStart: [number, number, number] | [number, number, number, number, number] = 
        e.allDay ? [startArr[0], startArr[1], startArr[2]] : startArr;
    
    // Build end date if present
    const endPart: { end: [number, number, number] | [number, number, number, number, number] } | {} = e.end ? {
        end: e.allDay 
            ? [e.end.getFullYear(), e.end.getMonth() + 1, e.end.getDate()] as [number, number, number]
            : [e.end.getFullYear(), e.end.getMonth() + 1, e.end.getDate(), e.end.getHours(), e.end.getMinutes()] as [number, number, number, number, number]
    } : {};

    return {
      start: icsStart,
      ...endPart,
      title: e.title,
      description: e.description,
      categories: [e.category, e.type],
      calName: 'StudyPilot Calendar',
    };
  });

  // Generate ICS string
  // Note: createEvents is callback based or promise based depending on version, wrapping in promise to be safe
  const icsString = await new Promise<string>((resolve, reject) => {
      createEvents(icsEvents as EventAttributes[], (error, value) => {
          if (error) {
              reject(error);
          }
          resolve(value || '');
      });
  });

  return new NextResponse(icsString, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="studypilot-calendar.ics"',
    },
  });
}
