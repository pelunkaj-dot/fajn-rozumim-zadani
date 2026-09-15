const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();function el(){return {innerHTML:'',textContent:'',className:'',value:'',dataset:{},children:[],append(x){this.children.push(x)},setAttribute(){},querySelectorAll(){return []}}}
const document={getElementById(id){if(!elements.has(id))elements.set(id,el());return elements.get(id)},createElement:el};
const storage=new Map();const ctx=vm.createContext({document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{},console,setTimeout});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(run('tasks.length'),9);assert.equal(run('worlds.length'),9);
for(let i=0;i<9;i++){run(`enter(${i})`);assert.equal(run('w'),i);assert.equal(run('completed.length'),0);assert.ok(run(`tasks[${i}].valid.length>=2`));}
assert.equal(run('tasks[4].answer'),65000/(100*40));
run('enter(8);phase=1;render()');
let choices=elements.get('work').children.at(-1);choices.children[2].onclick();assert.equal(run('phase'),2);
choices=elements.get('work').children.at(-1);choices.children[1].onclick();assert.equal(run('phase'),1);
run('phase=3;render()');elements.get('work').children.at(-1).children[1].onclick();assert.equal(run('phase'),4);assert.equal(run('bonus'),false);
elements.get('work').children.at(-1).children[0].onclick();assert.equal(run('phase'),5);assert.equal(run('completed.join()'),'8');
run('enter(0)');assert.equal(run('completed.join()'),'8');assert.equal(JSON.parse(storage.get('fajn-rozumim-v1')).completed[0],8);
console.log('PASS: 9 direct entries, independent progress, two paths, dead-end return, optional calculation, aquarium volume, persistence.');
