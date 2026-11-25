import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Compass, Edit3, MapPin, RotateCcw, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  STEMS,
  BRANCHES,
  MONTH_BRANCHES,
  type BaZiChart,
} from '@/analysis/common/baziCalculator';
import type { TimePrecision } from '@/analysis/greek';
import type { CityRecord } from '@/data/cityData';
import type { SolarTermTheme } from '@/data/solarTermsTheme';
import {
  POPULAR_YEARS,
  SAMPLE_BIRTH_PRESETS,
  parseFullBirthStr,
} from '../constants';

interface BirthInputStudioProps {
  analyzed: boolean;
  isExpanded: boolean;
  onToggleExpand: (open: boolean) => void;
  chart: BaZiChart | null;
  inputMode: 'date' | 'manual';
  setInputMode: (mode: 'date' | 'manual') => void;
  year: string;
  setYear: (v: string) => void;
  month: string;
  setMonth: (v: string) => void;
  day: string;
  setDay: (v: string) => void;
  hour: string;
  setHour: (v: string) => void;
  minute: string;
  setMinute: (v: string) => void;
  gender: 'male' | 'female';
  setGender: (g: 'male' | 'female') => void;
  timePrecision: TimePrecision;
  setTimePrecision: (p: TimePrecision) => void;
  birthCity: string;
  cityQuery: string;
  setCityQuery: (q: string) => void;
  cityOpen: boolean;
  setCityOpen: (open: boolean) => void;
  cityMatches: CityRecord[];
  selectedCity: CityRecord;
  cityOffset: { offsetMinutes: number; isDst: boolean };
  regionOffsetText: string;
  onSelectCity: (city: CityRecord) => void;
  mYearStem: string;
  setMYearStem: (v: string) => void;
  mYearBranch: string;
  setMYearBranch: (v: string) => void;
  mMonthStem: string;
  setMMonthStem: (v: string) => void;
  mMonthBranch: string;
  setMMonthBranch: (v: string) => void;
  mDayStem: string;
  setMDayStem: (v: string) => void;
  mDayBranch: string;
  setMDayBranch: (v: string) => void;
  mHourStem: string;
  setMHourStem: (v: string) => void;
  mHourBranch: string;
  setMHourBranch: (v: string) => void;
  mBirthYear: string;
  setMBirthYear: (v: string) => void;
  solarTermTheme: SolarTermTheme;
  onAnalyze: () => void;
  onApplyPreset: (preset: typeof SAMPLE_BIRTH_PRESETS[number]) => void;
  onReset: () => void;
}

/** 排盘输入工作台（排盘前为居中编辑台，排盘后收折为紧凑状态指挥条） */
export default function BirthInputStudio(props: BirthInputStudioProps) {
  const {
    analyzed,
    isExpanded,
    onToggleExpand,
    chart,
    inputMode,
    setInputMode,
    year,
    setYear,
    month,
    setMonth,
    day,
    setDay,
    hour,
    setHour,
    minute,
    setMinute,
    gender,
    setGender,
    timePrecision,
    setTimePrecision,
    cityQuery,
    setCityQuery,
    cityOpen,
    setCityOpen,
    cityMatches,
    selectedCity,
    cityOffset,
    regionOffsetText,
    onSelectCity,
    mYearStem,
    setMYearStem,
    mYearBranch,
    setMYearBranch,
    mMonthStem,
    setMMonthStem,
    mMonthBranch,
    setMMonthBranch,
    mDayStem,
    setMDayStem,
    mDayBranch,
    setMDayBranch,
    mHourStem,
    setMHourStem,
    mHourBranch,
    setMHourBranch,
    mBirthYear,
    setMBirthYear,
    solarTermTheme,
    onAnalyze,
    onApplyPreset,
    onReset,
  } = props;

  const [quickBirthStr, setQuickBirthStr] = useState('');
  const cityBoxRef = useRef<HTMLDivElement | null>(null);

  // 点击外部自动收起城市检索下拉列表
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (cityBoxRef.current && !cityBoxRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [setCityOpen]);

  const handleQuickParse = () => {
    const parsed = parseFullBirthStr(quickBirthStr);
    if (!parsed.ok) {
      toast.error(parsed.msg ?? '未能识别生辰格式');
      return;
    }
    setInputMode('date');
    if (parsed.y) setYear(parsed.y);
    if (parsed.mo) setMonth(parsed.mo);
    if (parsed.d) setDay(parsed.d);
    if (parsed.h) setHour(parsed.h);
    if (parsed.mi) setMinute(parsed.mi);
    setTimePrecision('minute');
    toast.success(`已填充 ${parsed.y}-${parsed.mo?.padStart(2, '0')}-${parsed.d?.padStart(2, '0')} ${parsed.h?.padStart(2, '0')}:${parsed.mi?.padStart(2, '0')}`);
  };

  // 已排盘且折叠时：展示紧凑状态指挥条，将 95% 视口让给命盘报告
  if (analyzed && chart && !isExpanded) {
    const pillarsText = `${chart.year.stem}${chart.year.branch}  ${chart.month.stem}${chart.month.branch}  ${chart.day.stem}${chart.day.branch}  ${chart.hour.stem}${chart.hour.branch}`;
    return (
      <div className="mb-6 border border-border bg-card px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {chart.gender === 'male' ? '乾造 · 男' : '坤造 · 女'}
            </span>
            <span className="font-editorial text-sm font-black tracking-[0.16em] text-foreground">
              {pillarsText}
            </span>
            <span className="hidden h-3.5 w-px bg-border sm:inline-block" />
            <span className="num-tabular text-xs text-muted-foreground">
              {chart.birthInfo.solarDate} {chart.birthInfo.solarTime} · {chart.birthInfo.birthPlace}
            </span>
            <span className="hidden rounded-[2px] border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground md:inline-flex">
              {solarTermTheme.name} · {solarTermTheme.poem}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleExpand(true)}
              className="border-border text-xs font-bold"
            >
              <Edit3 className="size-3.5" />
              修改生辰
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              重新排盘
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={analyzed ? 'mb-6' : 'mx-auto my-4 max-w-5xl md:my-8'}>
      {/* 未排盘主屏：东方雅集欢迎导言 */}
      {!analyzed && (
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <div className="label-mono flex items-center gap-2 text-primary">
              <span className="inline-block size-2 bg-primary" />
              <span>LOCAL PRECISION ENGINE · 纯本地精密排盘演算</span>
            </div>
            <h1 className="font-editorial mt-2 text-3xl font-black tracking-[0.08em] text-foreground md:text-4xl">
              四柱排盘 · 三线同参
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              输入出生公历时辰或直接指定四柱干支，本地一次完成排盘，从「阴阳线」月气二仪、「希腊占星线」七政尊贵与「大杂烩线」各门派断法三条独立口径交叉对照。
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="label-mono text-[10px] text-muted-foreground">一键载入示范命例</span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_BIRTH_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                  className="inline-flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Sparkles className="size-3 text-primary" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 双栏排盘录入台 */}
      <div className="crosshair border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/35 px-5 py-3.5 md:px-6">
          <div className="flex items-center gap-2">
            <span className="section-num border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">
              00
            </span>
            <span className="font-editorial text-sm font-bold tracking-[0.12em] text-foreground md:text-base">
              生辰录入与地域校时台
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex border border-border bg-background p-0.5">
              {([
                { key: 'date', label: '按公历出生日时' },
                { key: 'manual', label: '直接指定四柱' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setInputMode(item.key)}
                  className={`px-3 py-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    inputMode === item.key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {analyzed && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpand(false)}
                className="text-xs text-muted-foreground"
              >
                收起
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          {/* 左栏：生辰参数输入 */}
          <div className="space-y-6 p-5 md:p-6">
            {inputMode === 'date' ? (
              <>
                {/* 快捷粘贴解析栏 */}
                <div className="border border-dashed border-border bg-muted/25 p-3.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label htmlFor="quick-birth-input" className="text-xs font-bold text-foreground">
                      智能快填（可选）
                    </Label>
                    <span className="label-mono text-[9.5px] text-muted-foreground">
                      支持 1995-08-14 06:30 或 200012100000
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="quick-birth-input"
                      value={quickBirthStr}
                      onChange={(e) => setQuickBirthStr(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQuickParse();
                        }
                      }}
                      placeholder="粘贴出生年月日时，回车自动拆填到下方字段..."
                      className="h-9 text-xs font-mono"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleQuickParse}
                      className="h-9 shrink-0 px-3 text-xs"
                    >
                      识别填充
                    </Button>
                  </div>
                </div>

                {/* 公历年月日时分 */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    <span className="text-xs font-bold tracking-[0.1em] text-foreground">
                      公历出生日期与时刻
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div>
                      <Label htmlFor="birth-year" className="text-[11px] font-semibold text-muted-foreground">年 (1800–2100)</Label>
                      <Input
                        id="birth-year"
                        type="number"
                        min={1800}
                        max={2100}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="mt-1 h-10 text-center font-mono text-sm font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birth-month" className="text-[11px] font-semibold text-muted-foreground">月 (1–12)</Label>
                      <Input
                        id="birth-month"
                        type="number"
                        min={1}
                        max={12}
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="mt-1 h-10 text-center font-mono text-sm font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birth-day" className="text-[11px] font-semibold text-muted-foreground">日 (1–31)</Label>
                      <Input
                        id="birth-day"
                        type="number"
                        min={1}
                        max={31}
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="mt-1 h-10 text-center font-mono text-sm font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birth-hour" className="text-[11px] font-semibold text-muted-foreground">时 (0–23)</Label>
                      <Input
                        id="birth-hour"
                        type="number"
                        min={0}
                        max={23}
                        value={hour}
                        onChange={(e) => setHour(e.target.value)}
                        disabled={timePrecision === 'day'}
                        className="mt-1 h-10 text-center font-mono text-sm font-bold"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="birth-minute" className="text-[11px] font-semibold text-muted-foreground">分 (0–59)</Label>
                      <Input
                        id="birth-minute"
                        type="number"
                        min={0}
                        max={59}
                        value={minute}
                        onChange={(e) => setMinute(e.target.value)}
                        disabled={timePrecision === 'day'}
                        className="mt-1 h-10 text-center font-mono text-sm font-bold"
                      />
                    </div>
                  </div>

                  {/* 年代快捷点选 */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="label-mono text-[9.5px] text-muted-foreground">常用年代：</span>
                    {POPULAR_YEARS.map((py) => (
                      <button
                        key={py}
                        type="button"
                        onClick={() => setYear(String(py))}
                        className={`border px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors ${
                          year === String(py)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {py}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* 手动四柱模式（修复旧版 var(--input) 灰底问题，使用亮面 card 表单框） */
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">直接点选四柱干支</span>
                  <span className="font-mono text-xs font-bold text-primary">
                    {mYearStem}{mYearBranch} · {mMonthStem}{mMonthBranch} · {mDayStem}{mDayBranch} · {mHourStem}{mHourBranch}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { t: '年柱', s: mYearStem, b: mYearBranch, sm: setMYearStem, bm: setMYearBranch, branchPool: BRANCHES },
                    { t: '月柱', s: mMonthStem, b: mMonthBranch, sm: setMMonthStem, bm: setMMonthBranch, branchPool: MONTH_BRANCHES },
                    { t: '日柱', s: mDayStem, b: mDayBranch, sm: setMDayStem, bm: setMDayBranch, branchPool: BRANCHES },
                    { t: '时柱', s: mHourStem, b: mHourBranch, sm: setMHourStem, bm: setMHourBranch, branchPool: BRANCHES },
                  ].map((p) => (
                    <div key={p.t} className="border border-border bg-muted/25 p-3">
                      <div className="mb-2 text-xs font-bold text-muted-foreground">{p.t}</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Select value={p.s} onValueChange={p.sm}>
                          <SelectTrigger className="h-10 bg-card font-editorial text-sm font-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STEMS.map((st) => (
                              <SelectItem key={st} value={st} className="font-bold">
                                {st}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={p.b} onValueChange={p.bm}>
                          <SelectTrigger className="h-10 bg-card font-editorial text-sm font-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {p.branchPool.map((br) => (
                              <SelectItem key={br} value={br} className="font-bold">
                                {br}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 border border-border bg-muted/20 px-3.5 py-2.5">
                  <Label htmlFor="manual-birth-year" className="text-xs font-bold text-foreground">
                    参照出生公历年份（用于起运与流年换算）
                  </Label>
                  <Input
                    id="manual-birth-year"
                    type="number"
                    min={1800}
                    max={2100}
                    value={mBirthYear}
                    onChange={(e) => setMBirthYear(e.target.value)}
                    className="h-9 w-28 text-center font-mono text-sm font-bold"
                  />
                </div>
              </div>
            )}

            {/* 性别与时刻精度 */}
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-bold text-foreground">命主性别（定顺逆起运）</div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'male', title: '乾造 · 男' },
                    { key: 'female', title: '坤造 · 女' },
                  ] as const).map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setGender(g.key)}
                      className={`border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        gender === g.key
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:border-foreground/40'
                      }`}
                    >
                      {g.title}
                    </button>
                  ))}
                </div>
              </div>

              {inputMode === 'date' && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Clock className="size-3.5 text-primary" />
                    <span>时刻已知精度</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'minute', title: '精确时刻' },
                      { key: 'day', title: '仅知日期·正午' },
                    ] as const).map((pr) => (
                      <button
                        key={pr.key}
                        type="button"
                        onClick={() => {
                          setTimePrecision(pr.key);
                          if (pr.key === 'day') {
                            setHour('12');
                            setMinute('0');
                          }
                        }}
                        className={`whitespace-nowrap border px-2 py-2 text-[11.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-xs ${
                          timePrecision === pr.key
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {pr.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右栏：出生地真太阳时校对仪 + 提交按钮 */}
          <div className="flex flex-col justify-between gap-5 border-t border-border bg-muted/25 p-5 md:p-6 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              {inputMode === 'date' ? (
                <div ref={cityBoxRef} className="relative">
                  <Label htmlFor="birth-city-search" className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <MapPin className="size-3.5 text-primary" />
                    <span>出生地（检索全球 187 城经纬度与历史时区）</span>
                  </Label>
                  <Input
                    id="birth-city-search"
                    value={cityQuery}
                    onFocus={() => setCityOpen(true)}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      setCityOpen(true);
                    }}
                    placeholder="输入城市名或拼音，如 北京 / 上海 / 香港 / 东京..."
                    className="mt-1.5 h-10 bg-card text-sm font-semibold"
                  />
                  {cityOpen && cityMatches.length > 0 && (
                    <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto border border-border bg-popover shadow-md">
                      {cityMatches.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => onSelectCity(c)}
                          className="flex w-full items-center justify-between border-b border-border/60 px-3 py-2 text-left text-xs transition-colors last:border-b-0 hover:bg-muted"
                        >
                          <span className="font-bold text-foreground">{c.key}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {c.lon.toFixed(2)}°E · {c.lat.toFixed(2)}°N
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 真太阳时实时遥测面板 */}
                  <div className="mt-3 grid grid-cols-2 gap-px border border-border bg-border">
                    <div className="bg-card px-3 py-2">
                      <div className="label-mono text-[9px] text-muted-foreground">经纬度坐标</div>
                      <div className="num-tabular mt-0.5 text-xs font-bold text-foreground">
                        {selectedCity.lon.toFixed(2)}°E · {selectedCity.lat.toFixed(2)}°N
                      </div>
                    </div>
                    <div className="bg-card px-3 py-2">
                      <div className="label-mono text-[9px] text-muted-foreground">真太阳平差</div>
                      <div className="num-tabular mt-0.5 text-xs font-bold text-primary">
                        {regionOffsetText}
                      </div>
                    </div>
                    <div className="bg-card px-3 py-2">
                      <div className="label-mono text-[9px] text-muted-foreground">标准时区偏移</div>
                      <div className="num-tabular mt-0.5 text-xs font-bold text-foreground">
                        UTC{cityOffset.offsetMinutes >= 0 ? `+${(cityOffset.offsetMinutes / 60).toFixed(1).replace(/\.0$/, '')}` : (cityOffset.offsetMinutes / 60).toFixed(1).replace(/\.0$/, '')}
                      </div>
                    </div>
                    <div className="bg-card px-3 py-2">
                      <div className="label-mono text-[9px] text-muted-foreground">历史夏令时</div>
                      <div className="mt-0.5 text-xs font-bold text-foreground">
                        {cityOffset.isDst ? '命中夏令时（已回拨 60 分）' : '常规平太阳标准时'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-border bg-card p-3.5 text-xs leading-relaxed text-muted-foreground">
                  <div className="font-bold text-foreground">手动四柱模式提示</div>
                  <p className="mt-1">
                    将依据您选定的四柱干支直接推演「阴阳线」与「大杂烩线」；若需精准计算「希腊占星线」的上升点（ASC）与星历度数，请使用公历日期与出生地排盘。
                  </p>
                </div>
              )}

              {/* 时令雅韵条 */}
              <div className="border border-border bg-card/85 px-3.5 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="label-mono text-[9.5px] text-primary">节气时令 · {solarTermTheme.name}</span>
                  <span className="text-[10px] text-muted-foreground">{solarTermTheme.source}</span>
                </div>
                <p className="font-editorial mt-1 text-xs italic text-foreground/85">
                  “{solarTermTheme.poem}”
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="button"
                size="lg"
                onClick={onAnalyze}
                className="h-12 w-full text-sm font-black tracking-[0.18em]"
              >
                <Compass className="size-4" />
                {analyzed ? '重新排盘并刷新报告' : '立即排盘 · 生成三线报告'}
              </Button>
              <p className="text-center text-[10.5px] text-muted-foreground">
                纯本地前端演算 · 年月以立春节气交界、日时以真太阳时为基准
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
