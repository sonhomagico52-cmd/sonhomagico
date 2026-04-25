import { ChangeEvent, useEffect, useState } from "react";
import { Edit2, ImagePlus, Plus, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_AGENDA_SECTION,
  DEFAULT_CHARACTERS_SECTION,
  DEFAULT_CONTACT_SECTION,
  DEFAULT_FAQ_SECTION,
  DEFAULT_GALLERY_VIDEOS,
  DEFAULT_LANDING_SERVICES,
  DEFAULT_LANDING_HERO,
  type AgendaEventItem,
  type AgendaSectionContent,
  type CharacterCategory,
  type CharactersSectionContent,
  type ContactInfoItem,
  type ContactSectionContent,
  type FAQItemContent,
  type FAQSectionContent,
  type GalleryVideo,
  fetchLandingContent,
  fetchLandingServices,
  normalizeAgendaSection,
  normalizeFAQSection,
  normalizeLandingHero,
  normalizeCharactersSection,
  normalizeContactSection,
  normalizeGalleryVideo,
  normalizeLandingService,
  saveCharactersSection,
  saveAgendaSection,
  saveContactSection,
  saveFAQSection,
  saveLandingHero,
  saveLandingServices,
} from "@/lib/landingServices";

interface HeroContent {
  title: string;
  subtitle: string;
  cta: string;
  badge: string;
  image: string;
  imagePosition?: string;
  imageZoom?: number;
}

interface Service {
  id: string;
  emoji: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: string;
  imageZoom?: number;
  badge: string;
  color: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  category: string;
  color: string;
}

const DEFAULT_HERO: HeroContent = {
  ...DEFAULT_LANDING_HERO,
  title: "Sonho Mágico Joinville",
  subtitle: "Levando entretenimento para todos os públicos",
};

const BALANCED_HERO_PRESET: Pick<HeroContent, "imagePosition" | "imageZoom"> = {
  imagePosition: "center 38%",
  imageZoom: 1,
};

const HERO_ZOOM_MIN = 0.92;
const HERO_ZOOM_MAX = 1.12;
const HERO_POSITION_MIN = 30;
const HERO_POSITION_MAX = 48;

const DEFAULT_SERVICES: Service[] = DEFAULT_LANDING_SERVICES.map((service) => ({
  id: String(service.id),
  emoji: service.emoji,
  title: service.title,
  description: service.description,
  image: service.image,
  imagePosition: service.imagePosition || "center center",
  imageZoom: service.imageZoom || 1,
  badge: service.badge,
  color: service.color,
}));

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: "1", name: "Maria Silva", role: "Mãe", text: "Adorei! As crianças se divertiram muito!", rating: 5 },
  { id: "2", name: "João Santos", role: "Empresário", text: "Profissionalismo de primeira qualidade!", rating: 5 },
];

const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "gallery-1",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/gallery-1-HPoUKp6TmmdioEt7esnsKK.webp",
    title: "Aniversário Mickey & Minnie",
    category: "Personagens",
    color: "oklch(0.88 0.18 85)",
  },
  {
    id: "gallery-2",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/gallery-2-ViqShBxEVaSnNLLuVMG2oG.webp",
    title: "Festa ao Ar Livre com Infláveis",
    category: "Brinquedos",
    color: "oklch(0.65 0.25 145)",
  },
  {
    id: "gallery-3",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/gallery-3-UUmAkJnUbdCcmXfaNakcKD.webp",
    title: "Pintura Facial & Recreação",
    category: "Recreação",
    color: "oklch(0.55 0.28 340)",
  },
  {
    id: "gallery-4",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/gallery-4-aLckmYUH7QXeHzwsg5USGv.webp",
    title: "Grande Evento Corporativo",
    category: "Eventos",
    color: "oklch(0.55 0.22 262)",
  },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeHero(content?: Partial<HeroContent>): HeroContent {
  return normalizeLandingHero({ ...DEFAULT_HERO, ...(content || {}) });
}

function normalizeService(service: Partial<Service>, fallback?: Service): Service {
  const normalized = normalizeLandingService(
    {
      ...service,
      id: service.id || fallback?.id || DEFAULT_SERVICES[0].id,
    },
    fallback
      ? {
          ...fallback,
          id: fallback.id,
        }
      : {
          ...DEFAULT_SERVICES[0],
          id: DEFAULT_SERVICES[0].id,
        },
  );

  return {
    id: String(normalized.id),
    emoji: normalized.emoji,
    title: normalized.title,
    description: normalized.description,
    image: normalized.image,
    imagePosition: normalized.imagePosition || "center center",
    imageZoom: normalized.imageZoom || 1,
    badge: normalized.badge,
    color: normalized.color,
  };
}

function isServiceImageDirty(savedImage: string, draftImage?: string): boolean {
  return (draftImage || "").trim() !== (savedImage || "").trim();
}

function parseImagePosition(position?: string): number {
  if (!position) return 50;
  const match = position.match(/center\s+([0-9.]+)%/i);
  if (!match) return 50;
  const value = Number(match[1]);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50;
}

function formatImagePosition(value: number): string {
  return `center ${Math.min(100, Math.max(0, value))}%`;
}

function normalizeImageZoom(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 1;
  return Math.min(1.4, Math.max(0.85, value));
}

function normalizeHeroImageZoom(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return BALANCED_HERO_PRESET.imageZoom || 1;
  return Math.min(HERO_ZOOM_MAX, Math.max(HERO_ZOOM_MIN, value));
}

function normalizeHeroImagePosition(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return parseImagePosition(BALANCED_HERO_PRESET.imagePosition);
  return Math.min(HERO_POSITION_MAX, Math.max(HERO_POSITION_MIN, value));
}

export default function LandingPageModule() {
  const [activeTab, setActiveTab] = useState<"hero" | "services" | "characters" | "faq" | "contact" | "agenda" | "testimonials" | "gallery">("hero");
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO);
  const [charactersContent, setCharactersContent] = useState<CharactersSectionContent>(DEFAULT_CHARACTERS_SECTION);
  const [faqContent, setFaqContent] = useState<FAQSectionContent>(DEFAULT_FAQ_SECTION);
  const [contactContent, setContactContent] = useState<ContactSectionContent>(DEFAULT_CONTACT_SECTION);
  const [agendaContent, setAgendaContent] = useState<AgendaSectionContent>(DEFAULT_AGENDA_SECTION);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [serviceImageDrafts, setServiceImageDrafts] = useState<Record<string, string>>({});
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(DEFAULT_GALLERY_IMAGES);
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>(DEFAULT_GALLERY_VIDEOS);
  const [newService, setNewService] = useState<Service>({
    id: "",
    emoji: "",
    title: "",
    description: "",
    image: "",
    imagePosition: "center center",
    badge: "",
    color: "oklch(0.55 0.28 340)",
  });
  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({ id: "", name: "", role: "", text: "", rating: 5 });
  const [newGalleryImage, setNewGalleryImage] = useState<GalleryImage>({
    id: "",
    src: "",
    title: "",
    category: "Personagens",
    color: "oklch(0.55 0.28 340)",
  });
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  const [editingGalleryImage, setEditingGalleryImage] = useState<string | null>(null);
  const [recentlyPublishedServiceId, setRecentlyPublishedServiceId] = useState<string | null>(null);
  const [newCharacterCategory, setNewCharacterCategory] = useState<CharacterCategory>({
    id: "",
    name: "",
    emoji: "⭐",
    examples: "",
  });
  const [editingCharacterCategory, setEditingCharacterCategory] = useState<string | null>(null);
  const [newFaqItem, setNewFaqItem] = useState<FAQItemContent>({
    id: "",
    question: "",
    answer: "",
    emoji: "❓",
  });
  const [editingFaqItem, setEditingFaqItem] = useState<string | null>(null);
  const [newContactItem, setNewContactItem] = useState<ContactInfoItem>({
    id: "",
    type: "phone",
    label: "",
    value: "",
    href: "",
    color: "oklch(0.55 0.28 340)",
  });
  const [editingContactItem, setEditingContactItem] = useState<string | null>(null);
  const [newAgendaEvent, setNewAgendaEvent] = useState<AgendaEventItem>({
    id: "",
    title: "",
    date: "",
    time: "",
    location: "",
    attendees: 0,
    service: "",
    status: "confirmed",
  });
  const [editingAgendaEvent, setEditingAgendaEvent] = useState<string | null>(null);
  const [newGalleryVideo, setNewGalleryVideo] = useState<GalleryVideo>({
    id: "",
    src: "",
    title: "",
    category: "Instagram",
    color: "oklch(0.55 0.28 340)",
    coverImage: "",
    sourceType: "instagram",
  });
  const [editingGalleryVideo, setEditingGalleryVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadLandingState = async () => {
      setHeroContent(normalizeHero(loadFromStorage("heroContent", DEFAULT_HERO)));
      setCharactersContent(normalizeCharactersSection(loadFromStorage("charactersSection", DEFAULT_CHARACTERS_SECTION)));
      setFaqContent(normalizeFAQSection(loadFromStorage("landingFaq", DEFAULT_FAQ_SECTION)));
      setContactContent(normalizeContactSection(loadFromStorage("landingContact", DEFAULT_CONTACT_SECTION)));
      setAgendaContent(normalizeAgendaSection(loadFromStorage("landingAgenda", DEFAULT_AGENDA_SECTION)));
      setTestimonials(loadFromStorage("testimonials", DEFAULT_TESTIMONIALS));
      setGalleryImages(loadFromStorage("landingGalleryImages", DEFAULT_GALLERY_IMAGES));
      setGalleryVideos(loadFromStorage("landingGalleryVideos", DEFAULT_GALLERY_VIDEOS));

      try {
        const landingContent = await fetchLandingContent();
        if (landingContent.hero && typeof landingContent.hero === "object") {
          setHeroContent(normalizeHero(landingContent.hero as Partial<HeroContent>));
        }
        if (landingContent.characters && typeof landingContent.characters === "object") {
          setCharactersContent(normalizeCharactersSection(landingContent.characters as Partial<CharactersSectionContent>));
        }
        if (landingContent.faq && typeof landingContent.faq === "object") {
          setFaqContent(normalizeFAQSection(landingContent.faq as Partial<FAQSectionContent>));
        }
        if (landingContent.contact && typeof landingContent.contact === "object") {
          setContactContent(normalizeContactSection(landingContent.contact as Partial<ContactSectionContent>));
        }
        if (landingContent.agenda && typeof landingContent.agenda === "object") {
          setAgendaContent(normalizeAgendaSection(landingContent.agenda as Partial<AgendaSectionContent>));
        }
        if (Array.isArray(landingContent.galleryVideos)) {
          setGalleryVideos((landingContent.galleryVideos as Partial<GalleryVideo>[]).map((video) => normalizeGalleryVideo(video)));
        }

        const serverServices = await fetchLandingServices();
        if (serverServices.length > 0) {
          setServices(serverServices.map((service) => normalizeService({
            id: String(service.id),
            emoji: service.emoji,
            title: service.title,
            description: service.description,
            image: service.image,
            imagePosition: service.imagePosition || "center center",
            imageZoom: service.imageZoom || 1,
            badge: service.badge,
            color: service.color,
          })));
        } else {
          setServices(loadFromStorage("services", DEFAULT_SERVICES).map((service, index) => normalizeService(service, DEFAULT_SERVICES[index] || DEFAULT_SERVICES[0])));
        }
      } catch {
        setServices(loadFromStorage("services", DEFAULT_SERVICES).map((service, index) => normalizeService(service, DEFAULT_SERVICES[index] || DEFAULT_SERVICES[0])));
      }
    };

    void loadLandingState();
  }, []);

  useEffect(() => {
    setServiceImageDrafts(Object.fromEntries(services.map((service) => [service.id, service.image])));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("heroContent", JSON.stringify(heroContent));
  }, [heroContent]);

  useEffect(() => {
    localStorage.setItem("charactersSection", JSON.stringify(charactersContent));
  }, [charactersContent]);

  useEffect(() => {
    localStorage.setItem("landingFaq", JSON.stringify(faqContent));
  }, [faqContent]);

  useEffect(() => {
    localStorage.setItem("landingContact", JSON.stringify(contactContent));
  }, [contactContent]);

  useEffect(() => {
    localStorage.setItem("landingAgenda", JSON.stringify(agendaContent));
  }, [agendaContent]);

  useEffect(() => {
    localStorage.setItem("services", JSON.stringify(services));
    window.dispatchEvent(new Event("landing-services-updated"));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("testimonials", JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem("landingGalleryImages", JSON.stringify(galleryImages));
  }, [galleryImages]);

  useEffect(() => {
    localStorage.setItem("landingGalleryVideos", JSON.stringify(galleryVideos));
  }, [galleryVideos]);

  const resetServiceForm = () => {
    setNewService({
      id: "",
      emoji: "",
      title: "",
      description: "",
      image: "",
      imagePosition: "center center",
      badge: "",
      color: "oklch(0.55 0.28 340)",
    });
    setEditingService(null);
  };

  const startEditingService = (service: Service) => {
    setNewService({ ...service });
    setEditingService(service.id);
  };

  const resetTestimonialForm = () => {
    setNewTestimonial({ id: "", name: "", role: "", text: "", rating: 5 });
    setEditingTestimonial(null);
  };

  const resetGalleryForm = () => {
    setNewGalleryImage({
      id: "",
      src: "",
      title: "",
      category: "Personagens",
      color: "oklch(0.55 0.28 340)",
    });
    setEditingGalleryImage(null);
  };

  const resetGalleryVideoForm = () => {
    setNewGalleryVideo({
      id: "",
      src: "",
      title: "",
      category: "Instagram",
      color: "oklch(0.55 0.28 340)",
      coverImage: "",
      sourceType: "instagram",
    });
    setEditingGalleryVideo(null);
  };

  const handleAddService = () => {
    if (!newService.title || !newService.description) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    if (editingService) {
      setServices((current) => current.map((service) => (
        service.id === editingService ? normalizeService({ ...newService, id: editingService }, service) : service
      )));
      toast.success("Serviço atualizado!");
    } else {
      setServices((current) => [...current, normalizeService({ ...newService, id: Date.now().toString() })]);
      toast.success("Serviço adicionado!");
    }
    resetServiceForm();
  };

  const handlePublishHero = async () => {
    try {
      await saveLandingHero({
        ...heroContent,
        imagePosition: formatImagePosition(normalizeHeroImagePosition(parseImagePosition(heroContent.imagePosition))),
        imageZoom: normalizeHeroImageZoom(heroContent.imageZoom),
      });
      localStorage.setItem("heroContent", JSON.stringify(heroContent));
      toast.success("Hero publicado na landing!");
    } catch {
      toast.error("Não foi possível publicar o Hero no servidor");
    }
  };

  const resetHeroImageAdjustments = () => {
    setHeroContent((current) => ({
      ...current,
      imagePosition: DEFAULT_HERO.imagePosition || "center center",
      imageZoom: DEFAULT_HERO.imageZoom || 1,
    }));
    toast.success("Ajuste visual do Hero restaurado");
  };

  const applyBalancedHeroPreset = () => {
    setHeroContent((current) => ({
      ...current,
      imagePosition: BALANCED_HERO_PRESET.imagePosition,
      imageZoom: BALANCED_HERO_PRESET.imageZoom,
    }));
    toast.success("Preset Hero equilibrado aplicado");
  };

  const updateServiceImage = (serviceId: string, image: string) => {
    if (!image.trim()) {
      toast.error("Informe uma imagem válida");
      return;
    }

    setServices((current) => current.map((service) => (
      service.id === serviceId ? normalizeService({ ...service, image: image.trim() }, service) : service
    )));
    setServiceImageDrafts((current) => ({ ...current, [serviceId]: image.trim() }));

    if (editingService === serviceId) {
      setNewService((current) => ({ ...current, image: image.trim() }));
    }

    toast.success("Imagem do serviço atualizada!");
  };

  const removeServiceImage = (serviceId: string) => {
    setServices((current) => current.map((service) => (
      service.id === serviceId ? { ...service, image: "" } : service
    )));
    setServiceImageDrafts((current) => ({ ...current, [serviceId]: "" }));

    if (editingService === serviceId) {
      setNewService((current) => ({ ...current, image: "" }));
    }

    toast.success("Imagem do serviço removida!");
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.name || !newTestimonial.text) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    if (editingTestimonial) {
      setTestimonials((current) => current.map((item) => (
        item.id === editingTestimonial ? { ...newTestimonial, id: editingTestimonial } : item
      )));
      toast.success("Depoimento atualizado!");
    } else {
      setTestimonials((current) => [...current, { ...newTestimonial, id: Date.now().toString() }]);
      toast.success("Depoimento adicionado!");
    }
    resetTestimonialForm();
  };

  const handleUploadImage = (event: ChangeEvent<HTMLInputElement>, target: "gallery" | "hero" | "service") => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        toast.error("Não foi possível carregar a imagem");
        return;
      }
      if (target === "hero") setHeroContent((current) => ({ ...current, image: result }));
      if (target === "service") setNewService((current) => ({ ...current, image: result }));
      if (target === "gallery") setNewGalleryImage((current) => ({ ...current, src: result }));
      toast.success("Imagem carregada!");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleUploadVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Selecione um arquivo de video valido");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        toast.error("Nao foi possivel carregar o video");
        return;
      }
      setNewGalleryVideo((current) => ({ ...current, src: result, sourceType: "upload" }));
      toast.success("Video carregado!");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleUploadVideoCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem valida para a capa");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        toast.error("Nao foi possivel carregar a capa");
        return;
      }
      setNewGalleryVideo((current) => ({ ...current, coverImage: result }));
      toast.success("Capa do video carregada!");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleServiceCardUpload = (event: ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        toast.error("Não foi possível carregar a imagem");
        return;
      }

      updateServiceImage(serviceId, result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handlePublishServices = async () => {
    const payload = services.map((service) => ({
      ...service,
      id: String(service.id),
    }));

    try {
      await saveLandingServices(payload);
      localStorage.setItem("services", JSON.stringify(payload));
      window.dispatchEvent(new Event("landing-services-updated"));
      toast.success("Serviços publicados na landing!");
    } catch {
      toast.error("Não foi possível publicar os serviços no servidor");
    }
  };

  const handleSaveAndPublishServiceImage = async (serviceId: string) => {
    const nextServices = services.map((service) => (
      service.id === serviceId
        ? normalizeService({ ...service, image: (serviceImageDrafts[serviceId] || "").trim() }, service)
        : service
    ));
    setServices(nextServices);
    setServiceImageDrafts((current) => ({ ...current, [serviceId]: (serviceImageDrafts[serviceId] || "").trim() }));
    if (editingService === serviceId) {
      setNewService((current) => ({ ...current, image: (serviceImageDrafts[serviceId] || "").trim() }));
    }
    setRecentlyPublishedServiceId(serviceId);

    try {
      await saveLandingServices(nextServices);
      localStorage.setItem("services", JSON.stringify(nextServices));
      window.dispatchEvent(new Event("landing-services-updated"));
      toast.success("Imagem salva e publicada na landing!");
    } catch {
      toast.error("Não foi possível publicar a imagem no servidor");
    }
  };

  const openLandingPreview = (serviceId?: string) => {
    const previewUrl = serviceId ? `/#servicos?highlight=${serviceId}` : "/#servicos";
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryImage.src || !newGalleryImage.title || !newGalleryImage.category) {
      toast.error("Informe imagem, título e categoria");
      return;
    }
    if (editingGalleryImage) {
      setGalleryImages((current) => current.map((image) => (
        image.id === editingGalleryImage ? { ...newGalleryImage, id: editingGalleryImage } : image
      )));
      toast.success("Imagem atualizada!");
    } else {
      setGalleryImages((current) => [...current, { ...newGalleryImage, id: `gallery-${Date.now()}` }]);
      toast.success("Imagem adicionada!");
    }
    resetGalleryForm();
  };

  const handleAddGalleryVideo = () => {
    if (!newGalleryVideo.src || !newGalleryVideo.title || !newGalleryVideo.category) {
      toast.error("Informe video, titulo e categoria");
      return;
    }

    const normalized = normalizeGalleryVideo({
      ...newGalleryVideo,
      coverImage: (newGalleryVideo.coverImage || "").trim(),
      sourceType: /instagram\.com/i.test(newGalleryVideo.src)
        ? "instagram"
        : newGalleryVideo.sourceType || "external",
    });

    if (editingGalleryVideo) {
      setGalleryVideos((current) => current.map((video) => (
        video.id === editingGalleryVideo ? { ...normalized, id: editingGalleryVideo } : video
      )));
      toast.success("Video atualizado!");
    } else {
      setGalleryVideos((current) => [...current, { ...normalized, id: `video-${Date.now()}` }]);
      toast.success("Video adicionado!");
    }

    resetGalleryVideoForm();
  };

  const handlePublishTestimonials = async () => {
    try {
      const response = await fetch("/api/landing-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testimonials }),
      });

      if (!response.ok) {
        throw new Error("publish-testimonials-failed");
      }

      localStorage.setItem("testimonials", JSON.stringify(testimonials));
      toast.success("Depoimentos publicados na landing!");
    } catch {
      toast.error("Não foi possível publicar os depoimentos");
    }
  };

  const handlePublishGallery = async () => {
    try {
      const response = await fetch("/api/landing-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ galleryImages }),
      });

      if (!response.ok) {
        throw new Error("publish-gallery-failed");
      }

      localStorage.setItem("landingGalleryImages", JSON.stringify(galleryImages));
      toast.success("Galeria publicada na landing!");
    } catch {
      toast.error("Não foi possível publicar a galeria");
    }
  };

  const handlePublishVideos = async () => {
    try {
      const response = await fetch("/api/landing-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ galleryVideos }),
      });

      if (!response.ok) {
        throw new Error("publish-videos-failed");
      }

      localStorage.setItem("landingGalleryVideos", JSON.stringify(galleryVideos));
      toast.success("Videos publicados na landing!");
    } catch {
      toast.error("Não foi possível publicar os videos");
    }
  };

  const handlePublishCharacters = async () => {
    try {
      await saveCharactersSection(charactersContent);
      localStorage.setItem("charactersSection", JSON.stringify(charactersContent));
      toast.success("Bloco de personagens publicado na landing!");
    } catch {
      toast.error("Não foi possível publicar o bloco de personagens");
    }
  };

  const resetFaqItemForm = () => {
    setNewFaqItem({
      id: "",
      question: "",
      answer: "",
      emoji: "❓",
    });
    setEditingFaqItem(null);
  };

  const handleAddFaqItem = () => {
    if (!newFaqItem.question || !newFaqItem.answer) {
      toast.error("Preencha a pergunta e a resposta");
      return;
    }

    if (editingFaqItem) {
      setFaqContent((current) => ({
        ...current,
        items: current.items.map((item) => (
          item.id === editingFaqItem ? { ...newFaqItem, id: editingFaqItem } : item
        )),
      }));
      toast.success("Pergunta atualizada!");
    } else {
      setFaqContent((current) => ({
        ...current,
        items: [...current.items, { ...newFaqItem, id: `faq-${Date.now()}` }],
      }));
      toast.success("Pergunta adicionada!");
    }

    resetFaqItemForm();
  };

  const handlePublishFaq = async () => {
    try {
      await saveFAQSection(faqContent);
      localStorage.setItem("landingFaq", JSON.stringify(faqContent));
      toast.success("FAQ publicado na landing!");
    } catch {
      toast.error("Não foi possível publicar o FAQ");
    }
  };

  const resetContactItemForm = () => {
    setNewContactItem({
      id: "",
      type: "phone",
      label: "",
      value: "",
      href: "",
      color: "oklch(0.55 0.28 340)",
    });
    setEditingContactItem(null);
  };

  const handleAddContactItem = () => {
    if (!newContactItem.label || !newContactItem.value) {
      toast.error("Preencha o rótulo e o valor do contato");
      return;
    }

    if (editingContactItem) {
      setContactContent((current) => ({
        ...current,
        infoItems: current.infoItems.map((item) => (
          item.id === editingContactItem ? { ...newContactItem, id: editingContactItem } : item
        )),
      }));
      toast.success("Contato atualizado!");
    } else {
      setContactContent((current) => ({
        ...current,
        infoItems: [...current.infoItems, { ...newContactItem, id: `contact-${Date.now()}` }],
      }));
      toast.success("Contato adicionado!");
    }

    resetContactItemForm();
  };

  const handlePublishContact = async () => {
    try {
      await saveContactSection(contactContent);
      localStorage.setItem("landingContact", JSON.stringify(contactContent));
      toast.success("Contato publicado na landing!");
    } catch {
      toast.error("Não foi possível publicar o contato");
    }
  };

  const resetAgendaEventForm = () => {
    setNewAgendaEvent({
      id: "",
      title: "",
      date: "",
      time: "",
      location: "",
      attendees: 0,
      service: "",
      status: "confirmed",
    });
    setEditingAgendaEvent(null);
  };

  const handleAddAgendaEvent = () => {
    if (!newAgendaEvent.title || !newAgendaEvent.date) {
      toast.error("Preencha pelo menos título e data do evento");
      return;
    }

    if (editingAgendaEvent) {
      setAgendaContent((current) => ({
        ...current,
        events: current.events.map((event) => (
          event.id === editingAgendaEvent ? { ...newAgendaEvent, id: editingAgendaEvent } : event
        )),
      }));
      toast.success("Evento da agenda atualizado!");
    } else {
      setAgendaContent((current) => ({
        ...current,
        events: [...current.events, { ...newAgendaEvent, id: `agenda-${Date.now()}` }],
      }));
      toast.success("Evento da agenda adicionado!");
    }

    resetAgendaEventForm();
  };

  const handlePublishAgenda = async () => {
    try {
      await saveAgendaSection(agendaContent);
      localStorage.setItem("landingAgenda", JSON.stringify(agendaContent));
      toast.success("Agenda publicada na landing!");
    } catch {
      toast.error("Não foi possível publicar a agenda");
    }
  };

  const resetCharacterCategoryForm = () => {
    setNewCharacterCategory({
      id: "",
      name: "",
      emoji: "⭐",
      examples: "",
    });
    setEditingCharacterCategory(null);
  };

  const handleAddCharacterCategory = () => {
    if (!newCharacterCategory.name || !newCharacterCategory.examples) {
      toast.error("Preencha o nome e os exemplos da categoria");
      return;
    }

    if (editingCharacterCategory) {
      setCharactersContent((current) => ({
        ...current,
        categories: current.categories.map((category) => (
          category.id === editingCharacterCategory
            ? { ...newCharacterCategory, id: editingCharacterCategory }
            : category
        )),
      }));
      toast.success("Categoria atualizada!");
    } else {
      setCharactersContent((current) => ({
        ...current,
        categories: [...current.categories, { ...newCharacterCategory, id: `char-${Date.now()}` }],
      }));
      toast.success("Categoria adicionada!");
    }

    resetCharacterCategoryForm();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
        🎨 Gerenciar Landing Page
      </h2>

      <div className="flex gap-4 border-b border-[oklch(0.92_0.02_85)] overflow-x-auto">
        {[
          { id: "hero", label: "Hero" },
          { id: "services", label: "Serviços" },
          { id: "characters", label: "Personagens" },
          { id: "faq", label: "FAQ" },
          { id: "contact", label: "Contato" },
          { id: "agenda", label: "Agenda" },
          { id: "testimonials", label: "Depoimentos" },
          { id: "gallery", label: "Galeria" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`px-4 py-3 font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === id
                ? "border-[oklch(0.55_0.28_340)] text-[oklch(0.55_0.28_340)]"
                : "border-transparent text-[oklch(0.18_0.02_260)]/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "hero" && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
          <input value={heroContent.title} onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })} placeholder="Título principal" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
          <input value={heroContent.subtitle} onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })} placeholder="Subtítulo" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
          <input value={heroContent.cta} onChange={(e) => setHeroContent({ ...heroContent, cta: e.target.value })} placeholder="Texto do CTA" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
          <input value={heroContent.badge} onChange={(e) => setHeroContent({ ...heroContent, badge: e.target.value })} placeholder="Texto do badge" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
          <input value={heroContent.image} onChange={(e) => setHeroContent({ ...heroContent, image: e.target.value })} placeholder="URL da imagem de fundo" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-[oklch(0.18_0.02_260)]">
              <span>Posição vertical da imagem do Hero</span>
              <span>{normalizeHeroImagePosition(parseImagePosition(heroContent.imagePosition))}%</span>
            </div>
            <input
              type="range"
              min={String(HERO_POSITION_MIN)}
              max={String(HERO_POSITION_MAX)}
              step="1"
              value={normalizeHeroImagePosition(parseImagePosition(heroContent.imagePosition))}
              onChange={(e) => setHeroContent({ ...heroContent, imagePosition: formatImagePosition(normalizeHeroImagePosition(Number(e.target.value))) })}
              className="w-full accent-[oklch(0.55_0.28_340)]"
            />
            <p className="text-xs text-[oklch(0.18_0.02_260)]/60">
              Faixa recomendada travada para evitar Hero desproporcional.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-[oklch(0.18_0.02_260)]">
              <span>Zoom da imagem do Hero</span>
              <span>{normalizeHeroImageZoom(heroContent.imageZoom).toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={String(HERO_ZOOM_MIN)}
              max={String(HERO_ZOOM_MAX)}
              step="0.01"
              value={normalizeHeroImageZoom(heroContent.imageZoom)}
              onChange={(e) => setHeroContent({ ...heroContent, imageZoom: normalizeHeroImageZoom(Number(e.target.value)) })}
              className="w-full accent-[oklch(0.55_0.28_340)]"
            />
            <div className="flex justify-between text-xs text-[oklch(0.18_0.02_260)]/60">
              <span>Mais aberto</span>
              <span>Equilibrado</span>
              <span>Mais fechado</span>
            </div>
            <p className="text-xs text-[oklch(0.18_0.02_260)]/60">
              Zoom limitado automaticamente entre {HERO_ZOOM_MIN.toFixed(2)}x e {HERO_ZOOM_MAX.toFixed(2)}x.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.97_0.01_85)] font-bold cursor-pointer border border-[oklch(0.92_0.02_85)]">
            <Upload size={16} />
            Upload do Hero
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, "hero")} />
          </label>
          {heroContent.image && <img src={heroContent.image} alt="Hero" className="w-full h-64 object-cover rounded-xl border border-[oklch(0.92_0.02_85)]" style={{ objectPosition: formatImagePosition(normalizeHeroImagePosition(parseImagePosition(heroContent.imagePosition))), transform: `scale(${normalizeHeroImageZoom(heroContent.imageZoom)})` }} />}
          <div className="flex gap-2">
            <button onClick={handlePublishHero} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
              <Save size={16} />
              Salvar e Publicar Hero
            </button>
            <button onClick={applyBalancedHeroPreset} className="px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
              Hero Equilibrado
            </button>
            <button onClick={resetHeroImageAdjustments} className="px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
              Resetar Ajuste
            </button>
          </div>
        </div>
      )}

      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="bg-[oklch(0.98_0.02_85)] border border-[oklch(0.92_0.02_85)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-bold text-[oklch(0.18_0.02_260)]">Publicação da seção de serviços</p>
              <p className="text-sm text-[oklch(0.18_0.02_260)]/65">Depois de trocar a imagem ou editar um serviço, clique em salvar/publicar para refletir na landing.</p>
            </div>
            <button onClick={handlePublishServices} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold self-start md:self-auto">
              <Save size={16} />
              Salvar e Publicar Serviços
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newService.emoji} onChange={(e) => setNewService({ ...newService, emoji: e.target.value })} placeholder="Emoji" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} placeholder="Nome do serviço" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} placeholder="Descrição" rows={3} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <input value={newService.image} onChange={(e) => setNewService({ ...newService, image: e.target.value })} placeholder="URL da imagem do serviço" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newService.badge} onChange={(e) => setNewService({ ...newService, badge: e.target.value })} placeholder="Texto do selo" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newService.color} onChange={(e) => setNewService({ ...newService, color: e.target.value })} placeholder="Cor do selo" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-[oklch(0.18_0.02_260)]">
                <span>Enquadramento vertical da imagem</span>
                <span>{parseImagePosition(newService.imagePosition)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={parseImagePosition(newService.imagePosition)}
                onChange={(e) => setNewService({ ...newService, imagePosition: formatImagePosition(Number(e.target.value)) })}
                className="w-full accent-[oklch(0.55_0.28_340)]"
              />
              <div className="flex justify-between text-xs text-[oklch(0.18_0.02_260)]/60">
                <span>Topo</span>
                <span>Centro</span>
                <span>Base</span>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.97_0.01_85)] font-bold cursor-pointer border border-[oklch(0.92_0.02_85)]">
              <Upload size={16} />
              Upload do Serviço
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, "service")} />
            </label>
            {newService.image && <img src={newService.image} alt={newService.title || "Serviço"} className="w-full h-56 object-cover rounded-xl border border-[oklch(0.92_0.02_85)]" style={{ objectPosition: newService.imagePosition || "center center", transform: `scale(${normalizeImageZoom(newService.imageZoom)})` }} />}
            <div className="flex gap-2">
              <button onClick={handleAddService} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
                <Plus size={16} />
                {editingService ? "Atualizar" : "Adicionar"}
              </button>
              <button onClick={handlePublishServices} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Salvar na Landing
              </button>
              {editingService && <button onClick={resetServiceForm} className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] font-bold">Cancelar</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)]">
                {service.image && <img src={service.image} alt={service.title} className="w-full h-44 object-cover rounded-xl border border-[oklch(0.92_0.02_85)] mb-4" style={{ objectPosition: service.imagePosition || "center center", transform: `scale(${normalizeImageZoom(service.imageZoom)})` }} />}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">{service.emoji} {service.title}</h3>
                    {service.badge && <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: service.color }}>{service.badge}</span>}
                    {isServiceImageDirty(service.image, serviceImageDrafts[service.id]) && (
                      <span className="inline-flex mt-2 ml-2 px-2.5 py-1 rounded-full text-xs font-bold bg-[oklch(0.97_0.06_85)] text-[oklch(0.45_0.16_85)]">
                        Alteração não salva
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEditingService(service)} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button onClick={() => { setServices((current) => current.filter((item) => item.id !== service.id)); toast.success("Serviço removido!"); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[oklch(0.18_0.02_260)]/70">{service.description}</p>
                <div className="mt-4 space-y-3">
                  <input
                    value={serviceImageDrafts[service.id] || ""}
                    onChange={(e) => setServiceImageDrafts((current) => ({ ...current, [service.id]: e.target.value }))}
                    placeholder="Cole a URL da imagem do serviço"
                    className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] text-sm"
                  />
                  {isServiceImageDirty(service.image, serviceImageDrafts[service.id]) && (serviceImageDrafts[service.id] || "").trim() && (
                    <div className="rounded-xl border border-[oklch(0.92_0.02_85)] p-3 bg-[oklch(0.99_0.01_85)]">
                      <p className="text-xs font-bold text-[oklch(0.18_0.02_260)]/70 mb-2">Pré-visualização da nova imagem</p>
                      <img
                        src={serviceImageDrafts[service.id]}
                        alt={`Prévia de ${service.title}`}
                        className="w-full h-40 object-cover rounded-lg border border-[oklch(0.92_0.02_85)]"
                        style={{ objectPosition: service.imagePosition || "center center", transform: `scale(${normalizeImageZoom(service.imageZoom)})` }}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold text-[oklch(0.18_0.02_260)]">
                      <span>Enquadramento vertical</span>
                      <span>{parseImagePosition(service.imagePosition)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={parseImagePosition(service.imagePosition)}
                      onChange={(e) => {
                        const nextPosition = formatImagePosition(Number(e.target.value));
                        setServices((current) => current.map((item) => (
                          item.id === service.id ? { ...item, imagePosition: nextPosition } : item
                        )));
                        if (editingService === service.id) {
                          setNewService((current) => ({ ...current, imagePosition: nextPosition }));
                        }
                      }}
                      className="w-full accent-[oklch(0.55_0.28_340)]"
                    />
                    <div className="flex justify-between text-xs text-[oklch(0.18_0.02_260)]/60">
                      <span>Topo</span>
                      <span>Centro</span>
                      <span>Base</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold text-[oklch(0.18_0.02_260)]">
                      <span>Zoom da imagem</span>
                      <span>{normalizeImageZoom(service.imageZoom).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.01"
                      value={normalizeImageZoom(service.imageZoom)}
                      onChange={(e) => {
                        const nextZoom = normalizeImageZoom(Number(e.target.value));
                        setServices((current) => current.map((item) => (
                          item.id === service.id ? { ...item, imageZoom: nextZoom } : item
                        )));
                        if (editingService === service.id) {
                          setNewService((current) => ({ ...current, imageZoom: nextZoom }));
                        }
                      }}
                      className="w-full accent-[oklch(0.55_0.28_340)]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.97_0.01_85)] font-bold cursor-pointer border border-[oklch(0.92_0.02_85)] text-sm">
                      <Upload size={14} />
                      Trocar Imagem
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleServiceCardUpload(e, service.id)} />
                    </label>
                    <button
                      onClick={() => startEditingService(service)}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] text-sm font-bold"
                    >
                      Editar Serviço
                    </button>
                    <button
                      onClick={() => updateServiceImage(service.id, serviceImageDrafts[service.id] || "")}
                      className="px-4 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white text-sm font-bold"
                    >
                      Salvar Imagem
                    </button>
                    <button
                      onClick={() => handleSaveAndPublishServiceImage(service.id)}
                      className="px-4 py-2 rounded-lg bg-[oklch(0.18_0.02_260)] text-white text-sm font-bold"
                    >
                      Salvar e Publicar
                    </button>
                    <button
                      onClick={() => openLandingPreview(service.id)}
                      className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] text-sm font-bold"
                    >
                      Ver na Landing
                    </button>
                    {isServiceImageDirty(service.image, serviceImageDrafts[service.id]) && (
                      <button
                        onClick={() => setServiceImageDrafts((current) => ({ ...current, [service.id]: service.image }))}
                        className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] text-sm font-bold"
                      >
                        Descartar
                      </button>
                    )}
                    {service.image && (
                      <button
                        onClick={() => removeServiceImage(service.id)}
                        className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] text-sm font-bold text-[oklch(0.55_0.24_25)]"
                      >
                        Remover Imagem
                      </button>
                    )}
                  </div>
                  {recentlyPublishedServiceId === service.id && (
                    <p className="text-xs font-bold text-[oklch(0.65_0.25_145)]">
                      Publicado. Use "Ver na Landing" para conferir o destaque no site.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "characters" && (
        <div className="space-y-6">
          <div className="bg-[oklch(0.98_0.02_85)] border border-[oklch(0.92_0.02_85)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-bold text-[oklch(0.18_0.02_260)]">Publicação do bloco Personagens</p>
              <p className="text-sm text-[oklch(0.18_0.02_260)]/65">Edite textos, destaques e categorias e publique para atualizar a home.</p>
            </div>
            <button onClick={handlePublishCharacters} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold self-start md:self-auto">
              <Save size={16} />
              Salvar e Publicar Personagens
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <input value={charactersContent.badge} onChange={(e) => setCharactersContent({ ...charactersContent, badge: e.target.value })} placeholder="Badge da seção" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input value={charactersContent.titlePrefix} onChange={(e) => setCharactersContent({ ...charactersContent, titlePrefix: e.target.value })} placeholder="Texto antes do destaque" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={charactersContent.highlightedText} onChange={(e) => setCharactersContent({ ...charactersContent, highlightedText: e.target.value })} placeholder="Texto destacado" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={charactersContent.titleSuffix} onChange={(e) => setCharactersContent({ ...charactersContent, titleSuffix: e.target.value })} placeholder="Texto depois do destaque" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={charactersContent.description} onChange={(e) => setCharactersContent({ ...charactersContent, description: e.target.value })} placeholder="Descrição do bloco" rows={4} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <input value={charactersContent.cta} onChange={(e) => setCharactersContent({ ...charactersContent, cta: e.target.value })} placeholder="Texto do botão CTA" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="space-y-2">
              <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">Destaques</p>
              {charactersContent.highlights.map((highlight, index) => (
                <div key={`highlight-${index}`} className="flex gap-2">
                  <input
                    value={highlight}
                    onChange={(e) => setCharactersContent((current) => ({
                      ...current,
                      highlights: current.highlights.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)),
                    }))}
                    placeholder={`Destaque ${index + 1}`}
                    className="flex-1 px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]"
                  />
                  <button
                    onClick={() => setCharactersContent((current) => ({
                      ...current,
                      highlights: current.highlights.filter((_, itemIndex) => itemIndex !== index),
                    }))}
                    className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] text-[oklch(0.55_0.24_25)] font-bold"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                onClick={() => setCharactersContent((current) => ({ ...current, highlights: [...current.highlights, "✅ Novo destaque"] }))}
                className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold"
              >
                Adicionar Destaque
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">Categorias de personagens</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newCharacterCategory.emoji} onChange={(e) => setNewCharacterCategory({ ...newCharacterCategory, emoji: e.target.value })} placeholder="Emoji" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newCharacterCategory.name} onChange={(e) => setNewCharacterCategory({ ...newCharacterCategory, name: e.target.value })} placeholder="Nome da categoria" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={newCharacterCategory.examples} onChange={(e) => setNewCharacterCategory({ ...newCharacterCategory, examples: e.target.value })} placeholder="Exemplos de personagens" rows={3} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="flex gap-2">
              <button onClick={handleAddCharacterCategory} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
                <Plus size={16} />
                {editingCharacterCategory ? "Atualizar" : "Adicionar"}
              </button>
              <button onClick={handlePublishCharacters} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Publicar na Landing
              </button>
              {editingCharacterCategory && <button onClick={resetCharacterCategoryForm} className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] font-bold">Cancelar</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {charactersContent.categories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">{category.emoji} {category.name}</h3>
                    <p className="text-sm text-[oklch(0.18_0.02_260)]/70 mt-2">{category.examples}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setNewCharacterCategory(category); setEditingCharacterCategory(category.id); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button onClick={() => { setCharactersContent((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== category.id) })); toast.success("Categoria removida!"); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "testimonials" && (
        <div className="space-y-6">
          <div className="bg-[oklch(0.98_0.02_85)] border border-[oklch(0.92_0.02_85)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-bold text-[oklch(0.18_0.02_260)]">Publicação dos depoimentos</p>
              <p className="text-sm text-[oklch(0.18_0.02_260)]/65">Depois de editar a lista, publique para atualizar a home.</p>
            </div>
            <button onClick={handlePublishTestimonials} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold self-start md:self-auto">
              <Save size={16} />
              Salvar e Publicar Depoimentos
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newTestimonial.name} onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })} placeholder="Nome" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newTestimonial.role} onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })} placeholder="Cargo / função" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={newTestimonial.text} onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })} placeholder="Depoimento" rows={3} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <select value={newTestimonial.rating} onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value, 10) })} className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]">
              <option value="5">5 estrelas</option>
              <option value="4">4 estrelas</option>
              <option value="3">3 estrelas</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAddTestimonial} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
                <Plus size={16} />
                {editingTestimonial ? "Atualizar" : "Adicionar"}
              </button>
              <button onClick={handlePublishTestimonials} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Publicar na Landing
              </button>
              {editingTestimonial && <button onClick={resetTestimonialForm} className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] font-bold">Cancelar</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">{testimonial.name}</h3>
                    <p className="text-sm text-[oklch(0.18_0.02_260)]/60">{testimonial.role}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setNewTestimonial(testimonial); setEditingTestimonial(testimonial.id); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button onClick={() => { setTestimonials((current) => current.filter((item) => item.id !== testimonial.id)); toast.success("Depoimento removido!"); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[oklch(0.18_0.02_260)]/70 mb-3">{testimonial.text}</p>
                <div className="text-[oklch(0.88_0.18_85)]">{"⭐".repeat(testimonial.rating)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "faq" && (
        <div className="space-y-6">
          <div className="bg-[oklch(0.98_0.02_85)] border border-[oklch(0.92_0.02_85)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-bold text-[oklch(0.18_0.02_260)]">Publicação do bloco FAQ</p>
              <p className="text-sm text-[oklch(0.18_0.02_260)]/65">Edite perguntas frequentes, texto de apoio e CTA final antes de publicar na home.</p>
            </div>
            <button onClick={handlePublishFaq} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold self-start md:self-auto">
              <Save size={16} />
              Salvar e Publicar FAQ
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <input value={faqContent.badge} onChange={(e) => setFaqContent({ ...faqContent, badge: e.target.value })} placeholder="Badge da seção" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={faqContent.titlePrefix} onChange={(e) => setFaqContent({ ...faqContent, titlePrefix: e.target.value })} placeholder="Título antes do destaque" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={faqContent.highlightedText} onChange={(e) => setFaqContent({ ...faqContent, highlightedText: e.target.value })} placeholder="Título destacado" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={faqContent.description} onChange={(e) => setFaqContent({ ...faqContent, description: e.target.value })} placeholder="Descrição da seção FAQ" rows={3} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={faqContent.ctaTitle} onChange={(e) => setFaqContent({ ...faqContent, ctaTitle: e.target.value })} placeholder="Título do CTA final" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={faqContent.ctaLabel} onChange={(e) => setFaqContent({ ...faqContent, ctaLabel: e.target.value })} placeholder="Texto do botão do CTA" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={faqContent.ctaDescription} onChange={(e) => setFaqContent({ ...faqContent, ctaDescription: e.target.value })} placeholder="Descrição do CTA final" rows={3} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">Perguntas e respostas</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newFaqItem.emoji} onChange={(e) => setNewFaqItem({ ...newFaqItem, emoji: e.target.value })} placeholder="Emoji" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newFaqItem.question} onChange={(e) => setNewFaqItem({ ...newFaqItem, question: e.target.value })} placeholder="Pergunta" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={newFaqItem.answer} onChange={(e) => setNewFaqItem({ ...newFaqItem, answer: e.target.value })} placeholder="Resposta" rows={4} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="flex gap-2">
              <button onClick={handleAddFaqItem} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
                <Plus size={16} />
                {editingFaqItem ? "Atualizar" : "Adicionar"}
              </button>
              <button onClick={handlePublishFaq} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Publicar na Landing
              </button>
              {editingFaqItem && <button onClick={resetFaqItemForm} className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] font-bold">Cancelar</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqContent.items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">{item.emoji} {item.question}</h3>
                    <p className="text-sm text-[oklch(0.18_0.02_260)]/70 mt-2">{item.answer}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setNewFaqItem(item); setEditingFaqItem(item.id); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button onClick={() => { setFaqContent((current) => ({ ...current, items: current.items.filter((faq) => faq.id !== item.id) })); toast.success("Pergunta removida!"); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "contact" && (
        <div className="space-y-6">
          <div className="bg-[oklch(0.98_0.02_85)] border border-[oklch(0.92_0.02_85)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-bold text-[oklch(0.18_0.02_260)]">Publicação do bloco Contato</p>
              <p className="text-sm text-[oklch(0.18_0.02_260)]/65">Edite textos, WhatsApp, CTA e cartões informativos antes de publicar na home.</p>
            </div>
            <button onClick={handlePublishContact} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold self-start md:self-auto">
              <Save size={16} />
              Salvar e Publicar Contato
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <input value={contactContent.badge} onChange={(e) => setContactContent({ ...contactContent, badge: e.target.value })} placeholder="Badge da seção" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={contactContent.titlePrefix} onChange={(e) => setContactContent({ ...contactContent, titlePrefix: e.target.value })} placeholder="Título antes do destaque" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={contactContent.highlightedText} onChange={(e) => setContactContent({ ...contactContent, highlightedText: e.target.value })} placeholder="Título destacado" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={contactContent.description} onChange={(e) => setContactContent({ ...contactContent, description: e.target.value })} placeholder="Descrição da seção de contato" rows={3} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={contactContent.formTitle} onChange={(e) => setContactContent({ ...contactContent, formTitle: e.target.value })} placeholder="Título do formulário" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={contactContent.quoteButtonLabel} onChange={(e) => setContactContent({ ...contactContent, quoteButtonLabel: e.target.value })} placeholder="Texto do botão do formulário" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={contactContent.instagramTitle} onChange={(e) => setContactContent({ ...contactContent, instagramTitle: e.target.value })} placeholder="Título do card Instagram" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={contactContent.instagramCtaLabel} onChange={(e) => setContactContent({ ...contactContent, instagramCtaLabel: e.target.value })} placeholder="Texto do botão Instagram" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <textarea value={contactContent.instagramDescription} onChange={(e) => setContactContent({ ...contactContent, instagramDescription: e.target.value })} placeholder="Descrição do card Instagram" rows={3} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <input value={contactContent.whatsappNumber} onChange={(e) => setContactContent({ ...contactContent, whatsappNumber: e.target.value.replace(/\D/g, "") })} placeholder="WhatsApp apenas com números, ex: 5547999447152" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">Cards de contato</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={newContactItem.type} onChange={(e) => setNewContactItem({ ...newContactItem, type: e.target.value as ContactInfoItem["type"] })} className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]">
                <option value="phone">Telefone</option>
                <option value="instagram">Instagram</option>
                <option value="location">Localização</option>
                <option value="hours">Horário</option>
              </select>
              <input value={newContactItem.label} onChange={(e) => setNewContactItem({ ...newContactItem, label: e.target.value })} placeholder="Rótulo do card" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newContactItem.value} onChange={(e) => setNewContactItem({ ...newContactItem, value: e.target.value })} placeholder="Valor exibido" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newContactItem.href || ""} onChange={(e) => setNewContactItem({ ...newContactItem, href: e.target.value })} placeholder="Link opcional" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <input value={newContactItem.color} onChange={(e) => setNewContactItem({ ...newContactItem, color: e.target.value })} placeholder="Cor do destaque" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="flex gap-2">
              <button onClick={handleAddContactItem} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
                <Plus size={16} />
                {editingContactItem ? "Atualizar" : "Adicionar"}
              </button>
              <button onClick={handlePublishContact} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Publicar na Landing
              </button>
              {editingContactItem && <button onClick={resetContactItemForm} className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] font-bold">Cancelar</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactContent.infoItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">{item.label}</h3>
                    <p className="text-sm text-[oklch(0.18_0.02_260)]/70 mt-2">{item.value}</p>
                    {item.href && <p className="text-xs text-[oklch(0.55_0.28_340)] mt-2 break-all">{item.href}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setNewContactItem(item); setEditingContactItem(item.id); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button onClick={() => { setContactContent((current) => ({ ...current, infoItems: current.infoItems.filter((contact) => contact.id !== item.id) })); toast.success("Contato removido!"); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                    </button>
                  </div>
                </div>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: item.color }}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "agenda" && (
        <div className="space-y-6">
          <div className="bg-[oklch(0.98_0.02_85)] border border-[oklch(0.92_0.02_85)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-bold text-[oklch(0.18_0.02_260)]">Publicação do bloco Agenda</p>
              <p className="text-sm text-[oklch(0.18_0.02_260)]/65">Edite o título, descrição e os eventos que aparecem em destaque na agenda pública.</p>
            </div>
            <button onClick={handlePublishAgenda} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold self-start md:self-auto">
              <Save size={16} />
              Salvar e Publicar Agenda
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <input value={agendaContent.title} onChange={(e) => setAgendaContent({ ...agendaContent, title: e.target.value })} placeholder="Título da seção agenda" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <textarea value={agendaContent.description} onChange={(e) => setAgendaContent({ ...agendaContent, description: e.target.value })} placeholder="Descrição da agenda" rows={3} className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">Eventos em destaque</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newAgendaEvent.title} onChange={(e) => setNewAgendaEvent({ ...newAgendaEvent, title: e.target.value })} placeholder="Título do evento" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input type="date" value={newAgendaEvent.date} onChange={(e) => setNewAgendaEvent({ ...newAgendaEvent, date: e.target.value })} className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="time" value={newAgendaEvent.time} onChange={(e) => setNewAgendaEvent({ ...newAgendaEvent, time: e.target.value })} className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newAgendaEvent.location} onChange={(e) => setNewAgendaEvent({ ...newAgendaEvent, location: e.target.value })} placeholder="Local do evento" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="number" value={newAgendaEvent.attendees} onChange={(e) => setNewAgendaEvent({ ...newAgendaEvent, attendees: Number(e.target.value) || 0 })} placeholder="Convidados" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newAgendaEvent.service} onChange={(e) => setNewAgendaEvent({ ...newAgendaEvent, service: e.target.value })} placeholder="Serviço" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <select value={newAgendaEvent.status} onChange={(e) => setNewAgendaEvent({ ...newAgendaEvent, status: e.target.value as AgendaEventItem["status"] })} className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]">
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendente</option>
                <option value="completed">Realizado</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddAgendaEvent} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
                <Plus size={16} />
                {editingAgendaEvent ? "Atualizar" : "Adicionar"}
              </button>
              <button onClick={handlePublishAgenda} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Publicar na Landing
              </button>
              {editingAgendaEvent && <button onClick={resetAgendaEventForm} className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] font-bold">Cancelar</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agendaContent.events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[oklch(0.18_0.02_260)]">{event.title}</h3>
                    <p className="text-sm text-[oklch(0.18_0.02_260)]/70 mt-2">{event.date} {event.time && `• ${event.time}`}</p>
                    <p className="text-sm text-[oklch(0.18_0.02_260)]/70">{event.location}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setNewAgendaEvent(event); setEditingAgendaEvent(event.id); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button onClick={() => { setAgendaContent((current) => ({ ...current, events: current.events.filter((item) => item.id !== event.id) })); toast.success("Evento removido!"); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-bold text-[oklch(0.55_0.28_340)]">{event.service} • {event.attendees} convidados • {event.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "gallery" && (
        <div className="space-y-6">
          <div className="bg-[oklch(0.98_0.02_85)] border border-[oklch(0.92_0.02_85)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-bold text-[oklch(0.18_0.02_260)]">Publicação da galeria</p>
              <p className="text-sm text-[oklch(0.18_0.02_260)]/65">Depois de editar imagens e videos, publique para atualizar a galeria pública.</p>
            </div>
            <button onClick={handlePublishGallery} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold self-start md:self-auto">
              <Save size={16} />
              Salvar e Publicar Galeria
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.97_0.01_85)] font-bold cursor-pointer border border-[oklch(0.92_0.02_85)]">
              <Upload size={16} />
              Upload da Galeria
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, "gallery")} />
            </label>
            <input value={newGalleryImage.src} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, src: e.target.value })} placeholder="URL da imagem ou upload" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newGalleryImage.title} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, title: e.target.value })} placeholder="Título" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newGalleryImage.category} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, category: e.target.value })} placeholder="Categoria" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <input value={newGalleryImage.color} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, color: e.target.value })} placeholder="Cor do selo" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            {newGalleryImage.src && <img src={newGalleryImage.src} alt={newGalleryImage.title || "Prévia"} className="w-full h-60 object-cover rounded-xl border border-[oklch(0.92_0.02_85)]" />}
            <div className="flex gap-2">
              <button onClick={handleAddGalleryImage} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
                <ImagePlus size={16} />
                {editingGalleryImage ? "Atualizar" : "Adicionar"}
              </button>
              <button onClick={handlePublishGallery} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Publicar na Landing
              </button>
              {editingGalleryImage && <button onClick={resetGalleryForm} className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] font-bold">Cancelar</button>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-[oklch(0.92_0.02_85)] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-[oklch(0.18_0.02_260)]">Galeria de videos</p>
              <button onClick={handlePublishVideos} className="flex items-center gap-2 px-5 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Publicar Videos
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.97_0.01_85)] font-bold cursor-pointer border border-[oklch(0.92_0.02_85)]">
                <Upload size={16} />
                Upload de Video
                <input type="file" accept="video/*" className="hidden" onChange={handleUploadVideo} />
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.97_0.01_85)] font-bold cursor-pointer border border-[oklch(0.92_0.02_85)]">
                <ImagePlus size={16} />
                Upload da Capa
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadVideoCover} />
              </label>
            </div>
            <input value={newGalleryVideo.src} onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, src: e.target.value, sourceType: /instagram\.com/i.test(e.target.value) ? "instagram" : "external" })} placeholder="Link do Instagram/Reels ou URL do video" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={newGalleryVideo.title} onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, title: e.target.value })} placeholder="Titulo do video" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
              <input value={newGalleryVideo.category} onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, category: e.target.value })} placeholder="Categoria" className="px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            </div>
            <input value={newGalleryVideo.coverImage || ""} onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, coverImage: e.target.value })} placeholder="URL da capa do video" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            <input value={newGalleryVideo.color} onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, color: e.target.value })} placeholder="Cor do selo" className="w-full px-4 py-2 rounded-lg border border-[oklch(0.92_0.02_85)]" />
            {(newGalleryVideo.coverImage || newGalleryVideo.src) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[oklch(0.92_0.02_85)] p-4 bg-[oklch(0.99_0.01_85)]">
                  <p className="text-xs font-bold text-[oklch(0.18_0.02_260)]/70 mb-3">Prévia da capa</p>
                  {newGalleryVideo.coverImage ? (
                    <img
                      src={newGalleryVideo.coverImage}
                      alt={newGalleryVideo.title || "Capa do video"}
                      className="w-full h-56 object-cover rounded-xl border border-[oklch(0.92_0.02_85)]"
                    />
                  ) : (
                    <div className="w-full h-56 rounded-xl border border-dashed border-[oklch(0.92_0.02_85)] bg-[oklch(0.97_0.01_85)] flex items-center justify-center text-sm text-[oklch(0.18_0.02_260)]/55">
                      Sem capa personalizada
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-[oklch(0.92_0.02_85)] p-4 bg-[oklch(0.99_0.01_85)]">
                  <p className="text-xs font-bold text-[oklch(0.18_0.02_260)]/70 mb-3">Como o video aparece na landing</p>
                  <div className="aspect-[4/5] rounded-xl overflow-hidden border border-[oklch(0.92_0.02_85)] bg-black relative">
                    {newGalleryVideo.coverImage ? (
                      <img
                        src={newGalleryVideo.coverImage}
                        alt={newGalleryVideo.title || "Prévia"}
                        className="w-full h-full object-cover"
                      />
                    ) : /instagram\.com/i.test(newGalleryVideo.src) ? (
                      <div className="w-full h-full bg-gradient-to-br from-[oklch(0.55_0.28_340)] via-[oklch(0.55_0.22_262)] to-[oklch(0.45_0.18_25)]" />
                    ) : newGalleryVideo.src ? (
                      <video src={newGalleryVideo.src} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[oklch(0.18_0.02_260)]" />
                    )}
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 text-[oklch(0.55_0.28_340)] flex items-center justify-center text-xl font-black">
                        ▶
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleAddGalleryVideo} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[oklch(0.55_0.28_340)] text-white font-bold">
                <Plus size={16} />
                {editingGalleryVideo ? "Atualizar" : "Adicionar Video"}
              </button>
              <button onClick={handlePublishVideos} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[oklch(0.92_0.02_85)] font-bold">
                <Save size={16} />
                Publicar Videos
              </button>
              {editingGalleryVideo && <button onClick={resetGalleryVideoForm} className="px-6 py-2 rounded-lg bg-[oklch(0.92_0.02_85)] font-bold">Cancelar</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="bg-white rounded-2xl shadow-md p-4 border border-[oklch(0.92_0.02_85)]">
                <img src={image.src} alt={image.title} className="w-full h-52 object-cover rounded-xl border border-[oklch(0.92_0.02_85)] mb-4" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[oklch(0.18_0.02_260)]">{image.title}</h3>
                    <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: image.color }}>{image.category}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setNewGalleryImage(image); setEditingGalleryImage(image.id); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" />
                    </button>
                    <button onClick={() => { setGalleryImages((current) => current.filter((item) => item.id !== image.id)); toast.success("Imagem removida!"); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                      <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {galleryVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {galleryVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl shadow-md p-4 border border-[oklch(0.92_0.02_85)]">
                  <div className="aspect-[4/5] bg-black rounded-xl border border-[oklch(0.92_0.02_85)] mb-4 overflow-hidden">
                    {video.coverImage ? (
                      <img src={video.coverImage} alt={video.title} className="w-full h-full object-cover" />
                    ) : /instagram\.com/i.test(video.src) ? (
                      <iframe
                        src={`${video.src.split("?")[0].replace(/\/$/, "")}/embed`}
                        className="w-full h-full border-0"
                        title={video.title}
                      />
                    ) : (
                      <video src={video.src} controls className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[oklch(0.18_0.02_260)]">{video.title}</h3>
                      <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: video.color }}>{video.category}</span>
                      {video.coverImage && (
                        <p className="mt-2 text-xs font-bold text-[oklch(0.55_0.28_340)]">
                          Capa personalizada ativa
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setNewGalleryVideo(video); setEditingGalleryVideo(video.id); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                        <Edit2 size={16} className="text-[oklch(0.55_0.28_340)]" />
                      </button>
                      <button onClick={() => { setGalleryVideos((current) => current.filter((item) => item.id !== video.id)); toast.success("Video removido!"); }} className="p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg">
                        <Trash2 size={16} className="text-[oklch(0.65_0.25_145)]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
