import { useState } from "react";
import { Scale, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({ email: z.string().trim().email("Email inválido") });

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast({ title: "Error", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada." });
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 font-body text-sm text-accent mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="bg-card rounded-2xl shadow-luxury border border-border p-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-accent" />
            <span className="font-display text-xl font-bold text-foreground">Recuperar acceso</span>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {sent ? (
            <div className="text-center py-6">
              <p className="font-body text-sm text-foreground mb-4">
                ✉️ Enviamos un enlace a <strong>{email}</strong>.
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Revisa tu bandeja de entrada y carpeta de spam. El enlace caduca pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email" type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit" disabled={loading}
                className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 border-0"
              >
                {loading ? "Enviando…" : "Enviar enlace"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
