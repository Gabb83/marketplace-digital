// src/config/perguntas.ts

import { PerguntaConfig } from "../components/LikertPopup";
import { EtapaFluxo } from "../hooks/useExperimento";

export const PERGUNTAS: Partial<Record<EtapaFluxo, PerguntaConfig[]>> = {
  AVALIACAO_BUSCA: [
    {
      texto: "Qual das duas operações de busca foi mais fluida em tempo de resposta?",
      tipo: "booleana",
    },
    {
      texto: "Em relação à busca que você escolheu como mais fluida, o quão ela foi visivelmente superior em comparação à outra?",
      legendaMin: "1 (Menor Superioridade)",
      legendaMax: "5 (Maior Superioridade)",
      tipo: "likert",
    },
    {
      texto: "Como você avalia o seu nível de satisfação com o tempo de resposta visual ao realizar as buscas?",
      legendaMin: "1 (Muito Insatisfeito)",
      legendaMax: "5 (Muito Satisfeito)",
      tipo: "likert",
    }
  ],

  AVALIACAO_ORDENACAO: [
    {
      texto: "Qual das duas operações de ordenação foi mais fluida em tempo de resposta?",
      tipo: "booleana",
    },
    {
      texto: "Em relação à ordenação que você escolheu como mais fluida, o quão ela foi visivelmente superior em comparação à outra?",
      legendaMin: "1 (Menor Superioridade)",
      legendaMax: "5 (Maior Superioridade)",
      tipo: "likert",
    },
    {
      texto: "Como você avalia o seu nível de satisfação com o tempo de resposta visual ao realizar as ordenações?",
      legendaMin: "1 (Muito Insatisfeito)",
      legendaMax: "5 (Muito Satisfeito)",
      tipo: "likert",
    }
  ],

  AVALIACAO_FILTRAGEM: [
    {
      texto: "Qual das duas operações de filtragem foi mais fluida em tempo de resposta?",
      tipo: "booleana",
    },
    {
      texto: "Em relação à filtragem que você escolheu como mais fluida, o quão ela foi visivelmente superior em comparação à outra?",
      legendaMin: "1 (Menor Superioridade)",
      legendaMax: "5 (Maior Superioridade)",
      tipo: "likert",
    },
    {
      texto: "Como você avalia o seu nível de satisfação com o tempo de resposta visual ao realizar as filtragem?",
      legendaMin: "1 (Muito Insatisfeito)",
      legendaMax: "5 (Muito Satisfeito)",
      tipo: "likert",
    }
  ],
};