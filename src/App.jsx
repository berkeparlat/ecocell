import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { useTabNotification } from './hooks/useTabNotification';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import MainMenu from './pages/MainMenu/MainMenu';
import Reports from './pages/Reports/Reports';
import Maintenance from './pages/Maintenance/Maintenance';
import Operations from './pages/Operations/Operations';
import SalesShipping from './pages/SalesShipping/SalesShipping';
import DailyStock from './pages/DailyStock/DailyStock';
import DowntimeList from './pages/DowntimeList/DowntimeList';
import MonthlyCalendar from './pages/MonthlyCalendar/MonthlyCalendar';
import Messages from './pages/Messages/Messages';
import WorkPermits from './pages/WorkPermits/WorkPermits';
import Announcements from './pages/Announcements/Announcements';
import Notifications from './pages/Notifications/Notifications';
import Reminders from './pages/Reminders/Reminders';
import AdminPanel from './pages/AdminPanel/AdminPanel';
// New separate pages
import Electric from './pages/Electric/Electric';
import Mechanic from './pages/Mechanic/Mechanic';
import Hydraulic from './pages/Hydraulic/Hydraulic';
import ElectricalDowntime from './pages/ElectricalDowntime/ElectricalDowntime';
import MechanicalDowntime from './pages/MechanicalDowntime/MechanicalDowntime';
import ElectricalPlan from './pages/ElectricalPlan/ElectricalPlan';
import MechanicalPlan from './pages/MechanicalPlan/MechanicalPlan';
import DCSLineA from './pages/DCSLineA/DCSLineA';
import DCSLineB from './pages/DCSLineB/DCSLineB';
import DCSBuhar from './pages/DCSBuhar/DCSBuhar';
import Orders from './pages/Orders/Orders';
import Shipments from './pages/Shipments/Shipments';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useApp();
  return !user ? children : <Navigate to="/main-menu" />;
};

// Tab bildirimi için wrapper bileşeni
function TabNotificationWrapper() {
  const { unreadNotificationsCount, conversations, unreadAnnouncementsCount } = useApp();
  
  // Toplam okunmamış sayısını hesapla
  const unreadMessagesCount = conversations?.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + c.unreadCount, 0) || 0;
  const totalUnread = (unreadNotificationsCount || 0) + unreadMessagesCount + (unreadAnnouncementsCount || 0);
  
  // Tab bildirimini aktifleştir
  useTabNotification(totalUnread, 'Yeni bildirim var!');
  
  return null;
}

function AppContent() {
  return (
    <BrowserRouter>
      <TabNotificationWrapper />
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
          path="/maintenance" 
          element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/operations" 
          element={
            <ProtectedRoute>
              <Operations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales-shipping" 
          element={
            <ProtectedRoute>
              <SalesShipping />
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
          path="/downtime-list" 
          element={
            <ProtectedRoute>
              <DowntimeList />
            </ProtectedRoute>
          } 
        />
        {/* Electric Consumption Pages */}
        <Route 
          path="/electric-consumption" 
          element={
            <ProtectedRoute>
              <Electric />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mechanic-consumption" 
          element={
            <ProtectedRoute>
              <Mechanic />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hydraulic-consumption" 
          element={
            <ProtectedRoute>
              <Hydraulic />
            </ProtectedRoute>
          } 
        />
        {/* Maintenance Downtime Pages */}
        <Route 
          path="/electrical-downtime" 
          element={
            <ProtectedRoute>
              <ElectricalDowntime />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mechanical-downtime" 
          element={
            <ProtectedRoute>
              <MechanicalDowntime />
            </ProtectedRoute>
          } 
        />
        {/* Maintenance Plan Pages */}
        <Route 
          path="/electrical-plan" 
          element={
            <ProtectedRoute>
              <ElectricalPlan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mechanical-plan" 
          element={
            <ProtectedRoute>
              <MechanicalPlan />
            </ProtectedRoute>
          } 
        />
        {/* DCS Report Pages */}
        <Route 
          path="/dcs-line-a" 
          element={
            <ProtectedRoute>
              <DCSLineA />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dcs-line-b" 
          element={
            <ProtectedRoute>
              <DCSLineB />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dcs-buhar" 
          element={
            <ProtectedRoute>
              <DCSBuhar />
            </ProtectedRoute>
          } 
        />
        {/* Sales Order Pages */}
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shipments" 
          element={
            <ProtectedRoute>
              <Shipments />
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
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reminders" 
          element={
            <ProtectedRoute>
              <Reminders />
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
