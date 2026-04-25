/**
 * MessagesModule — Sonho Mágico Joinville CRM
 * Templates de mensagens com preview estilo WhatsApp
 */
import { useState } from "react";
import { Plus, Trash2, Edit2, Send, Copy, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MessageTemplate {
  id: string; name: string;
  category: "confirmacao" | "agradecimento" | "follow_up" | "promocao";
  content: string; variables: string[];
}

const CATEGORY_CONFIG = {
  confirmacao: { label: "Confirmação", color: "bg-[oklch(0.65_0.25_145)] text-white", bg: "bg-[oklch(0.96_0.04_145)]", border: "border-[oklch(0.82_0.14_145)]" },
  agradecimento: { label: "Agradecimento", color: "bg-[oklch(0.55_0.22_262)] text-white", bg: "bg-[oklch(0.96_0.03_262)]", border: "border-[oklch(0.82_0.10_262)]" },
  follow_up: { label: "Follow-up", color: "bg-[oklch(0.72_0.22_55)] text-[oklch(0.18_0.02_260)]", bg: "bg-[oklch(0.97_0.05_85)]", border: "border-[oklch(0.85_0.12_85)]" },
  promocao: { label: "Promoção", color: "bg-[oklch(0.55_0.28_340)] text-white", bg: "bg-[oklch(0.96_0.04_340)]", border: "border-[oklch(0.82_0.12_340)]" },
};

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "1", name: "Confirmação de Evento", category: "confirmacao",
    content: "Olá {cliente}! 🎉 Confirmamos seu evento *'{evento}'* para {data} em {local}.\n\nQualquer dúvida, estamos à disposição! 📞 (47) 99944-7152",
    variables: ["cliente", "evento", "data", "local"]
  },
  {
    id: "2", name: "Agradecimento Pós-Evento", category: "agradecimento",
    content: "Obrigado {cliente}! 🙏\n\nEsperamos que o evento *'{evento}'* tenha sido incrível! Seria um prazer poder te atender novamente. ✨",
    variables: ["cliente", "evento"]
  },
  {
    id: "3", name: "Follow-up de Orçamento", category: "follow_up",
    content: "Oi {cliente}! 👋 Tudo bem?\n\nGostaria de saber se você tem interesse no orçamento de *R$ {valor}* para o evento '{evento}'. Estamos aguardando! 😊",
    variables: ["cliente", "valor", "evento"]
  },
  {
    id: "4", name: "Promoção Especial", category: "promocao",
    content: "🎊 *Promoção Especial Sonho Mágico!*\n\nGanhe *{desconto}%* de desconto em nossos serviços de festa. Aproveite!\n\n📞 (47) 99944-7152",
    variables: ["desconto"]
  },
];

export default function MessagesModule() {
  const { users } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<MessageTemplate | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [filterCat, setFilterCat] = useState<string>("all");

  const [formData, setFormData] = useState<MessageTemplate>({
    id: "", name: "", category: "confirmacao", content: "", variables: [],
  });

  const resetForm = () => {
    setFormData({ id: "", name: "", category: "confirmacao", content: "", variables: [] });
    setEditingId(null); setShowForm(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.content) { toast.error("Preencha os campos obrigatórios"); return; }
    const variables = Array.from(
      new Set((formData.content.match(/\{(\w+)\}/g) || []).map((v) => v.slice(1, -1))),
    );
    if (editingId) {
      setTemplates(templates.map((t) => t.id === editingId ? { ...formData, id: editingId, variables } : t));
      toast.success("Template atualizado!");
    } else {
      setTemplates([...templates, { ...formData, id: Date.now().toString(), variables }]);
      toast.success("Template criado!");
    }
    resetForm();
  };

  const generateMessage = () => {
    if (!selected) return "";
    let msg = selected.content;
    Object.entries(previewData).forEach(([k, v]) => { msg = msg.replace(`{${k}}`, v || `{${k}}`); });
    return msg;
  };

  const previewMessage = generateMessage();

  const filtered = templates.filter((t) => filterCat === "all" || t.category === filterCat);

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm transition-all bg-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          💬 Templates de Mensagens
        </h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ id: "", name: "", category: "confirmacao", content: "", variables: [] }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
          <Plus size={15} /> Novo Template
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-[oklch(0.92_0.02_85)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[oklch(0.18_0.02_260)]">{editingId ? "Editar Template" : "Novo Template"}</h3>
            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-[oklch(0.97_0.01_85)]"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nome do template *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })} className={inputCls}>
              <option value="confirmacao">Confirmação</option>
              <option value="agradecimento">Agradecimento</option>
              <option value="follow_up">Follow-up</option>
              <option value="promocao">Promoção</option>
            </select>
            <textarea placeholder="Conteúdo (use {variavel} para placeholders) *" value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5} className={`${inputCls} md:col-span-2 resize-none`} />
            <div className="md:col-span-2 p-3 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)] text-xs text-[oklch(0.45_0.02_260)]">
              💡 Use <code className="bg-[oklch(0.92_0.02_85)] px-1 rounded">&#123;variavel&#125;</code> para criar campos dinâmicos. Ex: <code className="bg-[oklch(0.92_0.02_85)] px-1 rounded">&#123;cliente&#125;</code>, <code className="bg-[oklch(0.92_0.02_85)] px-1 rounded">&#123;data&#125;</code>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-105 transition-transform shadow-md text-sm">{editingId ? "Atualizar" : "Criar"}</button>
            <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] text-[oklch(0.45_0.02_260)] font-bold hover:bg-[oklch(0.97_0.01_85)] transition-colors text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...Object.keys(CATEGORY_CONFIG)].map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${filterCat === cat ? "bg-[oklch(0.55_0.28_340)] text-white shadow-md" : "bg-white border border-[oklch(0.9_0.02_85)] text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}>
            {cat === "all" ? "Todos" : CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG].label}
          </button>
        ))}
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => {
          const cfg = CATEGORY_CONFIG[t.category];
          return (
            <div key={t.id} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5 flex flex-col gap-3`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-[oklch(0.18_0.02_260)] mb-1">{t.name}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${cfg.color}`}>{CATEGORY_CONFIG[t.category].label}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setFormData(t); setEditingId(t.id); setShowForm(true); setSelected(null); }}
                    className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"><Edit2 size={14} className="text-[oklch(0.55_0.28_340)]" /></button>
                  <button onClick={() => { setTemplates(templates.filter((x) => x.id !== t.id)); if (selected?.id === t.id) setSelected(null); toast.success("Removido!"); }}
                    className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
              <p className="text-sm text-[oklch(0.35_0.02_260)] leading-relaxed line-clamp-2">{t.content}</p>
              {t.variables.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {t.variables.map((v) => (
                    <span key={v} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/60 text-[oklch(0.45_0.02_260)]">&#123;{v}&#125;</span>
                  ))}
                </div>
              )}
              <button onClick={() => { setSelected(t); setPreviewData({}); }}
                className="w-full py-2.5 rounded-xl bg-[oklch(0.13_0.02_260)] text-white text-sm font-extrabold hover:scale-[1.02] transition-transform shadow-md mt-auto">
                <MessageSquare size={14} className="inline mr-2" />Usar Template
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL DE PREVIEW estilo WhatsApp */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-[oklch(0.92_0.02_85)]">
              <div className="w-10 h-10 rounded-full bg-[oklch(0.65_0.25_145)] flex items-center justify-center flex-shrink-0">
                <MessageSquare size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[oklch(0.18_0.02_260)]">{selected.name}</p>
                <p className="text-xs text-[oklch(0.55_0.02_260)]">{CATEGORY_CONFIG[selected.category].label}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-[oklch(0.97_0.01_85)]"><X size={18} /></button>
            </div>

            {/* Preview bolha WhatsApp */}
            <div className="flex-1 p-5 max-h-72 overflow-y-auto" style={{ background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23e5e5e5'/%3E%3C/svg%3E\") repeat, oklch(0.94 0.01 145 / 30%)" }}>
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-[oklch(0.65_0.25_145)] rounded-2xl rounded-tr-sm px-4 py-3 shadow-md">
                  <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{previewMessage}</p>
                  <p className="text-white/60 text-[10px] text-right mt-1">{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ✓✓</p>
                </div>
              </div>
            </div>

            {/* Variáveis */}
            {selected.variables.length > 0 && (
              <div className="p-5 border-t border-[oklch(0.92_0.02_85)]">
                <p className="text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase mb-3">Preencha as variáveis</p>
                <div className="grid grid-cols-2 gap-2">
                  {selected.variables.map((v) => (
                    <input key={v} type="text" placeholder={`{${v}}`} value={previewData[v] || ""}
                      onChange={(e) => setPreviewData({ ...previewData, [v]: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] text-sm bg-white" />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-5 border-t border-[oklch(0.92_0.02_85)] flex gap-3">
              <button onClick={() => { navigator.clipboard.writeText(previewMessage); toast.success("Copiado!"); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[oklch(0.94_0.01_85)] text-[oklch(0.18_0.02_260)] font-bold hover:bg-[oklch(0.90_0.02_85)] transition-colors text-sm">
                <Copy size={15} /> Copiar
              </button>
              <button onClick={() => { window.open(`https://wa.me/5547999447152?text=${encodeURIComponent(previewMessage)}`, "_blank"); toast.success("Abrindo WhatsApp!"); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[oklch(0.65_0.25_145)] text-white font-extrabold hover:scale-105 transition-transform shadow-md text-sm">
                <Send size={15} /> Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
