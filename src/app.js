import { buildGuidance, validateDecision } from "./decision-engine.mjs";

const $ = (selector) => document.querySelector(selector);
const views = [...document.querySelectorAll(".view")];
const optionList = $("#optionsList");
const historyKey = "xiaoge-guidance-history-v1";
let currentResult = null;

function showView(name) {
  views.forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "history") renderHistory();
}

function addOption(value = "") {
  if (optionList.children.length >= 4) return;
  const index = optionList.children.length;
  const row = document.createElement("div");
  row.className = "option-row";
  row.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><input maxlength="100" aria-label="选项 ${index + 1}" placeholder="写下一个具体选择" value=""><button type="button" aria-label="删除这个选项">×</button>`;
  row.querySelector("input").value = value;
  row.querySelector("button").addEventListener("click", () => { if (optionList.children.length > 2) { row.remove(); relabelOptions(); } });
  optionList.append(row);
  updateAddButton();
}

function relabelOptions() {
  [...optionList.children].forEach((row, index) => { row.querySelector("span").textContent = String.fromCharCode(65 + index); row.querySelector("input").setAttribute("aria-label", `选项 ${index + 1}`); });
  updateAddButton();
}

function updateAddButton() { $("#addOptionButton").hidden = optionList.children.length >= 4; }
function getInput() { return { question: $("#question").value, context: $("#context").value, feelings: $("#feelings").value, priorities: $("#priorities").value, options: [...optionList.querySelectorAll("input")].map((input) => input.value) }; }
function getHistory() { try { return JSON.parse(localStorage.getItem(historyKey)) || []; } catch { return []; } }
function saveResult(result) { localStorage.setItem(historyKey, JSON.stringify([result, ...getHistory()].slice(0, 30))); }

function escapeHtml(value) { const node = document.createElement("div"); node.textContent = value; return node.innerHTML; }
function safetyMessage(type) {
  const labels = { health: "健康与用药", finance: "金钱与投资", legal: "法律事务", safety: "人身安全" };
  return type ? `<aside class="safety-card"><strong>这件事涉及${labels[type]}</strong><p>下面的内容只能帮你整理感受，不能代替专业判断。请先和可信任的人或相关专业人士确认，再采取行动。</p></aside>` : "";
}

function renderResult(result) {
  currentResult = result;
  const bars = result.ranked.map((item, index) => `<div class="score-row"><div><b>${index + 1}</b><span>${escapeHtml(item.label)}</span><strong>${item.score}</strong></div><i><span style="width:${item.score}%"></span></i></div>`).join("");
  $("#resultContent").innerHTML = `${safetyMessage(result.safety)}<article class="answer-card"><p class="eyebrow">此刻更偏向</p><div class="answer-symbol">♡</div><h2>${escapeHtml(result.recommendation)}</h2><p>${result.confidence}。这不是命令，而是一面帮你看见内心倾向的小镜子。</p></article><article class="result-card"><h3><span>⌁</span> 现实倾向</h3>${bars}<p class="prompt">${escapeHtml(result.reflection)}</p></article><div class="insight-grid"><article class="result-card tarot"><p class="eyebrow">塔罗意象</p><span class="card-icon">✦</span><h3>${result.tarot.name}</h3><p>${result.tarot.tone}</p></article><article class="result-card east"><p class="eyebrow">东方启发</p><span class="card-icon">☯</span><h3>${result.hexagram.name}</h3><p>${result.hexagram.text}</p></article></div><article class="action-card"><p class="eyebrow">现在可以做的一小步</p><h3>${escapeHtml(result.action)}</h3><label><input type="checkbox"> <span>做完后，回来看看心情有没有变化</span></label></article><details class="context-review"><summary>看看我理解的事情</summary><p><strong>你的问题：</strong>${escapeHtml(result.question)}</p><p><strong>事情背景：</strong>${escapeHtml(result.context)}</p>${result.feelings ? `<p><strong>你的感受：</strong>${escapeHtml(result.feelings)}</p>` : ""}</details>`;
  showView("result");
}

function renderHistory() {
  const history = getHistory();
  $("#historyList").innerHTML = history.length ? history.map((item, index) => `<button class="history-item" data-index="${index}" type="button"><span>${new Date(item.createdAt).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</span><strong>${escapeHtml(item.question)}</strong><small>当时偏向：${escapeHtml(item.recommendation)} →</small></button>`).join("") : `<div class="empty-state"><span>☁</span><h2>还没有留下心愿足迹</h2><p>完成一次指引后，会安静地保存在这台手机里。</p></div>`;
  $("#clearHistoryButton").hidden = !history.length;
  document.querySelectorAll(".history-item").forEach((button) => button.addEventListener("click", () => renderResult(history[Number(button.dataset.index)])));
}

function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 1800); }

document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
$("#startButton").addEventListener("click", () => showView("form"));
$("#historyButton").addEventListener("click", () => showView("history"));
$("#addOptionButton").addEventListener("click", () => addOption());
$("#againButton").addEventListener("click", () => { $("#decisionForm").reset(); optionList.innerHTML = ""; addOption(); addOption(); showView("form"); });
$("#clearHistoryButton").addEventListener("click", () => { if (confirm("确定清空这台手机上的全部心愿记录吗？")) { localStorage.removeItem(historyKey); renderHistory(); toast("记录已清空"); } });
$("#copyButton").addEventListener("click", async () => { if (!currentResult) return; const text = `小格的心愿指引\n${currentResult.question}\n此刻偏向：${currentResult.recommendation}\n塔罗意象：${currentResult.tarot.name}｜${currentResult.tarot.tone}\n东方启发：${currentResult.hexagram.name}｜${currentResult.hexagram.text}\n行动：${currentResult.action}`; try { await navigator.clipboard.writeText(text); toast("指引已复制"); } catch { toast("长按页面内容即可复制"); } });

["question", "context", "feelings"].forEach((id) => { const input = $(`#${id}`); input.addEventListener("input", () => { $(`#${id}Count`).textContent = input.value.length; }); });

$("#decisionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = getInput();
  const validation = validateDecision(input);
  ["question", "context", "options"].forEach((key) => { $(`#${key}Error`).textContent = validation.errors[key] || ""; });
  if (!validation.valid) { document.querySelector(".error:not(:empty)")?.closest(".field")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
  if (!$("#consent").checked) { toast("请先阅读并勾选使用说明"); return; }
  showView("loading");
  const messages = ["先听听你真正重视的声音", "看看每个选择背后的得与舍", "把灵感整理成能行动的一小步"];
  let index = 0; const timer = setInterval(() => { $("#loadingText").textContent = messages[++index % messages.length]; }, 650);
  setTimeout(() => { clearInterval(timer); const result = buildGuidance(input); saveResult(result); renderResult(result); }, 1600);
});

addOption(); addOption();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
