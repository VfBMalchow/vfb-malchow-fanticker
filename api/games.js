import {getGames} from '../lib/games.js';
export default async function handler(req,res){if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).end()}res.setHeader('Cache-Control','no-store');try{return res.status(200).json(await getGames())}catch{return res.status(503).json({error:'Spieldaten vorübergehend nicht verfügbar'})}}
