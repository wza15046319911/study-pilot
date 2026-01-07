'use client';

import { useCalendarData } from '@/components/calendar/useCalendarData';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  const { events, loading, error } = useCalendarData();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            2026 Academic Calendar
          </h1>
          <p className="max-w-3xl text-xl text-gray-500">
            Plan your year with our integrated view of <span className="text-purple-600 font-semibold">UQ Academic Dates</span>, <span className="text-blue-500 font-semibold">QLD Public Holidays</span>, and <span className="text-red-500 font-semibold">China Holidays</span>.
          </p>
        </div>

        {/* Main Content */}
        {loading ? (
             <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
             </div>
        ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Failed to load calendar data.
            </div>
        ) : (
            <CalendarView events={events} />
        )}

      </div>
    </div>
  );
}
