import { useRef } from 'react';
import { ArrowLeft, RotateCcw, Share2, Lock } from 'lucide-react';
import { useCladexStore } from '../store';
import type { ExerciseType, AnswerRecord } from '../store';
import { LEVELS, getLevelIndex } from '../utils/levels';

interface ResultsProps { onBack: () => void }

const TYPE_LABELS: Record<ExerciseType, string> = {
  'clade-classification': 'Classificação de Clado',
  'homology-type':        'Tipo de Homologia',
  'character-placement':  'Posicionamento de Caráter',
  'leaf-placement':       'Identificação de Táxon',
  'sister-group':         'Grupo-Irmão',
  'taxon-drag':           'Colecionável',
  'relative-proximity':   'Proximidade',
};

const MODULE_LABELS: Record<string, string> = {
  'annelida':       'Filo Annelida',
  'chordata-basal': 'Filo Chordata Basal',
  'metazoa':        'Reino Metazoa',
  'amniota':        'Clado Amniota',
  'arthropoda':     'Filo Arthropoda',
};

function pct(correct: number, total: number): string {
  if (total === 0) return '—';
  return `${Math.round((correct / total) * 100)}%`;
}

function pctNum(correct: number, total: number): number {
  return total === 0 ? 0 : (correct / total) * 100;
}

// ─── Agrupa answerHistory por data (dia) ─────────────────────────────────────

interface DayStat { label: string; pct: number; total: number }

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildDailyStats(history: AnswerRecord[]): DayStat[] {
  if (!history.length) return [];

  const byDay = new Map<string, { correct: number; total: number }>();
  for (const rec of history) {
    const key = dayKey(rec.ts);
    const cur = byDay.get(key) ?? { correct: 0, total: 0 };
    byDay.set(key, { correct: cur.correct + (rec.correct ? 1 : 0), total: cur.total + 1 });
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, s]) => {
      const [, m, d] = key.split('-');
      return { label: `${d}/${m}`, pct: Math.round((s.correct / s.total) * 100), total: s.total };
    });
}

function buildTodayStats(history: AnswerRecord[]): { correct: number; total: number } {
  const today = dayKey(Date.now());
  const todayRecs = history.filter(r => dayKey(r.ts) === today);
  return {
    correct: todayRecs.filter(r => r.correct).length,
    total: todayRecs.length,
  };
}

// ─── Gráfico SVG de evolução diária ──────────────────────────────────────────

function ProgressChart({ history, theme }: { history: AnswerRecord[]; theme: string }) {
  const days = buildDailyStats(history);
  const light = theme === 'light';
  const gridColor  = light ? '#c8bfb0' : '#3f3f46';
  const labelColor = light ? '#8c7e6a' : '#52525b';
  const dotStroke  = light ? '#f7f3eb' : '#18181b';

  if (days.length < 2) {
    return (
      <div className="flex items-center justify-center h-28 text-zinc-500 text-xs">
        Responda questões em ao menos 2 dias para ver a evolução.
      </div>
    );
  }

  const W = 320; const H = 100; const PAD = { t: 10, r: 12, b: 24, l: 28 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const xStep = days.length > 1 ? iW / (days.length - 1) : iW;
  const toX = (i: number) => PAD.l + i * xStep;
  const toY = (p: number) => PAD.t + iH - (p / 100) * iH;

  const linePath = days.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.pct).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${toX(days.length - 1).toFixed(1)},${(PAD.t + iH).toFixed(1)} L${PAD.l.toFixed(1)},${(PAD.t + iH).toFixed(1)} Z`;

  const avgPct = days.reduce((s, d) => s + d.pct, 0) / days.length;
  const lineColor = avgPct >= 70 ? '#10b981' : avgPct >= 50 ? '#f59e0b' : '#f43f5e';
  const labelStep = Math.ceil(days.length / 6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[50, 70].map(y => (
        <g key={y}>
          <line x1={PAD.l} y1={toY(y)} x2={W - PAD.r} y2={toY(y)}
            stroke={gridColor} strokeWidth="1" strokeDasharray="3 3" />
          <text x={PAD.l - 4} y={toY(y) + 3.5} textAnchor="end"
            fill={labelColor} fontSize="8">{y}%</text>
        </g>
      ))}

      <path d={areaPath} fill={lineColor} fillOpacity="0.12" />
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {days.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.pct)} r="2.5"
          fill={lineColor} stroke={dotStroke} strokeWidth="1.5" />
      ))}

      {days.map((d, i) => i % labelStep === 0 && (
        <text key={i} x={toX(i)} y={H - 4} textAnchor="middle"
          fill={labelColor} fontSize="8">{d.label}</text>
      ))}
    </svg>
  );
}

// ─── Geração do share card em canvas ─────────────────────────────────────────

async function generateShareCard(
  allTimePct: number,
  totalAnswers: number,
  days: DayStat[],
): Promise<Blob> {
  const W = 800; const H = 480;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Fundo
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, W, H);

  // Gradiente sutil no topo
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(16,185,129,0.08)');
  grad.addColorStop(1, 'rgba(9,9,11,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Borda arredondada simulada como overlay recortado (não possível, apenas borda)
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // ── Wordmark ──
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillStyle = '#f4f4f5';
  ctx.fillText('Clade', 48, 68);
  ctx.fillStyle = '#10b981';
  ctx.fillText('X', 48 + ctx.measureText('Clade').width, 68);

  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#52525b';
  ctx.fillText('Filogenia · Biodiversidade', 48, 88);

  // Linha divisória
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(48, 108); ctx.lineTo(W - 48, 108); ctx.stroke();

  // ── Stat principal ──
  const pctStr = totalAnswers === 0 ? '—' : `${Math.round(allTimePct)}%`;
  ctx.font = 'bold 96px system-ui, sans-serif';
  const color = allTimePct >= 70 ? '#10b981' : allTimePct >= 50 ? '#f59e0b' : '#f43f5e';
  ctx.fillStyle = color;
  ctx.fillText(pctStr, 48, 220);

  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#71717a';
  ctx.fillText('de acerto acumulado', 48, 244);
  ctx.fillText(`${totalAnswers} questões respondidas`, 48, 264);

  // ── Gráfico no canvas ──
  if (days.length >= 2) {
    const cX = 48; const cY = 290;
    const cW = W - 96; const cH = 110;

    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#3f3f46';
    ctx.fillText('EVOLUÇÃO DIÁRIA', cX, cY - 10);

    // Grade
    ctx.strokeStyle = '#27272a';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    [50, 70].forEach(yPct => {
      const y = cY + cH - (yPct / 100) * cH;
      ctx.beginPath(); ctx.moveTo(cX, y); ctx.lineTo(cX + cW, y); ctx.stroke();
      ctx.fillStyle = '#3f3f46';
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText(`${yPct}%`, cX - 24, y + 3);
    });
    ctx.setLineDash([]);

    const xStep = cW / (days.length - 1);
    const toX = (i: number) => cX + i * xStep;
    const toY = (p: number) => cY + cH - (p / 100) * cH;

    // Área
    ctx.beginPath();
    days.forEach((d, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(d.pct));
      else ctx.lineTo(toX(i), toY(d.pct));
    });
    ctx.lineTo(toX(days.length - 1), cY + cH);
    ctx.lineTo(cX, cY + cH);
    ctx.closePath();
    ctx.fillStyle = color + '22';
    ctx.fill();

    // Linha
    ctx.beginPath();
    days.forEach((d, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(d.pct));
      else ctx.lineTo(toX(i), toY(d.pct));
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Pontos
    days.forEach((d, i) => {
      ctx.beginPath();
      ctx.arc(toX(i), toY(d.pct), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Labels eixo X (máx 6)
    const labelStep = Math.ceil(days.length / 6);
    ctx.fillStyle = '#52525b';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    days.forEach((d, i) => {
      if (i % labelStep === 0) ctx.fillText(d.label, toX(i), cY + cH + 14);
    });
    ctx.textAlign = 'left';
  }

  // ── Rodapé ──
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#3f3f46';
  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  ctx.fillText(`Gerado em ${dateStr}`, 48, H - 24);
  ctx.textAlign = 'right';
  ctx.fillText('cladex · Laboratório de Zoologia', W - 48, H - 24);
  ctx.textAlign = 'left';

  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
}

// ─── Botão de compartilhamento ────────────────────────────────────────────────

function ShareButton({ allTimePct, totalAnswers, days }: {
  allTimePct: number; totalAnswers: number; days: DayStat[]
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleShare = async () => {
    const btn = btnRef.current;
    if (btn) { btn.disabled = true; btn.textContent = 'Gerando…'; }

    try {
      const blob = await generateShareCard(allTimePct, totalAnswers, days);
      const file = new File([blob], 'cladex-resultados.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Meu desempenho no CladeX' });
      } else {
        // Fallback: download direto
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'cladex-resultados.png'; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      // Usuário cancelou ou erro — sem ação necessária
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = ''; }
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={handleShare}
      className="btn-juicy flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700/20 hover:bg-emerald-700/40 border border-emerald-700/40 text-emerald-400 text-xs font-semibold transition-colors"
    >
      <Share2 size={12} />
      Compartilhar
    </button>
  );
}

// ─── Barra de acurácia ────────────────────────────────────────────────────────

function AccuracyBar({ correct, total }: { correct: number; total: number }) {
  const ratio = total > 0 ? correct / total : 0;
  const color = ratio >= 0.7 ? 'bg-emerald-500' : ratio >= 0.5 ? 'bg-amber-500' : total === 0 ? 'bg-zinc-700' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        {total > 0 && (
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${ratio * 100}%` }} />
        )}
      </div>
      <span className="text-xs font-mono text-zinc-400 w-8 text-right">{pct(correct, total)}</span>
    </div>
  );
}

// ─── Donut grande ─────────────────────────────────────────────────────────────

function DonutBig({ correct, total }: { correct: number; total: number }) {
  const r = 22; const circ = 2 * Math.PI * r;
  const ratio = total > 0 ? correct / total : 0;
  const arc = ratio * circ;
  const color = ratio >= 0.7 ? '#10b981' : ratio >= 0.5 ? '#f59e0b' : total === 0 ? '#3f3f46' : '#f43f5e';
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0 transform -rotate-90">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#27272a" strokeWidth="5" />
      {total > 0 && (
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          className="transition-all duration-700 ease-out" />
      )}
    </svg>
  );
}

// ─── Grade de progressão de níveis ───────────────────────────────────────────

function LevelGrid({ correct, theme }: { correct: number; theme: string }) {
  const currentIdx = getLevelIndex(correct);
  const light = theme === 'light';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,8rem)] gap-2">
      {LEVELS.map((lv, idx) => {
        const isCurrent = idx === currentIdx;
        const isEarned  = idx < currentIdx;
        const isLocked  = idx > currentIdx;

        return (
          <div
            key={lv.label}
            className={`relative flex flex-col items-center text-center gap-2 px-3 py-3 rounded-xl border transition-all
              ${isCurrent
                ? 'bg-zinc-900 border-zinc-700'
                : isEarned
                  ? 'bg-zinc-900/40 border-zinc-800/50'
                  : 'bg-zinc-900/20 border-zinc-800/30'
              }`}
            style={isCurrent
              ? { boxShadow: light ? `0 0 0 2px ${lv.glow}` : `0 0 0 1px ${lv.glow}, 0 0 16px ${lv.glow}` }
              : undefined}
          >
            {/* Ícone */}
            <div
              className={`${isCurrent ? lv.style : isLocked ? 'text-zinc-600' : `${lv.style} opacity-50`}`}
              style={isCurrent && !light ? { filter: `drop-shadow(0 0 6px ${lv.glow})` } : undefined}
            >
              {isLocked
                ? <Lock size={22} strokeWidth={1.8} />
                : <lv.Icon size={22} strokeWidth={1.8} />
              }
            </div>

            {/* Nome */}
            <p className={`text-xs font-semibold leading-tight
              ${isCurrent ? lv.style : isEarned ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {lv.label}
            </p>

            {/* Threshold */}
            <p className={`text-[10px] leading-none -mt-1 ${isCurrent ? 'text-zinc-500' : isEarned ? 'text-zinc-600' : 'text-zinc-700'}`}>
              {lv.threshold === 0 ? 'início' : `${lv.threshold}+`}
            </p>

            {/* Badge "atual" */}
            {isCurrent && (
              <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold px-1 py-0.5 rounded-full leading-none bg-zinc-800 border border-zinc-700 text-zinc-300">
                atual
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Results({ onBack }: ResultsProps) {
  const { allTimeStats, sessionStats, errorLog, answerHistory, resetSession, theme } = useCladexStore();

  const totalAll   = allTimeStats.correct + allTimeStats.incorrect;
  const totalSess  = sessionStats.correct + sessionStats.incorrect;
  const totalXP    = allTimeStats.correct * 10 + allTimeStats.incorrect * 2;
  const recentErrors = errorLog.slice(0, 15);
  const days       = buildDailyStats(answerHistory);
  const allTimePct = pctNum(allTimeStats.correct, totalAll);
  const today      = buildTodayStats(answerHistory);

  const card = `rounded-2xl border p-4 bg-zinc-900/60 border-zinc-800/50`;
  const labelCls = `text-[10px] font-bold uppercase tracking-widest text-zinc-500`;

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-zinc-950">

      {/* Cabeçalho */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <button onClick={onBack}
          className="btn-juicy p-1.5 rounded-xl hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-200 transition-all">
          <ArrowLeft size={18} />
        </button>
        <span className="text-base font-black tracking-tight flex-1 text-zinc-100">
          Meu Desempenho
        </span>
        <ShareButton allTimePct={allTimePct} totalAnswers={totalAll} days={days} />
      </div>

      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-5 space-y-6">

        {/* ── Jornada ── */}
        <section>
          <p className={`${labelCls} mb-3`}>Jornada</p>
          <LevelGrid correct={allTimeStats.correct} theme={theme} />
        </section>

        {/* ── Acumulado Total + Hoje — lado a lado ── */}
        <section>
          <div className="flex gap-3 mb-3">
            <p className={`${labelCls} flex-1`}>Acumulado total</p>
            <p className={`${labelCls} flex-1`}>Hoje</p>
          </div>
          <div className="grid grid-cols-2 gap-3">

            {/* Acumulado */}
            <div className={card}>
              <div className="flex flex-col items-center text-center gap-2">
                <DonutBig correct={allTimeStats.correct} total={totalAll} />
                <p className="text-xl font-black text-zinc-100 leading-none">
                  {totalAll === 0 ? '—' : `${Math.round(allTimePct)}%`}
                </p>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-zinc-500">{allTimeStats.correct}✓ · {allTimeStats.incorrect}✗</p>
                  <p className="text-[10px] text-zinc-600">{totalAll} questões</p>
                  <p className="text-[10px] font-bold text-emerald-500">
                    {totalXP >= 1000 ? `${(totalXP / 1000).toFixed(1)}k` : totalXP} XP
                  </p>
                </div>
              </div>
            </div>

            {/* Hoje */}
            <div className={card}>
              {today.total === 0 ? (
                <p className="text-[11px] text-zinc-600 text-center py-4 leading-snug">
                  Nenhuma questão hoje ainda.
                </p>
              ) : (
                <div className="flex flex-col items-center text-center gap-2">
                  <DonutBig correct={today.correct} total={today.total} />
                  <p className="text-xl font-black text-zinc-100 leading-none">
                    {pct(today.correct, today.total)}
                  </p>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-500">{today.correct}✓ · {today.total - today.correct}✗</p>
                    <p className="text-[10px] text-zinc-600">{today.total} questões</p>
                    {totalSess > 0 && (
                      <button onClick={resetSession}
                        className="flex items-center gap-0.5 text-[9px] text-zinc-700 hover:text-zinc-400 transition-colors mx-auto pt-0.5">
                        <RotateCcw size={8} />
                        Reiniciar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Evolução diária ── */}
        <section>
          <p className={`${labelCls} mb-3`}>Evolução diária</p>
          <div className={card}>
            <ProgressChart history={answerHistory} theme={theme} />
          </div>
        </section>

        {/* ── Desempenho por tipo de questão ── */}
        <section>
          <p className={`${labelCls} mb-3`}>Desempenho por tipo de questão</p>
          <div className="rounded-2xl border divide-y bg-zinc-900/60 border-zinc-800/50 divide-zinc-800/50">
            {(Object.keys(TYPE_LABELS) as ExerciseType[]).map(type => {
              const s = allTimeStats.byType[type] ?? { correct: 0, incorrect: 0 };
              const tot = s.correct + s.incorrect;
              return (
                <div key={type} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">{TYPE_LABELS[type]}</span>
                    <span className="text-xs text-zinc-500 font-mono">{s.correct}/{tot}</span>
                  </div>
                  <AccuracyBar correct={s.correct} total={tot} />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Erros recentes ── */}
        {recentErrors.length > 0 && (
          <section>
            <p className={`${labelCls} mb-3`}>Erros recentes</p>
            <div className="rounded-2xl border divide-y bg-zinc-900/60 border-zinc-800/50 divide-zinc-800/50">
              {recentErrors.map((err, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs leading-snug text-zinc-400">{err.question}</p>
                    <span className="shrink-0 text-[10px] text-zinc-600 font-mono">
                      {new Date(err.ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1">
                    {TYPE_LABELS[err.type]} · {MODULE_LABELS[err.moduleId] ?? err.moduleId}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalAll === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">Nenhuma questão respondida ainda.</p>
            <p className="text-zinc-600 text-xs mt-1">Complete um treino para ver seu desempenho aqui.</p>
          </div>
        )}

        <div className="rounded-xl border px-4 py-3 border-zinc-800/50">
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Dados armazenados localmente neste navegador. Limpar os dados do navegador, usar outro dispositivo ou trocar de navegador apagará seu histórico.
          </p>
        </div>

        <div className="pb-4" />
      </div>
    </div>
  );
}
