import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import MainMenu from './pages/MainMenu/MainMenu';
import DailyStock from './pages/DailyStock/DailyStock';
import SalesOrder from './pages/SalesOrder/SalesOrder';
import MonthlyCalendar from './pages/MonthlyCalendar/MonthlyCalendar';
import Messages from './pages/Messages/Messages';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useApp();
  return !user ? children : <Navigate to="/dashboard" />;
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
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/daily-stock" 
          element={
            <ProtectedRoute>
              <DailyStock />
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
