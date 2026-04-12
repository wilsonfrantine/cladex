// FX Manager — sons de interface via Web Audio API.
// Nenhum arquivo de áudio necessário; todos os sons são sintetizados.
// Verifica fxMuted no store antes de emitir qualquer som.

import { useCladexStore } from '../store';

class FxManagerClass {
  private ctx: AudioContext | null = null;

  /** Cria/resume o AudioContext (SSR-safe; chamado apenas de event handlers). */
  private resume(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private isMuted(): boolean {
    return useCladexStore.getState().fxMuted;
  }

  /**
   * Sintetiza um burst de oscilador com envelope de amplitude e varredura de frequência.
   * @param startAt  tempo AudioContext em segundos
   * @param duration duração total em segundos
   */
  private tone(
    ctx: AudioContext,
    type: OscillatorType,
    freqStart: number,
    freqEnd: number,
    startAt: number,
    duration: number,
    peakGain: number,
    attackSec: number,
    decaySec: number,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startAt);
    if (freqEnd !== freqStart) {
      osc.frequency.linearRampToValueAtTime(freqEnd, startAt + duration);
    }

    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(peakGain, startAt + attackSec);
    gain.gain.linearRampToValueAtTime(0, startAt + attackSec + decaySec);

    osc.start(startAt);
    osc.stop(startAt + duration + 0.01); // tail para evitar clip
  }

  /** Hover sutil em botões — glide quase inaudível */
  hover(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 440, 480, t, 0.08, 0.08, 0.01, 0.07);
  }

  /** Clique em botão — toque mecânico curto */
  click(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'square', 220, 220, t, 0.06, 0.15, 0.005, 0.055);
  }

  /** Drop de card na árvore — thump descendente */
  drop(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 300, 180, t, 0.12, 0.20, 0.005, 0.115);
  }

  /** Resposta correta — arpejo C5-E5-G5 ascendente */
  win(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 523, 523, t,        0.13, 0.25, 0.01, 0.12);
    this.tone(ctx, 'sine', 659, 659, t + 0.12, 0.13, 0.25, 0.01, 0.12);
    this.tone(ctx, 'sine', 784, 784, t + 0.24, 0.13, 0.25, 0.01, 0.12);
  }

  /** Resposta incorreta — buzzer descendente */
  lose(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sawtooth', 200, 100, t, 0.30, 0.18, 0.005, 0.295);
  }

  /** Nova rodada — ping G4 limpo */
  card(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 392, 392, t, 0.10, 0.20, 0.005, 0.095);
  }

  /** Animação inicial da página — tríade C4-E4-G4 suave */
  intro(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 261, 261, t,        0.20, 0.15, 0.02, 0.18);
    this.tone(ctx, 'sine', 330, 330, t + 0.15, 0.20, 0.15, 0.02, 0.18);
    this.tone(ctx, 'sine', 392, 392, t + 0.30, 0.20, 0.15, 0.02, 0.18);
  }
}

export const fxManager = new FxManagerClass();
