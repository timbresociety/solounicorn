'use client';
import { useEffect, useState } from 'react';
export default function PwaRegistration(){
 const [waiting,setWaiting]=useState(false);
 useEffect(()=>{
  if(process.env.NODE_ENV!=='production'||!('serviceWorker' in navigator))return;
  let disposed=false;
  const update=()=>{if(!disposed)setWaiting(true);};
  void navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(registration=>{
   if(registration.waiting)update();
   registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)update();});});
  }).catch(()=>undefined);
  return()=>{disposed=true;};
 },[]);
 return waiting?<aside className="pwa-update" role="status">Update ready. Pause, wait for “Saved on this device”, then close every game tab to install safely. Your partial work stays saved.</aside>:null;
}
