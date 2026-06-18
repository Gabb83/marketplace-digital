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

  // Estados de telemetria locais síncronos e protegidos
  const [temposBusca, setTemposBusca] = useState({ arrayMs: null as number | null, hashMs: null as number | null });
  const [temposOrdem, setTemposOrdem] = useState({ nativaMs: null as number | null, abbMs: null as number | null });

  // Define dinamicamente a pergunta do pop-up baseado na etapa atual do experimento
  const perguntaPopupAtual = etapaExperimento === "AVALIACAO_BUSCA"
    ? "Comparando a primeira busca (Varredura Linear em Array) com a segunda busca (Acesso Direto via Hash Table), qual você percebeu ser mais rápida e fluida?"
    : "Comparando o primeiro cenário de ordenação (Algoritmo Nativo Timsort) com o segundo cenário (Árvore Binária de Busca Manual), qual você percebeu ser mais rápido e fluido?";

  // 1. FILTRAGEM E RENDEREZAÇÃO DA VITRINE (Visão de Negócio da Interface)
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

    // 1. No escopo do seu componente Home, gere um ID de sessão simples uma única vez:
  const [idSessao] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());

  // 2. Crie uma função simples para detectar se é mobile ou desktop:
  const checkDispositivo = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "MOBILE" : "DESKTOP";
    }
    return "UNKNOWN";
  };

  // FUNÇÃO AUXILIAR: Envia os dados silenciosamente para a planilha do Google Forms
  const salvarNoGoogleForms = async (dados: { tipo: string; tempo1: number; tempo2: number; nota: number }) => {
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfZVSsHBJcVM2xzvX1pC8xMKpeMAPEaMiZI3ZoLC7zwP_DeCQ/formResponse";

    // Cria uma string de metadados rica para os revisores do paper não botarem defeito
  const tipoComMetadados = `${dados.tipo} | ID: ${idSessao} | DISP: ${checkDispositivo()}`;

  const formData = new URLSearchParams();
  formData.append("entry.603723243", tipoComMetadados); // Envia o tipo enriquecido
  formData.append("entry.1707197018", dados.tempo1.toString());
  formData.append("entry.1706201349", dados.tempo2.toString());
  formData.append("entry.383115611", dados.nota.toString());

    try {
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      console.log(`%c✓ [Google Forms] Dados enviados com sucesso para: ${dados.tipo}`, "color: #22c55e; font-weight: bold;");
    } catch (error) {
      console.error("Falha ao salvar dados no Google Forms:", error);
    }
  };

  // GATILHO SÍNCRONO DE BUSCA: Mede os algoritmos puros no momento exato do clique
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

  // GATILHO SÍNCRONO DE ORDENAÇÃO: Garante o estresse em cima da massa total de dados de forma síncrona
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

  // CONTROLADOR CENTRAL DO QUESTIONÁRIO LIKERT
  const handleSalvarTelemetriaDaEtapa = async (notaComparativa: number) => {
    if (etapaExperimento === "AVALIACAO_BUSCA") {
      const tArray = parseFloat(temposBusca.arrayMs?.toFixed(4) || "0");
      const tHash = parseFloat(temposBusca.hashMs?.toFixed(4) || "0");

      await salvarNoGoogleForms({
        tipo: "PAREADO_DADOS_BUSCA",
        tempo1: tArray,
        tempo2: tHash,
        nota: notaComparativa
      });

      setIsPopupOpen(false);
      setTermoBusca("");
      setEtapaExperimento("ORDEM_NATIVA");
    } 
    else if (etapaExperimento === "AVALIACAO_ORDENACAO") {
      const tNativo = parseFloat(temposOrdem.nativaMs?.toFixed(4) || "0");
      const tAbb = parseFloat(temposOrdem.abbMs?.toFixed(4) || "0");

      await salvarNoGoogleForms({
        tipo: "PAREADO_DADOS_ORDENACAO",
        tempo1: tNativo,
        tempo2: tAbb,
        nota: notaComparativa
      });

      setIsPopupOpen(false);
      setEtapaExperimento("FIM_EXPERIMENTO");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* BARRA SUPERIOR DE CONDUÇÃO DO EXPERIMENTO */}
      <div className="w-full bg-blue-600 text-white text-center py-2 px-4 text-sm font-medium shadow-inner flex items-center justify-center gap-2">
        {etapaExperimento === "BUSCA_ARRAY" && <span>🔬 <strong>Etapa 1: Busca (Cenário A)</strong> | Procure pelo código <span className="bg-white text-blue-700 px-1.5 py-0.5 rounded font-bold mx-1">99999</span> na barra de pesquisa.</span>}
        {etapaExperimento === "BUSCA_HASH" && <span>🔬 <strong>Etapa 1: Busca (Cenário B)</strong> | Agora limpe a barra, busque por <span className="bg-white text-blue-700 px-1.5 py-0.5 rounded font-bold mx-1">100000</span> e compare.</span>}
        {etapaExperimento === "AVALIACAO_BUSCA" && <span>🎉 Respondendo questionário de Busca...</span>}
        {etapaExperimento === "ORDEM_NATIVA" && <span>🔬 <strong>Etapa 2: Ordenação (Cenário A)</strong> | Escolha uma ordenação no menu (ex: <i>Menor Preço</i>) para rodar o método 1.</span>}
        {etapaExperimento === "ORDEM_ABB" && <span>🔬 <strong>Etapa 2: Ordenação (Cenário B)</strong> | Ótimo. Mude a ordenação para <strong>qualquer outra opção</strong> para rodar o método 2.</span>}
        {etapaExperimento === "AVALIACAO_ORDENACAO" && <span>🎉 Respondendo questionário de Ordenação...</span>}
        {etapaExperimento === "FIM_EXPERIMENTO" && <span>🏆 Experimento concluído com sucesso! Muito obrigado pela contribuição científica.</span>}
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

      {/* Pop-up alimentado dinamicamente com as perguntas customizadas de IHC */}
      <LikertPopup 
        isOpen={isPopupOpen} 
        onEnviarResposta={handleSalvarTelemetriaDaEtapa} 
        tituloContexto={perguntaPopupAtual}
      />
    </div>
  );
}