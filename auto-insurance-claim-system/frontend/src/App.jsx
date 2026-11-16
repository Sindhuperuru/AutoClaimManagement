import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import SubmitClaim from './pages/SubmitClaim';
import ClaimTracking from './pages/ClaimTracking';
import ClaimDetails from './pages/ClaimDetails';
import AgentDashboard from './pages/AgentDashboard';
import DocumentVerification from './pages/DocumentVerification';
import SurveyorDashboard from './pages/SurveyorDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import InvestigationDashboard from './pages/InvestigationDashboard';
import ClaimApproval from './pages/ClaimApproval';
import SettlementPage from './pages/SettlementPage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import PolicyManagement from './pages/PolicyManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import WorkflowMonitoring from './pages/WorkflowMonitoring';
import TaskInbox from './pages/TaskInbox';

// Protected Layout
const Layout = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};

// Root Redirector based on user role
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'ROLE_CUSTOMER': return <Navigate to="/customer/dashboard" replace />;
    case 'ROLE_AGENT': return <Navigate to="/agent/dashboard" replace />;
    case 'ROLE_SURVEYOR': return <Navigate to="/surveyor/dashboard" replace />;
    case 'ROLE_CLAIMS_OFFICER': return <Navigate to="/officer/dashboard" replace />;
    case 'ROLE_ADMIN': return <Navigate to="/admin/dashboard" replace />;
    default: return <Navigate to="/customer/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Routes */}
          <Route path="/customer/dashboard" element={<Layout><CustomerDashboard /></Layout>} />
          <Route path="/customer/submit-claim" element={<Layout><SubmitClaim /></Layout>} />

          {/* Shared Claim Tracking & Dossier */}
          <Route path="/claims/track" element={<Layout><ClaimTracking /></Layout>} />
          <Route path="/claims/details/:id" element={<Layout><ClaimDetails /></Layout>} />

          {/* Agent Routes */}
          <Route path="/agent/dashboard" element={<Layout><AgentDashboard /></Layout>} />
          <Route path="/agent/verification" element={<Layout><DocumentVerification /></Layout>} />

          {/* Surveyor Workspace Route */}
          <Route path="/surveyor/dashboard" element={<Layout><SurveyorDashboard /></Layout>} />

          {/* Dedicated Tasklist Inbox */}
          <Route path="/tasks" element={<Layout><TaskInbox /></Layout>} />

          {/* Claims Officer Routes */}
          <Route path="/officer/dashboard" element={<Layout><OfficerDashboard /></Layout>} />
          <Route path="/officer/investigations" element={<Layout><InvestigationDashboard /></Layout>} />
          <Route path="/officer/approval" element={<Layout><ClaimApproval /></Layout>} />

          {/* Settlement / Disbursement */}
          <Route path="/settlement" element={<Layout><SettlementPage /></Layout>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="/admin/workflow" element={<Layout><WorkflowMonitoring /></Layout>} />
          <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
          <Route path="/admin/policies" element={<Layout><PolicyManagement /></Layout>} />
          <Route path="/admin/analytics" element={<Layout><ReportsAnalytics /></Layout>} />

          {/* Default / Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;