import { useState, type FormEvent } from 'react';
import { Check, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../data/Store';
import { ErrorMessage, Field } from './ui';

export default function TaxProfileSection() {
  const { records, commit, notify } = useStore();
  const [year, setYear] = useState(records.profile.tax.reportYear);
  const [jurisdiction, setJurisdiction] = useState(records.profile.tax.jurisdiction);
  const [notes, setNotes] = useState(records.profile.tax.preparationNotes);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault(); setError('');
    if(year&&(!/^\d{4}$/.test(year)||Number(year)<1900||Number(year)>2100)) { setError('Use a four-digit reporting year from 1900 to 2100, or leave it blank.'); return; }
    setBusy(true);
    const ok=await commit(r=>({...r,profile:{...r.profile,tax:{reportYear:year,jurisdiction:jurisdiction.trim(),preparationNotes:notes.trim(),updatedAt:new Date().toISOString()}}}));
    setBusy(false);
    if(ok)notify('Tax profile draft saved locally. You can return later; no tax estimate was calculated.');
  }
  return <section className="panel tax-profile-section" id="tax-profile" aria-label="Resumable tax profile">
    <div className="section-heading"><div><span className="eyebrow">AFTER YOUR FIRST USEFUL REVIEW</span><h2>Tax profile · Save a little, return later</h2><p>Proposed record-preparation context, separate from setup. These are not a reconstruction of the audit’s 14 question screens.</p></div><span className="badge neutral">{records.profile.tax.updatedAt?<><Check size={13}/>Draft saved</>:'Not started'}</span></div>
    <div className="tax-profile-grid"><form onSubmit={e=>void save(e)} noValidate>
      <ErrorMessage message={error}/>
      <Field label="Reporting year" hint="Optional. Used as the default date range when you open Reports; you can change that range there."><input inputMode="numeric" maxLength={4} value={year} placeholder="e.g. 2026" onChange={e=>setYear(e.target.value)}/></Field>
      <Field label="Tax country or jurisdiction" hint="Optional user-provided context for your report and local export. No jurisdiction-specific rules or eligibility decisions are applied."><input value={jurisdiction} maxLength={120} placeholder="e.g. United States / Texas" onChange={e=>setJurisdiction(e.target.value)}/></Field>
      <Field label="Tax preparation notes" hint="Optional context to include in your report, such as questions for your accountant. Do not enter tax IDs or financial-service credentials."><textarea value={notes} maxLength={2000} rows={3} onChange={e=>setNotes(e.target.value)} placeholder="What would you like to remember at tax time?"/></Field>
      <div className="form-actions"><Link className="button secondary" to="/reports">Return to Reports</Link><button className="button primary" disabled={busy}><Save size={15}/>{busy?'Saving…':'Save tax profile draft'}</button></div>
      <p className="helper">Save progress before leaving. You can leave fields blank and resume from Profile & settings after a reload.</p>
    </form><aside className="context-note"><strong>Tax estimation stays unavailable.</strong><p>These details organize records. They are insufficient to calculate taxes or savings. A future estimation feature must explain and request its genuinely required inputs, using validated rules.</p><p>Review, receipts, merchant rules, mileage, and exports work without completing this draft.</p></aside></div>
  </section>;
}
