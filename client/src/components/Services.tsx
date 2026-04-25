/**
 * Services — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 * Cards de serviços com imagens geradas, ícones coloridos e animações de entrada
 */
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LANDING_SERVICES,
  fetchLandingServices,
  type LandingService as Service,
} from "@/lib/landingServices";

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get("highlight");
    if (String(service.id) !== highlight) return;

    setIsHighlighted(true);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = window.setTimeout(() => setIsHighlighted(false), 3500);
    return () => window.clearTimeout(timeout);
  }, [service.id]);

  return (
    <div
      ref={ref}
      className="service-card rounded-3xl overflow-hidden shadow-lg bg-white border border-[oklch(0.92_0.02_85)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease, border-color 0.3s ease`,
        transitionDelay: `${index * 0.1}s`,
        boxShadow: isHighlighted ? "0 0 0 4px rgba(236, 72, 153, 0.18), 0 24px 48px rgba(236, 72, 153, 0.18)" : undefined,
        borderColor: isHighlighted ? "oklch(0.55 0.28 340)" : undefined,
      }}
      data-service-id={service.id}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          style={{
            objectPosition: service.imagePosition || "center center",
            transform: `scale(${service.imageZoom || 1})`,
          }}
        />
        {/* Color overlay at bottom */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
        />
        {/* Badge */}
        <div
          className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: service.color }}
        >
          {service.badge}
        </div>
        {/* Emoji indicator */}
        <div className="absolute top-3 right-3 text-2xl">{service.emoji}</div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Top colored bar */}
        <div
          className="w-12 h-1.5 rounded-full mb-3"
          style={{ backgroundColor: service.color }}
        />
        <h3
          className="text-xl font-extrabold text-[oklch(0.18_0.02_260)] mb-2"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {service.title}
        </h3>
        {isHighlighted && (
          <div className="inline-flex mb-3 px-3 py-1 rounded-full bg-[oklch(0.55_0.28_340/0.12)] text-[oklch(0.55_0.28_340)] text-xs font-bold">
            Servico atualizado na landing
          </div>
        )}
        <p
          className="text-sm text-[oklch(0.45_0.02_260)] leading-relaxed"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {service.description}
        </p>

        {/* CTA */}
        <a
          href="https://wa.me/5547999447152"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
          style={{ color: service.color, fontFamily: "'Baloo 2', cursive" }}
        >
          Solicitar orçamento →
        </a>
      </div>
    </div>
  );
}

export default function Services() {
  const [titleVisible, setTitleVisible] = useState(false);
  const [services, setServices] = useState<Service[]>(DEFAULT_LANDING_SERVICES);
  const titleRef = useRef<HTMLDivElement>(null);

  const loadServices = async () => {
    try {
      const nextServices = await fetchLandingServices();
      setServices(nextServices.length > 0 ? nextServices : DEFAULT_LANDING_SERVICES);
    } catch {
      try {
        const saved = localStorage.getItem("services");
        if (!saved) {
          setServices(DEFAULT_LANDING_SERVICES);
          return;
        }
        const parsed = JSON.parse(saved) as Service[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices(parsed);
          return;
        }
        setServices(DEFAULT_LANDING_SERVICES);
      } catch {
        setServices(DEFAULT_LANDING_SERVICES);
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTitleVisible(true); },
      { threshold: 0.2 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    void loadServices();
  }, []);

  useEffect(() => {
    const syncServices = () => {
      void loadServices();
    };
    const syncStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "services") {
        void loadServices();
      }
    };

    window.addEventListener("landing-services-updated", syncServices);
    window.addEventListener("storage", syncStorage);

    return () => {
      window.removeEventListener("landing-services-updated", syncServices);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  return (
    <section id="servicos" className="py-20 bg-[oklch(0.99_0.005_85)] relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[oklch(0.88_0.18_85/0.15)] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[oklch(0.55_0.28_340/0.1)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Section header */}
        <div
          ref={titleRef}
          className="text-center mb-14"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.55_0.28_340/0.1)] text-[oklch(0.55_0.28_340)] text-sm font-bold mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            🎪 Nossos Serviços
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Tudo para a sua{" "}
            <span className="text-[oklch(0.55_0.28_340)]">festa perfeita</span>
          </h2>
          <p
            className="text-base md:text-lg text-[oklch(0.45_0.02_260)] max-w-2xl mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Do personagem favorito ao show da Carreta Furacão — oferecemos uma experiência
            completa de entretenimento para eventos de todos os tamanhos.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <a
            href="https://wa.me/5547999447152?text=Olá!%20Gostaria%20de%20conhecer%20todos%20os%20serviços%20disponíveis."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[oklch(0.55_0.28_340)] hover:bg-[oklch(0.48_0.28_340)] text-white font-extrabold text-base transition-all duration-200 hover:scale-105 shadow-xl"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar com a Equipe
          </a>
        </div>
      </div>
    </section>
  );
}
