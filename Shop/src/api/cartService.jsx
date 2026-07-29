import apiClient from './apiClient';

export const getBackendCart = async () => {
  try {
    const response = await apiClient.get('/cart');
    return response.data?.items || [];
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
    const response = await apiClient.post('/cart', payload);
    return response.data?.items || [];
  } catch (error) {
    console.warn('Failed to add to backend cart:', error);
    return null;
  }
};

export const updateBackendCartItem = async (productId, color, size, delta) => {
  try {
    const response = await apiClient.put('/cart/item', { productId, color, size, delta });
    return response.data?.items || [];
  } catch (error) {
    console.warn('Failed to update backend cart item:', error);
    return null;
  }
};

export const removeFromBackendCart = async (productId, color, size) => {
  try {
    const response = await apiClient.delete('/cart/item', { data: { productId, color, size } });
    return response.data?.items || [];
  } catch (error) {
    console.warn('Failed to remove item from backend cart:', error);
    return null;
  }
};

export const syncCartWithBackend = async (cartItems) => {
  try {
    const response = await apiClient.post('/cart/sync', { items: cartItems });
    return response.data?.items || [];
  } catch (error) {
    console.warn('Backend cart sync error:', error);
    return null;
  }
};

export const clearBackendCart = async () => {
  try {
    const response = await apiClient.delete('/cart/clear');
    return response.data?.items || [];
  } catch (error) {
    console.warn('Failed to clear backend cart:', error);
    return [];
  }
};
