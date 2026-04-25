/**
 * Navbar — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 * Fundo branco com logo colorido, links de navegação e CTA WhatsApp
 */
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Personagens", href: "#personagens" },
  { label: "Galeria", href: "#galeria" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Agenda", href: "#agenda" },
  { label: "FAQ", href: "#faq" },
  { label: "Contato", href: "#contato" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [companyConfig, setCompanyConfig] = useState<{ companyName?: string; logoUrl?: string }>(() => {
    try {
      return JSON.parse(localStorage.getItem("smj_config") || "{}") as { companyName?: string; logoUrl?: string };
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      // Detect active section
      const sections = navLinks.map(l => l.href.replace("#", "")).filter(s => s);
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
      if (window.scrollY < 120) setActiveSection("inicio");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncConfig = () => {
      try {
        setCompanyConfig(JSON.parse(localStorage.getItem("smj_config") || "{}") as { companyName?: string; logoUrl?: string });
      } catch {
        setCompanyConfig({});
      }
    };
    window.addEventListener("storage", syncConfig);
    window.addEventListener("smj-config-updated", syncConfig);
    return () => {
      window.removeEventListener("storage", syncConfig);
      window.removeEventListener("smj-config-updated", syncConfig);
    };
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/5"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => { e.preventDefault(); handleNavClick("#inicio"); }}
            className="flex items-center gap-3 group flex-shrink-0 rounded-full pl-1.5 pr-4 py-1.5 bg-white/78 border border-white/70 shadow-[0_10px_24px_rgba(16,24,40,0.08)] backdrop-blur-sm"
          >
            {companyConfig.logoUrl ? (
              <div className="relative w-14 h-14 flex-shrink-0 rounded-[1.35rem] p-[2px] bg-gradient-to-br from-[oklch(0.88_0.18_85)] via-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] shadow-lg shadow-[oklch(0.55_0.28_340/0.18)] group-hover:scale-[1.04] transition-transform">
                <div className="w-full h-full rounded-[1.2rem] bg-white/98 flex items-center justify-center overflow-hidden">
                  <img
                    src={companyConfig.logoUrl}
                    alt={companyConfig.companyName || "Sonho Mágico"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="relative w-10 h-10 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[oklch(0.88_0.18_85)] via-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-white text-xl font-bold" style={{ fontFamily: "'Baloo 2', cursive" }}>S</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[oklch(0.88_0.18_85)] rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[8px]">✨</span>
                </div>
              </div>
            )}
            <div className="leading-tight">
              <span className="block text-[15px] font-extrabold text-[oklch(0.18_0.02_260)] tracking-[-0.01em]" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {companyConfig.companyName || "Sonho Mágico"}
              </span>
              <span className="block text-[11px] text-[oklch(0.55_0.28_340)] font-extrabold tracking-[0.18em] uppercase">
                Joinville
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  className="text-xs font-bold transition-colors relative group"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    color: isActive ? "oklch(0.55 0.28 340)" : "oklch(0.35 0.02 260)",
                  }}
                >
                  {link.label}
                  <span
                    className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? "100%" : "0%",
                      backgroundColor: "oklch(0.55 0.28 340)",
                    }}
                  />
                </a>
              );
            })}
          </div>

          {/* CTA WhatsApp + Login */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.88_0.18_85)] hover:bg-[oklch(0.78_0.18_85)] text-[oklch(0.18_0.02_260)] font-bold text-xs transition-all duration-200 hover:scale-105"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Acessar
            </a>
            <a
              href="https://wa.me/5547999447152"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.65_0.25_145)] hover:bg-[oklch(0.58_0.25_145)] text-white font-bold text-xs transition-all duration-200 hover:scale-105 shadow-md"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              <Phone size={14} />
              Orcamento
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-[oklch(0.35_0.02_260)] hover:bg-[oklch(0.95_0.01_85)] transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-[oklch(0.9_0.02_85)] shadow-lg">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="py-3 px-4 rounded-xl text-sm font-semibold text-[oklch(0.35_0.02_260)] hover:bg-[oklch(0.95_0.01_85)] hover:text-[oklch(0.55_0.28_340)] transition-colors"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://wa.me/5547999447152"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[oklch(0.65_0.25_145)] text-white font-bold text-sm"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              <Phone size={16} />
              (47) 99944-7152 — Solicitar Orçamento
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
