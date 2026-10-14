import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, GitFork, Trash2, UserRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../data/Store';
import { allocation, classifyRecord, money } from '../domain/finance';
import type { Classification } from '../domain/models';
import { SWIPE_DEMO_ACCOUNT_ID, reviewSwipeDemo } from '../domain/sample';
import { moveToTrash } from '../domain/trash';
import { SwipeCard } from '../components/SwipeCard';
import { EmptyState, Field, Modal, PageHeading } from '../components/ui';

export default function Review(){
  const {records,commit,notify}=useStore(),[category,setCategory]=useState(''),[split,setSplit]=useState(false),[percent,setPercent]=useState(50),[busy,setBusy]=useState(false),lock=useRef(false),cooldown=useRef(0),release=useRef<ReturnType<typeof setTimeout>|null>(null),reviewLayoutRef=useRef<HTMLDivElement|null>(null);
  const [params,setParams]=useSearchParams(),accountId=params.get('account')??'', [dateFrom,setDateFrom]=useState(''),[dateTo,setDateTo]=useState(''),[showOnHold,setShowOnHold]=useState(false),[cpa,setCpa]=useState(false);
  const expenses=records.transactions.filter(t=>t.type==='expense'&&(!accountId||t.accountId===accountId));
  const dateRangeInvalid=!!dateFrom&&!!dateTo&&dateFrom>dateTo,dateRangeActive=!!dateFrom||!!dateTo;
  const matchesDate=(date:string)=>!dateRangeInvalid&&(!dateFrom||date>=dateFrom)&&(!dateTo||date<=dateTo);
  const filteredExpenses=expenses.filter(t=>matchesDate(t.date));
  const queue=filteredExpenses.filter(t=>t.reviewStatus==='unreviewed');
  const heldQueue=queue.filter(t=>records.skipped.includes(t.id));
  const [sessionIds,setSessionIds]=useState(()=>queue.filter(t=>!records.skipped.includes(t.id)).slice(0,20).map(t=>t.id));
  const current=showOnHold?heldQueue[0]:queue.find(t=>sessionIds.includes(t.id)&&!records.skipped.includes(t.id)),handled=sessionIds.filter(id=>!queue.some(t=>t.id===id)||records.skipped.includes(id)).length,remaining=queue.filter(t=>!records.skipped.includes(t.id)),sessionComplete=sessionIds.length>0&&handled===sessionIds.length;
  useEffect(()=>{setSessionIds(records.transactions.filter(t=>t.type==='expense'&&t.reviewStatus==='unreviewed'&&(!accountId||t.accountId===accountId)&&matchesDate(t.date)&&!records.skipped.includes(t.id)).slice(0,20).map(t=>t.id));},[accountId,dateFrom,dateTo]);
  useEffect(()=>{
    const layout=reviewLayoutRef.current;
    const deck=layout?.querySelector<HTMLElement>('.deck-wrapper');
    const card=deck?.querySelector<HTMLElement>('.swipe-card');
    if(!layout||!deck||!card)return;
    const syncSize=()=>{
      const layoutTop=layout.getBoundingClientRect().top;
      const deckTop=deck.getBoundingClientRect().top;
      layout.style.setProperty('--review-aside-offset',`${Math.max(0,deckTop-layoutTop)}px`);
      layout.style.setProperty('--review-card-height',`${card.getBoundingClientRect().height}px`);
    };
    syncSize();
    const observer=new ResizeObserver(syncSize);
    observer.observe(layout);observer.observe(deck);observer.observe(card);
    return()=>observer.disconnect();
  },[current?.id,showOnHold]);
  const demoLoaded=records.accounts.some(a=>a.id===SWIPE_DEMO_ACCOUNT_ID);
  async function demoCards(){
    if(busy||lock.current)return;
    setBusy(true);
    const restarting=demoLoaded&&!records.transactions.some(t=>t.accountId===SWIPE_DEMO_ACCOUNT_ID&&t.type==='expense'&&t.reviewStatus==='unreviewed');
    const next=reviewSwipeDemo(records);
    const ok=await commit(reviewSwipeDemo);
    if(ok){setSessionIds(next.transactions.filter(t=>t.accountId===SWIPE_DEMO_ACCOUNT_ID&&t.type==='expense'&&t.reviewStatus==='unreviewed'&&matchesDate(t.date)&&!next.skipped.includes(t.id)).slice(0,20).map(t=>t.id));setParams({account:SWIPE_DEMO_ACCOUNT_ID});notify(restarting?'New demo session ready. Swipe in any direction.':demoLoaded?'Your demo cards are ready to review.':'20 fictional expenses added. Swipe in any direction.');}
    setBusy(false);
  }
  function nextSession(){setSessionIds(remaining.slice(0,20).map(t=>t.id));}
  async function resume(){const ok=await commit(r=>({...r,skipped:r.skipped.filter(id=>!filteredExpenses.some(t=>t.id===id))}));if(ok)setSessionIds(queue.slice(0,20).map(t=>t.id));}
  const [businessCaseId,setBusinessCaseId]=useState(records.businessCases?.[0]?.id??'');
  useEffect(()=>{const selectedCase=current?.businessCaseId??records.businessCases?.[0]?.id??'';setBusinessCaseId(selectedCase);const allowed=records.businessCases?.find(item=>item.id===selectedCase)?.categoryIds??[];const caseCategory=current?.categoryId&&(!allowed.length||allowed.includes(current.categoryId))?current.categoryId:allowed[0]??'other';setCategory(caseCategory);setSplit(false);},[current?.id,records.businessCases]);
  useEffect(()=>()=>{lock.current=false;if(release.current)clearTimeout(release.current);},[]);
  async function classify(kind:Classification,businessPercent=kind==='business'?100:0){if(!current||lock.current||Date.now()<cooldown.current)return;lock.current=true;setBusy(true);const ok=await commit(r=>classifyRecord(r,current.id,kind,businessPercent,category||current.categoryId,Date.now(),businessCaseId||undefined));setSplit(false);if(ok){notify(`${current.description} marked as ${kind}${kind==='mixed'?` · ${businessPercent}% business`:''}. Saved to your records.`);cooldown.current=Date.now()+350;release.current=setTimeout(()=>{setBusy(false);lock.current=false;},350);}else{setBusy(false);lock.current=false;}}
  async function cardAction(action:'skip'|'trash'){
    if(!current||lock.current||Date.now()<cooldown.current)return;
    lock.current=true;setBusy(true);
    const ok=await commit(r=>action==='trash'?moveToTrash(r,current.id):r.skipped.includes(current.id)?r:{...r,skipped:[...r.skipped,current.id]});
    if(ok){notify(action==='trash'?'Moved to trash. Restore or permanently delete it from Trash.':'On hold. This expense remains unreviewed.');cooldown.current=Date.now()+350;release.current=setTimeout(()=>{setBusy(false);lock.current=false;},350);}else{setBusy(false);lock.current=false;}
  }
  async function skip(){await cardAction('skip');}
  async function trash(){await cardAction('trash');}
  useEffect(()=>{function keyboard(e:KeyboardEvent){if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||split||document.querySelector('dialog[open]')||(e.target instanceof Element&&e.target.closest('input,select,textarea,button,a,summary,[contenteditable]')))return;if(!current)return;const action=({ArrowRight:'business',ArrowLeft:'personal',ArrowUp:'skip',ArrowDown:'trash'} as const)[e.key as 'ArrowRight'|'ArrowLeft'|'ArrowUp'|'ArrowDown'];if(action){if((action==='skip'||action==='trash')&&!(e.target instanceof Element&&e.target.closest('.swipe-card')))return;e.preventDefault();if(action==='skip'||action==='trash')void cardAction(action);else void classify(action);}}window.addEventListener('keydown',keyboard);return()=>window.removeEventListener('keydown',keyboard);});
  const selectedCategories=records.businessCases?.find(item=>item.id===businessCaseId)?.categoryIds;
  const categories=selectedCategories?.length?records.categories.filter(item=>selectedCategories.includes(item.id)):records.categories;
  const businessTotal=expenses.reduce((sum,t)=>sum+allocation(t).business,0);
  const personalTotal=expenses.reduce((sum,t)=>sum+allocation(t).personal,0);
  return <>
    <PageHeading className="review-page-heading" title="Find your flow" description="">
      <Link to="/more#trash" className="button secondary"><Trash2 size={16}/>Trash ({records.trash?.length??0})</Link>
      <button type="button" className="button secondary" onClick={()=>setCpa(true)}><UserRound size={16}/>Connect to CPA<ArrowUpRight size={16}/></button>
    </PageHeading>
    {cpa&&<Modal title="CPA connections are coming." onClose={()=>setCpa(false)}><p className="dialog-copy">This button previews a future Earnist marketplace. Matching and booking are not available, and no request has been sent.</p><Link className="button primary" to="/reports" onClick={()=>setCpa(false)}>Prepare a report to share</Link></Modal>}
    {accountId&&<p className="helper swipe-account-note">Reviewing {records.accounts.find(a=>a.id===accountId)?.name??'this account'}. <Link className="text-button" to="/review">All accounts</Link></p>}
    <div className="review-layout" ref={reviewLayoutRef}><section className="review-main">
      <section className="panel swipe-date-filter" aria-label="Filter swipe cards by date">
        <div className="swipe-date-controls">
          <Field label="From date"><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></Field>
          <Field label="To date"><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></Field>
          <button type="button" className="filter-chip swipe-on-hold-toggle" aria-pressed={showOnHold} onClick={()=>setShowOnHold(v=>!v)}>On hold{heldQueue.length?` (${heldQueue.length})`:''}</button>
          <button type="button" className="text-button" disabled={!dateRangeActive} onClick={()=>{setDateFrom('');setDateTo('');}}>Clear dates</button>
        </div>
        {dateRangeInvalid&&<p className="period-error" role="alert">From date must be before to date.</p>}
      </section>
      <div className="review-progress-label"><span>{showOnHold?<><strong>{heldQueue.length}</strong> on hold</>:<><strong>{handled}</strong> of {sessionIds.length} in this session</>}</span><span>{showOnHold?'Held transactions':`${queue.filter(t=>!records.skipped.includes(t.id)).length} remaining`}</span></div>
      <progress className="review-progress" value={showOnHold?0:handled} max={Math.max(showOnHold?heldQueue.length:sessionIds.length,1)} aria-label={showOnHold?'On hold transactions':'Session progress'}/>
      {current?<>
        <SwipeCard key={current.id} transaction={current} account={records.accounts.find(a=>a.id===current.accountId)?.name??'Local account'} category={category||current.categoryId} categories={categories} onCategory={value=>{setCategory(value);void commit(r=>({...r,transactions:r.transactions.map(t=>t.id===current.id?{...t,categoryId:value}:t)}));}} onNotes={value=>{void commit(r=>({...r,transactions:r.transactions.map(t=>t.id===current.id?{...t,notes:value}:t)}));}} onSwipe={action=>action==='skip'||action==='trash'?void cardAction(action):void classify(action)} disabled={busy}/>
                <div className="keyboard-hint"><kbd>←</kbd> Personal · <kbd>→</kbd> Business · <kbd>↑</kbd> On hold · <kbd>↓</kbd> Trash</div>
        <button className="text-button" disabled={busy} onClick={()=>{setPercent(50);setSplit(true);}}><GitFork size={14}/> Split expense</button>
        
              </>:dateRangeInvalid?<EmptyState title="Fix the date range." description="The start date must be on or before the end date."><button className="button primary" onClick={()=>{setDateFrom('');setDateTo('');}}>Clear dates</button></EmptyState> :showOnHold&&!heldQueue.length?<EmptyState title="No expenses on hold." description={dateRangeActive?'There are no held transactions in this date range.':accountId?'There are no held transactions for this account.':'There are no held transactions.'}><button className="button primary" onClick={()=>setShowOnHold(false)}>Back to review</button></EmptyState>:dateRangeActive&&!filteredExpenses.length?<EmptyState title="No expenses in this date range." description="Try another range or clear the dates to see all expenses."><button className="button primary" onClick={()=>{setDateFrom('');setDateTo('');}}>Clear dates</button></EmptyState>:sessionComplete&&remaining.length?<EmptyState title="Session complete." description={handled+' transactions handled. '+queue.length+' still need a decision, including any expenses on hold.'}><button className="button primary" onClick={nextSession}>Continue with next {Math.min(remaining.length,20)}</button><Link className="button secondary" to="/overview">Return Home</Link></EmptyState>:queue.length?<EmptyState title="On hold." description={queue.length+' expenses are still unreviewed. They stay out of business totals until you classify them.'}><button className="button primary" onClick={()=>void resume()}>Resume expenses on hold</button><Link className="button secondary" to="/transactions">View transactions</Link></EmptyState>:<EmptyState title="All caught up." description={dateRangeActive?'All expense decisions in this date range are complete. Adjust the dates to review another period.':expenses.length?'All expense decisions are complete. Review your records or start another demo session.':'Add an expense manually or import a CSV to start your first review.'}><Link className="button primary" to="/transactions">View transactions</Link><Link className="button secondary" to="/overview">Return Home</Link><Link className="button secondary" to="/ready-to-file">Ready to file</Link></EmptyState>}
    </section><aside className="review-side">
      <section className="swipe-demo-start"><h2>Try a few swipes</h2><button className="button primary" disabled={busy} onClick={()=>void demoCards()}>Review demo cards</button></section>
      
      <div className="mini-total"><span>Expenses marked as business</span><strong>{money(businessTotal)}</strong></div>
      <div className="mini-total"><span>Expenses marked as personal</span><strong>{money(personalTotal)}</strong></div>
      
    </aside></div>
    {split&&current&&<Modal title="One expense. Two uses." onClose={()=>setSplit(false)}><p className="dialog-copy">{current.description} · {money(current.amountCents)}. Choose the portion used for your work.</p><Field label="Business percentage"><input type="number" min="1" max="99" step="1" value={percent} onChange={e=>setPercent(Number(e.target.value))}/></Field><input className="allocation-slider" aria-label="Adjust business percentage" type="range" min="1" max="99" value={percent} onChange={e=>setPercent(Number(e.target.value))}/><div className="split-preview"><div><span>Business · {percent}%</span><strong>{money(Math.round(current.amountCents*percent/100))}</strong></div><div><span>Personal · {100-percent}%</span><strong>{money(current.amountCents-Math.round(current.amountCents*percent/100))}</strong></div></div><p className="helper">Rounded to cents. Both portions always add up to the transaction total.</p><div className="form-actions"><button className="button secondary" onClick={()=>setSplit(false)}>Cancel</button><button className="button primary" disabled={busy||!Number.isInteger(percent)||percent<1||percent>99} onClick={()=>void classify('mixed',percent)}>Confirm split</button></div></Modal>}
  </>;
}
export function Timing(){const {records}=useStore();const {startedAt,firstSwipeAt}=records.profile;return <div className="timing-card"><span className="eyebrow">Time to first demo swipe</span><strong>{startedAt&&firstSwipeAt?`${Math.max(0,(firstSwipeAt-startedAt)/1000).toFixed(1)} seconds`:'Your first review is still ahead.'}</strong><p>From the first onboarding interaction to the first classification. Sample-data timing excludes real signup and banking time; it does not verify production onboarding speed.</p></div>;}
