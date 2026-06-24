import { motion } from "framer-motion";
import { FiShoppingCart, FiClock } from "react-icons/fi";
import { formatPrice } from "../lib/utils";

interface MenuItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  image?: string | null;
  categoryName?: string;
  tagName?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isExclusive?: boolean;
  isFamilyDeal?: boolean;
  isNewItem?: boolean;
}

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const badgeConfig: Record<string, { color: string; label: string }> = {
  isExclusive: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Exclusive" },
  isFamilyDeal: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Family Deal" },
  isNewItem: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "New" },
  isFeatured: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Featured" },
};

const tagLabel: Record<string, string> = {
  morning: "Morning",
  day: "Day",
  night: "Night",
};

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const badges = Object.entries(badgeConfig).filter(
    ([key]) => item[key as keyof MenuItem]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="glass rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:border-white/20">
        <div className="relative h-24 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary-500/30">
                {item.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 via-transparent to-transparent" />
          <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
            {badges.slice(0, 2).map(([key, config]) => (
              <span key={key} className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-full border ${config.color}`}>
                {config.label}
              </span>
            ))}
          </div>
          {item.tagName && tagLabel[item.tagName] && (
            <div className="absolute top-1.5 right-1.5">
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                <FiClock className="w-2.5 h-2.5" />
                {tagLabel[item.tagName]}
              </span>
            </div>
          )}
        </div>

        <div className="p-2.5 flex flex-col flex-1 gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-white truncate flex-1">{item.name}</h3>
            <span className="text-sm font-bold text-primary-400 whitespace-nowrap">{formatPrice(item.price)}</span>
          </div>
          {item.description && (
            <p className="text-[11px] text-dark-400 line-clamp-1">{item.description}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-1.5">
            <span className={`flex items-center gap-1 text-[10px] font-medium ${item.isAvailable ? "text-green-400" : "text-red-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? "bg-green-400" : "bg-red-400"}`} />
              {item.isAvailable ? "Available" : "Sold Out"}
            </span>
            <button
              onClick={() => onAddToCart(item)}
              disabled={!item.isAvailable}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <FiShoppingCart className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
