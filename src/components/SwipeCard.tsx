import { useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, WalletCards } from 'lucide-react';
import { dateLabel, money } from '../domain/finance';
import type { Category, Transaction } from '../domain/models';
export type SwipeAction = 'business' | 'personal' | 'skip' | 'trash';
export function SwipeCard({transaction,account,categories,category,onCategory,onNotes,onSwipe,disabled}:{transaction:Transaction;account:string;categories:Category[];category:string;onCategory:(v:string)=>void;onNotes:(v:string)=>void;onSwipe:(action:SwipeAction)=>void;disabled:boolean}){
  const gesture=useRef<{x:number;y:number;id:number;axis:'x'|'y'|null}|null>(null),[drag,setDrag]=useState({x:0,y:0}),[notes,setNotes]=useState(transaction.notes);
  function start(e:PointerEvent<HTMLElement>){
    if(disabled||e.button!==0||!e.isPrimary||(e.target instanceof Element&&e.target.closest('select,button,input,textarea,label,a')))return;
    gesture.current={x:e.clientX,y:e.clientY,id:e.pointerId,axis:null};
  }
  function move(e:PointerEvent<HTMLElement>){
    const g=gesture.current;if(!g||g.id!==e.pointerId)return;
    const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(!g.axis){if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.5)g.axis='x';else if(Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)*1.5)g.axis='y';if(g.axis)e.currentTarget.setPointerCapture(e.pointerId);}
    if(g.axis){e.preventDefault();setDrag(g.axis==='x'?{x:Math.max(-120,Math.min(120,dx)),y:0}:{x:0,y:Math.max(-120,Math.min(120,dy))});}
  }
  function end(e:PointerEvent<HTMLElement>){
    const g=gesture.current;gesture.current=null;setDrag({x:0,y:0});if(!g||g.id!==e.pointerId||disabled)return;
    const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(g.axis==='x'&&Math.abs(dx)>=80&&Math.abs(dx)>Math.abs(dy)*1.5)onSwipe(dx>0?'business':'personal');
    else if(g.axis==='y'&&Math.abs(dy)>=80&&Math.abs(dy)>Math.abs(dx)*1.5)onSwipe(dy<0?'skip':'trash');
  }
  function cancel(){gesture.current=null;setDrag({x:0,y:0});}
  const action:SwipeAction|null=Math.abs(drag.x)>25?(drag.x>0?'business':'personal'):Math.abs(drag.y)>25?(drag.y<0?'skip':'trash'):null;
  const label=action==='business'?'Business':action==='personal'?'Personal':action==='skip'?'On hold':'Move to trash';
  const Direction=action==='business'?ArrowRight:action==='personal'?ArrowLeft:action==='skip'?ArrowUp:ArrowDown;
  return <div className="deck-wrapper"><div className="deck-shadow"/><article className={`swipe-card ${drag.x||drag.y?'dragging':''}`} aria-label={`Review ${transaction.description}`} tabIndex={0} style={{transform:`translate(${drag.x}px, ${drag.y}px) rotate(${drag.x/40}deg)`}} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={cancel} onLostPointerCapture={e=>{if(e.target===e.currentTarget)cancel();}}>
    
    {action&&<span className={`swipe-stamp ${action}`}><Direction size={15}/>{label}</span>}
    <span className={`merchant-icon tone-${transaction.categoryId}`}>{transaction.description.slice(0,1)}</span><h2>{transaction.description}</h2><div className="swipe-amount">{money(transaction.amountCents)}</div><div className="swipe-meta"><span>{dateLabel(transaction.date)}</span><span><WalletCards size={14}/>{account}</span></div>
    <label className="field card-category"><span>Suggested category <small>Editable</small></span><select value={category} onChange={e=>onCategory(e.target.value)}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label className="field card-notes"><span>Notes <small>Optional</small></span><textarea rows={3} value={notes} disabled={disabled} placeholder="Add a note about this expense" onChange={e=>{const value=e.target.value;setNotes(value);onNotes(value);}}/></label>
  </article></div>;
}
