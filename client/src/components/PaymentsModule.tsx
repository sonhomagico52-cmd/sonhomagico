import React, { useState } from "react";
import {
  CreditCard, Trash2, Plus, TrendingUp, CheckCircle, Clock, XCircle,
  X, Search, LayoutGrid, LayoutList, ChevronRight, FileText, Download, ShieldCheck
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ViewMode = "table" | "cards";

interface Payment {
  id: string; quoteId: string; amount: number;
  status: "pendente" | "processando" | "concluido" | "falho";
  method: "cartao" | "pix" | "boleto";
  timestamp: string; clientName: string;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const STATUS_CONFIG = {
  concluido: { label: "Concluído", icon: CheckCircle, cls: "bg-[oklch(0.65_0.25_145/0.15)] text-[oklch(0.45_0.25_145)] border border-[oklch(0.65_0.25_145/0.2)]", dot: "oklch(0.65 0.25 145)" },
  processando: { label: "Processando", icon: Clock, cls: "bg-[oklch(0.88_0.18_85/0.2)] text-[oklch(0.35_0.08_85)] border border-[oklch(0.88_0.18_85/0.3)]", dot: "oklch(0.72 0.22 55)" },
  pendente: { label: "Pendente", icon: Clock, cls: "bg-[oklch(0.55_0.28_340/0.15)] text-[oklch(0.45_0.22_340)] border border-[oklch(0.55_0.28_340/0.2)]", dot: "oklch(0.55 0.28 340)" },
  falho: { label: "Falho", icon: XCircle, cls: "bg-red-50 text-red-500 border border-red-200", dot: "oklch(0.55 0.22 27)" },
};

const METHOD_ICONS: Record<string, string> = { cartao: "💳", pix: "🟢", boleto: "📄" };
const METHOD_LABELS: Record<string, string> = { cartao: "Cartão de Crédito", pix: "PIX", boleto: "Boleto" };

function buildChartData(payments: Payment[]) {
  return MONTHS.map((mes, i) => {
    const monthPayments = payments.filter((p) => {
      const d = new Date(p.timestamp);
      return d.getMonth() === i && p.status === "concluido";
    });
    const receita = monthPayments.reduce((s, p) => s + p.amount, 0);
    return { mes, receita };
  });
}

function PaymentIcon({ method, size = 40 }: { method: "cartao" | "pix" | "boleto"; size?: number }) {
  const isCartao = method === "cartao";
  const isPix = method === "pix";
  
  return (
    <div
      className={`rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
        isCartao ? "bg-[oklch(0.55_0.28_340/0.1)] border-[oklch(0.55_0.28_340/0.2)]" :
        isPix ? "bg-[oklch(0.65_0.25_145/0.1)] border-[oklch(0.65_0.25_145/0.2)]" :
        "bg-[oklch(0.18_0.02_260/0.1)] border-[oklch(0.18_0.02_260/0.2)]"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {METHOD_ICONS[method]}
    </div>
  );
}

export default function PaymentsModule() {
  const { quotes, users } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  
  const [showForm, setShowForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const [selectedQuote, setSelectedQuote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cartao" | "pix" | "boleto">("cartao");
  
  const [filterStatus, setFilterStatus] = useState<"all" | "pendente" | "processando" | "concluido" | "falho">("all");
  const [search, setSearch] = useState("");

  const approvedQuotes = quotes.filter((q) => q.status === "approved");
  
  const filteredPayments = payments.filter((p) => {
     const matchesStatus = filterStatus === "all" || p.status === filterStatus;
     const term = search.toLowerCase();
     const matchesSearch = p.clientName.toLowerCase().includes(term) || METHOD_LABELS[p.method].toLowerCase().includes(term);
     return matchesStatus && matchesSearch;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalRecebido = payments.filter((p) => p.status === "concluido").reduce((s, p) => s + p.amount, 0);
  const totalPendente = payments.filter((p) => p.status !== "concluido" && p.status !== "falho").reduce((s, p) => s + p.amount, 0);
  const qtdTotal = payments.length;

  const chartData = buildChartData(payments);

  const handleCreatePayment = () => {
    if (!selectedQuote) { toast.error("Selecione um orçamento"); return; }
    const quote = quotes.find((q) => q.id === selectedQuote);
    const client = users.find((u) => u.id === quote?.clientId);
    if (!quote || !client) { toast.error("Orçamento ou cliente não encontrado"); return; }

    const newPayment: Payment = {
      id: Date.now().toString(), quoteId: selectedQuote,
      amount: quote.amount || 0, status: "processando",
      method: paymentMethod, timestamp: new Date().toISOString(), clientName: client.name,
    };
    setPayments((prev) => [newPayment, ...prev]);

    setTimeout(() => {
      setPayments((prev) => prev.map((p) => p.id === newPayment.id ? { ...p, status: "concluido" } : p));
      toast.success("Pagamento processado com sucesso!");
    }, 2000);

    setSelectedQuote(""); setShowForm(false);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm transition-all";

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Recebido (Mês)", value: `R$ ${totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]", icon: CheckCircle },
          { label: "A Receber / Processando", value: `R$ ${totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "from-[oklch(0.72_0.22_55)] to-[oklch(0.88_0.18_85)]", icon: Clock },
          { label: "Total de Transações", value: qtdTotal, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]", icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl shadow-sm p-6 text-white relative overflow-hidden flex flex-col justify-between`}>
            <div className="absolute -top-4 -right-4 opacity-20"><Icon size={80} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] opacity-80 mb-2">{label}</p>
            <p className="text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
         {/* Gráfico */}
         <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-6">
            <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[oklch(0.55_0.28_340)]" /> Histórico de Receita
            </h3>
            {payments.filter(p => p.status === "concluido").length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-[oklch(0.65_0.02_260)]">
                <TrendingUp size={32} className="opacity-20 mb-2" />
                <p className="text-sm font-medium">O gráfico ganhará vida após o primeiro pagamento.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.28 340)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.28 340)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.95 0.01 85)" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "oklch(0.45 0.02 260)" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "oklch(0.45 0.02 260)" }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid oklch(0.9 0.02 85)", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontWeight: "bold" }}
                    formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR", {minimumFractionDigits: 2})}`, "Receita"]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="oklch(0.55 0.28 340)" strokeWidth={3} fill="url(#receitaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
         </div>

         {/* Controles Rapidos */}
         <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-6 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[oklch(0.55_0.28_340/0.05)] rounded-full -translate-y-1/2 translate-x-1/3"></div>
             <h3 className="font-extrabold text-xl text-[oklch(0.18_0.02_260)] mb-2 z-10">Ações Financeiras</h3>
             <p className="text-sm text-[oklch(0.45_0.02_260)] mb-6 z-10">Dê baixa em orçamentos ou acompanhe recebimentos.</p>
             <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-[1.02] transition-transform text-sm shadow-md z-10 w-full">
                <Plus size={18} /> Registrar Novo Pagamento
             </button>
             
             <div className="mt-6 p-4 rounded-xl bg-[oklch(0.98_0.005_85)] border border-[oklch(0.92_0.02_85)] text-xs text-[oklch(0.45_0.02_260)] z-10 flex gap-3">
                <ShieldCheck size={20} className="text-[oklch(0.55_0.22_262)] flex-shrink-0" />
                <p><strong>Modo Simulação Ativo:</strong> As baixas não afetam gateway real até integração com Stripe/MercadoPago.</p>
             </div>
         </div>
      </div>

      {/* FILTROS E PESQUISA */}
      <div className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.99_0.005_85)] flex-1 md:w-[300px]">
              <Search size={16} className="text-[oklch(0.65_0.02_260)]" />
              <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none text-sm flex-1 bg-transparent" />
            </div>
            
            <div className="hidden sm:flex rounded-xl overflow-hidden border border-[oklch(0.9_0.02_85)] bg-white p-1 gap-1">
               {["all", "concluido", "pendente"].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s as any)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? "bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)] shadow-sm" : "text-[oklch(0.45_0.02_260)] hover:bg-gray-50"}`}>
                     {s === "all" ? "Todos" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
                  </button>
               ))}
            </div>
         </div>

         <div className="flex rounded-xl overflow-hidden border border-[oklch(0.9_0.02_85)] w-full md:w-auto">
            <button onClick={() => setViewMode("table")} className={`flex-1 md:flex-none px-4 py-2 transition-colors flex justify-center ${viewMode === "table" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}><LayoutList size={16} /></button>
            <button onClick={() => setViewMode("cards")} className={`flex-1 md:flex-none px-4 py-2 transition-colors flex justify-center ${viewMode === "cards" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}><LayoutGrid size={16} /></button>
         </div>
      </div>

      {/* LISTA DE PAGAMENTOS */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
         {filteredPayments.length === 0 ? (
           <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 rounded-2xl bg-[oklch(0.98_0.005_85)] flex items-center justify-center mb-4">
               <CreditCard size={32} className="text-[oklch(0.45_0.02_260)]" />
             </div>
             <p className="text-[oklch(0.18_0.02_260)] font-extrabold text-lg">Nenhum pagamento localizado</p>
             <p className="text-sm text-[oklch(0.45_0.02_260)] mt-1 max-w-sm">Ajuste os filtros ou registre uma nova entrada financeira.</p>
           </div>
         ) : viewMode === "table" ? (
             <div className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] overflow-hidden">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="bg-[oklch(0.97_0.01_85)] border-b border-[oklch(0.92_0.02_85)]">
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider">Transação</th>
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden md:table-cell">Data</th>
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                     <th className="text-right px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider">Valor</th>
                     <th className="px-5 py-3"></th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredPayments.map((p) => {
                     const cfg = STATUS_CONFIG[p.status];
                     const StatusIcon = cfg.icon;
                     return (
                       <tr key={p.id} className="border-b border-[oklch(0.95_0.01_85)] hover:bg-[oklch(0.98_0.005_85)] transition-colors cursor-pointer group" onClick={() => setSelectedPayment(p)}>
                         <td className="px-5 py-3.5">
                           <div className="flex items-center gap-3">
                             <PaymentIcon method={p.method} />
                             <div>
                               <p className="font-bold text-[oklch(0.18_0.02_260)]">{p.clientName}</p>
                               <p className="text-xs text-[oklch(0.55_0.02_260)]">{METHOD_LABELS[p.method]}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-5 py-3.5 hidden md:table-cell">
                           <p className="text-[oklch(0.18_0.02_260)] font-medium">{new Date(p.timestamp).toLocaleDateString("pt-BR")}</p>
                           <p className="text-xs text-[oklch(0.55_0.02_260)]">{new Date(p.timestamp).toLocaleTimeString("pt-BR", {hour: "2-digit", minute:"2-digit"})}</p>
                         </td>
                         <td className="px-5 py-3.5 hidden sm:table-cell">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${cfg.cls}`}>
                             <StatusIcon size={12} /> {cfg.label}
                           </span>
                         </td>
                         <td className="px-5 py-3.5 text-right">
                           <p className="font-extrabold text-[oklch(0.18_0.02_260)] text-base">R$ {p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                         </td>
                         <td className="px-5 py-3.5 text-right">
                           <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => { setPayments(payments.filter((x) => x.id !== p.id)); toast.success("Removido"); }} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={16} /></button>
                           </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPayments.map((p) => {
                 const cfg = STATUS_CONFIG[p.status];
                 const StatusIcon = cfg.icon;
                 return (
                   <div key={p.id} onClick={() => setSelectedPayment(p)} className="bg-white rounded-3xl shadow-sm p-5 border border-[oklch(0.92_0.02_85)] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col">
                      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: cfg.dot }}></div>
                      
                      <div className="flex justify-between items-start mb-4 mt-1">
                        <PaymentIcon method={p.method} size={48} />
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${cfg.cls}`}>
                           <StatusIcon size={10} /> {cfg.label}
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-lg text-[oklch(0.18_0.02_260)] truncate">{p.clientName}</h3>
                      <p className="text-xs text-[oklch(0.55_0.02_260)] mb-4">{METHOD_LABELS[p.method]} • {new Date(p.timestamp).toLocaleDateString("pt-BR")}</p>
                      
                      <div className="mt-auto pt-4 border-t border-[oklch(0.92_0.02_85)] flex items-end justify-between">
                         <div>
                           <p className="text-[10px] font-bold text-[oklch(0.45_0.02_260)] uppercase mb-0.5">Valor Total</p>
                           <p className="font-extrabold text-[oklch(0.55_0.28_340)] text-xl">R$ {p.amount.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</p>
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); setPayments(payments.filter((x) => x.id !== p.id)); toast.success("Removido"); }} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 transition-all"><Trash2 size={16} /></button>
                      </div>
                   </div>
                 );
              })}
            </div>
          )}
      </div>

      {/* ========================================================= */}
      {/* SLIDE-OVER: REGISTRAR PAGAMENTO */}
      {/* ========================================================= */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[oklch(0.92_0.02_85)] flex items-center justify-between bg-[oklch(0.99_0.005_85)]">
               <div>
                 <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">Registrar Baixa</h2>
                 <p className="text-sm text-[oklch(0.45_0.02_260)]">Vincule o pagamento a um orçamento.</p>
               </div>
               <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[oklch(0.92_0.02_85)] transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Orçamento Aprovado</label>
                 {approvedQuotes.length === 0 ? (
                    <div className="p-4 border border-[oklch(0.92_0.02_85)] rounded-xl bg-[oklch(0.98_0.005_85)] text-sm text-[oklch(0.45_0.02_260)] text-center">
                       Nenhum orçamento com status "Aprovado" no sistema.
                    </div>
                 ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {approvedQuotes.map(q => {
                         const client = users.find((u) => u.id === q.clientId);
                         const isSel = selectedQuote === q.id;
                         return (
                            <div key={q.id} onClick={() => setSelectedQuote(q.id)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isSel ? "border-[oklch(0.55_0.28_340)] bg-[oklch(0.55_0.28_340/0.05)] shadow-sm" : "border-[oklch(0.9_0.02_85)] hover:border-[oklch(0.7_0.02_85)]"}`}>
                               <div className="flex justify-between items-start">
                                 <div>
                                   <p className="font-extrabold text-[oklch(0.18_0.02_260)] text-sm">{q.title}</p>
                                   <p className="text-xs text-[oklch(0.45_0.02_260)]">{client?.name}</p>
                                 </div>
                                 <p className="font-extrabold text-[oklch(0.55_0.28_340)] text-sm">R$ {q.amount?.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</p>
                               </div>
                            </div>
                         )
                      })}
                    </div>
                 )}
               </div>

               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Método de Pagamento</label>
                 <div className="grid grid-cols-3 gap-2">
                   {(["cartao", "pix", "boleto"] as const).map((m) => (
                     <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                       className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${paymentMethod === m ? "border-[oklch(0.55_0.28_340)] bg-[oklch(0.55_0.28_340/0.05)] shadow-sm" : "border-[oklch(0.9_0.02_85)] hover:bg-[oklch(0.98_0.005_85)]"}`}>
                       <span className="text-xl mb-1">{METHOD_ICONS[m]}</span>
                       <span className={`text-[10px] font-extrabold uppercase ${paymentMethod === m ? "text-[oklch(0.55_0.28_340)]" : "text-[oklch(0.45_0.02_260)]"}`}>{METHOD_LABELS[m].split(" ")[0]}</span>
                     </button>
                   ))}
                 </div>
               </div>
            </div>

            <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3">
               <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] font-bold text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)] transition-colors">Cancelar</button>
               <button onClick={handleCreatePayment} disabled={!selectedQuote} className="flex-1 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
                 <CheckCircle size={18} /> Confirmar Baixa
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OVER: DETALHES DO PAGAMENTO */}
      {/* ========================================================= */}
      {selectedPayment && !showForm && (
        <div className="fixed inset-0 z-50 flex">
           <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPayment(null)} />
           <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: STATUS_CONFIG[selectedPayment.status].dot }}></div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase tracking-wider">Ficha Financeira</span>
                  <button onClick={() => setSelectedPayment(null)} className="p-2 rounded-xl hover:bg-[oklch(0.92_0.02_85)] transition-colors"><X size={18} /></button>
                </div>
                
                <div className="flex flex-col items-center text-center mt-2">
                   <PaymentIcon method={selectedPayment.method} size={64} />
                   <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)] mt-4">{selectedPayment.clientName}</h3>
                   <p className="text-3xl font-extrabold text-[oklch(0.55_0.28_340)] mt-2">R$ {selectedPayment.amount.toLocaleString("pt-BR", {minimumFractionDigits:2})}</p>
                   
                   <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${STATUS_CONFIG[selectedPayment.status].cls}`}>
                     {React.createElement(STATUS_CONFIG[selectedPayment.status].icon, { size: 14 })}
                     {STATUS_CONFIG[selectedPayment.status].label}
                   </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                 <div className="p-4 rounded-2xl bg-[oklch(0.98_0.005_85)] border border-[oklch(0.92_0.02_85)] space-y-4">
                    <div className="flex justify-between items-center border-b border-[oklch(0.92_0.02_85)] pb-3">
                      <span className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">Data da Transação</span>
                      <span className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{new Date(selectedPayment.timestamp).toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[oklch(0.92_0.02_85)] pb-3">
                      <span className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">Método</span>
                      <span className="text-sm font-extrabold text-[oklch(0.18_0.02_260)]">{METHOD_LABELS[selectedPayment.method]}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">ID de Controle</span>
                      <span className="text-xs font-medium text-[oklch(0.45_0.02_260)] font-mono">#{selectedPayment.id}</span>
                    </div>
                 </div>

                 <button className="w-full p-4 rounded-2xl border border-dashed border-[oklch(0.9_0.02_85)] flex flex-col items-center justify-center gap-2 text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.98_0.005_85)] transition-colors">
                    <Download size={20} className="text-[oklch(0.55_0.28_340)]" />
                    <span className="text-sm font-bold">Baixar Recibo (PDF)</span>
                 </button>
              </div>

              <div className="p-6 border-t border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)] flex">
                 <button onClick={() => { setPayments(payments.filter((x) => x.id !== selectedPayment.id)); setSelectedPayment(null); toast.success("Pagamento removido"); }} className="flex-1 py-3.5 rounded-xl border border-red-200 text-red-500 font-extrabold hover:bg-red-50 transition-colors flex justify-center gap-2 items-center">
                    <Trash2 size={18}/> Estornar / Excluir
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
