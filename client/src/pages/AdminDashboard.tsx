/**
 * AdminDashboard — Sonho Mágico Joinville CRM
 * Layout com sidebar lateral + Dashboard rico com gráficos
 */
import { lazy, Suspense, useState, useEffect, type ChangeEvent, type ComponentType } from "react";
import { useLocation } from "wouter";
import {
  LogOut, Users, Calendar, FileText, BarChart3, Lock, Settings, Palette,
  Bell, MessageSquare, HardDrive, CreditCard, TrendingUp, Zap, Award,
  Menu, X, ChevronRight, Star, ArrowUpRight, ArrowDownRight, Clock,
  CheckCircle2, AlertCircle, DollarSign, Home, Shield,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { useAdminPermissions, useAuth, useSuperAdmin } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SuperAdminModal = lazy(() => import("@/components/SuperAdminModal"));
const ClientsModule = lazy(() => import("@/components/ClientsModule"));
const EventsModule = lazy(() => import("@/components/EventsModule"));
const LandingPageModule = lazy(() => import("@/components/LandingPageModule"));
const ReportsModule = lazy(() => import("@/components/ReportsModule"));
const MessagesModule = lazy(() => import("@/components/MessagesModule"));
const HistoryBackupModule = lazy(() => import("@/components/HistoryBackupModule"));
const PaymentsModule = lazy(() => import("@/components/PaymentsModule"));
const NotificationsPanel = lazy(() => import("@/components/NotificationsPanel"));
const AnalyticsModule = lazy(() => import("@/components/AnalyticsModule"));
const AutoSchedulingModule = lazy(() => import("@/components/AutoSchedulingModule"));
const CertificatesModule = lazy(() => import("@/components/CertificatesModule"));
const TeamManagementModule = lazy(() => import("@/components/TeamManagementModule"));
const UserManagementModule = lazy(() => import("@/components/UserManagementModule"));

type TabId =
  | "dashboard" | "clients" | "events" | "landing" | "reports"
  | "messages" | "history" | "payments" | "analytics" | "scheduling"
  | "teams" | "users"
  | "certificates" | "settings";

const NAV_ITEMS: { id: TabId; label: string; icon: any; group?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, group: "principal" },
  { id: "clients", label: "Clientes", icon: Users, group: "principal" },
  { id: "events", label: "Eventos", icon: Calendar, group: "principal" },
  { id: "teams", label: "Equipes", icon: Users, group: "principal" },
  { id: "users", label: "Usuários", icon: Shield, group: "principal" },
  { id: "payments", label: "Pagamentos", icon: CreditCard, group: "principal" },
  { id: "reports", label: "Relatórios", icon: FileText, group: "dados" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, group: "dados" },
  { id: "messages", label: "Mensagens", icon: MessageSquare, group: "dados" },
  { id: "scheduling", label: "Agendamento", icon: Zap, group: "extras" },
  { id: "certificates", label: "Certificados", icon: Award, group: "extras" },
  { id: "landing", label: "Landing Page", icon: Palette, group: "extras" },
  { id: "history", label: "Histórico", icon: HardDrive, group: "extras" },
  { id: "settings", label: "Configurações", icon: Settings, group: "extras" },
];

const PIE_COLORS = [
  "oklch(0.55 0.28 340)",
  "oklch(0.65 0.25 145)",
  "oklch(0.55 0.22 262)",
  "oklch(0.72 0.22 55)",
  "oklch(0.38 0.22 262)",
];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface CompanyConfig {
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  welcomeMsg?: string;
  instagram?: string;
  whatsapp?: string;
}

const TAB_COMPONENTS: Partial<Record<TabId, ComponentType<any>>> = {
  clients: ClientsModule,
  events: EventsModule,
  teams: TeamManagementModule,
  users: UserManagementModule,
  landing: LandingPageModule,
  reports: ReportsModule,
  messages: MessagesModule,
  payments: PaymentsModule,
  analytics: AnalyticsModule,
  scheduling: AutoSchedulingModule,
  certificates: CertificatesModule,
  history: HistoryBackupModule,
};

function ModuleLoader() {
  return (
    <div className="min-h-[240px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-[oklch(0.55_0.28_340)] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-[oklch(0.45_0.02_260)] font-medium">Carregando modulo...</p>
      </div>
    </div>
  );
}

function loadCompanyConfig(): CompanyConfig {
  try {
    return JSON.parse(localStorage.getItem("smj_config") || "{}") as CompanyConfig;
  } catch {
    return {};
  }
}

function SettingsModule({ onConfigSaved }: { onConfigSaved?: (config: CompanyConfig) => void }) {
  const [config, setConfig] = useState<CompanyConfig>(() => loadCompanyConfig());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("smj_config", JSON.stringify(config));
    window.dispatchEvent(new Event("smj-config-updated"));
    onConfigSaved?.(config);
    setSaved(true);
    toast.success("Configurações salvas!");
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        toast.error("Não foi possível carregar o logo");
        return;
      }
      setConfig((current) => ({ ...current, logoUrl: result }));
      toast.success("Logo carregado. Clique em salvar para publicar.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleFaviconUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        toast.error("Não foi possível carregar o favicon");
        return;
      }
      setConfig((current) => ({ ...current, faviconUrl: result }));
      toast.success("Favicon carregado. Clique em salvar para publicar.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const field = (label: string, key: keyof CompanyConfig, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-bold text-[oklch(0.35_0.02_260)] mb-1">{label}</label>
      <input
        type={type}
        value={config[key] || ""}
        onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm transition-all"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
        ⚙️ Configurações
      </h2>
      <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6 space-y-4">
        <h3 className="font-bold text-[oklch(0.18_0.02_260)] mb-2">Dados da Empresa</h3>
        {field("Nome da Empresa", "companyName", "text", "Sonho Mágico Joinville")}
        {field("Telefone / WhatsApp", "phone", "tel", "(47) 99944-7152")}
        {field("E-mail de Contato", "email", "email", "contato@sonhomagico.com.br")}
        {field("Endereço", "address", "text", "Joinville, SC")}
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6 space-y-4">
        <h3 className="font-bold text-[oklch(0.18_0.02_260)] mb-2">Personalização</h3>
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[oklch(0.35_0.02_260)]">Logo da Empresa</label>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.98_0.01_85)] cursor-pointer text-sm font-bold">
              Upload do Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {config.logoUrl && (
              <button
                type="button"
                onClick={() => setConfig({ ...config, logoUrl: "" })}
                className="px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] text-sm font-bold text-[oklch(0.55_0.24_25)]"
              >
                Remover Logo
              </button>
            )}
          </div>
          {config.logoUrl ? (
            <div className="rounded-2xl border border-[oklch(0.9_0.02_85)] p-4 bg-[oklch(0.99_0.01_85)]">
              <p className="text-xs font-bold text-[oklch(0.35_0.02_260)]/70 mb-3">Pré-visualização do logo</p>
              <img src={config.logoUrl} alt="Logo da empresa" className="h-20 max-w-full object-contain rounded-xl" />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[oklch(0.9_0.02_85)] p-4 text-sm text-[oklch(0.35_0.02_260)]/65">
              Nenhum logo enviado ainda.
            </div>
          )}
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[oklch(0.35_0.02_260)]">Favicon do Site</label>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.98_0.01_85)] cursor-pointer text-sm font-bold">
              Upload do Favicon
              <input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
            </label>
            {config.faviconUrl && (
              <button
                type="button"
                onClick={() => setConfig({ ...config, faviconUrl: "" })}
                className="px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] text-sm font-bold text-[oklch(0.55_0.24_25)]"
              >
                Remover Favicon
              </button>
            )}
          </div>
          {config.faviconUrl ? (
            <div className="rounded-2xl border border-[oklch(0.9_0.02_85)] p-4 bg-[oklch(0.99_0.01_85)]">
              <p className="text-xs font-bold text-[oklch(0.35_0.02_260)]/70 mb-3">Pré-visualização do favicon</p>
              <img src={config.faviconUrl} alt="Favicon do site" className="w-12 h-12 object-contain rounded-lg bg-white border border-[oklch(0.9_0.02_85)] p-1" />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[oklch(0.9_0.02_85)] p-4 text-sm text-[oklch(0.35_0.02_260)]/65">
              Nenhum favicon enviado ainda.
            </div>
          )}
        </div>
        {field("Cor Primária", "primaryColor", "color")}
        {field("Mensagem de Boas-vindas (CRM)", "welcomeMsg", "text", "Bem-vindo ao painel Sonho Mágico!")}
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6 space-y-4">
        <h3 className="font-bold text-[oklch(0.18_0.02_260)] mb-2">Redes Sociais</h3>
        {field("Instagram", "instagram", "url", "https://instagram.com/...")}
        {field("WhatsApp Link", "whatsapp", "url", "https://wa.me/...")}
      </div>
      <button
        onClick={handleSave}
        className="px-8 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-105 transition-transform shadow-lg"
      >
        {saved ? "✅ Salvo!" : "Salvar Configurações"}
      </button>
    </div>
  );
}

function DashboardHome() {
  const { events, users, quotes } = useAuth();
  const clientUsers = users.filter((u) => u.role === "client");
  const confirmed = events.filter((e) => e.status === "confirmed");
  const pending = events.filter((e) => e.status === "pending");
  const completed = events.filter((e) => e.status === "completed");
  const totalRev = events.reduce((s, e) => s + (e.budget || 0), 0);
  const approvedQ = quotes.filter((q) => q.status === "approved").length;

  // Gráfico de barras: eventos por mês (mock disperso com dados reais + extras)
  const now = new Date();
  const barData = MONTHS.map((m, i) => {
    const count = events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === i;
    }).length;
    // adiciona leve variação mock para meses vazios ficarem interessantes
    return { mes: m, eventos: count + (i <= now.getMonth() ? Math.round(Math.random() * 2) : 0) };
  });

  // Gráfico pizza: distribuição de serviços
  const serviceMap: Record<string, number> = {};
  events.forEach((e) => { serviceMap[e.service] = (serviceMap[e.service] || 0) + 1; });
  const pieData = Object.entries(serviceMap).map(([name, value]) => ({ name, value }));
  if (pieData.length === 0) {
    ["Personagens Kids", "Recreação", "Magic Drinks Kids", "Brinquedos", "Carreta Furacão"]
      .forEach((s, i) => pieData.push({ name: s, value: [5, 3, 2, 4, 1][i] }));
  }

  // Próximos eventos
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= new Date() && e.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Clientes recentes
  const recentClients = [...clientUsers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const kpis = [
    { label: "Clientes", value: clientUsers.length, icon: Users, color: "from-[oklch(0.88_0.18_85)] to-[oklch(0.72_0.22_55)]", trend: "+3", up: true },
    { label: "Confirmados", value: confirmed.length, icon: CheckCircle2, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]", trend: "+1", up: true },
    { label: "Pendentes", value: pending.length, icon: AlertCircle, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]", trend: "-2", up: false },
    { label: "Realizados", value: completed.length, icon: Star, color: "from-[oklch(0.55_0.22_262)] to-[oklch(0.38_0.22_262)]", trend: "+5", up: true },
    { label: "Orçamentos ✓", value: approvedQ, icon: FileText, color: "from-[oklch(0.72_0.22_55)] to-[oklch(0.55_0.28_340)]", trend: "+1", up: true },
    { label: "Receita", value: `R$\u00A0${(totalRev / 1000).toFixed(1)}k`, icon: DollarSign, color: "from-[oklch(0.38_0.22_262)] to-[oklch(0.55_0.28_340)]", trend: "+8%", up: true },
  ];

  const statusColors: Record<string, string> = {
    pending: "oklch(0.72 0.22 55)",
    confirmed: "oklch(0.65 0.25 145)",
    completed: "oklch(0.55 0.22 262)",
    cancelled: "oklch(0.55 0.02 260)",
  };
  const statusLabels: Record<string, string> = {
    pending: "Pendente", confirmed: "Confirmado", completed: "Realizado", cancelled: "Cancelado"
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Visão Geral
        </h2>
        <p className="text-sm text-[oklch(0.45_0.02_260)] mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, trend, up }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}>
            <div className="absolute -top-3 -right-3 opacity-20">
              <Icon size={56} />
            </div>
            <p className="text-xs font-semibold opacity-80 mb-1">{label}</p>
            <p className="text-2xl font-extrabold">{value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${up ? "text-white/90" : "text-white/70"}`}>
              {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend} este mês
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Barras */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Eventos por Mês</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.95 0.01 85)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Bar dataKey="eventos" fill="oklch(0.55 0.28 340)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pizza */}
        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Serviços</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={false}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="truncate text-[oklch(0.35_0.02_260)]">{d.name}</span>
                <span className="ml-auto font-bold text-[oklch(0.18_0.02_260)]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Próximos Eventos + Clientes Recentes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Próximos Eventos */}
        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[oklch(0.55_0.28_340)]" />
            Próximos Eventos
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-[oklch(0.55_0.02_260)]">Nenhum evento futuro cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((ev) => {
                const client = users.find((u) => u.id === ev.clientId);
                const daysLeft = Math.ceil((new Date(ev.date).getTime() - Date.now()) / 86400000);
                return (
                  <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-[oklch(0.98_0.005_85)] border border-[oklch(0.94_0.02_85)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${statusColors[ev.status]}22`, color: statusColors[ev.status] }}>
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[oklch(0.18_0.02_260)] truncate">{ev.title}</p>
                      <p className="text-xs text-[oklch(0.55_0.02_260)] truncate">{client?.name} · {ev.location}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: statusColors[ev.status] }}>
                        {daysLeft === 0 ? "Hoje!" : daysLeft === 1 ? "Amanhã" : `${daysLeft}d`}
                      </p>
                      <p className="text-xs text-[oklch(0.55_0.02_260)]">{new Date(ev.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clientes Recentes */}
        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 flex items-center gap-2">
            <Users size={18} className="text-[oklch(0.65_0.25_145)]" />
            Clientes Recentes
          </h3>
          {recentClients.length === 0 ? (
            <p className="text-sm text-[oklch(0.55_0.02_260)]">Nenhum cliente cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map((c, i) => {
                const clientEvents = events.filter((e) => e.clientId === c.id).length;
                const initials = c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                const colors = ["oklch(0.55 0.28 340)", "oklch(0.65 0.25 145)", "oklch(0.55 0.22 262)", "oklch(0.72 0.22 55)", "oklch(0.38 0.22 262)"];
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[oklch(0.18_0.02_260)] truncate">{c.name}</p>
                      <p className="text-xs text-[oklch(0.55_0.02_260)] truncate">{c.email}</p>
                    </div>
                    <span className="text-xs font-bold text-[oklch(0.55_0.28_340)] flex-shrink-0">
                      {clientEvents} evento{clientEvents !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout, events, quotes, users, validateSuperAdminPassword, isLoading } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();
  const { hasPermission } = useAdminPermissions();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => loadCompanyConfig());

  useEffect(() => { setSidebarOpen(false); }, [activeTab]);
  useEffect(() => {
    const syncConfig = () => setCompanyConfig(loadCompanyConfig());
    window.addEventListener("storage", syncConfig);
    window.addEventListener("smj-config-updated", syncConfig);
    return () => {
      window.removeEventListener("storage", syncConfig);
      window.removeEventListener("smj-config-updated", syncConfig);
    };
  }, []);
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

  if (user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    toast.success("Logout realizado com sucesso");
  };

  const navItems = [...NAV_ITEMS].filter((n) => {
    if (n.id === "settings") return isSuperAdmin;
    return hasPermission(n.id);
  });
  const ActiveTabComponent = TAB_COMPONENTS[activeTab];
  useEffect(() => {
    if (!navItems.some((item) => item.id === activeTab) && navItems[0]) {
      setActiveTab(navItems[0].id);
    }
  }, [activeTab, navItems]);
  const groups: Record<string, typeof NAV_ITEMS> = {};
  navItems.forEach((n) => { const g = n.group || "outros"; groups[g] = [...(groups[g] || []), n]; });

  const groupLabels: Record<string, string> = {
    principal: "Principal",
    dados: "Dados",
    extras: "Extras",
  };

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const renderSidebar = (mobile = false) => (
    <aside className={mobile
      ? "flex flex-col h-full"
      : "hidden lg:flex flex-col fixed inset-y-0 left-0 w-56 bg-[oklch(0.13_0.02_260)] z-30"
    }>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        {companyConfig.logoUrl ? (
          <img
            src={companyConfig.logoUrl}
            alt={companyConfig.companyName || "Sonho Mágico"}
            className="w-9 h-9 rounded-xl object-contain bg-white/95 p-1 flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-[oklch(0.18_0.02_260)] text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, oklch(0.88 0.18 85), oklch(0.72 0.22 55))" }}>
            ✨
          </div>
        )}
        <div>
          <p className="text-white font-extrabold text-sm leading-tight" style={{ fontFamily: "'Baloo 2', cursive" }}>
            {companyConfig.companyName || "Sonho Mágico"}
          </p>
          <p className="text-white/40 text-xs">CRM Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {Object.entries(groups).map(([groupKey, items]) => (
          <div key={groupKey}>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 mb-1">
              {groupLabels[groupKey] || groupKey}
            </p>
            <div className="space-y-0.5">
              {items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id
                    ? "bg-[oklch(0.55_0.28_340)] text-white shadow-md"
                    : "text-white/55 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon size={17} />
                  {label}
                  {activeTab === id && <ChevronRight size={14} className="ml-auto opacity-70" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">{user.name}</p>
            {isSuperAdmin && <p className="text-[oklch(0.65_0.25_145)] text-[10px] font-bold">Super Admin</p>}
          </div>
        </div>
        {!isSuperAdmin && (
          <button
            onClick={() => setShowSuperAdminModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-xs font-bold transition-all mb-1"
          >
            <Lock size={14} />
            Modo Super Admin
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] flex">
      {/* Sidebar Desktop */}
      {renderSidebar()}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 bg-[oklch(0.13_0.02_260)] h-full z-50 flex flex-col shadow-2xl">
            {renderSidebar(true)}
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col lg:ml-56 min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-[oklch(0.92_0.02_85)] sticky top-0 z-20 flex items-center h-14 px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[oklch(0.97_0.01_85)] transition-colors"
          >
            <Menu size={20} className="text-[oklch(0.18_0.02_260)]" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[oklch(0.55_0.02_260)]">Admin</span>
            <ChevronRight size={14} className="text-[oklch(0.75_0.02_260)]" />
            <span className="font-bold text-[oklch(0.18_0.02_260)]">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {isSuperAdmin && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[oklch(0.65_0.25_145)] text-white text-xs font-bold">
                🔓 Super Admin
              </span>
            )}
            <Suspense fallback={null}>
              <NotificationsPanel />
            </Suspense>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard" && <DashboardHome />}
          {ActiveTabComponent && (
            <Suspense fallback={<ModuleLoader />}>
              <ActiveTabComponent />
            </Suspense>
          )}
          {activeTab === "settings" && isSuperAdmin && <SettingsModule onConfigSaved={setCompanyConfig} />}
        </main>
      </div>

      {/* Super Admin Modal */}
      <Suspense fallback={null}>
        <SuperAdminModal
          isOpen={showSuperAdminModal}
          onClose={() => setShowSuperAdminModal(false)}
          onValidate={validateSuperAdminPassword}
        />
      </Suspense>
    </div>
  );
}
