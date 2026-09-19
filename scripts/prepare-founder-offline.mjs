import {existsSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const isNextBuild=existsSync('.next/BUILD_ID');
const root=isNextBuild?'.next':'dist/client';
const staticRoot=isNextBuild?join(root,'static'):join(root,'_next');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);}
const files=walk(staticRoot).filter(file=>/\.(js|css|woff2?)$/.test(file));
const staticAssets=files.map(file=>`/_next/static/${relative(staticRoot,file).split('\\').join('/')}`);
const publicFiles=walk('public').filter(p=>p!=='public/sw.js');
const assets=['/','/manifest.webmanifest',...staticAssets,...publicFiles.map(p=>'/'+relative('public',p))].sort();
const source=readFileSync('scripts/founder-sw.template.txt','utf8');
const hash=createHash('sha256').update(source).update(JSON.stringify(assets));
for(const file of [...files,...publicFiles].sort())hash.update(readFileSync(file));
if(isNextBuild)hash.update(readFileSync('.next/BUILD_ID'));
const version=hash.digest('hex').slice(0,12);
const worker=source.replace('__CACHE__',`opu-founder-${version}`).replace('__ASSETS__',JSON.stringify(assets));
writeFileSync(isNextBuild?'public/sw.js':join(root,'sw.js'),worker);
console.log(`Offline package: ${staticAssets.length} immutable files, ${publicFiles.length} public assets, build ${version}.`);
