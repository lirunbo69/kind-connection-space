import { useState, useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { usePageTracker } from "@/hooks/usePageTracker";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, useSidebarCollapsed } from "@/components/SidebarContext";
import { supabase } from "@/integrations/supabase/client";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Lazy load route pages for faster initial load
const Index = lazy(() => import("./pages/Index"));
const BatchPage = lazy(() => import("./pages/BatchPage"));
const CompetitorPage = lazy(() => import("./pages/CompetitorPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const TopupPage = lazy(() => import("./pages/TopupPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppLayout = () => {
  const { collapsed } = useSidebarCollapsed();
  const location = useLocation();
  usePageTracker(location.pathname);
  return (
    <div className="min-h-screen flex bg-mesh">
      <AppSidebar />
      <main className={`flex-1 ${collapsed ? "ml-16" : "ml-52"} px-8 py-6 transition-all duration-300`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/batch" element={<BatchPage />} />
          <Route path="/analysis" element={<CompetitorPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/topup" element={<TopupPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

type UnauthView = "landing" | "auth";

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unauthView, setUnauthView] = useState<UnauthView>("landing");
  const [defaultAuthTab, setDefaultAuthTab] = useState<string>("login");

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="glass-strong rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <span className="text-sm text-muted-foreground">加载中...</span>
        </div>
      </div>
    );
  }

  const isResetPassword = window.location.pathname === "/reset-password";

  const handleNavigateAuth = (tab?: string) => {
    if (tab) setDefaultAuthTab(tab);
    setUnauthView("auth");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isResetPassword ? (
          <ResetPasswordPage />
        ) : session ? (
          <BrowserRouter>
            <SidebarProvider>
              <AppLayout />
            </SidebarProvider>
          </BrowserRouter>
        ) : unauthView === "landing" ? (
          <LandingPage onNavigateAuth={handleNavigateAuth} />
        ) : (
          <AuthPage onAuth={() => {}} defaultTab={defaultAuthTab} onBack={() => setUnauthView("landing")} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
