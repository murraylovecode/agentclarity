import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Dashboard from "./pages/dashboard/Dashboard";
import Assets from "./pages/dashboard/Assets";
import Markets from "./pages/dashboard/Markets";
import Insights from "./pages/dashboard/Insights";
import DealAnalyzer from "./pages/dashboard/DealAnalyzer";
import Compare from "./pages/dashboard/Compare";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PlaidDashboard from "./pages/dashboard/Plaid";
import SharePage from "./pages/share/SharePage";
import NotLoggedIn from "./pages/NotLoggedIn";
import Analytics from "./pages/admin/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/share/:shareId" element={<SharePage/>} />
          <Route path="/notloggedin" element={<NotLoggedIn />} />
          <Route path="/analytics" element={<Analytics/>} />
          
          {/* App routes (with sidebar) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/deals" element={<DealAnalyzer />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/plaid" element={<PlaidDashboard />}/>
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
