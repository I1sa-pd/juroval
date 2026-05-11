import { Lightbulb, ShieldCheck, Heart } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "Asesoría preventiva y estratégica",
    description: "Anticipamos riesgos legales y diseñamos estrategias para que nuestros clientes eviten sanciones, procesos o pérdidas innecesarias.",
  },
  {
    icon: ShieldCheck,
    title: "Defensa integral y representación",
    description: "Acompañamos y defendemos a nuestros clientes en procesos disciplinarios, administrativos, penales, fiscales y ambientales, brindando respaldo profesional en cada etapa.",
  },
  {
    icon: Heart,
    title: "Tranquilidad y confianza",
    description: "Transformamos la incertidumbre en claridad, ofreciendo acompañamiento cercano, confidencial y humano, para que nuestros clientes tomen decisiones seguras.",
  },
];

const ProcessSection = () => (
  <section className="bg-background py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-14">
        <p className="font-body text-sm uppercase tracking-widest text-accent mb-3">Nuestro proceso</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          ¿Cómo transformamos tus problemas legales en soluciones?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <div key={step.title} className="text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full gradient-navy flex items-center justify-center">
              <step.icon className="w-7 h-7 text-accent" />
            </div>
            <span className="font-display text-3xl font-bold text-accent/30">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-xl font-bold text-foreground mt-2 mb-3">{step.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
