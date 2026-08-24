# Shop Project - Recommended Next.js Folder Organization

## Overview
This chart shows how to organize the existing shop project files for better maintainability and scalability in Next.js.

## Directory Structure

```
src/
├── api/                    # API services and clients
│   ├── apiClient.jsx       # Base API configuration
│   ├── productService.jsx  # Product-related API calls
│   ├── cartService.jsx     # Cart-related API calls
│   └── wishlistService.jsx # Wishlist API calls
│
├── context/                # React Context providers
│   ├── CartContext.jsx
│   ├── AuthContext.jsx
│   ├── ProductContext.jsx
│   ├── ThemeContext.jsx
│   └── WishlistContext.jsx
│
├── hooks/                  # Custom React hooks
│   ├── useProducts.jsx     # Product fetching logic
│   ├── useDebounce.jsx     # Debounce utility hook
│   ├── usePerformance.jsx  # Performance monitoring
│   └── useQueries.jsx      # Query management
│
├── components/             # Reusable UI components
│   ├── layout/             # Page layout components
│   │   ├── AnnouncementBar.jsx
│   │   └── Footer.jsx
│   ├── common/             # Common utility components
│   │   └── EditProfileModal.jsx
│   ├── ui/                 # Base UI components (shadcn/ui, etc.)
│   │   └── EmptyState.jsx
│   ├── products/           # Product-related components
│   ├── home/               # Home page components
│   ├── filters/            # Filter components
│   ├── orders/             # Order-related components
│   └── shop/               # Shop page components
│
├── pages/                  # Next.js pages (file-based routing)
│   ├── home/               # Home page
│   ├── shop/               # Shop listing page
│   ├── product/            # Product detail pages
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout page
│   ├── account/            # User account page
│   ├── auth/               # Authentication pages
│   ├── CategoriesPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── HomePage.jsx
│   ├── NotFoundPage.jsx
│   ├── OrdersPage.jsx
│   ├── ProductDetailPage.jsx
│   └── ShopPage.jsx
│
├── types/                  # TypeScript type definitions
│   # Add .ts/.tsx files for type definitions
│
├── constants/              # Application constants
│   └── currency.js         # Currency configuration
│
├── config/                 # Configuration files
│   └── api.js              # API base URL/config
│
├── lib/                    # Library utilities
│   └── queryClient.jsx     # React Query configuration
│
└── utils/                  # General utility functions
    # Add helper functions here
```

## Key Organization Principles

1. **Context**: All context providers grouped together for easy access and management
2. **Hooks**: Custom hooks separated by functionality (data fetching, formatting, etc.)
3. **Components**: 
   - `layout/` - Page structure components
   - `common/` - Reusable dialogs/modals
   - `ui/` - Base UI components
   - Feature-specific folders (products, home, etc.)
4. **Pages**: Next.js file-based routing, optionally grouped by feature
5. **API**: Service layer separated from configuration
6. **Constants**: Configuration values (currencies, etc.)
7. **Types**: TypeScript definitions (currently empty, ready to use)
8. **Config**: API endpoints and settings
9. **Lib**: Third-party library configurations (React Query)

## Benefits

- **Scalable**: Easy to add new features without restructuring
- **Maintainable**: Clear separation of concerns
- **Next.js Compliant**: Follows file-based routing and best practices
- **Team Friendly**: Easy for multiple developers to work on simultaneously