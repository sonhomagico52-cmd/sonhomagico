import { useState } from "react";
import {
  MessageSquare, Plus, Trash2, Edit2, Send, Copy, X,
  Search, LayoutGrid, LayoutList, ChevronRight, MessageCircle, FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ViewMode = "table" | "cards";

interface MessageTemplate {
  id: string; name: string;
  category: "confirmacao" | "agradecimento" | "follow_up" | "promocao";
  content: string; variables: string[];
}

const CATEGORY_CONFIG = {
  confirmacao: { label: "Confirmação", color: "bg-[oklch(0.65_0.25_145)] text-white", bg: "bg-[oklch(0.98_0.01_145)]", border: "border-[oklch(0.65_0.25_145/0.2)]", dot: "oklch(0.65 0.25 145)" },
  agradecimento: { label: "Agradecimento", color: "bg-[oklch(0.55_0.22_262)] text-white", bg: "bg-[oklch(0.98_0.01_262)]", border: "border-[oklch(0.55_0.22_262/0.2)]", dot: "oklch(0.55 0.22 262)" },
  follow_up: { label: "Follow-up", color: "bg-[oklch(0.72_0.22_55)] text-[oklch(0.18_0.02_260)]", bg: "bg-[oklch(0.98_0.01_55)]", border: "border-[oklch(0.72_0.22_55/0.2)]", dot: "oklch(0.72 0.22 55)" },
  promocao: { label: "Promoção", color: "bg-[oklch(0.55_0.28_340)] text-white", bg: "bg-[oklch(0.98_0.01_340)]", border: "border-[oklch(0.55_0.28_340/0.2)]", dot: "oklch(0.55 0.28 340)" },
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
  
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MessageTemplate>({ id: "", name: "", category: "confirmacao", content: "", variables: [] });
  
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  const filteredTemplates = templates.filter((t) => {
    const matchesCat = filterCat === "all" || t.category === filterCat;
    const term = search.toLowerCase();
    const matchesSearch = t.name.toLowerCase().includes(term) || t.content.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  const resetForm = () => {
    setFormData({ id: "", name: "", category: "confirmacao", content: "", variables: [] });
    setEditingId(null); 
    setShowForm(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.content) { toast.error("Preencha o nome e o conteúdo da mensagem."); return; }
    
    // Extrai as variáveis dinamicamente usando regex
    const variables = Array.from(
      new Set((formData.content.match(/\{(\w+)\}/g) || []).map((v) => v.slice(1, -1))),
    );
    
    if (editingId) {
      setTemplates(templates.map((t) => t.id === editingId ? { ...formData, id: editingId, variables } : t));
      toast.success("Template atualizado!");
    } else {
      setTemplates([...templates, { ...formData, id: Date.now().toString(), variables }]);
      toast.success("Template criado com sucesso!");
    }
    resetForm();
  };

  const openEditForm = (t: MessageTemplate) => {
    setFormData(t);
    setEditingId(t.id);
    setShowForm(true);
    setSelectedTemplate(null);
  };

  const openPreview = (t: MessageTemplate) => {
    setSelectedTemplate(t);
    setPreviewData({}); // Limpa os dados de preview da sessão anterior
    setShowForm(false);
  };

  const generateMessage = () => {
    if (!selectedTemplate) return "";
    let msg = selectedTemplate.content;
    Object.entries(previewData).forEach(([k, v]) => { msg = msg.replace(`{${k}}`, v || `{${k}}`); });
    return msg;
  };

  const previewMessage = generateMessage();
  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm transition-all bg-white";

  return (
    <div className="space-y-6">
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Templates", value: templates.length, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]", icon: MessageSquare },
          { label: "Confirmações", value: templates.filter(t => t.category === "confirmacao").length, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]", icon: MessageCircle },
          { label: "Follow-ups", value: templates.filter(t => t.category === "follow_up").length, color: "from-[oklch(0.72_0.22_55)] to-[oklch(0.88_0.18_85)]", icon: MessageCircle },
          { label: "Promoções", value: templates.filter(t => t.category === "promocao").length, color: "from-[oklch(0.55_0.28_340/0.8)] to-[oklch(0.55_0.22_262/0.8)]", icon: MessageCircle },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-2xl shadow-sm p-5 text-white relative overflow-hidden flex flex-col justify-between`}>
             <div className="absolute -top-4 -right-4 opacity-20"><stat.icon size={80} /></div>
             <p className="text-xs uppercase tracking-[0.15em] opacity-80 font-bold">{stat.label}</p>
             <p className="text-4xl font-extrabold mt-3">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.99_0.005_85)] flex-1 md:w-[280px]">
              <Search size={16} className="text-[oklch(0.65_0.02_260)]" />
              <input type="text" placeholder="Buscar modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none text-sm flex-1 bg-transparent" />
            </div>
            <div className="hidden sm:flex rounded-xl overflow-hidden border border-[oklch(0.9_0.02_85)] bg-white p-1 gap-1">
               {["all", ...Object.keys(CATEGORY_CONFIG)].map((cat) => (
                  <button key={cat} onClick={() => setFilterCat(cat)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterCat === cat ? "bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)] shadow-sm" : "text-[oklch(0.45_0.02_260)] hover:bg-gray-50"}`}>
                     {cat === "all" ? "Todos" : CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG].label}
                  </button>
               ))}
            </div>
         </div>

         <div className="flex gap-2 w-full md:w-auto">
            <div className="flex rounded-xl overflow-hidden border border-[oklch(0.9_0.02_85)]">
              <button onClick={() => setViewMode("table")} className={`px-3 py-2 transition-colors ${viewMode === "table" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}><LayoutList size={16} /></button>
              <button onClick={() => setViewMode("cards")} className={`px-3 py-2 transition-colors ${viewMode === "cards" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}><LayoutGrid size={16} /></button>
            </div>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
              <Plus size={16} /> Novo Template
            </button>
         </div>
      </div>

      {/* LISTA */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
         {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-[oklch(0.92_0.02_85)] p-12 text-center flex flex-col items-center">
               <div className="w-16 h-16 rounded-2xl bg-[oklch(0.98_0.005_85)] flex items-center justify-center mb-4">
                 <FileText size={32} className="text-[oklch(0.45_0.02_260)]" />
               </div>
               <p className="text-[oklch(0.18_0.02_260)] font-extrabold text-lg">Nenhum template encontrado</p>
               <p className="text-sm text-[oklch(0.45_0.02_260)] mt-1 max-w-sm">Tente mudar o filtro de busca ou crie uma nova mensagem padrão.</p>
            </div>
         ) : viewMode === "table" ? (
             <div className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] overflow-hidden">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="bg-[oklch(0.97_0.01_85)] border-b border-[oklch(0.92_0.02_85)]">
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider">Título do Template</th>
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden lg:table-cell">Variáveis</th>
                     <th className="px-5 py-3"></th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredTemplates.map((t) => {
                      const cfg = CATEGORY_CONFIG[t.category];
                      return (
                       <tr key={t.id} className="border-b border-[oklch(0.95_0.01_85)] hover:bg-[oklch(0.98_0.005_85)] transition-colors cursor-pointer group" onClick={() => openPreview(t)}>
                         <td className="px-5 py-4">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cfg.dot}15` }}>
                               <MessageSquare size={16} className="" style={{ color: cfg.dot }} />
                             </div>
                             <div>
                               <p className="font-bold text-[oklch(0.18_0.02_260)]">{t.name}</p>
                               <p className="text-xs text-[oklch(0.45_0.02_260)] line-clamp-1 max-w-sm">{t.content}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-5 py-4 hidden sm:table-cell">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${cfg.color}`}>
                             {cfg.label}
                           </span>
                         </td>
                         <td className="px-5 py-4 hidden lg:table-cell">
                           <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {t.variables.length === 0 ? <span className="text-xs text-[oklch(0.65_0.02_260)]">—</span> : t.variables.map(v => (
                                <span key={v} className="px-1.5 py-0.5 rounded border border-[oklch(0.9_0.02_85)] text-[10px] font-bold text-[oklch(0.45_0.02_260)] bg-white">&#123;{v}&#125;</span>
                              ))}
                           </div>
                         </td>
                         <td className="px-5 py-4 text-right">
                           <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => openEditForm(t)} className="p-2 rounded-lg hover:bg-[oklch(0.55_0.28_340/0.1)] transition-colors text-[oklch(0.55_0.28_340)]"><Edit2 size={16} /></button>
                              <button onClick={() => { setTemplates(templates.filter((x) => x.id !== t.id)); toast.success("Excluído"); }} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={16} /></button>
                           </div>
                         </td>
                       </tr>
                      );
                   })}
                 </tbody>
               </table>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {filteredTemplates.map((t) => {
                  const cfg = CATEGORY_CONFIG[t.category];
                  return (
                    <div key={t.id} onClick={() => openPreview(t)} className="bg-white rounded-3xl shadow-sm p-6 border border-[oklch(0.92_0.02_85)] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col">
                       <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: cfg.dot }}></div>
                       
                       <div className="flex justify-between items-start mb-3 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${cfg.color}`}>
                             {cfg.label}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                             <button onClick={() => openEditForm(t)} className="p-1.5 rounded-lg hover:bg-[oklch(0.97_0.01_85)] text-[oklch(0.45_0.02_260)]"><Edit2 size={14}/></button>
                             <button onClick={() => { setTemplates(templates.filter((x) => x.id !== t.id)); toast.success("Excluído"); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                          </div>
                       </div>
                       
                       <h3 className="font-extrabold text-lg text-[oklch(0.18_0.02_260)] mb-2">{t.name}</h3>
                       <p className="text-xs text-[oklch(0.45_0.02_260)] mb-4 line-clamp-3 leading-relaxed flex-1">{t.content}</p>
                       
                       <div className="pt-4 border-t border-[oklch(0.92_0.02_85)]">
                          {t.variables.length > 0 ? (
                             <div className="flex flex-wrap gap-1">
                               {t.variables.map(v => (
                                 <span key={v} className="px-1.5 py-0.5 rounded border border-[oklch(0.9_0.02_85)] text-[9px] font-bold text-[oklch(0.45_0.02_260)] bg-[oklch(0.98_0.005_85)]">
                                    &#123;{v}&#125;
                                 </span>
                               ))}
                             </div>
                          ) : (
                             <p className="text-[10px] text-[oklch(0.65_0.02_260)] italic">Mensagem estática, sem variáveis.</p>
                          )}
                       </div>
                    </div>
                  );
               })}
             </div>
          )}
      </div>

      {/* ========================================================= */}
      {/* SLIDE-OVER: CRIAR / EDITAR TEMPLATE */}
      {/* ========================================================= */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[oklch(0.92_0.02_85)] flex items-center justify-between bg-[oklch(0.99_0.005_85)]">
               <div>
                 <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{editingId ? "Editar Template" : "Novo Template"}</h2>
                 <p className="text-sm text-[oklch(0.45_0.02_260)]">Configure os padrões de texto do sistema.</p>
               </div>
               <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[oklch(0.92_0.02_85)] transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Nome do Template *</label>
                 <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputCls} placeholder="Ex: Lembrete de Pagamento" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2 ml-1">Categoria</label>
                 <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className={inputCls}>
                    <option value="confirmacao">Confirmação de Evento</option>
                    <option value="agradecimento">Agradecimento Pós-Evento</option>
                    <option value="follow_up">Follow-up Financeiro / Orçamento</option>
                    <option value="promocao">Promoção / Marketing</option>
                 </select>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-2 ml-1">
                    <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase">Conteúdo da Mensagem *</label>
                 </div>
                 <textarea rows={8} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className={`${inputCls} resize-none`} placeholder="Olá {nome}, seu evento está marcado..." />
                 <div className="mt-2 p-3 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)] text-xs text-[oklch(0.45_0.02_260)] leading-relaxed">
                    💡 <strong>Variáveis Automáticas:</strong> Qualquer palavra que você digitar entre chaves criará um campo dinâmico na hora do envio. <br/><br/>
                    Exemplo de uso: <code className="bg-[oklch(0.92_0.02_85)] px-1 rounded font-bold">&#123;cliente&#125;</code>, <code className="bg-[oklch(0.92_0.02_85)] px-1 rounded font-bold">&#123;valor&#125;</code>
                 </div>
               </div>
            </div>

            <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3">
               <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] font-bold text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)] transition-colors">Cancelar</button>
               <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                 <Edit2 size={16} /> Salvar Template
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OVER: WHATSAPP PREVIEW SIMULATOR */}
      {/* ========================================================= */}
      {selectedTemplate && !showForm && (
        <div className="fixed inset-0 z-50 flex">
           <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTemplate(null)} />
           <div className="w-full max-w-md bg-[#efeae2] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Header estilo WhatsApp */}
              <div className="bg-[#00a884] p-4 flex items-center gap-3 text-white shadow-sm z-10">
                 <button onClick={() => setSelectedTemplate(null)} className="p-1 hover:bg-black/10 rounded-full transition-colors"><ChevronRight size={24} className="rotate-180" /></button>
                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={20} className="text-white" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-base truncate leading-tight">{selectedTemplate.name}</p>
                    <p className="text-xs text-white/80">Simulador de Disparo</p>
                 </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg")', backgroundSize: 'cover', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                 <div className="flex justify-end mb-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="max-w-[85%] bg-[#d9fdd3] rounded-xl rounded-tr-none px-3 pt-2 pb-1.5 shadow-sm text-sm text-[#111b21] leading-relaxed relative">
                       <p className="whitespace-pre-wrap pb-3">{previewMessage}</p>
                       <span className="text-[10px] text-gray-500 absolute bottom-1 right-2 flex items-center gap-1">
                          {new Date().toLocaleTimeString("pt-BR", {hour: "2-digit", minute:"2-digit"})}
                          <svg viewBox="0 0 16 15" width="16" height="15" className="fill-[#53bdeb]"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                       </span>
                    </div>
                 </div>
              </div>

              {/* Form de Variáveis (Teclado/Ações) */}
              <div className="bg-white px-4 py-5 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-[oklch(0.92_0.02_85)]">
                 {selectedTemplate.variables.length > 0 ? (
                    <div className="mb-5 space-y-3">
                       <p className="text-xs font-extrabold text-[oklch(0.45_0.02_260)] uppercase">Preencha as variáveis para enviar:</p>
                       <div className="grid grid-cols-2 gap-2">
                          {selectedTemplate.variables.map(v => (
                             <input key={v} type="text" placeholder={`{${v}}`} value={previewData[v] || ""}
                                onChange={(e) => setPreviewData({ ...previewData, [v]: e.target.value })}
                                className="px-3 py-2.5 rounded-lg border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[#00a884] text-sm font-medium bg-[oklch(0.98_0.005_85)]" />
                          ))}
                       </div>
                    </div>
                 ) : (
                    <div className="mb-5 p-3 rounded-lg bg-[oklch(0.98_0.005_85)] border border-[oklch(0.92_0.02_85)] text-xs text-[oklch(0.45_0.02_260)] text-center">
                       Este template não possui variáveis configuradas.
                    </div>
                 )}

                 <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(previewMessage); toast.success("Texto copiado para área de transferência!"); }}
                       className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[oklch(0.94_0.01_85)] text-[oklch(0.18_0.02_260)] font-bold hover:bg-[oklch(0.90_0.02_85)] transition-colors text-sm">
                       <Copy size={16} /> Copiar Texto
                    </button>
                    <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(previewMessage)}`, "_blank"); toast.success("Abrindo WhatsApp Web..."); }}
                       className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00a884] text-white font-extrabold hover:scale-105 transition-transform shadow-md text-sm">
                       <Send size={16} /> Enviar (WhatsApp)
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
