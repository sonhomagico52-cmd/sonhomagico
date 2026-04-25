/**
 * AuthContext — Sonho Mágico Joinville CRM
 * Gerenciamento de autenticação via API real (MySQL + JWT)
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { sendLocalNotification } from "@/lib/notifications";

export type AdminPermission =
  | "dashboard"
  | "clients"
  | "events"
  | "teams"
  | "users"
  | "payments"
  | "reports"
  | "analytics"
  | "messages"
  | "scheduling"
  | "certificates"
  | "landing"
  | "history"
  | "settings";

export type AccessLevel =
  | "super_admin"
  | "admin"
  | "manager"
  | "coordinator"
  | "crew"
  | "client";

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  manager: "Gerente Operacional",
  coordinator: "Coordenador",
  crew: "Equipe",
  client: "Cliente",
};

export const ACCESS_LEVEL_PERMISSIONS: Record<AccessLevel, AdminPermission[]> = {
  super_admin: ["dashboard", "clients", "events", "teams", "users", "payments", "reports", "analytics", "messages", "scheduling", "certificates", "landing", "history", "settings"],
  admin: ["dashboard", "clients", "events", "teams", "users", "payments", "reports", "analytics", "messages", "scheduling", "certificates", "landing", "history"],
  manager: ["dashboard", "clients", "events", "teams", "users", "reports", "analytics", "messages", "scheduling"],
  coordinator: ["dashboard", "events", "teams", "messages", "scheduling"],
  crew: [],
  client: [],
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "client" | "admin" | "crew";
  accessLevel: AccessLevel;
  createdAt: string;
  address?: string;
  city?: string;
  notes?: string;
  specialties?: string[];
  availability?: string;
  appInstalled?: boolean;
  customPermissions?: AdminPermission[];
}

export interface Event {
  id: string;
  clientId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  service: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  budget?: number;
  notes?: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  clientId: string;
  eventId?: string;
  title: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface TeamAssignment {
  id: string;
  eventId: string;
  memberId: string;
  functionLabel: string;
  status: "confirmed" | "pending";
  notes?: string;
  createdAt: string;
}

export interface CrewMessage {
  id: string;
  authorId: string;
  eventId?: string;
  recipientIds: string[];
  title: string;
  content: string;
  channel: "app" | "whatsapp" | "both";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  validateSuperAdminPassword: (password: string) => boolean;
  events: Event[];
  quotes: Quote[];
  users: User[];
  teamAssignments: TeamAssignment[];
  crewMessages: CrewMessage[];
  refreshEvents: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshQuotes: () => Promise<void>;
  refreshTeam: () => Promise<void>;
  addEvent: (event: Omit<Event, "id" | "createdAt">) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addQuote: (quote: Omit<Quote, "id" | "createdAt">) => Promise<void>;
  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;
  addUser: (user: Omit<User, "id" | "createdAt">, password?: string) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addTeamAssignment: (assignment: Omit<TeamAssignment, "id" | "createdAt">) => Promise<void>;
  updateTeamAssignment: (id: string, assignment: Partial<TeamAssignment>) => Promise<void>;
  deleteTeamAssignment: (id: string) => Promise<void>;
  sendCrewMessage: (message: Omit<CrewMessage, "id" | "createdAt">) => Promise<void>;
  deleteCrewMessage: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveAccessLevel(role: User["role"]): AccessLevel {
  if (role === "admin") return "admin";
  if (role === "crew") return "crew";
  return "client";
}

function normalizeUser(user: User): User {
  return {
    ...user,
    accessLevel: user.accessLevel || resolveAccessLevel(user.role),
    customPermissions:
      user.customPermissions && user.customPermissions.length > 0
        ? user.customPermissions
        : ACCESS_LEVEL_PERMISSIONS[user.accessLevel || resolveAccessLevel(user.role)],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [crewMessages, setCrewMessages] = useState<CrewMessage[]>([]);
  
  // Refs para rastrear estados anteriores e evitar notificações duplicadas
  const prevEventsRef = useRef<Event[]>([]);
  const prevQuotesRef = useRef<Quote[]>([]);

  // Carregar dados do servidor ao iniciar
  useEffect(() => {
    api.get<{ user: User }>("/api/auth/me")
      .then(({ user: u }) => setUser(normalizeUser(u)))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  // Carregar dados quando usuário loga e configurar polling
  useEffect(() => {
    if (!user) return;
    
    const fetchData = () => {
      void refreshEvents();
      void refreshQuotes();
      if (user.role === "admin" || user.role === "crew") {
        void refreshUsers();
        void refreshTeam();
      }
    };

    fetchData();

    // Polling a cada 60 segundos para manter dados atualizados (útil para PWA)
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Observar mudanças de status para disparar notificações locais
  useEffect(() => {
    if (!user || user.role === "admin") return; // Admin não recebe auto-notificação de suas próprias mudanças

    // Notificações de Eventos
    events.forEach(event => {
      if (event.clientId !== user.id && user.role !== "crew") return;
      
      const prev = prevEventsRef.current.find(e => e.id === event.id);
      if (prev && prev.status !== event.status) {
        let message = "";
        if (event.status === "confirmed") message = `Sua festa "${event.title}" foi confirmada! 🎉`;
        else if (event.status === "completed") message = `Esperamos que tenha gostado da festa "${event.title}"! ✨`;
        else if (event.status === "cancelled") message = `O status da sua festa "${event.title}" mudou para cancelado.`;

        if (message) {
          sendLocalNotification("Atualização Sonho Mágico", { body: message });
        }
      }
    });

    // Notificações de Orçamentos
    quotes.forEach(quote => {
      if (quote.clientId !== user.id) return;
      
      const prev = prevQuotesRef.current.find(q => q.id === quote.id);
      if (prev && prev.status !== quote.status) {
        if (quote.status === "approved") {
          sendLocalNotification("Orçamento Aprovado! ✅", { 
            body: `Seu orçamento para "${quote.title}" foi aprovado por nossa equipe.` 
          });
        }
      }
    });

    prevEventsRef.current = events;
    prevQuotesRef.current = quotes;
  }, [events, quotes, user]);

  const refreshEvents = useCallback(async () => {
    const rows = await api.get<Event[]>("/api/events");
    setEvents(rows);
  }, []);

  const refreshQuotes = useCallback(async () => {
    const rows = await api.get<Quote[]>("/api/quotes");
    setQuotes(rows);
  }, []);

  const refreshUsers = useCallback(async () => {
    const rows = await api.get<User[]>("/api/users");
    setUsers(rows.map(normalizeUser));
  }, []);

  const refreshTeam = useCallback(async () => {
    const [assignments, messages] = await Promise.all([
      api.get<TeamAssignment[]>("/api/team/assignments"),
      api.get<CrewMessage[]>("/api/team/messages"),
    ]);
    setTeamAssignments(assignments);
    setCrewMessages(messages);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const { user: u } = await api.post<{ user: User }>("/api/auth/login", { email, password });
      const normalized = normalizeUser(u);
      setUser(normalized);
      return normalized;
    } catch {
      return null;
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<User | null> => {
    try {
      const { user: createdUser } = await api.post<{ user: User }>("/api/auth/register", {
        name,
        email,
        phone,
        password,
      });
      const normalized = normalizeUser(createdUser);
      setUser(normalized);
      return normalized;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    await api.post("/api/auth/logout", {}).catch(() => { });
    setUser(null);
    setIsSuperAdmin(false);
    setEvents([]);
    setQuotes([]);
    setUsers([]);
    setTeamAssignments([]);
    setCrewMessages([]);
  };

  const validateSuperAdminPassword = (password: string): boolean => {
    // Validação local temporária: apenas verifica se o usuário é admin.
    // Em produção, acionar endpoint dedicado para elevar privilégio.
    if (user?.role === "admin" && user?.accessLevel === "super_admin" && password.length >= 6) {
      setIsSuperAdmin(true);
      return true;
    }
    return false;
  };

  // ── Eventos ──────────────────────────────────────────────────────────

  const addEvent = async (event: Omit<Event, "id" | "createdAt">) => {
    const created = await api.post<Event>("/api/events", event);
    setEvents((prev) => [created, ...prev]);
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    const updated = await api.patch<Event>(`/api/events/${id}`, event);
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const deleteEvent = async (id: string) => {
    await api.delete(`/api/events/${id}`);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Orçamentos ───────────────────────────────────────────────────────

  const addQuote = async (quote: Omit<Quote, "id" | "createdAt">) => {
    const created = await api.post<Quote>("/api/quotes", quote);
    setQuotes((prev) => [created, ...prev]);
  };

  const updateQuote = async (id: string, quote: Partial<Quote>) => {
    const updated = await api.patch<Quote>(`/api/quotes/${id}`, quote);
    setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  // ── Usuários ─────────────────────────────────────────────────────────

  const addUser = async (userData: Omit<User, "id" | "createdAt">, password?: string) => {
    const created = await api.post<User>("/api/users", { ...userData, password });
    setUsers((prev) => [created, ...prev]);
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const updated = await api.patch<User>(`/api/users/${id}`, userData);
    setUsers((prev) => prev.map((u) => (u.id === id ? normalizeUser(updated) : u)));
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/api/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // ── Equipe ───────────────────────────────────────────────────────────

  const addTeamAssignment = async (assignment: Omit<TeamAssignment, "id" | "createdAt">) => {
    const created = await api.post<TeamAssignment>("/api/team/assignments", assignment);
    setTeamAssignments((prev) => [created, ...prev]);
  };

  const updateTeamAssignment = async (id: string, assignment: Partial<TeamAssignment>) => {
    const updated = await api.patch<TeamAssignment>(`/api/team/assignments/${id}`, assignment);
    setTeamAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const deleteTeamAssignment = async (id: string) => {
    await api.delete(`/api/team/assignments/${id}`);
    setTeamAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const sendCrewMessage = async (message: Omit<CrewMessage, "id" | "createdAt">) => {
    const created = await api.post<CrewMessage>("/api/team/messages", message);
    setCrewMessages((prev) => [created, ...prev]);
  };

  const deleteCrewMessage = async (id: string) => {
    await api.delete(`/api/team/messages/${id}`);
    setCrewMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSuperAdmin,
        isLoading,
        login,
        signup,
        logout,
        validateSuperAdminPassword,
        events,
        quotes,
        users,
        teamAssignments,
        crewMessages,
        refreshEvents,
        refreshUsers,
        refreshQuotes,
        refreshTeam,
        addEvent,
        updateEvent,
        deleteEvent,
        addQuote,
        updateQuote,
        addUser,
        updateUser,
        deleteUser,
        addTeamAssignment,
        updateTeamAssignment,
        deleteTeamAssignment,
        sendCrewMessage,
        deleteCrewMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useSuperAdmin() {
  const { user, isSuperAdmin, validateSuperAdminPassword } = useAuth();
  const accessLevel = user ? user.accessLevel || resolveAccessLevel(user.role) : "client";
  return {
    isSuperAdmin: user?.role === "admin" && (accessLevel === "super_admin" || isSuperAdmin),
    validatePassword: validateSuperAdminPassword,
  };
}

export function useAdminPermissions() {
  const { user } = useAuth();
  const level = user ? user.accessLevel || resolveAccessLevel(user.role) : "client";
  const basePermissions = ACCESS_LEVEL_PERMISSIONS[level] || [];
  const permissions = user?.customPermissions?.length ? user.customPermissions : basePermissions;
  return {
    accessLevel: level,
    permissions,
    hasPermission: (permission: AdminPermission) => permissions.includes(permission),
  };
}
