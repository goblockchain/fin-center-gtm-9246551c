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
const PipelinePage = lazy(() =>
  named(import("@/pages/PipelinePage"), "PipelinePage"),
);
const CrmPage = lazy(() => named(import("@/pages/CrmPage"), "CrmPage"));
const CanaisPage = lazy(() => named(import("@/pages/CanaisPage"), "CanaisPage"));
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
const RelatorioPage = lazy(() =>
  named(import("@/pages/RelatorioPage"), "RelatorioPage"),
);
const CrescimentoPage = lazy(() =>
  named(import("@/pages/CrescimentoPage"), "CrescimentoPage"),
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
          path="pipeline"
          element={
            <Suspense fallback={<Fallback />}>
              <PipelinePage />
            </Suspense>
          }
        />
        <Route
          path="crm"
          element={
            <Suspense fallback={<Fallback />}>
              <CrmPage />
            </Suspense>
          }
        />
        <Route
          path="canais"
          element={
            <Suspense fallback={<Fallback />}>
              <CanaisPage />
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
          path="relatorio"
          element={
            <Suspense fallback={<Fallback />}>
              <RelatorioPage />
            </Suspense>
          }
        />
        <Route
          path="crescimento"
          element={
            <Suspense fallback={<Fallback />}>
              <CrescimentoPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
