const DB_NAME='BakerCalculatorV2';
export function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{req.result.createObjectStore('recipes',{keyPath:'id'});req.result.createObjectStore('meta');};req.onsuccess=()=>{req.result.onversionchange=()=>req.result.close();resolve(req.result);};req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('Close other Baker Calculator tabs and try again.'));});}
async function operation(store,mode,action){const db=await openDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);let result;const req=action(tx.objectStore(store));req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||req.error);tx.onabort=()=>reject(tx.error||Error('Storage operation was interrupted.'));});}finally{db.close();}}
export const getRecipes=()=>operation('recipes','readonly',s=>s.getAll());
export const putRecipe=r=>operation('recipes','readwrite',s=>s.put(r));
export const deleteRecipe=id=>operation('recipes','readwrite',s=>s.delete(id));
const getMeta=key=>operation('meta','readonly',s=>s.get(key));
const setMeta=(key,value)=>operation('meta','readwrite',s=>s.put(value,key));
export function photoBlob(value){
 if(!value)return null;if(value instanceof Blob)return value;
 if(typeof value!=='string'||!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(value))throw Error('Unsupported saved image.');
 const [head,data]=value.split(','),bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));return new Blob([bytes],{type:head.slice(5).split(';')[0]});
}
export function legacyRecords(raw,key,lookup=()=>null){
 const a=JSON.parse(raw||'[]');if(!Array.isArray(a))throw Error('Saved recipe list is unreadable.');
 return a.map((r,i)=>{
  if(!r||typeof r!=='object')throw Error('Saved recipe record is unreadable.');
  const old=key==='bcRecipeLibraryV1';
  let notes=String(r.notes||'');
  if(old&&Array.isArray(r.ingredients)&&r.ingredients.length){const lines=r.ingredients.map(x=>`${x.grams==null?`${x.amount??''} ${x.unit||''}`:`${Math.round(x.grams)} g`} ${lookup(x.ingredient)?.name||String(x.ingredient||'Ingredient').replaceAll('_',' ')}`);notes=[lines.join('\n'),notes].filter(Boolean).join('\n\n');}
  return {id:`${key}:${r.id??i}`,name:String(old?r.name||'Saved recipe':r.n||'Saved recipe'),notes,category:String(r.category||'Other'),photo:old?null:photoBlob(r.photo),created:Number(r.created)||Number(r.id)||Date.now(),updated:Number(r.updated)||Number(r.created)||Number(r.id)||Date.now(),legacyPhotoId:old&&r.hasPhoto?r.id:null};
 });
}
async function oldPhoto(id){
 if(indexedDB.databases){const dbs=await indexedDB.databases();if(!dbs.some(d=>d.name==='BakerCalculatorDB'))return null;}
 return new Promise((resolve,reject)=>{const req=indexedDB.open('BakerCalculatorDB');let absent=false;req.onupgradeneeded=()=>{absent=true;req.transaction.abort();};req.onerror=()=>absent?resolve(null):reject(req.error);req.onsuccess=()=>{const db=req.result;if(!db.objectStoreNames.contains('photos')){db.close();resolve(null);return;}const q=db.transaction('photos').objectStore('photos').get(id);q.onsuccess=()=>{db.close();resolve(q.result||null);};q.onerror=()=>{db.close();reject(q.error);};};});
}
export async function migrate(lookup){
 const issues=[];let count=0;
 for(const key of ['bcFreshRecipes','bcRecipeLibraryV1']){
  try{
   if(await getMeta(`migrated:${key}`))continue;
   const rows=legacyRecords(localStorage.getItem(key),key,lookup);
   for(const r of rows){
    if(r.legacyPhotoId){r.photo=await oldPhoto(r.legacyPhotoId);if(!r.photo)r.notes+='\n\n[The original photo could not be found on this device.]';}
    delete r.legacyPhotoId;
    const existing=await operation('recipes','readonly',s=>s.get(r.id));
    if(!existing){await putRecipe(r);count++;}
   }
   await setMeta(`migrated:${key}`,true);
  }catch{issues.push(`Some older recipes could not be recovered (${key==='bcFreshRecipes'?'recent version':'earlier version'}). The original data has been left intact.`);}
 }
 return {count,issues};
}
export function validateBackup(data){
 if(!data||data.format!=='baker-calculator-recipes'||data.version!==1||!Array.isArray(data.recipes)||data.recipes.length>1000)throw Error('Choose a Baker Calculator recipe backup (up to 1,000 recipes).');
 return data.recipes.map((r,i)=>{if(!r||typeof r.name!=='string'||!r.name.trim()||r.name.length>150||typeof r.notes!=='string'||r.notes.length>100000||typeof r.id!=='string')throw Error(`Recipe ${i+1} is invalid.`);const photo=photoBlob(r.photo);if(photo&&photo.size>8*1024*1024)throw Error('A backup photo is too large.');return {id:`import:${r.id}`,name:r.name,notes:r.notes,photo,category:String(r.category||'Other'),created:Number(r.created)||Date.now(),updated:Number(r.updated)||Date.now()};});
}
export async function importRecipes(rows){
 const db=await openDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction('recipes','readwrite'),s=tx.objectStore('recipes');for(const r of rows)s.add({...r,id:crypto.randomUUID()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
