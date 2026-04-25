/**
 * Gallery — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 * Galeria de fotos dos eventos com lightbox e efeitos de hover
 */
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, ZoomIn } from "lucide-react";
import { DEFAULT_GALLERY_VIDEOS, fetchLandingContent, type GalleryVideo } from "@/lib/landingServices";

interface GalleryImage {
  id?: string;
  src: string;
  title: string;
  category: string;
  color: string;
}

const defaultGalleryImages: GalleryImage[] = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/gallery-1-HPoUKp6TmmdioEt7esnsKK.webp",
    title: "Aniversário Mickey & Minnie",
    category: "Personagens",
    color: "oklch(0.88 0.18 85)",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/gallery-2-ViqShBxEVaSnNLLuVMG2oG.webp",
    title: "Festa ao Ar Livre com Infláveis",
    category: "Brinquedos",
    color: "oklch(0.65 0.25 145)",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/gallery-3-UUmAkJnUbdCcmXfaNakcKD.webp",
    title: "Pintura Facial & Recreação",
    category: "Recreação",
    color: "oklch(0.55 0.28 340)",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/gallery-4-aLckmYUH7QXeHzwsg5USGv.webp",
    title: "Grande Evento Corporativo",
    category: "Eventos",
    color: "oklch(0.55 0.22 262)",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/personagens-section-Exh3onDhxN6EJvkDG33D5y.webp",
    title: "Elenco de Personagens",
    category: "Personagens",
    color: "oklch(0.72 0.22 55)",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/recreacao-section-hpLeKDFaYmTxVhKG4uG6Qu.webp",
    title: "Animação Infantil",
    category: "Recreação",
    color: "oklch(0.55 0.25 300)",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/magic-drinks-eSkbWxMAicco8BUscoCUi2.webp",
    title: "Magic Drinks Kids",
    category: "Magic Drinks",
    color: "oklch(0.55 0.22 262)",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/carreta-furacao-nanAAGVXYhAHdjkW987JJb.webp",
    title: "Show da Carreta Furacão",
    category: "Carreta Furacão",
    color: "oklch(0.55 0.25 25)",
  },
];

export default function Gallery() {
  const [filter, setFilter] = useState("Todos");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(defaultGalleryImages);
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>(DEFAULT_GALLERY_VIDEOS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const payload = await fetchLandingContent();
        if (Array.isArray(payload.galleryImages) && payload.galleryImages.length > 0) {
          setGalleryImages(payload.galleryImages as GalleryImage[]);
        }
        if (Array.isArray(payload.galleryVideos) && payload.galleryVideos.length > 0) {
          setGalleryVideos(payload.galleryVideos as GalleryVideo[]);
        }
        if (Array.isArray(payload.galleryImages) && payload.galleryImages.length > 0) return;
      } catch {
        // fall through to local fallback
      }

      try {
        const saved = localStorage.getItem("landingGalleryImages");
        if (!saved) return;
        const parsed = JSON.parse(saved) as GalleryImage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGalleryImages(parsed);
        }
        const savedVideos = localStorage.getItem("landingGalleryVideos");
        if (savedVideos) {
          const parsedVideos = JSON.parse(savedVideos) as GalleryVideo[];
          if (Array.isArray(parsedVideos) && parsedVideos.length > 0) {
            setGalleryVideos(parsedVideos);
          }
        }
        if (Array.isArray(parsed) && parsed.length > 0) return;
      } catch {
        // ignore local parse failure
      }

      setGalleryImages(defaultGalleryImages);
    };

    void loadGallery();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && lightbox !== null) setLightbox((prev) => (prev! + 1) % filtered.length);
      if (e.key === "ArrowLeft" && lightbox !== null) setLightbox((prev) => (prev! - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  const categories = ["Todos", ...Array.from(new Set(galleryImages.map((img) => img.category)))];
  const filtered = filter === "Todos" ? galleryImages : galleryImages.filter((img) => img.category === filter);

  return (
    <section id="galeria" className="py-20 bg-[oklch(0.97_0.01_85)] relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[oklch(0.88_0.18_85/0.12)] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[oklch(0.55_0.22_262/0.08)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.55_0.22_262/0.12)] text-[oklch(0.38_0.22_262)] text-sm font-bold mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            📸 Galeria de Eventos
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Momentos{" "}
            <span className="text-[oklch(0.55_0.28_340)]">inesquecíveis</span>
          </h2>
          <p
            className="text-base md:text-lg text-[oklch(0.45_0.02_260)] max-w-2xl mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Cada foto conta uma história de alegria, diversão e magia. Confira alguns dos
            nossos eventos e deixe-se inspirar para o seu!
          </p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.2s",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-200"
              style={{
                fontFamily: "'Baloo 2', cursive",
                backgroundColor: filter === cat ? "oklch(0.55 0.28 340)" : "white",
                color: filter === cat ? "white" : "oklch(0.45 0.02 260)",
                border: `2px solid ${filter === cat ? "oklch(0.55 0.28 340)" : "oklch(0.9 0.02 85)"}`,
                transform: filter === cat ? "scale(1.05)" : "scale(1)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img, index) => (
            <GalleryCard
              key={img.src + index}
              img={img}
              index={index}
              onClick={() => setLightbox(index)}
            />
          ))}
        </div>

        {galleryVideos.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.55_0.28_340/0.12)] text-[oklch(0.55_0.28_340)] text-sm font-bold mb-4"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                🎬 Galeria de Videos
              </div>
              <h3
                className="text-2xl md:text-4xl font-extrabold text-[oklch(0.18_0.02_260)]"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                Bastidores e momentos em movimento
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {galleryVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com/sonhomagicojoinville"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-[oklch(0.55_0.28_340)] text-[oklch(0.55_0.28_340)] font-bold text-sm hover:bg-[oklch(0.55_0.28_340)] hover:text-white transition-all duration-200 hover:scale-105"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Ver mais no Instagram — 73,7k seguidores
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={24} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((prev) => (prev! - 1 + filtered.length) % filtered.length); }}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((prev) => (prev! + 1) % filtered.length); }}
          >
            <ChevronRight size={28} />
          </button>
          <div
            className="max-w-4xl max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filtered[lightbox].src}
              alt={filtered[lightbox].title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-2xl">
              <span
                className="text-white font-extrabold text-lg"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                {filtered[lightbox].title}
              </span>
              <span
                className="ml-3 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: filtered[lightbox].color }}
              >
                {filtered[lightbox].category}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function getInstagramEmbedUrl(url: string): string | null {
  if (!/instagram\.com/i.test(url)) return null;
  const sanitized = url.split("?")[0].replace(/\/$/, "");
  return `${sanitized}/embed`;
}

function VideoCard({ video }: { video: GalleryVideo }) {
  const instagramEmbed = getInstagramEmbedUrl(video.src);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasCustomCover = Boolean(video.coverImage);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-[oklch(0.92_0.02_85)]">
      <div className="aspect-[4/5] bg-black">
        {instagramEmbed && !isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full group"
          >
            {hasCustomCover ? (
              <img
                src={video.coverImage}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[oklch(0.55_0.28_340)] via-[oklch(0.55_0.22_262)] to-[oklch(0.45_0.18_25)]" />
            )}
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/92 text-[oklch(0.55_0.28_340)] flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                <Play size={24} fill="currentColor" />
              </div>
            </div>
            <div className="absolute left-4 bottom-4 px-3 py-1 rounded-full bg-white/90 text-[oklch(0.18_0.02_260)] text-xs font-extrabold">
              Instagram
            </div>
          </button>
        ) : instagramEmbed ? (
          <iframe
            src={instagramEmbed}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media"
            loading="lazy"
            title={video.title}
          />
        ) : hasCustomCover && !isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full group"
          >
            <img
              src={video.coverImage}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/92 text-[oklch(0.55_0.28_340)] flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                <Play size={24} fill="currentColor" />
              </div>
            </div>
          </button>
        ) : (
          <video
            src={video.src}
            controls
            autoPlay={isPlaying}
            preload="metadata"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h4
          className="font-extrabold text-[oklch(0.18_0.02_260)] text-lg"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {video.title}
        </h4>
        <span
          className="inline-flex mt-3 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: video.color }}
        >
          {video.category}
        </span>
      </div>
    </div>
  );
}

function GalleryCard({
  img,
  index,
  onClick,
}: {
  img: GalleryImage;
  index: number;
  onClick: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative rounded-2xl overflow-hidden cursor-pointer shadow-md group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        transitionDelay: `${index * 0.06}s`,
        aspectRatio: index % 5 === 0 ? "1/1.3" : "4/3",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={img.src}
        alt={img.title}
        className="w-full h-full object-cover transition-transform duration-500"
        style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 flex flex-col justify-end p-3"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
          opacity: hovered ? 1 : 0.4,
        }}
      >
        <div
          className="px-2 py-0.5 rounded-full text-xs font-bold text-white self-start mb-1"
          style={{ backgroundColor: img.color }}
        >
          {img.category}
        </div>
        <p
          className="text-white font-bold text-sm leading-tight"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {img.title}
        </p>
      </div>
      {/* Zoom icon */}
      <div
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1)" : "scale(0.7)",
        }}
      >
        <ZoomIn size={16} className="text-[oklch(0.35_0.02_260)]" />
      </div>
    </div>
  );
}
