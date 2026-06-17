// src/app/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import HeaderComponent from "@/src/components/Header"; 
import ProductCard from "@/src/components/ProductCard";
import SortBar from "@/src/components/SortBar";
import LikertPopup from "@/src/components/LikertPopup";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";
import { ArvoreBinariaBusca, embaralharProdutosDeterministico } from "@/src/utils/algoritmosOrdenacao";

export default function Home() {
  // Controle de Estado da Loja
  const [currentCategoria, setCurrentCategoria] = useState("todos");
  const [currentSort, setCurrentSort] = useState("relevancia");
  const [termoBusca, setTermoBusca] = useState("");

  // ESTADOS DO EXPERIMENTO PAREADO (Cenário II: Ordenação)
  const [etapaExperimento, setEtapaExperimento] = useState<"ORDEM_1" | "ORDEM_2" | "AVALIACAO_PRONTA">("ORDEM_1");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // TELEMETRIA INTERNA (Oculta do Usuário, visível apenas no payload final)
  const [tempoArrayNativo, setTempoArrayNativo] = useState<number | null>(null);
  const [tempoABBManual, setTempoABBManual] = useState<number | null>(null);

  // PROCESSAMENTO CENTRAL DOS PRODUTOS
  const { produtosProcessados, tempoExecucao } = useMemo(() => {
    let dados = [...ProdutosMocks];
    let t0 = 0;
    let t1 = 0;
    let tempoMedido = 0;

    // 1. CENÁRIO I: BUSCA
    if (termoBusca.trim() !== "") {
      if (termoBusca.includes("99999")) {
        dados = buscarNoArray(dados, termoBusca);
      } else if (termoBusca.includes("100000")) {
        dados = buscarNaHashTable(dados, termoBusca);
      }
    }

    // 2. CENÁRIO III: FILTRAGEM
    if (currentCategoria !== "todos") {
      dados = dados.filter((p) => p.categoria === currentCategoria);
    }

    // 3. CENÁRIO II: ORDENAÇÃO
    if (currentSort === "relevancia") {
      t0 = performance.now();
      dados.sort((a, b) => b.avaliacao - a.avaliacao);
      t1 = performance.now();
      return { produtosProcessados: dados, tempoExecucao: t1 - t0 };
    }

    const criterio = currentSort === "preco-crescente" ? "crescente" : "decrescente";

    // FASE 1: Roda a ordenação nativa (Timsort)
    if (etapaExperimento === "ORDEM_1") {
      t0 = performance.now();
      dados.sort((a, b) => {
        const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
        const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;
        return criterio === "crescente" ? precoA - precoB : precoB - precoA;
      });
      t1 = performance.now();
      tempoMedido = t1 - t0;
      
      return { produtosProcessados: dados, tempoExecucao: tempoMedido };
    } 
    // FASE 2: Força a construção da Árvore Binária de Busca Manual
    else {
      t0 = performance.now();
      const dadosEmbaralhar = embaralharProdutosDeterministico(dados);
      const abb = new ArvoreBinariaBusca(criterio);
      dadosEmbaralhar.forEach(p => abb.inserir(p));
      const resultadoOrdenado = abb.getProdutosOrdenados();
      t1 = performance.now();
      tempoMedido = t1 - t0;

      return { produtosProcessados: resultadoOrdenado, tempoExecucao: tempoMedido };
    }

  }, [currentCategoria, currentSort, termoBusca, etapaExperimento]);

  // Captura os tempos em background sem renderizar nada na tela
  useEffect(() => {
    if (currentSort !== "relevancia") {
      if (etapaExperimento === "ORDEM_2") {
        setTempoArrayNativo(tempoExecucao);
      } else if (etapaExperimento === "AVALIACAO_PRONTA") {
        setTempoABBManual(tempoExecucao);
      }
    }
  }, [tempoExecucao, etapaExperimento, currentSort]);

  const handleSearchSubmit = (termo: string) => {
    setTermoBusca(termo.toLowerCase().trim());
  };

  const handleSortChange = (sortOption: string) => {
    setCurrentSort(sortOption);

    if (etapaExperimento === "ORDEM_1") {
      setEtapaExperimento("ORDEM_2");
    } else if (etapaExperimento === "ORDEM_2") {
      setEtapaExperimento("AVALIACAO_PRONTA");
      
      // Delay para o usuário processar a sensação visual antes do Pop-up bloquear a tela
      setTimeout(() => {
        setIsPopupOpen(true);
      }, 2500);
    }
  };

  // Gravação científica unindo a resposta do usuário com os milissegundos ocultos coletados
  const handleSalvarTelemetria = (notaComparativa: number) => {
    const payloadCientifico = {
      tipoExperimento: "PAREADO_WITHIN_SUBJECT_ORDENACAO",
      tempo_timsort_nativo_ms: tempoArrayNativo ? parseFloat(tempoArrayNativo.toFixed(4)) : null,
      tempo_abb_manual_ms: tempoABBManual ? parseFloat(tempoABBManual.toFixed(4)) : null,
      respostaMetricaLikert: notaComparativa, 
      timestamp: new Date().toISOString(),
    };

    // Aqui os dados saem completos e pareados para sua análise estatística
    console.log("%c>>>> DADOS ENVIADOS PARA A BASE DE DADOS (OCULTOS DO USUÁRIO):", "color: #22c55e; font-weight: bold;", payloadCientifico);
    
    // Reseta o fluxo para o próximo avaliador
    setIsPopupOpen(false);
    setCurrentSort("relevancia");
    setTempoArrayNativo(null);
    setTempoABBManual(null);
    setEtapaExperimento("ORDEM_1");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* BARRA DE ORIENTAÇÃO DO USUÁRIO (TEXTOS NEUTROS, SEM SPOILER DE TEMPO) */}
      <div className="w-full bg-blue-600 text-white text-center py-2 px-4 text-sm font-medium shadow-inner flex items-center justify-center gap-2">
        {etapaExperimento === "ORDEM_1" && (
          <span>🔬 <strong>Passo 1 de 2:</strong> Altere a ordenação no menu abaixo (ex: <i>Menor Preço</i>) para processar o primeiro cenário.</span>
        )}
        {etapaExperimento === "ORDEM_2" && (
          <span>🔬 <strong>Passo 2 de 2:</strong> Muito bem. Agora mude a ordenação para <strong>qualquer outra opção</strong> para processar o segundo cenário.</span>
        )}
        {etapaExperimento === "AVALIACAO_PRONTA" && (
          <span>🎉 Teste concluído! Por favor, responda à escala de percepção na tela.</span>
        )}
      </div>

      <HeaderComponent onSearch={handleSearchSubmit} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">  
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">              
            <FilterSideBar selectedCategoria={currentCategoria} onSelectCategoria={setCurrentCategoria} />
          </aside>

          <section className="flex-1">
            
            {/* O painel visual de métricas foi totalmente removido daqui para evitar o viés de confirmação */}

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
              <SortBar currentSort={currentSort} onSortChange={handleSortChange} totalProdutos={produtosProcessados.length} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              {produtosProcessados.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Renderização limitada para isolar puramente a CPU algorítmica */}
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

      <LikertPopup isOpen={isPopupOpen} onEnviarResposta={handleSalvarTelemetria} />
    </div>
  );
}