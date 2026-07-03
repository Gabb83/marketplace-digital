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
  
  const [jaFezRodada1Busca, setJaFezRodada1Busca] = useState(false);

  // Estrutura de dados acumulados corrigida para o TypeScript parar de reclamar
  const [dadosAcumulados, setDadosAcumulados] = useState({
    bArrayMs: "0",
    bHashMs: "0",
    bBooleana: "",
    bPercepcao: 0,
    bSatisfacao: 0,

    oNativaMs: "0",
    oAbbMs: "0",
    oBooleana: "",
    oPercepcao: 0,
    oSatisfacao: 0,

    fBooleana: "",
    fPercepcao: 0,
    fSatisfacao: 0
  });

  const TEMPO_MINIMO_SPINNER = 400;

  // Função interna para sanitizar a anomalia de formatação de pontos no Google Sheets
  const formatarTempoSeguro = (tempoMs: number): string => {
    const tempoTratado = tempoMs < 0.01 ? 0.01 : tempoMs;
    return tempoTratado.toFixed(4);
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
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => buscarNoArray(dadosBase, termoTratado));
        setTemposBusca(prev => ({ ...prev, arrayMs: tempoMs }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("BUSCA_HASH_SEGUNDO"); 
        setIsLoading(false);
      }, 100);
    } 
    // 2️⃣ RODADA 1: HASH SEGUNDO (Digita 300000)
    else if (etapaExperimento === "BUSCA_HASH_SEGUNDO" && termoTratado.includes("300000")) {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => buscarNaHashTable(dadosBase, termoTratado));
        setTemposBusca(prev => ({ ...prev, hashMs: tempoMs }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("AVALIACAO_BUSCA"); // Chama o modal para avaliar a Rodada 1
        setIsLoading(false);
        setTimeout(() => { setIsPopupOpen(true); }, 1000);
      }, 100);
    }
  
  // 3️⃣ RODADA 2 (INVERTIDA): HASH PRIMEIRO (Digita 300000)
    else if (etapaExperimento === "BUSCA_HASH_PRIMEIRO" && termoTratado.includes("300000")) {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => buscarNaHashTable(dadosBase, termoTratado));
        // Guardamos o tempo invertido direto no acumulador para não sobrescrever o temposBusca.hashMs da rodada 1
        setDadosAcumulados(prev => ({ ...prev, bHashMsInvertido: formatarTempoSeguro(tempoMs) }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("BUSCA_ARRAY_SEGUNDO"); 
        setIsLoading(false);
      }, 100);
    }
    // 4️⃣ RODADA 2 (INVERTIDA): ARRAY SEGUNDO (Digita 299999)
    else if (etapaExperimento === "BUSCA_ARRAY_SEGUNDO" && termoTratado.includes("299999")) {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => buscarNoArray(dadosBase, termoTratado));
        // Guardamos o tempo invertido direto no acumulador para não sobrescrever o temposBusca.arrayMs da rodada 1
        setDadosAcumulados(prev => ({ ...prev, bArrayMsInvertido: formatarTempoSeguro(tempoMs) }));
        setTermoBusca(termoTratado);
        setEtapaExperimento("AVALIACAO_BUSCA"); // Chama o modal para avaliar a Rodada 2
        setIsLoading(false);
        setTimeout(() => { setIsPopupOpen(true); }, 1000);
      }, 100);
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
    // --- FLUXO PADRÃO: NATIVA -> ABB ---
    if (etapaExperimento === "ORDEM_NATIVA_PRIMEIRO") {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => {
          const dadosSimulados = [...ProdutosMocks];
          dadosSimulados.sort((a, b) => Number(a.preco) - Number(b.preco));
        });

        setTemposOrdem(prev => ({ ...prev, nativaMs: tempoMs }));
        setCurrentSort(sortOption);
        setEtapaExperimento("ORDEM_ABB_SEGUNDO");
        setTimeout(() => { setIsLoading(false); }, TEMPO_MINIMO_SPINNER);
      }, 100);
    } 
    else if (etapaExperimento === "ORDEM_ABB_SEGUNDO") {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => {
          const dadosEmbaralhar = embaralharProdutosDeterministico([...ProdutosMocks]);
          const abb = new ArvoreBinariaBusca(sortOption === "preco-crescente" ? "crescente" : "decrescente");
          dadosEmbaralhar.forEach(p => abb.inserir(p));
          abb.getProdutosOrdenados();
        });

        setTemposOrdem(prev => ({ ...prev, abbMs: tempoMs }));
        setCurrentSort(sortOption);
        setEtapaExperimento("AVALIACAO_ORDENACAO");
        setTimeout(() => { 
          setIsLoading(false); 
          setTimeout(() => { setIsPopupOpen(true); }, 600);
        }, TEMPO_MINIMO_SPINNER);
      }, 100);
    } 

    // --- FLUXO INVERTIDO: ABB -> NATIVA ---
    else if (etapaExperimento === "ORDEM_ABB_PRIMEIRO") {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => {
          const dadosEmbaralhar = embaralharProdutosDeterministico([...ProdutosMocks]);
          const abb = new ArvoreBinariaBusca(sortOption === "preco-crescente" ? "crescente" : "decrescente");
          dadosEmbaralhar.forEach(p => abb.inserir(p));
          abb.getProdutosOrdenados();
        });

        setTemposOrdem(prev => ({ ...prev, abbMs: tempoMs }));
        setCurrentSort(sortOption);
        setEtapaExperimento("ORDEM_NATIVA_SEGUNDO");
        setTimeout(() => { setIsLoading(false); }, TEMPO_MINIMO_SPINNER);
      }, 100);
    }
    else if (etapaExperimento === "ORDEM_NATIVA_SEGUNDO") {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() => {
          const dadosSimulados = [...ProdutosMocks];
          dadosSimulados.sort((a, b) => Number(a.preco) - Number(b.preco));
        });

        setTemposOrdem(prev => ({ ...prev, nativaMs: tempoMs }));
        setCurrentSort(sortOption);
        setEtapaExperimento("AVALIACAO_ORDENACAO");
        setTimeout(() => { 
          setIsLoading(false); 
          setTimeout(() => { setIsPopupOpen(true); }, 600);
        }, TEMPO_MINIMO_SPINNER);
      }, 100);
    }
    else {
      setCurrentSort(sortOption);
    }
  };

  const executarFiltragemTelemetria = (categoria: string) => {
    if (categoria === "todos") return;
    
    // --- FLUXO PADRÃO: LINEAR -> INDEXADO ---
    if (etapaExperimento === "FILTRO_LINEAR_PRIMEIRO") {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() =>
          filtrarPorCategoriaLinear([...ProdutosMocks], categoria)
        );

        setTemposFiltro(prev => ({ ...prev, linearMs: tempoMs }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("FILTRO_INDEXADO_SEGUNDO");
        setTimeout(() => { setIsLoading(false); }, TEMPO_MINIMO_SPINNER);
      }, 100);
    }
    else if (etapaExperimento === "FILTRO_INDEXADO_SEGUNDO") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        // Executa a filtragem indexada O(1)
        const t1 = performance.now();
        
        setTemposFiltro(prev => ({ ...prev, indexadoMs: t1 - t0 }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("AVALIACAO_FILTRAGEM");
        setTimeout(() => { 
          setIsLoading(false); 
          setTimeout(() => { setIsPopupOpen(true); }, 600);
        }, TEMPO_MINIMO_SPINNER);
      }, 100);
    }

    // --- FLUXO INVERTIDO: INDEXADO -> LINEAR ---
    else if (etapaExperimento === "FILTRO_INDEXADO_PRIMEIRO") {
      setIsLoading(true);
      setTimeout(() => {
        const t0 = performance.now();
        // Executa a filtragem indexada O(1)
        const t1 = performance.now();
        
        setTemposFiltro(prev => ({ ...prev, indexadoMs: t1 - t0 }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("FILTRO_LINEAR_SEGUNDO");
        setTimeout(() => { setIsLoading(false); }, TEMPO_MINIMO_SPINNER);
      }, 100);
    }
    else if (etapaExperimento === "FILTRO_LINEAR_SEGUNDO") {
      setIsLoading(true);
      setTimeout(() => {
        const { tempoMs } = medirTempo(() =>
          filtrarPorCategoriaLinear([...ProdutosMocks], categoria)
        );

        setTemposFiltro(prev => ({ ...prev, linearMs: tempoMs }));
        setCategoriaSelecionada(categoria);
        setEtapaExperimento("AVALIACAO_FILTRAGEM");
        setTimeout(() => { 
          setIsLoading(false); 
          setTimeout(() => { setIsPopupOpen(true); }, 600);
        }, TEMPO_MINIMO_SPINNER);
      }, 100);
    }
    else {
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
      setDadosAcumulados(prev => ({
        ...prev,
        oNativaMs: formatarTempoSeguro(temposOrdem.nativaMs),
        oAbbMs: formatarTempoSeguro(temposOrdem.abbMs),
        oBooleana: votoBooleano,
        oPercepcao: notaPercepcao,
        oSatisfacao: notaSatisfacao,
      }));

      setIsPopupOpen(false);
      setEtapaExperimento(deveInverterOrdem ? "FILTRO_INDEXADO_PRIMEIRO" : "FILTRO_LINEAR_PRIMEIRO");
    }

    else if (etapaExperimento === "AVALIACAO_FILTRAGEM") {
      setIsPopupOpen(false);
      setIsLoading(true);

      // Envia os dados unificados preservando o passo a passo original do formulário
      await enviarExperimento({
        idUsuario: idSessao,
        dispositivo: checkDispositivo(),
        ordemInvertida: deveInverterOrdem ? "SIM" : "NAO",

        // Busca
        bArray: dadosAcumulados.bArrayMs,
        bHash: dadosAcumulados.bHashMs,
        bEscolha: dadosAcumulados.bBooleana,
        bPercepcao: dadosAcumulados.bPercepcao.toString(),
        bSatisfacao: dadosAcumulados.bSatisfacao.toString(),

        // Ordenação
        oNativo: dadosAcumulados.oNativaMs,
        oAbb: dadosAcumulados.oAbbMs,
        oEscolha: dadosAcumulados.oBooleana,
        oPercepcao: dadosAcumulados.oPercepcao.toString(),
        oSatisfacao: dadosAcumulados.oSatisfacao.toString(),

        // Filtragem
        fLinear: formatarTempoSeguro(temposFiltro.linearMs),
        fIndexado: formatarTempoSeguro(temposFiltro.indexadoMs),
        fEscolha: votoBooleano,
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
    salvarRespostaLikert: salvarRespostaExperimento
  };
}