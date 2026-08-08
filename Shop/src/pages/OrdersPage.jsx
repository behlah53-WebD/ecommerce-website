import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import { OrderCard } from "../components/orders";
import { resolveOrderStatus, getOrderDisplayStatus } from "../utils/orderTracking";
import { Button } from "../components/ui";

export const OrdersPage = () => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) {
      navigate("/account");
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get("/orders/my");
        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || "Failed to load orders.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const pollId = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(pollId);
  }, [isLoggedIn, isAuthLoading, navigate]);

  const getOrderDisplayStatus = (order) => resolveOrderStatus(order, now);

  const filteredOrders = orders.filter((order) => {
    const displayStatus = getOrderDisplayStatus(order);
    const matchesStatus = filterStatus === "All" || displayStatus === filterStatus;
    const matchesSearch =
      !searchTerm ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = { All: orders.length };
  orders.forEach((order) => {
    const displayStatus = getOrderDisplayStatus(order);
    statusCounts[displayStatus] = (statusCounts[displayStatus] || 0) + 1;
  });

  if (isAuthLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    // Trigger re-render by updating state
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-10">
        <div className="mb-6 lg:mb-8">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate("/account")}
            className="mb-4"
          >
            Back to Account
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 shadow-sm">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  My Orders
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {orders.length} {orders.length === 1 ? "order" : "orders"}{" "}
                  placed
                </p>
              </div>
            </div>

            <Button leftIcon={<ShoppingBag className="h-4 w-4" />} onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 text-sm text-red-600 dark:text-red-400 mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === status
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                  }`}
                >
                  {status}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      filterStatus === status
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="text-center py-16 lg:py-20">
            <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-gray-100 dark:bg-gray-800 mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md mx-auto">
              When you place an order, it will appear here. Start shopping to
              see your orders.
            </p>
            <Button leftIcon={<ShoppingBag className="h-5 w-5" />} onClick={() => navigate("/shop")}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} onRefresh={handleRefresh} />
            ))}
            {filteredOrders.length === 0 && orders.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No orders match your filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};