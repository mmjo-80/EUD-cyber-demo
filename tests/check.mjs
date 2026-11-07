import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'site/index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'site/app.js'), 'utf8');
assert(!/<(?:button|input|select|textarea|form|a|iframe)\b/i.test(html), 'No interactive elements');
assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|eval)\s*\(|navigator\.sendBeacon/.test(js), 'No remote calls or executable commands');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  assert(fs.existsSync(path.join(root, 'site', match[1])), `Local asset exists: ${match[1]}`);
}
class Element {
  constructor() { this.children = []; this.style = { setProperty() {} }; this.classList = { remove() {} }; this.textContent = ''; this.scrollHeight = 1000; }
  append(child) { this.children.push(child); child.parent = this; }
  remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); }
  get firstElementChild() { return this.children[0]; }
  querySelector(selector) { this.parts ??= {}; return this.parts[selector] ??= new Element(); }
}
for (const reduced of [false, true]) {
  const elements = new Map();
  let callback;
  let now = 0;
  const document = { body: { dataset: {} }, createElement: () => new Element(), getElementById: id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); } };
  const context = { document, performance: { now: () => now }, window: { matchMedia: () => ({ matches: reduced }), setInterval(fn) { assert(!callback, 'Only one scheduler'); callback = fn; } }, Date, Math };
  vm.runInNewContext(js, context);
  const panels = elements.get('terminals').children;
  assert.equal(panels.length, 8);
  assert(panels.every(p => p.querySelector('.terminal-body').children.length >= 7));
  const seen = new Set();
  // Accelerated 12-minute simulation includes four full scene rotations.
  for (now = 0; now <= 720000; now += 80) { callback(); seen.add(document.body.dataset.phase ?? '0'); }
  assert.equal(seen.size, 3);
  for (const panel of panels) {
    const body = panel.querySelector('.terminal-body');
    assert(body.children.length <= 70, 'Scrollback bounded');
    assert(body.children.some(line => line.textContent.includes('SESSION')), 'Stream keeps cycling');
  }
  now += 10 * 60 * 60 * 1000;
  callback(); // Resume safely after a long suspended tab.
  assert(panels.every(p => p.querySelector('.terminal-body').children.length <= 70));
}
console.log('PASS: assets, no controls/network APIs, 8 active streams, scene rotation, reduced motion, bounded scrollback, suspension recovery');
