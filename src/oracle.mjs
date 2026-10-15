import { TAROT } from './content/tarot.mjs';

export function randomInt(max, source = globalThis.crypto) {
 if (!Number.isInteger(max) || max < 1 || max > 0x100000000) throw new RangeError('随机范围不正确');
 if (!source?.getRandomValues) throw new Error('当前浏览器无法提供可靠随机源，请使用 Safari 或 Chrome。');
 const limit = Math.floor(0x100000000 / max) * max;
 const buf = new Uint32Array(1);
 do { source.getRandomValues(buf); } while (buf[0] >= limit);
 return buf[0] % max;
}

export function shuffleDeck(rand = randomInt) {
 const deck = TAROT.map(card => ({...card, reversedMeaning:card.reversed, reversed:rand(2) === 1}));
 for (let i=deck.length-1;i>0;i--) { const j=rand(i+1); [deck[i],deck[j]]=[deck[j],deck[i]]; }
 return deck;
}
export const POSITIONS = [
 {name:'现状',prompt:'这张牌描绘一种可能的当前主题，请对照自己的实际感受。'},
 {name:'阻碍',prompt:'把这张牌当成需要留意的盲点，而不是对他人动机的断言。'},
 {name:'建议',prompt:'用这张牌的提醒构思一个小行动，不必照单全收。'}
];
export function readTarot(cards) {
 if(cards.length!==3 || new Set(cards.map(c=>c.id)).size!==3 || cards.some(c=>!TAROT.some(t=>t.id===c.id))) throw new Error('需要三张不同的有效塔罗牌');
 return cards.map((c,i)=>({...c,position:POSITIONS[i].name,meaning:c.reversed?c.reversedMeaning||TAROT.find(t=>t.id===c.id).reversed:c.upright, guidance:c.reversed?c.reverseAdvice:c.advice, prompt:POSITIONS[i].prompt}));
}

export function tossCoins(rand=randomInt) { return Array.from({length:3},()=>rand(2)+2); }
export function sumCoins(coins) {
 if(!Array.isArray(coins)||coins.length!==3||coins.some(c=>c!==2&&c!==3)) throw new Error('每次需要三枚取值为 2 或 3 的钱币');
 return coins.reduce((a,b)=>a+b,0);
}
export const TRIGRAMS={乾:'111',兑:'110',兌:'110',离:'101',離:'101',震:'100',巽:'011',坎:'010',艮:'001',坤:'000'};
export function castHexagram(values, texts) {
 if(!Array.isArray(values)||values.length!==6||values.some(x=>![6,7,8,9].includes(x))) throw new Error('请按初爻到上爻输入六个 6、7、8、9');
 const bits=values.map(v=>v%2).join('');
 const changed=values.map(v=>v===6?1:v===9?0:v%2).join('');
 const find=(pattern)=>texts.find(h=>TRIGRAMS[h.lower]+TRIGRAMS[h.upper]===pattern);
 const primary=find(bits), transformed=find(changed);
 if(!primary||!transformed) throw new Error('卦象资料不完整');
 return {values:[...values],bits,changed,primary,transformed,moving:values.flatMap((v,i)=>v===6||v===9?[i]:[])};
}

export function tarotSynthesis(cards) {
 const reversed=cards.filter(c=>c.reversed).length;
 const groups=Object.entries(cards.reduce((map,c)=>(map[c.suit]=(map[c.suit]||0)+1,map),{}));
 const repeated=groups.find(([,n])=>n>=2);
 return `${reversed===0?'三张均为正位，可从牌面主题直接展开反思。':`${reversed} 张逆位提醒你留意主题的阻滞、内化或过量，逆位并不等于坏事。`} ${repeated?`${repeated[0]}重复出现，可重点观察这一组共同主题：${cards.find(c=>c.suit===repeated[0]).theme}。`:'牌组主题各异，可以从不同角度观察同一个问题。'} 现状与阻碍作对照，建议位提供尝试方向；不把三张牌当成注定的事件链。`;
}
