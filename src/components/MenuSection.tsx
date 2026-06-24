import { motion, AnimatePresence } from "framer-motion";
import { MenuCard } from "./MenuCard";

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

interface MenuSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
  isLoading?: boolean;
  onAddToCart: (item: MenuItem) => void;
}

function SkeletonCard() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="h-24 shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-3 w-full rounded shimmer" />
        <div className="flex justify-between pt-1">
          <div className="h-4 w-16 rounded shimmer" />
          <div className="h-6 w-16 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function MenuSection({ id, title, subtitle, items, isLoading, onAddToCart }: MenuSectionProps) {
  return (
    <section id={id} className="py-8 md:py-10 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white">
            {title.split(" ").map((word, i) =>
              i === title.split(" ").length - 1 ? (
                <span key={i} className="gradient-text">{word}</span>
              ) : (
                <span key={i}>{word + " "}</span>
              )
            )}
          </h2>
          {subtitle && <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-dark-400 text-sm">No items found</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div key={item.id} variants={itemVariants} layout>
                  <MenuCard item={item} onAddToCart={onAddToCart} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
