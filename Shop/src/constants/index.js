export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'brand-asc', label: 'Brand: A to Z' },
  { value: 'brand-desc', label: 'Brand: Z to A' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export const DEFAULT_SORT = 'featured';
export const ALL_CATEGORY = 'All';

export const DEFAULT_PRICE_RANGE = [0, 1000];
export const FREE_SHIPPING_THRESHOLD = 100;

export const PROMO_CODE = 'ZYRA20';
export const PROMO_DISCOUNT_PERCENT = 20;

export const CATEGORY_ICONS = {
  clothing: '👕',
  clothes: '👕',
  apparel: '👕',
  fashion: '👕',
  footwear: '👟',
  shoes: '👟',
  sneakers: '👟',
  accessories: '👜',
  bags: '👜',
  handbags: '👜',
  watches: '⌚',
  watch: '⌚',
  jewelry: '💎',
  jewellery: '💎',
  electronics: '📱',
  gadgets: '📱',
  beauty: '💄',
  cosmetics: '💄',
  makeup: '💄',
  sports: '⚽',
  fitness: '⚅',
  home: '🏠',
  furniture: '🏠',
  decor: '🏠',
  books: '📚',
  stationery: '📚',
};

export const DEFAULT_CATEGORY_ICON = '📦';
export const ALL_CATEGORY_ICON = '🛍️';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
