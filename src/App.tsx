import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, FileText, Layers3, LayoutDashboard, ReceiptText, Settings2, Sparkles, X, LogOut } from 'lucide-react';
import { Link, NavLink, Navigate, Route as AppRoute, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './data/Store';
import { useAuth } from './data/Auth';
import { profileCompletion } from './domain/profileCompletion';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import Overview from './pages/Overview';
import Review from './pages/Review';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Mileage from './pages/Mileage';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Rules from './pages/Rules';
import DemoGuide from './pages/DemoGuide';
import More from './pages/More';
import MoreMenu from './components/MoreMenu';
import { ThemeToggle } from './components/Theme';
import Receipts from './pages/Receipts';
import Statements from './pages/Statements';
import ReadyToFile from './pages/ReadyToFile';
import Upgrade from './pages/Upgrade';
import Landing from './pages/Landing';
import SiteFooter from './components/SiteFooter';
import MotionOrbit from './components/MotionOrbit';
const secondaryLabels:Record<string,string>={'/transactions':'Transactions','/receipts':'Receipts','/statements':'Bank statements','/accounts':'Accounts','/rules':'Recurring rules','/mileage':'Mileage','/profile':'Profile & settings','/login':'Log in','/signup':'Sign up','/demo-guide':'Demo guide','/upgrade':'Upgrade to Pro'};
const nav=[{to:'/overview',label:'Home',icon:LayoutDashboard},{to:'/review',label:'Swipe',icon:Layers3},{to:'/receipts',label:'Receipts',icon:ReceiptText},{to:'/ready-to-file',label:'Ready to file',icon:Check},{to:'/reports',label:'Reports',icon:FileText},{to:'/more',label:'More',icon:Settings2}];
export default function App(){
  const {records,loading,error,recovered,notice,retry,clearError,notify}=useStore(),{account,signedIn,signOut}=useAuth(),location=useLocation(),navigate=useNavigate();
  const [loadingMinimumPassed,setLoadingMinimumPassed]=useState(false);
  useEffect(()=>{const timer=window.setTimeout(()=>setLoadingMinimumPassed(true),1000);return()=>window.clearTimeout(timer);},[]);
  const unreviewed=records.transactions.filter(t=>t.type==='expense'&&t.reviewStatus==='unreviewed').length;
  const profileScore=profileCompletion(records.profile).score;
  useEffect(()=>{const label=nav.find(n=>location.pathname===n.to)?.label??secondaryLabels[location.pathname]??(location.pathname==='/demo-guide'?'Demo guide':'Your first review');document.title=`${label} · Earnist local demo`;const timer=setTimeout(()=>{if(!location.hash)document.querySelector<HTMLElement>('main h1')?.focus();},0);return()=>clearTimeout(timer);},[location.pathname,location.hash,loading]);
  if(loading||!loadingMinimumPassed)return <div className="app-loading" role="status" aria-label="Opening your local workspace"><MotionOrbit/></div>;
  if(location.pathname==='/'||location.pathname==='/landing')return signedIn?<Navigate to={records.profile.onboardingComplete?'/overview':'/onboarding'} replace/>:<Landing/>;
  if(account&&!signedIn)return <Routes><AppRoute path="/login" element={<AuthPage mode="login"/>}/><AppRoute path="*" element={<Navigate to="/login" replace/>}/></Routes>;
  if(location.pathname==='/login'||location.pathname==='/signup')return <Routes><AppRoute path="/login" element={<AuthPage mode="login"/>}/><AppRoute path="/signup" element={<AuthPage mode="signup"/>}/></Routes>;
  return <><a className="skip-link" href="#main-content">Skip to main content</a>{error&&<div className="global-error" role="alert"><strong>Local storage needs attention.</strong><span>{error}</span><button onClick={retry}>Retry</button><button className="icon-button" aria-label="Dismiss storage error" onClick={clearError}><X size={16}/></button></div>}{recovered&&<div className="recovery-banner" role="status">Saved records were incompatible or invalid. A fresh local workspace is available; no tax or banking data was recovered.</div>}
    {!records.profile.onboardingComplete?<Routes><AppRoute path="/onboarding" element={<Onboarding/>}/><AppRoute path="*" element={<Navigate to="/signup" replace/>}/></Routes>:<div className="app-shell"><aside className="app-sidebar"><Link to="/overview" className="brand" aria-label="Earnist overview"><span>E</span>earnist.</Link><div className="workspace-identity"><span className="identity-avatar">{records.profile.photoDataUrl?<img src={records.profile.photoDataUrl} alt=""/>:(records.profile.displayName||'Your').charAt(0)}</span><div><strong>{records.profile.businessName||'Your workspace'}</strong><small>Personal workspace · Local</small></div></div><span className="nav-label">YOUR WORKSPACE</span><nav aria-label="Primary navigation">{nav.filter(item=>item.to!=='/more').map(({to,label,icon:Icon})=><NavLink key={to} to={to}><Icon size={19}/><span>{label}</span>{to==='/review'&&unreviewed>0&&<b className="nav-count">{unreviewed}</b>}</NavLink>)}<MoreMenu/></nav><div className="sidebar-promo"><Layers3 size={27}/><h3>A calmer<br/><span>tax season.</span></h3><p>Finish your records.<br/>Bring everything together.</p><Link to="/ready-to-file">Open your checklist<ArrowUpRight size={16}/></Link></div><Link to="/upgrade" className="sidebar-upgrade"><Sparkles size={17}/><span>Upgrade to Pro</span></Link><div className="sidebar-credit">A product concept by <strong>AiBit Sol</strong><span>Prepared for Earnist</span></div><button type="button" className="sidebar-logout" onClick={()=>{signOut();navigate('/login',{replace:true});}}><LogOut size={16}/><span>Sign out</span></button></aside><div className="app-body"><header className="app-header"><Link to="/overview" className="mobile-brand brand" aria-label="Earnist overview"><span>E</span>earnist.</Link><div className="breadcrumb">WORKSPACE <span>/</span> {nav.find(n=>n.to===location.pathname)?.label??secondaryLabels[location.pathname]??(location.pathname==='/demo-guide'?'Demo guide':'Overview')}</div><div className="header-right"><ThemeToggle/><Link className="profile-avatar profile-progress-link" to="/profile" aria-label={`Open local profile, ${profileScore}% complete`}><svg className="profile-progress-ring" viewBox="0 0 44 44" aria-hidden="true"><circle className="profile-progress-track" cx="22" cy="22" r="19" pathLength="100"/><circle className="profile-progress-fill" cx="22" cy="22" r="19" pathLength="100" strokeDasharray={`${profileScore} 100`}/></svg><span className="profile-avatar-inner">{records.profile.photoDataUrl?<img src={records.profile.photoDataUrl} alt=""/>:(records.profile.displayName||'E').charAt(0).toUpperCase()}</span></Link></div></header><main id="main-content" className="main-content"><Routes><AppRoute path="/more" element={<More/>}/><AppRoute path="/receipts" element={<Receipts/>}/><AppRoute path="/statements" element={<Statements/>}/><AppRoute path="/ready-to-file" element={<ReadyToFile/>}/><AppRoute path="/money" element={<Navigate to="/ready-to-file" replace/>}/><AppRoute path="/overview" element={<Overview/>}/><AppRoute path="/review" element={<Review/>}/><AppRoute path="/transactions" element={<Transactions/>}/><AppRoute path="/rules" element={<Rules/>}/><AppRoute path="/demo-guide" element={<DemoGuide/>}/><AppRoute path="/accounts" element={<Accounts/>}/><AppRoute path="/mileage" element={<Mileage/>}/><AppRoute path="/reports" element={<Reports/>}/><AppRoute path="/profile" element={<Profile/>}/><AppRoute path="/upgrade" element={<Upgrade/>}/><AppRoute path="/onboarding" element={<Navigate to="/overview" replace/>}/><AppRoute path="*" element={<Navigate to="/overview" replace/>}/></Routes></main><SiteFooter className="app-footer"/></div><nav className="mobile-nav" aria-label="Mobile navigation">{nav.filter(item=>item.to!=='/more').map(({to,label,icon:Icon})=><NavLink key={to} to={to}><span><Icon size={19}/>{to==='/review'&&unreviewed>0&&<b>{unreviewed}</b>}</span>{label==='Profile & settings'?'Profile':label}</NavLink>)}<MoreMenu mobile/></nav></div>}
    <div className={`toast ${notice?'visible':''}`} role="status" aria-live="polite">{notice&&<><Check size={17}/><span>{notice}</span><button className="icon-button" aria-label="Dismiss notification" onClick={()=>notify('')}><X size={15}/></button></>}</div>
  </>;
}
