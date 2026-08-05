import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://ecommerce-api-9ayg.onrender.com";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('Please sign in to continue.');
  const [pendingAction, setPendingAction] = useState(null);

  
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await axios.get(`${API_BASE}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.data && res.data.success) {
            setCurrentUser(res.data.data);
          } else {
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
          }
        } catch (err) {
          console.warn('Token validation failed on startup:', err);
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
        }
      }
      setIsAuthLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (res.data && res.data.success) {
        const { accessToken, refreshToken, data: userData } = res.data;
        const loggedUser = userData || { email, role: 'Buyer', name: 'Buyer User' };
        const userRole = loggedUser.role;
        if (userRole?.toLowerCase() !== 'buyer') {
          return { success: false, message: 'Only buyer accounts can log in to the shop.' };
        }
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
        setCurrentUser(loggedUser);
        setIsAuthModalOpen(false);
        return { success: true, message: res.data.message || 'Login successful!' };
      }
      return { success: false, message: res.data?.message || 'Login failed.' };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to connect to server.';
      return { success: false, message: errMsg };
    }
  };

  const signup = async ({ name, email, password }) => {
    try {
      
      const res = await axios.post(`${API_BASE}/auth/signup`, {
        name,
        email,
        password,
        role: 'Buyer',
      });
      if (res.data && res.data.success) {
        return { success: true, message: res.data.message || 'Account created successfully!' };
      }
      return { success: false, message: res.data?.message || 'Signup failed.' };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create account.';
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    setCurrentUser(null);
  };

  const updateProfile = useCallback(
    async (updates) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return { success: false, message: 'Not authenticated.' };
      }

      try {
        const res = await axios.put(
          `${API_BASE}/auth/profile`,
          updates,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data && res.data.success) {
          setCurrentUser(res.data.data);
          return { success: true, message: res.data.message || 'Profile updated.' };
        }
        return {
          success: false,
          message: res.data?.message || 'Failed to update profile.',
        };
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to update profile.';
        return { success: false, message: errMsg };
      }
    },
    [],
  );

  const promptLogin = useCallback((message, actionPayload = null) => {
    setAuthModalMessage(message || 'Please sign in to proceed.');
    setPendingAction(actionPayload);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const clearPendingAction = () => {
    setPendingAction(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        authModalMessage,
        pendingAction,
        promptLogin,
        closeAuthModal,
        clearPendingAction,
         login,
         signup,
         logout,
         updateProfile,
         isLoggedIn: !!currentUser,
         isAuthLoading,
       }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
