const TAROT = [
  { name: "星星", tone: "相信希望，但把愿望落到一个小行动上。" },
  { name: "力量", tone: "温柔并不等于退让，稳定地照顾真实需要。" },
  { name: "节制", tone: "不必非黑即白，试着寻找能兼顾两端的比例。" },
  { name: "女祭司", tone: "暂时安静下来，你已经隐约知道更在意什么。" },
  { name: "战车", tone: "方向比完美更重要，选定后给自己一个行动期限。" },
  { name: "太阳", tone: "优先靠近让你更舒展、更坦诚的那个选择。" }
];

const HEXAGRAMS = [
  { name: "风山渐", text: "循序渐进比一次到位更适合现在。" },
  { name: "水泽节", text: "先设边界，选择会自然变清楚。" },
  { name: "雷风恒", text: "看哪个选项更值得长期坚持。" },
  { name: "地山谦", text: "放下证明自己的冲动，回到真实需要。" },
  { name: "火地晋", text: "可优先考虑能带来成长和开阔感的方向。" },
  { name: "山泽损", text: "适当舍弃次要负担，才能保住最重要的部分。" }
];

function hash(text) {
  let value = 2166136261;
  for (const char of text) {
    value ^= char.codePointAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function clean(value) {
  return String(value ?? "").trim();
}

export function validateDecision(input) {
  const errors = {};
  if (clean(input.question).length < 4) errors.question = "请再具体一点，至少写 4 个字。";
  if (clean(input.context).length < 10) errors.context = "多讲一点事情背景，至少写 10 个字。";
  const options = (input.options || []).map(clean).filter(Boolean);
  if (options.length < 2) errors.options = "至少需要两个不同的选项。";
  if (new Set(options).size !== options.length) errors.options = "每个选项需要有所不同。";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function safetyCategory(text) {
  const value = clean(text);
  const groups = {
    health: /吃药|停药|手术|怀孕|疾病|生病|医院|自杀|伤害自己/,
    finance: /借钱|贷款|投资|股票|基金|转账|赌博|币圈/,
    legal: /报警|起诉|合同|违法|签字|法律/,
    safety: /见网友|独自去|跟踪|威胁|暴力|失联|危险/
  };
  return Object.entries(groups).find(([, pattern]) => pattern.test(value))?.[0] || null;
}

function scoreOption(option, input, index) {
  const priorities = clean(input.priorities).split(/[，,、\s]+/).filter(Boolean);
  const combined = `${option}|${input.question}|${input.context}|${input.feelings}|${index}`;
  let score = 55 + (hash(combined) % 26);
  for (const priority of priorities) if (option.includes(priority)) score += 5;
  return Math.min(95, score);
}

export function buildGuidance(input) {
  const checked = validateDecision(input);
  if (!checked.valid) throw new Error("INVALID_DECISION");
  const options = input.options.map(clean).filter(Boolean);
  const seed = hash([input.question, input.context, input.feelings, input.priorities, ...options].join("|"));
  const ranked = options
    .map((label, index) => ({ label, score: scoreOption(label, input, index), originalIndex: index }))
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex);
  const top = ranked[0];
  const tarot = TAROT[seed % TAROT.length];
  const hexagram = HEXAGRAMS[Math.floor(seed / TAROT.length) % HEXAGRAMS.length];
  const safety = safetyCategory(`${input.question} ${input.context} ${options.join(" ")}`);
  return {
    id: `${Date.now()}-${seed}`,
    createdAt: new Date().toISOString(),
    question: clean(input.question),
    context: clean(input.context),
    feelings: clean(input.feelings),
    priorities: clean(input.priorities),
    ranked,
    recommendation: top.label,
    confidence: top.score - ranked[1].score >= 8 ? "倾向比较清晰" : "两个方向很接近",
    tarot,
    hexagram,
    reflection: `如果先试着选择“${top.label}”，你最希望它替你守住什么？又愿意承担哪一个小代价？`,
    action: `给“${top.label}”一个最小试用机会：今天先完成一个 15 分钟内能做到的步骤，再观察自己的感受。`,
    safety
  };
}
