// src/services/googleForms.ts

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfZVSsHBJcVM2xzvX1pC8xMKpeMAPEaMiZI3ZoLC7zwP_DeCQ/formResponse";

export interface ExperimentoPayload {
  idUsuario: string;
  dispositivo: string;

  bArray: string;
  bHash: string;
  bPercepcao: string;
  bSatisfacao: string;

  oNativo: string;
  oAbb: string;
  oPercepcao: string;
  oSatisfacao: string;

  fLinear: string;
  fIndexado: string;
  fPercepcao: string;
  fSatisfacao: string;
}

export async function enviarExperimento(payload: ExperimentoPayload): Promise<void> {
  const formData = new URLSearchParams();

  formData.append("entry.432036167", payload.idUsuario);
  formData.append("entry.314801769", payload.dispositivo);

  formData.append("entry.603723243", payload.bArray);
  formData.append("entry.750695508", payload.bHash);
  formData.append("entry.62742821", payload.bPercepcao);
  formData.append("entry.1707197018", payload.bSatisfacao);

  formData.append("entry.1706201349", payload.oNativo);
  formData.append("entry.383115611", payload.oAbb);
  formData.append("entry.1035977829", payload.oPercepcao);
  formData.append("entry.876981547", payload.oSatisfacao);

  formData.append("entry.664100771", payload.fLinear);
  formData.append("entry.432036167", payload.fIndexado);
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
      "%c✓ [Metodologia] Registro unificado enviado!",
      "color:#22c55e;font-weight:bold;"
    );
  } catch (error) {
    console.error("Falha ao submeter registro:", error);
  }
}