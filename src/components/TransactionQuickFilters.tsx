import { useState } from 'react';
import type { Account, RecordFilter } from '../domain/models';
import { Field } from './ui';

type Period = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'range' | 'all';
const periodOptions: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' }, { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' }, { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'Year' }, { id: 'range', label: 'Date range' },
  { id: 'all', label: 'All history' },
];
const dateKey = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

function periodDates(period: Exclude<Period, 'range' | 'all'>, today = new Date()) {
  const year = today.getFullYear(), month = today.getMonth(), day = today.getDate();
  if (period === 'today') return { from: dateKey(today), to: dateKey(today) };
  if (period === 'week') {
    const monday = new Date(year, month, day - (today.getDay() + 6) % 7);
    return { from: dateKey(monday), to: dateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)) };
  }
  if (period === 'month') return { from: dateKey(new Date(year, month, 1)), to: dateKey(new Date(year, month + 1, 0)) };
  if (period === 'quarter') {
    const start = Math.floor(month / 3) * 3;
    return { from: dateKey(new Date(year, start, 1)), to: dateKey(new Date(year, start + 3, 0)) };
  }
  return { from: dateKey(new Date(year, 0, 1)), to: dateKey(new Date(year, 11, 31)) };
}

export default function TransactionQuickFilters({ accounts, value, onChange }: {
  accounts: Account[]; value: RecordFilter; onChange: (next: RecordFilter) => void;
}) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const visibleAccounts = accounts.length <= 4 ? accounts : accounts.slice(0, 3);
  const extraAccounts = accounts.slice(visibleAccounts.length);
  const matching = (['today', 'week', 'month', 'quarter', 'year'] as const).find(period => {
    const dates = periodDates(period);
    return value.from === dates.from && value.to === dates.to;
  });
  const activePeriod: Period = rangeOpen || (value.from || value.to) && !matching ? 'range' : matching ?? 'all';
  function choosePeriod(period: Period) {
    setRangeOpen(period === 'range');
    if (period === 'range') return;
    onChange({ ...value, ...(period === 'all' ? { from: '', to: '' } : periodDates(period)) });
  }
  return <div className="transaction-quick-filters" aria-label="Quick transaction filters">
    <div className="quick-filter-row"><span className="quick-filter-label">ACCOUNT</span><div className="quick-filter-options" role="group" aria-label="Account">
      <button type="button" className="filter-chip" aria-pressed={!value.accountId} onClick={() => onChange({ ...value, accountId: '' })}>All accounts</button>
      {visibleAccounts.map(account => <button type="button" className="filter-chip" aria-pressed={value.accountId === account.id} key={account.id} onClick={() => onChange({ ...value, accountId: account.id })}>{account.name}</button>)}
      {extraAccounts.length > 0 && <select className="filter-chip-select" aria-label="More accounts" value={extraAccounts.some(a => a.id === value.accountId) ? value.accountId : ''} onChange={event => onChange({ ...value, accountId: event.target.value })}><option value="" disabled>More accounts</option>{extraAccounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select>}
    </div></div>
    <div className="quick-filter-row"><span className="quick-filter-label">PERIOD</span><div className="quick-filter-options" role="group" aria-label="Period">
      {periodOptions.map(option => <button type="button" className="filter-chip" aria-pressed={activePeriod === option.id} key={option.id} onClick={() => choosePeriod(option.id)}>{option.label}</button>)}
    </div></div>
    {activePeriod === 'range' && <div className="quick-date-range"><Field label="From date"><input type="date" value={value.from} onChange={event => onChange({ ...value, from: event.target.value })}/></Field><Field label="To date"><input type="date" value={value.to} onChange={event => onChange({ ...value, to: event.target.value })}/></Field>{value.from && value.to && value.from > value.to && <span className="period-error" role="alert">From date must be before to date.</span>}</div>}
  </div>;
}

export function TransactionChoiceRow({ label, value, onChange, options }: {
  label: string; value: string; onChange: (next: string) => void; options: { value: string; label: string }[];
}) {
  return <div className="quick-filter-row"><span className="quick-filter-label">{label}</span><div className="quick-filter-options" role="group" aria-label={label}>
    {options.map(option => <button type="button" className="filter-chip" aria-pressed={value === option.value} key={option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div></div>;
}
