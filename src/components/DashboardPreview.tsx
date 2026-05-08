import { TrendingUp, TrendingDown, Clock, Users, FileText, AlertTriangle } from "lucide-react";

const kpis = [
  { label: "Casos Activos", value: "147", change: "+12%", trend: "up", icon: FileText, color: "text-info" },
  { label: "Casos Cerrados (mes)", value: "23", change: "+8%", trend: "up", icon: TrendingUp, color: "text-success" },
  { label: "Tiempo Prom. Resolución", value: "45 días", change: "-5%", trend: "down", icon: Clock, color: "text-gold" },
  { label: "Términos por Vencer", value: "8", change: "", trend: "neutral", icon: AlertTriangle, color: "text-warning" },
];

const casesBySpecialty = [
  { name: "Derecho Civil", cases: 42, pct: 28 },
  { name: "Derecho Penal", cases: 35, pct: 24 },
  { name: "Derecho Laboral", cases: 30, pct: 20 },
  { name: "Derecho Comercial", cases: 25, pct: 17 },
  { name: "Derecho Administrativo", cases: 15, pct: 11 },
];

const lawyers = [
  { name: "Dr. Martínez", cases: 18, status: "activo", efficiency: 92 },
  { name: "Dra. López", cases: 15, status: "activo", efficiency: 88 },
  { name: "Dr. García", cases: 12, status: "audiencia", efficiency: 95 },
  { name: "Dra. Rodríguez", cases: 14, status: "activo", efficiency: 85 },
];

const DashboardPreview = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-body text-gold uppercase tracking-widest mb-3">Analítica & KPIs</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Panel de Control
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
            Visualización en tiempo real del rendimiento del bufete con indicadores clave
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-luxury border border-border overflow-hidden">
          {/* Top bar */}
          <div className="gradient-navy px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-success/80" />
            </div>
            <span className="font-body text-xs text-gold-light/50">dashboard.jurovalegal.com</span>
            <div />
          </div>

          <div className="p-6 md:p-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="bg-muted/50 rounded-xl p-5 border border-border hover:shadow-luxury transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    {kpi.change && (
                      <span className={`text-xs font-body font-medium flex items-center gap-1 ${kpi.trend === "up" ? "text-success" : kpi.trend === "down" ? "text-success" : "text-muted-foreground"}`}>
                        {kpi.trend === "up" ? <TrendingUp className="w-3 h-3" /> : kpi.trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                        {kpi.change}
                      </span>
                    )}
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cases by Specialty */}
              <div className="bg-muted/30 rounded-xl p-6 border border-border">
                <h3 className="font-display text-lg font-semibold text-foreground mb-5">Casos por Especialidad</h3>
                <div className="space-y-4">
                  {casesBySpecialty.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between font-body text-sm mb-1.5">
                        <span className="text-foreground font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{item.cases} casos</span>
                      </div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-gold"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lawyer Workload */}
              <div className="bg-muted/30 rounded-xl p-6 border border-border">
                <h3 className="font-display text-lg font-semibold text-foreground mb-5">Carga Laboral por Abogado</h3>
                <div className="space-y-3">
                  {lawyers.map((lawyer) => (
                    <div key={lawyer.name} className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border">
                      <div className="w-10 h-10 rounded-full gradient-navy flex items-center justify-center">
                        <Users className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="font-body text-sm font-semibold text-foreground">{lawyer.name}</p>
                        <p className="font-body text-xs text-muted-foreground">{lawyer.cases} casos asignados</p>
                      </div>
                      <div className="text-right">
                        <p className="font-body text-sm font-bold text-success">{lawyer.efficiency}%</p>
                        <span className={`font-body text-[10px] px-2 py-0.5 rounded-full ${lawyer.status === "audiencia" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                          {lawyer.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
