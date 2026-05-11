import { useState } from "react";
import { Scale, ArrowLeft, Briefcase, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "abogado" | "jefe" | null;

const roles = [
  {
    id: "abogado" as Role,
    icon: Briefcase,
    label: "Abogado",
    desc: "Gestión de casos asignados",
    route: "/dashboard",
  },
  {
    id: "jefe" as Role,
    icon: Shield,
    label: "Jefe / Director",
    desc: "Control y supervisión del bufete",
    route: "/dashboard-jefe",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = roles.find((r) => r.id === selectedRole);
    if (role) navigate(role.route);
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent blur-[120px]" />
      </div>

      <div className="w-full max-w-md mx-auto px-6 relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-body text-sm text-accent mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <div className="bg-card rounded-2xl shadow-luxury border border-border p-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-accent" />
            <span className="font-display text-xl font-bold text-foreground">Jurova Legal Group</span>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Accede al sistema de gestión del bufete
          </p>

          {/* Role selection */}
          <div className="mb-6">
            <Label className="font-body text-sm text-foreground mb-3 block">Tipo de acceso</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedRole === role.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                  <role.icon className={`w-6 h-6 ${selectedRole === role.id ? "text-accent" : "text-muted-foreground"}`} />
                  <span className="font-display text-sm font-semibold text-foreground">{role.label}</span>
                  <span className="font-body text-[10px] text-muted-foreground text-center">{role.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-sm text-foreground">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@jurovalegal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-body text-sm text-foreground">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedRole}
              className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 transition-opacity border-0 disabled:opacity-50"
            >
              Iniciar Sesión
            </Button>
          </form>

          <p className="font-body text-xs text-muted-foreground text-center mt-6">
            ¿Olvidaste tu contraseña?{" "}
            <span className="text-accent underline cursor-pointer">Recuperar acceso</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
