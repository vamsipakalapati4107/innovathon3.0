import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CollegeProvider } from "@/contexts/CollegeContext";

import CollegeSelection from "./pages/CollegeSelection";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

import ComplaintList from "./pages/complaints/ComplaintList";
import ReviewComplaints from "./pages/complaints/ReviewComplaints";
import ComplaintNew from "./pages/complaints/ComplaintNew";
import ComplaintDetail from "./pages/complaints/ComplaintDetail";
import CampusMap from "./pages/CampusMap";
import WorkerList from "./pages/workers/WorkerList";
import WorkerForm from "./pages/workers/WorkerForm";
import VacancyManagement from "./pages/vacancies/VacancyManagement";
import EventList from "./pages/events/EventList";
import EventForm from "./pages/events/EventForm";
import EventDetail from "./pages/events/EventDetail";
import SalaryManagement from "./pages/salary/SalaryManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CollegeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CollegeSelection />} />
              <Route path="/login" element={<Login />} />

              {/* Protected dashboard routes */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/complaints" element={<ComplaintList />} />
                <Route path="/complaints/review" element={<ProtectedRoute roles={['admin']}><ReviewComplaints /></ProtectedRoute>} />
                <Route path="/complaints/new" element={<ComplaintNew />} />
                <Route path="/complaints/:id" element={<ComplaintDetail />} />
                <Route path="/campus-map" element={<ProtectedRoute roles={['student', 'staff']}><CampusMap /></ProtectedRoute>} />
                <Route path="/workers" element={<ProtectedRoute roles={['admin']}><WorkerList /></ProtectedRoute>} />
                <Route path="/workers/new" element={<ProtectedRoute roles={['admin']}><WorkerForm /></ProtectedRoute>} />
                <Route path="/vacancies" element={<ProtectedRoute roles={['admin']}><VacancyManagement /></ProtectedRoute>} />
                <Route path="/events" element={<EventList />} />
                <Route path="/events/new" element={<ProtectedRoute roles={['admin']}><EventForm /></ProtectedRoute>} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/salary" element={<SalaryManagement />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CollegeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
