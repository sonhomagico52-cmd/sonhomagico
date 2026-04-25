/**
 * HistoryBackupModule — Sonho Mágico Joinville CRM
 * Módulo de histórico de atividades e backup automático
 */
import { useState, useEffect } from "react";
import { Download, Trash2, RotateCcw, Clock, HardDrive } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  action: string;
  type: "cliente" | "evento" | "orcamento" | "sistema";
  description: string;
  timestamp: string;
  user: string;
}

export default function HistoryBackupModule() {
  const { users, events, quotes } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"all" | "cliente" | "evento" | "orcamento" | "sistema">("all");

  // Carregar logs e backups do localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem("activityLogs");
    if (savedLogs) setActivityLogs(JSON.parse(savedLogs));

    const savedBackups = localStorage.getItem("backups");
    if (savedBackups) setBackups(JSON.parse(savedBackups));
  }, []);

  // Salvar logs
  useEffect(() => {
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  const addLog = (action: string, type: ActivityLog["type"], description: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      type,
      description,
      timestamp: new Date().toISOString(),
      user: "Admin",
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  // Filtrar logs
  const filteredLogs = filterType === "all" ? activityLogs : activityLogs.filter((l) => l.type === filterType);

  const getLogColor = (type: string) => {
    switch (type) {
      case "cliente":
        return "bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)]";
      case "evento":
        return "bg-[oklch(0.55_0.28_340)] text-white";
      case "orcamento":
        return "bg-[oklch(0.65_0.25_145)] text-white";
      case "sistema":
        return "bg-[oklch(0.55_0.22_262)] text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "cliente":
        return "👤";
      case "evento":
        return "📅";
      case "orcamento":
        return "💰";
      case "sistema":
        return "⚙️";
      default:
        return "•";
    }
  };

  // Criar backup
  const handleCreateBackup = () => {
    const backup = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data: { users, events, quotes, activityLogs },
      size: JSON.stringify({ users, events, quotes, activityLogs }).length,
    };
    setBackups([backup, ...backups]);
    localStorage.setItem("backups", JSON.stringify([backup, ...backups]));
    addLog("Backup criado", "sistema", `Backup manual criado com ${users.length} clientes, ${events.length} eventos`);
    toast.success("Backup criado com sucesso!");
  };

  // Restaurar backup
  const handleRestoreBackup = (backup: any) => {
    localStorage.setItem("users", JSON.stringify(backup.data.users));
    localStorage.setItem("events", JSON.stringify(backup.data.events));
    localStorage.setItem("quotes", JSON.stringify(backup.data.quotes));
    addLog("Backup restaurado", "sistema", `Backup de ${new Date(backup.timestamp).toLocaleDateString("pt-BR")} restaurado`);
    toast.success("Backup restaurado! Recarregue a página para ver as alterações.");
  };

  // Exportar backup
  const handleExportBackup = (backup: any) => {
    const data = JSON.stringify(backup.data, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${backup.id}.json`;
    a.click();
    toast.success("Backup exportado!");
  };

  // Deletar backup
  const handleDeleteBackup = (id: string) => {
    const newBackups = backups.filter((b) => b.id !== id);
    setBackups(newBackups);
    localStorage.setItem("backups", JSON.stringify(newBackups));
    toast.success("Backup deletado!");
  };

  // Limpar logs
  const handleClearLogs = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os logs?")) {
      setActivityLogs([]);
      localStorage.setItem("activityLogs", JSON.stringify([]));
      toast.success("Logs limpos!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
        📋 Histórico e Backup
      </h2>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[oklch(0.92_0.02_85)] overflow-x-auto">
        {[
          { id: "history", label: "Histórico de Atividades", icon: Clock },
          { id: "backup", label: "Backups", icon: HardDrive },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={`px-4 py-3 font-bold border-b-2 whitespace-nowrap transition-colors ${
              id === "history"
                ? "border-[oklch(0.55_0.28_340)] text-[oklch(0.55_0.28_340)]"
                : "border-transparent text-[oklch(0.18_0.02_260)]/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* History Tab */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none text-sm"
            >
              <option value="all">Todos os Tipos</option>
              <option value="cliente">Clientes</option>
              <option value="evento">Eventos</option>
              <option value="orcamento">Orçamentos</option>
              <option value="sistema">Sistema</option>
            </select>
          </div>
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 rounded-lg bg-[oklch(0.65_0.25_145)] text-white font-bold hover:scale-105 transition-transform text-sm"
          >
            Limpar Logs
          </button>
        </div>

        {/* Activity Logs */}
        <div className="space-y-2">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl shadow-sm p-4 border border-[oklch(0.92_0.02_85)]">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${getLogColor(log.type)}`}>
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[oklch(0.18_0.02_260)]">{log.action}</p>
                      <p className="text-xs text-[oklch(0.18_0.02_260)]/50">
                        {new Date(log.timestamp).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <p className="text-sm text-[oklch(0.18_0.02_260)]/70 mt-1">{log.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-[oklch(0.92_0.02_85)]">
              <p className="text-[oklch(0.18_0.02_260)]/60 text-sm">Nenhuma atividade registrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Backup Section */}
      <div className="space-y-4 mt-8 pt-8 border-t border-[oklch(0.92_0.02_85)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">Backups</h3>
          <button
            onClick={handleCreateBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold hover:scale-105 transition-transform"
          >
            <HardDrive size={16} />
            Criar Backup Agora
          </button>
        </div>

        {/* Backups List */}
        <div className="space-y-3">
          {backups.length > 0 ? (
            backups.map((backup) => (
              <div key={backup.id} className="bg-white rounded-xl shadow-sm p-4 border border-[oklch(0.92_0.02_85)]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-[oklch(0.18_0.02_260)]">
                      {new Date(backup.timestamp).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-[oklch(0.18_0.02_260)]/60 mt-1">
                      {backup.data.users.length} clientes • {backup.data.events.length} eventos • {backup.data.quotes.length} orçamentos
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportBackup(backup)}
                      className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
                      title="Exportar"
                    >
                      <Download size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button
                      onClick={() => handleRestoreBackup(backup)}
                      className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
                      title="Restaurar"
                    >
                      <RotateCcw size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-[oklch(0.92_0.02_85)]">
              <p className="text-[oklch(0.18_0.02_260)]/60 text-sm">Nenhum backup criado ainda</p>
            </div>
          )}
        </div>

        {/* Backup Info */}
        <div className="p-4 rounded-lg bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)]">
          <p className="text-sm text-[oklch(0.18_0.02_260)]/70">
            💡 <strong>Dica:</strong> Crie backups regularmente para proteger seus dados. Você pode restaurar um backup a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
}
