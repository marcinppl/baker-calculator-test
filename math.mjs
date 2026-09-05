export const US_CUP = 236.5882365;
export const UNITS = {
  g:{label:'g',kind:'mass',factor:1},kg:{label:'kg',kind:'mass',factor:1000},
  oz:{label:'oz (weight)',kind:'mass',factor:28.349523125},lb:{label:'lb',kind:'mass',factor:453.59237},
  ml:{label:'mL',kind:'volume',factor:1},l:{label:'L',kind:'volume',factor:1000},
  cup:{label:'US cup',kind:'volume',factor:US_CUP},metric_cup:{label:'Metric cup (250 mL)',kind:'volume',factor:250},
  tbsp:{label:'US tbsp',kind:'volume',factor:US_CUP/16},tsp:{label:'US tsp',kind:'volume',factor:US_CUP/48},
  metric_tbsp:{label:'Metric tbsp (15 mL)',kind:'volume',factor:15},metric_tsp:{label:'Metric tsp (5 mL)',kind:'volume',factor:5}
};
export function number(raw,{whole=false,positive=false,label='Amount'}={}) {
  const text=String(raw).trim().replace(',','.');
  if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) throw Error(`${label}: enter a ${whole?'whole ':''}number${positive?' above zero':''}.`);
  const n=Number(text);
  if(!Number.isFinite(n)||n>1e9||n<0||(positive&&n===0)) throw Error(`${label}: enter a number ${positive?'above zero':'from zero'} up to 1 billion.`);
  if(whole&&!Number.isInteger(n)) throw Error(`${label}: use whole grams.`);
  return n;
}
export function convert(value,from,to,ingredient) {
  if(!Number.isFinite(value)||value<0) throw Error('Enter a valid amount.');
  const a=UNITS[from],b=UNITS[to];if(!a||!b)throw Error('Choose a unit.');
  if(a.kind===b.kind)return value*a.factor/b.factor;
  const density=ingredient?.density;if(!(density>0))throw Error('No volume reference for this ingredient.');
  return a.kind==='mass'?value*a.factor/density/b.factor:value*a.factor*density/b.factor;
}
export function decimal(value,digits=6) {
  if(!Number.isFinite(value))return '—';
  if(value===0)return '0';
  return Math.abs(value)<0.000001?value.toExponential(3):Number(value.toPrecision(digits)).toString();
}
export function amountText(value,unit='g') {
  if(!Number.isFinite(value))return '—';
  if(unit!=='g')return decimal(value);
  if(value>0&&value<0.5)return '<1';
  return String(Math.round(value));
}
export function measured(value,unit='g') {
  const prefix=unit==='g'&&value>0&&Math.abs(value-Math.round(value))>1e-8&&value>=0.5?'≈ ':'';
  return `${prefix}${amountText(value,unit)} ${UNITS[unit]?.label||unit}`;
}
export function practical(ml,metric=false) {
  if(!Number.isFinite(ml)||ml<0)return '—';if(ml===0)return '0';
  const cup=metric?250:US_CUP,ts=metric?5:US_CUP/48,tb=3*ts;
  if(ml<ts/8)return `< ⅛ ${metric?'metric':'US'} tsp`;
  let rem=Math.round(ml/(ts/8))*(ts/8),whole=Math.floor(rem/cup+1e-9),parts=[];rem-=whole*cup;
  let frac='';for(const [f,s] of [[.75,'¾'],[2/3,'⅔'],[.5,'½'],[1/3,'⅓'],[.25,'¼']]){if(rem+1e-8>=cup*f){frac=s;rem-=cup*f;break;}}
  if(whole||frac)parts.push(`${whole||''}${whole&&frac?' ':''}${frac} ${metric?'metric':'US'} ${whole>1||whole&&frac?'cups':'cup'}`);
  const tbs=Math.floor(rem/tb+1e-8);rem-=tbs*tb;
  if(tbs)parts.push(`${tbs} tbsp`);
  const eighths=Math.round(rem/ts*8),w=Math.floor(eighths/8),f=['','⅛','¼','⅜','½','⅝','¾','⅞'][eighths%8];
  if(eighths)parts.push(`${w||''}${w&&f?' ':''}${f} tsp`);
  return parts.join(' + ');
}
export function starterParts(starter,hydration=100) {
  if(![starter,hydration].every(n=>Number.isFinite(n)&&n>=0))throw Error('Check starter quantities.');
  const flour=starter/(1+hydration/100);return {flour,water:starter-flour};
}
export function analyseDough(flour,water,starter=0,starterHydration=100,salt=0) {
  const p=starterParts(starter,starterHydration),totalFlour=flour+p.flour,totalWater=water+p.water;
  if(!(totalFlour>0)||[flour,water,salt].some(n=>!Number.isFinite(n)||n<0))throw Error('Total flour must be above zero; amounts cannot be negative.');
  return {totalFlour,totalWater,hydration:totalWater/totalFlour*100,saltPercent:salt/totalFlour*100,total:totalFlour+totalWater+salt};
}
export function buildDough(totalFlour,hydration,starter=0,starterHydration=100,saltPercent=2) {
  const p=starterParts(starter,starterHydration),flour=totalFlour-p.flour,water=totalFlour*hydration/100-p.water;
  if(!(totalFlour>0)||[hydration,saltPercent].some(n=>!Number.isFinite(n)||n<0))throw Error('Check flour, hydration and salt.');
  if(flour<0||water<0)throw Error('This starter supplies more flour or water than your target allows. Reduce the starter or increase the target.');
  return {flour,water,starter,salt:totalFlour*saltPercent/100};
}
export function panArea(shape,a,b,unit='cm') {
  const m=unit==='in'?2.54:1;
  if(!Number.isFinite(a)||a<=0||(shape==='rectangle'&&(!Number.isFinite(b)||b<=0)))throw Error('Pan dimensions must be above zero.');
  if(!['round','square','rectangle'].includes(shape))throw Error('Choose a pan shape.');
  return (shape==='round'?Math.PI*a*a/4:shape==='square'?a*a:a*b)*m*m;
}
export function panScale(from,to){return panArea(to.shape,to.a,to.b,to.unit)/panArea(from.shape,from.a,from.b,from.unit);}
export function oven(value,from){return from==='c'?value*9/5+32:(value-32)*5/9;}
export function scaleAmount(value,factor){if(!Number.isFinite(value)||value<0||!Number.isFinite(factor)||factor<=0)throw Error('Use a positive scale factor and valid quantities.');return value*factor;}
