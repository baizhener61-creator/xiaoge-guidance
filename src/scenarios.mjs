const q=(id,label,choices)=>({id,label,choices:[...choices,['unknown','不确定 / 其他情况']].map(([value,text])=>({value,text}))});
export const SCENARIOS = {
 food:{name:'今晚吃什么',icon:'♨',subtitle:'让烟火气接住今天的你',placeholder:'今天有点累，想吃得舒服些，又不想花太多钱。',questions:[
  q('budget','这一餐的预算？',[['low','20 元以内'],['mid','20–40 元'],['high','40 元以上']]),
  q('diet','需要先排除什么？',[['any','没有特别限制'],['vegetarian','素食'],['noseafood','不吃海鲜'],['light','清淡少辣']]),
  q('taste','此刻更想要哪种味道？',[['warm','热乎暖胃'],['fresh','清爽一点'],['spicy','香辣过瘾'],['any','都可以']]),
  q('energy','今天还剩多少精力？',[['low','只想省心'],['normal','可以稍作准备'],['high','愿意慢慢挑选']]),
  q('place','想在哪里吃？',[['home','自己做'],['delivery','外卖'],['out','出门吃']]),
  q('hunger','现在的饥饿程度？',[['small','有点饿'],['normal','正常一餐'],['large','很饿，想吃扎实']])]},
 shopping:{name:'买还是不买',icon:'♧',subtitle:'分清心动与真正的需要',placeholder:'看中一件东西，喜欢，但又担心买回来闲置。',questions:[
  q('need','它解决什么需要？',[['essential','必需，确实缺少'],['useful','有明确用途'],['mood','主要想奖励自己']]),
  q('budget','买完后的预算状态？',[['safe','不影响日常和储蓄'],['tight','需要压缩其他支出'],['debt','需要借钱或分期']]),
  q('replacement','手头有没有替代品？',[['none','没有'],['partial','有，但不好用'],['yes','有，而且还能用']]),
  q('frequency','预计多久用一次？',[['often','每周多次'],['sometimes','每月几次'],['rare','还想不到具体场景']]),
  q('duration','已经喜欢它多久？',[['long','两周以上'],['days','几天'],['today','今天刚看到']]),
  q('deadline','有真正的使用期限吗？',[['urgent','几天内必须用'],['none','没有，只是活动快结束']])]},
 work:{name:'工作迷雾',icon:'✧',subtitle:'在去留与前进之间点一盏灯',placeholder:'想换工作，但对下一步不确定，也舍不得现在的稳定。',questions:[
  q('type','这次主要纠结什么？',[['leave','是否离职或换方向'],['offer','是否接受一个机会'],['task','任务、合作或工作安排']]),
  q('pressure','目前的压力如何？',[['severe','已持续影响生活'],['normal','有压力但能调整'],['low','主要是想更进一步']]),
  q('buffer','如果发生变动，生活缓冲够吗？',[['short','不足三个月'],['enough','至少三个月'],['na','暂时不涉及收入变化']]),
  q('ready','对下一步准备到哪里？',[['none','还没有具体方案'],['some','有方向，还需核实'],['ready','条件与方案比较明确']]),
  q('info','关键条件是否清楚？',[['unclear','薪酬、职责或时间仍不清楚'],['clear','已有明确书面信息']]),
  q('value','现在最想守住什么？',[['stability','稳定和生活空间'],['growth','成长与机会'],['boundary','边界与被尊重']])]},
 relationship:{name:'人际心事',icon:'☾',subtitle:'照见关系，也照顾自己',placeholder:'一句话让我不舒服，不知道该不该说，又怕影响关系。',questions:[
  q('safety','这段相处让你感到安全吗？',[['safe','安全，主要是误会或分歧'],['unsafe','有威胁、控制或暴力']]),
  q('pattern','同类事情出现过几次？',[['once','第一次或很少'],['repeat','已经反复发生']]),
  q('fact','事情的事实清楚吗？',[['clear','亲眼经历或有明确沟通'],['guess','还包含转述或自己的猜测']]),
  q('talk','表达过自己的感受吗？',[['none','还没认真说过'],['heard','说过，对方愿意听'],['ignored','说过，但一直被忽略']]),
  q('goal','你更希望接下来怎样？',[['repair','理解彼此，修复关系'],['boundary','保留关系，但明确界限'],['distance','减少接触或离开']]),
  q('emotion','此刻情绪有多强烈？',[['high','很激动，难以平静说话'],['calm','可以平静沟通']])]},
};

const FOOD = [
 ['番茄鸡蛋面',16,'warm','normal','egg'],['小米粥配蔬菜饼',14,'warm','small','vegan'],['香菇青菜面',15,'warm','normal','vegan'],['南瓜粥配豆腐',16,'warm','small','vegan'],
 ['麻婆豆腐饭（素版）',18,'spicy','large','vegan'],['酸辣土豆丝盖饭',16,'spicy','normal','vegan'],['菌菇炖豆腐配米饭',22,'warm','large','vegan'],['凉拌荞麦面',22,'fresh','normal','vegan'],
 ['蔬菜饭团配豆浆',18,'fresh','small','vegan'],['蒸南瓜配杂粮饭和时蔬',24,'fresh','normal','vegan'],['鸡肉蔬菜饭',26,'warm','large','meat'],['牛肉汤面',28,'warm','large','meat'],
 ['小馄饨配青菜',20,'warm','normal','meat'],['清蒸鱼配米饭',38,'warm','normal','seafood'],['虾仁滑蛋饭',30,'fresh','normal','seafood'],['鸡丝凉面',22,'fresh','normal','meat'],
 ['香辣鸡丁盖饭',24,'spicy','large','meat'],['小份麻辣烫（自选食材）',28,'spicy','normal','mixed'],['寿司小拼盘',35,'fresh','small','seafood'],['牛肉火锅套餐',58,'spicy','large','meat'],
 ['菌菇小火锅',42,'warm','large','vegan'],['蔬菜意面',35,'fresh','normal','vegan'],['照烧鸡腿饭',30,'warm','large','meat'],['家常蒸蛋配青菜米饭',18,'warm','normal','egg'],
 ['清炒三蔬配米饭',18,'fresh','normal','vegan'],['鲜虾粥',26,'warm','small','seafood'],['酸汤面片',18,'warm','large','vegan'],['青椒鸡蛋盖饭',18,'spicy','large','egg']
].map(([name,price,taste,size,kind])=>({name,price,taste,size,kind}));

const rule=(test,title,reason,action,question)=>({test,title,reason,action,question});
const RULES={
 shopping:[
 rule(a=>a.budget==='debt','月光暂驻 · 暂不下单','你提到需要借钱或分期，这次购买会增加未来支出负担。','先按总价、分期费用与生活必需支出列账；保留现有资金。','不依靠借款，有没有能满足同一需要的替代办法？'),
 rule(a=>a.budget==='tight','守住星币 · 先缓一缓','购买会压缩其他支出，预算边界比活动截止时间更值得守住。','先写下要被削减的那笔支出，确认你是否愿意交换。','如果没有折扣，你还愿意以这个总价买吗？'),
 rule(a=>a.need==='essential'&&a.replacement!=='yes'&&a.budget==='safe','灯火已明 · 可以认真购买','它是缺少的必需品，替代有限，且不影响你的基本预算。','核对尺寸、规格、保修和退换政策；在合适产品中比较总价。','哪个功能是真正必需，而不是额外加价的理由？'),
 rule(a=>a.replacement==='yes'&&a.frequency!=='often','留白之签 · 先用好已有的','现有物品还能用，而新物品使用频率不高，重复投入的可能较大。','用现有物品试过一次，再决定新物品具体改善什么。','买新物品能解决现有物品的哪个真实问题？'),
 rule(a=>a.duration==='today'&&a.deadline==='none','让心动沉淀 · 两天后再看','刚刚产生心动，又没有实际期限，冷静期能帮助分辨持续喜欢和即时冲动。','收藏链接，48 小时后在相同预算下重新判断。','两天后没有促销氛围，你还会主动想到它吗？'),
 rule(a=>a.frequency==='rare','寻找用途 · 先体验','你还说不清具体使用场景，先体验比直接拥有更容易验证价值。','列三个使用日期；列不出来时，考虑借用、试用或暂缓。','它会进入你的哪一个日常习惯？'),
 rule(a=>a.budget==='safe'&&a.frequency==='often'&&a.duration==='long','心愿有根 · 在比较后购买','预算允许、频繁使用且已经喜欢一段时间，购买理由较稳定。','比较同功能的两个产品，确认总成本和退换条件后再选。','使用三个月以后，你希望自己最满意什么？'),
 rule(()=>true,'星光待定 · 再补一条依据','目前的回答没有形成紧迫的购买理由，也没有足够信息直接否定它。','先确认实际使用次数与完整价格，再决定买或缓一缓。','满足同一需要的最省钱办法是什么？')],
 work:[
 rule(a=>a.type==='leave'&&a.buffer==='short','先筑桥 · 准备后再离开','你考虑离职，但生活缓冲不足三个月，收入中断需要先有安排。','做一份必要支出清单，启动求职或交接准备；若处境不安全，优先寻求现实支持。','离开前，哪项准备最能降低你的不确定感？'),
 rule(a=>a.info==='unclear','先照明 · 核实关键条件','薪酬、职责或时间尚不清楚，现在做选择容易把想象当成事实。','向对方要书面条件：职责、薪酬结构、工时、试用期和汇报关系。','哪个尚未确认的条件一旦改变，会影响你的决定？'),
 rule(a=>a.pressure==='severe'&&a.ready==='none','先减压 · 同时建立出口','持续压力已经影响生活，而下一步尚无具体方案；恢复和准备可以并行。','今天减少一项可协商任务，联系可信任的人讨论支持，并记录可行出口。','目前最消耗你的，是任务本身、关系，还是作息？'),
 rule(a=>a.type==='offer'&&a.ready==='ready'&&a.value==='growth','试探新路 · 核对成长的代价','你已有比较明确的准备，也把成长放在优先位置，可以进一步评估新机会。','把六个月能学到什么、增加多少压力写在一起，再确认最差情况能否承担。','这份成长能通过具体职责和资源验证吗？'),
 rule(a=>a.value==='boundary','划清星界 · 先谈具体边界','你最希望守住被尊重和工作边界，需要把抽象不满转成明确安排。','写下工作时间、责任范围和超出范围的处理方式，约一次具体沟通。','哪一条边界被落实后，局面会显著改善？'),
 rule(a=>a.type==='task','理顺线索 · 明确分工','这次主要涉及任务或合作安排，优先级和交付标准比单纯坚持更重要。','列出必须完成、可以延后、需要别人确认的三类任务，向负责人核对。','哪项任务的期限或标准是你猜测而非确认的？'),
 rule(a=>a.ready==='none','先画地图 · 暂不急着定去留','你还没有下一步方案，先探索能让决定更有依据。','收集三个真实岗位或路径，各记录要求、收入和你缺少的条件。','你向往的新方向，有哪些日常工作是你真正了解的？'),
 rule(()=>true,'小步试航 · 用实际体验判断','已有方向与部分准备，可以通过一次小验证继续缩小不确定性。','设一个两周的验证任务：访谈、体验、投递或短项目，然后复盘。','什么新证据会让你改变现在的倾向？')],
 relationship:[
 rule(a=>a.safety==='unsafe','先护住自己 · 安全优先','你明确提到威胁、控制或暴力，首要任务是保护自己，而不是证明牌面或修复关系。','先联系可信任的人，在安全条件下拉开距离；紧急危险时寻求当地紧急援助。','现在谁能在现实中陪伴你、帮助你安全离开？'),
 rule(a=>a.emotion==='high','月色暂歇 · 先暂停对话','情绪很强烈时，马上争论更难说清真实需要。','先暂停一段时间，整理事实、感受和请求；约定稍后再谈。','等情绪平稳后，你最想让对方理解哪一句话？'),
 rule(a=>a.fact==='guess','拨开迷雾 · 先核实','你提到有转述或猜测，暂时不能把推测当作对方的真实想法。','用一个不带指责的问题求证，避免传播尚未证实的解释。','哪些是你亲自知道的事实，哪些是你赋予它的含义？'),
 rule(a=>a.pattern==='repeat'&&a.talk==='ignored','守住边界 · 观察行动','同类问题反复发生，你表达过却持续被忽略，需要看实际改变而不只听保证。','说清一项底线和你能执行的应对方式，给自己设观察期限。','如果对方仍不改变，你准备怎样照顾自己？'),
 rule(a=>a.goal==='distance','给关系留距离 · 温和而明确','你希望减少接触或离开，可以先决定安全、可执行的距离。','减少一类非必要联系；需要说明时简短表达自己的安排。','你希望保留的联系边界是什么？'),
 rule(a=>a.talk==='none','点一盏灯 · 试着说清','你还没有认真表达，对方可能并不知道这件事对你的影响。','用“发生了什么—我的感受—希望怎样”说一次具体请求。','你能提出一个对方可以实际回应的请求吗？'),
 rule(a=>a.talk==='heard'&&a.goal==='repair','一起修补 · 把理解落到安排','对方愿意倾听，你也希望修复关系，可以约定下一次如何做。','共同确定一个小改变，过几天再问彼此是否改善。','这次沟通怎样才算双方都被听见？'),
 rule(()=>true,'温柔有界 · 说清自己的位置','你希望维持联系的同时照顾自己，需要清晰、可持续的相处方式。','选一项具体边界，用平静的语言表达，并观察回应。','哪些可以协商，哪些需要你坚持？')]
};

export function validateAnswers(scene,answers) {
 const spec=SCENARIOS[scene];
 return !!spec && spec.questions.every(q=>q.choices.some(c=>c.value===answers?.[q.id]));
}
export function guidanceFor(scene,answers,variant=0) {
 if(!validateAnswers(scene,answers)) throw new Error('请完成场景问题');
 const a=answers;
 if(scene==='food') {
  const max={low:20,mid:40,high:Infinity,unknown:Infinity}[a.budget];
  const eligible=FOOD.filter(f=>f.price<=max&&(a.diet!=='vegetarian'||f.kind==='vegan')&&(a.diet!=='noseafood'||!['seafood','mixed'].includes(f.kind))&&(a.diet!=='light'||f.taste!=='spicy'));
  const preference=f=>(f.taste===a.taste?2:0)+(f.size===a.hunger?1:0);
  const sorted=[...eligible].sort((x,y)=>preference(y)-preference(x));
  const pool=sorted.filter(f=>preference(f)===preference(sorted[0]));
  const selected=pool[((variant%pool.length)+pool.length)%pool.length];
  return {title:`今夜的烟火签 · ${selected.name}`,reason:`先按预算与饮食限制筛选，再参考你想要的口味和饥饿程度。${a.energy==='low'?'你今天想省心，可以选熟悉、容易获得的做法。':''}`,action:`${{home:'按家里现有食材准备',delivery:'在常用外卖平台找配送时间合适的店',out:'找附近卫生和菜单信息清楚的店'}[a.place]}。参考餐食：${selected.name}，估算约 ${selected.price} 元；价格以实际为准，先确认食材和忌口。`,question:'吃完这一餐，你最希望感受到饱足、轻松，还是被照顾？',alternatives:sorted.filter(f=>f!==selected).slice(0,3).map(f=>f.name), branch:'food-filter',talk:null};
 }
 const unknown=SCENARIOS[scene].questions.filter(q=>a[q.id]==='unknown');
 const urgent=scene==='shopping'&&['debt','tight'].includes(a.budget)||scene==='relationship'&&a.safety==='unsafe';
 if(unknown.length&&!urgent)return {title:'雾中有灯 · 先补一条关键线索',reason:`你对“${unknown.map(q=>q.label).join('、')}”还不确定，暂时不替你给出去留或购买结论。`,action:'先挑一个最影响决定的不确定点，向相关的人求证，或写下自己能接受的范围；有了信息再回来梳理。',question:unknown[0].label,branch:`${scene}-unknown`,talk:null};
 const chosen=RULES[scene].find(r=>r.test(a));
 return {title:chosen.title,reason:chosen.reason,action:chosen.action,question:chosen.question,branch:`${scene}-${RULES[scene].indexOf(chosen)}`,talk:scene==='relationship'?a.safety==='unsafe'?null:a.goal==='distance'?'我需要一些自己的空间，接下来会减少联系。等我准备好再决定怎样沟通。':'当这件事发生时，我感到不舒服。我想听听你的理解，也希望下次我们能提前说清楚。':null};
}
export function answerLabels(scene,answers) {return SCENARIOS[scene].questions.map(q=>({label:q.label,value:q.choices.find(c=>c.value===answers[q.id])?.text||'未回答'}));}
