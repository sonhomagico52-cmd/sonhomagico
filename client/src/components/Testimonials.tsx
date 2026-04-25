/**
 * Testimonials — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 * Carrossel de depoimentos com avatares e estrelas
 */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { fetchLandingContent } from "@/lib/landingServices";

const TESTIMONIAL_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/testimonial-bg-NfQmTdGhbieWoZ9oTb74BP.webp";

interface TestimonialItem {
  name: string;
  role: string;
  avatar: string;
  avatarColor: string;
  stars: number;
  text: string;
  service: string;
  serviceColor: string;
}

const defaultTestimonials: TestimonialItem[] = [
  {
    name: "Ana Carolina Silva",
    role: "Mãe da Isabela, 5 anos",
    avatar: "AC",
    avatarColor: "oklch(0.55 0.28 340)",
    stars: 5,
    text: "A Sonho Mágico transformou o aniversário da minha filha em algo mágico! A Elsa chegou pontualmente, interagiu maravilhosamente com as crianças e todos adoraram. Já contratei para o próximo ano!",
    service: "Personagens Kids",
    serviceColor: "oklch(0.88 0.18 85)",
  },
  {
    name: "Roberto Mendes",
    role: "Organizador de eventos corporativos",
    avatar: "RM",
    avatarColor: "oklch(0.55 0.22 262)",
    stars: 5,
    text: "Contratei a equipe para um evento corporativo com mais de 300 crianças. Foram profissionais do início ao fim: pontualidade, qualidade das fantasias e energia dos animadores foram impecáveis. Recomendo sem hesitar!",
    service: "Recreação",
    serviceColor: "oklch(0.65 0.25 145)",
  },
  {
    name: "Fernanda Oliveira",
    role: "Mãe do Miguel, 7 anos",
    avatar: "FO",
    avatarColor: "oklch(0.65 0.25 145)",
    stars: 5,
    text: "A Carreta Furacão foi um sucesso absoluto! As crianças do bairro inteiro ficaram animadas. A equipe foi super atenciosa no atendimento e o show superou todas as expectativas. Valeu cada centavo!",
    service: "Carreta Furacão",
    serviceColor: "oklch(0.55 0.25 25)",
  },
  {
    name: "Juliana Costa",
    role: "Diretora de escola infantil",
    avatar: "JC",
    avatarColor: "oklch(0.72 0.22 55)",
    stars: 5,
    text: "Utilizamos os serviços da Sonho Mágico para o dia das crianças da nossa escola. Os Magic Drinks Kids foram um diferencial incrível — as crianças ficaram encantadas! A recreação foi animada e organizada. Nota 10!",
    service: "Magic Drinks Kids",
    serviceColor: "oklch(0.55 0.22 262)",
  },
  {
    name: "Carlos Eduardo",
    role: "Pai do Pedro, 4 anos",
    avatar: "CE",
    avatarColor: "oklch(0.55 0.25 300)",
    stars: 5,
    text: "O Homem-Aranha chegou e meu filho ficou sem palavras! A fantasia era de altíssima qualidade e o profissional sabia exatamente como interagir com crianças pequenas. Festa inesquecível! Obrigado, Sonho Mágico!",
    service: "Personagens Kids",
    serviceColor: "oklch(0.88 0.18 85)",
  },
  {
    name: "Mariana Souza",
    role: "Mãe da Sofia, 6 anos",
    avatar: "MS",
    avatarColor: "oklch(0.55 0.28 340)",
    stars: 5,
    text: "Os brinquedos infláveis foram um sucesso! Cama elástica, tobogã e piscina de bolinhas — as crianças não queriam ir embora. A montagem foi rápida e a equipe foi muito cuidadosa com a segurança. Super recomendo!",
    service: "Brinquedos",
    serviceColor: "oklch(0.55 0.25 300)",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={16} className="fill-[oklch(0.88_0.18_85)] text-[oklch(0.88_0.18_85)]" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(defaultTestimonials);
  const ref = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mapTestimonials = (parsed: Array<{ name: string; role: string; text: string; rating: number }>) => {
      setTestimonials(
        parsed.map((item, index) => ({
          name: item.name,
          role: item.role,
          avatar: item.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
          avatarColor: defaultTestimonials[index % defaultTestimonials.length].avatarColor,
          stars: item.rating,
          text: item.text,
          service: "Sonho Mágico",
          serviceColor: defaultTestimonials[index % defaultTestimonials.length].serviceColor,
        })),
      );
    };

    const loadTestimonials = async () => {
      try {
        const payload = await fetchLandingContent();
        if (Array.isArray(payload.testimonials) && payload.testimonials.length > 0) {
          mapTestimonials(payload.testimonials as Array<{ name: string; role: string; text: string; rating: number }>);
          return;
        }
      } catch {
        // fall through to local fallback
      }

      try {
        const saved = localStorage.getItem("testimonials");
        if (!saved) {
          setTestimonials(defaultTestimonials);
          return;
        }
        const parsed = JSON.parse(saved) as Array<{ name: string; role: string; text: string; rating: number }>;
        if (Array.isArray(parsed) && parsed.length > 0) {
          mapTestimonials(parsed);
          return;
        }
      } catch {
        // ignore local parse failure
      }

      setTestimonials(defaultTestimonials);
    };

    void loadTestimonials();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoplay, current]);

  const goTo = (index: number) => {
    setCurrent(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((current + 1) % testimonials.length);

  // Show 3 cards on desktop, 1 on mobile
  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < 3; i++) {
      cards.push(testimonials[(current + i) % testimonials.length]);
    }
    return cards;
  };

  return (
    <section
      id="depoimentos"
      className="py-20 relative overflow-hidden"
      style={{
        backgroundImage: `url(${TESTIMONIAL_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/88 backdrop-blur-sm" />

      <div className="container relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.88_0.18_85/0.3)] text-[oklch(0.5_0.15_65)] text-sm font-bold mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            ⭐ Depoimentos
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            O que dizem nossos{" "}
            <span className="text-[oklch(0.55_0.28_340)]">clientes</span>
          </h2>
          <p
            className="text-base md:text-lg text-[oklch(0.45_0.02_260)] max-w-2xl mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Mais de 73 mil famílias nos seguem e confiam na Sonho Mágico. Veja o que elas dizem!
          </p>

          {/* Overall rating */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={22} className="fill-[oklch(0.88_0.18_85)] text-[oklch(0.88_0.18_85)]" />
              ))}
            </div>
            <span
              className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              5.0
            </span>
            <span
              className="text-sm text-[oklch(0.5_0.02_260)]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              · Avaliação média dos clientes
            </span>
          </div>
        </div>

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
          {getVisibleCards().map((t, i) => (
            <TestimonialCard key={t.name + i} testimonial={t} index={i} />
          ))}
        </div>

        {/* Mobile: 1 card */}
        <div className="md:hidden mb-8">
          <TestimonialCard testimonial={testimonials[current]} index={0} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white border-2 border-[oklch(0.9_0.02_85)] flex items-center justify-center text-[oklch(0.35_0.02_260)] hover:border-[oklch(0.55_0.28_340)] hover:text-[oklch(0.55_0.28_340)] transition-colors shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  backgroundColor: i === current ? "oklch(0.55 0.28 340)" : "oklch(0.8 0.02 85)",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-white border-2 border-[oklch(0.9_0.02_85)] flex items-center justify-center text-[oklch(0.35_0.02_260)] hover:border-[oklch(0.55_0.28_340)] hover:text-[oklch(0.55_0.28_340)] transition-colors shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial: t, index }: { testimonial: TestimonialItem; index: number }) {
  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-lg border border-[oklch(0.92_0.02_85)] relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
      style={{
        animation: "slide-up 0.5s ease forwards",
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
      }}
    >
      {/* Quote icon */}
      <div className="absolute top-4 right-4 text-[oklch(0.92_0.02_85)]">
        <Quote size={36} />
      </div>

      {/* Service badge */}
      <div
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white mb-4"
        style={{ backgroundColor: t.serviceColor }}
      >
        {t.service}
      </div>

      {/* Stars */}
      <StarRating count={t.stars} />

      {/* Text */}
      <p
        className="text-sm text-[oklch(0.4_0.02_260)] leading-relaxed mt-3 mb-5"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        "{t.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-[oklch(0.94_0.01_85)]">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
          style={{ backgroundColor: t.avatarColor, fontFamily: "'Baloo 2', cursive" }}
        >
          {t.avatar}
        </div>
        <div>
          <p
            className="font-extrabold text-sm text-[oklch(0.18_0.02_260)]"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {t.name}
          </p>
          <p
            className="text-xs text-[oklch(0.55_0.02_260)]"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {t.role}
          </p>
        </div>
      </div>

      {/* Bottom color accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
        style={{ backgroundColor: t.serviceColor }}
      />
    </div>
  );
}
