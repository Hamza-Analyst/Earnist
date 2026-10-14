import { ArrowDownRight, ArrowRight, BriefcaseBusiness, Check, FileText, ReceiptText, Sparkles, WalletCards, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/Theme';
import '../landing.css';

const personas = [
  { icon: Zap, name: 'Athletes', detail: 'Training, travel, gear, and the work behind your career.' },
  { icon: BriefcaseBusiness, name: 'Business owners', detail: 'Keep each business organized with its own case and categories.' },
  { icon: Sparkles, name: 'Creators', detail: 'Track the software, equipment, and costs that support your work.' },
  { icon: WalletCards, name: 'Freelancers', detail: 'Make client work easier to review, one transaction at a time.' },
];

export default function Landing() {
  return <div className="landing-page">
    <header className="landing-nav">
      <Link to="/landing" className="landing-brand" aria-label="Earnist home"><span className="landing-brand-mark">E</span><span>earnist<span className="landing-period">.</span></span></Link>
      <nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#who-its-for">Who it’s for</a><Link to="/login" className="landing-login">Log in</Link><Link to="/signup" className="landing-nav-cta">Get started <ArrowRight size={16}/></Link><ThemeToggle/></nav>
    </header>

    <main>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-kicker"><span/> TAX PREP FOR PEOPLE WHO WORK FOR THEMSELVES</span>
          <h1>Keep more of<br/>what you <em>earn.</em></h1>
          <p className="landing-hero-lead">The simplest way to stay on top of your taxes. Earnist helps you spot potential deductions, sort business and personal spending, and keep your records ready all year.</p>
          <div className="landing-actions"><Link className="landing-primary" to="/signup">Start free <ArrowRight size={18}/></Link><Link className="landing-secondary" to="/login">I have an account</Link></div>
          <p className="landing-reassurance"><Check size={15}/> Start with sample data · No card needed</p>
        </div>
        <div className="landing-visual" aria-label="Preview of Earnist expense review">
          <div className="landing-orbit landing-orbit-one"/><div className="landing-orbit landing-orbit-two"/>
          <div className="landing-note"><Sparkles size={15}/> YOUR WORK, YOUR WAY</div>
          <div className="landing-review-card">
            <div className="landing-card-top"><span className="landing-card-icon">A</span><span className="landing-review-label"><span/> READY TO REVIEW</span><span className="landing-card-menu">•••</span></div>
            <div className="landing-merchant">Adobe Creative Cloud</div><div className="landing-card-meta">Oct 18 · Design studio</div>
            <div className="landing-card-rule"/><div className="landing-category-label">SUGGESTED CATEGORY <span>EDITABLE</span></div>
            <div className="landing-category">Software &amp; subscriptions <span>⌄</span></div>
            <div className="landing-case-label">WHICH BUSINESS?</div>
            <div className="landing-case-pills"><span className="active">Design studio</span><span>Personal</span></div>
            <div className="landing-swipe-hint"><span>← Personal</span><span>Business →</span></div>
          </div>
          <div className="landing-float landing-float-top"><span className="landing-float-icon"><ReceiptText size={17}/></span><span><strong>Receipt saved</strong><small>Matched to this expense</small></span><Check size={16}/></div>
          <div className="landing-float landing-float-bottom"><span className="landing-float-icon"><FileText size={17}/></span><span><strong>Tax-time ready</strong><small>Your year, neatly organized</small></span></div>
          <div className="landing-visual-caption"><span>01 / 03</span> Every expense has a place.</div>
        </div>
        <a className="landing-scroll" href="#how-it-works"><span>SCROLL TO SEE HOW</span><ArrowDownRight size={16}/></a>
      </section>

      <section className="landing-ribbon" aria-label="Earnist features"><span>BUILT FOR SELF-EMPLOYED LIFE</span><b>Separate businesses</b><i>✳</i><b>Relevant categories</b><i>✳</i><b>One swipe at a time</b><i>✳</i><b>Receipts kept close</b></section>

      <section className="landing-value" id="why-earnist">
        <div className="landing-section-heading"><span className="landing-kicker">LESS TAX-TIME SCRAMBLING</span><h2>Your work is unique.<br/><em>Your records should be, too.</em></h2><p>When you work for yourself, business and personal spending can get mixed together. Earnist gives every kind of work its own context, so you can make sense of the year as it happens.</p></div>
        <div className="landing-value-grid">
          <article className="landing-value-card landing-value-feature"><span className="landing-value-index">01 / SET UP</span><div className="landing-value-symbol"><BriefcaseBusiness size={22}/></div><h3>More than one way to earn?</h3><p>Create a separate business case for each kind of work. Freelance design and a coaching business can each have their own categories and history.</p><span className="landing-card-decoration">EARN<br/>ON YOUR<br/>TERMS</span></article>
          <article className="landing-value-card"><span className="landing-value-index">02 / REVIEW</span><div className="landing-value-symbol"><Zap size={22}/></div><h3>A quick swipe beats a shoebox.</h3><p>Review transactions as they come in. Mark them business, personal, or on hold, then choose which business they belong to.</p></article>
          <article className="landing-value-card"><span className="landing-value-index">03 / KEEP</span><div className="landing-value-symbol"><ReceiptText size={22}/></div><h3>Keep the why with the what.</h3><p>Add a purpose note and attach a receipt, so the details you’ll want at tax time stay beside the transaction.</p></article>
        </div>
      </section>

      <section className="landing-how" id="how-it-works">
        <div className="landing-how-head"><span className="landing-kicker">A CLEARER ROUTINE, ALL YEAR</span><h2>Three steps.<br/><em>Then get back to work.</em></h2><p>Set things up once. Keep the habit small. Bring organized records into tax season.</p><Link className="landing-text-link" to="/signup">See it for yourself <ArrowRight size={17}/></Link></div>
        <div className="landing-steps">
          <article className="landing-step"><span className="landing-step-num">01</span><div className="landing-step-art landing-step-art-one"><BriefcaseBusiness size={29}/><span>DESIGN STUDIO</span><b>+</b><span>COACHING</span></div><h3>Choose your work</h3><p>Select your work personas and add a separate case for each business. Earnist uses that context to suggest relevant expense categories.</p></article>
          <article className="landing-step"><span className="landing-step-num">02</span><div className="landing-step-art landing-step-art-two"><div><span className="tiny-merchant">M</span><span><b>Materials &amp; Co.</b><small>Supplies · $42.80</small></span></div><div className="tiny-swipe"><span>PERSONAL</span><span>BUSINESS</span></div></div><h3>Review as you go</h3><p>Swipe through expenses, pick the right business case, and add a note when the purpose needs context.</p></article>
          <article className="landing-step"><span className="landing-step-num">03</span><div className="landing-step-art landing-step-art-three"><div className="report-paper"><span>EARNIST · YEAR-END SUMMARY</span><b>Records, together.</b><i/><i/><i/><strong><Check size={14}/> READY TO EXPORT</strong></div></div><h3>Bring it together</h3><p>Keep transactions, mileage, and receipts organized in one workspace. Export a year-end summary for your own filing or your tax professional.</p></article>
        </div>
      </section>

      <section className="landing-personas" id="who-its-for">
        <div className="landing-personas-intro"><span className="landing-kicker">MADE FOR YOUR KIND OF WORK</span><h2>One app.<br/><em>Many business cases.</em></h2><p>Choose multiple work personas and keep each business separate. Your categories stay relevant to the work you actually do.</p><Link className="landing-text-link" to="/signup">Build your workspace <ArrowRight size={17}/></Link></div>
        <div className="landing-persona-list">{personas.map(({icon:Icon,name,detail},i)=><article key={name}><span className="landing-persona-num">0{i+1}</span><Icon size={19}/><div><h3>{name}</h3><p>{detail}</p></div><ArrowRight className="landing-persona-arrow" size={17}/></article>)}<article className="landing-persona-custom"><span className="landing-persona-num">05</span><Sparkles size={19}/><div><h3>Your own combination</h3><p>Mix business types or start from a blank slate and make the workspace yours.</p></div><ArrowRight className="landing-persona-arrow" size={17}/></article></div>
      </section>

      <section className="landing-close"><div className="landing-close-shape">E</div><span className="landing-kicker">A LITTLE ORGANIZATION GOES A LONG WAY</span><h2>Make tax time<br/><em>feel more like a finish line.</em></h2><p>Start free with sample transactions, set up your business cases, and see how Earnist fits your work.</p><Link className="landing-primary" to="/signup">Get started with Earnist <ArrowRight size={18}/></Link><small>Potential deductions are for you to review. Earnist organizes records; it doesn’t determine tax eligibility or file a return.</small></section>
    </main>
    <footer className="landing-footer"><Link to="/" className="landing-brand"><span className="landing-brand-mark">E</span><span>earnist<span className="landing-period">.</span></span></Link><span>Simple tax prep for the self-employed.</span><div><Link to="/login">Log in</Link><Link to="/signup">Get started</Link><a href="#how-it-works">How it works</a></div><small>© 2026 Earnist · Local demo</small></footer>
  </div>;
}
