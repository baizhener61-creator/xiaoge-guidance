# 月光占卜小屋实施计划

**目标：** 按已确认设计替换原型，保留静态 PWA 与 GitHub Pages。

1. 内容与算法：`src/content/tarot.mjs`、`src/content/iching.json`、`src/content/hexagram-notes.mjs`、`src/oracle.mjs`；实现完整牌组、六爻映射与可复核随机抽取，测试所有排卦输入。
2. 场景：`src/scenarios.mjs`；四类各有结构化追问和多分支建议，推荐依据可见，条件变化时验证建议变化。
3. UI：重写 `index.html`、`styles.css`、`src/app.js`；首页、分步表单、洗牌选牌、掷币成卦、结果、图鉴、历史；使用原生 CSS/DOM 动画。
4. 验收发布：运行 `node --test`，实际浏览器完成四场景、两占法、实物输入与离线测试，检查 320/375/430/768/1440 宽度，更新缓存并发布 GitHub Pages。

不增加框架依赖。所有文件修改使用补丁；数据导入与截图为可复现的生成流程。
