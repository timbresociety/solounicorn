import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root='dist/client';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);}
const assets=walk(join(root,'_next')).filter(file=>/\.(js|css|woff2?)$/.test(file)).map(file=>'/'+relative(root,file).split('\\').join('/')).sort();
const source=readFileSync('public/sw.js','utf8');
const version=createHash('sha256').update(JSON.stringify(assets)+source).digest('hex').slice(0,12);
const worker=source.replace('const BUILD_ASSETS = [];',`const BUILD_ASSETS = ${JSON.stringify(assets)};`).replace("'opu-founder-company-2'",`'opu-founder-${version}'`);
writeFileSync(join(root,'sw.js'),worker);
console.log(`Offline package: ${assets.length} immutable files, build ${version}.`);
