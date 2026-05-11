import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Download, Trash2, Send, Search, Eye, X } from "lucide-react";

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const RESUMABLE_THRESHOLD = 6 * 1024 * 1024;

async function uploadResumable(file: File, path: string, onProgress: (pct: number) => void): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión.");
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${url}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: { authorization: `Bearer ${token}`, "x-upsert": "false", apikey: anon },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: { bucketName: "case-documents", objectName: path, contentType: file.type || "application/octet-stream", cacheControl: "3600" },
      chunkSize: 6 * 1024 * 1024,
      onError: (err) => reject(err),
      onProgress: (sent, total) => onProgress(Math.round((sent / total) * 100)),
      onSuccess: () => resolve(),
    });
    upload.start();
  });
}

interface AbogadoOpt { id: string; full_name: string; email: string; }
interface CaseOpt { id: string; radicado: string; cliente_nombre: string; abogado_id: string | null; }
interface DocRow {
  id: string; file_name: string; file_path: string; file_size: number | null;
  mime_type: string | null; description: string | null; shared_with_client: boolean;
  created_at: string; uploaded_by: string; recipient_id: string | null; case_id: string | null;
}

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const getMimeIcon = (mime: string | null) => {
  if (!mime) return "📄";
  if (mime.includes("pdf")) return "📕";
  if (mime.includes("word") || mime.includes("document")) return "📘";
  if (mime.includes("image")) return "🖼";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "📗";
  return "📄";
};

export function GestionDocumentos({ mode }: { mode: "jefe" | "abogado" }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [abogados, setAbogados] = useState<AbogadoOpt[]>([]);
  const [casos, setCasos] = useState<CaseOpt[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [perfilesMap, setPerfilesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string; mime: string | null } | null>(null);

  const handlePreview = async (d: DocRow) => {
    const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(d.file_path, 120);
    if (error || !data?.signedUrl) { toast({ title: "No se pudo previsualizar", variant: "destructive" }); return; }
    setPreview({ url: data.signedUrl, name: d.file_name, mime: d.mime_type });
  };

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCaso, setFiltroCaso] = useState("todos");
  const [filtroAbogado, setFiltroAbogado] = useState("todos");

  // Form
  const [recipient, setRecipient] = useState("");
  const [caseId, setCaseId] = useState("");
  const [description, setDescription] = useState("");
  const [sharedWithClient, setSharedWithClient] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const loadAll = async () => {
    setLoading(true);

    if (mode === "jefe") {
      const { data: roleRows } = await supabase.from("user_roles").select("user_id").eq("role", "abogado");
      const ids = (roleRows ?? []).map((r) => r.user_id);
      if (ids.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
        setAbogados((profs ?? []) as AbogadoOpt[]);
      }
    }

    const { data: casesData } = await supabase.from("cases").select("id, radicado, cliente_nombre, abogado_id").order("created_at", { ascending: false });
    setCasos((casesData ?? []) as CaseOpt[]);

    const { data: docsData, error: docsError } = await supabase.from("documents")
      .select("id, file_name, file_path, file_size, mime_type, description, shared_with_client, created_at, uploaded_by, recipient_id, case_id")
      .order("created_at", { ascending: false });
    if (docsError) {
      toast({ title: "Error al cargar documentos", description: docsError.message, variant: "destructive" });
    }
    setDocs((docsData ?? []) as DocRow[]);

    // Load uploader names
    const uploaderIds = Array.from(new Set((docsData ?? []).map((d: any) => d.uploaded_by).filter(Boolean)));
    if (uploaderIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", uploaderIds);
      const m: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => { m[p.id] = p.full_name; });
      setPerfilesMap(m);
    }

    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [mode]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast({ title: "Selecciona un archivo", variant: "destructive" }); return; }
    if (file.size > MAX_FILE_SIZE) { toast({ title: "Archivo muy grande", description: "Máximo 250 MB", variant: "destructive" }); return; }
    if (!user) return;

    setUploading(true);
    setProgress(0);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${Date.now()}-${safeName}`;

    try {
      if (file.size > RESUMABLE_THRESHOLD) {
        await uploadResumable(file, path, setProgress);
      } else {
        const { error: upErr } = await supabase.storage.from("case-documents").upload(path, file, { cacheControl: "3600", contentType: file.type || "application/octet-stream", upsert: false });
        if (upErr) throw upErr;
        setProgress(100);
      }
    } catch (err) {
      setUploading(false); setProgress(0);
      toast({ title: "Error al subir", description: (err as Error).message, variant: "destructive" });
      return;
    }

    const { error: dbErr } = await supabase.from("documents").insert({
      uploaded_by: user.id, recipient_id: recipient || null, case_id: caseId || null,
      file_name: file.name, file_path: path, file_size: file.size,
      mime_type: file.type || null, description: description || null, shared_with_client: sharedWithClient,
    });

    setUploading(false); setProgress(0);
    if (dbErr) { toast({ title: "Error al registrar", description: dbErr.message, variant: "destructive" }); return; }
    // Notificar al abogado destinatario
    if (recipient) {
      const caso = casos.find(c => c.id === caseId);
      await supabase.from("notificaciones").insert({
        user_id: recipient,
        case_id: caseId || null,
        tipo: "documento_recibido",
        titulo: "Nuevo documento del director",
        mensaje: `El director te envió el documento "${file.name}"${caso ? ` para el caso #${caso.radicado}` : ""}.${description ? ` Nota: ${description}` : ""}`,
      });
    }
    toast({ title: "Documento enviado", description: `${file.name} fue enviado correctamente.` });
    setFile(null); setDescription(""); setRecipient(""); setCaseId(""); setSharedWithClient(false);
    if (fileRef.current) fileRef.current.value = "";
    setShowForm(false);
    loadAll();
  };

  const handleDownload = async (d: DocRow) => {
    const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(d.file_path, 60);
    if (error || !data?.signedUrl) { toast({ title: "No se pudo descargar", variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (d: DocRow) => {
    if (!confirm(`¿Eliminar "${d.file_name}"? Esta acción es definitiva.`)) return;
    await supabase.storage.from("case-documents").remove([d.file_path]);
    const { error } = await supabase.from("documents").delete().eq("id", d.id);
    if (error) { toast({ title: "Error al eliminar", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Documento eliminado" });
    loadAll();
  };

  // Filtrado
  const docsFiltrados = docs.filter(d => {
    const caso = casos.find(c => c.id === d.case_id);
    const texto = busqueda.toLowerCase();
    const coincideTexto = !texto ||
      d.file_name.toLowerCase().includes(texto) ||
      (d.description ?? "").toLowerCase().includes(texto) ||
      (caso?.radicado ?? "").toLowerCase().includes(texto) ||
      (caso?.cliente_nombre ?? "").toLowerCase().includes(texto) ||
      (perfilesMap[d.uploaded_by] ?? "").toLowerCase().includes(texto);
    const coincideCaso = filtroCaso === "todos" || d.case_id === filtroCaso;
    const coincideAbogado = filtroAbogado === "todos" ||
      (caso?.abogado_id === filtroAbogado) ||
      (d.uploaded_by === filtroAbogado) ||
      (d.recipient_id === filtroAbogado);
    return coincideTexto && coincideCaso && coincideAbogado;
  });

  // Agrupar por caso
  const porCaso: Record<string, DocRow[]> = {};
  const sinCaso: DocRow[] = [];
  docsFiltrados.forEach(d => {
    if (d.case_id) {
      if (!porCaso[d.case_id]) porCaso[d.case_id] = [];
      porCaso[d.case_id].push(d);
    } else {
      sinCaso.push(d);
    }
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Gestión Documental</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {docs.length} documento{docs.length !== 1 ? "s" : ""} en el bufete
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm(!showForm)}
          className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold hover:opacity-90 gap-2">
          <Upload className="w-4 h-4" />
          {showForm ? "Cancelar" : "Subir documento"}
        </Button>
      </div>

      {/* Formulario subida */}
      {showForm && (
        <form onSubmit={handleUpload} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">Subir documento</h3>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Selecciona un abogado para enviárselo directamente, o solo archívalo en el sistema.
              </p>
            </div>
          </div>

          <div onClick={() => fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files?.[0] ?? null); }}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-8 text-center cursor-pointer transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            {file ? (
              <>
                <p className="font-body text-sm font-semibold text-foreground">{file.name}</p>
                <p className="font-body text-xs text-muted-foreground">{formatBytes(file.size)} · Clic para cambiar</p>
              </>
            ) : (
              <>
                <p className="font-body text-sm font-semibold text-foreground">Arrastra o selecciona un archivo</p>
                <p className="font-body text-xs text-muted-foreground">PDF, DOCX, JPG · máx 250 MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] ?? null)} className="hidden" />
          </div>

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-body text-muted-foreground">
                <span>Subiendo {file?.name}…</span><span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {mode === "jefe" && (
              <div className="space-y-1.5">
                <Label className="font-body text-sm font-semibold text-foreground">Enviar a abogado</Label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar abogado" /></SelectTrigger>
                  <SelectContent>
                    {abogados.map(ab => <SelectItem key={ab.id} value={ab.id}>{ab.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="font-body text-sm">Caso asociado (opcional)</Label>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar caso" /></SelectTrigger>
                <SelectContent>
                  {casos.map(c => <SelectItem key={c.id} value={c.id}>#{c.radicado} — {c.cliente_nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-body text-sm">Descripción (opcional)</Label>
            <Textarea rows={2} placeholder="Notas sobre el documento…" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sharedWithClient} onChange={e => setSharedWithClient(e.target.checked)} className="rounded" />
            <span className="font-body text-xs text-muted-foreground">Compartir con el cliente del caso</span>
          </label>

          <Button type="submit" disabled={uploading} className="gradient-gold text-primary border-0 font-body font-semibold shadow-gold gap-2">
            {recipient ? <Send className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Subiendo…" : recipient ? "Enviar al abogado" : "Archivar documento"}
          </Button>
        </form>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, caso, cliente o subido por…" value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-9" />
        </div>
        <Select value={filtroCaso} onValueChange={setFiltroCaso}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Filtrar por caso" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los casos</SelectItem>
            {casos.filter(c => docs.some(d => d.case_id === c.id)).map(c => (
              <SelectItem key={c.id} value={c.id}>#{c.radicado} — {c.cliente_nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {mode === "jefe" && abogados.length > 0 && (
          <Select value={filtroAbogado} onValueChange={setFiltroAbogado}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Filtrar por abogado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los abogados</SelectItem>
              {abogados.map(a => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Lista de documentos */}
      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Cargando documentos…</p>
      ) : docsFiltrados.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">
            {docs.length === 0 ? "Aún no hay documentos cargados." : "Ningún documento coincide con el filtro."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Documentos por caso */}
          {Object.entries(porCaso).map(([cId, cDocs]) => {
            const caso = casos.find(c => c.id === cId);
            return (
              <div key={cId} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  <p className="font-display text-sm font-semibold text-foreground">
                    {caso ? `Caso #${caso.radicado} — ${caso.cliente_nombre}` : "Caso desvinculado"}
                  </p>
                  <span className="ml-auto font-body text-xs text-muted-foreground">{cDocs.length} archivo{cDocs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-border">
                  {cDocs.map(d => <DocCard key={d.id} d={d} user={user} mode={mode} perfilesMap={perfilesMap} abogados={abogados} onDownload={handleDownload} onDelete={handleDelete} onPreview={handlePreview} />)}
                </div>
              </div>
            );
          })}

          {/* Sin caso */}
          {sinCaso.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="font-display text-sm font-semibold text-muted-foreground">Sin caso asociado</p>
                <span className="ml-auto font-body text-xs text-muted-foreground">{sinCaso.length} archivo{sinCaso.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-border">
                {sinCaso.map(d => <DocCard key={d.id} d={d} user={user} mode={mode} perfilesMap={perfilesMap} abogados={abogados} onDownload={handleDownload} onDelete={handleDelete} onPreview={handlePreview} />)}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Modal de previsualización */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreview(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <p className="font-body text-sm font-semibold text-foreground truncate">{preview.name}</p>
              <button type="button" onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-auto min-h-0 p-2">
              {(preview.mime?.includes("pdf") || preview.name?.toLowerCase().endsWith(".pdf")) ? (
                <iframe src={preview.url} className="w-full h-[75vh] rounded-lg border border-border" title={preview.name} />
              ) : (preview.mime?.includes("image") || preview.name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) ? (
                <img src={preview.url} alt={preview.name} className="max-w-full max-h-[75vh] mx-auto rounded-lg object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                  <p className="font-body text-sm text-muted-foreground">Este tipo de archivo no tiene previsualización disponible.</p>
                  <a href={preview.url} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-accent underline">Abrir en nueva pestaña</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocCard({ d, user, mode, perfilesMap, abogados, onDownload, onDelete, onPreview }: {
  d: DocRow; user: any; mode: string; perfilesMap: Record<string, string>;
  abogados: AbogadoOpt[];
  onDownload: (d: DocRow) => void; onDelete: (d: DocRow) => void; onPreview: (d: DocRow) => void;
}) {
  const isMine = user?.id === d.uploaded_by;
  const mimeIcon = getMimeIcon(d.mime_type);
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
      <div className="w-10 h-10 rounded-lg gradient-navy flex items-center justify-center flex-shrink-0 text-xl">
        {mimeIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold text-foreground truncate">{d.file_name}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="font-body text-[10px] text-muted-foreground">
            {formatBytes(d.file_size)}
          </span>
          <span className="font-body text-[10px] text-muted-foreground">
            {new Date(d.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          {perfilesMap[d.uploaded_by] && (
            <span className="font-body text-[10px] text-muted-foreground">
              Subido por <span className="font-medium text-foreground">{perfilesMap[d.uploaded_by]}</span>
            </span>
          )}
          {d.shared_with_client && (
            <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">Visible al cliente</span>
          )}
          {d.recipient_id && (
            <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Enviado a: {abogados.find(a => a.id === d.recipient_id)?.full_name ?? perfilesMap[d.recipient_id] ?? "Abogado"}
            </span>
          )}
        </div>
        {d.description && (
          <p className="font-body text-xs text-muted-foreground mt-0.5 truncate">{d.description}</p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {(d.mime_type?.includes("pdf") || d.mime_type?.includes("image") || d.file_name?.toLowerCase().endsWith(".pdf") || /\.(jpg|jpeg|png|gif|webp)$/i.test(d.file_name ?? "")) ? (
          <Button type="button" size="sm" variant="outline" onClick={() => onPreview(d)} className="font-body text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Ver
          </Button>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={() => onDownload(d)} className="font-body text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Abrir
          </Button>
        )}
        <Button type="button" size="sm" variant="outline" onClick={() => onDownload(d)} className="font-body text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Descargar
        </Button>
        {(isMine || mode === "jefe") && (
          <Button type="button" size="sm" variant="outline" onClick={() => onDelete(d)}
            className="font-body text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}