import { useEffect, useRef, useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import {
  DEFAULT_FAQ_SECTION,
  fetchLandingContent,
  normalizeFAQSection,
  type FAQItemContent,
  type FAQSectionContent,
} from "@/lib/landingServices";

function FAQItem({ faq, index }: { faq: FAQItemContent; index: number }) {
  const [open, setOpen] = useState(false);
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

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-[oklch(0.92_0.02_85)] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        transitionDelay: `${index * 0.06}s`,
      }}
    >
      <button
        className="w-full flex items-center gap-4 p-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-2xl flex-shrink-0">{faq.emoji}</span>
        <span
          className="flex-1 font-bold text-[oklch(0.18_0.02_260)] text-sm md:text-base"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {faq.question}
        </span>
        <ChevronDown
          size={20}
          className="flex-shrink-0 text-[oklch(0.55_0.28_340)] transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "300px" : "0px" }}
      >
        <div className="px-5 pb-5 pl-[4.5rem]">
          <div className="w-full h-px bg-[oklch(0.92_0.02_85)] mb-4" />
          <p
            className="text-sm text-[oklch(0.45_0.02_260)] leading-relaxed"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [visible, setVisible] = useState(false);
  const [faqContent, setFaqContent] = useState<FAQSectionContent>(DEFAULT_FAQ_SECTION);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadFaq = async () => {
      try {
        const payload = await fetchLandingContent();
        if (payload.faq && typeof payload.faq === "object") {
          setFaqContent(normalizeFAQSection(payload.faq as Partial<FAQSectionContent>));
          return;
        }
      } catch {
        // fallback below
      }

      try {
        const saved = localStorage.getItem("landingFaq");
        if (saved) {
          setFaqContent(normalizeFAQSection(JSON.parse(saved) as Partial<FAQSectionContent>));
        }
      } catch {
        setFaqContent(DEFAULT_FAQ_SECTION);
      }
    };

    void loadFaq();
  }, []);

  return (
    <section id="faq" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.88_0.18_85)] to-transparent" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[oklch(0.88_0.18_85/0.08)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.88_0.18_85/0.2)] text-[oklch(0.5_0.15_65)] text-sm font-bold mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {faqContent.badge}
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-[oklch(0.18_0.02_260)] mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {faqContent.titlePrefix}{" "}
            <span className="text-[oklch(0.55_0.28_340)]">{faqContent.highlightedText}</span>
          </h2>
          <p
            className="text-base md:text-lg text-[oklch(0.45_0.02_260)] max-w-2xl mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {faqContent.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {faqContent.items.map((faq, index) => (
            <FAQItem key={faq.id} faq={faq} index={index} />
          ))}
        </div>

        <div
          className="mt-12 p-8 rounded-3xl text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.55 0.28 340) 0%, oklch(0.38 0.22 262) 100%)",
          }}
        >
          <div className="absolute -top-8 -right-8 text-white/10 text-8xl font-bold pointer-events-none">?</div>
          <div className="absolute -bottom-8 -left-8 text-white/10 text-8xl font-bold pointer-events-none">!</div>
          <h3
            className="text-2xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {faqContent.ctaTitle}
          </h3>
          <p
            className="text-white/85 text-sm mb-5"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {faqContent.ctaDescription}
          </p>
          <a
            href="https://wa.me/5547999447152?text=Olá!%20Tenho%20algumas%20dúvidas%20sobre%20os%20serviços."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[oklch(0.55_0.28_340)] font-extrabold text-sm hover:scale-105 transition-transform shadow-lg"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            <MessageCircle size={18} />
            {faqContent.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
