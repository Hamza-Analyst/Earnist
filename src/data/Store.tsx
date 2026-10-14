import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Receipt, Records } from '../domain/models';
import { emptyRecords } from '../domain/sample';
import { loadRecords, saveRecords } from './database';
import { applyRulesToNewRecords } from '../domain/rules';
interface SaveOptions {putReceipt?:Receipt;putStatement?:Receipt;deleteReceipts?:string[];clearReceipts?:boolean}
interface Store {records:Records;loading:boolean;error:string;recovered:boolean;notice:string;commit:(update:(r:Records)=>Records,options?:SaveOptions)=>Promise<boolean>;notify:(s:string)=>void;retry:()=>void;clearError:()=>void}
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:ReactNode}){
  const [records,setRecords]=useState(emptyRecords),[loading,setLoading]=useState(true),[error,setError]=useState(''),[recovered,setRecovered]=useState(false),[notice,setNotice]=useState(''),[attempt,setAttempt]=useState(0);
  const current=useRef(records),queue=useRef<Promise<unknown>>(Promise.resolve());
  useEffect(()=>{let active=true;setLoading(true);loadRecords().then(result=>{if(active){current.current=result.records;setRecords(result.records);setRecovered(result.recovered);setError('');setLoading(false);}}).catch(e=>{if(active){setError(e instanceof Error?e.message:'IndexedDB could not be opened.');setLoading(false);}});return()=>{active=false;};},[attempt]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4000);return()=>clearTimeout(t);},[notice]);
  function commit(update:(r:Records)=>Records,options:SaveOptions={}):Promise<boolean>{
    const job=queue.current.then(async()=>{try{const updated=update(current.current);if(updated===current.current)return false;const next=applyRulesToNewRecords(current.current,updated);await saveRecords(next,options);current.current=next;setRecords(next);return true;}catch(e){setError(e instanceof Error?e.message:'Your changes could not be stored locally.');return false;}});
    queue.current=job;return job;
  }
  return <Context.Provider value={{records,loading,error,recovered,notice,commit,notify:setNotice,retry:()=>setAttempt(x=>x+1),clearError:()=>setError('')}}>{children}</Context.Provider>;
}
export function useStore(){const store=useContext(Context);if(!store)throw new Error('StoreProvider missing');return store;}
