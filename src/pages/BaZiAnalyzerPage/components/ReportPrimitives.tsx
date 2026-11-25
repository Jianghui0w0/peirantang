import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { MonthQiResult } from '@/analysis/yinyang/engine';
import type { XiangYiVerdict } from '@/analysis/yinyang/xiangfa';
import {
  CHANG_SHENG_META,
  CHANG_SHENG_RANK,
  SECTION_META,
  parseChangSheng,
} from '../constants';

export interface ScoreBreakdownRow {
  displayScore?: number;
  score?: number;
  rawScore?: number;
  mingPanBase?: number;
  plusSumRaw?: number;
  minusSumRaw?: number;
  otherSumRaw?: number;
}

/** 统一版块外壳：带编号头 + 可选右侧学术批注栏（正文与旁注双栏解耦，压缩纵向阅读长度） */
export function SectionFrame({
  id,
  metaKey,
  aside,
  badge,
  children,
}: {
  id: string;
  metaKey: keyof typeof SECTION_META;
  aside?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const m = SECTION_META[metaKey];
  return (
    <section id={id} className="reveal scroll-mt-24 border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/35 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="section-num inline-flex h-5 items-center border border-primary/40 bg-primary/10 px-1.5 font-mono text-[11px] font-bold text-primary">
            {m.no}
          </span>
          <span className="label-mono text-[10px] tracking-[0.16em] text-muted-foreground">{m.en}</span>
          <span className="h-3.5 w-px bg-border" />
          <h2 className="font-editorial text-base font-bold tracking-[0.12em] text-foreground md:text-[17px]">
            {m.title}
          </h2>
        </div>
        {badge && <div className="flex items-center gap-2">{badge}</div>}
      </header>
      <div className="p-4 md:p-6">
        {aside ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div className="min-w-0">{children}</div>
            <aside className="margin-note-box space-y-3 border-t border-border pt-4 lg:border-t-0 lg:pt-0">
              {aside}
            </aside>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

/** 学术档案折叠块（响应精读/全量开关） */
export function Detail({
  label = '理论依据 · 展开详情',
  badge,
  open: openProp = false,
  children,
}: {
  label?: string;
  badge?: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(openProp);
  useEffect(() => {
    setOpen(openProp);
  }, [openProp]);

  return (
    <div className="mt-4 border-t border-border/80 pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group inline-flex w-full items-center justify-between gap-2 rounded-[2px] px-2 py-1.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="inline-flex items-center gap-2">
          {open ? (
            <ChevronDown className="size-3.5 text-primary transition-transform" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:text-primary" />
          )}
          <span className="label-mono case-preserve text-[10.5px] font-semibold tracking-[0.06em] text-foreground/80 group-hover:text-foreground">
            {label}
          </span>
        </span>
        {badge && (
          <span className="label-mono border border-border bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground">
            {badge}
          </span>
        )}
      </button>
      {open && <div className="mt-3 space-y-3 pl-1">{children}</div>}
    </div>
  );
}

/** 2-up 对称分栏正文 */
export function SplitBody({
  leftLabel,
  leftTone,
  leftItems,
  rightLabel,
  rightTone,
  rightItems,
}: {
  leftLabel: string;
  leftTone: string;
  leftItems: string[];
  rightLabel: string;
  rightTone: string;
  rightItems: string[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[
        { label: leftLabel, tone: leftTone, items: leftItems },
        { label: rightLabel, tone: rightTone, items: rightItems },
      ].map((col) => (
        <div
          key={col.label}
          className="border border-border bg-muted/25 p-3.5"
          style={{ borderLeft: `3px solid ${col.tone}` }}
        >
          <div className="label-mono mb-2 font-bold" style={{ color: col.tone }}>
            {col.label}
          </div>
          <ul className="space-y-1.5 text-xs leading-relaxed text-foreground/90">
            {col.items.map((x, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="shrink-0 font-bold" style={{ color: col.tone }}>·</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** 区间谱条（可视化离散档位） */
export function SegmentBar({ tone, segs, active }: { tone: string; segs: string[]; active: number[] }) {
  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${segs.length}, minmax(0, 1fr))` }}>
        {segs.map((s, i) => (
          <div
            key={s}
            className="h-2 transition-all"
            style={{
              backgroundColor: active.includes(i) ? tone : 'var(--muted)',
              opacity: active.includes(i) ? 0.92 : 0.7,
            }}
          />
        ))}
      </div>
      <div
        className="mt-1.5 grid gap-1 text-center text-[9px] font-semibold text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${segs.length}, minmax(0, 1fr))` }}
      >
        {segs.map((s, i) => (
          <span key={s} style={{ color: active.includes(i) ? tone : undefined }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 结论指标卡（支持悬停反馈与内部锚点直达） */
export function MetricCard({
  label,
  value,
  sub,
  tone,
  note,
  bar,
  href,
  className = '',
}: {
  label: string;
  value: string;
  sub?: string;
  tone: string;
  note: string;
  bar?: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="label-mono text-[10px] tracking-[0.14em] text-muted-foreground">{label}</span>
        {href && <span className="label-mono text-[9px] text-primary opacity-0 transition-opacity group-hover:opacity-100">详情 →</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-editorial whitespace-nowrap text-xl font-black tracking-tight sm:text-2xl" style={{ color: tone }}>
          {value}
        </span>
        {sub && <span className="whitespace-nowrap text-xs font-bold text-muted-foreground">{sub}</span>}
      </div>
      {bar && <div className="mt-2.5">{bar}</div>}
      <div className="mt-2.5 border-t border-border/70 pt-2 text-[11px] leading-relaxed text-muted-foreground">
        {note}
      </div>
    </>
  );

  const shellClass = `group flex flex-col justify-between border border-border bg-card p-4 transition-colors ${href ? 'cursor-pointer hover:border-foreground/35 hover:bg-muted/30' : ''} ${className}`;
  const shellStyle: React.CSSProperties = { borderTop: `2.5px solid ${tone}` };

  return href ? (
    <a href={href} className={shellClass} style={shellStyle}>
      {inner}
    </a>
  ) : (
    <div className={shellClass} style={shellStyle}>
      {inner}
    </div>
  );
}

/** 综合分加减明细条（平铺标签 / 紧凑十列对齐模式） */
export function ScoreBreakdown({
  row,
  dense = false,
  stacked = false,
}: {
  row: ScoreBreakdownRow;
  dense?: boolean;
  stacked?: boolean;
}) {
  const toC = (raw: number) => Math.round((raw / 3.6) * 10) / 10;
  const displayScore: number =
    typeof row.displayScore === 'number'
      ? row.displayScore
      : typeof row.score === 'number'
        ? row.score
        : 0;

  const plusC = toC(Number(row.plusSumRaw) || 0);
  const minusC = toC(Number(row.minusSumRaw) || 0);
  const otherC = toC(Number(row.otherSumRaw) || 0);
  const mingPanBase = typeof row.mingPanBase === 'number' ? row.mingPanBase : 0;
  const hasDetail = row.plusSumRaw !== undefined || row.minusSumRaw !== undefined || row.otherSumRaw !== undefined;
  let trendC = 0;
  if (hasDetail && row.rawScore !== undefined) {
    trendC = Math.round((displayScore - toC(row.rawScore) - mingPanBase) * 10) / 10;
  }
  if (!hasDetail) return null;

  if (stacked) {
    const line = (label: string, val: number, tone: string, bg: string, border: string, visible: boolean) => (
      <div
        key={label}
        className="mt-1 flex h-[19px] items-center justify-between overflow-hidden whitespace-nowrap border px-1.5 text-[10px] font-bold tabular-nums"
        style={
          visible
            ? { borderColor: border, background: bg, color: tone }
            : { borderColor: 'transparent', background: 'transparent', color: 'transparent' }
        }
      >
        <span className="shrink-0 opacity-75">{label}</span>
        <span className="shrink-0">{val >= 0 ? '+' : ''}{val.toFixed(1)}</span>
      </div>
    );
    return (
      <div>
        {line('加分', plusC, 'var(--semantic-useful)', 'var(--semantic-useful-bg)', 'var(--semantic-useful-border)', true)}
        {line('扣分', minusC, 'var(--semantic-taboo)', 'var(--semantic-taboo-bg)', 'var(--semantic-taboo-border)', true)}
        {line('其他', otherC, 'var(--foreground)', 'var(--muted)', 'var(--border)', Math.abs(otherC) >= 0.05)}
        {line('命盘', mingPanBase, 'var(--semantic-sky)', 'var(--semantic-sky-bg)', 'var(--semantic-sky-border)', Math.abs(mingPanBase) >= 0.05)}
        <div
          className="mt-1 flex h-[21px] items-center justify-between overflow-hidden whitespace-nowrap border px-1.5 text-[10px] font-black tabular-nums"
          style={{
            borderColor: displayScore >= 0 ? 'var(--semantic-useful-border)' : 'var(--semantic-taboo-border)',
            background: displayScore >= 0 ? 'var(--semantic-useful-bg)' : 'var(--semantic-taboo-bg)',
            color: displayScore >= 0 ? 'var(--semantic-useful)' : 'var(--semantic-taboo)',
          }}
        >
          <span className="shrink-0 opacity-75">综合</span>
          <span className="shrink-0">{displayScore >= 0 ? '+' : ''}{displayScore.toFixed(1)}</span>
        </div>
      </div>
    );
  }

  const pill = (label: string, val: number, color: string, bg: string, border: string) => (
    <span
      key={label}
      className={`inline-flex items-center rounded-[2px] border px-1.5 py-0.5 font-bold tabular-nums ${dense ? 'text-[10px]' : 'text-[11px]'}`}
      style={{ borderColor: border, background: bg, color }}
    >
      <span className="mr-1 opacity-75">{label}</span>
      {val >= 0 ? '+' : ''}{val.toFixed(1)}
    </span>
  );

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${dense ? 'mt-1.5' : 'mt-2'}`} aria-label="综合分明细">
      {pill('加分', plusC, 'var(--semantic-useful)', 'var(--semantic-useful-bg)', 'var(--semantic-useful-border)')}
      {pill('扣分', minusC, 'var(--semantic-taboo)', 'var(--semantic-taboo-bg)', 'var(--semantic-taboo-border)')}
      {Math.abs(otherC) >= 0.05 && pill('其他', otherC, 'var(--foreground)', 'var(--muted)', 'var(--border)')}
      {Math.abs(mingPanBase) >= 0.05 && pill('命盘', mingPanBase, 'var(--semantic-sky)', 'var(--semantic-sky-bg)', 'var(--semantic-sky-border)')}
      {Math.abs(trendC) >= 0.05 && pill('趋势', trendC, 'var(--semantic-amber)', 'var(--semantic-amber-bg)', 'var(--semantic-amber-border)')}
      <span className="mx-0.5 text-[11px] font-bold text-muted-foreground">=</span>
      <span
        className={`inline-flex items-center rounded-[2px] border px-2 py-0.5 font-black tabular-nums ${dense ? 'text-[10px]' : 'text-[11px]'}`}
        style={{
          borderColor: displayScore >= 0 ? 'var(--semantic-useful-border)' : 'var(--semantic-taboo-border)',
          background: displayScore >= 0 ? 'var(--semantic-useful-bg)' : 'var(--semantic-taboo-bg)',
          color: displayScore >= 0 ? 'var(--semantic-useful)' : 'var(--semantic-taboo)',
        }}
      >
        <span className="mr-1 opacity-75">综合</span>
        {displayScore >= 0 ? '+' : ''}{displayScore.toFixed(1)}
      </span>
    </div>
  );
}

/** 人生大运 80 年 / 十年流年综合分走势曲线（纯 SVG 响应式，兼容宣纸与星空双主题） */
export function DaYunCurveChart({
  items,
  currentIndex,
  onSelectStep,
  mode = 'dayun',
  title,
}: {
  items: Array<{
    stem: string;
    branch: string;
    startAge: number;
    score?: number;
    displayScore?: number;
  }>;
  currentIndex?: number;
  onSelectStep?: (idx: number) => void;
  mode?: 'dayun' | 'liunian';
  title?: string;
}) {
  if (!items || items.length === 0) return null;

  const list = items.slice(0, mode === 'liunian' ? 10 : 8).map((dy, idx) => ({
    idx,
    ganzhi: `${dy.stem}${dy.branch}`,
    age: dy.startAge,
    score: typeof dy.displayScore === 'number' ? dy.displayScore : (dy.score ?? 0),
  }));

  const vals = list.map((x) => x.score);
  const absMax = Math.max(8, Math.ceil(Math.max(...vals.map((v) => Math.abs(v))) / 2) * 2);
  const yMin = -absMax;
  const yMax = absMax;

  const W = 740;
  const H = 232;
  const PAD_L = 52;
  const PAD_R = 26;
  const INNER_X = 24;
  const PAD_T = 28;
  const PAD_B = 46;
  const plotLeft = PAD_L + INNER_X;
  const plotRight = W - PAD_R - INNER_X;
  const plotW = plotRight - plotLeft;
  const plotH = H - PAD_T - PAD_B;

  const xOf = (i: number) =>
    list.length === 1 ? plotLeft + plotW / 2 : plotLeft + (i / (list.length - 1)) * plotW;
  const yOf = (v: number) => PAD_T + ((yMax - v) / (yMax - yMin)) * plotH;
  const yZero = yOf(0);

  const pts = list.map((it, i) => ({ x: xOf(i), y: yOf(it.score), it }));

  let lineD = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const mx = (p0.x + p1.x) / 2;
    lineD += ` C ${mx.toFixed(1)} ${p0.y.toFixed(1)}, ${mx.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }

  const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${yZero.toFixed(1)} L ${pts[0].x.toFixed(1)} ${yZero.toFixed(1)} Z`;

  return (
    <div className="w-full overflow-x-auto border border-border bg-card p-3.5 md:p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="label-mono text-primary">FORTUNE CURVE</span>
          <span className="text-xs font-bold text-foreground">
            {title ?? (mode === 'liunian' ? '十年流年逐岁综合分走势' : '八步大运综合分曲线（点击节点展开该步十年流年）')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1" style={{ color: 'var(--semantic-useful)' }}>
            <span className="inline-block size-2 rounded-full" style={{ background: 'var(--semantic-useful)' }} /> 顺运 (&ge;+4)
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-muted-foreground" /> 平运 (-4~+4)
          </span>
          <span className="inline-flex items-center gap-1" style={{ color: 'var(--semantic-taboo)' }}>
            <span className="inline-block size-2 rounded-full" style={{ background: 'var(--semantic-taboo)' }} /> 逆运 (&le;-4)
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[520px] select-none"
        role="img"
        aria-label={mode === 'liunian' ? '十年流年综合评分曲线图' : '人生八步大运综合评分曲线图'}
      >
        <defs>
          <linearGradient id="dyPosGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--semantic-useful)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--semantic-useful)" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="dyNegGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--semantic-taboo)" stopOpacity="0.01" />
            <stop offset="100%" stopColor="var(--semantic-taboo)" stopOpacity="0.20" />
          </linearGradient>
          <clipPath id="clipAboveZero">
            <rect x={PAD_L} y={PAD_T} width={W - PAD_L - PAD_R} height={Math.max(0, yZero - PAD_T)} />
          </clipPath>
          <clipPath id="clipBelowZero">
            <rect x={PAD_L} y={yZero} width={W - PAD_L - PAD_R} height={Math.max(0, PAD_T + plotH - yZero)} />
          </clipPath>
        </defs>

        {[yMax, Math.round(yMax / 2), 0, -Math.round(yMax / 2), yMin].map((t) => {
          const y = yOf(t);
          const isZero = t === 0;
          return (
            <g key={t}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                stroke={isZero ? 'var(--chart-axis)' : 'var(--chart-grid)'}
                strokeWidth={isZero ? 1.4 : 1}
                strokeDasharray={isZero ? undefined : '3 3'}
              />
              <text
                x={PAD_L - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize="10"
                fontWeight="700"
                fill="var(--chart-axis)"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {t > 0 ? `+${t}` : `${t}`}
              </text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#dyPosGrad)" clipPath="url(#clipAboveZero)" />
        <path d={areaD} fill="url(#dyNegGrad)" clipPath="url(#clipBelowZero)" />

        <path
          d={lineD}
          fill="none"
          stroke="var(--chart-curve)"
          strokeWidth={2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {pts.map((p) => {
          const sc = p.it.score;
          const isCur = p.it.idx === currentIndex;
          const c = sc >= 4 ? 'var(--semantic-useful)' : sc <= -4 ? 'var(--semantic-taboo)' : 'var(--chart-axis)';
          return (
            <g
              key={p.it.idx}
              style={{ cursor: onSelectStep ? 'pointer' : 'default' }}
              onClick={() => onSelectStep?.(p.it.idx)}
            >
              <line
                x1={p.x}
                x2={p.x}
                y1={PAD_T}
                y2={H - PAD_B}
                stroke={isCur ? 'var(--primary)' : 'var(--chart-grid)'}
                strokeWidth={isCur ? 1.2 : 1}
                strokeDasharray={isCur ? undefined : '2 3'}
                strokeOpacity={isCur ? 0.65 : 0.7}
              />
              {isCur && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={8.5}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                />
              )}
              <circle cx={p.x} cy={p.y} r={5} fill="var(--card)" stroke={c} strokeWidth={2.4} />
              <text
                x={p.x}
                y={H - 27}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={isCur ? 'var(--primary)' : 'var(--muted-foreground)'}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {mode === 'liunian' ? `${p.it.age}` : `${p.it.age}岁`}
              </text>
              <text
                x={p.x}
                y={H - 11}
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="900"
                style={{ fontFamily: 'var(--font-serif)' }}
                fill={isCur ? 'var(--primary)' : c}
              >
                {p.it.ganzhi}
              </text>
              <text
                x={p.x}
                y={sc >= 0 ? p.y - 11 : p.y + 16}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill={c}
                paintOrder="stroke"
                stroke="var(--card)"
                strokeWidth={3}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {sc >= 0 ? `+${sc}` : `${sc}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** 论断卡片面板（象意 / 学历 / 财富等） */
export function VerdictPanel({
  subtitle,
  inputs,
  matched,
  result,
  disclaimer,
  accent = 'sky',
  score,
}: {
  subtitle: string;
  inputs: Array<{ label: string; value: string }>;
  matched: boolean;
  result: string;
  disclaimer?: string;
  accent?: 'sky' | 'emerald' | 'rose' | 'amber';
  score?: { value: number; label: string };
}) {
  const accentMeta: Record<string, { border: string; bg: string; text: string; tag: string }> = {
    sky: { border: 'var(--semantic-sky-border)', bg: 'var(--semantic-sky-bg)', text: 'var(--semantic-sky)', tag: 'var(--semantic-sky)' },
    emerald: { border: 'var(--semantic-useful-border)', bg: 'var(--semantic-useful-bg)', text: 'var(--semantic-useful)', tag: 'var(--semantic-useful)' },
    rose: { border: 'var(--semantic-taboo-border)', bg: 'var(--semantic-taboo-bg)', text: 'var(--semantic-taboo)', tag: 'var(--semantic-taboo)' },
    amber: { border: 'var(--semantic-amber-border)', bg: 'var(--semantic-amber-bg)', text: 'var(--semantic-amber)', tag: 'var(--semantic-amber)' },
  };
  const am = accentMeta[accent];
  return (
    <div className="space-y-3">
      <div className="text-sm font-bold text-muted-foreground">{subtitle}</div>
      <div className="flex flex-wrap gap-2">
        {inputs.map((it) => (
          <span
            key={it.label}
            className="rounded-[2px] border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground"
            style={{ borderColor: am.border }}
          >
            <span className="text-muted-foreground">{it.label}：</span>{it.value}
          </span>
        ))}
      </div>
      <div className="rounded-[2px] border p-4" style={{ borderColor: am.border, background: am.bg }}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className="label-mono inline-flex items-center px-2 py-0.5 text-[10px] font-black text-white"
            style={{ background: am.tag }}
          >
            查询论断
          </span>
          {score && (
            <span
              className="label-mono inline-flex items-center gap-1 rounded-[2px] border bg-card/70 px-2.5 py-0.5 text-[11px] font-black text-foreground"
              style={{ borderColor: am.border }}
            >
              {score.label}
              <span style={{ color: am.text }}> · {score.value} 分</span>
            </span>
          )}
          {!matched && disclaimer && (
            <span className="label-mono inline-flex items-center rounded-[2px] bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {disclaimer}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground">{result}</p>
      </div>
    </div>
  );
}

/** 象意论断面板 */
export function XiangYiPanel({ verdict }: { verdict: XiangYiVerdict }) {
  const dm = verdict.dayMaster;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div
          className="border p-4"
          style={{ borderColor: 'var(--semantic-sky-border)', background: 'var(--semantic-sky-bg)' }}
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="label-mono px-2 py-0.5 text-[10px] font-black text-white" style={{ background: 'var(--semantic-sky)' }}>
              日主本象
            </span>
            <span className="font-editorial text-lg font-black text-foreground">
              {dm.stem} · {dm.elementName} · {dm.fourSymbol}
            </span>
          </div>
          <p className="text-sm font-bold leading-relaxed text-foreground">{dm.stemTraits}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{dm.nature}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {dm.imagery.map((im) => (
              <span
                key={im}
                className="border bg-card/80 px-2 py-0.5 text-[11px] font-semibold text-foreground"
                style={{ borderColor: 'var(--semantic-sky-border)' }}
              >
                {im}
              </span>
            ))}
          </div>
        </div>

        <div
          className="border p-4"
          style={{ borderColor: 'var(--semantic-amber-border)', background: 'var(--semantic-amber-bg)' }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="label-mono px-2 py-0.5 text-[10px] font-black text-white" style={{ background: 'var(--semantic-amber)' }}>
              体征与月令流向
            </span>
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-foreground">
            <div><span className="font-bold text-muted-foreground">对应体征：</span>{dm.body}</div>
            <div><span className="font-bold text-muted-foreground">性情禀赋：</span>{dm.talent}</div>
            <div><span className="font-bold text-muted-foreground">吉凶关键：</span>{dm.jiXiong}</div>
            <div className="border-t border-border/60 pt-2">
              <span className="font-bold" style={{ color: 'var(--semantic-amber)' }}>月令流变：</span>
              <span className="text-muted-foreground">{dm.monthFlow}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {verdict.pillars.map((p) => (
          <div key={p.position} className="border border-border bg-muted/25 p-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{p.position}柱</span>
              <span className="font-mono font-bold text-foreground">{p.elementName}</span>
            </div>
            <div className="font-editorial mt-1 text-base font-black text-foreground">{p.gz}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{p.stemTraits}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 月对日主 · 十二长生卡 */
export function MonthRiZhuChangShengCard({
  monthBranch,
  dayStem,
  monthQi,
}: {
  monthBranch: string;
  dayStem: string;
  monthQi: MonthQiResult;
}) {
  const st = parseChangSheng(monthQi.detailedDesc || '', dayStem);
  if (!st) return null;
  const meta = CHANG_SHENG_META[st];
  const rank = CHANG_SHENG_RANK[st];
  const tone =
    meta.tag === '旺' ? 'var(--semantic-useful)' : meta.tag === '弱' ? 'var(--semantic-taboo)' : 'var(--semantic-amber)';
  const bg =
    meta.tag === '旺' ? 'var(--semantic-useful-bg)' : meta.tag === '弱' ? 'var(--semantic-taboo-bg)' : 'var(--semantic-amber-bg)';
  const border =
    meta.tag === '旺' ? 'var(--semantic-useful-border)' : meta.tag === '弱' ? 'var(--semantic-taboo-border)' : 'var(--semantic-amber-border)';

  const strengthLabel = rank >= 5 ? '极旺得令' : rank >= 3 ? '旺盛顺遂' : rank >= 1 ? '蓄气渐舒' : rank === 0 ? '荡漾中平' : rank >= -2 ? '气渐收敛' : '失令归伏';

  return (
    <div className="border bg-card p-4" style={{ borderColor: border }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="label-mono px-2 py-0.5 text-[10px] font-black text-white" style={{ background: tone }}>
            月对日主 · 十二长生
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {monthBranch}月令 × {dayStem}日主
          </span>
        </div>
        <span className="label-mono rounded-[2px] border px-2 py-0.5 text-[10px] font-bold" style={{ borderColor: border, background: bg, color: tone }}>
          {strengthLabel}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-editorial text-3xl font-black" style={{ color: tone }}>{st}</span>
        <p className="text-xs leading-relaxed text-foreground/85">{meta.desc}</p>
      </div>
    </div>
  );
}
