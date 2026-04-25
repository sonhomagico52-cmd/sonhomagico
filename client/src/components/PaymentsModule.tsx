/**
 * PaymentsModule — Sonho Mágico Joinville CRM
 * Gráfico de receita mensal + listagem rica de pagamentos
 */
import { useState } from "react";
import { CreditCard, Trash2, Plus, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Payment {
  id: string; quoteId: string; amount: number;
  status: "pendente" | "processando" | "concluido" | "falho";
  method: "cartao" | "pix" | "boleto";
  timestamp: string; clientName: string;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const STATUS_CONFIG = {
  concluido: { label: "Concluído", icon: CheckCircle, cls: "bg-[oklch(0.65_0.25_145)] text-white", dot: "oklch(0.65 0.25 145)" },
  processando: { label: "Processando", icon: Clock, cls: "bg-[oklch(0.88_0.18_85)] text-[oklch(0.35_0.08_85)]", dot: "oklch(0.72 0.22 55)" },
  pendente: { label: "Pendente", icon: Clock, cls: "bg-[oklch(0.55_0.28_340/0.15)] text-[oklch(0.45_0.22_340)]", dot: "oklch(0.55 0.28 340)" },
  falho: { label: "Falho", icon: XCircle, cls: "bg-red-100 text-red-500", dot: "oklch(0.55 0.22 27)" },
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

export default function PaymentsModule() {
  const { quotes, users } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cartao" | "pix" | "boleto">("cartao");
  const [filterStatus, setFilterStatus] = useState<"all" | "pendente" | "processando" | "concluido" | "falho">("all");

  const approvedQuotes = quotes.filter((q) => q.status === "approved");
  const filteredPayments = filterStatus === "all" ? payments : payments.filter((p) => p.status === filterStatus);

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
      toast.success("Pagamento concluído!");
    }, 2000);

    setSelectedQuote(""); setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          💳 Pagamentos
        </h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
          <Plus size={15} /> Registrar Pagamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Recebido", value: `R$ ${totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]", icon: CheckCircle },
          { label: "Em Aberto", value: `R$ ${totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "from-[oklch(0.72_0.22_55)] to-[oklch(0.88_0.18_85)]", icon: Clock },
          { label: "Total de Cobranças", value: qtdTotal, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]", icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-5 text-white relative overflow-hidden`}>
            <div className="absolute -top-3 -right-3 opacity-20"><Icon size={56} /></div>
            <p className="text-xs font-semibold opacity-80">{label}</p>
            <p className="text-2xl font-extrabold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de Receita */}
      <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-6">
        <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-[oklch(0.55_0.28_340)]" /> Receita Mensal
        </h3>
        {payments.filter(p => p.status === "concluido").length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-[oklch(0.65_0.02_260)]">
            <TrendingUp size={32} className="opacity-20 mb-2" />
            <p className="text-sm">Registre pagamentos para ver o gráfico</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.28 340)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="oklch(0.55 0.28 340)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.95 0.01 85)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}
                formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Receita"]}
              />
              <Area type="monotone" dataKey="receita" stroke="oklch(0.55 0.28 340)" strokeWidth={2.5} fill="url(#receitaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-[oklch(0.92_0.02_85)] p-6">
          <h3 className="text-lg font-extrabold text-[oklch(0.18_0.02_260)] mb-4">Registrar Pagamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] mb-1 uppercase">Orçamento Aprovado</label>
              <select value={selectedQuote} onChange={(e) => setSelectedQuote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] text-sm bg-white">
                <option value="">-- Selecionar --</option>
                {approvedQuotes.map((q) => {
                  const client = users.find((u) => u.id === q.clientId);
                  return <option key={q.id} value={q.id}>{q.title} · {client?.name} · R$ {q.amount}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] mb-1 uppercase">Método</label>
              <div className="flex gap-2">
                {(["cartao", "pix", "boleto"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${paymentMethod === m ? "border-[oklch(0.55_0.28_340)] bg-[oklch(0.55_0.28_340/0.08)] text-[oklch(0.45_0.22_340)]" : "border-[oklch(0.9_0.02_85)] text-[oklch(0.55_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}>
                    {METHOD_ICONS[m]} {METHOD_LABELS[m].split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-3">
              <button onClick={handleCreatePayment} className="px-6 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-105 transition-transform shadow-md text-sm flex-1">
                Processar
              </button>
              <button onClick={() => { setShowForm(false); setSelectedQuote(""); }}
                className="px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] text-[oklch(0.45_0.02_260)] font-bold hover:bg-[oklch(0.97_0.01_85)] transition-colors text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pendente", "processando", "concluido", "falho"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s as any)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${filterStatus === s ? "bg-[oklch(0.55_0.28_340)] text-white shadow-md" : "bg-white border border-[oklch(0.9_0.02_85)] text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}>
            {s === "all" ? "Todos" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
          </button>
        ))}
      </div>

      {/* Lista de Pagamentos */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-10 text-center">
            <CreditCard size={40} className="mx-auto opacity-20 mb-3 text-[oklch(0.55_0.28_340)]" />
            <p className="text-[oklch(0.55_0.02_260)] font-medium">Nenhum pagamento registrado</p>
            <p className="text-xs text-[oklch(0.65_0.02_260)] mt-1">Clique em "Registrar Pagamento" para começar</p>
          </div>
        ) : filteredPayments.map((p) => {
          const cfg = STATUS_CONFIG[p.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ backgroundColor: `${cfg.dot}18` }}>
                {METHOD_ICONS[p.method]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[oklch(0.18_0.02_260)]">{p.clientName}</p>
                <p className="text-xs text-[oklch(0.55_0.02_260)]">{METHOD_LABELS[p.method]} · {new Date(p.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-extrabold text-[oklch(0.55_0.28_340)]">
                  R$ {p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${cfg.cls}`}>
                  <StatusIcon size={11} /> {cfg.label}
                </span>
              </div>
              <button onClick={() => { setPayments(payments.filter((x) => x.id !== p.id)); toast.success("Removido"); }}
                className="p-2 rounded-xl hover:bg-red-50 transition-colors flex-shrink-0">
                <Trash2 size={15} className="text-red-400" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="p-4 rounded-2xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)] text-sm text-[oklch(0.45_0.02_260)]">
        💡 <strong>Modo Simulação:</strong> Para pagamentos reais, integre suas credenciais Stripe ou MercadoPago nas configurações.
      </div>
    </div>
  );
}
