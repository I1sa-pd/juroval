import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Scale, Briefcase, CalendarDays, BarChart3, Upload, Bell, Users, Clock,
  LogOut, Menu, X, ChevronRight, FileText, TrendingUp, AlertTriangle,
  KeyRound, ArrowLeft, Plus, Video, MapPin, CheckCircle2, Trash2, Download, MessageSquare, Send,
} from "lucide-react";
import { GestionDocumentos } from "@/components/GestionDocumentos";
import { RPieChart, RBarChart } from "@/components/AnalyticsCharts";

const ETAPAS = ["Creación", "Proyección", "Recaudo Probatorio", "Revisión", "Firma", "Radicado", "Cerrado"] as const;
type Etapa = typeof ETAPAS[number];

type Caso = {
  id: string;
  radicado: string;
  cliente_nombre: string;
  tipo: string;
  etapa: Etapa;
  urgente: boolean;
  observaciones: string | null;
  fecha_vencimiento: string | null;
  area_id: string | null;
  juzgado_id: string | null;
};

type Actuacion = {
  id: string;
  case_id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  vence_at: string | null;
  termino_dias: number | null;
  cumplida: boolean;
};

type Audiencia = {
  id: string;
  case_id: string;
  titulo: string;
  tipo: string | null;
  fecha_inicio: string;
  modalidad: string | null;
  enlace_virtual: string | null;
  ubicacion: string | null;
};

type DocRow = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  case_id: string | null;
  description: string | null;
  shared_with_client: boolean;
  created_at: string;
  uploaded_by: string;
};

type Notificacion = {
  id: string;
  case_id: string | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
};

const menuItems = [
  { id: "casos", icon: Briefcase, label: "Gestión de Casos" },
  { id: "calendario", icon: CalendarDays, label: "Calendario de Audiencias" },
  { id: "terminos", icon: Clock, label: "Control de Términos" },
  { id: "documentos", icon: Upload, label: "Gestión Documental" },
  { id: "analitica", icon: BarChart3, label: "Analítica y KPIs" },
  { id: "notificaciones", icon: Bell, label: "Notificaciones" },
  { id: "clientes", icon: Users, label: "Clientes" },
  { id: "comentarios", icon: MessageSquare, Send, label: "Comentarios del Director" },
];

const DashboardAbogado = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("casos");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [casos, setCasos] = useState<Caso[]>([]);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>([]);
  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);
  const [documentos, setDocumentos] = useState<DocRow[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);

  const reload = async () => {
    if (!user) return;
    setLoading(true);
    const { data: cs } = await supabase.from("cases").select("*").eq("abogado_id", user.id).order("created_at", { ascending: false });
    const ids = (cs ?? []).map((c) => c.id);
    if (ids.length > 0) {
      const [{ data: acts }, { data: auds }, { data: docs }] = await Promise.all([
        supabase.from("actuaciones").select("*").in("case_id", ids).order("vence_at", { ascending: true, nullsFirst: false }),
        supabase.from("audiencias").select("*").in("case_id", ids).order("fecha_inicio", { ascending: true }),
        supabase.from("documents").select("id, file_name, file_path, file_size, case_id, description, shared_with_client, created_at, uploaded_by").in("case_id", ids).order("created_at", { ascending: false }),
      ]);
      setActuaciones((acts ?? []) as any);
      setAudiencias((auds ?? []) as any);
      setDocumentos((docs ?? []) as any);
    } else {
      setActuaciones([]); setAudiencias([]); setDocumentos([]);
    }
    setCasos((cs ?? []) as any);

    const { data: notifs } = await supabase
      .from("notificaciones")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setNotificaciones((notifs ?? []) as any);

    setLoading(false);
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [user?.id]);

  // ── Realtime: refresca cuando cambia algo en la BD relacionado con el abogado
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("abogado-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cases", filter: `abogado_id=eq.${user.id}` }, () => reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "actuaciones" }, () => reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "audiencias" }, () => reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, () => reload())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notificaciones", filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as Notificacion;
        toast({ title: n.titulo, description: n.mensaje });
        setNotificaciones((prev) => [n, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notificaciones", filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as Notificacion;
        setNotificaciones((prev) => prev.map((p) => (p.id === n.id ? n : p)));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [user?.id]);

  const handleLogout = async () => { await signOut(); navigate("/"); };
  const openCaso = casos.find((c) => c.id === openCaseId) ?? null;
  const unread = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 gradient-navy flex-col border-r border-accent/10 fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span className="font-display text-lg font-bold text-primary-foreground">Jurova</span>
          </div>
          <p className="font-body text-[10px] text-primary-foreground/40 mt-1">Panel del Abogado</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setOpenCaseId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                activeSection === item.id
                  ? "bg-accent/15 text-accent"
                  : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "notificaciones" && unread > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">{unread}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-accent/10 space-y-1">
          <button onClick={() => navigate("/cambiar-password")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5 transition-colors">
            <KeyRound className="w-4 h-4" /> Cambiar contraseña
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/40 hover:text-primary-foreground hover:bg-accent/5 transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
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

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-14 bottom-0 w-64 gradient-navy border-r border-accent/10 flex flex-col">
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveSection(item.id); setOpenCaseId(null); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${activeSection === item.id ? "bg-accent/15 text-accent" : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5"}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === "notificaciones" && unread > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">{unread}</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-accent/10 space-y-1">
              <button onClick={() => { navigate("/cambiar-password"); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/5"><KeyRound className="w-4 h-4" />Cambiar contraseña</button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-primary-foreground/40 hover:text-primary-foreground hover:bg-accent/5"><LogOut className="w-4 h-4" />Cerrar Sesión</button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="p-6 md:p-8">
          {activeSection === "casos" && (
            openCaso
              ? <CaseDetail
                  caso={openCaso}
                  actuaciones={actuaciones.filter(a => a.case_id === openCaso.id)}
                  audiencias={audiencias.filter(a => a.case_id === openCaso.id)}
                  documentos={documentos.filter(d => d.case_id === openCaso.id)}
                  onBack={() => setOpenCaseId(null)}
                  onChanged={reload}
                  userId={user?.id ?? ""}
                />
              : <SeccionCasos casos={casos} loading={loading} onOpen={setOpenCaseId} />
          )}
          {activeSection === "calendario" && <SeccionCalendario casos={casos} audiencias={audiencias} onOpenCase={(id) => { setActiveSection("casos"); setOpenCaseId(id); }} onChanged={reload} />}
          {activeSection === "terminos" && <SeccionTerminos casos={casos} actuaciones={actuaciones} onOpenCase={(id) => { setActiveSection("casos"); setOpenCaseId(id); }} onChanged={reload} />}
          {activeSection === "documentos" && (
            <>
              <SectionHeader title="Gestión Documental" description="Sube y descarga documentos vinculados a tus casos." />
              <GestionDocumentos mode="abogado" />
            </>
          )}
          {activeSection === "analitica" && <SeccionAnalitica casos={casos} actuaciones={actuaciones} audiencias={audiencias} />}
          {activeSection === "notificaciones" && <SeccionNotificaciones notificaciones={notificaciones} casos={casos} onOpenCase={(id) => { setActiveSection("casos"); setOpenCaseId(id); }} onChanged={reload} />}
          {activeSection === "clientes" && <SeccionClientes casos={casos} />}
          {activeSection === "comentarios" && <SeccionComentariosAbogado />}
        </div>
      </main>
    </div>
  );
};

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
    <p className="font-body text-sm text-muted-foreground mt-2">{description}</p>
  </div>
);

/* ── Sección Casos ── */
const SeccionCasos = ({ casos, loading, onOpen }: { casos: Caso[]; loading: boolean; onOpen: (id: string) => void }) => (
  <>
    <SectionHeader title="Gestión de Casos" description="Administra todos los casos asignados y su flujo de trabajo" />
    {loading ? (
      <p className="font-body text-sm text-muted-foreground">Cargando casos...</p>
    ) : casos.length === 0 ? (
      <div className="bg-card rounded-xl border border-border p-10 text-center">
        <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-display text-base font-semibold text-foreground">Sin casos asignados</p>
        <p className="font-body text-xs text-muted-foreground mt-1">El director te asignará casos próximamente.</p>
      </div>
    ) : (
      <div className="grid gap-4">
        {casos.map((caso) => (
          <button key={caso.id} onClick={() => onOpen(caso.id)} className="text-left bg-card rounded-xl border border-border p-5 hover:border-accent/30 hover:shadow-luxury transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg gradient-navy flex items-center justify-center">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-foreground">Caso {caso.radicado}</p>
                    {caso.urgente && <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Urgente</span>}
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{caso.cliente_nombre} · {caso.tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-body px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">{caso.etapa}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </>
);

/* ── Detalle de Caso ── */
const formatBytes = (n: number | null) => {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const CaseDetail = ({ caso, actuaciones, audiencias, documentos, onBack, onChanged, userId }: {
  caso: Caso; actuaciones: Actuacion[]; audiencias: Audiencia[]; documentos: DocRow[];
  onBack: () => void; onChanged: () => void; userId: string;
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [etapa, setEtapa] = useState<Etapa>(caso.etapa);
  const [savingEtapa, setSavingEtapa] = useState(false);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [savingCom, setSavingCom] = useState(false);
  const [authorsMap, setAuthorsMap] = useState<Record<string, string>>({});

  const loadComentarios = async () => {
    const { data } = await supabase
      .from("case_comments")
      .select("id, texto, author_id, created_at, abogado_id")
      .eq("case_id", caso.id)
      .order("created_at", { ascending: true });
    const rows = data ?? [];
    const ids = Array.from(new Set(rows.map((r: any) => r.author_id).filter(Boolean)));
    let map: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      (profs ?? []).forEach((p: any) => { map[p.id] = p.full_name; });
    }
    setAuthorsMap(map);
    setComentarios(rows);
  };

  useEffect(() => { loadComentarios(); }, [caso.id]);

  const enviarComentario = async () => {
    if (!nuevoComentario.trim() || !user) return;
    setSavingCom(true);
    const { error } = await supabase.from("case_comments").insert({
      case_id: caso.id,
      author_id: user.id,
      abogado_id: user.id,
      texto: nuevoComentario.trim(),
    });
    if (!error) {
      // Notificar al director
      const { data: jefeRoles } = await supabase.from("user_roles").select("user_id").eq("role", "jefe");
      const jefeId = jefeRoles?.[0]?.user_id;
      if (jefeId) {
        await supabase.from("notifications").insert({
          user_id: jefeId,
          tipo: "comentario",
          titulo: "Nuevo comentario de abogado",
          mensaje: `El abogado dejó un comentario en el caso #${caso.radicado}: "${nuevoComentario.trim().slice(0, 80)}${nuevoComentario.length > 80 ? "…" : ""}"`,
          case_id: caso.id,
        });
      }
      setNuevoComentario("");
      loadComentarios();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSavingCom(false);
  };

  const [newAct, setNewAct] = useState({ tipo: "", descripcion: "", vence_at: "", termino_dias: "" });
  const [savingAct, setSavingAct] = useState(false);
  const [openActDialog, setOpenActDialog] = useState(false);

  const [newAud, setNewAud] = useState({ titulo: "", tipo: "audiencia", fecha_inicio: "", modalidad: "presencial", enlace_virtual: "", ubicacion: "" });
  const [savingAud, setSavingAud] = useState(false);
  const [openAudDialog, setOpenAudDialog] = useState(false);

  const cambiarEtapa = async (nueva: Etapa) => {
    setEtapa(nueva); setSavingEtapa(true);
    const { error } = await supabase.from("cases").update({ etapa: nueva as any }).eq("id", caso.id);
    setSavingEtapa(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Etapa actualizada", description: `El caso ahora está en ${nueva}.` });
    onChanged();
  };

  const crearActuacion = async () => {
    if (!newAct.tipo || !newAct.descripcion) { toast({ title: "Faltan datos", description: "Tipo y descripción son obligatorios", variant: "destructive" }); return; }
    setSavingAct(true);
    const { error } = await supabase.from("actuaciones").insert({
      case_id: caso.id, tipo: newAct.tipo, descripcion: newAct.descripcion,
      vence_at: newAct.vence_at || null, termino_dias: newAct.termino_dias ? Number(newAct.termino_dias) : null,
      created_by: userId,
    });
    setSavingAct(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Actuación registrada" });
    setNewAct({ tipo: "", descripcion: "", vence_at: "", termino_dias: "" });
    setOpenActDialog(false);
    onChanged();
  };

  const marcarCumplida = async (act: Actuacion) => {
    const { error } = await supabase.from("actuaciones").update({ cumplida: !act.cumplida }).eq("id", act.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    onChanged();
  };

  const eliminarActuacion = async (act: Actuacion) => {
    if (!confirm(`¿Eliminar actuación "${act.tipo}"?`)) return;
    const { error } = await supabase.from("actuaciones").delete().eq("id", act.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Actuación eliminada" });
    onChanged();
  };

  const crearAudiencia = async () => {
    if (!newAud.titulo || !newAud.fecha_inicio) { toast({ title: "Faltan datos", description: "Título y fecha son obligatorios", variant: "destructive" }); return; }
    setSavingAud(true);
    const { error } = await supabase.from("audiencias").insert({
      case_id: caso.id, titulo: newAud.titulo, tipo: newAud.tipo,
      fecha_inicio: new Date(newAud.fecha_inicio).toISOString(),
      modalidad: newAud.modalidad,
      enlace_virtual: newAud.enlace_virtual || null,
      ubicacion: newAud.ubicacion || null,
      created_by: userId,
    });
    setSavingAud(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Audiencia agendada" });
    setNewAud({ titulo: "", tipo: "audiencia", fecha_inicio: "", modalidad: "presencial", enlace_virtual: "", ubicacion: "" });
    setOpenAudDialog(false);
    onChanged();
  };

  const eliminarAudiencia = async (aud: Audiencia) => {
    if (!confirm(`¿Eliminar audiencia "${aud.titulo}"?`)) return;
    const { error } = await supabase.from("audiencias").delete().eq("id", aud.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Audiencia eliminada" });
    onChanged();
  };

  const descargarDoc = async (d: DocRow) => {
    const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(d.file_path, 60);
    if (error || !data?.signedUrl) { toast({ title: "Error", description: error?.message ?? "No se pudo descargar", variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a casos
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-foreground">Caso {caso.radicado}</h1>
            {caso.urgente && <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Urgente</span>}
          </div>
          <p className="font-body text-sm text-muted-foreground mt-1">{caso.cliente_nombre} · {caso.tipo}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Etapa:</Label>
          <Select value={etapa} onValueChange={(v) => cambiarEtapa(v as Etapa)} disabled={savingEtapa}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ETAPAS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {caso.observaciones && (
        <div className="bg-muted/30 rounded-lg border border-border p-4 mb-6">
          <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Observaciones del jefe</p>
          <p className="font-body text-sm text-foreground">{caso.observaciones}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Actuaciones */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Actuaciones</h2>
            <Dialog open={openActDialog} onOpenChange={setOpenActDialog}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Nueva</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nueva actuación</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Tipo</Label><Input value={newAct.tipo} onChange={(e) => setNewAct({ ...newAct, tipo: e.target.value })} placeholder="Ej. Memorial, Auto, Notificación" /></div>
                  <div><Label>Descripción</Label><Textarea value={newAct.descripcion} onChange={(e) => setNewAct({ ...newAct, descripcion: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Vence el</Label><Input type="date" value={newAct.vence_at} onChange={(e) => setNewAct({ ...newAct, vence_at: e.target.value })} /></div>
                    <div><Label>Término (días)</Label><Input type="number" value={newAct.termino_dias} onChange={(e) => setNewAct({ ...newAct, termino_dias: e.target.value })} /></div>
                  </div>
                  <Button onClick={crearActuacion} disabled={savingAct} className="w-full">{savingAct ? "Guardando..." : "Crear actuación"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {actuaciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin actuaciones registradas.</p>
          ) : (
            <ul className="space-y-3">
              {actuaciones.map((a) => (
                <li key={a.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">{a.tipo}</p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{a.descripcion}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span>Fecha: {new Date(a.fecha).toLocaleDateString("es-CO")}</span>
                        {a.vence_at && <span>Vence: {new Date(a.vence_at).toLocaleDateString("es-CO")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => marcarCumplida(a)} className={`p-1.5 rounded-md ${a.cumplida ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground hover:text-foreground"}`} title={a.cumplida ? "Marcar pendiente" : "Marcar cumplida"}>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => eliminarActuacion(a)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-destructive" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Audiencias */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Audiencias</h2>
            <Dialog open={openAudDialog} onOpenChange={setOpenAudDialog}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Agendar</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nueva audiencia</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Título</Label><Input value={newAud.titulo} onChange={(e) => setNewAud({ ...newAud, titulo: e.target.value })} /></div>
                  <div><Label>Fecha y hora</Label><Input type="datetime-local" value={newAud.fecha_inicio} onChange={(e) => setNewAud({ ...newAud, fecha_inicio: e.target.value })} /></div>
                  <div>
                    <Label>Modalidad</Label>
                    <Select value={newAud.modalidad} onValueChange={(v) => setNewAud({ ...newAud, modalidad: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="mixta">Mixta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newAud.modalidad !== "presencial" && (
                    <div><Label>Enlace virtual</Label><Input value={newAud.enlace_virtual} onChange={(e) => setNewAud({ ...newAud, enlace_virtual: e.target.value })} placeholder="https://meet.google.com/..." /></div>
                  )}
                  {newAud.modalidad !== "virtual" && (
                    <div><Label>Ubicación</Label><Input value={newAud.ubicacion} onChange={(e) => setNewAud({ ...newAud, ubicacion: e.target.value })} placeholder="Sala 3, Palacio de Justicia" /></div>
                  )}
                  <Button onClick={crearAudiencia} disabled={savingAud} className="w-full">{savingAud ? "Guardando..." : "Agendar audiencia"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {audiencias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin audiencias programadas.</p>
          ) : (
            <ul className="space-y-3">
              {audiencias.map((a) => (
                <li key={a.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">{a.titulo}</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">{new Date(a.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        {a.modalidad === "virtual" || a.enlace_virtual ? (
                          <a href={a.enlace_virtual ?? "#"} target="_blank" rel="noopener" className="flex items-center gap-1 text-accent hover:underline">
                            <Video className="w-3 h-3" /> Abrir enlace
                          </a>
                        ) : null}
                        {a.ubicacion && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.ubicacion}</span>}
                      </div>
                    </div>
                    <button onClick={() => eliminarAudiencia(a)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-destructive" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Comentarios del caso */}
      <div className="bg-card rounded-xl border border-accent/20 p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Comentarios ({comentarios.length})
          </h2>
        </div>

        {/* Lista de comentarios */}
        <div className="space-y-3 mb-4 max-h-72 overflow-auto">
          {comentarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay comentarios aún. Sé el primero en dejar una nota.</p>
          ) : comentarios.map((c: any) => {
            const esMio = c.author_id === user?.id;
            const nombre = authorsMap[c.author_id] ?? (esMio ? "Tú" : "Director");
            return (
              <div key={c.id} className={`flex gap-3 ${esMio ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-xs ${esMio ? "bg-accent text-primary-foreground" : "gradient-navy text-accent"}`}>
                  {nombre.charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-[75%] ${esMio ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-2.5 ${esMio ? "bg-accent/15 rounded-tr-none" : "bg-muted rounded-tl-none"}`}>
                    <p className="font-body text-xs font-semibold text-foreground mb-1">{esMio ? "Tú" : nombre}</p>
                    <p className="font-body text-sm text-foreground whitespace-pre-line">{c.texto}</p>
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground mt-1 px-1">
                    {new Date(c.created_at).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input nuevo comentario */}
        <div className="flex gap-2 border-t border-border pt-4">
          <Textarea
            value={nuevoComentario}
            onChange={e => setNuevoComentario(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarComentario(); } }}
            placeholder="Escribe un comentario al director… (Enter para enviar)"
            className="resize-none min-h-[44px] max-h-32 text-sm"
            rows={1}
          />
          <Button
            type="button"
            onClick={enviarComentario}
            disabled={savingCom || !nuevoComentario.trim()}
            className="gradient-gold text-primary border-0 px-3 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Documentos del caso */}
      <div className="bg-card rounded-xl border border-border p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Documentos del caso</h2>
          <span className="text-xs text-muted-foreground">{documentos.length} archivo(s)</span>
        </div>
        {documentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin documentos vinculados a este caso. Súbelos desde "Gestión Documental".</p>
        ) : (
          <ul className="grid gap-2">
            {documentos.map((d) => (
              <li key={d.id} className="flex items-center gap-3 border border-border rounded-lg p-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-foreground truncate">{d.file_name}</p>
                  <p className="font-body text-[11px] text-muted-foreground">
                    {formatBytes(d.file_size)} · {new Date(d.created_at).toLocaleString("es-CO")}
                    {d.uploaded_by !== userId && " · Enviado por el jefe"}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => descargarDoc(d)} className="text-xs gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

/* ── Calendario ── */
const SeccionCalendario = ({ casos, audiencias, onOpenCase, onChanged }: { casos: Caso[]; audiencias: Audiencia[]; onOpenCase: (id: string) => void; onChanged: () => void }) => {
  const { toast } = useToast();
  const casoMap = useMemo(() => Object.fromEntries(casos.map(c => [c.id, c.radicado])), [casos]);
  const futuras = audiencias.filter(a => new Date(a.fecha_inicio) >= new Date()).slice(0, 50);

  const eliminar = async (e: React.MouseEvent, aud: Audiencia) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar audiencia "${aud.titulo}"?`)) return;
    const { error } = await supabase.from("audiencias").delete().eq("id", aud.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Audiencia eliminada" });
    onChanged();
  };

  return (
    <>
      <SectionHeader title="Calendario de Audiencias" description="Audiencias programadas en tus casos" />
      {futuras.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay audiencias programadas.</p>
      ) : (
        <div className="grid gap-4">
          {futuras.map((ev) => (
            <button key={ev.id} onClick={() => onOpenCase(ev.case_id)} className="text-left bg-card rounded-xl border border-border p-5 flex items-center justify-between gap-4 hover:border-accent/30 hover:shadow-luxury transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-accent" /></div>
                <div>
                  <p className="font-display text-base font-semibold text-foreground">{ev.titulo}</p>
                  <p className="font-body text-xs text-muted-foreground">Caso {casoMap[ev.case_id] ?? "—"} · {ev.modalidad}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-body text-sm font-medium text-foreground">{new Date(ev.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</p>
                  {ev.enlace_virtual && <a onClick={(e) => e.stopPropagation()} href={ev.enlace_virtual} target="_blank" rel="noopener" className="font-body text-[10px] text-accent underline">Abrir videoconferencia</a>}
                </div>
                <button onClick={(e) => eliminar(e, ev)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-destructive" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

/* ── Términos ── */
const SeccionTerminos = ({ casos, actuaciones, onOpenCase, onChanged }: { casos: Caso[]; actuaciones: Actuacion[]; onOpenCase: (id: string) => void; onChanged: () => void }) => {
  const { toast } = useToast();
  const casoMap = useMemo(() => Object.fromEntries(casos.map(c => [c.id, c])), [casos]);
  const pendientes = actuaciones.filter(a => a.vence_at && !a.cumplida);
  const today = new Date(); today.setHours(0,0,0,0);
  const [tab, setTab] = useState<"activos" | "plazos">("activos");
  const [areasTerminos, setAreasTerminos] = useState<Record<string, { etapa: string; dias_plazo: number; descripcion: string }[]>>({});
  const [loadingPlazos, setLoadingPlazos] = useState(false);
  const [areaActiva, setAreaActiva] = useState<string>("");

  useEffect(() => {
    if (tab !== "plazos") return;
    setLoadingPlazos(true);
    (async () => {
      const { data } = await supabase.from("terminos_procesales").select("area, etapa, dias_plazo, descripcion").order("area").order("etapa");
      const map: Record<string, { etapa: string; dias_plazo: number; descripcion: string }[]> = {};
      (data ?? []).forEach((t: any) => {
        if (!map[t.area]) map[t.area] = [];
        map[t.area].push({ etapa: t.etapa, dias_plazo: t.dias_plazo, descripcion: t.descripcion });
      });
      setAreasTerminos(map);
      const areas = Object.keys(map);
      if (areas.length > 0 && !areaActiva) setAreaActiva(areas[0]);
      setLoadingPlazos(false);
    })();
  }, [tab]);

  const eliminar = async (e: React.MouseEvent, act: Actuacion) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el término "${act.tipo}"?`)) return;
    const { error } = await supabase.from("actuaciones").delete().eq("id", act.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Término eliminado" });
    onChanged();
  };

  return (
    <>
      <SectionHeader title="Control de Términos" description="Plazos procesales activos y plazos configurados por el director." />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {([
          { id: "activos", label: `Términos activos (${pendientes.length})` },
          { id: "plazos", label: "Plazos por área" },
        ] as const).map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`font-body text-sm px-4 py-2 border-b-2 transition-colors ${tab === t.id ? "border-accent text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "activos" && (
        pendientes.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
            <p className="font-body text-sm text-muted-foreground">No hay términos pendientes.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendientes.map((t) => {
              const vence = new Date(t.vence_at!);
              const diasRestantes = Math.ceil((vence.getTime() - today.getTime()) / 86400000);
              const total = t.termino_dias ?? 15;
              const transcurridos = total - diasRestantes;
              const pct = Math.max(0, Math.min(100, (transcurridos / total) * 100));
              const urgente = diasRestantes <= 2;
              const vencido = diasRestantes < 0;
              const caso = casoMap[t.case_id];
              return (
                <button key={t.id} onClick={() => onOpenCase(t.case_id)} className="text-left bg-card rounded-xl border border-border p-5 hover:border-accent/30 hover:shadow-luxury transition-all">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="flex items-center gap-3">
                      {(urgente || vencido) && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      <div>
                        <p className="font-display text-base font-semibold text-foreground">{t.tipo}</p>
                        <p className="font-body text-xs text-muted-foreground">Caso {caso?.radicado ?? "—"} · {t.descripcion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-body text-sm font-semibold ${urgente || vencido ? "text-destructive" : "text-foreground"}`}>
                        {vencido ? `Vencido hace ${Math.abs(diasRestantes)} d` : `${diasRestantes} días restantes`}
                      </span>
                      <button onClick={(e) => eliminar(e, t)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-destructive" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted">
                    <div className={`h-2 rounded-full transition-all ${urgente || vencido ? "bg-destructive" : "bg-accent"}`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}

      {tab === "plazos" && (
        loadingPlazos ? (
          <p className="font-body text-sm text-muted-foreground">Cargando plazos…</p>
        ) : Object.keys(areasTerminos).length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">No hay plazos configurados aún.</p>
        ) : (
          <>
            {/* Selector de área */}
            <div className="flex gap-2 flex-wrap mb-6">
              {Object.keys(areasTerminos).map(a => (
                <button key={a} type="button" onClick={() => setAreaActiva(a)}
                  className={`font-body text-xs px-4 py-2 rounded-full border transition-colors ${areaActiva === a ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                  {a}
                </button>
              ))}
            </div>

            {areaActiva && areasTerminos[areaActiva] && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <p className="font-display text-base font-semibold text-foreground">{areaActiva}</p>
                  <p className="font-body text-xs text-muted-foreground">Plazos en días por etapa — configurados por el director</p>
                </div>
                <div className="divide-y divide-border">
                  {areasTerminos[areaActiva].map(t => (
                    <div key={t.etapa} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{t.etapa}</p>
                        {t.descripcion && <p className="font-body text-xs text-muted-foreground mt-0.5">{t.descripcion}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xl font-bold text-accent">{t.dias_plazo}</span>
                        <span className="font-body text-xs text-muted-foreground">días</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      )}
    </>
  );
};

/* ── Analítica ── */
const SeccionAnalitica = ({ casos, actuaciones, audiencias }: { casos: Caso[]; actuaciones: Actuacion[]; audiencias: Audiencia[] }) => {
  const activos = casos.filter(c => c.etapa !== "Cerrado").length;
  const cerrados = casos.filter(c => c.etapa === "Cerrado").length;
  const today = new Date(); today.setHours(0,0,0,0);
  const proximasAudiencias = audiencias.filter(a => new Date(a.fecha_inicio) >= today).length;
  const terminosPendientes = actuaciones.filter(a => a.vence_at && !a.cumplida).length;
  const cumplidas = actuaciones.filter(a => a.cumplida).length;

  const porEtapa = Object.entries(casos.reduce<Record<string, number>>((acc, c) => { acc[c.etapa] = (acc[c.etapa] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const porTipo = Object.entries(casos.reduce<Record<string, number>>((acc, c) => { acc[c.tipo || "—"] = (acc[c.tipo || "—"] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const actuacionesData = [
    { name: "Cumplidas", value: cumplidas },
    { name: "Pendientes", value: terminosPendientes },
  ].filter(d => d.value > 0);

  const kpis = [
    { label: "Casos Activos", value: activos, color: "from-indigo-500 to-violet-500", icon: Briefcase },
    { label: "Casos Cerrados", value: cerrados, color: "from-emerald-500 to-teal-500", icon: TrendingUp },
    { label: "Audiencias Próximas", value: proximasAudiencias, color: "from-sky-500 to-cyan-500", icon: CalendarDays },
    { label: "Términos Pendientes", value: terminosPendientes, color: "from-rose-500 to-orange-500", icon: AlertTriangle },
  ];

  return (
    <>
      <SectionHeader title="Analítica y KPIs" description="Indicadores en tiempo real de tu carga laboral" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-xl p-5 text-white shadow-luxury bg-gradient-to-br ${k.color}`}>
            <div className="flex items-center justify-between">
              <p className="font-body text-xs uppercase tracking-wider opacity-80">{k.label}</p>
              <k.icon className="w-4 h-4 opacity-80" />
            </div>
            <p className="font-display text-3xl font-bold mt-2">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="font-display text-base font-semibold text-foreground mb-4">Casos por Etapa</p>
          <div className="h-64"><RPieChart data={porEtapa} /></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="font-display text-base font-semibold text-foreground mb-4">Casos por Tipo</p>
          <div className="h-64"><RBarChart data={porTipo} /></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="font-display text-base font-semibold text-foreground mb-4">Actuaciones</p>
          <div className="h-64"><RPieChart data={actuacionesData} /></div>
        </div>
      </div>
    </>
  );
};

/* ── Notificaciones (REALES desde tabla notificaciones) ── */
const SeccionNotificaciones = ({ notificaciones, casos, onOpenCase, onChanged }: { notificaciones: Notificacion[]; casos: Caso[]; onOpenCase: (id: string) => void; onChanged: () => void }) => {
  const { toast } = useToast();
  const casosIds = useMemo(() => new Set(casos.map(c => c.id)), [casos]);

  const onClick = async (n: Notificacion) => {
    if (!n.leida) {
      await supabase.from("notificaciones").update({ leida: true }).eq("id", n.id);
      onChanged();
    }
    if (n.case_id && casosIds.has(n.case_id)) onOpenCase(n.case_id);
  };

  const marcarTodas = async () => {
    const ids = notificaciones.filter(n => !n.leida).map(n => n.id);
    if (ids.length === 0) return;
    await supabase.from("notificaciones").update({ leida: true }).in("id", ids);
    onChanged();
    toast({ title: "Todas marcadas como leídas" });
  };

  const eliminar = async (e: React.MouseEvent, n: Notificacion) => {
    e.stopPropagation();
    await supabase.from("notificaciones").delete().eq("id", n.id);
    onChanged();
  };

  return (
    <>
      <div className="flex items-end justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Notificaciones</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">Eventos de tus casos en tiempo real</p>
        </div>
        {notificaciones.some(n => !n.leida) && (
          <Button size="sm" variant="outline" onClick={marcarTodas}>Marcar todas como leídas</Button>
        )}
      </div>
      {notificaciones.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tienes notificaciones.</p>
      ) : (
        <div className="grid gap-3">
          {notificaciones.map((n) => (
            <div key={n.id} onClick={() => onClick(n)} className={`cursor-pointer bg-card rounded-xl border p-4 flex items-start gap-4 hover:border-accent/30 transition-all ${n.leida ? "border-border opacity-70" : "border-accent/30 bg-accent/5"}`}>
              {/* Ícono por tipo */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.tipo === "documento_recibido" ? "bg-blue-100" :
                n.tipo === "comentario" ? "bg-violet-100" :
                n.tipo === "termino_vencido" ? "bg-red-100" :
                "bg-accent/10"
              }`}>
                {n.tipo === "documento_recibido" ? <FileText className="w-5 h-5 text-blue-600" /> :
                 n.tipo === "comentario" ? <MessageSquare className="w-5 h-5 text-violet-600" /> :
                 n.tipo === "termino_vencido" ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                 <Bell className="w-5 h-5 text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {!n.leida && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
                  <p className="font-body text-sm font-semibold text-foreground">{n.titulo}</p>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{n.mensaje}</p>
                <p className="font-body text-[10px] text-muted-foreground/70 mt-1.5">{new Date(n.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); eliminar(e, n); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors flex-shrink-0" title="Eliminar">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

/* ── Clientes ── */
const SeccionClientes = ({ casos }: { casos: Caso[] }) => {
  const map = new Map<string, { nombre: string; casos: number }>();
  casos.forEach(c => {
    const cur = map.get(c.cliente_nombre) ?? { nombre: c.cliente_nombre, casos: 0 };
    cur.casos += 1; map.set(c.cliente_nombre, cur);
  });
  const clientes = Array.from(map.values());

  return (
    <>
      <SectionHeader title="Clientes" description="Clientes asociados a tus casos" />
      {clientes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no tienes clientes asignados.</p>
      ) : (
        <div className="grid gap-4">
          {clientes.map((c) => (
            <div key={c.nombre} className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Users className="w-4 h-4 text-accent" /></div>
                <p className="font-display text-base font-semibold text-foreground">{c.nombre}</p>
              </div>
              <span className="font-body text-xs px-3 py-1 rounded-full bg-accent/10 text-accent">{c.casos} caso(s)</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const SeccionComentariosAbogado = () => {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [casos, setCasos] = useState<{ id: string; radicado: string; cliente_nombre: string }[]>([]);
  const [casoFiltro, setCasoFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);

    // Traer solo comentarios del abogado actual
    const { data: comData } = await supabase
      .from("case_comments")
      .select("id, texto, case_id, author_id, created_at")
      .eq("abogado_id", user.id)
      .order("created_at", { ascending: false });

    const { data: casosData } = await supabase
      .from("cases")
      .select("id, radicado, cliente_nombre")
      .eq("abogado_id", user.id);

    // Traer perfil del autor (director)
    const authorIds = Array.from(new Set((comData ?? []).map((c: any) => c.author_id).filter(Boolean)));
    let authorsMap: Record<string, string> = {};
    if (authorIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", authorIds);
      (profs ?? []).forEach((p: any) => { authorsMap[p.id] = p.full_name; });
    }

    const enriched = (comData ?? []).map((c: any) => ({
      ...c,
      autor_nombre: authorsMap[c.author_id] ?? "Director",
      caso: (casosData ?? []).find((ca: any) => ca.id === c.case_id),
    }));

    setComentarios(enriched);
    setCasos((casosData ?? []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const filtrados = casoFiltro === "todos"
    ? comentarios
    : comentarios.filter(c => c.case_id === casoFiltro);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Comentarios del Director</h1>
        <p className="font-body text-muted-foreground mt-1">Instrucciones y notas del director sobre tus casos</p>
      </div>

      {/* Filtro por caso */}
      {casos.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            type="button"
            onClick={() => setCasoFiltro("todos")}
            className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${casoFiltro === "todos" ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/40"}`}
          >
            Todos ({comentarios.length})
          </button>
          {casos.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCasoFiltro(c.id)}
              className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${casoFiltro === c.id ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/40"}`}
            >
              #{c.radicado} ({comentarios.filter(cm => cm.case_id === c.id).length})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando comentarios…</p>
      ) : filtrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">
            {comentarios.length === 0
              ? "El director no ha dejado comentarios sobre tus casos aún."
              : "No hay comentarios para este caso."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map(c => (
            <div key={c.id} className="bg-card rounded-xl border border-accent/20 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-navy flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xs font-bold text-accent">
                      {c.autor_nombre.charAt(0).toUpperCase()}
                    </span>
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
              <p className="font-body text-sm text-foreground whitespace-pre-line leading-relaxed pl-10">
                {c.texto}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardAbogado;