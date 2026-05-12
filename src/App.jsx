import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthGuard } from "./components/AuthGuard";
import { queryClient } from "./lib/queryClient";

function lazyNamed(loader, exportName) {
  return lazy(() =>
    loader().then((module) => ({
      default: module[exportName],
    })),
  );
}

const AdminLayout = lazyNamed(() => import("./layouts/AdminLayout"), "AdminLayout");
const AdminCollectionPage = lazyNamed(() => import("./admin/pages/AdminCollectionPage"), "AdminCollectionPage");
const AdminContactPage = lazyNamed(() => import("./admin/pages/AdminContactPage"), "AdminContactPage");
const AdminDashboardPage = lazyNamed(() => import("./admin/pages/AdminDashboardPage"), "AdminDashboardPage");
const AdminMessagesPage = lazyNamed(() => import("./admin/pages/AdminMessagesPage"), "AdminMessagesPage");
const AdminProfilePage = lazyNamed(() => import("./admin/pages/AdminProfilePage"), "AdminProfilePage");
const AdminSettingsPage = lazyNamed(() => import("./admin/pages/AdminSettingsPage"), "AdminSettingsPage");
const AdminLoginPage = lazyNamed(() => import("./pages/AdminLoginPage"), "AdminLoginPage");
const HomePage = lazyNamed(() => import("./pages/HomePage"), "HomePage");
const NotFoundPage = lazyNamed(() => import("./pages/NotFoundPage"), "NotFoundPage");

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-0)] px-6 py-12 text-[var(--content-strong)]">
      <div className="glass-panel rounded-[32px] px-6 py-5 text-sm text-[var(--content-muted)]">
        Chargement de l'interface...
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route index element={<HomePage />} />

                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  <Route path="/admin" element={<AuthGuard />}>
                    <Route element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="profile" element={<AdminProfilePage />} />
                      <Route path="skills" element={<AdminCollectionPage resourceKey="skills" />} />
                      <Route path="projects" element={<AdminCollectionPage resourceKey="projects" />} />
                      <Route path="experiences" element={<AdminCollectionPage resourceKey="experiences" />} />
                      <Route path="certifications" element={<AdminCollectionPage resourceKey="certifications" />} />
                      <Route path="services" element={<AdminCollectionPage resourceKey="services" />} />
                      <Route path="contact" element={<AdminContactPage />} />
                      <Route path="messages" element={<AdminMessagesPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
