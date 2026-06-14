
"use client";

import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import SortBar from "@/src/components/SortBar";
import { useState } from "react";

export default function Home() {

  const [currentCategoria, setCurrentCategoria] = useState("todos");

  // Função gatilho para o Cenário iii (Filtragem)
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategoria(categoryId);
    
    // ==========================================
    // FUTURO GATILHO DO EXPERIMENTO:
    // 1. Executar o algoritmo de filtragem (A ou B da telemetria)
    // 2. Disparar a ferramenta de avaliação (Pop-up Likert)
    // ==========================================
    console.log(`Cenário iii disparado! Categoria: ${categoryId}`);
  };

  const [currentSort, setCurrentSort] = useState("relevancia");

  // Função gatilho para o Cenário ii (Ordenação)
  const handleSortChange = (sortOption: string) => {
    setCurrentSort(sortOption);

    // ==========================================
    // FUTURO GATILHO DO EXPERIMENTO:
    // 1. Executar o algoritmo de ordenação
    // 2. Disparar a ferramenta de avaliação (Pop-up Likert de responsividade)
    // ==========================================
    console.log(`Cenário ii disparado! Ordenação: ${sortOption}`);
  };

  return(
    <div>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-0 py-6">  
        {/* Layout de Duas Colunas (Responsivo: empilha no mobile, divide no desktop) */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* 1. ESPAÇO DA BARRA LATERAL (FILTROS) */}
          <aside className="w-full md:w-64 shrink-0">              
            <FilterSideBar 
              selectedCategoria={currentCategoria} 
              onSelectCategoria={handleCategoryChange} 
            />
          </aside>

          {/* 2. ESPAÇO PRINCIPAL (ORDENAÇÃO + PRODUTOS) */}
          <section className="flex-1">
            {/* Topbar de Ordenação */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
              <SortBar
                currentSort={currentSort} 
                onSortChange={handleSortChange} 
                totalProdutos={12}
              />
            </div>

            {/* Grid de Cards de Produtos */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              {/* Os produtos vão entrar aqui */}
              <div className="text-xs text-gray-400 italic">Grid de Produtos</div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}