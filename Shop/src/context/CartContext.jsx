import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getBackendCart,
  addToBackendCart,
  updateBackendCartItem,
  removeFromBackendCart,
  clearBackendCart,
  syncCartWithBackend,
} from '../api/cartService';
import { getProductById } from '../api/productService';

const CartContext = createContext();

const formatBackendCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    id: String(item.productId),
    name: item.name,
    price: item.price,
    image: item.image,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
  }));
};

export const CartProvider = ({ children }) => {
  const { currentUser, isLoggedIn, promptLogin, pendingAction, clearPendingAction, isAuthLoading } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  const checkStockAndAdd = async (product, quantity, selectedColor, selectedSize) => {
    // Fetch latest product data to check stock
    const productId = product.id || product._id || product.productId;
    if (productId) {
      try {
        const freshProduct = await getProductById(productId);
        if (freshProduct) {
          const availableStock = freshProduct.stock || 0;
          const productStatus = freshProduct.productStatus || 'In Stock';
          
          // Check if out of stock
          if (availableStock === 0 || productStatus === 'Out of Stock') {
            showToast(`${freshProduct.name || 'This product'} is out of stock`, 'error');
            return false;
          }
          
          // Check if low stock
          if (productStatus === 'Low Stock' || availableStock <= 10) {
            showToast(`Only ${availableStock} items left in stock`, 'warning');
          }
          
          // Check if requested quantity exceeds available stock
          const existingItem = cartItems.find(
            (item) => String(item.id) === String(productId) && item.color === selectedColor && item.size === selectedSize
          );
          const currentQtyInCart = existingItem ? existingItem.quantity : 0;
          const totalRequested = currentQtyInCart + quantity;
          
          if (totalRequested > availableStock) {
            showToast(`Cannot add more than ${availableStock} items (${currentQtyInCart} already in cart)`, 'error');
            return false;
          }
        }
      } catch (err) {
        console.warn('Failed to check stock:', err);
      }
    }
    return true;
  };

  const loadUserCart = useCallback(async () => {
    if (isAuthLoading) return;

    if (!currentUser) {
      setCartItems([]);
      return;
    }

    try {
      const backendItems = await getBackendCart();
      if (Array.isArray(backendItems)) {
        setCartItems(formatBackendCartItems(backendItems));
      }
    } catch (err) {
      console.warn('Failed loading backend cart:', err);
    }
  }, [currentUser, isAuthLoading]);

  useEffect(() => {
    loadUserCart();
  }, [loadUserCart]);

  
  useEffect(() => {
    if (isLoggedIn && pendingAction && pendingAction.type === 'cart') {
      const { product, quantity, color, size } = pendingAction;
      if (product) {
        addToCartInternal(product, quantity, color, size);
      }
      clearPendingAction();
    }
  }, [isLoggedIn, pendingAction]);

  const addToCartInternal = async (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    const rawId = product.id || product._id || product.productId;
    if (!rawId) return;
    const pId = String(rawId);
    const itemColor = selectedColor || product.colors?.[0] || null;
    const itemSize = selectedSize || null;
    const prodName = product.name || product.productName || [product.firstName, product.lastName].filter(Boolean).join(' ') || 'Product';

    // Check stock before adding
    const canAdd = await checkStockAndAdd(product, quantity, itemColor, itemSize);
    if (!canAdd) return;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => String(item.id) === pId && item.color === itemColor && item.size === itemSize
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prevItems,
        {
          id: pId,
          name: prodName,
          price: Number(product.price) || 0,
          image: product.image || product.images?.[0] || '',
          color: itemColor,
          size: itemSize,
          quantity: Number(quantity) || 1,
        },
      ];
    });

    setIsCartOpen(true);

    if (isLoggedIn) {
      const backendItems = await addToBackendCart(product, quantity, itemColor, itemSize);
      if (Array.isArray(backendItems) && backendItems.length > 0) {
        setCartItems(formatBackendCartItems(backendItems));
      }
    }
  };

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    if (!isLoggedIn) {
      promptLogin('Please log in to add items to your cart.', {
        type: 'cart',
        product,
        quantity,
        color: selectedColor,
        size: selectedSize,
      });
      return;
    }

    addToCartInternal(product, quantity, selectedColor, selectedSize);
  };

  const removeFromCart = async (id, color, size) => {
    const targetId = String(id);
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(String(item.id) === targetId && item.color === color && item.size === size)
      )
    );

    if (isLoggedIn) {
      const backendItems = await removeFromBackendCart(targetId, color, size);
      if (Array.isArray(backendItems)) {
        setCartItems(formatBackendCartItems(backendItems));
      }
    }
  };

  const updateQuantity = async (id, color, size, delta) => {
    const targetId = String(id);
    // Get current item to check stock
    const currentItem = cartItems.find(
      (item) => String(item.id) === targetId && item.color === color && item.size === size
    );
    
    // Check stock limit
    if (currentItem && currentItem.stock !== undefined) {
      const newQty = currentItem.quantity + delta;
      if (newQty > currentItem.stock) {
        showToast(`Cannot exceed available stock (${currentItem.stock})`, 'error');
        return;
      }
    }
    
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (String(item.id) === targetId && item.color === color && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );

    if (isLoggedIn) {
      const backendItems = await updateBackendCartItem(targetId, color, size, delta);
      if (Array.isArray(backendItems)) {
        setCartItems(formatBackendCartItems(backendItems));
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (isLoggedIn) {
      await clearBackendCart();
    }
  };

  const totalItems = cartItems.length;
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        loadUserCart,
        toast,
      }}
    >
      {children}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.type === 'error' ? 'bg-red-500 text-white' : toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-primary-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
