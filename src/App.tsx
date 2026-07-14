import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";

// Rotas com code-splitting: cada módulo carrega só quando acessado
// (Recharts entra no Dashboard, dnd-kit no Pipeline, etc.).
const named = <T extends string>(
  p: Promise<Record<T, React.ComponentType>>,
  key: T,
) => p.then((m) => ({ default: m[key] }));

const DashboardPage = lazy(() =>
  named(import("@/pages/DashboardPage"), "DashboardPage"),
);
const LeadsPage = lazy(() => named(import("@/pages/LeadsPage"), "LeadsPage"));
const ExecutivoPage = lazy(() =>
  named(import("@/pages/ExecutivoPage"), "ExecutivoPage"),
);
const RoadmapPage = lazy(() =>
  named(import("@/pages/RoadmapPage"), "RoadmapPage"),
);
const TarefasPage = lazy(() =>
  named(import("@/pages/TarefasPage"), "TarefasPage"),
);
const MensagensPage = lazy(() =>
  named(import("@/pages/MensagensPage"), "MensagensPage"),
);
const VozPage = lazy(() => named(import("@/pages/VozPage"), "VozPage"));
const MarcaPage = lazy(() => named(import("@/pages/MarcaPage"), "MarcaPage"));
const DefinirSenhaPage = lazy(() =>
  named(import("@/pages/DefinirSenhaPage"), "DefinirSenhaPage"),
);

function Fallback() {
  return (
    <div className="flex items-center justify-center py-24 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-fin" />
    </div>
  );
}

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
        <Route
          index
          element={
            <Suspense fallback={<Fallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="leads"
          element={
            <Suspense fallback={<Fallback />}>
              <LeadsPage />
            </Suspense>
          }
        />
        {/* Pipeline e CRM viraram Leads — redireciona links antigos */}
        <Route path="pipeline" element={<Navigate to="/leads" replace />} />
        <Route path="crm" element={<Navigate to="/leads" replace />} />
        <Route
          path="executivo"
          element={
            <Suspense fallback={<Fallback />}>
              <ExecutivoPage />
            </Suspense>
          }
        />
        <Route
          path="roadmap"
          element={
            <Suspense fallback={<Fallback />}>
              <RoadmapPage />
            </Suspense>
          }
        />
        <Route
          path="tarefas"
          element={
            <Suspense fallback={<Fallback />}>
              <TarefasPage />
            </Suspense>
          }
        />
        <Route
          path="mensagens"
          element={
            <Suspense fallback={<Fallback />}>
              <MensagensPage />
            </Suspense>
          }
        />
        <Route
          path="voz"
          element={
            <Suspense fallback={<Fallback />}>
              <VozPage />
            </Suspense>
          }
        />
        <Route
          path="marca"
          element={
            <Suspense fallback={<Fallback />}>
              <MarcaPage />
            </Suspense>
          }
        />
        <Route
          path="definir-senha"
          element={
            <Suspense fallback={<Fallback />}>
              <DefinirSenhaPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
