import { Scale, Instagram, Facebook, MessageCircle } from "lucide-react";

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/jurovalegal?igsh=MXA5eXhnN2ZhbWtuYw==" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/1BCGEDoTgR/" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/573134439740" },
];

const Footer = () => (
  <footer className="gradient-navy py-12 border-t border-gold/10">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-gold" />
          <span className="font-display text-lg font-semibold text-primary-foreground">
            Jurova Legal Group
          </span>
        </div>

        <div className="flex items-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors group"
            >
              <social.icon className="w-4 h-4 text-accent group-hover:text-accent" />
              <span className="text-xs font-body text-primary-foreground/60 group-hover:text-primary-foreground/80">
                {social.label}
              </span>
            </a>
          ))}
        </div>

        <p className="font-body text-xs text-gold-light/40">
          © 2026 Jurova Legal Group — Todos los derechos reservados
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;