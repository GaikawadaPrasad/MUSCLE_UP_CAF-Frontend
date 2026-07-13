import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Expenses state
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({ totalAmount: 0, categoryBreakdown: {} });

  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

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

  // Check auth status
  const checkAuth = useCallback(async () => {
    const currentToken = localStorage.getItem('token') || token;
    if (!currentToken) {
      setUser(null);
      setAuthLoading(false);
      return;
    }
    setAuthLoading(true);
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      setToken('');
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, [token]);

  // Login action
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        const { token: authToken, data } = response.data;
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(data);
        toast.success(`Welcome back, ${data.username}!`);
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errMsg = error.response?.data?.error || 'Login failed';
      if (errMsg.includes('pending approval')) {
        toast('Waiting for administrator approval... ⏳', {
          style: {
            border: '1px solid #eab308',
            padding: '12px 18px',
            color: '#fef08a',
            background: '#0B1220',
            fontWeight: 'bold',
            fontSize: '13px'
          }
        });
      } else {
        toast.error(errMsg);
      }
      return false;
    }
  };

  // Register action
  const register = async (username, password) => {
    try {
      const response = await api.post('/auth/register', { username, password });
      if (response.data.success) {
        const { token: authToken, data } = response.data;
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(data);
        toast.success(`Account created! Welcome, ${data.username}!`);
        return true;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Fetch expenses for a specific month (YYYY-MM)
  const fetchExpenses = useCallback(async (month = '') => {
    setLoading(true);
    try {
      const q = month ? `?month=${month}` : '';
      const response = await api.get(`/expenses${q}`);
      if (response.data.success) {
        setExpenses(response.data.data.expenses);
        setExpenseSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new expense
  const addExpense = async (expenseData) => {
    try {
      const response = await api.post('/expenses', expenseData);
      if (response.data.success) {
        toast.success('Expense recorded successfully!');
        // Refresh local lists
        fetchExpenses(expenseData.date.slice(0, 7));
        return true;
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error.response?.data?.error || 'Failed to add expense');
      return false;
    }
  };

  // Delete an expense
  const deleteExpense = async (expenseId, month = '') => {
    try {
      const response = await api.delete(`/expenses/${expenseId}`);
      if (response.data.success) {
        toast.success('Expense deleted successfully!');
        fetchExpenses(month);
        return true;
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error.response?.data?.error || 'Failed to delete expense');
      return false;
    }
  };

  // Fetch all users list (Admin only)
  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const response = await api.get('/auth/users');
      if (response.data.success) {
        setUsersList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users list');
    }
  }, [user]);

  // Approve a pending user (Admin only)
  const approveUser = async (userId) => {
    try {
      const response = await api.put(`/auth/users/${userId}/approve`);
      if (response.data.success) {
        toast.success(response.data.message || 'User approved!');
        fetchUsers();
        return true;
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error(error.response?.data?.error || 'Failed to approve user');
      return false;
    }
  };

  // Reject/Delete a user (Admin only)
  const rejectUser = async (userId) => {
    try {
      const response = await api.delete(`/auth/users/${userId}/reject`);
      if (response.data.success) {
        toast.success(response.data.message || 'User request rejected');
        fetchUsers();
        return true;
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error(error.response?.data?.error || 'Failed to reject user');
      return false;
    }
  };

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch data when authenticated
  useEffect(() => {
    if (user) {
      fetchProducts();
      const today = new Date().toISOString().split('T')[0];
      fetchSales({ date: today });
      fetchDashboardStats();
      if (user.role === 'admin') {
        fetchUsers();
      }
    }
  }, [user, fetchProducts, fetchSales, fetchDashboardStats, fetchUsers]);

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
        expenses,
        expenseSummary,
        user,
        token,
        authLoading,
        usersList,
        fetchProducts,
        fetchSales,
        fetchDashboardStats,
        fetchUsers,
        fetchExpenses,
        addSale,
        updateSale,
        deleteSale,
        addProduct,
        updateProduct,
        deleteProduct,
        addExpense,
        deleteExpense,
        login,
        register,
        logout,
        checkAuth,
        approveUser,
        rejectUser
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
