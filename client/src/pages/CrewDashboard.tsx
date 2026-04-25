import { useState } from "react";
import { LogOut, MessageSquare, ShieldCheck, Smartphone, Users, Calendar, Home, MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationsPanel from "@/components/NotificationsPanel";
import { toast } from "sonner";
import { requestNotificationPermission, sendLocalNotification } from "@/lib/notifications";

type AppTab = "home" | "schedule" | "messages";

export default function CrewDashboard() {
  const { user, logout, events, teamAssignments, crewMessages, updateTeamAssignment } = useAuth();
  const { unreadCount } = useNotifications();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AppTab>("home");

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (user.role === "admin") {
    setLocation("/admin");
    return null;
  }

  if (user.role === "client") {
    setLocation("/dashboard");
    return null;
  }

  const myAssignments = teamAssignments
    .filter((assignment) => assignment.memberId === user.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const myEvents = myAssignments
    .map((assignment) => ({
      assignment,
      event: events.find((event) => event.id === assignment.eventId),
    }))
    .filter((item) => item.event);

  const pendingEvents = myEvents.filter(e => e.assignment.status === "pending");
  const confirmedEvents = myEvents.filter(e => e.assignment.status === "confirmed");

  const myMessages = crewMessages
    .filter((message) => message.recipientIds.includes(user.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleLogout = () => {
    logout();
    setLocation("/");
    toast.success("Logout realizado com sucesso");
  };

  const handleConfirmAssignment = (assignmentId: string) => {
    updateTeamAssignment(assignmentId, { status: "confirmed" });
    toast.success("Presença confirmada! Bom evento!");
  };

  const enablePush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendLocalNotification("Notificações Ativadas!", { body: "O App agora enviará alertas no seu aparelho." });
      toast.success("Alertas ativados!");
    } else {
      toast.error("Permissão negada. Ative nas configurações do navegador/celular.");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[oklch(0.98_0.005_85)] overflow-hidden font-sans relative">
      
      {/* HEADER COMPACTO (APP STYLE) */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-[oklch(0.92_0.02_85)] flex-shrink-0 relative z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] flex items-center justify-center text-white font-extrabold text-lg shadow-sm border-2 border-white">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase tracking-wide">Olá,</span>
            <span className="text-sm font-extrabold text-[oklch(0.18_0.02_260)] leading-none mt-0.5 truncate max-w-[150px]">{user.name.split(" ")[0]}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationsPanel />
          <button onClick={handleLogout} className="p-2 ml-1 rounded-xl text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.95_0.01_85)] hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 pt-4 px-4 scroll-smooth">
         
        {/* TAB: INÍCIO */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Aviso de permissão Push */}
            {!("Notification" in window) || Notification.permission !== "granted" ? (
              <div className="bg-gradient-to-r from-[oklch(0.55_0.28_340)] to-[oklch(0.65_0.25_145)] p-5 rounded-3xl text-white shadow-lg relative overflow-hidden flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                    <Smartphone size={24} className="text-white" />
                 </div>
                 <div className="flex-1">
                    <h3 className="font-extrabold text-sm mb-1 text-white">Ative as Notificações</h3>
                    <p className="text-xs text-white/90 leading-tight mb-3">Receba avisos de novas escalas direto no seu celular.</p>
                    <button onClick={enablePush} className="px-4 py-2 bg-white text-[oklch(0.55_0.28_340)] text-xs font-extrabold rounded-xl shadow-sm hover:scale-105 transition-transform">
                       Ativar agora
                    </button>
                 </div>
              </div>
            ) : null}

            {/* Aviso de App não instalado */}
            {!user.appInstalled && (
              <div className="rounded-3xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)] p-4 flex items-start gap-3">
                <ShieldCheck size={20} className="text-[oklch(0.55_0.28_340)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-[oklch(0.18_0.02_260)] text-sm leading-tight">Painel Operacional Ativo</p>
                  <p className="text-xs text-[oklch(0.45_0.02_260)] mt-1 leading-relaxed">Você está conectado. O administrador pode enviar escalas e mensagens de rotina por aqui.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
               <div onClick={() => setActiveTab("schedule")} className="bg-white p-4 rounded-3xl border border-[oklch(0.92_0.02_85)] shadow-sm cursor-pointer hover:border-[oklch(0.55_0.28_340)] transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.97_0.01_85)] flex items-center justify-center mb-3 group-hover:bg-[oklch(0.55_0.28_340/0.1)] transition-colors">
                     <Calendar size={18} className="text-[oklch(0.55_0.28_340)]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]">{myAssignments.length}</p>
                  <p className="text-xs font-bold text-[oklch(0.45_0.02_260)]">Escalas Totais</p>
               </div>
               <div onClick={() => setActiveTab("messages")} className="bg-white p-4 rounded-3xl border border-[oklch(0.92_0.02_85)] shadow-sm cursor-pointer hover:border-[oklch(0.65_0.25_145)] transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.97_0.01_85)] flex items-center justify-center mb-3 group-hover:bg-[oklch(0.65_0.25_145/0.1)] transition-colors">
                     <MessageSquare size={18} className="text-[oklch(0.65_0.25_145)]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]">{myMessages.length}</p>
                  <p className="text-xs font-bold text-[oklch(0.45_0.02_260)]">Recados</p>
               </div>
            </div>

            {/* Próximas Pendências */}
            {pendingEvents.length > 0 && (
               <div>
                  <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-3 text-sm flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-[oklch(0.88_0.18_85)] animate-pulse"></span>
                     Aguardando sua confirmação
                  </h3>
                  <div className="space-y-3">
                     {pendingEvents.slice(0, 2).map(({assignment, event}) => (
                        <div key={assignment.id} className="bg-white rounded-3xl border border-[oklch(0.88_0.18_85)] p-4 shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1.5 h-full bg-[oklch(0.88_0.18_85)]"></div>
                           <p className="text-xs font-bold text-[oklch(0.45_0.02_260)]">{new Date(event!.date).toLocaleDateString("pt-BR")}</p>
                           <p className="font-extrabold text-[oklch(0.18_0.02_260)] leading-tight mt-1">{event!.title}</p>
                           <div className="flex mt-3 justify-end">
                              <button onClick={() => setActiveTab("schedule")} className="text-xs font-bold text-[oklch(0.55_0.28_340)] flex items-center gap-1 bg-[oklch(0.55_0.28_340/0.1)] px-3 py-1.5 rounded-lg">
                                 Ver detalhes <ArrowRight size={14}/>
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        )}

        {/* TAB: ESCALAS */}
        {activeTab === "schedule" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-2">
               <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">Minha Agenda</h2>
               <span className="px-3 py-1 rounded-full bg-white border border-[oklch(0.92_0.02_85)] text-xs font-bold text-[oklch(0.45_0.02_260)] shadow-sm">
                  {myEvents.length} eventos
               </span>
             </div>

             {myEvents.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-[oklch(0.92_0.02_85)] text-center flex flex-col items-center">
                   <div className="w-16 h-16 bg-[oklch(0.97_0.01_85)] rounded-full flex items-center justify-center mb-4">
                      <Calendar className="text-[oklch(0.45_0.02_260)]" size={28}/>
                   </div>
                   <p className="font-extrabold text-[oklch(0.18_0.02_260)]">Agenda vazia</p>
                   <p className="text-sm text-[oklch(0.45_0.02_260)] mt-1">Você ainda não foi escalado para nenhuma festa neste mês.</p>
                </div>
             ) : (
                <div className="space-y-4">
                   {myEvents.map(({ assignment, event }) => {
                      if (!event) return null;
                      const isPending = assignment.status === "pending";
                      return (
                         <div key={assignment.id} className="bg-white rounded-[24px] border border-[oklch(0.92_0.02_85)] shadow-sm overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className={`px-5 py-3 flex items-center justify-between \${isPending ? 'bg-[oklch(0.98_0.02_85)] border-b border-[oklch(0.85_0.12_85)]' : 'bg-[oklch(0.98_0.01_145)] border-b border-[oklch(0.82_0.14_145)]'}`}>
                               <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md \${isPending ? 'bg-[oklch(0.88_0.18_85)] text-[oklch(0.35_0.08_85)]' : 'bg-[oklch(0.65_0.25_145)] text-white'}`}>
                                 {isPending ? "⏳ Aguardando Confirmação" : "✅ Presença Confirmada"}
                               </span>
                               <span className="text-xs font-bold text-[oklch(0.45_0.02_260)]">Ref: #{event.id.substring(0,4)}</span>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                               <p className="text-[oklch(0.55_0.28_340)] font-extrabold text-xs uppercase mb-1">{event.service}</p>
                               <h3 className="text-lg font-extrabold text-[oklch(0.18_0.02_260)] leading-tight mb-4">{event.title}</h3>
                               
                               <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                     <div className="mt-0.5"><Clock size={16} className="text-[oklch(0.45_0.02_260)]"/></div>
                                     <div>
                                        <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{new Date(event.date).toLocaleDateString("pt-BR")} às {event.time || "--:--"}</p>
                                        <p className="text-xs text-[oklch(0.45_0.02_260)] font-medium">Horário da festa</p>
                                     </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                     <div className="mt-0.5"><MapPin size={16} className="text-[oklch(0.45_0.02_260)]"/></div>
                                     <div>
                                        <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{event.location}</p>
                                        <p className="text-xs text-[oklch(0.45_0.02_260)] font-medium">Endereço / Local</p>
                                     </div>
                                  </div>
                                  <div className="flex items-start gap-3 bg-[oklch(0.97_0.01_85)] p-3 rounded-2xl border border-[oklch(0.92_0.02_85)] mt-4">
                                     <div className="mt-0.5"><Users size={16} className="text-[oklch(0.55_0.28_340)]"/></div>
                                     <div className="flex-1">
                                        <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{assignment.functionLabel}</p>
                                        <p className="text-xs text-[oklch(0.45_0.02_260)] font-medium">Sua função</p>
                                        {assignment.notes && (
                                           <div className="mt-2 pt-2 border-t border-[oklch(0.92_0.02_85)]">
                                              <p className="text-xs text-[oklch(0.35_0.02_260)] italic">"{assignment.notes}"</p>
                                           </div>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            </div>
                            
                            {/* Card Footer (Actions) */}
                            {isPending && (
                               <div className="p-4 bg-[oklch(0.99_0.005_85)] border-t border-[oklch(0.92_0.02_85)]">
                                  <button onClick={() => handleConfirmAssignment(assignment.id)} className="w-full flex items-center justify-center gap-2 py-3 bg-[oklch(0.55_0.28_340)] text-white font-extrabold rounded-xl shadow-md hover:bg-[oklch(0.45_0.28_340)] transition-colors active:scale-95">
                                     <CheckCircle2 size={18} /> Confirmar minha presença
                                  </button>
                               </div>
                            )}
                         </div>
                      );
                   })}
                </div>
             )}
          </div>
        )}

        {/* TAB: MENSAGENS */}
        {activeTab === "messages" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Mural de Recados</h2>
             
             {myMessages.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-[oklch(0.92_0.02_85)] text-center flex flex-col items-center">
                   <div className="w-16 h-16 bg-[oklch(0.97_0.01_85)] rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="text-[oklch(0.45_0.02_260)]" size={28}/>
                   </div>
                   <p className="font-extrabold text-[oklch(0.18_0.02_260)]">Caixa Vazia</p>
                   <p className="text-sm text-[oklch(0.45_0.02_260)] mt-1">Não há comunicados da administração para você no momento.</p>
                </div>
             ) : (
                <div className="space-y-4">
                   {myMessages.map(msg => {
                      const relatedEvent = events.find(e => e.id === msg.eventId);
                      return (
                         <div key={msg.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-[oklch(0.92_0.02_85)] relative">
                            <div className="flex items-center justify-between mb-2">
                               <span className="text-[10px] font-extrabold uppercase tracking-wider text-[oklch(0.45_0.02_260)]">
                                 {new Date(msg.createdAt).toLocaleDateString("pt-BR")} às {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
                               </span>
                               <span className="w-2 h-2 rounded-full bg-[oklch(0.55_0.28_340)]"></span>
                            </div>
                            <h4 className="font-extrabold text-[oklch(0.18_0.02_260)] text-base leading-tight mb-2">{msg.title}</h4>
                            <p className="text-sm text-[oklch(0.35_0.02_260)] leading-relaxed whitespace-pre-line">{msg.content}</p>
                            
                            {relatedEvent && (
                               <div className="mt-4 flex items-center gap-2 bg-[oklch(0.97_0.01_85)] p-2.5 rounded-xl border border-[oklch(0.92_0.02_85)]">
                                  <Calendar size={14} className="text-[oklch(0.45_0.02_260)]" />
                                  <span className="text-xs font-bold text-[oklch(0.45_0.02_260)] truncate flex-1">Ref: {relatedEvent.title}</span>
                               </div>
                            )}
                         </div>
                      );
                   })}
                </div>
             )}
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="bg-white border-t border-[oklch(0.92_0.02_85)] flex items-center justify-around px-2 py-2 pb-safe absolute bottom-0 left-0 w-full z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
         <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center justify-center w-20 h-14 rounded-2xl transition-all \${activeTab === "home" ? "text-[oklch(0.55_0.28_340)] bg-[oklch(0.55_0.28_340/0.1)] font-bold" : "text-[oklch(0.45_0.02_260)] font-medium hover:bg-[oklch(0.97_0.01_85)]"}`}>
            <Home size={22} className={activeTab === "home" ? "mb-1 scale-110 transition-transform" : "mb-1"} />
            <span className="text-[10px]">Início</span>
         </button>
         
         <button onClick={() => setActiveTab("schedule")} className={`flex flex-col items-center justify-center w-20 h-14 rounded-2xl transition-all relative \${activeTab === "schedule" ? "text-[oklch(0.55_0.28_340)] bg-[oklch(0.55_0.28_340/0.1)] font-bold" : "text-[oklch(0.45_0.02_260)] font-medium hover:bg-[oklch(0.97_0.01_85)]"}`}>
            <div className="relative">
               <Calendar size={22} className={activeTab === "schedule" ? "mb-1 scale-110 transition-transform" : "mb-1"} />
               {pendingEvents.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[oklch(0.88_0.18_85)] rounded-full border border-white"></span>
               )}
            </div>
            <span className="text-[10px]">Agenda</span>
         </button>

         <button onClick={() => setActiveTab("messages")} className={`flex flex-col items-center justify-center w-20 h-14 rounded-2xl transition-all relative \${activeTab === "messages" ? "text-[oklch(0.55_0.28_340)] bg-[oklch(0.55_0.28_340/0.1)] font-bold" : "text-[oklch(0.45_0.02_260)] font-medium hover:bg-[oklch(0.97_0.01_85)]"}`}>
            <div className="relative">
               <MessageSquare size={22} className={activeTab === "messages" ? "mb-1 scale-110 transition-transform" : "mb-1"} />
               {myMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 bg-[oklch(0.65_0.25_145)] rounded-full text-white text-[8px] font-extrabold flex items-center justify-center border border-white">
                     {myMessages.length}
                  </span>
               )}
            </div>
            <span className="text-[10px]">Recados</span>
         </button>
      </div>

      {/* Styles Fix para SafeArea do iOS no Bottom */}
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 12px); }
      `}</style>
    </div>
  );
}
