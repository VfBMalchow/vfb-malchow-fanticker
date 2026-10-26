// Adapt the result archive to a Redis hash per Berlin calendar day.
// Every match is a separate hash field; simultaneous requests cannot overwrite other matches.
export function redisBucket(env=process.env,fetcher=fetch){
 const url=env.UPSTASH_REDIS_REST_URL||env.KV_REST_API_URL,token=env.UPSTASH_REDIS_REST_TOKEN||env.KV_REST_API_TOKEN;
 if(!url||!token)return null;
 if(new URL(url).protocol!=='https:')throw Error('Redis requires HTTPS');
 async function command(args){const r=await fetcher(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Result storage request failed');const json=await r.json();if(json.error)throw Error('Result storage command failed');return json.result}
 const values=new Map();
 return {
 async list({prefix}){const key='fanticker:'+prefix;const raw=await command(['HGETALL',key]);const entries=Array.isArray(raw)?Array.from({length:raw.length/2},(_,i)=>[raw[i*2],raw[i*2+1]]):Object.entries(raw||{});for(const [id,value]of entries)values.set(prefix+id,value);return {objects:entries.map(([id])=>({key:prefix+id})),truncated:false}},
 async get(key){const value=values.get(key);return value==null?null:{json:async()=>JSON.parse(value)}},
 async put(key,value){const slash=key.lastIndexOf('/')+1,prefix=key.slice(0,slash),id=key.slice(slash),redisKey='fanticker:'+prefix;await command(['HSET',redisKey,id,value]);await command(['EXPIRE',redisKey,172800]);values.set(key,value)}
 };
}
