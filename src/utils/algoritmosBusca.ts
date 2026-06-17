import { Products } from "../data/products";

// ESTRUTURA 1: Busca Sequencial em Array - O(n)
export function buscarNoArray(produtos: Products[], termo: string): Products[] {
  console.log("%c[Estrutura 1] Executando Busca Sequencial no Array...", "color: #ef4444");
  const termoMinusculo = termo.toLowerCase().trim();
  return produtos.filter(produto => produto.nome.toLowerCase().includes(termoMinusculo));
}

// ESTRUTURA 2: Busca por Hash Table - O(1)
export function buscarNaHashTable(produtos: Products[], termo: string): Products[] {
  console.log("%c[Estrutura 2] Executando Busca Otimizada em Tabela Hash...", "color: #22c55e");
  const termoMinusculo = termo.toLowerCase().trim();
  
  const hashTable: Record<string, Products[]> = {};
  produtos.forEach(produto => {
    const palavras = produto.nome.toLowerCase().split(" ");
    palavras.forEach(palavra => {
      const chave = palavra.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      if (chave.length > 2) {
        if (!hashTable[chave]) hashTable[chave] = [];
        if (!hashTable[chave].some(p => p.id === produto.id)) hashTable[chave].push(produto);
      }
    });
  });

  return hashTable[termoMinusculo] || [];
}