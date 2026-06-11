// src/components/Footer.tsx

"use client";

import { ShieldCheck, CreditCard } from "lucide-react";

export default function Footer() {
  const handleFakeClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return(
   <footer className="w-full bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      
      {/* SEÇÃO SUPERIOR: Links e Informações Simuladas */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Coluna 1: Contato */}
        <div>
          <h3 className="text-white font-semibold mb-3">Atendimento</h3>
          <ul className="space-y-2 text-xs">
            <li><a href="#" onClick={handleFakeClick} className="hover:text-white transition-colors">Central de Ajuda</a></li>
            <li><a href="#" onClick={handleFakeClick} className="hover:text-white transition-colors">Devoluções e Reembolsos</a></li>
            <li><a href="#" onClick={handleFakeClick} className="hover:text-white transition-colors">Como Comprar</a></li>
          </ul>
        </div>

        {/* Coluna 2: Sobre */}
        <div>
          <h3 className="text-white font-semibold mb-3">Institucional</h3>
          <ul className="space-y-2 text-xs">
            <li><a href="#" onClick={handleFakeClick} className="hover:text-white transition-colors">Quem Somos</a></li>
            <li><a href="#" onClick={handleFakeClick} className="hover:text-white transition-colors">Políticas de Privacidade</a></li>
            <li><a href="#" onClick={handleFakeClick} className="hover:text-white transition-colors">Termos de Uso</a></li>
          </ul>
        </div>

        {/* Coluna 3: Pagamento (Simulado) */}
        <div>
          <h3 className="text-white font-semibold mb-3">Formas de Pagamento</h3>
          <div className="flex flex-wrap gap-2 text-slate-500">
            <CreditCard size={24} className="hover:text-white transition-colors cursor-pointer" />
            <div className="text-xs font-bold border border-slate-700 px-1.5 py-0.5 rounded tracking-wider cursor-pointer hover:text-white hover:border-white transition-all">PIX</div>
            <div className="text-xs font-bold border border-slate-700 px-1.5 py-0.5 rounded tracking-wider cursor-pointer hover:text-white hover:border-white transition-all">BOLETO</div>
          </div>
        </div>

        {/* Coluna 4: Segurança (Essencial para passar seriedade) */}
        <div>
          <h3 className="text-white font-semibold mb-3">Segurança</h3>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
            <ShieldCheck size={20} />
            <span>Ambiente 100% Seguro</span>
          </div>
          {/* Redes Sociais Simuladas */}
          <div className="flex gap-3 mt-4 text-slate-500">
          
          </div>
        </div>

      </div>

      {/* SEÇÃO INFERIOR: Direitos Autorais Fictícios */}
      <div className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 AlphaStore. Todos os direitos reservados.</p>
          <p>AlphaStore Comércio Digital Ltda. CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  );
} 