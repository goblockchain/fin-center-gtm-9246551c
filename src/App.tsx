import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PipelinePage } from "@/pages/PipelinePage";
import { CrmPage } from "@/pages/CrmPage";
import { CanaisPage } from "@/pages/CanaisPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { TarefasPage } from "@/pages/TarefasPage";
import { MensagensPage } from "@/pages/MensagensPage";
import { VozPage } from "@/pages/VozPage";

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* App inteiro atrás do login */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="canais" element={<CanaisPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="tarefas" element={<TarefasPage />} />
        <Route path="mensagens" element={<MensagensPage />} />
        <Route path="voz" element={<VozPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
