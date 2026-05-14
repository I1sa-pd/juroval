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
  Scale, Briefcase, CalendarDays, BarChart3, Bell, Users,
  LogOut, Menu, X, ChevronLeft, ChevronRight, FileText, TrendingUp, AlertTriangle,
  KeyRound, ArrowLeft, Plus, Video, MapPin, CheckCircle2, Trash2, MessageSquare, Send,
  Phone, Mail,Clock,
} from "lucide-react";
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


type Notificacion = {
  id: string;
  case_id: string | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
  metadata?: {
    solicitud_id?: string;
    cliente_nombre?: string;
    cliente_email?: string;
    cliente_telefono?: string;
    motivo?: string;
  };
};

const menuItems = [
  { id: "casos", icon: Briefcase, label: "Gestión de Casos" },
  { id: "calendario", icon: CalendarDays, label: "Calendario" },
  { id: "notificaciones", icon: Bell, label: "Notificaciones" },
  { id: "clientes", icon: Users, label: "Clientes" },
  { id: "comentarios", icon: MessageSquare, label: "Comentarios del Director" },
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
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);

const reload = async () => {
    if (!user) return;
    setLoading(true);
    const { data: cs } = await supabase.from("cases").select("*").eq("abogado_id", user.id).order("created_at", { ascending: false });
    const ids = (cs ?? []).map((c) => c.id);
    if (ids.length > 0) {
      const [{ data: acts }, { data: auds }] = await Promise.all([
        supabase.from("actuaciones").select("*").in("case_id", ids).order("vence_at", { ascending: true, nullsFirst: false }),
        supabase.from("audiencias").select("*").in("case_id", ids).order("fecha_inicio", { ascending: true }),
      ]);
      setActuaciones((acts ?? []) as any);
      setAudiencias((auds ?? []) as any);
    } else {
      setActuaciones([]); setAudiencias([]);
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
                  onBack={() => setOpenCaseId(null)}
                  onChanged={reload}
                  userId={user?.id ?? ""}
                />
              :  <SeccionCasos
                   casos={casos}
                   actuaciones={actuaciones}
                    audiencias={audiencias}
                    documentos={[]}
                     loading={loading}
                        onChanged={reload}
                          userId={user?.id ?? ""}
                           onOpenCase={(id) => setOpenCaseId(id)}
                               />
             )}
          {activeSection === "calendario" && <SeccionCalendario casos={casos} audiencias={audiencias} actuaciones={actuaciones} onOpenCase={(id) => { setActiveSection("casos"); setOpenCaseId(id); }} onChanged={reload} />}
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
/* ── Sección Casos ── */
const etapas = ["Creación", "Proyección", "Recaudo Probatorio", "Revisión", "Firma", "Radicado", "Cerrado"];

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

const SeccionCasos = ({ casos, actuaciones, audiencias, documentos, loading, onChanged, userId, onOpenCase }: {
  casos: Caso[];
  actuaciones: Actuacion[];
  audiencias: Audiencia[];
  documentos: any[];
  loading: boolean;
  onChanged: () => void;
  userId: string;
onOpenCase: (id: string) => void;
}) => {
  const [busqueda, setBusqueda] = useState("");

  const casosFiltrados = casos.filter(c => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = !texto ||
      c.radicado.toLowerCase().includes(texto) ||
      c.cliente_nombre.toLowerCase().includes(texto) ||
      c.tipo.toLowerCase().includes(texto);
      return coincideBusqueda;
  });

  return (
    <>
      <SectionHeader title="Gestión de Casos" description="Tus casos asignados" />
      <div className="mb-4 flex gap-3 flex-wrap">
        <Input placeholder="Buscar por radicado, cliente o tipo…" value={busqueda} onChange={e => setBusqueda(e.target.value)} className="max-w-sm" />
      </div>
      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando casos...</p>
      ) : casosFiltrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">{casos.length === 0 ? "Sin casos asignados." : "Ningún caso coincide."}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {casosFiltrados.map(caso => (
            <div key={caso.id} className={`bg-card rounded-xl border p-5 flex items-center justify-between gap-4 ${caso.urgente ? "border-destructive/30" : "border-border"}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${caso.urgente ? "bg-destructive/10" : "gradient-navy"}`}>
                  <FileText className={`w-4 h-4 ${caso.urgente ? "text-destructive" : "text-accent"}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-sm font-semibold text-foreground">#{caso.radicado}</p>
                    {caso.urgente && <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">URGENTE</span>}
                    {(caso as any).revision_rechazada && <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Devuelto</span>}
                    <span className={`text-[11px] font-body px-2.5 py-0.5 rounded-full font-medium ${getEtapaColor(caso.etapa)}`}>{caso.etapa}</span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground truncate mt-0.5">{caso.cliente_nombre} · {caso.tipo}</p>
                  {caso.fecha_vencimiento && (
                    <p className="font-body text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> Vence {new Date(caso.fecha_vencimiento).toLocaleDateString("es-CO")}
                    </p>
                  )}
                </div>
              </div>
              <Button size="sm" onClick={() => onOpenCase(caso.id)} className="shrink-0 font-body text-xs">
                Ver detalle
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const CaseDetail = ({ caso, actuaciones, audiencias, onBack, onChanged, userId }: {
  caso: Caso; actuaciones: Actuacion[]; audiencias: Audiencia[];
  onBack: () => void; onChanged: () => void; userId: string;
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [savingCom, setSavingCom] = useState(false);
  const [authorsMap, setAuthorsMap] = useState<Record<string, string>>({});
  const [openRevisionDialog, setOpenRevisionDialog] = useState(false);
const [archivoRevision, setArchivoRevision] = useState<File | null>(null);
const [savingRevision, setSavingRevision] = useState(false);

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
  useEffect(() => {
    const ch = supabase.channel(`comments-${caso.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "case_comments", filter: `case_id=eq.${caso.id}` }, () => loadComentarios())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [caso.id]);

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
        await supabase.from("notificaciones").insert({
          user_id: jefeId,
          case_id: caso.id,
          tipo: "comentario_abogado",
          titulo: "Nuevo comentario de abogado",
          mensaje: `El abogado dejó un comentario en el caso #${caso.radicado}: "${nuevoComentario.trim().slice(0, 80)}${nuevoComentario.length > 80 ? "…" : ""}"`
        });
      }
      setNuevoComentario("");
      loadComentarios();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSavingCom(false);
  };

  const enviarRevision = async () => {
  if (!archivoRevision) {
    toast({ title: "Adjunta un documento", description: "El documento es obligatorio para enviar a revisión.", variant: "destructive" });
    return;
  }
  if (!user) return;
  setSavingRevision(true);

  const ext = archivoRevision.name.split(".").pop();
  const filePath = `${caso.id}/${Date.now()}_revision.${ext}`;
  const { error: uploadError } = await supabase.storage.from("case-documents").upload(filePath, archivoRevision);
  if (uploadError) {
    toast({ title: "Error al subir el archivo", description: uploadError.message, variant: "destructive" });
    setSavingRevision(false);
    return;
  }

  await supabase.from("documents").insert({
    case_id: caso.id,
    uploaded_by: user.id,
    file_name: archivoRevision.name,
    file_path: filePath,
    file_size: archivoRevision.size,
    description: "Documento enviado a revisión",
    shared_with_client: false,
  });

  const etapaAnterior = caso.etapa;
  await supabase.from("cases").update({ etapa: "Revisión" as any, revision_rechazada: false } as any).eq("id", caso.id);

  const { data: jefeRoles } = await supabase.from("user_roles").select("user_id").eq("role", "jefe");
  const jefeId = jefeRoles?.[0]?.user_id;
  if (jefeId) {
    await supabase.from("notificaciones").insert({
      user_id: jefeId,
      case_id: caso.id,
      tipo: "revision_enviada",
      titulo: "Caso enviado a revisión",
      mensaje: `El abogado ${user.email} envió el caso #${caso.radicado} (${caso.cliente_nombre}) a revisión. Etapa: ${etapaAnterior}. Documento: ${archivoRevision.name}`,
      metadata: {
        abogado_id: user.id,
        etapa_anterior: etapaAnterior,
        doc_nombre: archivoRevision.name,
        doc_path: filePath,
      }
    });
  }

  setSavingRevision(false);
  setOpenRevisionDialog(false);
  setArchivoRevision(null);
  toast({ title: "Caso enviado a revisión", description: "El director ha sido notificado." });
  onChanged();
};



  const [newAct, setNewAct] = useState({ tipo: "", descripcion: "", vence_at: "", termino_dias: "" });
  const [savingAct, setSavingAct] = useState(false);
  const [openActDialog, setOpenActDialog] = useState(false);

  const [newAud, setNewAud] = useState({ titulo: "", tipo: "audiencia", fecha_inicio: "", modalidad: "presencial", enlace_virtual: "", ubicacion: "" });
  const [savingAud, setSavingAud] = useState(false);
  const [openAudDialog, setOpenAudDialog] = useState(false);

  
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


  return (
    <>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a casos
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <Dialog open={openRevisionDialog} onOpenChange={setOpenRevisionDialog}>
  <DialogTrigger asChild>
    <Button
      disabled={caso.etapa === "Revisión"}
      className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold hover:opacity-90 gap-2"
    >
      {caso.etapa === "Revisión" ? "En revisión…" : "Enviar a Revisión"}
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Enviar caso a revisión</DialogTitle></DialogHeader>
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg p-3 space-y-1">
        <p className="font-body text-xs text-muted-foreground">Caso</p>
        <p className="font-body text-sm font-semibold text-foreground">#{caso.radicado} — {caso.cliente_nombre}</p>
        <p className="font-body text-xs text-muted-foreground">Etapa actual: <span className="text-foreground font-medium">{caso.etapa}</span></p>
      </div>
      <div>
        <Label className="font-body text-sm mb-2 block">Documento adjunto <span className="text-destructive">*</span></Label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={e => setArchivoRevision(e.target.files?.[0] ?? null)}
          className="w-full text-sm font-body text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent/10 file:text-accent file:font-body file:text-sm hover:file:bg-accent/20 cursor-pointer"
        />
        {archivoRevision && <p className="font-body text-xs text-accent mt-1">✓ {archivoRevision.name}</p>}
      </div>
      <p className="font-body text-xs text-muted-foreground">
        El documento se guardará en el caso y el director será notificado automáticamente.
      </p>
      <Button
        onClick={enviarRevision}
        disabled={savingRevision || !archivoRevision}
        className="w-full gradient-gold text-primary border-0 font-body font-semibold"
      >
        {savingRevision ? "Enviando…" : "Confirmar envío a revisión"}
      </Button>
    </div>
  </DialogContent>
</Dialog>
          <div>
  {(caso as any).revision_rechazada && (
    <div className="flex items-center gap-2 mb-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
      <AlertTriangle className="w-4 h-4 text-destructive" />
      <p className="font-body text-xs text-destructive font-medium">Falta revisión — El director devolvió este caso. Corrígelo y vuelve a enviarlo.</p>
    </div>
  )}
  <div className="flex items-center gap-2">
    <h1 className="font-display text-2xl font-bold text-foreground">Caso {caso.radicado}</h1>
    {caso.urgente && <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Urgente</span>}
  </div>
</div>
          <p className="font-body text-sm text-muted-foreground mt-1">{caso.cliente_nombre} · {caso.tipo}</p>
        </div>
       <span className="text-xs font-body px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
  {caso.etapa}
</span>
      </div>

      {caso.observaciones && (
        <div className="bg-muted/30 rounded-lg border border-border p-4 mb-6">
          <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Observaciones del jefe</p>
          <p className="font-body text-sm text-foreground">{caso.observaciones}</p>
        </div>
      )}

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
    </>
  );
};

/* ── Calendario visual mensual ── */
const SeccionCalendario = ({ casos, audiencias, actuaciones, onOpenCase, onChanged }: { casos: Caso[]; audiencias: Audiencia[]; actuaciones: Actuacion[]; onOpenCase: (id: string) => void; onChanged: () => void }) => {
  const { toast } = useToast();
  const [mesActual, setMesActual] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");

  const casoMap = useMemo(() => Object.fromEntries(casos.map(c => [c.id, c])), [casos]);

  // Armar eventos
  const eventos = useMemo(() => {
    const evs: any[] = [];

    // Audiencias
    audiencias.forEach((a) => {
      const caso = casoMap[a.case_id];
      if (!caso) return;
      evs.push({
        id: "aud-" + a.id,
        audId: a.id,
        case_id: a.case_id,
        fecha: a.fecha_inicio.split("T")[0],
        hora: new Date(a.fecha_inicio).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }),
        titulo: a.titulo,
        tipo: "audiencia",
        radicado: caso.radicado,
        tipoCaso: caso.tipo,
        cliente: caso.cliente_nombre,
        modalidad: a.modalidad,
        enlace: a.enlace_virtual,
        ubicacion: a.ubicacion,
      });
    });

    // Actuaciones con vencimiento no cumplidas (documentos por entregar)
    actuaciones.forEach((a) => {
      if (!a.vence_at || a.cumplida) return;
      const caso = casoMap[a.case_id];
      if (!caso) return;
      evs.push({
        id: "act-" + a.id,
        case_id: a.case_id,
        fecha: a.vence_at,
        hora: "23:59",
        titulo: a.tipo,
        subtitulo: a.descripcion,
        tipo: "documento",
        radicado: caso.radicado,
        tipoCaso: caso.tipo,
        cliente: caso.cliente_nombre,
      });
    });

    // Casos en etapa Revisión con fecha_vencimiento
    casos.forEach((c) => {
      if (c.etapa !== "Revisión" || !c.fecha_vencimiento) return;
      evs.push({
        id: "rev-" + c.id,
        case_id: c.id,
        fecha: c.fecha_vencimiento,
        hora: "23:59",
        titulo: "Revisión del caso",
        subtitulo: c.observaciones ?? undefined,
        tipo: "revision",
        radicado: c.radicado,
        tipoCaso: c.tipo,
        cliente: c.cliente_nombre,
      });
    });

    evs.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
    return evs;
  }, [audiencias, actuaciones, casos, casoMap]);

  const eliminarAudiencia = async (e: React.MouseEvent, audId: string, titulo: string) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar audiencia "${titulo}"?`)) return;
    const { error } = await supabase.from("audiencias").delete().eq("id", audId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Audiencia eliminada" });
    onChanged();
  };

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
    audiencia: { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700",   card: "border-blue-200 bg-blue-50/60",   icon: "🏛", label: "Audiencia" },
    documento: { dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700", card: "border-amber-200 bg-amber-50/60", icon: "📄", label: "Documento" },
    revision:  { dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700",card: "border-violet-200 bg-violet-50/60",icon: "⚖️", label: "Revisión" },
  };

  const EventoCard = ({ ev }: { ev: any }) => {
    const t = TIPOS[ev.tipo] ?? TIPOS.audiencia;
    return (
      <button
        type="button"
        onClick={() => onOpenCase(ev.case_id)}
        className={`w-full text-left rounded-xl border ${t.card} p-4 hover:shadow-luxury transition-all`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="text-xl flex-shrink-0">{t.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`font-body text-[10px] px-2 py-0.5 rounded-full font-medium ${t.badge}`}>{t.label}</span>
                <span className="font-body text-xs font-semibold text-foreground">{ev.hora}</span>
              </div>
              <p className="font-display text-sm font-semibold text-foreground truncate">{ev.titulo}</p>
              {ev.subtitulo && <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">{ev.subtitulo}</p>}
              <p className="font-body text-xs text-muted-foreground mt-1">
                Caso #{ev.radicado} · {ev.cliente} · {ev.tipoCaso}
              </p>
              {ev.modalidad && (
                <p className="font-body text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  {ev.modalidad === "virtual" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {ev.modalidad}{ev.ubicacion ? ` · ${ev.ubicacion}` : ""}
                </p>
              )}
              {ev.enlace && (
                <a onClick={(e) => e.stopPropagation()} href={ev.enlace} target="_blank" rel="noopener" className="inline-flex items-center gap-1 mt-2 font-body text-[10px] text-accent underline">
                  <Video className="w-3 h-3" /> Abrir videoconferencia
                </a>
              )}
            </div>
          </div>
          {ev.audId && (
            <button onClick={(e) => eliminarAudiencia(e, ev.audId, ev.titulo)} className="p-1.5 rounded-md bg-white/60 text-muted-foreground hover:text-destructive flex-shrink-0" title="Eliminar audiencia">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </button>
    );
  };

  const mesAnterior = () => {
    setDiaSeleccionado(null);
    setMesActual(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 });
  };
  const mesSiguiente = () => {
    setDiaSeleccionado(null);
    setMesActual(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 });
  };
  const irHoy = () => {
    const now = new Date();
    setMesActual({ year: now.getFullYear(), month: now.getMonth() });
    setDiaSeleccionado(hoy);
  };

  return (
    <>
      <SectionHeader title="Calendario" description="Audiencias, entregas de documentos y revisiones de tus casos" />

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button type="button" onClick={() => setFiltro("todos")}
          className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${filtro === "todos" ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/40"}`}>
          Todos ({eventos.filter(e => e.fecha >= hoy).length})
        </button>
        {Object.entries(TIPOS).map(([k, t]) => (
          <button key={k} type="button" onClick={() => setFiltro(k)}
            className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${filtro === k ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/40"}`}>
            <span>{t.icon}</span> {t.label} ({conteo(k)})
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Calendario mensual */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold text-foreground capitalize">{nombreMes}</h3>
            <div className="flex items-center gap-1">
              <button type="button" onClick={mesAnterior} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Mes anterior">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={irHoy} className="font-body text-xs px-3 py-1.5 rounded-md hover:bg-muted text-muted-foreground">
                Hoy
              </button>
              <button type="button" onClick={mesSiguiente} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Mes siguiente">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d => (
              <div key={d} className="font-body text-[10px] text-muted-foreground uppercase tracking-wider text-center py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: primerDia }).map((_,i) => <div key={"ep"+i} />)}
            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = i + 1;
              const fecha = `${year}-${String(month+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
              const evs = eventosDelDia(dia);
              const esHoy = fecha === hoy;
              const esSel = fecha === diaSeleccionado;
              return (
                <button
                  type="button"
                  key={dia}
                  onClick={() => setDiaSeleccionado(esSel ? null : fecha)}
                  className={`min-h-[64px] rounded-lg border p-1.5 text-left transition-colors ${
                    esSel ? "border-accent bg-accent/10" :
                    esHoy ? "border-accent/50 bg-accent/5" :
                    evs.length > 0 ? "border-border hover:border-accent/30 hover:bg-muted/40" :
                    "border-border/40 hover:bg-muted/30"
                  }`}
                >
                  <div className={`font-display text-xs font-semibold mb-1 ${esHoy ? "text-accent" : "text-foreground"}`}>
                    {dia}
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {evs.slice(0, 3).map(ev => (
                      <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${TIPOS[ev.tipo]?.dot ?? "bg-muted-foreground"}`} />
                    ))}
                    {evs.length > 3 && <span className="font-body text-[9px] text-muted-foreground">+{evs.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detalle del día seleccionado */}
          {diaSeleccionado && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display text-sm font-semibold text-foreground capitalize">
                  {new Date(diaSeleccionado + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <button type="button" onClick={() => setDiaSeleccionado(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground" title="Cerrar">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {eventosDiaSel.length === 0 ? (
                <p className="font-body text-xs text-muted-foreground">No hay eventos este día.</p>
              ) : (
                <div className="grid gap-2">
                  {eventosDiaSel.map(ev => <EventoCard key={ev.id} ev={ev} />)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna lateral: próximos eventos */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Próximos eventos</h3>
          {proximosEventos.length === 0 ? (
            <p className="font-body text-xs text-muted-foreground">No hay eventos próximos.</p>
          ) : (
            <div className="grid gap-2">
              {proximosEventos.map(ev => <EventoCard key={ev.id} ev={ev} />)}
            </div>
          )}
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
  n.tipo === "solicitud_contacto" ? "bg-amber-100" :
  "bg-accent/10"
}`}>
  {n.tipo === "documento_recibido" ? <FileText className="w-5 h-5 text-blue-600" /> :
   n.tipo === "comentario" ? <MessageSquare className="w-5 h-5 text-violet-600" /> :
   n.tipo === "termino_vencido" ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
   n.tipo === "solicitud_contacto" ? <Phone className="w-5 h-5 text-amber-600" /> :
   <Bell className="w-5 h-5 text-accent" />}
</div>
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2 mb-0.5">
    {!n.leida && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
    <p className="font-body text-sm font-semibold text-foreground">{n.titulo}</p>
    {n.tipo === "solicitud_contacto" && (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-body font-medium shrink-0">Solicitud de contacto</span>
    )}
  </div>
  <p className="font-body text-xs text-muted-foreground leading-relaxed">{n.mensaje}</p>
  {n.tipo === "solicitud_contacto" && n.metadata && (
    <div className="mt-2 bg-muted/40 rounded-lg px-3 py-2 space-y-1">
      {n.metadata.cliente_nombre && <p className="font-body text-xs text-foreground font-medium">{n.metadata.cliente_nombre}</p>}
      {n.metadata.cliente_email && (
        <a href={`mailto:${n.metadata.cliente_email}`} className="flex items-center gap-1 font-body text-xs text-accent hover:underline">
          <Mail className="w-3 h-3" /> {n.metadata.cliente_email}
        </a>
      )}
      {n.metadata.cliente_telefono && (
        <a href={`tel:${n.metadata.cliente_telefono}`} className="flex items-center gap-1 font-body text-xs text-accent hover:underline">
          <Phone className="w-3 h-3" /> {n.metadata.cliente_telefono}
        </a>
      )}
    </div>
  )}
  <p className="font-body text-[10px] text-muted-foreground/70 mt-1.5">{new Date(n.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</p>
</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

/* ── Clientes ── */
const SeccionClientes = ({ casos }: { casos: Caso[] }) => {
  const [expandido, setExpandido] = useState<string | null>(null);
  const [perfiles, setPerfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    const ids = [...new Set(casos.map(c => (c as any).cliente_id).filter(Boolean))];
    if (ids.length === 0) return;
    supabase.from("profiles").select("id, full_name, email, phone, cedula").in("id", ids)
      .then(({ data }) => {
        const m: Record<string, any> = {};
        (data ?? []).forEach((p: any) => { m[p.id] = p; });
        setPerfiles(m);
      });
  }, [casos]);

  const map = new Map<string, Caso[]>();
  casos.forEach(c => {
    const lista = map.get(c.cliente_nombre) ?? [];
    lista.push(c);
    map.set(c.cliente_nombre, lista);
  });
  const clientes = Array.from(map.entries());

  return (
    <>
      <SectionHeader title="Clientes" description="Clientes asociados a tus casos" />
      {clientes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no tienes clientes asignados.</p>
      ) : (
        <div className="grid gap-4">
          {clientes.map(([nombre, casosCli]) => {
            const perfil = perfiles[(casosCli[0] as any).cliente_id] ?? null;
            return (
              <div key={nombre} className="bg-card rounded-xl border border-border overflow-hidden">
                <button type="button" onClick={() => setExpandido(expandido === nombre ? null : nombre)}
                  className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center font-display font-bold text-accent">
                      {nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-display text-base font-semibold text-foreground">{nombre}</p>
                      <p className="font-body text-xs text-muted-foreground">{casosCli.length} caso(s)</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandido === nombre ? "rotate-90" : ""}`} />
                </button>

                {expandido === nombre && (
                  <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">

                    {/* Info del cliente */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Información del cliente</p>
                      <p className="font-display text-sm font-semibold text-foreground">{nombre}</p>
                      {perfil?.cedula && (
                        <p className="font-body text-xs text-muted-foreground">Cédula: <span className="text-foreground font-medium">{perfil.cedula}</span></p>
                      )}
                      {perfil?.email && (
                        <a href={`mailto:${perfil.email}`} className="flex items-center gap-1.5 font-body text-xs text-accent hover:underline">
                          <Mail className="w-3.5 h-3.5" /> {perfil.email}
                        </a>
                      )}
                      {perfil?.phone && (
                        <a href={`tel:${perfil.phone}`} className="flex items-center gap-1.5 font-body text-xs text-accent hover:underline">
                          <Phone className="w-3.5 h-3.5" /> {perfil.phone}
                        </a>
                      )}
                      {!perfil && (
                        <p className="font-body text-xs text-muted-foreground italic">Sin información de contacto registrada.</p>
                      )}
                    </div>

                    {/* Casos del cliente */}
                    <div className="space-y-3">
                      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide">Casos</p>
                      {casosCli.map(c => (
                        <div key={c.id} className={`rounded-lg border p-4 ${c.urgente ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
                          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-display text-sm font-semibold text-foreground">#{c.radicado}</p>
                                {c.urgente && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-body font-medium">Urgente</span>}
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-body font-medium ${getEtapaColor(c.etapa)}`}>{c.etapa}</span>
                              </div>
                              <p className="font-body text-xs text-muted-foreground mt-0.5">{c.tipo}</p>
                            </div>
                            {c.fecha_vencimiento && (
                              <div className="text-right shrink-0">
                                <p className="font-body text-[10px] text-muted-foreground">Vencimiento</p>
                                <p className="font-body text-xs font-medium text-foreground">{new Date(c.fecha_vencimiento).toLocaleDateString("es-CO")}</p>
                              </div>
                            )}
                          </div>
                          {c.observaciones && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Observaciones del director</p>
                              <p className="font-body text-xs text-foreground whitespace-pre-line">{c.observaciones}</p>
                            </div>
                          )}
                        </div>
                      ))}
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