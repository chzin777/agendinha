import type { NotificationChannel, NotificationPayload } from "@/types";

class BrowserNotificationChannel implements NotificationChannel {
  async send(payload: NotificationPayload): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const permission = await this.ensurePermission();
    if (permission !== "granted") return false;

    try {
      new Notification(payload.title, {
        body: payload.message,
        icon: "/favicon.ico",
        tag: payload.eventId,
      });
      return true;
    } catch {
      return false;
    }
  }

  private async ensurePermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined") return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    return Notification.requestPermission();
  }
}

/**
 * Evolution API channel - prepared for future WhatsApp integration.
 * Configure EVOLUTION_API_URL and EVOLUTION_API_KEY in environment variables.
 */
class EvolutionNotificationChannel implements NotificationChannel {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly instanceName: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL ?? "";
    this.apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY ?? "";
    this.instanceName = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE ?? "default";
  }

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!this.apiUrl || !this.apiKey) {
      console.warn("[Evolution] API not configured. Skipping WhatsApp notification.");
      return false;
    }

    // TODO: Implement when Evolution API is configured
    // POST {apiUrl}/message/sendText/{instanceName}
    // Headers: { apikey: apiKey }
    // Body: { number: userPhone, text: payload.message }
    console.info("[Evolution] Would send:", payload);
    return false;
  }

  isConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiKey);
  }
}

export const browserNotifications = new BrowserNotificationChannel();
export const evolutionNotifications = new EvolutionNotificationChannel();

export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  const browserSent = await browserNotifications.send(payload);

  // Future: uncomment when Evolution API is configured
  // const evolutionSent = await evolutionNotifications.send(payload);

  return browserSent;
}

export function formatEventMessage(payload: NotificationPayload): string {
  const timeStr = payload.time ? ` às ${payload.time}` : "";
  const typeLabels: Record<string, string> = {
    exam: "Prova",
    project: "Entrega de projeto",
    studio: "Ateliê / Studio",
    critique: "Banca / Crítica",
    lecture: "Aula teórica",
    other: "Evento",
  };
  const label = typeLabels[payload.type] ?? "Evento";
  return `${label}: ${payload.title}${timeStr} — ${payload.date}`;
}