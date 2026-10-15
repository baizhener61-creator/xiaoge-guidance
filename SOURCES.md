# 数据、插图与方法来源

## 塔罗

- 体系：Rider–Waite–Smith，22 大阿尔卡那 + 4×14 小阿尔卡那。VIII 为力量，XI 为正义。
- 原作：A. E. Waite, *The Pictorial Key to the Tarot* (1911)，Pamela Colman Smith 插图。[原书数字版](https://sacred-texts.com/tarot/pkt/index.htm)。
- 78 张图片为原书插图扫描，存入 `assets/tarot/`，不是现代商业重绘；对应原图位于 `https://scrape.sacred-texts.com/tarot/pkt/img/`。`scripts/import-tarot-images.mjs` 保存牌名与原图编号的映射。原作已进入公版；不复制网站页面、现代译文或其界面设计。
- 中文牌义为原创现代反思式整理，并非原书逐字翻译。尤其逆位采用阻滞、内化、过量等现代读法；不伪称等同 Waite 每一条占义。
- “现状—阻碍—建议”为本应用选用的现代三牌阵；非原书凯尔特十字阵。
- 随机：[MDN Crypto.getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)。拒绝采样避免取模偏差；Fisher–Yates 洗牌；正逆位各半；不放回抽三张。跨次不剔除重复牌。

## 周易

- 古经文本是公版中文原文。数字录本：[muyen/decoding-iching data/zhouyi-64gua/zhouyi_64gua.json](https://github.com/muyen/decoding-iching/blob/main/data/zhouyi-64gua/zhouyi_64gua.json)，其上游为 bollwarm/ZHOUYI；导入时只保留卦辞、六条爻辞、用九/用六、大象与卦名，不导入现代评论。
- 原文复核：[中国哲学书电子化计划《周易》](https://ctext.org/book-of-changes/zh)。已校正乾九二录本“見龍再田”为“見龍在田”；其余保留录本异体与标点。不声称已经做过学术版全量校勘。
- 三枚钱币法：[Book of Changes — The coin method](https://zhouyi.dk/the-coin-method)。正面 3 背面 2；八种等概率结果得到 6/7/8/9 的 1:3:3:1 分布；六爻从下往上；6/9 动爻取反。
- 排卦按上下经卦组成六位结构，通行文王卦序从乾 1 至未济 64。测试遍历全部 4096 种六爻输入。
- 阅读约定：展示本卦卦辞、全部动爻原文、变卦卦辞，并在纯乾/纯坤全动时显示用九/用六。此为本应用“并读方式”，不冒充唯一古法，也不声称复现朱熹全部多动爻细则。
- `hexagram-notes.mjs` 的主题和提示均为原创现代反思文字，不是爻辞逐条白话翻译。

## 动画与图片说明

- 月亮、星光、牌背、翻牌、掷币、阴阳爻均由原生 CSS/DOM 绘制；无需额外动画框架。
- 六爻图片不是预置装饰，按真实六爻值动态渲染。逆位塔罗图片通过 180° 旋转呈现。
- 支持系统 prefers-reduced-motion 与应用内减少动画开关；跳过动画不改变既定抽取。
