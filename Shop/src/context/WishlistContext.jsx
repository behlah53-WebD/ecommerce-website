import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getBackendWishlist,
  toggleBackendWishlist,
} from '../api/wishlistService';

const WishlistContext = createContext();

const formatBackendWishlistItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    id: String(item.productId),
    _id: String(item.productId),
    name: item.name,
    price: item.price,
    image: item.image,
    category: item.category,
    brand: item.brand,
  }));
};

export const WishlistProvider = ({ children }) => {
  const { currentUser, isLoggedIn, promptLogin, pendingAction, clearPendingAction, isAuthLoading } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);

  
  const loadUserWishlist = useCallback(async () => {
    if (isAuthLoading) return;

    if (!currentUser) {
      setWishlistItems([]);
      return;
    }

    try {
      const backendItems = await getBackendWishlist();
      if (Array.isArray(backendItems)) {
        setWishlistItems(formatBackendWishlistItems(backendItems));
      }
    } catch (err) {
      console.warn('Error loading backend wishlist:', err);
    }
  }, [currentUser, isAuthLoading]);

  useEffect(() => {
    loadUserWishlist();
  }, [loadUserWishlist]);

  
  useEffect(() => {
    if (isLoggedIn && pendingAction && pendingAction.type === 'wishlist') {
      const { product } = pendingAction;
      if (product) {
        toggleWishlistInternal(product);
      }
      clearPendingAction();
    }
  }, [isLoggedIn, pendingAction]);

  const toggleWishlistInternal = async (product) => {
    const rawId = product.id || product._id;
    if (!rawId) return;
    const id = String(rawId);

    setWishlistItems((prev) => {
      const exists = prev.some((item) => String(item.id || item._id) === id);
      if (exists) {
        return prev.filter((item) => String(item.id || item._id) !== id);
      }
      return [...prev, { ...product, id, _id: id }];
    });

    if (isLoggedIn) {
      const backendItems = await toggleBackendWishlist(product);
      if (Array.isArray(backendItems)) {
        setWishlistItems(formatBackendWishlistItems(backendItems));
      }
    }
  };

  const toggleWishlist = (product) => {
    if (!isLoggedIn) {
      promptLogin('Please log in to save items to your wishlist.', {
        type: 'wishlist',
        product,
      });
      return;
    }

    toggleWishlistInternal(product);
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistItems.some((item) => String(item.id || item._id) === String(productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistItems.length,
        loadUserWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
