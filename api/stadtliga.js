import {getStadtliga} from '../lib/stadtliga.js';
let value,expires=0,pending,retryAfter=0;
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try{
 if(Date.now()<retryAfter)throw Error('Quelle vorübergehend nicht verfügbar');
 if(!value||Date.now()>=expires){if(!pending)pending=getStadtliga().then(d=>{value=d;expires=Date.now()+60000;}).finally(()=>{pending=null;});await pending;}
 res.setHeader('Cache-Control','public, max-age=0, must-revalidate');
 res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage='+Math.max(1,Math.ceil((expires-Date.now())/1000)));
 return res.status(200).json(value);
 }catch{if(Date.now()>=retryAfter)retryAfter=Date.now()+60000;res.setHeader('Cache-Control','no-store');return res.status(503).json({error:'Stadtliga-Daten konnten nicht aktualisiert werden'});}
}
