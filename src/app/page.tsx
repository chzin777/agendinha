"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CalendarDays,
  ListTodo,
  Sparkles,
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { Modal } from "@/components/Modal";
import { EventForm } from "@/components/EventForm";
import { EventCard } from "@/components/EventCard";
import { GoldenButton } from "@/components/GoldenButton";
import { GoldenCard } from "@/components/GoldenCard";
import { AppShell, Segmented } from "@/components/AppShell";
import { SearchField } from "@/components/SearchField";
import { getHolidays } from "@/lib/holidays";
import { matchesSearch, normalizeSearch } from "@/lib/search";
import {
  TYPE_CONFIG,
  EVENT_TYPE_ORDER,
  MONTH_NAMES,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  toDateKey,
  formatLongDate,
  relativeDayLabel,
} from "@/lib/eventTypes";
import type { CalendarEvent, EventType } from "@/types";

type MobileTab = "calendar" | "upcoming";

const NAV_BUTTON =
  "flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted";

export default function HomePage() {
  const { events, mounted, loadError, addEvent, deleteEvent, getUpcomingEvents } = useEvents();
  const [viewMonth, setViewMonth] = useState<Date | null>(null);
  const [todayKey, setTodayKey] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [tab, setTab] = useState<MobileTab>("calendar");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [formDate, setFormDate] = useState<string | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // "Now" must be read on the client only (Cache Components forbids `new Date()` during prerender).
  useEffect(() => {
    const now = new Date();
    const key = toDateKey(now);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setTodayKey(key);
    setSelectedKey(key);
  }, []);

  const year = viewMonth?.getFullYear() ?? 2000;
  const month = viewMonth?.getMonth() ?? 0;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const holiday of getHolidays(year)) {
      const key = toDateKey(holiday.date);
      map.set(key, [...(map.get(key) ?? []), holiday.name]);
    }
    return map;
  }, [year]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const evt of events) {
      const list = map.get(evt.date) ?? [];
      list.push(evt);
      map.set(evt.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    }
    return map;
  }, [events]);

  const upcomingEvents = getUpcomingEvents(30);

  const upcomingGroups = useMemo(() => {
    const groups: { date: string; items: CalendarEvent[] }[] = [];
    for (const evt of upcomingEvents) {
      const last = groups[groups.length - 1];
      if (last && last.date === evt.date) last.items.push(evt);
      else groups.push({ date: evt.date, items: [evt] });
    }
    return groups;
  }, [upcomingEvents]);

  const goToMonth = useCallback(
    (target: Date) => {
      const first = new Date(target.getFullYear(), target.getMonth(), 1);
      setViewMonth(first);
      const today = new Date();
      const isCurrentMonth =
        first.getFullYear() === today.getFullYear() && first.getMonth() === today.getMonth();
      setSelectedKey(isCurrentMonth ? toDateKey(today) : toDateKey(first));
    },
    []
  );

  if (!viewMonth || !mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const keyFor = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const prevMonth = () => goToMonth(new Date(year, month - 1, 1));
  const nextMonth = () => goToMonth(new Date(year, month + 1, 1));
  const goToToday = () => goToMonth(new Date());

  const openNewEvent = (date?: string) => {
    setFormDate(date);
    setFormKey((k) => k + 1);
    setModalOpen(true);
  };

  const closeNewEvent = () => setModalOpen(false);

  const handleAddEvent = (data: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    type: EventType;
  }) => {
    addEvent(data);
    setModalOpen(false);
    // Jump to the day of the new event so the user sees it right away
    const [y, m] = data.date.split("-").map(Number);
    setViewMonth(new Date(y, m - 1, 1));
    setSelectedKey(data.date);
    setTab("calendar");
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) nextMonth();
      else prevMonth();
    }
  };

  const selectedEvents = eventsByDate.get(selectedKey) ?? [];
  const searchQuery = normalizeSearch(query);
  const searchResults = searchQuery
    ? events.filter((event) => {
        const [y, m, d] = event.date.split("-");
        return matchesSearch(searchQuery, event.title, event.description, TYPE_CONFIG[event.type].label, event.date, `${d}/${m}/${y}`, event.time);
      }).sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""))
    : [];
  const selectedHolidays = holidaysByDate.get(selectedKey) ?? [];
  const monthHolidays = [...holidaysByDate].filter(([key]) =>
    key.startsWith(`${year}-${String(month + 1).padStart(2, "0")}-`)
  );
  const selectedRelative = relativeDayLabel(selectedKey, todayKey);
  const isViewingCurrentMonth = todayKey.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`);

  return (
    <AppShell
      active="agenda"
      fab={{ label: "Novo evento", onClick: () => openNewEvent(tab === "calendar" ? selectedKey : todayKey) }}
      actions={
        !isViewingCurrentMonth && (
          <button
            type="button"
            onClick={() => {
              goToToday();
              setTab("calendar");
            }}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-muted lg:hidden"
          >
            Hoje
          </button>
        )
      }
    >
        <SearchField label="Buscar eventos" value={query} onChange={setQuery} className="mb-4 sm:max-w-md" />
        {loadError && (
          <p role="alert" className="mb-4 rounded-2xl border border-accent-marsala/30 bg-accent-marsala/10 p-4 text-sm text-accent-marsala">
            Não foi possível carregar os eventos. Recarregue a página.
          </p>
        )}
        {searchQuery ? (
          <section aria-label="Resultados da busca" className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Resultados da busca</h2>
            {!loadError && (
              <p role="status" className="text-sm text-muted-foreground">
                {searchResults.length} {searchResults.length === 1 ? "evento encontrado" : "eventos encontrados"}
              </p>
            )}
            {loadError ? null : searchResults.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                Nenhum evento encontrado para “{query}”.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((event) => (
                  <div key={event.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        const [y, m] = event.date.split("-").map(Number);
                        setViewMonth(new Date(y, m - 1, 1));
                        setSelectedKey(event.date);
                        setTab("calendar");
                        setQuery("");
                      }}
                      className="mb-1 text-left text-xs font-semibold text-primary hover:underline"
                    >
                      {formatLongDate(event.date)} de {event.date.slice(0, 4)} · Ver no calendário
                    </button>
                    <EventCard event={event} onClick={setDetailEvent} onDelete={setDeleteConfirmId} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
        <>
        <Segmented
          className="mb-4 lg:hidden"
          value={tab}
          onChange={setTab}
          options={[
            { value: "calendar", label: "Calendário", icon: CalendarDays },
            { value: "upcoming", label: "Próximos", icon: ListTodo, badge: upcomingEvents.length },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start [&>*]:min-w-0">
          {/* Calendar */}
          <section className={`${tab === "calendar" ? "block" : "hidden"} lg:block`} aria-label="Calendário">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2.5 sm:px-5 sm:py-4">
                <button type="button" onClick={prevMonth} aria-label="Mês anterior" className={NAV_BUTTON}>
                  <ChevronLeft size={20} />
                </button>
                <div className="flex min-w-0 flex-1 items-center justify-center gap-3 lg:justify-start">
                  <h2 className="truncate text-lg font-bold text-foreground sm:text-2xl">
                    {MONTH_NAMES[month]} <span className="text-accent-gold">{year}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={goToToday}
                    className="hidden rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-block"
                  >
                    Hoje
                  </button>
                </div>
                <button type="button" onClick={nextMonth} aria-label="Próximo mês" className={`${NAV_BUTTON} lg:order-none`}>
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 px-1.5 pt-2 sm:px-3 lg:border-b lg:border-border lg:px-0 lg:pt-0">
                {WEEKDAYS.map((day, i) => (
                  <div
                    key={day}
                    className={`py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider lg:py-3 lg:text-xs ${
                      i === 0 ? "text-accent-marsala" : i === 6 ? "text-[#315c85]" : "text-muted-foreground"
                    }`}
                  >
                    <span className="lg:hidden">{WEEKDAYS_SHORT[i]}</span>
                    <span className="hidden lg:inline">{day}</span>
                  </div>
                ))}
              </div>

              <div
                key={`${year}-${month}`}
                className="anim-fade grid grid-cols-7 gap-y-1 px-1.5 pb-2 sm:px-3 lg:gap-0 lg:p-0"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="h-12 sm:h-14 lg:h-auto lg:min-h-[104px] lg:border-b lg:border-r lg:border-border lg:bg-muted/30 lg:[&:nth-child(7n)]:border-r-0"
                      />
                    );
                  }

                  const dateKey = keyFor(day);
                  const isToday = dateKey === todayKey;
                  const isSelected = dateKey === selectedKey;
                  const dayEvents = eventsByDate.get(dateKey) ?? [];
                  const holidays = holidaysByDate.get(dateKey) ?? [];
                  const dayColor = idx % 7 === 0 ? "text-accent-marsala" : idx % 7 === 6 ? "text-[#315c85]" : "text-foreground";

                  return (
                    <div
                      key={dateKey}
                      className={`group relative flex h-12 flex-col items-center justify-start gap-1 rounded-xl pt-1 transition-colors sm:h-14 lg:h-auto lg:min-h-[104px] lg:items-stretch lg:rounded-none lg:border-b lg:border-r lg:border-border lg:p-2 lg:[&:nth-child(7n)]:border-r-0 ${
                        isSelected
                          ? "bg-primary/10 lg:bg-primary/[0.07] lg:shadow-[inset_0_0_0_2px_var(--primary)]"
                          : "hover:bg-muted/60 active:bg-muted"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedKey(dateKey)}
                        onDoubleClick={() => openNewEvent(dateKey)}
                        aria-label={`${formatLongDate(dateKey)}${holidays.length ? `, feriado: ${holidays.join(", ")}` : ""}${dayEvents.length ? `, ${dayEvents.length} evento(s)` : ""}`}
                        aria-pressed={isSelected}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-start gap-1 rounded-xl pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:static lg:z-auto lg:h-7 lg:w-7 lg:flex-none lg:rounded-full lg:pt-0"
                      >
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold lg:h-7 lg:w-7 ${holidays.length ? "ring-2 ring-accent-gold" : ""} ${
                            isToday ? "bg-primary text-primary-foreground shadow-sm" : dayColor
                          }`}
                        >
                          {day}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="flex h-1.5 items-center gap-0.5 lg:hidden" aria-hidden>
                            {dayEvents.slice(0, 3).map((evt) => (
                              <span key={evt.id} className={`h-1.5 w-1.5 rounded-full ${TYPE_CONFIG[evt.type].dot}`} />
                            ))}
                          </span>
                        )}
                      </button>

                      {dayEvents.length > 0 && (
                        <span className="mt-1 hidden space-y-1 lg:block">
                          {dayEvents.slice(0, 2).map((evt) => (
                            <button
                              type="button"
                              key={evt.id}
                              onClick={() => setDetailEvent(evt)}
                              aria-label={`Ver detalhes de ${evt.title}`}
                              className={`block w-full truncate rounded-md border px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight ${TYPE_CONFIG[evt.type].color}`}
                            >
                              {evt.time && <span className="mr-1 opacity-70">{evt.time}</span>}
                              {evt.title}
                            </button>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="block pl-1 text-[11px] text-muted-foreground">
                              +{dayEvents.length - 2} mais
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
              <span className="text-[#315c85]">Sábado</span>
              <span className="text-accent-marsala">Domingo</span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="h-3 w-3 rounded-full ring-2 ring-accent-gold" aria-hidden="true" />
                Feriado
              </span>
            </div>
            {monthHolidays.length > 0 && (
              <div className="mt-3 rounded-xl border border-accent-gold/40 bg-card p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feriados do mês</h3>
                <ul className="mt-2 space-y-1">
                  {monthHolidays.map(([key, names]) => (
                    <li key={key}>
                      <button type="button" onClick={() => setSelectedKey(key)} className="text-left text-sm text-foreground hover:text-primary">
                        <span className="font-semibold text-accent-marsala">{key.slice(-2)}</span>{" · "}{names.join(", ")}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-2">
              {EVENT_TYPE_ORDER.map((type) => {
                const config = TYPE_CONFIG[type];
                return (
                  <span
                    key={type}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                  >
                    <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4 sm:space-y-6">
            {/* Selected day */}
            <section
              className={`${tab === "calendar" ? "block" : "hidden"} lg:block`}
              aria-label="Eventos do dia"
            >
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-gold">
                      {selectedRelative ?? "Dia selecionado"}
                    </p>
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {formatLongDate(selectedKey)}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => openNewEvent(selectedKey)}
                    aria-label="Adicionar evento neste dia"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-primary/10 active:bg-primary/15"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {selectedHolidays.length > 0 && (
                  <div className="mb-3 rounded-xl border border-accent-gold/40 bg-accent-gold/10 px-3 py-2 text-sm text-foreground">
                    <span className="font-semibold">Feriado: </span>{selectedHolidays.join(", ")}
                  </div>
                )}

                {selectedEvents.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => openNewEvent(selectedKey)}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <Sparkles size={20} className="text-accent-gold" />
                    <span className="text-sm text-muted-foreground">Nada marcado para este dia</span>
                    <span className="text-sm font-semibold text-primary">Adicionar evento</span>
                  </button>
                ) : (
                  <div key={selectedKey} className="anim-rise space-y-2.5">
                    {selectedEvents.map((evt) => (
                      <EventCard key={evt.id} event={evt} onClick={setDetailEvent} onDelete={setDeleteConfirmId} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Upcoming */}
            <section
              className={`${tab === "upcoming" ? "block" : "hidden"} lg:block`}
              aria-label="Próximos eventos"
            >
              <GoldenCard>
                <div className="mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-accent-gold" />
                  <h3 className="font-semibold text-foreground">Próximos eventos</h3>
                  {upcomingEvents.length > 0 && (
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      {upcomingEvents.length}
                    </span>
                  )}
                </div>

                {upcomingGroups.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <CalendarIcon size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
                    <button
                      type="button"
                      onClick={() => openNewEvent(todayKey)}
                      className="mt-3 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      Adicionar evento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 lg:max-h-[60vh] lg:overflow-y-auto lg:pr-1">
                    {upcomingGroups.map((group) => {
                      const relative = relativeDayLabel(group.date, todayKey);
                      return (
                        <div key={group.date}>
                          <button
                            type="button"
                            onClick={() => {
                              const [y, m] = group.date.split("-").map(Number);
                              setViewMonth(new Date(y, m - 1, 1));
                              setSelectedKey(group.date);
                              setTab("calendar");
                            }}
                            className="mb-2 flex w-full items-baseline gap-2 text-left"
                          >
                            {relative && (
                              <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">{relative}</span>
                            )}
                            <span className="text-xs font-medium text-muted-foreground">{formatLongDate(group.date)}</span>
                          </button>
                          <div className="space-y-2.5">
                            {group.items.map((evt) => (
                              <EventCard key={evt.id} event={evt} onClick={setDetailEvent} onDelete={setDeleteConfirmId} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GoldenCard>
            </section>
          </aside>
        </div>
        </>
        )}

      {/* Add Event */}
      <Modal open={detailEvent !== null} onClose={() => setDetailEvent(null)} title="Detalhes do evento">
        {detailEvent && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${TYPE_CONFIG[detailEvent.type].color}`}>
                {(() => {
                  const Icon = TYPE_CONFIG[detailEvent.type].icon;
                  return <Icon size={20} />;
                })()}
              </span>
              <div className="min-w-0">
                <h3 className="break-words text-lg font-semibold text-foreground">{detailEvent.title}</h3>
                <p className="text-sm text-muted-foreground">{TYPE_CONFIG[detailEvent.type].label}</p>
              </div>
            </div>
            <dl className="grid gap-3 rounded-xl border border-border bg-background p-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data</dt>
                <dd className="mt-0.5 text-foreground">{formatLongDate(detailEvent.date)} de {detailEvent.date.slice(0, 4)}</dd>
              </div>
              {detailEvent.time && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Horário</dt>
                  <dd className="mt-0.5 text-foreground">{detailEvent.time}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lembrete</dt>
                <dd className="mt-0.5 text-foreground">{detailEvent.notified ? "Já enviado" : "Ativo"}</dd>
              </div>
              {detailEvent.description && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap break-words text-foreground">{detailEvent.description}</dd>
                </div>
              )}
            </dl>
            <button
              type="button"
              onClick={() => setDetailEvent(null)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Fechar
            </button>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={closeNewEvent} title="Novo evento">
        <EventForm key={formKey} initialDate={formDate} onSubmit={handleAddEvent} onCancel={closeNewEvent} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} title="Excluir evento">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              className="flex-1 !rounded-xl !py-3"
            >
              Excluir
            </GoldenButton>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
