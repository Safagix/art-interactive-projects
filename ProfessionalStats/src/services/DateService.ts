import type { WeekdayKey } from '@/types';

export function getLocalDateKey(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getWeekdayKey(date: Date = new Date()): WeekdayKey {
    const keys: WeekdayKey[] = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];
    return keys[date.getDay()];
}

export function minutesFromTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

export function getCurrentMinutes(date: Date = new Date()): number {
    return date.getHours() * 60 + date.getMinutes();
}

export function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}
