// FX Manager — sons de interface via Web Audio API.
// Sistema tonal baseado em Lá maior (A4=440Hz):
//   tônica  = A4  440Hz  (hover)
//   terça   = C#5 554Hz  (click)
//   quinta  = E4  330Hz  (voltar — oitava abaixo)
//   win     = terça → quinta ascendente
// Verifica fxMuted no store antes de emitir qualquer som.

import { useCladexStore } from '../store';

class FxManagerClass {
  private ctx: AudioContext | null = null;
  private globalHoverActive = false;

  /** Cria/resume o AudioContext (SSR-safe). */
  private resume(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  /**
   * Inicializa o AudioContext dentro de um event handler (gesto do usuário).
   * Chame isso junto ao primeiro play de música para garantir que o contexto
   * FX esteja pronto sem exigir um gesto separado.
   */
  touch(): void {
    this.resume();
  }

  private isMuted(): boolean {
    return useCladexStore.getState().fxMuted;
  }

  /**
   * Burst de oscilador com envelope de amplitude e glide de frequência.
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
    osc.stop(startAt + duration + 0.01);
  }

  // ── Sons tonais (A maior) ──────────────────────────────────────────────────

  /** Tônica A4=440Hz — hover sutil, glide ascendente */
  hover(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 440, 480, t, 0.08, 0.08, 0.01, 0.07);
  }

  /** Terça C#5=554Hz — click, glide sutil, levemente mais curto */
  click(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 554, 590, t, 0.06, 0.10, 0.008, 0.052);
  }

  /** Quinta E4=330Hz — voltar, glide descendente */
  back(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 330, 300, t, 0.08, 0.08, 0.008, 0.072);
  }

  /** Win — terça (C#5=554Hz) seguida da quinta (E5=659Hz) */
  win(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 554, 554, t,       0.10, 0.20, 0.01, 0.09);
    this.tone(ctx, 'sine', 659, 659, t + 0.08, 0.10, 0.20, 0.01, 0.09);
  }

  // ── Sons neutros (sem tonal center fixo) ──────────────────────────────────

  /** Resposta incorreta — buzzer descendente */
  lose(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sawtooth', 200, 100, t, 0.30, 0.14, 0.005, 0.295);
  }

  /** Drop de card na árvore — thump físico descendente */
  drop(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 300, 180, t, 0.12, 0.18, 0.005, 0.115);
  }

  /** Nova rodada — ping A4 limpo (tônica, sem glide) */
  card(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 440, 440, t, 0.08, 0.15, 0.005, 0.075);
  }

  /** Abertura da página — tríade A4→C#5→E5 suave */
  intro(): void {
    if (this.isMuted()) return;
    const ctx = this.resume();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 'sine', 440, 440, t,        0.18, 0.12, 0.02, 0.16);
    this.tone(ctx, 'sine', 554, 554, t + 0.15, 0.18, 0.12, 0.02, 0.16);
    this.tone(ctx, 'sine', 659, 659, t + 0.30, 0.18, 0.12, 0.02, 0.16);
  }

  /**
   * Registra um listener global de hover para todos os elementos interativos.
   * Usa delegação de evento (mouseover) no document — evita adicionar handlers
   * individualmente a cada botão. Deve ser chamado uma única vez na montagem do App.
   *
   * Tracking via relatedTarget: mouseout só limpa lastTarget quando o cursor sai
   * do parent clicável de fato (não apenas migra para um filho dele), prevenindo
   * disparos múltiplos ao mover entre subelementos do mesmo botão.
   *
   * Elementos da árvore (SVG) marcados com data-fx-hover também são cobertos.
   */
  hookGlobalHover(): void {
    if (typeof window === 'undefined' || this.globalHoverActive) return;
    this.globalHoverActive = true;

    const SELECTOR = 'button, a, [role="button"], [data-fx-hover]';
    let lastTarget: Element | null = null;

    document.addEventListener('mouseover', (e) => {
      const el = (e.target as HTMLElement).closest(SELECTOR);
      if (el && el !== lastTarget) {
        lastTarget = el;
        this.hover();
      }
    });

    document.addEventListener('mouseout', (e) => {
      const me = e as MouseEvent;
      const el = (me.target as HTMLElement).closest(SELECTOR);
      if (el !== lastTarget) return;
      // Só limpa se o cursor sair do parent clicável, não de um filho para outro filho
      const rel = me.relatedTarget as Node | null;
      if (!rel || !el.contains(rel)) lastTarget = null;
    });
  }
}

export const fxManager = new FxManagerClass();
