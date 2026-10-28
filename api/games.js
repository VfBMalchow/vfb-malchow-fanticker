import {getGames} from '../lib/games.js';
import {createGamesCache} from '../lib/games-cache.js';
const cachedGames=createGamesCache(getGames);
export function createHandler(load=cachedGames){return async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');res.setHeader('Cache-Control','no-store');res.setHeader('Vercel-CDN-Cache-Control','no-store');return res.status(405).end()}
 try{const {data,maxAge}=await load();res.setHeader('Cache-Control','public, max-age=0, must-revalidate');res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage='+maxAge);return res.status(200).json(data)}
 catch{res.setHeader('Cache-Control','no-store');res.setHeader('Vercel-CDN-Cache-Control','no-store');return res.status(503).json({error:'Spieldaten vorübergehend nicht verfügbar'})}
}}
export default createHandler();
