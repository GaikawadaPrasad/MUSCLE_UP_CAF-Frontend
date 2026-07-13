import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BillingScreen from './pages/BillingScreen';
import ProductManagement from './pages/ProductManagement';
import Reports from './pages/Reports';
import Login from './pages/Login';
import UsersManagement from './pages/UsersManagement';
import Expenses from './pages/Expenses';

function AppContent() {
  const { token, authLoading, user } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-darknavy flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin border-4 border-emeraldGreen border-t-transparent w-10 h-10 rounded-full shadow-md shadow-emeraldGreen/10"></div>
          <p className="text-white font-bold tracking-widest text-[10px] uppercase animate-pulse">Loading MuscleUP Cafe...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            token ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/billing" element={<BillingScreen />} />
                  <Route path="/products" element={<ProductManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/expenses" element={<Expenses />} />
                  {user?.role === 'admin' && <Route path="/users" element={<UsersManagement />} />}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid #334155',
            fontFamily: 'Outfit, sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#8faf62',
              secondary: '#0f172a'
            }
          }
        }}
      />
    </Router>
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
