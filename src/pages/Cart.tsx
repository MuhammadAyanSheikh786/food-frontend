import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { formatPrice, getImageUrl } from "../lib/utils";

export function Cart() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <FiShoppingBag className="w-10 h-10 text-dark-500" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-white mb-2">Your cart is empty</h2>
          <p className="text-dark-400 mb-8">Looks like you have not added anything yet.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <FiArrowLeft className="w-4 h-4" />
            Browse our menu
          </Link>
        </motion.div>
      </div>
    );
  }

  const subtotal = getTotal();
  const delivery = 50;
  const total = subtotal + delivery;

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Your Cart</h1>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors duration-200"
          >
            <FiArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-panel flex items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center">
                        <span className="text-xl font-display font-bold text-primary-500/30">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-white truncate">{item.name}</h3>
                    <p className="text-sm text-primary-400 mt-0.5">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-dark-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-white font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-dark-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:w-80">
            <div className="glass-panel sticky top-24">
              <h2 className="text-lg font-display font-semibold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">Delivery Charges</span>
                  <span className="text-white">{formatPrice(delivery)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-xl font-bold text-white">{formatPrice(total)}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                <FiShoppingBag className="w-4 h-4" />
                Proceed to Checkout
              </Link>

              <Link
                to="/"
                className="block text-center mt-4 text-sm text-dark-400 hover:text-white transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
