// Singleton de controle de áudio — vive fora do ciclo React para garantir
// que audio.play() seja chamado diretamente no call stack do gesto do usuário.

import { AUDIO_TRACKS, AUDIO_VOLUME, type AudioTrack } from './tracks';

class AudioManagerClass {
  private elements: Record<AudioTrack, HTMLAudioElement> | null = null;
  private currentTrack: AudioTrack = 'home';
  private fadeRaf: number | null = null;

  constructor() {
    // Preload eager no browser — reduz latência ao primeiro play
    if (typeof window !== 'undefined') setTimeout(() => this.getElements(), 0);
  }

  /** Inicializa os elementos (guarda SSR) */
  private getElements(): Record<AudioTrack, HTMLAudioElement> {
    if (typeof window === 'undefined') {
      throw new Error('AudioManager não pode ser usado em contexto SSR');
    }
    if (!this.elements) {
      const make = (track: AudioTrack): HTMLAudioElement => {
        const el = new Audio();
        el.loop = true;
        el.volume = 0;         // fade-in define o volume ao iniciar
        el.preload = 'auto';   // preload eager para buffer antecipado
        if (AUDIO_TRACKS[track]) el.src = AUDIO_TRACKS[track];
        return el;
      };
      this.elements = { home: make('home'), training: make('training') };
    }
    return this.elements;
  }

  /** Sobe o volume de 0 → targetVolume ao longo de durationMs via rAF */
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

  /** Troca a faixa ativa. Se estava tocando, pausa a anterior e toca a nova com fade-in. */
  setTrack(track: AudioTrack) {
    if (typeof window === 'undefined') return;
    if (this.currentTrack === track) return;
    const els = this.getElements();
    const wasPlaying = !els[this.currentTrack].paused;
    if (this.fadeRaf !== null) { cancelAnimationFrame(this.fadeRaf); this.fadeRaf = null; }
    els[this.currentTrack].pause();
    els[this.currentTrack].volume = 0;
    this.currentTrack = track;
    if (wasPlaying) {
      els[track].play()
        .then(() => this.fadeIn(els[track], AUDIO_VOLUME[track]))
        .catch(() => {});
    }
  }

  /** Toca a faixa atual com fade-in. Deve ser chamado DENTRO de um event handler. */
  play() {
    if (typeof window === 'undefined') return;
    const els = this.getElements();
    const src = AUDIO_TRACKS[this.currentTrack];
    if (!src) return;
    if (!els[this.currentTrack].src) els[this.currentTrack].src = src;
    els[this.currentTrack].play()
      .then(() => this.fadeIn(els[this.currentTrack], AUDIO_VOLUME[this.currentTrack]))
      .catch(() => {});
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
