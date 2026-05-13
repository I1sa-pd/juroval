import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  Shield,
  Briefcase,
  CalendarDays,
  BarChart3,
  Bell,
  Users,
  Clock,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Check,
  XCircle,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertTriangle,
  Settings,
  CheckCircle2,
  Send,
  MapPin,
  Video,
  Phone,
  Mail,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GestionDocumentos } from "@/components/GestionDocumentos";
import { RPieChart, RBarChart, RLineChart, RMultiLineChart } from "@/components/AnalyticsCharts";
import { Upload } from "lucide-react";

const menuItems = [
  { id: "inicio", icon: BarChart3, label: "Inicio" },
  { id: "revision", icon: FileText, label: "Revisión de Casos" },
  { id: "asignacion", icon: Briefcase, label: "Asignación de Casos" },
  { id: "documentos", icon: Upload, label: "Gestión Documental" },
  { id: "terminos", icon: Clock, label: "Control de Términos" },
  { id: "abogados", icon: Users, label: "Gestión de Usuarios" },
  { id: "comentarios", icon: MessageSquare, label: "Comentarios Internos" },
  { id: "calendario", icon: CalendarDays, label: "Calendario General" },
  { id: "analitica", icon: BarChart3, label: "Analítica y KPIs" },
  { id: "notificaciones", icon: Bell, label: "Notificaciones" },
  { id: "solicitudes", icon: Phone, label: "Solicitudes de Contacto" },
];

const DashboardJefe = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>(() => {
    return sessionStorage.getItem("jefe_section") ?? "inicio";
  });

  const handleSetSection = (section: string) => {
    sessionStorage.setItem("jefe_section", section);
    setActiveSection(section);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { signOut } = useAuth();
  const handleLogout = async () => { await signOut(); navigate("/"); };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 gradient-navy flex-col border-r border-accent/10 fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span className="font-display text-lg font-bold text-primary-foreground">Jurova</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Shield className="w-3 h-3 text-accent/70" />
            <p className="font-body text-[10px] text-primary-foreground/40">Panel del Director</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSetSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                activeSection === item.id
                  ? "bg-accent/15 text-accent"
                  : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-accent/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/40 hover:text-primary-foreground hover:bg-accent/5 transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 gradient-navy border-b border-accent/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-accent" />
          <span className="font-display text-lg font-bold text-primary-foreground">Jurova</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-primary-foreground/70">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-14 bottom-0 w-64 gradient-navy border-r border-accent/10 flex flex-col">
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { handleSetSection(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-accent/15 text-accent"
                      : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-accent/10">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/40 hover:text-primary-foreground hover:bg-accent/5 transition-colors">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="p-6 md:p-8">
          {activeSection === "inicio" && <SeccionInicio onNavigate={handleSetSection} />}
          {activeSection === "revision" && <SeccionRevision />}
          {activeSection === "asignacion" && <SeccionAsignacion />}
          {activeSection === "documentos" && <GestionDocumentos mode="jefe" />}
          {activeSection === "terminos" && <SeccionTerminosJefe />}
          {activeSection === "abogados" && <SeccionAbogados />}
          {activeSection === "comentarios" && <SeccionComentariosJefe />}
          {activeSection === "calendario" && <SeccionCalendarioJefe />}
          {activeSection === "analitica" && <SeccionAnaliticaJefe />}
          {activeSection === "notificaciones" && <SeccionNotificacionesJefe setActiveSection={handleSetSection} />}
          {activeSection === "solicitudes" && <SeccionSolicitudes />}
        </div>
      </main>
    </div>
  );
};

/* ── Helpers ── */
const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
    <p className="font-body text-sm text-muted-foreground mt-2">{description}</p>
  </div>
);

const etapas = ["Creación", "Proyección", "Recaudo Probatorio", "Revisión", "Firma", "Radicado", "Cerrado"];

/* ── Revisión de Casos (real data) ── */
type RevCaso = {
  id: string; radicado: string; cliente_nombre: string; tipo: string;
  etapa: string; abogado_id: string | null; observaciones: string | null;
  area_id: string | null; created_at: string; urgente: boolean; fecha_vencimiento: string | null;
};
type RevAct = { id: string; case_id: string; tipo: string; descripcion: string; fecha: string; vence_at: string | null; cumplida: boolean };
type RevAud = { id: string; case_id: string; titulo: string; fecha_inicio: string; modalidad: string | null; ubicacion: string | null; enlace_virtual: string | null };
type RevDoc = { id: string; case_id: string | null; file_name: string; file_path: string; created_at: string; uploaded_by: string };

const SeccionRevision = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [casos, setCasos] = useState<RevCaso[]>([]);
  const [acts, setActs] = useState<RevAct[]>([]);
  const [auds, setAuds] = useState<RevAud[]>([]);
  const [docs, setDocs] = useState<RevDoc[]>([]);
  const [abogadosMap, setAbogadosMap] = useState<Record<string, string>>({});
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtroEtapa, setFiltroEtapa] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");

  const load = async () => {
    setLoading(true);
    // Traer TODOS los casos activos (no cerrados)
    const { data: cs, error } = await supabase
      .from("cases")
      .select("id, radicado, cliente_nombre, tipo, etapa, abogado_id, observaciones, area_id, created_at, urgente, fecha_vencimiento")
      .neq("etapa", "Cerrado")
      .order("urgente", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error al cargar casos", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const list = (cs ?? []) as any as RevCaso[];
    setCasos(list);

    const ids = list.map(c => c.id);
    const abogadoIds = Array.from(new Set(list.map(c => c.abogado_id).filter(Boolean) as string[]));

    if (abogadoIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", abogadoIds);
      const m: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => { m[p.id] = p.full_name; });
      setAbogadosMap(m);
    }

    if (ids.length > 0) {
      const [{ data: a1 }, { data: a2 }, { data: d1 }] = await Promise.all([
        supabase.from("actuaciones").select("id, case_id, tipo, descripcion, fecha, vence_at, cumplida").in("case_id", ids).order("fecha", { ascending: false }),
        supabase.from("audiencias").select("id, case_id, titulo, fecha_inicio, modalidad, ubicacion, enlace_virtual").in("case_id", ids).order("fecha_inicio", { ascending: true }),
        supabase.from("documents").select("id, case_id, file_name, file_path, created_at, uploaded_by").in("case_id", ids).order("created_at", { ascending: false }),
      ]);
      setActs((a1 ?? []) as any);
      setAuds((a2 ?? []) as any);
      setDocs((d1 ?? []) as any);
    } else {
      setActs([]); setAuds([]); setDocs([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const aprobar = async (caso: RevCaso) => {
    const idx = etapas.indexOf(caso.etapa);
    const next = etapas[Math.min(idx + 1, etapas.length - 1)];
    const { error } = await supabase.from("cases").update({ etapa: next as any }).eq("id", caso.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Caso aprobado", description: `Avanzó a ${next}` });
    setExpandedCase(null);
    load();
  };

  const devolver = async (caso: RevCaso) => {
    if (!observacion.trim()) { toast({ title: "Falta observación", description: "Escribe qué debe corregirse", variant: "destructive" }); return; }
    const obs = `[${new Date().toLocaleString("es-CO")}] Devuelto por el director: ${observacion.trim()}

${caso.observaciones ?? ""}`.trim();
    const { error } = await supabase.from("cases").update({ etapa: "Proyección" as any, observaciones: obs }).eq("id", caso.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (caso.abogado_id) {
      await supabase.from("notificaciones").insert({
        user_id: caso.abogado_id,
        case_id: caso.id,
        tipo: "caso_devuelto",
        titulo: "Caso devuelto para corrección",
        mensaje: `El director devolvió el caso #${caso.radicado} (${caso.cliente_nombre}) a Proyección. Observación: ${observacion.trim().slice(0, 120)}`,
      });
    }
    if (user) {
      await supabase.from("notificaciones").insert({
        user_id: user.id,
        case_id: caso.id,
        tipo: "caso_devuelto_log",
        titulo: `Caso #${caso.radicado} devuelto a Proyección`,
        mensaje: `Devolviste el caso de ${caso.cliente_nombre}. Observación: "${observacion.trim().slice(0, 100)}"`,
      });
    }
    toast({ title: "Caso devuelto", description: "El abogado verá las correcciones." });
    setObservacion(""); setExpandedCase(null);
    load();
  };

  const cerrarCaso = async (caso: RevCaso) => {
    const { error } = await supabase.from("cases").update({ etapa: "Cerrado" as any }).eq("id", caso.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Caso cerrado", description: `Caso #${caso.radicado} marcado como cerrado.` });
    setExpandedCase(null);
    load();
  };

  const descargarDoc = async (d: RevDoc) => {
    const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(d.file_path, 60);
    if (error || !data?.signedUrl) { toast({ title: "Error", description: "No se pudo descargar", variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  const casosFiltrados = casos.filter(c => {
    const coincideEtapa = filtroEtapa === "todos" || c.etapa === filtroEtapa;
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = !texto ||
      c.radicado.toLowerCase().includes(texto) ||
      c.cliente_nombre.toLowerCase().includes(texto) ||
      c.tipo.toLowerCase().includes(texto) ||
      (abogadosMap[c.abogado_id ?? ""] ?? "").toLowerCase().includes(texto);
    return coincideEtapa && coincideBusqueda;
  });

  const conteoEtapa = etapas.reduce<Record<string, number>>((acc, et) => {
    acc[et] = casos.filter(c => c.etapa === et).length;
    return acc;
  }, {});

  const getEtapaColor = (etapa: string) => {
    const colores: Record<string, string> = {
      "Creación": "bg-blue-100 text-blue-700",
      "Proyección": "bg-violet-100 text-violet-700",
      "Recaudo Probatorio": "bg-amber-100 text-amber-700",
      "Revisión": "bg-orange-100 text-orange-700",
      "Firma": "bg-teal-100 text-teal-700",
      "Radicado": "bg-green-100 text-green-700",
      "Cerrado": "bg-muted text-muted-foreground",
    };
    return colores[etapa] ?? "bg-accent/10 text-accent";
  };

  return (
    <>
      <SectionHeader
        title="Revisión de Casos"
        description="Todos los casos activos del bufete — filtra por etapa o busca por radicado, cliente o abogado"
      />

      {/* KPIs por etapa */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <button
            onClick={() => setFiltroEtapa("todos")}
            className={`rounded-xl border p-3 text-left transition-all ${filtroEtapa === "todos" ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/40"}`}
          >
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Todos</p>
            <p className="font-display text-2xl font-bold text-foreground mt-1">{casos.length}</p>
          </button>
          {etapas.filter(e => e !== "Cerrado").map(et => (
            <button
              key={et}
              onClick={() => setFiltroEtapa(et)}
              className={`rounded-xl border p-3 text-left transition-all ${filtroEtapa === et ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/40"}`}
            >
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider truncate">{et}</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{conteoEtapa[et] ?? 0}</p>
            </button>
          ))}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <Input
          placeholder="Buscar por radicado, cliente, abogado o tipo…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando casos…</p>
      ) : casosFiltrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">
            {casos.length === 0 ? "No hay casos activos en el sistema." : "Ningún caso coincide con el filtro."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {casosFiltrados.map((caso) => {
            const idx = etapas.indexOf(caso.etapa);
            const cActs = acts.filter(a => a.case_id === caso.id);
            const cAuds = auds.filter(a => a.case_id === caso.id);
            const cDocs = docs.filter(a => a.case_id === caso.id);
            const esExpandido = expandedCase === caso.id;

            // Próxima audiencia
            const proxAud = cAuds.find(a => new Date(a.fecha_inicio) >= new Date());
            // Actuaciones vencidas
            const actVencidas = cActs.filter(a => !a.cumplida && a.vence_at && new Date(a.vence_at) < new Date());

            return (
              <div key={caso.id} className={`bg-card rounded-xl border overflow-hidden transition-all ${caso.urgente ? "border-destructive/40" : "border-border"}`}>
                <button
                  onClick={() => setExpandedCase(esExpandido ? null : caso.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${caso.urgente ? "bg-destructive/10" : "gradient-navy"}`}>
                      <FileText className={`w-4 h-4 ${caso.urgente ? "text-destructive" : "text-accent"}`} />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-base font-semibold text-foreground">#{caso.radicado}</p>
                        {caso.urgente && <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">URGENTE</span>}
                      </div>
                      <p className="font-body text-xs text-muted-foreground truncate">
                        {abogadosMap[caso.abogado_id ?? ""] ?? "Sin abogado"} · {caso.cliente_nombre} · {caso.tipo}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {proxAud && (
                          <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(proxAud.fecha_inicio).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                          </span>
                        )}
                        {actVencidas.length > 0 && (
                          <span className="font-body text-[10px] text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {actVencidas.length} actuación{actVencidas.length > 1 ? "es" : ""} vencida{actVencidas.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {caso.fecha_vencimiento && (
                          <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Vence {new Date(caso.fecha_vencimiento).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className={`text-[11px] font-body px-3 py-1 rounded-full font-medium ${getEtapaColor(caso.etapa)}`}>{caso.etapa}</span>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${esExpandido ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {esExpandido && (
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-5">

                    {/* Barra de progreso de etapas */}
                    <div>
                      <p className="font-body text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Progreso del caso</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {etapas.map((et, i) => (
                          <div key={et} className="flex items-center gap-1">
                            <div className={`px-2.5 py-1 rounded-md text-[10px] font-body font-medium ${
                              i < idx ? "bg-accent/20 text-accent" :
                              i === idx ? "bg-accent text-primary-foreground" :
                              "bg-muted text-muted-foreground"
                            }`}>{et}</div>
                            {i < etapas.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observaciones */}
                    {caso.observaciones && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="font-body text-[10px] uppercase tracking-wider text-amber-700 mb-1">Observaciones</p>
                        <p className="font-body text-xs text-amber-900 whitespace-pre-line">{caso.observaciones}</p>
                      </div>
                    )}

                    {/* Actuaciones y Audiencias */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-border rounded-lg p-3">
                        <p className="font-display text-sm font-semibold text-foreground mb-2">
                          Actuaciones ({cActs.length})
                          {actVencidas.length > 0 && <span className="ml-2 text-[10px] text-destructive font-body">· {actVencidas.length} vencida(s)</span>}
                        </p>
                        {cActs.length === 0 ? <p className="text-xs text-muted-foreground">Sin actuaciones registradas.</p> : (
                          <ul className="space-y-2 max-h-48 overflow-auto">
                            {cActs.map(a => (
                              <li key={a.id} className={`text-xs p-2 rounded-md ${!a.cumplida && a.vence_at && new Date(a.vence_at) < new Date() ? "bg-destructive/5 border border-destructive/20" : "bg-muted/30"}`}>
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-foreground">{a.tipo}</p>
                                  {a.cumplida && <span className="text-accent text-[10px]">✓ Cumplida</span>}
                                </div>
                                <p className="text-muted-foreground">{a.descripcion}</p>
                                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                  {new Date(a.fecha).toLocaleDateString("es-CO")}
                                  {a.vence_at ? ` · vence ${new Date(a.vence_at).toLocaleDateString("es-CO")}` : ""}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="border border-border rounded-lg p-3">
                        <p className="font-display text-sm font-semibold text-foreground mb-2">Audiencias ({cAuds.length})</p>
                        {cAuds.length === 0 ? <p className="text-xs text-muted-foreground">Sin audiencias programadas.</p> : (
                          <ul className="space-y-2 max-h-48 overflow-auto">
                            {cAuds.map(a => (
                              <li key={a.id} className="text-xs p-2 rounded-md bg-muted/30">
                                <p className="font-medium text-foreground">{a.titulo}</p>
                                <p className="text-muted-foreground">
                                  {new Date(a.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                                  {a.modalidad ? ` · ${a.modalidad}` : ""}
                                </p>
                                {a.enlace_virtual && <a href={a.enlace_virtual} target="_blank" rel="noopener" className="text-accent underline text-[10px]">Abrir enlace</a>}
                                {a.ubicacion && <p className="text-[10px] text-muted-foreground/70">{a.ubicacion}</p>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Documentos */}
                    <div className="border border-border rounded-lg p-3">
                      <p className="font-display text-sm font-semibold text-foreground mb-2">Documentos ({cDocs.length})</p>
                      {cDocs.length === 0 ? <p className="text-xs text-muted-foreground">Sin documentos adjuntos.</p> : (
                        <ul className="grid gap-2 max-h-40 overflow-auto">
                          {cDocs.map(d => (
                            <li key={d.id} className="flex items-center justify-between text-xs bg-muted/30 rounded-md px-3 py-2">
                              <span className="truncate text-foreground">{d.file_name}</span>
                              <Button size="sm" variant="outline" className="h-7 text-xs ml-2 flex-shrink-0" onClick={() => descargarDoc(d)}>Descargar</Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Acciones del director */}
                    <div className="border-t border-border pt-4 space-y-3">
                      <Label className="font-body text-sm text-foreground">Observaciones / instrucciones al abogado</Label>
                      <Textarea
                        placeholder="Escribe correcciones o instrucciones..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                      />
                      <div className="flex gap-3 flex-wrap">
                        <Button onClick={() => aprobar(caso)} disabled={caso.etapa === "Radicado"} className="gradient-gold text-primary font-body font-semibold shadow-gold hover:opacity-90 border-0 gap-2">
                          <Check className="w-4 h-4" />
                          {caso.etapa === "Radicado" ? "En última etapa" : "Avanzar etapa"}
                        </Button>
                        <Button onClick={() => devolver(caso)} variant="outline" className="font-body gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                          <XCircle className="w-4 h-4" />
                          Devolver con correcciones
                        </Button>
                        <Button onClick={() => cerrarCaso(caso)} variant="outline" className="font-body gap-2 text-muted-foreground hover:text-foreground">
                          Cerrar caso
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

/* ── Asignación de Casos ── */
const SeccionAsignacion = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState<"nuevo" | "existentes">(() => {
    return (sessionStorage.getItem("asig_tab") as "nuevo" | "existentes") ?? "nuevo";
  });
  const [paso, setPaso] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("asig_paso") ?? "0", 10);
  });

  const handleSetTab = (t: "nuevo" | "existentes") => {
    sessionStorage.setItem("asig_tab", t);
    setTab(t);
  };
  const handleSetPaso = (fn: number | ((p: number) => number)) => {
    setPaso(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      sessionStorage.setItem("asig_paso", String(next));
      return next;
    });
  };
  const [submitting, setSubmitting] = useState(false);
  const [radicadoExiste, setRadicadoExiste] = useState(false);
  const [checkingRadicado, setCheckingRadicado] = useState(false);

  // Datos de selects
  const [abogados, setAbogados] = useState<{ id: string; full_name: string; area_id: string | null }[]>([]);
  const [clientes, setClientes] = useState<{ id: string; full_name: string; email: string; cedula: string | null }[]>([]);
  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>([]);
  const [tiposProceso, setTiposProceso] = useState<{ id: string; nombre: string; area_id: string | null }[]>([]);
  const [juzgados, setJuzgados] = useState<{ id: string; nombre: string; ciudad: string | null }[]>([]);

  // Casos existentes
  const [casosExistentes, setCasosExistentes] = useState<any[]>([]);
  const [editandoCaso, setEditandoCaso] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ abogado_id: string; urgente: boolean; fecha_vencimiento: string; observaciones: string }>({ abogado_id: "", urgente: false, fecha_vencimiento: "", observaciones: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  // Términos por etapa (días referenciales)
  const defaultTerminos = Object.fromEntries(etapas.map(e => [e, ""]));
  const [terminos, setTerminosRaw] = useState<Record<string, string>>(() => {
    try {
      const saved = sessionStorage.getItem("asig_terminos");
      return saved ? { ...defaultTerminos, ...JSON.parse(saved) } : defaultTerminos;
    } catch { return defaultTerminos; }
  });
  const setTerminos = (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    setTerminosRaw(prev => {
      const next = typeof val === "function" ? val(prev) : val;
      sessionStorage.setItem("asig_terminos", JSON.stringify(next));
      return next;
    });
  };

  // Form nuevo caso — persiste en sessionStorage
  const defaultForm = {
    radicado: "", tipo: "", area_nombre: "", tipo_proceso_nombre: "",
    cliente_id: "", cliente_nombre: "", cliente_externo: false,
    juzgado: "", abogado_id: "", observaciones: "", fecha_vencimiento: "", urgente: false,
  };
  const [form, setFormRaw] = useState<typeof defaultForm>(() => {
    try {
      const saved = sessionStorage.getItem("asig_form");
      return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm;
    } catch { return defaultForm; }
  });
  const setForm = (val: typeof defaultForm | ((prev: typeof defaultForm) => typeof defaultForm)) => {
    setFormRaw(prev => {
      const next = typeof val === "function" ? val(prev) : val;
      sessionStorage.setItem("asig_form", JSON.stringify(next));
      return next;
    });
  };

  const load = async () => {
    const [
      { data: roleAbogado }, { data: roleCliente },
      { data: aData }, { data: tData }, { data: jData }, { data: casData }
    ] = await Promise.all([
      supabase.from("user_roles").select("user_id").eq("role", "abogado"),
      supabase.from("user_roles").select("user_id").eq("role", "cliente"),
      supabase.from("areas_derecho").select("id, nombre").order("nombre"),
      supabase.from("tipos_proceso").select("id, nombre, area_id").order("nombre"),
      supabase.from("juzgados").select("id, nombre, ciudad").order("nombre"),
      supabase.from("cases").select("id, radicado, cliente_nombre, cliente_id, tipo, etapa, abogado_id, urgente, fecha_vencimiento, observaciones, created_at").neq("etapa", "Cerrado").order("created_at", { ascending: false }),
    ]);

    const abIds = (roleAbogado ?? []).map(r => r.user_id);
    const clIds = (roleCliente ?? []).map(r => r.user_id);

    const [{ data: abProfs }, { data: clProfs }] = await Promise.all([
      abIds.length > 0 ? supabase.from("profiles").select("id, full_name, area_id").in("id", abIds) : Promise.resolve({ data: [] }),
      clIds.length > 0 ? supabase.from("profiles").select("id, full_name, email, cedula").in("id", clIds) : Promise.resolve({ data: [] }),
    ]);

    setAbogados((abProfs ?? []) as any);
    setClientes((clProfs ?? []) as any);
    setAreas(aData ?? []);
    setTiposProceso(tData ?? []);
    setJuzgados(jData ?? []);
    setCasosExistentes(casData ?? []);
  };

  useEffect(() => { load(); }, []);

  // Validar radicado duplicado en tiempo real
  useEffect(() => {
    if (!form.radicado.trim()) { setRadicadoExiste(false); return; }
    const timer = setTimeout(async () => {
      setCheckingRadicado(true);
      const { data } = await supabase.from("cases").select("id").eq("radicado", form.radicado.trim()).maybeSingle();
      setRadicadoExiste(!!data);
      setCheckingRadicado(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.radicado]);

  const tiposFiltrados = form.area_nombre
    ? tiposProceso.filter(t => areas.find(a => a.id === t.area_id)?.nombre === form.area_nombre)
    : tiposProceso;

  // Siempre muestra todos los abogados; los que coinciden con el área van primero
  const abogadosFiltrados = form.area_nombre
    ? [
        ...abogados.filter(a => areas.find(ar => ar.id === a.area_id)?.nombre === form.area_nombre),
        ...abogados.filter(a => areas.find(ar => ar.id === a.area_id)?.nombre !== form.area_nombre),
      ]
    : abogados;

  const pasos = [
    { label: "Datos del caso" },
    { label: "Cliente" },
    { label: "Abogado" },
    { label: "Términos" },
    { label: "Observaciones" },
    { label: "Confirmar" },
  ];

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.radicado.trim() || !form.tipo.trim() || !form.cliente_nombre.trim()) {
      toast({ title: "Faltan datos", description: "Radicado, tipo y cliente son obligatorios", variant: "destructive" });
      setPaso(0); return;
    }
    if (radicadoExiste) {
      toast({ title: "Radicado duplicado", description: "Ya existe un caso con ese número", variant: "destructive" });
      setPaso(0); return;
    }
    if (!form.abogado_id) {
      toast({ title: "Sin abogado asignado", description: "¿Seguro? El caso quedará sin responsable hasta que lo asignes.", variant: "default" });
    }
    // Armar observaciones con los términos si se llenaron
    const terminosTexto = etapas
      .filter(et => terminos[et])
      .map(et => `${et}: ${terminos[et]} días`)
      .join(" | ");
    const obsCompleta = [
      terminosTexto ? `[Términos procesales] ${terminosTexto}` : "",
      form.observaciones.trim(),
    ].filter(Boolean).join("\n\n");

    setSubmitting(true);
    const { error } = await supabase.from("cases").insert({
      radicado: form.radicado.trim(),
      tipo: form.tipo.trim(),
      cliente_nombre: form.cliente_nombre.trim(),
      cliente_id: form.cliente_id || null,
      juzgado: form.juzgado || null,
      abogado_id: form.abogado_id || null,
      observaciones: obsCompleta || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
      urgente: form.urgente,
      created_by: user.id,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error al crear el caso", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Caso asignado", description: `Radicado ${form.radicado} creado correctamente.` });
    sessionStorage.removeItem("asig_form");
    sessionStorage.removeItem("asig_terminos");
    sessionStorage.removeItem("asig_paso");
    sessionStorage.removeItem("asig_tab");
    setFormRaw(defaultForm);
    setTerminosRaw(defaultTerminos);
    handleSetPaso(0);
    handleSetTab("existentes");
    load();
  };

  const guardarEdicion = async (casoId: string) => {
    setSavingEdit(true);
    const { error } = await supabase.from("cases").update({
      abogado_id: editForm.abogado_id || null,
      urgente: editForm.urgente,
      fecha_vencimiento: editForm.fecha_vencimiento || null,
      observaciones: editForm.observaciones || null,
    }).eq("id", casoId);
    setSavingEdit(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Caso actualizado" });
    setEditandoCaso(null);
    load();
  };

  const abogadosMap = Object.fromEntries(abogados.map(a => [a.id, a.full_name]));

  return (
    <>
      <SectionHeader title="Asignación de Casos" description="Crea nuevos casos o gestiona los existentes" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(["nuevo", "existentes"] as const).map(t => (
          <button type="button"
            key={t}
            onClick={() => handleSetTab(t)}
            className={`font-body text-sm px-4 py-2 border-b-2 transition-colors ${tab === t ? "border-accent text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "nuevo" ? "Nuevo caso" : `Casos activos (${casosExistentes.length})`}
          </button>
        ))}
      </div>

      {tab === "nuevo" && (
        <>
          {/* Stepper */}
          <div className="flex items-center gap-1 mb-8 flex-wrap">
            {pasos.map((p, i) => (
              <div key={i} className="flex items-center gap-1">
                <button type="button"
                  onClick={() => handleSetPaso(i)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-body ${i === paso ? "bg-accent/15 border border-accent/30 text-foreground font-medium" : i < paso ? "text-accent" : "text-muted-foreground"}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i === paso ? "bg-accent text-primary-foreground" : i < paso ? "bg-accent/30 text-accent" : "bg-muted-foreground/20 text-muted-foreground"}`}>
                    {i < paso ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{p.label}</span>
                </button>
                {i < pasos.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border p-6">

            {/* Paso 0: Datos del caso */}
            {paso === 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold">Datos del Caso</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Número de radicado *</Label>
                    <div className="relative">
                      <Input
                        value={form.radicado}
                        onChange={e => setForm({ ...form, radicado: e.target.value })}
                        placeholder="Ej: 2024-0960"
                        className={radicadoExiste ? "border-destructive" : ""}
                      />
                      {checkingRadicado && <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground">Verificando…</span>}
                    </div>
                    {radicadoExiste && <p className="text-xs text-destructive">⚠ Ya existe un caso con este radicado</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Área de derecho</Label>
                    <Select value={form.area_nombre} onValueChange={v => setForm({ ...form, area_nombre: v, tipo: "", tipo_proceso_nombre: "" })}>
                      <SelectTrigger><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                      <SelectContent>
                        {areas.map(a => <SelectItem key={a.id} value={a.nombre}>{a.nombre}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Tipo de proceso *</Label>
                    <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue placeholder={form.area_nombre ? "Selecciona un tipo" : "Elige primero un área"} /></SelectTrigger>
                      <SelectContent>
                        {tiposFiltrados.map(t => <SelectItem key={t.id} value={t.nombre}>{t.nombre}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Juzgado</Label>
                    <Select value={form.juzgado} onValueChange={v => setForm({ ...form, juzgado: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecciona un juzgado" /></SelectTrigger>
                      <SelectContent>
                        {juzgados.map(j => <SelectItem key={j.id} value={`${j.nombre}${j.ciudad ? ` (${j.ciudad})` : ""}`}>{j.nombre}{j.ciudad ? ` · ${j.ciudad}` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Fecha de vencimiento</Label>
                    <Input
                      type="date"
                      value={form.fecha_vencimiento}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
                      className={form.fecha_vencimiento && form.fecha_vencimiento < new Date().toISOString().split("T")[0] ? "border-destructive" : ""}
                    />
                    {form.fecha_vencimiento && form.fecha_vencimiento < new Date().toISOString().split("T")[0] && (
                      <p className="text-xs text-destructive">⚠ La fecha de vencimiento ya pasó</p>
                    )}
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.urgente} onChange={e => setForm({ ...form, urgente: e.target.checked })} className="w-4 h-4" />
                      <span className="font-body text-sm">Marcar como urgente</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 1: Cliente */}
            {paso === 1 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold">Vincular Cliente</h3>
                <div className="flex gap-3 mb-4">
                  <button type="button"
                    onClick={() => setForm({ ...form, cliente_externo: false, cliente_id: "", cliente_nombre: "" })}
                    className={`flex-1 p-3 rounded-xl border text-sm font-body transition-colors ${!form.cliente_externo ? "border-accent bg-accent/5 text-foreground" : "border-border text-muted-foreground hover:border-accent/30"}`}
                  >
                    Cliente registrado en el sistema
                  </button>
                  <button type="button"
                    onClick={() => setForm({ ...form, cliente_externo: true, cliente_id: "", cliente_nombre: "" })}
                    className={`flex-1 p-3 rounded-xl border text-sm font-body transition-colors ${form.cliente_externo ? "border-accent bg-accent/5 text-foreground" : "border-border text-muted-foreground hover:border-accent/30"}`}
                  >
                    Cliente externo (sin cuenta)
                  </button>
                </div>

                {!form.cliente_externo ? (
                  clientes.length === 0 ? (
                    <div className="bg-muted/40 rounded-lg p-4 text-center">
                      <p className="font-body text-sm text-muted-foreground">No hay clientes registrados aún.</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">Crea uno desde "Gestión de Usuarios" para que pueda ver su caso.</p>
                    </div>
                  ) : (
                    <div className="grid gap-2 max-h-72 overflow-auto">
                      {clientes.map(cl => (
                        <button type="button"
                          key={cl.id}
                          onClick={() => setForm({ ...form, cliente_id: cl.id, cliente_nombre: cl.full_name })}
                          className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center gap-3 ${form.cliente_id === cl.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
                        >
                          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-body text-sm font-medium text-foreground truncate">{cl.full_name}</p>
                            <p className="font-body text-xs text-muted-foreground truncate">{cl.email}{cl.cedula ? ` · CC ${cl.cedula}` : ""}</p>
                          </div>
                          {form.cliente_id === cl.id && <Check className="w-4 h-4 text-accent ml-auto flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <Label className="font-body text-sm">Nombre del cliente *</Label>
                    <Input value={form.cliente_nombre} onChange={e => setForm({ ...form, cliente_nombre: e.target.value })} placeholder="Nombre completo del cliente" />
                    <p className="font-body text-xs text-muted-foreground">Este cliente no podrá ver su caso en el portal digital.</p>
                  </div>
                )}
              </div>
            )}

            {/* Paso 2: Abogado */}
            {paso === 2 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold">Asignar Abogado</h3>
                {form.area_nombre && (
                  <p className="font-body text-xs text-muted-foreground">
                    Mostrando abogados de <b>{form.area_nombre}</b>.
                    {abogadosFiltrados.length === 0 && " Ninguno tiene esa área asignada."}
                  </p>
                )}
                {abogados.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No hay abogados registrados. Crea uno desde "Gestión de Usuarios".</p>
                ) : (
                  <>
                    <div className="grid gap-2">
                      {abogadosFiltrados.map(ab => {
                        const abArea = areas.find(a => a.id === ab.area_id)?.nombre;
                        const esRecomendado = form.area_nombre && abArea === form.area_nombre;
                        const seleccionado = form.abogado_id === ab.id;
                        return (
                          <button type="button"
                            key={ab.id}
                            onClick={() => setForm({ ...form, abogado_id: ab.id })}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${seleccionado ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-accent/40 hover:bg-muted/20"}`}
                          >
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-base ${seleccionado ? "bg-accent text-primary-foreground" : "gradient-navy text-accent"}`}>
                              {ab.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-display text-base font-semibold text-foreground">{ab.full_name}</p>
                                {esRecomendado && (
                                  <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">Recomendado</span>
                                )}
                              </div>
                              <p className="font-body text-xs text-muted-foreground mt-0.5">
                                {abArea ? `Especialidad: ${abArea}` : "Sin área asignada"}
                              </p>
                            </div>
                            {seleccionado && <Check className="w-5 h-5 text-accent flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {!form.abogado_id && (
                      <p className="font-body text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        ⚠ Sin abogado asignado el caso quedará sin responsable.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Paso 3: Términos procesales */}
            {paso === 3 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold">Términos Procesales</h3>
                <p className="font-body text-xs text-muted-foreground">Plazos estimados por etapa para este caso (se guardan en las observaciones del caso).</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {etapas.filter(et => et !== "Cerrado").map(et => (
                    <div key={et} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <span className="font-body text-sm text-foreground">{et}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="—"
                          value={terminos[et] ?? ""}
                          onChange={e => setTerminos(prev => ({ ...prev, [et]: e.target.value }))}
                          className="w-20 h-8 text-center text-sm"
                        />
                        <span className="font-body text-xs text-muted-foreground">días</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 4: Observaciones */}
            {paso === 4 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold">Observaciones Iniciales</h3>
                <Textarea
                  value={form.observaciones}
                  onChange={e => setForm({ ...form, observaciones: e.target.value })}
                  placeholder="Instrucciones al abogado, documentos requeridos, notas importantes..."
                  rows={6}
                />
              </div>
            )}

            {/* Paso 5: Confirmar */}
            {paso === 5 && (
              <div className="space-y-5">
                <div className="flex flex-col items-center text-center mb-2">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Check className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">Confirmar Asignación</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 bg-muted/30 p-4 rounded-xl">
                  {[
                    ["Radicado", form.radicado || "—"],
                    ["Tipo", form.tipo || "—"],
                    ["Área", form.area_nombre || "—"],
                    ["Juzgado", form.juzgado || "—"],
                    ["Cliente", form.cliente_nombre || "—"],
                    ["Vinculado al sistema", form.cliente_id ? "Sí ✓" : "No (externo)"],
                    ["Abogado", abogadosMap[form.abogado_id] || "⚠ Sin asignar"],
                    ["Vencimiento", form.fecha_vencimiento || "—"],
                    ["Urgente", form.urgente ? "Sí " : "No"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{k}</p>
                      <p className="font-body text-sm text-foreground">{v}</p>
                    </div>
                  ))}
                </div>
                {etapas.filter(et => terminos[et] && et !== "Cerrado").length > 0 && (
                  <div className="bg-muted/20 rounded-lg p-3">
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Términos</p>
                    <div className="flex flex-wrap gap-2">
                      {etapas.filter(et => terminos[et]).map(et => (
                        <span key={et} className="font-body text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">{et}: {terminos[et]}d</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-center">
                  <Button type="button" onClick={handleSubmit} disabled={submitting || radicadoExiste} className="gradient-gold text-primary font-body font-semibold shadow-gold hover:opacity-90 border-0 px-8">
                    {submitting ? "Creando…" : "Crear y Asignar Caso"}
                  </Button>
                </div>
              </div>
            )}

            {/* Navegación */}
            {paso < 5 && (
              <div className="flex justify-between mt-6 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSetPaso(p => Math.max(0, p - 1)); }} disabled={paso === 0}>Anterior</Button>
                <Button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSetPaso(p => Math.min(5, p + 1)); }} className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold hover:opacity-90">Siguiente</Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Casos existentes */}
      {tab === "existentes" && (
        <div className="grid gap-3">
          {casosExistentes.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-10 text-center">
              <p className="font-body text-sm text-muted-foreground">No hay casos activos.</p>
            </div>
          ) : casosExistentes.map(caso => {
            const esEditando = editandoCaso === caso.id;
            return (
              <div key={caso.id} className={`bg-card rounded-xl border overflow-hidden ${caso.urgente ? "border-destructive/30" : "border-border"}`}>
                <button type="button"
                  onClick={() => {
                    if (esEditando) { setEditandoCaso(null); return; }
                    setEditandoCaso(caso.id);
                    setEditForm({ abogado_id: caso.abogado_id ?? "", urgente: caso.urgente, fecha_vencimiento: caso.fecha_vencimiento ?? "", observaciones: caso.observaciones ?? "" });
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${caso.urgente ? "bg-destructive/10" : "gradient-navy"}`}>
                      <FileText className={`w-4 h-4 ${caso.urgente ? "text-destructive" : "text-accent"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-sm font-semibold text-foreground">#{caso.radicado}</p>
                        {caso.urgente && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-body">URGENTE</span>}
                      </div>
                      <p className="font-body text-xs text-muted-foreground">{caso.cliente_nombre} · {abogadosMap[caso.abogado_id] ?? "Sin abogado"} · {caso.tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-body px-2.5 py-1 rounded-full bg-accent/10 text-accent">{caso.etapa}</span>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${esEditando ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {esEditando && (
                  <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-body text-sm">Reasignar abogado</Label>
                        <Select value={editForm.abogado_id} onValueChange={v => setEditForm({ ...editForm, abogado_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar abogado" /></SelectTrigger>
                          <SelectContent>
                            {abogados.map(a => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-sm">Fecha de vencimiento</Label>
                        <Input type="date" value={editForm.fecha_vencimiento} onChange={e => setEditForm({ ...editForm, fecha_vencimiento: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label className="font-body text-sm">Observaciones</Label>
                        <Textarea value={editForm.observaciones} onChange={e => setEditForm({ ...editForm, observaciones: e.target.value })} rows={3} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={editForm.urgente} onChange={e => setEditForm({ ...editForm, urgente: e.target.checked })} className="w-4 h-4" />
                        <Label className="font-body text-sm cursor-pointer">Urgente</Label>
                      </div>
                    </div>
                    <Button type="button" onClick={() => guardarEdicion(caso.id)} disabled={savingEdit} className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold hover:opacity-90">
                      {savingEdit ? "Guardando…" : "Guardar cambios"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

/* ── Control de Términos (Jefe sets limits) ── */
const SeccionTerminosJefe = () => {
  const { toast } = useToast();
  const [areas, setAreas] = useState<string[]>([]);
  const [terminos, setTerminos] = useState<Record<string, Record<string, { id: string; dias: number; descripcion: string }>>>({});
  const [areaActiva, setAreaActiva] = useState<string>("");
  const [editando, setEditando] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [abogadosMap, setAbogadosMap] = useState<Record<string, string>>({});
  const [limiteDias, setLimiteDias] = useState(7);
  const [tab, setTab] = useState<"plazos" | "alertas">("plazos");

  const load = async () => {
    setLoading(true);
    const [{ data: tData }, { data: cases }, { data: acts }, { data: profs }] = await Promise.all([
      supabase.from("terminos_procesales").select("id, area, etapa, dias_plazo, descripcion").order("area").order("etapa"),
      supabase.from("cases").select("id, radicado, cliente_nombre, etapa, abogado_id, tipo, urgente, created_at").neq("etapa", "Cerrado"),
      supabase.from("actuaciones").select("case_id, created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
    ]);

    // Build terminos map
    const map: typeof terminos = {};
    const areasSet = new Set<string>();
    (tData ?? []).forEach((t: any) => {
      if (!map[t.area]) map[t.area] = {};
      map[t.area][t.etapa] = { id: t.id, dias: t.dias_plazo, descripcion: t.descripcion ?? "" };
      areasSet.add(t.area);
    });
    const areasArr = Array.from(areasSet).sort();
    setTerminos(map);
    setAreas(areasArr);
    if (!areaActiva && areasArr.length > 0) setAreaActiva(areasArr[0]);

    // Build alertas
    const pm: Record<string, string> = {};
    (profs ?? []).forEach((p: any) => { pm[p.id] = p.full_name; });
    setAbogadosMap(pm);

    const ultimaActMap: Record<string, string> = {};
    (acts ?? []).forEach((a: any) => { if (!ultimaActMap[a.case_id]) ultimaActMap[a.case_id] = a.created_at; });

    const hoy = new Date();
    const rows = (cases ?? []).map((c: any) => {
      // Get plazo for this case's area and etapa
      const areaCaso = c.tipo ? Object.keys(map).find(a => c.tipo?.toLowerCase().includes(a.toLowerCase())) ?? "" : "";
      const plazo = map[areaCaso]?.[c.etapa]?.dias ?? limiteDias;
      const referencia = ultimaActMap[c.id] ?? c.created_at;
      const diasSinMov = Math.floor((hoy.getTime() - new Date(referencia).getTime()) / 86400000);
      return { ...c, diasSinMov, plazo, ultimaAct: referencia, areaCaso };
    }).filter((c: any) => c.diasSinMov >= c.plazo)
      .sort((a: any, b: any) => (b.diasSinMov - b.plazo) - (a.diasSinMov - a.plazo));

    setAlertas(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, [limiteDias]);

  const guardarCambios = async () => {
    if (!areaActiva) return;
    setSaving(true);
    const updates = Object.entries(editando).map(([etapa, dias]) => {
      const t = terminos[areaActiva]?.[etapa];
      if (!t) return null;
      return supabase.from("terminos_procesales").update({ dias_plazo: dias, updated_at: new Date().toISOString() }).eq("id", t.id);
    }).filter(Boolean);

    const results = await Promise.all(updates as any[]);
    const errored = results.find(r => r.error);
    if (errored?.error) {
      toast({ title: "Error al guardar", description: errored.error.message, variant: "destructive" });
    } else {
      toast({ title: "Plazos actualizados", description: `Los plazos de ${areaActiva} fueron guardados.` });
      setEditando({});
      load();
    }
    setSaving(false);
  };

  const notificarAbogado = async (caso: any) => {
    if (!caso.abogado_id) {
      toast({ title: "Sin abogado", description: "Este caso no tiene abogado asignado.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("notificaciones").insert({
      user_id: caso.abogado_id,
      case_id: caso.id,
      tipo: "termino_vencido",
      titulo: "Plazo procesal vencido",
      mensaje: `El caso #${caso.radicado} lleva ${caso.diasSinMov} días en la etapa "${caso.etapa}" (plazo: ${caso.plazo} días). El director solicita una actualización.`,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Notificación enviada", description: `Se alertó al abogado sobre el caso #${caso.radicado}.` });
  };

  const hayEdiciones = Object.keys(editando).length > 0;

  const getBadge = (diasSinMov: number, plazo: number) => {
    const exceso = diasSinMov - plazo;
    if (exceso >= 15) return "bg-red-100 text-red-700";
    if (exceso >= 7)  return "bg-amber-100 text-amber-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getBorder = (diasSinMov: number, plazo: number) => {
    const exceso = diasSinMov - plazo;
    if (exceso >= 15) return "border-destructive/30 bg-red-50/30";
    if (exceso >= 7)  return "border-amber-400/30 bg-amber-50/30";
    return "border-yellow-300/30 bg-yellow-50/30";
  };

  return (
    <>
      <SectionHeader
        title="Control de Términos"
        description="Plazos procesales por área y etapa — configura los tiempos y detecta casos vencidos"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {([
          { id: "plazos", label: "Plazos por área" },
          { id: "alertas", label: `Casos vencidos${alertas.length > 0 ? ` (${alertas.length})` : ""}` },
        ] as const).map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`font-body text-sm px-4 py-2 border-b-2 transition-colors ${tab === t.id ? "border-accent text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando plazos…</p>
      ) : tab === "plazos" ? (
        <>
          {/* Selector de área */}
          <div className="flex gap-2 flex-wrap mb-6">
            {areas.map(a => (
              <button key={a} type="button" onClick={() => { setAreaActiva(a); setEditando({}); }}
                className={`font-body text-xs px-4 py-2 rounded-full border transition-colors ${areaActiva === a ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                {a}
              </button>
            ))}
          </div>

          {areaActiva && terminos[areaActiva] && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-display text-base font-semibold text-foreground">{areaActiva}</p>
                  <p className="font-body text-xs text-muted-foreground">Plazos en días hábiles por etapa del proceso</p>
                </div>
                {hayEdiciones && (
                  <Button type="button" onClick={guardarCambios} disabled={saving}
                    className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold hover:opacity-90">
                    {saving ? "Guardando…" : "Guardar cambios"}
                  </Button>
                )}
              </div>

              <div className="divide-y divide-border">
              {etapas.filter(et => et !== "Cerrado" && et !== "Radicado").map(etapa => {
                  const t = terminos[areaActiva]?.[etapa];
                  if (!t) return null;
                  const diasActual = editando[etapa] ?? t.dias;
                  const modificado = editando[etapa] !== undefined && editando[etapa] !== t.dias;
                  return (
                    <div key={etapa} className={`flex items-center gap-4 px-5 py-4 transition-colors ${modificado ? "bg-accent/5" : "hover:bg-muted/20"}`}>
                      {/* Etapa */}
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-foreground">{etapa}</p>
                        {t.descripcion && <p className="font-body text-xs text-muted-foreground mt-0.5">{t.descripcion}</p>}
                      </div>
                      {/* Input días */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button type="button"
                          onClick={() => setEditando(prev => ({ ...prev, [etapa]: Math.max(1, (prev[etapa] ?? t.dias) - 1) }))}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold">
                          −
                        </button>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={diasActual}
                          onChange={e => setEditando(prev => ({ ...prev, [etapa]: parseInt(e.target.value) || 1 }))}
                          className={`w-16 text-center font-display font-bold ${modificado ? "border-accent text-accent" : ""}`}
                        />
                        <button type="button"
                          onClick={() => setEditando(prev => ({ ...prev, [etapa]: (prev[etapa] ?? t.dias) + 1 }))}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold">
                          +
                        </button>
                        <span className="font-body text-xs text-muted-foreground w-8">días</span>
                        {modificado && (
                          <button type="button" onClick={() => setEditando(prev => { const n = { ...prev }; delete n[etapa]; return n; })}
                            className="font-body text-[10px] text-muted-foreground hover:text-destructive transition-colors ml-1">
                            Deshacer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Tab Alertas */}
          <div className="flex items-center gap-4 mb-5 p-4 bg-card rounded-xl border border-border">
            <Clock className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1">
              <p className="font-body text-sm font-medium text-foreground">Umbral mínimo de alerta</p>
              <p className="font-body text-xs text-muted-foreground">Mostrar casos que superen por al menos X días su plazo establecido</p>
            </div>
            <div className="flex items-center gap-2">
              <Input type="number" min="0" max="30" value={limiteDias}
                onChange={e => setLimiteDias(parseInt(e.target.value) || 0)}
                className="w-16 text-center" />
              <span className="font-body text-xs text-muted-foreground">días extra</span>
            </div>
          </div>

          {alertas.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="font-display text-base font-semibold text-foreground">Todo en orden</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Ningún caso ha excedido su plazo procesal.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {alertas.map((caso: any) => (
                <div key={caso.id} className={`rounded-xl border p-4 flex items-center gap-4 ${getBorder(caso.diasSinMov, caso.plazo)}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-display text-sm font-semibold text-foreground">#{caso.radicado}</p>
                      {caso.urgente && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-body">URGENTE</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-body font-medium ${getBadge(caso.diasSinMov, caso.plazo)}`}>
                        {caso.diasSinMov - caso.plazo} días sobre el plazo
                      </span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{caso.cliente_nombre} · {caso.tipo}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="font-body text-[10px] text-muted-foreground">
                        Etapa: <span className="font-medium text-foreground">{caso.etapa}</span>
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground">
                        Plazo: <span className="font-medium text-foreground">{caso.plazo} días</span>
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground">
                        Sin movimiento: <span className="font-medium text-foreground">{caso.diasSinMov} días</span>
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground">
                        Abogado: <span className="font-medium text-foreground">{abogadosMap[caso.abogado_id] ?? "Sin asignar"}</span>
                      </span>
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="outline"
                    className="flex-shrink-0 font-body text-xs gap-1.5"
                    onClick={() => notificarAbogado(caso)}
                    disabled={!caso.abogado_id}>
                    <Bell className="w-3 h-3" />
                    Notificar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};


/* ── Gestión de Abogados ── */
interface AbogadoRow {
  id: string;
  full_name: string;
  email: string;
  area_id: string | null;
  area_nombre?: string | null;
  phone: string | null;
  last_sign_in_at: string | null;
  sign_in_count: number | null;
}

const SeccionAbogados = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [director, setDirector] = useState<{ full_name: string; email: string; phone: string | null; last_sign_in_at: string | null; sign_in_count: number | null } | null>(null);
  const [editingDirector, setEditingDirector] = useState(false);
  const [dirForm, setDirForm] = useState({ full_name: "", phone: "", cedula: "" });
  const [savingDir, setSavingDir] = useState(false);
  const [abogados, setAbogados] = useState<AbogadoRow[]>([]);
  const [clientes, setClientes] = useState<AbogadoRow[]>([]);
  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createRole, setCreateRole] = useState<"abogado" | "cliente">("abogado");
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", phone: "", cedula: "", area_id: "",
  });

  const load = async () => {
    setLoading(true);

    // Cargar perfil del director
    if (user) {
      const { data: dirData } = await supabase
        .from("profiles")
        .select("full_name, email, phone, cedula, last_sign_in_at, sign_in_count")
        .eq("id", user.id)
        .maybeSingle();
      if (dirData) {
        setDirector(dirData as any);
        setDirForm({ full_name: dirData.full_name ?? "", phone: (dirData as any).phone ?? "", cedula: (dirData as any).cedula ?? "" });
      } else {
        // El perfil del director no existe aún — crearlo
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? "",
          full_name: user.user_metadata?.full_name ?? "Director",
          phone: null,
          cedula: null,
        }, { onConflict: "id" });
        await supabase.from("user_roles").upsert({ user_id: user.id, role: "jefe" }, { onConflict: "user_id,role" });
        setDirector({ full_name: user.user_metadata?.full_name ?? "Director", email: user.email ?? "", phone: null, last_sign_in_at: null, sign_in_count: null });
        setDirForm({ full_name: user.user_metadata?.full_name ?? "Director", phone: "", cedula: "" });
      }
    }

    const [{ data: roleRows }, { data: aData }] = await Promise.all([
      supabase.from("user_roles").select("user_id, role").in("role", ["abogado", "cliente"]),
      supabase.from("areas_derecho").select("id, nombre").order("nombre"),
    ]);
    setAreas(aData ?? []);
    const ids = (roleRows ?? []).map((r) => r.user_id);
    if (ids.length === 0) { setAbogados([]); setClientes([]); setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, area_id, phone, last_sign_in_at, sign_in_count")
      .in("id", ids);
    const areaMap = new Map((aData ?? []).map((a) => [a.id, a.nombre]));
    const profMap = new Map(
      (data ?? []).map((p) => [p.id, { ...p, area_nombre: p.area_id ? areaMap.get(p.area_id) ?? null : null }]),
    );
    const abos: AbogadoRow[] = [];
    const clis: AbogadoRow[] = [];
    for (const r of roleRows ?? []) {
      const p = profMap.get(r.user_id);
      if (!p) continue;
      if (r.role === "abogado") abos.push(p as AbogadoRow);
      else if (r.role === "cliente") clis.push(p as AbogadoRow);
    }
    setAbogados(abos);
    setClientes(clis);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const saveDirector = async () => {
    if (!user) return;
    setSavingDir(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: dirForm.full_name.trim(),
      phone: dirForm.phone.trim() || null,
      cedula: dirForm.cedula.trim() || null,
    }, { onConflict: "id" });
    setSavingDir(false);
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Perfil actualizado", description: "Los datos del director fueron guardados." });
    setEditingDirector(false);
    load();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast({ title: "Error", description: "Contraseña mínima de 8 caracteres", variant: "destructive" });
      return;
    }
    if (createRole === "abogado" && !form.area_id) {
      toast({ title: "Falta área", description: "Selecciona el área de derecho del abogado", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = {
      full_name: form.full_name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      cedula: form.cedula,
      area_id: createRole === "abogado" ? form.area_id : null,
      role: createRole,
    };
    const { data, error } = await supabase.functions.invoke("create-abogado", { body: payload });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast({
        title: "No se pudo crear",
        description: (data as any)?.error ?? error?.message ?? "Error desconocido",
        variant: "destructive",
      });
      return;
    }
    const label = createRole === "cliente" ? "Cliente" : "Abogado";
    toast({ title: `${label} creado`, description: `${form.full_name} ya puede iniciar sesión.` });
    setForm({ full_name: "", email: "", password: "", phone: "", cedula: "", area_id: "" });
    setShowForm(false);
    load();
  };

  return (
    <>
      <SectionHeader title="Gestión de Usuarios" description="Crea cuentas de abogados y clientes, y supervisa el equipo" />

      {/* Tarjeta del Director */}
      <div className="bg-card rounded-xl border border-accent/30 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-navy flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">
                {director?.full_name || "Director"}
                <span className="ml-2 text-[10px] font-body px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Director</span>
              </p>
              <p className="font-body text-xs text-muted-foreground">{director?.email}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="font-body text-xs" onClick={() => setEditingDirector(!editingDirector)}>
            {editingDirector ? "Cancelar" : "Editar perfil"}
          </Button>
        </div>

        {!editingDirector ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Teléfono</p>
              <p className="font-body text-xs text-foreground">{director?.phone || "—"}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Último acceso</p>
              <p className="font-body text-xs text-foreground">
                {director?.last_sign_in_at
                  ? new Date(director.last_sign_in_at).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
                  : "—"}
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Inicios de sesión</p>
              <p className="font-body text-xs text-foreground">{director?.sign_in_count ?? 0}</p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3 mt-2">
            <div className="space-y-1.5">
              <Label className="font-body text-xs">Nombre completo</Label>
              <Input value={dirForm.full_name} onChange={(e) => setDirForm({ ...dirForm, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-body text-xs">Teléfono</Label>
              <Input value={dirForm.phone} onChange={(e) => setDirForm({ ...dirForm, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-body text-xs">Cédula</Label>
              <Input value={dirForm.cedula} onChange={(e) => setDirForm({ ...dirForm, cedula: e.target.value })} />
            </div>
            <div className="sm:col-span-3">
              <Button onClick={saveDirector} disabled={savingDir} className="gradient-gold text-primary border-0 font-body text-sm">
                {savingDir ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-5 flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="gradient-gold text-primary border-0">
          {showForm ? "Cancelar" : "+ Nueva cuenta"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground">Crear nueva cuenta</h3>

          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setCreateRole("abogado")}
              className={`px-4 py-1.5 rounded-md text-sm font-body transition-colors ${
                createRole === "abogado" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Abogado
            </button>
            <button
              type="button"
              onClick={() => setCreateRole("cliente")}
              className={`px-4 py-1.5 rounded-md text-sm font-body transition-colors ${
                createRole === "cliente" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Cliente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre completo *</Label>
              <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contraseña inicial *</Label>
              <Input type="text" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mín. 8 caracteres" />
            </div>
            {createRole === "abogado" && (
              <div className="space-y-1.5">
                <Label>Área de derecho *</Label>
                <Select value={form.area_id} onValueChange={(v) => setForm({ ...form, area_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cédula</Label>
              <Input value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            La persona podrá cambiar esta contraseña desde su panel después de iniciar sesión.
          </p>
          <Button type="submit" disabled={submitting} className="gradient-gold text-primary border-0">
            {submitting ? "Creando…" : `Crear ${createRole === "cliente" ? "Cliente" : "Abogado"}`}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground mb-3">Abogados ({abogados.length})</h3>
            {abogados.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">Aún no hay abogados registrados.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {abogados.map((ab) => (
                  <div key={ab.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground">{ab.full_name}</p>
                      <p className="font-body text-xs text-muted-foreground">{ab.area_nombre ?? "Sin área"} · {ab.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-[11px] text-muted-foreground">
                        {ab.last_sign_in_at
                          ? `Último acceso: ${new Date(ab.last_sign_in_at).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`
                          : "Aún no ha iniciado sesión"}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground/70">
                        Inicios: {ab.sign_in_count ?? 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-foreground mb-3">Clientes ({clientes.length})</h3>
            {clientes.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <p className="font-body text-sm text-muted-foreground">Aún no hay clientes registrados.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {clientes.map((c) => (
                  <div key={c.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground">{c.full_name}</p>
                      <p className="font-body text-xs text-muted-foreground">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground text-right">
                      {c.last_sign_in_at
                        ? `Último acceso: ${new Date(c.last_sign_in_at).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`
                        : "Aún no ha iniciado sesión"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const SeccionCalendarioJefe = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [eventos, setEventos] = useState<any[]>([]);
  const [abogadosMap, setAbogadosMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");

  // Estado formulario audiencia
  const [showFormAud, setShowFormAud] = useState(false);
  const [savingAud, setSavingAud] = useState(false);
  const [editAudId, setEditAudId] = useState<string | null>(null);
  const [casesAll, setCasesAll] = useState<any[]>([]);
  const [abogadosList, setAbogadosList] = useState<any[]>([]);
  const [clientesMap, setClientesMap] = useState<Record<string, { nombre: string; email: string; telefono: string }>>({});
  const [formAud, setFormAud] = useState({
    case_id: "", titulo: "", tipo: "", fecha_inicio: "", fecha_fin: "",
    modalidad: "presencial", enlace_virtual: "", ubicacion: "", notas: "",
  });

  // Info del caso/cliente seleccionado
  const casoSeleccionado = casesAll.find(c => c.id === formAud.case_id);
  const clienteInfo = casoSeleccionado ? clientesMap[casoSeleccionado.cliente_id] : null;

  const resetFormAud = () => {
    setFormAud({ case_id: "", titulo: "", tipo: "", fecha_inicio: "", fecha_fin: "", modalidad: "presencial", enlace_virtual: "", ubicacion: "", notas: "" });
    setEditAudId(null);
    setShowFormAud(false);
  };

  const load = async () => {
    setLoading(true);
    const [{ data: auds }, { data: acts }, { data: cases }, { data: profs }, { data: roleAbogado }, { data: clProfiles }] = await Promise.all([
      supabase.from("audiencias").select("id, case_id, titulo, tipo, fecha_inicio, fecha_fin, modalidad, ubicacion, enlace_virtual, notas"),
      supabase.from("actuaciones").select("id, case_id, tipo, descripcion, vence_at, cumplida").eq("cumplida", false).not("vence_at", "is", null),
      supabase.from("cases").select("id, radicado, cliente_nombre, cliente_id, abogado_id, fecha_vencimiento, etapa, tipo").neq("etapa", "Cerrado"),
      supabase.from("profiles").select("id, full_name, phone, email"),
      supabase.from("user_roles").select("user_id").eq("role", "abogado"),
      supabase.from("profiles").select("id, full_name, email, phone"),
    ]);

    const pm: Record<string, string> = {};
    (profs ?? []).forEach((p: any) => { pm[p.id] = p.full_name; });
    setAbogadosMap(pm);

    // Mapa de clientes
    const cm: Record<string, { nombre: string; email: string; telefono: string }> = {};
    (clProfiles ?? []).forEach((p: any) => { cm[p.id] = { nombre: p.full_name, email: p.email ?? "", telefono: p.phone ?? "" }; });
    setClientesMap(cm);

    // Abogados
    const abIds = (roleAbogado ?? []).map((r: any) => r.user_id);
    setAbogadosList((profs ?? []).filter((p: any) => abIds.includes(p.id)));

    setCasesAll(cases ?? []);

    const casosMap: Record<string, any> = {};
    (cases ?? []).forEach((c: any) => { casosMap[c.id] = c; });

    const evs: any[] = [];

    (auds ?? []).forEach((a: any) => {
      const caso = casosMap[a.case_id];
      if (!caso) return;
      evs.push({
        id: "aud-" + a.id,
        audId: a.id,
        fecha: a.fecha_inicio.split("T")[0],
        hora: new Date(a.fecha_inicio).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }),
        horaFin: a.fecha_fin ? new Date(a.fecha_fin).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }) : null,
        titulo: a.titulo,
        tipoAud: a.tipo,
        tipo: "audiencia",
        radicado: caso.radicado,
        tipoCaso: caso.tipo,
        cliente: caso.cliente_nombre,
        clienteId: caso.cliente_id,
        abogado_id: caso.abogado_id,
        modalidad: a.modalidad,
        enlace: a.enlace_virtual,
        ubicacion: a.ubicacion,
        notas: a.notas,
        rawAud: a,
        rawCaso: caso,
      });
    });

    (acts ?? []).forEach((a: any) => {
      const caso = casosMap[a.case_id];
      if (!caso || !a.vence_at) return;
      const tl = (a.tipo ?? "").toLowerCase();
      const esEntrega = tl.includes("entrega") || tl.includes("document") || tl.includes("oficio") || tl.includes("memorial");
      evs.push({
        id: "act-" + a.id,
        fecha: a.vence_at,
        hora: "23:59",
        titulo: a.tipo,
        subtitulo: a.descripcion,
        tipo: esEntrega ? "documento" : "termino",
        radicado: caso.radicado,
        tipoCaso: caso.tipo,
        cliente: caso.cliente_nombre,
        abogado_id: caso.abogado_id,
      });
    });

    (cases ?? []).forEach((c: any) => {
      if (!c.fecha_vencimiento) return;
      evs.push({
        id: "vc-" + c.id,
        fecha: c.fecha_vencimiento,
        hora: "23:59",
        titulo: "Vencimiento del caso",
        tipo: "vencimiento",
        radicado: c.radicado,
        tipoCaso: c.tipo,
        cliente: c.cliente_nombre,
        abogado_id: c.abogado_id,
      });
    });

    evs.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
    setEventos(evs);
    setLoading(false);
  };

  const guardarAudiencia = async () => {
    if (!formAud.case_id || !formAud.titulo || !formAud.fecha_inicio || !user) {
      toast({ title: "Faltan datos", description: "Caso, título y fecha de inicio son obligatorios.", variant: "destructive" });
      return;
    }
    setSavingAud(true);
    const payload: any = {
      case_id: formAud.case_id,
      titulo: formAud.titulo,
      tipo: formAud.tipo || null,
      fecha_inicio: formAud.fecha_inicio,
      fecha_fin: formAud.fecha_fin || null,
      modalidad: formAud.modalidad,
      enlace_virtual: formAud.enlace_virtual || null,
      ubicacion: formAud.ubicacion || null,
      notas: formAud.notas || null,
      created_by: user.id,
    };
    let error;
    if (editAudId) {
      ({ error } = await supabase.from("audiencias").update(payload).eq("id", editAudId));
    } else {
      ({ error } = await supabase.from("audiencias").insert(payload));
    }
    setSavingAud(false);
    if (error) { toast({ title: "Error al guardar", description: error.message, variant: "destructive" }); return; }
    toast({ title: editAudId ? "Audiencia actualizada" : "Audiencia creada" });
    resetFormAud();
    load();
  };

  const eliminarAudiencia = async (audId: string) => {
    if (!confirm("¿Eliminar esta audiencia?")) return;
    const { error } = await supabase.from("audiencias").delete().eq("id", audId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Audiencia eliminada" });
    load();
  };

  const editarAudiencia = (ev: any) => {
    const a = ev.rawAud;
    setFormAud({
      case_id: a.case_id ?? "",
      titulo: a.titulo ?? "",
      tipo: a.tipo ?? "",
      fecha_inicio: a.fecha_inicio ? a.fecha_inicio.slice(0, 16) : "",
      fecha_fin: a.fecha_fin ? a.fecha_fin.slice(0, 16) : "",
      modalidad: a.modalidad ?? "presencial",
      enlace_virtual: a.enlace_virtual ?? "",
      ubicacion: a.ubicacion ?? "",
      notas: a.notas ?? "",
    });
    setEditAudId(a.id);
    setShowFormAud(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => { load(); }, []);

  const hoy = new Date().toISOString().split("T")[0];
  const { year, month } = mesActual;
  const primerDia = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const nombreMes = new Date(year, month, 1).toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  const eventosFiltrados = filtro === "todos" ? eventos : eventos.filter(e => e.tipo === filtro);
  const eventosDelDia = (dia: number) => {
    const f = `${year}-${String(month+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
    return eventosFiltrados.filter(e => e.fecha === f);
  };
  const eventosDiaSel = diaSeleccionado ? eventosFiltrados.filter(e => e.fecha === diaSeleccionado) : [];
  const proximosEventos = eventosFiltrados.filter(e => e.fecha >= hoy).slice(0, 8);
  const conteo = (t: string) => eventos.filter(e => e.tipo === t && e.fecha >= hoy).length;

  const TIPOS: Record<string, { dot: string; badge: string; card: string; icon: string; label: string }> = {
    audiencia:   { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700",   card: "border-blue-200 bg-blue-50/60",   icon: "🏛", label: "Audiencia" },
    documento:   { dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700", card: "border-amber-200 bg-amber-50/60", icon: "📄", label: "Entrega de doc." },
    termino:     { dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700",card: "border-violet-200 bg-violet-50/60",icon: "⚖️",label: "Término" },
    vencimiento: { dot: "bg-red-500",    badge: "bg-red-100 text-red-700",     card: "border-red-200 bg-red-50/60",     icon: "⏰", label: "Vencimiento" },
  };

  const EventoCard = ({ ev }: { ev: any }) => {
    const t = TIPOS[ev.tipo] ?? { dot: "bg-muted", badge: "bg-muted", card: "border-border bg-card", icon: "📋", label: ev.tipo };
    return (
      <div className={`rounded-xl border p-4 space-y-2 ${t.card}`}>
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{t.icon}</span>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">{ev.titulo}</p>
              {ev.subtitulo && <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">{ev.subtitulo}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-[10px] font-body px-2 py-0.5 rounded-full font-medium ${t.badge}`}>{t.label}</span>
            <span className="font-body text-[10px] text-muted-foreground">{ev.hora !== "23:59" ? ev.hora : "Todo el día"}</span>
          </div>
        </div>

        {/* Info del caso */}
        <div className="bg-white/60 rounded-lg p-2.5 space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="font-body text-xs text-foreground">
              <span className="font-semibold">Caso #{ev.radicado}</span>
              {ev.tipoCaso ? ` · ${ev.tipoCaso}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="font-body text-xs text-foreground">Cliente: <span className="font-medium">{ev.cliente}</span></p>
          </div>
          {ev.abogado_id && abogadosMap[ev.abogado_id] && (
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <p className="font-body text-xs text-foreground">Abogado: <span className="font-medium">{abogadosMap[ev.abogado_id]}</span></p>
            </div>
          )}
        </div>

        {/* Info de audiencia */}
        {ev.tipo === "audiencia" && (
          <div className="space-y-1">
            {ev.modalidad && (
              <p className="font-body text-xs text-muted-foreground capitalize">
                Modalidad: <span className="font-medium text-foreground">{ev.modalidad}</span>
                {ev.ubicacion ? ` · ${ev.ubicacion}` : ""}
              </p>
            )}
            {ev.tipoAud && (
              <p className="font-body text-xs text-muted-foreground">
                Tipo: <span className="font-medium text-foreground">{ev.tipoAud}</span>
              </p>
            )}
            {ev.notas && (
              <p className="font-body text-xs text-muted-foreground italic">{ev.notas}</p>
            )}
            {ev.enlace && (
              <a href={ev.enlace} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Video className="w-3 h-3" />
                Unirse a la audiencia virtual
              </a>
            )}
            <div className="flex gap-2 pt-1">
              <Button type="button" size="sm" variant="outline"
                className="font-body text-xs gap-1 h-7"
                onClick={() => editarAudiencia(ev)}>
                ✏️ Editar
              </Button>
              <Button type="button" size="sm" variant="outline"
                className="font-body text-xs gap-1 h-7 text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={() => eliminarAudiencia(ev.audId)}>
                🗑️ Eliminar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Calendario General</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">Audiencias, entregas y vencimientos de todos los casos activos</p>
        </div>
        <Button type="button"
          className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold hover:opacity-90 gap-1.5"
          onClick={() => { resetFormAud(); setShowFormAud(v => !v); }}>
          <CalendarDays className="w-4 h-4" />
          {showFormAud ? "Cancelar" : "Nueva audiencia"}
        </Button>
      </div>

      {/* Formulario crear / editar audiencia */}
      {showFormAud && (
        <div className="bg-card rounded-xl border border-accent/30 p-5 mb-6 space-y-4">
          <p className="font-display text-sm font-semibold text-foreground">{editAudId ? "Editar audiencia" : "Nueva audiencia"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Caso */}
            <div className="md:col-span-2">
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Caso *</Label>
              <select value={formAud.case_id}
                onChange={e => setFormAud(p => ({ ...p, case_id: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">Selecciona un caso…</option>
                {casesAll.map((c: any) => (
                  <option key={c.id} value={c.id}>#{c.radicado} — {c.cliente_nombre} · {c.tipo}</option>
                ))}
              </select>
            </div>

            {/* Info del caso y cliente (solo lectura) */}
            {casoSeleccionado && (
              <div className="md:col-span-2 grid sm:grid-cols-3 gap-3 bg-muted/30 rounded-xl p-4">
                <div>
                  <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Abogado asignado</p>
                  <p className="font-body text-sm text-foreground font-medium">{abogadosMap[casoSeleccionado.abogado_id] ?? "Sin asignar"}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
                  <p className="font-body text-sm text-foreground font-medium">{casoSeleccionado.cliente_nombre}</p>
                  {clienteInfo?.email && <p className="font-body text-xs text-muted-foreground">{clienteInfo.email}</p>}
                  {clienteInfo?.telefono && <p className="font-body text-xs text-muted-foreground">{clienteInfo.telefono}</p>}
                </div>
                <div>
                  <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tipo de proceso</p>
                  <p className="font-body text-sm text-foreground font-medium">{casoSeleccionado.tipo}</p>
                  <p className="font-body text-xs text-muted-foreground">Etapa: {casoSeleccionado.etapa}</p>
                </div>
              </div>
            )}

            {/* Título */}
            <div className="md:col-span-2">
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Título *</Label>
              <Input value={formAud.titulo} onChange={e => setFormAud(p => ({ ...p, titulo: e.target.value }))}
                placeholder="Ej: Audiencia inicial, Audiencia de pruebas…" />
            </div>

            {/* Tipo */}
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Tipo de audiencia</Label>
              <Input value={formAud.tipo} onChange={e => setFormAud(p => ({ ...p, tipo: e.target.value }))}
                placeholder="Ej: Preliminar, Oral, Conciliación…" />
            </div>

            {/* Modalidad */}
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Modalidad</Label>
              <select value={formAud.modalidad}
                onChange={e => setFormAud(p => ({ ...p, modalidad: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="mixta">Mixta</option>
              </select>
            </div>

            {/* Fecha inicio */}
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Fecha y hora inicio *</Label>
              <Input type="datetime-local" value={formAud.fecha_inicio}
                onChange={e => setFormAud(p => ({ ...p, fecha_inicio: e.target.value }))} />
            </div>

            {/* Fecha fin */}
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Fecha y hora fin</Label>
              <Input type="datetime-local" value={formAud.fecha_fin}
                onChange={e => setFormAud(p => ({ ...p, fecha_fin: e.target.value }))} />
            </div>

            {/* Ubicación */}
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Ubicación / Sala</Label>
              <Input value={formAud.ubicacion} onChange={e => setFormAud(p => ({ ...p, ubicacion: e.target.value }))}
                placeholder="Ej: Sala 3, Juzgado 5 Civil…" />
            </div>

            {/* Enlace virtual */}
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Enlace virtual</Label>
              <Input value={formAud.enlace_virtual} onChange={e => setFormAud(p => ({ ...p, enlace_virtual: e.target.value }))}
                placeholder="https://meet.google.com/…" />
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <Label className="font-body text-xs text-muted-foreground mb-1 block">Notas internas</Label>
              <Textarea value={formAud.notas} onChange={e => setFormAud(p => ({ ...p, notas: e.target.value }))}
                placeholder="Observaciones para el equipo…" rows={2} className="resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={resetFormAud} className="font-body text-xs">Cancelar</Button>
            <Button type="button" onClick={guardarAudiencia} disabled={savingAud}
              className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold hover:opacity-90">
              {savingAud ? "Guardando…" : editAudId ? "Guardar cambios" : "Crear audiencia"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando calendario…</p>
      ) : (
        <>
          {/* Filtros rápidos */}
          <div className="flex gap-2 flex-wrap mb-5">
            {[
              { id: "todos", label: `Todos (${eventos.filter(e => e.fecha >= hoy).length})` },
              { id: "audiencia", label: `🏛 Audiencias (${conteo("audiencia")})` },
              { id: "documento", label: `📄 Entregas (${conteo("documento")})` },
              { id: "termino", label: `⚖️ Términos (${conteo("termino")})` },
              { id: "vencimiento", label: `⏰ Vencimientos (${conteo("vencimiento")})` },
            ].map(f => (
              <button key={f.id} type="button" onClick={() => { setFiltro(f.id); setDiaSeleccionado(null); }}
                className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${filtro === f.id ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* CALENDARIO */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
              {/* Navegación mes */}
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => { setMesActual(m => { const d = new Date(m.year, m.month-1, 1); return { year: d.getFullYear(), month: d.getMonth() }; }); setDiaSeleccionado(null); }}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-xl text-muted-foreground hover:bg-muted transition-colors">‹</button>
                <h2 className="font-display text-lg font-semibold text-foreground capitalize">{nombreMes}</h2>
                <button type="button" onClick={() => { setMesActual(m => { const d = new Date(m.year, m.month+1, 1); return { year: d.getFullYear(), month: d.getMonth() }; }); setDiaSeleccionado(null); }}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-xl text-muted-foreground hover:bg-muted transition-colors">›</button>
              </div>

              {/* Cabecera días */}
              <div className="grid grid-cols-7 mb-1">
                {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d => (
                  <div key={d} className="text-center font-body text-[10px] text-muted-foreground uppercase tracking-wider py-1">{d}</div>
                ))}
              </div>

              {/* Días */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: primerDia }).map((_,i) => <div key={"ep"+i}/>)}
                {Array.from({ length: diasEnMes }).map((_,i) => {
                  const dia = i + 1;
                  const fecha = `${year}-${String(month+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
                  const evs = eventosDelDia(dia);
                  const esHoy = fecha === hoy;
                  const esSel = fecha === diaSeleccionado;
                  const tipos = [...new Set(evs.map(e => e.tipo))];
                  return (
                    <button key={dia} type="button" onClick={() => setDiaSeleccionado(esSel ? null : fecha)}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-start pt-1.5 pb-1 transition-all
                        ${esSel ? "bg-accent shadow-md" : esHoy ? "bg-accent/15 border-2 border-accent" : evs.length > 0 ? "hover:bg-muted cursor-pointer" : "hover:bg-muted/30 cursor-pointer"}`}>
                      <span className={`text-xs font-medium ${esSel ? "text-primary-foreground" : esHoy ? "text-accent font-bold" : evs.length > 0 ? "text-foreground" : "text-muted-foreground"}`}>{dia}</span>
                      {tipos.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-0.5">
                          {tipos.map(t => (
                            <span key={t} className={`w-1.5 h-1.5 rounded-full ${TIPOS[t]?.dot ?? "bg-muted"} ${esSel ? "opacity-80" : ""}`} />
                          ))}
                        </div>
                      )}
                      {evs.length > 1 && (
                        <span className={`text-[8px] font-body font-bold mt-0.5 ${esSel ? "text-primary-foreground/80" : "text-muted-foreground"}`}>+{evs.length}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border flex-wrap">
                {Object.entries(TIPOS).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`}/>
                    <span className="font-body text-[10px] text-muted-foreground">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL LATERAL */}
            <div className="space-y-4 max-h-[680px] overflow-auto">
              {/* Eventos del día seleccionado */}
              {diaSeleccionado && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      {new Date(diaSeleccionado + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                    </h3>
                    <button type="button" onClick={() => setDiaSeleccionado(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                  </div>
                  {eventosDiaSel.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                      <p className="font-body text-xs text-muted-foreground">Sin eventos este día.</p>
                    </div>
                  ) : (
                    eventosDiaSel.map(ev => <EventoCard key={ev.id} ev={ev} />)
                  )}
                  <hr className="border-border" />
                </div>
              )}

              {/* Próximos eventos */}
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">Próximos eventos</h3>
                {proximosEventos.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="font-body text-xs text-muted-foreground">No hay eventos próximos.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {proximosEventos.map(ev => {
                      const t = TIPOS[ev.tipo] ?? { icon: "📋", badge: "bg-muted text-muted-foreground", dot: "bg-muted", card: "", label: ev.tipo };
                      return (
                        <button key={ev.id} type="button"
                          onClick={() => {
                            setDiaSeleccionado(ev.fecha);
                            setMesActual({ year: parseInt(ev.fecha.split("-")[0]), month: parseInt(ev.fecha.split("-")[1]) - 1 });
                          }}
                          className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                          <div className="text-xl flex-shrink-0 mt-0.5">{t.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-body text-xs font-semibold text-foreground truncate">{ev.titulo}</p>
                              <span className={`text-[9px] font-body px-1.5 py-0.5 rounded-full flex-shrink-0 ${t.badge}`}>{t.label}</span>
                            </div>
                            <p className="font-body text-[10px] text-muted-foreground mt-0.5">#{ev.radicado} · {ev.cliente}</p>
                            {ev.abogado_id && abogadosMap[ev.abogado_id] && (
                              <p className="font-body text-[10px] text-muted-foreground">{abogadosMap[ev.abogado_id]}</p>
                            )}
                            <p className="font-body text-[10px] text-accent mt-0.5 font-medium">
                              {new Date(ev.fecha + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                              {ev.hora !== "23:59" ? ` · ${ev.hora}` : ""}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

/* ── Analítica (dashboard real con gráficos) ── */
const SeccionAnaliticaJefe = () => {
  const [casos, setCasos] = useState<any[]>([]);
  const [actuaciones, setActuaciones] = useState<any[]>([]);
  const [audiencias, setAudiencias] = useState<any[]>([]);
  const [profs, setProfs] = useState<Record<string, string>>({});
  const [areas, setAreas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tabAnalitica, setTabAnalitica] = useState<"general" | "abogados">("general");
  const [abogadoSeleccionado, setAbogadoSeleccionado] = useState<string>("todos");
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  const cargarDatos = async () => {
    const [{ data: cs }, { data: ps }, { data: ars }, { data: acts }, { data: auds }] = await Promise.all([
      supabase.from("cases").select("id, etapa, tipo, abogado_id, created_at, urgente, area_id, fecha_vencimiento, cliente_nombre"),
      supabase.from("profiles").select("id, full_name"),
      supabase.from("areas_derecho").select("id, nombre"),
      supabase.from("actuaciones").select("id, case_id, cumplida, vence_at, created_at"),
      supabase.from("audiencias").select("id, case_id, fecha_inicio"),
    ]);
    setCasos((cs ?? []) as any);
    setActuaciones((acts ?? []) as any);
    setAudiencias((auds ?? []) as any);
    const pm: Record<string, string> = {}; (ps ?? []).forEach((p: any) => { pm[p.id] = p.full_name; }); setProfs(pm);
    const am: Record<string, string> = {}; (ars ?? []).forEach((a: any) => { am[a.id] = a.nombre; }); setAreas(am);
    setUltimaActualizacion(new Date());
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
    const ch = supabase.channel("analitica-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cases" }, cargarDatos)
      .on("postgres_changes", { event: "*", schema: "public", table: "actuaciones" }, cargarDatos)
      .on("postgres_changes", { event: "*", schema: "public", table: "audiencias" }, cargarDatos)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const hoy = new Date();
  const total = casos.length;
  const activos = casos.filter(c => c.etapa !== "Cerrado").length;
  const cerrados = casos.filter(c => c.etapa === "Cerrado").length;
  const urgentes = casos.filter(c => c.urgente && c.etapa !== "Cerrado").length;
  const tasaCierre = total > 0 ? Math.round((cerrados / total) * 100) : 0;
  const vencenProx7 = casos.filter(c => {
    if (!c.fecha_vencimiento || c.etapa === "Cerrado") return false;
    const dias = Math.ceil((new Date(c.fecha_vencimiento).getTime() - hoy.getTime()) / 86400000);
    return dias >= 0 && dias <= 7;
  }).length;

  // ── Vista general ──
  const ETAPAS_ORDEN = ["Creación", "Proyección", "Recaudo Probatorio", "Revisión", "Firma"];
  const conteoEtapa = casos.filter(c => c.etapa !== "Cerrado").reduce<Record<string, number>>((acc, c) => {
    acc[c.etapa] = (acc[c.etapa] ?? 0) + 1; return acc;
  }, {});
  const porEtapa = ETAPAS_ORDEN.map(name => ({ name, value: conteoEtapa[name] ?? 0 }));

  // Todas las áreas del catálogo siempre aparecen con su nombre real, con 0 si no tienen casos activos
  const conteoAreaPorId = casos.filter(c => c.etapa !== "Cerrado").reduce<Record<string, number>>((acc, c) => {
    const k = c.area_id ?? "__sin_area__"; acc[k] = (acc[k] ?? 0) + 1; return acc;
  }, {});
  const sinAreaCount = conteoAreaPorId["__sin_area__"] ?? 0;
  // areas es Record<id, nombre> — siempre mostramos todas las áreas aunque tengan 0 casos
  const porArea: { name: string; value: number }[] = [
    ...Object.entries(areas).map(([id, nombre]) => ({ name: nombre || "Sin nombre", value: conteoAreaPorId[id] ?? 0 })),
    ...(sinAreaCount > 0 ? [{ name: "Sin área", value: sinAreaCount }] : []),
  ].sort((a, b) => b.value - a.value);

  const meses: { name: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const label = d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
    const count = casos.filter(c => { const cd = new Date(c.created_at); return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth(); }).length;
    meses.push({ name: label, value: count });
  }

  // ── Por abogado ──
  const PROJ_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];
  const abogadoIds = [...new Set(casos.filter(c => c.abogado_id).map(c => c.abogado_id as string))];

  const statsAbogado = abogadoIds.map(id => {
    const nombre = profs[id] ?? "Sin nombre";
    const misCasos = casos.filter(c => c.abogado_id === id);
    const casosActivos = misCasos.filter(c => c.etapa !== "Cerrado").length;
    const casosCerrados = misCasos.filter(c => c.etapa === "Cerrado").length;
    const casosUrgentes = misCasos.filter(c => c.urgente && c.etapa !== "Cerrado").length;
    const misActuaciones = actuaciones.filter(a => misCasos.some(c => c.id === a.case_id));
    const actCumplidas = misActuaciones.filter(a => a.cumplida).length;
    const actTotal = misActuaciones.length;
    const eficiencia = actTotal > 0 ? Math.round((actCumplidas / actTotal) * 100) : null;
    const misAudiencias = audiencias.filter(a => misCasos.some(c => c.id === a.case_id));
    const audProximas = misAudiencias.filter(a => new Date(a.fecha_inicio) >= hoy).length;
    const vencenProx = misCasos.filter(c => {
      if (!c.fecha_vencimiento || c.etapa === "Cerrado") return false;
      const dias = Math.ceil((new Date(c.fecha_vencimiento).getTime() - hoy.getTime()) / 86400000);
      return dias >= 0 && dias <= 7;
    }).length;
    const proyMensual: { name: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const label = d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
      const hasta = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = misCasos.filter(c => new Date(c.created_at) <= hasta && c.etapa !== "Cerrado").length;
      proyMensual.push({ name: label, value: count });
    }
    return { id, nombre, activos: casosActivos, cerrados: casosCerrados, urgentes: casosUrgentes, eficiencia, audProximas, vencenProx, total: misCasos.length, proyMensual };
  }).sort((a, b) => b.activos - a.activos);

  // Para la gráfica horizontal usamos el nombre completo; si no hay abogados con casos el array está vacío
  const cargaAbogado = statsAbogado.length > 0
    ? statsAbogado.map(a => ({ name: a.nombre, value: a.activos }))
    : [{ name: "Sin datos", value: 0 }];

  const proyAbogadoMensual: { name: string; [key: string]: any }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const label = d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
    const punto: { name: string; [key: string]: any } = { name: label };
    if (abogadoSeleccionado === "todos") {
      statsAbogado.forEach(a => { punto[a.nombre] = a.proyMensual[5 - i]?.value ?? 0; });
    } else {
      const ab = statsAbogado.find(a => a.id === abogadoSeleccionado);
      if (ab) punto[ab.nombre] = ab.proyMensual[5 - i]?.value ?? 0;
    }
    proyAbogadoMensual.push(punto);
  }
  const proyLineKeys = abogadoSeleccionado === "todos"
    ? statsAbogado.map(a => a.nombre)
    : statsAbogado.filter(a => a.id === abogadoSeleccionado).map(a => a.nombre);

  const kpis = [
    { label: "Casos Totales", value: total, color: "from-indigo-500 to-violet-500", icon: Briefcase },
    { label: "Casos Activos", value: activos, color: "from-emerald-500 to-teal-500", icon: TrendingUp },
    { label: "Tasa de cierre", value: `${tasaCierre}%`, color: "from-sky-500 to-cyan-500", icon: Check },
    { label: "Urgentes activos", value: urgentes, color: "from-rose-500 to-orange-500", icon: AlertTriangle },
    { label: "Vencen en 7 días", value: vencenProx7, color: "from-amber-500 to-yellow-500", icon: Clock },
    { label: "Casos cerrados", value: cerrados, color: "from-violet-500 to-purple-500", icon: CheckCircle2 },
  ];

  const EficienciaBar = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="font-body text-xs text-muted-foreground">Sin datos</span>;
    const color = value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500";
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
        </div>
        <span className="font-body text-xs font-medium text-foreground w-8 text-right">{value}%</span>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Analítica y KPIs</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Datos en tiempo real · Última actualización:{" "}
            <span className="text-foreground font-medium">
              {ultimaActualizacion.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </span>
          </p>
        </div>
        <button type="button" onClick={cargarDatos}
          className="flex items-center gap-2 font-body text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
          <TrendingUp className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      {loading ? <p className="font-body text-sm text-muted-foreground">Cargando…</p> : (
        <>
          {/* KPIs */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {kpis.map((k) => (
              <div key={k.label} className={`rounded-xl p-4 text-white shadow-luxury bg-gradient-to-br ${k.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-body text-[10px] uppercase tracking-wider opacity-80">{k.label}</p>
                  <k.icon className="w-3.5 h-3.5 opacity-80" />
                </div>
                <p className="font-display text-2xl font-bold">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {([
              { id: "general", label: "Vista general" },
              { id: "abogados", label: "Proyección por abogado" },
            ] as const).map(t => (
              <button key={t.id} type="button" onClick={() => setTabAnalitica(t.id)}
                className={`font-body text-sm px-4 py-2 border-b-2 transition-colors ${tabAnalitica === t.id ? "border-accent text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tabAnalitica === "general" ? (
            <>
              <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <ChartCard title="Casos activos por etapa">
                  <RPieChart data={porEtapa} />
                </ChartCard>
                <div className="bg-card rounded-xl border border-border p-5">
                  <p className="font-display text-base font-semibold text-foreground mb-4">Casos activos por área de derecho</p>
                  {porArea.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Sin áreas registradas</div>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const max = Math.max(...porArea.map(d => d.value), 1);
                        return porArea.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-3">
                            <span className="font-body text-xs text-muted-foreground w-36 text-right flex-shrink-0 truncate" title={d.name}>{d.name}</span>
                            <div className="flex-1 h-7 bg-muted/40 rounded-lg overflow-hidden">
                              <div
                                className="h-full rounded-lg flex items-center px-2 transition-all duration-500"
                                style={{
                                  width: d.value === 0 ? "3px" : `${Math.max(4, (d.value / max) * 100)}%`,
                                  background: ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#84cc16"][i % 8],
                                  opacity: d.value === 0 ? 0.25 : 1,
                                }}
                              />
                            </div>
                            <span className="font-display text-xs font-bold text-foreground w-4 flex-shrink-0">{d.value}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4">
                <ChartCard title="Nuevos casos por mes (últimos 6 meses)">
                  <RLineChart data={meses} />
                </ChartCard>
              </div>
            </>
          ) : (
            <>
              {/* Selector de abogado */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <p className="font-body text-sm text-muted-foreground">Filtrar proyección:</p>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => setAbogadoSeleccionado("todos")}
                    className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${abogadoSeleccionado === "todos" ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                    Todos
                  </button>
                  {statsAbogado.map((a, i) => (
                    <button key={a.id} type="button" onClick={() => setAbogadoSeleccionado(a.id)}
                      className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${abogadoSeleccionado === a.id ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PROJ_COLORS[i % PROJ_COLORS.length] }} />
                      {a.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gráfica de proyección mensual */}
              <div className="mb-4">
                <ChartCard title={`Evolución de casos activos — últimos 6 meses${abogadoSeleccionado !== "todos" ? ` · ${statsAbogado.find(a => a.id === abogadoSeleccionado)?.nombre ?? ""}` : " · todos los abogados"}`}>
                  <RMultiLineChart data={proyAbogadoMensual} lineKeys={proyLineKeys} colors={PROJ_COLORS} />
                </ChartCard>
              </div>

              <div className="mb-4">
                <div className="bg-card rounded-xl border border-border p-5">
                  <p className="font-display text-base font-semibold text-foreground mb-4">Carga actual por abogado (casos activos)</p>
                  <div className="space-y-3 mt-2">
                    {(() => {
                      const max = Math.max(...cargaAbogado.map(d => d.value), 1);
                      return cargaAbogado.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-3">
                          <span className="font-body text-xs text-muted-foreground w-36 text-right flex-shrink-0 truncate">{d.name}</span>
                          <div className="flex-1 h-7 bg-muted/40 rounded-lg overflow-hidden">
                            <div
                              className="h-full rounded-lg flex items-center px-2 transition-all duration-500"
                              style={{
                                width: `${Math.max(4, (d.value / max) * 100)}%`,
                                background: ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#84cc16"][i % 8],
                              }}
                            >
                              <span className="font-display text-xs font-bold text-white">{d.value}</span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Tabla detallada */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <p className="font-display text-base font-semibold text-foreground">Detalle por abogado</p>
                  <p className="font-body text-xs text-muted-foreground">Carga real, eficiencia en actuaciones, audiencias próximas y términos por vencer</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">Abogado</th>
                        <th className="text-center px-3 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">Total</th>
                        <th className="text-center px-3 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">Activos</th>
                        <th className="text-center px-3 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">Cerrados</th>
                        <th className="text-center px-3 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">Urgentes</th>
                        <th className="text-center px-3 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">Aud. próximas</th>
                        <th className="text-center px-3 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">Vencen ≤7d</th>
                        <th className="px-4 py-3 font-body text-xs text-muted-foreground uppercase tracking-wider">Eficiencia act.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {statsAbogado.map((a, i) => (
                        <tr key={a.id}
                          className={`hover:bg-muted/20 transition-colors cursor-pointer ${abogadoSeleccionado === a.id ? "bg-accent/5" : ""}`}
                          onClick={() => setAbogadoSeleccionado(abogadoSeleccionado === a.id ? "todos" : a.id)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: PROJ_COLORS[i % PROJ_COLORS.length] }}>
                                <span className="font-display text-xs font-bold text-white">{a.nombre.charAt(0).toUpperCase()}</span>
                              </div>
                              <p className="font-body text-sm font-medium text-foreground">{a.nombre}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center"><span className="font-body text-sm text-muted-foreground">{a.total}</span></td>
                          <td className="px-3 py-3 text-center"><span className="font-display text-sm font-bold text-foreground">{a.activos}</span></td>
                          <td className="px-3 py-3 text-center"><span className="font-body text-sm text-muted-foreground">{a.cerrados}</span></td>
                          <td className="px-3 py-3 text-center">
                            {a.urgentes > 0
                              ? <span className="font-body text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">{a.urgentes}</span>
                              : <span className="font-body text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {a.audProximas > 0
                              ? <span className="font-body text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{a.audProximas}</span>
                              : <span className="font-body text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {a.vencenProx > 0
                              ? <span className="font-body text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{a.vencenProx}</span>
                              : <span className="font-body text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 min-w-[140px]"><EficienciaBar value={a.eficiencia} /></td>
                        </tr>
                      ))}
                      {statsAbogado.length === 0 && (
                        <tr><td colSpan={8} className="px-4 py-8 text-center font-body text-sm text-muted-foreground">No hay abogados con casos asignados.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {statsAbogado.length > 0 && (
                  <div className="px-4 py-2 border-t border-border bg-muted/20">
                    <p className="font-body text-xs text-muted-foreground">Haz clic en una fila para filtrar la gráfica de proyección por ese abogado.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-xl border border-border p-5">
    <p className="font-display text-base font-semibold text-foreground mb-4">{title}</p>
    <div className="h-64">{children}</div>
  </div>
);

/* ── Notificaciones del jefe (REALES) ── */
const SeccionComentariosJefe = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [casos, setCasos] = useState<{ id: string; radicado: string; cliente_nombre: string }[]>([]);
  const [abogadosMap, setAbogadosMap] = useState<Record<string, string>>({});
  const [casoFiltro, setCasoFiltro] = useState("todos");
  const [nuevo, setNuevo] = useState("");
  const [casoId, setCasoId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: coms }, { data: casosData }, { data: profs }] = await Promise.all([
      supabase.from("cases").select("id, radicado, cliente_nombre, abogado_id").neq("etapa", "Cerrado"),
      supabase.from("profiles").select("id, full_name"),
    ]);
    const pm: Record<string, string> = {};
    (profs ?? []).forEach((p: any) => { pm[p.id] = p.full_name; });
    setAbogadosMap(pm);
    setCasos((casosData ?? []) as any);
    const casosMap: Record<string, any> = {};
    (casosData ?? []).forEach((c: any) => { casosMap[c.id] = c; });
    const enriched = (coms ?? []).map((c: any) => ({ ...c, caso: casosMap[c.case_id], autor_nombre: pm[c.author_id] ?? "Usuario" }));
    setComentarios(enriched);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

const enviar = async () => {
    if (!nuevo.trim() || !casoId || !user) return;
    setSaving(true);
    const caso = casos.find(c => c.id === casoId);
    const { error } = await supabase.from("case_comments").insert({
      case_id: casoId,
      author_id: user.id,
      abogado_id: caso?.abogado_id ?? null,
      texto: nuevo.trim(),
    });
    // El trigger trg_notif_comment notifica al abogado automáticamente
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Comentario enviado" }); setNuevo(""); }
    setSaving(false);
    load();
  };

  const filtrados = casoFiltro === "todos" ? comentarios : comentarios.filter(c => c.case_id === casoFiltro);

  return (
    <>
      <SectionHeader title="Comentarios Internos" description="Notas e instrucciones entre el director y los abogados por caso" />

      {/* Nuevo comentario */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 space-y-3">
        <p className="font-display text-sm font-semibold text-foreground">Nuevo comentario</p>
        <Select value={casoId} onValueChange={setCasoId}>
          <SelectTrigger><SelectValue placeholder="Selecciona un caso" /></SelectTrigger>
          <SelectContent>
            {casos.map(c => (
              <SelectItem key={c.id} value={c.id}>#{c.radicado} — {c.cliente_nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Escribe una instrucción o nota al abogado…" rows={3} />
        <Button type="button" onClick={enviar} disabled={saving || !nuevo.trim() || !casoId} className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold hover:opacity-90">
          {saving ? "Enviando…" : "Enviar comentario"}
        </Button>
      </div>

      {/* Filtros */}
      {casos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button type="button" onClick={() => setCasoFiltro("todos")}
            className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${casoFiltro === "todos" ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/40"}`}>
            Todos ({comentarios.length})
          </button>
          {casos.filter(c => comentarios.some(cm => cm.case_id === c.id)).map(c => (
            <button key={c.id} type="button" onClick={() => setCasoFiltro(c.id)}
              className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${casoFiltro === c.id ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/40"}`}>
              #{c.radicado} ({comentarios.filter(cm => cm.case_id === c.id).length})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando…</p>
      ) : filtrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No hay comentarios aún.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map(c => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-navy flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xs font-bold text-accent">{c.autor_nombre.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground">{c.autor_nombre}</p>
                    <p className="font-body text-[10px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                    </p>
                  </div>
                </div>
                {c.caso && (
                  <span className="font-body text-[10px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                    #{c.caso.radicado} — {c.caso.cliente_nombre}
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-foreground whitespace-pre-line pl-10">{c.texto}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const SeccionNotificacionesJefe = ({ setActiveSection }: { setActiveSection: (s: string) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifs, setNotifs] = useState<{ id: string; case_id: string | null; tipo: string; titulo: string; mensaje: string; leida: boolean; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("notificaciones").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
    setNotifs((data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("jefe-notif")
      .on("postgres_changes", { event: "*", schema: "public", table: "notificaciones", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

 const onClick = async (n: typeof notifs[number]) => {
    if (!n.leida) await supabase.from("notificaciones").update({ leida: true }).eq("id", n.id);
    if (n.tipo === "solicitud_contacto") setActiveSection("solicitudes");
    else if (n.tipo === "documento_recibido" || n.tipo === "documento_abogado") setActiveSection("documentos");
    else if (n.case_id || n.tipo.startsWith("caso") || n.tipo === "actuacion_creada" || n.tipo === "audiencia_creada" || n.tipo === "comentario_abogado") setActiveSection("revision");
    load();
  };


  const marcarTodas = async () => {
    const ids = notifs.filter(n => !n.leida).map(n => n.id);
    if (ids.length === 0) return;
    await supabase.from("notificaciones").update({ leida: true }).in("id", ids);
    toast({ title: "Todas marcadas como leídas" });
    load();
  };

  const eliminar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await supabase.from("notificaciones").delete().eq("id", id);
    load();
  };

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Notificaciones</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">Alertas de casos, documentos y eventos del bufete en tiempo real</p>
        </div>
        {notifs.some(n => !n.leida) && (
          <Button size="sm" variant="outline" onClick={marcarTodas}>Marcar todas como leídas</Button>
        )}
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Cargando…</p> : notifs.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No tienes notificaciones.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {notifs.map((n) => {
  const iconMap: Record<string, { icon: any; color: string }> = {
    comentario_abogado:       { icon: MessageSquare,  color: "bg-indigo-100 text-indigo-600" },
    documento_abogado:        { icon: FileText,        color: "bg-emerald-100 text-emerald-600" },
    documento_recibido:       { icon: FileText,        color: "bg-sky-100 text-sky-600" },
    solicitud_contacto:       { icon: Phone,           color: "bg-amber-100 text-amber-600" },
    termino_vencido:          { icon: Clock,           color: "bg-rose-100 text-rose-600" },
    comentario:               { icon: MessageSquare,   color: "bg-violet-100 text-violet-600" },
    recordatorio_audiencia:   { icon: CalendarDays,    color: "bg-blue-100 text-blue-600" },
    recordatorio_vencimiento: { icon: Clock,           color: "bg-rose-100 text-rose-600" },
    recordatorio_actuacion:   { icon: AlertTriangle,   color: "bg-amber-100 text-amber-600" },
  };
  const meta = iconMap[n.tipo] ?? { icon: Bell, color: "bg-muted text-muted-foreground" };
  const Icon = meta.icon;
  return (
    <button key={n.id} onClick={() => onClick(n)} className={`text-left bg-card rounded-xl border p-4 flex items-center gap-4 hover:border-accent/30 transition-all ${n.leida ? "border-border opacity-60" : "border-accent/30 shadow-sm"}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-body text-sm font-semibold text-foreground">{n.titulo}</p>
          {!n.leida && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
        </div>
        <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.mensaje}</p>
        <p className="font-body text-[10px] text-muted-foreground/60 mt-1">{new Date(n.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</p>
      </div>
    <div onClick={(e) => eliminar(e as any, n.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 cursor-pointer" title="Eliminar">
                  <X className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};




/* ── Inicio / Resumen del Director ── */
const SeccionInicio = ({ onNavigate }: { onNavigate: (s: string) => void }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>({
    casosActivos: 0, casosUrgentes: 0, abogados: 0,
    vencimientos7: [], audiencias7: [], sinAbogado: 0,
    casosEtapa: [] as { etapa: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);
  const [directorName, setDirectorName] = useState("");
  const [notifRecientes, setNotifRecientes] = useState<any[]>([]);

  const load = async () => {
    try {
    setLoading(true);
    const hoy = new Date().toISOString().split("T")[0];
    const en7 = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    
     const [
      { data: cases }, { data: auds }, { data: abRoles }, { data: prof }, { data: notifs }
    ] = await Promise.all([
      supabase.from("cases").select("id, radicado, cliente_nombre, etapa, abogado_id, urgente, fecha_vencimiento, tipo").neq("etapa", "Cerrado"),
      supabase.from("audiencias").select("id, case_id, titulo, fecha_inicio, enlace_virtual").gte("fecha_inicio", hoy + "T00:00:00").lte("fecha_inicio", en7 + "T23:59:59"),
      supabase.from("user_roles").select("user_id").eq("role", "abogado"),
     user ? supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      user ? supabase.from("notificaciones").select("id, tipo, titulo, mensaje, leida, created_at, case_id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5) : Promise.resolve({ data: [] }),
    ]);

    if ((prof as any)?.data?.full_name) setDirectorName((prof as any).data.full_name);
    setNotifRecientes((notifs ?? []) as any[]);

    const casosArr = cases ?? [];
    const casosMap: Record<string, any> = {};
    casosArr.forEach((c: any) => { casosMap[c.id] = c; });

    // Vencimientos próximos 7 días
    const venc7 = casosArr
      .filter((c: any) => c.fecha_vencimiento && c.fecha_vencimiento >= hoy && c.fecha_vencimiento <= en7)
      .sort((a: any, b: any) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento))
      .slice(0, 5);

    // Conteo por etapa
    const etapaCount: Record<string, number> = {};
    casosArr.forEach((c: any) => { etapaCount[c.etapa] = (etapaCount[c.etapa] ?? 0) + 1; });
    const casosEtapa = Object.entries(etapaCount).map(([etapa, count]) => ({ etapa, count }));

    // Audiencias con su caso
    const audsEnriq = (auds ?? []).map((a: any) => ({
      ...a, caso: casosMap[a.case_id],
    }));

    setData({
      casosActivos: casosArr.length,
      casosUrgentes: casosArr.filter((c: any) => c.urgente).length,
      abogados: (abRoles ?? []).length,
      sinAbogado: casosArr.filter((c: any) => !c.abogado_id).length,
      vencimientos7: venc7,
      audiencias7: audsEnriq,
      casosEtapa,
    });
    setLoading(false);
    } catch(err) { console.error("SeccionInicio load error:", err); setLoading(false); }
  };

  useEffect(() => { load(); }, [user?.id]);

  const horaLocal = new Date().toLocaleString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div className="bg-card rounded-xl border border-accent/20 p-6">
        <p className="font-body text-sm text-muted-foreground capitalize">{horaLocal}</p>
        <h1 className="font-display text-2xl font-bold text-foreground mt-1">
          Bienvenido{directorName ? `, ${directorName.split(" ")[0]}` : ""} 
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Aquí tienes el resumen del bufete al día de hoy.
        </p>
      </div>

      {/* KPIs */}
      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando resumen…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Casos activos", value: data.casosActivos, icon: "", action: "revision" },
              { label: "Casos urgentes", value: data.casosUrgentes, icon: "", action: "revision" },
              { label: "Sin abogado", value: data.sinAbogado, icon: "", action: "asignacion" },
              { label: "Abogados", value: data.abogados, icon: "", action: "abogados" },
            ].map(k => (
              <button key={k.label} type="button" onClick={() => onNavigate(k.action)}
                className="bg-card rounded-xl border border-border p-4 text-left hover:border-accent/40 transition-all group">
                <div className="text-2xl mb-2">{k.icon}</div>
                <p className="font-display text-3xl font-bold text-foreground">{k.value}</p>
                <p className="font-body text-xs text-muted-foreground mt-1 group-hover:text-accent transition-colors">{k.label}</p>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Vencimientos próximos 7 días */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                  Vencimientos próximos
                </h2>
                <span className="font-body text-xs text-muted-foreground">Próximos 7 días</span>
              </div>
              {data.vencimientos7.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="font-body text-xs text-muted-foreground">Sin vencimientos en los próximos 7 días</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.vencimientos7.map((c: any) => {
                    const dias = Math.ceil((new Date(c.fecha_vencimiento).getTime() - Date.now()) / 86400000);
                    return (
                      <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border ${dias <= 2 ? "border-destructive/30 bg-red-50/50" : "border-border bg-muted/20"}`}>
                        <div>
                          <p className="font-body text-xs font-semibold text-foreground">#{c.radicado}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{c.cliente_nombre} · {c.tipo}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-body text-xs font-bold ${dias <= 2 ? "text-destructive" : "text-amber-600"}`}>
                            {dias === 0 ? "Hoy" : dias === 1 ? "Mañana" : `${dias} días`}
                          </p>
                          <p className="font-body text-[10px] text-muted-foreground">
                            {new Date(c.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Audiencias esta semana */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                  Audiencias esta semana
                </h2>
                <button type="button" onClick={() => onNavigate("calendario")} className="font-body text-xs text-accent hover:underline">Ver calendario</button>
              </div>
              {data.audiencias7.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="font-body text-xs text-muted-foreground">Sin audiencias esta semana</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.audiencias7.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-start justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-xs font-semibold text-foreground truncate">{a.titulo}</p>
                        {a.caso && <p className="font-body text-[10px] text-muted-foreground">#{a.caso.radicado} · {a.caso.cliente_nombre}</p>}
                        {a.enlace_virtual && (
                          <a href={a.enlace_virtual} target="_blank" rel="noopener noreferrer"
                            className="font-body text-[10px] text-blue-600 hover:underline mt-0.5 inline-block">
                            Unirse
                          </a>
                        )}
                      </div>
                      <p className="font-body text-[10px] text-accent font-medium ml-2 flex-shrink-0">
                        {new Date(a.fecha_inicio).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                        <br />
                        {new Date(a.fecha_inicio).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Casos por etapa */}
          {data.casosEtapa.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-display text-base font-semibold text-foreground mb-4">Casos por etapa</h2>
              <div className="flex flex-wrap gap-3">
                {data.casosEtapa.sort((a: any, b: any) => b.count - a.count).map((e: any) => (
                  <button key={e.etapa} type="button" onClick={() => onNavigate("revision")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/30 hover:border-accent/40 transition-colors">
                    <span className="font-display text-xl font-bold text-foreground">{e.count}</span>
                    <span className="font-body text-xs text-muted-foreground">{e.etapa}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Notificaciones recientes + acceso rápido al calendario */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent" /> Notificaciones recientes
                </h2>
                <button type="button" onClick={() => onNavigate("notificaciones")} className="font-body text-xs text-accent hover:underline">Ver todas</button>
              </div>
              {notifRecientes.length === 0 ? (
                <p className="font-body text-xs text-muted-foreground py-4 text-center">Sin notificaciones nuevas</p>
              ) : (
                <div className="space-y-2">
                  {notifRecientes.map((n: any) => {
                    const tipoLabel: Record<string, string> = {
                      comentario_abogado: "💬 Comentario",
                      caso_devuelto: "↩️ Devuelto",
                      caso_devuelto_log: "↩️ Devuelto",
                      actuacion_creada: "⚖️ Actuación",
                      audiencia_creada: "🏛 Audiencia",
                      documento_recibido: "📄 Documento",
                    };
                    const label = tipoLabel[n.tipo] ?? "🔔 Alerta";
                    return (
                      <button key={n.id} type="button" onClick={() => onNavigate("notificaciones")}
                        className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 hover:border-accent/30 transition-colors ${n.leida ? "border-border bg-muted/10 opacity-60" : "border-accent/20 bg-accent/5"}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.leida ? "bg-muted-foreground/30" : "bg-accent"}`} />
                        <div className="flex-1 min-w-0">
                          <span className="font-body text-[10px] text-muted-foreground">{label}</span>
                          <p className="font-body text-xs font-semibold text-foreground truncate">{n.titulo}</p>
                          <p className="font-body text-[10px] text-muted-foreground line-clamp-1">{n.mensaje}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-accent" /> Próximos eventos
                </h2>
                <button type="button" onClick={() => onNavigate("calendario")} className="font-body text-xs text-accent hover:underline">Ver calendario</button>
              </div>
              {data.audiencias7.length === 0 && data.vencimientos7.length === 0 ? (
                <p className="font-body text-xs text-muted-foreground py-4 text-center">Sin eventos en los próximos 7 días</p>
              ) : (
                <div className="space-y-2">
                  {[
                    ...data.audiencias7.slice(0, 3).map((a: any) => ({
                      key: "aud-" + a.id, icon: "🏛", label: "Audiencia", titulo: a.titulo,
                      fecha: new Date(a.fecha_inicio).toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
                      hora: new Date(a.fecha_inicio).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }),
                    })),
                    ...data.vencimientos7.slice(0, 3).map((c: any) => ({
                      key: "vc-" + c.id, icon: "⏰", label: "Vencimiento", titulo: `#${c.radicado} — ${c.cliente_nombre}`,
                      fecha: new Date(c.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
                      hora: "",
                    })),
                  ].slice(0, 5).map((ev) => (
                    <button key={ev.key} type="button" onClick={() => onNavigate("calendario")}
                      className="w-full text-left p-3 rounded-lg border border-border bg-muted/20 hover:border-accent/30 transition-colors flex items-center gap-3">
                      <span className="text-base">{ev.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs font-semibold text-foreground truncate">{ev.titulo}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{ev.label} · {ev.fecha}{ev.hora ? ` · ${ev.hora}` : ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SeccionSolicitudes = () => {
  const { toast } = useToast();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [abogados, setAbogados] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "pendientes" | "atendidas">("pendientes");
  const [seleccionada, setSeleccionada] = useState<any | null>(null);
  const [abogadoAsignado, setAbogadoAsignado] = useState("");
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data }, { data: roles }] = await Promise.all([
      (supabase as any)
        .from("contact_requests")
        .select("id, nombre, email, telefono, motivo, mensaje, leido, atendido, comentario, abogado_asignado_id, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id").eq("role", "abogado"),
    ]);
    setSolicitudes(data ?? []);

    const ids = (roles ?? []).map((r: any) => r.user_id);
    if (ids.length > 0) {
      const { data: perfiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      setAbogados((perfiles ?? []) as any);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const abrirDetalle = (s: any) => {
    setSeleccionada(s);
    setAbogadoAsignado(s.abogado_asignado_id ?? "");
    setComentario(s.comentario ?? "");
  };

  const cerrarDetalle = () => {
    setSeleccionada(null);
    setAbogadoAsignado("");
    setComentario("");
  };

  const guardarAsignacion = async () => {
    if (!seleccionada) return;
    if (!abogadoAsignado || abogadoAsignado === "sin_asignar") {
      toast({ title: "Selecciona un abogado", description: "Debes asignar un abogado para enviar el mensaje.", variant: "destructive" });
      return;
    }
    setGuardando(true);

    const { error } = await (supabase as any)
      .from("contact_requests")
      .update({
        abogado_asignado_id: abogadoAsignado,
        comentario: comentario.trim() || null,
        leido: true,
        atendido: true,
      })
      .eq("id", seleccionada.id);

    if (error) {
      setGuardando(false);
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
      return;
    }

    if (comentario.trim()) {
      await supabase.from("notificaciones").insert({
        user_id: abogadoAsignado,
        tipo: "solicitud_contacto",
        titulo: `Nueva solicitud asignada: ${seleccionada.nombre}`,
        mensaje: comentario.trim(),
        metadata: {
          solicitud_id: seleccionada.id,
          cliente_nombre: seleccionada.nombre,
          cliente_email: seleccionada.email,
          cliente_telefono: seleccionada.telefono,
          motivo: seleccionada.motivo,
        },
      });
    }

    setGuardando(false);
    toast({ title: "Solicitud asignada", description: "Mensaje enviado al abogado." });
    cerrarDetalle();
    load();
  };

  const marcarAtendida = async (id: string, atendido: boolean) => {
    const { error } = await (supabase as any).from("contact_requests").update({ atendido, leido: atendido }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: atendido ? "Marcada como atendida" : "Marcada como pendiente" });
    load();
  };

  const filtradas = solicitudes.filter(s => {
    if (filtro === "pendientes") return !s.atendido;
    if (filtro === "atendidas") return s.atendido;
    return true;
  });

  const pendientes = solicitudes.filter(s => !s.atendido).length;
  const nombreAbogado = (id: string) => abogados.find(a => a.id === id)?.full_name ?? "Sin asignar";

  const MOTIVOS: Record<string, string> = {
    consulta: "Consulta general",
    seguimiento: "Seguimiento de caso",
    informacion: "Solicitar información",
    disciplinario: "Proceso disciplinario",
    penal: "Proceso penal",
    administrativo: "Derecho administrativo",
  };

  return (
    <>
      <SectionHeader
        title="Solicitudes de Contacto"
        description="Personas que solicitaron una llamada desde la página web"
      />

      <div className="flex gap-2 mb-5">
        {([
          { id: "pendientes", label: `Pendientes (${pendientes})` },
          { id: "atendidas", label: `Atendidas (${solicitudes.filter(s => s.atendido).length})` },
          { id: "todas", label: `Todas (${solicitudes.length})` },
        ] as const).map(f => (
          <button key={f.id} type="button" onClick={() => setFiltro(f.id)}
            className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${filtro === f.id ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-accent/40"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className={`flex gap-5 ${seleccionada ? "items-start" : ""}`}>
        <div className={`flex-1 min-w-0 ${seleccionada ? "max-w-sm" : ""}`}>
          {loading ? (
            <p className="font-body text-sm text-muted-foreground">Cargando solicitudes…</p>
          ) : filtradas.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-10 text-center">
              <Phone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">
                {filtro === "pendientes" ? "No hay solicitudes pendientes." : "No hay solicitudes en esta categoría."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtradas.map(s => (
                <div
                  key={s.id}
                  onClick={() => abrirDetalle(s)}
                  className={`bg-card rounded-xl border p-4 cursor-pointer transition-all hover:border-accent/40 ${seleccionada?.id === s.id ? "border-accent ring-1 ring-accent/20" : !s.atendido ? "border-accent/20" : "border-border opacity-70"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm ${!s.atendido ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {s.nombre?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-sm font-semibold text-foreground truncate">{s.nombre}</p>
                        {!s.atendido && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-body font-medium shrink-0">Pendiente</span>}
                        {s.atendido && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-body font-medium shrink-0">Atendida</span>}
                      </div>
                      <p className="font-body text-xs text-muted-foreground truncate">{MOTIVOS[s.motivo] ?? s.motivo}</p>
                      {s.abogado_asignado_id && (
                        <p className="font-body text-[10px] text-accent mt-0.5">→ {nombreAbogado(s.abogado_asignado_id)}</p>
                      )}
                      <p className="font-body text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(s.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {seleccionada && (
          <div className="w-96 flex-shrink-0 bg-card border border-border rounded-xl p-6 sticky top-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-base font-bold text-foreground">Detalle de solicitud</h3>
              <button type="button" onClick={cerrarDetalle} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 mb-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center font-display font-bold text-sm">
                  {seleccionada.nombre?.charAt(0)?.toUpperCase()}
                </div>
                <p className="font-display text-sm font-semibold text-foreground">{seleccionada.nombre}</p>
              </div>
              <a href={`mailto:${seleccionada.email}`} className="flex items-center gap-2 font-body text-xs text-accent hover:underline">
                <Mail className="w-3.5 h-3.5" /> {seleccionada.email}
              </a>
              <a href={`tel:${seleccionada.telefono}`} className="flex items-center gap-2 font-body text-xs text-accent hover:underline">
                <Phone className="w-3.5 h-3.5" /> {seleccionada.telefono}
              </a>
              <div className="pt-1 border-t border-border">
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Motivo</p>
                <p className="font-body text-xs text-foreground">{MOTIVOS[seleccionada.motivo] ?? seleccionada.motivo}</p>
              </div>
              {seleccionada.mensaje && (
                <div className="pt-1 border-t border-border">
                  <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Mensaje</p>
                  <p className="font-body text-xs text-foreground">{seleccionada.mensaje}</p>
                </div>
              )}
              <p className="font-body text-[10px] text-muted-foreground/60 pt-1">
                {new Date(seleccionada.created_at).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>

            <div className="mb-4">
              <Label className="font-body text-sm text-foreground mb-1.5 block">Asignar abogado</Label>
              <Select value={abogadoAsignado} onValueChange={setAbogadoAsignado}>
                <SelectTrigger className="font-body text-sm">
                  <SelectValue placeholder="Seleccionar abogado…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                  {abogados.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-5">
              <Label className="font-body text-sm text-foreground mb-1.5 block">Mensaje para el abogado</Label>
              <Textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Escribe las instrucciones o contexto para el abogado asignado…"
                rows={3}
                className="font-body text-sm resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={guardarAsignacion}
                disabled={guardando}
                className="flex-1 font-body text-sm gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                {guardando ? "Guardando…" : "Guardar y marcar atendida"}
              </Button>
            </div>

            {seleccionada.atendido && (
              <button
                type="button"
                onClick={() => { marcarAtendida(seleccionada.id, false); cerrarDetalle(); }}
                className="w-full mt-2 font-body text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Reabrir como pendiente
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};


export default DashboardJefe;