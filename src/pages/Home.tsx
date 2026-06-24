import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Hero } from "../components/Hero";
import { SearchBar } from "../components/SearchBar";
import { CategoryNav } from "../components/CategoryNav";
import { MenuSection } from "../components/MenuSection";
import { MenuCard } from "../components/MenuCard";
import { Footer } from "../components/Footer";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

interface MenuItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  image?: string | null;
  categoryName?: string;
  categoryId?: number;
  tagName?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isExclusive?: boolean;
  isFamilyDeal?: boolean;
  isNewItem?: boolean;
}

interface Category {
  id: string | number;
  name: string;
  slug: string;
}

export function Home() {
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const cart = useCart();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.menu.getAll({ limit: 100 }),
      api.menu.getCategories(),
    ])
      .then(([itemsData, cats]) => {
        setAllItems(itemsData.items || []);
        setCategories(cats || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredItems = useMemo(
    () =>
      searchQuery
        ? allItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allItems,
    [allItems, searchQuery]
  );

  const exclusiveItems = useMemo(
    () => filteredItems.filter((item) => item.isExclusive),
    [filteredItems]
  );

  const familyDealsItems = useMemo(
    () => filteredItems.filter((item) => item.isFamilyDeal),
    [filteredItems]
  );

  const newItems = useMemo(
    () => filteredItems.filter((item) => item.isNewItem),
    [filteredItems]
  );

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of filteredItems) {
      const cat = item.categoryName || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    const sorted = categories
      .filter((c) => map.has(c.name))
      .map((c) => ({ category: c.name, slug: c.slug, items: map.get(c.name)! }));
    const others = Array.from(map.entries())
      .filter(([name]) => !categories.some((c) => c.name === name))
      .map(([name, items]) => ({ category: name, slug: name.toLowerCase().replace(/\s+/g, "-"), items }));
    return [...sorted, ...others];
  }, [filteredItems, categories]);

  const handleAddToCart = (item: MenuItem) => {
    cart.addItem({
      productId: Number(item.id),
      name: item.name,
      price: Number(item.price),
      image: item.image ?? undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />

      <div className="bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        <CategoryNav categories={categories} />

        <MenuSection
          id="exclusive"
          title="Exclusive"
          subtitle="Our chef's special selections"
          items={exclusiveItems}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />

        <MenuSection
          id="family-deals"
          title="Family Deals"
          subtitle="Perfect for sharing with loved ones"
          items={familyDealsItems}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />

        <MenuSection
          id="new-items"
          title="New Items"
          subtitle="Fresh additions to our menu"
          items={newItems}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />

        <section id="all-items" className="py-8 md:py-10 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-5">
              <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                All <span className="gradient-text">Items</span>
              </h2>
              <p className="text-xs text-dark-400 mt-0.5">Browse our complete menu</p>
            </div>
          </div>

          {isLoading ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="glass rounded-xl overflow-hidden">
                    <div className="h-24 shimmer" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 w-3/4 rounded shimmer" />
                      <div className="h-3 w-full rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : itemsByCategory.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-dark-400 text-sm">No items found</p>
            </div>
          ) : (
            itemsByCategory.map(({ category, slug, items }) => (
              <div key={slug} id={`cat-${slug}`} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 scroll-mt-24">
                <h3 className="text-base font-display font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary-500 rounded-full inline-block" />
                  {category}
                  <span className="text-xs text-dark-500 font-normal">({items.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {items.map((item) => (
                    <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <Footer />
    </motion.div>
  );
}
