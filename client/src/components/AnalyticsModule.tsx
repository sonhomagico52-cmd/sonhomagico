/**
 * AnalyticsModule — Sonho Mágico Joinville CRM
 * Dashboard analytics com recharts (line + bar + area)
 */
import { useState } from "react";
import { TrendingUp, Users, DollarSign, Calendar, MapPin } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SERVICES = ["Personagens Kids", "Recreação", "Magic Drinks Kids", "Brinquedos", "Carreta Furacão"];
const COLORS = ["oklch(0.55 0.28 340)", "oklch(0.65 0.25 145)", "oklch(0.55 0.22 262)", "oklch(0.72 0.22 55)", "oklch(0.38 0.22 262)"];

export default function AnalyticsModule() {
  const { events, users } = useAuth();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("year");

  const now = new Date();
  const getStart = () => {
    const d = new Date();
    if (timeRange === "week") { d.setDate(d.getDate() - 7); return d; }
    if (timeRange === "month") { d.setMonth(d.getMonth() - 1); return d; }
    d.setFullYear(d.getFullYear() - 1); return d;
  };
  const periodEvents = events.filter((e) => new Date(e.date) >= getStart() && new Date(e.date) <= now);
  const periodRevenue = periodEvents.reduce((s, e) => s + (e.budget || 0), 0);
  const uniqueClients = new Set(periodEvents.map((e) => e.clientId)).size;

  // 6 meses de tendência — receita + contagem
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const evs = events.filter((e) => {
      const ed = new Date(e.date);
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
    });
    return {
      mes: MONTHS_SHORT[d.getMonth()],
      receita: evs.reduce((s, e) => s + (e.budget || 0), 0),
      eventos: evs.length,
      clientes: new Set(evs.map((e) => e.clientId)).size,
    };
  });

  // Eventos por dia da semana
  const byDay = DAYS_PT.map((day, i) => ({
    dia: day,
    eventos: periodEvents.filter((e) => new Date(e.date).getDay() === i).length,
  }));

  // Serviços
  const byService = SERVICES.map((s) => ({
    service: s.replace(" Kids", "").replace("Carreta Furacão", "CarretaF.").replace("Personagens", "Person."),
    full: s,
    count: periodEvents.filter((e) => e.service === s).length,
    receita: periodEvents.filter((e) => e.service === s).reduce((acc, e) => acc + (e.budget || 0), 0),
  })).sort((a, b) => b.count - a.count);

  // Top locais
  const locationMap: Record<string, number> = {};
  periodEvents.forEach((e) => { locationMap[e.location] = (locationMap[e.location] || 0) + 1; });
  const topLocations = Object.entries(locationMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const kpis = [
    { label: "Receita", value: `R$ ${(periodRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]" },
    { label: "Eventos", value: periodEvents.length, icon: Calendar, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]" },
    { label: "Confirmados", value: periodEvents.filter(e => e.status === "confirmed").length, icon: TrendingUp, color: "from-[oklch(0.72_0.22_55)] to-[oklch(0.88_0.18_85)]" },
    { label: "Clientes", value: uniqueClients, icon: Users, color: "from-[oklch(0.55_0.22_262)] to-[oklch(0.38_0.22_262)]" },
  ];

  const selectCls = "px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] text-sm bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          📈 Analytics Avançado
        </h2>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)} className={selectCls}>
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="year">Último Ano</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-5 text-white relative overflow-hidden`}>
            <div className="absolute -top-3 -right-3 opacity-20"><Icon size={52} /></div>
            <p className="text-xs font-semibold opacity-80">{label}</p>
            <p className="text-2xl font-extrabold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Tendência 6 meses — LineChart receita + eventos */}
      <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
        <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Tendência dos Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.95 0.01 85)" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="r" tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} orientation="left" />
            <YAxis yAxisId="e" tick={{ fontSize: 12 }} orientation="right" allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
            <Legend />
            <Line yAxisId="r" type="monotone" dataKey="receita" stroke="oklch(0.55 0.28 340)" strokeWidth={2.5} dot={{ r: 4, fill: "oklch(0.55 0.28 340)" }} name="Receita (R$)" />
            <Line yAxisId="e" type="monotone" dataKey="eventos" stroke="oklch(0.65 0.25 145)" strokeWidth={2.5} dot={{ r: 4, fill: "oklch(0.65 0.25 145)" }} name="Eventos" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dia da semana + Serviços */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Por dia da semana */}
        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Eventos por Dia da Semana</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byDay} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.95 0.01 85)" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
              <Bar dataKey="eventos" fill="oklch(0.55 0.22 262)" radius={[8, 8, 0, 0]} name="Eventos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Serviços mais usados */}
        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Serviços no Período</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byService} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.95 0.01 85)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="service" tick={{ fontSize: 11 }} width={72} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
              <Bar dataKey="count" name="Eventos" radius={[0, 8, 8, 0]}>
                {byService.map((_, i) => (
                  <rect key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Locais + Distribuição de Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 flex items-center gap-2"><MapPin size={16} className="text-[oklch(0.55_0.28_340)]" /> Top Locais</h3>
          {topLocations.length === 0 ? (
            <p className="text-sm text-[oklch(0.55_0.02_260)]">Sem dados no período selecionado.</p>
          ) : (
            <div className="space-y-3">
              {topLocations.map(([loc, count], i) => {
                const pct = Math.round((count / topLocations[0][1]) * 100);
                return (
                  <div key={loc}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-[oklch(0.18_0.02_260)] truncate">{loc}</span>
                      <span className="font-bold text-[oklch(0.55_0.28_340)] ml-2 flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[oklch(0.92_0.02_85)]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Distribuição de Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Confirmados", count: periodEvents.filter(e => e.status === "confirmed").length, color: "oklch(0.65 0.25 145)" },
              { label: "Pendentes", count: periodEvents.filter(e => e.status === "pending").length, color: "oklch(0.72 0.22 55)" },
              { label: "Realizados", count: periodEvents.filter(e => e.status === "completed").length, color: "oklch(0.55 0.22 262)" },
              { label: "Cancelados", count: periodEvents.filter(e => e.status === "cancelled").length, color: "oklch(0.55 0.02 260)" },
            ].map(({ label, count, color }) => (
              <div key={label} className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: `${color}15`, border: `1.5px solid ${color}40` }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <div>
                  <p className="text-2xl font-extrabold" style={{ color }}>{count}</p>
                  <p className="text-xs font-bold text-[oklch(0.45_0.02_260)]">{label}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Mini area chart */}
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.28 340)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.28 340)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="eventos" stroke="oklch(0.55 0.28 340)" fill="url(#aGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
