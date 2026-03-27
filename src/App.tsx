import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, useSidebarCollapsed } from "@/components/SidebarContext";
import { supabase } from "@/integrations/supabase/client";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Index from "./pages/Index.tsx";
import BatchPage from "./pages/BatchPage.tsx";
import CompetitorPage from "./pages/CompetitorPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppLayout = () => {
  const { collapsed } = useSidebarCollapsed();
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className={`flex-1 ${collapsed ? "ml-16" : "ml-52"} px-8 py-6 transition-all duration-200`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/batch" element={<BatchPage />} />
          <Route path="/analysis" element={<CompetitorPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {session ? (
          <BrowserRouter>
            <SidebarProvider>
              <AppLayout />
            </SidebarProvider>
          </BrowserRouter>
        ) : (
          <AuthPage onAuth={() => {}} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
