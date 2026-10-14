export function download(name:string,content:Blob|string,type='text/csv;charset=utf-8') {
  const blob=typeof content==='string'?new Blob([content],{type}):content;
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
