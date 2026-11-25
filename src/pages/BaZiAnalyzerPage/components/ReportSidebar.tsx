import { BookOpen, Eye } from 'lucide-react';
import type { AnalysisLineKey } from '@/analysis';
import { REPORT_SECTIONS } from '../constants';

interface ReportSidebarProps {
  activeLine: AnalysisLineKey;
  reportView: 'concise' | 'full';
  onChangeReportView: (v: 'concise' | 'full') => void;
  activeSectionId: string;
  onSelectSection?: (id: string) => void;
}

/** 阴阳线粘滞目录侧栏 + 移动端快捷导航栏 + 精读/全量开关 */
export function ReportSidebar({
  activeLine,
  reportView,
  onChangeReportView,
  activeSectionId,
  onSelectSection,
}: ReportSidebarProps) {
  const sections = activeLine === 'yinyang' ? REPORT_SECTIONS : REPORT_SECTIONS.slice(0, 1);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6 space-y-4">
        {/* 视图深度开关 */}
        <div className="border border-border bg-card p-3.5">
          <div className="label-mono mb-2 text-[10px] text-muted-foreground">阅读模式 VIEW</div>
          <div className="grid grid-cols-2 gap-1 border border-border bg-muted/40 p-0.5">
            {([
              { key: 'concise', label: '精读结论', Icon: Eye },
              { key: 'full', label: '全量研读', Icon: BookOpen },
            ] as const).map(({ key, label, Icon }) => {
              const active = reportView === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChangeReportView(key)}
                  className={`inline-flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-3" />
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
            {reportView === 'concise'
              ? '优先呈现主判结论与关键图标，减少冗长推演；古法旁证可点开查阅。'
              : '自动展开所有推演明细、口诀原文与古法依据。'}
          </p>
        </div>

        {/* 目录定位 */}
        <nav aria-label="命理报告目录" className="border border-border bg-card p-3">
          <div className="label-mono mb-2 px-2 text-[10px] text-muted-foreground">章节索引 INDEX</div>
          <ul className="space-y-0.5">
            {sections.map((sec) => {
              const isCurrent = activeSectionId === sec.id;
              return (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    onClick={() => onSelectSection?.(sec.id)}
                    className={`flex items-center gap-2.5 rounded-[2px] px-2.5 py-2 text-xs transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 font-bold text-primary'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold opacity-80">{sec.num}</span>
                    <span>{sec.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

/** 窄屏顶部粘滞目录条 */
export function MobileSectionStrip({
  activeLine,
  reportView,
  onChangeReportView,
  activeSectionId,
  onSelectSection,
}: ReportSidebarProps) {
  const sections = activeLine === 'yinyang' ? REPORT_SECTIONS : REPORT_SECTIONS.slice(0, 1);
  if (activeLine !== 'yinyang') return null;

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-4 border-y border-border bg-background/95 px-4 py-2 backdrop-blur-sm xl:hidden">
      <div className="no-scrollbar flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          {sections.map((sec) => {
            const isCurrent = activeSectionId === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => onSelectSection?.(sec.id)}
                className={`shrink-0 whitespace-nowrap rounded-[2px] border px-2 py-1 text-[11px] font-bold transition-colors ${
                  isCurrent
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {sec.num} {sec.label}
              </a>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onChangeReportView(reportView === 'concise' ? 'full' : 'concise')}
          className="shrink-0 whitespace-nowrap rounded-[2px] border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground"
        >
          {reportView === 'concise' ? '切至全量' : '切至精读'}
        </button>
      </div>
    </div>
  );
}
