import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {emitKeypressEvents} from 'node:readline';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {prepare,generate} from './batch.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
function hiddenKey(){
 if(!process.stdin.isTTY)throw Error('Spusť soubor SPUSTIT.cmd dvojklikem v rozbalené složce.');
 process.stdout.write('Vlož API klíč a stiskni Enter (zobrazí se jen hvězdičky): ');
 return new Promise((resolve,reject)=>{
  let secret='';emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdin.resume();
  const end=()=>{process.stdin.removeListener('keypress',onKey);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n')};
  function onKey(str,key={}){
   if(key.ctrl&&key.name==='c'){secret='';end();reject(Error('Zrušeno.'));return}
   if(key.name==='return'||key.name==='enter'){const value=secret;secret='';end();resolve(value);return}
   if(key.name==='backspace'){if(secret.length){secret=secret.slice(0,-1);process.stdout.write('\b \b')}return}
   if(str&&/^[a-zA-Z0-9_-]+$/.test(str)&&!key.ctrl&&!key.meta){secret+=str;process.stdout.write('*'.repeat(str.length))}
  }
  process.stdin.on('keypress',onKey);
 });
}
try{
 const plan=await prepare(root);
 console.log('FAJN — nahrávky hlasem Marin');
 console.log(`Hotových nahrávek: ${90-plan.pending.length}. Zbývá vytvořit: ${plan.pending.length}.`);
 console.log('Vytváření používá placené OpenAI API ve tvém účtu. Klíč zůstane jen v paměti tohoto programu.');
 if(process.argv.includes('--kontrola')){console.log('Kontrola dokončena. Žádné placené požadavky nebyly odeslány.');process.exit(0)}
 if(plan.pending.length){let key=await hiddenKey();if(!key.startsWith('sk-')||key.length<20)throw Error('Tohle nevypadá jako API klíč OpenAI.');try{await generate(plan,key)}finally{key=''}}
 if(process.platform==='win32'){
  await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-Command','Compress-Archive -Path "vysledek\\*" -DestinationPath "nahravky-marin.zip" -Force'],{cwd:root});
  console.log('HOTOVO. Soubor nahravky-marin.zip je vedle souboru SPUSTIT.cmd. Přilož ho do našeho chatu.');
 }else console.log('HOTOVO. Nahrávky a manifest jsou ve složce vysledek.');
}catch(error){console.error('\n'+error.message+'\nPři opětovném spuštění se hotové nahrávky přeskočí.');process.exitCode=1}
