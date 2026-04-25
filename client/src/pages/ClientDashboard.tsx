import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut, Plus, Calendar, FileText, User, Trash2, X, MapPin, Clock, Users, ArrowRight, Wallet, PartyPopper } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ClientDashboard() {
  const { user, logout, events, quotes, addEvent, deleteEvent, addQuote, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"events" | "quotes" | "profile">("events");
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    attendees: 0,
    service: "Personagens Kids",
  });

  const [newQuote, setNewQuote] = useState({
    title: "",
    description: "",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.98_0.005_85)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[oklch(0.55_0.28_340)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[oklch(0.45_0.02_260)] font-bold">Carregando portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (user.role === "admin") {
    setLocation("/admin");
    return null;
  }

  const userEvents = events.filter((e) => e.clientId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const userQuotes = quotes.filter((q) => q.clientId === user.id).sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    toast.success("Até logo!");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    addEvent({
      clientId: user.id,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      attendees: newEvent.attendees,
      service: newEvent.service,
      status: "pending",
    });

    setNewEvent({
      title: "", date: "", time: "", location: "", attendees: 0, service: "Personagens Kids",
    });
    setShowNewEventForm(false);
    toast.success("Festa cadastrada! Em breve confirmaremos os detalhes.");
  };

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.title || !newQuote.description) {
      toast.error("Preencha todos os campos");
      return;
    }

    addQuote({
      clientId: user.id,
      title: newQuote.title,
      description: newQuote.description,
      amount: 0,
      status: "pending",
    });

    setNewQuote({ title: "", description: "" });
    setShowNewQuoteForm(false);
    toast.success("Solicitação de orçamento enviada com sucesso!");
  };

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.005_85)] flex flex-col font-sans">
      
      {/* HEADER NAVBAR */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-[oklch(0.92_0.02_85)]">
        <div className="container max-w-6xl flex items-center justify-between h-16 px-4 md:px-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] flex items-center justify-center">
               <PartyPopper size={16} className="text-white" />
             </div>
             <span className="font-extrabold text-[oklch(0.18_0.02_260)] text-lg tracking-tight">Portal do Cliente</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[oklch(0.45_0.02_260)] font-bold hover:bg-[oklch(0.97_0.01_85)] hover:text-red-500 transition-colors"
          >
            Sair
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-[oklch(0.18_0.02_260)] to-[oklch(0.38_0.22_262)] pt-12 pb-20 px-4 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
         <div className="container max-w-6xl relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">Olá, {user.name.split(' ')[0]}! 👋</h1>
            <p className="text-[oklch(0.85_0.12_85)] text-lg max-w-2xl">Acompanhe suas festas, solicite orçamentos e gerencie seu contrato num só lugar. Estamos felizes em ter você aqui.</p>
         </div>
      </div>

      <div className="container max-w-6xl px-4 md:px-8 -mt-8 flex-1 pb-16">
        
        {/* TAB NAVIGATION (SEGMENTED) */}
        <div className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] p-1.5 flex flex-wrap gap-1 mb-8">
          {[
            { id: "events", label: "Minhas Festas", icon: Calendar },
            { id: "quotes", label: "Meus Orçamentos", icon: Wallet },
            { id: "profile", label: "Meu Perfil", icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300 \${
                activeTab === id
                  ? "bg-[oklch(0.55_0.28_340/0.1)] text-[oklch(0.55_0.28_340)] shadow-[inset_0_0_0_1px_oklch(0.55_0.28_340/0.2)]"
                  : "text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"
              }`}
            >
              <Icon size={18} className={activeTab === id ? "scale-110" : ""} />
              {label}
            </button>
          ))}
        </div>

        {/* --- EVENTS CONTENT --- */}
        {activeTab === "events" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                 <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)] tracking-tight">Agenda de Eventos</h2>
                 <p className="text-sm text-[oklch(0.45_0.02_260)]">Você possui {userEvents.length} festa(s) registrada(s).</p>
              </div>
              <button
                onClick={() => setShowNewEventForm(true)}
                className="flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold shadow-lg shadow-[oklch(0.55_0.28_340/0.3)] hover:scale-105 transition-transform"
              >
                <Plus size={20} />
                Agendar Festa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userEvents.length > 0 ? (
                userEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-3xl p-6 border border-[oklch(0.92_0.02_85)] shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full relative overflow-hidden">
                     {/* Borda superior colorida */}
                     <div className={`absolute top-0 left-0 w-full h-1.5 \${
                           event.status === "confirmed" ? "bg-[oklch(0.65_0.25_145)]" : 
                           event.status === "pending" ? "bg-[oklch(0.88_0.18_85)]" : "bg-[oklch(0.55_0.22_262)]"
                        }`}
                     ></div>
                     
                    <div className="flex items-start justify-between mb-4 mt-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider \${
                            event.status === "confirmed" ? "bg-[oklch(0.65_0.25_145/0.1)] text-[oklch(0.55_0.25_145)] border border-[oklch(0.65_0.25_145/0.2)]" : 
                            event.status === "pending" ? "bg-[oklch(0.88_0.18_85)] text-[oklch(0.35_0.08_85)] border border-[oklch(0.82_0.18_85)]" : 
                            "bg-[oklch(0.92_0.02_85)] text-[oklch(0.45_0.02_260)]"
                          }`}>
                          {event.status === "confirmed" ? "✅ Confirmado" : event.status === "pending" ? "⏳ Analisando Data" : "✔️ Concluído"}
                       </span>
                       <button onClick={() => { if(confirm("Deseja cancelar o evento?")) deleteEvent(event.id); }} className="p-1.5 hover:bg-red-50 text-[oklch(0.45_0.02_260)] hover:text-red-500 rounded-lg transition-colors">
                         <Trash2 size={16} />
                       </button>
                    </div>

                    <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)] leading-tight mb-2">{event.title}</h3>
                    <p className="text-[oklch(0.55_0.28_340)] font-extrabold text-sm uppercase mb-5">{event.service}</p>
                    
                    <div className="space-y-3 mb-6 flex-1">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[oklch(0.97_0.01_85)] flex items-center justify-center flex-shrink-0">
                             <Calendar size={14} className="text-[oklch(0.45_0.02_260)]"/>
                          </div>
                          <div className="flex-1">
                             <p className="text-xs font-bold text-[oklch(0.45_0.02_260)] leading-none">Data e Hora</p>
                             <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{new Date(event.date).toLocaleDateString("pt-BR")} às {event.time}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[oklch(0.97_0.01_85)] flex items-center justify-center flex-shrink-0">
                             <MapPin size={14} className="text-[oklch(0.45_0.02_260)]"/>
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-xs font-bold text-[oklch(0.45_0.02_260)] leading-none">Local</p>
                             <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)] truncate">{event.location}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[oklch(0.97_0.01_85)] flex items-center justify-center flex-shrink-0">
                             <Users size={14} className="text-[oklch(0.45_0.02_260)]"/>
                          </div>
                          <div className="flex-1">
                             <p className="text-xs font-bold text-[oklch(0.45_0.02_260)] leading-none">Convidados</p>
                             <p className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">~{event.attendees} pessoas</p>
                          </div>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[oklch(0.92_0.02_85)] border-dashed">
                  <div className="w-20 h-20 bg-[oklch(0.97_0.01_85)] rounded-full flex items-center justify-center mx-auto mb-4">
                     <Calendar size={32} className="text-[oklch(0.45_0.02_260)]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)] mb-2">Sua agenda está livre!</h3>
                  <p className="text-[oklch(0.45_0.02_260)] max-w-sm mx-auto mb-6">Você ainda não possui eventos cadastrados. Que tal começarmos a planejar a sua próxima festa mágica?</p>
                  <button onClick={() => setShowNewEventForm(true)} className="px-6 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340/0.1)] text-[oklch(0.55_0.28_340)] font-extrabold hover:bg-[oklch(0.55_0.28_340)] hover:text-white transition-colors">
                     Começar agora
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- QUOTES CONTENT --- */}
        {activeTab === "quotes" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                 <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)] tracking-tight">Meus Orçamentos</h2>
                 <p className="text-sm text-[oklch(0.45_0.02_260)]">Histórico de cotações solicitadas.</p>
              </div>
              <button
                onClick={() => setShowNewQuoteForm(true)}
                className="flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.18_0.02_260)] text-white font-extrabold hover:scale-105 transition-transform"
              >
                <FileText size={20} />
                Solicitar Cotação
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userQuotes.length > 0 ? (
                userQuotes.map((quote) => (
                  <div key={quote.id} className="bg-white rounded-3xl p-6 border border-[oklch(0.92_0.02_85)] shadow-sm hover:shadow-md transition-shadow relative">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-extrabold text-[oklch(0.18_0.02_260)]">{quote.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider \${
                             quote.status === "approved" ? "bg-[oklch(0.65_0.25_145/0.1)] text-[oklch(0.55_0.25_145)] border border-[oklch(0.65_0.25_145/0.2)]" : 
                             quote.status === "pending" ? "bg-[oklch(0.88_0.18_85)] text-[oklch(0.35_0.08_85)] border border-[oklch(0.82_0.18_85)]" : 
                             "bg-red-100 text-red-600 border border-red-200"
                           }`}>
                           {quote.status === "approved" ? "Aprovado" : quote.status === "pending" ? "Em Análise" : "Recusado"}
                        </span>
                     </div>
                     <div className="bg-[oklch(0.98_0.005_85)] p-4 rounded-2xl mb-4 border border-[oklch(0.92_0.02_85)]">
                        <p className="text-sm text-[oklch(0.35_0.02_260)] italic">"{quote.description}"</p>
                     </div>
                     <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-bold text-[oklch(0.45_0.02_260)]">Valor Cotado:</span>
                        {quote.amount > 0 ? (
                           <span className="text-2xl font-extrabold text-[oklch(0.55_0.28_340)]">R$ {quote.amount.toFixed(2)}</span>
                        ) : (
                           <span className="text-sm font-extrabold text-[oklch(0.45_0.02_260)]">Em breve</span>
                        )}
                     </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[oklch(0.92_0.02_85)] border-dashed">
                  <div className="w-20 h-20 bg-[oklch(0.97_0.01_85)] rounded-full flex items-center justify-center mx-auto mb-4">
                     <Wallet size={32} className="text-[oklch(0.45_0.02_260)]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)] mb-2">Nenhum orçamento ainda</h3>
                  <p className="text-[oklch(0.45_0.02_260)] max-w-sm mx-auto mb-6">Precisa de um valor personalizado para sua festa? Solicite agora mesmo sem compromisso.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PROFILE CONTENT --- */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-3xl p-8 border border-[oklch(0.92_0.02_85)] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]"></div>
                <div className="relative z-10 flex flex-col items-center mt-6 mb-8">
                   <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md mb-4">
                      <div className="w-full h-full rounded-full bg-[oklch(0.97_0.01_85)] flex items-center justify-center text-3xl font-extrabold text-[oklch(0.18_0.02_260)]">
                         {user.name.charAt(0)}
                      </div>
                   </div>
                   <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]">{user.name}</h2>
                   <p className="text-[oklch(0.45_0.02_260)] font-bold bg-[oklch(0.97_0.01_85)] px-3 py-1 rounded-full mt-2 text-sm">Cliente Oficial VIP</p>
                </div>

                <div className="space-y-4">
                   <div className="bg-[oklch(0.98_0.005_85)] p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                         <MailIcon />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase tracking-wider">Email de Acesso</p>
                         <p className="text-base font-extrabold text-[oklch(0.18_0.02_260)]">{user.email}</p>
                      </div>
                   </div>
                   <div className="bg-[oklch(0.98_0.005_85)] p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                         <PhoneIcon />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase tracking-wider">Celular / WhatsApp</p>
                         <p className="text-base font-extrabold text-[oklch(0.18_0.02_260)]">{user.phone || "Não informado"}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* --- SLIDE OVERS --- */}

      {/* Novo Evento Slide-over */}
      {showNewEventForm && (
        <>
          <div className="fixed inset-0 bg-[oklch(0.18_0.02_260/0.4)] backdrop-blur-sm z-50 transition-opacity" onClick={() => setShowNewEventForm(false)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.01_85)]">
              <div>
                <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">Agendar Festa</h3>
                <p className="text-sm text-[oklch(0.45_0.02_260)]">Preencha os dados do seu evento.</p>
              </div>
              <button onClick={() => setShowNewEventForm(false)} className="p-2 hover:bg-[oklch(0.92_0.02_85)] rounded-full transition-colors">
                <X size={20} className="text-[oklch(0.18_0.02_260)]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
               <form id="newEventForm" onSubmit={handleAddEvent} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-1.5">Título / Nome do Aniversariante</label>
                    <input required type="text" placeholder="Ex: Aniversário da Júlia" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:ring-1 focus:ring-[oklch(0.55_0.28_340)] outline-none bg-[oklch(0.99_0.01_85)] font-bold text-[oklch(0.18_0.02_260)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-1.5">Data</label>
                       <input required type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] outline-none bg-[oklch(0.99_0.01_85)] font-bold text-[oklch(0.18_0.02_260)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-1.5">Horário</label>
                       <input required type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] outline-none bg-[oklch(0.99_0.01_85)] font-bold text-[oklch(0.18_0.02_260)]" />
                     </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-1.5">Local (Salão/Casa)</label>
                    <input required type="text" placeholder="Endereço completo" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] outline-none bg-[oklch(0.99_0.01_85)] font-bold text-[oklch(0.18_0.02_260)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2">
                       <label className="block text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-1.5">Serviço Principal</label>
                       <select value={newEvent.service} onChange={(e) => setNewEvent({ ...newEvent, service: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] outline-none bg-[oklch(0.99_0.01_85)] font-bold text-[oklch(0.18_0.02_260)]">
                         <option>Personagens Kids</option>
                         <option>Recreação</option>
                         <option>Magic Drinks Kids</option>
                         <option>Brinquedos</option>
                         <option>Carreta Furacão</option>
                       </select>
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-1.5">Estimativa de Convidados</label>
                     <input type="number" min="1" value={newEvent.attendees} onChange={(e) => setNewEvent({ ...newEvent, attendees: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] outline-none bg-[oklch(0.99_0.01_85)] font-bold text-[oklch(0.18_0.02_260)]" />
                  </div>
               </form>
            </div>
            <div className="p-6 border-t border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.01_85)]">
               <button form="newEventForm" type="submit" className="w-full py-4 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold text-lg hover:bg-[oklch(0.45_0.28_340)] transition-colors flex justify-center items-center gap-2">
                  Confirmar Agendamento <ArrowRight size={20}/>
               </button>
            </div>
          </div>
        </>
      )}

      {/* Solicitacao Orcamento Slide-over */}
      {showNewQuoteForm && (
        <>
          <div className="fixed inset-0 bg-[oklch(0.18_0.02_260/0.4)] backdrop-blur-sm z-50 transition-opacity" onClick={() => setShowNewQuoteForm(false)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.01_85)]">
              <div>
                <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">Novo Orçamento</h3>
                <p className="text-sm text-[oklch(0.45_0.02_260)]">Solicite preços personalizados.</p>
              </div>
              <button onClick={() => setShowNewQuoteForm(false)} className="p-2 hover:bg-[oklch(0.92_0.02_85)] rounded-full transition-colors">
                <X size={20} className="text-[oklch(0.18_0.02_260)]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
               <form id="newQuoteForm" onSubmit={handleAddQuote} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-1.5">O que você precisa?</label>
                    <input required type="text" placeholder="Ex: Pacote de Super-Heróis" value={newQuote.title} onChange={(e) => setNewQuote({ ...newQuote, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:ring-1 focus:ring-[oklch(0.55_0.28_340)] outline-none bg-[oklch(0.99_0.01_85)] font-bold text-[oklch(0.18_0.02_260)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-1.5">Detalhes / Duração / Quantidade</label>
                    <textarea required placeholder="Conte-nos como será a festa..." rows={5} value={newQuote.description} onChange={(e) => setNewQuote({ ...newQuote, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] outline-none bg-[oklch(0.99_0.01_85)] font-medium text-[oklch(0.18_0.02_260)] resize-none" />
                  </div>
               </form>
            </div>
            <div className="p-6 border-t border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.01_85)]">
               <button form="newQuoteForm" type="submit" className="w-full py-4 rounded-xl bg-[oklch(0.18_0.02_260)] text-white font-extrabold text-lg hover:bg-black transition-colors flex justify-center items-center gap-2">
                  Enviar Solicitação <ArrowRight size={20}/>
               </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

// Icon Components for Profile Tab
function MailIcon() {
   return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[oklch(0.55_0.28_340)]"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function PhoneIcon() {
   return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[oklch(0.65_0.25_145)]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
