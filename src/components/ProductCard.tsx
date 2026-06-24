// src/components/ProductCard.tsx
import { Star, ShoppingCart, Package } from "lucide-react";
import { Products } from "../data/products";

interface ProductCardProps {
  produto: Products;
}

export default function ProductCard({ produto } : ProductCardProps) {
  const formatarPreco = (valor: number | string) => {
    const valorNumerico = typeof valor === "string" ? parseFloat(valor) : valor;
    if (isNaN(valorNumerico)) return valor;
    
    return valorNumerico.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return(
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
        <Package size={40} strokeWidth={1.5} />
      </div>

      <div className="p-4 flex flex-col grow">
        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">
          {produto.categoria}
        </span>
        
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-10">
          {produto.nome}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center text-amber-400">
            <Star size={14} fill="currentColor" />
          </div>
          <span className="text-xs font-semibold text-gray-700">{produto.avaliacao}</span>
          <span className="text-xs text-gray-400">({produto.votos})</span>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-gray-900">
            {formatarPreco(produto.preco)}
          </span>
          
          <button 
            disabled
            className="p-2 rounded-md bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors opacity-80 cursor-not-allowed"
            title="Apenas demonstração"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}