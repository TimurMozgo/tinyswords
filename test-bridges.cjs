const assert=require('node:assert/strict'),C=require('./dist/world-core.js');
const s=C.newGame(),y=14,x=C.riverX(y);s.nodes=[];s.wood=100;s.stone=100;s.buildings=[{id:'home',type:'house',x:8,y:11,end:0}];s.player={x:x-.5,y:y+.5};
assert(C.placement(s,'bridge',x,y));s.explored=[0,1,2].map(dx=>(x+dx)+','+y);
assert(!C.owned(s,x,y));assert.equal(C.placement(s,'bridge',x,y),'');assert(C.placement(s,'bridge',x-1,y));assert.equal(C.path(s,x-1,y,x+3,y).length,0);
const b=C.startBuild(s,'bridge',x,y).building;assert(b);assert.equal(s.wood,60);assert.equal(s.stone,90);assert(!C.walkable(s,x,y));assert(C.placement(s,'bridge',x,y));s.time=60;C.finishBuildings(s);assert(C.walkable(s,x,y));assert.equal(C.path(s,x-1,y,x+3,y).length,4);
s.player.x=x+.5;assert.equal(C.demolish(s,b.id),false);s.player.x=x-.5;s.workers=[{x:x+1.5,y:y+.5}];assert.equal(C.demolish(s,b.id),false);s.workers=[];assert(C.demolish(s,b.id));assert(!C.walkable(s,x,y));assert.equal(s.wood,80);
s.nodes=[{id:'bank',kind:'tree',hp:3,x:x+3,y}];assert(C.placement(s,'bridge',x,y));
console.log('Bridge tests passed: placement, discovery, cost, construction, crossing, occupied demolition, blocked banks.');
