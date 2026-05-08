import { CheckCircle, Circle, Clock, ArrowRight, FileSearch, FileText, Eye, FilePlus, Search, CalendarDays } from "lucide-react";

const steps = [
  { icon: FilePlus, label: "Creación del Caso", desc: "Registro inicial con datos del cliente y tipo de proceso", status: "done" },
  { icon: Search, label: "Recaudo Probatorio", desc: "Recopilación de evidencias y documentos de soporte", status: "done" },
  { icon: FileText, label: "Proyección", desc: "Elaboración de escritos y estrategia legal", status: "current" },
  { icon: Eye, label: "Revisión", desc: "Control de calidad por el jefe de área", status: "pending" },
  { icon: FilePlus, label: "Proyección de Recursos", desc: "Preparación de recursos legales necesarios", status: "pending" },
  { icon: FileSearch, label: "Recabar Pruebas", desc: "Pruebas adicionales y complementarias", status: "pending" },
  { icon: CalendarDays, label: "Audiencia", desc: "Calendario con fecha, hora y link de audiencia", status: "pending" },
];

const CaseWorkflow = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-body text-gold uppercase tracking-widest mb-3">Flujo de Trabajo</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Gestión de Casos
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
            Cada caso sigue un flujo definido con control de términos, observaciones y asignación de tareas automáticas
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-7 gap-2">
            {steps.map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center text-center group">
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-full">
                    <ArrowRight className={`w-4 h-4 ${step.status === "done" ? "text-success" : "text-border"}`} />
                  </div>
                )}
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all ${
                  step.status === "done" ? "bg-success/15 text-success" :
                  step.status === "current" ? "gradient-gold text-navy-deep shadow-gold" :
                  "bg-muted text-muted-foreground border border-border"
                }`}>
                  {step.status === "done" ? <CheckCircle className="w-5 h-5" /> :
                   step.status === "current" ? <Clock className="w-5 h-5" /> :
                   <Circle className="w-4 h-4" />}
                </div>
                <p className={`font-body text-xs font-semibold mb-1 ${step.status === "current" ? "text-gold" : "text-foreground"}`}>
                  {step.label}
                </p>
                <p className="font-body text-[10px] text-muted-foreground leading-tight hidden lg:block">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Case Detail Mockup */}
        <div className="max-w-4xl mx-auto mt-16 bg-card rounded-2xl shadow-luxury border border-border overflow-hidden">
          <div className="gradient-navy px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-primary-foreground">Caso #2024-0847</h3>
              <p className="font-body text-xs text-gold-light/60">Derecho Civil — Proceso Ordinario</p>
            </div>
            <span className="font-body text-xs px-3 py-1.5 rounded-full bg-gold/20 text-gold font-medium">
              En Proyección
            </span>
          </div>
          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
                <p className="font-body text-sm font-semibold text-foreground">María Fernández G.</p>
              </div>
              <div>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Abogado Asignado</p>
                <p className="font-body text-sm font-semibold text-foreground">Dr. Andrés Martínez</p>
              </div>
              <div>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Juzgado</p>
                <p className="font-body text-sm text-foreground">Juzgado 3° Civil del Circuito</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Término Procesal</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-warning rounded-full" />
                  </div>
                  <span className="font-body text-xs font-medium text-warning">5 días</span>
                </div>
              </div>
              <div>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Próxima Audiencia</p>
                <p className="font-body text-sm text-foreground">15 Abr 2026 — 10:00 AM</p>
                <p className="font-body text-xs text-info underline cursor-pointer">🔗 Link de audiencia virtual</p>
              </div>
              <div>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Documentos</p>
                <p className="font-body text-sm text-foreground">12 archivos PDF — v3</p>
              </div>
            </div>
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Observaciones</p>
              <div className="bg-muted/50 rounded-lg p-3 border border-border space-y-2">
                <div className="font-body text-xs text-foreground">
                  <span className="font-semibold">Dr. Martínez:</span> Pendiente anexar prueba documental del contrato.
                </div>
                <div className="font-body text-xs text-foreground">
                  <span className="font-semibold">Jefe Área:</span> Revisar términos antes del viernes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseWorkflow;
