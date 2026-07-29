# Luxe Storefront - React JS + Vite

A clean, modern, and high-performance e-commerce frontend architecture built with **React 18**, **Vite**, **Tailwind CSS**, and **React Router DOM**.

Designed specifically for seamless backend API integration.

## 🚀 Getting Started

### 1. Install Dependencies
Run the following command in your terminal to install `node_modules`:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
VITE_API_BASE_URL=http:
```

### 3. Start Development Server
```bash
npm run dev
```

---

## 📁 Directory Structure & Architecture

```
src/
├── api/                  # API client & backend service endpoints
│   ├── apiClient.js      # Axios instance configured with base URL
│   ├── productService.js # Product & category backend API functions
│   └── cartService.js    # Shopping cart backend sync functions
├── context/              # React Context Providers
│   ├── ThemeContext.jsx  # Dark / Light theme toggle
│   ├── ProductContext.jsx# Dynamic backend product state & filter logic
│   ├── CartContext.jsx   # Shopping cart items & calculations
│   └── WishlistContext.jsx# Wishlist items management
├── hooks/                # Custom React Hooks
│   ├── useProducts.js    # Product data fetching and state hook
│   ├── useCart.js        # Cart actions hook
│   └── useWishlist.js    # Wishlist actions hook
├── components/
│   ├── common/           # Shared UI components (Navbar, Footer, CartDrawer, SearchModal)
│   ├── home/             # Landing page components (Hero, Features, Categories)
│   └── products/         # Product grid, card, filters, skeleton & blank empty state
├── pages/                # Route pages (Home, Shop, Product Detail, Categories, Cart, Wishlist, Checkout, Account)
├── index.css             # Tailwind CSS & custom styling utilities
├── App.jsx               # Main router & app layout
└── main.jsx              # React DOM render entry point
```

---

## 🔗 Backend Data Integration Guide

As requested, **product chips and arrays are left blank (`[]`)** with dynamic loading states and skeletons so you can plug in your backend API seamlessly.

### How to Connect Your Backend Products API:

1. Update `src/api/productService.js` to point to your backend endpoints:
   ```javascript
   import apiClient from './apiClient';

   export const fetchProducts = async (params = {}) => {
     const response = await apiClient.get('/products', { params });
     return response.data; 
   };
   ```

2. The `ProductContext.jsx` will automatically trigger `fetchProducts()` on mount and update the grid cleanly!

3. Product object structure expected by `<ProductCard />`:
   ```json
   {
     "_id": "60d5ec49f1b2c81184a7e123",
     "name": "Product Title",
     "category": "Clothing",
     "price": 199,
     "originalPrice": 249,
     "rating": 4.8,
     "images": ["https://..."],
     "colors": ["#000000", "#FFFFFF"],
     "isNew": true,
     "isBestseller": true
   }
   ```
