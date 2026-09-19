const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function setup(initial={}){
 const nodes=new Map(),store=new Map(Object.entries(initial));
 const node=()=>({innerHTML:'',textContent:'',children:[],style:{},value:'',classList:{toggle(){},add(){}},append(b){this.children.push(b)},prepend(b){this.children=this.children.filter(x=>x!==b);this.children.unshift(b)},setAttribute(){},querySelectorAll(){return []},querySelector(){return node()}});
 const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 const document={getElementById:get,createElement:node,querySelector:()=>node()};
 const ctx=vm.createContext({document,window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout,console,URLSearchParams,confirm:()=>true});
 vm.runInContext(fs.readFileSync('tasks.js','utf8'),ctx);ctx.tasks=ctx.window.tasks;vm.runInContext(fs.readFileSync('czech.js','utf8'),ctx);vm.runInContext(fs.readFileSync('missions.js','utf8'),ctx);vm.runInContext(fs.readFileSync('grade7.js','utf8'),ctx);vm.runInContext(fs.readFileSync('world7.js','utf8'),ctx);vm.runInContext(fs.readFileSync('grade8.js','utf8'),ctx);vm.runInContext(fs.readFileSync('world8.js','utf8'),ctx);vm.runInContext(fs.readFileSync('grade9.js','utf8'),ctx);vm.runInContext(fs.readFileSync('world9.js','utf8'),ctx);
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
for(const f of ['missions.js','voice-manifest.js','index.html','app.js','style.css','tasks.js','world9.js','worlds.webp','sprites.webp','objects.webp'])assert.ok(fs.statSync(''+f).size>0);
console.log('PASS: all 9 worlds and stages render; bird model gate; optional calculation; 10 unique missions; no duplicate reward; dead end and return; wrong/correct result; legacy progress migration; units and Czech number forms; assets present. DOM logic test, not browser layout test.');

for(let world=0;world<9;world++){
 if(world===6||world===7)continue;
 const z=setup(),seen=new Set();
 for(let m=0;m<10;m++){
  z.run(`enter(${world},${m})`);const task=z.run('t()');seen.add(task.story.join(' '));
  assert.ok(Number.isFinite(task.answer));
  if(world===1||world===2)assert.equal(task.answer,task.n*task.k);
  if(world===3)assert.equal(task.answer,2*(task.a+task.b)-task.g);
  if(world===4)assert.equal(task.answer,task.litres/4);
  if(world===5)assert.equal(task.answer,task.n*task.scale/100000);
  if(world===6)assert.ok(Math.abs(task.answer-task.loss/task.base*100)<.00001);
  if(world===8)assert.equal(task.feeA+task.rateA*task.answer,task.feeB+task.rateB*task.answer);
  for(let st=0;st<5;st++){z.run(`stage=${st};route=0;render()`)}
  if(world>0){z.run('stage=3;route=1;render()')}
  z.run('complete()');assert.equal(z.run('done(w).length'),m+1);
  if(m<9){const next=z.get('actions').children.findLast(b=>b.id==='next-task');if(world===8){assert.equal(next.textContent,`Další nesplněná v okruhu: ${m+2} →`)}else{assert.equal(next.textContent,'Další úloha →');next.onclick();assert.equal(z.run('mission'),m+1)}}
 }
 assert.equal(seen.size,10);assert.equal(z.run('nextMission()'),null);
 assert.equal(z.get('actions').children.findLast(b=>b.id==='next-task').textContent,world===8?'Okruh je hotový — zpět do města →':'Vybrat další svět →');
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
for(let w=0;w<9;w++){if(w===6||w===7)continue;for(let m=0;m<10;m++){
 cs.run(`enter(${w},${m})`);const speech=cs.run('window.spokenStory(t())');
 assert.equal(speech,voiceBank[`${w}-${m}`]);assert.doesNotMatch(speech,/\d|\b(?:cm|kWh)\b|Kč/);
 assert.doesNotMatch(speech,/dva sýkorky|jedna sýkorku|dvě rohlíky|zemi tři metrů|se čtyři metrů/);
 if(w<3)assert.doesNotMatch(cs.run('t().story.join(" ")'),/\d/);
}}
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
assert.equal(g9.run('window.grade9Model.tasks.filter(t=>t.available).length'),100);
assert.equal(g9.run('new Set(window.grade9Model.tasks.map(t=>t.id)).size'),100);
assert.equal(g9.run('window.grade9Model.tasks.every(t=>t.grade===9&&t.topicId&&t.topicOrder&&t.difficulty&&t.rewardId)'),true);
g9.run('enter(8,7)');assert.equal(g9.run('mission'),7);assert.ok(g9.get('app').innerHTML.includes('Herní svět a úlohy'));
g9.get('map-back').onclick();assert.ok(g9.get('app').innerHTML.includes('Město souvislostí'));
g9.run("selTopic[8]='finance';selFilter[8]='all'");assert.equal(g9.run('cityVisibleTasks(8).length'),10);
g9.run('enter(8,7);complete()');assert.equal(g9.run('cityProgress[8].length'),1);
g9.run("selFilter[8]='done'");assert.equal(g9.run('cityVisibleTasks(8).length'),1);
g9.run("selFilter[8]='todo'");assert.equal(g9.run('cityVisibleTasks(8).length'),9);
g9.run('enter(8,7);complete()');assert.equal(g9.run('cityProgress[8].length'),1);assert.equal(g9.run('done(8).length'),1);
g9.run("cityProgress[8].push('g9-percentages-01');selTopic[8]='finance';resetCityTopic(8)");assert.equal(g9.run('cityProgress[8].includes("g9-finance-08")'),false);assert.equal(g9.run('cityProgress[8].includes("g9-percentages-01")'),true);assert.equal(g9.run('done(8).length'),0);
const migrated=setup({'fajn-rozumim-v2':JSON.stringify({'0':[2],'4':[1,6],'8':[0,9]})});
assert.equal(migrated.run('done(0).join(",")'),'2');assert.equal(migrated.run('done(4).join(",")'),'1,6');assert.equal(migrated.run('cityProgress[8].length'),2);assert.equal(JSON.parse(migrated.store.get('fajn-rozumim-v2'))[8].length,2);
for(let grade=0;grade<6;grade++){const unchanged=setup();unchanged.run(`enter(${grade},4);complete()`);assert.equal(unchanged.run(`done(${grade}).join(',')`),'4');assert.equal(unchanged.run('cityProgress[8].length'),0);assert.equal(unchanged.run('cityProgress[7].length'),0);assert.equal(unchanged.run('cityProgress[6].length'),0)}
console.log('PASS: grade 9 free selection, filters, overview return, repeat, isolated topic reset, legacy migration, 100-task metadata, and unchanged grades 1-6.');

const percentages=setup(),percentageStories=new Set(),expected=[120,800,1200,15,1440,30250,90,84,1200,20];
for(let i=0;i<10;i++){
 const id=`g9-percentages-${String(i+1).padStart(2,'0')}`;
 percentages.run(`enter(8,${JSON.stringify(id)})`);
 const task=percentages.run('t()');percentageStories.add(task.story.join(' '));
 assert.equal(task.answer,expected[i]);assert.equal(percentages.run('cityTask(8).topicId'),'percentages');
 for(let stage=0;stage<6;stage++){percentages.run(`route=0;stage=${stage};render()`)}
 percentages.run('complete()');assert.equal(percentages.run('cityProgress[8].length'),i+1);assert.equal(percentages.run('done(8).length'),0);
}
assert.equal(percentageStories.size,10);assert.equal(percentages.run("cityProgress[8].every(id=>id.startsWith('g9-percentages-'))"),true);
percentages.run("selTopic[8]='percentages';selFilter[8]='done'");assert.equal(percentages.run('cityVisibleTasks(8).length'),10);
percentages.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-percentages-01');say(window.spokenStory(t()))");assert.ok(percentages.get('help').innerHTML.includes('hlas svého zařízení'));
const separated=setup();separated.run("enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(separated.run('cityProgress[8].length'),2);assert.equal(separated.run("cityProgress[8].includes('g9-percentages-01')"),true);assert.equal(separated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(separated.run('done(8).join(",")'),'0');
separated.run("selTopic[8]='percentages';resetCityTopic(8)");assert.equal(separated.run("cityProgress[8].includes('g9-percentages-01')"),false);assert.equal(separated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(separated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct percentage tasks, all stages, correct answers, device-voice fallback, isolated IDs, and percentage-only reset.');

const equations=setup(),equationStories=new Set(),equationAnswers=[120,75,10,6,36,4,1800,2,90,6];
for(let i=0;i<10;i++){
 const id=`g9-equations-${String(i+1).padStart(2,'0')}`;
 equations.run(`enter(8,${JSON.stringify(id)})`);
 const task=equations.run('t()');equationStories.add(task.story.join(' '));
 assert.equal(task.answer,equationAnswers[i]);assert.equal(equations.run('cityTask(8).topicId'),'equations');
 assert.equal(task.valid.length,2);assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){equations.run(`route=0;stage=${stage};render()`)}
 equations.run('route=1;stage=3;render()');
 equations.run('complete()');assert.equal(equations.run('cityProgress[8].length'),i+1);assert.equal(equations.run('done(8).length'),0);
}
assert.equal(equationStories.size,10);
assert.equal(equations.run("cityProgress[8].every(id=>id.startsWith('g9-equations-'))"),true);
equations.run("selTopic[8]='equations';selFilter[8]='done'");assert.equal(equations.run('cityVisibleTasks(8).length'),10);
equations.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-equations-01');say(window.spokenStory(t()))");assert.ok(equations.get('help').innerHTML.includes('hlas svého zařízení'));
const equationSeparated=setup();equationSeparated.run("enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(equationSeparated.run('cityProgress[8].length'),3);
equationSeparated.run("selTopic[8]='equations';resetCityTopic(8)");assert.equal(equationSeparated.run("cityProgress[8].includes('g9-equations-01')"),false);assert.equal(equationSeparated.run("cityProgress[8].includes('g9-percentages-01')"),true);assert.equal(equationSeparated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(equationSeparated.run('done(8).join(",")'),'0');
const manifest=setup();manifest.run(fs.readFileSync('voice-manifest.js','utf8'));assert.equal(manifest.run('Object.keys(window.voiceManifest).length'),90);assert.equal(fs.readdirSync('audio').filter(name=>name.endsWith('.mp3')).length,90);
console.log('PASS: 10 distinct equation tasks, two valid routes, all stages, correct answers, device voice, isolated progress/reset, and all 90 Marin recordings preserved.');

const systems=setup(),systemStories=new Set(),systemAnswers=[10,7,8,9,5,5,74,4,13,6];
for(let i=0;i<10;i++){
 const id=`g9-systems-${String(i+1).padStart(2,'0')}`;
 systems.run(`enter(8,${JSON.stringify(id)})`);
 const task=systems.run('t()');systemStories.add(task.story.join(' '));
 assert.equal(task.answer,systemAnswers[i]);assert.equal(systems.run('cityTask(8).topicId'),'systems');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){systems.run(`route=0;stage=${stage};render()`)}
 systems.run('route=1;stage=3;render()');systems.run('route=2;stage=3;render()');
 systems.run('complete()');assert.equal(systems.run('cityProgress[8].length'),i+1);assert.equal(systems.run('done(8).length'),0);
}
assert.equal(systemStories.size,10);assert.equal(systems.run("cityProgress[8].every(id=>id.startsWith('g9-systems-'))"),true);
systems.run("selTopic[8]='systems';selFilter[8]='done'");assert.equal(systems.run('cityVisibleTasks(8).length'),10);
systems.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-systems-01');say(window.spokenStory(t()))");assert.ok(systems.get('help').innerHTML.includes('hlas svého zařízení'));
const systemSeparated=setup();systemSeparated.run("enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(systemSeparated.run('cityProgress[8].length'),4);
systemSeparated.run("selTopic[8]='systems';resetCityTopic(8)");assert.equal(systemSeparated.run("cityProgress[8].includes('g9-systems-01')"),false);assert.equal(systemSeparated.run("cityProgress[8].includes('g9-equations-01')"),true);assert.equal(systemSeparated.run("cityProgress[8].includes('g9-percentages-01')"),true);assert.equal(systemSeparated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(systemSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct system-of-equations tasks, two valid routes plus misconception route, all stages, correct answers, device voice, and isolated progress/reset.');

const ratios=setup(),ratioStories=new Set(),ratioAnswers=[320,750,1.8,300,9,20,15,30,12,4];
for(let i=0;i<10;i++){
 const id=`g9-ratio-${String(i+1).padStart(2,'0')}`;
 ratios.run(`enter(8,${JSON.stringify(id)})`);
 const task=ratios.run('t()');ratioStories.add(task.story.join(' '));
 assert.equal(task.answer,ratioAnswers[i]);assert.equal(ratios.run('cityTask(8).topicId'),'ratio');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){ratios.run(`route=0;stage=${stage};render()`)}
 ratios.run('route=1;stage=3;render()');ratios.run('route=2;stage=3;render()');
 ratios.run('complete()');assert.equal(ratios.run('cityProgress[8].length'),i+1);assert.equal(ratios.run('done(8).length'),0);
}
assert.equal(ratioStories.size,10);assert.equal(ratios.run("cityProgress[8].every(id=>id.startsWith('g9-ratio-'))"),true);
ratios.run("selTopic[8]='ratio';selFilter[8]='done'");assert.equal(ratios.run('cityVisibleTasks(8).length'),10);
ratios.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-ratio-01');say(window.spokenStory(t()))");assert.ok(ratios.get('help').innerHTML.includes('hlas svého zařízení'));
const ratioSeparated=setup();ratioSeparated.run("enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(ratioSeparated.run('cityProgress[8].length'),5);
ratioSeparated.run("selTopic[8]='ratio';resetCityTopic(8)");assert.equal(ratioSeparated.run("cityProgress[8].includes('g9-ratio-01')"),false);assert.equal(ratioSeparated.run("cityProgress[8].includes('g9-systems-01')"),true);assert.equal(ratioSeparated.run("cityProgress[8].includes('g9-equations-01')"),true);assert.equal(ratioSeparated.run("cityProgress[8].includes('g9-percentages-01')"),true);assert.equal(ratioSeparated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(ratioSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct ratio/proportion tasks, two valid routes plus misconception route, all stages, decimal answer, device voice, and isolated progress/reset.');

const functions=setup(),functionStories=new Set(),functionAnswers=[14,23,3,2,260,30,20,16,63,31];
for(let i=0;i<10;i++){
 const id=`g9-functions-${String(i+1).padStart(2,'0')}`;
 functions.run(`enter(8,${JSON.stringify(id)})`);
 const task=functions.run('t()');functionStories.add(task.story.join(' '));
 assert.equal(task.answer,functionAnswers[i]);assert.equal(functions.run('cityTask(8).topicId'),'functions');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){functions.run(`route=0;stage=${stage};render()`)}
 functions.run('route=1;stage=3;render()');functions.run('route=2;stage=3;render()');
 functions.run('complete()');assert.equal(functions.run('cityProgress[8].length'),i+1);assert.equal(functions.run('done(8).length'),0);
}
assert.equal(functionStories.size,10);assert.equal(functions.run("cityProgress[8].every(id=>id.startsWith('g9-functions-'))"),true);
functions.run("selTopic[8]='functions';selFilter[8]='done'");assert.equal(functions.run('cityVisibleTasks(8).length'),10);
functions.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-functions-01');say(window.spokenStory(t()))");assert.ok(functions.get('help').innerHTML.includes('hlas svého zařízení'));
const functionSeparated=setup();functionSeparated.run("enter(8,'g9-functions-01');complete();enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(functionSeparated.run('cityProgress[8].length'),6);
functionSeparated.run("selTopic[8]='functions';resetCityTopic(8)");assert.equal(functionSeparated.run("cityProgress[8].includes('g9-functions-01')"),false);assert.equal(functionSeparated.run("cityProgress[8].includes('g9-ratio-01')"),true);assert.equal(functionSeparated.run("cityProgress[8].includes('g9-systems-01')"),true);assert.equal(functionSeparated.run("cityProgress[8].includes('g9-equations-01')"),true);assert.equal(functionSeparated.run("cityProgress[8].includes('g9-percentages-01')"),true);assert.equal(functionSeparated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(functionSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct functions/graphs tasks, two valid routes plus misconception route, all stages, correct answers, device voice, and isolated progress/reset.');

const geometry=setup(),geometryStories=new Set(),geometryAnswers=[51,42,10,31.4,113.04,55,15,15,96,10];
for(let i=0;i<10;i++){
 const id=`g9-geometry-${String(i+1).padStart(2,'0')}`;
 geometry.run(`enter(8,${JSON.stringify(id)})`);
 const task=geometry.run('t()');geometryStories.add(task.story.join(' '));
 assert.equal(task.answer,geometryAnswers[i]);assert.equal(geometry.run('cityTask(8).topicId'),'geometry');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){geometry.run(`route=0;stage=${stage};render()`)}
 geometry.run('route=1;stage=3;render()');geometry.run('route=2;stage=3;render()');
 geometry.run('complete()');assert.equal(geometry.run('cityProgress[8].length'),i+1);assert.equal(geometry.run('done(8).length'),0);
}
assert.equal(geometryStories.size,10);assert.equal(geometry.run("cityProgress[8].every(id=>id.startsWith('g9-geometry-'))"),true);
geometry.run("selTopic[8]='geometry';selFilter[8]='done'");assert.equal(geometry.run('cityVisibleTasks(8).length'),10);
geometry.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-geometry-01');say(window.spokenStory(t()))");assert.ok(geometry.get('help').innerHTML.includes('hlas svého zařízení'));
const geometrySeparated=setup();geometrySeparated.run("enter(8,'g9-geometry-01');complete();enter(8,'g9-functions-01');complete();enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(geometrySeparated.run('cityProgress[8].length'),7);
geometrySeparated.run("selTopic[8]='geometry';resetCityTopic(8)");assert.equal(geometrySeparated.run("cityProgress[8].includes('g9-geometry-01')"),false);assert.equal(geometrySeparated.run("cityProgress[8].includes('g9-functions-01')"),true);assert.equal(geometrySeparated.run("cityProgress[8].includes('g9-ratio-01')"),true);assert.equal(geometrySeparated.run("cityProgress[8].includes('g9-systems-01')"),true);assert.equal(geometrySeparated.run("cityProgress[8].includes('g9-equations-01')"),true);assert.equal(geometrySeparated.run("cityProgress[8].includes('g9-percentages-01')"),true);assert.equal(geometrySeparated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(geometrySeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct geometry tasks, two valid routes plus misconception route, all stages, decimal answers, device voice, and isolated progress/reset.');

const volumes=setup(),volumeStories=new Set(),volumeAnswers=[64,112,2.75,282.6,120,20,324,9,420,60];
for(let i=0;i<10;i++){
 const id=`g9-volume-${String(i+1).padStart(2,'0')}`;
 volumes.run(`enter(8,${JSON.stringify(id)})`);
 const task=volumes.run('t()');volumeStories.add(task.story.join(' '));
 assert.equal(task.answer,volumeAnswers[i]);assert.equal(volumes.run('cityTask(8).topicId'),'volume');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){volumes.run(`route=0;stage=${stage};render()`)}
 volumes.run('route=1;stage=3;render()');volumes.run('route=2;stage=3;render()');
 volumes.run('complete()');assert.equal(volumes.run('cityProgress[8].length'),i+1);assert.equal(volumes.run('done(8).length'),0);
}
assert.equal(volumeStories.size,10);assert.equal(volumes.run("cityProgress[8].every(id=>id.startsWith('g9-volume-'))"),true);
volumes.run("selTopic[8]='volume';selFilter[8]='done'");assert.equal(volumes.run('cityVisibleTasks(8).length'),10);
volumes.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-volume-01');say(window.spokenStory(t()))");assert.ok(volumes.get('help').innerHTML.includes('hlas svého zařízení'));
const volumeSeparated=setup();volumeSeparated.run("enter(8,'g9-volume-01');complete();enter(8,'g9-geometry-01');complete();enter(8,'g9-functions-01');complete();enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(volumeSeparated.run('cityProgress[8].length'),8);
volumeSeparated.run("selTopic[8]='volume';resetCityTopic(8)");assert.equal(volumeSeparated.run("cityProgress[8].includes('g9-volume-01')"),false);assert.equal(volumeSeparated.run("cityProgress[8].includes('g9-geometry-01')"),true);assert.equal(volumeSeparated.run("cityProgress[8].includes('g9-functions-01')"),true);assert.equal(volumeSeparated.run("cityProgress[8].includes('g9-ratio-01')"),true);assert.equal(volumeSeparated.run("cityProgress[8].includes('g9-systems-01')"),true);assert.equal(volumeSeparated.run("cityProgress[8].includes('g9-equations-01')"),true);assert.equal(volumeSeparated.run("cityProgress[8].includes('g9-percentages-01')"),true);assert.equal(volumeSeparated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(volumeSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct volume/conversion tasks, two valid routes plus misconception route, all stages, decimal answers, device voice, and isolated progress/reset.');

const dataTasks=setup(),dataStories=new Set(),dataAnswers=[8,12,15,4,8,30,50,30,2.4,6];
for(let i=0;i<10;i++){
 const id=`g9-data-${String(i+1).padStart(2,'0')}`;
 dataTasks.run(`enter(8,${JSON.stringify(id)})`);
 const task=dataTasks.run('t()');dataStories.add(task.story.join(' '));
 assert.equal(task.answer,dataAnswers[i]);assert.equal(dataTasks.run('cityTask(8).topicId'),'data');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){dataTasks.run(`route=0;stage=${stage};render()`)}
 dataTasks.run('route=1;stage=3;render()');dataTasks.run('route=2;stage=3;render()');
 dataTasks.run('complete()');assert.equal(dataTasks.run('cityProgress[8].length'),i+1);assert.equal(dataTasks.run('done(8).length'),0);
}
assert.equal(dataStories.size,10);assert.equal(dataTasks.run("cityProgress[8].every(id=>id.startsWith('g9-data-'))"),true);
dataTasks.run("selTopic[8]='data';selFilter[8]='done'");assert.equal(dataTasks.run('cityVisibleTasks(8).length'),10);
dataTasks.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-data-01');say(window.spokenStory(t()))");assert.ok(dataTasks.get('help').innerHTML.includes('hlas svého zařízení'));
const dataSeparated=setup();dataSeparated.run("enter(8,'g9-data-01');complete();enter(8,'g9-volume-01');complete();enter(8,'g9-geometry-01');complete();enter(8,'g9-functions-01');complete();enter(8,'g9-ratio-01');complete();enter(8,'g9-systems-01');complete();enter(8,'g9-equations-01');complete();enter(8,'g9-percentages-01');complete();enter(8,0);complete()");assert.equal(dataSeparated.run('cityProgress[8].length'),9);
dataSeparated.run("selTopic[8]='data';resetCityTopic(8)");assert.equal(dataSeparated.run("cityProgress[8].includes('g9-data-01')"),false);assert.equal(dataSeparated.run("cityProgress[8].includes('g9-volume-01')"),true);assert.equal(dataSeparated.run("cityProgress[8].includes('g9-geometry-01')"),true);assert.equal(dataSeparated.run("cityProgress[8].includes('g9-functions-01')"),true);assert.equal(dataSeparated.run("cityProgress[8].includes('g9-ratio-01')"),true);assert.equal(dataSeparated.run("cityProgress[8].includes('g9-systems-01')"),true);assert.equal(dataSeparated.run("cityProgress[8].includes('g9-equations-01')"),true);assert.equal(dataSeparated.run("cityProgress[8].includes('g9-percentages-01')"),true);assert.equal(dataSeparated.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(dataSeparated.run('done(8).join(",")'),'0');
console.log('PASS: 10 distinct data/probability tasks, two valid routes plus misconception route, all stages, decimal answer, device voice, and isolated progress/reset.');

const multistep=setup(),multistepStories=new Set(),multistepAnswers=[2057,889.2,16200,360,24,4880,60,16,19,20680];
for(let i=0;i<10;i++){
 const id=`g9-multistep-${String(i+1).padStart(2,'0')}`;
 multistep.run(`enter(8,${JSON.stringify(id)})`);
 const task=multistep.run('t()');multistepStories.add(task.story.join(' '));
 assert.equal(task.answer,multistepAnswers[i]);assert.equal(multistep.run('cityTask(8).topicId'),'multistep');
 assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
 for(let stage=0;stage<6;stage++){multistep.run(`route=0;stage=${stage};render()`)}
 multistep.run('route=1;stage=3;render()');multistep.run('route=2;stage=3;render()');
 multistep.run('complete()');assert.equal(multistep.run('cityProgress[8].length'),i+1);assert.equal(multistep.run('done(8).length'),0);
}
assert.equal(multistepStories.size,10);assert.equal(multistep.run("cityProgress[8].every(id=>id.startsWith('g9-multistep-'))"),true);
multistep.run("selTopic[8]='multistep';selFilter[8]='done'");assert.equal(multistep.run('cityVisibleTasks(8).length'),10);
multistep.run("window.voiceManifest={'8-0':{text:'jiný text',src:'audio/old.mp3'}};enter(8,'g9-multistep-01');say(window.spokenStory(t()))");assert.ok(multistep.get('help').innerHTML.includes('hlas svého zařízení'));
const allTopics=setup();for(const topic of ['percentages','equations','systems','ratio','functions','finance','geometry','volume','data','multistep'])allTopics.run(`enter(8,'g9-${topic}-01');complete()`);assert.equal(allTopics.run('cityProgress[8].length'),10);assert.equal(allTopics.run('done(8).join(",")'),'0');
allTopics.run("selTopic[8]='multistep';resetCityTopic(8)");assert.equal(allTopics.run("cityProgress[8].includes('g9-multistep-01')"),false);assert.equal(allTopics.run('cityProgress[8].length'),9);assert.equal(allTopics.run("cityProgress[8].includes('g9-data-01')"),true);assert.equal(allTopics.run("cityProgress[8].includes('g9-finance-01')"),true);assert.equal(allTopics.run('done(8).join(",")'),'0');
assert.equal(allTopics.run('window.grade9Model.tasks.every(t=>t.available&&t.content||t.topicId==="finance")'),true);
console.log('PASS: 10 distinct multistep tasks, all 100 grade-9 tasks available, two valid routes plus misconception route, all stages, device voice, and isolated progress/reset.');

const city=setup();
assert.deepEqual(Array.from(city.run('window.grade9World.order')),['percentages','equations','systems','ratio','functions','finance','geometry','volume','data','multistep']);
assert.equal(city.run('Object.values(window.grade9World.districts).every(d=>d.rewards.length===10)'),true);
assert.equal(city.run("window.grade9World.topicCount('geometry',cityProgress[8])"),0);
city.run("enter(8,'g9-geometry-04');complete()");
assert.equal(city.run("window.grade9World.topicCount('geometry',cityProgress[8])"),1);
assert.ok(city.run("window.grade9World.render(cityProgress[8],'geometry')").includes('progress-1 selected'));
assert.ok(city.run("window.grade9World.mini('geometry',cityProgress[8],4)").includes('Klenutý most'));
city.run("complete()");assert.equal(city.run('cityProgress[8].length'),1);
for(let i=1;i<=10;i++)city.run(`enter(8,'g9-geometry-${String(i).padStart(2,'0')}');complete()`);
assert.equal(city.run("window.grade9World.topicCount('geometry',cityProgress[8])"),10);
assert.ok(city.run("window.grade9World.render(cityProgress[8],'geometry')").includes('complete'));
city.run("enter(8,'g9-percentages-01');complete();selTopic[8]='geometry';resetCityTopic(8)");
assert.equal(city.run("window.grade9World.topicCount('geometry',cityProgress[8])"),0);
assert.equal(city.run("window.grade9World.topicCount('percentages',cityProgress[8])"),1);
const full=setup();for(const topic of full.run('window.grade9World.order'))for(let i=1;i<=10;i++)full.run(`enter(8,'g9-${topic}-${String(i).padStart(2,'0')}');complete()`);
assert.equal(full.run('cityProgress[8].length'),100);assert.ok(full.run('window.grade9World.render(cityProgress[8])').includes('world-complete'));assert.ok(full.run('window.grade9World.render(cityProgress[8])').includes('Město žije'));
console.log('PASS: 100 unique task rewards map to ten districts; repeat is idempotent; topic reset is isolated; district and whole-world finales activate.');

const g8=setup();
assert.equal(g8.run('window.grade8Model.tasks.length'),100);
assert.equal(g8.run('window.grade8Model.topics.length'),10);
assert.equal(g8.run('window.grade8Model.tasks.filter(t=>t.available).length'),100);
assert.equal(g8.run('new Set(window.grade8Model.tasks.map(t=>t.id)).size'),100);
assert.equal(g8.run('window.grade8Model.tasks.every(t=>t.grade===8&&t.topicId&&t.topicOrder&&t.difficulty&&t.rewardId&&t.content)'),true);
g8.run('enter(7,7)');assert.equal(g8.run('mission'),0);assert.ok(g8.get('app').innerHTML.includes('Herní svět a úlohy'));
g8.get('map-back').onclick();assert.ok(g8.get('app').innerHTML.includes('Konstrukční město'));
console.log('PASS: grade 8 city model shape and overview navigation.');

const g8topicsOrder=['mocniny','vyrazy','rovnice','nerovnice','pythagoras','kruh','hranoly','statistika','procenta','slozene'];
const g8Answers={mocniny:[81,8,125,128,81,81,400000,7,9,5],vyrazy:[24,14,54,40,81,16,64,132,13,28],rovnice:[5,90,30,15,180,32,10,12,6,9],nerovnice:[6,10,5,16,2,-4,8,25,5000,24],pythagoras:[13,15,7,29,25,12,30,41,26,20],kruh:[37.68,200.96,10,5,200.96,9.42,28.26,219.8,500,314],hranoly:[108,294,132,471,452.16,5,6,4000,10,3],statistika:[250,70,9,11,30,0.96,25,1000,10,20],procenta:[60,900,70,450,8800,1800,33920,3080,150,35000],slozene:[30,25000,8,3,15,408,19,104,7,1440]};
const g8topics=setup();let g8doneSoFar=0;
for(const topic of g8topicsOrder){
 const stories=new Set(),answers=g8Answers[topic];
 for(let i=0;i<10;i++){
  const id=`g8-${topic}-${String(i+1).padStart(2,'0')}`;
  g8topics.run(`enter(7,${JSON.stringify(id)})`);
  const task=g8topics.run('t()');stories.add(task.story.join(' '));
  assert.equal(task.answer,answers[i]);assert.equal(g8topics.run('cityTask(7).topicId'),topic);
  assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
  assert.ok(task.modelChoice&&task.practice);
  for(let stage=0;stage<6;stage++){g8topics.run(`route=0;stage=${stage};render()`)}
  g8topics.run('route=1;stage=3;render()');g8topics.run('route=2;stage=3;render()');
  g8topics.run('complete()');g8doneSoFar++;assert.equal(g8topics.run('cityProgress[7].length'),g8doneSoFar);assert.equal(g8topics.run('done(7).length'),0);
 }
 assert.equal(stories.size,10);
 g8topics.run(`selTopic[7]=${JSON.stringify(topic)};selFilter[7]='done'`);assert.equal(g8topics.run('cityVisibleTasks(7).length'),10);
}
assert.equal(g8topics.run('cityProgress[7].length'),100);
assert.ok(g8topics.run('window.grade8World.render(cityProgress[7])').includes('world-complete'));
assert.ok(g8topics.run('window.grade8World.render(cityProgress[7])').includes('Město je postavené'));
assert.equal(g8topics.run('done(8).length'),0);assert.equal(g8topics.run('cityProgress[8].length'),0);
console.log('PASS: all 100 grade-8 tasks: distinct stories, correct answers, two valid routes plus misconception, filters, and full-city completion; grade 9 and legacy progress unaffected.');

const g8reset=setup();
g8reset.run("enter(7,'g8-mocniny-01');complete();enter(7,'g8-vyrazy-01');complete()");
assert.equal(g8reset.run('cityProgress[7].length'),2);
g8reset.run("selTopic[7]='mocniny';resetCityTopic(7)");
assert.equal(g8reset.run("cityProgress[7].includes('g8-mocniny-01')"),false);
assert.equal(g8reset.run("cityProgress[7].includes('g8-vyrazy-01')"),true);
console.log('PASS: grade 8 topic-isolated reset.');

const g8voice=setup();
g8voice.run("enter(7,'g8-kruh-01');say(window.spokenStory(t()))");
assert.ok(g8voice.get('help').innerHTML.includes('hlas svého zařízení'));
console.log('PASS: grade 8 tasks fall back to device voice (no recorded narration yet).');

const g8world=setup();
assert.deepEqual(Array.from(g8world.run('window.grade8World.order')),g8topicsOrder);
assert.equal(g8world.run('Object.values(window.grade8World.districts).every(d=>d.rewards.length===10)'),true);
assert.equal(g8world.run("window.grade8World.topicCount('kruh',cityProgress[7])"),0);
g8world.run("enter(7,'g8-kruh-04');complete()");
assert.equal(g8world.run("window.grade8World.topicCount('kruh',cityProgress[7])"),1);
assert.ok(g8world.run("window.grade8World.render(cityProgress[7],'kruh')").includes('progress-1 selected'));
console.log('PASS: grade 8 city world districts, topicCount, and render selection.');

const g7=setup();
assert.equal(g7.run('window.grade7Model.tasks.length'),100);
assert.equal(g7.run('window.grade7Model.topics.length'),10);
assert.equal(g7.run('window.grade7Model.tasks.filter(t=>t.available).length'),100);
assert.equal(g7.run('new Set(window.grade7Model.tasks.map(t=>t.id)).size'),100);
assert.equal(g7.run('window.grade7Model.tasks.every(t=>t.grade===7&&t.topicId&&t.topicOrder&&t.difficulty&&t.rewardId&&t.content)'),true);
g7.run('enter(6,7)');assert.equal(g7.run('mission'),0);assert.ok(g7.get('app').innerHTML.includes('Herní svět a úlohy'));
g7.get('map-back').onclick();assert.ok(g7.get('app').innerHTML.includes('Souměrné město'));
console.log('PASS: grade 7 city model shape and overview navigation.');

const g7topicsOrder=['celaCisla','zlomky','pomer','umernost','procenta','trojuhelniky','ctyruhelniky','soumernost','desetinnaCisla','slozene'];
const g7Answers={celaCisla:[7,-250,-12,-4,225,1275,-39,42,4,1],zlomky:[0.625,0.7,0.6,0.5,6,2.25,21,100,3.75,0.4],pomer:[450,120,4,45,15,300,3,15,8400,3],umernost:[150,20,8,3,680,12,20,750,4,6],procenta:[3,135,300,48,680,540,40,58,15,100],trojuhelniky:[53,70,113,28,4,30,27,55,36,60],ctyruhelniky:[84,40,153,70,48,13,18,196,13,24],soumernost:[-7,4,-3,-1,4,3,2,10,24,-3],desetinnaCisla:[67.15,152.4,537,3.15,8.4,7.4,46,2500,0.47,104],slozene:[90,36,687.5,288,5,98,62.5,240,813.28,4]};
const g7topics=setup();let g7doneSoFar=0;
for(const topic of g7topicsOrder){
 const stories=new Set(),answers=g7Answers[topic];
 for(let i=0;i<10;i++){
  const id=`g7-${topic}-${String(i+1).padStart(2,'0')}`;
  g7topics.run(`enter(6,${JSON.stringify(id)})`);
  const task=g7topics.run('t()');stories.add(task.story.join(' '));
  assert.equal(task.answer,answers[i]);assert.equal(g7topics.run('cityTask(6).topicId'),topic);
  assert.equal(task.valid.join(','),'0,1');assert.equal(task.paths.length,3);assert.equal(task.explain.length,3);
  assert.ok(task.modelChoice&&task.practice);
  for(let stage=0;stage<6;stage++){g7topics.run(`route=0;stage=${stage};render()`)}
  g7topics.run('route=1;stage=3;render()');g7topics.run('route=2;stage=3;render()');
  g7topics.run('complete()');g7doneSoFar++;assert.equal(g7topics.run('cityProgress[6].length'),g7doneSoFar);assert.equal(g7topics.run('done(6).length'),0);
 }
 assert.equal(stories.size,10);
 g7topics.run(`selTopic[6]=${JSON.stringify(topic)};selFilter[6]='done'`);assert.equal(g7topics.run('cityVisibleTasks(6).length'),10);
}
assert.equal(g7topics.run('cityProgress[6].length'),100);
assert.ok(g7topics.run('window.grade7World.render(cityProgress[6])').includes('world-complete'));
assert.ok(g7topics.run('window.grade7World.render(cityProgress[6])').includes('Město je v rovnováze'));
assert.equal(g7topics.run('done(7).length'),0);assert.equal(g7topics.run('cityProgress[7].length'),0);
assert.equal(g7topics.run('done(8).length'),0);assert.equal(g7topics.run('cityProgress[8].length'),0);
console.log('PASS: all 100 grade-7 tasks: distinct stories, correct answers, two valid routes plus misconception, filters, and full-city completion; grades 8 and 9 unaffected.');

const g7reset=setup();
g7reset.run("enter(6,'g7-celaCisla-01');complete();enter(6,'g7-zlomky-01');complete()");
assert.equal(g7reset.run('cityProgress[6].length'),2);
g7reset.run("selTopic[6]='celaCisla';resetCityTopic(6)");
assert.equal(g7reset.run("cityProgress[6].includes('g7-celaCisla-01')"),false);
assert.equal(g7reset.run("cityProgress[6].includes('g7-zlomky-01')"),true);
console.log('PASS: grade 7 topic-isolated reset.');

const g7voice=setup();
g7voice.run("enter(6,'g7-trojuhelniky-01');say(window.spokenStory(t()))");
assert.ok(g7voice.get('help').innerHTML.includes('hlas svého zařízení'));
console.log('PASS: grade 7 tasks fall back to device voice (no recorded narration yet).');

const g7world=setup();
assert.deepEqual(Array.from(g7world.run('window.grade7World.order')),g7topicsOrder);
assert.equal(g7world.run('Object.values(window.grade7World.districts).every(d=>d.rewards.length===10)'),true);
assert.equal(g7world.run("window.grade7World.topicCount('trojuhelniky',cityProgress[6])"),0);
g7world.run("enter(6,'g7-trojuhelniky-04');complete()");
assert.equal(g7world.run("window.grade7World.topicCount('trojuhelniky',cityProgress[6])"),1);
assert.ok(g7world.run("window.grade7World.render(cityProgress[6],'trojuhelniky')").includes('progress-1 selected'));
console.log('PASS: grade 7 city world districts, topicCount, and render selection.');

const allGrades=setup();
allGrades.run("enter(6,'g7-celaCisla-01');complete();enter(7,'g8-mocniny-01');complete();enter(8,'g9-percentages-01');complete();enter(0,0);complete()");
assert.equal(allGrades.run('cityProgress[6].length'),1);
assert.equal(allGrades.run('cityProgress[7].length'),1);
assert.equal(allGrades.run('cityProgress[8].length'),1);
assert.equal(allGrades.run('done(0).length'),1);
assert.deepEqual(JSON.parse(allGrades.store.get('fajn-rozumim-grade7-v1')),['g7-celaCisla-01']);
assert.deepEqual(JSON.parse(allGrades.store.get('fajn-rozumim-grade8-v1')),['g8-mocniny-01']);
assert.deepEqual(JSON.parse(allGrades.store.get('fajn-rozumim-grade9-v1')),['g9-percentages-01']);
console.log('PASS: grades 6, 7, 8 (0-indexed) and grade 0 progress persist independently across storage keys.');
