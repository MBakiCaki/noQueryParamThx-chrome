const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.equal(manifest.version,'0.2.1');
for (const file of [manifest.background.service_worker,manifest.action.default_popup,...manifest.content_scripts[0].js]) {
 assert.ok(fs.existsSync(path.join(root,file)),file);
}
const html=fs.readFileSync(path.join(root,'popup.html'),'utf8');
const source=fs.readFileSync(path.join(root,'popup.js'),'utf8');
async function run(reply, error=false) {
 const nodes = new Map([...html.matchAll(/id="([^"]+)"/g)].map(match=>[match[1],{textContent:'',hidden:true,addEventListener(type,fn){this.click=fn;}}]));
 const body={dataset:{}};
 const opened=[];
 const context=vm.createContext({
  document:{body,querySelector(selector){const node=nodes.get(selector.slice(1));assert.ok(node,selector);return node;}},
  chrome:{runtime:{getManifest:()=>manifest,getURL:file=>'chrome-extension://test/'+file},tabs:{
   query:async()=>[{id:10}],sendMessage:async(id,message,options)=>{
    assert.equal(id,10); assert.equal(message.type,'CLEAN_LINK_STATUS'); assert.equal(options.frameId,0);
    if(error) throw new Error('no content script'); return reply;
   },create:async options=>opened.push(options)
  }}
 });
 vm.runInContext(source,context);
 await new Promise(resolve=>setImmediate(resolve));
 nodes.get('demo').click();
 assert.equal(opened[0].url,'chrome-extension://test/deneme.html');
 return {nodes,body};
}
(async()=>{
 let result=await run({ready:true,lastAction:null});
 assert.equal(result.body.dataset.state,'ready');
 assert.match(result.nodes.get('help').textContent,/henüz/);
 result=await run({ready:true,lastAction:{status:'opened',originalUrl:'https://example.com/?q=1',url:'https://example.com/'}});
 assert.equal(result.nodes.get('last').hidden,false);
 assert.equal(result.nodes.get('clean').textContent,'https://example.com/');
 assert.equal(result.nodes.get('original').textContent,'https://example.com/?q=1');
 result=await run(null,true);
 assert.equal(result.body.dataset.state,'unavailable');
 assert.match(result.nodes.get('help').textContent,/Site erişimi/);
 console.log('PASS: manifest assets; popup ready, last-action, unavailable and demo-button states.');
})().catch(error=>{console.error(error);process.exitCode=1;});

