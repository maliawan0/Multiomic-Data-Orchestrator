import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import MappingPage from "./pages/Mapping";
import ValidationPage from "./pages/Validation";
import LoginPage from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import { NewRunProvider } from "./context/NewRunContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MappingProvider } from "./context/MappingContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MappingProvider>
            <NewRunProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute />}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="upload" element={<UploadPage />} />
                  <Route path="mapping" element={<MappingPage />} />
                  <Route path="validation" element={<ValidationPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </NewRunProvider>
          </MappingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;