// src/components/FilterSideBar.tsx
"use client";

interface FilterSideBarProps {
  onSelectCategoria: (category: string) => void;
  selectedCategoria?: string;
}

export default function FilterSideBar({ onSelectCategoria, selectedCategoria } : FilterSideBarProps) {
  const categorias = [
    { id: "todos", label: "Todas as Categorias" },
    { id: "eletronicos", label: "Eletrônicos e Celulares" },
    { id: "esportes", label: "Esportes e Lazer" },
    { id: "casa", label: "Casa e Decoração" },
    { id: "vestuario", label: "Moda e Vestuário" },
  ];
  
  return(
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-900 text-base mb-4 tracking-tight">
          Categorias
        </h2>
        
        <ul className="space-y-1">
          {categorias.map((category) => {
            const isSelected = selectedCategoria === category.id;
            
            return(
              <li key={category.id}>
                <button
                  onClick={() => onSelectCategoria(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 flex items-center justify-between
                    ${
                      isSelected
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span>{category.label}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-6 border-t border-gray-100 opacity-40 pointer-events-none select-none">
          <h3 className="font-medium text-xs text-gray-400 uppercase tracking-wider mb-3">Faixa de Preço</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-gray-300"></div><div className="h-3 w-20 bg-gray-200 rounded"></div></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-gray-300"></div><div className="h-3 w-24 bg-gray-200 rounded"></div></div>
          </div>
        </div>
      </div>
    </aside>
  );
}