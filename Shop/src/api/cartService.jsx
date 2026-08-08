import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const getBackendCart = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.cart.get);
    return response?.data?.items || [];
  } catch (error) {
    console.warn('Failed to fetch backend cart:', error);
    return [];
  }
};

export const addToBackendCart = async (product, quantity = 1, color = null, size = null) => {
  try {
    const rawId = product.id || product._id || product.productId;
    if (!rawId) {
      console.warn('Cannot add to backend cart: product ID is missing', product);
      return null;
    }
    const payload = {
      productId: String(rawId),
      name: product.name || product.productName || [product.firstName, product.lastName].filter(Boolean).join(' ') || 'Product',
      price: Number(product.price) || 0,
      image: product.image || product.images?.[0] || '',
      color,
      size,
      quantity: Number(quantity) || 1,
    };
    const response = await apiClient.post(API_ENDPOINTS.cart.add, payload);
    return response?.data?.items || [];
  } catch (error) {
    console.warn('Failed to add to backend cart:', error);
    return null;
  }
};

export const updateBackendCartItem = async (productId, color, size, delta) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.cart.update, { productId, color, size, delta });
    return response?.data?.items || [];
  } catch (error) {
    console.warn('Failed to update backend cart item:', error);
    return null;
  }
};

export const removeFromBackendCart = async (productId, color, size) => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.cart.remove, { data: { productId, color, size } });
    return response?.data?.items || [];
  } catch (error) {
    console.warn('Failed to remove item from backend cart:', error);
    return null;
  }
};

export const syncCartWithBackend = async (cartItems) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.cart.sync, { items: cartItems });
    return response?.data?.items || [];
  } catch (error) {
    console.warn('Backend cart sync error:', error);
    return null;
  }
};

export const clearBackendCart = async () => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.cart.clear);
    return response?.data?.items || [];
  } catch (error) {
    console.warn('Failed to clear backend cart:', error);
    return [];
  }
};
