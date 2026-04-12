// Singleton de controle de áudio — vive fora do ciclo React para garantir
// que audio.play() seja chamado diretamente no call stack do gesto do usuário.

import { AUDIO_TRACKS, AUDIO_VOLUME, type AudioTrack } from './tracks';

class AudioManagerClass {
  private elements: Record<AudioTrack, HTMLAudioElement> | null = null;
  private currentTrack: AudioTrack = 'home';

  /** Inicializa os elementos (chamado lazy para evitar criação em SSR/test) */
  private getElements(): Record<AudioTrack, HTMLAudioElement> {
    if (!this.elements) {
      const make = (track: AudioTrack): HTMLAudioElement => {
        const el = new Audio();
        el.loop = true;
        el.volume = AUDIO_VOLUME[track];
        el.preload = 'none';
        // Atribui src apenas se configurado — evita request 404 com string vazia
        if (AUDIO_TRACKS[track]) el.src = AUDIO_TRACKS[track];
        return el;
      };
      this.elements = { home: make('home'), training: make('training') };
    }
    return this.elements;
  }

  /** Troca a faixa ativa. Se estava tocando, pausa a anterior e toca a nova. */
  setTrack(track: AudioTrack) {
    if (this.currentTrack === track) return;
    const els = this.getElements();
    const wasPlaying = !els[this.currentTrack].paused;
    els[this.currentTrack].pause();
    this.currentTrack = track;
    if (wasPlaying) {
      els[track].play().catch(() => {});
    }
  }

  /** Toca a faixa atual. Deve ser chamado DENTRO de um event handler (gesto do usuário). */
  play() {
    const els = this.getElements();
    const src = AUDIO_TRACKS[this.currentTrack];
    if (!src) return; // URLs ainda não configuradas — silencioso
    if (!els[this.currentTrack].src) els[this.currentTrack].src = src;
    els[this.currentTrack].play().catch(() => {});
  }

  pause() {
    if (!this.elements) return;
    this.elements[this.currentTrack].pause();
  }

  isPlaying(): boolean {
    if (!this.elements) return false;
    return !this.elements[this.currentTrack].paused;
  }
}

export const audioManager = new AudioManagerClass();
