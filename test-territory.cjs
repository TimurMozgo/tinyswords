const assert=require('node:assert/strict'),C=require('./dist/world-core.js');require('./dist/economy.js');const M=require('./dist/military.js'),B=require('./dist/combat.js');
let s=C.newGame();s.nodes=[];s.sheep=[];s.wood=1000;s.stone=1000;s.explored=[];s.buildings=[{id:'home',type:'house',x:9,y:12,end:0}];let home={...s.claim},camp=s.camp;
assert(!C.owned(s,camp.x,camp.y));assert.equal(C.territories(s).length,1);
// Trigger the normal victory path, not a separate manual land purchase.
camp.engaged=true;camp.enemies.forEach(e=>e.hp=0);let events=M.tick(s,.1);assert(events.some(e=>e.territory));assert(C.owned(s,camp.x,camp.y));assert.deepEqual(s.claim,home);assert.equal(s.stats.expanded,0);let land=C.territories(s)[1];assert.equal(land.w,7);assert.equal(land.h,7);assert(C.owned(s,land.x,land.y));assert(!C.owned(s,land.x-1,land.y));assert(!C.owned(s,17,20),'land between home and captured base is not gifted');
assert.equal(C.placement(s,'house',camp.x,camp.y),'');let stock=s.wood;let built=C.startBuild(s,'house',camp.x,camp.y);assert(built.building);assert.equal(s.wood,stock-C.recipes.house.wood);assert(C.placement(s,'house',land.x+land.w-1,land.y).includes('границей'),'entire building footprint must be owned');
let loaded=JSON.parse(JSON.stringify(s));B.normalize(loaded);assert(C.owned(loaded,camp.x,camp.y));let count=C.territories(loaded).length,wood=loaded.wood;B.normalize(loaded);M.tick(loaded,.1);assert.equal(C.territories(loaded).length,count);assert.equal(loaded.wood,wood);
// Previously conquered camps automatically contribute land without paying rewards again.
let old=C.newGame();old.camp.defeated=true;old.camp.rewarded=true;delete old.camps;B.normalize(old);assert(C.owned(old,old.camp.x,old.camp.y));assert.equal(old.wood,0);
old.camps.push({id:'edge',name:'Edge',x:1,y:C.H-2,defeated:true});let edge=C.territories(old).at(-1);assert.equal(edge.x,1);assert(edge.y+edge.h<=C.H-1);assert(!C.owned(old,0,C.H-2));
console.log('PASS territory: victory grants land, remote construction, full footprint limits, no intervening land, old/new saves, idempotency, map edges.');

