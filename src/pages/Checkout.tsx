import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiCreditCard, FiMapPin, FiUser, FiPhone, FiMail, FiHome } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/utils";
import { api } from "../lib/api";
import toast from "react-hot-toast";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [houseNumber, setHouseNumber] = useState("");
  const [block, setBlock] = useState("");
  const [street, setStreet] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email address";
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[\d\+\-\(\)\s]{7,15}$/.test(phone)) errs.phone = "Invalid phone number";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);
    try {
      await api.orders.create({
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        houseNumber,
        block,
        street,
        notes,
      });

      clearCart();
      toast.success("Order placed successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.message || "Failed to place order. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = getTotal();
  const delivery = 50;
  const total = subtotal + delivery;

  const inputClass = (field: keyof FormErrors) =>
    `w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
      errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-white/10 focus:border-primary-500 focus:ring-primary-500"
    }`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <div className="glass-panel space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                    <FiMapPin className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-white">Delivery Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className={inputClass("name")}
                      />
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-400"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Email *</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={inputClass("email")}
                      />
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-400"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Phone *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        className={inputClass("phone")}
                      />
                    </div>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-400"
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">House Number</label>
                    <div className="relative">
                      <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        placeholder="House / Flat / Apt"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Block</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        placeholder="Block / Area"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Street</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Street name"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel mt-6">
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Order Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or requests..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || items.length === 0}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <>
                    <FiCreditCard className="w-4 h-4" />
                    Place Order
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-panel sticky top-24">
              <h2 className="text-lg font-display font-semibold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm">
                    <span className="text-dark-300 truncate mr-2">
                      {item.name}{" "}
                      <span className="text-dark-500">&times; {item.quantity}</span>
                    </span>
                    <span className="text-white shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {user && (
                <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                  <p className="text-dark-400">
                    <span className="text-dark-500">Name:</span> {user.name}
                  </p>
                  <p className="text-dark-400">
                    <span className="text-dark-500">Email:</span> {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-dark-400">
                      <span className="text-dark-500">Phone:</span> {user.phone}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3 text-sm pt-4 border-t border-white/10">
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
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
