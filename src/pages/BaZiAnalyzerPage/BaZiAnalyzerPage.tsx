import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import GreekReport from '@/pages/GreekLine/GreekReport';
import { ZaluReport } from '@/pages/ZaluLine/ZaluReport';
import { buildGreekModelFromChart, buildAstroChart, type TimePrecision } from '@/analysis/greek';
import InkScenery from '@/components/scenery/InkScenery';
import StarField from '@/components/scenery/StarField';
import { Button } from '@/components/ui/button';

import {
  calculateBaZi,
  buildChartFromPillars,
  type BaZiChart,
  MONTH_BRANCHES,
} from '@/analysis/common/baziCalculator';
import {
  analyzeZhuZiXiJi,
  getChunQiuMonthFactor,
  detectGanZhiZiHe,
  analyzeGuFaPangZheng,
  analyzeSiZhuXianDuan,
  pickKeyYears,
  analyzeChangShengRing,
  analyzeWuXingQuXiang,
  analyzeLaoGaoRules,
  computeTaiJiQi,
  letterFromScore,
  type ChunQiuFactorResult,
  type GanZhiZiHeHit,
  type GuFaPangZheng,
  type ZhuZiXiJiResult,
  type XianDuanResult,
  type KeyYearsResult,
  type ChangShengRingResult,
  type WuXingQuXiangResult,
  type TaiJiQiResult,
} from '@/analysis/yinyang/engine';
import { buildYinyangAnalysis, type AnalysisLineKey } from '@/analysis';
import {
  analyzeXiangYi,
  analyzeEducationVerdict,
  pickStudyDayun,
  analyzeEarthXiJi,
  type XiangYiVerdict,
  type EducationVerdict,
  type EarthXiJiResult,
} from '@/analysis/yinyang/xiangfa';
import {
  getSolarTermThemeByBirthDate,
  type SolarTermTheme,
} from '@/data/solarTermsTheme';
import { BIRTH_REGION_CFG } from '@/data/baziData';
import {
  CITY_DEFAULT_KEY,
  findCity,
  searchCity,
  resolveUtcOffsetMinutes,
  type CityRecord,
} from '@/data/cityData';

import {
  APP_VERSION,
  REPORT_SECTIONS,
  SAMPLE_BIRTH_PRESETS,
  getDefaultSolarTermTheme,
} from './constants';
import BirthInputStudio from './components/BirthInputStudio';
import FourPillarsHero from './components/FourPillarsHero';
import { MobileSectionStrip, ReportSidebar } from './components/ReportSidebar';
import OverviewAndMonthSection from './components/OverviewAndMonthSection';
import YongJiAndPatternSection from './components/YongJiAndPatternSection';
import DaYunSection from './components/DaYunSection';
import XiangFaSection from './components/XiangFaSection';

export default function BaZiAnalyzerPage() {
  const [inputMode, setInputMode] = useState<'date' | 'manual'>('date');
  const [inputExpanded, setInputExpanded] = useState(true);

  const [year, setYear] = useState('2000');
  const [month, setMonth] = useState('12');
  const [day, setDay] = useState('10');
  const [hour, setHour] = useState('0');
  const [minute, setMinute] = useState('0');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [timePrecision, setTimePrecision] = useState<TimePrecision>('minute');
  const [birthCity, setBirthCity] = useState<string>(CITY_DEFAULT_KEY);
  const [cityQuery, setCityQuery] = useState<string>(CITY_DEFAULT_KEY);
  const [cityOpen, setCityOpen] = useState<boolean>(false);

  const [mYearStem, setMYearStem] = useState('庚');
  const [mYearBranch, setMYearBranch] = useState('辰');
  const [mMonthStem, setMMonthStem] = useState('戊');
  const [mMonthBranch, setMMonthBranch] = useState('子');
  const [mDayStem, setMDayStem] = useState('戊');
  const [mDayBranch, setMDayBranch] = useState('申');
  const [mHourStem, setMHourStem] = useState('壬');
  const [mHourBranch, setMHourBranch] = useState('子');
  const [mBirthYear, setMBirthYear] = useState('2000');

  const [chart, setChart] = useState<BaZiChart | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [activeLine, setActiveLine] = useState<AnalysisLineKey>('yinyang');
  const [reportView, setReportView] = useState<'concise' | 'full'>('concise');
  const [expandedDY, setExpandedDY] = useState<number | null>(null);
  const [solarTermTheme, setSolarTermTheme] = useState<SolarTermTheme>(() => getDefaultSolarTermTheme());
  const [showBackTop, setShowBackTop] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>(REPORT_SECTIONS[0].id);
  const scrollLockRef = useRef<number>(0);

  const handleSelectSection = (id: string) => {
    scrollLockRef.current = Date.now() + 650;
    setActiveSectionId(id);
  };

  // 希腊占星线自动切换深空夜幕主题；阴阳线与杂录线保持宣纸雅集主题
  const visualTheme: 'ink' | 'cosmos' = analyzed && activeLine === 'greek' ? 'cosmos' : 'ink';

  useEffect(() => {
    document.documentElement.dataset.theme = visualTheme;
  }, [visualTheme]);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 目录滚动高亮监听：以视口阅读基准线（顶部下方 130px）最后越过的版块为准
  useEffect(() => {
    if (!analyzed || activeLine !== 'yinyang') return;
    const syncActive = () => {
      if (Date.now() < scrollLockRef.current) return;
      let currentId: string = REPORT_SECTIONS[0].id;
      for (const s of REPORT_SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 140) {
          currentId = s.id;
        }
      }
      setActiveSectionId(currentId);
    };
    window.addEventListener('scroll', syncActive, { passive: true });
    return () => window.removeEventListener('scroll', syncActive);
  }, [analyzed, activeLine]);

  const currentYear = new Date().getFullYear();

  const handleAnalyze = () => {
    if (inputMode === 'manual') {
      const by = parseInt(mBirthYear, 10);
      if (isNaN(by) || by < 1800 || by > 2100) {
        toast.error('请填写有效的参照出生年份（1800-2100）');
        return;
      }
      if (!MONTH_BRANCHES.includes(mMonthBranch)) {
        toast.error('月支非法');
        return;
      }
      const manualChart = buildChartFromPillars({
        year: [mYearStem, mYearBranch],
        month: [mMonthStem, mMonthBranch],
        day: [mDayStem, mDayBranch],
        hour: [mHourStem, mHourBranch],
        gender,
        birthYear: by,
        birthPlace: '北京',
      });
      setChart(manualChart);
      setSolarTermTheme(getSolarTermThemeByBirthDate(by, 1, 1));
      setActiveLine('yinyang');
      setAnalyzed(true);
      setInputExpanded(false);
      dyInitializedRef.current = false;
      toast.success('手动四柱排盘完成');
      return;
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const h = parseInt(hour, 10);
    const min = parseInt(minute, 10);

    if (isNaN(y) || y < 1800 || y > 2100) return void toast.error('请输入有效的年份（1800-2100）');
    if (isNaN(m) || m < 1 || m > 12) return void toast.error('请输入有效的月份（1-12）');
    if (isNaN(d) || d < 1 || d > 31) return void toast.error('请输入有效的日期（1-31）');
    if (isNaN(h) || h < 0 || h > 23) return void toast.error('请输入有效的小时（0-23）');
    if (isNaN(min) || min < 0 || min > 59) return void toast.error('请输入有效的分钟（0-59）');

    const result = calculateBaZi(y, m, d, h, min, gender, birthCity);
    setChart(result);
    setSolarTermTheme(getSolarTermThemeByBirthDate(y, m, d));
    setActiveLine('yinyang');
    setAnalyzed(true);
    setInputExpanded(false);
    dyInitializedRef.current = false;
    toast.success(
      timePrecision === 'day'
        ? '排盘完成（时刻按正午推定）'
        : '排盘完成，已生成三线分析报告',
    );
  };

  const applyPreset = (preset: typeof SAMPLE_BIRTH_PRESETS[number]) => {
    setInputMode('date');
    setYear(preset.year);
    setMonth(preset.month);
    setDay(preset.day);
    setHour(preset.hour);
    setMinute(preset.minute);
    setGender(preset.gender);
    setTimePrecision('minute');
    setBirthCity(preset.city);
    setCityQuery(preset.city);
    setCityOpen(false);
    const result = calculateBaZi(
      parseInt(preset.year, 10),
      parseInt(preset.month, 10),
      parseInt(preset.day, 10),
      parseInt(preset.hour, 10),
      parseInt(preset.minute, 10),
      preset.gender,
      preset.city,
    );
    setChart(result);
    setSolarTermTheme(getSolarTermThemeByBirthDate(parseInt(preset.year, 10), parseInt(preset.month, 10), parseInt(preset.day, 10)));
    setActiveLine('yinyang');
    setAnalyzed(true);
    setInputExpanded(false);
    dyInitializedRef.current = false;
    toast.success(`已载入示范命例：${preset.label}`);
  };

  const handleReset = () => {
    setAnalyzed(false);
    setChart(null);
    setActiveLine('yinyang');
    setInputExpanded(true);
    setSolarTermTheme(getDefaultSolarTermTheme());
    dyInitializedRef.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 核心引擎计算（数学口径保持原封不动）
  const analysis = useMemo(
    () => (chart ? buildYinyangAnalysis(chart, currentYear) : null),
    [chart, currentYear],
  );

  const greekModel = useMemo(() => {
    if (!analyzed) return null;
    const city = findCity(birthCity) ?? (findCity(CITY_DEFAULT_KEY) as CityRecord);
    const astroChart = buildAstroChart({
      year: parseInt(year, 10) || 2000,
      month: parseInt(month, 10) || 1,
      day: parseInt(day, 10) || 1,
      hour: parseInt(hour, 10) || 0,
      minute: parseInt(minute, 10) || 0,
      city,
      precision: timePrecision,
    });
    return buildGreekModelFromChart(astroChart, { currentYear, gender });
  }, [analyzed, year, month, day, hour, minute, birthCity, currentYear, gender, timePrecision]);

  const monthQi = analysis?.monthQi ?? null;
  const yongJi = analysis?.yongJi ?? null;
  const elementPower = analysis?.elementPower ?? null;
  const pattern = analysis?.pattern ?? null;
  const wealthNobility = analysis?.wealthNobility ?? null;
  const mingPanScore = analysis?.mingPanScore ?? null;
  const daYunAnalysis = analysis?.daYunAnalysis ?? null;

  const dyInitializedRef = useRef(false);
  useEffect(() => {
    if (daYunAnalysis && !dyInitializedRef.current) {
      dyInitializedRef.current = true;
      setExpandedDY(daYunAnalysis.currentDaYunIndex);
    }
  }, [daYunAnalysis]);

  const laoGaoRules = useMemo(() => (chart && yongJi ? analyzeLaoGaoRules(chart, yongJi) : null), [chart, yongJi]);
  const guFaPangZheng = useMemo<GuFaPangZheng | null>(() => (chart ? analyzeGuFaPangZheng(chart) : null), [chart]);
  const zhuZiXiJi = useMemo<ZhuZiXiJiResult | null>(() => (chart && monthQi ? analyzeZhuZiXiJi(chart.month.branch, monthQi, chart) : null), [chart, monthQi]);
  const chunQiuFactor = useMemo<ChunQiuFactorResult | null>(() => (chart ? getChunQiuMonthFactor(chart) : null), [chart]);
  const ganZhiZiHe = useMemo<GanZhiZiHeHit[]>(() => (chart ? detectGanZhiZiHe(chart) : []), [chart]);
  const xianDuan = useMemo<XianDuanResult | null>(() => (chart && yongJi ? analyzeSiZhuXianDuan(chart, yongJi, currentYear) : null), [chart, yongJi, currentYear]);
  const keyYears = useMemo<KeyYearsResult | null>(() => (daYunAnalysis ? pickKeyYears(daYunAnalysis.daYunWithFortune, currentYear) : null), [daYunAnalysis, currentYear]);
  const changShengRing = useMemo<ChangShengRingResult | null>(() => (chart && monthQi ? analyzeChangShengRing(chart, monthQi) : null), [chart, monthQi]);
  const wuXingQuXiang = useMemo<WuXingQuXiangResult | null>(() => (chart && monthQi && yongJi && elementPower ? analyzeWuXingQuXiang(chart, monthQi, yongJi, elementPower) : null), [chart, monthQi, yongJi, elementPower]);
  const taiJiQi = useMemo<TaiJiQiResult | null>(() => (chart && monthQi ? computeTaiJiQi(chart, monthQi) : null), [chart, monthQi]);
  const xiangYi = useMemo<XiangYiVerdict | null>(() => (chart ? analyzeXiangYi(chart, monthQi) : null), [chart, monthQi]);
  const earthXiJi = useMemo<EarthXiJiResult | null>(() => (chart ? analyzeEarthXiJi(chart, monthQi, yongJi) : null), [chart, monthQi, yongJi]);

  const educationVerdict = useMemo<EducationVerdict | null>(() => {
    if (!chart || !yongJi || !elementPower) return null;
    const studyDY = pickStudyDayun(daYunAnalysis?.daYunWithFortune);
    return analyzeEducationVerdict(
      chart,
      yongJi,
      elementPower,
      studyDY
        ? {
            stem: studyDY.stem,
            branch: studyDY.branch,
            letterLevel: studyDY.letterLevel,
            displayScore: studyDY.displayScore,
          }
        : null,
    );
  }, [chart, yongJi, elementPower, daYunAnalysis]);

  const chartChars = useMemo(() => {
    const set = new Set<string>();
    if (!chart) return set;
    [chart.year, chart.month, chart.day, chart.hour].forEach((p) => {
      set.add(p.stem);
      set.add(p.branch);
      p.hiddenStems.forEach((s) => set.add(s));
    });
    return set;
  }, [chart]);

  const selectedCity: CityRecord = findCity(birthCity) ?? (findCity(CITY_DEFAULT_KEY) as CityRecord);
  const cityOffset = resolveUtcOffsetMinutes(
    selectedCity,
    parseInt(year, 10) || 2000,
    parseInt(month, 10) || 1,
    parseInt(day, 10) || 1,
  );
  const regionOffsetMinutes = Math.round(
    (selectedCity.lon - BIRTH_REGION_CFG.standardMeridian) * BIRTH_REGION_CFG.minutesPerDegree,
  );
  const regionOffsetText = (() => {
    const abs = Math.abs(regionOffsetMinutes);
    const h = Math.floor(abs / 60);
    const mi = abs % 60;
    const sign = regionOffsetMinutes < 0 ? '−' : regionOffsetMinutes > 0 ? '+' : '±';
    const parts = [h > 0 ? `${h} 时` : '', mi > 0 ? `${mi} 分` : ''].filter(Boolean).join(' ');
    return `${sign}${parts || '0 分'}`;
  })();

  const cityMatches = useMemo(() => (cityOpen ? searchCity(cityQuery, 10) : []), [cityQuery, cityOpen]);
  const selectCity = (city: CityRecord) => {
    setBirthCity(city.key);
    setCityQuery(city.key);
    setCityOpen(false);
  };

  const fullView = reportView === 'full';
  const ready = Boolean(analyzed && chart && analysis && monthQi && yongJi && elementPower && pattern && wealthNobility && mingPanScore && daYunAnalysis);

  return (
    <div className={`theme-root flex min-h-screen flex-col ${visualTheme === 'cosmos' ? 'theme-cosmos' : 'theme-ink'}`}>
      <InkScenery active={visualTheme === 'ink'} />
      <StarField active={visualTheme === 'cosmos'} />

      {/* 顶部通栏页头 */}
      <header className="relative z-10 w-full border-b border-border bg-card/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="font-editorial flex size-8 items-center justify-center border border-primary bg-primary text-xs font-black text-primary-foreground">
                枢
              </span>
              <div>
                <div className="font-editorial text-sm font-black tracking-[0.14em] text-foreground md:text-base">
                  天枢 · 沛然堂
                </div>
                <div className="label-mono hidden text-[9.5px] tracking-[0.12em] text-muted-foreground sm:block">
                  PEIRAN TANG BAZI SYSTEM · RUNS FULLY LOCAL
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="num-tabular hidden rounded-[2px] border border-border bg-background px-2 py-0.5 text-[11px] font-bold text-foreground sm:inline-flex">
              {APP_VERSION}
            </span>
            <Link
              to="/memorial"
              className="rounded-[2px] border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              特别纪念
            </Link>
          </div>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="relative z-10 mx-auto w-full max-w-[1380px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <BirthInputStudio
          analyzed={analyzed}
          isExpanded={inputExpanded}
          onToggleExpand={setInputExpanded}
          chart={chart}
          inputMode={inputMode}
          setInputMode={setInputMode}
          year={year}
          setYear={setYear}
          month={month}
          setMonth={setMonth}
          day={day}
          setDay={setDay}
          hour={hour}
          setHour={setHour}
          minute={minute}
          setMinute={setMinute}
          gender={gender}
          setGender={setGender}
          timePrecision={timePrecision}
          setTimePrecision={setTimePrecision}
          birthCity={birthCity}
          cityQuery={cityQuery}
          setCityQuery={setCityQuery}
          cityOpen={cityOpen}
          setCityOpen={setCityOpen}
          cityMatches={cityMatches}
          selectedCity={selectedCity}
          cityOffset={cityOffset}
          regionOffsetText={regionOffsetText}
          onSelectCity={selectCity}
          mYearStem={mYearStem}
          setMYearStem={setMYearStem}
          mYearBranch={mYearBranch}
          setMYearBranch={setMYearBranch}
          mMonthStem={mMonthStem}
          setMMonthStem={setMMonthStem}
          mMonthBranch={mMonthBranch}
          setMMonthBranch={setMMonthBranch}
          mDayStem={mDayStem}
          setMDayStem={setMDayStem}
          mDayBranch={mDayBranch}
          setMDayBranch={setMDayBranch}
          mHourStem={mHourStem}
          setMHourStem={setMHourStem}
          mHourBranch={mHourBranch}
          setMHourBranch={setMHourBranch}
          mBirthYear={mBirthYear}
          setMBirthYear={setMBirthYear}
          solarTermTheme={solarTermTheme}
          onAnalyze={handleAnalyze}
          onApplyPreset={applyPreset}
          onReset={handleReset}
        />

        {ready && chart && analysis && monthQi && yongJi && pattern && mingPanScore && wealthNobility && daYunAnalysis && (
          <div className="space-y-6">
            {/* 移动端粘滞快捷目录条 */}
            <MobileSectionStrip
              activeLine={activeLine}
              reportView={reportView}
              onChangeReportView={setReportView}
              activeSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
            />

            <div className={activeLine === 'yinyang' ? 'grid gap-6 xl:grid-cols-[200px_minmax(0,1fr)]' : ''}>
              {activeLine === 'yinyang' && (
                <ReportSidebar
                  activeLine={activeLine}
                  reportView={reportView}
                  onChangeReportView={setReportView}
                  activeSectionId={activeSectionId}
                  onSelectSection={handleSelectSection}
                />
              )}

              <div className="min-w-0 space-y-6">
                {/* 01 四柱总览 + 三线切换 */}
                <FourPillarsHero
                  chart={chart}
                  yongJi={yongJi}
                  zhuZiXiJi={zhuZiXiJi}
                  solarTermTheme={solarTermTheme}
                  timePrecision={timePrecision}
                  inputMode={inputMode}
                  activeLine={activeLine}
                  onSelectLine={setActiveLine}
                />

                {/* 阴阳线完整报告 */}
                {activeLine === 'yinyang' && (
                  <div className="space-y-6">
                    <OverviewAndMonthSection
                      chart={chart}
                      analysis={analysis}
                      monthQi={monthQi}
                      yongJi={yongJi}
                      mingPanScore={mingPanScore}
                      wealthNobility={wealthNobility}
                      daYunAnalysis={daYunAnalysis}
                      educationVerdict={educationVerdict}
                      xianDuan={xianDuan}
                      chunQiuFactor={chunQiuFactor}
                      ganZhiZiHe={ganZhiZiHe}
                      changShengRing={changShengRing}
                      guFaPangZheng={guFaPangZheng}
                      fullView={fullView}
                      gradeFn={letterFromScore}
                    />

                    <YongJiAndPatternSection
                      yongJi={yongJi}
                      taiJiQi={taiJiQi}
                      earthXiJi={earthXiJi}
                      zhuZiXiJi={zhuZiXiJi}
                      chartChars={chartChars}
                      fullView={fullView}
                    />

                    <DaYunSection
                      daYunAnalysis={daYunAnalysis}
                      pattern={pattern}
                      keyYears={keyYears}
                      guFaPangZheng={guFaPangZheng}
                      laoGaoRules={laoGaoRules}
                      expandedDY={expandedDY}
                      onToggleDY={setExpandedDY}
                      fullView={fullView}
                    />

                    <XiangFaSection
                      xiangYi={xiangYi}
                      educationVerdict={educationVerdict}
                      wuXingQuXiang={wuXingQuXiang}
                      guFaPangZheng={guFaPangZheng}
                      fullView={fullView}
                    />
                  </div>
                )}

                {/* 希腊占星线 */}
                {activeLine === 'greek' && (
                  <GreekReport model={greekModel} />
                )}

                {/* 大杂烩线 */}
                {activeLine === 'zalu' && (
                  <ZaluReport chart={chart} analysis={analysis} />
                )}

                {/* 底部返回顶部/重新排盘操作带 */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button variant="outline" size="lg" onClick={handleReset} className="font-bold">
                    重新排盘
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 版权与非商用声明页脚 */}
      <footer className="relative z-10 w-full border-t-2 border-foreground/80 bg-card py-8">
        <div className="mx-auto max-w-[1380px] px-4 text-center text-sm text-muted-foreground md:px-6">
          <div className="label-mono mb-2 text-primary">PEIRAN TANG / 沛然堂</div>
          <p className="text-xs">本工具仅供命理研究与学习参考，不构成任何人生决策建议</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span
              className="num-tabular border border-border px-2.5 py-0.5 text-xs font-bold text-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {APP_VERSION}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="label-mono">正式版</span>
          </div>
          <p className="mt-4 text-[11px] font-medium text-muted-foreground/75">
            内部代码 · 不可商用盈利 · 公开代码仅作为无害公开供人民群众监督
          </p>
        </div>
      </footer>

      {showBackTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="back-to-top"
          aria-label="回到顶部"
        >
          ↑
        </button>
      )}
    </div>
  );
}
