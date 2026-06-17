// src/app/page.tsx
"use client";

import { useMemo, useState } from "react";
import Header from "@/src/components/FilterSideBar"; // Supondo o caminho correto
import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import HeaderComponent from "@/src/components/Header"; // Renomeado para evitar conflito
import ProductCard from "@/src/components/ProductCard";
import SortBar from "@/src/components/SortBar";
import LikertPopup from "@/src/components/LikertPopup";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";

export default function Home() {
  // Controle da Loja
  const [currentCategoria, setCurrentCategoria] = useState("todos");
  const [currentSort, setCurrentSort] = useState("relevancia");
  const [termoBusca, setTermoBusca] = useState("");

  // ESTADOS DO EXPERIMENTO PAREADO
  // Etapas: "TERMO_1" (Fase inicial), "TERMO_2" (Fase intermediária), "AVALIACAO_PRONTA" (Fim do teste)
  const [etapaExperimento, setEtapaExperimento] = useState<"TERMO_1" | "TERMO_2" | "AVALIACAO_PRONTA">("TERMO_1");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Processamento Dinâmico aplicando a estrutura da etapa atual
  const produtosExibidos = useMemo(() => {
    let dados = [...ProdutosMocks];

    if (termoBusca.trim() !== "") {
      // Se a busca foi feita na primeira etapa, roda O(n) Array
      if (etapaExperimento === "TERMO_2") {
        dados = buscarNoArray(dados, termoBusca);
      } 
      // Se a busca foi feita na segunda etapa, roda O(1) Hash Table
      else if (etapaExperimento === "AVALIACAO_PRONTA") {
        dados = buscarNaHashTable(dados, termoBusca);
      }
    }

    // Filtro e Ordenação subsequentes padrão
    if (currentCategoria !== "todos") {
      dados = dados.filter((p) => p.categoria === currentCategoria);
    }

    return dados.sort((a, b) => {
      const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
      const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;
      if (currentSort === "preco-crescente") return precoA - precoB;
      if (currentSort === "preco-decrescente") return precoB - precoA;
      return b.avaliacao - a.avaliacao;
    });
  }, [currentCategoria, currentSort, termoBusca, etapaExperimento]);

  // Captura e gerencia a submissão dos termos pareados
  const handleSearchSubmit = (termo: string) => {
    const termoTratado = termo.toLowerCase().trim();

    if (etapaExperimento === "TERMO_1" && termoTratado === "fone") {
      setTermoBusca(termo);
      setEtapaExperimento("TERMO_2"); // Avança para a próxima etapa estrutural
    } else if (etapaExperimento === "TERMO_2" && termoTratado === "mochila") {
      setTermoBusca(termo);
      setEtapaExperimento("AVALIACAO_PRONTA");
      
      // Dispara o pop-up comparativo após o render da segunda busca
      setTimeout(() => {
        setIsPopupOpen(true);
      }, 600);
    } else {
      // Alerta amigável para guiar o usuário na ordem correta do teste científico
      alert(
        etapaExperimento === "TERMO_1" 
          ? "Por favor, siga a instrução no topo e busque por: fone" 
          : "Ótimo! Agora digite o segundo termo pedido no topo: mochila"
      );
    }
  };

  const handleSalvarTelemetria = (notaComparativa: number) => {
    const payloadCientifico = {
      tipoExperimento: "PAREADO_WITHIN_SUBJECT",
      termo1_estrutura: "BUSCA_SEQUENCIAL_ARRAY_ON",
      termo2_estrutura: "BUSCA_HASH_TABLE_O1",
      respostaMétricaLikert: notaComparativa, 
      timestamp: new Date().toISOString(),
    };

    console.log("%c>>>> DADOS FINAIS GRAVADOS COM SUCESSO PARA O TESTE T PAREADO:", "color: #3b82f6; font-weight: bold", payloadCientifico);
    
    // Reseta o fluxo caso queira testar novamente
    setIsPopupOpen(false);
    setTermoBusca("");
    setEtapaExperimento("TERMO_1");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* BARRA DE ORIENTAÇÃO DO USUÁRIO (GUIA DO TESTE) */}
      <div className="w-full bg-blue-600 text-white text-center py-2 px-4 text-sm font-medium shadow-inner flex items-center justify-center gap-2">
        {etapaExperimento === "TERMO_1" && (
          <span>🔬 <strong>Passo 1 de 2:</strong> Digite <span className="bg-white text-blue-700 px-1.5 py-0.5 rounded font-bold mx-1">fone</span> na barra de pesquisa e clique na lupa.</span>
        )}
        {etapaExperimento === "TERMO_2" && (
          <span>🔬 <strong>Passo 2 de 2:</strong> Excelente! Agora apague o texto, digite <span className="bg-white text-blue-700 px-1.5 py-0.5 rounded font-bold mx-1">mochila</span> e busque novamente.</span>
        )}
        {etapaExperimento === "AVALIACAO_PRONTA" && (
          <span>🎉 Obrigado! Por favor, responda ao questionário na tela para concluir.</span>
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
              <SortBar currentSort={currentSort} onSortChange={setCurrentSort} totalProdutos={produtosExibidos.length} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              {produtosExibidos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {produtosExibidos.map((produto) => (
                    <ProductCard key={produto.id} produto={produto} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm">Nenhum produto listado.</div>
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