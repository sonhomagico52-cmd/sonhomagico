import { LogOut, MessageSquare, ShieldCheck, Smartphone, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationsPanel from "@/components/NotificationsPanel";
import { toast } from "sonner";

export default function CrewDashboard() {
  const { user, logout, events, teamAssignments, crewMessages } = useAuth();
  const { unreadCount } = useNotifications();
  const [, setLocation] = useLocation();

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

  const myMessages = crewMessages
    .filter((message) => message.recipientIds.includes(user.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleLogout = () => {
    logout();
    setLocation("/");
    toast.success("Logout realizado com sucesso");
  };

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)] flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">{user.name}</p>
              <p className="text-xs text-[oklch(0.18_0.02_260)]/60">Painel do integrante • {user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsPanel />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.65_0.25_145)] text-white font-bold"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-5">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-[oklch(0.55_0.28_340)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[oklch(0.45_0.02_260)]">Escalas</p>
                <p className="text-3xl font-extrabold text-[oklch(0.18_0.02_260)]">{myAssignments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-5">
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-[oklch(0.55_0.22_262)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[oklch(0.45_0.02_260)]">Mensagens</p>
                <p className="text-3xl font-extrabold text-[oklch(0.18_0.02_260)]">{myMessages.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-5">
            <div className="flex items-center gap-3">
              <Smartphone size={20} className="text-[oklch(0.65_0.25_145)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[oklch(0.45_0.02_260)]">Notificacoes</p>
                <p className="text-3xl font-extrabold text-[oklch(0.18_0.02_260)]">{unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {!user.appInstalled && (
          <div className="rounded-3xl bg-[oklch(0.88_0.18_85)]/35 border border-[oklch(0.82_0.14_145)] p-5 flex items-start gap-3">
            <ShieldCheck size={20} className="text-[oklch(0.18_0.02_260)] mt-0.5" />
            <div>
              <p className="font-extrabold text-[oklch(0.18_0.02_260)]">App ainda nao sinalizado como instalado</p>
              <p className="text-sm text-[oklch(0.35_0.02_260)] mt-1">Peça ao administrador para marcar seu dispositivo como ativo e concentrar os avisos operacionais por aqui.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white rounded-3xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
            <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Meus eventos</h2>
            <div className="space-y-4">
              {myEvents.length === 0 ? (
                <p className="text-sm text-[oklch(0.55_0.02_260)]">Nenhuma escala recebida ainda.</p>
              ) : (
                myEvents.map(({ assignment, event }) => (
                  <div key={assignment.id} className="rounded-2xl border border-[oklch(0.92_0.02_85)] p-5 bg-[oklch(0.99_0.01_85)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-[oklch(0.18_0.02_260)]">{event?.title}</p>
                        <p className="text-sm text-[oklch(0.45_0.02_260)]">
                          {event ? new Date(event.date).toLocaleDateString("pt-BR") : ""} • {event?.time || "Horario a definir"}
                        </p>
                        <p className="text-sm text-[oklch(0.45_0.02_260)]">{event?.location}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${assignment.status === "confirmed" ? "bg-[oklch(0.65_0.25_145)] text-white" : "bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)]"}`}>
                        {assignment.status === "confirmed" ? "Confirmado" : "Pendente"}
                      </span>
                    </div>
                    <div className="mt-4 rounded-2xl bg-white border border-[oklch(0.92_0.02_85)] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[oklch(0.45_0.02_260)]">Minha funcao</p>
                      <p className="font-bold text-[oklch(0.18_0.02_260)] mt-2">{assignment.functionLabel}</p>
                      {assignment.notes && (
                        <p className="text-sm text-[oklch(0.35_0.02_260)] mt-2">{assignment.notes}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
            <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Caixa de mensagens</h2>
            <div className="space-y-3">
              {myMessages.length === 0 ? (
                <p className="text-sm text-[oklch(0.55_0.02_260)]">Nenhuma mensagem enviada para voce ainda.</p>
              ) : (
                myMessages.map((message) => {
                  const event = events.find((item) => item.id === message.eventId);
                  return (
                    <div key={message.id} className="rounded-2xl border border-[oklch(0.92_0.02_85)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-[oklch(0.18_0.02_260)]">{message.title}</p>
                          <p className="text-xs text-[oklch(0.45_0.02_260)]">
                            {new Date(message.createdAt).toLocaleString("pt-BR")}
                            {event ? ` • ${event.title}` : ""}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[oklch(0.97_0.01_85)] text-[oklch(0.45_0.02_260)]">
                          {message.channel === "both" ? "App + WhatsApp" : message.channel === "app" ? "App" : "WhatsApp"}
                        </span>
                      </div>
                      <p className="text-sm text-[oklch(0.35_0.02_260)] mt-3 whitespace-pre-line">{message.content}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
