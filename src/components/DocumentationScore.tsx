import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { useStore } from '../data/Store';
import { documentation } from '../domain/documentation';
export default function DocumentationScore(){
 const {records}=useStore(),d=documentation(records);
 return <section className="documentation-hero" aria-label="Documentation score"><div><h2>Documentation score</h2>{d.business>0?<div className="documentation-coverage"><div><span>Receipts attached <strong>{d.business-d.missingReceipts} / {d.business}</strong></span><progress aria-label="Business expenses with receipts" max={d.business} value={d.business-d.missingReceipts}/></div></div>:<p className="helper">Review a business expense to start.</p>}{d.missingReceipts>0&&<div className="documentation-links">{d.missingReceipts>0&&<Link to="/transactions?business=yes&receipt=no&type=expense">{d.missingReceipts} missing receipts <ArrowRight size={16}/></Link>}</div>}</div><div className="score-display"><div className="score-orbit"><FileCheck2 size={24}/><strong aria-label={d.score===null?"Documentation score unavailable":`Documentation score ${d.score} percent`}>{d.score===null?"—":`${d.score}%`}</strong></div><span>{d.score===null?"No business expenses yet":`Receipt coverage`}</span></div></section>;
}
