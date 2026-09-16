'use strict';
(function(){
 const topics=[
  ['percentages','Procenta'],
  ['equations','Rovnice'],
  ['systems','Soustavy rovnic'],
  ['ratio','Poměr a úměrnost'],
  ['functions','Funkce a grafy'],
  ['finance','Finance'],
  ['geometry','Geometrie'],
  ['volume','Objem a převody'],
  ['data','Data a pravděpodobnost'],
  ['multistep','Vícekrokové úlohy']
 ].map(([id,name])=>({id,name,rewardId:`council-${id}`}));
 const availableTopic='finance';
 const tasks=topics.flatMap(topic=>Array.from({length:10},(_,index)=>{
  const order=index+1,available=topic.id===availableTopic;
  return {
   id:`g9-${topic.id}-${String(order).padStart(2,'0')}`,
   grade:9,
   topicId:topic.id,
   topic:topic.name,
   topicOrder:order,
   difficulty:order<=3?'základní':order<=7?'střední':'vyšší',
   rewardId:topic.rewardId,
   available,
   missionIndex:available?index:null,
   title:available?`Tarify a rovnice ${order}`:`Úloha ${order}`
  };
 }));
 window.grade9Model={topics,tasks};
})();
