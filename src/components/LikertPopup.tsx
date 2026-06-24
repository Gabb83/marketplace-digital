// src/components/LikertPopup.tsx
"use client";

import { useState, useEffect } from "react";

interface LikertPopupProps {
  isOpen: boolean;
  onEnviarResposta: (nota: number) => void;
  tituloContexto: string;
}

export default function LikertPopup({ isOpen, onEnviarResposta, tituloContexto }: LikertPopupProps) {
  const [notaSelecionada, setNotaSelecionada] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) setNotaSelecionada(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const opcoesLikert = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-100 flex items-center justify-center p-4 transition-all animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 flex flex-col gap-6">
        
        {/* Cabeçalho Neutro */}
        <div className="text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
            Coleta de Percepção Psicométrica
          </span>
          <h3 className="text-base font-semibold text-gray-800 leading-relaxed px-2">
            {tituloContexto}
          </h3>
        </div>

        {/* Bloco de Escala Horizontal */}
        <div className="flex flex-col gap-2">
          {/* Fileira de Botões Numéricos */}
          <div className="flex justify-between items-center gap-2">
            {opcoesLikert.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => setNotaSelecionada(valor)}
                className={`flex-1 aspect-square sm:h-12 rounded-xl text-base font-semibold border transition-all duration-150 flex items-center justify-center
                  ${notaSelecionada === valor 
                    ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200 scale-105" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 active:scale-95"
                  } cursor-pointer`}
              >
                {valor}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-[11px] font-medium text-gray-400 px-1 pt-1">
            <span>1 (Muito Pior)</span>
            <span>5 (Muito Melhor)</span>
          </div>
        </div>

        <button
          onClick={() => { if (notaSelecionada !== null) onEnviarResposta(notaSelecionada); }}
          disabled={notaSelecionada === null}
          className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150
            ${notaSelecionada !== null 
              ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99] shadow-sm" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            } cursor-pointer`}
        >
          Confirmar e Avançar
        </button>
      </div>
    </div>
  );
}