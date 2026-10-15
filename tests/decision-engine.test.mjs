import test from "node:test";
import assert from "node:assert/strict";
import { buildGuidance, safetyCategory, validateDecision } from "../src/decision-engine.mjs";

const validInput = {
  question: "周末应该去爬山还是在家休息？",
  context: "这周工作有点累，但已经很久没有出去活动了。",
  feelings: "既期待出去，又担心体力不够",
  priorities: "身体 舒服 陪伴",
  options: ["和朋友去爬山", "在家好好休息"]
};

test("rejects vague and incomplete decisions", () => {
  const result = validateDecision({ question: "选啥", context: "不知道", options: ["A"] });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["context", "options", "question"]);
});

test("builds deterministic ranking and reflective guidance", () => {
  const first = buildGuidance(validInput);
  const second = buildGuidance(validInput);
  assert.equal(first.recommendation, second.recommendation);
  assert.equal(first.tarot.name, second.tarot.name);
  assert.equal(first.hexagram.name, second.hexagram.name);
  assert.equal(first.ranked.length, 2);
  assert.match(first.action, /15 分钟/);
});

test("supports up to four meaningful options", () => {
  const result = buildGuidance({ ...validInput, options: ["A 方案", "B 方案", "C 方案", "D 方案"] });
  assert.equal(result.ranked.length, 4);
  assert.ok(result.ranked[0].score >= result.ranked[3].score);
});

test("detects high-stakes topics", () => {
  assert.equal(safetyCategory("我要不要停药"), "health");
  assert.equal(safetyCategory("是否贷款投资"), "finance");
  assert.equal(safetyCategory("今晚吃面还是米饭"), null);
});
