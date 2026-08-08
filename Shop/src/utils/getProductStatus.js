export const getProductStatus = (product) => {
  if (!product) return 'Unknown';

  const stock = Number(product?.stock);

  if (product.productStatus) return product.productStatus;

  if (!Number.isFinite(stock) || stock < 0) {
    return stock === 0 ? 'Out of Stock' : 'In Stock';
  }

  if (stock === 0) return 'Out of Stock';
  if (stock <= 10) return 'Low Stock';
  return 'In Stock';
};

export const getProductStock = (product) => {
  const stock = Number(product?.stock);
  return Number.isFinite(stock) && stock >= 0 ? stock : 0;
};

export const getProductName = (product) => {
  if (!product) return 'Product';
  return (
    product.name ||
    product.productName ||
    [product.firstName, product.lastName].filter(Boolean).join(' ') ||
    'Product'
  );
};

export const getProductImage = (product) => {
  if (!product) return '';
  return product.image || product.images?.[0] || '';
};

export const getProductId = (product) => {
  if (!product) return null;
  return product.id || product._id || product.productId;
};

export const getItemKey = (id, color = null, size = null) => {
  return `${String(id)}__${color || ''}__${size || ''}`;
};

export default getProductStatus;
