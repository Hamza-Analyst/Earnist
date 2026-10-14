import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

export default function SiteFooter({ className = '' }: { className?: string }) {
  return <footer className={`site-footer ${className}`.trim()} aria-label="Page footer">
    <span>© 2026 Earnist · Built for self-employed people</span>
    <div className="site-socials" role="group" aria-label="Social media"><span className="site-social-icon" role="img" aria-label="Instagram"><Instagram size={17}/></span><span className="site-social-icon" role="img" aria-label="Facebook"><Facebook size={17}/></span><span className="site-social-icon" role="img" aria-label="LinkedIn"><Linkedin size={17}/></span><span className="site-social-icon" role="img" aria-label="YouTube"><Youtube size={18}/></span></div>
  </footer>;
}
