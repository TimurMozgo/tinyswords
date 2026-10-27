const assert=require('node:assert/strict'),C=require('./dist/world-core.js'),W=require('./dist/workers.js');
function fixture(){let s=C.newGame();s.nodes=[];s.workers=[];s.cookedMeat=12;s.buildings=[{id:'home',type:'house',x:10,y:13,end:0}];s.explored=[];for(let y=0;y<C.H;y++)for(let x=0;x<C.W;x++)s.explored.push(x+','+y);return s}
function advance(s,seconds){for(let i=0;i<seconds*10;i++){s.time+=.1;W.tick(s,.1);C.finishBuildings(s)}}
let s=fixture();assert.equal(W.capacity(s),2);let w=W.hire(s).worker;assert(w);assert.equal(s.cookedMeat,9);W.hire(s);assert(W.hire(s).error);assert.equal(s.cookedMeat,6);assert.equal(C.demolish(s,'home'),false);
s=fixture();s.cookedMeat=0;s.meat=100;assert(W.hire(s).error);assert.equal(s.meat,100);
s=fixture();w=W.hire(s).worker;s.nodes=[{id:'tree',kind:'tree',x:8,y:12,hp:3}];W.assign(s,w.id,'wood');advance(s,30);assert.equal(s.wood,15);assert.equal(s.nodes[0].hp,0);assert.equal(s.energy,100);assert.equal(s.stats.trees,1);
s=fixture();w=W.hire(s).worker;s.nodes=[{id:'rock',kind:'rock',x:8,y:12,hp:3}];W.assign(s,w.id,'stone');advance(s,30);assert.equal(s.stone,9);assert.equal(s.nodes[0].hp,0);
s=fixture();w=W.hire(s).worker;s.nodes=[{id:'tree',kind:'tree',x:2,y:2,hp:3}];W.assign(s,w.id,'wood');advance(s,60);assert.equal(s.wood,0);
s=fixture();w=W.hire(s).worker;s.nodes=[{id:'tree',kind:'tree',x:8,y:12,hp:3}];s.explored=[];W.assign(s,w.id,'wood');advance(s,30);assert.equal(s.wood,0);
s=fixture();w=W.hire(s).worker;s.nodes=[{id:'tree',kind:'tree',x:8,y:12,hp:3}];W.assign(s,w.id,'wood');advance(s,2);W.assign(s,w.id,'idle');advance(s,30);assert.equal(s.wood,0);assert.equal(w.target,null);
s=fixture();w=W.hire(s).worker;s.buildings.push({id:'site',type:'house',x:12,y:15,start:0,end:60});W.assign(s,w.id,'build');advance(s,45);assert.equal(s.buildings.find(b=>b.id==='site').end,0);
s=fixture();w=W.hire(s).worker;s.nodes=[{id:'tree',kind:'tree',x:8,y:12,hp:3}];W.assign(s,w.id,'wood');advance(s,5);s=JSON.parse(JSON.stringify(s));advance(s,25);assert.equal(s.wood,15);assert.equal(s.workers[0].role,'wood');
s=fixture();w=W.hire(s).worker;s.nodes=[{id:'tree',kind:'tree',x:8,y:12,hp:3}];for(let [i,x,y] of [[0,7,11],[1,8,11],[2,9,11],[3,7,12],[4,9,12],[5,7,13],[6,8,13],[7,9,13]])s.buildings.push({id:'f'+i,type:'fence',x,y,end:0});W.assign(s,w.id,'wood');advance(s,30);assert.equal(s.wood,0);assert.equal(w.status,'Нет доступного ресурса');
console.log('PASS workers: housing, cooked-food cost, harvesting, exploration limits and work inside territory, pause, builder boost, save/load, inaccessible targets');

s=fixture();w=W.hire(s).worker;s.nodes=[{id:'old-outside',kind:'tree',x:7,y:12,hp:3}];W.assign(s,w.id,'wood');w.target='old-outside';w.work=2.99;w.x=8.5;w.y=12.5;advance(s,1);assert.equal(s.wood,0);assert.equal(w.target,null);
s.claim={x:6,y:11,w:8,h:7};advance(s,30);assert.equal(s.wood,15);
s=fixture();w=W.hire(s).worker;s.camps=[{id:'captured',x:8,y:30,defeated:true}];s.nodes=[{id:'captured-tree',kind:'tree',x:8,y:30,hp:3}];w.x=8.5;w.y=29.5;W.assign(s,w.id,'wood');advance(s,20);assert.equal(s.wood,15);
console.log('PASS territory jobs: old outside assignment cancelled, expansion resumes harvesting, conquered territory allowed.');
