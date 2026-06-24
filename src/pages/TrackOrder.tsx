import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPackage, FiArrowLeft, FiSearch } from "react-icons/fi";
import { api } from "../lib/api";
import { formatPrice, getStatusColor, getStatusLabel } from "../lib/utils";

interface Order {
  id: number;
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  items: any[];
  totalAmount: string;
  status: string;
  createdAt: string;
}

export function TrackOrder() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(!!emailParam);

  useEffect(() => {
    if (emailParam) {
      handleSearch(emailParam);
    }
  }, []);

  async function handleSearch(emailToSearch?: string) {
    const searchEmail = emailToSearch || email;
    if (!searchEmail.trim()) return;

    setIsLoading(true);
    setSearched(true);
    try {
      const allOrders = await api.orders.getAll();
      const filtered = (allOrders as Order[]).filter(
        (o) => o.email?.toLowerCase() === searchEmail.toLowerCase()
      );
      setOrders(filtered);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors duration-200 mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-dark-400 text-sm mb-8">Enter your email to find your orders</p>

          <div className="flex gap-3 mb-10">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Your email address"
              className="input-field flex-1"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <FiSearch className="w-4 h-4" />
              )}
              Search
            </button>
          </div>

          {searched && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {orders.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl">
                  <FiPackage className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400">No orders found for this email</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-dark-400">
                    Found {orders.length} order{orders.length > 1 ? "s" : ""}
                  </p>
                  {orders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-lg font-display font-semibold text-white">{order.orderNumber}</p>
                          <p className="text-xs text-dark-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-dark-300">
                              {item.name} <span className="text-dark-500">&times; {item.quantity}</span>
                            </span>
                            <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="text-xs text-dark-400">
                          <p>{order.fullName}</p>
                          <p>{order.phone}</p>
                        </div>
                        <span className="text-lg font-bold text-white">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
