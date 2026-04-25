import { useState, useEffect } from "react";
import { Calendar, AlertTriangle, CheckCircle2, Clock, Zap, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const STATUS_DOT: Record<string, string> = {
  pending: "oklch(0.72 0.22 55)",
  confirmed: "oklch(0.65 0.25 145)",
  completed: "oklch(0.55 0.22 262)",
  cancelled: "oklch(0.55 0.02 260)",
};

export default function AutoSchedulingModule() {
  const { events, users } = useAuth();
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [syncGoogle, setSyncGoogle] = useState(false);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeNow, setTimeNow] = useState(new Date());

  // Atualizar relógio para o countdown
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 60000); // 1 minuto
    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Countdown para o evento mais próximo
  const nextEvent = events
    .filter(e => e.status !== "cancelled" && e.status !== "completed")
    .map(e => ({ ...e, timeObj: new Date(`\${e.date}T\${e.time || '00:00'}:00`) }))
    .filter(e => e.timeObj.getTime() > timeNow.getTime())
    .sort((a, b) => a.timeObj.getTime() - b.timeObj.getTime())[0];

  const getCountdown = () => {
    if (!nextEvent) return null;
    const diff = nextEvent.timeObj.getTime() - timeNow.getTime();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    return { d, h, m };
  };

  const countdown = getCountdown();

  // Detectar conflitos
  const detectConflicts = () => {
    const found: any[] = [];
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i]; const e2 = events[j];
        if (e1.status === 'cancelled' || e2.status === 'cancelled') continue;
        const sameDay = new Date(e1.date).toDateString() === new Date(e2.date).toDateString();
        if (sameDay && e1.location === e2.location) {
          found.push({ id: `\${e1.id}-\${e2.id}`, e1: e1.title, e2: e2.title, date: e1.date, location: e1.location, severity: "alto" });
        } else if (sameDay && e1.time && e2.time && e1.time === e2.time) {
          found.push({ id: `\${e1.id}-\${e2.id}-prox`, e1: e1.title, e2: e2.title, date: e1.date, location: `\${e1.location} / \${e2.location}`, severity: "medio" });
        }
      }
    }
    setConflicts(found);
    if (found.length > 0) toast.warning(`\${found.length} conflito(s) detectado(s)`);
    else toast.success("Nenhum conflito de agendamento!");
  };

  // Sugestões
  const suggestions = (() => {
    const s: any[] = [];
    const byLoc: Record<string, number> = {};
    events.filter(e => e.status !== "cancelled").forEach((e) => { byLoc[e.location] = (byLoc[e.location] || 0) + 1; });
    Object.entries(byLoc).filter(([, v]) => v > 1).forEach(([loc, count]) => {
      s.push({ emoji: "📍", title: `\${count} eventos em "\${loc}"`, desc: "Agrupar eventos próximos otimiza logística.", badge: "Eficiência", badgeColor: "oklch(0.65 0.25 145)" });
    });
    const byDay: Record<string, number> = {};
    events.filter(e => e.status !== "cancelled").forEach((e) => { const d = new Date(e.date).toDateString(); byDay[d] = (byDay[d] || 0) + 1; });
    Object.entries(byDay).filter(([, v]) => v > 3).forEach(([d, c]) => {
      s.push({ emoji: "⚠️", title: `\${c} eventos em \${new Date(d).toLocaleDateString("pt-BR")}`, desc: "Alta densidade. Considere remanejar equipe.", badge: "Atenção", badgeColor: "oklch(0.72 0.22 55)" });
    });
    const pending = events.filter((e) => e.status === "pending" && new Date(e.date) < new Date());
    if (pending.length > 0) s.push({ emoji: "🔔", title: `\${pending.length} evento(s) passados ainda Pendentes`, desc: "Confirme ou cancele para limpar o painel.", badge: "Urgente", badgeColor: "oklch(0.55 0.28 340)" });
    return s;
  })();

  // Lógica do Calendário (Heatmap)
  const maxEventsInADay = Math.max(1, ...Object.values(
    events.filter(e => e.status !== 'cancelled').reduce((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + 1; return acc;
    }, {} as Record<string, number>)
  ));

  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  
  let cells: { date: Date, currentMonth: boolean }[] = [];
  
  if (viewMode === "month") {
    // Dias do mês anterior
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ date: new Date(calYear, calMonth, -firstDayOfMonth + i + 1), currentMonth: false });
    }
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(calYear, calMonth, i), currentMonth: true });
    }
    // Preencher final
    const remaining = 42 - cells.length; // 6 semanas para grid fixa
    for (let i = 1; i <= remaining; i++) {
      cells.push({ date: new Date(calYear, calMonth + 1, i), currentMonth: false });
    }
  } else {
    // Vista semana
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      cells.push({ date: d, currentMonth: d.getMonth() === calMonth });
    }
  }

  const eventsByDateStr = (dateStr: string) => events.filter((e) => e.date === dateStr && e.status !== "cancelled");

  const upcomingEvents = events
    .filter((e) => { const d = new Date(e.date); const now = new Date(); const w = new Date(now.getTime() + 7 * 86400000); return d >= now && d <= w && e.status !== "cancelled"; })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Eventos do dia selecionado
  const selectedEvents = selectedDate 
    ? events.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString())
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
        ⚡ Agendamento Inteligente
      </h2>

      {/* Controles principais & Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Próximo Evento Countdown */}
        <div className="md:col-span-4 bg-[oklch(0.55_0.28_340)] text-white rounded-2xl shadow-lg p-5 flex flex-col justify-between overflow-hidden relative group cursor-default">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div>
            <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock size={12}/> Próximo Evento</p>
            <p className="text-lg font-extrabold leading-tight mb-4 truncate">{nextEvent?.title || "Nenhum evento futuro"}</p>
          </div>
          {countdown ? (
            <div className="flex gap-2 text-center">
               <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 flex-1">
                 <p className="text-2xl font-extrabold">{countdown.d}</p>
                 <p className="text-[9px] uppercase tracking-wider font-bold">Dias</p>
               </div>
               <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 flex-1">
                 <p className="text-2xl font-extrabold">{countdown.h}</p>
                 <p className="text-[9px] uppercase tracking-wider font-bold">Horas</p>
               </div>
               <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 flex-1">
                 <p className="text-2xl font-extrabold">{countdown.m}</p>
                 <p className="text-[9px] uppercase tracking-wider font-bold">Mins</p>
               </div>
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <p className="text-sm font-bold">Agenda Livre! 🎉</p>
            </div>
          )}
        </div>

        <button onClick={() => { detectConflicts(); setAutoEnabled(!autoEnabled); }}
          className={`md:col-span-4 flex items-center justify-between p-5 rounded-2xl border-2 shadow-md transition-all \${autoEnabled ? "bg-[oklch(0.65_0.25_145)] border-transparent text-white" : "bg-white border-[oklch(0.9_0.02_85)] text-[oklch(0.18_0.02_260)] hover:border-[oklch(0.65_0.25_145)]"}`}>
          <div className="text-left">
            <p className="font-extrabold">Detectar Conflitos</p>
            <p className="text-xs opacity-70 mt-0.5">{autoEnabled ? "Ativo — conflitos verificados" : "Clique para verificar"}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 \${autoEnabled ? "bg-white/20" : "bg-[oklch(0.65_0.25_145/0.1)]"}`}>
            <Zap size={20} className={autoEnabled ? "text-white" : "text-[oklch(0.65_0.25_145)]"} />
          </div>
        </button>

        <button onClick={() => {
          if (syncGoogle) { setSyncGoogle(false); toast.success("Sincronização desativada"); return; }
          const id = toast.loading("Sincronizando com Google Calendar...");
          setTimeout(() => { setSyncGoogle(true); toast.dismiss(id); toast.success("Sincronizado!"); }, 2000);
        }}
          className={`md:col-span-4 flex items-center justify-between p-5 rounded-2xl border-2 shadow-md transition-all \${syncGoogle ? "bg-[#4285F4] border-transparent text-white" : "bg-white border-[oklch(0.9_0.02_85)] text-[oklch(0.18_0.02_260)] hover:border-[#4285F4]"}`}>
          <div className="text-left">
            <p className="font-extrabold">Google Calendar</p>
            <p className="text-xs opacity-70 mt-0.5">{syncGoogle ? "Sincronizado ✓" : "Sincronizar agenda"}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 \${syncGoogle ? "bg-white/20" : "bg-[#4285F4]/10"}`}>
            <RefreshCw size={20} className={syncGoogle ? "text-white" : "text-[#4285F4]"} />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CALENDÁRIO COM HEATMAP E CLICK */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-lg border border-[oklch(0.92_0.02_85)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 bg-[oklch(0.98_0.01_85)] p-1 rounded-xl border border-[oklch(0.92_0.02_85)]">
               <button onClick={() => setViewMode("month")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${viewMode === 'month' ? 'bg-white shadow-sm text-[oklch(0.18_0.02_260)]' : 'text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.18_0.02_260)]'}`}>Mês</button>
               <button onClick={() => setViewMode("week")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${viewMode === 'week' ? 'bg-white shadow-sm text-[oklch(0.18_0.02_260)]' : 'text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.18_0.02_260)]'}`}>Semana</button>
            </div>
            {viewMode === "month" && (
              <div className="flex items-center gap-4">
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                  className="p-1.5 rounded-full hover:bg-[oklch(0.97_0.01_85)] transition-colors"><ChevronLeft size={20} /></button>
                <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] min-w-[120px] text-center">{MONTHS_PT[calMonth]} {calYear}</h3>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                  className="p-1.5 rounded-full hover:bg-[oklch(0.97_0.01_85)] transition-colors"><ChevronRight size={20} /></button>
              </div>
            )}
            {viewMode === "week" && (
               <h3 className="font-extrabold text-[oklch(0.18_0.02_260)]">Esta Semana</h3>
            )}
          </div>
          
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => <div key={d} className="text-center text-[11px] font-extrabold text-[oklch(0.55_0.02_260)] uppercase py-1">{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, i) => {
              const yyyy = cell.date.getFullYear();
              const mm = String(cell.date.getMonth() + 1).padStart(2, '0');
              const dd = String(cell.date.getDate()).padStart(2, '0');
              const dateStr = `\${yyyy}-\${mm}-\${dd}`;
              const dayEvents = eventsByDateStr(dateStr);
              
              // Heatmap Logic
              const density = dayEvents.length / maxEventsInADay;
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDate && selectedDate.toDateString() === cell.date.toDateString();
              const isHoje = cell.date.toDateString() === today.toDateString();
              
              // Heatmap background color calculated based on density
              let bgClass = "bg-[oklch(0.98_0.01_85)] hover:bg-[oklch(0.95_0.01_85)]";
              let borderClass = "border-transparent";
              if (hasEvents) {
                 if (density > 0.6) bgClass = "bg-[oklch(0.55_0.28_340)] text-white hover:bg-[oklch(0.50_0.28_340)]";
                 else if (density > 0.3) bgClass = "bg-[oklch(0.55_0.28_340/0.4)] text-[oklch(0.18_0.02_260)] hover:bg-[oklch(0.55_0.28_340/0.5)]";
                 else bgClass = "bg-[oklch(0.55_0.28_340/0.15)] text-[oklch(0.18_0.02_260)] hover:bg-[oklch(0.55_0.28_340/0.25)]";
              }
              
              if (isSelected) borderClass = "border-[oklch(0.55_0.28_340)] ring-2 ring-[oklch(0.55_0.28_340/0.2)]";
              if (isHoje && !isSelected) borderClass = "border-[oklch(0.55_0.28_340)] border-dashed";

              return (
                <button key={i} onClick={() => setSelectedDate(cell.date)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all border-2 \${bgClass} \${borderClass} \${!cell.currentMonth && viewMode === 'month' ? "opacity-30" : "opacity-100"}`}>
                  <span className={`text-xs sm:text-sm font-extrabold \${isHoje && !hasEvents ? 'text-[oklch(0.55_0.28_340)]' : ''}`}>{cell.date.getDate()}</span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <span key={j} className={`w-1.5 h-1.5 rounded-full \${density > 0.6 ? 'bg-white' : ''}`} style={density > 0.6 ? {} : { backgroundColor: STATUS_DOT[e.status] }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[oklch(0.92_0.02_85)]">
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-[oklch(0.45_0.02_260)]">
               <span className="w-3 h-3 rounded-md bg-[oklch(0.98_0.01_85)]"></span> Zero
               <span className="w-3 h-3 rounded-md bg-[oklch(0.55_0.28_340/0.15)] ml-1"></span> Leve
               <span className="w-3 h-3 rounded-md bg-[oklch(0.55_0.28_340/0.4)] ml-1"></span> Médio
               <span className="w-3 h-3 rounded-md bg-[oklch(0.55_0.28_340)] ml-1"></span> Intenso
             </div>
          </div>
        </div>

        {/* SIDEBAR DETALHES & PRÓXIMOS EVENTOS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Eventos do dia selecionado */}
          {selectedDate && (
             <div className="bg-white rounded-3xl shadow-lg border border-[oklch(0.92_0.02_85)] p-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4 border-b border-[oklch(0.92_0.02_85)] pb-3">
                  <h3 className="font-extrabold text-[oklch(0.18_0.02_260)]">Eventos em {selectedDate.toLocaleDateString('pt-BR')}</h3>
                  <button onClick={() => setSelectedDate(null)} className="p-1 rounded-full hover:bg-[oklch(0.97_0.01_85)]"><X size={16}/></button>
                </div>
                {selectedEvents.length === 0 ? (
                  <p className="text-center text-sm text-[oklch(0.55_0.02_260)] py-4 font-medium">Nenhum evento neste dia.</p>
                ) : (
                  <div className="space-y-3">
                     {selectedEvents.map(ev => {
                        const client = users.find(u => u.id === ev.clientId);
                        return (
                          <div key={ev.id} className="p-3 bg-[oklch(0.98_0.01_85)] rounded-xl border border-[oklch(0.95_0.01_85)]">
                             <div className="flex items-start justify-between">
                               <p className="font-extrabold text-sm text-[oklch(0.18_0.02_260)]">{ev.title}</p>
                               <span className="w-2.5 h-2.5 rounded-full mt-1" style={{backgroundColor: STATUS_DOT[ev.status]}}></span>
                             </div>
                             <p className="text-xs text-[oklch(0.55_0.02_260)] mt-1">{client?.name}</p>
                             <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-[oklch(0.45_0.02_260)] uppercase">
                               {ev.time && <span className="flex items-center gap-1"><Clock size={10}/> {ev.time}</span>}
                               <span className="flex items-center gap-1"><MapPin size={10}/> {ev.location}</span>
                             </div>
                          </div>
                        )
                     })}
                  </div>
                )}
             </div>
          )}

          {/* Sugestões e Alertas (Condicional) */}
          {suggestions.length > 0 && !selectedDate && (
            <div className="bg-white rounded-3xl shadow-lg border border-[oklch(0.92_0.02_85)] p-5">
              <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">💡 Insights da Agenda</h3>
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[oklch(0.97_0.01_85)]">
                    <span className="text-xl leading-none mt-1">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[oklch(0.18_0.02_260)] truncate">{s.title}</p>
                      <p className="text-xs text-[oklch(0.55_0.02_260)] mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos Eventos Gerais */}
          {!selectedDate && (
            <div className="bg-white rounded-3xl shadow-lg border border-[oklch(0.92_0.02_85)] p-5">
              <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 flex items-center gap-2">
                <LayoutGrid size={16} className="text-[oklch(0.55_0.28_340)]" /> Resumo Semanal
              </h3>
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-[oklch(0.65_0.02_260)]">
                  <CheckCircle2 size={32} className="mb-2 opacity-30" />
                  <p className="text-sm font-medium">Nenhum evento urgente.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 4).map((ev) => {
                    const daysLeft = Math.ceil((new Date(ev.date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                    return (
                      <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl border border-[oklch(0.95_0.01_85)] hover:border-[oklch(0.55_0.28_340)] transition-colors">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-center" style={{ backgroundColor: `\${STATUS_DOT[ev.status]}18` }}>
                          <span className="text-[10px] font-bold" style={{ color: STATUS_DOT[ev.status] }}>{daysLeft === 0 ? "Hoje" : daysLeft === 1 ? "Amanhã" : `\${daysLeft}d`}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[oklch(0.18_0.02_260)] truncate">{ev.title}</p>
                          <p className="text-[10px] font-bold text-[oklch(0.55_0.02_260)] uppercase mt-0.5">{new Date(ev.date).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conflitos Críticos */}
      {conflicts.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg border border-red-200 p-6 animate-in slide-in-from-bottom-5">
          <h3 className="font-extrabold text-red-600 mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Atenção: {conflicts.length} Conflito(s) Detectado(s)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conflicts.map((c) => (
              <div key={c.id} className={`flex items-start gap-4 p-4 rounded-2xl border-l-4 \${c.severity === "alto" ? "border-red-400 bg-red-50" : "border-amber-400 bg-amber-50"}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[oklch(0.18_0.02_260)] leading-tight mb-1">{c.e1} <span className="text-red-400 mx-1">×</span> {c.e2}</p>
                  <p className="text-xs text-[oklch(0.55_0.02_260)] font-medium">{new Date(c.date).toLocaleDateString("pt-BR")} · {c.location}</p>
                </div>
                <button onClick={() => { setConflicts(conflicts.filter(x => x.id !== c.id)); toast.success("Alerta ocultado!"); }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-red-200 text-red-600 text-[10px] uppercase font-bold hover:bg-red-50 transition-colors shadow-sm">
                  Ciente
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
