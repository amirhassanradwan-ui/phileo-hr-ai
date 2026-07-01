import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ApplicationsPage from './pages/ApplicationsPage';
import CandidatesPage from './pages/CandidatesPage';
import DashboardPage from './pages/DashboardPage';
import EmailSyncPage from './pages/EmailSyncPage';
import JobsPage from './pages/JobsPage';
import LoginPage from './pages/LoginPage';
import PipelinePage from './pages/PipelinePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import UploadPage from './pages/UploadPage';

function RequireAuth() {
  const token = localStorage.getItem('access_token');
  return token ? <AppLayout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth />}>
        <Route index element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="email-sync" element={<EmailSyncPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
