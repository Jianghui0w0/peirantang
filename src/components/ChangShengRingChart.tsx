import React from 'react';
import type { ChangShengRingResult } from '@/analysis/yinyang/engine';
import { SHI_ER_CHANG_SHENG_CYCLE } from '@/data/baziData';

// ============================================================
// 十二长生环序 · 圆环波动机能图（纯函数旁证渲染层，不改引擎）
// 语义：12 个长生阶段沿圆周顺时针排布（绝为起点、ringIndex 0→11），
//       径向长度 = 该阶段气机分（正→向外、负→向内），圆心为零基准线。
//       峰在帝旺、谷在绝，波动一眼可读；原局所透之干以高亮方块落在其月令落点上。
// 可进化：阶段/分值唯一真源为 baziData.SHI_ER_CHANG_SHENG_CYCLE，本组件只消费、不复制。
// ============================================================

const ELEMENT_COLORS: Record<string, string> = {
  木: 'var(--el-wood)',
  火: 'var(--el-fire)',
  土: 'var(--el-earth)',
  金: 'var(--el-metal)',
  水: 'var(--el-water)',
};

const W = 380;
const CX = 190;
const CY = 190;
const R0 = 92; // 零基准半径
const K = 1.55; // 分值 → 像素
const LABEL_R = R0 + 52;

function polar(i: number, radius: number): { x: number; y: number } {
  const a = ((-90 + i * (360 / 12)) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
}

export default function ChangShengRingChart({ ring }: { ring: ChangShengRingResult }) {
  const stages = SHI_ER_CHANG_SHENG_CYCLE.stages;
  const maxAbs = Math.max(...stages.map((s) => Math.abs(s.power)), 1);

  // 12 点气机剖面（固定环序，与具体命盘无关）→ 闭合折线，表现「由弱到强、循环无端」的波动
  const profile = stages.map((s) => polar(s.ringIndex, R0 + s.power * K));
  const profilePath = profile.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  // 同一阶段槽位可能有多个天干 → 沿切向错开，避免相互遮挡
  const bySlot = new Map<number, ChangShengRingResult['entries']>();
  for (const e of ring.entries) {
    const idx = e.ringIndex >= 0 ? e.ringIndex : 0;
    const list = bySlot.get(idx) ?? [];
    list.push(e);
    bySlot.set(idx, list);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${W}`}
      role="img"
      aria-label="十二长生环序圆环图"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* 零基准圆（虚线：气机为零） */}
      <circle cx={CX} cy={CY} r={R0} fill="none" stroke="var(--chart-grid)" strokeWidth={1.1} strokeDasharray="3 3" />

      {/* 12 阶段辐条 + 外环 */}
      {stages.map((s) => {
        const p0 = polar(s.ringIndex, R0);
        const p1 = polar(s.ringIndex, LABEL_R - 10);
        const lp = polar(s.ringIndex, LABEL_R);
        const anchor = Math.abs(lp.x - CX) < 6 ? 'middle' : lp.x > CX ? 'start' : 'end';
        return (
          <g key={s.stage}>
            <line x1={CX} y1={CY} x2={p1.x} y2={p1.y} stroke="var(--chart-grid)" strokeOpacity={0.55} strokeWidth={1} />
            <circle cx={p0.x} cy={p0.y} r={1.8} fill="var(--chart-ghost)" />
            <text
              x={lp.x}
              y={lp.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={700}
              fill={s.power >= 18 ? 'var(--semantic-useful)' : s.power <= -12 ? 'var(--semantic-taboo)' : 'var(--chart-axis)'}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {s.stage}
            </text>
          </g>
        );
      })}

      {/* 气机剖面：12 阶段径向长度构成的闭合波动曲线 */}
      <path d={profilePath} fill="var(--chart-area-tint)" stroke="var(--chart-curve)" strokeWidth={1.6} strokeLinejoin="round" />

      {/* 峰值 / 谷值辅助虚线射线（外圈帝旺/绝标签已高亮，避免在数据方框处重复文字遮挡） */}
      {stages.map((s) => {
        if (s.power !== maxAbs && s.power !== -maxAbs) return null;
        const p = polar(s.ringIndex, R0 + s.power * K);
        const col = s.power > 0 ? 'var(--semantic-useful)' : 'var(--semantic-taboo)';
        return (
          <line
            key={`ext-${s.stage}`}
            x1={p.x}
            y1={p.y}
            x2={CX}
            y2={CY}
            stroke={col}
            strokeWidth={1.1}
            strokeDasharray="2 3"
            opacity={0.55}
          />
        );
      })}

      {/* 十天干落点：方块 = 该干在本月令的十二长生位置；原局所透高亮 */}
      {[...bySlot.entries()].map(([slot, list]) => {
        const a = ((-90 + slot * (360 / 12)) * Math.PI) / 180;
        const tx = Math.cos(a + Math.PI / 2);
        const ty = Math.sin(a + Math.PI / 2);
        return list.map((e, i) => {
          const off = (i - (list.length - 1) / 2) * 15;
          const rad = R0 + e.power * K;
          const x = CX + rad * Math.cos(a) + tx * off;
          const y = CY + rad * Math.sin(a) + ty * off;
          const col = ELEMENT_COLORS[e.element] ?? 'var(--semantic-neutral)';
          return (
            <g key={e.stem}>
              {e.inChart ? (
                <>
                  <rect x={x - 8} y={y - 8} width={16} height={16} rx={2} fill={col} stroke="var(--chart-curve)" strokeWidth={1.3} />
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={900} fill="var(--chart-node-bg)" style={{ fontFamily: 'var(--font-sans)' }}>
                    {e.stem}
                  </text>
                </>
              ) : (
                <>
                  <rect x={x - 6} y={y - 6} width={12} height={12} rx={1.5} fill="var(--chart-node-bg)" stroke={col} strokeWidth={1} opacity={0.85} />
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill={col} style={{ fontFamily: 'var(--font-sans)' }}>
                    {e.stem}
                  </text>
                </>
              )}
            </g>
          );
        });
      })}

      {/* 环心：月令标注 */}
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize={14} fontWeight={900} fill="var(--foreground)" style={{ fontFamily: 'var(--font-serif)' }}>
        {ring.monthName}
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--muted-foreground)" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
        月令·气机
      </text>
    </svg>
  );
}
