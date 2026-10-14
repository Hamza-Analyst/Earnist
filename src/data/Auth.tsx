import { createContext, useContext, useState, type ReactNode } from 'react';

const ACCOUNT_KEY = 'earnist-local-account-v1';
const SESSION_KEY = 'earnist-local-session-v1';
interface LocalAccount { email: string; salt: string; passwordHash: string }
interface AuthState { account: LocalAccount | null; signedIn: boolean; signUp: (email: string, password: string) => Promise<string | null>; signIn: (email: string, password: string) => Promise<string | null>; signOut: () => void; clearAccount: () => void }
const AuthContext = createContext<AuthState | null>(null);
function readAccount(): LocalAccount | null {
  try { const raw = localStorage.getItem(ACCOUNT_KEY); if (!raw) return null; const value = JSON.parse(raw); return typeof value.email === 'string' && typeof value.salt === 'string' && typeof value.passwordHash === 'string' ? value : null; } catch { return null; }
}
function encode(bytes: Uint8Array): string { return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(''); }
async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(salt.match(/.{2}/g)!.map(byte => parseInt(byte, 16))), iterations: 210000, hash: 'SHA-256' }, key, 256);
  return encode(new Uint8Array(bits));
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState(readAccount);
  const [signedIn, setSignedIn] = useState(() => { try { return Boolean(readAccount() && sessionStorage.getItem(SESSION_KEY) === 'yes'); } catch { return false; } });
  async function signUp(email: string, password: string): Promise<string | null> {
    if (account) return 'A local account already exists in this browser. Sign in to use it.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
    if (password.length < 8) return 'Use at least 8 characters for your password.';
    try {
      const salt = encode(crypto.getRandomValues(new Uint8Array(16)));
      const next = { email: email.trim().toLowerCase(), salt, passwordHash: await hashPassword(password, salt) };
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next)); sessionStorage.setItem(SESSION_KEY, 'yes');
      setAccount(next); setSignedIn(true); return null;
    } catch { return 'Your browser could not save this local account. Check storage availability and try again.'; }
  }
  async function signIn(email: string, password: string): Promise<string | null> {
    if (!account) return 'No local account exists in this browser. Create one to begin.';
    try {
      const hash = await hashPassword(password, account.salt);
      if (account.email !== email.trim().toLowerCase() || account.passwordHash !== hash) return 'Email or password is incorrect.';
      sessionStorage.setItem(SESSION_KEY, 'yes'); setSignedIn(true); return null;
    } catch { return 'Sign in is unavailable in this browser. Check storage availability and try again.'; }
  }
  function signOut() { try { sessionStorage.removeItem(SESSION_KEY); } catch {} setSignedIn(false); }
  function clearAccount() { try { localStorage.removeItem(ACCOUNT_KEY); sessionStorage.removeItem(SESSION_KEY); } catch {} setAccount(null); setSignedIn(false); }
  return <AuthContext.Provider value={{ account, signedIn, signUp, signIn, signOut, clearAccount }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider missing'); return value; }
