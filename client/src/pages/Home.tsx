/**
 * Home — Sonho Mágico Joinville
 * Design: Circo Moderno / Pop Festivo Brasileiro
 * Página principal com todas as seções do site — versão evoluída
 */
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Characters from "@/components/Characters";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Differentials from "@/components/Differentials";
import EventSchedule from "@/components/EventSchedule";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Characters />
        <Gallery />
        <Testimonials />
        <Differentials />
        <EventSchedule />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
