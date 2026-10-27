const assert=require('node:assert/strict'),C=require('./dist/world-core.js');require('./dist/economy.js');const M=require('./dist/military.js'),B=require('./dist/combat.js');
function base(){let s=C.newGame();s.nodes=[];s.sheep=[];s.buildings=[{id:'b',type:'barracks',x:9,y:12,end:0,training:[]}];s.explored=[];for(let y=0;y<C.H;y++)for(let x=0;x<C.W;x++)s.explored.push(x+','+y);s.soldiers=['fighter','fighter','archer'].map((type,i)=>({id:'u'+i,type,x:10+i,y:16,home:'b',order:'guard',anchor:{x:10+i,y:16},route:[]}));s.wood=100;s.stone=100;s.cookedMeat=100;B.normalize(s);return s}
function tick(s,t){let events=[];for(let i=0;i<t*10;i++){s.time+=.1;events.push(...M.tick(s,.1))}return events}
let s=base();assert.equal(s.camps.length,10);assert.equal(new Set(s.camps.map(c=>c.id)).size,10);assert.deepEqual([...new Set(s.camps.map(c=>c.tier))],[1,2,3]);assert(C.W>=58&&C.H>=64);
// Canonical base alias is restored after JSON save/load, preserving conquered bases.
s.camps[1].defeated=true;s.camps[1].rewarded=true;B.select(s,s.camps[1].id);s=JSON.parse(JSON.stringify(s));B.normalize(s);assert.equal(s.camp,s.camps[1]);assert(s.camp.defeated);B.normalize(s);assert.equal(s.camps.length,10);
s=base();let old=s.soldiers[2].order;assert(!B.command(s,'follow',null,'fighter').error);assert(s.soldiers.slice(0,2).every(u=>u.order==='follow'));assert.equal(s.soldiers[2].order,old);assert(!B.command(s,'retreat',null,'archer').error);assert(s.soldiers[2].returning);assert(s.soldiers.slice(0,2).every(u=>!u.returning));
// No raids without an army; first warning and departure use active simulation time.
s=base();s.soldiers=[];tick(s,610);assert(!s.war.raid);assert.equal(s.war.elapsed,0);
s=base();s.war.nextRaid=0;let events=tick(s,.1);assert.equal(s.war.raid.phase,'warning');assert(events.some(e=>e.global&&e.kind==='horn'));assert.equal(s.war.raid.units.length,0);tick(s,74);assert.equal(s.war.raid.phase,'warning');tick(s,2);assert.equal(s.war.raid.phase,'marching');assert(s.war.raid.units.length>=2&&s.war.raid.units.length<=5);const serial=s.war.serial;tick(s,1);assert.equal(s.war.serial,serial);assert(!B.defend(s).error);
// Nearby raiders are engaged without selecting a soldier or issuing attack.
let raid=s.war.raid;raid.units=[{id:'test-raider',type:'fighter',x:10.5,y:16.5,hp:80,maxHp:80,home:{x:10.5,y:16.5},raider:true,route:[],retry:0}];s.soldiers.forEach((u,i)=>{u.x=10+i*.5;u.y=17;u.anchor={x:u.x,y:u.y};u.route=[];u.order='guard';u.returning=false});let raider=raid.units[0];tick(s,3);assert(raider.hp<80,'guards should automatically hit a raider');
// Defeating every raider clears the warning and gives a long recovery period.
raider.hp=0;tick(s,.1);assert.equal(s.war.raid,null);assert(s.war.nextRaid-s.war.elapsed>=480);
// Offline transition cancels attacks and preserves resources and health.
s=base();s.war.nextRaid=0;tick(s,77);let hp=s.soldiers.map(u=>u.hp),wood=s.wood;B.suspend(s);s.time+=86400;assert.equal(s.war.raid,null);assert.deepEqual(s.soldiers.map(u=>u.hp),hp);assert.equal(s.wood,wood);assert(s.war.nextRaid-s.war.elapsed>=180);
// An unguarded settlement can lose capped supplies, never all inventory.
s=base();s.soldiers.forEach(u=>{u.x=40;u.y=40;u.anchor={x:40,y:40}});s.war.raid={source:s.camps[1].id,phase:'marching',age:0,units:[{id:'thief',type:'fighter',x:10,y:14,hp:80,maxHp:80,home:{x:6,y:5},raider:true,route:[],retry:0}]};s.buildings[0].hp=24;tick(s,5);assert.equal(s.wood,90);assert.equal(s.stone,90);assert.equal(s.war.raid.phase,'marching');tick(s,1);assert.equal(s.wood,90);
// An isolated river bank cannot launch an unreachable raid.
s=base();s.camps.forEach(c=>{if(c.x<23)c.defeated=true});s.war.nextRaid=0;tick(s,.1);assert(!s.war.raid);
// Towers fire independently; an arrow can leave its own tower footprint.
s=base();s.soldiers=[];s.buildings.push({id:'tower',type:'tower',x:13,y:15,end:0});let target={id:'tower-target',type:'fighter',x:16.5,y:16,hp:80,maxHp:80,home:{x:16.5,y:16},raider:true,route:[],retry:0};s.war.raid={source:s.camps[1].id,phase:'marching',age:0,units:[target]};tick(s,1);assert(target.hp<80,'completed tower should damage a raider');
// Old single-camp progress is kept when the remaining nine bases are introduced.
s=base();let legacy=s.camp;legacy.defeated=true;legacy.rewarded=true;delete s.camps;delete s.mapExpanded;let woodBefore=s.wood;B.normalize(s);assert.equal(s.camps.length,10);assert.equal(s.camp,legacy);assert(s.camp.rewarded);assert.equal(s.wood,woodBefore);let size=s.nodes.length;B.normalize(s);assert.equal(s.nodes.length,size);
// A selected archer group cannot pull fighters out of their existing orders.
s=base();s.camp=s.camps[1];let fighterOrders=s.soldiers.slice(0,2).map(u=>u.order);assert(!B.attack(s,s.camp.id,'archer').error);assert(s.soldiers[2].battle);assert(s.soldiers.slice(0,2).every(u=>!u.battle));assert.deepEqual(s.soldiers.slice(0,2).map(u=>u.order),fighterOrders);
console.log('PASS war: ten bases, old/new save migration, group orders and attacks, warning/departure, automatic defense, towers, capped pillage, recovery interval, offline safety, river reachability.');


