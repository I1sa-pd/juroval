import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MOTIVOS = [
  { value: "consulta", label: "Consulta" },
  { value: "seguimiento", label: "Seguimiento de caso" },
  { value: "informacion", label: "Solicitar información" },
];

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    motivo: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await (supabase as any).from("contact_requests").insert({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      motivo: form.motivo,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error al enviar",
        description: "No se pudo guardar tu solicitud. Intenta de nuevo.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "¡Solicitud enviada!",
      description: "Nos pondremos en contacto contigo pronto.",
    });
    setForm({ nombre: "", email: "", motivo: "", telefono: "" });
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-accent/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body focus:outline-none focus:border-accent/50";

  return (
    <section className="gradient-navy py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-10">
          <p className="font-body text-sm uppercase tracking-widest text-accent mb-3">
            ¡Déjanos ayudarte!
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            Solicitar una llamada para cualquier tipo de ayuda
          </h2>
        </div>

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
          <select required {...field("motivo")} className={inputClass}>
            <option value="">Motivo de consulta</option>
            {MOTIVOS.map((m) => (
              <option key={m.value} value={m.value} className="text-foreground">
                {m.label}
              </option>
            ))}
          </select>
          <input
            type="tel"
            placeholder="Tu teléfono"
            required
            {...field("telefono")}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-gold text-primary font-body font-semibold px-8 py-4 rounded-lg shadow-gold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;