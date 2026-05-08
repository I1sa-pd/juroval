import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="font-body text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect by actual role
    if (role === "jefe") return <Navigate to="/dashboard-jefe" replace />;
    if (role === "abogado") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/mi-caso" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
