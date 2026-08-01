import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getBackendCart,
  addToBackendCart,
  updateBackendCartItem,
  removeFromBackendCart,
  clearBackendCart,
} from "../api/cartService";
import { getProductById } from "../api/productService";

const CartContext = createContext();

const getProductId = (product) =>
  product?.id || product?._id || product?.productId;

const getProductStock = (product) => {
  const stock = Number(product?.stock);

  return Number.isFinite(stock) && stock >= 0 ? stock : 0;
};

const getProductName = (product) =>
  product?.name ||
  product?.productName ||
  [product?.firstName, product?.lastName].filter(Boolean).join(" ") ||
  "Product";

const getProductImage = (product) =>
  product?.image || product?.images?.[0] || "";

const getItemKey = (id, color = null, size = null) =>
  `${String(id)}__${color || ""}__${size || ""}`;

const formatBackendCartItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    id: String(item.productId || item.id || item._id),
    name: item.name || item.productName || "Product",
    price: Number(item.price) || 0,
    image: item.image || item.images?.[0] || "",
    color: item.color || null,
    size: item.size || null,
    quantity: Math.max(1, Number(item.quantity) || 1),
    stock:
      item.stock === undefined || item.stock === null
        ? undefined
        : getProductStock(item),
  }));
};

export const CartProvider = ({ children }) => {
  const {
    currentUser,
    isLoggedIn,
    promptLogin,
    pendingAction,
    clearPendingAction,
    isAuthLoading,
  } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "info",
      });
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const getFreshProduct = useCallback(
    async (productId, fallbackProduct = null) => {
      try {
        const freshProduct = await getProductById(productId);

        if (freshProduct) {
          return freshProduct;
        }
      } catch (error) {
        console.warn("Failed to fetch latest product stock:", error);
      }

      return fallbackProduct;
    },
    [],
  );

  const updateCartItemsWithFreshStock = useCallback(
    async (items) => {
      if (!Array.isArray(items) || items.length === 0) {
        return [];
      }

      const updatedItems = await Promise.all(
        items.map(async (item) => {
          const freshProduct = await getFreshProduct(item.id);

          if (!freshProduct) {
            return item;
          }

          return {
            ...item,
            name: getProductName(freshProduct),
            price:
              freshProduct.price !== undefined
                ? Number(freshProduct.price) || 0
                : item.price,
            image: getProductImage(freshProduct) || item.image,
            stock: getProductStock(freshProduct),
          };
        }),
      );

      return updatedItems;
    },
    [getFreshProduct],
  );

  const loadUserCart = useCallback(async () => {
    if (isAuthLoading) {
      return;
    }

    if (!currentUser) {
      setCartItems([]);
      return;
    }

    try {
      const backendItems = await getBackendCart();

      if (Array.isArray(backendItems)) {
        const formattedItems = formatBackendCartItems(backendItems);
        const itemsWithStock =
          await updateCartItemsWithFreshStock(formattedItems);

        const validItems = itemsWithStock
          .map((item) => {
            if (item.stock === undefined) {
              return item;
            }

            return {
              ...item,
              quantity: Math.min(item.quantity, item.stock),
            };
          })
          .filter((item) => item.quantity > 0);

        setCartItems(validItems);
      }
    } catch (error) {
      console.warn("Failed loading backend cart:", error);
    }
  }, [currentUser, isAuthLoading, updateCartItemsWithFreshStock]);

  useEffect(() => {
    loadUserCart();
  }, [loadUserCart]);

  const checkStockAndAdd = useCallback(
    async (product, quantity, selectedColor, selectedSize) => {
      const productId = getProductId(product);

      if (!productId) {
        showToast("Invalid product.", "error");
        return {
          allowed: false,
          product: null,
          quantity: 0,
        };
      }

      const freshProduct = await getFreshProduct(productId, product);

      if (!freshProduct) {
        showToast("Unable to verify product stock.", "error");

        return {
          allowed: false,
          product: null,
          quantity: 0,
        };
      }

      const availableStock = getProductStock(freshProduct);
      const requestedQuantity = Math.max(1, Number(quantity) || 1);

      const itemColor = selectedColor || freshProduct.colors?.[0] || null;

      const itemSize = selectedSize || null;

      const existingItem = cartItems.find(
        (item) =>
          String(item.id) === String(productId) &&
          item.color === itemColor &&
          item.size === itemSize,
      );

      const currentQuantityInCart = existingItem
        ? Number(existingItem.quantity) || 0
        : 0;

      const totalRequestedQuantity = currentQuantityInCart + requestedQuantity;

      if (availableStock <= 0) {
        showToast(`${getProductName(freshProduct)} is out of stock.`, "error");

        return {
          allowed: false,
          product: freshProduct,
          quantity: 0,
        };
      }

      if (totalRequestedQuantity > availableStock) {
        const remainingStock = Math.max(
          availableStock - currentQuantityInCart,
          0,
        );

        if (remainingStock === 0) {
          showToast(
            `You already have the maximum available stock of ${availableStock} in your cart.`,
            "error",
          );
        } else {
          showToast(
            `Only ${remainingStock} more item${
              remainingStock === 1 ? "" : "s"
            } can be added. Total stock is ${availableStock}.`,
            "error",
          );
        }

        return {
          allowed: false,
          product: freshProduct,
          quantity: 0,
        };
      }

      if (availableStock <= 10) {
        showToast(
          `Only ${availableStock} item${
            availableStock === 1 ? "" : "s"
          } left in stock.`,
          "warning",
        );
      }

      return {
        allowed: true,
        product: freshProduct,
        quantity: requestedQuantity,
      };
    },
    [cartItems, getFreshProduct, showToast],
  );

  const addToCartInternal = useCallback(
    async (
      product,
      quantity = 1,
      selectedColor = null,
      selectedSize = null,
    ) => {
      const rawId = getProductId(product);

      if (!rawId) {
        showToast("Invalid product.", "error");
        return false;
      }

      const pId = String(rawId);

      const itemColor = selectedColor || product.colors?.[0] || null;

      const itemSize = selectedSize || null;

      const stockCheck = await checkStockAndAdd(
        product,
        quantity,
        itemColor,
        itemSize,
      );

      if (!stockCheck.allowed || !stockCheck.product) {
        return false;
      }

      const freshProduct = stockCheck.product;
      const safeQuantity = stockCheck.quantity;
      const freshStock = getProductStock(freshProduct);

      setCartItems((previousItems) => {
        const existingIndex = previousItems.findIndex(
          (item) =>
            String(item.id) === pId &&
            item.color === itemColor &&
            item.size === itemSize,
        );

        if (existingIndex > -1) {
          const updatedItems = [...previousItems];
          const existingItem = updatedItems[existingIndex];

          updatedItems[existingIndex] = {
            ...existingItem,
            name: getProductName(freshProduct),
            price: Number(freshProduct.price) || existingItem.price || 0,
            image: getProductImage(freshProduct) || existingItem.image,
            stock: freshStock,
            quantity: Math.min(
              existingItem.quantity + safeQuantity,
              freshStock,
            ),
          };

          return updatedItems;
        }

        return [
          ...previousItems,
          {
            id: pId,
            name: getProductName(freshProduct),
            price: Number(freshProduct.price) || 0,
            image: getProductImage(freshProduct),
            color: itemColor,
            size: itemSize,
            quantity: Math.min(safeQuantity, freshStock),
            stock: freshStock,
          },
        ];
      });

      setIsCartOpen(true);

      if (isLoggedIn) {
        try {
          const backendItems = await addToBackendCart(
            freshProduct,
            safeQuantity,
            itemColor,
            itemSize,
          );

          if (Array.isArray(backendItems)) {
            const formattedItems = formatBackendCartItems(backendItems);

            const itemsWithStock =
              await updateCartItemsWithFreshStock(formattedItems);

            setCartItems(
              itemsWithStock
                .map((item) => {
                  if (item.stock === undefined) {
                    return item;
                  }

                  return {
                    ...item,
                    quantity: Math.min(item.quantity, item.stock),
                  };
                })
                .filter((item) => item.quantity > 0),
            );
          }
        } catch (error) {
          console.warn("Failed syncing added item with backend:", error);
          showToast("Item added locally, but backend sync failed.", "warning");
        }
      }

      return true;
    },
    [checkStockAndAdd, isLoggedIn, showToast, updateCartItemsWithFreshStock],
  );

  useEffect(() => {
    if (isLoggedIn && pendingAction && pendingAction.type === "cart") {
      const { product, quantity, color, size } = pendingAction;

      if (product) {
        addToCartInternal(product, quantity, color, size);
      }

      clearPendingAction();
    }
  }, [isLoggedIn, pendingAction, addToCartInternal, clearPendingAction]);

  const addToCart = useCallback(
    (product, quantity = 1, selectedColor = null, selectedSize = null) => {
      if (!isLoggedIn) {
        promptLogin("Please log in to add items to your cart.", {
          type: "cart",
          product,
          quantity,
          color: selectedColor,
          size: selectedSize,
        });

        return false;
      }

      return addToCartInternal(product, quantity, selectedColor, selectedSize);
    },
    [addToCartInternal, isLoggedIn, promptLogin],
  );

  const removeFromCart = useCallback(
    async (id, color = null, size = null) => {
      const targetId = String(id);

      setCartItems((previousItems) =>
        previousItems.filter(
          (item) =>
            !(
              String(item.id) === targetId &&
              item.color === color &&
              item.size === size
            ),
        ),
      );

      if (isLoggedIn) {
        try {
          const backendItems = await removeFromBackendCart(
            targetId,
            color,
            size,
          );

          if (Array.isArray(backendItems)) {
            const formattedItems = formatBackendCartItems(backendItems);

            const itemsWithStock =
              await updateCartItemsWithFreshStock(formattedItems);

            setCartItems(itemsWithStock);
          }
        } catch (error) {
          console.warn("Failed removing item from backend:", error);
          showToast(
            "Item removed locally, but backend sync failed.",
            "warning",
          );
        }
      }
    },
    [isLoggedIn, showToast, updateCartItemsWithFreshStock],
  );

  const updateQuantity = useCallback(
    async (id, color = null, size = null, delta = 0) => {
      const targetId = String(id);
      const numericDelta = Number(delta) || 0;

      if (numericDelta === 0) {
        return;
      }

      const currentItem = cartItems.find(
        (item) =>
          String(item.id) === targetId &&
          item.color === color &&
          item.size === size,
      );

      if (!currentItem) {
        return;
      }

      const currentQuantity = Number(currentItem.quantity) || 0;
      const requestedQuantity = currentQuantity + numericDelta;

      if (requestedQuantity <= 0) {
        await removeFromCart(targetId, color, size);
        return;
      }

      const freshProduct = await getFreshProduct(targetId, currentItem);

      if (!freshProduct) {
        showToast("Unable to verify product stock.", "error");
        return;
      }

      const availableStock = getProductStock(freshProduct);

      if (availableStock <= 0) {
        showToast(`${getProductName(freshProduct)} is out of stock.`, "error");
        return;
      }

      if (requestedQuantity > availableStock) {
        showToast(
          `Cannot exceed available stock of ${availableStock}.`,
          "error",
        );
        return;
      }

      if (availableStock <= 10 && numericDelta > 0) {
        showToast(
          `Only ${availableStock} item${
            availableStock === 1 ? "" : "s"
          } left in stock.`,
          "warning",
        );
      }

      setCartItems((previousItems) =>
        previousItems.map((item) => {
          if (
            String(item.id) === targetId &&
            item.color === color &&
            item.size === size
          ) {
            return {
              ...item,
              name: getProductName(freshProduct),
              price: Number(freshProduct.price) || item.price || 0,
              image: getProductImage(freshProduct) || item.image,
              stock: availableStock,
              quantity: requestedQuantity,
            };
          }

          return item;
        }),
      );

      if (isLoggedIn) {
        try {
          const backendItems = await updateBackendCartItem(
            targetId,
            color,
            size,
            numericDelta,
          );

          if (Array.isArray(backendItems)) {
            const formattedItems = formatBackendCartItems(backendItems);

            const itemsWithStock =
              await updateCartItemsWithFreshStock(formattedItems);

            setCartItems(itemsWithStock);
          }
        } catch (error) {
          console.warn("Failed updating backend cart item:", error);
          showToast(
            "Quantity updated locally, but backend sync failed.",
            "warning",
          );
        }
      }
    },
    [
      cartItems,
      getFreshProduct,
      isLoggedIn,
      removeFromCart,
      showToast,
      updateCartItemsWithFreshStock,
    ],
  );

  const clearCart = useCallback(async () => {
    setCartItems([]);

    if (isLoggedIn) {
      try {
        await clearBackendCart();
      } catch (error) {
        console.warn("Failed clearing backend cart:", error);
        showToast("Cart cleared locally, but backend sync failed.", "warning");
      }
    }
  }, [isLoggedIn, showToast]);

  const totalItems = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        loadUserCart,
        toast,
      }}
    >
      {children}

      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
            toast.type === "error"
              ? "bg-red-500"
              : toast.type === "warning"
                ? "bg-amber-500"
                : "bg-primary-600"
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
