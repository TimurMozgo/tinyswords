const assert=require('node:assert/strict'),C=require('./dist/world-core.js'),W=require('./dist/workers.js');
function base(){let s=C.newGame();s.nodes=[];s.workers=[];s.cookedMeat=10;s.buildings=[{id:'home',type:'house',x:10,y:13,end:0}];s.explored=[];for(let y=0;y<C.H;y++)for(let x=0;x<C.W;x++)s.explored.push(x+','+y);let w=W.hire(s).worker;return {s,w}}
function advance(s,t){for(let i=0;i<t*10;i++){s.time+=.1;W.tick(s,.1);C.finishBuildings(s)}}
let {s,w}=base();s.nodes=[{id:'outside',kind:'tree',x:7,y:12,hp:3}];W.assign(s,w.id,'wood');advance(s,30);assert.equal(s.wood,0);assert(!C.owned(s,7,12));
({s,w}=base());s.nodes=[{id:'tree',kind:'tree',x:8,y:12,hp:3}];W.assign(s,w.id,'wood');w.energy=3;advance(s,10);assert.equal(w.need,'sleep');assert.equal(w.status,'Спит');assert.equal(s.wood,0);let e=w.energy;advance(s,70);assert(w.energy>e);assert.equal(w.need,null);advance(s,20);assert.equal(s.wood,15);
({s,w}=base());w.hunger=10;let cooked=s.cookedMeat;advance(s,12);assert(w.hunger>60);assert.equal(s.cookedMeat,cooked-1);assert.equal(w.need,null);
({s,w}=base());w.hunger=10;s.cookedMeat=0;s.meat=10;s.fish=10;advance(s,10);assert.equal(w.status,'Ждёт готовую еду');assert.equal(s.meat,10);assert.equal(s.fish,10);s.cookedFish=1;advance(s,12);assert.equal(s.cookedFish,0);assert(w.hunger>60);
({s,w}=base());w.thirst=10;s.explored=[];advance(s,10);assert.equal(w.status,'Нет доступной воды');s.buildings.push({id:'well',type:'well',x:8,y:14,end:0});advance(s,15);assert(w.thirst>90);assert.equal(w.need,null);
({s,w}=base());w.thirst=10;advance(s,45);assert(w.thirst>90);assert.equal(w.need,null);
({s,w}=base());s.nodes=[{id:'tree',kind:'tree',x:8,y:12,hp:3}];w.x=8.5;w.y=11.5;W.assign(s,w.id,'wood');advance(s,2.9);assert.equal(s.wood,0);advance(s,.2);assert.equal(s.wood,5);advance(s,6.1);assert.equal(s.wood,15);
({s,w}=base());s.nodes=[{id:'tree',kind:'tree',x:8,y:12,hp:3}];s.axe=2;w.x=8.5;w.y=11.5;W.assign(s,w.id,'wood');advance(s,5.3);assert.equal(s.wood,15);
({s,w}=base());w.energy=1;advance(s,4);s=JSON.parse(JSON.stringify(s));W.rest(s,300);assert.equal(s.workers[0].energy,100);assert.equal(s.workers[0].need,null);
s=C.newGame();s.fish=2;s.wood=2;s.energy=30;s.buildings=[{id:'fire',type:'fire',x:10,y:14,end:0}];assert(C.consumeFood(s).error);assert.equal(C.cook(s,'fire','fish').amount,2);assert.equal(s.fish,0);s.time=39;assert.deepEqual(C.finishCooking(s),[]);s.time=40;assert.deepEqual(C.finishCooking(s),[2]);assert.equal(s.cookedFish,2);assert.equal(C.consumeFood(s).kind,'cookedFish');assert.equal(s.energy,60);assert.equal(s.cookedFish,1);
s=C.newGame();s.fish=2;s.wood=2;s.buildings=[{id:'fire',type:'fire',x:10,y:14,end:0}];C.cook(s,'fire','fish');C.demolish(s,'fire');assert.equal(s.fish,2);assert.equal(s.meat,0);
console.log('PASS: territory restriction, equal chop speed, upgraded axe, fatigue/sleep/resume, food/raw refusal, river/well drinking, offline rest, fish cooking/refund');
