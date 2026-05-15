import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MOTIVOS = [
  { value: "consulta", label: "Consulta general" },
  { value: "seguimiento", label: "Seguimiento de caso" },
  { value: "informacion", label: "Solicitar información" },
  { value: "disciplinario", label: "Proceso disciplinario" },
  { value: "penal", label: "Proceso penal" },
  { value: "administrativo", label: "Derecho administrativo" },
];

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    motivo: "",
    telefono: "",
    mensaje: "",
    cedula: "",
    direccion: "",
  });
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("contact_requests").insert({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      motivo: form.motivo,
      mensaje: form.mensaje.trim() || null,
      cedula: form.cedula.trim() || null,
      direccion: form.direccion.trim() || null,
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Error al enviar",
        description: "No se pudo guardar tu solicitud. Intenta de nuevo.",
        variant: "destructive",
      });
      return;
    }

    const jefeResult = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "jefe");
    const jefeId = jefeResult.data?.[0]?.user_id;
    if (jefeId) {
      await supabase.from("notificaciones").insert({
        user_id: jefeId,
        case_id: null,
        tipo: "solicitud_contacto",
        titulo: "Nueva solicitud de contacto",
        mensaje: `${form.nombre.trim()} (${form.telefono.trim()}) solicitó contacto por "${form.motivo}"${form.mensaje.trim() ? `: ${form.mensaje.trim().slice(0, 100)}` : ""}.`,
      });
    }

    setLoading(false);
    setEnviado(true);
    setForm({ nombre: "", email: "", motivo: "", telefono: "", mensaje: "", cedula: "", direccion: "" });
    setTimeout(() => setEnviado(false), 6000);
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => setForm({ ...form, [key]: e.target.value }),
  });

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-accent/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body focus:outline-none focus:border-accent/50 transition-colors";

  return (
    <section id="contacto" className="gradient-navy py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-10">
          <p className="font-body text-sm uppercase tracking-widest text-accent mb-3">
            ¡Déjanos ayudarte!
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            Solicitar una llamada para cualquier tipo de ayuda
          </h2>
        </div>

        {enviado ? (
          <div className="max-w-lg mx-auto text-center py-12 px-6 rounded-xl border border-accent/30 bg-accent/5">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">
              ¡Solicitud enviada!
            </h3>
            <p className="font-body text-primary-foreground/70 text-sm">
              Nos pondremos en contacto contigo pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <input
              type="text"
              placeholder="Nombre Completo"
              required
              {...field("nombre")}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Ingresa tu email"
              required
              {...field("email")}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="Tu teléfono (ej: 3001234567)"
              required
              {...field("telefono")}
              className={inputClass}
            />
            <select required {...field("motivo")} className={inputClass}>
              <option value="">Motivo de consulta</option>
              {MOTIVOS.map((m) => (
                <option key={m.value} value={m.value} className="text-foreground bg-background">
                  {m.label}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Cuéntanos brevemente tu situación (opcional)"
              rows={3}
              {...field("mensaje")}
              className={inputClass + " resize-none"}
            />
            <input
              type="text"
              placeholder="Cédula de ciudadanía"
              required
              {...field("cedula")}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Dirección física (ciudad, barrio, calle)"
              required
              {...field("direccion")}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold text-primary font-body font-semibold px-8 py-4 rounded-lg shadow-gold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviar solicitud"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ContactSection;