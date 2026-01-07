
'use client';

import React, { useState } from 'react';
import { CalendarEvent, generateICS, ExportSelection } from '@/lib/calendar-utils';
import { Download, X, Copy, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

export function ExportModal({ isOpen, onClose, events }: ExportModalProps) {
  const [selection, setSelection] = useState<ExportSelection>({
    includeUQ: true,
    includeQLD: true,
    includeCN: false,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = (key: keyof ExportSelection) => {
    setSelection(prev => ({ ...prev, [key]: !prev[key] }));
    setDownloadUrl(null); // Reset generated link on change
  };

  const selectedCount = events.filter(e => {
    if (e.category === 'UQ' && selection.includeUQ) return true;
    if (e.category === 'QLD' && selection.includeQLD) return true;
    if (e.category === 'CN' && selection.includeCN) return true;
    return false;
  }).length;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const icsString = await generateICS(events, selection);
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (e) {
      console.error('Failed to generate ICS', e);
      alert('Failed to generate calendar file.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900">Export Calendar</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 font-medium">Select calendar layers to include:</p>
            
            <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 cursor-pointer transition-all group">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                <span className="font-medium text-gray-700 group-hover:text-purple-700">UQ Academic Dates</span>
              </span>
              <input 
                type="checkbox" 
                checked={selection.includeUQ} 
                onChange={() => handleToggle('includeUQ')}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="font-medium text-gray-700 group-hover:text-blue-700">QLD Public Holidays</span>
              </span>
              <input 
                type="checkbox" 
                checked={selection.includeQLD} 
                onChange={() => handleToggle('includeQLD')}
                className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-red-500 hover:bg-red-50/50 cursor-pointer transition-all group">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-medium text-gray-700 group-hover:text-red-700">China Public Holidays</span>
              </span>
              <input 
                type="checkbox" 
                checked={selection.includeCN} 
                onChange={() => handleToggle('includeCN')}
                className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
              />
            </label>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-center text-sm text-gray-500">
            {selectedCount} events will be exported.
          </div>


          <div className="pt-2 space-y-4">
             {/* Webcal Subscription Link */}
             <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Subscription URL (Webcal)
                </label>
                <div className="flex gap-2">
                    <input 
                        readOnly
                        value={`${window.location.origin}/api/calendar/subscribe?layers=${[
                            selection.includeUQ ? 'uq' : '',
                            selection.includeQLD ? 'qld' : '',
                            selection.includeCN ? 'cn' : ''
                        ].filter(Boolean).join(',')}`}
                        className="flex-1 bg-white border border-gray-300 text-gray-600 text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/api/calendar/subscribe?layers=${[
                                selection.includeUQ ? 'uq' : '',
                                selection.includeQLD ? 'qld' : '',
                                selection.includeCN ? 'cn' : ''
                            ].filter(Boolean).join(',')}`;
                            navigator.clipboard.writeText(url);
                            alert('Link copied to clipboard!');
                        }}
                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded transition-colors flex items-center justify-center"
                        title="Copy Link"
                    >
                        <Copy size={16} />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Paste this link into Apple Calendar, Google Calendar, or Outlook to subscribe.
                </p>
             </div>

             <div className="border-t border-gray-100 my-4"></div>

             {!downloadUrl ? (
               <button
                 onClick={handleExport}
                 disabled={isExporting || selectedCount === 0}
                 className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
               >
                 {isExporting ? 'Generating File...' : 'Download .ics File'}
               </button>
             ) : (
               <a
                 href={downloadUrl}
                 download="study-pilot-calendar-2026.ics"
                 className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-200"
               >
                 <Download size={18} />
                 Download File Ready
               </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
