import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";

import MasterRegister from "@/pages/MasterRegister";
import Reports from "@/pages/Reports";
import TechnicalMapping from "@/pages/TechnicalMapping";
import Settings from "@/pages/Settings";
import IssuesRequirements from "@/pages/IssuesRequirements";
import TaskManagement from "@/pages/TaskManagement";
import DigitalTwin from "@/pages/DigitalTwin";
import CompletenessHeatmap from "@/pages/CompletenessHeatmap";
import KnowledgeGraph from "@/pages/KnowledgeGraph";
import ConsistencyChecker from "@/pages/ConsistencyChecker";
import TemplateLibrary from "@/pages/TemplateLibrary";
import SystemHealth from "@/pages/SystemHealth";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/master-register" element={<MasterRegister />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/technical-mapping" element={<TechnicalMapping />} />
            <Route path="/issues-requirements" element={<IssuesRequirements />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/heatmap" element={<CompletenessHeatmap />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
            <Route path="/consistency-checker" element={<ConsistencyChecker />} />
            <Route path="/templates" element={<TemplateLibrary />} />
            <Route path="/system-health" element={<SystemHealth />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
