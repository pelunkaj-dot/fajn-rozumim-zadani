const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function setup(initial={}){
 const nodes=new Map(),store=new Map(Object.entries(initial));
 const node=()=>({innerHTML:'',textContent:'',children:[],style:{},value:'',classList:{toggle(){}},append(b){this.children.push(b)},setAttribute(){},querySelectorAll(){return []},querySelector(){return node()}});
 const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 const document={getElementById:get,createElement:node,querySelector:()=>node()};
 const ctx=vm.createContext({document,window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout,console});
 vm.runInContext(fs.readFileSync('tasks.js','utf8'),ctx);ctx.tasks=ctx.window.tasks;vm.runInContext(fs.readFileSync('czech.js','utf8'),ctx);vm.runInContext(fs.readFileSync('missions.js','utf8'),ctx);
 vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
 const run=s=>vm.runInContext(s,ctx);
 return {run,nodes,store,get,clickChoice:i=>get('work').children.at(-1).children[i].onclick()};
}
const x=setup();const {run,get,clickChoice}=x;
for(let i=0;i<9;i++){run(`enter(${i})`);assert.equal(run('w'),i);assert.equal(run(`done(${i}).length`),0);for(let st=0;st<7;st++){if(st===3)run('route=0');run(`stage=${st};render()`)} }
const y=setup();y.run('enter(0);stage=1;render()');y.get('actions').children.at(-1).onclick();assert.equal(y.run('stage'),1);y.run('moved.add(0);moved.add(1);render()');y.get('actions').children.at(-1).onclick();assert.equal(y.run('stage'),2);y.clickChoice(0);assert.equal(y.run('stage'),3);y.clickChoice(0);assert.equal(y.run('stage'),4);y.get('actions').children.at(-1).onclick();assert.equal(y.run('stage'),6);assert.equal(y.run('bonus'),false);assert.equal(y.run('done(0).length'),1);
y.run('complete()');assert.equal(y.run('done(0).length'),1);
for(let m=0;m<10;m++){y.run(`enter(0,${m});complete()`)}assert.equal(y.run('done(0).length'),10);assert.equal(y.run('done(8).length'),0);
y.run('enter(8);stage=2;render()');y.clickChoice(2);assert.equal(y.run('stage'),3);y.get('trial').value='100';y.get('actions').children.at(-2).onclick();assert.ok(y.get('trial-result').innerHTML.includes('500'));y.get('actions').children.at(-1).onclick();assert.equal(y.run('stage'),2);
y.run('route=0;stage=3;render()');y.clickChoice(0);assert.equal(y.run('stage'),4);y.get('answer').value='49';y.get('actions').children.at(-2).onclick();assert.equal(y.run('stage'),4);y.get('answer').value='50';y.get('actions').children.at(-2).onclick();assert.equal(y.run('stage'),5);y.clickChoice(1);assert.equal(y.run('stage'),6);assert.equal(y.run('bonus'),true);
const old=setup({'fajn-rozumim-v1':JSON.stringify({completed:[4,8]})});assert.equal(old.run('done(4).length'),1);assert.equal(old.run('done(0).length'),0);
assert.equal(y.run('tasks[4].answer'),65000/4000);
assert.equal(y.run('birdCount(1)'),'jedna sýkorka');assert.equal(y.run('birdCount(5)'),'pět sýkorek');
for(const f of ['missions.js','voice-manifest.js','index.html','app.js','style.css','tasks.js','worlds.webp','sprites.webp','objects.webp'])assert.ok(fs.statSync(''+f).size>0);
console.log('PASS: all 9 worlds and stages render; bird model gate; optional calculation; 10 unique missions; no duplicate reward; dead end and return; wrong/correct result; legacy progress migration; units and Czech number forms; assets present. DOM logic test, not browser layout test.');

for(let world=0;world<9;world++){
 const z=setup(),seen=new Set();
 for(let m=0;m<10;m++){
  z.run(`enter(${world},${m})`);const task=z.run('t()');seen.add(task.story.join(' '));
  assert.ok(Number.isFinite(task.answer));
  if(world===1||world===2)assert.equal(task.answer,task.n*task.k);
  if(world===3)assert.equal(task.answer,2*(task.a+task.b)-task.g);
  if(world===4)assert.equal(task.answer,task.litres/4);
  if(world===5)assert.equal(task.answer,task.n*task.scale/100000);
  if(world===6)assert.ok(Math.abs(task.answer-task.loss/task.base*100)<.00001);
  if(world===7)assert.equal(task.answer**2,task.a**2+task.b**2);
  if(world===8)assert.equal(task.feeA+task.rateA*task.answer,task.feeB+task.rateB*task.answer);
  for(let st=0;st<5;st++){z.run(`stage=${st};route=0;render()`)}
  if(world>0){z.run('stage=3;route=1;render()')}
  z.run('complete()');assert.equal(z.run('done(w).length'),m+1);
  if(m<9){const next=z.get('actions').children.findLast(b=>b.id==='next-task');assert.equal(next.textContent,'Další úloha →');next.onclick();assert.equal(z.run('mission'),m+1)}
 }
 assert.equal(seen.size,10);assert.equal(z.run('nextMission()'),null);
 assert.equal(z.get('actions').children.findLast(b=>b.id==='next-task').textContent,'Vybrat další svět →');
}
console.log('PASS: 90 distinct introductory variants, both valid routes, parameter arithmetic, next task in all grades, completion boundary.');
module.exports={setup};

const audioTest=setup();audioTest.run(`window.audioCount=0;class AudioContext{constructor(){window.audioCount++;this.currentTime=0;this.destination={}}createOscillator(){return {frequency:{value:0},connect(){},start(){},stop(){}}}createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}close(){}}`);
audioTest.run("enter(1,0);message('Správně');");assert.equal(audioTest.run('window.audioCount'),0);
audioTest.run('complete()');assert.equal(audioTest.run('window.audioCount'),1);audioTest.run('complete()');assert.equal(audioTest.run('window.audioCount'),1);
audioTest.run('enter(1,1);complete()');assert.equal(audioTest.run('soundIndex'),1);audioTest.run('sound=false;enter(1,2);complete()');assert.equal(audioTest.run('window.audioCount'),2);
const voiceTest=setup();voiceTest.run("enter(0);say(t().story.join(' ')+' '+t().question)");assert.ok(voiceTest.get('help').innerHTML.includes('Přečíst hlasem zařízení'));
voiceTest.run(`window.voiceManifest={'0-0':{text:t().story.join(' ')+' '+t().question,src:'audio/test.mp3'}};window.played=[];class Audio{constructor(src){window.played.push(src)}play(){return Promise.resolve()}pause(){window.paused=true}};say(t().story.join(' ')+' '+t().question);stopVoice()`);assert.equal(voiceTest.run('window.played.length'),1);assert.equal(voiceTest.run('window.paused'),true);
console.log('PASS: no correct-click sounds, unique-completion sound only, rotation/mute, external recording playback and explicit device fallback.');
const cs=setup(),voiceBank=JSON.parse(fs.readFileSync('tools/voice-texts.json','utf8'));
assert.equal(cs.run('birdCount(2)'),'dvě sýkorky');assert.equal(cs.run('birdAcc(1)'),'jednu sýkorku');
assert.equal(cs.run("window.spokenStory({story:['Zaplatím 1 Kč a 2 Kč.'],question:''}).trim()"),'Zaplatím jednu korunu a dvě koruny.');
for(let w=0;w<9;w++)for(let m=0;m<10;m++){
 cs.run(`enter(${w},${m})`);const speech=cs.run('window.spokenStory(t())');
 assert.equal(speech,voiceBank[`${w}-${m}`]);assert.doesNotMatch(speech,/\d|\b(?:cm|kWh)\b|Kč/);
 assert.doesNotMatch(speech,/dva sýkorky|jedna sýkorku|dvě rohlíky|zemi tři metrů|se čtyři metrů/);
 if(w<3)assert.doesNotMatch(cs.run('t().story.join(" ")'),/\d/);
}
cs.run(`var speechSynthesis={cancel(){},speak(u){window.utterance=u.text}};window.speechSynthesis=speechSynthesis;var SpeechSynthesisUtterance=class{constructor(text){this.text=text}};enter(0,0)`);
cs.get('read').onclick();cs.get('device-voice').onclick();assert.ok(cs.run('window.utterance').includes('Do lesa odletí dvě sýkorky.'));
cs.run('enter(8,0)');cs.get('read').onclick();cs.get('device-voice').onclick();assert.ok(cs.run('window.utterance').includes('dvě koruny'));
console.log('PASS: all 90 narration texts use written Czech quantities; read button passes correct gender/case to speech; voice-generation bank matches.');
