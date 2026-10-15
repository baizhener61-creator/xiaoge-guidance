# 动态项目库

这是同项目新对话的起点。只依据当前代码、测试结果及 GitHub 部署状态判断是否完成，不把历史计划当作已实现功能。

## 产品与当前版本

小格专属的月光占卜小屋。静态 HTML/CSS/ES modules，无生产依赖、无 AI 调用、无后端。iPhone 可通过 Safari 添加到主屏幕。

- v1：早期原型，用哈希产生分数。已经被 v2 替换；旧记录只保留自述，不再显示伪分析分数。
- v2：四个场景各六个结构化问题、条件规则建议；完整 78 张 RWS 塔罗正逆位与原作插图；三枚钱币六掷、64 卦及 384 爻原文；手动录入；图鉴；本地手札/回响；主题动画/减少动画；离线缓存。
- 快捷输入：场景 → 具体事情 → 纠结点，自动整理问题；各层可选自行输入。结构化问题有“不确定 / 其他情况”；回响也先提供快捷选项。
- 上线是否成功以 [GitHub Actions](https://github.com/baizhener61-creator/xiaoge-guidance/actions) 和公网响应为准。

## 从哪里开始改

| 任务 | 文件 |
|---|---|
| 页面结构、文案和方法说明 | `index.html` |
| 粉嫩视觉、翻牌/掷币/星光动画、响应式 | `styles.css` |
| 分步表单、仪式交互、结果渲染、图鉴、历史与存储 | `src/app.js` |
| 抽牌、正逆位、无偏随机、六爻排卦、组合提示 | `src/oracle.mjs` |
| 四类追问、分支建议、餐食筛选 | `src/scenarios.mjs` |
| 分层快捷选项与问题组合、回响选项 | `src/quick-start.mjs` |
| 78 张牌的内容 | `src/content/tarot.mjs` |
| 64 卦、384 爻、象辞及用九/用六 | `src/content/iching.json` |
| 64 卦原创现代提示 | `src/content/hexagram-notes.mjs` |
| 原书牌面图 | `assets/tarot/`，78 张 JPG |
| 来源、方法及校勘边界 | `SOURCES.md` |
| 内容与算法回归测试 | `tests/oracle.test.mjs` |
| 本机静态服务器 | `scripts/serve.mjs` |
| 数据/图片导入器 | `scripts/import-iching.mjs`、`scripts/import-tarot-images.mjs` |
| 离线资源和版本更新 | `sw.js` |
| GitHub Pages 部署 | `.github/workflows/pages.yml` |

## 不能破坏的约定

1. 塔罗使用 `crypto.getRandomValues`、拒绝采样和 Fisher–Yates，三牌不放回。正逆位各半；不能为了避免重复排除之前的牌。
2. RWS 序号：力量 VIII、正义 XI；小牌一至十、侍从、骑士、王后、国王。牌阵是现代“现状—阻碍—建议”，不伪称原书牌阵。
3. 硬币 2/3，和为 6/7/8/9；六爻数组由初爻到上爻。6/8 阴、7/9 阳，6/9 动。绘图 CSS column-reverse 从下向上展示。
4. `castHexagram(values,texts)` 从上下经卦映射本卦/变卦，不能随卦名文字猜测阴阳。
5. 阅读约定是并读本卦、全部动爻与变卦，乾坤全动附用九/用六；并非朱熹多动爻算法。原文与现代原创提示分别标注。
6. 现实建议由结构化选择产生，自由文字不做完整语义理解。`options` 是记录/复盘素材，不自动给用户自定义选项排名。
7. 洗牌或掷币时生成结果；动画与跳过只改变显示进度，不对已抽取结果重抽。切换视图通过 `generation` 令异步展示失效。
8. localStorage key `xiaoge-guidance-history-v1` 保持兼容，v2 记录带 `version:2`，最多 30 条。清空前确认；写入失败提示复制保存。
9. 所有新运行时文件和图片都要加入 `sw.js` 缓存；只删除 `xiaoge-guide-` 前缀旧缓存。上传 GitHub 的 `_site` 不含工具、测试和私人数据。

## 接口速查

- `shuffleDeck(rand?)` → 78 项，含 `reversedMeaning` 与 boolean `reversed`。
- `readTarot(cards)` → 三牌，含 `position/meaning/guidance/prompt`。
- `castHexagram(values,texts)` → `{ values,bits,changed,primary,transformed,moving }`，moving 是零起始爻索引。
- `validateAnswers(scene,answers)` → boolean。
- `guidanceFor(scene,answers,variant)` → `{title,reason,action,question,branch,talk?,alternatives?}`。

## 验证与发布

见 `VERIFICATION.md`。改动后 `npm test`、脚本语法、相关浏览器交互必须通过。部署复制 index/css/manifest/sw 与 src/assets 到 `_site`，main 推送后自动发布。新增运行时文件必须核对发布脚本和离线清单。

## 已知限制与下一步候选

- 没有八字排盘、奇门遁甲、梅花易数，不要宣称已实现。
- 中文塔罗解释为现代 RWS 象征式整理，非 Waite 原文直译；不把象征当成事实预测。
- 周易录本结构已验证，乾九二一处已校正；不是全本学术校勘。后续可核对异体、逐爻注释与更多传统取辞体系。
- 本地规则能覆盖预设场景，无法像 AI 理解任意复杂自述。未来 AI 需要用户重新确认服务、成本和隐私。
- 没有附近餐厅实时搜索，餐费只是估算。饮食限制为大类筛选，不代替过敏原核对。
- 还可扩展场景细分、上下文提示与内容编辑工具；不能只靠随机换词制造“丰富”。
- 真实 iPhone 硬件安装需用户最终体验；桌面浏览器的手机视口测试不等于实体 iPhone 测试。
- Windows Playwright WebKit 的 `setOffline(true)` 存在已知上游问题 #42775；离线回归采用启动独立服务器、缓存后停止服务器再刷新。不要把这个工具错误误判成应用缓存失败，也不能直接跳过离线验证。
