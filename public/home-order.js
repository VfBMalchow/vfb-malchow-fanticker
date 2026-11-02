import {cityFirst} from './stadtliga-model.js';
function order(){const container=document.querySelector('.home-sections'),vmv=document.querySelector('#vmv-block'),city=document.querySelector('#stadtliga-content');if(!container||!vmv||!city)return;const detail=new URLSearchParams(location.search).has('match');city.hidden=detail;const first=cityFirst(vmv.dataset.next??Infinity,city.dataset.next??Infinity)?city:vmv;if(container.firstElementChild!==first)container.prepend(first);}
document.addEventListener('home-order',order);window.addEventListener('popstate',order);order();
