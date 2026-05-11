import { BookOpen, FileText, ShieldCheck, Scale, AlertTriangle, Building, Search, Megaphone, Handshake } from "lucide-react";

const services = [
  { icon: BookOpen, title: "Acompañamiento en audiencias y diligencias judiciales", description: "Te representamos en cada etapa del proceso, brindando seguridad y respaldo frente a jueces y autoridades." },
  { icon: FileText, title: "Redacción y revisión de contratos y documentos legales", description: "Garantizamos que tus documentos cumplan con la ley y protejan tus intereses, evitando futuros conflictos." },
  { icon: ShieldCheck, title: "Presentación y respuesta de demandas, tutelas y recursos", description: "Defendemos tus derechos de manera oportuna y estratégica ante cualquier acción legal." },
  { icon: Scale, title: "Defensa en procesos disciplinarios y administrativos", description: "Te acompañamos con experiencia y solidez en los escenarios más complejos." },
  { icon: AlertTriangle, title: "Asesoría preventiva para evitar sanciones o conflictos", description: "Te orientamos antes de que surja un problema, anticipando riesgos y ahorrándote tiempo y dinero." },
  { icon: Building, title: "Representación ante entidades estatales y autoridades judiciales", description: "Actuamos en tu nombre con conocimiento del funcionamiento interno de las instituciones." },
  { icon: Search, title: "Análisis de riesgos legales y diseño de estrategias de defensa", description: "Evaluamos tu situación a profundidad y creamos planes jurídicos efectivos." },
  { icon: Megaphone, title: "Interposición de reclamaciones y recursos administrativos", description: "Defendemos tus intereses frente a decisiones injustas de entidades públicas o privadas." },
  { icon: Handshake, title: "Negociación y conciliación para la solución de conflictos", description: "Buscamos soluciones rápidas, prácticas y favorables, evitando procesos judiciales largos y costosos." },
];

const ServicesSection = () => (
  <section className="bg-background py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-14">
        <p className="font-body text-sm uppercase tracking-widest text-accent mb-3">¿Cómo podemos ayudarte?</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Tu caso es único. Nuestra defensa también.
        </h2>
        <p className="font-body text-lg text-muted-foreground">Acompañamiento legal, experto y humano.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {services.map((service) => (
          <div key={service.title} className="flex gap-4 p-5 rounded-xl hover:bg-muted/60 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <service.icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">{service.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
