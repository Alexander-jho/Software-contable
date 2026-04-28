import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import CashFlow from './pages/CashFlow';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen font-black uppercase italic">Verificando Credenciales...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen font-black uppercase italic">Verificando Permisos...</div>;
  if (role !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar />
      <main className="flex-1 flex flex-col ml-64 min-h-screen bg-canvas/30 backdrop-blur-[1px]">
        <div className="p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><AdminRoute><MainLayout><Products /></MainLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><MainLayout><Transactions /></MainLayout></ProtectedRoute>} />
          <Route path="/cash" element={<ProtectedRoute><AdminRoute><MainLayout><CashFlow /></MainLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><AdminRoute><MainLayout><Employees /></MainLayout></AdminRoute></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AdminRoute><MainLayout><Settings /></MainLayout></AdminRoute></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
