import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  GuFaPangZheng,
  WuXingQuXiangResult,
} from '@/analysis/yinyang/engine';
import type { EducationVerdict, XiangYiVerdict } from '@/analysis/yinyang/xiangfa';
import { ZHI_ZUO_YONG_RULES } from '@/data/baziData';
import { SectionFrame, VerdictPanel, XiangYiPanel } from './ReportPrimitives';

interface XiangFaSectionProps {
  xiangYi: XiangYiVerdict | null;
  educationVerdict: EducationVerdict | null;
  wuXingQuXiang: WuXingQuXiangResult | null;
  guFaPangZheng: GuFaPangZheng | null;
  fullView: boolean;
}

/** 06 象意 · 学历 · 五行取象 · 古法旁证（精读模式下分页签浏览，全量模式一并展开） */
export default function XiangFaSection({
  xiangYi,
  educationVerdict,
  wuXingQuXiang,
  guFaPangZheng,
  fullView,
}: XiangFaSectionProps) {
  const coreVerdictsBlock = (
    <div className="space-y-5">
      {xiangYi && <XiangYiPanel verdict={xiangYi} />}

      {educationVerdict && (
        <div className="border-t border-border pt-4">
          <VerdictPanel
            subtitle="学业与学历倾向 · 回测仅两端有显著信号（中段按区间参考，不作单一绝对分值定论）"
            inputs={educationVerdict.inputs}
            matched={educationVerdict.matched}
            result={`${educationVerdict.tendencyLabel} —— ${educationVerdict.tendencyDesc} ${educationVerdict.result}`}
            disclaimer={educationVerdict.disclaimer}
            accent={
              educationVerdict.tendency === 'elite'
                ? 'emerald'
                : educationVerdict.tendency === 'weak'
                  ? 'rose'
                  : 'sky'
            }
          />
        </div>
      )}
    </div>
  );

  const wuXingAndZhiRulesBlock = (
    <div className="space-y-5">
      {wuXingQuXiang && (
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground">五行取象（从理到象 · v{wuXingQuXiang.version}）</span>
            <span className="text-[11px] text-muted-foreground">{wuXingQuXiang.verdict}</span>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
            {wuXingQuXiang.entries.map((q) => {
              const col =
                q.mark === 'useful'
                  ? 'var(--semantic-useful)'
                  : q.mark === 'taboo'
                    ? 'var(--semantic-taboo)'
                    : 'var(--semantic-neutral)';
              return (
                <div key={q.element} className="border border-border bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-editorial text-base font-black text-foreground">
                      {q.name}（{q.powerPct}%）
                    </span>
                    <span className="label-mono text-[10px] font-bold" style={{ color: col }}>
                      {q.markLabel}{q.dominant ? ' · 主导' : ''}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{q.benXing}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{q.reading}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {q.xiang.slice(0, 4).map((x) => (
                      <span key={x} className="border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <div className="mb-2 text-xs font-bold text-foreground">地支作用核心法则（{ZHI_ZUO_YONG_RULES.source}）</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {ZHI_ZUO_YONG_RULES.rules.map((r) => (
            <div key={r.id} className="border border-border bg-muted/20 p-3 text-xs">
              <div className="font-bold text-foreground">{r.rule}</div>
              <p className="mt-1 leading-relaxed text-muted-foreground">{r.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const guFaProofsBlock = guFaPangZheng ? (
    <div className="grid gap-3 md:grid-cols-2">
      {/* 气干 / 形干定性 */}
      <div className="border border-border bg-muted/20 p-3.5">
        <div className="mb-2 text-xs font-bold text-foreground">四柱天干 · 气干形干定性</div>
        <div className="space-y-1.5">
          {guFaPangZheng.qiXing.map((q) => (
            <div key={q.stem} className="flex items-start justify-between gap-2 border-b border-border/60 pb-1.5 text-xs last:border-b-0">
              <span className="shrink-0 font-bold" style={{ color: q.group === '阳' ? 'var(--qi-yang)' : 'var(--qi-yin)' }}>
                {q.stem} · {q.qiXing}
              </span>
              <span className="text-right text-[11px] text-muted-foreground">{q.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 天干四冲 · 地支六破 · 驿马 */}
      <div className="space-y-3 border border-border bg-muted/20 p-3.5 text-xs">
        <div>
          <div className="mb-1 font-bold text-foreground">天干四冲与地支六破</div>
          <div className="flex flex-wrap gap-1.5">
            {guFaPangZheng.tianGanChong.length === 0 && guFaPangZheng.liuPo.length === 0 ? (
              <span className="text-muted-foreground">四柱干支未见四冲与六破。</span>
            ) : (
              <>
                {guFaPangZheng.tianGanChong.map((c) => (
                  <span key={c} className="border px-2 py-0.5 font-bold" style={{ borderColor: 'var(--semantic-taboo-border)', color: 'var(--semantic-taboo)' }}>
                    {c}
                  </span>
                ))}
                {guFaPangZheng.liuPo.map((p) => (
                  <span key={p} className="border px-2 py-0.5 font-bold" style={{ borderColor: 'var(--semantic-amber-border)', color: 'var(--semantic-amber)' }}>
                    {p}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="border-t border-border/60 pt-2">
          <div className="mb-1 font-bold text-foreground">驿马查核</div>
          {guFaPangZheng.yiMa.map((m) => (
            <div key={m.from} className="text-[11px] text-muted-foreground">
              <strong style={{ color: m.hit ? 'var(--semantic-useful)' : 'var(--muted-foreground)' }}>
                {m.hit ? '命中' : '未见'}：
              </strong>
              {m.desc}
            </div>
          ))}
        </div>

        <div className="border-t border-border/60 pt-2">
          <div className="mb-1 font-bold text-foreground">形干同性重克</div>
          {guFaPangZheng.xingGanChongKe.length === 0 ? (
            <span className="text-[11px] text-muted-foreground">原局无同为形干的直接相克。</span>
          ) : (
            guFaPangZheng.xingGanChongKe.map((h, i) => (
              <div key={i} className="text-[11px]" style={{ color: 'var(--semantic-taboo)' }}>
                {h.attackerPillar}{h.attacker} 克 {h.defenderPillar}{h.defender}（{h.level}{h.isDayMaster ? ' · 及日主' : ''}）：{h.desc}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <SectionFrame
      id="section-xiangfa"
      metaKey="xiangfa"
      badge={<span className="label-mono text-[10px] text-muted-foreground">IMAGERY · PROOFS</span>}
      aside={
        <>
          <div className="label-mono text-primary">SCOPE · 旁证边界</div>
          <p>
            本版块汇集十干象意、学历回测区间、五行物象、地支作用规律及气形冲破驿马等古法旁证。
          </p>
          <p>
            以上均属「理在象先」的辅助参照，不参与主线用忌判定与综合分打分。
          </p>
        </>
      }
    >
      {fullView ? (
        <div className="space-y-6">
          {coreVerdictsBlock}
          <div className="border-t border-border pt-5">{wuXingAndZhiRulesBlock}</div>
          {guFaProofsBlock && <div className="border-t border-border pt-5">{guFaProofsBlock}</div>}
        </div>
      ) : (
        <Tabs defaultValue="core" className="w-full">
          <TabsList className="mb-4 flex flex-wrap border-b border-border">
            <TabsTrigger value="core">核心象意与学历倾向</TabsTrigger>
            <TabsTrigger value="element">五行取象与地支规律</TabsTrigger>
            <TabsTrigger value="gufa">气形 · 冲破 · 驿马旁证</TabsTrigger>
          </TabsList>
          <TabsContent value="core">{coreVerdictsBlock}</TabsContent>
          <TabsContent value="element">{wuXingAndZhiRulesBlock}</TabsContent>
          <TabsContent value="gufa">{guFaProofsBlock}</TabsContent>
        </Tabs>
      )}
    </SectionFrame>
  );
}
