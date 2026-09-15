import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {prepare,generate,settings} from './marin-batch/batch.mjs';
const root=await fs.mkdtemp(path.join(os.tmpdir(),'fajn-voice-test-'));
const make=async name=>{const dir=path.join(root,name);await fs.mkdir(dir);for(const f of ['texts.json','marin-sykorky.mp3'])await fs.copyFile(path.join('tools/marin-batch',f),path.join(dir,f));return dir};
const sample=await fs.readFile('tools/marin-batch/marin-sykorky.mp3');
const mock=()=>new Response(sample,{status:200,headers:{'Content-Type':'audio/mpeg'}});
try{
 const dir=await make('success'),plan=await prepare(dir);assert.equal(plan.pending.length,89);let calls=0;
 await generate(plan,'test-key',async(url,opts)=>{calls++;assert.equal(url,'https://api.openai.com/v1/audio/speech');assert.equal(opts.redirect,'error');const body=JSON.parse(opts.body);assert.equal(body.voice,'marin');assert.equal(body.model,'gpt-4o-mini-tts');assert.doesNotMatch(body.input,/\d/);return mock()},()=>{});
 assert.equal(calls,89);assert.equal(Object.keys(plan.manifest).length,90);assert.equal((await prepare(dir)).pending.length,0);
 assert.deepEqual(await fs.readFile(path.join(dir,'vysledek/audio/marin-sykorky.mp3')),sample);
 assert.ok(!(await fs.readFile(path.join(dir,'vysledek/manifest.json'),'utf8')).includes('test-key'));
 const partial=await make('partial');let count=0;
 await assert.rejects(generate(await prepare(partial),'test-key',async()=>{if(count++===2)throw Error('connection');return mock()},()=>{}));
 assert.equal((await prepare(partial)).pending.length,87);
 const denied=await make('denied');let denials=0;await assert.rejects(generate(await prepare(denied),'test-key',async()=>{denials++;return new Response('{}',{status:401})},()=>{}),/nepřijala API klíč/);assert.equal(denials,1);assert.equal((await prepare(denied)).pending.length,89);
 const invalid=await make('invalid');await assert.rejects(generate(await prepare(invalid),'test-key',async()=>new Response('bad',{headers:{'Content-Type':'audio/mpeg'}}),()=>{}),/platnou nahrávku/);assert.equal((await prepare(invalid)).pending.length,89);
 console.log('PASS: 89 requests with mock API only; uploaded audio preserved; 90-entry result; resumption skips completed recordings; auth/network/invalid-audio errors stop; no key stored.');
}finally{await fs.rm(root,{recursive:true,force:true})}
