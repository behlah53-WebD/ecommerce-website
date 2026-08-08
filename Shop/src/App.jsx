import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import { AnnouncementBar } from "./components/common/AnnouncementBar";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { CartDrawer } from "./components/common/CartDrawer";
import { SearchModal } from "./components/common/SearchModal";
import { LoginPromptModal } from "./components/common/LoginPromptModal";

const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import("./pages/ShopPage").then(m => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage").then(m => ({ default: m.CategoriesPage })));
const CartPage = lazy(() => import("./pages/CartPage").then(m => ({ default: m.CartPage })));
const WishlistPage = lazy(() => import("./pages/WishlistPage").then(m => ({ default: m.WishlistPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const AccountPage = lazy(() => import("./pages/AccountPage").then(m => ({ default: m.AccountPage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then(m => ({ default: m.OrdersPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

const PageWrapper = ({ children }) => (
  <Suspense fallback={
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-600" />
    </div>
  }>
    {children}
  </Suspense>
);

// Inner layout component that has access to useLocation
function AppLayout({ isSearchOpen, setIsSearchOpen }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <AnnouncementBar />
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <CartDrawer />
      <LoginPromptModal />

      {/* Home page: no top padding — hero stretches under the transparent navbar */}
      {/* Other pages: normal padding so content clears the fixed navbar */}
      <main className={`flex-1 ${isHome ? "" : "pt-[96px] lg:pt-[112px]"}`}>
        <Routes>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/shop" element={<PageWrapper><ShopPage /></PageWrapper>} />
          <Route
            path="/product/:id"
            element={<PageWrapper><ProductDetailPage /></PageWrapper>}
          />
          <Route path="/categories" element={<PageWrapper><CategoriesPage /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
          <Route path="/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
          <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
          <Route path="/account" element={<PageWrapper><AccountPage /></PageWrapper>} />
          <Route path="/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <AppLayout
                  isSearchOpen={isSearchOpen}
                  setIsSearchOpen={setIsSearchOpen}
                />
              </Router>
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;