import React, { useState, useMemo } from "react";
import {
  Plus, Trash2, Edit2, Search, Calendar, Clock, MapPin, Users,
  X, AlertTriangle, ArrowRight, LayoutGrid, List, FileText, CheckCircle
} from "lucide-react";
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
  pending: { label: "Pendente", emoji: "⏳", bg: "bg-[oklch(0.98_0.02_85)]", border: "border-[oklch(0.85_0.12_85)]", badge: "bg-[oklch(0.88_0.18_85)] text-[oklch(0.35_0.08_85)]", dot: "oklch(0.88 0.18 85)" },
  confirmed: { label: "Confirmado", emoji: "✅", bg: "bg-[oklch(0.98_0.01_145)]", border: "border-[oklch(0.82_0.14_145)]", badge: "bg-[oklch(0.65_0.25_145)] text-white", dot: "oklch(0.65 0.25 145)" },
  completed: { label: "Realizado", emoji: "🎉", bg: "bg-[oklch(0.98_0.01_262)]", border: "border-[oklch(0.82_0.10_262)]", badge: "bg-[oklch(0.55_0.22_262)] text-white", dot: "oklch(0.55 0.22 262)" },
  cancelled: { label: "Cancelado", emoji: "❌", bg: "bg-[oklch(0.98_0.005_260)]", border: "border-[oklch(0.88_0.02_260)]", badge: "bg-[oklch(0.88_0.02_260)] text-[oklch(0.35_0.02_260)]", dot: "oklch(0.88 0.02 260)" },
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
    else { addEvent(formData); toast.success("Evento criado com sucesso!"); }
    resetForm();
    setSelectedEvent(null);
  };

  const openEditForm = (ev: any) => { setFormData(ev); setEditingId(ev.id); setShowForm(true); setSelectedEvent(null); };
  
  const openDetails = (ev: any) => { setSelectedEvent(ev); setShowForm(false); };

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
      toast.success(`Status avançado para \${STATUS_CONFIG[nextStat as keyof typeof STATUS_CONFIG].label}`);
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
        onClick={() => openDetails(ev)}
        className={`rounded-2xl border p-5 ${isUrgent ? "border-amber-300 bg-amber-50/50" : "border-[oklch(0.92_0.02_85)] bg-white"} shadow-sm hover:shadow-md transition-all cursor-pointer relative group`}
      >
        {isUrgent && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500 m-3 animate-pulse"></div>}
        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: cfg.dot }}></div>
        
        <div className="flex items-start justify-between gap-2 mb-2 ml-1">
          <h4 className="font-extrabold text-[oklch(0.18_0.02_260)] text-sm leading-tight flex-1 line-clamp-2">{ev.title}</h4>
        </div>

        {client && <p className="text-xs text-[oklch(0.45_0.02_260)] mb-3 font-bold ml-1 truncate">👤 {client.name}</p>}

        <div className="space-y-2 mb-4 ml-1">
          <div className="flex items-center gap-2 text-xs text-[oklch(0.45_0.02_260)] bg-[oklch(0.98_0.005_85)] p-1.5 rounded-lg border border-[oklch(0.95_0.01_85)]">
            <Calendar size={13} className="text-[oklch(0.55_0.28_340)]" />
            <span className="font-extrabold text-[oklch(0.35_0.02_260)]">{new Date(ev.date).toLocaleDateString("pt-BR")}</span>
            {ev.time && <><Clock size={12} className="ml-1 opacity-60" /><span>{ev.time}</span></>}
          </div>
          <div className="flex items-center gap-2 text-xs text-[oklch(0.45_0.02_260)]">
            <MapPin size={13} className="opacity-60 flex-shrink-0" /><span className="truncate">{ev.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[oklch(0.95_0.01_85)] ml-1">
          <span className="text-[9px] px-2 py-0.5 rounded-md font-extrabold bg-[oklch(0.94_0.02_85)] text-[oklch(0.45_0.02_260)] uppercase">{ev.service}</span>
          <div className="flex items-center gap-1">
            {team.length > 0 && (
              <div className="flex -space-x-1.5 mr-1">
                {team.slice(0,3).map(a => {
                  const m = users.find(u => u.id === a.memberId);
                  return <div key={a.id} className="w-6 h-6 rounded-full bg-[oklch(0.9_0.02_85)] border-2 border-white flex items-center justify-center text-[9px] font-extrabold overflow-hidden text-[oklch(0.35_0.02_260)]" title={m?.name}>{m?.name?.charAt(0)}</div>
                })}
              </div>
            )}
            {canAdvance && (
              <button onClick={(e) => { e.stopPropagation(); handleNextStatus(ev); }} className="p-1.5 rounded-full bg-[oklch(0.97_0.01_85)] hover:bg-[oklch(0.55_0.28_340)] hover:text-white transition-colors text-[oklch(0.45_0.02_260)] ml-1" title="Avançar status">
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      {/* Progresso de Fluxo Geral */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[oklch(0.92_0.02_85)] flex items-center gap-4">
        <div className="text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase tracking-wider whitespace-nowrap">Status Geral do Mês</div>
        <div className="flex-1 flex h-2.5 bg-[oklch(0.97_0.01_85)] rounded-full overflow-hidden gap-1">
          {totalActive > 0 && (
            <>
              <div style={{ width: `\${(pendingCount / totalActive) * 100}%` }} className="bg-[oklch(0.88_0.18_85)] transition-all" title={`Pendente: \${pendingCount}`}></div>
              <div style={{ width: `\${(confirmedCount / totalActive) * 100}%` }} className="bg-[oklch(0.65_0.25_145)] transition-all" title={`Confirmado: \${confirmedCount}`}></div>
              <div style={{ width: `\${(completedCount / totalActive) * 100}%` }} className="bg-[oklch(0.55_0.22_262)] transition-all" title={`Realizado: \${completedCount}`}></div>
            </>
          )}
        </div>
        <div className="text-xs text-[oklch(0.45_0.02_260)] hidden sm:flex gap-3">
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[oklch(0.88_0.18_85)]"></span> <span className="font-extrabold">{pendingCount}</span> Pen</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[oklch(0.65_0.25_145)]"></span> <span className="font-extrabold">{confirmedCount}</span> Conf</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[oklch(0.55_0.22_262)]"></span> <span className="font-extrabold">{completedCount}</span> Realiz</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          📅 Agenda de Eventos
        </h2>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-[oklch(0.9_0.02_85)] rounded-xl p-1 flex">
            <button onClick={() => setViewMode("kanban")} className={`p-1.5 rounded-lg \${viewMode === 'kanban' ? 'bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]' : 'text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.99_0.005_85)]'}`} title="Visão Kanban"><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode("timeline")} className={`p-1.5 rounded-lg \${viewMode === 'timeline' ? 'bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]' : 'text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.99_0.005_85)]'}`} title="Visão Timeline"><List size={16} /></button>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData(EMPTY_FORM); setSelectedEvent(null); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-105 transition-transform text-sm shadow-md">
            <Plus size={16} /> Novo Evento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap items-center bg-white p-4 rounded-2xl border border-[oklch(0.92_0.02_85)] shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.99_0.005_85)] flex-1 min-w-[200px]">
          <Search size={16} className="text-[oklch(0.65_0.02_260)]" />
          <input type="text" placeholder="Buscar evento ou local..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="outline-none text-sm flex-1 bg-transparent" />
        </div>
        <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.99_0.005_85)] focus:outline-none text-sm font-medium">
          <option value="all">Todos os Serviços</option>
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-2 border border-[oklch(0.9_0.02_85)] bg-[oklch(0.99_0.005_85)] px-2 py-1.5 rounded-xl">
          <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter(prev => ({...prev, start: e.target.value}))} className="bg-transparent text-sm outline-none px-2 text-[oklch(0.35_0.02_260)] font-medium" title="Data inicial" />
          <span className="text-[oklch(0.65_0.02_260)] text-xs font-extrabold">até</span>
          <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter(prev => ({...prev, end: e.target.value}))} className="bg-transparent text-sm outline-none px-2 text-[oklch(0.35_0.02_260)] font-medium" title="Data final" />
        </div>
      </div>

      {/* VISUALIZAÇÃO KANBAN/TIMELINE */}
      <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
         {viewMode === "kanban" ? (
           <div className="flex flex-col lg:flex-row gap-6 items-start h-full">
             {SEQUENCE.map((status) => {
               const evs = byStatus(status);
               const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
               return (
                 <div key={status} className={`flex-1 min-w-[280px] w-full lg:w-1/3 rounded-3xl border \${cfg.border} \${cfg.bg} p-4 flex flex-col h-full`}>
                   <div className="flex items-center justify-between mb-4 px-2">
                     <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] uppercase tracking-wider text-xs flex items-center gap-2">
                       {cfg.emoji} {cfg.label}
                     </h3>
                     <span className="text-xs font-bold text-[oklch(0.45_0.02_260)] bg-white px-2 py-0.5 rounded-md border border-[oklch(0.9_0.02_85)]">{evs.length}</span>
                   </div>
                   <div className="space-y-3 flex-1 overflow-y-auto pr-1 pb-10">
                     {evs.length === 0 ? (
                       <div className="h-24 border-2 border-dashed border-[oklch(0.9_0.02_85)] rounded-2xl flex items-center justify-center text-xs font-medium text-[oklch(0.55_0.02_260)]">
                         Vazio
                       </div>
                     ) : evs.map((e) => <EventCard key={e.id} ev={e} />)}
                   </div>
                 </div>
               );
             })}
           </div>
         ) : (
           <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-6 overflow-x-auto">
             <table className="w-full text-sm">
               <thead>
                 <tr className="border-b border-[oklch(0.92_0.02_85)] text-left text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase tracking-wider">
                   <th className="pb-4 pl-4">Data/Hora</th>
                   <th className="pb-4">Evento</th>
                   <th className="pb-4">Cliente / Local</th>
                   <th className="pb-4">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[oklch(0.95_0.01_85)]">
                 {filtered.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(e => {
                   const cfg = STATUS_CONFIG[e.status as keyof typeof STATUS_CONFIG];
                   const client = users.find(u => u.id === e.clientId);
                   return (
                     <tr key={e.id} className="hover:bg-[oklch(0.98_0.005_85)] transition-colors cursor-pointer" onClick={() => openDetails(e)}>
                       <td className="py-4 pl-4">
                         <div className="font-extrabold text-[oklch(0.18_0.02_260)]">{new Date(e.date).toLocaleDateString("pt-BR")}</div>
                         <div className="text-xs text-[oklch(0.55_0.02_260)]">{e.time || "A definir"}</div>
                       </td>
                       <td className="py-4">
                         <div className="font-extrabold text-[oklch(0.18_0.02_260)]">{e.title}</div>
                         <div className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[oklch(0.95_0.01_85)] text-[oklch(0.45_0.02_260)] rounded-md inline-block mt-1">{e.service}</div>
                       </td>
                       <td className="py-4">
                         <div className="font-medium text-[oklch(0.18_0.02_260)] text-sm">{client?.name || "Desconhecido"}</div>
                         <div className="text-xs text-[oklch(0.55_0.02_260)] max-w-xs truncate">{e.location}</div>
                       </td>
                       <td className="py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase \${cfg.badge}`}>
                           {cfg.emoji} {cfg.label}
                         </span>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
         )}
      </div>

      {/* ========================================================= */}
      {/* SLIDE-OVER: CRIAR / EDITAR EVENTO */}
      {/* ========================================================= */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[oklch(0.92_0.02_85)] flex items-center justify-between bg-[oklch(0.99_0.005_85)]">
               <div>
                 <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{editingId ? "Editar Evento" : "Novo Evento"}</h2>
                 <p className="text-sm text-[oklch(0.45_0.02_260)]">Preencha os detalhes da festa.</p>
               </div>
               <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[oklch(0.92_0.02_85)] transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Título do Evento *</label>
                 <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={inputCls} placeholder="Ex: Aniversário da Júlia" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Cliente Solicitante *</label>
                 <select value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} className={inputCls}>
                    <option value="">-- Selecione o Cliente --</option>
                    {clientUsers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Data *</label>
                   <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={inputCls} />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Horário *</label>
                   <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className={inputCls} />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Local / Endereço *</label>
                 <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className={inputCls} placeholder="Salão de Festas X..." />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Tipo de Serviço</label>
                   <select value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} className={inputCls}>
                     {SERVICES.map((s) => <option key={s}>{s}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Orçamento (R$)</label>
                   <input type="number" value={formData.budget || ""} onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})} className={inputCls} placeholder="0.00" />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Status</label>
                   <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className={inputCls}>
                     {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                       <option key={k} value={k}>{v.label}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Nº Pessoas (Aprox)</label>
                   <input type="number" value={formData.attendees || ""} onChange={(e) => setFormData({...formData, attendees: parseInt(e.target.value) || 0})} className={inputCls} placeholder="Qtd" />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Notas / Observações Operacionais</label>
                 <textarea rows={3} value={formData.notes || ""} onChange={(e) => setFormData({...formData, notes: e.target.value})} className={`${inputCls} resize-none`} placeholder="Temática específica, restrições..." />
               </div>
            </div>

            <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3">
               <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] font-bold text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)] transition-colors">Cancelar</button>
               <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                 {editingId ? "Atualizar Evento" : "Salvar Evento"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OVER: FICHA DO EVENTO (VIEW) */}
      {/* ========================================================= */}
      {selectedEvent && !showForm && (
        <div className="fixed inset-0 z-50 flex">
           <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
           <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: STATUS_CONFIG[selectedEvent.status as keyof typeof STATUS_CONFIG].dot }}></div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase tracking-wider">Ficha Operacional</span>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 rounded-xl hover:bg-[oklch(0.92_0.02_85)] transition-colors"><X size={18} /></button>
                </div>
                
                <h3 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)] leading-tight">{selectedEvent.title}</h3>
                <div className="mt-3 flex items-center gap-2">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase \${STATUS_CONFIG[selectedEvent.status as keyof typeof STATUS_CONFIG].badge}`}>
                     {STATUS_CONFIG[selectedEvent.status as keyof typeof STATUS_CONFIG].emoji} {STATUS_CONFIG[selectedEvent.status as keyof typeof STATUS_CONFIG].label}
                   </span>
                   <span className="px-3 py-1 bg-white border border-[oklch(0.92_0.02_85)] rounded-full text-[11px] font-extrabold uppercase text-[oklch(0.45_0.02_260)]">
                      {selectedEvent.service}
                   </span>
                </div>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                 {/* Box de Info */}
                 <div className="p-5 rounded-2xl bg-[oklch(0.98_0.005_85)] border border-[oklch(0.92_0.02_85)] space-y-4">
                    <div className="flex items-start gap-4 border-b border-[oklch(0.92_0.02_85)] pb-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-[oklch(0.9_0.02_85)] flex items-center justify-center flex-shrink-0"><Calendar size={18} className="text-[oklch(0.55_0.28_340)]" /></div>
                       <div>
                         <p className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">Data e Horário</p>
                         <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{new Date(selectedEvent.date).toLocaleDateString("pt-BR")} às {selectedEvent.time || "--:--"}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 border-b border-[oklch(0.92_0.02_85)] pb-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-[oklch(0.9_0.02_85)] flex items-center justify-center flex-shrink-0"><MapPin size={18} className="text-[oklch(0.65_0.25_145)]" /></div>
                       <div>
                         <p className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">Local</p>
                         <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{selectedEvent.location}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-[oklch(0.9_0.02_85)] flex items-center justify-center flex-shrink-0"><Users size={18} className="text-[oklch(0.55_0.22_262)]" /></div>
                       <div>
                         <p className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">Cliente Contratante</p>
                         <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{users.find(u => u.id === selectedEvent.clientId)?.name}</p>
                       </div>
                    </div>
                 </div>

                 {/* Equipe Alocada Preview */}
                 <div>
                    <h4 className="text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase mb-3">Equipe Alocada ({teamAssignments.filter(a => a.eventId === selectedEvent.id && a.status === "confirmed").length})</h4>
                    <div className="flex gap-2 flex-wrap">
                       {teamAssignments.filter(a => a.eventId === selectedEvent.id && a.status === "confirmed").map(a => {
                          const m = users.find(u => u.id === a.memberId);
                          return (
                             <div key={a.id} className="px-3 py-1.5 rounded-lg bg-[oklch(0.95_0.01_85)] text-[oklch(0.35_0.02_260)] text-xs font-bold border border-[oklch(0.9_0.02_85)]">
                               {m?.name || "Desconhecido"}
                             </div>
                          )
                       })}
                       {teamAssignments.filter(a => a.eventId === selectedEvent.id && a.status === "confirmed").length === 0 && (
                          <p className="text-xs text-[oklch(0.55_0.02_260)]">Nenhum integrante confirmado ainda. Acesse a aba "Equipes" para escalar.</p>
                       )}
                    </div>
                 </div>

                 {/* Observações */}
                 {selectedEvent.notes && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                       <h4 className="text-[10px] font-extrabold text-amber-700 uppercase mb-1">Notas / Restrições</h4>
                       <p className="text-sm text-amber-900 leading-relaxed">{selectedEvent.notes}</p>
                    </div>
                 )}

              </div>

              <div className="p-6 border-t border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)] flex gap-3">
                 <button onClick={() => openEditForm(selectedEvent)} className="flex-1 py-3 rounded-xl bg-[oklch(0.18_0.02_260)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                    <Edit2 size={16}/> Editar Evento
                 </button>
                 <button onClick={() => handleDelete(selectedEvent.id)} className="px-4 py-3 rounded-xl border border-red-200 text-red-400 font-bold hover:bg-red-50 transition-colors">
                    <Trash2 size={18}/>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
