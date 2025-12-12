import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { useTabNotification } from './hooks/useTabNotification';
import { useNotificationNavigation } from './hooks/useNotificationNavigation';
import './App.css';

// Hemen yüklenen sayfalar (kritik)
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import MainMenu from './pages/MainMenu/MainMenu';

// Lazy loaded sayfalar (ihtiyaç olunca yüklenir)
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Maintenance = lazy(() => import('./pages/Maintenance/Maintenance'));
const Operations = lazy(() => import('./pages/Operations/Operations'));
const SalesShipping = lazy(() => import('./pages/SalesShipping/SalesShipping'));
const DailyStock = lazy(() => import('./pages/DailyStock/DailyStock'));
const DowntimeList = lazy(() => import('./pages/DowntimeList/DowntimeList'));
const MonthlyCalendar = lazy(() => import('./pages/MonthlyCalendar/MonthlyCalendar'));
const Messages = lazy(() => import('./pages/Messages/Messages'));
const WorkPermits = lazy(() => import('./pages/WorkPermits/WorkPermits'));
const Announcements = lazy(() => import('./pages/Announcements/Announcements'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Reminders = lazy(() => import('./pages/Reminders/Reminders'));
const AdminPanel = lazy(() => import('./pages/AdminPanel/AdminPanel'));
const Electric = lazy(() => import('./pages/Electric/Electric'));
const Mechanic = lazy(() => import('./pages/Mechanic/Mechanic'));
const Hydraulic = lazy(() => import('./pages/Hydraulic/Hydraulic'));
const ElectricalDowntime = lazy(() => import('./pages/ElectricalDowntime/ElectricalDowntime'));
const MechanicalDowntime = lazy(() => import('./pages/MechanicalDowntime/MechanicalDowntime'));
const ElectricalPlan = lazy(() => import('./pages/ElectricalPlan/ElectricalPlan'));
const MechanicalPlan = lazy(() => import('./pages/MechanicalPlan/MechanicalPlan'));
const DCSLineA = lazy(() => import('./pages/DCSLineA/DCSLineA'));
const DCSLineB = lazy(() => import('./pages/DCSLineB/DCSLineB'));
const DCSBuhar = lazy(() => import('./pages/DCSBuhar/DCSBuhar'));
const DCSA012 = lazy(() => import('./pages/DCSA012/DCSA012'));
const DCSA021 = lazy(() => import('./pages/DCSA021/DCSA021'));
const DCSB012 = lazy(() => import('./pages/DCSB012/DCSB012'));
const DCSB021 = lazy(() => import('./pages/DCSB021/DCSB021'));
const OperationsDowntimeReport = lazy(() => import('./pages/OperationsDowntimeReport/OperationsDowntimeReport'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const Shipments = lazy(() => import('./pages/Shipments/Shipments'));

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#1a1a2e'
  }}>
    <div style={{ color: '#43a047', fontSize: '18px' }}>Yükleniyor...</div>
  </div>
);

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
  
  // Service Worker'dan gelen bildirim tıklamalarını dinle
  useNotificationNavigation();
  
  // Toplam okunmamış sayısını hesapla
  const unreadMessagesCount = conversations?.filter(c => c.unreadCount > 0).reduce((sum, c) => sum + c.unreadCount, 0) || 0;
  const totalUnread = (unreadNotificationsCount || 0) + unreadMessagesCount + (unreadAnnouncementsCount || 0);
  
  // Tab bildirimini aktifleştir
  useTabNotification(totalUnread);
  
  return null;
}

function AppContent() {
  return (
    <BrowserRouter>
      <TabNotificationWrapper />
      <Suspense fallback={<PageLoader />}>
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
        <Route 
          path="/operations-downtime-report" 
          element={
            <ProtectedRoute>
              <OperationsDowntimeReport />
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
        <Route 
          path="/dcs-a012" 
          element={
            <ProtectedRoute>
              <DCSA012 />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dcs-a021" 
          element={
            <ProtectedRoute>
              <DCSA021 />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dcs-b012" 
          element={
            <ProtectedRoute>
              <DCSB012 />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dcs-b021" 
          element={
            <ProtectedRoute>
              <DCSB021 />
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
      </Suspense>
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
