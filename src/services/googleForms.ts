// src/services/googleForms.ts

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfZVSsHBJcVM2xzvX1pC8xMKpeMAPEaMiZI3ZoLC7zwP_DeCQ/formResponse";

export interface ExperimentoPayload {
  idUsuario: string;
  dispositivo: string;
  ordemInvertida: string; // "SIM" ou "NAO"

  // Busca
  bArray: string;
  bHash: string;
  bEscolha: string;       // "Opção 1" ou "Opção 2"
  bPercepcao: string;
  bSatisfacao: string;

  // Ordenação
  oNativo: string;
  oAbb: string;
  oEscolha: string;       // "Opção 1" ou "Opção 2"
  oPercepcao: string;
  oSatisfacao: string;

  // Filtragem
  fLinear: string;
  fIndexado: string;
  fEscolha: string;       // "Opção 1" ou "Opção 2"
  fPercepcao: string;
  fSatisfacao: string;
}

export async function enviarExperimento(payload: ExperimentoPayload): Promise<void> {
  const formData = new URLSearchParams();

  // Metadados da Sessão
  formData.append("entry.432036167", payload.idUsuario);
  formData.append("entry.314801769", payload.dispositivo);
  // TODO: Substitua o entry abaixo pelo ID da pergunta de controle de ordem no seu Forms
  formData.append("entry.MUDAR_AQUI_ORDEM", payload.ordemInvertida);

  // Cenário 1: Busca
  formData.append("entry.603723243", payload.bArray);
  formData.append("entry.750695508", payload.bHash);
  // TODO: Substitua o entry abaixo pelo ID da pergunta booleana de busca no seu Forms
  formData.append("entry.MUDAR_AQUI_B_ESCOLHA", payload.bEscolha);
  formData.append("entry.62742821", payload.bPercepcao);
  formData.append("entry.1707197018", payload.bSatisfacao);

  // Cenário 2: Ordenação
  formData.append("entry.1706201349", payload.oNativo);
  formData.append("entry.383115611", payload.oAbb);
  // TODO: Substitua o entry abaixo pelo ID da pergunta booleana de ordenação no seu Forms
  formData.append("entry.MUDAR_AQUI_O_ESCOLHA", payload.oEscolha);
  formData.append("entry.1035977829", payload.oPercepcao);
  formData.append("entry.876981547", payload.oSatisfacao);

  // Cenário 3: Filtragem
  formData.append("entry.664100771", payload.fLinear);
  formData.append("entry.432036167", payload.fIndexado);
  // TODO: Substitua o entry abaixo pelo ID da pergunta booleana de filtragem no seu Forms
  formData.append("entry.MUDAR_AQUI_F_ESCOLHA", payload.fEscolha);
  formData.append("entry.314801769", payload.fPercepcao);
  formData.append("entry.603723243", payload.fSatisfacao);

  try {
    await fetch(FORM_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    console.log(
      "%c✓ [Metodologia] Registro unificado com contrabalanço enviado!",
      "color:#22c55e;font-weight:bold;"
    );
  } catch (error) {
    console.error("Falha ao submeter registro:", error);
  }
}