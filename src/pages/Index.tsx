import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AreasSection from "@/components/AreasSection";
import ServicesSection from "@/components/ServicesSection";
import TeamSection from "@/components/TeamSection";
import ProcessSection from "@/components/ProcessSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <section id="nosotros"><AboutSection /></section>
      <section id="areas"><AreasSection /></section>
      <section id="servicios"><ServicesSection /></section>
      <section id="proceso"><ProcessSection /></section>
      <section id="equipo"><TeamSection /></section>
      <section id="contacto"><ContactSection /></section>
      <Footer />
    </div>
  );
};

export default Index;
