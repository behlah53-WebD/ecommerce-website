export const API_BASE_URL = "http://localhost:3000";

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    me: '/auth/me',
    profile: '/auth/profile',
    refresh: '/auth/refresh',
  },
  products: {
    list: '/users',
    detail: '/users',
    categories: '/users/categories',
    brands: '/users/brands',
    shockingDeal: '/users/shocking-deal/active',
    search: '/users',
  },
  cart: {
    get: '/cart',
    add: '/cart',
    update: '/cart/item',
    remove: '/cart/item',
    clear: '/cart/clear',
    sync: '/cart/sync',
  },
  wishlist: {
    get: '/wishlist',
    toggle: '/wishlist/toggle',
    sync: '/wishlist/sync',
  },
  orders: {
    list: '/orders',
    create: '/orders',
  },
};

export const API_TIMEOUT = 15000;
export const API_HEADERS = {
  'Content-Type': 'application/json',
};
