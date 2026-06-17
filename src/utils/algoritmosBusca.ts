import { Products } from "../data/products";

export function buscarNoArray(produtos: Products[], termo: string): Products[] {
  const termoMinusculo = termo.toLowerCase().trim();
  if (!termoMinusculo) return produtos;
  
  // Percorre todo o array checando item por item
  return produtos.filter(produto => 
    produto.nome.toLowerCase().includes(termoMinusculo)
  );
}

export function buscarNoHashTable(produtos: Products[], termo: string): Products[] {
  const termoMinusculo = termo.toLowerCase().trim();
  if (!termoMinusculo) return produtos;

  const hashTable: Record<string, Products[]> = {};

  produtos.forEach(produto => {
    // Quebra o nome do produto em palavras para indexar individualmente
    const palavras = produto.nome.toLowerCase().split(" ");
    palavras.forEach(palavra => {
      // Remove caracteres especiais ou pontuações simples se houver
      const chave = palavra.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      if (chave.length > 2) { // ignora conectores pequenos como "de", "em"
        if (!hashTable[chave]) {
          hashTable[chave] = [];
        }
        // Evita duplicar o mesmo produto na mesma chave
        if (!hashTable[chave].some(p => p.id === produto.id)) {
          hashTable[chave].push(produto);
        }
      }
    });
  });

  // Recuperação instantânea O(1) da lista de produtos que contêm aquela palavra exata
  // (Caso o usuário digite um termo composto, pegamos a primeira palavra relevante para o teste)
  const primeiraPalavra = termoMinusculo.split(" ")[0];
  return hashTable[primeiraPalavra] || [];
}

