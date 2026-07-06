// src/services/googleForms.ts

// 🟢 Atualizado com o ID correto extraído do seu novo link do Forms
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc_8EyhTXODCIRI0uTtazLIxPIBoNB3NL3wPaemMZsYLjokMQ/formResponse";

export interface ExperimentoPayload {
  idUsuario: string;
  dispositivo: string;

  // --- BUSCA (Rodada Normal) ---
  bArrayNormal: string;
  bHashNormal: string;
  bEscolhaNormal: string;       
  bPercepcaoNormal: string;
  bSatisfacaoNormal: string;

  // --- BUSCA (Rodada Invertida) ---
  bHashInvertido: string;
  bArrayInvertido: string;
  bEscolhaInvertido: string;
  bPercepcaoInvertido: string;
  bSatisfacaoInvertido: string;

  // --- ORDENAÇÃO (Rodada Normal) ---
  oNativoNormal: string;
  oAbbNormal: string;
  oEscolhaNormal: string;       
  oPercepcaoNormal: string;
  oSatisfacaoNormal: string;

  // --- ORDENAÇÃO (Rodada Invertida) ---
  oAbbInvertido: string;
  oNativoInvertido: string;
  oEscolhaInvertido: string;
  oPercepcaoInvertido: string;
  oSatisfacaoInvertido: string;

  // --- FILTRAGEM (Rodada Normal) ---
  fLinearNormal: string;
  fIndexadoNormal: string;
  fEscolhaNormal: string;       
  fPercepcaoNormal: string;
  fSatisfacaoNormal: string;

  // --- FILTRAGEM (Rodada Invertida) ---
  fIndexadoInvertido: string;
  fLinearInvertido: string;
  fEscolhaInvertido: string;
  fPercepcaoInvertido: string;
  fSatisfacaoInvertido: string;
}

export async function enviarExperimento(payload: ExperimentoPayload): Promise<void> {
  const formData = new URLSearchParams();

  // 🆔 Metadados de Sessão
  formData.append("entry.1004449915", payload.idUsuario);
  formData.append("entry.30831150", payload.dispositivo);

  // 🔍 1. CENÁRIO: BUSCA (Normal: Array -> Hash)
  formData.append("entry.1384659800", payload.bArrayNormal);
  formData.append("entry.161702586", payload.bHashNormal);
  formData.append("entry.1016776952", payload.bEscolhaNormal);
  formData.append("entry.1730089306", payload.bPercepcaoNormal);
  formData.append("entry.1297558469", payload.bSatisfacaoNormal);

  // 🔄 1. CENÁRIO: BUSCA (Invertido: Hash -> Array)
  formData.append("entry.102219856", payload.bHashInvertido);
  formData.append("entry.2078441541", payload.bArrayInvertido);
  formData.append("entry.723338587", payload.bEscolhaInvertido);
  formData.append("entry.1633080829", payload.bPercepcaoInvertido);
  formData.append("entry.1587088634", payload.bSatisfacaoInvertido);

  // 📊 2. CENÁRIO: ORDENAÇÃO (Normal: Nativo -> ABB)
  formData.append("entry.1244314947", payload.oNativoNormal);
  formData.append("entry.488413473", payload.oAbbNormal);
  formData.append("entry.972474757", payload.oEscolhaNormal);
  formData.append("entry.1662860604", payload.oPercepcaoNormal);
  formData.append("entry.1136995809", payload.oSatisfacaoNormal);

  // 🔄 2. CENÁRIO: ORDENAÇÃO (Invertido: ABB -> Nativo)
  formData.append("entry.1937336175", payload.oAbbInvertido);
  formData.append("entry.513358142", payload.oNativoInvertido);
  formData.append("entry.1227101861", payload.oEscolhaInvertido);
  formData.append("entry.2002714982", payload.oPercepcaoInvertido);
  formData.append("entry.119549211", payload.oSatisfacaoInvertido);

  // 🧪 3. CENÁRIO: FILTRAGEM (Normal: Linear -> Indexado)
  formData.append("entry.242961274", payload.fLinearNormal);
  formData.append("entry.678618659", payload.fIndexadoNormal);
  formData.append("entry.223026774", payload.fEscolhaNormal);
  formData.append("entry.53003409", payload.fPercepcaoNormal);
  formData.append("entry.1497616605", payload.fSatisfacaoNormal);

  // 🔄 3. CENÁRIO: FILTRAGEM (Invertido: Indexado -> Linear)
  formData.append("entry.391119657", payload.fIndexadoInvertido);
  formData.append("entry.1272119566", payload.fLinearInvertido);
  formData.append("entry.1887765282", payload.fEscolhaInvertido);
  formData.append("entry.1767081094", payload.fPercepcaoInvertido);
  formData.append("entry.273894599", payload.fSatisfacaoInvertido);

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
      "%c✓ [TCC - Telemetria] Todos os dados (Normais + Invertidos) consolidados com sucesso no Forms!",
      "color:#22c55e;font-weight:bold;font-size:12px;"
    );
  } catch (error) {
    console.error("Falha ao submeter registro para o Google Forms:", error);
  }
}