import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";

export default function Home() {
  return(
    <div>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">  
        {/* Layout de Duas Colunas (Responsivo: empilha no mobile, divide no desktop) */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* 1. ESPAÇO DA BARRA LATERAL (FILTROS) */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Categorias</h2>
              {/* O componente ou lista de filtros vai entrar aqui */}
              <div className="text-xs text-gray-400 italic">Espaço do Cenário iii</div>
            </div>
          </aside>

          {/* 2. ESPAÇO PRINCIPAL (ORDENAÇÃO + PRODUTOS) */}
          <section className="flex-1">
            {/* Topbar de Ordenação */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
              {/* O botão/select de ordenação vai entrar aqui */}
              <div className="text-xs text-gray-400 italic">Espaço do Cenário ii (Ordenação)</div>
            </div>

            {/* Grid de Cards de Produtos */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              {/* Os produtos vão entrar aqui */}
              <div className="text-xs text-gray-400 italic">Grid de Produtos</div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}