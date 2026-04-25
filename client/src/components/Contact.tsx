import { useEffect, useRef, useState } from "react";
import { Clock, Instagram, MapPin, Phone, Send } from "lucide-react";
import {
  DEFAULT_CONTACT_SECTION,
  fetchLandingContent,
  normalizeContactSection,
  type ContactInfoItem,
  type ContactSectionContent,
} from "@/lib/landingServices";

function getContactIcon(type: ContactInfoItem["type"]) {
  if (type === "phone") return <Phone size={20} />;
  if (type === "instagram") return <Instagram size={20} />;
  if (type === "location") return <MapPin size={20} />;
  return <Clock size={20} />;
}

export default function Contact() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [contactContent, setContactContent] = useState<ContactSectionContent>(DEFAULT_CONTACT_SECTION);
  const [form, setForm] = useState({ name: "", phone: "", event: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadContact = async () => {
      try {
        const payload = await fetchLandingContent();
        if (payload.contact && typeof payload.contact === "object") {
          setContactContent(normalizeContactSection(payload.contact as Partial<ContactSectionContent>));
          return;
        }
      } catch {
        // fallback below
      }

      try {
        const saved = localStorage.getItem("landingContact");
        if (saved) {
          setContactContent(normalizeContactSection(JSON.parse(saved) as Partial<ContactSectionContent>));
        }
      } catch {
        setContactContent(DEFAULT_CONTACT_SECTION);
      }
    };

    void loadContact();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Olá! Gostaria de solicitar um orçamento.\n\n*Nome:* ${form.name}\n*Telefone:* ${form.phone}\n*Tipo de evento:* ${form.event}\n*Mensagem:* ${form.message}`
    );
    window.open(`https://wa.me/${contactContent.whatsappNumber}?text=${text}`, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const instagramItem = contactContent.infoItems.find((item) => item.type === "instagram");

  return (
    <section id="contato" className="py-20 bg-[oklch(0.99_0.005_85)] relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[oklch(0.65_0.25_145/0.08)] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[oklch(0.55_0.28_340/0.08)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div
          ref={ref}
          className="text-center mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.65_0.25_145/0.15)] text-[oklch(0.45_0.25_145)] text-sm font-bold mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {contactContent.badge}
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {contactContent.titlePrefix}{" "}
            <span className="text-[oklch(0.55_0.28_340)]">{contactContent.highlightedText}</span>
          </h2>
          <p
            className="text-base md:text-lg text-[oklch(0.45_0.02_260)] max-w-2xl mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {contactContent.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-30px)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {contactContent.infoItems.map((info) => (
                <div
                  key={info.id}
                  className="p-5 rounded-2xl bg-white border border-[oklch(0.92_0.02_85)] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${info.color.replace(")", " / 0.15)")}`, color: info.color }}
                  >
                    {getContactIcon(info.type)}
                  </div>
                  <p
                    className="text-xs text-[oklch(0.55_0.02_260)] font-semibold uppercase tracking-wide mb-1"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {info.label}
                  </p>
                  {info.href ? (
                    <a
                      href={info.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[oklch(0.18_0.02_260)] hover:underline"
                      style={{ fontFamily: "'Baloo 2', cursive", color: info.color }}
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p
                      className="text-sm font-bold text-[oklch(0.18_0.02_260)]"
                      style={{ fontFamily: "'Baloo 2', cursive" }}
                    >
                      {info.value}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div
              className="p-6 rounded-2xl text-white relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, oklch(0.55 0.28 340) 0%, oklch(0.72 0.22 55) 100%)",
              }}
            >
              <div className="absolute -top-6 -right-6 text-white/10 text-8xl font-bold pointer-events-none">★</div>
              <h3
                className="text-xl font-extrabold mb-2"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                {contactContent.instagramTitle}
              </h3>
              <p
                className="text-white/85 text-sm mb-4"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {contactContent.instagramDescription}
              </p>
              <a
                href={instagramItem?.href || "https://instagram.com/sonhomagicojoinville"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[oklch(0.55_0.28_340)] font-bold text-sm hover:scale-105 transition-transform"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                <Instagram size={16} />
                {contactContent.instagramCtaLabel}
              </a>
            </div>
          </div>

          <div
            className="bg-white rounded-3xl shadow-xl border border-[oklch(0.92_0.02_85)] p-8"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(30px)",
              transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
            }}
          >
            <h3
              className="text-2xl font-extrabold text-[oklch(0.18_0.02_260)] mb-6"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {contactContent.formTitle}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-[oklch(0.35_0.02_260)] mb-1.5">Seu nome *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Maria Silva" className="w-full px-4 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.2)] text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[oklch(0.35_0.02_260)] mb-1.5">WhatsApp / Telefone *</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(47) 99999-9999" className="w-full px-4 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.2)] text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[oklch(0.35_0.02_260)] mb-1.5">Tipo de evento</label>
                <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.2)] text-sm transition-all bg-white">
                  <option value="">Selecione o tipo de evento</option>
                  <option value="Aniversário infantil">Aniversário infantil</option>
                  <option value="Aniversário adulto">Aniversário adulto</option>
                  <option value="Festa corporativa">Festa corporativa</option>
                  <option value="Evento escolar">Evento escolar</option>
                  <option value="Evento público">Evento público</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[oklch(0.35_0.02_260)] mb-1.5">Mensagem</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Conte um pouco sobre o seu evento" rows={5} className="w-full px-4 py-3 rounded-xl border border-[oklch(0.9_0.02_85)] focus:outline-none focus:border-[oklch(0.55_0.28_340)] focus:ring-2 focus:ring-[oklch(0.55_0.28_340/0.2)] text-sm transition-all resize-none" />
              </div>
              <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[oklch(0.65_0.25_145)] text-white font-extrabold hover:scale-[1.02] transition-transform shadow-lg">
                <Send size={18} />
                {sent ? "Enviado!" : contactContent.quoteButtonLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
