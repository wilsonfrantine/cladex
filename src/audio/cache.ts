/**
 * Cache de faixas de áudio via Cache API + Blob URL.
 *
 * Fluxo:
 *  1. Verifica o Cache API — se encontrar, retorna blob: URL imediato (sem rede).
 *  2. Se não encontrar, faz fetch com CORS. Se bem-sucedido, armazena no cache e
 *     retorna blob: URL.
 *  3. Se CORS não for permitido pelo servidor (erro de rede), retorna a URL
 *     original — o HTMLAudioElement ainda consegue reproduzi-la sem CORS,
 *     porém sem cache de nossa parte.
 *
 * Nota: blob URLs criados aqui vivem enquanto a aba estiver aberta. São usados
 * diretamente como `el.src`, portanto não precisam de revogação manual aqui.
 */

const CACHE_NAME = 'cladex-audio-v1';

export async function getCachedSrc(url: string): Promise<string> {
  if (typeof window === 'undefined' || !('caches' in window)) return url;

  try {
    const cache = await caches.open(CACHE_NAME);

    // Sessão anterior já cacheou?
    const hit = await cache.match(url);
    if (hit) {
      const blob = await hit.blob();
      if (blob.size > 0) return URL.createObjectURL(blob);
    }

    // Busca via CORS e armazena
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return url;

    await cache.put(url, res.clone());
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    // CORS negado ou falha de rede — usa URL direta como fallback
    return url;
  }
}
