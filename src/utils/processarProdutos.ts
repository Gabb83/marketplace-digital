// src/utils/processarProdutos.ts
import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";
import { ArvoreBinariaBusca, embaralharProdutosDeterministico } from "@/src/utils/algoritmosOrdenacao";
import { filtrarPorCategoriaLinear, IndexadorCategorias } from "@/src/utils/algoritmosFiltro";
import { EtapaFluxo } from "@/src/hooks/useExperimento";

// Cache global para o indexador
let instanciaIndexador: IndexadorCategorias | null = null;

function obterIndexador(): IndexadorCategorias {
  if (!instanciaIndexador) {
    // Garante que os 100k mocks já estão gerados antes de indexar
    instanciaIndexador = new IndexadorCategorias(ProdutosMocks);
  }
  return instanciaIndexador;
}

export function obterProdutosProcessados(
  termoBusca: string, 
  currentCategoria: string, 
  currentSort: string, 
  etapaExperimento: EtapaFluxo
) {
  // 1. DETERMINAR A BASE DE DADOS FILTRADA POR CATEGORIA PRIMEIRO
  let dados: any[] = [];

  if (currentCategoria !== "todos") {
    // Se for o cenário indexado (O(1)) ou fim do experimento, usa o mapa
    if (etapaExperimento === "FILTRO_INDEXADO_PRIMEIRO" || etapaExperimento === "FILTRO_INDEXADO_SEGUNDO" || etapaExperimento === "FIM_EXPERIMENTO") {
      const indexador = obterIndexador();
      dados = [...indexador.obterProdutosFiltrados(currentCategoria)];
    } else {
      // Caso contrário, roda a varredura linear O(n) clonando a base global
      dados = filtrarPorCategoriaLinear([...ProdutosMocks], currentCategoria);
    }
  } else {
    dados = [...ProdutosMocks];
  }

  // 2. APLICAR A BUSCA SOBRE OS DADOS JÁ FILTRADOS
  if (termoBusca.trim() !== "") {
    if (termoBusca.includes("99999")) {
      dados = buscarNoArray(dados, termoBusca);
    } else {
      dados = buscarNaHashTable(dados, termoBusca);
    }
  }

  // 3. APLICAR A ORDENAÇÃO POR ÚLTIMO
  const criterio = currentSort === "preco-crescente" ? "crescente" : "decrescente";
  if (currentSort !== "relevancia") {
    if (etapaExperimento === "FIM_EXPERIMENTO") {
      const dadosEmbaralhar = embaralharProdutosDeterministico(dados);
      const abb = new ArvoreBinariaBusca(criterio);
      dadosEmbaralhar.forEach(p => abb.inserir(p));
      dados = abb.getProdutosOrdenados();
    } else {
      dados.sort((a, b) => {
        const precoA = typeof a.preco === "string" ? parseFloat(a.preco) : a.preco;
        const precoB = typeof b.preco === "string" ? parseFloat(b.preco) : b.preco;
        return criterio === "crescente" ? precoA - precoB : precoB - precoA;
      });
    }
  } else {
    dados.sort((a, b) => b.avaliacao - a.avaliacao);
  }

  return dados;
}