// src/components/LikertPopup.tsx

"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface LikertPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pergunta: string;
  onEnviarResposta: (nota: number) => void;
}

export default function LikertPopup({
  isOpen, onClose, pergunta, onEnviarResposta,
} : LikertPopupProps) {

  const [notaSelecionada, setNotaSelecionada] = useState<number | null>(null);
  if(!isOpen) return null;

  const opcoesLikert = [
    { valor: 1, rotulo: "Muito Ruim" },
    { valor: 2, rotulo: "Ruim" },
    { valor: 3, rotulo: "Regular" },
    { valor: 4, rotulo: "Bom" },
    { valor: 5, rotulo: "Muito Bom" },
  ];

  const handleSubmeter = () => {
    if(notaSelecionada !== null) {
      onEnviarResposta(notaSelecionada);
      setNotaSelecionada(null);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      
      {/* Caixa do Pop-up */}
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 relative animate-scale-up">
        
        {/* Botão de Fechar sutil (caso o usuário desista, para não travar a experiência) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar avaliação"
        >
          <X size={18} />
        </button>

        {/* Cabeçalho da Avaliação */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            Avaliação de Interface
          </span>
          <h3 className="text-base font-medium text-gray-900 leading-snug">
            {pergunta}
          </h3>
        </div>

        {/* Escala Likert de 1 a 5 */}
        <div className="flex justify-between items-center gap-2 mb-6">
          {opcoesLikert.map((opcao) => {
            const isSelected = notaSelecionada === opcao.valor;
            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setNotaSelecionada(opcao.valor)}
                className={`w-12 h-12 rounded-full border text-sm font-semibold flex items-center justify-center transition-all duration-150
                  ${isSelected 
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 scale-110" 
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                  }`}
              >
                {opcao.valor}
              </button>
            );
          })}
        </div>

        {/* Legendas das Extremidades */}
        <div className="flex justify-between text-xs text-gray-400 font-medium px-1 -mt-4 mb-6">
          <span>{opcoesLikert[0].rotulo}</span>
          <span>{opcoesLikert[4].rotulo}</span>
        </div>

        {/* Botão de Envio */}
        <button
          onClick={handleSubmeter}
          disabled={notaSelecionada === null}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-center
            ${notaSelecionada !== null
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          Confirmar Avaliação
        </button>

      </div>
    </div>
  );
}