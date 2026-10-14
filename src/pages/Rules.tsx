import { useState } from 'react';
import { Pencil, Plus, Repeat2, Trash2 } from 'lucide-react';
import { useStore } from '../data/Store';
import { money } from '../domain/finance';
import { ruleMatches } from '../domain/rules';
import { Confirm, EmptyState, PageHeading } from '../components/ui';
import RuleEditor from '../components/RuleEditor';

export default function Rules() {
  const { records, commit, notify } = useStore();
  const [editor, setEditor] = useState<string | null>(null);
  const [remove, setRemove] = useState<string | null>(null);
  return <>
    <PageHeading eyebrow="LESS REPETITION. YOUR CONTROL." title="Rules for the work you repeat."
      description="Classify new expenses by merchant. Preview the match, keep corrections yours.">
      <button className="button primary" onClick={()=>setEditor('new')}><Plus size={16}/>Create rule</button>
    </PageHeading>
    <div className="context-note rule-intro">Enabled rules apply to new unreviewed expenses only. Reviewed records keep your decisions. If multiple enabled rules match, the expense stays unreviewed. Disable a rule at any time; earlier records keep their classifications.</div>
    <div className="rules-list">{records.rules.length ? records.rules.map(rule=>{
      const matches=records.transactions.filter(t=>t.type==='expense'&&ruleMatches(rule,t.description));
      return <section className="panel rule-card" key={rule.id}><div className="rule-card-title"><span className="next-icon"><Repeat2 size={20}/></span><div><h2>{rule.merchant}</h2><p>{rule.match==='exact'?'Exact description':'Description contains'} · {records.categories.find(c=>c.id===rule.categoryId)?.name}</p></div><span className={`badge ${rule.enabled?'business':'neutral'}`}>{rule.enabled?'Enabled':'Disabled'}</span></div>
        <p className="rule-allocation"><strong>{rule.classification} · {rule.businessPercent}% business</strong> · A $100 purchase allocates {money(rule.businessPercent*100)} to business expenses.</p>
        <div className="rule-card-actions"><span>{matches.length} matching expense records</span><button className="button secondary" onClick={()=>setEditor(rule.id)}><Pencil size={14}/>Preview / Edit</button><button className="button secondary" onClick={async()=>{if(await commit(r=>({...r,rules:r.rules.map(item=>item.id===rule.id?{...item,enabled:!item.enabled}:item)})))notify(`Rule ${rule.enabled?'disabled':'enabled'}. Existing classifications kept.`);}}>{rule.enabled?'Disable rule':'Enable rule'}</button><button className="icon-button danger-text" aria-label={`Delete rule for ${rule.merchant}`} onClick={()=>setRemove(rule.id)}><Trash2 size={17}/></button></div>
      </section>;
    }) : <section className="panel"><EmptyState title="Make repeat expenses easier." description="Create an exact merchant match or a contains rule. Preview classification and allocations before enabling it."><button className="button primary" onClick={()=>setEditor('new')}>Create your first rule</button></EmptyState></section>}</div>
    {editor&&<RuleEditor rule={records.rules.find(rule=>rule.id===editor)} onClose={()=>setEditor(null)}/>}
    {remove&&<Confirm title="Delete this rule?" description="Future expenses will no longer use this rule. Existing classifications and receipts remain unchanged." onClose={()=>setRemove(null)} onConfirm={async()=>{if(await commit(r=>({...r,rules:r.rules.filter(rule=>rule.id!==remove)}))){notify('Rule deleted. Earlier expense records kept.');setRemove(null);}}}/>}
  </>;
}
