// src/hooks/useExperimento.ts

import { useState } from "react";
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";
import { ArvoreBinariaBusca, embaralharProdutosDeterministico } from "@/src/utils/algoritmosOrdenacao";
import { filtrarPorCategoriaLinear } from "@/src/utils/algoritmosFiltro";
import { PERGUNTAS } from "@/src/config/perguntas";
import { enviarExperimento } from "@/src/services/googleForms";
import { medirTempo } from "@/src/utils/medirTempo";

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

  const executarBuscaTelemetria = (termo: string) => {
    const termoTratado = termo.toLowerCase().trim();
    let dadosBase = [...ProdutosMocks];

    if (etapaExperimento === "BUSCA_ARRAY" && termoTratado.includes("299999")) {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() =>
          buscarNoArray(dadosBase, termoTratado)
        );

        setTemposBusca(prev => ({
          ...prev,
          arrayMs: tempoMs,
        }));

        setTermoBusca(termoTratado);
        setEtapaExperimento("BUSCA_HASH");
        setIsLoading(false);
      }, 100);
    } 
    else if (etapaExperimento === "BUSCA_HASH" && termoTratado.includes("300000")) {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() =>
          buscarNaHashTable(dadosBase, termoTratado)
        );

        setTemposBusca(prev => ({
          ...prev,
          hashMs: tempoMs,
        }));

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
        const { tempoMs } = medirTempo(() => {
          const dadosSimulados = [...ProdutosMocks];
          dadosSimulados.sort((a, b) => Number(a.preco) - Number(b.preco));
        });

        setTemposOrdem(prev => ({
          ...prev,
          nativaMs: tempoMs,
        }));

        setCurrentSort(sortOption);
        setEtapaExperimento("ORDEM_ABB");
        
        setTimeout(() => { setIsLoading(false); }, TEMPO_MINIMO_SPINNER);
      }, 100);
    } 
    else if (etapaExperimento === "ORDEM_ABB") {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => {
          const dadosEmbaralhar = embaralharProdutosDeterministico([...ProdutosMocks]);

          const abb = new ArvoreBinariaBusca(
            sortOption === "preco-crescente"
              ? "crescente"
              : "decrescente"
          );

          dadosEmbaralhar.forEach(p => abb.inserir(p));
          abb.getProdutosOrdenados();
        });

        setTemposOrdem(prev => ({
          ...prev,
          abbMs: tempoMs,
        }));

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
        const { tempoMs } = medirTempo(() =>
          filtrarPorCategoriaLinear([...ProdutosMocks], categoria)
        );

        setTemposFiltro(prev => ({
          ...prev,
          linearMs: tempoMs,
        }));

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

      await enviarExperimento({
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