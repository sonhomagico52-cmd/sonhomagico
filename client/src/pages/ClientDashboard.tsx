/**
 * ClientDashboard — Sonho Mágico Joinville CRM
 * Área de cliente com gerenciamento de eventos e orçamentos
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut, Plus, Calendar, FileText, User, ChevronRight, Trash2, Edit2 } from "lucide-react";
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
      <div className="min-h-screen bg-[oklch(0.97_0.01_85)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[oklch(0.55_0.28_340)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[oklch(0.45_0.02_260)] font-medium">Carregando...</p>
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

  const userEvents = events.filter((e) => e.clientId === user.id);
  const userQuotes = quotes.filter((q) => q.clientId === user.id);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    toast.success("Logout realizado com sucesso");
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
      title: "",
      date: "",
      time: "",
      location: "",
      attendees: 0,
      service: "Personagens Kids",
    });
    setShowNewEventForm(false);
    toast.success("Evento criado com sucesso!");
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
    toast.success("Solicitação de orçamento enviada!");
  };

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.88_0.18_85)] via-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] flex items-center justify-center">
              <span className="text-white font-bold" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {user.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">{user.name}</p>
              <p className="text-xs text-[oklch(0.18_0.02_260)]/60">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.65_0.25_145)] text-white font-bold hover:scale-105 transition-transform"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>

      <div className="container py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[oklch(0.92_0.02_85)]">
          {[
            { id: "events", label: "Meus Eventos", icon: Calendar },
            { id: "quotes", label: "Orçamentos", icon: FileText },
            { id: "profile", label: "Perfil", icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-colors ${activeTab === id
                  ? "border-[oklch(0.55_0.28_340)] text-[oklch(0.55_0.28_340)]"
                  : "border-transparent text-[oklch(0.18_0.02_260)]/60 hover:text-[oklch(0.18_0.02_260)]"
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
                Meus Eventos
              </h2>
              <button
                onClick={() => setShowNewEventForm(!showNewEventForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)] font-bold hover:scale-105 transition-transform"
              >
                <Plus size={18} />
                Novo Evento
              </button>
            </div>

            {/* New Event Form */}
            {showNewEventForm && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-[oklch(0.92_0.02_85)]">
                <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)] mb-4">Criar Novo Evento</h3>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Título do evento"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
                    />
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
                    />
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Local do evento"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Número de pessoas"
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent({ ...newEvent, attendees: parseInt(e.target.value) || 0 })}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
                    />
                    <select
                      value={newEvent.service}
                      onChange={(e) => setNewEvent({ ...newEvent, service: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
                    >
                      <option>Personagens Kids</option>
                      <option>Recreação</option>
                      <option>Magic Drinks Kids</option>
                      <option>Brinquedos</option>
                      <option>Carreta Furacão</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform"
                    >
                      Criar Evento
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewEventForm(false)}
                      className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] text-[oklch(0.18_0.02_260)] font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Events List */}
            <div className="space-y-4">
              {userEvents.length > 0 ? (
                userEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">{event.title}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${event.status === "confirmed"
                            ? "bg-[oklch(0.65_0.25_145)] text-white"
                            : event.status === "pending"
                              ? "bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)]"
                              : "bg-[oklch(0.55_0.22_262)] text-white"
                          }`}>
                          {event.status === "confirmed" ? "Confirmado" : event.status === "pending" ? "Pendente" : "Realizado"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          deleteEvent(event.id);
                          toast.success("Evento deletado");
                        }}
                        className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-[oklch(0.65_0.25_145)]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-[oklch(0.18_0.02_260)]/70">
                      <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString("pt-BR")}</p>
                      <p><strong>Hora:</strong> {event.time}</p>
                      <p><strong>Local:</strong> {event.location}</p>
                      <p><strong>Pessoas:</strong> {event.attendees}</p>
                      <p><strong>Serviço:</strong> {event.service}</p>
                      {event.budget && <p><strong>Orçamento:</strong> R$ {event.budget}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-[oklch(0.92_0.02_85)]">
                  <Calendar size={48} className="mx-auto mb-4 text-[oklch(0.88_0.18_85)]/30" />
                  <p className="text-[oklch(0.18_0.02_260)]/60 font-medium">Nenhum evento criado ainda</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === "quotes" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
                Orçamentos
              </h2>
              <button
                onClick={() => setShowNewQuoteForm(!showNewQuoteForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)] font-bold hover:scale-105 transition-transform"
              >
                <Plus size={18} />
                Solicitar Orçamento
              </button>
            </div>

            {/* New Quote Form */}
            {showNewQuoteForm && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-[oklch(0.92_0.02_85)]">
                <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)] mb-4">Solicitar Orçamento</h3>
                <form onSubmit={handleAddQuote} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título do orçamento"
                    value={newQuote.title}
                    onChange={(e) => setNewQuote({ ...newQuote, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
                  />
                  <textarea
                    placeholder="Descreva seu evento..."
                    value={newQuote.description}
                    onChange={(e) => setNewQuote({ ...newQuote, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform"
                    >
                      Enviar Solicitação
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewQuoteForm(false)}
                      className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] text-[oklch(0.18_0.02_260)] font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Quotes List */}
            <div className="space-y-4">
              {userQuotes.length > 0 ? (
                userQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">{quote.title}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${quote.status === "approved"
                            ? "bg-[oklch(0.65_0.25_145)] text-white"
                            : quote.status === "pending"
                              ? "bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)]"
                              : "bg-[oklch(0.55_0.22_262)] text-white"
                          }`}>
                          {quote.status === "approved" ? "Aprovado" : quote.status === "pending" ? "Pendente" : "Rejeitado"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[oklch(0.18_0.02_260)]/70 mb-3">{quote.description}</p>
                    {quote.amount > 0 && (
                      <p className="text-lg font-bold text-[oklch(0.55_0.28_340)]">R$ {quote.amount.toFixed(2)}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-[oklch(0.92_0.02_85)]">
                  <FileText size={48} className="mx-auto mb-4 text-[oklch(0.88_0.18_85)]/30" />
                  <p className="text-[oklch(0.18_0.02_260)]/60 font-medium">Nenhum orçamento solicitado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)] mb-6" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Meu Perfil
            </h2>
            <div className="bg-white rounded-2xl shadow-md p-8 border border-[oklch(0.92_0.02_85)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">Nome</label>
                  <p className="px-4 py-3 rounded-lg bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">Email</label>
                  <p className="px-4 py-3 rounded-lg bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">Telefone</label>
                  <p className="px-4 py-3 rounded-lg bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]">{user.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">Tipo de Conta</label>
                  <p className="px-4 py-3 rounded-lg bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)] capitalize">{user.role === "client" ? "Cliente" : "Administrador"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
