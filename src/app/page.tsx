"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Clock,
  BookOpen,
  PenTool,
  Ruler,
  Presentation,
  GraduationCap,
  Calendar as CalendarIcon,
  Tag,
  Bell,
  BellOff,
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { Modal } from "@/components/Modal";
import { EventForm } from "@/components/EventForm";
import { GoldenButton } from "@/components/GoldenButton";
import { GoldenCard } from "@/components/GoldenCard";
import type { EventType } from "@/types";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const TYPE_CONFIG: Record<EventType, { label: string; icon: typeof BookOpen; color: string }> = {
  project: { label: "Projeto", icon: PenTool, color: "text-accent-gold bg-accent-gold/10 border-accent-gold/30" },
  studio: { label: "Ateliê", icon: Ruler, color: "text-primary bg-primary/10 border-primary/30" },
  critique: { label: "Banca", icon: Presentation, color: "text-accent-marsala bg-accent-marsala/10 border-accent-marsala/30" },
  exam: { label: "Prova", icon: BookOpen, color: "text-accent-marsala bg-accent-marsala/10 border-accent-marsala/30" },
  lecture: { label: "Aula", icon: GraduationCap, color: "text-muted-foreground bg-muted border-border" },
  other: { label: "Outro", icon: Tag, color: "text-muted-foreground bg-muted border-border" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function HomePage() {
  const { events, mounted, addEvent, deleteEvent, getUpcomingEvents } = useEvents();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const year = currentDate?.getFullYear() ?? 2000;
  const month = currentDate?.getMonth() ?? 0;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(formatDate(new Date()));
  }, []);

  const upcomingEvents = getUpcomingEvents(6);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  if (!currentDate || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setModalOpen(true);
  };

  const handleAddEvent = (data: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    type: EventType;
  }) => {
    addEvent(data);
    setModalOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarIcon size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">Agendinha</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Sua agenda academica</p>
            </div>
          </div>
          <GoldenButton
            onClick={() => {
              setSelectedDate(formatDate(new Date()));
              setModalOpen(true);
            }}
            className="!px-3 sm:!px-5 !py-2 sm:!py-2.5 !text-xs sm:!text-sm shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo evento</span>
            <span className="sm:hidden">Evento</span>
          </GoldenButton>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {monthNames[month]} <span className="text-accent-gold">{year}</span>
              </h2>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={goToToday}
                  className="rounded-lg border border-border px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={prevMonth}
                  className="rounded-lg border border-border p-1.5 sm:p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextMonth}
                  className="rounded-lg border border-border p-1.5 sm:p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="min-h-[60px] sm:min-h-[100px] bg-muted/30" />;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday = dateStr === todayStr;
                  const dayEvents = getEventsForDay(day);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDayClick(day)}
                      className={`min-h-[60px] sm:min-h-[100px] border-b border-r border-border p-1 sm:p-2 text-left transition-all hover:bg-muted/50 ${
                        isToday ? "bg-primary/5" : ""
                      }`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-medium ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      {hasEvents && (
                        <div className="mt-0.5 sm:mt-1.5 space-y-0.5 sm:space-y-1">
                          {dayEvents.slice(0, 2).map((evt) => {
                            const config = TYPE_CONFIG[evt.type];
                            return (
                              <div
                                key={evt.id}
                                className={`truncate rounded px-1 py-0.5 text-[9px] sm:text-[10px] font-medium border leading-tight ${config.color}`}
                              >
                                {evt.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] sm:text-[10px] text-muted-foreground pl-1">
                              +{dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Upcoming Events */}
          <div className="space-y-4 sm:space-y-6">
            <GoldenCard>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-accent-gold" />
                <h3 className="font-semibold text-foreground">Proximos eventos</h3>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <CalendarIcon size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Nenhum evento proximo</p>
                  <button
                    onClick={() => {
                      setSelectedDate(formatDate(new Date()));
                      setModalOpen(true);
                    }}
                    className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Adicionar evento
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((evt) => {
                    const config = TYPE_CONFIG[evt.type];
                    const Icon = config.icon;
                    const [y, m, d] = evt.date.split("-");
                    const dateLabel = `${d}/${m}`;

                    return (
                      <div
                        key={evt.id}
                        className="group relative rounded-lg border border-border p-3 transition-all hover:border-accent-gold/50 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border ${config.color}`}>
                            <span className="text-xs font-bold">{dateLabel}</span>
                          </div>
                          <div className="min-w-0 flex-1 pr-8 sm:pr-0">
                            <div className="flex items-center gap-2">
                              <Icon size={14} className="shrink-0 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                              {evt.notified ? (
                                <BellOff size={12} className="shrink-0 text-muted-foreground ml-auto" />
                              ) : (
                                <Bell size={12} className="shrink-0 text-accent-gold ml-auto sm:hidden" />
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{evt.title}</p>
                            {evt.time && (
                              <p className="text-xs text-muted-foreground">{evt.time}</p>
                            )}
                          </div>
                          {evt.notified ? (
                            <BellOff size={14} className="hidden sm:block shrink-0 text-muted-foreground" />
                          ) : (
                            <Bell size={14} className="hidden sm:block shrink-0 text-accent-gold" />
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(evt.id);
                          }}
                          className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-100 sm:opacity-0 transition-opacity hover:bg-accent-marsala/10 hover:text-accent-marsala sm:group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </GoldenCard>

            {/* Legend */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Legenda</h3>
              <div className="space-y-2">
                {(Object.entries(TYPE_CONFIG) as [EventType, typeof TYPE_CONFIG[EventType]][]).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={type} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon size={14} />
                      <span>{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Event Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDate(null);
        }}
        title="Novo evento"
      >
        <EventForm
          onSubmit={handleAddEvent}
          onCancel={() => {
            setModalOpen(false);
            setSelectedDate(null);
          }}
        />
        {selectedDate && (
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Data selecionada: {selectedDate.split("-").reverse().join("/")}
          </p>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirmar exclusao"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este evento? Esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <GoldenButton
              onClick={() => {
                if (deleteConfirmId) {
                  deleteEvent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              className="flex-1"
            >
              Excluir
            </GoldenButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}