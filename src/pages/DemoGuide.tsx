import { ArrowRight, Check, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../data/Store';
import { money, summarize } from '../domain/finance';
import { demoAccess } from '../domain/demoPolicy';
import { PageHeading } from '../components/ui';

const improvements=[
  ['Setup friction','Audit reports 16 steps, including 14 question screens; bank connection at step 15.','One optional work question, then sample account or test card and direct Review. Tax context is saved separately afterward.','/profile'],
  ['Financial language','Audit reports “saved” figures alongside missing income and conflicting deduction totals.','Recorded income, business allocations, personal spending, and unreviewed expenses remain distinct. Tax savings are uncalculated.','/overview'],
  ['Review control','The demo must demonstrate useful decisions and corrections.','Editable categories, mixed-use percentages, undo, skip, and persistent review progress.','/review'],
  ['Usable records','Swiping must lead into record management.','Search, filters, manual entries, edits, notes, and locally stored receipt files share the same records.','/transactions'],
  ['Repeated work','Users need control over similar future expenses.','Preview merchant rules, edit or disable them, and retain reviewed decisions. Ambiguous matches stay unreviewed.','/rules'],
  ['Navigation and reports','Audit reports Reports hidden under Money and tour/menu naming mismatches.','Reports and Rules open from the main navigation. CSV and printable summaries use the filtered records. No app-store links or forced tour.','/reports'],
  ['Trial trust','Audit reports contradictory charging and trial messages.','One demo access policy: no expiry, no charges, no subscription. Production trial and plan terms are not invented.','/profile'],
];
export default function DemoGuide(){
  const {records}=useStore(),total=summarize(records,{from:'',to:'',accountId:''});
  const steps=[
    {title:'Enter and personalize—or skip',text:'Account setup stays separate from the tax profile. Restart onboarding in settings while keeping records.',to:'/profile',done:records.profile.onboardingComplete},
    {title:'Load a sample account',text:'Accounts explains the fictional source. A test card is available too; neither asks for credentials.',to:'/accounts',done:records.accounts.some(a=>a.kind==='sample')},
    {title:'Classify an expense as business',text:'Open Review. Change its category if needed, then swipe right or choose Business. Undo remains available.',to:'/review',done:!!records.profile.firstSwipeAt},
    {title:'See Overview update',text:`Current expenses marked as business: ${money(total.business)}. The figure derives from classified allocations.`,to:'/overview'},
    {title:'Correct the allocation and attach a receipt',text:'Open that record in Transactions, choose Mixed, set the business percentage, and attach a local file.',to:'/transactions',done:records.transactions.some(t=>t.type==='expense'&&t.classification==='mixed'&&!!t.receiptId)},
    {title:'Create a merchant rule',text:'Create from the saved transaction or Rules. Preview a matching description and allocation; reviewed records stay intact.',to:'/rules',done:records.rules.length>0},
    {title:'Export a useful report',text:'Open Reports, choose dates and an account, inspect the allocations, export CSV, or Print / Save PDF.',to:'/reports'},
    {title:'Reload and resume',text:'Reload this browser tab. Transactions, receipt files, rules, profile drafts, and review progress persist in IndexedDB.',to:'/overview'},
  ];
  return <><PageHeading eyebrow="AIBIT SOL · CLIENT PRESENTATION" title="Show the fix. Follow the records." description="An optional presentation guide, alongside the working application. Audit findings below are reported observations—not a fresh verification of the live product."><Link className="button primary" to="/review">Open Review<ArrowRight size={16}/></Link></PageHeading>
    <section className="panel guide-onboarding"><span className="eyebrow">EARLIER CONNECTION, LESS UPFRONT WORK</span><h2>From the reported 16 steps to a useful first review.</h2><div className="guide-flow"><div><b>1</b><strong>Work type</strong><span>One question · Skip allowed</span></div><ArrowRight size={20}/><div><b>2</b><strong>Sample account</strong><span>Simulation · No credentials</span></div><ArrowRight size={20}/><div><b>3</b><strong>First review</strong><span>Profile questions afterward</span></div></div><p className="helper">A brief demo entry precedes these actions. No installation prompt or lengthy tour blocks review. Demo timing excludes real signup and banking setup.</p></section>
    <div className="guide-grid"><section className="panel"><div className="section-heading"><h2><ClipboardList size={18}/>The connected demonstration journey</h2></div><ol className="guide-journey">{steps.map((step,i)=><li key={step.title}><span className={`guide-step-number ${step.done?'done':''}`}>{step.done?<Check size={16}/>:i+1}</span><div><Link to={step.to}><strong>{step.title}</strong><ArrowRight size={14}/></Link><p>{step.text}</p></div></li>)}</ol></section><div><section className="panel guide-allocation"><span className="eyebrow">THE CONCRETE FINANCIAL DISTINCTION</span><h2>$100 purchase.<br/>60% for work.</h2><div className="split-preview"><div><span>Business expenses</span><strong>$60.00</strong></div><div><span>Personal spending</span><strong>$40.00</strong></div></div><p>These portions organize the purchase. They do not represent tax savings or confirm deductibility.</p><span className="badge neutral">Tax estimate not calculated</span></section><section className="panel guide-access"><h2>{demoAccess.name}</h2><p>{demoAccess.duration} · {demoAccess.charging}</p><p className="helper">{demoAccess.description}</p></section></div></div>
    <section className="panel guide-mapping"><h2>Reported problem → Demonstrable response</h2><div className="guide-mapping-table">{improvements.map(([area,before,after,to])=><article key={area}><h3>{area}</h3><div><span className="eyebrow">REPORTED CONTEXT</span><p>{before}</p></div><div><span className="eyebrow">IN THIS DEMO</span><p>{after}</p><Link className="text-button" to={to}>See the workflow<ArrowRight size={14}/></Link></div></article>)}</div><p className="helper">Source: Earnist Summary by AiBit Sol audit, dated September 30, 2026 (pages 2 and 5). The exact 14 question prompts were not supplied. Proposed profile fields here do not reproduce those questions. Tax-limit changes, AI audits, live billing, and marketing SEO are outside this build.</p></section>
  </>;
}
