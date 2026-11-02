export const berlinDay=value=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date(value));
export function nextMidnight(value){const now=new Date(value),day=berlinDay(now);let low=now.getTime(),high=low+26*3600000;while(high-low>1){const mid=Math.floor((low+high)/2);if(berlinDay(mid)===day)low=mid;else high=mid;}return high;}
