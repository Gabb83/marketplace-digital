// src/components/LikertPopup.tsx
"use client";

import { useState } from "react";

interface LikertPopupProps {
  isOpen: boolean;
  onEnviarResposta: (nota: number) => void;
}

export default function LikertPopup({ isOpen, onEnviarResposta }: LikertPopupProps) {
  const [notaSelecionada, setNotaSelecionada] = useState<number | null>(null);

  if (!isOpen) return null;

  const opcoesLikert = [
    { valor: 1, rotulo: "A primeira foi MUITO melhor" },
    { valor: 2, rotulo: "A primeira foi um pouco melhor" },
    { valor: 3, rotulo: "Não notei diferença entre as duas" },
    { valor: 4, rotulo: "A segunda foi um pouco melhor" },
    { valor: 5, rotulo: "A segunda foi MUITO melhor" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-100">
        
        <div className="mb-6">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            Análise Comparativa de Desempenho
          </span>
          <h3 className="text-lg font-bold text-gray-900 leading-snug">
            Comparando a primeira busca ("Fone") com a segunda busca ("Mochila"), qual você percebeu ser mais rápida e fluida?
          </h3>
        </div>

        {/* Escala de Opções de Comparação */}
        <div className="flex flex-col gap-3 mb-6">
          {opcoesLikert.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => setNotaSelecionada(opcao.valor)}
              className={`w-full p-3 rounded-lg border text-sm text-left transition-all duration-150 flex items-center gap-4
                ${notaSelecionada === opcao.valor 
                  ? "bg-blue-50 border-blue-600 text-blue-900 font-medium" 
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                ${notaSelecionada === opcao.valor ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-400 border-gray-300"}`}>
                {opcao.valor}
              </span>
              {opcao.rotulo}
            </button>
          ))}
        </div>

        <button
          onClick={() => { if (notaSelecionada !== null) onEnviarResposta(notaSelecionada); }}
          disabled={notaSelecionada === null}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-150
            ${notaSelecionada !== null ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          Enviar Avaliação Científica
        </button>
      </div>
    </div>
  );
}