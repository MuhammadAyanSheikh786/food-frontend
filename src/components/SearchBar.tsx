import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search menu items..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={`relative flex items-center w-full max-w-md transition-all duration-300 rounded-xl border ${
        focused
          ? "border-primary-500 ring-1 ring-primary-500 shadow-lg shadow-primary-500/10"
          : "border-white/10"
      } bg-white/5 backdrop-blur-xl`}
    >
      <FiSearch className="absolute left-3.5 w-4 h-4 text-dark-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full bg-transparent pl-10 pr-10 py-3 text-sm text-white placeholder:text-dark-400 focus:outline-none"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 p-0.5 text-dark-400 hover:text-white transition-colors duration-200"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
