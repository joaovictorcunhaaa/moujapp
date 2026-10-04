import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Treatment from "./pages/Treatment";
import Lifestyle from "./pages/Lifestyle";
import Supplements from "./pages/Supplements";
import AiChat from "./pages/AiChat";
import ProgressPhotos from "./pages/ProgressPhotos";
import { DosesProvider } from "@/hooks/useDoses";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DosesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/treatment" element={<Treatment />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/supplements" element={<Supplements />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/progress-photos" element={<ProgressPhotos />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DosesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
