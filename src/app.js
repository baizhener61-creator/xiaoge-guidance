import {TAROT} from './content/tarot.mjs';
import {HEXAGRAM_NOTES} from './content/hexagram-notes.mjs';
import {QUICK_START,makeQuestion,REVIEW_CHOICES} from './quick-start.mjs';
import {SCENARIOS,guidanceFor,validateAnswers,answerLabels} from './scenarios.mjs';
import {shuffleDeck,readTarot,POSITIONS,tossCoins,sumCoins,castHexagram,tarotSynthesis,TRIGRAMS} from './oracle.mjs';

const $=s=>document.querySelector(s);
const historyKey='xiaoge-guidance-history-v1';
let texts=[],scene='food',libraryType='tarot',pending=null,deck=[],picked=[],throws=[],busy=false,currentResult=null;
 let generation=0,toastTimer;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function writeStore(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
function history(){const rows=readStore(historyKey,[]);return Array.isArray(rows)?rows.filter(x=>x&&typeof x.question==='string'):[];}
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
const reduced=()=>document.body.classList.contains('no-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,reduced()?0:ms));
function showView(name){
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`${name}View`));
 document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('selected',b.dataset.view===name));
 if(name==='library')renderLibrary();if(name==='history')renderHistory();
 window.scrollTo({top:0,behavior:'instant'});$(`#${name}View h1`)?.focus({preventScroll:true});
}
function setStep(number){
 ['story','questions','method'].forEach((id,i)=>$(`#${id}Step`).hidden=i!==number-1);
 document.querySelectorAll('.step-indicator span').forEach((el,i)=>{el.classList.toggle('current',i===number-1);if(i===number-1)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 $('#formError').textContent='';window.scrollTo({top:0,behavior:'instant'});
}
function renderQuickStart(){
 const spec=QUICK_START[scene];let subject='';
 $('#questionPreview').hidden=true;$('#customStory').open=false;
 $('#quickStart').innerHTML=`<h2 class="quick-title">${spec.label}</h2><div class="quick-options" id="subjectChoices">${spec.subjects.map((s,i)=>`<button class="quick-chip" type="button" data-subject="${i}" aria-pressed="false">${s}</button>`).join('')}<button class="quick-chip" type="button" data-custom>其他，我自己说</button></div><div id="issueLayer" hidden><h2 class="quick-title" tabindex="-1">最纠结的是哪一点？</h2><div class="quick-options" id="issueChoices">${spec.issues.map((s,i)=>`<button class="quick-chip" type="button" data-issue="${i}" aria-pressed="false">${s}</button>`).join('')}<button class="quick-chip" type="button" data-custom>没有贴合的，自己补充</button></div></div>`;
 document.querySelectorAll('[data-subject]').forEach(b=>b.onclick=()=>{subject=spec.subjects[Number(b.dataset.subject)];document.querySelectorAll('[data-subject]').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('[data-issue]').forEach(x=>x.setAttribute('aria-pressed','false'));$('#issueLayer').hidden=false;$('#question').value='';$('#questionPreview').hidden=true;$('#issueLayer h2').focus({preventScroll:true});});
 document.querySelectorAll('[data-issue]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-issue]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#question').value=makeQuestion(scene,subject,spec.issues[Number(b.dataset.issue)]);$('#questionPreview').textContent='你的心事：'+$('#question').value;$('#questionPreview').hidden=false;$('#formError').textContent='';});
 document.querySelectorAll('[data-custom]').forEach(b=>b.onclick=()=>{$('#customStory').open=true;$('#question').focus();});
 $('#question').oninput=()=>{$('#questionPreview').textContent='你的心事：'+$('#question').value;$('#questionPreview').hidden=!$('#question').value;};
}
function startScene(key){
 if(pending?.scene!==key){$('#decisionForm').reset();pending=null;}
 scene=key;const spec=SCENARIOS[key];$('#sceneSubtitle').textContent=spec.subtitle;$('#flowTitle').textContent=spec.name;$('#context').placeholder=spec.placeholder;renderQuickStart();
 $('#questionsList').innerHTML=spec.questions.map((q,i)=>`<fieldset data-question="${q.id}"><legend>${String(i+1).padStart(2,'0')} · ${q.label}</legend><div class="choice-grid">${q.choices.map(c=>`<label class="choice"><input type="radio" name="${q.id}" value="${c.value}" required><span>${c.text}</span></label>`).join('')}</div></fieldset>`).join('');
 setStep(1);showView('flow');
}
function answers(){return Object.fromEntries(SCENARIOS[scene].questions.map(q=>[q.id,$(`input[name="${q.id}"]:checked`)?.value]));}
function checkStory(){if($('#question').value.trim().length<2){$('#formError').textContent='先选一件事情和一个纠结点，也可以自己写至少两个字。';return false;}return true;}
function checkAnswers(){const data=answers();if(!validateAnswers(scene,data)){const missing=SCENARIOS[scene].questions.find(q=>!data[q.id]);$('#formError').textContent=`还想听你说说：${missing.label}`;$(`[data-question="${missing.id}"] input`).focus();return false;}return true;}

function cardImage(card,cls=''){return `<img class="tarot-image ${cls} ${card.reversed===true?'reversed-image':''}" src="assets/tarot/${card.id}.jpg" alt="${escape(card.name)}${card.reversed===true?'逆位':'牌面'}，Pamela Colman Smith 原作插图" loading="lazy" width="240" height="410">`;}
const lineNames=['初爻','二爻','三爻','四爻','五爻','上爻'];
const valueNames={6:'老阴 ×',7:'少阳',8:'少阴',9:'老阳 ○'};
function hexDrawing(values){return `<div class="hex-preview" role="img" aria-label="从下至上：${values.map((v,i)=>`${lineNames[i]}${valueNames[v]}`).join('，')}">${values.map((v,i)=>`<div class="yao ${v===6||v===9?'moving':''} new"><span>${lineNames[i]}</span><span class="yao-line"><i></i>${v%2?'':'<i></i>'}</span><span class="yao-label">${v} ${valueNames[v]}</span></div>`).join('')}</div>`;}

function startRitual(){
 generation++;busy=false;deck=[];picked=[];throws=[];
 pending={scene,question:$('#question').value.trim(),context:$('#context').value.trim(),options:$('#options').value.trim(),answers:answers(),method:$('input[name="method"]:checked').value};
 $('#ritualTitle').textContent=pending.method==='tarot'?'月光洗牌仪式':'六掷问易';$('#ritualQuestion').textContent=pending.question;
 if(pending.method==='tarot'){
  $('#ritualStage').innerHTML=`<div class="ritual-intro"><div class="deck-preview"><span style="--r:-15deg">✦</span><span style="--r:15deg">☾</span><span style="--r:0deg">✧</span></div><h2>默念你的心事</h2><p class="helper">78 张牌，正逆位各有含义。<br>洗牌后从牌堆亲选三张，分别照见现状、阻碍与建议。</p><button class="primary-button" id="shuffleButton">静心，开始洗牌 ✦</button><button class="text-button" id="skipShuffle">跳过洗牌动画，直接选牌</button></div>`;
  $('#shuffleButton').onclick=()=>beginCards(false);$('#skipShuffle').onclick=()=>beginCards(true);
 }else{
  $('#ritualStage').innerHTML=`<div class="panel"><p>正面记 3，背面记 2。三枚相加，六次自下而上成卦。</p><div class="coin-bowl"><span class="coin">□</span><span class="coin">□</span><span class="coin">□</span></div><p class="ritual-status" id="coinStatus" role="status">第 1 掷 · 初爻</p><div id="coinLines">${hexDrawing([])}</div><button class="primary-button" id="tossButton">掷出三枚钱币</button><button class="text-button" id="skipCoins">快速完成余下掷币</button><details id="manualSection"><summary>我自己掷钱币，手动录入</summary><p class="helper">按真实掷币顺序填入总和，第一掷是最下方初爻。录入会替换屏幕上的模拟掷币记录。</p><div class="manual-inputs">${lineNames.map((name,i)=>`<label>${name}<select aria-label="${name}实物结果" id="manual${i}"><option value="">请选择</option>${[6,7,8,9].map(v=>`<option value="${v}">${v} ${valueNames[v]}</option>`).join('')}</select></label>`).join('')}</div><button class="secondary-button" id="manualSubmit">按实物结果排卦</button></details></div>`;
  $('#tossButton').onclick=()=>throwNext(false);$('#skipCoins').onclick=()=>throwNext(true);
  $('#manualSubmit').onclick=()=>{const values=lineNames.map((_,i)=>Number($(`#manual${i}`).value));try{const cast=castHexagram(values,texts);complete({cast,records:values.map(v=>({value:v,manual:true}))});}catch(e){toast(e.message);}};
 }
 showView('ritual');
}
async function beginCards(skip){
 if(busy)return;busy=true;const token=generation;
 try{deck=shuffleDeck();$('#shuffleButton').disabled=true;$('#skipShuffle').disabled=true;$('.deck-preview').classList.add('shuffling');if(!skip)await pause(750);if(token!==generation)return;
  $('#ritualStage').innerHTML=`<p class="helper" style="text-align:center">牌序已确定。轻触任意牌背，选满三张。牌堆可以向下滚动。</p><div class="drawn-cards">${POSITIONS.map(p=>`<div class="drawn-slot"><small>${p.name}</small><span class="sigil">✧</span>等待你的选择</div>`).join('')}</div><p class="ritual-status" id="cardStatus" role="status">已选 0 / 3 张</p><div class="tarot-deck" aria-label="78 张已洗好的塔罗牌">${deck.map((_,i)=>`<button class="card-back" data-card="${i}" aria-label="选择第 ${i+1} 张牌">✦<small>${String(i+1).padStart(2,'0')}</small></button>`).join('')}</div><button class="primary-button" id="readCards" disabled>展开月光来信</button>`;
  document.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>pickCard(b));$('#readCards').onclick=()=>complete({cards:readTarot(picked),drawOrder:picked.map(c=>({id:c.id,reversed:c.reversed,deckPosition:c.deckPosition}))});
 }catch(e){toast(e.message);}finally{busy=false;}
}
function pickCard(button){
 if(picked.length>=3||button.disabled)return;const index=Number(button.dataset.card);const card={...deck[index],deckPosition:index+1};picked.push(card);button.disabled=true;
 const slot=document.querySelectorAll('.drawn-slot')[picked.length-1];slot.classList.add('revealed');slot.innerHTML=`<small>${POSITIONS[picked.length-1].name}</small>${cardImage(card,'mini')}<strong>${escape(card.name)}</strong><small>${card.reversed?'逆位':'正位'}</small>`;
 $('#cardStatus').textContent=`已选 ${picked.length} / 3 张`;
 if(picked.length===3){document.querySelectorAll('.card-back').forEach(b=>b.disabled=true);$('#readCards').disabled=false;$('#readCards').focus({preventScroll:true});}
}
async function throwNext(fast){
 if(busy||throws.length>=6)return;busy=true;const token=generation;
 $('#tossButton').disabled=true;$('#skipCoins').disabled=true;$('#manualSubmit').disabled=true;
 try{
 do{
  const coins=tossCoins();const value=sumCoins(coins);throws.push({coins,value});
  $('.coin-bowl').classList.add('tossing');if(!fast)await pause(800);if(token!==generation)return;
  $('.coin-bowl').classList.remove('tossing');document.querySelectorAll('.coin').forEach((el,i)=>el.textContent=coins[i]===3?'正 3':'背 2');
  $('#coinLines').innerHTML=hexDrawing(throws.map(t=>t.value));
  $('#coinStatus').textContent=throws.length===6?'六爻已成 · 静候展开':`第 ${throws.length} 掷：${coins.join(' + ')} = ${value} ${valueNames[value]}。下一掷：${lineNames[throws.length]}`;
 }while(fast&&throws.length<6);
 if(throws.length===6){$('#tossButton').textContent='展开本卦与变卦';$('#tossButton').onclick=()=>complete({cast:castHexagram(throws.map(t=>t.value),texts),records:[...throws]});$('#skipCoins').hidden=true;}
 }catch(e){toast(e.message);}finally{busy=false;$('#tossButton')&&($('#tossButton').disabled=false);$('#skipCoins')&&($('#skipCoins').disabled=false);$('#manualSubmit')&&($('#manualSubmit').disabled=false);}
}
function complete(oracle){
 const rows=history();const result={...pending,version:2,id:crypto.randomUUID(),createdAt:new Date().toISOString(),guidance:guidanceFor(pending.scene,pending.answers,rows.filter(r=>r.scene===pending.scene).length),...oracle};
 if(!writeStore(historyKey,[result,...rows].slice(0,30)))toast('设备存储不可用，本次结果仍可阅读，请复制保存。');
 renderResult(result);
}
function sceneReflection(result,meaning){
 const labels={food:'把牌意用在这一餐：你更需要满足口味，还是减少选择消耗？',shopping:'把牌意用在这次购买：它在提醒需求、预算，还是拥有它的冲动？',work:'把牌意用在工作选择：它涉及准备、边界，还是你想要的成长？',relationship:'把牌意用在相处：它反映的是你的感受与回应方式，不代表对方隐藏的想法。'};
 return `${labels[result.scene]||''} 当前主题是“${meaning}”，请找出与你的经历相符的一处，也允许它不适用。`;
}
function renderResult(result){
 currentResult=result;
 if(result.version!==2){$('#resultContent').innerHTML=`<article class="result-card"><p class="eyebrow">早期版本的手札</p><h2>${escape(result.question)}</h2><p>这条记录来自旧版原型，原来的分数不是现实分析，不再展示。你可以保留当时的自述，重新进入新版探索。</p><p>${escape(result.context)}</p></article>`;showView('result');return;}
 const g=result.guidance;const facts=answerLabels(result.scene,result.answers);
 let oracle='';
 if(result.cards){oracle=`<h2 class="section-heading">✦ 牌面揭示 · 现状 / 阻碍 / 建议</h2>${result.cards.map(c=>`<article class="result-card symbol-card"><span class="tag">${c.position} · ${c.suit}</span>${cardImage(c)}<span class="orientation">${c.reversed?'逆位':'正位'}</span><h3>${escape(c.name)}</h3><p>${escape(c.meaning)}</p><blockquote>${escape(c.guidance)}</blockquote><p class="prompt">${escape(c.prompt)}</p><p class="prompt">${escape(sceneReflection(result,c.meaning))}</p></article>`).join('')}<article class="result-card"><h2>三张牌一起看</h2><p>${tarotSynthesis(result.cards)}</p><details><summary>查看本次抽取依据</summary><p>78 张完整牌组，安全随机洗牌。牌位依次为现状、阻碍、建议；每张正逆位各半，单次不放回。</p>${result.drawOrder.map((c,i)=>`<p>${POSITIONS[i].name}：牌堆第 ${c.deckPosition} 张，ID ${c.id}，${c.reversed?'逆位':'正位'}。</p>`).join('')}<p class="reading-caption">牌义为现代 RWS 象征解读；牌面是 Pamela Colman Smith 的原作书籍插图。</p></details></article>`;}
 if(result.cast){const c=result.cast;const note=HEXAGRAM_NOTES[c.primary.number-1];const next=HEXAGRAM_NOTES[c.transformed.number-1];
 oracle=`<h2 class="section-heading">☯ 六掷成卦 · 从初爻向上</h2><article class="result-card symbol-card"><span class="tag">本卦 · 第 ${c.primary.number} 卦</span><h3>${escape(c.primary.fullName)}</h3>${hexDrawing(c.values)}<p class="raw-text">${escape(c.primary.judgment)}</p><p class="reading-caption">卦辞原文</p><p>${escape(c.primary.image)}</p><blockquote>现代提示 · ${note.theme}<br>${note.note}</blockquote><p class="prompt">${escape(sceneReflection(result,note.theme))}</p></article><article class="result-card"><h2>${c.moving.length?`${c.moving.length} 个动爻 · 逐条并读`:'无动爻 · 先读本卦'}</h2>${c.moving.length?c.moving.map(i=>`<p class="raw-text">${escape(c.primary.lines[i])}</p>`).join(''):'<p>本次没有 6 或 9，阴阳未变。本卦卦辞是这次主要阅读材料。</p>'}${c.moving.length===6&&c.primary.use?`<p class="raw-text">${escape(c.primary.use)}</p>`:''}<p class="reading-caption">原文是古经爻辞，未把通用现代建议冒充逐爻翻译。多动爻在此全部列出，不强行指定唯一主爻。</p></article>${c.moving.length?`<article class="result-card symbol-card"><span class="tag">变卦 · 第 ${c.transformed.number} 卦</span><h3>${escape(c.transformed.fullName)}</h3>${hexDrawing(c.changed.split('').map(x=>x==='1'?7:8))}<p class="raw-text">${escape(c.transformed.judgment)}</p><blockquote>现代提示 · ${next.theme}<br>${next.note}</blockquote><p class="prompt">变卦展示动爻阴阳转换后的结构，可作为变化方向的象征来读，并非未来必然发生的事。</p></article>`:''}<article class="result-card"><details><summary>查看六次记录与排卦依据</summary>${result.records.map((r,i)=>`<p>${lineNames[i]}：${r.manual?'实物总和录入':r.coins.join(' + ')} = ${r.value}，${valueNames[r.value]}</p>`).join('')}<p>阴阳编码从初爻到上爻：${c.bits} → ${c.changed}。6/8 为阴，7/9 为阳；6/9 为动爻。并读本卦、全部动爻及变卦是本应用的阅读约定。</p></details></article>`;
 }
 const unsafe=result.scene==='relationship'&&result.answers.safety==='unsafe';
 $('#resultContent').innerHTML=`<div class="letter-top"><span class="seal">☾</span><p class="eyebrow">${escape(SCENARIOS[result.scene].name)} · ${new Date(result.createdAt).toLocaleDateString('zh-CN')}</p><h2>${escape(result.question)}</h2></div><article class="result-card ${unsafe?'safety':''}"><p class="eyebrow">根据你提供的线索</p><h2>${escape(g.title)}</h2><p>${escape(g.reason)}</p>${g.alternatives?`<p class="reading-caption">也可以考虑：${g.alternatives.map(escape).join('、')}</p>`:''}<details><summary>这份建议依据什么？</summary><dl class="facts">${facts.map(f=>`<div><dt>${escape(f.label)}</dt><dd>${escape(f.value)}</dd></div>`).join('')}</dl><p class="reading-caption">结构化回答匹配离线规则，不是对自由文字的 AI 分析，也不是牌卦替你下结论。</p></details></article>${oracle}<h2 class="section-heading">✧ 把灵感带回生活</h2><article class="result-card action-box"><h2>现在的一小步</h2><p>${escape(g.action)}</p><p><strong>问问自己：</strong>${escape(g.question)}</p>${g.talk?`<div class="talk">可以试着这样说：<br>“${escape(g.talk)}”</div>`:''}</article><article class="result-card"><details><summary>我的原始心事与备选方向</summary><dl class="facts"><div><dt>自述</dt><dd>${escape(result.context)||'这次没有填写长自述。'}</dd></div><div><dt>备选方向</dt><dd>${escape(result.options)||'这次没有填写备选方向。'}</dd></div></dl></details><label for="reviewNote">这次指引让我想到什么？</label><textarea id="reviewNote" rows="3" maxlength="600" placeholder="记录一个感受，或后来发生的事情。">${escape(result.review||'')}</textarea><button class="text-button" id="saveReview">保存回响</button></article><p class="footnote">允许牌卦的象征与你的实际感受不同。先核对现实，再决定如何行动。</p>`;
 const reviewChoices=document.createElement('div');reviewChoices.className='review-choices';reviewChoices.innerHTML=REVIEW_CHOICES.map(text=>`<button class="quick-chip" type="button">${text}</button>`).join('');$('#reviewNote').before(reviewChoices);reviewChoices.querySelectorAll('button').forEach(b=>b.onclick=()=>{$('#reviewNote').value=b.textContent;reviewChoices.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));});
 $('#reviewNote').placeholder='先点选一种感受，也可以自行补充（选填）。';
 $('#saveReview').onclick=()=>{result.review=$('#reviewNote').value;const rows=history();const at=rows.findIndex(r=>r.id===result.id);if(at>=0){rows[at]=result;toast(writeStore(historyKey,rows)?'这份回响已写进手札':'存储不可用，请复制保存');}};
 showView('result');
}
function renderHistory(){const rows=history();$('#historyList').innerHTML=rows.length?rows.map((r,i)=>`<button class="history-item" data-history="${i}"><small>${new Date(r.createdAt).toLocaleDateString('zh-CN')} · ${r.version===2?SCENARIOS[r.scene]?.name||'心事':'旧版手札'}</small><strong>${escape(r.question)}</strong><small>${escape(r.guidance?.title||'查看原始心事')} →</small></button>`).join(''):'<div class="empty">☾<h2>这里还没有心愿</h2><p>完成一次仪式，让月光替你记住。</p></div>';$('#clearHistoryButton').hidden=!rows.length;document.querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>renderResult(rows[Number(b.dataset.history)]));}
function renderLibrary(){
 const search=$('#librarySearch').value.trim();const rows=libraryType==='tarot'?TAROT:texts;
 const found=rows.filter(x=>(x.name+(x.fullName||'')+(x.suit||'')+x.number).includes(search));
 $('#libraryList').innerHTML=`<p class="catalog-count">${libraryType==='tarot'?'完整 78 张牌 · 现代 RWS 释义':'完整 64 卦 · 古经原文与现代提示'} · 找到 ${found.length} 条</p>`+found.map(x=>libraryType==='tarot'?`<details class="library-item"><summary><span class="catalog-symbol">${x.symbol}</span>${x.name} <small>· ${x.suit}</small></summary>${cardImage(x)}<h3>正位 · ${x.upright}</h3><p>${x.advice}</p><h3>逆位 · ${x.reversed}</h3><p>${x.reverseAdvice}</p><p class="helper">主题：${x.theme}。现代反思释义，不是原书逐字翻译。</p></details>`:`<details class="library-item"><summary><span class="catalog-symbol">${String.fromCodePoint(0x4dc0+x.number-1)}</span>${x.number} · ${x.fullName}</summary>${hexDrawing((TRIGRAMS[x.lower]+TRIGRAMS[x.upper]).split('').map(v=>v==='1'?7:8))}<p class="raw-text">${escape(x.judgment)}</p><p>${escape(x.image)}</p><h3>现代提示 · ${HEXAGRAM_NOTES[x.number-1].theme}</h3><p>${HEXAGRAM_NOTES[x.number-1].note}</p><h3>六爻原文 · 自下而上</h3>${x.lines.map(line=>`<p class="raw-text">${escape(line)}</p>`).join('')}${x.use?`<p class="raw-text">${escape(x.use)}</p>`:''}</details>`).join('')+(found.length?'':'<p class="empty">没有找到，可以换个名字试试。</p>');
}

document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{generation++;showView(b.dataset.view);});
$('#sceneGrid').innerHTML=Object.entries(SCENARIOS).map(([id,s])=>`<button class="scene-card" data-scene="${id}"><span>${s.icon}</span><strong>${s.name}</strong><small>${s.subtitle}</small></button>`).join('');
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>startScene(b.dataset.scene));
$('#toQuestions').onclick=()=>{if(checkStory())setStep(2);};$('#backStory').onclick=()=>setStep(1);$('#toMethod').onclick=()=>{if(checkAnswers())setStep(3);};$('#backQuestions').onclick=()=>setStep(2);
$('#decisionForm').onsubmit=e=>{e.preventDefault();if(!checkStory()){setStep(1);return;}if(!checkAnswers())return;if(!texts.length){toast('卦象资料尚未就绪，请刷新重试。');return;}startRitual();};
$('#leaveRitual').onclick=()=>{generation++;busy=false;showView('flow');setStep(3);};
$('#clearHistoryButton').onclick=()=>{if(confirm('清空这台设备上的全部手札与回响？此操作不可恢复。')){if(writeStore(historyKey,[])){renderHistory();toast('手札已清空');}else toast('无法清空，请检查浏览器存储设置。');}};
$('#copyButton').onclick=async()=>{if(!currentResult)return;try{await navigator.clipboard.writeText($('#resultContent').innerText);toast('月光来信已复制');}catch{toast('请长按页面文字复制。');}};
$('#librarySearch').oninput=renderLibrary;$('#tarotTab').onclick=()=>switchLibrary('tarot');$('#ichingTab').onclick=()=>switchLibrary('iching');
function switchLibrary(type){libraryType=type;$('#tarotTab').setAttribute('aria-pressed',type==='tarot');$('#ichingTab').setAttribute('aria-pressed',type==='iching');$('#librarySearch').value='';renderLibrary();}
function setMotion(value){document.body.classList.toggle('no-motion',value);$('#motionButton').setAttribute('aria-pressed',value);$('#motionButton').setAttribute('aria-label',value?'开启动画':'减少动画');}
setMotion(readStore('xiaoge-reduced-motion',false));$('#motionButton').onclick=()=>{const value=!document.body.classList.contains('no-motion');setMotion(value);writeStore('xiaoge-reduced-motion',value);toast(value?'已减少动态效果':'已开启动画');};
const daily=['答案不必催促，先看清你想守护什么。','月光不替你选择，只照亮你已有的勇气。','温柔的边界，也是照顾自己的方式。','允许心动，也允许等一等。','每一次认真倾听自己，都是一小步前进。','迷雾里先点一盏灯，不必看清整条路。','愿你的选择，让日常多一点舒展。'];
$('#dailyNote').textContent=daily[Math.floor(Date.now()/86400000)%daily.length];
try{const res=await fetch(new URL('./content/iching.json',import.meta.url));if(!res.ok)throw new Error('资料加载失败');texts=await res.json();if(texts.length!==64)throw new Error('卦象资料不完整');}catch(e){toast('卦象资料加载失败，请联网刷新。');}
if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>toast('离线准备未完成，请保持联网使用。'));}
