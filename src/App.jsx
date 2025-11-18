import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import MainMenu from './pages/MainMenu/MainMenu';
import Reports from './pages/Reports/Reports';
import DailyStock from './pages/DailyStock/DailyStock';
import DCSReport from './pages/DCSReport/DCSReport';
import DCSReportAB from './pages/DCSReportAB/DCSReportAB';
import ElectricConsumption from './pages/ElectricConsumption/ElectricConsumption';
import DowntimeList from './pages/DowntimeList/DowntimeList';
import SalesOrder from './pages/SalesOrder/SalesOrder';
import MaintenancePlan from './pages/MaintenancePlan/MaintenancePlan';
import MaintenanceDowntime from './pages/MaintenanceDowntime/MaintenanceDowntime';
import MonthlyCalendar from './pages/MonthlyCalendar/MonthlyCalendar';
import Messages from './pages/Messages/Messages';
import WorkPermits from './pages/WorkPermits/WorkPermits';
import Announcements from './pages/Announcements/Announcements';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useApp();
  return !user ? children : <Navigate to="/main-menu" />;
};

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/main-menu" 
          element={
            <ProtectedRoute>
              <MainMenu />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/job-tracking" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/dashboard" element={<Navigate to="/job-tracking" replace />} />
        <Route 
          path="/daily-stock" 
          element={
            <ProtectedRoute>
              <DailyStock />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dcs-report" 
          element={
            <ProtectedRoute>
              <DCSReport />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dcs-report-ab" 
          element={
            <ProtectedRoute>
              <DCSReportAB />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/electric-consumption" 
          element={
            <ProtectedRoute>
              <ElectricConsumption />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/downtime-list" 
          element={
            <ProtectedRoute>
              <DowntimeList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales-order" 
          element={
            <ProtectedRoute>
              <SalesOrder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/maintenance-plan" 
          element={
            <ProtectedRoute>
              <MaintenancePlan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/maintenance-downtime" 
          element={
            <ProtectedRoute>
              <MaintenanceDowntime />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/monthly-calendar" 
          element={
            <ProtectedRoute>
              <MonthlyCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/work-permits" 
          element={
            <ProtectedRoute>
              <WorkPermits />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/announcements" 
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
