import { useEffect, useRef, useState, type RefObject } from 'react';
import { Camera, Download, FileText, Image as ImageIcon, Search, Upload } from 'lucide-react';
import { useStore } from '../data/Store';
import { getReceipt } from '../data/database';
import { money } from '../domain/finance';
import { newId, type Receipt, type VaultReceipt } from '../domain/models';
import { validateReceipt } from '../domain/receipts';
import { download } from '../domain/download';
import { ErrorMessage, Modal, PageHeading } from '../components/ui';
import TransactionEditor from '../components/TransactionEditor';
import { TransactionRows } from '../components/TransactionRows';

type ReceiptTab = 'unmatched' | 'matched' | 'all';
export default function Receipts(){
  const {records,commit,notify}=useStore();
  const [tab,setTab]=useState<ReceiptTab>('unmatched'),[cameraOpen,setCameraOpen]=useState(false),[editing,setEditing]=useState<string|null>(null),[matching,setMatching]=useState<VaultReceipt|null>(null),[query,setQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[preview,setPreview]=useState<Receipt|null>(null),[previewUrl,setPreviewUrl]=useState('');
  const upload=useRef<HTMLInputElement>(null);
  const vault=records.receiptVault??[],matched=records.transactions.filter(t=>t.receiptId),expenses=records.transactions.filter(t=>t.type==='expense'&&!t.receiptId),choices=expenses.filter(t=>(t.description+' '+t.date).toLowerCase().includes(query.toLowerCase()));
  const showUnmatched=tab!=='matched',showMatched=tab!=='unmatched',isEmpty=tab==='unmatched'?!vault.length:tab==='matched'?!matched.length:!vault.length&&!matched.length;
  useEffect(()=>{if(!preview){setPreviewUrl('');return;}const url=URL.createObjectURL(preview.blob);setPreviewUrl(url);return()=>URL.revokeObjectURL(url);},[preview]);
  async function save(file:File){
    setBusy(true);setError('');
    try{
      const problem=await validateReceipt(file);if(problem){setError(problem);return;}
      const id=newId(),item:VaultReceipt={id,name:file.name,type:file.type,size:file.size,createdAt:new Date().toISOString()};
      const receipt:Receipt={id,transactionId:'',name:file.name,type:file.type,size:file.size,blob:file};
      const ok=await commit(r=>({...r,receiptVault:[item,...r.receiptVault??[]]}),{putReceipt:receipt});
      if(ok){setTab('unmatched');notify('Receipt saved in your local vault. Match it when you are ready.');}
    }catch{setError('This receipt could not be saved. Try another file.');}
    finally{setBusy(false);if(upload.current)upload.current.value='';}
  }
  async function match(transactionId:string){
    if(!matching||busy)return;setBusy(true);setError('');
    try{
      const receipt=await getReceipt(matching.id);if(!receipt){setError('Receipt file could not be found. Upload it again.');return;}
      const ok=await commit(r=>{
        if(!r.receiptVault?.some(f=>f.id===receipt.id)||!r.transactions.some(t=>t.id===transactionId&&!t.receiptId))throw new Error('This receipt or transaction changed. Choose another expense.');
        return {...r,receiptVault:r.receiptVault.filter(f=>f.id!==receipt.id),transactions:r.transactions.map(t=>t.id===transactionId?{...t,receiptId:receipt.id}:t)};
      },{putReceipt:{...receipt,transactionId}});
      if(ok){setMatching(null);setTab('matched');notify('Receipt matched to the transaction.');}
    }catch{setError('This receipt could not be matched. Please retry.');}
    finally{setBusy(false);}
  }
  async function openPreview(id:string){setError('');try{const receipt=await getReceipt(id);if(receipt)setPreview(receipt);else setError('Receipt file could not be found.');}catch{setError('Receipt could not be opened. Please retry.');}}
  return <>
    <PageHeading title="Receipts" eyebrow="SNAP NOW. MATCH LATER. KEEP EVERY RECEIPT IN YOUR VAULT." description=""/>
    <section className="panel receipt-vault-summary" aria-label="Your receipt vault">
      <div><span className="eyebrow">YOUR VAULT</span><p><strong>{vault.length}</strong> waiting to match · <strong>{matched.length}</strong> attached to transactions</p><small>Stored on this device · Match receipts manually</small></div>
      <div className="receipt-vault-actions"><button className="button primary" disabled={busy} onClick={()=>setCameraOpen(true)}><Camera size={18}/>Take a photo</button><button className="button secondary" disabled={busy} onClick={()=>upload.current?.click()}><Upload size={18}/>Upload</button></div>
    </section>
    <input ref={upload} className="sr-only" type="file" aria-label="Upload vault receipt" accept="image/jpeg,image/png,application/pdf" onChange={e=>{const file=e.target.files?.[0];if(file)void save(file);}}/>
    <ErrorMessage message={error}/>
    <div className="receipt-vault-tabs" role="group" aria-label="Receipt status">{([{id:'unmatched',label:'Unmatched',count:vault.length},{id:'matched',label:'Matched',count:matched.length},{id:'all',label:'All',count:vault.length+matched.length}] as const).map(item=><button key={item.id} type="button" className="filter-chip" aria-label={item.label+' '+item.count} aria-pressed={tab===item.id} onClick={()=>setTab(item.id)}>{item.label}<span>{item.count}</span></button>)}</div>
    {isEmpty?<section className="panel receipt-vault-empty"><ImageIcon size={38} aria-hidden="true"/><h2>{tab==='matched'?'No matched receipts yet.':tab==='all'?'Your receipt vault starts here.':'Nothing waiting to match.'}</h2><p>{tab==='matched'?'Upload a receipt, then choose the expense it belongs to. Matched receipts stay with the transaction.':'Snap a receipt or upload a screenshot after a purchase. Keep it in your vault and match it to a transaction when you are ready.'}</p><button className="button primary" disabled={busy} onClick={()=>setCameraOpen(true)}><Camera size={18}/>Snap your first receipt</button><small>JPG, PNG, or PDF · Up to 10 MB · Stored locally</small></section>:<>
      {showUnmatched&&vault.length>0&&<section aria-label="Unmatched receipts"><div className="receipt-vault-grid">{vault.map(item=><article className="panel receipt-vault-card" key={item.id}><FileText size={28} aria-hidden="true"/><h2>{item.name}</h2><p>{new Date(item.createdAt).toLocaleDateString()} · {(item.size/1024).toFixed(1)} KB</p><div><button className="text-button" onClick={()=>void openPreview(item.id)}>View receipt</button><button className="button primary" disabled={busy} onClick={()=>{setQuery('');setError('');setMatching(item);}}>Match to expense</button></div></article>)}</div></section>}
      {showMatched&&matched.length>0&&<section className="panel" aria-label="Matched receipts"><div className="section-heading"><h2>Attached to transactions</h2><span className="helper">Open a transaction to view its receipt</span></div><TransactionRows rows={matched} records={records} onOpen={t=>setEditing(t.id)}/></section>}
    </>}
    {cameraOpen&&<CameraCapture onCapture={async file=>{setCameraOpen(false);await save(file);}} onClose={()=>setCameraOpen(false)}/> }
    {matching&&<Modal title="Match receipt to an expense" onClose={()=>{if(!busy)setMatching(null);}}><p className="dialog-copy">Choose the expense for {matching.name}. Expenses with a receipt already attached are excluded.</p><ErrorMessage message={error}/><label className="search-field receipt-search"><Search size={18}/><input aria-label="Find receipt expense" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search merchant or date"/></label><div className="receipt-choices">{choices.length?choices.map(t=><button disabled={busy} key={t.id} onClick={()=>void match(t.id)}><span><strong>{t.description}</strong><small>{t.date}</small></span><b>{money(t.amountCents)}</b></button>):<p className="helper">{expenses.length?'No expenses match this search.':'No expenses are available to match. Add a transaction first.'}</p>}</div></Modal>}
    {preview&&<Modal title={preview.name} onClose={()=>setPreview(null)}>{preview.type!=='application/pdf'&&previewUrl&&<img className="vault-receipt-preview" src={previewUrl} alt={preview.name}/>}<button className="button secondary" onClick={()=>download(preview.name,preview.blob)}><Download size={16}/>Download {preview.type==='application/pdf'?'PDF':'image'}</button></Modal>}
    {editing&&<TransactionEditor transaction={records.transactions.find(t=>t.id===editing)} onClose={()=>setEditing(null)}/>}
  </>;
}

function CameraCapture({onCapture,onClose}:{onCapture:(file:File)=>void|Promise<void>;onClose:()=>void}){
  const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null);
  const [error,setError]=useState(''),[ready,setReady]=useState(false);
  useEffect(()=>{let active=true;
    if(!navigator.mediaDevices?.getUserMedia){setError('Camera access is unavailable here. Use Upload to choose a receipt image.');return;}
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(media=>{if(!active){media.getTracks().forEach(track=>track.stop());return;}stream.current=media;if(video.current){video.current.srcObject=media;void video.current.play().then(()=>setReady(true)).catch(()=>setError('Camera preview could not start. Check camera access and try again.'));}}).catch(()=>{if(active)setError('Camera access was blocked or no camera is available. Allow camera access, or use Upload.');});
    return()=>{active=false;stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;};
  },[]);
  function capture(){const element=video.current;if(!element||!ready)return;const canvas=document.createElement('canvas');canvas.width=element.videoWidth;canvas.height=element.videoHeight;const context=canvas.getContext('2d');if(!context){setError('The camera image could not be captured. Try again.');return;}context.drawImage(element,0,0);canvas.toBlob(blob=>{if(!blob){setError('The camera image could not be captured. Try again.');return;}onCapture(new File([blob],`receipt-${new Date().toISOString().replace(/[:.]/g,'-')}.jpg`,{type:'image/jpeg'}));},'image/jpeg',0.9);}
  return <Modal title="Take a receipt photo" onClose={onClose}><p className="dialog-copy">Center the receipt in the frame and capture a photo.</p><video ref={video} className="receipt-camera-preview" autoPlay playsInline muted aria-label="Live camera preview"/><ErrorMessage message={error}/><div className="form-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button type="button" className="button primary" disabled={!ready} onClick={capture}><Camera size={17}/>Capture photo</button></div></Modal>;
}
