// src/data/products.ts

export interface Products {
  id: number;
  nome: string;
  preco: number | string;
  categoria: string;
  avaliacao: number;
  votos: number;
}

// Substantivos e adjetivos para gerar nomes variados
const substantivos = ["Smartphone", "Smartwatch", "Fone de Ouvido", "Mochila", "Camiseta", "Tênis", "Luminária", "Jogo de Panelas", "Bola de Futebol", "Teclado", "Mouse", "Monitor"];
const adjetivos = ["Premium", "Ultra Light", "Pro", "Sport", "Touch", "Wireless", "Impermeável", "Titanium", "Advanced", "Elite", "Ergonômico", "Bluetooth"];
const marcas = ["Alpha", "Beta", "Galaxy", "Delta", "Nexus", "Titan", "Quantum", "Volt"];
const categorias = ["eletronicos", "esportes", "casa", "vestuario"];

function gerarProdutosEmMassa(quantidade: number): Products[] {
  const lista: Products[] = [];
  
  for (let i = 1; i <= quantidade; i++) {
    const sub = substantivos[i % substantivos.length];
    const adj = adjetivos[i % adjetivos.length];
    const marca = marcas[i % marcas.length];
    const cat = categorias[i % categorias.length];
    
    // Fórmulas matemáticas fixas para que o servidor e o cliente gerem os mesmos valores
    const precoCalculado = parseFloat(((i * 17) % 1980 + 20).toFixed(2));
    const avaliacaoCalculada = parseFloat((4.0 + ((i * 3) % 11) * 0.1).toFixed(1));
    
    // Fórmula determinística para gerar número de votos dinâmicos entre 5 e 1500
    const votosCalculados = ((i * 23) % 1495) + 5;

    lista.push({
      id: i,
      nome: `${sub} ${marca} ${adj} Mod. ${i}`,
      preco: precoCalculado,
      categoria: cat,
      avaliacao: avaliacaoCalculada,
      votos: votosCalculados,
    });
  }
  
  return lista;
}

// ALTERE O NÚMERO AQUI PARA INTENSIFICAR O ESTRESSE (Ex: 50000 ou 100000)
export const ProdutosMocks: Products[] = gerarProdutosEmMassa(100000);
console.log(`[Científico] Base de dados massiva inicializada com ${ProdutosMocks.length} produtos.`);