import { useEffect, useState } from "react";
import { Scale, ArrowLeft, Briefcase, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().trim().min(1).email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type RoleChoice = Extract<AppRole, "jefe" | "abogado" | "cliente">;

const ROLE_OPTIONS: {
  value: RoleChoice;
  label: string;
  description: string;
  icon: typeof Briefcase;
}[] = [
  {
    value: "jefe",
    label: "Director",
    description: "Gestión integral del bufete",
    icon: ShieldCheck,
  },
  {
    value: "abogado",
    label: "Abogado",
    description: "Acceso a casos asignados",
    icon: Briefcase,
  },
  {
    value: "cliente",
    label: "Cliente",
    description: "Consulta el estado de tu caso",
    icon: Users,
  },
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleChoice>("jefe");
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Redirige si ya está logueado
  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === "jefe") navigate("/dashboard-jefe", { replace: true });
      else if (role === "abogado") navigate("/dashboard", { replace: true });
      else navigate("/mi-caso", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(loginData);
    if (!parsed.success) {
      toast({ title: "Error", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.user) {
      setLoading(false);
      toast({
        title: "No se pudo iniciar sesión",
        description: error?.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : error?.message ?? "Error desconocido",
        variant: "destructive",
      });
      return;
    }

    // Verifica que el rol del usuario coincide con el seleccionado
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!roleRow || roleRow.role !== selectedRole) {
      await supabase.auth.signOut();
      setLoading(false);
      const labels: Record<string, string> = { jefe: "Director", abogado: "Abogado", cliente: "Cliente" };
      toast({
        title: "Acceso no permitido",
        description: `Esta cuenta no tiene el rol "${labels[selectedRole] ?? selectedRole}".`,
        variant: "destructive",
      });
      return;
    }

    // Registra fecha de ingreso
    await supabase.rpc("record_sign_in");

    setLoading(false);
    toast({ title: "Bienvenido", description: "Acceso concedido" });
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center relative overflow-hidden py-10">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="w-full max-w-md mx-auto px-6 relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-body text-sm text-accent mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <div className="bg-card rounded-2xl shadow-luxury border border-border p-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-accent" />
            <span className="font-display text-xl font-bold text-foreground">Jurova Legal Group</span>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Selecciona tu rol e inicia sesión
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {ROLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = selectedRole === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedRole(opt.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                    active
                      ? "border-accent bg-accent/10 shadow-gold"
                      : "border-border hover:border-accent/50 hover:bg-accent/5",
                  )}
                >
                  <Icon className={cn("w-5 h-5", active ? "text-accent" : "text-muted-foreground")} />
                  <div>
                    <p className="font-body font-semibold text-sm text-foreground">{opt.label}</p>
                    <p className="font-body text-[11px] text-muted-foreground leading-tight">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Correo electrónico</Label>
              <Input
                id="login-email" type="email" required autoComplete="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password" type="password" required autoComplete="current-password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <Button
              type="submit" disabled={loading}
              className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 border-0"
            >
              {loading ? "Ingresando…" : `Iniciar como ${
                selectedRole === "jefe" ? "Director" :
                selectedRole === "abogado" ? "Abogado" : "Cliente"
              }`}
            </Button>
            <p className="font-body text-xs text-center mt-2">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-accent hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </p>
            <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
              Las cuentas son creadas únicamente por el Director del bufete desde el panel de Gestión de Usuarios.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;