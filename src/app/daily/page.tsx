"use client";

import React from 'react';
import { DailyView, DailyEvent } from '../../components/views/dailyView';

export default function DailyPage() {
    // 1. Get today's date in ISO format: "YYYY-MM-DD"
    const today = new Date();
    const isoDate = today.toISOString().split('T')[0];

    // 2. Get the day label, e.g. "Saturday"
    const dayLabel = today.toLocaleDateString(undefined, { weekday: 'long' });

    // 3. Define your events array
    const events: DailyEvent[] = [
        {
            id: 1,
            title: 'Breakfast',
            description: 'Eggs and toast',
            // Use "isoDate" for the date portion
            start: `${isoDate}T06:00`,
            end: `${isoDate}T07:00`,
            priorityLevel: 1, // High
        },
        {
            id: 2,
            title: 'Flight to Paris',
            description: 'Departing from JFK',
            start: `${isoDate}T07:30`,
            end: `${isoDate}T09:00`,
            priorityLevel: 2, // Moderate
        },
        {
            id: 3,
            title: 'Dinner Reservation',
            start: `${isoDate}T19:00`,
            end: `${isoDate}T20:30`,
            priorityLevel: 3, // Low
        },
    ];

    // 4. Pass the dynamic "isoDate" and "dayLabel" to DailyView
    return (
        <DailyView
            date={isoDate}
            dayLabel={dayLabel}
            events={events}
        />
    );
}