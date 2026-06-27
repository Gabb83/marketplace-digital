import { Products } from "../data/products";

export function filtrarPorCategoriaLinear(produtos: Products[], categoria: string) {
  if(categoria === "todos") return produtos;

  return produtos.filter(produto => produto.categoria === categoria);
}

export class IndexadorCategorias {
  private mapa: Record<string, Products[]> = {};

  constructor(produtos: Products[]) {
    // Inicializa a categoria global
    this.mapa["todos"] = produtos;
    
    // Agrupa os itens num único passo O(n) executado apenas uma vez na inicialização
    for (let i = 0; i < produtos.length; i++) {
      const p = produtos[i];
      if (!this.mapa[p.categoria]) {
        this.mapa[p.categoria] = [];
      }
      this.mapa[p.categoria].push(p);
    }
  }

  public obterProdutosFiltrados(categoria: string): Products[] {
    return this.mapa[categoria] || [];
  }
}
