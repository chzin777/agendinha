export type EventType = "exam" | "project" | "studio" | "critique" | "lecture" | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:mm format
  type: EventType;
  notified: boolean;
  createdAt: string;
}

export interface NotificationPayload {
  eventId: string;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  message: string;
}

export interface NotificationChannel {
  send(payload: NotificationPayload): Promise<boolean>;
}