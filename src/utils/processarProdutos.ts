// src/utils/processarProdutos.ts

import { ProdutosMocks } from "@/src/data/products";
import { buscarNoArray, buscarNaHashTable } from "@/src/utils/algoritmosBusca";
import { ArvoreBinariaBusca, embaralharProdutosDeterministico } from "@/src/utils/algoritmosOrdenacao";
import { EtapaFluxo } from "@/src/hooks/useExperimento";

export function obterProdutosProcessados(termoBusca: string, currentCategoria: string, currentSort: string, etapaExperimento: EtapaFluxo) {
  let dados = [...ProdutosMocks];

  if(termoBusca.trim() !== "") {
    if(termoBusca.includes("99999")) {
      dados = buscarNoArray(dados, termoBusca);
    } else {
      dados = buscarNaHashTable(dados, termoBusca);
    }
  }

  if(currentCategoria !== "todos") {
    dados = dados.filter((p) => p.categoria === currentCategoria);
  }

  const criterio = currentSort === "preco-crescente" ? "crescente" : "decrescente";
  if(currentSort !== "relevancia") {
    if(etapaExperimento === "FIM_EXPERIMENTO") {
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