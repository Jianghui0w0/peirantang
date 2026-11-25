import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type {
  DaYunFortuneEntry,
  GuFaPangZheng,
  KeyYearsResult,
  NianYueTaiJiResult,
} from '@/analysis/yinyang/engine';
import type { YinyangAnalysis } from '@/analysis';
import {
  LETTER_STYLE,
  compactLiuNianHint,
  fmtScore,
  scoreToneColor,
} from '../constants';
import {
  DaYunCurveChart,
  Detail,
  ScoreBreakdown,
  SectionFrame,
} from './ReportPrimitives';

interface DaYunSectionProps {
  daYunAnalysis: NonNullable<YinyangAnalysis['daYunAnalysis']>;
  pattern: NonNullable<YinyangAnalysis['pattern']>;
  keyYears: KeyYearsResult | null;
  guFaPangZheng: GuFaPangZheng | null;
  laoGaoRules: {
    zhuYi: Array<{ ganzhi: string; note: string }>;
    shiShen: string[];
    blockedKe: Array<{ from: string; to: string; note: string }>;
  } | null;
  expandedDY: number | null;
  onToggleDY: (index: number | null) => void;
  fullView: boolean;
}

/** 05 大运流年走势 · 年月太极四象 · 生克权流转 */
export default function DaYunSection({
  daYunAnalysis,
  pattern,
  keyYears,
  guFaPangZheng,
  laoGaoRules,
  expandedDY,
  onToggleDY,
  fullView,
}: DaYunSectionProps) {
  const [curveMode, setCurveMode] = useState<'life' | 'step'>('life');

  const steps: DaYunFortuneEntry[] = daYunAnalysis.daYunWithFortune ?? [];
  const curIdx = daYunAnalysis.currentDaYunIndex ?? 0;
  const focusedIdx = expandedDY !== null && expandedDY < steps.length ? expandedDY : curIdx;
  const focusedStep = steps[focusedIdx];

  const stepCurveItems = (focusedStep?.liuNian10 ?? []).map((ln) => ({
    stem: ln.ganzhi[0] ?? '',
    branch: ln.ganzhi[1] ?? '',
    startAge: ln.year,
    score: ln.score,
    displayScore: ln.displayScore,
  }));

  const nyTaiJi: NianYueTaiJiResult = pattern.nianYueTaiJi;

  return (
    <SectionFrame
      id="section-dayun"
      metaKey="dayun"
      badge={
        <span className="label-mono rounded-[2px] border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
          当前大运 · {steps[curIdx] ? `${steps[curIdx].stem}${steps[curIdx].branch}` : '—'}
        </span>
      }
      aside={
        <>
          <div className="label-mono text-primary">METHOD · 评分口径</div>
          <p>
            大运与流年展示分由「原局基准分 + 岁运调整分」组成；九档评级严格依据本步净增益，保证同盘内部好坏梯度清晰。
          </p>
          {keyYears && keyYears.transition && (
            <div className="border-t border-border/80 pt-2.5">
              <div className="font-bold text-foreground">下一次换运节点</div>
              <p className="mt-0.5 text-[11px]">
                {keyYears.transition.year} 年（{keyYears.transition.ganzhi}）进入下一步大运，留意气机转换。
              </p>
            </div>
          )}
          {guFaPangZheng?.shengKeQuan && (
            <div className="border-t border-border/80 pt-2.5">
              <div className="font-bold text-foreground">生克权掌权五行</div>
              <p className="mt-0.5 text-[11px]">
                原局掌权：<strong className="text-primary">{guFaPangZheng.shengKeQuan.rulerLabel}</strong>
                {guFaPangZheng.shengKeQuanShift && (
                  <> · {guFaPangZheng.shengKeQuanShift.shifted ? '当前运已交接' : '当前运未交接'}</>
                )}
              </p>
            </div>
          )}
        </>
      }
    >
      {/* 曲线视图切换 */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex border border-border bg-muted/40 p-0.5">
            {([
              { key: 'life', label: '一生八步大运走势（点击节点定位）' },
              { key: 'step', label: `所选大运十年流年（${focusedStep ? `${focusedStep.stem}${focusedStep.branch}` : '—'}）` },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCurveMode(tab.key)}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  curveMode === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">点击下表任意大运可展开该十年流年卡</span>
        </div>

        {curveMode === 'life' ? (
          <DaYunCurveChart
            mode="dayun"
            items={steps}
            currentIndex={curIdx}
            onSelectStep={(idx) => onToggleDY(expandedDY === idx ? null : idx)}
          />
        ) : (
          <DaYunCurveChart
            mode="liunian"
            title={`所选大运（${focusedStep ? `${focusedStep.stem}${focusedStep.branch}` : '—'}）十年流年综合分走势`}
            items={stepCurveItems}
          />
        )}
      </div>

      {/* 八步大运可折叠列表 */}
      <div className="mt-4 divide-y divide-border border border-border">
        {steps.map((dy) => {
          const isCur = dy.index === curIdx;
          const isExpanded = expandedDY === dy.index;
          const lvl = dy.letterLevel ?? 'B+';
          const ls = LETTER_STYLE[lvl] ?? LETTER_STYLE['B+'];
          const dScore = dy.displayScore ?? dy.score ?? 0;

          return (
            <div key={dy.index} className={isCur ? 'bg-primary/[0.03]' : 'bg-card'}>
              <button
                type="button"
                onClick={() => onToggleDY(isExpanded ? null : dy.index)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex flex-wrap items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-primary" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                  <span className="font-mono text-xs font-bold text-muted-foreground">第{dy.index + 1}步</span>
                  <span className="font-editorial text-lg font-black text-foreground">
                    {dy.stem}{dy.branch}
                  </span>
                  {isCur && (
                    <span className="rounded-[2px] bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground">
                      当前大运
                    </span>
                  )}
                  <span className="num-tabular text-xs text-muted-foreground">
                    {dy.startAge}–{dy.startAge + 9} 岁（{dy.startYear}–{dy.endYear}）
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className="label-mono rounded-[2px] border px-2 py-0.5 text-[11px] font-black"
                    style={{ borderColor: ls.border, background: ls.bg, color: ls.text }}
                  >
                    {lvl}
                  </span>
                  <span
                    className="num-tabular min-w-[3.2rem] text-right text-sm font-black"
                    style={{ color: scoreToneColor(dScore) }}
                  >
                    {fmtScore(dScore)}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border/80 bg-muted/15 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs leading-relaxed text-foreground/90">{dy.description}</p>
                    <ScoreBreakdown row={dy} />
                  </div>

                  {/* 十年流年平铺小卡（十列整齐水平对齐） */}
                  {dy.liuNian10 && dy.liuNian10.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
                      {dy.liuNian10.map((ln) => {
                        const lnLvl = ln.letterLevel ?? 'B+';
                        const lns = LETTER_STYLE[lnLvl] ?? LETTER_STYLE['B+'];
                        const hint = compactLiuNianHint(ln.hint);
                        return (
                          <div
                            key={ln.year}
                            title={ln.hint}
                            className="flex flex-col justify-between border border-border bg-card p-2"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="num-tabular font-bold text-muted-foreground">{ln.year}</span>
                                <span className="font-mono font-black" style={{ color: lns.text }}>{lnLvl}</span>
                              </div>
                              <div className="font-editorial mt-0.5 text-center text-sm font-black text-foreground">
                                {ln.ganzhi}
                              </div>
                            </div>
                            <ScoreBreakdown row={ln} stacked />
                            {hint && (
                              <div className="mt-1.5 line-clamp-2 text-[9.5px] leading-tight text-muted-foreground">
                                {hint}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 未来十年关键年份速查 */}
      {keyYears && keyYears.allYears.length > 0 && (
        <div className="mt-4 border border-border bg-muted/20 p-4">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground">
              <span className="mark-highlight mr-1.5">未来十年关键年份</span>
              （{keyYears.windowStart}–{keyYears.windowEnd}）
            </span>
            <span className="text-[11px] text-muted-foreground">绿框＝十年较顺三岁 · 红框＝谨慎三岁 · 金顶＝换运年</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {keyYears.allYears.map((y) => {
              const isJi = y.tag === 'ji';
              const isXiong = y.tag === 'xiong';
              const borderCol = isJi
                ? 'var(--semantic-useful-border)'
                : isXiong
                  ? 'var(--semantic-taboo-border)'
                  : 'var(--border)';
              const textCol = isJi
                ? 'var(--semantic-useful)'
                : isXiong
                  ? 'var(--semantic-taboo)'
                  : 'var(--foreground)';
              return (
                <div
                  key={y.year}
                  className="border bg-card px-3 py-2"
                  style={{
                    borderColor: borderCol,
                    borderTop: y.isTransition ? '2.5px solid var(--semantic-amber)' : undefined,
                  }}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="num-tabular font-bold text-muted-foreground">{y.year}</span>
                    <span className="font-mono font-black" style={{ color: textCol }}>{y.level}</span>
                  </div>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <span className="font-editorial text-sm font-black text-foreground">{y.ganzhi}</span>
                    <span className="num-tabular text-xs font-bold" style={{ color: textCol }}>
                      {fmtScore(y.displayScore)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 年月太极 2×2 四象面板 */}
      <Detail label={`年月太极格局拆解（${nyTaiJi.taijiName} · ${nyTaiJi.state}）`} badge={nyTaiJi.state} open={fullView}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="border border-border bg-muted/20 p-3.5">
            <div className="label-mono text-[10px] text-primary">01 年干定位 · 先天根基</div>
            <div className="mt-1 text-sm font-bold text-foreground">
              {nyTaiJi.yearGZ}（{nyTaiJi.yearStemChangSheng}）· {nyTaiJi.yearStemJiXiong}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{nyTaiJi.yearStemReason}</p>
          </div>
          <div className="border border-border bg-muted/20 p-3.5">
            <div className="label-mono text-[10px] text-primary">02 年支作用 · 根器落实</div>
            <div className="mt-1 text-sm font-bold text-foreground">{nyTaiJi.yearBranchAction}</div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{nyTaiJi.yearBranchReason}</p>
          </div>
          <div className="border border-border bg-muted/20 p-3.5">
            <div className="label-mono text-[10px] text-primary">03 月令两仪 · 气机厚薄</div>
            <div className="mt-1 text-xs font-bold text-foreground">
              阳仪 {nyTaiJi.yangYi.stem}（{nyTaiJi.yangYi.state} · {nyTaiJi.yangYi.power}分） / 阴仪 {nyTaiJi.yinYi.stem}（{nyTaiJi.yinYi.state} · {nyTaiJi.yinYi.power}分）
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {nyTaiJi.yangYi.verdict} {nyTaiJi.yinYi.verdict}
            </p>
          </div>
          <div className="border border-border bg-muted/20 p-3.5">
            <div className="label-mono text-[10px] text-primary">04 日时动应 · 维护与破坏</div>
            <div className="mt-1 text-sm font-bold text-foreground">
              整体动应：{nyTaiJi.riShiEffect}{nyTaiJi.riShiYiNian ? ' · 宜年顺遂' : ''}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{nyTaiJi.riShiReason}</p>
          </div>
        </div>
      </Detail>

      {/* 生克权流转 & 老高判据复核 */}
      {(guFaPangZheng?.shengKeQuan || laoGaoRules) && (
        <Detail label="理气法生克权流转与老高判据复核（不计入分数）" open={fullView}>
          <div className="grid gap-3 md:grid-cols-2">
            {guFaPangZheng?.shengKeQuan && (
              <div className="border border-border bg-muted/20 p-3.5">
                <div className="text-xs font-bold text-foreground">原局生克权流转链</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {guFaPangZheng.shengKeQuan.chain.map((step, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs">
                      {i > 0 && <span className="text-muted-foreground">→</span>}
                      <span className="border border-border bg-card px-2 py-0.5 font-bold text-foreground">
                        {step.label}（{step.via}）
                      </span>
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {guFaPangZheng.shengKeQuan.description}
                </p>
                {guFaPangZheng.shengKeQuanShift && (
                  <p className="mt-1.5 border-t border-border/60 pt-1.5 text-xs text-foreground">
                    <strong>当前大运（{guFaPangZheng.currentDaYunGanZhi}）：</strong>
                    {guFaPangZheng.shengKeQuanShift.description}
                  </p>
                )}
              </div>
            )}

            {laoGaoRules && (
              <div className="border border-border bg-muted/20 p-3.5 space-y-1.5 text-xs">
                <div className="font-bold text-foreground">柱意 · 十神克向 · 跨气克门控</div>
                {laoGaoRules.zhuYi.length > 0 && (
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">柱意优先：</strong>
                    {laoGaoRules.zhuYi.map((z) => `${z.ganzhi}：${z.note.replace(/。$/, '')}`).join('；')}。
                  </p>
                )}
                {laoGaoRules.shiShen.length > 0 && (
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">十神克向：</strong>
                    {laoGaoRules.shiShen.join('；')}。
                  </p>
                )}
                {laoGaoRules.blockedKe.length > 0 && (
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">跨气未成克：</strong>
                    {laoGaoRules.blockedKe.slice(0, 3).map((k) => `${k.from}克${k.to}`).join('、')} 等 {laoGaoRules.blockedKe.length} 处判平不计分。
                  </p>
                )}
                {laoGaoRules.zhuYi.length === 0 && laoGaoRules.shiShen.length === 0 && laoGaoRules.blockedKe.length === 0 && (
                  <p className="text-muted-foreground">本盘未触发额外跨气克门控或特殊柱意例外。</p>
                )}
              </div>
            )}
          </div>
        </Detail>
      )}
    </SectionFrame>
  );
}
