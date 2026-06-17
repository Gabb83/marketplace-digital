// src/utils/algoritmosBusca.ts
import { Products } from "../data/products";

// ESTRUTURA 1: Busca Sequencial em Array - O(n)
export function buscarNoArray(produtos: Products[], termo: string): Products[] {
  const t0 = performance.now();
  
  const termoMinusculo = termo.toLowerCase().trim();
  const resultado = produtos.filter(produto => produto.nome.toLowerCase().includes(termoMinusculo));
  
  const t1 = performance.now();
  console.log(`%c[Array O(n)] Varredura linear levou ${(t1 - t0).toFixed(2)} ms para 100k itens.`, "color: #ef4444; font-weight: bold;");
  return resultado;
}

// Singleton na memória heap para construir a Hash Table apenas uma vez na inicialização do cliente
let cacheHashTable: Record<string, Products[]> | null = null;

function construirHashTableSingleton(produtos: Products[]): Record<string, Products[]> {
  if (cacheHashTable) return cacheHashTable;

  console.log("[Científico] Indexando 100.000 itens na Tabela Hash em background...");
  const hashTable: Record<string, Products[]> = {};
  
  produtos.forEach(produto => {
    const palavras = produto.nome.toLowerCase().split(" ");
    palavras.forEach(palavra => {
      const chave = palavra.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      if (chave.length > 2) {
        if (!hashTable[chave]) hashTable[chave] = [];
        hashTable[chave].push(produto);
      }
    });
  });

  cacheHashTable = hashTable;
  return cacheHashTable;
}

// ESTRUTURA 2: Busca por Hash Table - O(1) de recuperação
export function buscarNaHashTable(produtos: Products[], termo: string): Products[] {
  // Garante a tabela indexada na memória
  const tabela = construirHashTableSingleton(produtos);
  
  const t0 = performance.now();
  
  const termoMinusculo = termo.toLowerCase().trim();
  // Busca direta por chave (Complexidade Constante)
  const resultado = tabela[termoMinusculo] || [];
  
  const t1 = performance.now();
  console.log(`%c[Hash Table O(1)] Acesso direto à chave levou ${(t1 - t0).toFixed(2)} ms.`, "color: #22c55e; font-weight: bold;");
  return resultado;
}