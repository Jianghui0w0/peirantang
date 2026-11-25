import MingJuFieldChart from '@/components/MingJuFieldChart';
import ChangShengRingChart from '@/components/ChangShengRingChart';
import type { BaZiChart } from '@/analysis/common/baziCalculator';
import type {
  ChangShengRingResult,
  ChunQiuFactorResult,
  GanZhiZiHeHit,
  GuFaPangZheng,
  MonthQiResult,
  XianDuanResult,
  YongJiResult,
  letterFromScore,
} from '@/analysis/yinyang/engine';
import type { EducationVerdict } from '@/analysis/yinyang/xiangfa';
import type { YinyangAnalysis } from '@/analysis';
import { ELEMENT_COLORS, ELEMENT_NAMES, LETTER_STYLE, fmtScore } from '../constants';
import {
  Detail,
  MetricCard,
  MonthRiZhuChangShengCard,
  SectionFrame,
  SegmentBar,
} from './ReportPrimitives';

interface OverviewAndMonthSectionProps {
  chart: BaZiChart;
  analysis: YinyangAnalysis;
  monthQi: MonthQiResult;
  yongJi: YongJiResult;
  mingPanScore: NonNullable<YinyangAnalysis['mingPanScore']>;
  wealthNobility: NonNullable<YinyangAnalysis['wealthNobility']>;
  daYunAnalysis: NonNullable<YinyangAnalysis['daYunAnalysis']>;
  educationVerdict: EducationVerdict | null;
  xianDuan: XianDuanResult | null;
  chunQiuFactor: ChunQiuFactorResult | null;
  ganZhiZiHe: GanZhiZiHeHit[];
  changShengRing: ChangShengRingResult | null;
  guFaPangZheng: GuFaPangZheng | null;
  fullView: boolean;
  gradeFn: typeof letterFromScore;
}

/** 02 命主速览与格局总论 + 03 月气分析与十二长生 */
export default function OverviewAndMonthSection({
  chart,
  analysis,
  monthQi,
  yongJi,
  mingPanScore,
  wealthNobility,
  daYunAnalysis,
  educationVerdict,
  xianDuan,
  chunQiuFactor,
  ganZhiZiHe,
  changShengRing,
  guFaPangZheng,
  fullView,
  gradeFn,
}: OverviewAndMonthSectionProps) {
  // 综合评分口径：60% 原局基准 + 40% 八步大运均分，经由同源九档定级函数映射
  const mingRaw = mingPanScore.displayScore ?? 0;
  const daysArr = daYunAnalysis.daYunWithFortune ?? [];
  const dyAvg = daysArr.length
    ? Math.round((daysArr.reduce((acc, x) => acc + (x.displayScore ?? x.score ?? 0), 0) / daysArr.length) * 10) / 10
    : 0;
  const combinedRaw = Math.round((mingRaw * 0.6 + dyAvg * 0.4) * 10) / 10;
  const overall = Math.max(0, Math.min(100, Math.round(50 + combinedRaw * 5)));
  const letterRes = gradeFn(combinedRaw * 3.6);
  const ls = LETTER_STYLE[letterRes.level] ?? LETTER_STYLE['B+'];

  const elPower = analysis.elementPower;
  const yangPct = Math.round(elPower.wood + elPower.fire);
  const yinPct = Math.round(elPower.metal + elPower.water);
  const earthPct = Math.round(elPower.earth);

  return (
    <div className="space-y-6">
      {/* ========== 02 命主速览 · 格局总论 ========== */}
      <SectionFrame
        id="section-overview"
        metaKey="overview"
        badge={
          <span
            className="label-mono rounded-[2px] border px-2 py-0.5 text-[10px] font-bold"
            style={{ borderColor: ls.border, background: ls.bg, color: ls.text }}
          >
            格局总评 · {analysis.pattern.patternType}
          </span>
        }
        aside={
          <>
            <div className="label-mono text-primary">MARGIN NOTE · 口径批注</div>
            <p>
              <strong>九档评级：</strong>原局占 60%、八步大运均分占 40%，归并至 <span className="num-tabular font-bold text-foreground">0–100</span> 尺度供横向对照。
            </p>
            <p>
              <strong>五行结构：</strong>当前木火阳气 {yangPct}%、金水阴气 {yinPct}%、土枢机 {earthPct}%。
            </p>
            <div className="border-t border-border/80 pt-2.5">
              <div className="font-bold text-foreground">原局细项得分</div>
              <ul className="mt-1 space-y-1 text-[11px]">
                {mingPanScore.detail.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          </>
        }
      >
        {/* 5 张核心结论卡（移动端单列全宽避免文字竖排拥挤） */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. 日主本象 */}
          <MetricCard
            label="日主 DAY MASTER"
            value={`${chart.day.stem}${chart.day.branch}`}
            sub={`${ELEMENT_NAMES[chart.day.stemElement]} · ${chart.day.stemYinYang === 'yang' ? '阳' : '阴'}`}
            tone={ELEMENT_COLORS[chart.day.stemElement] ?? 'var(--primary)'}
            note={`生于 ${monthQi.monthName}（${monthQi.fourSymbol}当令）· 判据方向 ${analysis.direction === 'yang' ? '用阳补温' : '用阴润降'}`}
          />

          {/* 2. 综合分与九档 */}
          <MetricCard
            label="格局综合 OVERALL"
            value={letterRes.level}
            sub={`${overall} / 100`}
            tone={ls.text}
            href="#section-dayun"
            bar={
              <div>
                <div className="h-1.5 w-full overflow-hidden bg-muted">
                  <div className="h-full transition-all" style={{ width: `${overall}%`, background: ls.text }} />
                </div>
                <div className="mt-1 flex justify-between text-[9px] font-semibold text-muted-foreground num-tabular">
                  {['0', '25', '50', '75', '100'].map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            }
            note={`原局 ${fmtScore(mingRaw)} · 大运均分 ${fmtScore(dyAvg)}（${daysArr.length} 步）`}
          />

          {/* 3. 学历倾向 */}
          {educationVerdict && (() => {
            const t = educationVerdict.tendency;
            const col = t === 'elite' ? 'var(--semantic-useful)' : t === 'weak' ? 'var(--semantic-taboo)' : 'var(--semantic-neutral)';
            const segs = ['初中', '高中', '大专', '本科', '硕士', '博士'];
            const band: [number, number] = t === 'elite' ? [3, 5] : t === 'weak' ? [0, 2] : [1, 3];
            const active = segs.map((_, i) => i).filter((i) => i >= band[0] && i <= band[1]);
            return (
              <MetricCard
                tone={col}
                href="#section-xiangfa"
                label="学历倾向 EDUCATION"
                value={educationVerdict.tendencyLabel}
                bar={<SegmentBar tone={col} segs={segs} active={active} />}
                note={`大概率落在 ${segs[band[0]]} ~ ${segs[band[1]]} 区间`}
              />
            );
          })()}

          {/* 4. 财富区间 */}
          {(() => {
            const col = 'var(--semantic-amber)';
            const segs = ['贫', '温饱', '小康', '小富', '大富'];
            const wl = wealthNobility.wealthLevel;
            const band: [number, number] =
              wl === '富' ? [3, 4] : wl === '小康' ? [2, 2] : wl === '小康偏下' ? [1, 2] : wl === '偏贫' ? [0, 1] : [0, 0];
            const label = wl === '富' ? '富裕倾向' : wl === '小康' ? '小康倾向' : wl === '小康偏下' ? '温饱至小康' : '温饱偏紧';
            const active = segs.map((_, i) => i).filter((i) => i >= band[0] && i <= band[1]);
            return (
              <MetricCard
                tone={col}
                href="#section-xiangfa"
                label="财富层级 WEALTH"
                value={label}
                bar={<SegmentBar tone={col} segs={segs} active={active} />}
                note={`大概率落在 ${segs[band[0]]}${band[0] !== band[1] ? ` ~ ${segs[band[1]]}` : ''} 区间`}
              />
            );
          })()}

          {/* 5. 事业地位 */}
          {(() => {
            const col = 'var(--semantic-sky)';
            const segs = ['偏弱', '平常', '显贵'];
            const nl = wealthNobility.nobilityLevel;
            const band: [number, number] = nl === '贵' ? [2, 2] : nl === '平常' ? [1, 1] : [0, 0];
            const label = nl === '贵' ? '贵气倾向' : nl === '平常' ? '平常稳定' : '根基尚浅';
            const active = segs.map((_, i) => i).filter((i) => i >= band[0] && i <= band[1]);
            return (
              <MetricCard
                tone={col}
                href="#section-xiangfa"
                label="事业地位 CAREER"
                value={label}
                bar={<SegmentBar tone={col} segs={segs} active={active} />}
                note={`大概率落在 ${segs[band[0]]} 区间（不判寿夭）`}
                className="sm:col-span-2 lg:col-span-2"
              />
            );
          })()}
        </div>

        {/* 格局文字总述 */}
        <div className="mt-4 border border-border bg-muted/25 p-4">
          <div className="label-mono mb-1.5 text-[10px] text-primary">格局结构总论</div>
          <p className="text-sm leading-relaxed text-foreground">{analysis.pattern.description}</p>
        </div>

        {/* 02·A 命局函数场交互曲线（可折叠旁证） */}
        <Detail label="02·A 命局函数曲线 f(五行) · 阴阳二气与理想虚影交互演练" badge="交互旁证" open={fullView}>
          <MingJuFieldChart chart={chart} yongJi={yongJi} />
        </Detail>

        {/* 02·B 四柱限段 */}
        {xianDuan && (
          <Detail
            label={`02·B 四柱限段 · 人生阶段应验（当前：${xianDuan.currentPosition} · ${xianDuan.currentSegment}）`}
            badge={`v${xianDuan.version}`}
            open={fullView}
          >
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {xianDuan.entries.map((e) => {
                const col =
                  e.tendency === '顺' ? 'var(--semantic-useful)' : e.tendency === '逆' ? 'var(--semantic-taboo)' : 'var(--semantic-neutral)';
                return (
                  <div
                    key={e.position}
                    className={`border p-3 ${e.isCurrent ? 'border-primary bg-primary/[0.04]' : 'border-border bg-muted/20'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {e.position} · {e.ganzhi}
                      </span>
                      <span className="label-mono text-[10px] font-bold" style={{ color: col }}>
                        {e.tendencyLabel}（{fmtScore(e.score)}）
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {e.ageRange} · {e.theme}
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/85">{e.reason}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-foreground">{xianDuan.verdict}</p>
          </Detail>
        )}
      </SectionFrame>

      {/* ========== 03 月气分析 · 十二长生 ========== */}
      <SectionFrame
        id="section-monthqi"
        metaKey="monthqi"
        badge={
          <span className="label-mono rounded-[2px] border border-border bg-background px-2 py-0.5 text-[10px] text-foreground">
            {monthQi.monthName} · {monthQi.solarTerm} · {monthQi.fourSymbol}
          </span>
        }
        aside={
          <>
            <div className="label-mono text-primary">MONTH ARCHIVE · 月令提纲</div>
            {monthQi.coreMantra && (
              <p className="font-bold text-foreground">{monthQi.coreMantra}</p>
            )}
            <p>{monthQi.coreXiJi}</p>
            {guFaPangZheng?.siLing && (
              <div className="border-t border-border/80 pt-2.5">
                <div className="font-bold text-foreground">司令真神（分日用事）</div>
                <p className="mt-1 text-[11px]">
                  当令主气：<strong className="text-primary">{guFaPangZheng.siLing.ruler ?? guFaPangZheng.siLing.zhenShen}</strong>
                  {guFaPangZheng.siLing.daysIntoMonth !== null && `（交节后第 ${guFaPangZheng.siLing.daysIntoMonth} 日）`}
                </p>
                <p className="mt-0.5 text-[11px]">{guFaPangZheng.siLing.note}</p>
              </div>
            )}
          </>
        }
      >
        {/* 2-up 核心呈现：月对日主长生状态 + 十二长生圆环波 */}
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-3">
            <MonthRiZhuChangShengCard
              monthBranch={chart.month.branch}
              dayStem={chart.day.stem}
              monthQi={monthQi}
            />
            <div className="border border-border bg-muted/20 p-4">
              <div className="label-mono mb-1.5 text-[10px] text-muted-foreground">月气阴阳态势详述</div>
              <p className="text-sm leading-relaxed text-foreground">{monthQi.description}</p>
              <Detail label="查看月令全十干长生口诀原文" open={fullView}>
                <p className="text-xs leading-relaxed text-muted-foreground">{monthQi.detailedDesc}</p>
              </Detail>
            </div>
          </div>

          {changShengRing && (
            <div className="border border-border bg-muted/15 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="label-mono text-[10px] font-bold text-primary">十二长生环序圆环</span>
                <span className="text-[10.5px] text-muted-foreground">实心高亮＝原局天干</span>
              </div>
              <div className="mx-auto max-w-[300px]">
                <ChangShengRingChart ring={changShengRing} />
              </div>
              <p className="mt-2 border-t border-border/70 pt-2 text-[11.5px] leading-relaxed text-muted-foreground">
                {changShengRing.verdict}
              </p>
            </div>
          )}
        </div>

        {/* 春秋月分段 & 干支自合旁证 */}
        {(chunQiuFactor || ganZhiZiHe.length > 0) && (
          <Detail label="春秋月三段因子 · 干支自合标记（旁证）" open={fullView}>
            <div className="grid gap-3 md:grid-cols-2">
              {chunQiuFactor && (
                <div className="border border-border bg-muted/20 p-3.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {chunQiuFactor.monthName} · {chunQiuFactor.taijiName}
                    </span>
                    {chunQiuFactor.round && (
                      <span className="label-mono rounded-[2px] border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-bold text-primary">
                        {chunQiuFactor.round.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{chunQiuFactor.summary}</p>
                </div>
              )}

              {ganZhiZiHe.length > 0 && (
                <div className="border border-border bg-muted/20 p-3.5">
                  <div className="mb-1.5 text-xs font-bold text-foreground">
                    柱内干支自合（共命中 {ganZhiZiHe.length} 柱）
                  </div>
                  <div className="space-y-1.5">
                    {ganZhiZiHe.map((h) => (
                      <div key={h.position} className="text-xs leading-relaxed text-muted-foreground">
                        <strong className="text-foreground">{h.position} {h.ganzhi}（{h.he}）：</strong>
                        {h.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Detail>
        )}
      </SectionFrame>
    </div>
  );
}
