import {existsSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const legacyRoot='dist/client';
const isNextBuild=existsSync('.next');
const root=isNextBuild?'.next':legacyRoot;
const staticRoot=isNextBuild?join(root,'static'):join(root,'_next');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);}
const assets=walk(staticRoot).filter(file=>/\.(js|css|woff2?)$/.test(file)).map(file=>`/_next/static/${relative(staticRoot,file).split('\\').join('/')}`).sort();
const source=readFileSync('public/sw.js','utf8');
const version=createHash('sha256').update(JSON.stringify(assets)+source).digest('hex').slice(0,12);
const worker=source.replace('const BUILD_ASSETS = [];',`const BUILD_ASSETS = ${JSON.stringify(assets)};`).replace("'opu-founder-company-2'",`'opu-founder-${version}'`);
writeFileSync(isNextBuild?'public/sw.js':join(root,'sw.js'),worker);
console.log(`Offline package: ${assets.length} immutable files, build ${version}.`);
