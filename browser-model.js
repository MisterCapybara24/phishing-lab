const names=['url_length','dots','hyphens','special_chars','https','is_ip','subdomains'];
const cache=new Map();
function load(file){if(!cache.has(file))cache.set(file,fetch(new URL(file,import.meta.url)).then(r=>{if(!r.ok)throw Error('Не удалось загрузить '+file);return r.json();}).catch(e=>{cache.delete(file);throw e;}));return cache.get(file);}
export async function extract(raw){
 const value=raw.trim();
 if(!value||[...value].length>20000||/\s/.test(value)||!/^https?:\/\//i.test(value))throw Error('Укажите полный HTTP или HTTPS URL без пробелов.');
 let u;try{u=new URL(value);}catch{throw Error('Некорректный URL.');}
 let host=u.hostname.replace(/^\[|\]$/g,'').replace(/\.$/,'');
 // Reject WHATWG shorthand IPv4 and backslash rewrites, which differ from Python urlsplit.
 const authority=value.split('://')[1].split(/[/?#]/)[0].split('@').pop();
 const rawHost=authority.startsWith('[')?authority.slice(1,authority.indexOf(']')):authority.split(':')[0].replace(/\.$/,'');
 if(value.includes('\\')||(/^[\d.]+$/.test(host)&&host!==rawHost))throw Error('Используйте стандартный адрес: полный IPv4 или доменное имя, без обратных слешей.');
 const ip=host.includes(':')||/^(\d{1,3}\.){3}\d{1,3}$/.test(host);
 if(!ip&&host.split('.').some(p=>!p||p.length>63||!/^[a-z0-9-]+$/i.test(p)))throw Error('Некорректное имя сайта.');
 let sub=0;
 if(!ip){const rules=new Set(await load('suffixes.json'));const parts=host.split('.');let suffix=0;for(let i=0;i<parts.length;i++){const tail=parts.slice(i).join('.');if(rules.has('!'+tail)){suffix=parts.length-i-1;break;}if(rules.has(tail))suffix=Math.max(suffix,parts.length-i);if(i+1<parts.length&&rules.has('*.'+parts.slice(i+1).join('.')))suffix=Math.max(suffix,parts.length-i);}sub=Math.max(0,parts.length-suffix-1);}
 const punctuation=new Set('!"#$%&\'()*+,/:;<=>?@[\\]^_`{|}~');
 return [[...value].length,[...value].filter(c=>c==='.').length,[...value].filter(c=>c==='-').length,[...value].filter(c=>punctuation.has(c)).length,Number(u.protocol==='https:'),Number(ip),sub];
}
export async function predict(data){
 if(!['logistic','forest'].includes(data.model))throw Error('Неизвестная модель.');
 const x=data.url!==undefined?await extract(data.url):data.features;
 if(!Array.isArray(x)||x.length!==7||x.some(v=>!Number.isInteger(v)||v<0||v>20000)||x[0]<1||![0,1].includes(x[4])||![0,1].includes(x[5]))throw Error('Нужны 7 целых признаков. HTTPS и IP: 0 или 1.');
 const m=await load('models.json');let probability,contributions=null;
 if(data.model==='logistic'){const c=x.map((v,i)=>(v-m.mean[i])/m.scale[i]*m.coef[i]);const z=m.intercept+c.reduce((a,b)=>a+b,0);probability=z>=0?1/(1+Math.exp(-z)):Math.exp(z)/(1+Math.exp(z));contributions=Object.fromEntries(names.map((k,i)=>[k,c[i]]));}
 else{const xf=x.map(Math.fround);probability=m.trees.reduce((sum,t)=>{let n=0;while(t.left[n]!==-1)n=xf[t.feature[n]]<=t.threshold[n]?t.left[n]:t.right[n];return sum+t.probability[n];},0)/m.trees.length;}
 return {model:data.model,probability,phishing:probability>=.5,threshold:.5,features:Object.fromEntries(names.map((k,i)=>[k,x[i]])),contributions,note:'Учебная модель, не гарантия безопасности. Вычисление выполняется в вашем браузере. Содержимое сайта не проверяется.'};
}
export async function api(path,data){if(path==='/overview')return load('overview.json');if(path==='/report')return load('report.json');if(path==='/status')return {job:null,chatEnabled:false};if(path==='/predict')return predict(data);throw Error('Эта функция доступна в локальной версии лаборатории.');}
