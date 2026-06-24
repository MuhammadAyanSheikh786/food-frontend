import { useRef } from "react";
import { scrollToSection } from "../lib/utils";

interface Category {
  id: string | number;
  name: string;
  slug: string;
}

interface CategoryNavProps {
  categories?: Category[];
}

const sections = [
  { label: "Exclusive", id: "exclusive" },
  { label: "Family Deals", id: "family-deals" },
  { label: "New Items", id: "new-items" },
  { label: "All Items", id: "all-items" },
];

export function CategoryNav({ categories = [] }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: string) => {
    scrollToSection(id);
  };

  return (
    <div className="sticky top-16 md:top-20 z-40 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
      <div
        ref={scrollRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-white/5 backdrop-blur-xl border border-white/10 text-dark-400 hover:text-white hover:bg-white/10"
          >
            {section.label}
          </button>
        ))}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleClick(`cat-${cat.slug}`)}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-white/5 backdrop-blur-xl border border-white/10 text-dark-400 hover:text-white hover:bg-white/10"
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
