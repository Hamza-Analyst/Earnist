import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';
const storageKey = 'earnist-theme';
function savedTheme(): Theme | null {
  try { const value = localStorage.getItem(storageKey); return value === 'dark' || value === 'light' ? value : null; }
  catch { return null; }
}
function systemTheme(): Theme { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111b16' : '#f5f7f4');
}
const ThemeContext = createContext<{theme:Theme;toggle:()=>void} | null>(null);
export function ThemeProvider({children}:{children:ReactNode}) {
  const [preference,setPreference] = useState<Theme | null>(savedTheme);
  const [system,setSystem] = useState<Theme>(systemTheme);
  const theme = preference ?? system;
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const change = () => setSystem(media.matches ? 'dark' : 'light');
    const storage = (event:StorageEvent) => { if(event.key === storageKey || event.key === null) setPreference(savedTheme()); };
    media.addEventListener('change',change); window.addEventListener('storage',storage);
    return () => { media.removeEventListener('change',change); window.removeEventListener('storage',storage); };
  }, []);
  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    applyTheme(next); setPreference(next);
    try { localStorage.setItem(storageKey,next); } catch { /* Keep the selection for this visit when storage is unavailable. */ }
  }
  return <ThemeContext.Provider value={{theme,toggle}}>{children}</ThemeContext.Provider>;
}
export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if(!context) throw new Error('ThemeToggle requires ThemeProvider');
  const dark = context.theme === 'dark';
  return <button type="button" className="theme-toggle" onClick={context.toggle} aria-label={`Switch to ${dark?'light':'dark'} mode`} aria-pressed={dark} title={`Switch to ${dark?'light':'dark'} mode`}>
    {dark?<Sun size={18}/>:<Moon size={18}/>}<span>{dark?'Light mode':'Dark mode'}</span>
  </button>;
}
