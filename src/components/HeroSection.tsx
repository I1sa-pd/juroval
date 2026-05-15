import { Scale, Shield, BarChart3, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/jurovalegal?igsh=MXA5eXhnN2ZhbWtuYw==" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/1BCGEDoTgR/" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/573134439740" },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="inicio" className="gradient-navy relative overflow-hidden min-h-[90vh] flex items-center pt-20">
      {/* Top bar with social links */}
      <div className="hidden sm:block absolute top-16 left-0 w-full z-20">
        <div className="container mx-auto px-6 py-3 flex justify-end">
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-accent/15 hover:bg-accent/10 transition-colors group"
              >
                <social.icon className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] font-body text-primary-foreground/50 group-hover:text-primary-foreground/80">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-accent blur-[100px]" />
      </div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 mb-8">
              <Scale className="w-4 h-4 text-accent" />
              <span className="text-sm font-body text-accent tracking-wider uppercase">
                Jurova Legal Group
              </span>
            </div>
          </div>

          <h1 className="animate-fade-up font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-tight mb-6">
            Jurova{" "}
            <span className="text-gold-gradient">Legal Group</span>
          </h1>

          <p className="animate-fade-up-delay font-body text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-4 leading-relaxed italic">
            "Juramos defenderte, avanzamos contigo"
          </p>

          <p className="animate-fade-up-delay font-body text-base text-primary-foreground/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            Plataforma centralizada para la administración de casos, control de términos procesales,
            comunicación con clientes y analítica de rendimiento.
          </p>

          <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="gradient-gold text-primary font-body font-semibold px-8 py-4 rounded-lg shadow-gold hover:opacity-90 transition-opacity"
            >
              Acceder al Sistema
            </button>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { icon: Shield, label: "Problemas Resueltos", value: "128+" },
              { icon: Scale, label: "Casos Representados", value: "150+" },
              { icon: BarChart3, label: "Años de Trayectoria", value: "12+" },
              { icon: Shield, label: "Reconocimientos", value: "14+" },
            ].map((stat) => (
              <div key={stat.label} className="animate-count-up text-center">
                <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                  {stat.value}
                </p>
                <p className="font-body text-xs text-primary-foreground/50 mt-1 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;