import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Building2, CreditCard, FileUp, Pencil, Plus, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../data/Store';
import { newId, today } from '../domain/models';
import { TEST_CARD_ID } from '../domain/sample';
import { ErrorMessage, Field, Modal, PageHeading } from '../components/ui';
import CsvImport from '../components/CsvImport';
import SimulatedConnection from '../components/SimulatedConnection';

export default function Accounts() {
  const { records, commit, notify } = useStore();
  const [edit, setEdit] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [importAccount, setImportAccount] = useState('');
  const [error, setError] = useState('');
  const [simulation, setSimulation] = useState<'bank' | 'card' | null>(null);
  const cardConnected = records.accounts.some(a => a.id === TEST_CARD_ID);

  function open(id: string) {
    setEdit(id);
    setName(records.accounts.find(a => a.id === id)?.name ?? '');
    setError('');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Give this local account a name.'); return; }
    const ok = await commit(r => ({ ...r, accounts: edit === 'new'
      ? [...r.accounts, { id: newId(), name: name.trim(), kind: 'manual', createdAt: today() }]
      : r.accounts.map(a => a.id === edit ? { ...a, name: name.trim() } : a) }));
    if (ok) {
      notify(edit === 'new' ? 'Manual account added. You can add entries or import a CSV.' : 'Account renamed.');
      setEdit(null);
    }
  }

  return <>
    <PageHeading eyebrow="WHERE YOUR RECORDS COME FROM" title="A home for your transactions."
      description="Try fictional bank and card records, or add your own manual accounts.">
      <button className="button secondary" disabled={records.sampleLoaded} onClick={() => setSimulation('bank')}>
        <WalletCards size={16}/>{records.sampleLoaded ? 'Sample accounts loaded' : 'Try simulated connection'}
      </button>
      <button className="button primary" onClick={() => open('new')}><Plus size={16}/>Add manual account</button>
    </PageHeading>
    <div className="account-grid">
      {!cardConnected && <section className="panel account-panel test-card-connect">
        <div className="account-panel-top"><span className="account-icon"><CreditCard size={25}/></span><span className="badge sample">Simulation</span></div>
        <h2>Connect a test card</h2>
        <p>Try six fictional card charges, with four expenses ready for review.</p>
        <p className="helper">Local simulation. No card details, payments, or live connection.</p>
        <button className="button primary" onClick={() => setSimulation('card')}><CreditCard size={16}/>Connect test card</button>
      </section>}
      {records.accounts.map(a => {
        const rows = records.transactions.filter(t => t.accountId === a.id);
        const unreviewed = rows.filter(t => t.type === 'expense' && t.reviewStatus === 'unreviewed').length;
        const card = a.id === TEST_CARD_ID;
        const Icon = card ? CreditCard : Building2;
        return <section className="panel account-panel" key={a.id}>
          <div className="account-panel-top">
            <span className="account-icon"><Icon size={25}/></span>
            <span className={`badge ${a.kind === 'sample' ? 'sample' : 'neutral'}`}>{card ? 'Test card · Simulated' : a.kind === 'sample' ? 'Sample · Simulated' : 'Manual · Local'}</span>
            {a.kind === 'manual' && <button className="icon-button" aria-label={`Rename ${a.name}`} onClick={() => open(a.id)}><Pencil size={16}/></button>}
          </div>
          <h2>{a.name}</h2>
          <p>{rows.length} recorded transactions <span>·</span> {unreviewed} expenses to review</p>
          <div className="account-facts"><span>Currency<strong>USD</strong></span><span>Source<strong>{a.kind === 'sample' ? 'Fictional records' : 'Manual / CSV'}</strong></span></div>
          <p className="helper">{card ? 'No card balance or credit limit is supplied.' : 'No balance is supplied for this account.'}</p>
          <div className="account-actions">
            <Link className="button secondary" to={`/transactions?account=${a.id}`}>View transactions<ArrowUpRight size={14}/></Link>
            <button className="button primary" onClick={() => setImportAccount(a.id)}><FileUp size={15}/>Import CSV</button>
          </div>
        </section>;
      })}
      <button className="account-add-card" onClick={() => open('new')}><Plus size={28}/><strong>Add a local account</strong><span>A label for your manual and imported records.<br/>No credentials or banking connection.</span></button>
    </div>
    <div className="context-note">Sample accounts and test cards are simulations. Recorded transaction totals are not bank or card balances.</div>
    {edit && <Modal title={edit === 'new' ? 'Add a manual account' : 'Rename manual account'} onClose={() => setEdit(null)}>
      <form onSubmit={e => void save(e)} noValidate>
        <p className="dialog-copy">Create a local label for transactions. This does not connect a financial institution.</p>
        <ErrorMessage message={error}/>
        <Field label="Account name"><input value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder="e.g. Business checking" required/></Field>
        <p className="helper">Single currency: USD. No account balance is recorded.</p>
        <div className="form-actions"><button className="button secondary" type="button" onClick={() => setEdit(null)}>Cancel</button><button className="button primary" type="submit">Save account</button></div>
      </form>
    </Modal>}
    {importAccount && <CsvImport accountId={importAccount} onClose={() => setImportAccount('')}/>}
    {simulation && <SimulatedConnection mode={simulation} onClose={() => setSimulation(null)}/>}
  </>;
}
