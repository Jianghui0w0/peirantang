import type { AnalysisLineKey } from '@/analysis';
import {
  SOLAR_TERMS_24,
  getSolarTermThemeByBirthDate,
  type SolarTermTheme,
} from '@/data/solarTermsTheme';

/** 系统版本号（与 CHANGELOG.md / docs/架构与版本.md 同步） */
export const APP_VERSION = '天枢 1.3.0';

export const ELEMENT_NAMES: Record<string, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

/** 语义化五行色（消费全局 CSS 变量，自适应宣纸/星空双主题） */
export const ELEMENT_COLORS: Record<string, string> = {
  wood: 'var(--el-wood)',
  fire: 'var(--el-fire)',
  earth: 'var(--el-earth)',
  metal: 'var(--el-metal)',
  water: 'var(--el-water)',
};

export const TERMINAL_PALETTE = {
  primary: 'var(--primary)',
  accent: 'var(--semantic-amber)',
  good: 'var(--semantic-useful)',
  bad: 'var(--semantic-taboo)',
  neutral: 'var(--semantic-neutral)',
  sky: 'var(--semantic-sky)',
} as const;

/** 阴阳线报告一级目录 */
export const REPORT_SECTIONS = [
  { id: 'section-pillars', num: '01', label: '四柱排盘' },
  { id: 'section-overview', num: '02', label: '命主速览' },
  { id: 'section-monthqi', num: '03', label: '月气长生' },
  { id: 'section-yongji', num: '04', label: '用神忌神' },
  { id: 'section-dayun', num: '05', label: '大运流年' },
  { id: 'section-xiangfa', num: '06', label: '象意旁证' },
] as const;

export const SECTION_META = {
  pillars: { no: '01', label: '01 四柱排盘总览', en: 'FOUR PILLARS', title: '四柱排盘总览' },
  overview: { no: '02', label: '02 命主速览', en: 'OVERVIEW & FIELD', title: '命主速览 · 格局总论' },
  monthqi: { no: '03', label: '03 月气分析', en: 'MONTH QI', title: '月气分析 · 十二长生' },
  yongji: { no: '04', label: '04 用神忌神判断', en: 'YONG / JI', title: '用神忌神 · 逐字喜忌' },
  dayun: { no: '05', label: '05 大运流年与模式', en: 'FORTUNE & TAIJI', title: '大运流年 · 命局模式' },
  xiangfa: { no: '06', label: '06 象意与古法旁证', en: 'IMAGERY & PROOFS', title: '象意 · 财富 · 学历 · 旁证' },
} as const;

/** 三条对照分析线元信息 */
export const ANALYSIS_LINES_META: ReadonlyArray<{
  key: AnalysisLineKey;
  index: string;
  en: string;
  title: string;
  subtitle: string;
}> = [
  {
    key: 'yinyang',
    index: 'A',
    en: 'YIN-YANG LINE',
    title: '阴阳线',
    subtitle: '月令二气平衡 · 用忌定标 · 九档大运流年',
  },
  {
    key: 'greek',
    index: 'B',
    en: 'HELLENISTIC LINE',
    title: '希腊占星线',
    subtitle: '行星尊贵 · 昼夜宗派 · 时间主星对照（切换星空）',
  },
  {
    key: 'zalu',
    index: 'C',
    en: 'SYNTHESIS LINE',
    title: '大杂烩线',
    subtitle: '二十门派登记 · 只吃四柱 · 断学业 / 爱情 / 财富',
  },
];

/** 常用年代快选 pills */
export const POPULAR_YEARS = [1970, 1980, 1985, 1990, 1995, 2000, 2005];

/** 开箱即用典型命例（方便初次访问一秒试盘） */
export const SAMPLE_BIRTH_PRESETS = [
  {
    label: '千禧子时 · 北京男',
    year: '2000',
    month: '12',
    day: '10',
    hour: '0',
    minute: '0',
    gender: 'male' as const,
    city: '北京',
  },
  {
    label: '盛夏寅时 · 上海女',
    year: '1995',
    month: '8',
    day: '14',
    hour: '4',
    minute: '30',
    gender: 'female' as const,
    city: '上海',
  },
  {
    label: '谷雨午时 · 成都男',
    year: '1988',
    month: '4',
    day: '22',
    hour: '12',
    minute: '15',
    gender: 'male' as const,
    city: '成都',
  },
] as const;

export type ChangShengState = '长生' | '沐浴' | '冠带' | '临官' | '帝旺' | '衰' | '病' | '死' | '墓' | '绝' | '胎' | '养';

export const CHANG_SHENG_RANK: Record<ChangShengState, number> = {
  帝旺: 6, 临官: 5, 冠带: 4, 长生: 3, 养: 2, 胎: 1,
  沐浴: 0, 衰: -1, 病: -2, 死: -3, 墓: -4, 绝: -5,
};

export const CHANG_SHENG_META: Record<ChangShengState, { tag: '旺' | '中' | '弱'; desc: string }> = {
  长生: { tag: '旺', desc: '如人初生，万物欣欣向荣，生机方兴未艾' },
  沐浴: { tag: '中', desc: '初生之气易荡漾不定，变化多端、喜水润' },
  冠带: { tag: '旺', desc: '成童加冠之象，气渐盛而渐具行动力' },
  临官: { tag: '旺', desc: '如人壮年仕进，当令有成、力能任事' },
  帝旺: { tag: '旺', desc: '气机登峰造极，极盛而当思收敛节制' },
  衰:   { tag: '弱', desc: '盛极转衰，气渐收敛而趋温和持重' },
  病:   { tag: '弱', desc: '气机倦怠乏力，须借印比扶抑调候' },
  死:   { tag: '弱', desc: '生气熄而静守，最忌再遭重克破根' },
  墓:   { tag: '弱', desc: '气入库藏待冲发，蓄而不露、静待岁运引出' },
  绝:   { tag: '弱', desc: '旧气已尽、新机待萌，物极必反之处' },
  胎:   { tag: '中', desc: '天地氤氲受气，初具胚形而待扶助' },
  养:   { tag: '中', desc: '潜养蓄锐，蓄势待发而未显露锋芒' },
};

export type PillarMark = 'useful' | 'taboo' | 'neutral';

export function fmtScore(n: number): string {
  return `${n >= 0 ? '+' : ''}${Math.round(n * 10) / 10}`;
}

export function compactLiuNianHint(hint: unknown): string {
  if (typeof hint !== 'string') return '';
  const text = hint.trim();
  if (!text) return '';
  return text.split(/[。！？]/)[0].replace(/，且|，但/, ' · ');
}

export function parseChangSheng(raw: string, stem: string): ChangShengState | '' {
  if (!raw) return '';
  const states: ChangShengState[] = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = raw.match(new RegExp(`${escaped}[^\\s（(]*[（(]?(${states.join('|')})`));
  if (m) return m[1] as ChangShengState;
  for (const st of states) {
    if (raw.includes(st)) return st;
  }
  return '';
}

/** 根据系统今日日期匹配默认节气主题 */
export function getDefaultSolarTermTheme(): SolarTermTheme {
  const now = new Date();
  return getSolarTermThemeByBirthDate(now.getFullYear(), now.getMonth() + 1, now.getDate()) ?? SOLAR_TERMS_24[0];
}

/** 快捷解析生辰字符串：支持 `1995-08-14 06:30` / `2000/12/10 00:00` / `199910012000` */
export function parseFullBirthStr(raw: string): {
  ok: boolean;
  y?: string;
  mo?: string;
  d?: string;
  h?: string;
  mi?: string;
  msg?: string;
} {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) {
    return { ok: false, msg: '请输入日期时间，如 1995-08-14 06:30 或 200012100000' };
  }
  // 先匹配带分隔符格式 YYYY[-/.]M[-/.]D [H[:mm]]
  const sep = trimmed.match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})(?:\D+(\d{1,2})(?:\D+(\d{1,2}))?)?/);
  let yNum: number;
  let moNum: number;
  let dNum: number;
  let hNum = 12;
  let miNum = 0;

  if (sep && trimmed.match(/\D/)) {
    yNum = parseInt(sep[1], 10);
    moNum = parseInt(sep[2], 10);
    dNum = parseInt(sep[3], 10);
    hNum = sep[4] !== undefined ? parseInt(sep[4], 10) : 12;
    miNum = sep[5] !== undefined ? parseInt(sep[5], 10) : 0;
  } else {
    const s = trimmed.replace(/\D/g, '');
    if (s.length < 8 || s.length > 12) {
      return { ok: false, msg: '格式应为 1995-08-14 06:30 或 8–12 位数字（如 199910012000）' };
    }
    const full = s + '0'.repeat(Math.max(0, 12 - s.length));
    yNum = parseInt(full.slice(0, 4), 10);
    moNum = parseInt(full.slice(4, 6), 10);
    dNum = parseInt(full.slice(6, 8), 10);
    hNum = parseInt(full.slice(8, 10), 10);
    miNum = parseInt(full.slice(10, 12), 10);
  }

  if (yNum < 1800 || yNum > 2100) return { ok: false, msg: `年份 ${yNum} 超出支持范围 1800–2100` };
  if (moNum < 1 || moNum > 12) return { ok: false, msg: `月份 ${moNum} 应为 1–12` };
  if (dNum < 1 || dNum > 31) return { ok: false, msg: `日期 ${dNum} 应为 1–31` };
  if (hNum < 0 || hNum > 23) return { ok: false, msg: `小时 ${hNum} 应为 0–23` };
  if (miNum < 0 || miNum > 59) return { ok: false, msg: `分钟 ${miNum} 应为 0–59` };

  return {
    ok: true,
    y: String(yNum),
    mo: String(moNum),
    d: String(dNum),
    h: String(hNum),
    mi: String(miNum),
  };
}

/** 九档评级统一样式映射（全部基于语义 CSS 变量，双主题皆宜） */
export const LETTER_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  'S+': { bg: 'var(--semantic-taboo-bg)', border: 'var(--semantic-taboo)', text: 'var(--semantic-taboo)' },
  'S':  { bg: 'var(--semantic-amber-bg)', border: 'var(--semantic-amber)', text: 'var(--semantic-amber)' },
  'A+': { bg: 'var(--semantic-useful-bg)', border: 'var(--semantic-useful)', text: 'var(--semantic-useful)' },
  'A':  { bg: 'var(--semantic-useful-bg)', border: 'var(--el-wood)', text: 'var(--el-wood)' },
  'B+': { bg: 'var(--semantic-sky-bg)', border: 'var(--semantic-sky)', text: 'var(--semantic-sky)' },
  'B-': { bg: 'var(--muted)', border: 'var(--border)', text: 'var(--muted-foreground)' },
  'C':  { bg: 'var(--semantic-taboo-bg)', border: 'var(--el-fire)', text: 'var(--el-fire)' },
  'C-': { bg: 'var(--semantic-taboo-bg)', border: 'var(--semantic-taboo)', text: 'var(--semantic-taboo)' },
  'D':  { bg: 'var(--muted)', border: 'var(--border)', text: 'var(--muted-foreground)' },
};

/** 语义化评分色 */
export function scoreToneColor(score: number): string {
  if (score >= 4) return 'var(--semantic-useful)';
  if (score <= -4) return 'var(--semantic-taboo)';
  if (score > 0) return 'var(--semantic-amber)';
  if (score < 0) return 'var(--semantic-taboo)';
  return 'var(--muted-foreground)';
}
