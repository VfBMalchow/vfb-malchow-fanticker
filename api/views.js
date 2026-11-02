import {dailyViews} from '../lib/views.js';
export function createViewsHandler(load=dailyViews){return async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('Vercel-CDN-Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'method_not_allowed'});}
 if(req.method==='POST'){
 let origin;try{origin=new URL(req.headers.origin);}catch{return res.status(403).json({error:'forbidden'});}
 if(origin.host!==req.headers.host||req.headers['sec-fetch-site']==='cross-site')return res.status(403).json({error:'forbidden'});
 }
 try{return res.status(200).json(await load({increment:req.method==='POST'}));}
 catch(error){const known=['counter_not_configured','counter_auth_failed','counter_limit_reached','counter_command_failed'];const code=known.includes(error.message)?error.message:'counter_unavailable';console.error('Fan-Ticker counter:',code);return res.status(503).json({error:code});}
};}
export default createViewsHandler();
