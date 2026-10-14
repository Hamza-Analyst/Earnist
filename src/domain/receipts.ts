export const RECEIPT_LIMIT=10*1024*1024;
export async function validateReceipt(file:File):Promise<string>{
  if(!file.size||file.size>RECEIPT_LIMIT)return 'Choose a nonempty receipt up to 10 MB.';
  const signatures=new Uint8Array(await file.slice(0,8).arrayBuffer());
  const png=signatures[0]===137&&signatures[1]===80&&signatures[2]===78&&signatures[3]===71;
  const jpg=signatures[0]===255&&signatures[1]===216&&signatures[2]===255;
  const pdf=String.fromCharCode(...signatures.slice(0,5))==='%PDF-';
  if(!(file.type==='image/png'&&png||file.type==='image/jpeg'&&jpg||file.type==='application/pdf'&&pdf))return 'Choose a valid JPG, PNG, or PDF receipt.';
  return '';
}
