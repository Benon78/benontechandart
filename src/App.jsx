import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ErrorElement from "./pages/ErrorElement";

import './App.css'

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Index />} errorElement={<ErrorElement />} />
      <Route path="/auth" element={<Auth />} errorElement={<ErrorElement />} />
      <Route path="/admin" element={<Admin />} errorElement={<ErrorElement />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
