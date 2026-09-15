const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function setup(initial={}){
 const nodes=new Map(),store=new Map(Object.entries(initial));
 const node=()=>({innerHTML:'',textContent:'',children:[],style:{},value:'',classList:{toggle(){}},append(b){this.children.push(b)},setAttribute(){},querySelectorAll(){return []},querySelector(){return node()}});
 const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 const document={getElementById:get,createElement:node,querySelector:()=>node()};
 const ctx=vm.createContext({document,window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout,console});
 vm.runInContext(fs.readFileSync('tasks.js','utf8'),ctx);ctx.tasks=ctx.window.tasks;
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
assert.equal(y.run('birdCount(1)'),'1 sýkorka');assert.equal(y.run('birdCount(5)'),'5 sýkorek');
for(const f of ['index.html','app.js','style.css','tasks.js','worlds.webp','sprites.webp','objects.webp'])assert.ok(fs.statSync(''+f).size>0);
console.log('PASS: all 9 worlds and stages render; bird model gate; optional calculation; 10 unique missions; no duplicate reward; dead end and return; wrong/correct result; legacy progress migration; units and Czech number forms; assets present. DOM logic test, not browser layout test.');
