import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart, FiUser, FiChevronDown, FiLogOut, FiMenu, FiX,
  FiSearch, FiPackage, FiHome
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { scrollToSection } from "../lib/utils";

export function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackEmail, setTrackEmail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (trackRef.current && !trackRef.current.contains(e.target as Node)) {
        setTrackOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
    setTrackOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin": return "/admin";
      case "rider": return "/rider";
      default: return "/dashboard";
    }
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackEmail) {
      navigate(`/track-order?email=${encodeURIComponent(trackEmail)}`);
      setTrackOpen(false);
      setTrackEmail("");
    }
  };

  const navLinks = [
    { label: "Home", href: "/", icon: FiHome, onClick: () => { if (location.pathname === "/") scrollToSection("hero"); else navigate("/"); } },
    { label: "Menu", href: "/", icon: FiSearch, onClick: () => { if (location.pathname === "/") scrollToSection("menu"); else navigate("/"); } },
    { label: "Cart", href: "/cart", icon: FiShoppingCart, badge: itemCount > 0 ? itemCount : undefined },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          <Link to="/" className="flex items-center gap-2" onClick={() => scrollToSection("hero")}>
            <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
              Iqbal Food
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.onClick ? (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 ${
                    location.pathname === link.href ? "text-primary-400" : "text-dark-300 hover:text-white"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 relative ${
                    location.pathname === link.href ? "text-primary-400" : "text-dark-300 hover:text-white"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {link.badge && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary-500 rounded-full absolute -top-2 -right-4">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              )
            )}

            <div className="relative" ref={trackRef}>
              <button
                onClick={() => setTrackOpen(!trackOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-dark-300 hover:text-white transition-colors duration-300"
              >
                <FiPackage className="w-4 h-4" />
                Track Order
              </button>
              <AnimatePresence>
                {trackOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 glass rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="p-5">
                      <h3 className="text-white font-display font-semibold text-lg mb-1">Track Your Order</h3>
                      <p className="text-dark-400 text-xs mb-4">Enter your email to find your orders</p>
                      <form onSubmit={handleTrackOrder} className="space-y-3">
                        <input
                          type="email"
                          placeholder="Your email address"
                          value={trackEmail}
                          onChange={(e) => setTrackEmail(e.target.value)}
                          className="input-field text-sm"
                          required
                        />
                        <button type="submit" className="btn-primary w-full text-sm">
                          Track Orders
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-xl text-sm"
                >
                  <FiUser className="w-4 h-4 text-primary-400" />
                  <span className="text-white font-medium truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 glass rounded-2xl overflow-hidden shadow-2xl"
                    >
                      <div className="p-4 border-b border-white/10">
                        <p className="text-white font-medium text-sm truncate">{user.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                        >
                          <FiUser className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/cart"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                        >
                          <FiShoppingCart className="w-4 h-4" />
                          Cart
                          {itemCount > 0 && (
                            <span className="ml-auto px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                              {itemCount}
                            </span>
                          )}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-300 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all duration-200"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm !px-4 !py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            <Link to="/cart" className="relative p-1">
              <FiShoppingCart className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary-500 rounded-full">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => { navigate("/"); scrollToSection("hero"); setIsOpen(false); }}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-dark-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                <span className="flex items-center gap-2"><FiHome className="w-4 h-4" /> Home</span>
              </button>
              <button
                onClick={() => { navigate("/"); scrollToSection("menu"); setIsOpen(false); }}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-dark-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                <span className="flex items-center gap-2"><FiSearch className="w-4 h-4" /> Menu</span>
              </button>
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-dark-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <FiShoppingCart className="w-4 h-4" /> Cart
                  {itemCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                      {itemCount} items
                    </span>
                  )}
                </span>
              </Link>

              <div className="px-4 py-3 glass rounded-xl">
                <p className="text-xs text-dark-400 mb-2">Track your order</p>
                <form onSubmit={(e) => { e.preventDefault(); if (trackEmail) { navigate(`/track-order?email=${encodeURIComponent(trackEmail)}`); setIsOpen(false); setTrackEmail(""); } }} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={trackEmail}
                    onChange={(e) => setTrackEmail(e.target.value)}
                    className="input-field text-sm flex-1"
                    required
                  />
                  <button type="submit" className="btn-primary text-sm !px-3 !py-2">
                    <FiPackage className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-white/10">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <FiUser className="w-4 h-4 text-primary-400" />
                      <span className="text-white font-medium text-sm">{user.name}</span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500/20 text-primary-400 capitalize">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-dark-300 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" className="btn-secondary text-sm text-center" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setIsOpen(false)}>
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
