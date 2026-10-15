import {mkdir,writeFile,stat} from 'node:fs/promises';
import {TAROT} from '../src/content/tarot.mjs';
const prefixes={major:'ar',wands:'wa',cups:'cu',swords:'sw',pentacles:'pe'};
await mkdir('assets/tarot',{recursive:true});
const pending=[...TAROT];let count=0;
async function worker(){
 while(pending.length){
  const card=pending.shift();
  const [group,n]=card.id.split('-');
  const rank=group==='major'?n.padStart(2,'0'):({1:'ac',11:'pa',12:'kn',13:'qu',14:'ki'}[n]||n.padStart(2,'0'));
  const url=`https://scrape.sacred-texts.com/tarot/pkt/img/${prefixes[group]}${rank}.jpg`;
  const destination=`assets/tarot/${card.id}.jpg`;
  try{if((await stat(destination)).size>1000){count++;continue;}}catch{}
  const res=await fetch(url);
  if(!res.ok||!res.headers.get('content-type')?.includes('image'))throw new Error(`${card.name}: ${res.status} ${url}`);
  const buffer=Buffer.from(await res.arrayBuffer());
  if(buffer[0]!==255||buffer[1]!==216)throw new Error('Not JPEG');
  await writeFile(destination,buffer);count++;
 }
}
await Promise.all([worker(),worker(),worker()]);
console.log(`Verified ${count} original book illustrations`);
