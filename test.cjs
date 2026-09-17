const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function setup(initial={}){
 const nodes=new Map(),store=new Map(Object.entries(initial));
 const node=()=>({innerHTML:'',textContent:'',children:[],style:{},value:'',classList:{toggle(){},add(){}},append(b){this.children.push(b)},prepend(b){this.children=this.children.filter(x=>x!==b);this.children.unshift(b)},setAttribute(){},querySelectorAll(){return []},querySelector(){return node()}});
 const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 const document={getElementById:get,createElement:node,querySelector:()=>node()};
 const ctx=vm.createContext({document,window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout,console,URLSearchParams,confirm:()=>true});
 vm.runInContext(fs.readFileSync('tasks.js','utf8'),ctx);ctx.tasks=ctx.window.tasks;vm.runInContext(fs.readFileSync('czech.js','utf8'),ctx);vm.runInContext(fs.readFileSync('missions.js','utf8'),ctx);vm.runInContext(fs.readFileSync('grade9.js','utf8'),ctx);
 vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
 const run=s=>vm.runInContext(s,ctx);
 return {run,nodes,store,get,clickChoice:i=>get('work').children.at(-1).children[i].onclick()};
}
const x=setup();const {run,get,clickChoice}=x;
for(let i=0;i<9;i++){run(`enter(${i})`);assert.equal(run('w'),i);assert.equal(run(`done(${i}).length`),0);for(let st=0;st<7;st++){if(st===3)run('route=0');run(`stage=${st};render()`)} }
const y=setup();y.run('enter(0);stage=1;render()');y.get('actions').children.at(-1).onclick();assert.equal(y.run('stage'),1);y.run('moved.add(0);moved.add(1);render()');y.get('actions').children.at(-1).onclick();assert.equal(y.run('stage'),2);y.clickChoice(0);assert.equal(y.run('stage'),3);y.clickChoice(0);assert.equal(y.run('stage'),4);y.get('actions').children.at(-1).onclick();assert.equal(y.run('stage'),6);assert.equal(y.run('bonus'),false);assert.equal(y.run('done(0).length'),1);
y.run('complete()');assert.equal(y.run('done(0).length'),1);
for(let m=0;m<10;m++){y.run(`enter(0,${m});complete()`)}assert.equal(y.run('done(0).length'),10);assert.equal(y.run('done(8).length'),0);
y.run('enter(8,0);stage=2;render()');y.clickChoice(2);assert.equal(y.run('stage'),3);y.get('trial').value='100';y.get('actions').children.at(-2).onclick();assert.ok(y.get('trial-result').innerHTML.includes('500'));y.get('actions').children.at(-1).onclick();assert.equal(y.run('stage'),2);
y.run('route=0;stage=3;render()');y.clickChoice(0);assert.equal(y.run('stage'),4);y.get('answer').value='49';y.get('actions').children.at(-2).onclick();assert.equal(y.run('stage'),4);y.get('answer').value='50';y.get('actions').children.at(-2).onclick();assert.equal(y.run('stage'),5);y.clickChoice(1);assert.equal(y.run('stage'),6);assert.equal(y.run('bonus'),true);
const old=setup({'fajn-rozumim-v1':JSON.stringify({completed:[4,8]})});assert.equal(old.run('done(4).length'),1);assert.equal(old.run('done(0).length'),0);
assert.equal(y.run('tasks[4].answer'),65000/4000);
assert.equal(y.run('birdCount(1)'),'jedna sýkorka');assert.equal(y.run('birdCount(5)'),'pět sýkorek');
const nav=setup();nav.run('enter(1);groups[0]=3;route=0;stage=3;render()');assert.equal(nav.get('actions').children[0].textContent,'← Zpět k předchozímu kroku');nav.get('actions').children[0].onclick();assert.equal(nav.run('stage'),2);nav.get('actions').children[0].onclick();assert.equal(nav.run('stage'),1);assert.equal(nav.run('groups[0]'),3);
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
  if(m<9){const next=z.get('actions').children.findLast(b=>b.id==='next-task');if(world===8){assert.equal(next.textContent,'Zpět na přehled úloh →')}else{assert.equal(next.textContent,'Další úloha →');next.onclick();assert.equal(z.run('mission'),m+1)}}
 }
 assert.equal(seen.size,10);assert.equal(z.run('nextMission()'),null);
 assert.equal(z.get('actions').children.findLast(b=>b.id==='next-task').textContent,world===8?'Zpět na přehled úloh →':'Vybrat další svět →');
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

const uploaded=setup();
uploaded.run(fs.readFileSync('voice-manifest.js','utf8'));uploaded.run("openFromLink('?rocnik=1&uloha=1')");assert.equal(uploaded.run('w'),0);assert.equal(uploaded.run('mission'),0);assert.equal(uploaded.run('done(0).length'),0);assert.equal(uploaded.run("window.voiceManifest['0-0'].text"),uploaded.run('window.spokenStory(t())'));
uploaded.run(`window.played=[];class Audio{constructor(src){window.played.push(src)}play(){return Promise.resolve()}pause(){}}`);uploaded.get('read').onclick();const recorded=uploaded.run('window.played[0]');assert.ok(recorded.startsWith('audio/marin-sykorky-'));assert.ok(fs.statSync(''+recorded).size>100000);
uploaded.run("openFromLink('?rocnik=9&uloha=10')");assert.equal(uploaded.run('w'),8);assert.equal(uploaded.run('mission'),9);
for(const query of ['?rocnik=0&uloha=1','?rocnik=1&uloha=11','?rocnik=x&uloha=1']){uploaded.run(`openFromLink(${JSON.stringify(query)})`);assert.ok(uploaded.get('app').innerHTML.includes('world-grid'))}
console.log('PASS: uploaded Marin MP3 selected by real read handler; direct task links preserve progress and reject invalid indices.');

const g9=setup();
assert.equal(g9.run('window.grade9Model.tasks.length'),100);
assert.equal(g9.run('window.grade9Model.topics.length'),10);
assert.equal(g9.run('window.grade9Model.tasks.filter(t=>t.available).length'),90);
assert.equal(g9.run('new Set(window.grade9Model.tasks.map(t=>t.id)).size'),100);
assert.equal(g9.run('window.grade9Model.tasks.every(t=>t.grade===9&&t.topicId&&t.topicOrder&&t.difficulty&&t.rewardId)'),true);
g9.run('enter(8,7)');assert.equal(g9.run('mission'),7);assert.ok(g9.get('app').innerHTML.includes('Přehled 9. ročníku'));
g9.get('map-back').onclick();assert.ok(g9.get('app').innerHTML.includes('Přehled úloh 9. ročníku'));
g9.run("grade9Topic='finance';grade9Filter='all'");assert.equal(g9.run('grade9VisibleTasks().length'),10);
g9.run('enter(8,7);complete()');assert.equal(g9.run('grade9Progress.length'),1);
g9.run("grade9Filter='done'");assert.equal(g9.run('grade9VisibleTasks().length'),1);
g9.run("grade9Filter='todo'");assert.equal(g9.run('grade9VisibleTasks().length'),9);
g9.run('enter(8,7);complete()');assert.equal(g9.run('grade9Progress.length'),1);assert.equal(g9.run('done(8).length'),1);
g9.run("grade9Progress.push('g9-percentages-01');grade9Topic='finance';resetGrade9Topic()");assert.equal(g9.run('grade9Progress.includes("g9-finance-08")'),false);assert.equal(g9.run('grade9Progress.includes("g9-percentages-01")'),true);assert.equal(g9.run('done(8).length'),0);
const migrated=setup({'fajn-rozumim-v2':JSON.stringify({'0':[2],'4':[1,6],'8':[0,9]})});
assert.equal(migrated.run('done(0).join(",")'),'2');assert.equal(migrated.run('done(4).join(",")'),'1,6');assert.equal(migrated.run('grade9Progress.length'),2);assert.equal(JSON.parse(migrated.store.get('fajn-rozumim-v2'))[8].length,2);
for(let grade=0;grade<8;grade++){const unchanged=setup();unchanged.run(`enter(${grade},4);complete()`);assert.equal(unchanged.run(`done(${grade}).join(',')`),'4');assert.equal(unchanged.run('grade9Progress.length'),0)}
console.log('PASS: grade 9 free selection, filters, overview return, repeat, isolated topic reset, legacy migration, 100-task metadata, and unchanged grades 1-8.');

const percentages=setup(),percentageStories=new Set(),expected=[120,800,1200,15,1440,30250,90,84,1200,20];
for(let i=0;i<10;i++){
 const id=`g9-percentages-${String(i+1).padStart(2,'0')}`;
 percentages.run(`enter(8,${JSON.stringify(id)})`);
 const task=percentages.run('t()');percentageStories.add(task.story.join(' '));
 assert.equal(task.answer,expected[i]);assert.equal(percentages.run('grade9Task().topicId'),'percentages');
 for(let stage=0;stage<6;stage++){percentages.run(`route=0;stage=${stage};render()`)}
 percentages.run('complete()');assert.equal(percentages.run('grade9Progress.length'),i+1);assert.equal(percentages.run('done(8).length'),0);
}
assert.equal(percentageStories.size,10);assert.equal(percentages.run("grade9Progress.every(id=>id.startsWith('g9-percentages-'))"),true);
percentages.run("grade9Topic='percentages';grade9Filter='done'");assert.equal(percentages.run('grade9VisibleTasks().length'),10);
percentages.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-percentages-01');say(window.spokenStory(t()))");assert.ok(percentages.get('help').innerHTML.includes('hlas svého zařízení'));
const separated=setup();separated.run("enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(separated.run('grade9Progress.length'),2);assert.equal(separated.run("grade9Progress.includes('g9-percentages-01')"),true);assert.equal(separated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(separated.run('done(8).join(",")'),'0');
separated.run("grade9Topic='percentages';resetGrade9Topic()");assert.equal(separated.run("grade9Progress.includes('g9-percentages-01')"),false);assert.equal(separated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(separated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct percentage tasks, all stages, correct answers, device-voice fallback, isolated IDs, and percentage-only reset.');

const equations=setup(),equationStories=new Set(),equationAnswers=[120,75,10,6,36,4,1800,2,90,6];
for(let i=0;i<10;i++){
 const id=`g9-equations-${String(i+1).padStart(2,'0')}`;
 equations.run(`enter(8,${JSON.stringify(id)})`);
 const task=equations.run('t()');equationStories.add(task.story.join(' '));
 assert.equal(task.answer,equationAnswers[i]);assert.equal(equations.run('grade9Task().topicId'),'equations');
 assert.equal(task.valid.length,2);assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){equations.run(`route=0;stage=${stage};render()`)}
 equations.run('route=1;stage=3;render()');
 equations.run('complete()');assert.equal(equations.run('grade9Progress.length'),i+1);assert.equal(equations.run('done(8).length'),0);
}
assert.equal(equationStories.size,10);
assert.equal(equations.run("grade9Progress.every(id=>id.startsWith('g9-equations-'))"),true);
equations.run("grade9Topic='equations';grade9Filter='done'");assert.equal(equations.run('grade9VisibleTasks().length'),10);
equations.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-equations-01');say(window.spokenStory(t()))");assert.ok(equations.get('help').innerHTML.includes('hlas svého zařízení'));
const equationSeparated=setup();equationSeparated.run("enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(equationSeparated.run('grade9Progress.length'),3);
equationSeparated.run("grade9Topic='equations';resetGrade9Topic()");assert.equal(equationSeparated.run("grade9Progress.includes('g9-equations-01')"),false);assert.equal(equationSeparated.run("grade9Progress.includes('g9-percentages-01')"),true);assert.equal(equationSeparated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(equationSeparated.run('done(8).join(",")'),'0');
const manifest=setup();manifest.run(fs.readFileSync('voice-manifest.js','utf8'));assert.equal(manifest.run('Object.keys(window.voiceManifest).length'),90);assert.equal(fs.readdirSync('audio').filter(name=>name.endsWith('.mp3')).length,90);
console.log('PASS: 10 distinct equation tasks, two valid routes, all stages, correct answers, device voice, isolated progress/reset, and all 90 Marin recordings preserved.');

const systems=setup(),systemStories=new Set(),systemAnswers=[10,7,8,9,5,5,74,4,13,6];
for(let i=0;i<10;i++){
 const id=`g9-systems-${String(i+1).padStart(2,'0')}`;
 systems.run(`enter(8,${JSON.stringify(id)})`);
 const task=systems.run('t()');systemStories.add(task.story.join(' '));
 assert.equal(task.answer,systemAnswers[i]);assert.equal(systems.run('grade9Task().topicId'),'systems');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){systems.run(`route=0;stage=${stage};render()`)}
 systems.run('route=1;stage=3;render()');systems.run('route=2;stage=3;render()');
 systems.run('complete()');assert.equal(systems.run('grade9Progress.length'),i+1);assert.equal(systems.run('done(8).length'),0);
}
assert.equal(systemStories.size,10);assert.equal(systems.run("grade9Progress.every(id=>id.startsWith('g9-systems-'))"),true);
systems.run("grade9Topic='systems';grade9Filter='done'");assert.equal(systems.run('grade9VisibleTasks().length'),10);
systems.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-systems-01');say(window.spokenStory(t()))");assert.ok(systems.get('help').innerHTML.includes('hlas svého zařízení'));
const systemSeparated=setup();systemSeparated.run("enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(systemSeparated.run('grade9Progress.length'),4);
systemSeparated.run("grade9Topic='systems';resetGrade9Topic()");assert.equal(systemSeparated.run("grade9Progress.includes('g9-systems-01')"),false);assert.equal(systemSeparated.run("grade9Progress.includes('g9-equations-01')"),true);assert.equal(systemSeparated.run("grade9Progress.includes('g9-percentages-01')"),true);assert.equal(systemSeparated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(systemSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct system-of-equations tasks, two valid routes plus misconception route, all stages, correct answers, device voice, and isolated progress/reset.');

const ratios=setup(),ratioStories=new Set(),ratioAnswers=[320,750,1.8,300,9,20,15,30,12,4];
for(let i=0;i<10;i++){
 const id=`g9-ratio-${String(i+1).padStart(2,'0')}`;
 ratios.run(`enter(8,${JSON.stringify(id)})`);
 const task=ratios.run('t()');ratioStories.add(task.story.join(' '));
 assert.equal(task.answer,ratioAnswers[i]);assert.equal(ratios.run('grade9Task().topicId'),'ratio');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){ratios.run(`route=0;stage=${stage};render()`)}
 ratios.run('route=1;stage=3;render()');ratios.run('route=2;stage=3;render()');
 ratios.run('complete()');assert.equal(ratios.run('grade9Progress.length'),i+1);assert.equal(ratios.run('done(8).length'),0);
}
assert.equal(ratioStories.size,10);assert.equal(ratios.run("grade9Progress.every(id=>id.startsWith('g9-ratio-'))"),true);
ratios.run("grade9Topic='ratio';grade9Filter='done'");assert.equal(ratios.run('grade9VisibleTasks().length'),10);
ratios.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-ratio-01');say(window.spokenStory(t()))");assert.ok(ratios.get('help').innerHTML.includes('hlas svého zařízení'));
const ratioSeparated=setup();ratioSeparated.run("enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(ratioSeparated.run('grade9Progress.length'),5);
ratioSeparated.run("grade9Topic='ratio';resetGrade9Topic()");assert.equal(ratioSeparated.run("grade9Progress.includes('g9-ratio-01')"),false);assert.equal(ratioSeparated.run("grade9Progress.includes('g9-systems-01')"),true);assert.equal(ratioSeparated.run("grade9Progress.includes('g9-equations-01')"),true);assert.equal(ratioSeparated.run("grade9Progress.includes('g9-percentages-01')"),true);assert.equal(ratioSeparated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(ratioSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct ratio/proportion tasks, two valid routes plus misconception route, all stages, decimal answer, device voice, and isolated progress/reset.');

const functions=setup(),functionStories=new Set(),functionAnswers=[14,23,3,2,260,30,20,16,63,31];
for(let i=0;i<10;i++){
 const id=`g9-functions-${String(i+1).padStart(2,'0')}`;
 functions.run(`enter(8,${JSON.stringify(id)})`);
 const task=functions.run('t()');functionStories.add(task.story.join(' '));
 assert.equal(task.answer,functionAnswers[i]);assert.equal(functions.run('grade9Task().topicId'),'functions');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){functions.run(`route=0;stage=${stage};render()`)}
 functions.run('route=1;stage=3;render()');functions.run('route=2;stage=3;render()');
 functions.run('complete()');assert.equal(functions.run('grade9Progress.length'),i+1);assert.equal(functions.run('done(8).length'),0);
}
assert.equal(functionStories.size,10);assert.equal(functions.run("grade9Progress.every(id=>id.startsWith('g9-functions-'))"),true);
functions.run("grade9Topic='functions';grade9Filter='done'");assert.equal(functions.run('grade9VisibleTasks().length'),10);
functions.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-functions-01');say(window.spokenStory(t()))");assert.ok(functions.get('help').innerHTML.includes('hlas svého zařízení'));
const functionSeparated=setup();functionSeparated.run("enter(8,'g9-functions-01');complete();enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(functionSeparated.run('grade9Progress.length'),6);
functionSeparated.run("grade9Topic='functions';resetGrade9Topic()");assert.equal(functionSeparated.run("grade9Progress.includes('g9-functions-01')"),false);assert.equal(functionSeparated.run("grade9Progress.includes('g9-ratio-01')"),true);assert.equal(functionSeparated.run("grade9Progress.includes('g9-systems-01')"),true);assert.equal(functionSeparated.run("grade9Progress.includes('g9-equations-01')"),true);assert.equal(functionSeparated.run("grade9Progress.includes('g9-percentages-01')"),true);assert.equal(functionSeparated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(functionSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct functions/graphs tasks, two valid routes plus misconception route, all stages, correct answers, device voice, and isolated progress/reset.');

const geometry=setup(),geometryStories=new Set(),geometryAnswers=[51,42,10,31.4,113.04,55,15,15,96,10];
for(let i=0;i<10;i++){
 const id=`g9-geometry-${String(i+1).padStart(2,'0')}`;
 geometry.run(`enter(8,${JSON.stringify(id)})`);
 const task=geometry.run('t()');geometryStories.add(task.story.join(' '));
 assert.equal(task.answer,geometryAnswers[i]);assert.equal(geometry.run('grade9Task().topicId'),'geometry');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){geometry.run(`route=0;stage=${stage};render()`)}
 geometry.run('route=1;stage=3;render()');geometry.run('route=2;stage=3;render()');
 geometry.run('complete()');assert.equal(geometry.run('grade9Progress.length'),i+1);assert.equal(geometry.run('done(8).length'),0);
}
assert.equal(geometryStories.size,10);assert.equal(geometry.run("grade9Progress.every(id=>id.startsWith('g9-geometry-'))"),true);
geometry.run("grade9Topic='geometry';grade9Filter='done'");assert.equal(geometry.run('grade9VisibleTasks().length'),10);
geometry.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-geometry-01');say(window.spokenStory(t()))");assert.ok(geometry.get('help').innerHTML.includes('hlas svého zařízení'));
const geometrySeparated=setup();geometrySeparated.run("enter(8,'g9-geometry-01');complete();enter(8,'g9-functions-01');complete();enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(geometrySeparated.run('grade9Progress.length'),7);
geometrySeparated.run("grade9Topic='geometry';resetGrade9Topic()");assert.equal(geometrySeparated.run("grade9Progress.includes('g9-geometry-01')"),false);assert.equal(geometrySeparated.run("grade9Progress.includes('g9-functions-01')"),true);assert.equal(geometrySeparated.run("grade9Progress.includes('g9-ratio-01')"),true);assert.equal(geometrySeparated.run("grade9Progress.includes('g9-systems-01')"),true);assert.equal(geometrySeparated.run("grade9Progress.includes('g9-equations-01')"),true);assert.equal(geometrySeparated.run("grade9Progress.includes('g9-percentages-01')"),true);assert.equal(geometrySeparated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(geometrySeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct geometry tasks, two valid routes plus misconception route, all stages, decimal answers, device voice, and isolated progress/reset.');

const volumes=setup(),volumeStories=new Set(),volumeAnswers=[64,112,2.75,282.6,120,20,324,9,420,60];
for(let i=0;i<10;i++){
 const id=`g9-volume-${String(i+1).padStart(2,'0')}`;
 volumes.run(`enter(8,${JSON.stringify(id)})`);
 const task=volumes.run('t()');volumeStories.add(task.story.join(' '));
 assert.equal(task.answer,volumeAnswers[i]);assert.equal(volumes.run('grade9Task().topicId'),'volume');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){volumes.run(`route=0;stage=${stage};render()`)}
 volumes.run('route=1;stage=3;render()');volumes.run('route=2;stage=3;render()');
 volumes.run('complete()');assert.equal(volumes.run('grade9Progress.length'),i+1);assert.equal(volumes.run('done(8).length'),0);
}
assert.equal(volumeStories.size,10);assert.equal(volumes.run("grade9Progress.every(id=>id.startsWith('g9-volume-'))"),true);
volumes.run("grade9Topic='volume';grade9Filter='done'");assert.equal(volumes.run('grade9VisibleTasks().length'),10);
volumes.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-volume-01');say(window.spokenStory(t()))");assert.ok(volumes.get('help').innerHTML.includes('hlas svého zařízení'));
const volumeSeparated=setup();volumeSeparated.run("enter(8,'g9-volume-01');complete();enter(8,'g9-geometry-01');complete();enter(8,'g9-functions-01');complete();enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(volumeSeparated.run('grade9Progress.length'),8);
volumeSeparated.run("grade9Topic='volume';resetGrade9Topic()");assert.equal(volumeSeparated.run("grade9Progress.includes('g9-volume-01')"),false);assert.equal(volumeSeparated.run("grade9Progress.includes('g9-geometry-01')"),true);assert.equal(volumeSeparated.run("grade9Progress.includes('g9-functions-01')"),true);assert.equal(volumeSeparated.run("grade9Progress.includes('g9-ratio-01')"),true);assert.equal(volumeSeparated.run("grade9Progress.includes('g9-systems-01')"),true);assert.equal(volumeSeparated.run("grade9Progress.includes('g9-equations-01')"),true);assert.equal(volumeSeparated.run("grade9Progress.includes('g9-percentages-01')"),true);assert.equal(volumeSeparated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(volumeSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct volume/conversion tasks, two valid routes plus misconception route, all stages, decimal answers, device voice, and isolated progress/reset.');

const dataTasks=setup(),dataStories=new Set(),dataAnswers=[8,12,15,4,8,30,50,30,2.4,6];
for(let i=0;i<10;i++){
 const id=`g9-data-${String(i+1).padStart(2,'0')}`;
 dataTasks.run(`enter(8,${JSON.stringify(id)})`);
 const task=dataTasks.run('t()');dataStories.add(task.story.join(' '));
 assert.equal(task.answer,dataAnswers[i]);assert.equal(dataTasks.run('grade9Task().topicId'),'data');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){dataTasks.run(`route=0;stage=${stage};render()`)}
 dataTasks.run('route=1;stage=3;render()');dataTasks.run('route=2;stage=3;render()');
 dataTasks.run('complete()');assert.equal(dataTasks.run('grade9Progress.length'),i+1);assert.equal(dataTasks.run('done(8).length'),0);
}
assert.equal(dataStories.size,10);assert.equal(dataTasks.run("grade9Progress.every(id=>id.startsWith('g9-data-'))"),true);
dataTasks.run("grade9Topic='data';grade9Filter='done'");assert.equal(dataTasks.run('grade9VisibleTasks().length'),10);
dataTasks.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-data-01');say(window.spokenStory(t()))");assert.ok(dataTasks.get('help').innerHTML.includes('hlas svého zařízení'));
const dataSeparated=setup();dataSeparated.run("enter(8,'g9-data-01');complete();enter(8,'g9-volume-01');complete();enter(8,'g9-geometry-01');complete();enter(8,'g9-functions-01');complete();enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(dataSeparated.run('grade9Progress.length'),9);
dataSeparated.run("grade9Topic='data';resetGrade9Topic()");assert.equal(dataSeparated.run("grade9Progress.includes('g9-data-01')"),false);assert.equal(dataSeparated.run("grade9Progress.includes('g9-volume-01')"),true);assert.equal(dataSeparated.run("grade9Progress.includes('g9-geometry-01')"),true);assert.equal(dataSeparated.run("grade9Progress.includes('g9-functions-01')"),true);assert.equal(dataSeparated.run("grade9Progress.includes('g9-ratio-01')"),true);assert.equal(dataSeparated.run("grade9Progress.includes('g9-systems-01')"),true);assert.equal(dataSeparated.run("grade9Progress.includes('g9-equations-01')"),true);assert.equal(dataSeparated.run("grade9Progress.includes('g9-percentages-01')"),true);assert.equal(dataSeparated.run("grade9Progress.includes('g9-finance-01')"),true);assert.equal(dataSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct data/probability tasks, two valid routes plus misconception route, all stages, decimal answer, device voice, and isolated progress/reset.');
