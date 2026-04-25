/**
 * ReportsModule — Sonho Mágico Joinville CRM
 * Relatórios com gráficos, ranking e exportação
 */
import { useState } from "react";
import { Download, BarChart3, Users, Briefcase, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ReportTab = "revenue" | "events" | "clients" | "services";

const SERVICES = ["Personagens Kids", "Recreação", "Magic Drinks Kids", "Brinquedos", "Carreta Furacão"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const AVATAR_COLORS = ["oklch(0.55 0.28 340)", "oklch(0.65 0.25 145)", "oklch(0.55 0.22 262)", "oklch(0.72 0.22 55)", "oklch(0.38 0.22 262)"];

export default function ReportsModule() {
  const { events, users, quotes } = useAuth();
  const [tab, setTab] = useState<ReportTab>("revenue");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const clientUsers = users.filter((u) => u.role === "client");

  const [year, month] = selectedMonth.split("-");
  const monthEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === +year && d.getMonth() === +month - 1;
  });
  const monthRevenue = monthEvents.reduce((s, e) => s + (e.budget || 0), 0);
  const monthConfirmed = monthEvents.filter((e) => e.status === "confirmed").length;
  const monthCompleted = monthEvents.filter((e) => e.status === "completed").length;
  const avgTicket = monthEvents.length ? monthRevenue / monthEvents.length : 0;

  // Receita mensal (bar chart)
  const revenueByMonth = MONTHS.map((m, i) => ({
    mes: m,
    receita: events.filter((e) => new Date(e.date).getMonth() === i).reduce((s, e) => s + (e.budget || 0), 0),
  }));

  // Serviços
  const serviceStats = SERVICES.map((s) => {
    const evs = events.filter((e) => e.service === s);
    return { service: s.split(" ")[0], full: s, count: evs.length, revenue: evs.reduce((acc, e) => acc + (e.budget || 0), 0) };
  }).sort((a, b) => b.count - a.count);

  // Radar de serviços
  const radarData = serviceStats.map((s) => ({ service: s.service, eventos: s.count }));

  // Top clientes
  const topClients = clientUsers
    .map((c) => ({
      ...c,
      eventCount: events.filter((e) => e.clientId === c.id).length,
      totalSpent: events.filter((e) => e.clientId === c.id).reduce((s, e) => s + (e.budget || 0), 0),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const handleExport = () => {
    const lines = [
      `RELATÓRIO SONHO MÁGICO JOINVILLE — ${selectedMonth}`,
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      "",
      `=== RESUMO DO MÊS ===`,
      `Total de Eventos: ${monthEvents.length}`,
      `Confirmados: ${monthConfirmed} | Realizados: ${monthCompleted}`,
      `Receita Total: R$ ${monthRevenue.toFixed(2)}`,
      `Ticket Médio: R$ ${avgTicket.toFixed(2)}`,
      "",
      `=== EVENTOS ===`,
      ...monthEvents.map((e) => `• ${e.title} | ${new Date(e.date).toLocaleDateString("pt-BR")} | ${e.location} | R$ ${e.budget || 0}`),
      "",
      `=== TOP CLIENTES ===`,
      ...topClients.map((c, i) => `${i + 1}. ${c.name} — ${c.eventCount} eventos | R$ ${c.totalSpent.toFixed(2)}`),
      "",
      `=== SERVIÇOS ===`,
      ...serviceStats.filter(s => s.count > 0).map((s) => `• ${s.full}: ${s.count} eventos | R$ ${s.revenue.toFixed(2)}`),
    ];
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" })),
      download: `relatorio-${selectedMonth}.txt`,
    });
    a.click();
    toast.success("Relatório exportado!");
  };

  const TABS: { id: ReportTab; label: string; icon: any }[] = [
    { id: "revenue", label: "Receita", icon: TrendingUp },
    { id: "events", label: "Eventos", icon: BarChart3 },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "services", label: "Serviços", icon: Briefcase },
  ];

  const inputCls = "px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] text-sm bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          📊 Relatórios e Análises
        </h2>
        <div className="flex gap-3 items-center flex-wrap">
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={inputCls} />
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
            <Download size={15} /> Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap p-1 bg-[oklch(0.94_0.01_85)] rounded-2xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${tab === id ? "bg-white shadow-md text-[oklch(0.55_0.28_340)]" : "text-[oklch(0.55_0.02_260)] hover:text-[oklch(0.18_0.02_260)]"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* RECEITA */}
      {tab === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Receita do Mês", value: `R$ ${monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]" },
              { label: "Confirmados", value: monthConfirmed, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]" },
              { label: "Realizados", value: monthCompleted, color: "from-[oklch(0.55_0.22_262)] to-[oklch(0.38_0.22_262)]" },
              { label: "Ticket Médio", value: `R$ ${avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "from-[oklch(0.72_0.22_55)] to-[oklch(0.88_0.18_85)]" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-5 text-white`}>
                <p className="text-xs font-semibold opacity-80">{label}</p>
                <p className="text-2xl font-extrabold mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
            <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Receita por Mês (ano corrente)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueByMonth} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.95 0.01 85)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}
                  formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Receita"]} />
                <Bar dataKey="receita" fill="oklch(0.55 0.28 340)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* EVENTOS */}
      {tab === "events" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total", value: monthEvents.length, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]" },
              { label: "Confirmados", value: monthConfirmed, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]" },
              { label: "Realizados", value: monthCompleted, color: "from-[oklch(0.55_0.22_262)] to-[oklch(0.38_0.22_262)]" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white`}>
                <p className="text-xs opacity-80">{label}</p>
                <p className="text-3xl font-extrabold mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] overflow-hidden">
            <div className="p-5 border-b border-[oklch(0.92_0.02_85)]">
              <h3 className="font-extrabold text-[oklch(0.18_0.02_260)]">Eventos de {MONTHS[+month - 1]} / {year}</h3>
            </div>
            {monthEvents.length === 0 ? (
              <div className="p-8 text-center text-[oklch(0.55_0.02_260)] text-sm">Nenhum evento neste mês</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-[oklch(0.97_0.01_85)]">
                  <th className="text-left px-5 py-2.5 text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">Evento</th>
                  <th className="text-left px-5 py-2.5 text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase hidden sm:table-cell">Data</th>
                  <th className="text-left px-5 py-2.5 text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase hidden md:table-cell">Serviço</th>
                  <th className="text-right px-5 py-2.5 text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">Valor</th>
                </tr></thead>
                <tbody>
                  {monthEvents.map((e) => (
                    <tr key={e.id} className="border-t border-[oklch(0.95_0.01_85)] hover:bg-[oklch(0.98_0.005_85)]">
                      <td className="px-5 py-3 font-semibold text-[oklch(0.18_0.02_260)]">{e.title}</td>
                      <td className="px-5 py-3 text-[oklch(0.45_0.02_260)] hidden sm:table-cell">{new Date(e.date).toLocaleDateString("pt-BR")}</td>
                      <td className="px-5 py-3 hidden md:table-cell"><span className="px-2 py-0.5 rounded-full bg-[oklch(0.94_0.02_85)] text-[oklch(0.45_0.02_260)] text-xs font-bold">{e.service}</span></td>
                      <td className="px-5 py-3 text-right font-extrabold text-[oklch(0.55_0.28_340)]">R$ {(e.budget || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CLIENTES */}
      {tab === "clients" && (
        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] overflow-hidden">
          <div className="p-5 border-b border-[oklch(0.92_0.02_85)]">
            <h3 className="font-extrabold text-[oklch(0.18_0.02_260)]">Top 5 Clientes por Receita</h3>
          </div>
          {topClients.length === 0 ? (
            <div className="p-8 text-center text-[oklch(0.55_0.02_260)] text-sm">Nenhum cliente com eventos</div>
          ) : (
            <div className="divide-y divide-[oklch(0.95_0.01_85)]">
              {topClients.map((c, i) => {
                const maxSpent = topClients[0].totalSpent || 1;
                const pct = Math.round((c.totalSpent / maxSpent) * 100);
                return (
                  <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
                      style={{ backgroundColor: AVATAR_COLORS[i] }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-[oklch(0.18_0.02_260)] truncate">{c.name}</p>
                        <p className="font-extrabold text-[oklch(0.55_0.28_340)] ml-3 flex-shrink-0">R$ {c.totalSpent.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-[oklch(0.92_0.02_85)]">
                          <div className="h-full rounded-full bg-[oklch(0.55_0.28_340)]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[oklch(0.55_0.02_260)] flex-shrink-0">{c.eventCount} evento{c.eventCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SERVIÇOS */}
      {tab === "services" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
            <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Eventos por Serviço</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(0.9 0.02 85)" />
                <PolarAngleAxis dataKey="service" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Radar dataKey="eventos" stroke="oklch(0.55 0.28 340)" fill="oklch(0.55 0.28 340)" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {serviceStats.map((s, i) => {
              const maxCount = serviceStats[0].count || 1;
              const pct = Math.round((s.count / maxCount) * 100);
              return (
                <div key={s.full} className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-extrabold text-[oklch(0.18_0.02_260)] text-sm">{s.full}</p>
                    <span className="text-xs font-bold text-[oklch(0.45_0.02_260)]">{s.count} evento{s.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[oklch(0.92_0.02_85)] mb-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }} />
                  </div>
                  <p className="text-xs text-[oklch(0.55_0.02_260)]">Receita: <span className="font-bold text-[oklch(0.45_0.22_340)]">R$ {s.revenue.toFixed(2)}</span> · Ticket médio: R$ {s.count ? (s.revenue / s.count).toFixed(2) : "0,00"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
