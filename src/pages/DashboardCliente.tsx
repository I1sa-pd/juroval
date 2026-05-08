import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale, ArrowLeft, CalendarDays, CheckCircle, Clock,
  LogOut, KeyRound, FileText, Download, MessageSquare, Send, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const etapas = ["Creación", "Proyección", "Recaudo Probatorio", "Revisión", "Firma", "Radicado", "Cerrado"];

const DashboardCliente = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const [perfil, setPerfil] = useState<{ full_name: string } | null>(null);
  const [casos, setCasos] = useState<any[]>([]);
  const [casoActivo, setCasoActivo] = useState<any | null>(null);
  const [abogado, setAbogado] = useState<string>("");
  const [audiencias, setAudiencias] = useState<any[]>([]);
  const [actuaciones, setActuaciones] = useState<any[]>([]);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);

    // Perfil del cliente
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (prof) setPerfil(prof as any);

    // Casos del cliente
    const { data: casosData } = await supabase
      .from("cases")
      .select("id, radicado, tipo, etapa, abogado_id, observaciones, created_at, urgente, fecha_vencimiento")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false });

    const lista = casosData ?? [];
    setCasos(lista);

    const activo = lista[0] ?? null;
    setCasoActivo(activo);

    if (activo) {
      // Abogado
      if (activo.abogado_id) {
        const { data: ab } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", activo.abogado_id)
          .maybeSingle();
        setAbogado((ab as any)?.full_name ?? "");
      }

      // Audiencias
      const { data: auds } = await supabase
        .from("audiencias")
        .select("id, titulo, fecha_inicio, modalidad, enlace_virtual, ubicacion")
        .eq("case_id", activo.id)
        .order("fecha_inicio", { ascending: true });
      setAudiencias(auds ?? []);

      // Actuaciones (historial)
      const { data: acts } = await supabase
        .from("actuaciones")
        .select("id, tipo, descripcion, fecha, cumplida")
        .eq("case_id", activo.id)
        .order("fecha", { ascending: false });
      setActuaciones(acts ?? []);

      // Documentos compartidos con el cliente
      const { data: docs } = await supabase
        .from("documents")
        .select("id, file_name, file_path, file_size, created_at, mime_type")
        .eq("case_id", activo.id)
        .eq("shared_with_client", true)
        .order("created_at", { ascending: false });
      setDocumentos(docs ?? []);

      // Comentarios del caso
      const { data: coms } = await supabase
        .from("case_comments")
        .select("id, texto, author_id, created_at")
        .eq("case_id", activo.id)
        .order("created_at", { ascending: true });

      // Nombres de autores
      const authorIds = Array.from(new Set((coms ?? []).map((c: any) => c.author_id).filter(Boolean)));
      let authMap: Record<string, string> = {};
      if (authorIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", authorIds);
        (profs ?? []).forEach((p: any) => { authMap[p.id] = p.full_name; });
      }
      setComentarios((coms ?? []).map((c: any) => ({ ...c, autor: authMap[c.author_id] ?? "Equipo jurídico" })));
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleLogout = async () => { await signOut(); navigate("/"); };

  const enviarComentario = async () => {
    if (!nuevoComentario.trim() || !casoActivo || !user) return;
    setEnviando(true);
    const { error } = await supabase.from("case_comments").insert({
      case_id: casoActivo.id,
      author_id: user.id,
      abogado_id: casoActivo.abogado_id ?? null,
      texto: nuevoComentario.trim(),
    });
    if (!error) {
      // Notificar al abogado y al director
      const notifs = [];
      if (casoActivo.abogado_id) {
        notifs.push(supabase.from("notificaciones").insert({
          user_id: casoActivo.abogado_id,
          case_id: casoActivo.id,
          tipo: "comentario",
          titulo: "Mensaje del cliente",
          mensaje: `El cliente ${perfil?.full_name ?? ""} escribió sobre el caso #${casoActivo.radicado}: "${nuevoComentario.trim().slice(0, 80)}..."`,
        }));
      }
      await Promise.all(notifs);
      setNuevoComentario("");
      load();
    } else {
      toast({ title: "Error al enviar", description: error.message, variant: "destructive" });
    }
    setEnviando(false);
  };

  const descargarDoc = async (doc: any) => {
    const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(doc.file_path, 60);
    if (error || !data?.signedUrl) { toast({ title: "No se pudo descargar", variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  const proximasAudiencias = audiencias.filter(a => new Date(a.fecha_inicio) >= new Date());

  const idxEtapa = casoActivo ? etapas.indexOf(casoActivo.etapa) : -1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-navy border-b border-accent/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span className="font-display text-lg font-bold text-primary-foreground">Jurova</span>
            <span className="font-body text-[10px] text-primary-foreground/40 ml-2">Portal del Cliente</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/cambiar-password")}
              className="flex items-center gap-2 font-body text-xs text-primary-foreground/50 hover:text-accent transition-colors">
              <KeyRound className="w-3.5 h-3.5" />
              Cambiar contraseña
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 font-body text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Cargando tu información…</p>
        ) : casos.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-10 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-display text-lg font-semibold text-foreground">Sin casos activos</h2>
            <p className="font-body text-sm text-muted-foreground mt-2">
              No tienes ningún caso registrado. Contacta al bufete para más información.
            </p>
          </div>
        ) : (
          <>
            {/* Saludo */}
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Hola, {perfil?.full_name?.split(" ")[0] ?? "cliente"}
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Aquí puedes ver el estado de tu caso en tiempo real
              </p>
            </div>

            {/* Selector de caso si tiene más de uno */}
            {casos.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {casos.map(c => (
                  <button key={c.id} type="button"
                    onClick={() => { setCasoActivo(c); }}
                    className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${casoActivo?.id === c.id ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                    #{c.radicado}
                  </button>
                ))}
              </div>
            )}

            {casoActivo && (
              <>
                {/* Estado del caso */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Caso #{casoActivo.radicado}
                    </h2>
                    <span className={`text-xs font-body px-3 py-1 rounded-full font-medium ${casoActivo.etapa === "Cerrado" ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"}`}>
                      {casoActivo.etapa === "Cerrado" ? "Cerrado" : "En curso"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="font-body text-xs text-muted-foreground">Etapa actual</p>
                      <p className="font-body text-sm font-medium text-foreground mt-1">{casoActivo.etapa}</p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-muted-foreground">Tipo de proceso</p>
                      <p className="font-body text-sm font-medium text-foreground mt-1">{casoActivo.tipo}</p>
                    </div>
                    {abogado && (
                      <div>
                        <p className="font-body text-xs text-muted-foreground">Abogado asignado</p>
                        <p className="font-body text-sm font-medium text-foreground mt-1">{abogado}</p>
                      </div>
                    )}
                    {casoActivo.fecha_vencimiento && (
                      <div>
                        <p className="font-body text-xs text-muted-foreground">Fecha de vencimiento</p>
                        <p className="font-body text-sm font-medium text-foreground mt-1">
                          {new Date(casoActivo.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Progreso</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {etapas.map((et, i) => (
                        <div key={et} className="flex items-center gap-1">
                          <div className={`px-2 py-1 rounded-md text-[10px] font-body font-medium ${
                            i < idxEtapa ? "bg-accent/20 text-accent" :
                            i === idxEtapa ? "bg-accent text-primary-foreground" :
                            "bg-muted text-muted-foreground"
                          }`}>{et}</div>
                          {i < etapas.length - 1 && <span className="text-muted-foreground text-[10px]">›</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Próximas audiencias */}
                {proximasAudiencias.length > 0 && (
                  <div>
                    <h2 className="font-display text-base font-semibold text-foreground mb-3">Próximas audiencias</h2>
                    <div className="grid gap-3">
                      {proximasAudiencias.map(a => (
                        <div key={a.id} className="bg-card rounded-xl border border-accent/20 p-4 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <CalendarDays className="w-4 h-4 text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="font-body text-sm font-semibold text-foreground">{a.titulo}</p>
                            <p className="font-body text-xs text-muted-foreground mt-0.5">
                              {new Date(a.fecha_inicio).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}
                              {a.modalidad ? ` · ${a.modalidad}` : ""}
                            </p>
                            {a.ubicacion && <p className="font-body text-xs text-muted-foreground">{a.ubicacion}</p>}
                            {a.enlace_virtual && (
                              <a href={a.enlace_virtual} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 font-body text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                🔗 Unirse a la audiencia
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documentos compartidos */}
                {documentos.length > 0 && (
                  <div>
                    <h2 className="font-display text-base font-semibold text-foreground mb-3">Documentos del caso</h2>
                    <div className="bg-card rounded-xl border border-border divide-y divide-border">
                      {documentos.map(d => (
                        <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                          <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm text-foreground truncate">{d.file_name}</p>
                            <p className="font-body text-[10px] text-muted-foreground">
                              {new Date(d.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <Button type="button" size="sm" variant="outline" onClick={() => descargarDoc(d)}
                            className="font-body text-xs gap-1.5 flex-shrink-0">
                            <Download className="w-3.5 h-3.5" />
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historial de actuaciones */}
                {actuaciones.length > 0 && (
                  <div>
                    <h2 className="font-display text-base font-semibold text-foreground mb-3">Historial del proceso</h2>
                    <div className="grid gap-2">
                      {actuaciones.map(a => (
                        <div key={a.id} className="flex items-start gap-3 bg-card rounded-xl border border-border p-4">
                          {a.cumplida
                            ? <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            : <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
                          <div>
                            <p className="font-body text-sm font-medium text-foreground">{a.tipo}</p>
                            {a.descripcion && <p className="font-body text-xs text-muted-foreground mt-0.5">{a.descripcion}</p>}
                            <p className="font-body text-[10px] text-muted-foreground/70 mt-1">
                              {new Date(a.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat con el equipo */}
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    Mensajes con el equipo
                  </h2>
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    {/* Lista de mensajes */}
                    <div className="p-4 space-y-3 max-h-72 overflow-auto">
                      {comentarios.length === 0 ? (
                        <p className="font-body text-xs text-muted-foreground text-center py-4">
                          Aún no hay mensajes. Puedes escribirle al equipo jurídico aquí.
                        </p>
                      ) : comentarios.map(c => {
                        const esMio = c.author_id === user?.id;
                        return (
                          <div key={c.id} className={`flex gap-2 ${esMio ? "flex-row-reverse" : ""}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${esMio ? "bg-accent text-primary-foreground" : "gradient-navy text-accent"}`}>
                              {c.autor.charAt(0).toUpperCase()}
                            </div>
                            <div className={`max-w-[75%] flex flex-col ${esMio ? "items-end" : "items-start"}`}>
                              <div className={`rounded-2xl px-3 py-2 ${esMio ? "bg-accent/15 rounded-tr-none" : "bg-muted rounded-tl-none"}`}>
                                <p className="font-body text-[10px] font-semibold text-muted-foreground mb-0.5">{esMio ? "Tú" : c.autor}</p>
                                <p className="font-body text-sm text-foreground whitespace-pre-line">{c.texto}</p>
                              </div>
                              <p className="font-body text-[9px] text-muted-foreground mt-1 px-1">
                                {new Date(c.created_at).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Input */}
                    <div className="flex gap-2 p-3 border-t border-border">
                      <Textarea
                        value={nuevoComentario}
                        onChange={e => setNuevoComentario(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarComentario(); } }}
                        placeholder="Escribe un mensaje… (Enter para enviar)"
                        className="resize-none min-h-[40px] max-h-24 text-sm"
                        rows={1}
                      />
                      <Button type="button" onClick={enviarComentario}
                        disabled={enviando || !nuevoComentario.trim()}
                        className="gradient-gold text-primary border-0 px-3 flex-shrink-0">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCliente;