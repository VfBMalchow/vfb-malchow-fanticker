import {berlinDay,nextMidnight} from '../public/counter-time.js';
export async function dailyViews({increment=false,env=process.env,fetcher=fetch,now=Date.now()}={}){
 const raw=env.UPSTASH_REDIS_REST_URL,token=env.UPSTASH_REDIS_REST_TOKEN;
 if(!raw||!token)throw Error('counter_not_configured');
 const url=new URL(raw);if(url.protocol!=='https:'||!url.hostname.endsWith('.upstash.io')||url.username||url.password||url.search||url.hash)throw Error('counter_not_configured');
 const date=berlinDay(now),key='fanticker:pageviews:'+date;
 const commands=increment?[['INCR',key],['EXPIRE',key,172800,'NX']]:['GET',key];
 const response=await fetcher(url.origin+(increment?'/multi-exec':''),{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(commands),signal:AbortSignal.timeout(5000)});
 if(!response.ok)throw Error('counter_unavailable');const data=await response.json();
 if(increment&&(!Array.isArray(data)||data.length!==2||data.some(x=>x.error)))throw Error('counter_unavailable');
 const record=increment?data[0]:data;if(record.error)throw Error('counter_unavailable');
 const count=record.result===null&&!increment?0:Number(record.result);
 if(!Number.isSafeInteger(count)||count<0)throw Error('counter_unavailable');
 return {date,count,nextResetAt:nextMidnight(now),timeZone:'Europe/Berlin'};
}
