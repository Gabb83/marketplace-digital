// src/components/LikertPopup.tsx
"use client";

import { useState, useEffect } from "react";

export interface PerguntaConfig {
  texto: string;
  legendaMin: string;
  legendaMax: string;
}

interface LikertPopupProps {
  isOpen: boolean;
  onEnviarRespostas: (notaPercepcao: number, notaSatisfacao: number) => void;
  perguntas: PerguntaConfig[];
}

export default function LikertPopup({ isOpen, onEnviarRespostas, perguntas }: LikertPopupProps) {
  const [passo, setPasso] = useState<0 | 1>(0); // 0 = Pergunta 1, 1 = Pergunta 2
  const [notaP1, setNotaP1] = useState<number | null>(null);
  const [notaP2, setNotaP2] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPasso(0);
      setNotaP1(null);
      setNotaP2(null);
    }
  }, [isOpen]);

  if (!isOpen || perguntas.length < 2) return null;

  const perguntaAtual = perguntas[passo];
  const notaAtual = passo === 0 ? notaP1 : notaP2;
  const setNotaAtual = passo === 0 ? setNotaP1 : setNotaP2;

  const opcoesLikert = [1, 2, 3, 4, 5];

  const handleAvancar = () => {
    if (notaAtual === null) return;

    if (passo === 0) {
      // Se está na primeira pergunta, avança para a segunda
      setPasso(1);
    } else {
      // Se já respondeu as duas, envia os dados consolidados para o hook pai
      if (notaP1 !== null && notaP2 !== null) {
        onEnviarRespostas(notaP1, notaP2);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-100 flex items-center justify-center p-4 transition-all animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 flex flex-col gap-6">
        
        {/* Indicador de Progresso */}
        <div className="text-center">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
              Coleta Psicométrica
            </span>
            <span className="text-[12px] bg-purple-50 text-blue-600 px-2 py-0.5 rounded-full">
              Etapa {passo + 1} de 2
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-800 leading-relaxed px-2 min-h-12 flex items-center justify-center">
            {perguntaAtual.texto}
          </h3>
        </div>

        {/* Escala Likert de 1 a 5 */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            {opcoesLikert.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => setNotaAtual(valor)}
                className={`flex-1 aspect-square sm:h-12 rounded-xl text-base font-semibold border transition-all duration-150 flex items-center justify-center
                  ${notaAtual === valor 
                    ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200 scale-105" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 active:scale-95"
                  } cursor-pointer`}
              >
                {valor}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-[11px] font-medium text-gray-400 px-1 pt-1">
            <span>{perguntaAtual.legendaMin}</span>
            <span>{perguntaAtual.legendaMax}</span>
          </div>
        </div>

        <button
          onClick={handleAvancar}
          disabled={notaAtual === null}
          className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150
            ${notaAtual !== null 
              ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99] shadow-sm" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            } cursor-pointer`}
        >
          {passo === 0 ? "Próxima Pergunta" : "Confirmar e Concluir"}
        </button>
      </div>
    </div>
  );
}