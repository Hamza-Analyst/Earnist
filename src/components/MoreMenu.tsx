import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Camera, ChevronDown, CreditCard, FileText, Footprints, MoreHorizontal, Plus, Repeat2, Settings2, Sparkles, Trash2, UserRound, Wallet } from 'lucide-react';
import { useStore } from '../data/Store';
import { today } from '../domain/models';
import TransactionEditor from './TransactionEditor';
const groups = [
  { title:'Your records', items:[
    {label:'Receipts & notes',to:'/receipts',icon:Camera},
    {label:'Bank statements',to:'/statements',icon:FileText},
    {label:'Accounts & cards',to:'/accounts',icon:CreditCard},
    {label:'All transactions',to:'/transactions',icon:Wallet},
  ]},
  { title:'Organize', items:[
    {label:'Personal transactions',to:'/transactions?classification=personal',icon:UserRound},
    {label:'Trash',to:'/more#trash',icon:Trash2},
    {label:'Recurring rules',to:'/rules',icon:Repeat2},
    {label:'Mileage',to:'/mileage',icon:Footprints},
    {label:'Income',to:'/transactions?type=income',icon:ArrowDownLeft},
  ]},
  { title:'Your workspace', items:[
    {label:'Profile & settings',to:'/profile',icon:Settings2},
    {label:'All tools & CPA connection',to:'/more',icon:ArrowUpRight},
    {label:'Upgrade to Pro',to:'/upgrade',icon:Sparkles},
  ]},
];
export default function MoreMenu({mobile=false}:{mobile?:boolean}){
  const {records,commit}=useStore(),location=useLocation(),id=useId();
  const [open,setOpen]=useState(false),[manual,setManual]=useState(false),[busy,setBusy]=useState(false),[position,setPosition]=useState({left:250,top:120});
  const trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null),last=useRef(false);
  const active=['/more','/receipts','/statements','/accounts','/transactions','/rules','/mileage','/profile','/upgrade'].includes(location.pathname);
  function close(focus=false){if(focus)trigger.current?.focus();setOpen(false);}
  useEffect(()=>setOpen(false),[location.key]);
  useLayoutEffect(()=>{
    if(!open)return;
    if(!mobile){const rect=trigger.current?.getBoundingClientRect(),box=panel.current?.getBoundingClientRect();if(rect&&box)setPosition({left:Math.max(12,Math.min(rect.right+12,window.innerWidth-box.width-12)),top:Math.max(16,Math.min(rect.top,window.innerHeight-box.height-16))});}
    const items=panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])');if(items?.length)items[last.current?items.length-1:0].focus({preventScroll:true});
  },[open,mobile]);
  useEffect(()=>{
    if(!open)return;
    function outside(e:PointerEvent){if(e.target instanceof Node&&!panel.current?.contains(e.target)&&!trigger.current?.contains(e.target))close();}
    function resize(){close(true);}
    document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize);};
  },[open]);
  function keyboard(e:KeyboardEvent){
    const items=Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')??[]),index=items.indexOf(document.activeElement as HTMLElement);
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}
    else if(e.key==='Tab')close(true);
    else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&items.length){e.preventDefault();e.stopPropagation();const next=e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next].focus();}
  }
  async function expense(){
    if(busy)return;setBusy(true);
    const ok=records.accounts.some(a=>a.id==='manual-cash')||await commit(r=>({...r,accounts:r.accounts.some(a=>a.id==='manual-cash')?r.accounts:[...r.accounts,{id:'manual-cash',name:'Cash & manual expenses',kind:'manual',createdAt:today()}]}));
    setBusy(false);if(ok){close(true);setManual(true);}
  }
  return <><button ref={trigger} type="button" className={`more-trigger ${active?'active':''} ${open?'expanded':''}`} aria-label="More" aria-haspopup="menu" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>{last.current=false;setOpen(value=>!value);}} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();last.current=e.key==='ArrowUp';setOpen(true);}}}>{mobile?<><span><MoreHorizontal size={21}/></span>More</>:<><MoreHorizontal size={21}/><span>More</span><ChevronDown className="more-chevron" size={16}/></>}</button>
    {open&&createPortal(<div ref={panel} id={id} role="menu" aria-label="More tools" className={`more-popup ${mobile?'mobile-popup':''}`} style={mobile?undefined:position} onKeyDown={keyboard}><div className="more-popup-heading"><strong>A little more, within reach.</strong><span>Your records and workspace tools</span></div><button role="menuitem" tabIndex={-1} className="menu-manual" disabled={busy} onClick={()=>void expense()}><Plus size={20}/><span><strong>Add manual expense</strong><small>Cash or a missing account expense</small></span></button>{groups.map(group=><div className="menu-group" key={group.title}><span className="menu-group-title">{group.title}</span>{group.items.map(({label,to,icon:Icon})=><Link role="menuitem" tabIndex={-1} to={to} key={to} onClick={()=>close()}><Icon size={18}/><span>{label}</span>{label==='Trash'&&<small className="menu-count">{records.trash?.length??0}</small>}<ArrowUpRight className="menu-arrow" size={14}/></Link>)}</div>)}</div>,document.body)}
    {manual&&<TransactionEditor defaultAccount="manual-cash" onClose={()=>setManual(false)}/>}</>;
}
