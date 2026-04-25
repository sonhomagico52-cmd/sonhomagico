import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import {
  DEFAULT_AGENDA_SECTION,
  fetchLandingContent,
  normalizeAgendaSection,
  type AgendaEventItem,
  type AgendaSectionContent,
} from "@/lib/landingServices";

export default function EventSchedule() {
  const [visible, setVisible] = useState(false);
  const [agendaContent, setAgendaContent] = useState<AgendaSectionContent>(DEFAULT_AGENDA_SECTION);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadAgenda = async () => {
      try {
        const payload = await fetchLandingContent();
        if (payload.agenda && typeof payload.agenda === "object") {
          const normalized = normalizeAgendaSection(payload.agenda as Partial<AgendaSectionContent>);
          setAgendaContent(normalized);
          const firstDate = normalized.events[0]?.date;
          if (firstDate) {
            const parsed = new Date(firstDate);
            if (!Number.isNaN(parsed.getTime())) setCurrentMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
          }
          return;
        }
      } catch {
        // fallback below
      }

      try {
        const saved = localStorage.getItem("landingAgenda");
        if (saved) {
          const normalized = normalizeAgendaSection(JSON.parse(saved) as Partial<AgendaSectionContent>);
          setAgendaContent(normalized);
        }
      } catch {
        setAgendaContent(DEFAULT_AGENDA_SECTION);
      }
    };

    void loadAgenda();
  }, []);

  const events = agendaContent.events;
  const monthEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
  });
  const selectedEvents = selectedDate ? events.filter((event) => event.date === selectedDate) : events.slice(0, 3);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const calendarDays: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const hasEventOnDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.some((event) => event.date === dateStr);
  };

  const handleSelectDay = (day: number) => {
    setSelectedDate(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  };

  const getStatusColor = (status: AgendaEventItem["status"]) =>
    status === "confirmed"
      ? "bg-[oklch(0.65_0.25_145)] text-white"
      : status === "pending"
        ? "bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)]"
        : "bg-[oklch(0.55_0.22_262)] text-white";

  const getStatusLabel = (status: AgendaEventItem["status"]) =>
    status === "confirmed" ? "Confirmado" : status === "pending" ? "Pendente" : "Realizado";

  return (
    <section id="agenda" className="py-20 bg-gradient-to-b from-white to-[oklch(0.97_0.01_85)] relative overflow-hidden">
      <div className="absolute top-10 right-10 text-[oklch(0.88_0.18_85)]/10 text-9xl font-bold pointer-events-none">📅</div>
      <div className="absolute bottom-20 left-5 text-[oklch(0.55_0.28_340)]/10 text-8xl font-bold pointer-events-none">🎉</div>

      <div className="container relative z-10">
        <div ref={ref} className="text-center mb-12">
          <h2 className={`text-3xl md:text-5xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ fontFamily: "'Baloo 2', cursive", transitionDelay: "0.1s" }}>
            {agendaContent.title}
          </h2>
          <p className={`text-lg text-[oklch(0.18_0.02_260)]/70 max-w-2xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.2s" }}>
            {agendaContent.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-1 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.3s" }}>
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-[oklch(0.92_0.02_85)]">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)); setSelectedDate(null); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-full transition-colors" aria-label="Mês anterior">
                  <ChevronLeft size={20} className="text-[oklch(0.55_0.28_340)]" />
                </button>
                <h3 className="text-lg font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h3>
                <button onClick={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); setSelectedDate(null); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-full transition-colors" aria-label="Próximo mês">
                  <ChevronRight size={20} className="text-[oklch(0.55_0.28_340)]" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-3">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-[oklch(0.55_0.28_340)] uppercase">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => day && handleSelectDay(day)}
                    disabled={!day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all ${!day ? "text-transparent" : hasEventOnDay(day) ? "bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)] hover:scale-105 relative" : "bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)] hover:bg-[oklch(0.92_0.02_85)]"} ${selectedDate === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` ? "ring-2 ring-[oklch(0.55_0.28_340)]" : ""}`}
                  >
                    {day}
                    {day && hasEventOnDay(day) && <div className="absolute bottom-1 w-1 h-1 bg-[oklch(0.55_0.28_340)] rounded-full" />}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[oklch(0.92_0.02_85)]">
                <p className="text-xs text-[oklch(0.18_0.02_260)]/60 font-semibold mb-2">Legenda:</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.88_0.18_85)]" />
                  <span className="text-[oklch(0.18_0.02_260)]/70">{monthEvents.length} evento(s) neste mês</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-2 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0.4s" }}>
            <div className="space-y-4">
              {selectedEvents.length > 0 ? selectedEvents.map((event, idx) => (
                <div key={event.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg p-5 border border-[oklch(0.92_0.02_85)] transition-all group" style={{ animation: `slide-up 0.6s ease-out ${0.1 + idx * 0.1}s both` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-extrabold text-[oklch(0.18_0.02_260)] mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>{event.title}</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(event.status)}`}>{getStatusLabel(event.status)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-[oklch(0.55_0.28_340)]">{new Date(event.date).getDate()}</div>
                      <div className="text-xs text-[oklch(0.18_0.02_260)]/60 uppercase font-semibold">{new Date(event.date).toLocaleDateString("pt-BR", { month: "short" })}</div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[oklch(0.18_0.02_260)]/70"><Clock size={16} className="text-[oklch(0.55_0.28_340)]" />{event.time}</div>
                    <div className="flex items-center gap-2 text-sm text-[oklch(0.18_0.02_260)]/70"><MapPin size={16} className="text-[oklch(0.55_0.28_340)]" />{event.location}</div>
                    <div className="flex items-center gap-2 text-sm text-[oklch(0.18_0.02_260)]/70"><Users size={16} className="text-[oklch(0.55_0.28_340)]" />{event.attendees} convidados · {event.service}</div>
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-2xl shadow-md p-8 border border-[oklch(0.92_0.02_85)] text-center">
                  <Calendar size={32} className="mx-auto mb-3 text-[oklch(0.55_0.28_340)]" />
                  <p className="font-bold text-[oklch(0.18_0.02_260)]">Nenhum evento nesta data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
