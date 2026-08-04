import React, { useState } from "react";
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

import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CartPage } from "./pages/CartPage";
import { WishlistPage } from "./pages/WishlistPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AccountPage } from "./pages/AccountPage";
import { OrdersPage } from "./pages/OrdersPage";
import { NotFoundPage } from "./pages/NotFoundPage";

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
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route
            path="/product/:id"
            element={<ProductDetailPage />}
          />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<NotFoundPage />} />
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