import { mkdir, writeFile } from 'node:fs/promises';

// Ancient Chinese text only. Modern translations/commentaries are not imported.
const source = 'https://raw.githubusercontent.com/muyen/decoding-iching/main/data/zhouyi-64gua/zhouyi_64gua.json';
const response = await fetch(source);
if (!response.ok) throw new Error(`Import failed: ${response.status}`);
const data = await response.json();
const rows = data.hexagrams.map(h => ({
  number: h.number, name: h.name, fullName: h.name_full,
  upper: h.trigrams.upper, lower: h.trigrams.lower,
  judgment: h.guaci, lines: h.yaoci.slice(0, 6).map(x => x.text),
  use: h.yaoci[6]?.text || '', image: h.xiang[0],
}));
if (rows.length !== 64 || rows.some(h => h.lines.length !== 6 || !h.judgment)) throw new Error('Incomplete ancient text');
// Collation against https://ctext.org/book-of-changes/qian/zh : 見龍在田.
rows[0].lines[1] = '九二：見龍在田，利見大人。';
await mkdir('src/content', { recursive: true });
await writeFile('src/content/iching.json', JSON.stringify(rows, null, 2) + '\n');
console.log(`Imported ${rows.length} hexagrams / ${rows.reduce((n,h)=>n+h.lines.length,0)} line texts`);
