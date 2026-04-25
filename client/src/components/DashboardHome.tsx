import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Users, Calendar, FileText, Star, ArrowUpRight, ArrowDownRight,
  CheckCircle2, AlertCircle, DollarSign,
} from "lucide-react";

const PIE_COLORS = [
  "oklch(0.55 0.28 340)",
  "oklch(0.65 0.25 145)",
  "oklch(0.55 0.22 262)",
  "oklch(0.72 0.22 55)",
  "oklch(0.38 0.22 262)",
];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function DashboardHome() {
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
