// Singleton de controle de áudio — vive fora do ciclo React para garantir
// que audio.play() seja chamado diretamente no call stack do gesto do usuário.

import { AUDIO_TRACKS, AUDIO_VOLUME, type AudioTrack } from './tracks';
import { useCladexStore } from '../store';
import { getCachedSrc } from './cache';

class AudioManagerClass {
  private elements: Record<AudioTrack, HTMLAudioElement> | null = null;
  private currentTrack: AudioTrack = 'home';
  private fadeRaf: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.addPreloadHints();   // hint ao browser para priorizar o fetch
        this.getElements();       // cria elementos e inicia preload HTML
        this.upgradeToCached();   // tenta trocar para blob: URL em background
      }, 0);
    }
  }

  // ── Inicialização ────────────────────────────────────────────────────────────

  /**
   * Injeta <link rel="preload" as="audio"> no <head> para cada faixa.
   * Isso faz o browser dar prioridade ao fetch dessas URLs, melhorando o cache HTTP.
   */
  private addPreloadHints(): void {
    for (const url of Object.values(AUDIO_TRACKS)) {
      if (!url) continue;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'audio';
      link.href = url;
      document.head.appendChild(link);
    }
  }

  /**
   * Tenta buscar as faixas via CORS e armazenar como blob: URL no Cache API.
   * Feito de forma assíncrona em background — não bloqueia a inicialização.
   * Substitui el.src apenas enquanto o elemento estiver pausado.
   */
  private upgradeToCached(): void {
    const els = this.getElements();
    for (const track of Object.keys(AUDIO_TRACKS) as AudioTrack[]) {
      const originalUrl = AUDIO_TRACKS[track];
      if (!originalUrl) continue;
      getCachedSrc(originalUrl).then((src) => {
        if (src === originalUrl) return; // CORS não permitido — mantém URL direta
        const el = els[track];
        if (el.paused && !el.src.startsWith('blob:')) {
          el.src = src;
          el.load();
        }
      });
    }
  }

  /** Inicializa os elementos com preload eager e src direto. */
  private getElements(): Record<AudioTrack, HTMLAudioElement> {
    if (typeof window === 'undefined') {
      throw new Error('AudioManager não pode ser usado em contexto SSR');
    }
    if (!this.elements) {
      const make = (track: AudioTrack): HTMLAudioElement => {
        const el = new Audio();
        el.loop = true;
        el.volume = 0;         // fade-in define o volume ao iniciar
        el.preload = 'auto';   // buffer antecipado
        if (AUDIO_TRACKS[track]) el.src = AUDIO_TRACKS[track];

        // Retry automático em erros de mídia (ex: timeout de rede)
        el.addEventListener('error', () => {
          if (el.paused) setTimeout(() => el.load(), 2000);
        });

        return el;
      };
      this.elements = { home: make('home'), training: make('training') };
    }
    return this.elements;
  }

  // ── Volume ───────────────────────────────────────────────────────────────────

  /** Sobe o volume de 0 → targetVolume ao longo de durationMs via rAF. */
  private fadeIn(el: HTMLAudioElement, targetVolume: number, durationMs = 500): void {
    if (this.fadeRaf !== null) cancelAnimationFrame(this.fadeRaf);
    el.volume = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      el.volume = t * targetVolume;
      if (t < 1) this.fadeRaf = requestAnimationFrame(tick);
      else this.fadeRaf = null;
    };
    this.fadeRaf = requestAnimationFrame(tick);
  }

  // ── API pública ──────────────────────────────────────────────────────────────

  /**
   * Troca a faixa ativa.
   * Usa o estado do store (audioMuted) como fonte de verdade — evita divergência
   * entre estado DOM (paused) e intenção do usuário durante trocas rápidas de página.
   * Inclui retry para erros de mídia (não bloqueia autoplay policy).
   */
  setTrack(track: AudioTrack) {
    if (typeof window === 'undefined') return;
    if (this.currentTrack === track) return;
    const els = this.getElements();
    const shouldPlay = !useCladexStore.getState().audioMuted;
    if (this.fadeRaf !== null) { cancelAnimationFrame(this.fadeRaf); this.fadeRaf = null; }
    els[this.currentTrack].pause();
    els[this.currentTrack].volume = 0;
    this.currentTrack = track;
    if (shouldPlay) {
      const el = els[track];
      const vol = AUDIO_VOLUME[track];
      const attempt = (retries = 2) => {
        el.play()
          .then(() => this.fadeIn(el, vol))
          .catch((e: unknown) => {
            const err = e as DOMException;
            if (err?.name === 'NotAllowedError' || retries === 0) return;
            setTimeout(() => attempt(retries - 1), 800);
          });
      };
      attempt();
    }
  }

  /**
   * Toca a faixa atual com fade-in.
   * Deve ser chamado DENTRO de um event handler (política de autoplay do browser).
   * Retry único em erros de mídia — não tenta novamente em NotAllowedError.
   */
  play() {
    if (typeof window === 'undefined') return;
    const els = this.getElements();
    const track = this.currentTrack;
    const src = AUDIO_TRACKS[track];
    if (!src) return;
    const el = els[track];
    if (!el.src) el.src = src;
    const vol = AUDIO_VOLUME[track];
    el.play()
      .then(() => this.fadeIn(el, vol))
      .catch((e: unknown) => {
        const err = e as DOMException;
        if (err?.name === 'NotAllowedError') return;
        // Erro de mídia — única tentativa extra após buffer
        setTimeout(() => {
          el.play().then(() => this.fadeIn(el, vol)).catch(() => {});
        }, 800);
      });
  }

  pause() {
    if (typeof window === 'undefined' || !this.elements) return;
    if (this.fadeRaf !== null) { cancelAnimationFrame(this.fadeRaf); this.fadeRaf = null; }
    this.elements[this.currentTrack].pause();
    this.elements[this.currentTrack].volume = 0;
  }

  isPlaying(): boolean {
    if (typeof window === 'undefined' || !this.elements) return false;
    return !this.elements[this.currentTrack].paused;
  }
}

export const audioManager = new AudioManagerClass();
