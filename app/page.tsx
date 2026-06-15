
"use client";

import { useState } from "react";

import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import ProductCard from "@/src/components/ProductCard";
import SortBar from "@/src/components/SortBar";
import LikertPopup from "@/src/components/LikertPopup";
import { ProdutosMocks } from "@/src/data/products";

export default function Home() {

  const [currentCategoria, setCurrentCategoria] = useState("todos");

  // Função gatilho para o Cenário iii (Filtragem)
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategoria(categoryId);
    
    setPerguntaPopup("Como você avalia a fluidez e a velocidade da interface ao filtrar por essa categoria?");
    setCenarioAtivo("filtragem");
    console.log(`Cenário iii disparado! Categoria: ${categoryId}`);

    setTimeout(() => {
      setIsPopupOpen(true);
    }, 500);
  };

  const [currentSort, setCurrentSort] = useState("relevancia");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [perguntaPopup, setPerguntaPopup] = useState("");
  const [cenarioAtivo, setCenarioAtivo] = useState<"ordenacao" | "filtragem" | "busca" | null>(null);

  // Função gatilho para o Cenário ii (Ordenação)
  const handleSortChange = (sortOption: string) => {
    setCurrentSort(sortOption);

    // ==========================================
    // FUTURO GATILHO DO EXPERIMENTO:
    // 1. Executar o algoritmo de ordenação
    // 2. Disparar a ferramenta de avaliação (Pop-up Likert de responsividade)
    // ==========================================

    setPerguntaPopup("Como você avalia a responsividade da interface após acionar a ordenação dos produtos?");
    setCenarioAtivo("ordenacao");
    
    setTimeout(() => {
      setIsPopupOpen(true);
    }, 500);

    console.log(`Cenário ii disparado! Ordenação: ${sortOption}`);
  };

  const handleSalvarTelemetria = (nota: number) => {
    const dadosEvento = {
      cenario: cenarioAtivo,
      notaLikert: nota,
      algoritmoRodando: "ESTRUTURA_A", // Isso será alternado dinamicamente pela dupla-blindagem depois
      timestamp: new Date().toISOString(),
    };

    console.log(">>>> DADOS ENVIADOS PARA A TELEMETRIA INTERNA:", dadosEvento);
    // Aqui entrará o seu fetch/axios para salvar no banco de dados do seu experimento
    
    setCenarioAtivo(null);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ProdutosMocks.map((produto) => (
                <ProductCard  produto={produto}
                />
              ))}
            </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <LikertPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        pergunta={perguntaPopup}
        onEnviarResposta={handleSalvarTelemetria}
      />
    </div>
  );
}