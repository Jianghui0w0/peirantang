import React, { useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import type { BaZiChart } from '@/analysis/common/baziCalculator';
import type { YongJiResult, ZhuZiXiJiResult } from '@/analysis/yinyang/engine';
import type { AnalysisLineKey } from '@/analysis';
import type { SolarTermTheme } from '@/data/solarTermsTheme';
import type { TimePrecision } from '@/analysis/greek';
import {
  ANALYSIS_LINES_META,
  ELEMENT_NAMES,
  type PillarMark,
} from '../constants';

interface FourPillarsHeroProps {
  chart: BaZiChart;
  yongJi: YongJiResult;
  zhuZiXiJi: ZhuZiXiJiResult | null;
  solarTermTheme: SolarTermTheme;
  timePrecision: TimePrecision;
  inputMode: 'date' | 'manual';
  activeLine: AnalysisLineKey;
  onSelectLine: (line: AnalysisLineKey) => void;
}

const MARK_LABEL: Record<PillarMark, string> = {
  useful: '用',
  taboo: '忌',
  neutral: '中',
};

function getMarkStyles(mark: PillarMark, active: boolean): React.CSSProperties {
  if (!active || mark === 'neutral') {
    return {
      borderColor: 'var(--border)',
      background: 'var(--card)',
      color: 'var(--foreground)',
    };
  }
  if (mark === 'useful') {
    return {
      borderColor: 'var(--semantic-useful)',
      background: 'var(--semantic-useful-bg)',
      color: 'var(--semantic-useful)',
    };
  }
  return {
    borderColor: 'var(--semantic-taboo)',
    background: 'var(--semantic-taboo-bg)',
    color: 'var(--semantic-taboo)',
  };
}

function getMarkPillStyle(mark: PillarMark): React.CSSProperties {
  if (mark === 'useful') {
    return {
      borderColor: 'var(--semantic-useful-border)',
      background: 'var(--card)',
      color: 'var(--semantic-useful)',
    };
  }
  if (mark === 'taboo') {
    return {
      borderColor: 'var(--semantic-taboo-border)',
      background: 'var(--card)',
      color: 'var(--semantic-taboo)',
    };
  }
  return {
    borderColor: 'var(--border)',
    background: 'var(--card)',
    color: 'var(--semantic-neutral)',
  };
}

/** 01 四柱排盘总览与三线切换器 */
export default function FourPillarsHero({
  chart,
  yongJi,
  zhuZiXiJi,
  solarTermTheme,
  timePrecision,
  inputMode,
  activeLine,
  onSelectLine,
}: FourPillarsHeroProps) {
  const [legendOpen, setLegendOpen] = useState(false);

  // 希腊占星线与大杂烩线不展示阴阳线的用/忌角标，避免口径混淆
  const showYongJiMarks = activeLine === 'yinyang';

  const resolveStemMark = (char: string, fallback?: PillarMark): PillarMark => {
    const z = zhuZiXiJi?.stems.find((r) => r.char === char)?.mark;
    if (z === 'xi') return 'useful';
    if (z === 'ji') return 'taboo';
    return fallback ?? 'neutral';
  };

  const resolveBranchMark = (char: string, fallback?: PillarMark): PillarMark => {
    const z = zhuZiXiJi?.branches.find((r) => r.char === char)?.mark;
    if (z === 'xi') return 'useful';
    if (z === 'ji') return 'taboo';
    return fallback ?? 'neutral';
  };

  const pillars = [
    { key: '年', en: 'YEAR', zh: '年柱', p: chart.year },
    { key: '月', en: 'MONTH', zh: '月柱', p: chart.month },
    { key: '日', en: 'DAY', zh: '日柱', p: chart.day },
    { key: '时', en: 'HOUR', zh: '时柱', p: chart.hour },
  ];

  return (
    <section id="section-pillars" className="scroll-mt-24 border border-border bg-card">
      {/* 顶部信息元栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/35 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="section-num inline-flex h-5 items-center border border-primary/40 bg-primary/10 px-1.5 font-mono text-[11px] font-bold text-primary">
            01
          </span>
          <span className="label-mono text-[10px] tracking-[0.16em] text-muted-foreground">FOUR PILLARS</span>
          <span className="h-3.5 w-px bg-border" />
          <h2 className="font-editorial text-base font-bold tracking-[0.12em] text-foreground md:text-[17px]">
            四柱八字原局排盘
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showYongJiMarks && (
            <button
              type="button"
              onClick={() => setLegendOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-[2px] border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <HelpCircle className="size-3" />
              标色图例
            </button>
          )}
          <span className="inline-flex items-center gap-1 rounded-[2px] border border-primary/35 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
            <Sparkles className="size-3" />
            节气 · {solarTermTheme.name}
          </span>
        </div>
      </div>

      {/* 生辰与真太阳时遥测详情带 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border/80 bg-background/50 px-4 py-2 text-xs text-muted-foreground md:px-6">
        <span>
          <strong className="text-foreground">公历：</strong>
          {chart.birthInfo.solarDate} {chart.birthInfo.solarTime}
        </span>
        {inputMode === 'date' && (
          <>
            <span>
              <strong className="text-foreground">真太阳时：</strong>
              <span className="num-tabular text-primary font-semibold">{chart.birthInfo.trueSolarTime}</span>
              {chart.birthInfo.trueSolarDayOffset !== 0 && (
                <span className="ml-1 text-[11px] font-bold text-primary">
                  （跨日 {chart.birthInfo.trueSolarDayOffset > 0 ? '+1日' : '-1日'}）
                </span>
              )}
            </span>
            <span>
              <strong className="text-foreground">地点：</strong>
              {chart.birthInfo.birthPlace}
              {chart.birthInfo.dstApplied && '（已回拨夏令时）'}
            </span>
            {timePrecision === 'day' && (
              <span className="rounded-[2px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                正午推定
              </span>
            )}
          </>
        )}
      </div>

      {/* 可选标色图例展开条 */}
      {legendOpen && showYongJiMarks && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-border bg-muted/25 px-4 py-2.5 text-xs md:px-6">
          <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--semantic-useful)' }}>
            <span className="border px-1 text-[10px] font-black" style={getMarkPillStyle('useful')}>用</span>
            月令平衡所喜之气
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--semantic-taboo)' }}>
            <span className="border px-1 text-[10px] font-black" style={getMarkPillStyle('taboo')}>忌</span>
            助长偏枯或损局之气
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--semantic-neutral)' }}>
            <span className="border px-1 text-[10px] font-black" style={getMarkPillStyle('neutral')}>中</span>
            待定或视柱中组合转化
          </span>
          <span className="text-[11px] text-muted-foreground">
            注：日柱天干为「日主」基准点，不标用/忌；十神仅表社会关系属性。
          </span>
        </div>
      )}

      {/* 博物馆碑帖式四柱矩阵 */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {pillars.map(({ key, en, zh, p }, idx) => {
            const isRiZhu = idx === 2;
            const stemMark: PillarMark = isRiZhu
              ? 'neutral'
              : resolveStemMark(p.stem, yongJi.stemMarks[`${key}干`] as PillarMark);
            const branchMark: PillarMark = resolveBranchMark(
              p.branch,
              yongJi.branchMarks[`${key}支`] as PillarMark,
            );

            return (
              <div
                key={key}
                className={`relative flex flex-col items-center border p-3.5 transition-colors md:p-4 ${
                  isRiZhu ? 'border-primary/50 bg-primary/[0.03]' : 'border-border bg-background/40'
                }`}
              >
                {/* 柱头标签 */}
                <div className="mb-3 flex w-full items-center justify-between border-b border-border/60 pb-2">
                  <div>
                    <span className="label-mono block text-[9px] text-muted-foreground">{en}</span>
                    <span className="text-xs font-bold text-foreground">{zh}</span>
                  </div>
                  <span
                    className={`rounded-[2px] border px-2 py-0.5 text-[11px] font-bold ${
                      isRiZhu
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {isRiZhu ? '日主' : (p.shiShen || '—')}
                  </span>
                </div>

                {/* 天干字块 */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="font-editorial flex size-16 items-center justify-center border-2 text-[34px] font-black leading-none md:size-[72px] md:text-[38px]"
                    style={getMarkStyles(stemMark, showYongJiMarks && !isRiZhu)}
                  >
                    {p.stem}
                  </div>
                  {showYongJiMarks && !isRiZhu && (
                    <span
                      className="absolute -right-2 -top-2 border px-1 py-0 text-[10px] font-black leading-tight"
                      style={getMarkPillStyle(stemMark)}
                    >
                      {MARK_LABEL[stemMark]}
                    </span>
                  )}
                  <div className="label-mono mt-1.5 text-[10px] tracking-[0.06em] text-muted-foreground">
                    {ELEMENT_NAMES[p.stemElement]} · {p.stemYinYang === 'yang' ? '阳' : '阴'}
                  </div>
                </div>

                <div className="my-3 h-px w-4/5 bg-border/70" />

                {/* 地支字块 */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="font-editorial flex size-16 items-center justify-center border-2 text-[34px] font-black leading-none md:size-[72px] md:text-[38px]"
                    style={getMarkStyles(branchMark, showYongJiMarks)}
                  >
                    {p.branch}
                  </div>
                  {showYongJiMarks && (
                    <span
                      className="absolute -right-2 -top-2 border px-1 py-0 text-[10px] font-black leading-tight"
                      style={getMarkPillStyle(branchMark)}
                    >
                      {MARK_LABEL[branchMark]}
                    </span>
                  )}
                  <div className="label-mono mt-1.5 text-[10px] tracking-[0.06em] text-muted-foreground">
                    {ELEMENT_NAMES[p.branchElement]} · {p.branchYinYang === 'yang' ? '阳' : '阴'}
                  </div>
                </div>

                {/* 地支藏干 */}
                <div className="mt-3 w-full border-t border-border/60 pt-2.5">
                  <div className="label-mono mb-1.5 text-center text-[9px] text-muted-foreground">地支藏干</div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {p.hiddenStems.map((hs) => {
                      const hsMark = resolveStemMark(hs, yongJi.allStemMarks[hs] as PillarMark);
                      const noteText = zhuZiXiJi?.stems.find((r) => r.char === hs)?.note;
                      return (
                        <span
                          key={hs}
                          title={noteText || `藏干 ${hs}`}
                          className="inline-flex items-center gap-1 rounded-[2px] border px-2 py-0.5 text-xs font-bold"
                          style={
                            showYongJiMarks
                              ? getMarkPillStyle(hsMark)
                              : { borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }
                          }
                        >
                          <span>{hs}</span>
                          {showYongJiMarks && hsMark !== 'neutral' && (
                            <span className="text-[9px] opacity-80">{MARK_LABEL[hsMark]}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 三条独立分析口径切换器 */}
      <div className="border-t border-border bg-muted/30 p-3 md:px-6 md:py-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="label-mono text-[10px] text-muted-foreground">
            选择解盘视角 / ANALYSIS LINE SWITCHER
          </span>
          <span className="text-[11px] text-muted-foreground">三线共用同一四柱与真太阳时盘面</span>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {ANALYSIS_LINES_META.map((line) => {
            const active = activeLine === line.key;
            return (
              <button
                key={line.key}
                type="button"
                onClick={() => onSelectLine(line.key)}
                className={`group flex flex-col items-start border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? 'border-primary bg-card shadow-sm'
                    : 'border-border bg-background/60 hover:border-foreground/40 hover:bg-card'
                }`}
                style={{
                  borderLeftWidth: active ? '3px' : '1px',
                  borderLeftColor: active ? 'var(--primary)' : undefined,
                }}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className={`label-mono text-[9.5px] ${active ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {line.index} · {line.en}
                  </span>
                  {active && (
                    <span className="rounded-[2px] bg-primary px-1.5 py-0.5 text-[9px] font-black text-primary-foreground">
                      当前视角
                    </span>
                  )}
                </div>
                <div className="font-editorial mt-1 text-base font-black tracking-[0.08em] text-foreground">
                  {line.title}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {line.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
