const assert=require('node:assert/strict'),C=require('./dist/world-core.js'),W=require('./dist/workers.js');
function base(){let s=C.newGame();s.nodes=[];s.cookedMeat=9;s.buildings=[{id:'h',type:'house',x:10,y:13,end:0,hp:150,maxHp:240,burningUntil:200},{id:'well',type:'well',x:8,y:15,end:0}];s.explored=[];for(let y=0;y<C.H;y++)for(let x=0;x<C.W;x++)s.explored.push(x+','+y);let w=W.hire(s).worker;W.assign(s,w.id,'wood');return {s,w}}
function advance(s,n){let events=[];for(let i=0;i<n*10;i++){s.time+=.1;events.push(...W.tick(s,.1))}return events}
let {s,w}=base();let hp=s.buildings[0].hp;advance(s,1);assert(s.buildings[0].burningUntil>0);let events=advance(s,40);assert.equal(s.buildings[0].burningUntil,0);assert.equal(s.buildings[0].hp,hp);assert.equal(w.role,'wood');assert(events.some(e=>e.message&&e.kind==='splash'));assert(w.splash);
({s,w}=base());s.buildings.pop();advance(s,20);assert(s.buildings[0].burningUntil>0);assert(!w.fireJob);s.claim={x:8,y:11,w:17,h:9};events=advance(s,80);assert.equal(s.buildings[0].burningUntil,0);assert(events.some(e=>e.message));
({s,w}=base());s.buildings[0].x=4;advance(s,20);assert(s.buildings[0].burningUntil>0);
({s,w}=base());advance(s,3);s=JSON.parse(JSON.stringify(s));advance(s,40);assert.equal(s.buildings[0].burningUntil,0);
({s,w}=base());w.energy=2;advance(s,2);assert.equal(w.need,'sleep');assert(s.buildings[0].burningUntil>0);
console.log('PASS firefighting: fetch then extinguish, well and owned river, no water, territory, save/load, needs and original job preserved, splash, no free repairs.');
