import type {
  TaiJiQiResult,
  YongJiResult,
  ZhuZiEntry,
  ZhuZiXiJiResult,
} from '@/analysis/yinyang/engine';
import type { EarthXiJiResult } from '@/analysis/yinyang/xiangfa';
import { ELEMENT_COLORS, ELEMENT_NAMES } from '../constants';
import { Detail, SectionFrame, SplitBody } from './ReportPrimitives';

interface YongJiAndPatternSectionProps {
  yongJi: YongJiResult;
  taiJiQi: TaiJiQiResult | null;
  earthXiJi: EarthXiJiResult | null;
  zhuZiXiJi: ZhuZiXiJiResult | null;
  chartChars: Set<string>;
  fullView: boolean;
}

/** 04 用神忌神判断 · 太极配比 · 土专区 · 逐字喜忌 */
export default function YongJiAndPatternSection({
  yongJi,
  taiJiQi,
  earthXiJi,
  zhuZiXiJi,
  chartChars,
  fullView,
}: YongJiAndPatternSectionProps) {
  const usefulNames = yongJi.usefulElements.map((e) => ELEMENT_NAMES[e] ?? e);
  const tabooNames = yongJi.tabooElements.map((e) => ELEMENT_NAMES[e] ?? e);

  const renderZhuZiCard = (entry: ZhuZiEntry) => {
    const inNativeChart = chartChars.has(entry.char);
    const markMeta =
      entry.mark === 'xi'
        ? { label: '喜', color: 'var(--semantic-useful)', bg: 'var(--semantic-useful-bg)', border: 'var(--semantic-useful-border)' }
        : entry.mark === 'ji'
          ? { label: '忌', color: 'var(--semantic-taboo)', bg: 'var(--semantic-taboo-bg)', border: 'var(--semantic-taboo-border)' }
          : { label: '待定', color: 'var(--semantic-neutral)', bg: 'var(--muted)', border: 'var(--border)' };

    return (
      <div
        key={entry.char}
        title={entry.note}
        className={`flex flex-col justify-between border p-2 text-center transition-colors ${
          inNativeChart ? 'ring-1 ring-primary/60' : ''
        }`}
        style={{ borderColor: markMeta.border, background: inNativeChart ? markMeta.bg : 'var(--card)' }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9.5px] font-bold" style={{ color: ELEMENT_COLORS[entry.element] ?? 'var(--muted-foreground)' }}>
            {ELEMENT_NAMES[entry.element] ?? entry.element}
          </span>
          <span className="label-mono text-[9px] font-black" style={{ color: markMeta.color }}>
            {markMeta.label}
          </span>
        </div>
        <div className="font-editorial my-1 text-lg font-black text-foreground">{entry.char}</div>
        {inNativeChart && (
          <div className="label-mono bg-primary/10 px-1 py-0 text-[8.5px] font-bold text-primary">
            原局
          </div>
        )}
      </div>
    );
  };

  return (
    <SectionFrame
      id="section-yongji"
      metaKey="yongji"
      badge={
        <span className="label-mono rounded-[2px] border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
          {yongJi.directionSource === 'taiji' ? '太极二气定方向' : '月令固有二分'}
        </span>
      }
      aside={
        <>
          <div className="label-mono text-primary">RULE SOURCE · 判据边界</div>
          <p>{yongJi.description}</p>
          {yongJi.overrideNotes.length > 0 && (
            <div className="border-t border-border/80 pt-2.5">
              <div className="font-bold text-foreground">干支级取用例外说明</div>
              <ul className="mt-1 space-y-1 text-[11px]">
                {yongJi.overrideNotes.map((n, i) => (
                  <li key={i}>· {n}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="border-t border-border/80 pt-2 text-[11px]">
            注：土不按木火金水整体归边，单独按干支刚柔（戊辰未 vs 己丑戌）随月令判定。
          </p>
        </>
      }
    >
      {/* 用忌对称两栏 */}
      <SplitBody
        leftLabel={`用神所喜（${usefulNames.join(' · ') || '调和'}）`}
        leftTone="var(--semantic-useful)"
        leftItems={[
          `宜取五行：${usefulNames.join('、') || '见干支逐字表'}`,
          '大运流年逢用神落地或生扶，则全局趋于平顺有为。',
        ]}
        rightLabel={`忌神所避（${tabooNames.join(' · ') || '平'}）`}
        rightTone="var(--semantic-taboo)"
        rightItems={[
          `宜制五行：${tabooNames.join('、') || '无显忌'}`,
          '忌神再旺则易加剧原局偏枯，宜见克泄制化以存清气。',
        ]}
      />

      {/* 太极二气配比定量条 */}
      {taiJiQi && (() => {
        const total = Math.max(0.01, taiJiQi.yangQi + taiJiQi.yinQi);
        const yangRatioPct = Math.round((taiJiQi.yangQi / total) * 100);
        const yinRatioPct = 100 - yangRatioPct;
        const bandColor =
          taiJiQi.band === '阳过' ? 'var(--qi-yang)' : taiJiQi.band === '阴过' ? 'var(--qi-yin)' : 'var(--semantic-useful)';
        return (
          <div className="mt-4 border border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="label-mono text-[10px] font-bold text-primary">太极二气定量配比（{taiJiQi.modeLabel}）</span>
                <div className="mt-0.5 text-sm font-bold text-foreground">{taiJiQi.verdict}</div>
              </div>
              <span
                className="label-mono rounded-[2px] border px-2.5 py-0.5 text-xs font-black"
                style={{ borderColor: bandColor, color: bandColor, background: 'var(--card)' }}
              >
                {taiJiQi.band}
              </span>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs font-bold num-tabular">
                <span style={{ color: 'var(--qi-yang)' }}>阳仪存量 {taiJiQi.yangQi.toFixed(1)}（{yangRatioPct}%）</span>
                <span style={{ color: 'var(--qi-yin)' }}>阴仪存量 {taiJiQi.yinQi.toFixed(1)}（{yinRatioPct}%）</span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden border border-border">
                <div style={{ width: `${yangRatioPct}%`, background: 'var(--qi-yang)' }} />
                <div style={{ width: `${yinRatioPct}%`, background: 'var(--qi-yin)' }} />
              </div>
            </div>

            {taiJiQi.hardCondition && (
              <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                <strong>硬条件检核：</strong>{taiJiQi.hardCondition}
              </p>
            )}
          </div>
        );
      })()}

      {/* 土专区（修复旧版 #FCD34D 低对比浅黄文字问题，统一改为高对比赭石棕 var(--el-earth)） */}
      {earthXiJi && (
        <div
          className="mt-4 border p-4"
          style={{
            borderColor: 'var(--semantic-amber-border)',
            background: 'var(--semantic-amber-bg)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="label-mono px-2 py-0.5 text-[10px] font-black text-white"
                style={{ background: 'var(--el-earth)' }}
              >
                土专区 · 独立判据
              </span>
              <span className="font-editorial text-sm font-black" style={{ color: 'var(--el-earth)' }}>
                {earthXiJi.overall}
              </span>
            </div>
            <span
              className="label-mono rounded-[2px] border bg-card px-2 py-0.5 text-[10px] font-bold"
              style={{
                borderColor:
                  earthXiJi.decision === 'useful'
                    ? 'var(--semantic-useful-border)'
                    : earthXiJi.decision === 'taboo'
                      ? 'var(--semantic-taboo-border)'
                      : 'var(--border)',
                color:
                  earthXiJi.decision === 'useful'
                    ? 'var(--semantic-useful)'
                    : earthXiJi.decision === 'taboo'
                      ? 'var(--semantic-taboo)'
                      : 'var(--muted-foreground)',
              }}
            >
              {earthXiJi.decision === 'useful' ? '整体宜用' : earthXiJi.decision === 'taboo' ? '整体宜忌' : '视字细辨'}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-foreground/90">{earthXiJi.reason}</p>
          {earthXiJi.details.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {earthXiJi.details.map((d) => (
                <div key={d.ganzhi} className="border border-border/80 bg-card/85 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-editorial font-black text-foreground">{d.ganzhi}土</span>
                    <span
                      className="label-mono text-[10px] font-bold"
                      style={{
                        color:
                          d.mark === 'useful'
                            ? 'var(--semantic-useful)'
                            : d.mark === 'taboo'
                              ? 'var(--semantic-taboo)'
                              : 'var(--semantic-neutral)',
                      }}
                    >
                      {d.mark === 'useful' ? '用神' : d.mark === 'taboo' ? '忌神' : '待定'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{d.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 逐字喜忌完整参考表 */}
      {zhuZiXiJi && (
        <Detail
          label={`干支逐字喜忌完整参考表（${zhuZiXiJi.monthBranch}月 · 悬停各字可看口诀释义）`}
          badge={zhuZiXiJi.roundName || zhuZiXiJi.directionLabel}
          open={fullView}
        >
          <p className="text-xs leading-relaxed text-muted-foreground">{zhuZiXiJi.patternNote}</p>
          <div className="space-y-3">
            <div>
              <div className="label-mono mb-1.5 text-[10px] text-muted-foreground">十天干逐字喜忌</div>
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                {zhuZiXiJi.stems.map(renderZhuZiCard)}
              </div>
            </div>
            <div>
              <div className="label-mono mb-1.5 text-[10px] text-muted-foreground">十二地支逐字喜忌</div>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                {zhuZiXiJi.branches.map(renderZhuZiCard)}
              </div>
            </div>
          </div>
          <div className="text-[10.5px] text-muted-foreground">资料依据：{zhuZiXiJi.source}</div>
        </Detail>
      )}
    </SectionFrame>
  );
}
