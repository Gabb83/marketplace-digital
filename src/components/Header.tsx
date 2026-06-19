// src/components/Header.tsx
"use client";

import { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";

interface HeaderProps {
  onSearch?: (termo: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [termo, setTermo] = useState("");

  const handleSubmeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(termo);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer">
            Alpha<span className="text-blue-600">Store</span>
          </span>
        </div>
        <div className="flex-1 max-w-2xl mx-auto">
          <form onSubmit={handleSubmeter} className="relative flex items-center w-full">
            <input
              type="text"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar produtos, marcas e referências..."
              className="w-full h-10 pl-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm bg-gray-50 text-gray-800"
            />
            <button 
              type="submit" 
              className="absolute right-1 h-8 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer"
              aria-label="Buscar"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <button className="relative p-2 hover:text-blue-600 transition-colors">
            <ShoppingCart size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}