import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TAROT} from '../src/content/tarot.mjs';
import {HEXAGRAM_NOTES} from '../src/content/hexagram-notes.mjs';
import {castHexagram,sumCoins,shuffleDeck,readTarot,randomInt} from '../src/oracle.mjs';
import {SCENARIOS,validateAnswers,guidanceFor} from '../src/scenarios.mjs';
import {QUICK_START,makeQuestion} from '../src/quick-start.mjs';
const texts=JSON.parse(readFileSync(new URL('../src/content/iching.json',import.meta.url)));

test('complete unique 78-card deck with distinct upright/reversed readings',()=>{
 assert.equal(TAROT.length,78); assert.equal(new Set(TAROT.map(c=>c.id)).size,78); assert.equal(new Set(TAROT.map(c=>c.name)).size,78);
 for(const c of TAROT) {assert.ok(c.upright&&c.reversed&&c.advice&&c.reverseAdvice);assert.notEqual(c.upright,c.reversed);}
 const deck=shuffleDeck(n=>n-1); assert.equal(new Set(deck.map(c=>c.id)).size,78);
 const spread=readTarot(deck.slice(0,3)); assert.deepEqual(spread.map(c=>c.position),['现状','阻碍','建议']); assert.equal(spread[0].meaning,TAROT[0].reversed);
 assert.throws(()=>readTarot([deck[0],deck[0],deck[1]]));
});
test('rejection sampling avoids modulo bias',()=>{
 let values=[0xffffffff,5];const source={getRandomValues(arr){arr[0]=values.shift();return arr;}};
 assert.equal(randomInt(3,source),2); assert.equal(values.length,0);
 assert.throws(()=>randomInt(0));
});
test('three fair coins yield exact 1:3:3:1 distribution',()=>{
 const counts={6:0,7:0,8:0,9:0};
 for(let i=0;i<8;i++)counts[sumCoins([2+(i&1),2+((i>>1)&1),2+((i>>2)&1)])]++;
 assert.deepEqual(counts,{6:1,7:3,8:3,9:1});assert.throws(()=>sumCoins([1,2,3]));
});
test('64 hexagrams / 384 lines and all 4096 casts map correctly',()=>{
 assert.equal(texts.length,64);assert.equal(HEXAGRAM_NOTES.length,64);
 for(const h of texts){assert.equal(h.lines.length,6);assert.ok(h.lines.every(Boolean));assert.ok(h.judgment);}
 const patterns=new Set();
 for(let n=0;n<4096;n++){
  const values=Array.from({length:6},(_,i)=>6+((n>>(i*2))&3));
  const result=castHexagram(values,texts);patterns.add(result.primary.number);
  assert.equal(result.moving.length,values.filter(v=>v===6||v===9).length);
  const back=castHexagram(values.map(v=>v===6?9:v===9?6:v),texts);assert.equal(back.primary.number,result.transformed.number);
 }
 assert.equal(patterns.size,64);
 assert.equal(castHexagram([7,7,7,7,7,7],texts).primary.number,1);
 assert.equal(castHexagram([8,8,8,8,8,8],texts).primary.number,2);
 assert.equal(castHexagram([7,8,7,8,7,8],texts).primary.number,63);
 assert.equal(castHexagram([8,7,8,7,8,7],texts).primary.number,64);
 assert.equal(castHexagram([9,9,9,9,9,9],texts).transformed.number,2);
 assert.equal(castHexagram([6,6,6,6,6,6],texts).transformed.number,1);
 assert.throws(()=>castHexagram([1,2,3],texts));
});
test('every scenario answer combination has valid actionable guidance',()=>{
 for(const [scene,spec] of Object.entries(SCENARIOS)){
  let answers=[{}];for(const q of spec.questions)answers=answers.flatMap(a=>q.choices.map(c=>({...a,[q.id]:c.value})));
  for(const a of answers){assert.ok(validateAnswers(scene,a));const r=guidanceFor(scene,a);assert.ok(r.title&&r.reason&&r.action&&r.question);if(scene==='food')assert.ok(r.alternatives.length);}
  assert.equal(validateAnswers(scene,{}),false);
 }
});
test('recommendations respond to constraints, not hashes',()=>{
 const base={need:'essential',budget:'safe',replacement:'none',frequency:'often',duration:'long',deadline:'urgent'};
 assert.match(guidanceFor('shopping',base).title,/购买/);
 assert.match(guidanceFor('shopping',{...base,budget:'debt'}).title,/暂不下单/);
 const food={budget:'low',diet:'vegetarian',taste:'spicy',energy:'low',place:'home',hunger:'large'};
 assert.match(guidanceFor('food',food).title,/素版|土豆丝/);
});
test('layered quick choices generate valid questions for every scene',()=>{
 for(const [scene,spec] of Object.entries(QUICK_START))for(const subject of spec.subjects)for(const issue of spec.issues){assert.ok(makeQuestion(scene,subject,issue).length>=2);}
 assert.equal(makeQuestion('bad','x','y'),'');
});
test('all card illustrations and exact-size PNG installation icons exist',()=>{
 for(const c of TAROT){const bytes=readFileSync(new URL(`../assets/tarot/${c.id}.jpg`,import.meta.url));assert.equal(bytes.readUInt16BE(0),0xffd8);assert.ok(bytes.length>1000);}
 for(const [name,size] of [['icon-192',192],['icon-512',512],['apple-touch-icon',180]]){const bytes=readFileSync(new URL(`../assets/${name}.png`,import.meta.url));assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);}
});
