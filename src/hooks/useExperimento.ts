// src/hooks/useExperimento.ts

import { useState } from "react";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";
import { ArvoreBinariaBusca, embaralharProdutosDeterministico } from "@/src/utils/algoritmosOrdenacao";
import { filtrarPorCategoriaLinear } from "@/src/utils/algoritmosFiltro";
import { PerguntaConfig } from "../components/LikertPopup";
import { PERGUNTAS } from "@/src/config/perguntas";

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
  const [currentSort, setCurrentSort] = useState("relevancia");

  const [idSessao] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());
  const [temposBusca, setTemposBusca] = useState({ arrayMs: 0, hashMs: 0 });
  const [temposOrdem, setTemposOrdem] = useState({ nativaMs: 0, abbMs: 0 });
  const [temposFiltro, setTemposFiltro] = useState({ linearMs: 0, indexadoMs: 0 });
  
  const [dadosAcumulados, setDadosAcumulados] = useState({

    bArrayMs: "0",
    bHashMs: "0",
    bPercepcao: 0,
    bSatisfacao: 0,

    oNativaMs: "0",
    oAbbMs: "0",
    oPercepcao: 0,
    oSatisfacao: 0,

    fPercepcao: 0,
    fSatisfacao: 0
});

  const TEMPO_MINIMO_SPINNER = 400;

  const checkDispositivo = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "MOBILE" : "DESKTOP";
    }
    return "UNKNOWN";
  };

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
      console.log("%c✓ [Metodologia] Registro unificado enviado!", "color: #22c55e; font-weight: bold;");
    } catch (error) {
      console.error("Falha ao submeter registro:", error);
    }
  };

  const executarBuscaTelemetria = (termo: string) => {
    const termoTratado = termo.toLowerCase().trim();
    let dadosBase = [...ProdutosMocks];

    if (etapaExperimento === "BUSCA_ARRAY" && termoTratado.includes("299999")) {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        buscarNoArray(dadosBase, termoTratado);
        const t1 = performance.now();
        
        setTemposBusca(prev => ({ ...prev, arrayMs: t1 - t0 }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("BUSCA_HASH");
        setIsLoading(false);
      }, 100);
    } 
    else if (etapaExperimento === "BUSCA_HASH" && termoTratado.includes("300000")) {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        buscarNaHashTable(dadosBase, termoTratado);
        const t1 = performance.now();
        
        setTemposBusca(prev => ({ ...prev, hashMs: t1 - t0 }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("AVALIACAO_BUSCA");
        setIsLoading(false);
        setTimeout(() => { setIsPopupOpen(true); }, 1000);
      }, 100);
    } else if (etapaExperimento !== "BUSCA_ARRAY" && etapaExperimento !== "BUSCA_HASH") {
      setTermoBusca(termoTratado);
    } else {
      alert(etapaExperimento === "BUSCA_ARRAY" ? "Por favor, busque pelo código: 299999" : "Por favor, busque pelo código: 300000");
    }
  };

  const executarOrdenacaoTelemetria = (sortOption: string) => {
    if (etapaExperimento === "ORDEM_NATIVA") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        const dadosSimulados = [...ProdutosMocks];
        dadosSimulados.sort((a, b) => Number(a.preco) - Number(b.preco));
        const t1 = performance.now();
        
        setTemposOrdem(prev => ({ ...prev, nativaMs: t1 - t0 }));
        setCurrentSort(sortOption);
        setEtapaExperimento("ORDEM_ABB");
        
        setTimeout(() => { setIsLoading(false); }, TEMPO_MINIMO_SPINNER);
      }, 100);
    } 
    else if (etapaExperimento === "ORDEM_ABB") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        const dadosEmbaralhar = embaralharProdutosDeterministico([...ProdutosMocks]);
        const abb = new ArvoreBinariaBusca(sortOption === "preco-crescente" ? "crescente" : "decrescente");
        dadosEmbaralhar.forEach(p => abb.inserir(p));
        abb.getProdutosOrdenados();
        const t1 = performance.now();
        
        setTemposOrdem(prev => ({ ...prev, abbMs: t1 - t0 }));
        setCurrentSort(sortOption);
        setEtapaExperimento("AVALIACAO_ORDENACAO");
        
        setTimeout(() => { 
          setIsLoading(false); 
          setTimeout(() => { setIsPopupOpen(true); }, 600);
        }, TEMPO_MINIMO_SPINNER);
      }, 100);
    } else {
      setCurrentSort(sortOption);
    }
  };

  const executarFiltragemTelemetria = (categoria: string) => {
    if (categoria === "todos") return;
    
    if (etapaExperimento === "FILTRO_LINEAR") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        filtrarPorCategoriaLinear([...ProdutosMocks], categoria);
        const t1 = performance.now();
        
        setTemposFiltro(prev => ({ ...prev, linearMs: t1 - t0 }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("FILTRO_INDEXADO");
        
        setTimeout(() => { setIsLoading(false); }, TEMPO_MINIMO_SPINNER);
      }, 100);
    }
    else if (etapaExperimento === "FILTRO_INDEXADO") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        const t1 = performance.now();
        
        setTemposFiltro(prev => ({ ...prev, indexadoMs: t1 - t0 }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("AVALIACAO_FILTRAGEM");
        
        setTimeout(() => { 
          setIsLoading(false); 
          setTimeout(() => { setIsPopupOpen(true); }, 600);
        }, TEMPO_MINIMO_SPINNER);
      }, 100);
    } else {
      setCategoriaSelecionada(categoria);
    }
  };

    const salvarRespostaLikert = async (
    notaPercepcao: number,
    notaSatisfacao: number
  ) => {
    if (etapaExperimento === "AVALIACAO_BUSCA") {
      setDadosAcumulados(prev => ({
        ...prev,
        bArrayMs: temposBusca.arrayMs.toFixed(4),
        bHashMs: temposBusca.hashMs.toFixed(4),
        bPercepcao: notaPercepcao,
        bSatisfacao: notaSatisfacao,
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
        oPercepcao: notaPercepcao,
        oSatisfacao: notaSatisfacao,
      }));

      setIsPopupOpen(false);
      setEtapaExperimento("FILTRO_LINEAR");
    }

    else if (etapaExperimento === "AVALIACAO_FILTRAGEM") {
      setIsPopupOpen(false);
      setIsLoading(true);

      await enviarParaGoogleFormsUnificado({
        idUsuario: idSessao,
        dispositivo: checkDispositivo(),

        // Busca
        bArray: dadosAcumulados.bArrayMs,
        bHash: dadosAcumulados.bHashMs,
        bPercepcao: dadosAcumulados.bPercepcao.toString(),
        bSatisfacao: dadosAcumulados.bSatisfacao.toString(),

        // Ordenação
        oNativo: dadosAcumulados.oNativaMs,
        oAbb: dadosAcumulados.oAbbMs,
        oPercepcao: dadosAcumulados.oPercepcao.toString(),
        oSatisfacao: dadosAcumulados.oSatisfacao.toString(),

        // Filtragem
        fLinear: temposFiltro.linearMs.toFixed(4),
        fIndexado: temposFiltro.indexadoMs.toFixed(4),
        fPercepcao: notaPercepcao.toString(),
        fSatisfacao: notaSatisfacao.toString(),
      });

      setIsLoading(false);
      setCategoriaSelecionada("todos");
      setEtapaExperimento("FIM_EXPERIMENTO");
    }
  };

  return {
     etapaExperimento,
    termoBusca,
    categoriaSelecionada,
    currentSort,
    isPopupOpen,
    isLoading,
    perguntas: PERGUNTAS[etapaExperimento] ?? [],
    executarBuscaTelemetria,
    executarOrdenacaoTelemetria,
    executarFiltragemTelemetria,
    salvarRespostaLikert
  };
}