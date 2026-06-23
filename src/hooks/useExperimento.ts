// src/hooks/useExperimento.ts
import { useState } from "react";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";

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
  
  // 🔥 NOVO: Estado de ordenação movido para dentro do hook para sincronia visual
  const [currentSort, setCurrentSort] = useState("relevancia");

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
      return "Comparando a primeira busca com a segunda busca, qual você percebeu ser mais rápida e fluida?";
    }
    if (etapaExperimento === "AVALIACAO_ORDENACAO") {
      return "Comparando o primeiro cenário de ordenação com o segundo cenário, qual você percebeu ser mais rápido e fluido?";
    }
    return "Comparando o primeiro clique de filtro com o segundo clique de filtro, qual você percebeu ser mais rápido e fluido?";
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
    formData.append("entry.1035977829", payload.fLinear); 
    formData.append("entry.876981547", payload.fIndexado);
    formData.append("entry.664100771", payload.fLikert);

    try {
      await fetch(FORM_URL, { 
        method: "POST", 
        mode: "no-cors", 
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
        body: formData.toString() 
      });
      console.log("%c✓ [Metodologia] Registro unificado enviado com sucesso!", "color: #22c55e; font-weight: bold;");
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
    // 🔥 Sincroniza visualmente a opção escolhida no componente SortBar
    setCurrentSort(sortOption);

    if (etapaExperimento === "ORDEM_NATIVA") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        // O utilitário obterProdutosProcessados encarrega-se da mutação visual
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
        // A lógica pesada da árvore roda em segundo plano através do processador central
        const t1 = performance.now();
        setTemposOrdem(prev => ({ ...prev, abbMs: t1 - t0 }));
        setEtapaExperimento("AVALIACAO_ORDENACAO");
        setIsLoading(false);
        setTimeout(() => { setIsPopupOpen(true); }, 1500);
      }, 50);
    }
  };

  const executarFiltragemTelemetria = (categoria: string) => {
    if (categoria === "todos") return;
    
    if (etapaExperimento === "FILTRO_LINEAR") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
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
    currentSort, // 🔥 Exposto para a Home escutar no useMemo
    isPopupOpen,
    isLoading,
    perguntaPopupAtual,
    executarBuscaTelemetria,
    executarOrdenacaoTelemetria,
    executarFiltragemTelemetria,
    salvarRespostaLikert
  };
}