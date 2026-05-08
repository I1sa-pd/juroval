import { useState } from "react";
import { Scale, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ConsultarCaso = () => {
  const navigate = useNavigate();
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");

  const handleConsultar = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/mi-caso");
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent blur-[120px]" />
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
            <span className="font-display text-xl font-bold text-foreground">Portal del Cliente</span>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Consulta el estado de tu caso ingresando tus datos
          </p>

          <form onSubmit={handleConsultar} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cedula" className="font-body text-sm text-foreground">
                Número de cédula
              </Label>
              <Input
                id="cedula"
                type="text"
                placeholder="1.023.456.789"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre" className="font-body text-sm text-foreground">
                Nombre completo
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="María Fernández"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full gradient-gold text-primary font-body font-semibold h-11 rounded-lg shadow-gold hover:opacity-90 transition-opacity border-0">
              <Search className="w-4 h-4 mr-2" />
              Consultar mi Caso
            </Button>
          </form>

          <p className="font-body text-xs text-muted-foreground text-center mt-6">
            Si tienes problemas para acceder, comunícate con tu abogado asignado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultarCaso;
