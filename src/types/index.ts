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
export type NotebookColor = "primary" | "gold" | "marsala" | "slate" | "teal" | "plum";

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  color: NotebookColor;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookPage {
  id: string;
  notebookId: string;
  title: string;
  /** Sanitized rich-text HTML */
  content: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}
