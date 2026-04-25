/**
 * ClientsModule — Sonho Mágico Joinville CRM
 * Tabela rica + slide-over de detalhes do cliente
 */
import { useState } from "react";
import { Plus, Trash2, Edit2, Search, Download, Mail, Phone, MapPin, X, LayoutList, LayoutGrid, Calendar, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ClientForm {
  name: string; email: string; phone: string; password: string; address: string; city: string; notes: string;
}

const AVATAR_COLORS = [
  "oklch(0.55 0.28 340)", "oklch(0.65 0.25 145)", "oklch(0.55 0.22 262)",
  "oklch(0.72 0.22 55)", "oklch(0.38 0.22 262)", "oklch(0.88 0.18 85)",
];

function Avatar({ name, size = 36, index = 0 }: { name: string; size?: number; index?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length], fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export default function ClientsModule() {
  const { users, addUser, updateUser, deleteUser, events } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState("Todos");
  const [sortBy, setSortBy] = useState<"name" | "date" | "events">("name");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const [formData, setFormData] = useState<ClientForm>({
    name: "", email: "", phone: "", password: "acesso123", address: "", city: "Joinville", notes: "",
  });

  const clientUsers = users.filter((u) => u.role === "client");

  let filteredClients = clientUsers.filter((c) =>
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCity === "Todos" || (c as any).city === filterCity)
  );

  if (sortBy === "name") filteredClients.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "date") filteredClients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else if (sortBy === "events") filteredClients.sort((a, b) => {
    const ae = events.filter((e) => e.clientId === a.id).length;
    const be = events.filter((e) => e.clientId === b.id).length;
    return be - ae;
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", password: "acesso123", address: "", city: "Joinville", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) { toast.error("Preencha os campos obrigatórios"); return; }
    const clientPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      notes: formData.notes,
    };
    try {
      if (editingId) {
        await updateUser(editingId, clientPayload);
        toast.success("Cliente atualizado!");
      } else {
        await addUser({ ...clientPayload, role: "client", accessLevel: "client" }, formData.password || "acesso123");
        toast.success("Cliente cadastrado!");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar cliente");
    }
  };

  const handleEdit = (client: any) => {
    setFormData({ name: client.name, email: client.email, phone: client.phone, password: "acesso123", address: client.address || "", city: client.city || "Joinville", notes: client.notes || "" });
    setEditingId(client.id);
    setShowForm(true);
    setSelectedClient(null);
  };

  const handleExport = () => {
    if (filteredClients.length === 0) { toast.error("Nenhum cliente para exportar"); return; }
    const data = filteredClients.map((c) => ({
      Nome: c.name, Email: c.email, Telefone: c.phone,
      Eventos: events.filter((e) => e.clientId === c.id).length,
      "Data de Cadastro": new Date(c.createdAt).toLocaleDateString("pt-BR"),
    }));
    const csv = [Object.keys(data[0]).join(","), ...data.map((r) => Object.values(r).join(","))].join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `clientes-${new Date().toISOString().split("T")[0]}.csv` });
    a.click();
    toast.success("Exportado em CSV!");
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
          👥 Clientes
        </h2>
        <div className="flex gap-2 flex-wrap">
          {/* Toggle view */}
          <div className="flex rounded-xl overflow-hidden border border-[oklch(0.9_0.02_85)]">
            <button onClick={() => setViewMode("table")} className={`px-3 py-2 transition-colors ${viewMode === "table" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}>
              <LayoutList size={16} />
            </button>
            <button onClick={() => setViewMode("cards")} className={`px-3 py-2 transition-colors ${viewMode === "cards" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}>
              <LayoutGrid size={16} />
            </button>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[oklch(0.9_0.02_85)] text-[oklch(0.35_0.02_260)] font-bold hover:bg-[oklch(0.97_0.01_85)] transition-colors text-sm">
            <Download size={15} /> Exportar
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", email: "", phone: "", password: "acesso123", address: "", city: "Joinville", notes: "" }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
            <Plus size={15} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Form modal inline */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-[oklch(0.92_0.02_85)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold text-[oklch(0.18_0.02_260)]">{editingId ? "Editar Cliente" : "Novo Cliente"}</h3>
            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-[oklch(0.97_0.01_85)] transition-colors"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nome completo *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
            <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
            <input type="tel" placeholder="Telefone *" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputCls} />
            <input type="text" placeholder="Cidade" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputCls} />
            {!editingId && (
              <input type="text" placeholder="Senha de acesso" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputCls} />
            )}
            <input type="text" placeholder="Endereço" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`${inputCls} md:col-span-2`} />
            <textarea placeholder="Notas internas" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className={`${inputCls} md:col-span-2 resize-none`} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-105 transition-transform shadow-md text-sm">{editingId ? "Atualizar" : "Cadastrar"}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] text-[oklch(0.45_0.02_260)] font-bold hover:bg-[oklch(0.97_0.01_85)] transition-colors text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] bg-white flex-1 min-w-[200px]">
          <Search size={16} className="text-[oklch(0.65_0.02_260)]" />
          <input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="outline-none text-sm flex-1 bg-transparent" />
        </div>
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] bg-white focus:outline-none focus:border-[oklch(0.55_0.28_340)] text-sm">
          <option>Todos</option><option>Joinville</option><option>Outro</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] bg-white focus:outline-none focus:border-[oklch(0.55_0.28_340)] text-sm">
          <option value="name">Nome A-Z</option>
          <option value="date">Mais Recentes</option>
          <option value="events">Por Eventos</option>
        </select>
        <span className="text-sm text-[oklch(0.55_0.02_260)] font-medium">{filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""}</span>
      </div>

      {/* VIEW: TABLE */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl shadow-md border border-[oklch(0.92_0.02_85)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[oklch(0.97_0.01_85)] border-b border-[oklch(0.92_0.02_85)]">
                <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider">Cliente</th>
                <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden md:table-cell">Contato</th>
                <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden lg:table-cell">Cidade</th>
                <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider">Eventos</th>
                <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden sm:table-cell">Cadastro</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[oklch(0.55_0.02_260)]">Nenhum cliente encontrado</td></tr>
              ) : filteredClients.map((client, i) => {
                const clientEvents = events.filter((e) => e.clientId === client.id);
                return (
                  <tr key={client.id} className="border-b border-[oklch(0.95_0.01_85)] hover:bg-[oklch(0.98_0.005_85)] transition-colors group cursor-pointer" onClick={() => setSelectedClient(client)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={client.name} size={36} index={i} />
                        <div>
                          <p className="font-bold text-[oklch(0.18_0.02_260)]">{client.name}</p>
                          <p className="text-xs text-[oklch(0.55_0.02_260)] truncate max-w-[160px]">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-[oklch(0.35_0.02_260)]">{client.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[oklch(0.95_0.02_85)] text-[oklch(0.45_0.02_260)]">
                        {(client as any).city || "Joinville"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[oklch(0.55_0.28_340/0.1)] text-[oklch(0.45_0.22_340)]">
                        {clientEvents.length} evento{clientEvents.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-[oklch(0.55_0.02_260)]">
                      {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(client)} className="p-1.5 rounded-lg hover:bg-[oklch(0.55_0.28_340/0.1)] transition-colors">
                          <Edit2 size={14} className="text-[oklch(0.55_0.28_340)]" />
                        </button>
                        <button onClick={() => { deleteUser(client.id); toast.success("Cliente removido"); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: CARDS */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-md p-8 text-center border border-[oklch(0.92_0.02_85)]">
              <p className="text-[oklch(0.55_0.02_260)]">Nenhum cliente encontrado</p>
            </div>
          ) : filteredClients.map((client, i) => {
            const clientEvents = events.filter((e) => e.clientId === client.id);
            return (
              <div key={client.id} className="bg-white rounded-2xl shadow-md p-5 border border-[oklch(0.92_0.02_85)] hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelectedClient(client)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={client.name} size={42} index={i} />
                    <div>
                      <h3 className="font-extrabold text-[oklch(0.18_0.02_260)]">{client.name}</h3>
                      <p className="text-xs text-[oklch(0.55_0.02_260)]">{new Date(client.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[oklch(0.75_0.02_260)] group-hover:text-[oklch(0.55_0.28_340)] transition-colors mt-1" />
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-[oklch(0.45_0.02_260)]"><Mail size={13} /><span className="truncate">{client.email}</span></div>
                  <div className="flex items-center gap-2 text-[oklch(0.45_0.02_260)]"><Phone size={13} /><span>{client.phone}</span></div>
                  {(client as any).city && <div className="flex items-center gap-2 text-[oklch(0.45_0.02_260)]"><MapPin size={13} /><span>{(client as any).city}</span></div>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[oklch(0.92_0.02_85)]">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[oklch(0.55_0.28_340/0.1)] text-[oklch(0.45_0.22_340)]">
                    {clientEvents.length} evento{clientEvents.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEdit(client)} className="p-1.5 rounded-lg hover:bg-[oklch(0.97_0.01_85)] transition-colors"><Edit2 size={14} className="text-[oklch(0.55_0.28_340)]" /></button>
                    <button onClick={() => { deleteUser(client.id); toast.success("Cliente removido"); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SLIDE-OVER de detalhes */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelectedClient(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-[oklch(0.92_0.02_85)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase tracking-wider">Detalhes do Cliente</span>
                <button onClick={() => setSelectedClient(null)} className="p-2 rounded-xl hover:bg-[oklch(0.97_0.01_85)] transition-colors"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-4">
                <Avatar name={selectedClient.name} size={56} index={filteredClients.findIndex(c => c.id === selectedClient.id)} />
                <div>
                  <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{selectedClient.name}</h3>
                  <p className="text-sm text-[oklch(0.55_0.02_260)]">Cliente desde {new Date(selectedClient.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4 flex-1">
              {[
                { icon: Mail, label: "Email", value: selectedClient.email },
                { icon: Phone, label: "Telefone", value: selectedClient.phone },
                { icon: MapPin, label: "Cidade", value: (selectedClient as any).city || "Joinville" },
              ].map(({ icon: Icon, label, value }) => value && (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[oklch(0.55_0.28_340/0.1)] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-[oklch(0.55_0.28_340)]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase">{label}</p>
                    <p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{value}</p>
                  </div>
                </div>
              ))}

              {(selectedClient as any).notes && (
                <div className="p-4 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)]">
                  <p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase mb-1">Notas</p>
                  <p className="text-sm text-[oklch(0.35_0.02_260)]">{(selectedClient as any).notes}</p>
                </div>
              )}

              {/* Eventos do cliente */}
              <div>
                <p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase mb-3 flex items-center gap-2">
                  <Calendar size={13} /> Histórico de Eventos
                </p>
                {events.filter((e) => e.clientId === selectedClient.id).length === 0 ? (
                  <p className="text-sm text-[oklch(0.65_0.02_260)]">Nenhum evento registrado.</p>
                ) : (
                  <div className="space-y-2">
                    {events.filter((e) => e.clientId === selectedClient.id).map((ev) => (
                      <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)]">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[oklch(0.18_0.02_260)] truncate">{ev.title}</p>
                          <p className="text-xs text-[oklch(0.55_0.02_260)]">{new Date(ev.date).toLocaleDateString("pt-BR")} · {ev.service}</p>
                        </div>
                        <span className="text-sm font-extrabold text-[oklch(0.55_0.28_340)]">R$ {(ev.budget || 0).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3">
              <button onClick={() => { handleEdit(selectedClient); }} className="flex-1 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold hover:scale-105 transition-transform text-sm shadow-md">
                Editar Cliente
              </button>
              <button onClick={() => { deleteUser(selectedClient.id); setSelectedClient(null); toast.success("Cliente removido"); }} className="py-2.5 px-4 rounded-xl border border-red-200 text-red-400 font-bold hover:bg-red-50 transition-colors text-sm">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
