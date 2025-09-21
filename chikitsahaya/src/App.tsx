import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CommandPalette } from "@/components/CommandPalette";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { PatientLayout } from "@/layouts/PatientLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorChat from "./pages/DoctorChat";
import DoctorTriage from "./pages/DoctorTriage";
import EncounterSession from "./pages/EncounterSession";
import AddConversation from "./pages/AddConversation";
import PatientSchedule from "./pages/PatientSchedule";
import DoctorSchedule from "./pages/DoctorSchedule";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfile from "./pages/PatientProfile";
import PatientMessages from "./pages/PatientMessages";
import PatientOnboarding from "./pages/PatientOnboarding";
import LabScanner from "./pages/LabScanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CommandPalette />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/demo" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/patient-onboarding" element={<PatientOnboarding />} />

            {/* Doctor Routes */}
            <Route element={<ProtectedRoute role="doctor" />}>
              <Route path="/doctor" element={<DoctorLayout />}>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="chat" element={<DoctorChat />} />
                <Route path="chat/:threadId" element={<DoctorChat />} />
                <Route path="triage" element={<DoctorTriage />} />
                <Route path="encounter/:encounterId" element={<EncounterSession />} />
                <Route path="add-conversation" element={<AddConversation />} />
                <Route path="patient-schedule" element={<PatientSchedule />} />
                <Route path="doctor-schedule" element={<DoctorSchedule />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Patient Routes */}
            <Route element={<ProtectedRoute role="patient" />}>
              <Route path="/patient" element={<PatientLayout />}>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="profile" element={<PatientProfile />} />
                {/* Placeholder routes for future implementation */}
                <Route path="messages" element={<PatientMessages />} />
                <Route path="lab-scanner" element={<LabScanner />} />
                <Route path="prescriptions" element={<div className="p-8 text-center text-muted-foreground">Prescriptions feature coming soon</div>} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
