/**
 * ReportsModule — Sonho Mágico Joinville CRM
 * Relatórios com gráficos, ranking e exportação
 */
import { useState } from "react";
import { Download, BarChart3, Users, Briefcase, TrendingUp, Sparkles, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ReportTab = "revenue" | "events" | "clients" | "services";

const SERVICES = ["Personagens Kids", "Recreação", "Magic Drinks Kids", "Brinquedos", "Carreta Furacão"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const AVATAR_COLORS = [
  "bg-[oklch(0.55_0.28_340)]", // 1o
  "bg-[oklch(0.65_0.25_145)]", // 2o
  "bg-[oklch(0.55_0.22_262)]", // 3o
  "bg-[oklch(0.72_0.22_55)]",  // 4o
  "bg-[oklch(0.38_0.22_262)]"  // 5o
];

const SERVICE_COLORS: Record<string, string> = {
  "Personagens Kids": "bg-[oklch(0.65_0.25_145/0.15)] text-[oklch(0.45_0.25_145)] border border-[oklch(0.65_0.25_145/0.2)]",
  "Recreação": "bg-[oklch(0.55_0.28_340/0.15)] text-[oklch(0.55_0.28_340)] border border-[oklch(0.55_0.28_340/0.2)]",
  "Magic Drinks Kids": "bg-[oklch(0.72_0.22_55/0.2)] text-[oklch(0.52_0.22_55)] border border-[oklch(0.72_0.22_55/0.3)]",
  "Brinquedos": "bg-[oklch(0.55_0.22_262/0.15)] text-[oklch(0.45_0.22_262)] border border-[oklch(0.55_0.22_262/0.2)]",
  "Carreta Furacão": "bg-[oklch(0.38_0.22_262/0.15)] text-[oklch(0.38_0.22_262)] border border-[oklch(0.38_0.22_262/0.2)]",
};

export default function ReportsModule() {
  const { events, users } = useAuth();
  const [tab, setTab] = useState<ReportTab>("revenue");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const clientUsers = users.filter((u) => u.role === "client");

  const [year, month] = selectedMonth.split("-");
  const monthEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === +year && d.getMonth() === +month - 1 && e.status !== "cancelled";
  });
  
  const monthRevenue = monthEvents.reduce((s, e) => s + (e.budget || 0), 0);
  const monthConfirmed = monthEvents.filter((e) => e.status === "confirmed").length;
  const monthCompleted = monthEvents.filter((e) => e.status === "completed").length;
  const avgTicket = monthEvents.length ? monthRevenue / monthEvents.length : 0;

  // Insight Generator
  const getInsight = () => {
     if (monthEvents.length === 0) return "O mês ainda não possui eventos registrados. Foque na prospecção para movimentar o caixa!";
     if (avgTicket > 800) return "Desempenho Excelente! O ticket médio está alto neste mês, indicando pacotes robustos ou clientes premium sendo fechados.";
     if (monthCompleted > monthConfirmed) return "Você está com um alto volume de execuções. Ótimo mês de colheita!";
     return "Ritmo estável. Continue garantindo a qualidade nas entregas e oferecendo upgrades (cross-sell) para tentar elevar o ticket médio.";
  };

  // Receita mensal (bar chart)
  const revenueByMonth = MONTHS.map((m, i) => ({
    mes: m,
    receita: events.filter((e) => new Date(e.date).getMonth() === i && e.status !== "cancelled").reduce((s, e) => s + (e.budget || 0), 0),
  }));

  // Serviços
  const serviceStats = SERVICES.map((s) => {
    const evs = events.filter((e) => e.service === s && e.status !== "cancelled");
    return { service: s.split(" ")[0], full: s, count: evs.length, revenue: evs.reduce((acc, e) => acc + (e.budget || 0), 0) };
  }).sort((a, b) => b.count - a.count);

  // Radar de serviços
  const radarData = serviceStats.map((s) => ({ service: s.service, eventos: s.count }));

  // Top clientes
  const topClients = clientUsers
    .map((c) => ({
      ...c,
      eventCount: events.filter((e) => e.clientId === c.id && e.status !== "cancelled").length,
      totalSpent: events.filter((e) => e.clientId === c.id && e.status !== "cancelled").reduce((s, e) => s + (e.budget || 0), 0),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .filter(c => c.totalSpent > 0)
    .slice(0, 5);

  const handleExport = () => {
    const lines = [
      `RELATÓRIO SONHO MÁGICO JOINVILLE — \${selectedMonth}`,
      `Gerado em: \${new Date().toLocaleString("pt-BR")}`,
      "",
      `=== RESUMO DO MÊS ===`,
      `Total de Eventos: \${monthEvents.length}`,
      `Confirmados: \${monthConfirmed} | Realizados: \${monthCompleted}`,
      `Receita Total: R$ \${monthRevenue.toFixed(2)}`,
      `Ticket Médio: R$ \${avgTicket.toFixed(2)}`,
      "",
      `=== EVENTOS ===`,
      ...monthEvents.map((e) => `• \${e.title} | \${new Date(e.date).toLocaleDateString("pt-BR")} | \${e.location} | R$ \${e.budget || 0}`),
      "",
      `=== TOP CLIENTES ===`,
      ...topClients.map((c, i) => `\${i + 1}. \${c.name} — \${c.eventCount} eventos | R$ \${c.totalSpent.toFixed(2)}`),
      "",
      `=== SERVIÇOS ===`,
      ...serviceStats.filter(s => s.count > 0).map((s) => `• \${s.full}: \${s.count} eventos | R$ \${s.revenue.toFixed(2)}`),
    ];
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" })),
      download: `relatorio-\${selectedMonth}.txt`,
    });
    a.click();
    toast.success("Relatório exportado com sucesso!");
  };

  const TABS: { id: ReportTab; label: string; icon: any }[] = [
    { id: "revenue", label: "Visão Geral & Receita", icon: TrendingUp },
    { id: "events", label: "Eventos do Mês", icon: BarChart3 },
    { id: "clients", label: "Top Clientes", icon: Users },
    { id: "services", label: "Performance de Serviços", icon: Briefcase },
  ];

  const inputCls = "px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm bg-white transition-all font-bold text-[oklch(0.45_0.02_260)]";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          📊 Painel Analítico
        </h2>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase tracking-wide">Ref:</span>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={inputCls} />
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-[1.02] transition-transform text-sm shadow-md">
            <Download size={16} /> Exportar TXT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-[oklch(0.92_0.02_85)] pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
             className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all text-sm font-extrabold \${tab === id ? "border-[oklch(0.55_0.28_340)] text-[oklch(0.55_0.28_340)]" : "border-transparent text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.18_0.02_260)]"}`}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {/* RECEITA */}
      {tab === "revenue" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* INSIGHT BOX */}
          <div className="bg-gradient-to-r from-[oklch(0.98_0.005_85)] to-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] p-5 flex gap-4 items-center">
             <div className="w-12 h-12 rounded-2xl bg-[oklch(0.55_0.28_340/0.1)] flex items-center justify-center flex-shrink-0">
               <Sparkles className="text-[oklch(0.55_0.28_340)]" size={24} />
             </div>
             <div>
               <h4 className="font-extrabold text-[oklch(0.18_0.02_260)] text-sm mb-1 uppercase tracking-wide">Insight Financeiro</h4>
               <p className="text-sm text-[oklch(0.45_0.02_260)] leading-relaxed">{getInsight()}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Receita do Mês", value: `R$ \${monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]" },
              { label: "Eventos Confirmados", value: monthConfirmed, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]" },
              { label: "Eventos Realizados", value: monthCompleted, color: "from-[oklch(0.55_0.22_262)] to-[oklch(0.38_0.22_262)]" },
              { label: "Ticket Médio", value: `R$ \${avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "from-[oklch(0.72_0.22_55)] to-[oklch(0.88_0.18_85)]" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-gradient-to-br \${color} rounded-3xl shadow-sm p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] opacity-80 mb-2">{label}</p>
                <p className="text-3xl font-extrabold z-10 relative">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-6">
            <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-6 text-lg">Evolução da Receita Anual</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueByMonth} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.95 0.01 85)" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "oklch(0.45 0.02 260)", fontWeight: "bold" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "oklch(0.45 0.02 260)" }} tickFormatter={(v) => `R$\${(v / 1000).toFixed(0)}k`} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid oklch(0.9 0.02 85)", boxShadow: "0 10px 30px rgba(0,0,0,.08)", fontWeight: "bold" }}
                  formatter={(v: number) => [`R$ \${v.toLocaleString("pt-BR", {minimumFractionDigits:2})}`, "Receita"]} cursor={{fill: "oklch(0.98 0.005 85)"}} />
                <Bar dataKey="receita" fill="oklch(0.55 0.28 340)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* EVENTOS */}
      {tab === "events" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] overflow-hidden">
            <div className="p-6 border-b border-[oklch(0.92_0.02_85)] flex justify-between items-center bg-[oklch(0.99_0.005_85)]">
              <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] text-lg">Listagem de Eventos do Mês</h3>
              <div className="text-sm font-bold text-[oklch(0.45_0.02_260)] bg-white px-3 py-1 rounded-lg border border-[oklch(0.9_0.02_85)]">
                Total: {monthEvents.length}
              </div>
            </div>
            {monthEvents.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-[oklch(0.98_0.005_85)] flex items-center justify-center mb-4">
                   <BarChart3 className="text-[oklch(0.45_0.02_260)]" size={32} />
                 </div>
                 <p className="font-extrabold text-[oklch(0.18_0.02_260)]">Nenhum evento registrado</p>
                 <p className="text-[oklch(0.45_0.02_260)] text-sm mt-1">Ainda não há eventos previstos ou realizados neste mês.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[oklch(0.97_0.01_85)] border-b border-[oklch(0.92_0.02_85)]">
                    <th className="text-left px-6 py-4 text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase tracking-wider">Título / Local</th>
                    <th className="text-left px-6 py-4 text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase tracking-wider hidden sm:table-cell">Data</th>
                    <th className="text-left px-6 py-4 text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase tracking-wider hidden md:table-cell">Serviço</th>
                    <th className="text-right px-6 py-4 text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase tracking-wider">Valor Recebido</th>
                  </tr></thead>
                  <tbody className="divide-y divide-[oklch(0.95_0.01_85)]">
                    {monthEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((e) => (
                      <tr key={e.id} className="hover:bg-[oklch(0.99_0.005_85)] transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-[oklch(0.18_0.02_260)]">{e.title}</p>
                          <p className="text-xs text-[oklch(0.45_0.02_260)] mt-0.5">{e.location}</p>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="font-bold text-[oklch(0.18_0.02_260)]">{new Date(e.date).toLocaleDateString("pt-BR")}</span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase \${SERVICE_COLORS[e.service] || "bg-gray-100 text-gray-600"}`}>
                            {e.service}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-extrabold text-[oklch(0.55_0.28_340)] text-base">R$ {(e.budget || 0).toLocaleString("pt-BR", {minimumFractionDigits: 2})}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CLIENTES */}
      {tab === "clients" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] overflow-hidden">
             <div className="p-6 border-b border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)] flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                 <Award className="text-amber-600" size={20} />
               </div>
               <div>
                 <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] text-lg">Top 5 Clientes MVP</h3>
                 <p className="text-xs text-[oklch(0.45_0.02_260)] font-medium">Os clientes que mais investiram em eventos ao longo da história.</p>
               </div>
             </div>
             
             {topClients.length === 0 ? (
               <div className="p-12 text-center text-[oklch(0.55_0.02_260)] text-sm font-medium">Você precisa registrar eventos com orçamento primeiro para gerar este ranking.</div>
             ) : (
               <div className="p-6 grid grid-cols-1 gap-4">
                 {topClients.map((c, i) => {
                   const maxSpent = topClients[0].totalSpent || 1;
                   const pct = Math.round((c.totalSpent / maxSpent) * 100);
                   return (
                     <div key={c.id} className="p-4 rounded-2xl border border-[oklch(0.92_0.02_85)] bg-white shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0 shadow-inner \${AVATAR_COLORS[i]}`}>
                         #{i + 1}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-2">
                           <p className="font-extrabold text-[oklch(0.18_0.02_260)] text-lg truncate">{c.name}</p>
                           <p className="font-extrabold text-[oklch(0.55_0.28_340)] text-xl flex-shrink-0">R$ {c.totalSpent.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</p>
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="flex-1 h-2 rounded-full bg-[oklch(0.94_0.02_85)] overflow-hidden">
                             <div className={`h-full rounded-full transition-all \${AVATAR_COLORS[i]}`} style={{ width: `\${pct}%` }} />
                           </div>
                           <span className="text-xs font-extrabold text-[oklch(0.45_0.02_260)] bg-[oklch(0.97_0.01_85)] px-2 py-1 rounded-md uppercase flex-shrink-0">{c.eventCount} evento{c.eventCount !== 1 ? "s" : ""}</span>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
        </div>
      )}

      {/* SERVIÇOS */}
      {tab === "services" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-6">
            <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 text-lg">Distribuição de Contratos</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(0.9 0.02 85)" />
                <PolarAngleAxis dataKey="service" tick={{ fontSize: 12, fontWeight: "bold", fill: "oklch(0.45 0.02 260)" }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Radar dataKey="eventos" stroke="oklch(0.55 0.28 340)" fill="oklch(0.55 0.28 340)" fillOpacity={0.3} strokeWidth={3} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid oklch(0.9 0.02 85)", boxShadow: "0 4px 20px rgba(0,0,0,.1)", fontWeight: "bold" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            {serviceStats.map((s, i) => {
              const maxCount = serviceStats[0].count || 1;
              const pct = Math.round((s.count / maxCount) * 100);
              return (
                <div key={s.full} className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className={`absolute top-0 left-0 w-1.5 h-full \${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}></div>
                  <div className="flex items-center justify-between mb-3 pl-2">
                    <p className="font-extrabold text-[oklch(0.18_0.02_260)]">{s.full}</p>
                    <span className="text-[10px] font-extrabold text-[oklch(0.45_0.02_260)] uppercase tracking-wider bg-[oklch(0.95_0.01_85)] px-2 py-1 rounded-md">{s.count} evento{s.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[oklch(0.94_0.02_85)] mb-3 ml-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all \${AVATAR_COLORS[i % AVATAR_COLORS.length]}`} style={{ width: `\${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-end pl-2">
                     <p className="text-xs font-bold text-[oklch(0.45_0.02_260)]">Receita Total:<br/><span className="text-base text-[oklch(0.55_0.28_340)]">R$ {s.revenue.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</span></p>
                     <p className="text-[10px] font-medium text-[oklch(0.55_0.02_260)] text-right">Ticket Médio:<br/><strong className="text-[oklch(0.18_0.02_260)]">R$ {s.count ? (s.revenue / s.count).toLocaleString("pt-BR", {minimumFractionDigits: 2}) : "0,00"}</strong></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
