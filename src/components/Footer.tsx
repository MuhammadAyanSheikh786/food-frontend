import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from "react-icons/fi";
import { scrollToSection } from "../lib/utils";

export function Footer() {
  return (
    <footer className="relative bg-dark-950 border-t border-white/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h3 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600 mb-4">
              Iqbal Food
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed">
              Premium dining experience with exquisite flavors crafted with passion. From sizzling BBQ to gourmet burgers, every bite tells a story of culinary excellence.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => scrollToSection("hero")} className="text-dark-400 hover:text-white text-sm transition-colors duration-200">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("menu")} className="text-dark-400 hover:text-white text-sm transition-colors duration-200">
                  Menu
                </button>
              </li>
              <li>
                <Link to="/cart" className="text-dark-400 hover:text-white text-sm transition-colors duration-200">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-dark-400 hover:text-white text-sm transition-colors duration-200">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-sm text-dark-400">
              <li>123 Food Street, Gourmet City</li>
              <li>+1 (555) 123-4567</li>
              <li>info@iqbalfood.com</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 flex items-center justify-center glass glass-hover rounded-xl text-dark-400 hover:text-primary-400 transition-all duration-200">
                <FiFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center glass glass-hover rounded-xl text-dark-400 hover:text-primary-400 transition-all duration-200">
                <FiInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center glass glass-hover rounded-xl text-dark-400 hover:text-primary-400 transition-all duration-200">
                <FiTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center glass glass-hover rounded-xl text-dark-400 hover:text-primary-400 transition-all duration-200">
                <FiYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-dark-500">
            &copy; {new Date().getFullYear()} Iqbal Food. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
