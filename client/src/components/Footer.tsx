/**
 * Footer — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 */
import { Phone, Instagram, Heart } from "lucide-react";

const services = [
  "Personagens Kids",
  "Recreação",
  "Magic Drinks Kids",
  "Brinquedos",
  "Carreta Furacão",
];

const scrollTo = (id: string) => {
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.15 0.02 260) 0%, oklch(0.22 0.05 280) 100%)",
      }}
    >
      {/* Decorative top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-[oklch(0.88_0.18_85)] via-[oklch(0.55_0.28_340)] via-[oklch(0.55_0.22_262)] to-[oklch(0.65_0.25_145)]" />

      {/* Floating stars decoration */}
      {["5%", "25%", "50%", "75%", "92%"].map((left, i) => (
        <div
          key={i}
          className="absolute text-white/5 text-7xl font-bold pointer-events-none"
          style={{ top: `${10 + i * 18}%`, left }}
        >
          ★
        </div>
      ))}

      <div className="container relative z-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.88_0.18_85)] via-[oklch(0.55_0.28_340)] to-[oklch(0.38_0.22_262)] flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold" style={{ fontFamily: "'Baloo 2', cursive" }}>S</span>
              </div>
              <div>
                <span className="block text-lg font-extrabold text-white" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  Sonho Mágico
                </span>
                <span className="block text-xs text-[oklch(0.88_0.18_85)] font-semibold tracking-widest uppercase">
                  Joinville Eventos
                </span>
              </div>
            </div>
            <p
              className="text-white/70 text-sm leading-relaxed mb-5 max-w-xs"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Levamos entretenimento e alegria para todos os públicos. Mais de 160 opções
              de personagens vivos e serviços completos para seu evento em Joinville e região.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/5547999447152"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.65_0.25_145)] hover:bg-[oklch(0.58_0.25_145)] text-white font-bold text-sm transition-all hover:scale-105"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                <Phone size={14} />
                WhatsApp
              </a>
              <a
                href="https://contate.me/sonhomagicojoinville"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.55_0.28_340)] hover:bg-[oklch(0.48_0.28_340)] text-white font-bold text-sm transition-all hover:scale-105"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                <Instagram size={14} />
                Instagram
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-white font-extrabold text-base mb-4"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Serviços
            </h4>
            <ul className="flex flex-col gap-2">
              {services.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => scrollTo("#servicos")}
                    className="text-white/65 hover:text-[oklch(0.88_0.18_85)] text-sm font-medium transition-colors text-left"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    → {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4
              className="text-white font-extrabold text-base mb-4"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Links Rápidos
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Início", id: "#inicio" },
                { label: "Personagens", id: "#personagens" },
                { label: "Galeria", id: "#galeria" },
                { label: "Depoimentos", id: "#depoimentos" },
                { label: "FAQ", id: "#faq" },
                { label: "Contato", id: "#contato" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="text-white/65 hover:text-[oklch(0.88_0.18_85)] text-sm font-medium transition-colors text-left"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    → {link.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/10">
              <p
                className="text-white/80 text-xs font-semibold mb-1"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                📞 (47) 99944-7152
              </p>
              <p
                className="text-white/60 text-xs"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Seg–Sáb: 8h às 20h
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-white/50 text-xs"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            © {new Date().getFullYear()} Sonho Mágico Joinville. Todos os direitos reservados.
          </p>
          <p
            className="text-white/50 text-xs flex items-center gap-1"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Feito com <Heart size={12} className="text-[oklch(0.55_0.28_340)] fill-[oklch(0.55_0.28_340)]" /> em Joinville, SC
          </p>
        </div>
      </div>
    </footer>
  );
}
