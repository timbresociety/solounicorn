import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync('public/sw.js','utf8');
assert(!source.includes('__ASSETS__'));
const handlers={},entries=new Map(),cacheNames=new Map();let failInstall=false,networkCalls=0;
const cache={addAll:async urls=>{if(failInstall)throw Error('missing asset');for(const url of urls)entries.set(url,new Response(url));},match:async key=>entries.get(typeof key==='string'?key:key.url)};
const context={URL,Response,fetch:async()=>{networkCalls++;throw Error('offline');},caches:{open:async key=>{cacheNames.set(key,cache);return cache;},keys:async()=>[...cacheNames.keys()],delete:async key=>cacheNames.delete(key)},self:{location:{origin:'https://game.local'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>handlers[name]=fn}};
vm.runInNewContext(source,context);
const fire=async name=>{let pending;handlers[name]({waitUntil:p=>pending=p});await pending;};
await fire('install');assert(entries.has('/founder-assets/environments.png'));assert(entries.has('/founder-assets/manifest.json'));
for(const url of entries.keys())if(url.startsWith('/_next/static/'))assert(existsSync('.next/static/'+url.slice('/_next/static/'.length)),url);
for(const url of ['/','/founder-assets/environments.png']){
 let response;handlers.fetch({request:{url:'https://game.local'+url,method:'GET',mode:url==='/'?'navigate':'cors'},respondWith:p=>response=p});assert.equal(await (await response).text(),url);
}
assert.equal(networkCalls,0);await fire('activate');failInstall=true;await assert.rejects(()=>fire('install'));assert.equal(cacheNames.size,0);
assert(!source.includes('skipWaiting('));
const result={passed:true,checks:['atomic failed install removes candidate cache','complete public art and build asset manifest','all generated chunks exist','offline document and art cache hit','worker never forces activation'],browserOfflineReload:'pending owner authorization',device:'Node mocked Cache API, not browser'};
writeFileSync('artifacts/qa/founder-revamp/S14/offline.json',JSON.stringify(result,null,2));console.log(result);
