
'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, EventProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent, getConflictsForDay, CalendarCategory, ExportSelection } from '@/lib/calendar-utils';
import { Info, AlertTriangle, Plane } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { ExportModal } from './ExportModal';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom Event Component
const CustomEvent = ({ event }: EventProps<CalendarEvent>) => {
  return (
    <div className="h-full w-full flex items-center px-1 overflow-hidden" title={event.description}>
       {event.type === 'Exam' && <AlertTriangle size={12} className="mr-1 text-white shrink-0" />}
       <span className="text-xs font-medium truncate">{event.title}</span>
    </div>
  );
};

interface CalendarViewProps {
  events: CalendarEvent[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [date, setDate] = useState(new Date(2026, 0, 1)); // Start at Jan 1, 2026
  const [viewState, setViewState] = useState<ExportSelection>({
    includeUQ: true,
    includeQLD: true,
    includeCN: true, // Default to showing all
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Filter valid events for display
  const displayedEvents = useMemo(() => {
    return events.filter(e => {
        if (e.category === 'UQ' && viewState.includeUQ) return true;
        if (e.category === 'QLD' && viewState.includeQLD) return true;
        if (e.category === 'CN' && viewState.includeCN) return true;
        return false;
    });
  }, [events, viewState]);

  // Event Styling
  const eventPropGetter = (event: CalendarEvent) => {
    let className = 'border-0 rounded-md shadow-sm transition-all ';
    let style: React.CSSProperties = {
        color: 'white',
    };

    // Base colors - using inline styles to override specific defaults if needed
    if (event.category === 'UQ') {
        className += 'hover:bg-purple-700';
        style.backgroundColor = '#9333EA'; // purple-600
    } else if (event.category === 'QLD') {
        className += 'hover:bg-blue-600';
        style.backgroundColor = '#3B82F6'; // blue-500
    } else if (event.category === 'CN') {
        className += 'hover:bg-red-600';
        style.backgroundColor = '#EF4444'; // red-500
    }

    // Conflict Highlight Logic (Stripes?)
    // Checking if this event conflicts with OTHERS in the displayed set
    const conflicts = getConflictsForDay(event.start, displayedEvents);
    if (conflicts.length > 1) {
       // If multiple events on same day, give visual cue
       // Let's add a left border for exams
       if (event.type === 'Exam') {
         style.borderLeft = '4px solid #FCD34D'; // Yellow warning border
       }
    }

    return { className, style };
  };

  const handleMonthChange = (val: string) => {
    const monthIndex = parseInt(val, 10);
    setDate(new Date(2026, monthIndex, 1));
  };
  
  const MONTH_OPTIONS = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
      value: i.toString(),
      label: format(new Date(2026, i, 1), 'MMMM yyyy')
  })), []);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Navigation & Filters */}
        <div className="flex flex-wrap items-center gap-4">
            
            {/* Month Jump */}
            <div className="w-[180px]">
                <Select 
                    options={MONTH_OPTIONS}
                    value={date.getMonth().toString()}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    placeholder="Select Month"
                />
            </div>

            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            <span className="text-sm font-semibold text-gray-400 mr-2 uppercase tracking-wide hidden sm:inline-block">Layers:</span>
            
            <button 
                onClick={() => setViewState(s => ({...s, includeUQ: !s.includeUQ}))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${viewState.includeUQ ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
            >
                <span className={`w-2 h-2 rounded-full ${viewState.includeUQ ? 'bg-purple-600' : 'bg-gray-400'}`} />
                UQ
            </button>

            <button 
                onClick={() => setViewState(s => ({...s, includeQLD: !s.includeQLD}))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${viewState.includeQLD ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
            >
                <span className={`w-2 h-2 rounded-full ${viewState.includeQLD ? 'bg-blue-500' : 'bg-gray-400'}`} />
                QLD
            </button>

            <button 
                onClick={() => setViewState(s => ({...s, includeCN: !s.includeCN}))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${viewState.includeCN ? 'bg-red-100 text-red-700 ring-1 ring-red-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
            >
                <span className={`w-2 h-2 rounded-full ${viewState.includeCN ? 'bg-red-500' : 'bg-gray-400'}`} />
                CN
            </button>
        </div>

        {/* Actions */}
        <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm ml-auto md:ml-0"
        >
            <Plane size={16} />
            Export
        </button>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 min-h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <Calendar
            localizer={localizer}
            events={displayedEvents}
            startAccessor="start"
            endAccessor={event => event.end || event.start}
            style={{ height: '100%', minHeight: '600px' }}
            views={['month', 'week', 'agenda']}
            date={date}
            onNavigate={date => setDate(date)}
            eventPropGetter={eventPropGetter}
            components={{
              event: CustomEvent
            }}
            popup
            tooltipAccessor={e => `${e.title}\n${e.description}`}
        />

      </div>

      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        events={events} // Pass ALL events to modal, let it filter internally based on its own state
      />
    </div>
  );
}
