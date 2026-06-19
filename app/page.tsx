// src/app/page.tsx
"use client";

import { useMemo, useState } from "react";
import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import HeaderComponent from "@/src/components/Header"; 
import ProductCard from "@/src/components/ProductCard";
import SortBar from "@/src/components/SortBar";
import LikertPopup from "@/src/components/LikertPopup";
import { useExperimento } from "@/src/hooks/useExperimento";
import { obterProdutosProcessados } from "@/src/utils/processarProdutos";

export default function Home() {
  const [currentCategoria, setCurrentCategoria] = useState("todos");
  const [currentSort, setCurrentSort] = useState("relevancia");

  // Todas as funções pesadas e estados do experimento agora vêm prontas do hook!
  const {
    etapaExperimento,
    termoBusca,
    isPopupOpen,
    isLoading,
    perguntaPopupAtual,
    executarBuscaTelemetria,
    executarOrdenacaoTelemetria,
    salvarRespostaLikert
  } = useExperimento();

  // Filtragem delegada ao utilitário isolado
  const produtosExibidos = useMemo(() => {
    return obterProdutosProcessados(termoBusca, currentCategoria, currentSort, etapaExperimento);
  }, [currentCategoria, currentSort, termoBusca, etapaExperimento]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="w-full bg-purple-600 text-white text-center py-2 px-4 text-sm font-medium shadow-inner flex items-center justify-center gap-2">
        {etapaExperimento === "BUSCA_ARRAY" && <span>🔬 <strong>Etapa 1/2: Busca (Cenário A)</strong> | Procure pelo código <span className="bg-white text-purple-700 px-1.5 py-0.5 rounded font-bold mx-1">99999</span> na barra de pesquisa.</span>}
        {etapaExperimento === "BUSCA_HASH" && <span>🔬 <strong>Etapa 1/2: Busca (Cenário B)</strong> | Agora limpe a barra, busque por <span className="bg-white text-purple-700 px-1.5 py-0.5 rounded font-bold mx-1">100000</span> e compare.</span>}
        {etapaExperimento === "AVALIACAO_BUSCA" && <span>🎉 Salvando dados parciais de busca...</span>}
        {etapaExperimento === "ORDEM_NATIVA" && <span>🔬 <strong>Etapa 2/2: Ordenação (Cenário A)</strong> | Escolha uma ordenação no menu (ex: <i>Menor Preço</i>) para rodar o método 1.</span>}
        {etapaExperimento === "ORDEM_ABB" && <span>🔬 <strong>Etapa 2/2: Ordenação (Cenário B)</strong> | Mude a ordenação para <strong>qualquer outra opção</strong> para rodar o método 2 e concluir.</span>}
        {etapaExperimento === "AVALIACAO_ORDENACAO" && <span>🎉 Enviando relatório consolidado ao banco...</span>}
        {etapaExperimento === "FIM_EXPERIMENTO" && <span>🏆 Experimento concluído! Sua participação foi unificada com sucesso na base de dados. Obrigado!</span>}
      </div>

      <HeaderComponent onSearch={executarBuscaTelemetria} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">  
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">              
            <FilterSideBar selectedCategoria={currentCategoria} onSelectCategoria={setCurrentCategoria} />
          </aside>

          <section className="flex-1">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
              <SortBar currentSort={currentSort} onSortChange={executarOrdenacaoTelemetria} totalProdutos={produtosExibidos.length} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative min-h-75">
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-500 mt-3 font-medium">Processando estrutura de dados...</p>
                </div>
              )}

              {produtosExibidos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {produtosExibidos.slice(0, 20).map((produto) => (
                    <ProductCard key={produto.id} produto={produto} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm">Nenhum produto listado para os filtros aplicados.</div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <LikertPopup 
        isOpen={isPopupOpen} 
        onEnviarResposta={salvarRespostaLikert} 
        tituloContexto={perguntaPopupAtual}
      />
    </div>
  );
}