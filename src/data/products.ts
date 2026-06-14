export interface Products {
  id: number;
  nome: string;
  preco: number | string;
  categoria: string;
  avaliacao: number;
  votos: number;
}

export const ProdutosMocks: Products[] = [
  { id: 1, nome: "Smartphone Galaxy Alpha 5G", categoria: "eletronicos", preco: 2499.00, avaliacao: 4.8, votos: 124 },
  { id: 2, nome: "Smartwatch Sport Band v4", categoria: "eletronicos", preco: 399.90, avaliacao: 4.5, votos: 88 },
  { id: 3, nome: "Fone de Ouvido Bluetooth Noise Cancelling", categoria: "eletronicos", preco: 899.00, avaliacao: 4.7, votos: 56 },
  
  { id: 4, nome: "Bola de Futebol Profissional Pro", categoria: "esportes", preco: 149.90, avaliacao: 4.3, votos: 210 },
  { id: 5, nome: "Tênis de Corrida Ultra Light", categoria: "esportes", preco: 450.00, avaliacao: 4.6, votos: 95 },
  { id: 6, nome: "Mochila Impermeável Ergonômica", categoria: "esportes", preco: 289.90, avaliacao: 4.4, votos: 42 },
  
  { id: 7, nome: "Luminária de Mesa LED Touch", categoria: "casa", preco: 119.90, avaliacao: 4.2, votos: 130 },
  { id: 8, nome: "Jogo de Panelas Antiaderente (5pçs)", categoria: "casa", preco: 349.00, avaliacao: 4.7, votos: 74 },
  { id: 9, nome: "Almofada Ortopédica Premium", categoria: "casa", preco: 89.90, avaliacao: 4.1, votos: 19 },
  
  { id: 10, nome: "Camiseta Dry Fit Academia", categoria: "vestuario", preco: 59.90, avaliacao: 4.5, votos: 340 },
  { id: 11, nome: "Jaqueta Corta Vento Streetwear", categoria: "vestuario", preco: 199.00, avaliacao: 4.3, votos: 62 },
  { id: 12, nome: "Kit 3 Meias Esportivas Algodão", categoria: "vestuario", preco: 39.90, avaliacao: 4.8, votos: 512 },
];