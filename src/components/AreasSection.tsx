import { Shield, Gavel, TreePine, Building2, Landmark, Swords, Scale } from "lucide-react";

const areas = [
  {
    icon: Gavel,
    title: "Derecho Disciplinario",
    description: "Cuando eres un servidor público y surge una investigación, no solo se analiza un expediente: se pone en riesgo tu nombre, tu estabilidad y tu trayectoria. Te acompañamos con un equipo que conoce las instituciones desde dentro.",
  },
  {
    icon: Swords,
    title: "Derecho Disciplinario Militar",
    description: "Comprendemos la labor militar y policial, así como los riesgos que implica. Ofrecemos acompañamiento de abogados expertos en Doctrina Militar y Policial, especializados en la representación y defensa en procesos disciplinarios contra personal uniformado.",
  },
  {
    icon: Shield,
    title: "Derecho Penal",
    description: "Brindamos respaldo legal a quienes enfrentan un proceso penal o requieren defensa de sus derechos. También representamos a víctimas que hayan sufrido afectaciones en su integridad o en sus bienes como consecuencia de un delito.",
  },
  {
    icon: Scale,
    title: "Derecho Penal Militar",
    description: "Ofrecemos asesoría preventiva y defensa judicial ante la Justicia Penal Militar y Policial, garantizando acompañamiento sólido y estratégico en cada etapa del proceso para integrantes de la Fuerza Pública.",
  },
  {
    icon: TreePine,
    title: "Derecho Ambiental",
    description: "Ofrecemos representación jurídica especializada en procesos ambientales, asesoría preventiva para el cumplimiento normativo y defensa estratégica en litigios relacionados con licencias ambientales, gestión de residuos y responsabilidad ecológica.",
  },
  {
    icon: Building2,
    title: "Derecho Administrativo",
    description: "Somos tu voz para reclamar tus derechos frente a entidades estatales. También apoyamos a funcionarios públicos que enfrentan actos administrativos o sanciones, ayudándoles a defender su integridad profesional.",
  },
  {
    icon: Landmark,
    title: "Responsabilidad Fiscal",
    description: "Entendemos la seriedad de las investigaciones de responsabilidad fiscal que ponen en riesgo tu nombre, tu patrimonio y tus proyectos de vida. Estructuramos una defensa técnica y estratégica con transparencia y rigor legal.",
  },
];

const AreasSection = () => (
  <section className="bg-muted/50 py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-14">
        <p className="font-body text-sm uppercase tracking-widest text-accent mb-3">Áreas de práctica</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          Nuestras Especialidades
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {areas.map((area) => (
          <div
            key={area.title}
            className="bg-card rounded-xl p-6 shadow-luxury hover:shadow-gold transition-shadow duration-300 border border-border"
          >
            <div className="w-11 h-11 rounded-lg gradient-gold flex items-center justify-center mb-4">
              <area.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-3">{area.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{area.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AreasSection;
