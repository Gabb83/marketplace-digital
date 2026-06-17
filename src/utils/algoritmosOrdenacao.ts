// src/utils/algoritmosOrdenacao.ts
import { Products } from "../data/products";

// 1. Definição do Nó da Árvore
class ASNod {
  produto: Products;
  esquerdo: ASNod | null = null;
  direito: ASNod | null = null;

  constructor(produto: Products) {
    this.produto = produto;
  }
}

// 2. Implementação da Árvore Binária de Busca (ABB) Iterativa
export class ArvoreBinariaBusca {
  private raiz: ASNod | null = null;
  private criterio: "crescente" | "decrescente";

  constructor(criterio: "crescente" | "decrescente") {
    this.criterio = criterio;
  }

  // Inserção Iterativa para proteger a Stack contra Stack Overflow
  inserir(produto: Products) {
    const novoNo = new ASNod(produto);
    if (!this.raiz) {
      this.raiz = novoNo;
      return;
    }

    let atual = this.raiz;
    const precoNovo = typeof produto.preco === "string" ? parseFloat(produto.preco) : produto.preco;

    while (true) {
      const precoAtual = typeof atual.produto.preco === "string" ? parseFloat(atual.produto.preco) : atual.produto.preco;

      // Critério de decisão baseado no preço
      if (precoNovo < precoAtual) {
        if (!atual.esquerdo) {
          atual.esquerdo = novoNo;
          break;
        }
        atual = atual.esquerdo;
      } else {
        // Valores iguais ou maiores vão para a direita
        if (!atual.direito) {
          atual.direito = novoNo;
          break;
        }
        atual = atual.direito;
      }
    }
  }

  // Percurso Em-Ordem (In-Order Traversal) Iterativo usando uma Pilha manual
  getProdutosOrdenados(): Products[] {
    const resultado: Products[] = [];
    const pilha: ASNod[] = [];
    let atual = this.raiz;

    while (pilha.length > 0 || atual !== null) {
      while (atual !== null) {
        pilha.push(atual);
        atual = atual.esquerdo;
      }

      atual = pilha.pop()!;
      resultado.push(atual.produto);
      atual = atual.direito;
    }

    // Se o critério for decrescente, basta inverter o resultado Em-Ordem
    if (this.criterio === "decrescente") {
      return resultado.reverse();
    }

    return resultado;
  }
}

// 3. Função Shuffle Determinística (Baseada no ID) para evitar Hydration Mismatch
export function embaralharProdutosDeterministico(produtos: Products[]): Products[] {
  const copia = [...produtos];
  // Embaralha usando uma lógica matemática fixa baseada nos IDs
  for (let i = copia.length - 1; i > 0; i--) {
    const j = (copia[i].id * 31) % (i + 1);
    const temp = copia[i];
    copia[i] = copia[j];
    copia[j] = temp;
  }
  return copia;
}