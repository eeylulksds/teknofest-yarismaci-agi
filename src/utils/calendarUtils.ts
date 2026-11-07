// src/utils/calendarUtils.ts
import type { Competition } from './types';

export interface CalendarTimelineEvent {
    id: string;
    competitionId: string;
    title: string;
    category: string;
    type: 'application' | 'report' | 'announcement';
    typeLabel: string;
    dateStr: string;
    rawDate: string;
    monthKey: string;
    monthLabel: string;
    formattedDisplayDate: string;
    daysRemaining: number;
    urgency: 'critical' | 'soon' | 'upcoming' | 'passed';
    prizePool: string;
    firstPrize: string;
    organizer?: string;
    status: string;
    kysPortalUrl: string;
    specificationUrl: string;
    competition: Competition;
}

export interface CalendarDayCell {
    date: Date;
    dateStr: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarTimelineEvent[];
}

const MONTH_NAMES_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const SHORT_MONTH_NAMES_TR = [
    'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
];

export const FULL_MONTH_NAMES_TR = MONTH_NAMES_TR;

const DAY_NAMES_TR = [
    'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

export function extractIsoDate(dateStr?: string): string | null {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : null;
}

export function formatTurkishDate(isoDate: string): string {
    try {
        const [year, month, day] = isoDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        if (isNaN(dateObj.getTime())) return isoDate;

        const dayName = DAY_NAMES_TR[dateObj.getDay()];
        const monthName = MONTH_NAMES_TR[dateObj.getMonth()];
        return `${day} ${monthName} ${year}, ${dayName}`;
    } catch {
        return isoDate;
    }
}

export function calculateDaysRemaining(targetIsoDate: string, referenceDate: Date = new Date()): number {
    const [year, month, day] = targetIsoDate.split('-').map(Number);
    const target = new Date(year, month - 1, day, 23, 59, 59);
    const diffMs = target.getTime() - referenceDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getUrgencyLevel(daysRemaining: number): 'critical' | 'soon' | 'upcoming' | 'passed' {
    if (daysRemaining < 0) return 'passed';
    if (daysRemaining <= 7) return 'critical';
    if (daysRemaining <= 30) return 'soon';
    return 'upcoming';
}

export function extractCompetitionCalendarEvents(
    competitions: Competition[],
    referenceDate: Date = new Date()
): CalendarTimelineEvent[] {
    const events: CalendarTimelineEvent[] = [];

    for (const comp of competitions) {
        // 1. Son Başvuru Tarihi
        const appIso = extractIsoDate(comp.application_deadline);
        if (appIso) {
            const [year, month] = appIso.split('-').map(Number);
            const days = calculateDaysRemaining(appIso, referenceDate);
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            const monthLabel = `${MONTH_NAMES_TR[month - 1]} ${year}`;

            events.push({
                id: `${comp.id}-app`,
                competitionId: comp.id,
                title: comp.title,
                category: comp.category,
                type: 'application',
                typeLabel: 'Son Başvuru Tarihi',
                dateStr: appIso,
                rawDate: comp.application_deadline,
                monthKey,
                monthLabel,
                formattedDisplayDate: formatTurkishDate(appIso),
                daysRemaining: days,
                urgency: getUrgencyLevel(days),
                prizePool: comp.prize_pool || comp.first_prize,
                firstPrize: comp.first_prize,
                organizer: comp.organizer,
                status: comp.status,
                kysPortalUrl: comp.kys_portal_url || 'https://t3kys.com',
                specificationUrl: comp.specification_pdf_url || 'https://teknofest.org',
                competition: comp,
            });
        }

        // 2. Teslim Tarihi
        const deliveryIso = extractIsoDate(comp.delivery_milestone_date);
        if (deliveryIso) {
            const [year, month] = deliveryIso.split('-').map(Number);
            const days = calculateDaysRemaining(deliveryIso, referenceDate);
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            const monthLabel = `${MONTH_NAMES_TR[month - 1]} ${year}`;
            const typeLabel = comp.delivery_milestone_title ? `${comp.delivery_milestone_title} Teslim Tarihi` : 'Rapor Teslim Tarihi';

            events.push({
                id: `${comp.id}-delivery`,
                competitionId: comp.id,
                title: comp.title,
                category: comp.category,
                type: 'report',
                typeLabel,
                dateStr: deliveryIso,
                rawDate: comp.delivery_milestone_date || '',
                monthKey,
                monthLabel,
                formattedDisplayDate: formatTurkishDate(deliveryIso),
                daysRemaining: days,
                urgency: getUrgencyLevel(days),
                prizePool: comp.prize_pool || comp.first_prize,
                firstPrize: comp.first_prize,
                organizer: comp.organizer,
                status: comp.status,
                kysPortalUrl: comp.kys_portal_url || 'https://t3kys.com',
                specificationUrl: comp.specification_pdf_url || 'https://teknofest.org',
                competition: comp,
            });
        }

        // 3. Açıklanma Tarihi
        const announceIso = extractIsoDate(comp.announcement_milestone_date);
        if (announceIso) {
            const [year, month] = announceIso.split('-').map(Number);
            const days = calculateDaysRemaining(announceIso, referenceDate);
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            const monthLabel = `${MONTH_NAMES_TR[month - 1]} ${year}`;
            const typeLabel = comp.announcement_milestone_title ? `${comp.announcement_milestone_title} Açıklanma Tarihi` : 'Sonuç Açıklanma Tarihi';

            events.push({
                id: `${comp.id}-announcement`,
                competitionId: comp.id,
                title: comp.title,
                category: comp.category,
                type: 'announcement',
                typeLabel,
                dateStr: announceIso,
                rawDate: comp.announcement_milestone_date || '',
                monthKey,
                monthLabel,
                formattedDisplayDate: formatTurkishDate(announceIso),
                daysRemaining: days,
                urgency: getUrgencyLevel(days),
                prizePool: comp.prize_pool || comp.first_prize,
                firstPrize: comp.first_prize,
                organizer: comp.organizer,
                status: comp.status,
                kysPortalUrl: comp.kys_portal_url || 'https://t3kys.com',
                specificationUrl: comp.specification_pdf_url || 'https://teknofest.org',
                competition: comp,
            });
        }
    }

    return events.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
}

export function generateIcsCalendar(events: CalendarTimelineEvent[]): string {
    const lines: string[] = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TEKNOFEST//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'
    ];

    for (const ev of events) {
        const cleanDate = ev.dateStr.replace(/-/g, '');
        const uid = `${ev.id}@teknofest.org`;
        const summary = `TEKNOFEST: ${ev.title} (${ev.typeLabel})`;

        lines.push(
            'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${cleanDate}T090000Z`,
            `DTSTART;VALUE=DATE:${cleanDate}`, `DTEND;VALUE=DATE:${cleanDate}`,
            `SUMMARY:${summary}`, 'END:VEVENT'
        );
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

export function downloadIcsFile(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function formatListBadgeDate(dateStr: string): { day: number; shortMonthUpper: string } {
    const [year, month, day] = dateStr.split('-').map(Number);
    const shortMonth = SHORT_MONTH_NAMES_TR[month - 1] || '';
    return {
        day,
        shortMonthUpper: shortMonth.toLocaleUpperCase('tr-TR'),
    };
}

// EN KRİTİK FONKSİYON: Takvim ızgarasını oluşturan fonksiyon (Eksikti, eklendi)
export function getMonthCalendarGrid(
    year: number,
    month: number, // 0 = Ocak, 11 = Aralık
    events: CalendarTimelineEvent[],
    today: Date = new Date()
): CalendarDayCell[] {
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: CalendarDayCell[] = [];
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const eventsByDate = new Map<string, CalendarTimelineEvent[]>();
    for (const ev of events) {
        if (!eventsByDate.has(ev.dateStr)) {
            eventsByDate.set(ev.dateStr, []);
        }
        eventsByDate.get(ev.dateStr)!.push(ev);
    }

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const prevDate = new Date(year, month - 1, dayNum);
        const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        cells.push({
            date: prevDate,
            dateStr,
            dayNumber: dayNum,
            isCurrentMonth: false,
            isToday: dateStr === todayIso,
            events: eventsByDate.get(dateStr) || [],
        });
    }

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const curDate = new Date(year, month, dayNum);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        cells.push({
            date: curDate,
            dateStr,
            dayNumber: dayNum,
            isCurrentMonth: true,
            isToday: dateStr === todayIso,
            events: eventsByDate.get(dateStr) || [],
        });
    }

    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
        const nextDate = new Date(year, month + 1, i);
        const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        cells.push({
            date: nextDate,
            dateStr,
            dayNumber: i,
            isCurrentMonth: false,
            isToday: dateStr === todayIso,
            events: eventsByDate.get(dateStr) || [],
        });
    }

    return cells;
}