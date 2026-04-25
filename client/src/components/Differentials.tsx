/**
 * Differentials — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 * Seção de diferenciais com números animados e ícones festivos
 */
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 160, suffix: "+", label: "Personagens", emoji: "🎭" },
  {
    value: 73700,
    suffix: "+",
    label: "Seguidores",
    emoji: "❤️",
    format: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)),
  },
  { value: 1955, suffix: "+", label: "Publicações", emoji: "📸" },
  { value: 10, suffix: "+", label: "Anos de experiência", emoji: "⭐" },
];

const differentials = [
  {
    icon: "🏆",
    title: "Qualidade Garantida",
    description:
      "Fantasias premium, profissionais treinados e equipamentos de ponta para um espetáculo impecável.",
    color: "oklch(0.88 0.18 85)",
  },
  {
    icon: "⚡",
    title: "Pontualidade Total",
    description:
      "Chegamos no horário combinado, sempre. Seu evento começa na hora certa, sem estresse.",
    color: "oklch(0.55 0.28 340)",
  },
  {
    icon: "🎯",
    title: "Personalização",
    description:
      "Adaptamos cada serviço ao tema e necessidades do seu evento. Cada festa é única!",
    color: "oklch(0.55 0.22 262)",
  },
  {
    icon: "🌟",
    title: "Experiência",
    description:
      "Mais de uma década levando alegria para famílias de Joinville e toda a região.",
    color: "oklch(0.65 0.25 145)",
  },
  {
    icon: "💬",
    title: "Atendimento Ágil",
    description:
      "Respondemos rapidamente pelo WhatsApp. Orçamento sem compromisso em minutos.",
    color: "oklch(0.72 0.22 55)",
  },
  {
    icon: "🎪",
    title: "Variedade Única",
    description:
      "160+ personagens, recreação, drinks, brinquedos e carreta furacão — tudo em um só lugar.",
    color: "oklch(0.55 0.25 300)",
  },
];

function AnimatedCounter({
  target,
  suffix,
  format,
}: {
  target: number;
  suffix: string;
  format?: (v: number) => string;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  const display = format ? format(count) : count.toLocaleString("pt-BR");

  return <span ref={ref}>{display}{suffix}</span>;
}

function DifferentialCard({
  diff,
  index,
}: {
  diff: (typeof differentials)[0];
  index: number;
}) {
  const [cardVisible, setCardVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCardVisible(true);
      },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="group p-6 rounded-2xl border border-[oklch(0.92_0.02_85)] hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
      style={{
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? "translateY(0)" : "translateY(30px)",
        transition:
          "opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        transitionDelay: `${index * 0.08}s`,
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{
          backgroundColor: diff.color.replace(")", " / 0.15)").replace("oklch(", "oklch("),
          // fallback inline style for bg with opacity
        }}
      >
        {diff.icon}
      </div>
      <h3
        className="text-lg font-extrabold text-[oklch(0.18_0.02_260)] mb-2"
        style={{ fontFamily: "'Baloo 2', cursive" }}
      >
        {diff.title}
      </h3>
      <p
        className="text-sm text-[oklch(0.45_0.02_260)] leading-relaxed"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {diff.description}
      </p>
      <div
        className="mt-4 w-8 h-1 rounded-full transition-all duration-300 group-hover:w-16"
        style={{ backgroundColor: diff.color }}
      />
    </div>
  );
}

export default function Differentials() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="diferenciais" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[oklch(0.88_0.18_85)] via-[oklch(0.55_0.28_340)] via-[oklch(0.55_0.22_262)] to-[oklch(0.65_0.25_145)]" />
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[oklch(0.55_0.28_340/0.05)] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[oklch(0.88_0.18_85/0.15)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Stats bar */}
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 p-6 md:p-8 rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.28 340) 0%, oklch(0.38 0.22 262) 100%)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl mb-1">{stat.emoji}</div>
              <div
                className="text-3xl md:text-4xl font-extrabold text-[oklch(0.88_0.18_85)]"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  format={stat.format}
                />
              </div>
              <div
                className="text-sm text-white/80 font-semibold mt-1"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.88_0.18_85/0.2)] text-[oklch(0.5_0.15_65)] text-sm font-bold mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            🌟 Por que nos escolher?
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Nossos{" "}
            <span className="text-[oklch(0.55_0.28_340)]">Diferenciais</span>
          </h2>
          <p
            className="text-base md:text-lg text-[oklch(0.45_0.02_260)] max-w-2xl mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Somos referência em animação e entretenimento em Joinville. Veja por que
            milhares de famílias confiam na Sonho Mágico para seus eventos.
          </p>
        </div>

        {/* Differentials grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentials.map((diff, index) => (
            <DifferentialCard key={diff.title} diff={diff} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
