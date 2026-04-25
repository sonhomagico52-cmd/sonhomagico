import React, { useMemo, useState } from "react";
import {
  BellRing, Calendar, MessageSquare, Plus, Send, Smartphone,
  Trash2, UserPlus, Users, WandSparkles, Edit2, X, Search,
  LayoutGrid, LayoutList, Mail, Phone, Settings, ShieldAlert,
  ChevronRight, CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

type TabMode = "members" | "assignments" | "messages";
type ViewMode = "table" | "cards";
type RecipientMode = "event" | "member" | "all_crew";

interface CrewFormState {
  name: string; email: string; phone: string; password: string;
  specialties: string; availability: string; appInstalled: boolean;
}

const EMPTY_CREW_FORM: CrewFormState = {
  name: "", email: "", phone: "", password: "equipe123",
  specialties: "", availability: "", appInstalled: true,
};

const AVATAR_COLORS = [
  "oklch(0.55 0.28 340)", "oklch(0.65 0.25 145)", "oklch(0.55 0.22 262)",
  "oklch(0.72 0.22 55)", "oklch(0.38 0.22 262)", "oklch(0.88 0.18 85)",
];

function Avatar({ name, size = 36, index = 0 }: { name: string; size?: number; index?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0 shadow-sm"
      style={{ width: size, height: size, backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length], fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

function toWhatsAppLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

export default function TeamManagementModule() {
  const { user, users, events, teamAssignments, crewMessages, addUser, updateUser, deleteUser, addTeamAssignment, updateTeamAssignment, deleteTeamAssignment, sendCrewMessage, deleteCrewMessage } = useAuth();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<TabMode>("members");
  
  // Membros State
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [crewForm, setCrewForm] = useState<CrewFormState>(EMPTY_CREW_FORM);
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Escalas State
  const [assignmentForm, setAssignmentForm] = useState({ eventId: "", memberId: "", functionLabel: "", status: "confirmed" as "confirmed"|"pending", notes: "" });
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  // Messages State
  const [messageForm, setMessageForm] = useState({ eventId: "", memberId: "", title: "", content: "", channel: "both" as "app"|"whatsapp"|"both" });
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("event");
  const [preparedLinks, setPreparedLinks] = useState<{ name: string; link: string }[]>([]);

  // Dados
  const crewMembers = users.filter((member) => member.role === "crew");
  const relevantEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let filteredMembers = crewMembers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.specialties || []).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );
  filteredMembers.sort((a, b) => a.name.localeCompare(b.name));

  const assignmentsByEvent = useMemo(() =>
    relevantEvents.map((event) => ({
      event,
      assignments: teamAssignments.filter((assignment) => assignment.eventId === event.id),
    })), [relevantEvents, teamAssignments]
  );

  const getMember = (id: string) => crewMembers.find((m) => m.id === id);
  const getEvent = (id?: string) => relevantEvents.find((e) => e.id === id);

  // ================== AÇÕES MEMBROS ==================
  const handleSaveCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crewForm.name || !crewForm.email || !crewForm.phone) {
      toast.error("Preencha nome, email e telefone");
      return;
    }
    const payload: any = {
      name: crewForm.name, email: crewForm.email, phone: crewForm.phone,
      role: "crew", accessLevel: "crew",
      specialties: crewForm.specialties.split(",").map((i) => i.trim()).filter(Boolean),
      availability: crewForm.availability, appInstalled: crewForm.appInstalled,
    };
    try {
      if (editingCrewId) {
        await updateUser(editingCrewId, payload);
        toast.success("Integrante atualizado");
      } else {
        const finalPassword = crewForm.password || "equipe123";
        await addUser(payload, finalPassword);
        toast.success("Integrante cadastrado");
      }
      setCrewForm(EMPTY_CREW_FORM);
      setEditingCrewId(null);
      setShowMemberForm(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar integrante");
    }
  };

  const openEditCrew = (member: any) => {
    setEditingCrewId(member.id);
    setCrewForm({
      name: member.name, email: member.email, phone: member.phone, password: "",
      specialties: member.specialties?.join(", ") || "",
      availability: member.availability || "", appInstalled: member.appInstalled ?? true,
    });
    setShowMemberForm(true);
    setSelectedMember(null);
  };

  // ================== AÇÕES ESCALAS ==================
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentForm.eventId || !assignmentForm.memberId || !assignmentForm.functionLabel) {
      toast.error("Selecione evento, integrante e função");
      return;
    }
    try {
      if (editingAssignmentId) {
        await updateTeamAssignment(editingAssignmentId, assignmentForm);
        toast.success("Escala atualizada");
      } else {
        await addTeamAssignment(assignmentForm);
        toast.success("Integrante escalado");
      }
      setAssignmentForm({ eventId: "", memberId: "", functionLabel: "", status: "confirmed", notes: "" });
      setEditingAssignmentId(null);
      setShowAssignmentForm(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar escala");
    }
  };

  // ================== AÇÕES MENSAGENS ==================
  const resolveRecipients = () => {
    if (recipientMode === "all_crew") return crewMembers;
    if (recipientMode === "member") return crewMembers.filter((m) => m.id === messageForm.memberId);
    return crewMembers.filter((m) => teamAssignments.some((a) => a.eventId === messageForm.eventId && a.memberId === m.id));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.title || !messageForm.content) { toast.error("Informe assunto e mensagem"); return; }
    if (recipientMode === "event" && !messageForm.eventId) { toast.error("Selecione um evento"); return; }
    if (recipientMode === "member" && !messageForm.memberId) { toast.error("Selecione o integrante"); return; }

    const recipients = resolveRecipients();
    if (recipients.length === 0) { toast.error("Nenhum integrante encontrado"); return; }

    try {
      await sendCrewMessage({
        authorId: user?.id || "admin-001",
        eventId: messageForm.eventId || undefined,
        recipientIds: recipients.map((m) => m.id),
        title: messageForm.title, content: messageForm.content, channel: messageForm.channel,
      });

      if (messageForm.channel === "app" || messageForm.channel === "both") {
        recipients.forEach((m) => {
          addNotification("info", messageForm.title, `${messageForm.content}${messageForm.eventId ? ` Evento: ${getEvent(messageForm.eventId)?.title || ""}` : ""}`, { recipientUserId: m.id });
        });
      }

      if (messageForm.channel === "whatsapp" || messageForm.channel === "both") {
        const text = `${messageForm.title}\n\n${messageForm.content}`;
        setPreparedLinks(recipients.map((m) => ({ name: m.name, link: toWhatsAppLink(m.phone, text) })));
      } else { setPreparedLinks([]); }

      toast.success(`Mensagem enviada para ${recipients.length} integrante(s)`);
      setMessageForm({ ...messageForm, title: "", content: "" });
    } catch(err: any) { toast.error(err.message || "Erro ao enviar mensagem"); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm transition-all";

  return (
    <div className="space-y-6">
      {/* HEADER & TABS */}
      <div className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] p-2 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-[oklch(0.97_0.01_85)] p-1 rounded-xl w-full md:w-auto">
          <button onClick={() => setActiveTab("members")} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "members" ? "bg-white text-[oklch(0.18_0.02_260)] shadow-sm" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.18_0.02_260)]"}`}>
            <Users size={16} /> Membros
          </button>
          <button onClick={() => setActiveTab("assignments")} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "assignments" ? "bg-white text-[oklch(0.18_0.02_260)] shadow-sm" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.18_0.02_260)]"}`}>
            <Calendar size={16} /> Escalas
          </button>
          <button onClick={() => setActiveTab("messages")} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "messages" ? "bg-white text-[oklch(0.18_0.02_260)] shadow-sm" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.18_0.02_260)]"}`}>
            <BellRing size={16} /> Comunicador
          </button>
        </div>
        
        {activeTab === "members" && (
          <div className="flex gap-2 w-full md:w-auto px-2 md:px-0 pb-2 md:pb-0">
            <div className="flex rounded-xl overflow-hidden border border-[oklch(0.9_0.02_85)]">
              <button onClick={() => setViewMode("table")} className={`px-3 py-2 transition-colors ${viewMode === "table" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}><LayoutList size={16} /></button>
              <button onClick={() => setViewMode("cards")} className={`px-3 py-2 transition-colors ${viewMode === "cards" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}><LayoutGrid size={16} /></button>
            </div>
            <button onClick={() => { setShowMemberForm(true); setEditingCrewId(null); setCrewForm(EMPTY_CREW_FORM); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
              <UserPlus size={15} /> Novo Integrante
            </button>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="flex w-full md:w-auto px-2 md:px-0 pb-2 md:pb-0">
             <button onClick={() => { setShowAssignmentForm(true); setEditingAssignmentId(null); setAssignmentForm({ eventId: "", memberId: "", functionLabel: "", status: "confirmed", notes: "" }); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.13_0.02_260)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
              <Plus size={15} /> Adicionar Escala
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ABA: MEMBROS */}
      {/* ========================================================= */}
      {activeTab === "members" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex gap-3 flex-wrap items-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] bg-white flex-1 min-w-[200px]">
              <Search size={16} className="text-[oklch(0.65_0.02_260)]" />
              <input type="text" placeholder="Buscar por nome, email ou especialidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="outline-none text-sm flex-1 bg-transparent" />
            </div>
            <span className="text-sm text-[oklch(0.55_0.02_260)] font-medium bg-white px-4 py-2.5 rounded-xl border border-[oklch(0.92_0.02_85)]">
              {filteredMembers.length} integrante{filteredMembers.length !== 1 ? "s" : ""}
            </span>
          </div>

          {viewMode === "table" ? (
             <div className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] overflow-hidden">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="bg-[oklch(0.97_0.01_85)] border-b border-[oklch(0.92_0.02_85)]">
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase">Integrante</th>
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase hidden md:table-cell">Especialidades</th>
                     <th className="text-center px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase">Acesso App</th>
                     <th className="px-5 py-3"></th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredMembers.length === 0 ? (
                     <tr><td colSpan={4} className="text-center py-10 text-[oklch(0.55_0.02_260)]">Nenhum integrante encontrado</td></tr>
                   ) : filteredMembers.map((member, i) => (
                     <tr key={member.id} className="border-b border-[oklch(0.95_0.01_85)] hover:bg-[oklch(0.98_0.005_85)] transition-colors cursor-pointer group" onClick={() => setSelectedMember(member)}>
                       <td className="px-5 py-3.5">
                         <div className="flex items-center gap-3">
                           <Avatar name={member.name} size={36} index={i} />
                           <div>
                             <p className="font-bold text-[oklch(0.18_0.02_260)]">{member.name}</p>
                             <p className="text-xs text-[oklch(0.55_0.02_260)]">{member.email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-5 py-3.5 hidden md:table-cell">
                         <div className="flex flex-wrap gap-1">
                           {(member.specialties && member.specialties.length > 0) ? member.specialties.map((s: string) => (
                             <span key={s} className="px-2 py-0.5 rounded-md bg-[oklch(0.95_0.02_85)] border border-[oklch(0.9_0.02_85)] text-[10px] font-bold text-[oklch(0.35_0.02_260)]">
                               {s}
                             </span>
                           )) : <span className="text-xs text-[oklch(0.65_0.02_260)]">—</span>}
                         </div>
                       </td>
                       <td className="px-5 py-3.5 text-center">
                         {member.appInstalled ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[oklch(0.65_0.25_145/0.1)] text-[oklch(0.65_0.25_145)]">
                             <CheckCircle2 size={12} /> ATIVO
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[oklch(0.95_0.01_85)] text-[oklch(0.55_0.02_260)]">
                             SEM APP
                           </span>
                         )}
                       </td>
                       <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openEditCrew(member)} className="p-1.5 rounded-lg hover:bg-[oklch(0.55_0.28_340/0.1)] transition-colors"><Edit2 size={14} className="text-[oklch(0.55_0.28_340)]" /></button>
                           <button onClick={() => { deleteUser(member.id); toast.success("Removido"); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((member, i) => (
                <div key={member.id} className="bg-white rounded-2xl shadow-sm p-5 border border-[oklch(0.92_0.02_85)] hover:shadow-md transition-all cursor-pointer group flex flex-col" onClick={() => setSelectedMember(member)}>
                  <div className="flex justify-between items-start mb-3">
                    <Avatar name={member.name} size={48} index={i} />
                    <button onClick={(e) => { e.stopPropagation(); openEditCrew(member); }} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[oklch(0.97_0.01_85)]">
                      <Edit2 size={15} className="text-[oklch(0.45_0.02_260)]" />
                    </button>
                  </div>
                  <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] truncate">{member.name}</h3>
                  <div className="text-xs text-[oklch(0.45_0.02_260)] mt-1 mb-4 space-y-1">
                     <p className="flex items-center gap-1.5"><Phone size={12}/> {member.phone}</p>
                     <p className="flex items-center gap-1.5 truncate"><Mail size={12}/> {member.email}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-[oklch(0.92_0.02_85)] flex justify-between items-center">
                    <div className="flex -space-x-1 overflow-hidden max-w-[120px]">
                      {(member.specialties || []).slice(0, 2).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-[oklch(0.97_0.01_85)] border border-[oklch(0.9_0.02_85)] text-[9px] font-bold text-[oklch(0.35_0.02_260)] truncate max-w-[60px]" title={s}>{s}</span>
                      ))}
                      {(member.specialties && member.specialties.length > 2) && <span className="px-1.5 py-0.5 rounded-md bg-[oklch(0.9_0.02_85)] text-[9px] font-bold text-[oklch(0.35_0.02_260)]">+{member.specialties.length - 2}</span>}
                    </div>
                    {member.appInstalled && <Smartphone size={14} className="text-[oklch(0.65_0.25_145)]" title="App Instalado" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA: ESCALAS */}
      {/* ========================================================= */}
      {activeTab === "assignments" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           {assignmentsByEvent.length === 0 ? (
             <div className="bg-white rounded-2xl p-10 text-center border border-[oklch(0.92_0.02_85)]">
               <Calendar size={48} className="mx-auto text-[oklch(0.85_0.02_260)] mb-4" />
               <p className="text-lg font-bold text-[oklch(0.45_0.02_260)]">Nenhum evento em andamento.</p>
               <p className="text-sm text-[oklch(0.55_0.02_260)]">Quando os eventos forem confirmados, você poderá montar as escalas aqui.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {assignmentsByEvent.map(({ event, assignments }) => {
                 const confirmedCount = assignments.filter((a) => a.status === "confirmed").length;
                 const progress = assignments.length > 0 ? (confirmedCount / assignments.length) * 100 : 0;
                 return (
                 <div key={event.id} className="bg-white rounded-2xl border border-[oklch(0.92_0.02_85)] shadow-sm overflow-hidden flex flex-col">
                   <div className="p-4 border-b border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)]">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <h3 className="font-extrabold text-[oklch(0.18_0.02_260)]">{event.title}</h3>
                         <p className="text-xs font-bold text-[oklch(0.55_0.28_340)] mt-0.5">{new Date(event.date).toLocaleDateString("pt-BR")}</p>
                       </div>
                       <div className="text-right">
                         <span className="text-xs font-bold text-[oklch(0.45_0.02_260)]">{confirmedCount}/{assignments.length} Confirmados</span>
                       </div>
                     </div>
                     <div className="h-1.5 w-full bg-[oklch(0.95_0.02_85)] rounded-full overflow-hidden">
                       <div className="h-full bg-[oklch(0.65_0.25_145)] transition-all" style={{ width: `${progress}%` }}></div>
                     </div>
                   </div>
                   
                   <div className="p-4 flex-1 space-y-2">
                     {assignments.length === 0 ? (
                       <div className="text-center py-6 text-sm text-[oklch(0.55_0.02_260)]">
                         Equipe não definida para este evento.
                       </div>
                     ) : (
                       assignments.map((assignment) => {
                         const member = getMember(assignment.memberId);
                         return (
                           <div key={assignment.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-[oklch(0.92_0.02_85)] hover:border-[oklch(0.55_0.28_340/0.3)] transition-colors group bg-white">
                             <div className={`w-2 h-2 rounded-full flex-shrink-0 ${assignment.status === 'confirmed' ? 'bg-[oklch(0.65_0.25_145)]' : 'bg-[oklch(0.88_0.18_85)]'}`} title={assignment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}></div>
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold text-[oklch(0.18_0.02_260)] truncate">{member?.name || "Desconhecido"}</p>
                               <p className="text-[10px] uppercase font-bold tracking-wide text-[oklch(0.45_0.02_260)]">{assignment.functionLabel}</p>
                             </div>
                             <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => {
                                 setEditingAssignmentId(assignment.id);
                                 setAssignmentForm({ eventId: assignment.eventId, memberId: assignment.memberId, functionLabel: assignment.functionLabel, status: assignment.status, notes: assignment.notes || "" });
                                 setShowAssignmentForm(true);
                               }} className="p-1.5 text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.55_0.28_340)]"><Edit2 size={14}/></button>
                               <button onClick={() => deleteTeamAssignment(assignment.id)} className="p-1.5 text-[oklch(0.45_0.02_260)] hover:text-red-500"><Trash2 size={14}/></button>
                             </div>
                           </div>
                         );
                       })
                     )}
                   </div>
                   <div className="p-3 border-t border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)]">
                     <button onClick={() => { setShowAssignmentForm(true); setEditingAssignmentId(null); setAssignmentForm({ ...EMPTY_ASSIGNMENT_FORM, eventId: event.id }); }} className="w-full py-2 flex justify-center items-center gap-2 text-xs font-bold text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.18_0.02_260)] hover:bg-[oklch(0.95_0.02_85)] rounded-lg transition-colors">
                       <Plus size={14} /> Adicionar na Escala
                     </button>
                   </div>
                 </div>
               )})}
             </div>
           )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA: COMUNICADOR */}
      {/* ========================================================= */}
      {activeTab === "messages" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-6 md:p-8 flex flex-col h-full">
             <div className="mb-6">
               <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)] mb-1">Disparador de Mensagens</h2>
               <p className="text-sm text-[oklch(0.45_0.02_260)]">Notifique a equipe pelo app e crie roteiros para o WhatsApp instantaneamente.</p>
             </div>
             
             <form onSubmit={handleSendMessage} className="space-y-5 flex-1 flex flex-col">
               <div className="bg-[oklch(0.97_0.01_85)] p-1 rounded-xl flex overflow-x-auto hide-scrollbar">
                 <button type="button" onClick={() => setRecipientMode("event")} className={`flex-1 min-w-max px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${recipientMode === "event" ? "bg-white text-[oklch(0.18_0.02_260)] shadow-sm" : "text-[oklch(0.45_0.02_260)]"}`}>Para Escala do Evento</button>
                 <button type="button" onClick={() => setRecipientMode("member")} className={`flex-1 min-w-max px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${recipientMode === "member" ? "bg-white text-[oklch(0.18_0.02_260)] shadow-sm" : "text-[oklch(0.45_0.02_260)]"}`}>Para Integrante</button>
                 <button type="button" onClick={() => setRecipientMode("all_crew")} className={`flex-1 min-w-max px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${recipientMode === "all_crew" ? "bg-white text-[oklch(0.18_0.02_260)] shadow-sm" : "text-[oklch(0.45_0.02_260)]"}`}>Para Toda Equipe</button>
               </div>

               {(recipientMode === "event" || recipientMode === "member") && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {recipientMode === "event" ? (
                     <select value={messageForm.eventId} onChange={(e) => setMessageForm({ ...messageForm, eventId: e.target.value })} className={inputCls}>
                       <option value="">Selecione o Evento</option>
                       {relevantEvents.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                     </select>
                   ) : (
                     <select value={messageForm.memberId} onChange={(e) => setMessageForm({ ...messageForm, memberId: e.target.value })} className={inputCls}>
                       <option value="">Selecione o Integrante</option>
                       {crewMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                     </select>
                   )}
                   <select value={messageForm.channel} onChange={(e) => setMessageForm({ ...messageForm, channel: e.target.value as any })} className={inputCls}>
                     <option value="both">Enviar via App + WhatsApp</option>
                     <option value="app">Somente Push App</option>
                     <option value="whatsapp">Somente Preparar WhatsApp</option>
                   </select>
                 </div>
               )}

               <div className="flex-1 flex flex-col gap-4">
                 <input value={messageForm.title} onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })} placeholder="Título/Assunto da mensagem..." className={inputCls} />
                 <textarea value={messageForm.content} onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })} placeholder="Escreva os detalhes, orientações operacionais, etc..." className={`${inputCls} flex-1 min-h-[150px] resize-none`} />
               </div>

               <div className="flex flex-col sm:flex-row gap-3 pt-2">
                 <button type="submit" className="flex-1 py-3.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md">
                   <Send size={18} /> Processar Envio
                 </button>
                 <button type="button" onClick={async () => {
                     try { await navigator.clipboard.writeText(`${messageForm.title}\n\n${messageForm.content}`); toast.success("Copiado!"); } 
                     catch { toast.error("Falha ao copiar"); }
                   }} className="py-3.5 px-6 rounded-xl border border-[oklch(0.9_0.02_85)] font-bold text-[oklch(0.18_0.02_260)] flex items-center justify-center gap-2 hover:bg-[oklch(0.97_0.01_85)] transition-colors">
                   <WandSparkles size={18} /> Copiar Texto
                 </button>
               </div>
             </form>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-5">
              <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 flex items-center gap-2">
                 <Smartphone size={16} className="text-[oklch(0.65_0.25_145)]"/> Fila do WhatsApp
              </h3>
              {preparedLinks.length === 0 ? (
                <div className="text-center py-6 px-4 bg-[oklch(0.97_0.01_85)] rounded-2xl border border-dashed border-[oklch(0.9_0.02_85)]">
                   <p className="text-xs text-[oklch(0.55_0.02_260)]">Links aparecerão aqui após processar o envio na opção WhatsApp.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                  {preparedLinks.map((item, i) => (
                    <a key={i} href={item.link} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-[oklch(0.92_0.02_85)] hover:border-[oklch(0.65_0.25_145)] hover:bg-[oklch(0.65_0.25_145/0.05)] transition-all group">
                      <span className="text-sm font-bold text-[oklch(0.18_0.02_260)]">{item.name}</span>
                      <ChevronRight size={14} className="text-[oklch(0.65_0.25_145)] opacity-50 group-hover:opacity-100 transition-opacity"/>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-5 flex-1 flex flex-col">
               <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 flex items-center gap-2">
                 <MessageSquare size={16} className="text-[oklch(0.55_0.28_340)]"/> Histórico
               </h3>
               <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 space-y-3 custom-scrollbar">
                 {crewMessages.length === 0 ? (
                    <p className="text-xs text-center text-[oklch(0.55_0.02_260)] py-4">Nenhuma mensagem registrada.</p>
                 ) : (
                   [...crewMessages].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((msg) => (
                     <div key={msg.id} className="p-3 rounded-xl border border-[oklch(0.92_0.02_85)] relative group">
                        <button onClick={() => deleteCrewMessage(msg.id)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-white shadow-sm border border-[oklch(0.92_0.02_85)] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                          <Trash2 size={12}/>
                        </button>
                        <p className="font-bold text-sm text-[oklch(0.18_0.02_260)] pr-6">{msg.title}</p>
                        <p className="text-[10px] font-bold text-[oklch(0.45_0.02_260)] uppercase mt-1 mb-2">
                          {new Date(msg.createdAt).toLocaleDateString("pt-BR")} • {msg.channel}
                        </p>
                        <p className="text-xs text-[oklch(0.35_0.02_260)] line-clamp-2">{msg.content}</p>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OVER: MEMBER FORM */}
      {/* ========================================================= */}
      {showMemberForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowMemberForm(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[oklch(0.92_0.02_85)] flex items-center justify-between">
               <div>
                 <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{editingCrewId ? "Editar Integrante" : "Novo Integrante"}</h2>
                 <p className="text-sm text-[oklch(0.45_0.02_260)]">Preencha os dados operacionais.</p>
               </div>
               <button onClick={() => setShowMemberForm(false)} className="p-2 rounded-xl hover:bg-[oklch(0.97_0.01_85)] transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveCrew} className="flex-1 overflow-y-auto p-6 space-y-4">
               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Nome Completo *</label>
                 <input value={crewForm.name} onChange={(e) => setCrewForm({...crewForm, name: e.target.value})} className={inputCls} placeholder="Ex: João Silva" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 sm:col-span-1">
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">WhatsApp *</label>
                   <input value={crewForm.phone} onChange={(e) => setCrewForm({...crewForm, phone: e.target.value})} className={inputCls} placeholder="(00) 00000-0000" />
                 </div>
                 <div className="col-span-2 sm:col-span-1">
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Senha de Acesso</label>
                   <input value={crewForm.password} onChange={(e) => setCrewForm({...crewForm, password: e.target.value})} className={inputCls} placeholder={editingCrewId ? "Inalterada" : "equipe123"} />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">E-mail *</label>
                 <input value={crewForm.email} onChange={(e) => setCrewForm({...crewForm, email: e.target.value})} className={inputCls} placeholder="email@exemplo.com" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Especialidades (Vírgula)</label>
                 <input value={crewForm.specialties} onChange={(e) => setCrewForm({...crewForm, specialties: e.target.value})} className={inputCls} placeholder="Ex: Fotografia, Edição, Som" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Disponibilidade / Observações</label>
                 <textarea value={crewForm.availability} onChange={(e) => setCrewForm({...crewForm, availability: e.target.value})} className={`${inputCls} resize-none`} rows={3} placeholder="Anotações internas..." />
               </div>
               
               <label className="flex items-center gap-3 p-4 rounded-xl border border-[oklch(0.92_0.02_85)] hover:bg-[oklch(0.98_0.005_85)] cursor-pointer transition-colors mt-2">
                 <input type="checkbox" checked={crewForm.appInstalled} onChange={(e) => setCrewForm({...crewForm, appInstalled: e.target.checked})} className="w-4 h-4 accent-[oklch(0.55_0.28_340)]" />
                 <div>
                   <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">App Instalado no Celular</p>
                   <p className="text-xs text-[oklch(0.45_0.02_260)]">Permite receber notificações Push operacionais</p>
                 </div>
               </label>
            </form>

            <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3">
               <button type="button" onClick={() => setShowMemberForm(false)} className="px-6 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] font-bold text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)] transition-colors">Cancelar</button>
               <button onClick={handleSaveCrew} className="flex-1 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform">
                 {editingCrewId ? "Salvar Alterações" : "Cadastrar Integrante"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OVER: ASSIGNMENT FORM */}
      {/* ========================================================= */}
      {showAssignmentForm && (
         <div className="fixed inset-0 z-50 flex">
           <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowAssignmentForm(false)} />
           <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-[oklch(0.92_0.02_85)] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{editingAssignmentId ? "Editar Escala" : "Nova Escala"}</h2>
                  <p className="text-sm text-[oklch(0.45_0.02_260)]">Atribua funções no evento.</p>
                </div>
                <button onClick={() => setShowAssignmentForm(false)} className="p-2 rounded-xl hover:bg-[oklch(0.97_0.01_85)] transition-colors"><X size={20}/></button>
             </div>
             
             <form onSubmit={handleSaveAssignment} className="flex-1 p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Evento *</label>
                  <select value={assignmentForm.eventId} onChange={(e) => setAssignmentForm({...assignmentForm, eventId: e.target.value})} className={inputCls}>
                    <option value="">Selecione...</option>
                    {relevantEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title} ({new Date(ev.date).toLocaleDateString()})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Integrante *</label>
                  <select value={assignmentForm.memberId} onChange={(e) => setAssignmentForm({...assignmentForm, memberId: e.target.value})} className={inputCls}>
                    <option value="">Selecione...</option>
                    {crewMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Função / Cargo *</label>
                  <input value={assignmentForm.functionLabel} onChange={(e) => setAssignmentForm({...assignmentForm, functionLabel: e.target.value})} placeholder="Ex: Fotógrafo Principal" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Status da Confirmação</label>
                  <select value={assignmentForm.status} onChange={(e) => setAssignmentForm({...assignmentForm, status: e.target.value as any})} className={inputCls}>
                    <option value="confirmed">Confirmado (Ativo)</option>
                    <option value="pending">Pendente (Aguardando)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Observações Operacionais</label>
                  <textarea value={assignmentForm.notes} onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})} rows={3} className={`${inputCls} resize-none`} placeholder="Detalhes extras..." />
                </div>
             </form>
             
             <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3">
                <button type="button" onClick={() => setShowAssignmentForm(false)} className="px-5 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] font-bold text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)] transition-colors">Cancelar</button>
                <button onClick={handleSaveAssignment} className="flex-1 py-3 rounded-xl bg-[oklch(0.13_0.02_260)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform">
                  {editingAssignmentId ? "Atualizar" : "Escalar"}
                </button>
             </div>
           </div>
         </div>
       )}

      {/* ========================================================= */}
      {/* SLIDE-OVER: VIEW MEMBER DETAILS (Like ClientsModule) */}
      {/* ========================================================= */}
      {selectedMember && !showMemberForm && (
        <div className="fixed inset-0 z-50 flex">
           <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedMember(null)} />
           <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase tracking-wider">Ficha Operacional</span>
                  <button onClick={() => setSelectedMember(null)} className="p-2 rounded-xl hover:bg-[oklch(0.92_0.02_85)] transition-colors"><X size={18} /></button>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar name={selectedMember.name} size={64} index={crewMembers.findIndex((c) => c.id === selectedMember.id)} />
                  <div>
                    <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{selectedMember.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedMember.appInstalled ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[oklch(0.65_0.25_145)] bg-[oklch(0.65_0.25_145/0.1)] px-2 py-0.5 rounded-md"><CheckCircle2 size={12}/> App Ativo</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-[oklch(0.55_0.02_260)] bg-[oklch(0.95_0.01_85)] px-2 py-0.5 rounded-md"><ShieldAlert size={12}/> App Pendente</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5 flex-1">
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[oklch(0.55_0.28_340/0.1)] flex items-center justify-center flex-shrink-0"><Mail size={16} className="text-[oklch(0.55_0.28_340)]" /></div>
                      <div><p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase">Email</p><p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{selectedMember.email}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[oklch(0.55_0.28_340/0.1)] flex items-center justify-center flex-shrink-0"><Phone size={16} className="text-[oklch(0.55_0.28_340)]" /></div>
                      <div><p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase">WhatsApp</p><p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{selectedMember.phone}</p></div>
                    </div>
                 </div>

                 {selectedMember.specialties && selectedMember.specialties.length > 0 && (
                   <div>
                     <p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase mb-2">Especialidades</p>
                     <div className="flex flex-wrap gap-2">
                       {selectedMember.specialties.map((s: string) => <span key={s} className="px-3 py-1 rounded-lg bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)] text-xs font-bold text-[oklch(0.35_0.02_260)]">{s}</span>)}
                     </div>
                   </div>
                 )}

                 {selectedMember.availability && (
                   <div className="p-4 rounded-xl bg-[oklch(0.99_0.005_85)] border border-[oklch(0.92_0.02_85)]">
                     <p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase mb-1">Disponibilidade / Observações</p>
                     <p className="text-sm text-[oklch(0.35_0.02_260)] whitespace-pre-wrap">{selectedMember.availability}</p>
                   </div>
                 )}

                 <div>
                   <p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase mb-3 flex items-center gap-2"><Calendar size={14}/> Eventos Escalados</p>
                   {teamAssignments.filter((a) => a.memberId === selectedMember.id).length === 0 ? (
                     <p className="text-sm text-[oklch(0.55_0.02_260)]">Sem escalas ativas no momento.</p>
                   ) : (
                     <div className="space-y-2">
                       {teamAssignments.filter((a) => a.memberId === selectedMember.id).map((a) => {
                         const ev = getEvent(a.eventId);
                         if (!ev) return null;
                         return (
                           <div key={a.id} className="p-3 rounded-xl border border-[oklch(0.92_0.02_85)] bg-white flex justify-between items-center">
                              <div>
                                <p className="font-bold text-sm text-[oklch(0.18_0.02_260)] truncate">{ev.title}</p>
                                <p className="text-[10px] uppercase font-bold text-[oklch(0.45_0.02_260)]">{new Date(ev.date).toLocaleDateString()} • {a.functionLabel}</p>
                              </div>
                              <span className={`w-2.5 h-2.5 rounded-full ${a.status === 'confirmed' ? 'bg-[oklch(0.65_0.25_145)]' : 'bg-[oklch(0.88_0.18_85)]'}`} title={a.status}></span>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>
              </div>

              <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3 bg-[oklch(0.99_0.005_85)]">
                 <button onClick={() => openEditCrew(selectedMember)} className="flex-1 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform">Editar</button>
                 <button onClick={() => { deleteUser(selectedMember.id); setSelectedMember(null); toast.success("Integrante removido"); }} className="px-5 py-3 rounded-xl border border-red-200 text-red-400 font-bold hover:bg-red-50 transition-colors"><Trash2 size={18}/></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
