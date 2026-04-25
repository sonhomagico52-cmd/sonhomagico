/**
 * Hero — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 * Imagem de fundo gerada, texto à esquerda, confetes decorativos
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Star, Sparkles } from "lucide-react";
import {
  DEFAULT_LANDING_HERO,
  fetchLandingContent,
  normalizeLandingHero,
  type LandingHeroContent,
} from "@/lib/landingServices";

const confettiItems = [
  { emoji: "🌟", top: "15%", left: "8%", delay: "0s", size: "2rem" },
  { emoji: "🎈", top: "25%", right: "12%", delay: "0.5s", size: "2.5rem" },
  { emoji: "✨", top: "60%", left: "5%", delay: "1s", size: "1.8rem" },
  { emoji: "🎊", top: "70%", right: "8%", delay: "1.5s", size: "2rem" },
  { emoji: "⭐", top: "40%", right: "5%", delay: "0.8s", size: "1.5rem" },
  { emoji: "🎉", top: "80%", left: "15%", delay: "0.3s", size: "1.8rem" },
];

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [heroContent, setHeroContent] = useState<LandingHeroContent>(DEFAULT_LANDING_HERO);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const payload = await fetchLandingContent();
        if (payload.hero && typeof payload.hero === "object") {
          setHeroContent(normalizeLandingHero(payload.hero as Partial<LandingHeroContent>));
          return;
        }
      } catch {
        // fall through to local fallback
      }

      try {
        const saved = localStorage.getItem("heroContent");
        if (!saved) {
          setHeroContent(DEFAULT_LANDING_HERO);
          return;
        }
        setHeroContent(normalizeLandingHero(JSON.parse(saved) as Partial<LandingHeroContent>));
      } catch {
        setHeroContent(DEFAULT_LANDING_HERO);
      }
    };

    void loadHero();
  }, []);

  const scrollToServices = () => {
    document.querySelector("#servicos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="inicio"
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-no-repeat transition-transform duration-300"
        style={{
          backgroundImage: `url(${heroContent.image})`,
          backgroundSize: "cover",
          backgroundPosition: heroContent.imagePosition || "center center",
          transform: `scale(${heroContent.imageZoom || 1})`,
          transformOrigin: "center center",
        }}
      />
      {/* Overlay gradient — dark on left for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.1_0.02_260/0.85)] via-[oklch(0.1_0.02_260/0.6)] to-[oklch(0.1_0.02_260/0.1)]" />

      {/* Floating decorative elements */}
      {confettiItems.map((item, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none float-anim"
          style={{
            top: item.top,
            left: (item as any).left,
            right: (item as any).right,
            animationDelay: item.delay,
            fontSize: item.size,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Content */}
      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)] text-sm font-bold mb-6 shadow-lg transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ fontFamily: "'Baloo 2', cursive", transitionDelay: "0.1s" }}
          >
            <Sparkles size={16} className="text-[oklch(0.55_0.28_340)]" />
            {heroContent.badge}
            <Star size={14} className="fill-[oklch(0.55_0.28_340)] text-[oklch(0.55_0.28_340)]" />
          </div>

          {/* Main heading */}
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ fontFamily: "'Baloo 2', cursive", transitionDelay: "0.2s" }}
          >
            {heroContent.title}
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg md:text-xl text-white/90 font-medium mb-8 leading-relaxed transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ fontFamily: "'Nunito', sans-serif", transitionDelay: "0.35s" }}
          >
            {heroContent.subtitle}
          </p>

          {/* Stats row */}
          <div
            className={`flex flex-wrap gap-4 mb-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.45s" }}
          >
            {[
              { value: "160+", label: "Personagens" },
              { value: "73,7k", label: "Seguidores no Instagram" },
              { value: "1955", label: "Publicações" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20"
              >
                <span
                  className="text-2xl font-extrabold text-[oklch(0.88_0.18_85)]"
                  style={{ fontFamily: "'Baloo 2', cursive" }}
                >
                  {stat.value}
                </span>
                <span className="text-xs text-white/80 font-semibold uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.55s" }}
          >
            <a
              href="https://wa.me/5547999447152?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20para%20meu%20evento."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-4 rounded-full bg-[oklch(0.65_0.25_145)] hover:bg-[oklch(0.58_0.25_145)] text-white font-extrabold text-base transition-all duration-200 hover:scale-105 shadow-xl whatsapp-pulse"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {heroContent.cta}
            </a>
            <button
              onClick={scrollToServices}
              className="flex items-center gap-2 px-7 py-4 rounded-full border-2 border-white/70 text-white font-bold text-base hover:bg-white/15 transition-all duration-200 hover:scale-105"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Ver Serviços
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
        aria-label="Rolar para baixo"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
}
