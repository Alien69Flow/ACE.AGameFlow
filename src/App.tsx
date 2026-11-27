import { lazy, Suspense, type ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalErrorBoundary } from "@/components/game/GlobalErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Lazy-load TonConnect provider so 428KB only loads when mine/network screen opens
const TonConnectUIProvider = lazy(() =>
  import('@tonconnect/ui-react').then(m => ({ default: m.TonConnectUIProvider }))
);

export const TonConnectLazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="flex-1 flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>}>
    <TonConnectUIProvider manifestUrl="https://ace.alienflow.space/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  </Suspense>
);

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
