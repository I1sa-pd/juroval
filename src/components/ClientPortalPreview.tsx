import { Lock, CalendarDays, CheckCircle } from "lucide-react";

const ClientPortalPreview = () => {
  return (
    <section className="py-24 gradient-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gold blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-body text-gold uppercase tracking-widest mb-3">Acceso Clientes</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Portal del <span className="text-gold-gradient">Cliente</span>
            </h2>
            <p className="font-body text-gold-light/60 leading-relaxed mb-8">
              Los clientes del bufete pueden consultar el estado de su caso en tiempo real, 
              ver fechas importantes y acceder a la documentación, todo mediante un acceso 
              seguro con número de cédula y nombre.
            </p>

            <div className="space-y-4">
              {[
                { icon: Lock, text: "Acceso seguro con cédula y nombre" },
                { icon: CalendarDays, text: "Fechas de audiencias y plazos" },
                { icon: CheckCircle, text: "Estado actualizado del proceso" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gold" />
                  </div>
                  <span className="font-body text-sm text-gold-light/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client Portal Mockup */}
          <div className="bg-card rounded-2xl shadow-luxury overflow-hidden border border-border/50">
            <div className="bg-navy-light/50 px-5 py-3 border-b border-border/30">
              <p className="font-body text-xs text-gold-light/50">portal.jurovalegal.com/mi-caso</p>
            </div>
            <div className="p-6 space-y-5">
              {/* Login */}
              <div className="space-y-3">
                <div className="h-10 rounded-lg border border-border bg-muted/50 flex items-center px-3">
                  <span className="font-body text-xs text-muted-foreground">Cédula: 1.023.456.789</span>
                </div>
                <div className="h-10 rounded-lg border border-border bg-muted/50 flex items-center px-3">
                  <span className="font-body text-xs text-muted-foreground">Nombre: María Fernández</span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Case Info */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-display text-sm font-semibold text-foreground">Caso #2024-0847</p>
                  <span className="text-[10px] font-body px-2 py-1 rounded-full bg-gold/15 text-gold font-medium">En curso</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-body text-xs">
                    <span className="text-muted-foreground">Etapa actual</span>
                    <span className="text-foreground font-medium">Proyección</span>
                  </div>
                  <div className="flex justify-between font-body text-xs">
                    <span className="text-muted-foreground">Próxima audiencia</span>
                    <span className="text-foreground font-medium">15 Abr 2026</span>
                  </div>
                  <div className="flex justify-between font-body text-xs">
                    <span className="text-muted-foreground">Documentos</span>
                    <span className="text-info font-medium underline cursor-pointer">Ver 12 archivos</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Historial</p>
                {[
                  { date: "12 Mar", event: "Recaudo probatorio completado", done: true },
                  { date: "08 Mar", event: "Caso creado y asignado", done: true },
                ].map((item) => (
                  <div key={item.event} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <div>
                      <p className="font-body text-xs text-foreground">{item.event}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.date} 2026</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientPortalPreview;
