// src/components/SortBar.tsx
"use client";

interface SortBarProps {
  currentSort: string;
  onSortChange: (sortOptions: string) => void;
  totalProdutos: string | number;
}

export default function SortBar({
  currentSort, onSortChange, totalProdutos
} : SortBarProps) {
  const sortOptions = [
    { id: "relevancia", label: "Mais Relevantes" },
    { id: "preco-crescente", label: "Menor Preço" },
    { id: "preco-decrescente", label: "Maior Preço" },
  ];

  return(
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-500">
        Mostrando <span className="font-semibold text-gray-800">{totalProdutos}</span> produtos
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">
          Ordenar por:
        </label>
        
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 pr-8 cursor-pointer hover:bg-gray-100 transition-colors max-sm:w-full outline-none"
        >
          {sortOptions.map((opcao) => (
            <option key={opcao.id} value={opcao.id}>
              {opcao.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}