// src/app/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import HeaderComponent from "@/src/components/Header"; 
import ProductCard from "@/src/components/ProductCard";
import SortBar from "@/src/components/SortBar";
import LikertPopup from "@/src/components/LikertPopup";
import { useExperimento } from "@/src/hooks/useExperimento";
import { obterProdutosProcessados } from "@/src/utils/processarProdutos";

export default function Home() {
  const {
    etapaExperimento,
    termoBusca,
    categoriaSelecionada,
    currentSort,
    isPopupOpen,
    isLoading,
    perguntaPopupAtual,
    executarBuscaTelemetria,
    executarOrdenacaoTelemetria,
    executarFiltragemTelemetria,
    salvarRespostaLikert
  } = useExperimento();

  // 📖 Controle de Paginação Controlada para IHC
  const ITENS_POR_PAGINA = 4;
  const [paginaAtual, setPaginaAtual] = useState(1);

  // 🔄 Regra Científica: Se mudar os critérios globais, reinicia a paginação para evitar overflow mental do DOM
  useEffect(() => {
    setPaginaAtual(1);
  }, [categoriaSelecionada, currentSort, termoBusca]);

  // 🧠 Execução algorítmica pesada isolada da renderização maciça
  const { totalFiltrados, produtosPaginados } = useMemo(() => {
    // 1. Roda o algoritmo bruto em cima dos 100.000 mocks
    const todosFiltradosEOrdenados = obterProdutosProcessados(termoBusca, categoriaSelecionada, currentSort, etapaExperimento);
    
    // 2. Pagina apenas o pedaço necessário para proteger o ecossistema do navegador
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    
    return {
      totalFiltrados: todosFiltradosEOrdenados.length,
      produtosPaginados: todosFiltradosEOrdenados.slice(inicio, fim)
    };
  }, [categoriaSelecionada, currentSort, termoBusca, etapaExperimento, paginaAtual]);

  const totalPaginas = Math.ceil(totalFiltrados / ITENS_POR_PAGINA);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="w-full bg-purple-600 text-white text-center py-2 px-4 text-sm font-medium shadow-inner flex items-center justify-center gap-2">
        {etapaExperimento === "BUSCA_ARRAY" && <span>🔬 <strong>Etapa 1/3: Busca (Cenário A)</strong> | Procure pelo código <span className="bg-white text-purple-700 px-1.5 py-0.5 rounded font-bold mx-1">99999</span> na barra de pesquisa.</span>}
        {etapaExperimento === "BUSCA_HASH" && <span>🔬 <strong>Etapa 1/3: Busca (Cenário B)</strong> | Agora limpe a barra, busque por <span className="bg-white text-purple-700 px-1.5 py-0.5 rounded font-bold mx-1">100000</span> e compare.</span>}
        {etapaExperimento === "AVALIACAO_BUSCA" && <span>🎉 Salvando dados parciais de busca...</span>}
        
        {etapaExperimento === "ORDEM_NATIVA" && <span>🔬 <strong>Etapa 2/3: Ordenação (Cenário A)</strong> | Escolha uma ordenação no menu (ex: <i>Menor Preço</i>) para rodar o método 1.</span>}
        {etapaExperimento === "ORDEM_ABB" && <span>🔬 <strong>Etapa 2/3: Ordenação (Cenário B)</strong> | Mude a ordenação para <strong>qualquer outra opção</strong> para rodar o método 2 e concluir.</span>}
        {etapaExperimento === "AVALIACAO_ORDENACAO" && <span>🎉 Salvando dados parciais de ordenação...</span>}
        
        {etapaExperimento === "FILTRO_LINEAR" && <span>🔬 <strong>Etapa 3/3: Filtragem (Cenário A)</strong> | Clique em qualquer categoria na barra lateral (ex: <i>Eletrônicos</i>).</span>}
        {etapaExperimento === "FILTRO_INDEXADO" && <span>🔬 <strong>Etapa 3/3: Filtragem (Cenário B)</strong> | Mude para **outra categoria qualquer** para rodar o método otimizado.</span>}
        {etapaExperimento === "AVALIACAO_FILTRAGEM" && <span>🎉 Enviando relatório consolidado final ao banco...</span>}
        
        {etapaExperimento === "FIM_EXPERIMENTO" && <span>🏆 Experimento concluído! Sua participação foi unificada com sucesso na base de dados. Obrigado!</span>}
      </div>

      <HeaderComponent onSearch={executarBuscaTelemetria} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">  
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">              
            <FilterSideBar selectedCategoria={categoriaSelecionada} onSelectCategoria={executarFiltragemTelemetria} />
          </aside>

          <section className="flex-1 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <SortBar currentSort={currentSort} onSortChange={executarOrdenacaoTelemetria} totalProdutos={totalFiltrados} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative min-h-[400px] flex flex-col justify-between">
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-500 mt-3 font-medium">Processando estrutura de dados...</p>
                </div>
              )}

              {/* Grid Principal de Produtos Paginados */}
              {produtosPaginados.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {produtosPaginados.map((produto) => (
                    <ProductCard key={produto.id} produto={produto} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm flex-1 flex items-center justify-center">
                  Nenhum produto listado para os filtros aplicados.
                </div>
              )}

              {/* 🕹️ Barra de Navegação entre Páginas (Componente Científico Controlado) */}
              {totalFiltrados > ITENS_POR_PAGINA && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                  <span className="text-xs font-medium text-gray-400">
                    Página {paginaAtual} de {totalPaginas || 1} ({totalFiltrados.toLocaleString()} itens)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                      disabled={paginaAtual === 1 || isLoading}
                      className="px-3 py-1.5 rounded-md border border-gray-200 text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                      disabled={paginaAtual === totalPaginas || isLoading}
                      className="px-3 py-1.5 rounded-md border border-gray-200 text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
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