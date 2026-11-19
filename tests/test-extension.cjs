const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({ URL });
vm.runInContext(source('cleaner.js'), context);
const clean = context.CleanLink.cleanUrl;
const cases = [
 ['https://example.com/a?utm_source=x&id=42#section', undefined, 'https://example.com/a#section'],
 ['/a?q=1#part', 'https://example.com/base', 'https://example.com/a#part'],
 ['https://example.com/a#route?keep=1', undefined, 'https://example.com/a#route?keep=1'],
 ['https://example.com/?next=https%3A%2F%2Fx.test%2Fa%3Fb%3D1', undefined, 'https://example.com/'],
 ['https://example.com/a%3Fb?x=1', undefined, 'https://example.com/a%3Fb'],
 ['https://example.com/', undefined, 'https://example.com/'],
 ['http://localhost:8765/path?a=1&a=2#x', undefined, 'http://localhost:8765/path#x'],
 ['javascript:alert(1)', undefined, null],
 ['mailto:test@example.com', undefined, null],
 ['file:///C:/local.txt', undefined, null],
 ['not a url', undefined, null],
 [null, undefined, null],
 [42, undefined, null]
];
for (const [input, base, expected] of cases) assert.equal(clean(input, base), expected);

// Verify gesture routing and cancellation without relying on browser UI state.
const handlers = new Map();
const messages = [];
let statusListener;
let replyOk = true;
const fakeNode = () => ({ style:{}, append(){}, setAttribute(){}, remove(){}, attachShadow(){ return {append(){}}; } });
class Element {
 constructor(tag, href, attrs={}) { this.tag = tag; this.href = href; this.attrs=attrs; this.baseURI = 'https://example.com/base'; }
 matches(selector) {
  if(selector.includes('button')) return this.tag==='button' || this.attrs.role==='button';
  return ['a','area'].includes(this.tag) && this.href !== undefined;
 }
 getAttribute(name) { return name==='href' ? this.href : (this.attrs[name] ?? null); }
}
const content = vm.createContext({
 URL, Element, setTimeout() {},
 document: { createElement: fakeNode, body: { append(){} }, location: {hostname:'example.com',pathname:'/'} },
 window: { addEventListener(type, fn) { handlers.set(type, fn); } },
 chrome: { runtime: {
  id: 'test', getManifest: () => ({version:'0.2.1'}),
  onMessage: { addListener(fn) { statusListener=fn; } },
  sendMessage(message, callback) { messages.push(message); callback({ok:replyOk}); }
 } }
});
vm.runInContext(source('cleaner.js'), content);
vm.runInContext(source('pinterest.js'), content);
vm.runInContext(source('content.js'), content);
function fire(type, override = {}) {
 const event = { type, button:1, ctrlKey:true, isTrusted:true, prevented:false, stopped:false,
  composedPath: () => [new Element('span'), new Element('a', '/target?remove=yes#keep')],
  preventDefault() { this.prevented=true; }, stopImmediatePropagation() { this.stopped=true; }, ...override };
 handlers.get(type)(event);
 return event;
}
assert.equal(fire('pointerdown').prevented, true);
assert.equal(messages.length, 1);
assert.equal(messages[0].url, 'https://example.com/target#keep');
// The anchor may disappear and Ctrl may be released before mouseup/auxclick.
for (const type of ['mousedown','pointerup','mouseup','auxclick']) {
 const event = fire(type, {ctrlKey:false,composedPath:()=>[]});
 assert.equal(event.prevented, true);
 assert.equal(event.stopped, true);
}
assert.equal(messages.length, 1);
assert.equal(fire('auxclick').prevented, false);
for (const override of [{ctrlKey:false}, {button:0}, {shiftKey:true}, {altKey:true}, {metaKey:true}, {isTrusted:false},
 {composedPath:()=>[new Element('a','javascript:alert(1)')]}, {composedPath:()=>[new Element('div')]}]) {
 assert.equal(fire('pointerdown',override).prevented, false);
 assert.equal(fire('auxclick',override).prevented, false);
}
assert.equal(messages.length, 1);
// Mouse-only fallback must open once, without needing an auxclick target.
assert.equal(fire('mousedown').prevented,true);
assert.equal(messages.length,2);
fire('mouseup'); fire('auxclick');
assert.equal(messages.length,2);
// Missing auxclick must not swallow a subsequent unmodified middle click.
fire('pointerdown'); fire('pointerup');
assert.equal(fire('pointerdown',{ctrlKey:false}).prevented,false);
assert.equal(fire('mousedown',{ctrlKey:false}).prevented,false);
assert.equal(fire('auxclick',{ctrlKey:false}).prevented,false);
assert.equal(messages.length,3);
let status;
statusListener({type:'CLEAN_LINK_STATUS'}, {}, value=>{status=value;});
assert.equal(status.ready,true);
assert.equal(status.lastAction.status,'opened');
assert.equal(status.lastAction.originalUrl,'https://example.com/target?remove=yes#keep');
assert.equal(status.lastAction.url,'https://example.com/target#keep');
replyOk=false;
fire('pointerdown'); fire('auxclick');
statusListener({type:'CLEAN_LINK_STATUS'}, {}, value=>{status=value;});
assert.equal(status.lastAction.status,'failed');
// Reloading the content script in the same document must not duplicate listeners.
vm.runInContext(source('content.js'), content);
assert.equal(handlers.size,5);

// Reproduce a Pinterest pin detail page: Visit is a button, not an anchor.
const marketplace = 'https://market.example/items/sample';
const visit = new Element('button',undefined,{'aria-label':'Ziyaret et'});
const marker = new Element('div',undefined,{'data-test-id':'main-pin-section-visit-button'});
content.document.location={hostname:'tr.pinterest.com',pathname:'/pin/1234567890/'};
let outbound=[new Element('a',marketplace+'?utm_source=Pinterest&utm_medium=organic')];
content.document.querySelectorAll=()=>outbound;
replyOk=true;
const pinterestEvent={composedPath:()=>[new Element('span'),visit,marker]};
const before=messages.length;
assert.equal(fire('pointerdown',pinterestEvent).prevented,true);
fire('mousedown',pinterestEvent); fire('pointerup',pinterestEvent); fire('mouseup',pinterestEvent); fire('auxclick',pinterestEvent);
assert.equal(messages.length,before+1);
assert.equal(messages.at(-1).url,marketplace);
assert.equal(fire('pointerdown',{...pinterestEvent,ctrlKey:false}).prevented,false);
assert.equal(fire('auxclick',{...pinterestEvent,ctrlKey:false}).prevented,false);
outbound.push(new Element('a','https://unrelated.example/?tracking=1'));
assert.equal(fire('pointerdown',pinterestEvent).prevented,false);
outbound=[new Element('a',marketplace+'?utm_source=Pinterest&utm_medium=organic')];
assert.equal(fire('pointerdown',{composedPath:()=>[new Element('button',undefined,{'aria-label':'Kaydet'})]}).prevented,false);
content.document.location={hostname:'example.com',pathname:'/pin/1234567890/'};
assert.equal(fire('pointerdown',pinterestEvent).prevented,false);
content.document.location={hostname:'tr.pinterest.com',pathname:'/ideas/'};
assert.equal(fire('pointerdown',pinterestEvent).prevented,false);

let listener;
const opened = [];
let fail = false;
context.importScripts = () => {};
context.chrome = {
 runtime: { id: 'test-extension', onMessage: { addListener(fn) { listener = fn; } }, getURL: value => `chrome-extension://test-extension/${value}` },
 tabs: { async create(options) { if (fail) throw new Error('test failure'); opened.push(options); } }
};
vm.runInContext(source('background.js'), context);
const sender = { id: 'test-extension', tab: { id: 7, windowId: 3, index: 2 } };
async function send(message, from = sender) {
 return await new Promise(resolve => listener(message, from, resolve));
}
(async () => {
 assert.equal((await send({ type: 'OPEN_CLEAN_LINK', url: 'https://example.com/?token=x#keep' })).ok, true);
 assert.deepEqual(JSON.parse(JSON.stringify(opened[0])), {
  url: 'https://example.com/#keep', active: false, windowId: 3, openerTabId: 7, index: 3
 });
 for (const url of ['javascript:alert(1)', 'file:///C:/foo', 'broken', null]) {
  assert.equal((await send({ type: 'OPEN_CLEAN_LINK', url })).ok, false);
 }
 assert.equal((await send({ type: 'OPEN_CLEAN_LINK', url: 'https://example.com/' }, { id: 'other', tab: sender.tab })).ok, false);
 assert.equal((await send({ type: 'OPEN_CLEAN_LINK', url: 'https://example.com/' }, { id: 'test-extension' })).ok, false);
 assert.equal(opened.length, 1);
 fail = true;
 assert.equal((await send({ type: 'OPEN_CLEAN_LINK', url: 'https://example.com/' })).ok, false);
 fail = false;
 console.log(`PASS: ${cases.length} URL cases; early gesture handling, DOM replacement, Ctrl release, deduplication, normal-click exclusions, status replies; Pinterest Visit button, generic marketplace target, ambiguity and domain restrictions; background validation and error handling.`);
})();


