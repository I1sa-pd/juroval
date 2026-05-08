import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CambiarPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");

  if (!authLoading && !user) {
    navigate("/auth", { replace: true });
    return null;
  }

  const backTo =
    role === "jefe" ? "/dashboard-jefe" :
    role === "abogado" ? "/dashboard" : "/mi-caso";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) {
      toast({ title: "Error", description: "Mínimo 8 caracteres", variant: "destructive" });
      return;
    }
    if (pwd !== pwd2) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) {
      toast({ title: "No se pudo actualizar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Contraseña actualizada", description: "Tu nueva contraseña ya está activa." });
    setPwd(""); setPwd2("");
    navigate(backTo);
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center gap-2 font-body text-sm text-accent mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="bg-card rounded-2xl shadow-luxury border border-border p-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-accent" />
            <span className="font-display text-xl font-bold text-foreground">Jurova Legal Group</span>
          </div>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <KeyRound className="w-4 h-4 text-accent" />
            <h1 className="font-display text-lg font-semibold text-foreground">Cambiar contraseña</h1>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Define una contraseña personal para reemplazar la asignada por el Director.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-pwd">Nueva contraseña</Label>
              <Input
                id="new-pwd" type="password" required minLength={8} maxLength={72}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoComplete="new-password"
              />
              <p className="text-[11px] text-muted-foreground">Mínimo 8 caracteres</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pwd2">Confirmar contraseña</Label>
              <Input
                id="new-pwd2" type="password" required minLength={8} maxLength={72}
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button
              type="submit" disabled={loading}
              className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 border-0"
            >
              {loading ? "Guardando…" : "Actualizar contraseña"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CambiarPassword;
