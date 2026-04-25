/**
 * Characters — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 * Seção de destaque dos personagens com fundo colorido e grid de categorias
 */
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_CHARACTERS_SECTION,
  fetchLandingContent,
  normalizeCharactersSection,
  type CharacterCategory,
  type CharactersSectionContent,
} from "@/lib/landingServices";

function CategoryCard({ cat, index }: { cat: CharacterCategory; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const colors = [
    "oklch(0.88 0.18 85)",
    "oklch(0.55 0.28 340)",
    "oklch(0.55 0.22 262)",
    "oklch(0.65 0.25 145)",
    "oklch(0.72 0.22 55)",
    "oklch(0.55 0.25 300)",
    "oklch(0.55 0.25 25)",
    "oklch(0.55 0.28 340)",
  ];

  return (
    <div
      ref={ref}
      className="group p-5 rounded-2xl bg-white/90 border border-white/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        transitionDelay: `${index * 0.07}s`,
        borderLeft: `4px solid ${colors[index % colors.length]}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{cat.emoji}</span>
        <div>
          <h4
            className="font-extrabold text-[oklch(0.18_0.02_260)] text-base mb-1"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {cat.name}
          </h4>
          <p
            className="text-xs text-[oklch(0.5_0.02_260)] leading-relaxed"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {cat.examples}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Characters() {
  const [visible, setVisible] = useState(false);
  const [charactersContent, setCharactersContent] = useState<CharactersSectionContent>(DEFAULT_CHARACTERS_SECTION);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const payload = await fetchLandingContent();
        if (payload.characters && typeof payload.characters === "object") {
          setCharactersContent(normalizeCharactersSection(payload.characters as Partial<CharactersSectionContent>));
          return;
        }
      } catch {
        // fall through to local fallback
      }

      try {
        const saved = localStorage.getItem("charactersSection");
        if (!saved) {
          setCharactersContent(DEFAULT_CHARACTERS_SECTION);
          return;
        }
        setCharactersContent(normalizeCharactersSection(JSON.parse(saved) as Partial<CharactersSectionContent>));
      } catch {
        setCharactersContent(DEFAULT_CHARACTERS_SECTION);
      }
    };

    void loadCharacters();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="personagens"
      className="py-20 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.38 0.22 262) 0%, oklch(0.28 0.22 280) 50%, oklch(0.55 0.28 340) 100%)",
      }}
    >
      {/* Decorative stars */}
      {["10%", "30%", "55%", "75%", "90%"].map((left, i) => (
        <div
          key={i}
          className="absolute text-white/10 text-6xl font-bold pointer-events-none float-anim"
          style={{ top: `${15 + i * 15}%`, left, animationDelay: `${i * 0.4}s` }}
        >
          ★
        </div>
      ))}

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div
            ref={ref}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-40px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold mb-6"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {charactersContent.badge}
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {charactersContent.titlePrefix}{" "}
              <span className="text-[oklch(0.88_0.18_85)]">{charactersContent.highlightedText}</span>{" "}
              {charactersContent.titleSuffix}
            </h2>
            <p
              className="text-white/85 text-base md:text-lg leading-relaxed mb-8"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {charactersContent.description}
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-3 mb-8">
              {charactersContent.highlights.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-full bg-white/15 text-white text-sm font-semibold"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {item}
                </span>
              ))}
            </div>

            <a
              href="https://wa.me/5547999447152?text=Olá!%20Quero%20ver%20a%20lista%20completa%20de%20personagens%20disponíveis."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[oklch(0.88_0.18_85)] hover:bg-[oklch(0.82_0.18_85)] text-[oklch(0.18_0.02_260)] font-extrabold text-base transition-all duration-200 hover:scale-105 shadow-xl"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {charactersContent.cta}
              <span>→</span>
            </a>
          </div>

          {/* Right: categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charactersContent.categories.map((cat, index) => (
              <CategoryCard key={cat.name} cat={cat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
