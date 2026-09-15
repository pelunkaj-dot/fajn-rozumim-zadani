import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const settings={model:'gpt-4o-mini-tts',voice:'marin',instructions:'Mluv česky jako laskavá učitelka. Čti přirozeně, klidně a zřetelně. Mezi větami dělej krátké pauzy. Nepřehrávej nadšení. Přečti pouze zadaný text a neprozrazuj řešení.',response_format:'mp3'};
export const signature=text=>createHash('sha256').update(JSON.stringify({...settings,input:text})).digest('hex').slice(0,24);
export const validAudio=buf=>buf.length>100&&(buf.subarray(0,3).toString()==='ID3'||(buf[0]===255&&(buf[1]&224)===224));
async function readAudio(file){try{const b=await fs.readFile(file);return validAudio(b)}catch{return false}}
export async function prepare(root){
 const texts=JSON.parse(await fs.readFile(path.join(root,'texts.json'),'utf8'));
 if(Object.keys(texts).length!==90||Object.values(texts).some(t=>typeof t!=='string'||t.length>3000))throw Error('Soubor zadání je neúplný. Stáhni balíček znovu.');
 const out=path.join(root,'vysledek');await fs.mkdir(path.join(out,'audio'),{recursive:true});
 let manifest={};try{manifest=JSON.parse(await fs.readFile(path.join(out,'manifest.json'),'utf8'))}catch{}
 const src='audio/marin-sykorky.mp3';
 if(!await readAudio(path.join(out,src)))await fs.copyFile(path.join(root,'marin-sykorky.mp3'),path.join(out,src));
 if(!await readAudio(path.join(out,src)))throw Error('Původní ukázka hlasu je poškozená.');
 manifest['0-0']={text:texts['0-0'],src,voice:'marin',origin:'user-upload'};
 const pending=[];
 for(const [id,text] of Object.entries(texts)){
  if(id==='0-0')continue;
  const hash=signature(text),src=`audio/${hash}.mp3`;
  if(await readAudio(path.join(out,src)))manifest[id]={text,src,voice:'marin',signature:hash};
  else{delete manifest[id];pending.push({id,text,src,hash})}
 }
 await save(out,manifest);return {out,manifest,pending};
}
async function save(out,manifest){
 await fs.writeFile(path.join(out,'manifest.json.tmp'),JSON.stringify(manifest,null,2));
 await fs.rename(path.join(out,'manifest.json.tmp'),path.join(out,'manifest.json'));
 await fs.writeFile(path.join(out,'voice-manifest.js'),'window.voiceManifest = '+JSON.stringify(manifest,null,2)+';\n');
}
export async function generate(plan,key,request=fetch,log=console.log){
 for(const [index,item] of plan.pending.entries()){
  log(`Nahrávka ${index+1} z ${plan.pending.length}: ročník ${Number(item.id.split('-')[0])+1}, úloha ${Number(item.id.split('-')[1])+1}`);
  let response;
  try{response=await request('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({...settings,input:item.text}),signal:AbortSignal.timeout(120000),redirect:'error'})}catch{throw Error('Spojení se službou se přerušilo nebo trvalo příliš dlouho. Uložené nahrávky zůstávají ve složce vysledek. U posledního požadavku nelze potvrdit, zda byl účtován.')}
  if(!response.ok){let code='';try{code=(await response.json()).error?.code||''}catch{}
   throw Error(response.status===401?'Služba nepřijala API klíč.':response.status===403?'Klíč nemá oprávnění k tvorbě hlasu.':code==='insufficient_quota'?'Na účtu chybí kredit nebo byl dosažen limit útraty.':response.status===429?'Služba nyní omezuje počet požadavků. Zkus pokračovat později.':`Služba vrátila chybu ${response.status}. Uložené nahrávky zůstávají zachované.`);
  }
  const data=Buffer.from(await response.arrayBuffer());
  if(!response.headers.get('content-type')?.includes('audio')||!validAudio(data))throw Error('Služba nevrátila platnou nahrávku MP3. Vytváření bylo zastaveno.');
  const file=path.join(plan.out,item.src);await fs.writeFile(file+'.tmp',data);await fs.rename(file+'.tmp',file);
  plan.manifest[item.id]={text:item.text,src:item.src,voice:'marin',signature:item.hash};await save(plan.out,plan.manifest);
 }
}
