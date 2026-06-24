import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { formatPrice, getStatusColor, getStatusLabel } from "../lib/utils";
import { motion } from "framer-motion";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  FiTruck, FiPackage, FiCheckCircle, FiClock, FiLogOut,
  FiHome, FiRefreshCw, FiToggleLeft, FiToggleRight,
  FiMapPin, FiUser, FiPhone, FiDollarSign, FiTrendingUp,
} from "react-icons/fi";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: number;
  items?: OrderItem[] | string;
  totalAmount: number;
  status: string;
  deliveryAddress?: string;
  createdAt: string;
}

export function RiderDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"assigned" | "history">("assigned");
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "rider") {
      navigate("/");
      return;
    }
    setIsAvailable(user?.isAvailable ?? true);
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === "assigned") {
        const data = await api.rider.getAssignedOrders();
        setAssignedOrders(data as Order[]);
      } else {
        const data = await api.rider.getHistory();
        setHistoryOrders(data as Order[]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleToggleAvailability() {
    const next = !isAvailable;
    try {
      await api.rider.updateAvailability(next);
      setIsAvailable(next);
      updateUser({ isAvailable: next });
      toast.success(next ? "You are now available" : "You are now unavailable");
    } catch (err: any) {
      toast.error(err.message || "Failed to update availability");
    }
  }

  async function handleAcceptOrder(orderId: number) {
    try {
      await api.rider.acceptOrder(orderId);
      toast.success("Order accepted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept order");
    }
  }

  async function handlePickedUp(orderId: number) {
    try {
      await api.rider.pickedUp(orderId);
      toast.success("Order picked up");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    }
  }

  async function handleDeliver(orderId: number) {
    try {
      await api.rider.deliver(orderId);
      toast.success("Order delivered");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to deliver order");
    }
  }

  function parseItems(items: OrderItem[] | string | undefined): OrderItem[] {
    if (!items) return [];
    if (typeof items === "string") return [];
    return items;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-dark-900/70 backdrop-blur-xl border-b border-white/10 flex items-center px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <FiTruck className="w-6 h-6 text-primary-400" />
          <span className="text-lg font-bold gradient-text">Iqbal Food</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30">
            Rider Panel
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={handleToggleAvailability}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
              isAvailable
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}
          >
            {isAvailable ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
            {isAvailable ? "Available" : "Unavailable"}
          </button>
          <span className="text-sm text-dark-400 hidden sm:inline">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="pt-16 p-4 lg:p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === "assigned"
                ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/10"
                : "text-dark-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <FiPackage className="w-4 h-4 inline mr-2" />
            Assigned Orders
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === "history"
                ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/10"
                : "text-dark-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <FiClock className="w-4 h-4 inline mr-2" />
            Delivery History
          </button>
          <button
            onClick={fetchData}
            className="ml-auto p-2.5 text-dark-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
            title="Refresh"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>

        {(assignedOrders.length > 0 || historyOrders.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <div className="glass-panel p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                <FiPackage className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Active Orders</p>
                <p className="text-lg font-bold text-white">{assignedOrders.length}</p>
              </div>
            </div>
            <div className="glass-panel p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Delivered</p>
                <p className="text-lg font-bold text-white">
                  {historyOrders.filter((o) => o.status === "received").length}
                </p>
              </div>
            </div>
            <div className="glass-panel p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <FiClock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Awaiting Confirmation</p>
                <p className="text-lg font-bold text-white">
                  {assignedOrders.filter((o) => o.status === "delivered").length}
                </p>
              </div>
            </div>
            <div className="glass-panel p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <FiDollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Total Earnings</p>
                <p className="text-lg font-bold text-white">
                  Rs. {historyOrders
                    .filter((o) => o.status === "received")
                    .reduce((sum, o) => sum + Number(o.totalAmount), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {activeTab === "assigned" && (
              assignedOrders.length === 0 ? (
                <div className="glass-panel flex flex-col items-center justify-center py-16">
                  <FiTruck className="w-16 h-16 text-dark-600 mb-4" />
                  <p className="text-dark-400 text-lg font-medium">No assigned orders</p>
                  <p className="text-dark-500 text-sm mt-1">New orders will appear here</p>
                </div>
              ) : (
                assignedOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          #{order.orderNumber || order.id}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                          <span className="flex items-center gap-1.5 text-dark-300">
                            <FiUser className="w-3.5 h-3.5 text-primary-400" />
                            {order.customerName || `Customer #${order.customerId}`}
                          </span>
                          {order.customerPhone && (
                            <span className="flex items-center gap-1.5 text-dark-300">
                              <FiPhone className="w-3.5 h-3.5 text-primary-400" />
                              {order.customerPhone}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                      {parseItems(order.items).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-dark-300">{item.name} x{item.quantity}</span>
                          <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                        <span className="text-dark-400 font-medium">Total</span>
                        <span className="text-white font-bold">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2 text-sm text-dark-300">
                        <FiMapPin className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-1">
                      {order.status === "assigned" && (
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="btn-primary flex items-center gap-2 text-sm"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          Accept Order
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => handlePickedUp(order.id)}
                          className="btn-secondary flex items-center gap-2 text-sm"
                        >
                          <FiPackage className="w-4 h-4" />
                          Picked Up
                        </button>
                      )}
                      {order.status === "picked_up" && (
                        <button
                          onClick={() => handleDeliver(order.id)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-green-700 transition-all duration-300 active:scale-95 flex items-center gap-2 text-sm"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )
            )}

            {activeTab === "history" && (
              historyOrders.length === 0 ? (
                <div className="glass-panel flex flex-col items-center justify-center py-16">
                  <FiClock className="w-16 h-16 text-dark-600 mb-4" />
                  <p className="text-dark-400 text-lg font-medium">No delivery history</p>
                  <p className="text-dark-500 text-sm mt-1">Completed deliveries will appear here</p>
                </div>
              ) : (
                historyOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold">#{order.orderNumber || order.id}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-dark-400">
                        <span className="flex items-center gap-1.5">
                          <FiUser className="w-3.5 h-3.5" />
                          {order.customerName || `Customer #${order.customerId}`}
                        </span>
                        <span>{formatPrice(order.totalAmount)}</span>
                        <span className="flex items-center gap-1.5">
                          <FiClock className="w-3.5 h-3.5" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
