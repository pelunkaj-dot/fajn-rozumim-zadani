'use strict';
// Explicit nominative/accusative forms for the integer quantities used by these missions.
// Not a general Czech case inflector: oblique constructions must be authored separately.
window.csNumber=function number(n,gender='m',acc=false){
 if(!Number.isInteger(n)||n<0||n>100000)throw Error('Unsupported narration quantity: '+n);
 const small=['nula','jeden','dva','tři','čtyři','pět','šest','sedm','osm','devět','deset','jedenáct','dvanáct','třináct','čtrnáct','patnáct','šestnáct','sedmnáct','osmnáct','devatenáct'];
 if(n===1)return gender==='f'?(acc?'jednu':'jedna'):gender==='n'?'jedno':'jeden';
 if(n===2)return gender==='f'||gender==='n'?'dvě':'dva';
 if(n<20)return small[n];
 if(n===21)return 'jednadvacet';
 if(n<100)return ['','','dvacet','třicet','čtyřicet','padesát','šedesát','sedmdesát','osmdesát','devadesát'][Math.floor(n/10)]+(n%10?' '+number(n%10,gender,acc):'');
 if(n<1000)return ['','sto','dvě stě','tři sta','čtyři sta','pět set','šest set','sedm set','osm set','devět set'][Math.floor(n/100)]+(n%100?' '+number(n%100,gender,acc):'');
 const k=Math.floor(n/1000);return (k===1?'tisíc':number(k)+' '+(k>=2&&k<=4?'tisíce':'tisíc'))+(n%1000?' '+number(n%1000,gender,acc):'');
};
window.csUnit=(n,one,few,many,gender='m',acc=false)=>window.csNumber(n,gender,acc)+' '+(n===1?one:n>=2&&n<=4?few:many);
window.spokenStory=function(task){
 const ratios={20000:'jedna ku dvaceti tisícům',25000:'jedna ku dvaceti pěti tisícům',50000:'jedna ku padesáti tisícům',100000:'jedna ku stu tisícům'};
 let text=task.story.join(' ')+' '+task.question;
 text=text.replace(/1\s*:\s*(20000|25000|50000|100000)/g,(_,n)=>ratios[n]);
 text=text.replace(/(\d+)\s*Kč/g,(_,n)=>window.csUnit(+n,'korunu','koruny','korun','f',true));
 text=text.replace(/(\d+)\s*kWh/g,(_,n)=>window.csUnit(+n,'kilowatthodinu','kilowatthodiny','kilowatthodin','f',true));
 text=text.replace(/(\d+)\s*cm/g,(_,n)=>window.csUnit(+n,'centimetr','centimetry','centimetrů'));
 return text.replace(/\d+/g,n=>window.csNumber(+n));
};
