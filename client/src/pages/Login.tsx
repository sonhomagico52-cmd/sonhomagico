/**
 * Login — Sonho Mágico Joinville CRM
 * Página de autenticação com login e cadastro
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, Lock, Phone, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { login, signup } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Preencha todos os campos");
      return;
    }
    setIsSubmitting(true);
    try {
      const loggedUser = await login(formData.email, formData.password);
      if (loggedUser) {
        toast.success("Login realizado com sucesso!");
        setLocation(loggedUser.role === "admin" ? "/admin" : loggedUser.role === "crew" ? "/equipe" : "/dashboard");
      } else {
        toast.error("Email ou senha incorretos");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não correspondem");
      return;
    }
    setIsSubmitting(true);
    try {
      const newUser = await signup(formData.name, formData.email, formData.phone, formData.password);
      if (newUser) {
        toast.success("Cadastro realizado com sucesso!");
        setLocation("/dashboard");
      } else {
        toast.error("Email já cadastrado ou erro ao criar conta");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.88_0.18_85)] via-[oklch(0.55_0.28_340)] to-[oklch(0.55_0.22_262)] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 text-white/10 text-9xl font-bold">🎉</div>
      <div className="absolute bottom-10 right-10 text-white/10 text-9xl font-bold">🎭</div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-[oklch(0.55_0.28_340)]" style={{ fontFamily: "'Baloo 2', cursive" }}>S</span>
            </div>
          </a>
          <h1
            className="text-4xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Sonho Mágico
          </h1>
          <p className="text-white/80 font-medium">Plataforma de Gerenciamento</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => {
                setIsSignup(false);
                setFormData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
              }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isSignup
                  ? "bg-[oklch(0.55_0.28_340)] text-white"
                  : "bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]"
                }`}
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsSignup(true);
                setFormData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
              }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${isSignup
                  ? "bg-[oklch(0.55_0.28_340)] text-white"
                  : "bg-[oklch(0.97_0.01_85)] text-[oklch(0.18_0.02_260)]"
                }`}
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Cadastro
            </button>
          </div>

          {/* Form */}
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {/* Name (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-[oklch(0.55_0.28_340)]" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-[oklch(0.55_0.28_340)]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Phone (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3 text-[oklch(0.55_0.28_340)]" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(47) 99999-9999"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-[oklch(0.55_0.28_340)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Sua senha"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[oklch(0.55_0.28_340)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-bold text-[oklch(0.18_0.02_260)] mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-[oklch(0.55_0.28_340)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirme sua senha"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[oklch(0.92_0.02_85)] focus:border-[oklch(0.55_0.28_340)] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[oklch(0.88_0.18_85)] to-[oklch(0.55_0.28_340)] text-white font-bold hover:shadow-lg transition-all hover:scale-105 mt-6 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {isSubmitting ? "Aguarde..." : isSignup ? "Criar Conta" : "Entrar"}
            </button>
          </form>

          {/* Info de acesso */}
          {!isSignup && (
            <div className="mt-6 p-4 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.92_0.02_85)]">
              <p className="text-xs text-[oklch(0.18_0.02_260)]/70 text-center">
                Entre com seu e-mail e senha cadastrados.
              </p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors mt-6 font-bold"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          <ArrowLeft size={18} />
          Voltar para Home
        </a>
      </div>
    </div>
  );
}
