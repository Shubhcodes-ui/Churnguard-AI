import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppShell from '@/components/layout/AppShell';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import CustomersPage from '@/pages/CustomersPage';
import CustomerDetailPage from '@/pages/CustomerDetailPage';
import PredictPage from '@/pages/PredictPage';
import SegmentsPage from '@/pages/SegmentsPage';
import RetentionPage from '@/pages/RetentionPage';
import ModelsPage from '@/pages/ModelsPage';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000,
    },
  },
});

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="predict" element={<PredictPage />} />
            <Route path="segments" element={<SegmentsPage />} />
            <Route path="retention" element={<RetentionPage />} />
            <Route path="models" element={<ModelsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#12161F',
            color: '#E8EAF0',
            border: '1px solid #232838',
            fontSize: '12px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#3ECF8E',
              secondary: '#12161F',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF6B4A',
              secondary: '#12161F',
            },
          },
        }} 
      />
    </QueryClientProvider>
  );
}
