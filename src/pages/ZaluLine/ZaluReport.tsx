import { judgeZalu, type ZaluVerdict } from '@/analysis/zalu/judge';
import type { BaZiChart } from '@/analysis/common/baziCalculator';

interface DaYunLike {
  stem: string;
  branch: string;
  startAge: number;
  startYear: number;
  endYear: number;
  fortune: string;
  displayScore: number;
  description: string;
}

interface ZaluProps {
  chart: BaZiChart;
  analysis?: {
    daYunAnalysis?: {
      daYunWithFortune: DaYunLike[];
      currentDaYunIndex: number;
    };
  };
}

const SECTIONS = [
  { no: '01', en: 'VERDICT', title: '三项总断' },
  { no: '02', en: 'ACADEMIC', title: '学业断法' },
  { no: '03', en: 'LOVE', title: '爱情婚姻' },
  { no: '04', en: 'WEALTH', title: '财富事业' },
  { no: '05', en: 'FORTUNE', title: '行运十神对照' },
] as const;

function SectionHead({ no, en, title }: { no: string; en: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border pb-2.5">
      <span className="section-num inline-flex h-5 items-center border border-primary/40 bg-primary/10 px-1.5 font-mono text-[10.5px] font-bold text-primary">
        {no}
      </span>
      <span className="label-mono text-[10px] tracking-[0.14em] text-muted-foreground">{en}</span>
      <span className="h-3.5 w-px bg-border" />
      <span className="font-editorial text-base font-bold tracking-[0.1em] text-foreground">{title}</span>
    </div>
  );
}

const STEM_EL: Record<string, string> = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
const GEN: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const CTRL: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
const YANG = new Set('甲丙戊庚壬子寅辰午申戌');

const tenGod = (me: string, other: string) => {
  const a = STEM_EL[me];
  const b = STEM_EL[other];
  const same = YANG.has(me) === YANG.has(other);
  if (a === b) return same ? '比肩' : '劫财';
  if (GEN[a] === b) return same ? '食神' : '伤官';
  if (CTRL[a] === b) return same ? '偏财' : '正财';
  if (CTRL[b] === a) return same ? '七杀' : '正官';
  return same ? '偏印' : '正印';
};

const fortuneHint = (god: string, gender: 'male' | 'female') => {
  if (/印/.test(god)) return '学业有靠，财宜守';
  if (/官/.test(god)) return gender === 'female' ? '名位与感情同动' : '名位上升，感情次之';
  if (/财/.test(god)) return gender === 'male' ? '财务与感情同动' : '进财，感情慢';
  if (/食|伤/.test(god)) return '凭技艺吃饭，感情少主动';
  return '同辈拉扯，破财之象';
};

/** 大杂烩线：跨门派规则整合专题报告 */
export function ZaluReport({ chart, analysis }: ZaluProps) {
  const v = judgeZalu(chart);
  const duns = analysis?.daYunAnalysis?.daYunWithFortune ?? [];
  const current = analysis?.daYunAnalysis?.currentDaYunIndex ?? 0;
  const cards: ZaluVerdict[] = [v.xueye, v.aiqing, v.caifu];

  return (
    <div className="reveal space-y-6">
      <section className="border border-border bg-card">
        <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border bg-muted/35 px-4 py-4 md:px-6">
          <div>
            <p className="label-mono text-primary">ZALU LINE · 跨门派综合断法</p>
            <h2 className="font-editorial mt-1 text-2xl font-black tracking-[0.08em] text-foreground md:text-3xl">
              大杂烩线 · 三判合参
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            各派只取能落成确定规则的判据（印星 / 月令 / 宫位 / 财官 / 冲合），只吃四柱排盘结果，不混套阴阳线用忌标色。
          </p>
        </header>

        <div className="space-y-7 p-4 md:p-6">
          {/* 01 总断三卡 */}
          <div>
            <SectionHead {...SECTIONS[0]} />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {cards.map((c) => (
                <article key={c.title} className="border border-border bg-muted/20 p-4" style={{ borderTop: '2.5px solid var(--primary)' }}>
                  <div className="flex items-baseline justify-between">
                    <p className="label-mono text-muted-foreground">{c.title}</p>
                    <span className="num-tabular text-[11px] font-bold text-primary">分 {c.score}</span>
                  </div>
                  <p className="font-editorial mt-2 text-2xl font-black tracking-tight text-foreground">{c.level}</p>
                  <p className="mt-2 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground">{c.caveat}</p>
                </article>
              ))}
            </div>
          </div>

          {/* 02–04 逐项分论 */}
          {cards.map((c, idx) => (
            <div key={c.title}>
              <SectionHead no={SECTIONS[idx + 1].no} en={SECTIONS[idx + 1].en} title={c.title} />
              <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr]">
                <div className="border border-border bg-muted/25 p-4">
                  <p className="label-mono text-muted-foreground">主判档位</p>
                  <p className="font-editorial mt-1.5 text-3xl font-black tracking-tight text-foreground">{c.level}</p>
                  <p className="num-tabular mt-2 text-xs font-bold text-primary">综合得分 {c.score}</p>
                </div>
                <div className="border border-border bg-card p-4">
                  <p className="label-mono text-muted-foreground">推演依据 / BASIS</p>
                  <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-foreground/90">
                    {c.lines.map((line) => (
                      <li key={line} className="border-l-2 border-primary/45 pl-3">
                        {line}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">{c.caveat}</p>
                </div>
              </div>
            </div>
          ))}

          {/* 05 大运十神提示表 */}
          <div>
            <SectionHead {...SECTIONS[4]} />
            {duns.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">需要明确公历出生年份才能推演大运顺序。</p>
            ) : (
              <div className="mt-4 overflow-x-auto border border-border">
                <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/35 text-muted-foreground">
                      <th className="px-3.5 py-2.5 font-bold">大运</th>
                      <th className="px-3.5 py-2.5 font-bold">起止年龄</th>
                      <th className="px-3.5 py-2.5 font-bold">年份区间</th>
                      <th className="px-3.5 py-2.5 font-bold">透干十神</th>
                      <th className="px-3.5 py-2.5 font-bold">对三判流向提示</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duns.slice(0, 8).map((d, i) => {
                      const god = tenGod(chart.day.stem, d.stem);
                      const isCur = i === current;
                      return (
                        <tr key={`${d.stem}${d.branch}`} className={`border-b border-border/70 last:border-b-0 ${isCur ? 'bg-primary/[0.06]' : 'bg-card'}`}>
                          <td className="font-editorial px-3.5 py-2.5 text-sm font-black text-foreground">
                            {d.stem}{d.branch}
                            {isCur && (
                              <span className="label-mono ml-2 border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                当前
                              </span>
                            )}
                          </td>
                          <td className="num-tabular px-3.5 py-2.5 text-foreground/85">{d.startAge}–{d.startAge + 9} 岁</td>
                          <td className="num-tabular px-3.5 py-2.5 text-foreground/85">{d.startYear}–{d.endYear}</td>
                          <td className="px-3.5 py-2.5 font-semibold text-foreground">{god}</td>
                          <td className="px-3.5 py-2.5 text-muted-foreground">{fortuneHint(god, chart.gender)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <span>取：子平印星 · 真诠月令 · 通会财官 · 宫位 · 冲合</span>
            <span>舍：神煞 · 纳音 · 寿夭</span>
          </div>
        </div>
      </section>
    </div>
  );
}
