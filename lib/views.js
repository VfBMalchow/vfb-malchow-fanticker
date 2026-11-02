import {berlinDay,nextMidnight} from '../public/counter-time.js';
export async function dailyViews({increment=false,env=process.env,fetcher=fetch,now=Date.now()}={}){
 const raw=env.UPSTASH_REDIS_REST_URL?.trim(),token=env.UPSTASH_REDIS_REST_TOKEN?.trim().replace(/^Bearer\s+/i,'');
 if(!raw||!token)throw Error('counter_not_configured');
 let url;try{url=new URL(raw);}catch{throw Error('counter_not_configured');}if(url.protocol!=='https:'||!url.hostname.endsWith('.upstash.io')||url.username||url.password||url.search||url.hash)throw Error('counter_not_configured');
 const date=berlinDay(now),key='fanticker:pageviews:'+date;
 const commands=increment?[['INCR',key],['EXPIRE',key,172800,'NX']]:['GET',key];
 const response=await fetcher(url.origin+(increment?'/multi-exec':''),{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(commands),signal:AbortSignal.timeout(5000)});
 if([401,403].includes(response.status))throw Error('counter_auth_failed');if(response.status===429)throw Error('counter_limit_reached');if(!response.ok)throw Error('counter_unavailable');const data=await response.json();
 const message=String((Array.isArray(data)?data.find(x=>x?.error)?.error:data?.error)||'');
 if(message){if(/read.?only|noperm|unauth|wrongpass|token/i.test(message))throw Error('counter_auth_failed');if(/limit|quota/i.test(message))throw Error('counter_limit_reached');throw Error('counter_command_failed');}
 if(increment&&(!Array.isArray(data)||data.length!==2||data.some(x=>x.error)))throw Error('counter_unavailable');
 const record=increment?data[0]:data;if(record.error)throw Error('counter_unavailable');
 const count=record.result===null&&!increment?0:Number(record.result);
 if(!Number.isSafeInteger(count)||count<0)throw Error('counter_unavailable');
 return {date,count,nextResetAt:nextMidnight(now),timeZone:'Europe/Berlin'};
}
