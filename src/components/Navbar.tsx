import { Scale, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const links = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Áreas", href: "#areas" },
  { label: "Servicios", href: "#servicios" },
  { label: "Proceso", href: "#proceso" },
  { label: "Equipo", href: "#equipo" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-luxury"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md gradient-gold flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div className="leading-tight">
            <p className={`font-display text-base font-bold ${scrolled ? "text-foreground" : "text-primary-foreground"}`}>
              Jurova
            </p>
            <p className={`font-body text-[10px] uppercase tracking-[0.2em] ${scrolled ? "text-muted-foreground" : "text-accent"}`}>
              Legal Group
            </p>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`font-body text-sm tracking-wide transition-colors hover:text-accent ${
                scrolled ? "text-foreground/80" : "text-primary-foreground/80"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => navigate("/consultar-caso")}
            className={`font-body text-sm px-4 py-2 rounded-md border transition-colors ${
              scrolled
                ? "border-border text-foreground hover:bg-muted"
                : "border-accent/30 text-primary-foreground hover:bg-accent/10"
            }`}
          >
            Consultar caso
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="font-body text-sm gradient-gold text-primary font-semibold px-4 py-2 rounded-md shadow-gold hover:opacity-90 transition-opacity"
          >
            Acceder / Registrarse
          </button>
        </div>

        <button
          className={`lg:hidden ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-body text-sm text-foreground/80 hover:text-accent py-2"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => navigate("/consultar-caso")}
                className="flex-1 font-body text-sm px-4 py-2 rounded-md border border-border text-foreground"
              >
                Consultar
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex-1 font-body text-sm gradient-gold text-primary font-semibold px-4 py-2 rounded-md"
              >
                Acceder
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
