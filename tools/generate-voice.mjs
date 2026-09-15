// Offline generation only. Never include OPENAI_API_KEY in client code or committed files.
// API reference: https://developers.openai.com/api/docs/guides/text-to-speech
// Default dry run. --generate makes ONE sample. --generate --limit=90 resumes the bank.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,await fs.stat(path.join(root,'dist/index.html')).then(()=> 'dist').catch(()=>''));
const texts=JSON.parse(await fs.readFile(path.join(root,'tools/voice-texts.json'),'utf8'));
const generate=process.argv.includes('--generate');
const limit=Number(process.argv.find(a=>a.startsWith('--limit='))?.slice(8)||1);
if(!Number.isInteger(limit)||limit<1||limit>90)throw Error('Limit must be from 1 to 90.');
const model='gpt-4o-mini-tts',voice='coral';
const instructions='Mluv přirozenou spisovnou češtinou jako laskavá učitelka. Čti klidně, zřetelně a bez přehnaného nadšení. Mezi větami dělej krátké pauzy. Čísla i jednotky vyslov celými českými slovy. Zachovej přesně znění zadání; nic nedoplňuj a neprozrazuj řešení.';
const entries=Object.entries(texts).slice(0,limit);
console.log(`${entries.length} recordings selected; ${entries.reduce((n,[,t])=>n+t.length,0)} characters. ${generate?'Generation enabled.':'Dry run: no paid request.'}`);
if(!generate)process.exit(0);
if(!process.env.OPENAI_API_KEY)throw Error('Missing OPENAI_API_KEY. Configure through OpenAI Developers; do not put it in source code.');
await fs.mkdir(path.join(output,'audio'),{recursive:true});
let manifest={};try{const raw=await fs.readFile(path.join(output,'voice-manifest.js'),'utf8');manifest=JSON.parse(raw.replace(/^window.voiceManifest\s*=\s*/,'').replace(/;\s*$/,''))}catch{}
for(const [id,text] of entries){
 const hash=createHash('sha256').update(JSON.stringify({text,model,voice,instructions})).digest('hex').slice(0,24);
 const src=`audio/${hash}.mp3`,file=path.join(output,src);
 if(!await fs.stat(file).then(s=>s.size>0).catch(()=>false)){
  const response=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model,voice,input:text,instructions,response_format:'mp3'}),signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw Error(`Voice service returned ${response.status}; generation stopped. Completed recordings are preserved.`);
  const data=Buffer.from(await response.arrayBuffer());if(!response.headers.get('content-type')?.includes('audio')||data.length<100)throw Error('Voice service returned invalid audio.');
  await fs.writeFile(file+'.tmp',data);await fs.rename(file+'.tmp',file);
 }
 manifest[id]={text,src};await fs.writeFile(path.join(output,'voice-manifest.js'),'window.voiceManifest = '+JSON.stringify(manifest,null,2)+';\n');console.log(`Ready: ${id}`);
}
