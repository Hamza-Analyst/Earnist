import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Gift, Sparkles } from 'lucide-react';
import { PageHeading, Modal, Field } from '../components/ui';

type Billing='monthly'|'annual';
const features=[
  'Connect unlimited banks and cards (read-only)',
  'Multiple businesses with per-persona categories',
  'Share a read-only link with your CPA',
  'AI receipt scanning',
  'Dashboard with projections and deduction estimates',
  'Unlimited swipe sessions on the Review deck',
  'Mileage tracker',
  'Year-end Schedule C report',
  'Batch receipt capture',
  'Priority support',
];

export default function Upgrade(){
  const [billing,setBilling]=useState<Billing>('annual'),[preview,setPreview]=useState(false),[promo,setPromo]=useState(''),[promoMessage,setPromoMessage]=useState('');
  function applyPromo(event:FormEvent){event.preventDefault();setPromoMessage(promo.trim()?'Promo codes are not connected in this preview.':'Enter a promo code to continue.');}
  return <>
    <PageHeading eyebrow="UNLOCK THE FULL TOOLKIT" title="Upgrade to Pro" description="Choose a plan to preview the complete Earnist toolkit."/>
    <section className="upgrade-plans" aria-label="Choose a billing plan">
      <button type="button" className={'upgrade-plan '+(billing==='monthly'?'selected':'')} aria-pressed={billing==='monthly'} onClick={()=>setBilling('monthly')}>
        <span className="upgrade-plan-label">MONTHLY</span><strong>$6<small>/mo</small></strong><span className="upgrade-plan-note">Cancel anytime</span>
        {billing==='monthly'&&<span className="upgrade-selected-mark" aria-label="Selected"><Check size={15}/></span>}
      </button>
      <button type="button" className={'upgrade-plan '+(billing==='annual'?'selected':'')} aria-pressed={billing==='annual'} onClick={()=>setBilling('annual')}>
        <span className="upgrade-plan-label">ANNUAL</span><strong>$60<small>/yr</small></strong><span className="upgrade-plan-note">$5/mo · best value</span>
        {billing==='annual'&&<span className="upgrade-selected-mark" aria-label="Selected"><Check size={15}/></span>}
      </button>
    </section>
    <p className="upgrade-plan-status" aria-live="polite">You’re previewing <strong>{billing==='annual'?'Annual ($60/yr)':'Monthly ($6/mo)'}</strong> billing. Select the other option to switch.</p>
    <section className="upgrade-trial-note"><span className="upgrade-note-icon"><Sparkles size={19}/></span><div><strong>Try Pro for 7 days. No card. No auto-charge.</strong><p>This is a prototype preview. It won’t start a trial, collect payment details, or create a subscription.</p></div></section>
    <section className="panel upgrade-benefits"><span className="eyebrow">EVERYTHING YOU GET</span><ul>{features.map(feature=><li key={feature}><Check size={15}/><span>{feature}</span></li>)}</ul><p className="upgrade-disclaimer">Feature availability and plan terms are illustrative in this prototype. Banking connections, AI processing, estimates, CPA sharing, and billing are not connected.</p></section>
    <div className="upgrade-actions">
      <details className="upgrade-promo"><summary><Gift size={14}/>Have a promo code?</summary><form onSubmit={applyPromo}><Field label="Promo code"><input value={promo} onChange={e=>{setPromo(e.target.value);setPromoMessage('');}} autoComplete="off"/></Field><button className="button secondary" type="submit">Apply code</button>{promoMessage&&<span role="status">{promoMessage}</span>}</form></details>
      <button className="text-button upgrade-skip" type="button" onClick={()=>setPreview(true)}>Skip trial, subscribe now →</button>
      <button className="button primary upgrade-cta" type="button" onClick={()=>setPreview(true)}>{billing==='annual'?'Add payment for after trial':'Start monthly Pro preview'}<ArrowRight size={17}/></button>
      <p className="upgrade-billing-note">No payment is collected in this prototype.</p>
    </div>
    {preview&&<Modal title="Pro plan preview" onClose={()=>setPreview(false)}><div className="upgrade-modal-price"><span>{billing==='annual'?'Annual plan':'Monthly plan'}</span><strong>{billing==='annual'?'$60 / year':'$6 / month'}</strong></div><p className="dialog-copy">Billing is not connected in this prototype, so no payment method or subscription will be created. Your current workspace remains available.</p><div className="form-actions"><button className="button secondary" onClick={()=>setPreview(false)}>Back to plans</button><button className="button primary" onClick={()=>setPreview(false)}>Continue using Earnist</button></div></Modal>}
  </>;
}
