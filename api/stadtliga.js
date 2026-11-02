import {readStoredSchedule,loadSeed} from '../lib/results-store.js';
import {createGamesCache} from '../lib/games-cache.js';
const cached=createGamesCache(readStoredSchedule,{ttlMs:60000});
export default async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).end();}
 try{const {data,maxAge}=await cached();res.setHeader('Cache-Control','public, max-age=0, must-revalidate');res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage='+maxAge);return res.status(200).json({season:data.season,teams:data.teams.filter(t=>t.source==='stadtliga'),fetchedAt:data.cityUpdatedAt||data.importedAt,storageAvailable:true});}
 catch{const seed=await loadSeed();res.setHeader('Cache-Control','no-store');res.setHeader('Vercel-CDN-Cache-Control','no-store');return res.status(200).json({season:seed.season,teams:seed.teams.filter(t=>t.source==='stadtliga'),fetchedAt:seed.importedAt,storageAvailable:false});}
}
