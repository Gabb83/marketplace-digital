
"use client";

import { useMemo, useState } from "react";

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

  const produtosExibidos = useMemo(() => {
    let produtosFiltrados = [...ProdutosMocks];

    if(currentCategoria !== "todos") {
      produtosFiltrados = produtosFiltrados.filter(
        (p) => p.categoria === currentCategoria
      );
    }

    return produtosFiltrados.sort((a, b) => {
      const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
      const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;

      if(currentSort === "preco-crescente") {
        return precoA - precoB;
      }

      if(currentSort === "preco-decrescente") {
        return precoB - precoA;
      }

      if(currentSort === "relevancia") {
        return b.avaliacao - a.avaliacao;
      }

      return 0;

    });

  }, [currentCategoria, currentSort]); 

  // Função gatilho para o Cenário ii (Ordenação)
  const handleSortChange = (sortOption: string) => {
    setCurrentSort(sortOption);
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
                totalProdutos={produtosExibidos.length}
              />
            </div>

            {/* Grid de Cards de Produtos */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {produtosExibidos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
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