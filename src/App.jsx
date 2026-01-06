import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ErrorElement from "./pages/ErrorElement";
import NotFound from "./pages/NotFound";
import RootLayout from "./components/RootLayout";
import CookieConsent from '@/components/CookieConsent';
import CookiePolicy from '@/pages/CookiePolicy';
import AnalyticsPolicy from '@/pages/AnalyticsPolicy';

import './App.css'

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout/>} errorElement={<ErrorElement/>}>  
      <Route path="/" element={<Index />} errorElement={<ErrorElement />} />
      <Route path="/auth" element={<Auth />} errorElement={<ErrorElement />} />
      <Route path="/admin" element={<Admin />} errorElement={<ErrorElement />} />
      <Route path="/profile" element={<Profile />} errorElement={<ErrorElement />}/>
      <Route path="/gallery" element={<Gallery />} errorElement={<ErrorElement />}/>
      <Route path="/blog" element={<Blog />} errorElement={<ErrorElement />}/>
      <Route path="/blog/:slug" element={<BlogPost />} errorElement={<ErrorElement />}/>
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/analytics-policy" element={<AnalyticsPolicy />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CookieConsent/>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
