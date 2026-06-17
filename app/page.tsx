// src/app/page.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import HeaderComponent from "@/src/components/Header"; 
import ProductCard from "@/src/components/ProductCard";
import SortBar from "@/src/components/SortBar";
import LikertPopup from "@/src/components/LikertPopup";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";
import { ArvoreBinariaBusca, embaralharProdutosDeterministico } from "@/src/utils/algoritmosOrdenacao";

// Definição das etapas de controle do fluxo dividido
type EtapaFluxo = 
  | "BUSCA_ARRAY" | "BUSCA_HASH" | "AVALIACAO_BUSCA" 
  | "ORDEM_NATIVA" | "ORDEM_ABB" | "AVALIACAO_ORDENACAO" 
  | "FIM_EXPERIMENTO";

export default function Home() {
  // Controle de Estado da Loja
  const [currentCategoria, setCurrentCategoria] = useState("todos");
  const [currentSort, setCurrentSort] = useState("relevancia");
  const [termoBusca, setTermoBusca] = useState("");

  // ESTADO DO FLUXO DO EXPERIMENTO
  const [etapaExperimento, setEtapaExperimento] = useState<EtapaFluxo>("BUSCA_ARRAY");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // ARMAZENAMENTO TEMPORÁRIO DOS TEMPOS (Oculto do Usuário)
  const [temposBusca, setTemposBusca] = useState({ arrayMs: null as number | null, hashMs: null as number | null });
  const [temposOrdem, setTemposOrdem] = useState({ nativaMs: null as number | null, abbMs: null as number | null });

  // Guardas de tempo do último cálculo para a telemetria
  const [ultimoTempoCalculado, setUltimoTempoCalculado] = useState<number>(0);

  // SOLUÇÃO DEFINITIVA: useRef para armazenar com segurança o tempo medido na renderização
  const tempoMedidoRef = useRef<number>(0);

  // PROCESSAMENTO CENTRAL DOS PRODUTOS
  const produtosProcessados = useMemo(() => {
    let dados = [...ProdutosMocks];
    let t0 = 0;
    let t1 = 0;

    // Resetamos a referência a cada nova execução do cálculo
    tempoMedidoRef.current = 0;

    // 1. PROCESSAMENTO DE BUSCA
    if (termoBusca.trim() !== "") {
      if (etapaExperimento === "BUSCA_HASH") { 
        // Captura o tempo da Varredura Linear do Array
        t0 = performance.now();
        dados = buscarNoArray(dados, termoBusca);
        t1 = performance.now();
        tempoMedidoRef.current = t1 - t0;
      } else {
        // Captura o tempo do Acesso Direto por Chave na Hash Table
        t0 = performance.now();
        dados = buscarNaHashTable(dados, termoBusca);
        t1 = performance.now();
        tempoMedidoRef.current = t1 - t0;
      }
    }

    // 2. FILTRAGEM POR CATEGORIA
    if (currentCategoria !== "todos") {
      dados = dados.filter((p) => p.categoria === currentCategoria);
    }

    // 3. PROCESSAMENTO DE ORDENAÇÃO
    if (currentSort !== "relevancia") {
      const criterio = currentSort === "preco-crescente" ? "crescente" : "decrescente";

      if (etapaExperimento === "ORDEM_ABB" || etapaExperimento === "AVALIACAO_ORDENACAO") {
        // Ordenação Nativa Timsort V8
        t0 = performance.now();
        dados.sort((a, b) => {
          const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
          const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;
          return criterio === "crescente" ? precoA - precoB : precoB - precoA;
        });
        t1 = performance.now();
        tempoMedidoRef.current = t1 - t0;
      } 
      else if (etapaExperimento === "FIM_EXPERIMENTO") {
        // Ordenação por Árvore Binária de Busca Manual
        t0 = performance.now();
        const dadosEmbaralhar = embaralharProdutosDeterministico(dados);
        const abb = new ArvoreBinariaBusca(criterio);
        dadosEmbaralhar.forEach(p => abb.inserir(p));
        const resultadoOrdenado = abb.getProdutosOrdenados();
        t1 = performance.now();
        tempoMedidoRef.current = t1 - t0;
        dados = resultadoOrdenado;
      }
    } else {
      // Ordenação padrão para relevância
      dados.sort((a, b) => b.avaliacao - a.avaliacao);
    }

    return dados;
  }, [currentCategoria, currentSort, termoBusca, etapaExperimento]);

  // Passa o valor do ref com segurança para o estado logo após a renderização
  useEffect(() => {
    if (tempoMedidoRef.current > 0) {
      setUltimoTempoCalculado(tempoMedidoRef.current);
    }
  });

  // GATILHO 1: Submissão de Busca (Fase 1 do Experimento)
  const handleSearchSubmit = (termo: string) => {
    const termoTratado = termo.toLowerCase().trim();

    if (etapaExperimento === "BUSCA_ARRAY" && termoTratado.includes("99999")) {
      setTermoBusca(termoTratado);
      setTemposBusca(prev => ({ ...prev, arrayMs: tempoMedidoRef.current }));
      setEtapaExperimento("BUSCA_HASH");
    } 
    else if (etapaExperimento === "BUSCA_HASH" && termoTratado.includes("100000")) {
      setTermoBusca(termoTratado);
      setTemposBusca(prev => ({ ...prev, hashMs: tempoMedidoRef.current }));
      setEtapaExperimento("AVALIACAO_BUSCA");
      
      setTimeout(() => { setIsPopupOpen(true); }, 2000);
    } else if (etapaExperimento !== "BUSCA_ARRAY" && etapaExperimento !== "BUSCA_HASH") {
      setTermoBusca(termoTratado);
    } else {
      alert(etapaExperimento === "BUSCA_ARRAY" ? "Busque primeiro pelo código: 99999" : "Agora busque pelo código: 100000");
    }
  };

  // GATILHO 2: Mudança de Ordenação (Fase 2 do Experimento)
  const handleSortChange = (sortOption: string) => {
    setCurrentSort(sortOption);

    if (etapaExperimento === "ORDEM_NATIVA") {
      setTemposOrdem(prev => ({ ...prev, nativaMs: ultimoTempoCalculado }));
      setEtapaExperimento("ORDEM_ABB");
    } 
    else if (etapaExperimento === "ORDEM_ABB") {
      setTemposOrdem(prev => ({ ...prev, abbMs: ultimoTempoCalculado }));
      setEtapaExperimento("AVALIACAO_ORDENACAO");
      
      setTimeout(() => { setIsPopupOpen(true); }, 2500);
    }
  };

  // PROCESSADOR CENTRAL DOS ENVIOS DE TELEMETRIA
  const handleSalvarTelemetriaDaEtapa = (notaComparativa: number) => {
    if (etapaExperimento === "AVALIACAO_BUSCA") {
      const payloadBusca = {
        tipoExperimento: "PAREADO_DADOS_BUSCA",
        tempo_array_linear_ms: temposBusca.arrayMs ? parseFloat(temposBusca.arrayMs.toFixed(4)) : null,
        tempo_hash_table_ms: temposBusca.hashMs ? parseFloat(temposBusca.hashMs.toFixed(4)) : null,
        respostaLikertBusca: notaComparativa,
        timestamp: new Date().toISOString()
      };
      console.log("%c>>>> [TELEMETRIA 1/2] BUSCA SALVA:", "color: #3b82f6; font-weight: bold;", payloadBusca);

      setIsPopupOpen(false);
      setTermoBusca("");
      setEtapaExperimento("ORDEM_NATIVA");
    } 
    else if (etapaExperimento === "AVALIACAO_ORDENACAO") {
      const payloadOrdenacao = {
        tipoExperimento: "PAREADO_DADOS_ORDENACAO",
        tempo_timsort_nativo_ms: temposOrdem.nativaMs ? parseFloat(temposOrdem.nativaMs.toFixed(4)) : null,
        tempo_abb_manual_ms: temposOrdem.abbMs ? parseFloat(temposOrdem.abbMs.toFixed(4)) : null,
        respostaLikertOrdenacao: notaComparativa,
        timestamp: new Date().toISOString()
      };
      console.log("%c>>>> [TELEMETRIA 2/2] ORDENAÇÃO SALVA:", "color: #f59e0b; font-weight: bold;", payloadOrdenacao);

      setIsPopupOpen(false);
      setEtapaExperimento("FIM_EXPERIMENTO");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* ORIENTAÇÃO LINEAR */}
      <div className="w-full bg-blue-600 text-white text-center py-2 px-4 text-sm font-medium shadow-inner flex items-center justify-center gap-2">
        {etapaExperimento === "BUSCA_ARRAY" && (
          <span>🔬 <strong>Etapa 1: Busca (Cenário A)</strong> | Procure pelo código <span className="bg-white text-blue-700 px-1.5 py-0.5 rounded font-bold mx-1">99999</span> na barra de pesquisa.</span>
        )}
        {etapaExperimento === "BUSCA_HASH" && (
          <span>🔬 <strong>Etapa 1: Busca (Cenário B)</strong> | Agora limpe a barra, busque por <span className="bg-white text-blue-700 px-1.5 py-0.5 rounded font-bold mx-1">100000</span> e compare.</span>
        )}
        {etapaExperimento === "AVALIACAO_BUSCA" && (
          <span>🎉 Avaliando Busca... Responda ao questionário sobre os tempos de pesquisa.</span>
        )}
        {etapaExperimento === "ORDEM_NATIVA" && (
          <span>🔬 <strong>Etapa 2: Ordenação (Cenário A)</strong> | Escolha uma ordenação no menu (ex: <i>Menor Preço</i>) para rodar o método 1.</span>
        )}
        {etapaExperimento === "ORDEM_ABB" && (
          <span>🔬 <strong>Etapa 2: Ordenação (Cenário B)</strong> | Ótimo. Mude a ordenação para <strong>qualquer outra opção</strong> para rodar o método 2.</span>
        )}
        {etapaExperimento === "AVALIACAO_ORDENACAO" && (
          <span>🎉 Avaliando Ordenação... Responda ao questionário sobre os tempos de classificação de preços.</span>
        )}
        {etapaExperimento === "FIM_EXPERIMENTO" && (
          <span>🏆 Muito obrigado! Todas as telemetrias foram coletadas com sucesso para a pesquisa.</span>
        )}
      </div>

      <HeaderComponent onSearch={handleSearchSubmit} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">  
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">              
            <FilterSideBar selectedCategoria={currentCategoria} onSelectCategoria={setCurrentCategoria} />
          </aside>

          <section className="flex-1">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
              <SortBar currentSort={currentSort} onSortChange={handleSortChange} totalProdutos={produtosProcessados.length} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              {produtosProcessados.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {produtosProcessados.slice(0, 20).map((produto) => (
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

      <LikertPopup isOpen={isPopupOpen} onEnviarResposta={handleSalvarTelemetriaDaEtapa} />
    </div>
  );
}