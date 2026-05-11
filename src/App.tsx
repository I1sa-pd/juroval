import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ConsultarCaso from "./pages/ConsultarCaso";
import DashboardAbogado from "./pages/DashboardAbogado";
import DashboardJefe from "./pages/DashboardJefe";
import DashboardCliente from "./pages/DashboardCliente";
import CambiarPassword from "./pages/CambiarPassword";
import NotFound from "./pages/NotFound";

const App = () => (
  <div>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/consultar-caso" element={<ConsultarCaso />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["abogado", "jefe"]}>
                <DashboardAbogado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-jefe"
            element={
              <ProtectedRoute allowedRoles={["jefe"]}>
                <DashboardJefe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-caso"
            element={
              <ProtectedRoute allowedRoles={["cliente", "jefe"]}>
                <DashboardCliente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cambiar-password"
            element={
              <ProtectedRoute allowedRoles={["abogado", "cliente", "jefe"]}>
                <CambiarPassword />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </div>
);

export default App;
