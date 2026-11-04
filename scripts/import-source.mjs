import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';

const file = 'TOPdesk _ fluxo de atendimento a chamados .drawio.png';
const buffer = readFileSync(file);
let xml;
for (let offset = 8; offset < buffer.length;) {
  const length = buffer.readUInt32BE(offset);
  if (buffer.toString('ascii', offset + 4, offset + 8) === 'tEXt') {
    const text = buffer.subarray(offset + 8, offset + 8 + length).toString();
    if (text.startsWith('mxfile\0')) xml = decodeURIComponent(text.slice(7));
  }
  offset += length + 12;
}
if (!xml) throw new Error('XML draw.io nao encontrado no PNG.');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', parseAttributeValue: false });
const parsed = parser.parse(xml);
const clean = (value = '') => value.replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const cells = parsed.mxfile.diagram.mxGraphModel.root.mxCell.map(cell => ({
  id: cell.id,
  shortId: cell.id.split('-').at(-1),
  label: clean(cell.value),
  parent: cell.parent,
  source: cell.source,
  target: cell.target,
  edge: cell.edge === '1',
  style: cell.style,
  geometry: cell.mxGeometry,
}));
mkdirSync('src/data/flows/atendimento-topdesk', { recursive: true });
writeFileSync('src/data/flows/atendimento-topdesk/source.json', JSON.stringify({
  file, sha256: createHash('sha256').update(buffer).digest('hex'), cells,
}, null, 2) + '\n');
writeFileSync('src/data/flows/atendimento-topdesk/catalog.json', JSON.stringify({
  file, sha256: createHash('sha256').update(buffer).digest('hex'),
  cells: cells.filter(cell => cell.label).map(({ shortId, label, edge }) => ({ shortId, label, edge })),
}, null, 2) + '\n');
console.log(`Fonte extraida: ${cells.length} elementos, ${cells.filter(c => c.edge).length} conexoes.`);