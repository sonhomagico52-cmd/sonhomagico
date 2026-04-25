/**
 * SuperAdminModal — Sonho Mágico Joinville CRM
 * Modal para validação de senha de super usuário
 */
import { useState } from "react";
import { Lock, X } from "lucide-react";
import { toast } from "sonner";

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (password: string) => boolean;
}

export default function SuperAdminModal({ isOpen, onClose, onValidate }: SuperAdminModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (onValidate(password)) {
        toast.success("Acesso de super admin ativado!");
        setPassword("");
        onClose();
      } else {
        toast.error("Senha de super admin incorreta");
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] flex items-center justify-center">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Super Admin
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[oklch(0.18_0.02_260)]" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-[oklch(0.18_0.02_260)]/70 mb-6">
          Digite a senha de super admin para acessar funcionalidades avançadas de gerenciamento.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">
              Senha de Super Admin
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-[oklch(0.55_0.28_340)]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[oklch(0.55_0.28_340)]"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] text-[oklch(0.18_0.02_260)] font-bold hover:bg-[oklch(0.88_0.02_85)] transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
              disabled={isLoading || !password}
            >
              {isLoading ? "Validando..." : "Validar"}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 p-3 rounded-lg bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)]">
          <p className="text-xs text-[oklch(0.18_0.02_260)]/60">
            🔒 <strong>Segurança:</strong> Esta senha protege funcionalidades críticas de gerenciamento.
          </p>
        </div>
      </div>
    </div>
  );
}
