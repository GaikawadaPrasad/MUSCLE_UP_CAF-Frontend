import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BillingScreen from './pages/BillingScreen';
import ProductManagement from './pages/ProductManagement';
import Reports from './pages/Reports';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/billing" element={<BillingScreen />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
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
    </AppProvider>
  );
}

export default App;
