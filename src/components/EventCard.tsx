"use client";

import { Bell, BellOff, Clock, Trash2 } from "lucide-react";
import { TYPE_CONFIG } from "@/lib/eventTypes";
import type { CalendarEvent } from "@/types";

interface EventCardProps {
  event: CalendarEvent;
  onDelete: (id: string) => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const config = TYPE_CONFIG[event.type];
  const Icon = config.icon;

  return (
    <div className="group relative flex items-stretch gap-3 overflow-hidden rounded-xl border border-border bg-card p-3 pl-4 shadow-sm transition-all hover:border-accent-gold/50 hover:shadow-md">
      <span className={`absolute inset-y-0 left-0 w-1 ${config.dot}`} aria-hidden />

      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${config.color}`}>
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-snug text-foreground">{event.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium">{config.label}</span>
          {event.time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {event.time}
            </span>
          )}
          {event.notified ? (
            <span className="inline-flex items-center gap-1" title="Lembrete já enviado">
              <BellOff size={12} />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-accent-gold" title="Lembrete ativo">
              <Bell size={12} />
            </span>
          )}
        </div>
        {event.description && (
          <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground">{event.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(event.id)}
        aria-label={`Excluir ${event.title}`}
        className="-my-1 -mr-1 flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-marsala/10 hover:text-accent-marsala active:bg-accent-marsala/15 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}
