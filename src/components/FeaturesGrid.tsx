import { CalendarDays, Shield, Upload, Bell, Users, BarChart3, Eye, Clock } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Calendario de Audiencias",
    desc: "Calendario integrado con fechas de audiencias, links de videoconferencia y notificaciones automáticas por correo.",
  },
  {
    icon: Clock,
    title: "Control de Términos",
    desc: "Cada área define sus tiempos de respuesta. El sistema alerta cuando los plazos están próximos a vencer.",
  },
  {
    icon: Users,
    title: "Portal del Cliente",
    desc: "Los clientes consultan el estado de su caso, fechas y documentos ingresando con cédula y nombre.",
  },
  {
    icon: Upload,
    title: "Gestión Documental",
    desc: "Carga de documentos PDF por caso con historial de versiones y acceso controlado según el rol del usuario.",
  },
  {
    icon: BarChart3,
    title: "Analítica con KPIs",
    desc: "Indicadores de rendimiento: tiempo de resolución, carga laboral, tendencias por especialidad y tipo de juzgado.",
  },
  {
    icon: Bell,
    title: "Notificaciones por Correo",
    desc: "Alertas automáticas de fechas importantes, documentos pendientes y términos procesales a clientes y abogados.",
  },
  {
    icon: Shield,
    title: "Seguridad y Auditoría",
    desc: "Políticas de protección de datos, registro de actividades y control de acceso a la información confidencial.",
  },
  {
    icon: Eye,
    title: "Observaciones y Trazabilidad",
    desc: "Espacio de observaciones por asignación, cambio de funciones y seguimiento completo del proceso.",
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-body text-gold uppercase tracking-widest mb-3">Funcionalidades</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Módulos del Sistema
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
            Solución integral que cubre todos los procesos operativos del bufete
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="group bg-card rounded-xl p-6 border border-border hover:border-gold/30 hover:shadow-luxury transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg gradient-navy flex items-center justify-center mb-4 group-hover:shadow-gold transition-shadow">
                <feat.icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground mb-2">{feat.title}</h3>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
