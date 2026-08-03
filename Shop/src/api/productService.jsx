import apiClient from './apiClient';

export const normalizeProduct = (item) => {
  if (!item) return null;
  const rawId = item.id || item._id || item.productId;
  if (!rawId) return null;
  const pId = String(rawId);
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ');
  const name = item.productName || item.name || fullName || 'Product';
  const price = Number(item.price) || 0;
  const stock = Number(item.stock) !== undefined ? Number(item.stock) : 10;

  
  let images = [];
  if (Array.isArray(item.files) && item.files.length > 0) {
    images = item.files
      .map((file) => {
        if (!file) return null;
        if (typeof file === 'string') return file;
        if (file.url) return file.url;
        if (file.data) {
          return file.data.startsWith('data:')
            ? file.data
            : `data:${file.mimetype || 'image/jpeg'};base64,${file.data}`;
        }
        return null;
      })
      .filter(Boolean);
  }

  if (images.length === 0) {
    images = [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop',
    ];
  }

  return {
    id: pId,
    _id: pId,
    name,
    productName: name,
    price,
    originalPrice: price > 0 ? Math.round(price * 1.2) : 99,
    stock,
    inStock: stock > 0,
    category: item.category || 'General',
    brand: item.brand || '',
    manufacturer: item.sellerName || item.manufacturer || '',
    description: item.description || '',
    sku: item.sku || '',
    productStatus: item.productStatus || 'In Stock',
    image: images[0],
    images,
    rating: 4.8,
    reviewsCount: 24,
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: true,
  };
};

export const getProducts = async (filters = {}) => {
  try {
    const response = await apiClient.get('/users', { params: filters });
    const rawData = response.data?.data || [];
    const pagination = response.data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalRecords: Array.isArray(rawData) ? rawData.length : 0,
      hasNextPage: false,
      hasPrevPage: false,
    };

    return {
      products: Array.isArray(rawData) ? rawData.map(normalizeProduct).filter(Boolean) : [],
      pagination,
    };
  } catch (error) {
    console.warn('Failed to fetch backend products, returning empty list:', error);
    return {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    const item = response.data?.data;
    if (!item) return null;
    return normalizeProduct(item);
  } catch (error) {
    
    console.warn(`Direct fetch for product ${id} failed, using fallback:`, error);
    try {
      const { products } = await getProducts({ limit: 50 });
      return products.find((p) => String(p.id) === String(id) || String(p._id) === String(id)) || null;
    } catch {
      return null;
    }
  }
};

export const getCategories = async () => {
  try {
    const response = await apiClient.get('/users/categories');
    const categories = response.data?.data || response.data || [];
    if (Array.isArray(categories)) {
      return categories.filter(Boolean);
    }
    return ['General', 'Electronics', 'Clothing', 'Accessories'];
  } catch (error) {
    console.warn('Failed to fetch backend categories, using defaults:', error);
    return ['General', 'Electronics', 'Clothing', 'Accessories'];
  }
};

export const searchProducts = async (query) => {
  try {
    const { products } = await getProducts({ search: query, limit: 50 });
    return products;
  } catch (error) {
    return [];
  }
};

