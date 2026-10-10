'use strict';
(function (root) {
  const URL = 'https://ignkzfqrlgkhboqhhxew.supabase.co';
  const KEY = 'sb_publishable_3TdwbfrdPzxjKfPIUg---w_pYyntp1o';
  const TYPES = {spring:'Աղբյուր',waterfall:'Ջրվեժ',river:'Գետ',lake:'Լիճ',reservoir:'Ջրամբար',canal:'Ջրանցք',wetland:'Խոնավ տարածք',hydropower:'ՀԷԿ',other:'Այլ'};
  const KINDS = {new:'Նոր օբյեկտ',correction:'Տվյալների ուղղում',addition:'Լրացում',general:'Ընդհանուր առաջարկ'};
  const STATUSES = {pending:'Սպասում է ստուգման',needs_details:'Ճշտում է պահանջվում',accepted:'Ընդունված',rejected:'Մերժված'};
  const FIELDS = {type:'Տեսակ',name_hy:'Անվանում',province:'Մարզ',description_hy:'Նկարագրություն',latitude:'Լայնություն',longitude:'Երկայնություն',status:'Կարգավիճակ'};
  let session = null;
  try { session = JSON.parse(sessionStorage.getItem('atlas-feedback-session') || 'null'); } catch {}
  function saveSession(value) { session=value; if(value) sessionStorage.setItem('atlas-feedback-session',JSON.stringify(value)); else sessionStorage.removeItem('atlas-feedback-session'); }
  async function fetchJSON(path, options={}, admin=false, retry=true) {
    if (admin && session && session.expires_at && session.expires_at < Date.now()/1000+30) await refresh();
    const headers = {apikey:KEY,...options.headers};
    if (admin && session) headers.Authorization = 'Bearer '+session.access_token;
    if (options.body !== undefined && !(options.body instanceof Blob)) headers['Content-Type']='application/json';
    let response;
    try { response=await fetch(URL+path,{...options,headers,body:options.body === undefined ? undefined : options.body instanceof Blob ? options.body : JSON.stringify(options.body)}); }
    catch { throw new Error('Կապը չհաջողվեց։ Ստուգեք համացանցը և կրկին փորձեք։'); }
    if (response.status===401 && admin && session && retry) { await refresh(); return fetchJSON(path,options,admin,false); }
    const text=await response.text();let result;try{result=text?JSON.parse(text):null;}catch{result=null;}
    if(!response.ok) { const e=new Error(result?.message||result?.msg||result?.error_description||result?.error||'Հարցումը չհաջողվեց ('+response.status+')։'); e.code=result?.code;e.status=response.status;throw e; }
    return result;
  }
  async function refresh() {
    if(!session?.refresh_token) throw new Error('Մուտք գործեք կառավարման էջ։');
    try { const value=await fetchJSON('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});saveSession({...value,expires_at:Date.now()/1000+value.expires_in}); }
    catch(e){saveSession(null);throw e;}
  }
  async function signIn(email,password) {const value=await fetchJSON('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});saveSession({...value,expires_at:Date.now()/1000+value.expires_in});return value;}
  async function signOut(){try{if(session)await fetchJSON('/auth/v1/logout',{method:'POST'},true);}finally{saveSession(null);}}
  const rpc=(name,body,admin=false)=>fetchJSON('/rest/v1/rpc/'+name,{method:'POST',body},admin);
  async function loadObjects(){const rows=[];for(let offset=0;;offset+=1000){const page=await fetchJSON('/rest/v1/water_objects?select=id,type,name_hy,province,description_hy,latitude,longitude,status&order=name_hy.asc,id.asc&limit=1000&offset='+offset);rows.push(...page);if(page.length<1000)break;}return rows;}
  function coordinates(latitude,longitude) { if(latitude===''||longitude===''||latitude===null||longitude===null)return null;const lat=Number(latitude),lon=Number(longitude);return Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{latitude:lat,longitude:lon}:null; }
  function parseCoordinates(value){const parts=value.trim().split(/[\s,;]+/).filter(Boolean);return parts.length===2?coordinates(parts[0],parts[1]):null;}
  function validPhone(value){return /^[+\d\s().-]+$/.test(value)&&/^\d{8,15}$/.test(value.replace(/\D/g,''));}
  function validateReport(r){if(!KINDS[r.kind])return 'Ընտրեք հաղորդման նպատակը։';if(!validPhone(r.reporter_phone||''))return 'Լրացրեք հեռախոսահամարը՝ 8–15 թվանշանով։';if((r.description||'').trim().length<5)return 'Նկարագրեք ձեր տեղեկությունը՝ առնվազն 5 նիշով։';if(r.description.length>5000)return 'Նկարագրությունը պետք է լինի մինչև 5000 նիշ։';if(!r.consent)return 'Հաստատեք տվյալներն ուղարկելու համաձայնությունը։';if(r.kind!=='general'&&!TYPES[r.object_type])return 'Ընտրեք օբյեկտի տեսակը։';if(r.kind==='new'&&!coordinates(r.latitude,r.longitude))return 'Նոր օբյեկտի համար նշեք կոորդինատները։';if((r.latitude!==null||r.longitude!==null)&&!coordinates(r.latitude,r.longitude))return 'Ստուգեք երկու կոորդինատները։';return '';}
  function validateFiles(files){if(files.length>5)return 'Կարելի է կցել առավելագույնը 5 լուսանկար։';for(const file of files){if(!['image/jpeg','image/png','image/webp'].includes(file.type))return 'Ընդունվում են JPG, PNG կամ WebP լուսանկարներ։';if(file.size>8*1024*1024)return 'Յուրաքանչյուր լուսանկարը պետք է լինի մինչև 8 ՄԲ։';}return '';}
  function preparedMessage(r){const lines=[KINDS[r.kind]||'Հաղորդում'];if(r.object_type)lines.push('Տեսակը՝ '+(TYPES[r.object_type]||r.object_type));if(r.object_name)lines.push('Հայտնի անունը՝ '+r.object_name);if(r.local_name)lines.push('Տեղացիների անվանումը՝ '+r.local_name);if(r.settlement)lines.push('Մոտակա բնակավայրը՝ '+r.settlement);if(coordinates(r.latitude,r.longitude))lines.push('Կոորդինատները՝ '+r.latitude+', '+r.longitude);if(r.at_object)lines.push('Հայտնողը տվյալ պահին օբյեկտի մոտ է։');if(r.observed_on)lines.push('Դիտարկման օրը՝ '+r.observed_on);if(r.water_state)lines.push('Ջրի առկայությունը՝ '+({present:'Առկա է',absent:'Բացակայում է',unknown:'Չգիտեմ'}[r.water_state]||''));lines.push('',r.description||'');return lines.join('\n');}
  function diff(before,patch){return Object.entries(patch).filter(([key,value])=>JSON.stringify(before?.[key]??null)!==JSON.stringify(value??null)).map(([key,value])=>({key,label:FIELDS[key]||key,before:before?.[key]??null,after:value}));}
  function showError(error){if(error.code==='PGRST202'||error.code==='PGRST205')return 'Հաղորդումների համակարգը դեռ միացված չէ։ Փորձեք ավելի ուշ։';return error.message||'Չհաջողվեց ավարտել գործողությունը։';}
  const api={URL,KEY,TYPES,KINDS,STATUSES,FIELDS,fetchJSON,rpc,loadObjects,signIn,signOut,getSession:()=>session,coordinates,parseCoordinates,validPhone,validateReport,validateFiles,preparedMessage,diff,showError};
  root.AtlasFeedback=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
