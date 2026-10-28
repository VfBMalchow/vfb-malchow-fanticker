// Short-lived cache within a function instance. The response is also shared by Vercel's CDN.
export function createGamesCache(load,{now=Date.now,ttlMs=15000}={}){
 let value=null,expiresAt=0,pending=null;
 return async function cachedGames(){
  if(!value||now()>=expiresAt){
   if(!pending){pending=(async()=>{const fresh=await load();value=fresh;expiresAt=now()+ttlMs;return fresh})().finally(()=>{pending=null})}
   await pending;
  }
  return {data:value,maxAge:Math.max(1,Math.ceil((expiresAt-now())/1000))};
 };
}
