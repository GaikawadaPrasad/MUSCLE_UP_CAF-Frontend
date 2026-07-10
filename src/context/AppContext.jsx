import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sales (default to today's sales)
  const fetchSales = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/sales?${queryParams}`);
      if (response.data.success) {
        setSales(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  }, []);

  // Add a sale (handles single sale object or array of sales for multi-checkout)
  const addSale = async (saleData) => {
    try {
      if (Array.isArray(saleData)) {
        if (saleData.length === 0) return false;
        const promises = saleData.map(item => api.post('/sales', item));
        const responses = await Promise.all(promises);
        const allSuccessful = responses.every(res => res.data && res.data.success);
        if (allSuccessful) {
          toast.success('All transactions recorded successfully!');
          fetchSales({ date: new Date().toISOString().split('T')[0] });
          fetchDashboardStats();
          return true;
        }
        return false;
      } else {
        const response = await api.post('/sales', saleData);
        if (response.data.success) {
          toast.success('Sale recorded successfully!');
          fetchSales({ date: new Date().toISOString().split('T')[0] });
          fetchDashboardStats();
          return true;
        }
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      toast.error(error.response?.data?.error || 'Failed to add sale');
      return false;
    }
  };

  // Edit a sale
  const updateSale = async (saleId, updatedData) => {
    try {
      const response = await api.put(`/sales/${saleId}`, updatedData);
      if (response.data.success) {
        toast.success('Sale record updated!');
        fetchSales({ date: new Date().toISOString().split('T')[0] });
        fetchDashboardStats();
        return true;
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error('Failed to update sale record');
      return false;
    }
  };

  // Delete a sale
  const deleteSale = async (saleId) => {
    try {
      const response = await api.delete(`/sales/${saleId}`);
      if (response.data.success) {
        toast.success('Sale record deleted');
        fetchSales({ date: new Date().toISOString().split('T')[0] });
        fetchDashboardStats();
        return true;
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Failed to delete sale record');
      return false;
    }
  };

  // Add a product
  const addProduct = async (productData) => {
    try {
      const response = await api.post('/products', productData);
      if (response.data.success) {
        toast.success('Product added successfully!');
        fetchProducts();
        return true;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.error || 'Failed to add product');
      return false;
    }
  };

  // Update a product
  const updateProduct = async (productId, updatedData) => {
    try {
      const response = await api.put(`/products/${productId}`, updatedData);
      if (response.data.success) {
        toast.success('Product updated!');
        fetchProducts();
        return true;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.error || 'Failed to update product');
      return false;
    }
  };

  // Delete a product
  const deleteProduct = async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      if (response.data.success) {
        toast.success('Product deleted');
        fetchProducts();
        return true;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      return false;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchProducts();
    // Default to today's date for sales list
    const today = new Date().toISOString().split('T')[0];
    fetchSales({ date: today });
    fetchDashboardStats();
  }, [fetchProducts, fetchSales, fetchDashboardStats]);

  // Separate active products computed property
  const activeProducts = products.filter(p => p.active);

  return (
    <AppContext.Provider
      value={{
        products,
        activeProducts,
        sales,
        loading,
        dashboardData,
        fetchProducts,
        fetchSales,
        fetchDashboardStats,
        addSale,
        updateSale,
        deleteSale,
        addProduct,
        updateProduct,
        deleteProduct
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
