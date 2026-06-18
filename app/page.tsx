// src/app/page.tsx
"use client";

import { useMemo, useState } from "react";
import FilterSideBar from "@/src/components/FilterSideBar";
import Footer from "@/src/components/Footer";
import HeaderComponent from "@/src/components/Header"; 
import ProductCard from "@/src/components/ProductCard";
import SortBar from "@/src/components/SortBar";
import LikertPopup from "@/src/components/LikertPopup";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";
import { ArvoreBinariaBusca, embaralharProdutosDeterministico } from "@/src/utils/algoritmosOrdenacao";

type EtapaFluxo = 
  | "BUSCA_ARRAY" | "BUSCA_HASH" | "AVALIACAO_BUSCA" 
  | "ORDEM_NATIVA" | "ORDEM_ABB" | "AVALIACAO_ORDENACAO" 
  | "FIM_EXPERIMENTO";

export default function Home() {
  const [currentCategoria, setCurrentCategoria] = useState("todos");
  const [currentSort, setCurrentSort] = useState("relevancia");
  const [termoBusca, setTermoBusca] = useState("");

  const [etapaExperimento, setEtapaExperimento] = useState<EtapaFluxo>("BUSCA_ARRAY");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // ID único de sessão persistente e detecção de dispositivo para o rigor científico do paper
  const [idSessao] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());
  const checkDispositivo = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "MOBILE" : "DESKTOP";
    }
    return "UNKNOWN";
  };

  // Estados temporários de telemetria locais
  const [temposBusca, setTemposBusca] = useState({ arrayMs: 0, hashMs: 0 });
  const [temposOrdem, setTemposOrdem] = useState({ nativaMs: 0, abbMs: 0 });

  // Estado que acumula a primeira etapa para unificar o registro no Forms
  const [dadosBuscaAcumulados, setDadosBuscaAcumulados] = useState({
    arrayMs: "0",
    hashMs: "0",
    likert: 0
  });

  const perguntaPopupAtual = etapaExperimento === "AVALIACAO_BUSCA"
    ? "Comparando a primeira busca (Varredura Linear em Array) com a segunda busca (Acesso Direto via Hash Table), qual você percebeu ser mais rápida e fluida?"
    : "Comparando o primeiro cenário de ordenação (Algoritmo Nativo Timsort) com o segundo cenário (Árvore Binária de Busca Manual), qual você percebeu ser mais rápido e fluido?";

  // FILTRAGEM E RENDEREZAÇÃO DA VITRINE
  const produtosExibidos = useMemo(() => {
    let dados = [...ProdutosMocks];

    if (termoBusca.trim() !== "") {
      if (termoBusca.includes("99999")) {
        dados = buscarNoArray(dados, termoBusca);
      } else {
        dados = buscarNaHashTable(dados, termoBusca);
      }
    }

    if (currentCategoria !== "todos") {
      dados = dados.filter((p) => p.categoria === currentCategoria);
    }

    const criterio = currentSort === "preco-crescente" ? "crescente" : "decrescente";
    if (currentSort !== "relevancia") {
      if (etapaExperimento === "FIM_EXPERIMENTO") {
        const dadosEmbaralhar = embaralharProdutosDeterministico(dados);
        const abb = new ArvoreBinariaBusca(criterio);
        dadosEmbaralhar.forEach(p => abb.inserir(p));
        dados = abb.getProdutosOrdenados();
      } else {
        dados.sort((a, b) => {
          const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
          const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;
          return criterio === "crescente" ? precoA - precoB : precoB - precoA;
        });
      }
    } else {
      dados.sort((a, b) => b.avaliacao - a.avaliacao);
    }

    return dados;
  }, [currentCategoria, currentSort, termoBusca, etapaExperimento]);

  // FUNÇÃO DE ENVIO UNIFICADA: Dispara o payload completo em uma única linha da planilha
  const enviarParaGoogleFormsUnificado = async (payload: {
    idUsuario: string;
    dispositivo: string;
    bArray: string;
    bHash: string;
    bLikert: string;
    oNativo: string;
    oAbb: string;
    oLikert: string;
  }) => {
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfZVSsHBJcVM2xzvX1pC8xMKpeMAPEaMiZI3ZoLC7zwP_DeCQ/formResponse";

    const formData = new URLSearchParams();
    
    // ATENÇÃO MÁXIMA AO MAPEAMENTO DOS ENTRYS:
    formData.append("entry.432036167", payload.idUsuario);    // Tem que receber o ID (Ex: KZ7R)
    formData.append("entry.314801769", payload.dispositivo);  // Tem que receber o DESKTOP/MOBILE
    formData.append("entry.603723243", payload.bArray);       // Tempo da busca em array
    formData.append("entry.750695508", payload.bHash);        // Tempo da busca em hash
    formData.append("entry.62742821", payload.bLikert);       // Nota Likert da busca
    formData.append("entry.1707197018", payload.oNativo);     // Tempo da ordenação nativa
    formData.append("entry.1706201349", payload.oAbb);        // Tempo da ordenação ABB
    formData.append("entry.383115611", payload.oLikert);       // Nota Likert da ordenação

    try {
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      console.log("%c✓ [Google Forms] Registro unificado enviado corretamente!", "color: #a855f7; font-weight: bold;");
    } catch (error) {
      console.error("Falha ao submeter registro unificado:", error);
    }
  };

  const handleSearchSubmit = (termo: string) => {
    const termoTratado = termo.toLowerCase().trim();
    let dadosBase = [...ProdutosMocks];

    if (etapaExperimento === "BUSCA_ARRAY" && termoTratado.includes("99999")) {
      const t0 = performance.now();
      buscarNoArray(dadosBase, termoTratado);
      const t1 = performance.now();
      
      setTemposBusca(prev => ({ ...prev, arrayMs: t1 - t0 }));
      setTermoBusca(termoTratado);
      setEtapaExperimento("BUSCA_HASH");
    } 
    else if (etapaExperimento === "BUSCA_HASH" && termoTratado.includes("100000")) {
      const t0 = performance.now();
      buscarNaHashTable(dadosBase, termoTratado);
      const t1 = performance.now();
      
      setTemposBusca(prev => ({ ...prev, hashMs: t1 - t0 }));
      setTermoBusca(termoTratado);
      setEtapaExperimento("AVALIACAO_BUSCA");
      
      setTimeout(() => { setIsPopupOpen(true); }, 1500);
    } else if (etapaExperimento !== "BUSCA_ARRAY" && etapaExperimento !== "BUSCA_HASH") {
      setTermoBusca(termoTratado);
    } else {
      alert(etapaExperimento === "BUSCA_ARRAY" ? "Por favor, busque pelo código: 99999" : "Por favor, busque pelo código: 100000");
    }
  };

  const handleSortChange = (sortOption: string) => {
    setCurrentSort(sortOption);
    const criterio = sortOption === "preco-crescente" ? "crescente" : "decrescente";
    let dadosBase = [...ProdutosMocks]; 

    if (etapaExperimento === "ORDEM_NATIVA") {
      const t0 = performance.now();
      dadosBase.sort((a, b) => {
        const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
        const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;
        return criterio === "crescente" ? precoA - precoB : precoB - precoA;
      });
      const t1 = performance.now();

      setTemposOrdem(prev => ({ ...prev, nativaMs: t1 - t0 }));
      setEtapaExperimento("ORDEM_ABB");
    } 
    else if (etapaExperimento === "ORDEM_ABB") {
      const t0 = performance.now();
      const dadosEmbaralhar = embaralharProdutosDeterministico(dadosBase);
      const abb = new ArvoreBinariaBusca(criterio);
      dadosEmbaralhar.forEach(p => abb.inserir(p));
      abb.getProdutosOrdenados();
      const t1 = performance.now();

      setTemposOrdem(prev => ({ ...prev, abbMs: t1 - t0 }));
      setEtapaExperimento("AVALIACAO_ORDENACAO");
      
      setTimeout(() => { setIsPopupOpen(true); }, 1500);
    }
  };

  const handleSalvarTelemetriaDaEtapa = async (notaComparativa: number) => {
    if (etapaExperimento === "AVALIACAO_BUSCA") {
      // Guarda os dados da busca no estado local e avança sem disparar requisição externa
      setDadosBuscaAcumulados({
        arrayMs: temposBusca.arrayMs.toFixed(4),
        hashMs: temposBusca.hashMs.toFixed(4),
        likert: notaComparativa
      });

      setIsPopupOpen(false);
      setTermoBusca("");
      setEtapaExperimento("ORDEM_NATIVA");
    } 
    else if (etapaExperimento === "AVALIACAO_ORDENACAO") {
      const tNativo = temposOrdem.nativaMs.toFixed(4);
      const tAbb = temposOrdem.abbMs.toFixed(4);

      // Envia de uma vez só todo o fluxo acumulado do usuário atual
      await enviarParaGoogleFormsUnificado({
        idUsuario: idSessao,
        dispositivo: checkDispositivo(),
        bArray: dadosBuscaAcumulados.arrayMs,
        bHash: dadosBuscaAcumulados.hashMs,
        bLikert: dadosBuscaAcumulados.likert.toString(),
        oNativo: tNativo,
        oAbb: tAbb,
        oLikert: notaComparativa.toString()
      });

      setIsPopupOpen(false);
      setEtapaExperimento("FIM_EXPERIMENTO");
    }
  };

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

      <HeaderComponent onSearch={handleSearchSubmit} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">  
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">              
            <FilterSideBar selectedCategoria={currentCategoria} onSelectCategoria={setCurrentCategoria} />
          </aside>

          <section className="flex-1">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
              <SortBar currentSort={currentSort} onSortChange={handleSortChange} totalProdutos={produtosExibidos.length} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
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
        onEnviarResposta={handleSalvarTelemetriaDaEtapa} 
        tituloContexto={perguntaPopupAtual}
      />
    </div>
  );
}