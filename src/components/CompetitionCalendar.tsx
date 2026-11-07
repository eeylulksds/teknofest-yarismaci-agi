import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import {
  extractCompetitionCalendarEvents,
  getMonthCalendarGrid,
  formatTurkishDate,
  FULL_MONTH_NAMES_TR,
  generateIcsCalendar,
  downloadIcsFile
} from '../utils/calendarUtils';
import type { Competition } from '../utils/types';

interface CompetitionCalendarProps {
  competitions: Competition[];
  onSelectCompetition: (comp: Competition) => void;
}

export const CompetitionCalendar: React.FC<CompetitionCalendarProps> = ({ competitions, onSelectCompetition }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const allEvents = useMemo(() => {
    return extractCompetitionCalendarEvents(competitions);
  }, [competitions]);

  const monthCells = useMemo(() => {
    return getMonthCalendarGrid(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      allEvents,
      new Date()
    );
  }, [currentDate, allEvents]);

  const selectedDateEvents = useMemo(() => {
    return allEvents.filter((e) => e.dateStr === selectedDateStr);
  }, [allEvents, selectedDateStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const handleExportAll = () => {
    const ics = generateIcsCalendar(allEvents);
    downloadIcsFile('teknofest_takvim.ics', ics);
  };

  const weekdayHeaders = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 min-w-[150px] text-center">
            {FULL_MONTH_NAMES_TR[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={handleNextMonth} className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={handleGoToToday} className="ml-2 px-3 py-1.5 text-xs font-bold bg-slate-100 rounded-lg hover:bg-slate-200">
            Bugün
          </button>
        </div>
        <button onClick={handleExportAll} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg bg-white border border-slate-200">
          <Download className="w-4 h-4" /> Tümünü Takvime Aktar (.ics)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {weekdayHeaders.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-bold text-slate-600">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {monthCells.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[100px] p-1.5 flex flex-col transition-colors cursor-pointer ${!cell.isCurrentMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'
                    } ${isSelected ? 'ring-2 ring-inset ring-red-500' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${cell.isToday ? 'bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>
                      {cell.dayNumber}
                    </span>
                    {cell.events.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {cell.events.slice(0, 2).map(ev => (
                      <div key={ev.id} className="text-[10px] bg-slate-100 rounded px-1 py-0.5 truncate text-slate-700 font-medium">
                        {ev.title}
                      </div>
                    ))}
                    {cell.events.length > 2 && <div className="text-[9px] text-slate-400 pl-1">+{cell.events.length - 2} daha</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">
            {formatTurkishDate(selectedDateStr)}
          </h3>
          {selectedDateEvents.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">Bu tarihte etkinlik bulunmuyor.</p>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map(ev => (
                <div key={ev.id} onClick={() => onSelectCompetition(ev.competition)} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-red-200 cursor-pointer transition-colors">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">{ev.category}</span>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">{ev.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{ev.typeLabel}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{ev.daysRemaining} gün kaldı</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};