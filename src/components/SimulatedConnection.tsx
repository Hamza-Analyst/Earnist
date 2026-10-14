import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Building2, Check, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../data/Store';
import { TEST_CARD_ID, TEST_CARD_NAME, withSample, withTestCard } from '../domain/sample';
import { ErrorMessage, Modal } from './ui';
import MotionOrbit from './MotionOrbit';

export default function SimulatedConnection({ mode, onClose, onReady }: {
  mode: 'bank' | 'card'; onClose: () => void; onReady?: () => Promise<void>;
}) {
  const { records, commit, notify } = useStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>(() =>
    (mode === 'card' ? records.accounts.some(a => a.id === TEST_CARD_ID) : records.sampleLoaded) ? 'success' : 'idle');
  const [fail, setFail] = useState(false);
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  const active = useRef(true);
  const card = mode === 'card';
  const Icon = card ? CreditCard : Building2;

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);

  function connect() {
    if (pending.current || status === 'success') return;
    pending.current = true;
    setStatus('loading');
    const shouldFail = fail;
    setFail(false);
    timer.current = setTimeout(async () => {
      if (shouldFail) { pending.current = false; setStatus('error'); return; }
      const ok = await commit(card ? withTestCard : withSample);
      pending.current = false;
      if (!active.current) return;
      setStatus(ok ? 'success' : 'error');
      if (ok) notify(card
        ? 'Test card connected in the simulation. Six fictional charges are ready.'
        : 'Simulated sample accounts loaded. No live bank connection was made.');
    }, 1000);
  }

  async function review() {
    if (opening) return;
    setOpening(true);
    if (onReady) { await onReady(); if (active.current) setOpening(false); }
    else { onClose(); navigate(card ? `/review?account=${TEST_CARD_ID}` : '/review'); }
  }

  return <Modal title={card ? 'Connect a test card' : 'Try a simulated connection'} onClose={onClose}>
    <p className="dialog-copy">{card
      ? 'Try a fictional credit card with six sample USD charges, including four expenses to review. This is a local simulation. No card number, CVC, credentials, charges, or live card connection are involved.'
      : 'Load two fictional USD accounts and a small starter review queue. No Plaid call, credentials, or live bank access.'}</p>
    <div className="start-option"><Icon size={25}/><div>
      <strong>{card ? TEST_CARD_NAME : 'Sample checking · 4242'}</strong>
      <small>{card ? 'Software, supplies, groceries, travel, and mixed use' : 'Plus sample business · 8018'}</small>
    </div><span className="badge sample">Simulation</span></div>
    <ErrorMessage message={status === 'error' ? 'The simulated connection failed. Retry to load the sample records.' : ''}/>
    {status === 'success' ? <>
      <p className="success-message" role="status"><Check size={18}/>{card ? 'Test card ready. Six fictional charges added.' : 'Sample accounts ready.'}</p>
      <button className="button primary full-width" disabled={opening} onClick={() => void review()}>
        {card ? 'Review test card expenses' : 'Review sample expenses'}<ArrowUpRight size={15}/>
      </button>
    </> : <>
      <button className="button primary full-width" disabled={status === 'loading'} onClick={connect}>
        {status === 'loading' ? <><MotionOrbit compact/>{card ? 'Connecting test card…' : 'Loading sample records…'}</>
          : status === 'error' ? 'Retry simulation' : card ? 'Connect test card · Simulated' : 'Load sample accounts'}
      </button>
      {status !== 'loading' && <label className="demo-checkbox"><input type="checkbox" checked={fail} onChange={e => setFail(e.target.checked)}/>Simulate a connection error</label>}
    </>}
    <p className="helper">{card ? 'Only fictional charges are imported. No card balance or credit limit is supplied.' : 'Sample accounts are imported once; existing local records are preserved.'}</p>
  </Modal>;
}
