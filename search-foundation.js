/* Healthy Eating Companion — Universal Search Foundation 0.6.26
   Pure query/taxonomy utilities. UI and food-database access remain in alpha06.js.
*/
(function(global){
  'use strict';

  const WORD_NUMBERS={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,half:.5,a:.5};
  const IRREGULAR={bananas:'banana',oranges:'orange',apples:'apple',potatoes:'potato',tomatoes:'tomato',berries:'berry',cherries:'cherry',loaves:'loaf',leaves:'leaf',fries:'fries',fish:'fish',cheese:'cheese',rice:'rice',pasta:'pasta',couscous:'couscous'};
  const UNIT_WORDS={
    g:['g','gram','grams'],ml:['ml','millilitre','millilitres','milliliter','milliliters'],kg:['kg','kilogram','kilograms'],
    item:['item','items','piece','pieces'],slice:['slice','slices'],serve:['serve','serves','serving','servings'],
    cup:['cup','cups'],tbsp:['tablespoon','tablespoons','tbsp'],tsp:['teaspoon','teaspoons','tsp'],
    bar:['bar','bars'],biscuit:['biscuit','biscuits'],sachet:['sachet','sachets'],packet:['packet','packets'],
    pie:['pie','pies'],sausage:['sausage','sausages'],egg:['egg','eggs']
  };
  const UNIT_LOOKUP={};Object.entries(UNIT_WORDS).forEach(([u,words])=>words.forEach(w=>UNIT_LOOKUP[w]=u));

  function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
  function singularWord(w){if(IRREGULAR[w])return IRREGULAR[w];if(/ies$/.test(w)&&w.length>4)return w.slice(0,-3)+'y';if(/(ches|shes|xes|zes)$/.test(w))return w.slice(0,-2);if(/s$/.test(w)&&!/(ss|us|is)$/.test(w)&&w.length>3)return w.slice(0,-1);return w;}
  function singular(v){return norm(v).split(' ').filter(Boolean).map(singularWord).join(' ');}
  function title(v){return String(v||'').replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bAnd\b/g,'&');}
  function tokens(v){return singular(v).split(' ').filter(Boolean);}

  const CONCEPTS=[
    {key:'pie',label:'Pie',aliases:['pie'],category:'pie',facetOrder:['kind','filling','protein','source','form','size'],natural:{unit:'pie',label:'Individual Pie (about 175 g)',grams:175},supplemental:{kind:['Savoury','Sweet'],filling:['Meat','Chicken & Vegetable','Vegetable','Seafood','Apple / Fruit','Other'],protein:['Beef','Lamb','Pork','Chicken','Other'],source:['Homemade','Bakery / Fresh','Commercial / Ready To Eat','Purchased Frozen','Takeaway / Restaurant']}},
    {key:'sausage',label:'Sausage',aliases:['sausage'],category:'meat',facetOrder:['protein','flavour','fat','prep','source','size'],natural:{unit:'sausage',label:'1 Sausage (about 75 g)',grams:75}},
    {key:'banana',label:'Banana',aliases:['banana'],category:'fruit',facetOrder:['variety','form','prep'],natural:{unit:'item',label:'1 Medium Banana (150 g Australian standard fruit serve)',grams:150}},
    {key:'orange',label:'Orange',aliases:['orange'],category:'fruit',facetOrder:['variety','form','prep'],natural:{unit:'item',label:'1 Medium Orange (150 g Australian standard fruit serve)',grams:150}},
    {key:'apple',label:'Apple',aliases:['apple'],category:'fruit',facetOrder:['variety','form','prep'],natural:{unit:'item',label:'1 Medium Apple (150 g Australian standard fruit serve)',grams:150}},
    {key:'pear',label:'Pear',aliases:['pear'],category:'fruit',facetOrder:['variety','form','prep'],natural:{unit:'item',label:'1 Medium Pear (150 g Australian standard fruit serve)',grams:150}},
    {key:'mandarin',label:'Mandarin',aliases:['mandarin','tangerine'],category:'fruit',facetOrder:['variety','form','prep'],natural:{unit:'item',label:'1 Mandarin (about 90 g edible portion)',grams:90}},
    {key:'grape',label:'Grapes',aliases:['grape'],category:'fruit',facetOrder:['variety','form'],natural:{unit:'g',label:'g',grams:1}},
    {key:'mango',label:'Mango',aliases:['mango'],category:'fruit',facetOrder:['variety','form'],natural:{unit:'item',label:'1 Mango (enter actual size if known)',grams:200}},
    {key:'strawberry',label:'Strawberries',aliases:['strawberry'],category:'fruit',facetOrder:['form'],natural:{unit:'g',label:'g',grams:1}},
    {key:'potato',label:'Potato',aliases:['potato','spud'],category:'vegetable',facetOrder:['variety','form','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'tomato',label:'Tomato',aliases:['tomato'],category:'vegetable',facetOrder:['variety','form','prep'],natural:{unit:'item',label:'1 Medium Tomato (about 120 g)',grams:120}},
    {key:'capsicum',label:'Capsicum',aliases:['capsicum','bell pepper'],category:'vegetable',facetOrder:['variety','form','prep'],natural:{unit:'g',label:'g',grams:1}},
    {key:'carrot',label:'Carrot',aliases:['carrot'],category:'vegetable',facetOrder:['form','prep'],natural:{unit:'g',label:'g',grams:1}},
    {key:'pumpkin',label:'Pumpkin',aliases:['pumpkin'],category:'vegetable',facetOrder:['variety','form','prep'],natural:{unit:'g',label:'g',grams:1}},
    {key:'broccoli',label:'Broccoli',aliases:['broccoli'],category:'vegetable',facetOrder:['form','prep'],natural:{unit:'g',label:'g',grams:1}},
    {key:'cauliflower',label:'Cauliflower',aliases:['cauliflower'],category:'vegetable',facetOrder:['form','prep'],natural:{unit:'g',label:'g',grams:1}},
    {key:'onion',label:'Onion',aliases:['onion'],category:'vegetable',facetOrder:['variety','form','prep'],natural:{unit:'g',label:'g',grams:1}},
    {key:'cheese',label:'Cheese',aliases:['cheese'],category:'dairy',facetOrder:['type','fat','form','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'milk',label:'Milk',aliases:['milk'],category:'dairy',facetOrder:['type','fat','source'],natural:{unit:'mL',label:'mL',grams:1}},
    {key:'yoghurt',label:'Yoghurt',aliases:['yoghurt','yogurt'],category:'dairy',facetOrder:['type','fat','flavour','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'egg',label:'Egg',aliases:['egg'],category:'egg',facetOrder:['type','prep','source'],natural:{unit:'egg',label:'1 Egg',grams:50}},
    {key:'bread',label:'Bread',aliases:['bread'],category:'grain',facetOrder:['type','grain','form','source'],natural:{unit:'slice',label:'1 Slice (check loaf size)',grams:35}},
    {key:'rice',label:'Rice',aliases:['rice'],category:'grain',facetOrder:['type','grain','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'pasta',label:'Pasta',aliases:['pasta','spaghetti','macaroni','penne','fettuccine'],category:'grain',facetOrder:['type','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'cereal',label:'Breakfast Cereal',aliases:['cereal'],category:'grain',facetOrder:['type','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'oats',label:'Oats',aliases:['oats','oatmeal','porridge'],category:'grain',facetOrder:['type','prep'],natural:{unit:'g',label:'g',grams:1}},
    {key:'beef',label:'Beef',aliases:['beef'],category:'meat',facetOrder:['cut','fat','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'chicken',label:'Chicken',aliases:['chicken'],category:'meat',facetOrder:['cut','skin','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'pork',label:'Pork',aliases:['pork'],category:'meat',facetOrder:['cut','fat','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'lamb',label:'Lamb',aliases:['lamb'],category:'meat',facetOrder:['cut','fat','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'steak',label:'Steak',aliases:['steak'],category:'meat',facetOrder:['protein','cut','fat','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'fish',label:'Fish',aliases:['fish'],category:'seafood',facetOrder:['type','form','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'salmon',label:'Salmon',aliases:['salmon'],category:'seafood',facetOrder:['form','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'tuna',label:'Tuna',aliases:['tuna'],category:'seafood',facetOrder:['form','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'prawn',label:'Prawns',aliases:['prawn','shrimp'],category:'seafood',facetOrder:['type','prep','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'coffee',label:'Coffee',aliases:['coffee','cappuccino','latte','flat white','espresso'],category:'drink',facetOrder:['type','milk','size','source'],natural:{unit:'serve',label:'1 Serve',grams:1}},
    {key:'tea',label:'Tea',aliases:['tea'],category:'drink',facetOrder:['type','milk','size'],natural:{unit:'serve',label:'1 Serve',grams:1}},
    {key:'juice',label:'Juice',aliases:['juice'],category:'drink',facetOrder:['type','source'],natural:{unit:'mL',label:'mL',grams:1}},
    {key:'burger',label:'Burger',aliases:['burger','hamburger'],category:'prepared',facetOrder:['protein','type','source','size'],natural:{unit:'serve',label:'1 Burger',grams:1}},
    {key:'sandwich',label:'Sandwich',aliases:['sandwich','toastie'],category:'prepared',facetOrder:['type','protein','source'],natural:{unit:'serve',label:'1 Sandwich',grams:1}},
    {key:'pizza',label:'Pizza',aliases:['pizza'],category:'prepared',facetOrder:['type','topping','source','size'],natural:{unit:'slice',label:'1 Slice',grams:1}},
    {key:'curry',label:'Curry',aliases:['curry'],category:'prepared',facetOrder:['protein','type','source'],natural:{unit:'g',label:'g',grams:1},supplemental:{protein:['Chicken','Beef','Lamb','Pork','Vegetarian / Vegetable'],source:['Homemade','Takeaway / Restaurant','Commercial / Ready To Eat']}},
    {key:'soup',label:'Soup',aliases:['soup'],category:'prepared',facetOrder:['type','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'sausage-roll',label:'Sausage Roll',aliases:['sausage roll'],category:'prepared',facetOrder:['source','size'],natural:{unit:'serve',label:'1 Sausage Roll',grams:1}},
    {key:'cake',label:'Cake',aliases:['cake'],category:'prepared',facetOrder:['type','source','size'],natural:{unit:'slice',label:'1 Slice (check serving size)',grams:1}},
    {key:'cracker',label:'Crackers',aliases:['cracker','sao'],category:'snack',facetOrder:['type','flavour','source'],natural:{unit:'biscuit',label:'1 Cracker / Biscuit',grams:1}},
    {key:'biscuit',label:'Biscuit',aliases:['biscuit','cookie'],category:'snack',facetOrder:['type','flavour','source'],natural:{unit:'biscuit',label:'1 Biscuit',grams:1}},
    {key:'chocolate',label:'Chocolate',aliases:['chocolate'],category:'snack',facetOrder:['type','source'],natural:{unit:'g',label:'g',grams:1}},
    {key:'icecream',label:'Ice Cream',aliases:['ice cream','gelato'],category:'dairy',facetOrder:['type','flavour','source'],natural:{unit:'g',label:'g',grams:1}}
  ];

  const MODIFIER_WORDS=new Set(norm(`homemade home made commercial ready eat bakery fresh frozen purchased takeaway restaurant raw cooked boiled poached fried grilled baked roasted steamed microwaved air fryer air fried bbq barbecued plain flavoured flavored regular reduced low light full fat lean skin skinless peeled unpeeled sliced slice diced chopped whole canned tinned dry dried prepared individual family large medium small beef lamb pork chicken turkey kangaroo fish seafood vegetable veggie fruit sweet savoury savory curry garlic herb honey natural tasty cheddar processed cottage blue vein brie camembert white brown wholemeal wholegrain multigrain basmati jasmine long grain short grain red green yellow navel valencia cavendish lady finger granny smith pink royal gala fuji`).split(' '));

  const PATTERNS={
    kind:[['Savoury',/\bsavou?ry\b/],['Sweet',/\bsweet\b/]],
    source:[['Homemade',/\bhome\s*made\b|\bhomemade\b/],['Bakery / Fresh',/\bbakery\b/],['Purchased Frozen',/\bpurchased frozen\b|\bfrozen\b/],['Takeaway / Restaurant',/\btakeaway\b|\brestaurant\b|\bfast food\b|\bfood outlet\b/],['Commercial / Ready To Eat',/\bcommercial\b|\bready to eat\b/],['Canned / Tinned',/\bcanned\b|\btinned\b/]],
    prep:[['Raw',/\braw\b/],['Boiled',/\bboiled\b/],['Poached',/\bpoached\b/],['Fried',/\bfried\b/],['Grilled',/\bgrilled\b/],['Baked',/\bbaked\b/],['Roasted',/\broasted\b/],['Steamed',/\bsteamed\b/],['Microwaved',/\bmicrowav/],['Barbecued / BBQ',/\bbbq\b|\bbarbecu/],['Air Fried',/\bair\s*fried\b|\bair\s*fryer\b/],['Cooked',/\bcooked\b/]],
    protein:[['Beef',/\bbeef\b|\bsteak\b/],['Lamb',/\blamb\b|\bmutton\b/],['Pork',/\bpork\b/],['Chicken',/\bchicken\b/],['Turkey',/\bturkey\b/],['Kangaroo',/\bkangaroo\b/],['Fish / Seafood',/\bfish\b|\bseafood\b|\bsalmon\b|\btuna\b|\bprawn\b/],['Vegetarian',/\bvegetarian\b|\bmeat alternative\b/]],
    fat:[['Regular Fat',/\bregular fat\b/],['Reduced / Light',/\breduced fat\b|\blow fat\b|\blight\b/],['Lean',/\blean\b/],['Untrimmed',/\buntrimmed\b/],['No Added Fat',/\bno added fat\b/]],
    flavour:[['Plain',/\bplain\b/],['Flavoured',/\bflavou?red\b/]],
    form:[['Peeled',/\bpeeled\b/],['Unpeeled',/\bunpeeled\b/],['Sliced',/\bsliced\b/],['Diced / Chopped',/\bdiced\b|\bchopped\b/],['Dried',/\bdried\b/],['Frozen',/\bfrozen\b/],['Juice',/\bjuice\b/],['Whole',/\bwhole\b/],['Processed',/\bprocessed\b/],['Natural',/\bnatural\b/]],
    skin:[['Skinless',/\bskinless\b|\bwithout skin\b/],['With Skin',/\bwith skin\b|\bskin and fat\b/]],
    grain:[['White',/\bwhite\b/],['Wholemeal / Wholegrain',/\bwholemeal\b|\bwholegrain\b/],['Multigrain',/\bmultigrain\b/],['Brown',/\bbrown\b/]],
    milk:[['No Milk',/\bblack\b|\bno milk\b/],['Full Cream Milk',/\bfull cream\b|\bwhole milk\b/],['Light Milk',/\blight milk\b|\breduced fat milk\b/],['Skim Milk',/\bskim\b/],['Plant Milk',/\bsoy\b|\balmond\b|\boat milk\b/]]
  };

  function parseQuery(raw){
    const n=norm(raw);const ws=n.split(' ').filter(Boolean);let quantity=null,unit='';let keep=[];
    for(let i=0;i<ws.length;i++){
      const w=ws[i];
      if(quantity===null&&(Number.isFinite(Number(w))||WORD_NUMBERS[w]!==undefined)){quantity=Number.isFinite(Number(w))?Number(w):WORD_NUMBERS[w];continue;}
      if(!unit&&UNIT_LOOKUP[w]){unit=UNIT_LOOKUP[w];if(['item','slice','serve','pie','sausage','egg','biscuit','bar','sachet','packet'].includes(unit))keep.push(singularWord(w));continue;}
      keep.push(w);
    }
    const food=singular(keep.join(' '));return {raw:String(raw||''),normalised:n,food,quantity:quantity===null?1:quantity,unit,tokens:tokens(food)};
  }

  function conceptFromQuery(raw){
    const p=typeof raw==='object'&&raw.food!==undefined?raw:parseQuery(raw);const q=` ${p.food} `;let hits=[];
    CONCEPTS.forEach(c=>(c.aliases||[]).forEach(a=>{const an=singular(a);if(q.includes(` ${an} `))hits.push({c,a:an,len:an.split(' ').length,pos:p.food.lastIndexOf(an)});}));
    if(!hits.length)return null;
    hits.sort((a,b)=>b.len-a.len||b.pos-a.pos);return hits[0].c;
  }

  function knownFacetToken(t){if(MODIFIER_WORDS.has(t))return true;for(const list of Object.values(PATTERNS))for(const [,re] of list)if(re.test(t))return true;return false;}
  function likelyBrandPrefix(parsed,concept){
    if(!concept)return '';
    const q=parsed.food,aliases=(concept.aliases||[]).map(singular).sort((a,b)=>b.length-a.length);const a=aliases.find(x=>q.includes(x));if(!a)return '';
    const before=q.slice(0,q.indexOf(a)).trim();if(!before)return '';
    const b=before.split(' ').filter(Boolean);const unknown=b.filter(x=>!knownFacetToken(x));return unknown.join(' ');
  }

  function labelFor(parsed,concept){
    if(!concept)return title(parsed.food);
    const brandPrefix=likelyBrandPrefix(parsed,concept);if(brandPrefix)return title(parsed.food);
    // Preserve useful typed modifiers, but remove pure quantity/unit material already stripped by parseQuery.
    const clean=parsed.food||singular(concept.label);return title(clean);
  }

  function classifyText(text){
    const n=norm(text),out={};
    Object.entries(PATTERNS).forEach(([facet,list])=>{for(const [label,re] of list){if(re.test(n)){out[facet]=label;break;}}});
    return out;
  }

  function descriptorFeatures(name,concept){
    const raw=String(name||'');const parts=raw.split(',').map(x=>norm(x)).filter(Boolean);const out=classifyText(raw);let extras=[];
    const category=concept?.category||'generic';
    for(let i=1;i<parts.length;i++){
      const s=parts[i];if(!s)continue;let claimed=false;
      for(const [facet,list] of Object.entries(PATTERNS)){if(list.some(([,re])=>re.test(s))){claimed=true;break;}}
      if(claimed)continue;
      if(/^(no added|added |approx|with |without |from |as purchased|flesh|skin|fat|drained|edible)/.test(s))continue;
      extras.push(s);
    }
    if(extras.length){
      if(category==='fruit'||category==='vegetable')out.variety=title(extras[0]);
      else if(category==='dairy'||category==='seafood'||category==='grain'||category==='drink'||category==='snack')out.type=title(extras[0]);
      else if(category==='meat')out.cut=title(extras[0]);
      else if(category==='prepared')out.type=title(extras[0]);
      else if(category==='pie')out.filling=title(extras[0]);
      else out.type=title(extras[0]);
    }

    // Pie is a useful example of why a universal guided engine must understand
    // category semantics rather than merely remember button labels. These rules
    // describe reusable pie facets from the nutrition record itself; the UI then
    // branches only to values that remain possible in the filtered record set.
    if(category==='pie'){
      const n=norm(raw);
      if(/\bsweet\b|\bapple\b|\bfruit\b|\bcustard\b|\blemon\b/.test(n))out.kind='Sweet';
      else if(/\bsavou?ry\b|\bmeat\b|\bchicken\b|\bsteak\b|\bkidney\b|\bvegetable\b|\bseafood\b|\bfish\b/.test(n))out.kind='Savoury';

      if(/\bchicken\b.*\bvegetable\b|\bvegetable\b.*\bchicken\b/.test(n))out.filling='Chicken & Vegetable';
      else if(/\bsteak\b.*\bkidney\b|\bsteak and kidney\b/.test(n))out.filling='Steak & Kidney';
      else if(/\bapple\b/.test(n))out.filling='Apple';
      else if(/\bmeat\b/.test(n))out.filling='Meat';
      else if(/\bseafood\b|\bfish\b|\bsalmon\b|\btuna\b|\bprawn\b/.test(n))out.filling='Seafood';
      else if(/\bvegetable\b/.test(n))out.filling='Vegetable';
    }
    return out;
  }

  function queryFacetSeeds(parsed,concept){
    const out=classifyText(parsed.food);const q=parsed.food;
    if(concept){
      const aliases=(concept.aliases||[]).map(singular);const conceptWords=new Set(aliases.flatMap(a=>a.split(' ')));
      const remaining=q.split(' ').filter(w=>!conceptWords.has(w));
      if((concept.category==='fruit'||concept.category==='vegetable')&&remaining.length){
        const known=remaining.filter(w=>!knownFacetToken(w));if(known.length)out.variety=title(known.join(' '));
      }
    }
    return out;
  }

  global.HECSearchFoundation={version:'0.6.26',norm,singular,title,tokens,parseQuery,conceptFromQuery,labelFor,likelyBrandPrefix,knownFacetToken,classifyText,descriptorFeatures,queryFacetSeeds,concepts:CONCEPTS,patterns:PATTERNS,modifierWords:MODIFIER_WORDS};
})(typeof window!=='undefined'?window:globalThis);
