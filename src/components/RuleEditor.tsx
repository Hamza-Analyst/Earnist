import { useState, type FormEvent } from 'react';
import { Eye, Save } from 'lucide-react';
import { useStore } from '../data/Store';
import { newId, today, type Classification, type MerchantRule, type Transaction } from '../domain/models';
import { matchingRules, ruleMatches, saveRule, validateRule } from '../domain/rules';
import { money } from '../domain/finance';
import { ErrorMessage, Field, Modal } from './ui';

export default function RuleEditor({ rule, source, onClose }: {
  rule?: MerchantRule; source?: Transaction; onClose: () => void;
}) {
  const { records, commit, notify } = useStore();
  const [id] = useState(rule?.id ?? newId());
  const [merchant, setMerchant] = useState(rule?.merchant ?? source?.description ?? '');
  const [match, setMatch] = useState<MerchantRule['match']>(rule?.match ?? 'exact');
  const [classification, setClassification] = useState<Classification>(rule?.classification ?? source?.classification ?? 'business');
  const [percent, setPercent] = useState(rule?.businessPercent ?? source?.businessPercent ?? 100);
  const [categoryId, setCategoryId] = useState(rule?.categoryId ?? source?.categoryId ?? 'other');
  const [enabled, setEnabled] = useState(rule?.enabled ?? true);
  const [applyExisting, setApplyExisting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const draft: MerchantRule = { id, merchant: merchant.trim(), match, classification,
    businessPercent: classification === 'business' ? 100 : classification === 'personal' ? 0 : percent,
    categoryId, enabled, createdAt: rule?.createdAt ?? today() };
  const proposed = [...records.rules.filter(r => r.id !== id), draft];
  const matches = records.transactions.filter(t => t.type === 'expense' && ruleMatches(draft, t.description));
  const eligible = matches.filter(t => t.reviewStatus === 'unreviewed' && enabled && matchingRules(proposed, t.description).length === 1);
  const exampleBusiness = Math.round(10000 * draft.businessPercent / 100);
  async function save(e: FormEvent) {
    e.preventDefault();
    const problem = validateRule(draft, records);
    if (problem) { setError(problem); return; }
    setBusy(true);
    const ok = await commit(r => saveRule(r, draft, applyExisting));
    setBusy(false);
    if (ok) { notify(`${rule ? 'Rule updated' : 'Rule created'}. ${applyExisting ? 'Matching unreviewed expenses updated; reviewed records kept.' : 'Existing records kept. Enabled rules apply to new unreviewed expenses.'}`); onClose(); }
  }
  return <Modal title={rule ? 'Edit merchant rule' : 'Create merchant rule'} wide onClose={onClose}>
    <p className="dialog-copy">Preview the match before saving. Enabled rules classify future unreviewed expenses from manual entry, CSV import, or sample connection. Reviewed records are never overwritten.</p>
    <form onSubmit={e => void save(e)} noValidate>
      <ErrorMessage message={error}/>
      <div className="form-grid"><Field label="Merchant match" hint="Case-insensitive; extra spaces are ignored. Use at least three characters."><input value={merchant} maxLength={200} onChange={e => setMerchant(e.target.value)}/></Field>
        <Field label="Match method"><select value={match} onChange={e => setMatch(e.target.value as MerchantRule['match'])}><option value="exact">Exact description</option><option value="contains">Description contains</option></select></Field></div>
      <div className="form-grid"><Field label="Rule classification"><select value={classification} onChange={e => {const value=e.target.value as Classification;setClassification(value);if(value==='mixed')setPercent(60);}}><option value="business">Business · 100%</option><option value="personal">Personal · 0%</option><option value="mixed">Mixed · Choose allocation</option></select></Field>
        <Field label="Rule category"><select value={categoryId} onChange={e => setCategoryId(e.target.value)}>{records.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field></div>
      {classification === 'mixed' && <Field label="Rule business percentage"><input type="number" min="1" max="99" step="1" value={percent} onChange={e => setPercent(Number(e.target.value))}/></Field>}
      <div className="context-note"><strong>Allocation preview</strong><p>A $100.00 matching expense becomes <b>{money(exampleBusiness)} in business expenses</b> and {money(10000-exampleBusiness)} personal spending. Tax savings are not calculated.</p></div>
      <label className="rule-check"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}/>Enable for future expenses</label>
      <section className="rule-preview" aria-label="Merchant rule preview"><h3><Eye size={17}/>Match preview · {matches.length} expenses</h3><p>{eligible.length} unreviewed expenses eligible. Reviewed records and ambiguous matches stay unchanged.</p>
        {matches.length ? <ul>{matches.slice(0,8).map(t => <li key={t.id}><span><strong>{t.description}</strong><small>{t.date} · {t.reviewStatus}</small></span><span>{money(t.amountCents)}<small>{eligible.some(row=>row.id===t.id)?`${draft.businessPercent}% business`:'Preserved'}</small></span></li>)}</ul> : <p>No existing matches. The rule can still apply to future expenses.</p>}
        {matches.length>8&&<p>{matches.length-8} more matching records.</p>}
        <label className="rule-check"><input type="checkbox" checked={applyExisting} disabled={!eligible.length} onChange={e => setApplyExisting(e.target.checked)}/>Also apply to {eligible.length} matching unreviewed expenses now</label>
      </section>
      <div className="form-actions"><button className="button secondary" type="button" onClick={onClose}>Cancel</button><button className="button primary" type="submit" disabled={busy}><Save size={16}/>{busy?'Saving…':'Save rule'}</button></div>
    </form>
  </Modal>;
}
