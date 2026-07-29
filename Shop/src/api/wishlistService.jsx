import apiClient from "./apiClient";

export const getBackendWishlist = async () => {
  try {
    const response = await apiClient.get('/wishlist');
    return response.data?.items || [];
  } catch (error) {
    console.warn('Failed to fetch backend wishlist:', error);
    return [];
  }
};

export const toggleBackendWishlist = async (product) => {
  try {
    const rawId = product.id || product._id || product.productId;
    if (!rawId) {
      console.warn('Cannot toggle backend wishlist: product ID is missing', product);
      return null;
    }
    const payload = {
      productId: String(rawId),
      name: product.name || product.productName || [product.firstName, product.lastName].filter(Boolean).join(' ') || 'Product',
      price: Number(product.price) || 0,
      image: product.image || product.images?.[0] || '',
      category: product.category || '',
      brand: product.brand || '',
    };
    const response = await apiClient.post('/wishlist/toggle', payload);
    return response.data?.items || [];
  } catch (error) {
    console.warn('Failed to toggle backend wishlist:', error);
    return null;
  }
};

export const syncWishlistWithBackend = async (wishlistItems) => {
  try {
    const response = await apiClient.post('/wishlist/sync', { items: wishlistItems });
    return response.data?.items || [];
  } catch (error) {
    console.warn('Backend wishlist sync error:', error);
    return null;
  }
};
