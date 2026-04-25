export interface LandingService {
  id: number | string;
  emoji: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: string;
  imageZoom?: number;
  color: string;
  bgColor?: string;
  badge: string;
}

export interface LandingHeroContent {
  title: string;
  subtitle: string;
  cta: string;
  badge: string;
  image: string;
  imagePosition?: string;
  imageZoom?: number;
}

export interface CharacterCategory {
  id: string;
  name: string;
  emoji: string;
  examples: string;
}

export interface CharactersSectionContent {
  badge: string;
  titlePrefix: string;
  highlightedText: string;
  titleSuffix: string;
  description: string;
  highlights: string[];
  cta: string;
  categories: CharacterCategory[];
}

export interface GalleryVideo {
  id: string;
  src: string;
  title: string;
  category: string;
  color: string;
  coverImage?: string;
  sourceType?: "upload" | "instagram" | "external";
}

export interface FAQItemContent {
  id: string;
  question: string;
  answer: string;
  emoji: string;
}

export interface FAQSectionContent {
  badge: string;
  titlePrefix: string;
  highlightedText: string;
  description: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
  items: FAQItemContent[];
}

export interface ContactInfoItem {
  id: string;
  type: "phone" | "instagram" | "location" | "hours";
  label: string;
  value: string;
  href?: string;
  color: string;
}

export interface ContactSectionContent {
  badge: string;
  titlePrefix: string;
  highlightedText: string;
  description: string;
  formTitle: string;
  instagramTitle: string;
  instagramDescription: string;
  instagramCtaLabel: string;
  whatsappNumber: string;
  quoteButtonLabel: string;
  infoItems: ContactInfoItem[];
}

export interface AgendaEventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  service: string;
  status: "confirmed" | "pending" | "completed";
}

export interface AgendaSectionContent {
  title: string;
  description: string;
  events: AgendaEventItem[];
}

export const DEFAULT_LANDING_SERVICES: LandingService[] = [
  {
    id: 1,
    emoji: "🟡",
    title: "Personagens Kids",
    description:
      "Mais de 160 opções de personagens vivos! Princesas, super-heróis, personagens da Disney, animê e muito mais. Fantasias de alta qualidade que encantam crianças e adultos.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/personagens-section-Exh3onDhxN6EJvkDG33D5y.webp",
    imagePosition: "center 35%",
    imageZoom: 1,
    color: "oklch(0.88 0.18 85)",
    bgColor: "oklch(0.97 0.05 85)",
    badge: "160+ personagens",
  },
  {
    id: 2,
    emoji: "🟢",
    title: "Recreação",
    description:
      "Animadores profissionais e criativos que transformam qualquer evento em uma festa inesquecível. Brincadeiras, gincanas, pintura facial e muito mais para animar a galera!",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/recreacao-section-hpLeKDFaYmTxVhKG4uG6Qu.webp",
    imagePosition: "center 38%",
    imageZoom: 1,
    color: "oklch(0.65 0.25 145)",
    bgColor: "oklch(0.97 0.05 145)",
    badge: "Para todas as idades",
  },
  {
    id: 3,
    emoji: "🔵",
    title: "Magic Drinks Kids",
    description:
      "Bebidas mágicas e coloridas que encantam as crianças! Sucos especiais, vitaminas e drinks temáticos sem álcool, servidos com apresentação divertida e criativa.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/magic-drinks-eSkbWxMAicco8BUscoCUi2.webp",
    imagePosition: "center 42%",
    imageZoom: 1,
    color: "oklch(0.55 0.22 262)",
    bgColor: "oklch(0.97 0.04 262)",
    badge: "100% sem álcool",
  },
  {
    id: 4,
    emoji: "🟣",
    title: "Brinquedos",
    description:
      "Ampla variedade de brinquedos e equipamentos para festas: cama elástica, piscina de bolinhas, tobogã inflável, escorregador e muito mais para a diversão das crianças.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    imagePosition: "center 50%",
    imageZoom: 1,
    color: "oklch(0.55 0.25 300)",
    bgColor: "oklch(0.97 0.04 300)",
    badge: "Aluguel e montagem",
  },
  {
    id: 5,
    emoji: "🔴",
    title: "Carreta Furacão",
    description:
      "O espetáculo que todo mundo ama! A famosa Carreta Furacão chega com música ao vivo, personagens, luzes e muita animação. Um show completo que vai agitar qualquer evento!",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/carreta-furacao-nanAAGVXYhAHdjkW987JJb.webp",
    imagePosition: "center 45%",
    imageZoom: 1,
    color: "oklch(0.55 0.25 25)",
    bgColor: "oklch(0.97 0.04 25)",
    badge: "Show completo",
  },
];

export function normalizeLandingService(
  service: Partial<LandingService>,
  fallback?: LandingService,
): LandingService {
  const base = fallback || DEFAULT_LANDING_SERVICES[0];
  return {
    ...base,
    ...service,
    id: service.id || base.id,
    emoji: service.emoji || base.emoji,
    title: service.title || base.title,
    description: service.description || base.description,
    image: service.image || base.image,
    imagePosition: service.imagePosition || base.imagePosition || "center center",
    imageZoom: typeof service.imageZoom === "number" ? service.imageZoom : (base.imageZoom || 1),
    color: service.color || base.color,
    badge: service.badge || base.badge,
  };
}

export const DEFAULT_LANDING_HERO: LandingHeroContent = {
  title: "Transformamos Festas em Sonhos",
  subtitle:
    "Mais de 160 personagens vivos para tornar cada momento inesquecível. Animação, recreação e muito entretenimento para todos os públicos.",
  cta: "Solicitar Orçamento",
  badge: "Criador de conteúdos digitais 📱📞💻",
  image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459073288/DQjHD4gKJEAWCYtu4KPsKB/hero-banner-UcvokfvLzxfTA2JqqLSndd.webp",
  imagePosition: "center center",
  imageZoom: 1,
};

export const DEFAULT_CHARACTERS_SECTION: CharactersSectionContent = {
  badge: "🎭 Personagens Vivos",
  titlePrefix: "Mais de",
  highlightedText: "160 personagens",
  titleSuffix: "para o seu evento",
  description:
    "Nossa equipe conta com fantasias de alta qualidade e profissionais treinados para encantar crianças e adultos. Desde os clássicos da Disney até os personagens mais modernos dos animes e séries.",
  highlights: [
    "✅ Fantasias de alta qualidade",
    "✅ Profissionais treinados",
    "✅ Pontualidade garantida",
    "✅ Atendemos toda a região",
  ],
  cta: "Ver Lista Completa",
  categories: [
    { id: "char-1", name: "Disney Clássicos", emoji: "🏰", examples: "Mickey, Minnie, Cinderela, Branca de Neve, Bela..." },
    { id: "char-2", name: "Super-Heróis", emoji: "🦸", examples: "Homem-Aranha, Batman, Mulher Maravilha, Capitão América..." },
    { id: "char-3", name: "Frozen & Princesas", emoji: "👸", examples: "Elsa, Anna, Rapunzel, Moana, Ariel, Bela..." },
    { id: "char-4", name: "Animê & Mangá", emoji: "⚡", examples: "Naruto, Dragon Ball, One Piece, Demon Slayer..." },
    { id: "char-5", name: "Infantil Kids", emoji: "🐷", examples: "Peppa Pig, Patrulha Canina, Bluey, Galinha Pintadinha..." },
    { id: "char-6", name: "Personagens Clássicos", emoji: "🤡", examples: "Palhaços, Mágicos, Animadores temáticos..." },
    { id: "char-7", name: "Filmes & Séries", emoji: "🎬", examples: "Toy Story, Minions, Madagascar, Shrek..." },
    { id: "char-8", name: "Personalizados", emoji: "⭐", examples: "Criamos o personagem que você quiser para seu evento!" },
  ],
};

export const DEFAULT_GALLERY_VIDEOS: GalleryVideo[] = [];

export const DEFAULT_FAQ_SECTION: FAQSectionContent = {
  badge: "❓ Dúvidas Frequentes",
  titlePrefix: "Perguntas",
  highlightedText: "frequentes",
  description:
    "Tire suas dúvidas antes de contratar. Se não encontrar o que procura, fale diretamente conosco pelo WhatsApp!",
  ctaTitle: "Ainda tem dúvidas?",
  ctaDescription:
    "Nossa equipe está pronta para responder todas as suas perguntas e ajudar a planejar o evento perfeito!",
  ctaLabel: "Falar pelo WhatsApp",
  items: [
    {
      id: "faq-1",
      question: "Com quanto tempo de antecedência devo contratar?",
      answer:
        "Recomendamos contratar com pelo menos 15 dias de antecedência para garantir disponibilidade dos personagens e serviços desejados. Para datas especiais como Natal, Carnaval e feriados prolongados, o ideal é contratar com 30 dias ou mais.",
      emoji: "📅",
    },
    {
      id: "faq-2",
      question: "Vocês atendem em quais cidades?",
      answer:
        "Atendemos Joinville e toda a região, incluindo Jaraguá do Sul, São Bento do Sul, Schroeder, Guaramirim, Araquari, Barra Velha e municípios vizinhos. Para cidades mais distantes, consulte disponibilidade e taxa de deslocamento.",
      emoji: "📍",
    },
    {
      id: "faq-3",
      question: "Quantos personagens posso contratar para o mesmo evento?",
      answer:
        "Não há limite. Você pode contratar quantos personagens desejar para o seu evento, inclusive em pacotes com múltiplos personagens e condições diferenciadas.",
      emoji: "🎭",
    },
    {
      id: "faq-4",
      question: "Como funciona o pagamento?",
      answer:
        "Aceitamos Pix, transferência bancária, cartão de crédito e débito. Para confirmar a reserva, solicitamos um sinal de 50% do valor total.",
      emoji: "💳",
    },
  ],
};

export const DEFAULT_CONTACT_SECTION: ContactSectionContent = {
  badge: "📞 Entre em Contato",
  titlePrefix: "Vamos fazer sua",
  highlightedText: "festa acontecer!",
  description:
    "Preencha o formulário abaixo e entraremos em contato pelo WhatsApp. Orçamento rápido, sem compromisso!",
  formTitle: "Solicitar Orçamento 🎉",
  instagramTitle: "Siga no Instagram!",
  instagramDescription: "Acompanhe nossos eventos, personagens e promoções. Mais de 73,7 mil seguidores!",
  instagramCtaLabel: "contate.me/sonhomagicojoinville",
  whatsappNumber: "5547999447152",
  quoteButtonLabel: "Enviar para o WhatsApp",
  infoItems: [
    {
      id: "contact-1",
      type: "phone",
      label: "WhatsApp / Telefone",
      value: "(47) 99944-7152",
      href: "https://wa.me/5547999447152",
      color: "oklch(0.65 0.25 145)",
    },
    {
      id: "contact-2",
      type: "instagram",
      label: "Instagram",
      value: "@sonhomagicojoinville",
      href: "https://contate.me/sonhomagicojoinville",
      color: "oklch(0.55 0.28 340)",
    },
    {
      id: "contact-3",
      type: "location",
      label: "Atendimento",
      value: "Joinville e região — SC",
      color: "oklch(0.55 0.22 262)",
    },
    {
      id: "contact-4",
      type: "hours",
      label: "Horário",
      value: "Seg–Sáb: 8h às 20h",
      color: "oklch(0.88 0.18 85)",
    },
  ],
};

export const DEFAULT_AGENDA_SECTION: AgendaSectionContent = {
  title: "Agenda de Eventos",
  description: "Confira nossos próximos eventos e reserve sua data conosco!",
  events: [
    {
      id: "agenda-1",
      title: "Festa de Aniversário - Tema Mickey",
      date: "2026-03-25",
      time: "14:00",
      location: "Bairro Centro, Joinville",
      attendees: 30,
      service: "Personagens Kids",
      status: "confirmed",
    },
    {
      id: "agenda-2",
      title: "Evento Corporativo - Confraternização",
      date: "2026-03-28",
      time: "18:00",
      location: "Salão de Eventos, Joinville",
      attendees: 100,
      service: "Recreação",
      status: "confirmed",
    },
    {
      id: "agenda-3",
      title: "Festa Infantil - Tema Princesa",
      date: "2026-04-05",
      time: "15:00",
      location: "Parque da Boca da Traição, Joinville",
      attendees: 25,
      service: "Personagens Kids",
      status: "pending",
    },
  ],
};

export function normalizeLandingHero(content?: Partial<LandingHeroContent>): LandingHeroContent {
  return {
    ...DEFAULT_LANDING_HERO,
    ...(content || {}),
    imagePosition: content?.imagePosition || DEFAULT_LANDING_HERO.imagePosition,
    imageZoom: typeof content?.imageZoom === "number" ? content.imageZoom : DEFAULT_LANDING_HERO.imageZoom,
  };
}

export function normalizeCharactersSection(
  content?: Partial<CharactersSectionContent>,
): CharactersSectionContent {
  return {
    ...DEFAULT_CHARACTERS_SECTION,
    ...(content || {}),
    highlights:
      Array.isArray(content?.highlights) && content.highlights.length > 0
        ? content.highlights
        : DEFAULT_CHARACTERS_SECTION.highlights,
    categories:
      Array.isArray(content?.categories) && content.categories.length > 0
        ? content.categories.map((category, index) => ({
            id: category.id || DEFAULT_CHARACTERS_SECTION.categories[index]?.id || `char-${index + 1}`,
            name: category.name || DEFAULT_CHARACTERS_SECTION.categories[index]?.name || "Categoria",
            emoji: category.emoji || DEFAULT_CHARACTERS_SECTION.categories[index]?.emoji || "⭐",
            examples: category.examples || DEFAULT_CHARACTERS_SECTION.categories[index]?.examples || "",
          }))
        : DEFAULT_CHARACTERS_SECTION.categories,
  };
}

export function normalizeGalleryVideo(video: Partial<GalleryVideo>, fallback?: GalleryVideo): GalleryVideo {
  const base = fallback || DEFAULT_GALLERY_VIDEOS[0] || {
    id: "video-1",
    src: "",
    title: "",
    category: "Instagram",
    color: "oklch(0.55 0.28 340)",
    sourceType: "external" as const,
  };

  return {
    ...base,
    ...video,
    id: video.id || base.id,
    src: video.src || base.src,
    title: video.title || base.title,
    category: video.category || base.category,
    color: video.color || base.color,
    coverImage: video.coverImage || base.coverImage || "",
    sourceType: video.sourceType || base.sourceType || "external",
  };
}

export function normalizeFAQSection(content?: Partial<FAQSectionContent>): FAQSectionContent {
  return {
    ...DEFAULT_FAQ_SECTION,
    ...(content || {}),
    items:
      Array.isArray(content?.items) && content.items.length > 0
        ? content.items.map((item, index) => ({
            id: item.id || DEFAULT_FAQ_SECTION.items[index]?.id || `faq-${index + 1}`,
            question: item.question || DEFAULT_FAQ_SECTION.items[index]?.question || "Pergunta",
            answer: item.answer || DEFAULT_FAQ_SECTION.items[index]?.answer || "",
            emoji: item.emoji || DEFAULT_FAQ_SECTION.items[index]?.emoji || "❓",
          }))
        : DEFAULT_FAQ_SECTION.items,
  };
}

export function normalizeContactSection(content?: Partial<ContactSectionContent>): ContactSectionContent {
  return {
    ...DEFAULT_CONTACT_SECTION,
    ...(content || {}),
    infoItems:
      Array.isArray(content?.infoItems) && content.infoItems.length > 0
        ? content.infoItems.map((item, index) => ({
            id: item.id || DEFAULT_CONTACT_SECTION.infoItems[index]?.id || `contact-${index + 1}`,
            type: item.type || DEFAULT_CONTACT_SECTION.infoItems[index]?.type || "phone",
            label: item.label || DEFAULT_CONTACT_SECTION.infoItems[index]?.label || "Contato",
            value: item.value || DEFAULT_CONTACT_SECTION.infoItems[index]?.value || "",
            href: item.href || DEFAULT_CONTACT_SECTION.infoItems[index]?.href || "",
            color: item.color || DEFAULT_CONTACT_SECTION.infoItems[index]?.color || "oklch(0.55 0.28 340)",
          }))
        : DEFAULT_CONTACT_SECTION.infoItems,
  };
}

export function normalizeAgendaSection(content?: Partial<AgendaSectionContent>): AgendaSectionContent {
  return {
    ...DEFAULT_AGENDA_SECTION,
    ...(content || {}),
    events:
      Array.isArray(content?.events) && content.events.length > 0
        ? content.events.map((event, index) => ({
            id: event.id || DEFAULT_AGENDA_SECTION.events[index]?.id || `agenda-${index + 1}`,
            title: event.title || DEFAULT_AGENDA_SECTION.events[index]?.title || "Evento",
            date: event.date || DEFAULT_AGENDA_SECTION.events[index]?.date || new Date().toISOString().slice(0, 10),
            time: event.time || DEFAULT_AGENDA_SECTION.events[index]?.time || "14:00",
            location: event.location || DEFAULT_AGENDA_SECTION.events[index]?.location || "Joinville",
            attendees: typeof event.attendees === "number" ? event.attendees : (DEFAULT_AGENDA_SECTION.events[index]?.attendees || 0),
            service: event.service || DEFAULT_AGENDA_SECTION.events[index]?.service || "Serviço",
            status: event.status || DEFAULT_AGENDA_SECTION.events[index]?.status || "confirmed",
          }))
        : DEFAULT_AGENDA_SECTION.events,
  };
}

export async function fetchLandingContent(): Promise<Record<string, unknown>> {
  const response = await fetch("/api/landing-content");
  if (!response.ok) {
    throw new Error("Falha ao carregar conteúdo da landing");
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function fetchLandingServices(): Promise<LandingService[]> {
  const payload = await fetchLandingContent() as { services?: Partial<LandingService>[] };
  if (!Array.isArray(payload.services) || payload.services.length === 0) {
    return [];
  }

  return payload.services.map((service, index) =>
    normalizeLandingService(service, DEFAULT_LANDING_SERVICES[index] || DEFAULT_LANDING_SERVICES[0]),
  );
}

export async function saveLandingServices(services: LandingService[]): Promise<void> {
  const response = await fetch("/api/landing-content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ services }),
  });

  if (!response.ok) {
    throw new Error("Falha ao publicar serviços da landing");
  }
}

export async function saveLandingHero(hero: LandingHeroContent): Promise<void> {
  const response = await fetch("/api/landing-content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hero }),
  });

  if (!response.ok) {
    throw new Error("Falha ao publicar hero da landing");
  }
}

export async function saveCharactersSection(characters: CharactersSectionContent): Promise<void> {
  const response = await fetch("/api/landing-content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ characters }),
  });

  if (!response.ok) {
    throw new Error("Falha ao publicar bloco de personagens");
  }
}

export async function saveFAQSection(faq: FAQSectionContent): Promise<void> {
  const response = await fetch("/api/landing-content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ faq }),
  });

  if (!response.ok) {
    throw new Error("Falha ao publicar bloco de FAQ");
  }
}

export async function saveContactSection(contact: ContactSectionContent): Promise<void> {
  const response = await fetch("/api/landing-content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contact }),
  });

  if (!response.ok) {
    throw new Error("Falha ao publicar bloco de contato");
  }
}

export async function saveAgendaSection(agenda: AgendaSectionContent): Promise<void> {
  const response = await fetch("/api/landing-content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agenda }),
  });

  if (!response.ok) {
    throw new Error("Falha ao publicar bloco de agenda");
  }
}
