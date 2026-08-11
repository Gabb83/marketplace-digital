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
  | "BUSCA_ARRAY_PRIMEIRO" | "BUSCA_HASH_SEGUNDO"
  | "BUSCA_HASH_PRIMEIRO"  | "BUSCA_ARRAY_SEGUNDO"
  | "AVALIACAO_BUSCA" 
  | "ORDEM_NATIVA_PRIMEIRO" | "ORDEM_ABB_SEGUNDO"
  | "ORDEM_ABB_PRIMEIRO"    | "ORDEM_NATIVA_SEGUNDO"
  | "AVALIACAO_ORDENACAO"
  | "FILTRO_LINEAR_PRIMEIRO" | "FILTRO_INDEXADO_SEGUNDO"
  | "FILTRO_INDEXADO_PRIMEIRO"| "FILTRO_LINEAR_SEGUNDO"
  | "AVALIACAO_FILTRAGEM"
  | "FIM_EXPERIMENTO";

export function useExperimento() {
  // Sorteio determinístico baseado no ID para aplicar o Contrabalanço
  const [idSessao] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());
  const [deveInverterOrdem] = useState(() => idSessao.charCodeAt(0) % 2 === 0);

  const [etapaExperimento, setEtapaExperimento] = useState<EtapaFluxo>(
    deveInverterOrdem ? "BUSCA_HASH_PRIMEIRO" : "BUSCA_ARRAY_PRIMEIRO"
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todos");
  const [currentSort, setCurrentSort] = useState("relevancia");

  const [temposBusca, setTemposBusca] = useState({ arrayMs: 0, hashMs: 0 });
  const [temposOrdem, setTemposOrdem] = useState({ nativaMs: 0, abbMs: 0 });
  const [temposFiltro, setTemposFiltro] = useState({ linearMs: 0, indexadoMs: 0 });
  
  const [jaFezRodada1Busca, setJaFezRodada1Busca] = useState<boolean>(false);
  const [jaFezRodada1Ordem, setJaFezRodada1Ordem] = useState<boolean>(false);
  const [jaFezRodada1Filtro, setJaFezRodada1Filtro] = useState<boolean>(false);

  // Estrutura de dados acumulados corrigida para o TypeScript parar de reclamar
  const [dadosAcumulados, setDadosAcumulados] = useState<{
    // Busca
    bArrayMs?: string;
    bHashMs?: string;
    bBooleanaNormal?: string;
    bPercepcaoNormal?: number;
    bSatisfacaoNormal?: number;
    bHashMsInvertido?: string;
    bArrayMsInvertido?: string;
    bBooleanaInvertido?: string;
    bPercepcaoInvertido?: number;
    bSatisfacaoInvertido?: number;

    // Ordenação
    oNativaMs?: string;
    oAbbMs?: string;
    oBooleanaNormal?: string;
    oPercepcaoNormal?: number;
    oSatisfacaoNormal?: number;
    oAbbMsInvertido?: string;
    oNativaMsInvertido?: string;
    oBooleanaInvertido?: string;
    oPercepcaoInvertido?: number;
    oSatisfacaoInvertido?: number;

    // Filtragem
    fLinearMs?: string;
    fIndexadoMs?: string;
    fBooleanaNormal?: string;
    fPercepcaoNormal?: number;
    fSatisfacaoNormal?: number;
    fIndexadoMsInvertido?: string;
    fLinearMsInvertido?: string;
  }>({});

  const TEMPO_MINIMO_SPINNER = 400;

  // Função interna para sanitizar a anomalia de formatação de pontos no Google Sheets
  const formatarTempoSeguro = (tempoMs: number): string => {
    const tempoTratado = tempoMs < 0.01 ? 0.01 : tempoMs;
    return tempoTratado.toFixed(4);
  };

  const rodarTelemetria = (acaoAlgoritmo: () => void) => {
    setIsLoading(true);
    setTimeout(() => {
      acaoAlgoritmo();
      setIsLoading(false);
    }, 400); // 400ms fixos de spinner para o usuário notar a transição
  };

  const checkDispositivo = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "MOBILE" : "DESKTOP";
    }
    return "UNKNOWN";
  };

  const executarBuscaTelemetria = (termo: string) => {
    const termoTratado = termo.toLowerCase().trim();
    let dadosBase = [...ProdutosMocks];

    // 1️⃣ RODADA 1: ARRAY PRIMEIRO (Digita 299999)
    if (etapaExperimento === "BUSCA_ARRAY_PRIMEIRO" && termoTratado.includes("299999")) {
      rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => buscarNoArray(dadosBase, termoTratado));
        setTemposBusca(prev => ({ ...prev, arrayMs: tempoMs }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("BUSCA_HASH_SEGUNDO");
      });
    } 
    // 2️⃣ RODADA 1: HASH SEGUNDO (Digita 300000)
    else if (etapaExperimento === "BUSCA_HASH_SEGUNDO" && termoTratado.includes("300000")) {
      rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => buscarNaHashTable(dadosBase, termoTratado));
        setTemposBusca(prev => ({ ...prev, hashMs: tempoMs }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("AVALIACAO_BUSCA");
      });
    }
  
  // 3️⃣ RODADA 2 (INVERTIDA): HASH PRIMEIRO (Digita 300000)
    else if (etapaExperimento === "BUSCA_HASH_PRIMEIRO" && termoTratado.includes("300000")) {
      rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => buscarNaHashTable(dadosBase, termoTratado));
        setDadosAcumulados(prev => ({ ...prev, bHashMsInvertido: formatarTempoSeguro(tempoMs) }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("BUSCA_ARRAY_SEGUNDO");
      });
    }
    // 4️⃣ RODADA 2 (INVERTIDA): ARRAY SEGUNDO (Digita 299999)
    else if (etapaExperimento === "BUSCA_ARRAY_SEGUNDO" && termoTratado.includes("299999")) {
     rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => buscarNoArray(dadosBase, termoTratado));
        setDadosAcumulados(prev => ({ ...prev, bArrayMsInvertido: formatarTempoSeguro(tempoMs) }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("AVALIACAO_BUSCA");
        setTimeout(() => setIsPopupOpen(true), 600);
      });
    }
    
    // Travas originais de digitação
    else if (!["BUSCA_ARRAY_PRIMEIRO", "BUSCA_HASH_SEGUNDO", "BUSCA_HASH_PRIMEIRO", "BUSCA_ARRAY_SEGUNDO"].includes(etapaExperimento)) {
      setTermoBusca(termoTratado);
    } else {
      const precisaDe299 = ["BUSCA_ARRAY_PRIMEIRO", "BUSCA_ARRAY_SEGUNDO"].includes(etapaExperimento);
      alert(precisaDe299 ? "Por favor, busque pelo código: 299999" : "Por favor, busque pelo código: 300000");
    }
  };

  const executarOrdenacaoTelemetria = (sortOption: string) => {
    // --- RODADA 1: NATIVA PRIMEIRO -> ABB SEGUNDO ---
    if (etapaExperimento === "ORDEM_NATIVA_PRIMEIRO") {
      rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => [...ProdutosMocks].sort((a, b) => Number(a.preco) - Number(b.preco)));
        setTemposOrdem(prev => ({ ...prev, nativaMs: tempoMs }));
        setCurrentSort(sortOption);
        setEtapaExperimento("ORDEM_ABB_SEGUNDO");
      });
    } 
    else if (etapaExperimento === "ORDEM_ABB_SEGUNDO") {
      rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => {
          const dadosEmbaralhar = embaralharProdutosDeterministico([...ProdutosMocks]);
          const abb = new ArvoreBinariaBusca(sortOption === "preco-crescente" ? "crescente" : "decrescente");
          dadosEmbaralhar.forEach(p => abb.inserir(p));
          abb.getProdutosOrdenados();
        });
        setTemposOrdem(prev => ({ ...prev, abbMs: tempoMs }));
        setCurrentSort(sortOption);
        setEtapaExperimento("AVALIACAO_ORDENACAO");
        setTimeout(() => setIsPopupOpen(true), 600);
      });
    } 

    // --- RODADA 2 (INVERTIDA): ABB PRIMEIRO -> NATIVA SEGUNDO ---
    else if (etapaExperimento === "ORDEM_ABB_PRIMEIRO") {
     rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => {
          const dadosEmbaralhar = embaralharProdutosDeterministico([...ProdutosMocks]);
          const abb = new ArvoreBinariaBusca(sortOption === "preco-crescente" ? "crescente" : "decrescente");
          dadosEmbaralhar.forEach(p => abb.inserir(p));
          abb.getProdutosOrdenados();
        });
        setDadosAcumulados(prev => ({ ...prev, oAbbMsInvertido: formatarTempoSeguro(tempoMs) }));
        setCurrentSort(sortOption);
        setEtapaExperimento("ORDEM_NATIVA_SEGUNDO");
      });
    }
    else if (etapaExperimento === "ORDEM_NATIVA_SEGUNDO") {
      rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => [...ProdutosMocks].sort((a, b) => Number(a.preco) - Number(b.preco)));
        setDadosAcumulados(prev => ({ ...prev, oNativaMsInvertido: formatarTempoSeguro(tempoMs) }));
        setCurrentSort(sortOption);
        setEtapaExperimento("AVALIACAO_ORDENACAO");
        setTimeout(() => setIsPopupOpen(true), 600);
      });
    } else {
      setCurrentSort(sortOption);
    }
  };

  const executarFiltragemTelemetria = (categoria: string) => {
    if (categoria === "todos") return;
    
    // --- RODADA 1: LINEAR PRIMEIRO -> INDEXADO SEGUNDO ---
    if (etapaExperimento === "FILTRO_LINEAR_PRIMEIRO") {
      rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => filtrarPorCategoriaLinear([...ProdutosMocks], categoria));
        setTemposFiltro(prev => ({ ...prev, linearMs: tempoMs }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("FILTRO_INDEXADO_SEGUNDO");
      });
    }
    else if (etapaExperimento === "FILTRO_INDEXADO_SEGUNDO") {
     rodarTelemetria(() => {
        const t0 = performance.now();
        // Operação O(1) indexada aqui
        const t1 = performance.now();
        setTemposFiltro(prev => ({ ...prev, indexadoMs: t1 - t0 }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("AVALIACAO_FILTRAGEM");
        setTimeout(() => setIsPopupOpen(true), 600);
      });
    }

    // --- RODADA 2 (INVERTIDA): INDEXADO PRIMEIRO -> LINEAR SEGUNDO ---
    else if (etapaExperimento === "FILTRO_INDEXADO_PRIMEIRO") {
      rodarTelemetria(() => {
        const t0 = performance.now();
        // Operação O(1) indexada aqui
        const t1 = performance.now();
        setDadosAcumulados(prev => ({ ...prev, fIndexadoMsInvertido: formatarTempoSeguro(t1 - t0) }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("FILTRO_LINEAR_SEGUNDO");
      });
    }
    else if (etapaExperimento === "FILTRO_LINEAR_SEGUNDO") {
      rodarTelemetria(() => {
        const { tempoMs } = medirTempo(() => filtrarPorCategoriaLinear([...ProdutosMocks], categoria));
        setDadosAcumulados(prev => ({ ...prev, fLinearMsInvertido: formatarTempoSeguro(tempoMs) }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("AVALIACAO_FILTRAGEM");
        setTimeout(() => setIsPopupOpen(true), 600);
      });
    } else {
      setCategoriaSelecionada(categoria);
    }
  };

  const salvarRespostaExperimento = async (respostas: (number | string)[]) => {
    const votoBooleano = respostas[0].toString();
    const notaPercepcao = Number(respostas[1]);
    const notaSatisfacao = Number(respostas[2]);

    if (etapaExperimento === "AVALIACAO_BUSCA") {
      if (!jaFezRodada1Busca) {
        // 💾 Salva os dados coletados na Rodada 1 (Normal)
        setDadosAcumulados(prev => ({
          ...prev,
          bArrayMs: formatarTempoSeguro(temposBusca.arrayMs),
          bHashMs: formatarTempoSeguro(temposBusca.hashMs),
          bBooleanaNormal: votoBooleano,
          bPercepcaoNormal: notaPercepcao,
          bSatisfacaoNormal: notaSatisfacao,
        }));

        setIsPopupOpen(false);
        setTermoBusca("");
        setJaFezRodada1Busca(true); // Bloqueia a repetição
        setEtapaExperimento("BUSCA_HASH_PRIMEIRO"); // 🔄 Força o início imediato da rodada invertida
      } else {
        // 💾 Salva os dados coletados na Rodada 2 (Invertida)
        setDadosAcumulados(prev => ({
          ...prev,
          bBooleanaInvertido: votoBooleano,
          bPercepcaoInvertido: notaPercepcao,
          bSatisfacaoInvertido: notaSatisfacao,
        }));

        setIsPopupOpen(false);
        setTermoBusca("");
        setEtapaExperimento("ORDEM_NATIVA_PRIMEIRO"); // ➡️ Agora sim, avança para o cenário de Ordenação
      }
    }

    else if (etapaExperimento === "AVALIACAO_ORDENACAO") {
      if (!jaFezRodada1Ordem) {
        setDadosAcumulados(prev => ({
          ...prev,
          oNativaMs: formatarTempoSeguro(temposOrdem.nativaMs),
          oAbbMs: formatarTempoSeguro(temposOrdem.abbMs),
          oBooleanaNormal: votoBooleano,
          oPercepcaoNormal: notaPercepcao,
          oSatisfacaoNormal: notaSatisfacao,
        }));
        setIsPopupOpen(false);
        setJaFezRodada1Ordem(true);
        setEtapaExperimento("ORDEM_ABB_PRIMEIRO"); // Inverte Ordenação
      } else {
        setDadosAcumulados(prev => ({
          ...prev,
          oBooleanaInvertido: votoBooleano,
          oPercepcaoInvertido: notaPercepcao,
          oSatisfacaoInvertido: notaSatisfacao,
        }));
        setIsPopupOpen(false);
        setEtapaExperimento("FILTRO_LINEAR_PRIMEIRO"); // Avança para Filtragem
      }
    }

    else if (etapaExperimento === "AVALIACAO_FILTRAGEM") {
      if (!jaFezRodada1Filtro) {
        setDadosAcumulados(prev => ({
          ...prev,
          fLinearMs: formatarTempoSeguro(temposFiltro.linearMs),
          fIndexadoMs: formatarTempoSeguro(temposFiltro.indexadoMs),
          fBooleanaNormal: votoBooleano,
          fPercepcaoNormal: notaPercepcao,
          fSatisfacaoNormal: notaSatisfacao,
        }));
        setIsPopupOpen(false);
        setJaFezRodada1Filtro(true);
        setEtapaExperimento("FILTRO_INDEXADO_PRIMEIRO"); // Inverte Filtragem
      } else {
        setIsPopupOpen(false);
        setIsLoading(true);

        // Envia os dados unificados preservando o passo a passo original do formulário
        await enviarExperimento({
          idUsuario: idSessao,
          dispositivo: checkDispositivo(),

          // 🔍 BUSCA
          bArrayNormal: dadosAcumulados.bArrayMs ?? "",
          bHashNormal: dadosAcumulados.bHashMs ?? "",
          bEscolhaNormal: dadosAcumulados.bBooleanaNormal ?? "",
          bPercepcaoNormal: (dadosAcumulados.bPercepcaoNormal ?? 0).toString(),
          bSatisfacaoNormal: (dadosAcumulados.bSatisfacaoNormal ?? 0).toString(),
          bHashInvertido: dadosAcumulados.bHashMsInvertido ?? "",
          bArrayInvertido: dadosAcumulados.bArrayMsInvertido ?? "",
          bEscolhaInvertido: dadosAcumulados.bBooleanaInvertido ?? "",
          bPercepcaoInvertido: (dadosAcumulados.bPercepcaoInvertido ?? 0).toString(),
          bSatisfacaoInvertido: (dadosAcumulados.bSatisfacaoInvertido ?? 0).toString(),

          // 📊 ORDENAÇÃO
          oNativoNormal: dadosAcumulados.oNativaMs ?? "",
          oAbbNormal: dadosAcumulados.oAbbMs ?? "",
          oEscolhaNormal: dadosAcumulados.oBooleanaNormal ?? "",
          oPercepcaoNormal: (dadosAcumulados.oPercepcaoNormal ?? 0).toString(),
          oSatisfacaoNormal: (dadosAcumulados.oSatisfacaoNormal ?? 0).toString(),
          oAbbInvertido: dadosAcumulados.oAbbMsInvertido ?? "",
          oNativoInvertido: dadosAcumulados.oNativaMsInvertido ?? "",
          oEscolhaInvertido: dadosAcumulados.oBooleanaInvertido ?? "",
          oPercepcaoInvertido: (dadosAcumulados.oPercepcaoInvertido ?? 0).toString(),
          oSatisfacaoInvertido: (dadosAcumulados.oSatisfacaoInvertido ?? 0).toString(),

          // 🧪 FILTRAGEM (Pega do acumulador o normal, e o invertido direto das variáveis locais do modal atual)
          fLinearNormal: dadosAcumulados.fLinearMs ?? "",
          fIndexadoNormal: dadosAcumulados.fIndexadoMs ?? "",
          fEscolhaNormal: dadosAcumulados.fBooleanaNormal ?? "",
          fPercepcaoNormal: (dadosAcumulados.fPercepcaoNormal ?? 0).toString(),
          fSatisfacaoNormal: (dadosAcumulados.fSatisfacaoNormal ?? 0).toString(),
          fIndexadoInvertido: dadosAcumulados.fIndexadoMsInvertido ?? "",
          fLinearInvertido: dadosAcumulados.fLinearMsInvertido ?? "",
          fEscolhaInvertido: votoBooleano,
          fPercepcaoInvertido: notaPercepcao.toString(),
          fSatisfacaoInvertido: notaSatisfacao.toString(),
        });

        setIsLoading(false);
        setCategoriaSelecionada("todos");
        setEtapaExperimento("FIM_EXPERIMENTO");
      }
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
    salvarRespostaLikert: salvarRespostaExperimento
  };
}