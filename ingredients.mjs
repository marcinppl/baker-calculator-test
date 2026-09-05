import {US_CUP} from './math.mjs';
const KAB='https://www.kingarthurbaking.com/learn/ingredient-weight-chart';
const FAO='https://www.fao.org/4/t1265e/t1265e05.htm';
const entries=[
 ['all_purpose_flour','Plain flour','all-purpose flour',120,'Spoon into the cup and level; do not pack.'],
 ['bread_flour','Bread flour','strong white flour',120,'Spoon and level; reference is King Arthur bread flour.'],
 ['whole_wheat_flour','Wholemeal flour','whole wheat flour',113,'Spoon and level; whole-wheat flour reference.'],
 ['caster_sugar','Caster sugar','superfine sugar castor sugar',190,"Uses King Arthur Baker’s Special superfine sugar as a reference. Other brands vary."],
 ['granulated_sugar','Granulated sugar','white sugar',198,'Level cup of granulated white sugar.'],
 ['icing_sugar','Icing sugar','powdered sugar confectioners sugar',227/2,'Unsifted. Sifted icing sugar has a different cup weight.'],
 ['brown_sugar','Brown sugar','light dark brown sugar',213,'Pack into the cup, then level.'],
 ['butter','Butter','unsalted butter',226,'Solid butter; based on 113 g per half cup.'],
 ['cocoa_powder','Cocoa powder','unsweetened cocoa',84,'Unsweetened; 42 g per half cup, not drinking chocolate.'],
 ['honey','Honey','',336,'Based on a rounded reference of 21 g per US tablespoon.'],
 ['vegetable_oil','Vegetable oil','neutral sunflower canola oil',198,'King Arthur baking reference; brands and temperatures vary.'],
 ['baking_powder','Baking powder','',192,'4 g per US teaspoon. Use level measuring spoons.'],
 ['baking_soda','Bicarbonate of soda','baking soda bicarb',288,'3 g per half US teaspoon. Use level measuring spoons.'],
 ['instant_yeast','Instant yeast','fast action rapid rise yeast',144,'3 g per US teaspoon. A 2¼ tsp sachet is commonly rounded to 7 g.'],
 ['fine_salt','Table salt','fine salt',288,'18 g per US tablespoon. Not interchangeable by volume with flaky or kosher salt.'],
 ['diamond_salt','Kosher salt · Diamond Crystal','kosher salt',128,'8 g per US tablespoon; specifically Diamond Crystal.'],
 ['morton_salt','Kosher salt · Morton','kosher salt',256,'16 g per US tablespoon; specifically Morton.']
];
export const INGREDIENTS=entries.map(([id,name,aliases,cup,note])=>({id,name,aliases,density:cup/US_CUP,reference:`1 US cup ≈ ${Number(cup.toFixed(1))} g`,note,source:KAB,sourceName:'King Arthur Baking'}));
INGREDIENTS.push(
 {id:'whole_milk',name:'Milk',aliases:'whole milk semi skimmed milk',density:1.03,reference:'100 mL ≈ 103 g',note:'Approximate density of 1.03 g/mL; composition and temperature affect the weight.',source:FAO,sourceName:'FAO dairy manual'},
 {id:'water',name:'Water',aliases:'',density:1,reference:'1 mL ≈ 1 g',note:'Kitchen approximation at ordinary temperatures. A US cup is about 237 mL; a metric cup is 250 mL.',source:FAO,sourceName:'FAO dairy manual'},
 {id:'greek_yogurt',name:'Greek yogurt · FAGE 5%',aliases:'greek yoghurt yogurt yoghurt',density:170/180,reference:'¾ label cup (180 mL) ≈ 170 g',note:'FAGE Total 5% US nutrition label; uses the 240 mL nutrition-label cup. Other yogurts vary. Prefer the weight on your recipe.',source:'https://usa.fage/products/yogurt/fage-total-5',sourceName:'FAGE Total 5% label'}
);
export function ingredient(id){return INGREDIENTS.find(i=>i.id===id);}
