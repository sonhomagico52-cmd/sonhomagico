import React, { useMemo, useState } from "react";
import {
  KeyRound, Shield, UserPlus, Users, Edit2, Trash2, X, Search,
  LayoutGrid, LayoutList, Mail, Phone, ChevronRight, CheckCircle2, ShieldAlert
} from "lucide-react";
import {
  ACCESS_LEVEL_LABELS,
  ACCESS_LEVEL_PERMISSIONS,
  type AccessLevel,
  type AdminPermission,
  useAuth,
} from "@/contexts/AuthContext";
import { toast } from "sonner";

type ViewMode = "table" | "cards";

interface UserFormState {
  name: string;
  email: string;
  phone: string;
  role: "admin" | "crew" | "client";
  accessLevel: AccessLevel;
  password: string;
}

const EMPTY_FORM: UserFormState = {
  name: "",
  email: "",
  phone: "",
  role: "admin",
  accessLevel: "manager",
  password: "acesso123",
};

const permissionLabels: Record<AdminPermission, string> = {
  dashboard: "Dashboard", clients: "Clientes", events: "Eventos",
  teams: "Equipes", users: "Usuários", payments: "Pagamentos",
  reports: "Relatórios", analytics: "Analytics", messages: "Mensagens",
  scheduling: "Agendamento", certificates: "Certificados",
  landing: "Landing Page", history: "Histórico", settings: "Configurações",
};

const AVATAR_COLORS = [
  "oklch(0.55 0.28 340)", "oklch(0.65 0.25 145)", "oklch(0.55 0.22 262)",
  "oklch(0.72 0.22 55)", "oklch(0.38 0.22 262)", "oklch(0.88 0.18 85)",
];

function Avatar({ name, size = 36, index = 0 }: { name: string; size?: number; index?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0 shadow-sm"
      style={{ width: size, height: size, backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length], fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

function allowedLevelsForRole(role: UserFormState["role"]) {
  if (role === "admin") return ["super_admin", "admin", "manager", "coordinator"] as AccessLevel[];
  if (role === "crew") return ["crew"] as AccessLevel[];
  return ["client"] as AccessLevel[];
}

export default function UserManagementModule() {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "crew" | "client">("all");
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const term = search.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [filterRole, search, users]);

  const handleRoleChange = (role: UserFormState["role"]) => {
    const allowed = allowedLevelsForRole(role);
    setForm({ ...form, role, accessLevel: allowed[0] });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Preencha nome, email e telefone");
      return;
    }

    const payload = {
      name: form.name, email: form.email, phone: form.phone,
      role: form.role, accessLevel: form.accessLevel,
      appInstalled: form.role === "crew",
      customPermissions: ACCESS_LEVEL_PERMISSIONS[form.accessLevel],
    };

    try {
      if (editingId) {
        await updateUser(editingId, payload);
        toast.success("Usuário atualizado");
      } else {
        const finalPassword = form.password || "acesso123";
        await addUser(payload, finalPassword);
        toast.success("Usuário cadastrado");
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar usuário");
    }
  };

  const openEditForm = (u: any) => {
    setEditingId(u.id);
    setForm({
      name: u.name, email: u.email, phone: u.phone,
      role: u.role, accessLevel: u.accessLevel, password: ""
    });
    setShowForm(true);
    setSelectedUser(null);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.15)] text-sm transition-all";

  return (
    <div className="space-y-6">
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Usuários", value: users.length, color: "from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)]", icon: Users },
          { label: "Administradores", value: users.filter((u) => u.role === "admin").length, color: "from-[oklch(0.65_0.25_145)] to-[oklch(0.55_0.22_262)]", icon: Shield },
          { label: "Equipe", value: users.filter((u) => u.role === "crew").length, color: "from-[oklch(0.18_0.02_260)] to-[oklch(0.45_0.02_260)]", icon: Users },
          { label: "Clientes", value: users.filter((u) => u.role === "client").length, color: "from-[oklch(0.72_0.22_55)] to-[oklch(0.88_0.18_85)]", icon: Users },
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
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[oklch(0.9_0.02_85)] bg-[oklch(0.99_0.005_85)] flex-1 md:w-[300px]">
              <Search size={16} className="text-[oklch(0.65_0.02_260)]" />
              <input type="text" placeholder="Buscar usuário..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none text-sm flex-1 bg-transparent" />
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)} className="px-4 py-2.5 rounded-xl border border-[oklch(0.9_0.02_85)] text-sm focus:outline-none focus:border-[oklch(0.55_0.28_340)] hidden sm:block">
               <option value="all">Todas Funções</option>
               <option value="admin">Somente Admins</option>
               <option value="crew">Somente Equipe</option>
               <option value="client">Somente Clientes</option>
            </select>
         </div>

         <div className="flex gap-2 w-full md:w-auto">
            <div className="flex rounded-xl overflow-hidden border border-[oklch(0.9_0.02_85)]">
              <button onClick={() => setViewMode("table")} className={`px-3 py-2 transition-colors ${viewMode === "table" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}><LayoutList size={16} /></button>
              <button onClick={() => setViewMode("cards")} className={`px-3 py-2 transition-colors ${viewMode === "cards" ? "bg-[oklch(0.55_0.28_340)] text-white" : "bg-white text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)]"}`}><LayoutGrid size={16} /></button>
            </div>
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform text-sm shadow-md">
              <UserPlus size={16} /> Cadastrar Usuário
            </button>
         </div>
      </div>

      {/* LISTA */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
         {viewMode === "table" ? (
             <div className="bg-white rounded-2xl shadow-sm border border-[oklch(0.92_0.02_85)] overflow-hidden">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="bg-[oklch(0.97_0.01_85)] border-b border-[oklch(0.92_0.02_85)]">
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider">Conta</th>
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden md:table-cell">Acesso</th>
                     <th className="text-left px-5 py-3 font-bold text-[oklch(0.45_0.02_260)] text-xs uppercase tracking-wider hidden lg:table-cell">Permissões</th>
                     <th className="px-5 py-3"></th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredUsers.length === 0 ? (
                     <tr><td colSpan={4} className="text-center py-10 text-[oklch(0.55_0.02_260)]">Nenhum usuário localizado.</td></tr>
                   ) : filteredUsers.map((u, i) => (
                     <tr key={u.id} className="border-b border-[oklch(0.95_0.01_85)] hover:bg-[oklch(0.98_0.005_85)] transition-colors cursor-pointer group" onClick={() => setSelectedUser(u)}>
                       <td className="px-5 py-3.5">
                         <div className="flex items-center gap-3">
                           <Avatar name={u.name} size={40} index={i} />
                           <div>
                             <p className="font-bold text-[oklch(0.18_0.02_260)]">{u.name}</p>
                             <p className="text-xs text-[oklch(0.55_0.02_260)]">{u.email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-5 py-3.5 hidden md:table-cell">
                         <div className="flex flex-col items-start gap-1">
                           <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                             u.role === "admin" ? "bg-[oklch(0.55_0.22_262/0.15)] text-[oklch(0.38_0.22_262)] border border-[oklch(0.55_0.22_262/0.2)]" :
                             u.role === "crew" ? "bg-[oklch(0.18_0.02_260/0.1)] text-[oklch(0.18_0.02_260)] border border-[oklch(0.18_0.02_260/0.2)]" :
                             "bg-[oklch(0.65_0.25_145/0.15)] text-[oklch(0.45_0.25_145)] border border-[oklch(0.65_0.25_145/0.2)]"
                           }`}>
                             {u.role === "admin" ? "Admin" : u.role === "crew" ? "Equipe" : "Cliente"}
                           </span>
                           <span className="text-xs font-bold text-[oklch(0.45_0.02_260)]">{ACCESS_LEVEL_LABELS[u.accessLevel]}</span>
                         </div>
                       </td>
                       <td className="px-5 py-3.5 hidden lg:table-cell">
                         <div className="flex flex-wrap gap-1 max-w-[300px]">
                            {(u.customPermissions || ACCESS_LEVEL_PERMISSIONS[u.accessLevel] || []).length === 0 ? (
                              <span className="text-xs text-[oklch(0.65_0.02_260)]">—</span>
                            ) : (u.customPermissions || ACCESS_LEVEL_PERMISSIONS[u.accessLevel] || []).slice(0, 3).map((p: AdminPermission) => (
                              <span key={p} className="px-2 py-0.5 rounded-md bg-white border border-[oklch(0.9_0.02_85)] text-[10px] font-bold text-[oklch(0.35_0.02_260)]">
                                {permissionLabels[p]}
                              </span>
                            ))}
                            {(u.customPermissions || ACCESS_LEVEL_PERMISSIONS[u.accessLevel] || []).length > 3 && (
                               <span className="px-1.5 py-0.5 rounded-md bg-[oklch(0.9_0.02_85)] text-[10px] font-bold text-[oklch(0.35_0.02_260)]">
                                 +{(u.customPermissions || ACCESS_LEVEL_PERMISSIONS[u.accessLevel] || []).length - 3}
                               </span>
                            )}
                         </div>
                       </td>
                       <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openEditForm(u)} className="p-1.5 rounded-lg hover:bg-[oklch(0.55_0.28_340/0.1)] transition-colors"><Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" /></button>
                           <button onClick={() => { deleteUser(u.id); toast.success("Usuário excluído"); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={16} className="text-red-400" /></button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredUsers.map((u, i) => (
                <div key={u.id} className="bg-white rounded-3xl shadow-sm p-6 border border-[oklch(0.92_0.02_85)] hover:shadow-md transition-all cursor-pointer group flex flex-col relative overflow-hidden" onClick={() => setSelectedUser(u)}>
                  {/* Fita superior */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${
                     u.role === "admin" ? "bg-[oklch(0.55_0.22_262)]" :
                     u.role === "crew" ? "bg-[oklch(0.18_0.02_260)]" :
                     "bg-[oklch(0.65_0.25_145)]"
                  }`}></div>

                  <div className="flex justify-between items-start mb-4 mt-2">
                    <Avatar name={u.name} size={56} index={i} />
                    <button onClick={(e) => { e.stopPropagation(); openEditForm(u); }} className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[oklch(0.97_0.01_85)]">
                      <Edit2 size={16} className="text-[oklch(0.45_0.02_260)]" />
                    </button>
                  </div>
                  
                  <h3 className="font-extrabold text-lg text-[oklch(0.18_0.02_260)] truncate mb-1">{u.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                     <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                       u.role === "admin" ? "bg-[oklch(0.55_0.22_262/0.1)] text-[oklch(0.38_0.22_262)]" :
                       u.role === "crew" ? "bg-[oklch(0.18_0.02_260/0.1)] text-[oklch(0.18_0.02_260)]" :
                       "bg-[oklch(0.65_0.25_145/0.1)] text-[oklch(0.45_0.25_145)]"
                     }`}>
                       {ACCESS_LEVEL_LABELS[u.accessLevel]}
                     </span>
                  </div>

                  <div className="text-xs text-[oklch(0.45_0.02_260)] space-y-1.5 mb-5 flex-1">
                     <p className="flex items-center gap-2"><Phone size={14} className="opacity-70"/> {u.phone}</p>
                     <p className="flex items-center gap-2 truncate"><Mail size={14} className="opacity-70"/> {u.email}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-[oklch(0.92_0.02_85)]">
                    <p className="text-[10px] font-bold text-[oklch(0.55_0.02_260)] uppercase mb-2">Acesso aos Módulos</p>
                    <div className="flex flex-wrap gap-1">
                      {(u.customPermissions || ACCESS_LEVEL_PERMISSIONS[u.accessLevel] || []).length === 0 ? (
                        <span className="text-xs text-[oklch(0.65_0.02_260)]">Nenhum</span>
                      ) : (u.customPermissions || ACCESS_LEVEL_PERMISSIONS[u.accessLevel] || []).slice(0, 3).map((p: AdminPermission) => (
                        <span key={p} className="px-2 py-0.5 rounded bg-[oklch(0.98_0.005_85)] border border-[oklch(0.92_0.02_85)] text-[9px] font-bold text-[oklch(0.35_0.02_260)]">
                          {permissionLabels[p]}
                        </span>
                      ))}
                      {(u.customPermissions || ACCESS_LEVEL_PERMISSIONS[u.accessLevel] || []).length > 3 && (
                         <span className="px-1.5 py-0.5 rounded bg-[oklch(0.92_0.02_85)] text-[9px] font-bold text-[oklch(0.35_0.02_260)]">
                           +{(u.customPermissions || ACCESS_LEVEL_PERMISSIONS[u.accessLevel] || []).length - 3}
                         </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* ========================================================= */}
      {/* SLIDE-OVER: CREATE/EDIT FORM */}
      {/* ========================================================= */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[oklch(0.92_0.02_85)] flex items-center justify-between bg-[oklch(0.99_0.005_85)]">
               <div>
                 <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{editingId ? "Editar Usuário" : "Novo Usuário"}</h2>
                 <p className="text-sm text-[oklch(0.45_0.02_260)]">Configure os dados de acesso.</p>
               </div>
               <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[oklch(0.92_0.02_85)] transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-4">
               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Nome Completo *</label>
                 <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputCls} placeholder="Ex: Maria Souza" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 sm:col-span-1">
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">WhatsApp *</label>
                   <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className={inputCls} placeholder="(00) 00000-0000" />
                 </div>
                 <div className="col-span-2 sm:col-span-1">
                   <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">Senha</label>
                   <input value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className={inputCls} placeholder={editingId ? "Inalterada" : "acesso123"} />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] uppercase mb-1.5 ml-1">E-mail *</label>
                 <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className={inputCls} placeholder="email@exemplo.com" />
               </div>

               <div className="p-4 rounded-xl border border-[oklch(0.92_0.02_85)] bg-[oklch(0.98_0.005_85)] mt-6">
                 <p className="text-xs font-bold text-[oklch(0.18_0.02_260)] uppercase mb-3 flex items-center gap-2">
                   <ShieldAlert size={14} className="text-[oklch(0.55_0.22_262)]"/> Perfil e Permissões
                 </p>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] mb-1">Tipo de Conta</label>
                     <select value={form.role} onChange={(e) => handleRoleChange(e.target.value as any)} className={inputCls}>
                       <option value="admin">Interno / Administrativo</option>
                       <option value="crew">Equipe Operacional</option>
                       <option value="client">Cliente Externo</option>
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-[oklch(0.45_0.02_260)] mb-1">Nível de Acesso</label>
                     <select value={form.accessLevel} onChange={(e) => setForm({...form, accessLevel: e.target.value as AccessLevel})} className={inputCls}>
                       {allowedLevelsForRole(form.role).map((level) => (
                         <option key={level} value={level}>{ACCESS_LEVEL_LABELS[level]}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div className="mt-4 pt-4 border-t border-[oklch(0.92_0.02_85)]">
                    <p className="text-[10px] font-bold text-[oklch(0.45_0.02_260)] uppercase mb-2">Módulos Liberados para este perfil</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(ACCESS_LEVEL_PERMISSIONS[form.accessLevel] || []).length === 0 ? (
                        <span className="text-xs text-[oklch(0.55_0.02_260)]">Sem acesso ao painel administrativo.</span>
                      ) : (
                        ACCESS_LEVEL_PERMISSIONS[form.accessLevel].map((p) => (
                          <span key={p} className="px-2 py-0.5 rounded bg-white border border-[oklch(0.9_0.02_85)] text-[10px] font-bold text-[oklch(0.35_0.02_260)]">
                            {permissionLabels[p]}
                          </span>
                        ))
                      )}
                    </div>
                 </div>
               </div>
            </form>

            <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3">
               <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] font-bold text-[oklch(0.45_0.02_260)] hover:bg-[oklch(0.97_0.01_85)] transition-colors">Cancelar</button>
               <button onClick={handleSaveUser} className="flex-1 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform">
                 {editingId ? "Atualizar Acesso" : "Criar Usuário"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OVER: VIEW USER DETAILS */}
      {/* ========================================================= */}
      {selectedUser && !showForm && (
        <div className="fixed inset-0 z-50 flex">
           <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
           <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-[oklch(0.92_0.02_85)] bg-[oklch(0.99_0.005_85)] relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                     selectedUser.role === "admin" ? "bg-[oklch(0.55_0.22_262)]" :
                     selectedUser.role === "crew" ? "bg-[oklch(0.18_0.02_260)]" :
                     "bg-[oklch(0.65_0.25_145)]"
                }`}></div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase tracking-wider">Ficha de Permissões</span>
                  <button onClick={() => setSelectedUser(null)} className="p-2 rounded-xl hover:bg-[oklch(0.92_0.02_85)] transition-colors"><X size={18} /></button>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar name={selectedUser.name} size={64} index={users.findIndex(c => c.id === selectedUser.id)} />
                  <div>
                    <h3 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]">{selectedUser.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        selectedUser.role === "admin" ? "bg-[oklch(0.55_0.22_262/0.1)] text-[oklch(0.38_0.22_262)]" :
                        selectedUser.role === "crew" ? "bg-[oklch(0.18_0.02_260/0.1)] text-[oklch(0.18_0.02_260)]" :
                        "bg-[oklch(0.65_0.25_145/0.1)] text-[oklch(0.45_0.25_145)]"
                      }`}>
                        {ACCESS_LEVEL_LABELS[selectedUser.accessLevel]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)] flex items-center justify-center flex-shrink-0"><Mail size={16} className="text-[oklch(0.45_0.02_260)]" /></div>
                      <div><p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase">Email</p><p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{selectedUser.email}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)] flex items-center justify-center flex-shrink-0"><Phone size={16} className="text-[oklch(0.45_0.02_260)]" /></div>
                      <div><p className="text-xs font-bold text-[oklch(0.55_0.02_260)] uppercase">WhatsApp</p><p className="text-sm font-medium text-[oklch(0.18_0.02_260)]">{selectedUser.phone}</p></div>
                    </div>
                 </div>

                 <div className="p-5 rounded-2xl bg-[oklch(0.98_0.005_85)] border border-[oklch(0.92_0.02_85)]">
                   <p className="text-xs font-extrabold text-[oklch(0.18_0.02_260)] uppercase mb-4 flex items-center gap-2">
                     <Shield size={14} className="text-[oklch(0.55_0.22_262)]"/> Módulos de Acesso
                   </p>
                   <div className="grid grid-cols-2 gap-3">
                     {(selectedUser.customPermissions || ACCESS_LEVEL_PERMISSIONS[selectedUser.accessLevel] || []).length === 0 ? (
                       <p className="col-span-2 text-sm text-[oklch(0.55_0.02_260)]">Conta sem acessos administrativos liberados.</p>
                     ) : (selectedUser.customPermissions || ACCESS_LEVEL_PERMISSIONS[selectedUser.accessLevel] || []).map((p: AdminPermission) => (
                       <div key={p} className="flex items-center gap-2 text-sm text-[oklch(0.35_0.02_260)]">
                         <CheckCircle2 size={14} className="text-[oklch(0.65_0.25_145)]"/> {permissionLabels[p]}
                       </div>
                     ))}
                   </div>
                 </div>

              </div>

              <div className="p-6 border-t border-[oklch(0.92_0.02_85)] flex gap-3 bg-[oklch(0.99_0.005_85)]">
                 <button onClick={() => openEditForm(selectedUser)} className="flex-1 py-3 rounded-xl bg-[oklch(0.55_0.28_340)] text-white font-extrabold shadow-md hover:scale-[1.02] transition-transform">Editar Acessos</button>
                 <button onClick={() => { deleteUser(selectedUser.id); setSelectedUser(null); toast.success("Removido"); }} className="px-5 py-3 rounded-xl border border-red-200 text-red-400 font-bold hover:bg-red-50 transition-colors"><Trash2 size={18}/></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
