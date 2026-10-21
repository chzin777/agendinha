"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CalendarEvent } from "@/types";
import { sendNotification, formatEventMessage } from "@/lib/notifications";

async function fetchEvents(): Promise<CalendarEvent[]> {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        setEvents(data);
        setMounted(true);
      })
      .catch((e) => {
        console.error("[useEvents] Failed to load events:", e);
        setMounted(true);
      });
  }, []);

  // Check for notifications on mount and periodically
  useEffect(() => {
    if (!mounted) return;

    const checkNotifications = async () => {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      for (const event of events) {
        if (event.notified) continue;
        if (event.date !== today) continue;
        if (event.time && event.time > now) continue;

        const sent = await sendNotification({
          eventId: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          type: event.type,
          message: formatEventMessage({
            eventId: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            type: event.type,
            message: "",
          }),
        });

        if (sent) {
          try {
            await fetch("/api/events", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: event.id, notified: true }),
            });
            setEvents((prev) =>
              prev.map((e) => (e.id === event.id ? { ...e, notified: true } : e))
            );
          } catch (e) {
            console.error("[useEvents] Failed to mark notified:", e);
          }
        }
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60_000);
    return () => clearInterval(interval);
  }, [events, mounted]);

  const addEvent = useCallback(
    async (data: Omit<CalendarEvent, "id" | "notified" | "createdAt">) => {
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create event");
        const newEvent: CalendarEvent = await res.json();
        setEvents((prev) => [...prev, newEvent]);
      } catch (e) {
        console.error("[useEvents] Failed to add event:", e);
      }
    },
    []
  );

  const updateEvent = useCallback(async (id: string, data: Partial<CalendarEvent>) => {
    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update event");
      const updated: CalendarEvent = await res.json();
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? updated : e))
      );
    } catch (e) {
      console.error("[useEvents] Failed to update event:", e);
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error("[useEvents] Failed to delete event:", e);
    }
  }, []);

  const getEventsByDate = useCallback(
    (date: string) => events.filter((e) => e.date === date),
    [events]
  );

  const todayRef = useRef<string>("");

  useEffect(() => {
    if (mounted) {
      todayRef.current = new Date().toISOString().split("T")[0];
    }
  }, [mounted]);

  const getUpcomingEvents = useCallback(
    (limit = 5) => {
      if (!todayRef.current) return [];
      return events
        .filter((e) => e.date >= todayRef.current)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""))
        .slice(0, limit);
    },
    [events]
  );

  return {
    events,
    mounted,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
    getUpcomingEvents,
  };
}