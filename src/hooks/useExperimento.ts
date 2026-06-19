// src/hooks/useExperimento.ts

import { useState } from "react";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";
import { ArvoreBinariaBusca, embaralharProdutosDeterministico } from "@/src/utils/algoritmosOrdenacao";

export type EtapaFluxo = 
  | "BUSCA_ARRAY" | "BUSCA_HASH" | "AVALIACAO_BUSCA" 
  | "ORDEM_NATIVA" | "ORDEM_ABB" | "AVALIACAO_ORDENACAO"
  | "FILTRO_LINEAR" | "FILTRO_INDEXADO" | "AVALIACAO_FILTRAGEM"
  | "FIM_EXPERIMENTO";

export function useExperimento() {
  const [etapaExperimento, setEtapaExperimento] = useState<EtapaFluxo>("BUSCA_ARRAY");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todos");

  const [idSessao] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());
  const [temposBusca, setTemposBusca] = useState({ arrayMs: 0, hashMs: 0 });
  const [temposOrdem, setTemposOrdem] = useState({ nativaMs: 0, abbMs: 0 });
  const [temposFiltro, setTemposFiltro] = useState({ linearMs: 0, indexadoMs: 0 });
  
  const [dadosAcumulados, setDadosAcumulados] = useState({
    bArrayMs: "0", bHashMs: "0", bLikert: 0,
    oNativaMs: "0", oAbbMs: "0", oLikert: 0
  });

  const checkDispositivo = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "MOBILE" : "DESKTOP";
    }
    return "UNKNOWN";
  };

  const perguntaPopupAtual = (() => {
    if (etapaExperimento === "AVALIACAO_BUSCA") {
      return "Comparando a primeira busca (Varredura Linear em Array) com a segunda busca (Acesso Direto via Hash Table), qual você percebeu ser mais rápida e fluida?";
    }
    if (etapaExperimento === "AVALIACAO_ORDENACAO") {
      return "Comparando o primeiro cenário de ordenação (Algoritmo Nativo Timsort) com o segundo cenário (Árvore Binária de Busca Manual), qual você percebeu ser mais rápido e fluido?";
    }
    return "Comparando o primeiro clique de filtro (Filtragem Linear em Array) com o segundo clique de filtro (Acesso Direto Indexado), qual você percebeu ser mais rápido e fluido?";
  })();

  const enviarParaGoogleFormsUnificado = async (payload: any) => {
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfZVSsHBJcVM2xzvX1pC8xMKpeMAPEaMiZI3ZoLC7zwP_DeCQ/formResponse";
    const formData = new URLSearchParams();
    
    formData.append("entry.432036167", payload.idUsuario);
    formData.append("entry.314801769", payload.dispositivo);
    formData.append("entry.603723243", payload.bArray);
    formData.append("entry.750695508", payload.bHash);
    formData.append("entry.62742821", payload.bLikert);
    formData.append("entry.1707197018", payload.oNativo);
    formData.append("entry.1706201349", payload.oAbb);
    formData.append("entry.383115611", payload.oLikert);

    try {
      await fetch(FORM_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData.toString() });
      console.log("%c✓ [Google Forms] Registro unificado enviado corretamente!", "color: #a855f7; font-weight: bold;");
    } catch (error) {
      console.error("Falha ao submeter registro unificado:", error);
    }
  };

  const executarBuscaTelemetria = (termo: string) => {
    const termoTratado = termo.toLowerCase().trim();
    let dadosBase = [...ProdutosMocks];

    if (etapaExperimento === "BUSCA_ARRAY" && termoTratado.includes("99999")) {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        buscarNoArray(dadosBase, termoTratado);
        const t1 = performance.now();
        setTemposBusca(prev => ({ ...prev, arrayMs: t1 - t0 }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("BUSCA_HASH");
        setIsLoading(false);
      }, 50);
    } 
    else if (etapaExperimento === "BUSCA_HASH" && termoTratado.includes("100000")) {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        buscarNaHashTable(dadosBase, termoTratado);
        const t1 = performance.now();
        setTemposBusca(prev => ({ ...prev, hashMs: t1 - t0 }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("AVALIACAO_BUSCA");
        setIsLoading(false);
        setTimeout(() => { setIsPopupOpen(true); }, 1500);
      }, 50);
    } else if (etapaExperimento !== "BUSCA_ARRAY" && etapaExperimento !== "BUSCA_HASH") {
      setTermoBusca(termoTratado);
    } else {
      alert(etapaExperimento === "BUSCA_ARRAY" ? "Por favor, busque pelo código: 99999" : "Por favor, busque pelo código: 100000");
    }
  };

  const executarOrdenacaoTelemetria = (sortOption: string) => {
    const criterio = sortOption === "preco-crescente" ? "crescente" : "decrescente";
    let dadosBase = [...ProdutosMocks]; 

    if (etapaExperimento === "ORDEM_NATIVA") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        dadosBase.sort((a, b) => {
          const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
          const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;
          return criterio === "crescente" ? precoA - precoB : precoB - precoA;
        });
        const t1 = performance.now();
        setTemposOrdem(prev => ({ ...prev, nativaMs: t1 - t0 }));
        setEtapaExperimento("ORDEM_ABB");
        setIsLoading(false);
      }, 50);
    } 
    else if (etapaExperimento === "ORDEM_ABB") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        const dadosEmbaralhar = embaralharProdutosDeterministico(dadosBase);
        const abb = new ArvoreBinariaBusca(criterio);
        dadosEmbaralhar.forEach(p => abb.inserir(p));
        abb.getProdutosOrdenados();
        const t1 = performance.now();
        setTemposOrdem(prev => ({ ...prev, abbMs: t1 - t0 }));
        setEtapaExperimento("AVALIACAO_ORDENACAO");
        setIsLoading(false);
        setTimeout(() => { setIsPopupOpen(true); }, 1500);
      }, 50);
    }
  };

  const executarFiltragemTelemetria = (categoria: string) => {
    if (categoria === "todos") return; // Obriga a clicar em uma categoria específica para testar o estresse
    
    if (etapaExperimento === "FILTRO_LINEAR") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        // O processarProdutos interceptará essa etapa e rodará o .filter() O(n)
        setCategoriaSelecionada(categoria);
        const t1 = performance.now();
        
        setTemposFiltro(prev => ({ ...prev, linearMs: t1 - t0 }));
        setEtapaExperimento("FILTRO_INDEXADO");
        setIsLoading(false);
      }, 50);
    }
    else if (etapaExperimento === "FILTRO_INDEXADO") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        // O processarProdutos interceptará essa etapa e rodará o Mapa O(1)
        setCategoriaSelecionada(categoria);
        const t1 = performance.now();
        
        setTemposFiltro(prev => ({ ...prev, indexadoMs: t1 - t0 }));
        setEtapaExperimento("AVALIACAO_FILTRAGEM");
        setIsLoading(false);
        setTimeout(() => { setIsPopupOpen(true); }, 1500);
      }, 50);
    } else {
      setCategoriaSelecionada(categoria);
    }
  };

  const salvarRespostaLikert = async (notaComparativa: number) => {
    if (etapaExperimento === "AVALIACAO_BUSCA") {
      setDadosAcumulados(prev => ({
        ...prev,
        bArrayMs: temposBusca.arrayMs.toFixed(4),
        bHashMs: temposBusca.hashMs.toFixed(4),
        bLikert: notaComparativa
      }));
      setIsPopupOpen(false);
      setTermoBusca("");
      setEtapaExperimento("ORDEM_NATIVA");
    } 
    else if (etapaExperimento === "AVALIACAO_ORDENACAO") {
      setDadosAcumulados(prev => ({
        ...prev,
        oNativaMs: temposOrdem.nativaMs.toFixed(4),
        oAbbMs: temposOrdem.abbMs.toFixed(4),
        oLikert: notaComparativa
      }));
      setIsPopupOpen(false);
      setEtapaExperimento("FILTRO_LINEAR");
    }
    else if (etapaExperimento === "AVALIACAO_FILTRAGEM") {
      // Chegamos ao fim da terceira etapa, dispara o payload completo e unificado!
      await enviarParaGoogleFormsUnificado({
        idUsuario: idSessao,
        dispositivo: checkDispositivo(),
        bArray: dadosAcumulados.bArrayMs,
        bHash: dadosAcumulados.bHashMs,
        bLikert: dadosAcumulados.bLikert.toString(),
        oNativo: dadosAcumulados.oNativaMs,
        oAbb: dadosAcumulados.oAbbMs,
        oLikert: dadosAcumulados.oLikert.toString(),
        fLinear: temposFiltro.linearMs.toFixed(4),
        fIndexado: temposFiltro.indexadoMs.toFixed(4),
        fLikert: notaComparativa.toString()
      });
      setIsPopupOpen(false);
      setCategoriaSelecionada("todos");
      setEtapaExperimento("FIM_EXPERIMENTO");
    }
  };

  return {
    etapaExperimento,
    termoBusca,
    categoriaSelecionada,
    setCategoriaSelecionada,
    isPopupOpen,
    isLoading,
    perguntaPopupAtual,
    executarBuscaTelemetria,
    executarOrdenacaoTelemetria,
    executarFiltragemTelemetria,
    salvarRespostaLikert
  };
}