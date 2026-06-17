// src/app/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";

import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import ProductCard from "@/src/components/ProductCard";
import SortBar from "@/src/components/SortBar";
import LikertPopup from "@/src/components/LikertPopup";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNoHashTable } from "@/src/utils/algoritmosBusca"; // Funções utilitárias do passo anterior

export default function Home() {
  // Estados de controle da Loja
  const [currentCategoria, setCurrentCategoria] = useState("todos");
  const [currentSort, setCurrentSort] = useState("relevancia");
  const [termoBusca, setTermoBusca] = useState(""); // Novo estado para o Cenário i

  // CONTROLE DO EXPERIMENTO (Isolamento por sessão)
  const [estruturaDeDadosAtiva, setEstruturaDeDadosAtiva] = useState<"ARRAY_ESTRUTURA" | "HASH_ESTRUTURA">("ARRAY_ESTRUTURA");

  useEffect(() => {
    // Sorteia a estrutura da sessão do utilizador para evitar viés estatístico
    const estruturaSorteada = Math.random() > 0.5 ? "ARRAY_ESTRUTURA" : "HASH_ESTRUTURA";
    setEstruturaDeDadosAtiva(estruturaSorteada);
    console.log(`[Metodologia] Sessão fixada na estrutura: ${estruturaSorteada}`);
  }, []);

  // Estados do Pop-up Likert
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [perguntaPopup, setPerguntaPopup] = useState("");
  const [cenarioAtivo, setCenarioAtivo] = useState<"ordenacao" | "filtragem" | "busca" | null>(null);

  // PROCESSAMENTO CENTRAL DOS PRODUTOS (Busca + Filtro + Ordenação)
  const produtosExibidos = useMemo(() => {
    let dadosProcessados = [...ProdutosMocks];

    // 1. APLICAR O CENÁRIO I: BUSCA (Baseado na estrutura da sessão)
    if (termoBusca.trim() !== "") {
      if (estruturaDeDadosAtiva === "ARRAY_ESTRUTURA") {
        dadosProcessados = buscarNoArray(dadosProcessados, termoBusca);
      } else {
        dadosProcessados = buscarNoHashTable(dadosProcessados, termoBusca);
      }
    }

    // 2. APLICAR O CENÁRIO III: FILTRAGEM
    if (currentCategoria !== "todos") {
      dadosProcessados = dadosProcessados.filter((p) => p.categoria === currentCategoria);
    }

    // 3. APLICAR O CENÁRIO II: ORDENAÇÃO
    return dadosProcessados.sort((a, b) => {
      const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
      const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;

      if (currentSort === "preco-crescente") return precoA - precoB;
      if (currentSort === "preco-decrescente") return precoB - precoA;
      if (currentSort === "relevancia") return b.avaliacao - a.avaliacao;
      return 0;
    });

  }, [currentCategoria, currentSort, termoBusca, estruturaDeDadosAtiva]);

  // Gatilho do Cenário i (Busca vinda do Header)
  const handleSearchSubmit = (termo: string) => {
    setTermoBusca(termo);
    setPerguntaPopup("Como avalia a fluidez e a rapidez da resposta da interface ao realizar esta busca?");
    setCenarioAtivo("busca");

    setTimeout(() => {
      setIsPopupOpen(true);
    }, 500);
  };

  // Gatilho do Cenário iii (Filtragem)
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategoria(categoryId);
    setPerguntaPopup("Como você avalia a fluidez e a velocidade da interface ao filtrar por essa categoria?");
    setCenarioAtivo("filtragem");

    setTimeout(() => {
      setIsPopupOpen(true);
    }, 500);
  };

  // Gatilho do Cenário ii (Ordenação)
  const handleSortChange = (sortOption: string) => {
    setCurrentSort(sortOption);
    setPerguntaPopup("Como você avalia a responsividade da interface após acionar a ordenação dos produtos?");
    setCenarioAtivo("ordenacao");
    
    setTimeout(() => {
      setIsPopupOpen(true);
    }, 500);
  };

  // Salvando na Telemetria
  const handleSalvarTelemetria = (nota: number) => {
    const dadosEvento = {
      cenario: cenarioAtivo,
      notaLikert: nota,
      estruturaUtilizada: BlackBoxDetectada(), // Identifica o par correto para o Teste t
      timestamp: new Date().toISOString(),
    };

    console.log(">>>> TELEMETRIA GRAVADA:", dadosEvento);
    setCenarioAtivo(null);
  };

  // Função auxiliar para mapear o nome exato da técnica avaliada no log
  const BlackBoxDetectada = () => {
    if (cenarioAtivo === "busca") {
      return estruturaDeDadosAtiva === "ARRAY_ESTRUTURA" ? "BUSCA_SEQUENCIAL_ARRAY" : "BUSCA_HASH_TABLE";
    }
    return estruturaDeDadosAtiva;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Conectamos o evento de busca no Header */}
      <Header onSearch={handleSearchSubmit} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">  
        <div className="flex flex-col md:flex-row gap-6">
          
          <aside className="w-full md:w-64 shrink-0">              
            <FilterSideBar 
              selectedCategoria={currentCategoria} 
              onSelectCategoria={handleCategoryChange} 
            />
          </aside>

          <section className="flex-1">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
              <SortBar
                currentSort={currentSort} 
                onSortChange={handleSortChange} 
                totalProdutos={produtosExibidos.length}
              />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              {produtosExibidos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {produtosExibidos.map((produto) => (
                    <ProductCard key={produto.id} produto={produto} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm">
                  Nenhum produto encontrado para a busca "{termoBusca}".
                </div>
              )}
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