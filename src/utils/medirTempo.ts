export function medirTempo<T>(callback: () => T) {
  const inicio = performance.now();
  const resultado = callback();
  const fim = performance.now();

  return {
    resultado,
    tempoMs: fim - inicio,
  };
}