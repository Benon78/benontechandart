import { Outlet } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import RouteTracker from '@/components/RouteTracker';

export default function RootLayout() {
  return (
    <>
     <RouteTracker/>
      <ScrollToTop />
      <Outlet />
    </>
  );
}