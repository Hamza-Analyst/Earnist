import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { money } from '../domain/finance';

type Month = { month: string; income: number; spending: number };
type ChartTip = { month: string; income: number; spending: number; left: number; top: number; below: boolean };
const monthLabel = (month: string, long = false) => new Date(month + '-15T12:00:00Z').toLocaleDateString('en-US', { month: long ? 'long' : 'short', year: long ? 'numeric' : '2-digit', timeZone: 'UTC' });

export function CashChart({ months }: { months: Month[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(650);
  const [tip, setTip] = useState<ChartTip | null>(null);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(entries => setChartWidth(Math.round(entries[0].contentRect.width)));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const max = Math.max(1, ...months.flatMap(m => [m.income, m.spending]));
  const height = 180, width = Math.max(200, Math.min(650, chartWidth)), pad = 38;
  const slot = (width - pad * 2) / Math.max(1, months.length), bar = Math.min(32, slot * .26);

  function showTip(event: SyntheticEvent<SVGRectElement>, month: Month) {
    const parent = container.current?.getBoundingClientRect();
    if (!parent) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const above = rect.top - parent.top - 8;
    setTip({ month: monthLabel(month.month, true), income: month.income, spending: month.spending,
      left: Math.max(100, Math.min(parent.width - 100, rect.left + rect.width / 2 - parent.left)),
      top: above < 76 ? rect.bottom - parent.top + 8 : above, below: above < 76 });
  }

  return <div ref={container} className="cash-chart"><div className="chart-legend"><span><i className="income-dot"/>Income</span><span><i className="spending-dot"/>Spending</span></div>{months.length ? <>
    <svg viewBox={'0 0 ' + width + ' 235'} role="group" aria-label="Monthly recorded income and expense spending, excluding transfers">
      {[0, .5, 1].map(frac => <g key={frac}><line x1={pad} x2={width - pad} y1={height - height * frac + 10} y2={height - height * frac + 10} stroke="var(--chart-grid)" strokeDasharray="3 4"/><text x="0" y={height - height * frac + 14} className="chart-axis">{Math.round(max * frac / 100) >= 1000 ? (max * frac / 100 / 1000).toFixed(1) + 'k' : Math.round(max * frac / 100)}</text></g>)}
      {months.map((month, index) => {
        const x = pad + slot * (index + .5), label = monthLabel(month.month, true);
        return <g key={month.month}>
          <rect x={x - bar - 3} y={height - month.income / max * height + 10} width={bar} height={Math.max(0, month.income / max * height)} rx="4" fill="var(--lime)" tabIndex={0} role="img" aria-label={label + ' income ' + money(month.income)} onMouseEnter={event => showTip(event, month)} onMouseLeave={() => setTip(null)} onFocus={event => showTip(event, month)} onBlur={() => setTip(null)}/>
          <rect x={x + 3} y={height - month.spending / max * height + 10} width={bar} height={Math.max(0, month.spending / max * height)} rx="4" fill="var(--chart-spending)" tabIndex={0} role="img" aria-label={label + ' spending ' + money(month.spending)} onMouseEnter={event => showTip(event, month)} onMouseLeave={() => setTip(null)} onFocus={event => showTip(event, month)} onBlur={() => setTip(null)}/>
          <text x={x} y="219" textAnchor="middle" className="chart-axis">{index % Math.max(1, Math.ceil(42 / slot)) === 0 ? monthLabel(month.month) : ''}</text>
        </g>;
      })}
    </svg>
    {tip && <div className={'chart-hover-detail' + (tip.below ? ' below' : '')} style={{ left: tip.left, top: tip.top }} role="tooltip"><strong>{tip.month}</strong><span><i className="income-dot"/>Income <b>{money(tip.income)}</b></span><span><i className="spending-dot"/>Spending <b>{money(tip.spending)}</b></span></div>}
    <details className="chart-data"><summary>View chart data</summary><table><thead><tr><th>Month</th><th>Income</th><th>Spending</th></tr></thead><tbody>{months.map(month => <tr key={month.month}><td>{month.month}</td><td>{money(month.income)}</td><td>{money(month.spending)}</td></tr>)}</tbody></table></details>
  </> : <p className="chart-empty">No income or spending in this period.</p>}</div>;
}

export function CategoryChart({ entries, emptyMessage = 'Classify an expense as business to see categories here.', initialLimit, expanded: controlledExpanded, onExpandedChange }: { entries: { id: string; name: string; cents: number }[]; emptyMessage?: string; initialLimit?: number; expanded?: boolean; onExpandedChange?: (expanded: boolean) => void }) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = controlledExpanded ?? localExpanded;
  const setExpanded = onExpandedChange ?? setLocalExpanded;
  const max = Math.max(1, ...entries.map(entry => entry.cents));
  const total = entries.reduce((sum, entry) => sum + entry.cents, 0);
  const hiddenCount = initialLimit ? Math.max(0, entries.length - initialLimit) : 0;
  const visibleEntries = hiddenCount && !expanded ? entries.slice(0, initialLimit) : entries;
  return <div className="category-chart">{entries.length ? <>
    {visibleEntries.map((entry, index) => <div className="category-bar" key={entry.id}><div><span>{entry.name}</span><strong>{money(entry.cents)}</strong></div><span className="category-track" tabIndex={0} role="img" aria-label={entry.name + ': ' + money(entry.cents) + ', ' + Math.round(entry.cents / total * 100) + ' percent of total'}><span style={{ width: entry.cents / max * 100 + '%', background: index === 0 ? 'var(--lime)' : index === 1 ? 'var(--chart-category-second)' : 'var(--chart-category-third)' }}/></span><span className="category-hover-detail" role="tooltip">{entry.name}: <strong>{money(entry.cents)}</strong> · {Math.round(entry.cents / total * 100)}% of total</span></div>)}
    {hiddenCount > 0 && <button type="button" className="category-show-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show fewer categories' : 'Show more categories'}<span aria-hidden="true">{expanded ? '↑' : '↓'}</span></button>}
  </> : <p className="chart-empty">{emptyMessage}</p>}</div>;
}


const categoryColors = ['var(--lime)', 'var(--chart-category-second)', 'var(--chart-category-third)', '#e8ba6b', '#7fa9c8', '#c28aab', '#b5a1dc', '#df927c', '#6cb5b0', '#cebd91', '#87949b'];

export function CategoryPieChart({ entries, emptyMessage = 'Classify an expense as business to see categories here.' }: { entries: { id: string; name: string; cents: number }[]; emptyMessage?: string }) {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.cents), 0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeEntry = entries.find(entry => entry.id === activeId);
  const percentage = (cents: number) => total ? (Math.max(0, cents) / total * 100).toLocaleString('en-US', { maximumFractionDigits: 1 }) : '0';
  let angle = -Math.PI / 2;
  return <div className="category-pie-chart">
    {total > 0 ? <div className="category-pie-visual">
      <svg viewBox="0 0 240 240" role="group" aria-label="Business spending by category pie chart">
        {entries.map((entry, index) => {
          if (entry.cents <= 0) return null;
          const share = entry.cents / total;
          const start = angle;
          angle += share * Math.PI * 2;
          const point = (value: number) => [120 + 108 * Math.cos(value), 120 + 108 * Math.sin(value)];
          const [startX, startY] = point(start), [endX, endY] = point(angle);
          const label = entry.name + ': ' + money(entry.cents) + ', ' + percentage(entry.cents) + '% of business spending';
          const props = { fill: categoryColors[index % categoryColors.length], tabIndex: 0, role: 'img', 'aria-label': label,
            className: 'category-pie-slice' + (activeId === entry.id ? ' active' : ''),
            onMouseEnter: () => setActiveId(entry.id), onMouseLeave: () => setActiveId(null),
            onFocus: () => setActiveId(entry.id), onBlur: () => setActiveId(null) };
          return share === 1 ? <circle key={entry.id} cx="120" cy="120" r="108" {...props}><title>{label}</title></circle>
            : <path key={entry.id} d={'M 120 120 L ' + startX + ' ' + startY + ' A 108 108 0 ' + (share > .5 ? 1 : 0) + ' 1 ' + endX + ' ' + endY + ' Z'} {...props}><title>{label}</title></path>;
        })}
      </svg>
      <div className="category-pie-summary" aria-live="polite"><span>{activeEntry?.name ?? 'Total business spending'}</span><strong>{money(activeEntry?.cents ?? total)}</strong><small>{activeEntry ? percentage(activeEntry.cents) + '% of total' : 'Across all categories'}</small></div>
    </div> : <p className="chart-empty">{emptyMessage}</p>}
    {entries.length > 0 && <ul className="category-pie-legend" aria-label="All business spending categories">
      {entries.map((entry, index) => <li key={entry.id} className={activeId === entry.id ? 'active' : undefined}>
        <i aria-hidden="true" style={{ background: categoryColors[index % categoryColors.length] }}/><span className="category-pie-name">{entry.name}</span><strong>{money(entry.cents)}</strong><span className="category-pie-percent">{percentage(entry.cents)}%</span>
      </li>)}
    </ul>}
  </div>;
}
