// src/components/LikertPopup.tsx
"use client";

import { useState, useEffect } from "react";

export interface PerguntaConfig {
  texto: string;
  legendaMin?: string; // Opcional para não quebrar o modo booleano
  legendaMax?: string; // Opcional para não quebrar o modo booleano
  tipo: "likert" | "booleana";
}

interface LikertPopupProps {
  isOpen: boolean;
  // Agora o callback devolve um array contendo todas as respostas dadas naquela etapa
  onEnviarRespostas: (respostas: (number | string)[]) => void;
  perguntas: PerguntaConfig[];
}

export default function LikertPopup({ isOpen, onEnviarRespostas, perguntas }: LikertPopupProps) {
  const [passo, setPasso] = useState<number>(0);
  const [respostasSalvas, setRespostasSalvas] = useState<(number | string)[]>([]);
  const [respostaAtual, setRespostaAtual] = useState<number | string | null>(null);

  // Reseta o estado interno do modal sempre que ele for aberto para um novo cenário
  useEffect(() => {
    if (isOpen) {
      setPasso(0);
      setRespostasSalvas([]);
      setRespostaAtual(null);
    }
  }, [isOpen]);

  if (!isOpen || perguntas.length === 0) return null;

  const perguntaAtual = perguntas[passo];
  const opcoesLikert = [1, 2, 3, 4, 5];
  const opcoesBooleanas = ["Opção 1", "Opção 2"];

  const handleAvancar = () => {
    if (respostaAtual === null) return;

    // Acumula a resposta dada no passo atual
    const novasRespostas = [...respostasSalvas, respostaAtual];
    setRespostaAtual(null); // Limpa a seleção visual para o próximo passo

    if (passo < perguntas.length - 1) {
      // Se ainda existem perguntas no array, avança o passo interno
      setRespostasSalvas(novasRespostas);
      setPasso(passo + 1);
    } else {
      // Se respondeu a última (Etapa 3 de 3), despacha todas de uma vez para o componente pai
      onEnviarRespostas(novasRespostas);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 flex flex-col gap-6">
        
        {/* Indicador de Progresso Dinâmico */}
        <div className="text-center">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
              Coleta Psicométrica
            </span>
            <span className="text-[12px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
              Etapa {passo + 1} de {perguntas.length}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-800 leading-relaxed px-2 min-h-12 flex items-center justify-center">
            {perguntaAtual.texto}
          </h3>
        </div>

        {/* Renderização Alternada de Interface baseada no Tipo da Pergunta */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            
            {/* MODO LIKERT: Botões Quadrados de 1 a 5 */}
            {perguntaAtual.tipo === "likert" && opcoesLikert.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => setRespostaAtual(valor)}
                className={`flex-1 aspect-square sm:h-12 rounded-xl text-base font-semibold border transition-all duration-150 flex items-center justify-center
                  ${respostaAtual === valor 
                    ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200 scale-105" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 active:scale-95"
                  } cursor-pointer`}
              >
                {valor}
              </button>
            ))}

            {/* MODO BOOLEANO: Dois Botões Largos Horizontais */}
            {perguntaAtual.tipo === "booleana" && opcoesBooleanas.map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setRespostaAtual(opcao)}
                className={`flex-1 py-4 rounded-xl text-sm font-semibold border transition-all duration-150 flex items-center justify-center
                  ${respostaAtual === opcao 
                    ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200 scale-[1.02]" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 active:scale-95"
                  } cursor-pointer`}
              >
                {opcao}
              </button>
            ))}

          </div>

          {/* Legendas inferiores explicativas (renderizadas apenas no modo Likert) */}
          {perguntaAtual.tipo === "likert" && (perguntaAtual.legendaMin || perguntaAtual.legendaMax) && (
            <div className="flex justify-between text-[11px] font-medium text-gray-400 px-1 pt-1">
              <span>{perguntaAtual.legendaMin}</span>
              <span>{perguntaAtual.legendaMax}</span>
            </div>
          )}
        </div>

        {/* Botão de Avançar com Texto Adaptativo */}
        <button
          onClick={handleAvancar}
          disabled={respostaAtual === null}
          className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150
            ${respostaAtual !== null 
              ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99] shadow-sm" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            } cursor-pointer`}
        >
          {passo < perguntas.length - 1 ? "Próxima Pergunta" : "Confirmar e Concluir"}
        </button>
      </div>
    </div>
  );
}