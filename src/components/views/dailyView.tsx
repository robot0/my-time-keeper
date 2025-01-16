import React, { useState, useEffect, useRef, JSX, useCallback } from 'react';

/** 
 * Represents a single event in the daily timeline.
 */
export interface DailyEvent {
    id: string | number;
    title: string;
    description?: string;
    start: string;   // e.g. "2022-01-22T06:00"
    end: string;     // e.g. "2022-01-22T07:00"
    color?: string;  // e.g. "#DBEAFE"
    /**
     * 1 = High priority, 2 = Moderate, 3 = Low
     */
    priorityLevel: 1 | 2 | 3;
}

/** 
 * Props for the main DailyView component. 
 */
export interface DailyViewProps {
    /**
     * The date being viewed, e.g. "2022-01-22"
     */
    date: string;

    /**
     * The day label (e.g., "Saturday")
     */
    dayLabel: string;

    /**
     * An array of events to display in the timeline (vertical).
     */
    events: DailyEvent[];
}

/**
 * A reusable daily view that displays:
 * - A vertical timeline of events on the left
 * - A list of daily priorities (grouped by priority) on the right
 */
export function DailyView({
    date,
    dayLabel,
    events,
}: DailyViewProps): JSX.Element {
    // Container references
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    // Store refs for each event to facilitate scrolling/highlighting
    const eventRefs = useRef<Record<string | number, HTMLLIElement | null>>({});

    // State for current-time fraction (0..1)
    const [nowFraction, setNowFraction] = useState(() => computeNowFraction());
    const isToday = date === new Date().toISOString().split('T')[0];

    // This function scrolls to the current time
    const scrollToNow = useCallback(() => {
        if (!scrollContainerRef.current || !isToday) return;
        const now = new Date();
        const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollHeight - container.clientHeight;
        const scrollPosition = (minutesSinceMidnight / 1440) * maxScroll;
        container.scrollTop = Math.max(0, Math.min(scrollPosition, maxScroll));
    }, [isToday, scrollContainerRef]);

    useEffect(() => {
        // On mount, scroll to "now" if it's today
        if (isToday) {
            scrollToNow();
        }

        // If it's today, update line position each minute
        let intervalId: NodeJS.Timeout | null = null;
        if (isToday) {
            intervalId = setInterval(() => {
                setNowFraction(computeNowFraction());
            }, 60_000);
        }

        return () => {
            // Cleanup
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isToday, scrollToNow]);

    // The function to compute fraction-of-day
    function computeNowFraction(): number {
        const now = new Date();
        const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
        return minutesSinceMidnight / 1440;
    }



    /**
     * Click handler for the right-side priorities:
     * Scroll/highlight the event in the left timeline.
     */
    const handlePriorityClick = (id: string | number) => {
        const element = eventRefs.current[id];
        if (element && scrollContainerRef.current) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Quick highlight effect
            element.classList.add('ring-2', 'ring-indigo-500');
            setTimeout(() => {
                element.classList.remove('ring-2', 'ring-indigo-500');
            }, 2000);
        }
    };

    /**
     * Convert an ISO date/time (e.g., "2022-01-22T06:00") into 
     * an integer for minutes of the day. (0 = midnight, etc.)
     */
    const getMinutesOfDay = (isoString: string): number => {
        const dateObj = new Date(isoString);
        return dateObj.getHours() * 60 + dateObj.getMinutes();
    };

    /**
     * We'll create 48 rows for 24 hours, with half-hour increments.
     */
    const totalSlots = 48;

    // Group events by priority: {1: DailyEvent[], 2: ..., 3: ...}
    const priorityMap = { 1: [] as DailyEvent[], 2: [] as DailyEvent[], 3: [] as DailyEvent[] };
    events.forEach((evt) => {
        priorityMap[evt.priorityLevel].push(evt);
    });

    return (
        <div className="mx-auto max-w-7xl px-2 sm:px-4flex h-full flex-col">
            {/* Header */}
            <header className="flex flex-none items-center justify-between border-b border-gray-200 py-4 px-6">
                <div>
                    <h1 className="text-lg font-semibold leading-6 text-gray-900">
                        {/* Use short vs. long date format on small vs. large screens */}
                        <time dateTime={date} className="sm:hidden">
                            {new Date(date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </time>
                        <time dateTime={date} className="hidden sm:inline">
                            {new Date(date).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </time>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">{dayLabel}</p>
                </div>

                {/* Simple nav buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={scrollToNow}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                        Next
                    </button>
                </div>
            </header>

            {/* Main area: timeline (left) + priorities (right) */}
            <div className="isolate flex flex-auto overflow-hidden bg-white">
                {/* Timeline container */}
                <div ref={scrollContainerRef} className="relative w-full flex-auto overflow-y-auto">
                    <div
                        className="relative h-full"
                        style={{
                            // Ensure the parent has enough height
                            minHeight: `calc(${totalSlots} * 3.5rem)`,
                        }}
                    >
                        {/* (A) Time lines + labels layer */}
                        <div
                            className="pointer-events-none absolute inset-0 grid w-full divide-y divide-gray-100"
                            style={{
                                gridTemplateRows: `repeat(${totalSlots}, minmax(3.5rem, 1fr))`,
                            }}
                        >
                            {Array.from({ length: totalSlots }).map((_, slotIndex) => (
                                <div key={slotIndex} className="relative">
                                    {/* Label each hour (every 2 slots = 1 hour) */}
                                    {slotIndex % 2 === 0 && (
                                        <div className="absolute left-2 top-2 text-xs text-gray-400">
                                            {formatHourLabel(slotIndex / 2)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* (B) Events layer (absolute) */}
                        <ol
                            className="absolute inset-0 grid grid-cols-1"
                            style={{
                                gridTemplateRows: `repeat(${totalSlots}, minmax(3.5rem, 1fr))`,
                            }}
                        >
                            {events.map((event) => {
                                const startMinutes = getMinutesOfDay(event.start);
                                const endMinutes = getMinutesOfDay(event.end);
                                const totalDayMinutes = 1440;
                                const startPct = (startMinutes / totalDayMinutes) * 100;
                                const endPct = (endMinutes / totalDayMinutes) * 100;

                                return (
                                    <li
                                        key={event.id}
                                        // Store ref for scrolling
                                        ref={(el) => {
                                            if (el) {
                                                eventRefs.current[event.id] = el;
                                            }
                                        }}
                                        className="absolute left-14 right-2 flex flex-col overflow-hidden rounded p-2 text-xs leading-5 hover:opacity-90"
                                        style={{
                                            top: `${startPct}%`,
                                            height: `${endPct - startPct}%`,
                                            backgroundColor: event.color || '#DBEAFE',
                                        }}
                                    >
                                        <p className="font-semibold">{event.title}</p>
                                        {event.description && (
                                            <p className="text-[0.7rem] leading-4 opacity-80">
                                                {event.description}
                                            </p>
                                        )}
                                        <p className="mt-auto text-[0.7rem] text-gray-600">
                                            <time>{formatTimeRange(event.start, event.end)}</time>
                                        </p>
                                    </li>
                                );
                            })}
                        </ol>

                        {/* (C) The current time indicator (only if it's "today") */}
                        {isToday && (
                            <div
                                className="absolute w-full border-t-2 border-red-500 pointer-events-none"
                                style={{
                                    top: `${nowFraction * 100}%`,
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Right side: Daily priorities (grouped by 1,2,3) */}
                <div className="hidden w-1/2 max-w-md flex-none border-l border-gray-100 py-4 px-4 md:block">
                    <h2 className="mb-2 text-base font-semibold text-gray-900">
                        Today&apos;s Priorities
                    </h2>

                    <PriorityGroup
                        label="High Priority"
                        events={priorityMap[1]}
                        onClick={handlePriorityClick}
                    />
                    <PriorityGroup
                        label="Moderate Priority"
                        events={priorityMap[2]}
                        onClick={handlePriorityClick}
                    />
                    <PriorityGroup
                        label="Low Priority"
                        events={priorityMap[3]}
                        onClick={handlePriorityClick}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * A small component to list events of a specific priority level.
 */
interface PriorityGroupProps {
    label: string;
    events: DailyEvent[];
    onClick: (id: string | number) => void;
}

function PriorityGroup({ label, events, onClick }: PriorityGroupProps) {
    return (
        <div className="mb-6">
            <h3 className="mb-2 text-sm font-bold text-gray-700">{label}</h3>
            {events.length === 0 ? (
                <p className="text-sm text-gray-500">No {label.toLowerCase()} events.</p>
            ) : (
                <ul className="space-y-2">
                    {events.map((evt) => (
                        <li
                            key={evt.id}
                            onClick={() => onClick(evt.id)}
                            className="cursor-pointer rounded bg-gray-50 p-3 shadow-sm hover:bg-gray-100"
                        >
                            <h4 className="text-sm font-semibold text-gray-900">{evt.title}</h4>
                            {evt.description && (
                                <p className="mt-1 text-xs text-gray-500">{evt.description}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Convert a 24-hour integer (0..23) into "1AM", "12PM", etc.
 */
function formatHourLabel(hour24: number): string {
    const ampm = hour24 < 12 ? 'AM' : 'PM';
    let hour = hour24 % 12;
    if (hour === 0) hour = 12;
    return `${hour}${ampm}`;
}

/**
 * Format a start/end time range like "6:00 AM - 7:00 AM".
 */
function formatTimeRange(startIso: string, endIso: string): string {
    const start = new Date(startIso);
    const end = new Date(endIso);
    return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Convert a Date into "h:mm AM/PM" format (e.g., 6:00 AM).
 */
function formatTime(dateObj: Date): string {
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours < 12 ? 'AM' : 'PM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}