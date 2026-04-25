import { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Search, Calendar, Clock, MapPin, Users, X, AlertTriangle, DollarSign, ArrowRight, LayoutGrid, List } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EventForm {
  title: string; date: string; time: string; location: string;
  attendees: number; service: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  budget: number; clientId: string; notes: string;
}

const EMPTY_FORM: EventForm = {
  title: "", date: "", time: "", location: "", attendees: 0,
  service: "Personagens Kids", status: "pending", budget: 0, clientId: "", notes: "",
};

const STATUS_CONFIG = {
  pending: { label: "Pendente", emoji: "⏳", bg: "bg-[oklch(0.97_0.04_85)]", border: "border-[oklch(0.85_0.12_85)]", badge: "bg-[oklch(0.88_0.18_85)] text-[oklch(0.35_0.08_85)]" },
  confirmed: { label: "Confirmado", emoji: "✅", bg: "bg-[oklch(0.97_0.04_145)]", border: "border-[oklch(0.82_0.14_145)]", badge: "bg-[oklch(0.65_0.25_145)] text-white" },
  completed: { label: "Realizado", emoji: "🎉", bg: "bg-[oklch(0.97_0.03_262)]", border: "border-[oklch(0.82_0.10_262)]", badge: "bg-[oklch(0.55_0.22_262)] text-white" },
  cancelled: { label: "Cancelado", emoji: "❌", bg: "bg-[oklch(0.97_0.01_260)]", border: "border-[oklch(0.88_0.02_260)]", badge: "bg-[oklch(0.88_0.02_260)] text-[oklch(0.35_0.02_260)]" },
};

const SEQUENCE = ["pending", "confirmed", "completed"];
const SERVICES = ["Personagens Kids", "Recreação", "Magic Drinks Kids", "Brinquedos", "Carreta Furacão"];

export default function EventsModule() {
  const { events, users, teamAssignments, addEvent, updateEvent, deleteEvent } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "timeline">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventForm>(EMPTY_FORM);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const clientUsers = users.filter((u) => u.role === "client");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7);

  const alertEvents = events.filter((e) => {
    if (e.status === "cancelled" || e.status === "completed") return false;
    const d = new Date(e.date); d.setHours(0, 0, 0, 0);
    return d >= today && d <= in7;
  });

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchService = filterService === "all" || e.service === filterService;
      const matchDate = (!dateFilter.start || e.date >= dateFilter.start) && (!dateFilter.end || e.date <= dateFilter.end);
      return matchSearch && matchService && matchDate;
    });
  }, [events, searchTerm, filterService, dateFilter]);

  const byStatus = (s: string) => filtered.filter((e) => e.status === s)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingId(null); setShowForm(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location || !formData.clientId) {
      toast.error("Preencha os campos obrigatórios"); return;
    }
    if (editingId) { updateEvent(editingId, formData); toast.success("Evento atualizado!"); }
    else { addEvent(formData); toast.success("Evento criado!"); }
    resetForm();
    setSelectedEvent(null);
  };

  const handleEdit = (ev: any) => { setFormData(ev); setEditingId(ev.id); setShowForm(true); setSelectedEvent(null); };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este evento?")) {
      deleteEvent(id);
      toast.success("Evento removido");
      setSelectedEvent(null);
    }
  };

  const handleNextStatus = (ev: any) => {
    const currIdx = SEQUENCE.indexOf(ev.status);
    if (currIdx >= 0 && currIdx < SEQUENCE.length - 1) {
      const nextStat = SEQUENCE[currIdx + 1];
      updateEvent(ev.id, { ...ev, status: nextStat });
      toast.success(`Status avançado para ${STATUS_CONFIG[nextStat as keyof typeof STATUS_CONFIG].label}`);
    }
  };

  const daysUntil = (dateStr: string) => {
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - today.getTime()) / 86400000);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm transition-all bg-white";

  const totalActive = events.filter(e => e.status !== "cancelled").length;
  const pendingCount = events.filter(e => e.status === 'pending').length;
  const confirmedCount = events.filter(e => e.status === 'confirmed').length;
  const completedCount = events.filter(e => e.status === 'completed').length;

  const EventCard = ({ ev }: { ev: any }) => {
    const client = users.find((u) => u.id === ev.clientId);
    const days = daysUntil(ev.date);
    const isUrgent = days >= 0 && days <= 3 && ev.status !== "completed" && ev.status !== "cancelled";
    const cfg = STATUS_CONFIG[ev.status as keyof typeof STATUS_CONFIG];
    const canAdvance = SEQUENCE.indexOf(ev.status) >= 0 && SEQUENCE.indexOf(ev.status) < SEQUENCE.length - 1;
    const team = teamAssignments.filter((a) => a.eventId === ev.id && a.status === "confirmed");

    return (
      <div 
        onClick={() => setSelectedEvent(ev)}
        className={`rounded-xl border p-4 ${isUrgent ? "border-amber-300 bg-amber-50" : "border-[oklch(0.92_0.02_85)] bg-white"} shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-extrabold text-[oklch(0.18_0.02_260)] text-sm leading-tight flex-1">{ev.title}</h4>
        </div>

        {client && <p className="text-xs text-[oklch(0.55_0.02_260)] mb-2 font-medium">👤 {client.name}</p>}

        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[oklch(0.45_0.02_260)]">
            <Calendar size={11} />
            <span className="font-semibold">{new Date(ev.date).toLocaleDateString("pt-BR")}</span>
            {ev.time && <><Clock size={11} className="ml-1" /><span>{ev.time}</span></>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[oklch(0.45_0.02_260)]">
            <MapPin size={11} /><span className="truncate">{ev.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[oklch(0.95_0.01_85)]">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[oklch(0.94_0.02_85)] text-[oklch(0.45_0.02_260)]">{ev.service}</span>
          <div className="flex items-center gap-1">
            {team.length > 0 && (
              <div className="flex -space-x-1.5 mr-1">
                {team.slice(0,3).map(a => {
                  const m = users.find(u => u.id === a.memberId);
                  return <div key={a.id} className="w-5 h-5 rounded-full bg-[oklch(0.9_0.02_85)] border-2 border-white flex items-center justify-center text-[8px] font-bold overflow-hidden" title={m?.name}>{m?.name?.charAt(0)}</div>
                })}
              </div>
            )}
            {canAdvance && (
              <button onClick={(e) => { e.stopPropagation(); handleNextStatus(ev); }} className="p-1 rounded-full bg-[oklch(0.97_0.01_85)] hover:bg-[oklch(0.55_0.28_340)] hover:text-white transition-colors text-[oklch(0.45_0.02_260)] ml-1" title="Avançar status">
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Progresso de Fluxo Geral */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[oklch(0.92_0.02_85)] flex items-center gap-4">
        <div className="text-sm font-extrabold text-[oklch(0.45_0.02_260)] whitespace-nowrap">Status Geral:</div>
        <div className="flex-1 flex h-3 bg-[oklch(0.97_0.01_85)] rounded-full overflow-hidden gap-0.5">
          {totalActive > 0 && (
            <>
              <div style={{ width: `\${(pendingCount / totalActive) * 100}%` }} className="bg-[oklch(0.88_0.18_85)] transition-all" title={`Pendente: \${pendingCount}`}></div>
              <div style={{ width: `\${(confirmedCount / totalActive) * 100}%` }} className="bg-[oklch(0.65_0.25_145)] transition-all" title={`Confirmado: \${confirmedCount}`}></div>
              <div style={{ width: `\${(completedCount / totalActive) * 100}%` }} className="bg-[oklch(0.55_0.22_262)] transition-all" title={`Realizado: \${completedCount}`}></div>
            </>
          )}
        </div>
        <div className="text-xs text-[oklch(0.45_0.02_260)] hidden sm:block">
           <span className="text-[oklch(0.88_0.18_85)] font-bold">{pendingCount}</span> P • <span className="text-[oklch(0.65_0.25_145)] font-bold">{confirmedCount}</span> C • <span className="text-[oklch(0.55_0.22_262)] font-bold">{completedCount}</span> R
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          📅 Agenda de Eventos
        </h2>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-[oklch(0.9_0.02_85)] rounded-xl p-1 flex">
            <button onClick={() => setViewMode("kanban")} className={`p-1.5 rounded-lg \${viewMode === 'kanban' ? 'bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]' : 'text-[oklch(0.45_0.02_260)]'}`} title="Visão Kanban"><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode("timeline")} className={`p-1.5 rounded-lg \${viewMode === 'timeline' ? 'bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]' : 'text-[oklch(0.45_0.02_260)]'}`} title="Visão Timeline"><List size={16} /></button>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(EMPTY_FORM); setSelectedEvent(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
            <Plus size={15} /> Novo Evento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap items-center bg-white p-3 rounded-2xl border border-[oklch(0.92_0.02_85)]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.98_0.01_85)] flex-1 min-w-[200px]">
          <Search size={14} className="text-[oklch(0.65_0.02_260)]" />
          <input type="text" placeholder="Buscar evento ou local..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="outline-none text-sm flex-1 bg-transparent" />
        </div>
        <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="px-3 py-1.5 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.98_0.01_85)] focus:outline-none text-sm">
          <option value="all">Todos os Serviços</option>
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter(prev => ({...prev, start: e.target.value}))} className="px-3 py-1.5 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.98_0.01_85)] text-sm outline-none" title="Data inicial" />
          <span className="text-[oklch(0.65_0.02_260)] text-xs">até</span>
          <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter(prev => ({...prev, end: e.target.value}))} className="px-3 py-1.5 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.98_0.01_85)] text-sm outline-none" title="Data final" />
        </div>
      </div>

      {/* Form modal inline */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-[oklch(0.92_0.02_85)] p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold text-[oklch(0.18_0.02_260)]">{editingId ? "Editar Evento" : "Novo Evento"}</h3>
            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-[oklch(0.97_0.01_85)] transition-colors"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Título do evento *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
            <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className={inputCls}>
              <option value="">Selecionar Cliente *</option>
              {clientUsers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputCls} />
            <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className={inputCls} />
            <input type="text" placeholder="Local do evento *" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputCls} />
            <input type="number" placeholder="Nº de pessoas" value={formData.attendees || ""} onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 0 })} className={inputCls} />
            <select value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} className={inputCls}>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input type="number" placeholder="Orçamento (R$)" value={formData.budget || ""} onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })} className={inputCls} />
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className={inputCls}>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Realizado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <textarea placeholder="Notas opcionais" value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className={`\${inputCls} resize-none`} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-105 transition-transform shadow-md text-sm">{editingId ? "Atualizar" : "Criar"}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] text-[oklch(0.45_0.02_260)] font-bold hover:bg-[oklch(0.97_0.01_85)] transition-colors text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full">
          {/* VIEW: KANBAN */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {(["pending", "confirmed", "completed", "cancelled"] as const).map((status) => {
                const cfg = STATUS_CONFIG[status];
                const cols = byStatus(status);
                const totalValue = cols.reduce((acc, ev) => acc + (ev.budget || 0), 0);
                return (
                  <div key={status} className={`rounded-2xl \${cfg.bg} border \${cfg.border} p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] flex items-center gap-2 text-sm">
                        {cfg.emoji} {cfg.label}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold \${cfg.badge}`}>
                        {cols.length}
                      </span>
                    </div>
                    {totalValue > 0 && (
                      <p className="text-[10px] font-bold text-[oklch(0.45_0.02_260)] mb-4 uppercase tracking-wider">
                        Rec. Prev: R$ {totalValue.toLocaleString('pt-BR')}
                      </p>
                    )}
                    <div className="space-y-3">
                      {cols.length === 0 ? (
                        <div className="text-center py-6 text-xs text-[oklch(0.65_0.02_260)]">Nenhum evento</div>
                      ) : (
                        cols.map((ev) => <EventCard key={ev.id} ev={ev} />)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW: TIMELINE */}
          {viewMode === "timeline" && (
            <div className="bg-white border border-[oklch(0.92_0.02_85)] rounded-3xl p-6 shadow-sm">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-[oklch(0.55_0.02_260)]">Nenhum evento corresponde aos filtros.</div>
              ) : (
                <div className="space-y-4">
                  {filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(ev => {
                    const cfg = STATUS_CONFIG[ev.status as keyof typeof STATUS_CONFIG];
                    return (
                      <div key={ev.id} onClick={() => setSelectedEvent(ev)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[oklch(0.98_0.01_85)] border border-transparent hover:border-[oklch(0.92_0.02_85)] cursor-pointer transition-all group">
                        <div className="w-16 flex flex-col items-center flex-shrink-0 text-center">
                          <span className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">{new Date(ev.date).toLocaleDateString("pt-BR", { weekday: 'short' })}</span>
                          <span className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{new Date(ev.date).getDate()}</span>
                        </div>
                        <div className="w-1 h-12 bg-[oklch(0.95_0.01_85)] rounded-full relative overflow-hidden flex-shrink-0">
                          <div className={`absolute top-0 left-0 w-full h-full \${cfg.bg.replace('bg-', 'bg-')} \${cfg.border.replace('border-', 'bg-')}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-[oklch(0.18_0.02_260)] text-sm truncate">{ev.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-[oklch(0.55_0.02_260)] mt-1">
                            {ev.time && <span className="flex items-center gap-1"><Clock size={10} /> {ev.time}</span>}
                            <span className="flex items-center gap-1 truncate"><MapPin size={10} /> {ev.location}</span>
                          </div>
                        </div>
                        <div className="hidden md:flex flex-col items-end flex-shrink-0">
                           <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold \${cfg.badge}`}>{cfg.label}</span>
                           <span className="text-[10px] text-[oklch(0.45_0.02_260)] font-bold mt-1">{ev.service}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL / PAINEL LATERAL DE DETALHES */}
        {selectedEvent && (
          <div className="lg:w-80 w-full flex-shrink-0 bg-white rounded-3xl border border-[oklch(0.92_0.02_85)] shadow-xl overflow-hidden sticky top-6">
             <div className="p-5 border-b border-[oklch(0.92_0.02_85)] flex items-start justify-between bg-[oklch(0.98_0.01_85)]">
                <div>
                  <h3 className="font-extrabold text-lg text-[oklch(0.18_0.02_260)] leading-tight mb-1">{selectedEvent.title}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold \${STATUS_CONFIG[selectedEvent.status as keyof typeof STATUS_CONFIG].badge}`}>
                    {STATUS_CONFIG[selectedEvent.status as keyof typeof STATUS_CONFIG].label}
                  </span>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-1.5 rounded-full bg-white text-[oklch(0.45_0.02_260)] shadow-sm hover:text-[oklch(0.18_0.02_260)]"><X size={14}/></button>
             </div>
             
             <div className="p-5 space-y-5">
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-[oklch(0.45_0.02_260)] mb-1">Data e Local</p>
                  <p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{new Date(selectedEvent.date).toLocaleDateString('pt-BR')} às {selectedEvent.time || 'N/A'}</p>
                  <p className="text-sm text-[oklch(0.45_0.02_260)]">{selectedEvent.location}</p>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-[oklch(0.45_0.02_260)] mb-1">Cliente</p>
                  <p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{users.find(u => u.id === selectedEvent.clientId)?.name || "Cliente excluído"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-[oklch(0.45_0.02_260)] mb-1">Serviço</p>
                    <p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{selectedEvent.service}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-[oklch(0.45_0.02_260)] mb-1">Público</p>
                    <p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{selectedEvent.attendees} pessoas</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-[oklch(0.45_0.02_260)] mb-1">Receita</p>
                    <p className="text-sm font-bold text-[oklch(0.45_0.22_340)]">R$ {selectedEvent.budget?.toLocaleString('pt-BR') || '0,00'}</p>
                  </div>
                </div>

                {selectedEvent.notes && (
                  <div>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-[oklch(0.45_0.02_260)] mb-1">Observações</p>
                    <p className="text-sm text-[oklch(0.35_0.02_260)] bg-[oklch(0.97_0.01_85)] p-3 rounded-xl">{selectedEvent.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-[oklch(0.45_0.02_260)] mb-2">Equipe Escalada</p>
                  {(() => {
                     const team = teamAssignments.filter((a) => a.eventId === selectedEvent.id);
                     if (team.length === 0) return <p className="text-xs text-[oklch(0.55_0.02_260)]">Nenhum integrante escalado.</p>;
                     return (
                       <div className="space-y-2">
                         {team.map(a => {
                           const m = users.find(u => u.id === a.memberId);
                           return (
                             <div key={a.id} className="flex items-center gap-2 bg-[oklch(0.97_0.01_85)] p-2 rounded-lg">
                               <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shadow-sm">{m?.name?.charAt(0)}</div>
                               <div>
                                 <p className="text-xs font-bold text-[oklch(0.18_0.02_260)] leading-none">{m?.name || "Desconhecido"}</p>
                                 <p className="text-[10px] text-[oklch(0.45_0.02_260)]">{a.functionLabel}</p>
                               </div>
                             </div>
                           )
                         })}
                       </div>
                     );
                  })()}
                </div>
             </div>
             
             <div className="p-4 bg-[oklch(0.98_0.01_85)] border-t border-[oklch(0.92_0.02_85)] flex gap-2">
                <button onClick={() => handleEdit(selectedEvent)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-[oklch(0.9_0.02_85)] rounded-xl text-sm font-bold text-[oklch(0.18_0.02_260)] hover:bg-[oklch(0.96_0.01_85)] transition-colors">
                  <Edit2 size={14}/> Editar
                </button>
                <button onClick={() => handleDelete(selectedEvent.id)} className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors" title="Excluir">
                  <Trash2 size={16}/>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
