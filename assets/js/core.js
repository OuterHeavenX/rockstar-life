"use strict";
function $(id){ return document.getElementById(id); }
function R(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function RF(a,b){ return Math.random()*(b-a)+a; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function chance(p){ return Math.random() < p; }
function clamp(v,lo,hi){ return Math.max(lo, Math.min(hi, v)); }
function fmtMoney(n){
  var neg = n < 0, a = Math.abs(Math.round(n));
  var s;
  if(a >= 1e9) s = (a/1e9).toFixed(2)+"B";
  else if(a >= 1e6) s = (a/1e6).toFixed(2)+"M";
  else if(a >= 1e4) s = (a/1e3).toFixed(1)+"K";
  else s = a.toLocaleString("en-US");
  return (neg?"-$":"$")+s;
}
var FIRST_M=["Axl","Jimi","Ozzy","Slash","Mick","Dave","Kurt","Iggy","Lou","Vince","Nikki","Tommy","Ziggy","Rex","Dio","Lemmy","Joey","Dee","Bret","Steven","Axel","Corey"];
var FIRST_F=["Stevie","Joan","Debbie","Pat","Courtney","Janis","Grace","Hayley","Amy","Lita","Cher","Tina","Siouxsie","Kim","Shirley","Gwen","Alanis","Florence","Billie","Dua"];
var LAST=["Ryder","Starr","Wolfe","Blaze","Storm","Reed","Vance","Knox","Slade","Fury","Night","Cross","Ash","Raven","Steel","Fox","Wilde","Black","Stone","Riot","Jett","Vicious"];
var CITIES=["Los Angeles","Nashville","New York","London","Seattle","Austin","Detroit","Memphis","New Orleans","Las Vegas","Chicago","Miami"];
var SKINS=["#ffd9b3","#f1c27d","#e0ac69","#c68642","#8d5524","#5c3a1e"];
var HAIRS=["#111111","#3b2a1a","#7a4a1e","#c98a2b","#e8e8e8","#b3123f","#1e6fd9","#6a1fb3"];
var PERSONAS=["sweet","wild","chill","jealous","ambitious","mysterious"];
var KINKS=["oral-obsessed","wants it raw and deep","into being used in public","into choking & hair-pulling","pillow princess / pillow prince","filthy talker who begs","lives to ride","into sloppy make-up sex","secretly a slut for praise","secretly likes being ruined"];
var HOOK_LOCS=[
  {id:"bus",icon:"🚌",label:"Tour Bus"},
  {id:"pent",icon:"🏙️",label:"Penthouse Afterparty"},
  {id:"studio",icon:"🎙️",label:"Studio Couch"},
  {id:"roof",icon:"🌃",label:"Rooftop"},
  {id:"car",icon:"🚗",label:"Parked Car"},
  {id:"ice",icon:"🧊",label:"Hotel Ice Machine"},
  {id:"green",icon:"🚪",label:"Green Room"},
  {id:"bath",icon:"🚻",label:"Club Bathroom"}
];
var KID_TRAITS=["nepo star","hater","party kid","civilian","prodigy","trainwreck"];
var LIFE_TRAITS=["iron lungs","pretty poison","fertile","chaos magnet","trust-fund face","cursed voice","durable liver","magnet for mess"];
var ENT_ROLES=[
  {role:"Manager",icon:"💼",cost:25000},
  {role:"Publicist",icon:"📣",cost:18000},
  {role:"Dealer",icon:"🌿",cost:12000},
  {role:"Driver",icon:"🚘",cost:8000},
  {role:"Stylist",icon:"👗",cost:10000}
];
var TIERS=[
  {name:"Street Busker", icon:"🎸", gig:60,     gf:1,  need:0},
  {name:"Bar Covers",    icon:"🍺", gig:350,    gf:2,  need:10},
  {name:"Local Hero",    icon:"🌟", gig:1800,   gf:4,  need:25},
  {name:"Signed Artist", icon:"💿", gig:9000,   gf:8,  need:45},
  {name:"Rising Star",   icon:"🚀", gig:45000,  gf:14, need:65},
  {name:"Superstar",     icon:"👑", gig:220000, gf:22, need:80},
  {name:"Global Icon",   icon:"🌍", gig:1100000,gf:32, need:92},
  {name:"Legend",        icon:"⚡", gig:5500000,gf:45, need:98}
];
function tierForFame(f){
  var t=0;
  for(var i=0;i<TIERS.length;i++){ if(f>=TIERS[i].need) t=i; }
  return t;
}
var ASSETCAT=[
 {name:"Used Sedan",icon:"🚗",cost:15000},
 {name:"Sports Car",icon:"🏎️",cost:200000},
 {name:"Supercar",icon:"🚀",cost:1200000},
 {name:"Tour Bus",icon:"🚌",cost:500000},
 {name:"Studio Apartment",icon:"🏢",cost:80000},
 {name:"Suburban House",icon:"🏠",cost:350000},
 {name:"Mansion",icon:"🏰",cost:2500000},
 {name:"Private Jet",icon:"🛩️",cost:8000000}
];
var BIZCAT=[
 {name:"Merch Line",icon:"👕",cost:50000},
 {name:"Clothing Brand",icon:"👗",cost:300000},
 {name:"Indie Label",icon:"💿",cost:500000,minTier:5},
 {name:"Restaurant Chain",icon:"🍔",cost:1000000}
];
var BAND_ADJ=["Velvet","Neon","Midnight","Electric","Crimson","Static","Wild","Cosmic"];
var BAND_NOUN=["Riots","Wolves","Rebels","Hearts","Parade","Ghosts","Kings","Static"];
function assetValue(){ return S.assets.reduce(function(s,a){return s+a.value;},0); }
function bizValue(){ return (S.biz||[]).reduce(function(s,b){return s+b.value;},0); }
function netWorth(){ return Math.round(S.stats.money+assetValue()+bizValue()); }
var SAVE_KEY="rockstarLifeSaveV1", BEST_KEY="rockstarLifeBestV1";
var S=null;
function sexLabel(){
  if(!S) return "";
  if(S.gender==="M") return "straight";
  return S.sexuality||"bi";
}
function setupLife(){
  openModal('<h2>🎸 New Life</h2><div class="mtext">Who are you walking into this world as?<br>Men only date women. No man-with-man.</div>'+
    '<button class="btn gold small" onclick="setupSexuality(\'M\')">👨 Man<span class="sub">straight · women only</span></button>'+
    '<button class="btn cyan small" onclick="setupSexuality(\'F\')">👩 Woman<span class="sub">pick who you date</span></button>'+
    '<button class="btn ghost small" onclick="closeModal()">Cancel</button>');
}
function setupSexuality(g){
  if(g==="M"){ startLife("M","straight"); return; }
  openModal('<h2>👩 Who do you date?</h2><div class="mtext">Gay in this game means lesbian only. Never men with men.</div>'+
    '<button class="btn red small" onclick="startLife(\'F\',\'lesbian\')">💜 Lesbian<span class="sub">women only</span></button>'+
    '<button class="btn gold small" onclick="startLife(\'F\',\'straight\')">💙 Straight<span class="sub">men only</span></button>'+
    '<button class="btn cyan small" onclick="startLife(\'F\',\'bi\')">💗 Bisexual<span class="sub">women or men</span></button>'+
    '<button class="btn ghost small" onclick="setupLife()">‹ Back</button>');
}
var _nl={g:"M",sx:"straight"};
function startLife(gender,sexuality){
  _nl={g:gender,sx:sexuality};
  openModal('<h2>🎚️ Difficulty</h2><div class="mtext">How ugly should this life get?</div>'+
    '<button class="btn green small" onclick="pickDiff(\'easy\')">🌿 Easy<span class="sub">softer HIV / support / death</span></button>'+
    '<button class="btn gold small" onclick="pickDiff(\'normal\')">🎸 Normal</button>'+
    '<button class="btn red small" onclick="pickDiff(\'hardcore\')">☠️ Hardcore<span class="sub">harsher sex risk, courts, obituaries</span></button>');
}
function pickDiff(d){
  closeModal();
  newLife(_nl.g,_nl.sx,d);
  showScreen("game"); renderAll();
}
function newLife(gender,sexuality,diff){
  var female = gender? gender==="F" : chance(0.5);
  if(!sexuality) sexuality = female?"bi":"straight";
  if(!female) sexuality="straight";
  S={
    name:(female?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST),
    gender:female?"F":"M", sexuality:sexuality, city:pick(CITIES),
    age:0, skin:pick(SKINS), hair:pick(HAIRS),
    stats:{looks:R(20,90), talent:R(20,90), fame:0, health:R(70,100), happiness:R(50,90),
           money:0, addiction:0, notoriety:0},
    tier:0, signed:false, advance:0, albumsOwed:0, singles:0, albums:0, tours:0,
    partner:null, side:[], kids:[], spouses:0, divorces:0, hookups:0, tapes:0,
    babyMamas:[], hiv:false, hivKnown:false, hivMeds:false, prep:false, hivYears:0,
    supportArrears:0, evadeStreak:0, skipSupport:false, warrant:false,
    prison:0, prisonTotal:0, record:false, alimony:0, alimonyAmt:0,
    ach:[], peakFame:0, peakTier:0, peakWorth:0,
    assets:[], biz:[], band:null, rival:null, awardYear:-1,
    followers:0, smMile:0, crew:[], friends:[],
    alive:true, cause:"", rel:0,
    difficulty:diff||"normal",
    traits:[pick(LIFE_TRAITS),pick(LIFE_TRAITS)],
    regulars:[], gallery:[], recap:[],
    sugar:null, ofans:{on:false,fans:0,posts:0},
    entourage:[], songs:[], cancelled:false,
    hepc:false, blackmail:null, restraining:[],
    crypto:0, drinkDeal:false
  };
  if(S.traits[0]===S.traits[1]) S.traits[1]=pick(LIFE_TRAITS);
  var sl=sexuality==="lesbian"?"lesbian":sexuality==="straight"?"straight":"bi";
  toast("🍼 "+S.name+" is born in "+S.city+"! ("+(female?"👩":"👨")+" · "+sl+" · "+S.difficulty+")", "🎸");
  toast("🧬 Traits: "+S.traits.join(" + "),"✨");
  confetti(40);
  saveGame();
}
  function achieve(id,label){
  if(S.ach.indexOf(id)===-1){ S.ach.push(id); toast("🏆 Achievement: "+label,"🏆"); confetti(60); }
}
var POS_COLORS={looks:"#ff9de2",talent:"#00e5ff",fame:"#f5c86e",health:"#8fe3a8",
  happiness:"#ffb347",money:"#7cff9e",addiction:"#ff4d4d",notoriety:"#c77dff"};
function floaterAt(x,y,text,color,size){
  var f=document.createElement("div");
  f.className="floater"; f.textContent=text;
  f.style.left=x+"px"; f.style.top=y+"px";
  f.style.color=color||"#fff"; f.style.fontSize=(size||20)+"px";
  $("floaters").appendChild(f);
  setTimeout(function(){ f.remove(); },1350);
}
function juiceAt(elm,text,color,size){
  if(!elm) return;
  var r=elm.getBoundingClientRect();
  floaterAt(r.left+r.width/2-10, r.top-6, text, color, size);
}
function delta(stat,amt,opts){
  opts=opts||{};
  if(!S||!S.alive) return S?S.stats[stat]:0;
  var oldT=S.tier;
  S.stats[stat]=clamp(Math.round(S.stats[stat]+amt),0,100);
  if(!opts.silent){
    var row=$("row-"+stat);
    var txt=(amt>0?"+":"")+Math.round(amt);
    var col=amt>0?(POS_COLORS[stat]||"#fff"):"#ff6b6b";
    juiceAt(row,txt,col,amt>0?22:20);
  }
  if(stat==="fame"){
    if(S.stats.fame>S.peakFame) S.peakFame=S.stats.fame;
    var nt=tierForFame(S.stats.fame);
    if(nt>S.tier){ S.tier=nt;
      if(S.tier>S.peakTier) S.peakTier=S.tier;
      showBanner(TIERS[nt].icon+" "+TIERS[nt].name.toUpperCase(), "career tier up!");
      confetti(90);
      if(nt>=3) achieve("tier"+nt, TIERS[nt].name);
    }
  }
  renderStats();
  return S.stats[stat];
}
function moneyDelta(amt,label){
  if(!S||!S.alive) return S?S.stats.money:0;
  S.stats.money=Math.round(S.stats.money+amt);
  var txt=(amt>0?"+":"")+fmtMoney(amt);
  juiceAt($("moneyRow"),txt,amt>0?"#f5c86e":"#ff6b6b",22);
  if(label) toast(label, amt>0?"💰":"💸");
  renderStats();
  return S.stats.money;
}
var confP=[], confRunning=false;
function confetti(n){
  var c=$("confetti"); c.width=innerWidth; c.height=innerHeight;
  var colors=["#ff2fd6","#ffe600","#00e5ff","#7cff00","#ff7b00","#ffffff"];
  for(var i=0;i<(n||60);i++){
    confP.push({x:innerWidth/2+RF(-60,60), y:innerHeight*0.35,
      vx:RF(-7,7), vy:RF(-11,-3), s:RF(4,9), r:RF(0,6.3), vr:RF(-.3,.3),
      col:pick(colors), life:RF(50,110)});
  }
  if(!confRunning){ confRunning=true; requestAnimationFrame(confTick); }
}
function confTick(){
  var c=$("confetti"), x=c.getContext("2d");
  x.clearRect(0,0,c.width,c.height);
  confP=confP.filter(function(p){ return p.life>0 && p.y<c.height+20; });
  for(var i=0;i<confP.length;i++){ var p=confP[i];
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.28; p.r+=p.vr; p.life--;
    x.save(); x.translate(p.x,p.y); x.rotate(p.r);
    x.fillStyle=p.col; x.globalAlpha=Math.min(1,p.life/40);
    x.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.6); x.restore();
  }
  if(confP.length){ requestAnimationFrame(confTick); }
  else { confRunning=false; x.clearRect(0,0,c.width,c.height); }
}
function shakeIt(){
  var w=$("shakeWrap");
  w.classList.remove("shaking"); void w.offsetWidth; w.classList.add("shaking");
  setTimeout(function(){ w.classList.remove("shaking"); },500);
}
var bannerTimer=null;
function showBanner(title,sub){
  var b=$("banner");
  b.innerHTML=title+(sub?'<span class="bsub">'+sub+'</span>':"");
  b.classList.remove("hidden");
  clearTimeout(bannerTimer);
  bannerTimer=setTimeout(function(){ b.classList.add("hidden"); },2400);
}
function toast(msg,icon){
  var t=document.createElement("div");
  t.className="toast"; t.textContent=(icon?icon+" ":"")+msg;
  $("toasts").appendChild(t);
  while($("toasts").children.length>4) $("toasts").firstChild.remove();
  setTimeout(function(){ t.style.opacity="0"; t.style.transition="opacity .4s";
    setTimeout(function(){ t.remove(); },400); },2600);
}
function saveGame(){
  if(!S||!S.alive) return;
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){}
}
function loadGame(){
  try{
    var raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    S=JSON.parse(raw);
    if(S&&S.age<18&&S.stats&&S.stats.money<0){ S.stats.money=0; S._bailed=true; }
    if(S){ if(!S.assets)S.assets=[]; if(!S.biz)S.biz=[];
      if(S.band===undefined)S.band=null; if(S.rival===undefined)S.rival=null;
      if(S.awardYear===undefined)S.awardYear=-1;
      if(S.followers===undefined)S.followers=0;
      if(S.smMile===undefined)S.smMile=0;
      if(!S.crew)S.crew=[];
      if(!S.friends)S.friends=[];
      if(S.hookups===undefined)S.hookups=0;
      if(S.tapes===undefined)S.tapes=0;
      if(!S.babyMamas)S.babyMamas=[];
      if(S.hiv===undefined)S.hiv=false;
      if(S.hivKnown===undefined)S.hivKnown=false;
      if(S.hivMeds===undefined)S.hivMeds=false;
      if(S.prep===undefined)S.prep=false;
      if(S.hivYears===undefined)S.hivYears=0;
      if(!S.sexuality) S.sexuality=(S.gender==="M"?"straight":"bi");
      if(S.gender==="M") S.sexuality="straight";
      if(S.supportArrears===undefined)S.supportArrears=0;
      if(S.evadeStreak===undefined)S.evadeStreak=0;
      if(S.skipSupport===undefined)S.skipSupport=false;
      if(S.warrant===undefined)S.warrant=false;
      if(!S.difficulty) S.difficulty="normal";
      if(!S.traits) S.traits=[pick(LIFE_TRAITS)];
      if(!S.regulars) S.regulars=[];
      if(!S.gallery) S.gallery=[];
      if(!S.recap) S.recap=[];
      if(S.sugar===undefined) S.sugar=null;
      if(!S.ofans) S.ofans={on:false,fans:0,posts:0};
      if(!S.entourage) S.entourage=[];
      if(!S.songs) S.songs=[];
      if(S.cancelled===undefined) S.cancelled=false;
      if(S.hepc===undefined) S.hepc=false;
      if(S.blackmail===undefined) S.blackmail=null;
      if(!S.restraining) S.restraining=[];
      if(S.crypto===undefined) S.crypto=0;
      if(S.drinkDeal===undefined) S.drinkDeal=false;
      S.crew.forEach(function(w){ if(w.pot===undefined)w.pot=0; }); }
    return !!(S&&S.alive!==undefined);
  }catch(e){ return false; }
}
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
function getBest(){ try{ return parseInt(localStorage.getItem(BEST_KEY)||"0",10)||0; }catch(e){ return 0; } }
function setBest(v){ try{ localStorage.setItem(BEST_KEY,String(v)); }catch(e){} }
function recapAdd(line){ if(S&&S.recap) S.recap.push(line); }
function galleryAdd(line){
  if(!S) return;
  if(!S.gallery) S.gallery=[];
  S.gallery.unshift({age:S.age,line:line});
  if(S.gallery.length>12) S.gallery.pop();
}
function rememberRegular(p){
  if(!p||!S) return;
  if(!S.regulars) S.regulars=[];
  S.regulars=S.regulars.filter(function(r){return r.name!==p.name;});
  S.regulars.unshift({name:p.name,gender:p.gender,looks:p.looks,persona:p.persona,kink:p.kink,hiv:p.hiv,dirty:p.dirty,rel:40,flirt:60,attach:20,sexual:70,jealous:20,heat:50});
  if(S.regulars.length>3) S.regulars.pop();
}
function isRestrained(p){
  return !!(p&&S.restraining&&S.restraining.indexOf(p.name)>=0);
}
function diffMul(){
  return S&&S.difficulty==="hardcore"?1.45:S&&S.difficulty==="easy"?0.6:1;
}
function drawAvatar(){
  var c=$("avatar"); if(!c) return;
  var x=c.getContext("2d"), W=c.width, H=c.height;
  var fame=S?S.stats.fame:0, tier=S?S.tier:0;
  var g=x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#3d0057"); g.addColorStop(1,"#12001f");
  x.fillStyle=g; x.fillRect(0,0,W,H);
  x.globalAlpha=0.25;
  var cols=["#ff2fd6","#00e5ff","#ffe600"];
  for(var i=0;i<3;i++){
    x.fillStyle=cols[i];
    x.beginPath();
    x.moveTo(W*(0.2+i*0.3),0); x.lineTo(W*(0.32+i*0.3),0);
    x.lineTo(W*(0.55+i*0.18),H); x.lineTo(W*(0.2+i*0.18),H);
    x.closePath(); x.fill();
  }
  x.globalAlpha=1;
  var cx=W/2, hy=H*0.42;
  var hairH=10+fame*0.5;
  var jacket=["#333","#333","#5a2a82","#7b1e5e","#b3123f","#8a6d00","#d4af37","#ffd700"][tier]||"#333";
  x.fillStyle=jacket;
  x.beginPath(); x.ellipse(cx,H*0.98,52,44,0,Math.PI,0); x.fill();
  x.fillStyle="rgba(255,255,255,.15)"; x.fillRect(cx-52,H*0.78,104,6);
  if(tier>=5){
    x.strokeStyle="#ffd700"; x.lineWidth=5;
    for(var ch=0;ch<3;ch++){
      x.beginPath(); x.arc(cx,H*0.72,26+ch*9,0.25*Math.PI,0.75*Math.PI); x.stroke();
    }
  }
  x.fillStyle=S?S.skin:"#f1c27d";
  x.fillRect(cx-11,H*0.58,22,16);
  x.beginPath(); x.arc(cx,hy,30,0,6.3); x.fill();
  x.fillStyle=S?S.hair:"#111";
  x.beginPath(); x.ellipse(cx,hy-hairH*0.45,32,14+hairH*0.55,0,Math.PI,0); x.fill();
  x.fillRect(cx-32,hy-hairH,64,hairH*0.6);
  if(tier>=5){
    x.fillStyle="#0a0a0a";
    x.beginPath(); x.ellipse(cx-13,hy+2,11,8,0,0,6.3); x.fill();
    x.beginPath(); x.ellipse(cx+13,hy+2,11,8,0,0,6.3); x.fill();
    x.fillRect(cx-13,hy-2,26,4);
    x.fillStyle="rgba(255,255,255,.5)"; x.fillRect(cx-18,hy-2,6,4); x.fillRect(cx+8,hy-2,6,4);
  } else {
    x.fillStyle="#1a1a1a";
    x.beginPath(); x.arc(cx-11,hy+3,3.4,0,6.3); x.fill();
    x.beginPath(); x.arc(cx+11,hy+3,3.4,0,6.3); x.fill();
  }
  x.strokeStyle="#5c2015"; x.lineWidth=3;
  x.beginPath(); x.arc(cx,hy+10,10,0.15*Math.PI,0.85*Math.PI); x.stroke();
  if(tier>=3){
    x.strokeStyle="#888"; x.lineWidth=5;
    x.beginPath(); x.moveTo(cx+44,H*0.95); x.lineTo(cx+30,hy+16); x.stroke();
    x.fillStyle="#222"; x.beginPath(); x.arc(cx+29,hy+13,10,0,6.3); x.fill();
    x.fillStyle="#555"; x.beginPath(); x.arc(cx+29,hy+13,6,0,6.3); x.fill();
  }
  x.fillStyle="rgba(0,0,0,.55)";
  for(var hd=0;hd<7;hd++){
    var hx=hd*(W/6)+8;
    x.fillRect(hx,H-26,10,26);
    x.beginPath(); x.arc(hx+5,H-28,7,0,6.3); x.fill();
  }
}
function showScreen(name){
  ["title","game","death"].forEach(function(s){
    $("scr-"+s).classList.toggle("hidden", s!==name);
  });
  window.scrollTo(0,0);
}
function renderStats(){
  if(!S) return;
  var st=S.stats;
  [["looks"],["talent"],["fame"],["health"],["happiness"],["addiction"],["notoriety"]].forEach(function(k){
    k=k[0];
    $("v-"+k).textContent=Math.round(st[k]);
    var bar=$("b-"+k);
    bar.style.width=clamp(st[k],0,100)+"%";
    bar.className="fill";
    if(k==="addiction"||k==="notoriety") bar.className="fill"+(st[k]>60?" bad":st[k]>30?" warn":"");
    if((k==="health"||k==="happiness")&&st[k]<35) bar.className="fill bad";
    else if((k==="health"||k==="happiness")&&st[k]<60) bar.className="fill warn";
  });
  $("v-followers").textContent=fmtNum(S.followers||0);
  var nw=netWorth();
  $("v-money").textContent=fmtMoney(nw);
  $("v-money").style.color=nw<0?"#ff6b6b":"#7cff9e";
  if(nw>S.peakWorth) S.peakWorth=nw;
}
function renderAll(){
  if(!S) return;
  $("hudName").textContent=S.name;
  var meta="🎂 "+S.age+" · "+(S.gender==="F"?"👩":"👨")+" · "+sexLabel()+" · "+(S.difficulty||"normal")+" · 📍 "+S.city;
  if(S.prison>0) meta+=" · 🔒 PRISON ("+S.prison+"y left)";
  if(S.record) meta+=" · ⚠️ record";
  if(S.hivKnown&&S.hiv) meta+=" · 🩸 HIV+";
  $("hudMeta").textContent=meta;
  var T=TIERS[S.tier];
  $("hudTier").textContent=T.icon+" "+T.name+(S.signed?" · 💿 signed":"");
  $("ageBtn").innerHTML=S.prison>0?"🔒 SERVE YEAR":"🎂 AGE +1";
  renderStats();
  drawAvatar();
}
var MENU_TITLES={career:"🎤 Career",activities:"🎉 Activities",love:"💘 Love Life",
  health:"🏥 Health",crime:"🚔 Crime",life:"📖 My Life",drugs:"💊 Drugs",prison:"🔒 Prison Yard",
  assets:"💰 Assets",band:"🤘 Band",partner:"💑 Partner",side:"😈 Side Piece",member:"🤘 Band Member",
  social:"📱 Social Media",friends:"🧑‍🤝‍🧑 Friends",worker:"💼 Associate",friend:"🧑‍🤝‍🧑 Friend",
  ent:"👔 Entourage"};
var menuStack=[], curMenu=null, subCtx=null;
var ROLE_ICON={Drums:"🥁",Bass:"🎸",Guitar:"🎸"};
function openMenu(kind,ctx){
  if(!S||!S.alive) return;
  if(S.prison>0 && kind!=="prison" && kind!=="life"){
    toast("You are locked up. Only the yard and your memories.","🔒"); return;
  }
  curMenu={kind:kind,ctx:(ctx===undefined?null:ctx)};
  subCtx=curMenu.ctx;
  var items=buildMenu(kind);
  var title=MENU_TITLES[kind];
  if(S.age<=7&&kind==="career") title="🎸 Little Rockstar";
  if(S.age<=7&&kind==="activities") title="🏠 Around the House";
  if(kind==="partner"&&S.partner) title="💑 "+S.partner.name;
  if(kind==="side"&&S.side[subCtx]) title="😈 "+S.side[subCtx].name;
  if(kind==="member"&&S.band&&S.band.members[subCtx])
    title=(ROLE_ICON[S.band.members[subCtx].role]||"🤘")+" "+S.band.members[subCtx].name;
  if(kind==="worker"&&S.crew&&S.crew[subCtx]) title="💼 "+S.crew[subCtx].name;
  if(kind==="friend"&&S.friends&&S.friends[subCtx]) title="🧑‍🤝‍🧑 "+S.friends[subCtx].name;
  var h='<div class="menu-head">';
  if(menuStack.length) h+='<button class="xbtn" onclick="A(\'menuBack\')">‹</button>';
  else h+='<span style="width:36px"></span>';
  h+='<h2 style="flex:1;text-align:center">'+title+'</h2>'+
     '<button class="xbtn" onclick="closeMenu()">✕</button></div>';
  if(kind==="love") h+=loveSummary();
  if(kind==="life") h+=lifeSummary();
  if(kind==="band") h+=bandSummary();
  if(kind==="assets") h+=assetSummary();
  if(kind==="partner") h+=partnerSummary();
  if(kind==="side") h+=sideSummary(subCtx);
  if(kind==="member") h+=memberSummary(subCtx);
  if(kind==="social") h+=socialSummary();
  if(kind==="friends") h+=friendsSummary();
  if(kind==="worker") h+=workerSummary(subCtx);
  if(kind==="friend") h+=friendSummary(subCtx);
  if(kind==="prison") h+='<div class="kv">🔒 '+S.prison+' years left on your sentence. Keep your head down… or don\'t.</div>';
  items.forEach(function(it){
    if(it.head){ h+='<div class="kv" style="text-align:center;font-weight:800;letter-spacing:2px">'+it.label+'</div>'; return; }
    var locked=it.min&&S.age<it.min;
    h+='<button class="btn small '+it.cls+(locked?" locked":"")+'"'
      +(locked?"":' onclick="A(\''+it.act+'\')"')
      +'>'+(locked?"🔒 ":it.icon+" ")+it.label
      +'<span class="sub">'+(locked?("unlocks at age "+it.min):(it.sub||""))+'</span></button>';
  });
  $("menuPanel").innerHTML=h;
  $("menuOverlay").classList.remove("hidden");
}
function closeMenu(){ menuStack=[]; curMenu=null; subCtx=null; $("menuOverlay").classList.add("hidden"); }
function openSub(kind,ctx){
  if(curMenu) menuStack.push(curMenu);
  openMenu(kind,ctx===undefined?null:ctx);
}
function menuBack(){
  var p=menuStack.pop();
  if(p) openMenu(p.kind,p.ctx);
  else closeMenu();
}
function loveSummary(){
  var h='<div class="kv">';
  if(S.partner){
    var p=ensureMeters(S.partner);
    h+="💘 "+p.name+" ("+(p.spouse?"💍 married":"❤️ dating")+") · rel "+Math.round(p.rel)+"%";
    h+="<br>"+meterLine(p);
    if(p.kink) h+="<br>🔥 into: "+p.kink;
  } else h+="💔 Single and ready to mingle.";
  if(S.hookups) h+="<br>🌙 Hookups this life: "+S.hookups;
  if(S.side.length) h+="<br>😏 "+S.side.length+" secret side piece"+(S.side.length>1?"s":"")+"…";
  if(S.babyMamas&&S.babyMamas.length){
    var bmPay=S.babyMamas.reduce(function(s,b){return s+(b.active?b.monthly:0);},0);
    h+="<br>👩‍🍼 Baby mamas: "+S.babyMamas.filter(function(b){return b.active;}).map(function(b){return b.name.split(" ")[0];}).join(", ")+
       " · "+fmtMoney(bmPay)+"/mo"+
       (S.supportArrears>0?" · arrears "+fmtMoney(S.supportArrears):"")+
       (S.skipSupport?" · 🏃 skipping this year":"")+
       (S.warrant?" · ⚠️ WARRANT":"");
  }
  if(S.kids.length){
    h+="<br>👶 Kids: "+S.kids.map(function(k){return k.name+" ("+k.age+")";}).join(", ");
  }
  if(S.hivKnown&&S.hiv) h+="<br>🩸 HIV+ "+(S.hivMeds?"on meds":"UNTREATED");
  else if(S.prep) h+="<br>💊 on PrEP";
  if(S.hepc) h+="<br>🧪 Hep C";
  if(S.sugar) h+="<br>💎 Sugar: "+S.sugar.name;
  if(S.blackmail) h+="<br>📼 Blackmail: "+S.blackmail.name+" · "+fmtMoney(S.blackmail.monthly)+"/mo";
  if(S.regulars&&S.regulars.length) h+="<br>🔁 Regulars: "+S.regulars.map(function(r){return r.name.split(" ")[0];}).join(", ");
  if(S.ofans&&S.ofans.on) h+="<br>📱 Fan page: "+fmtNum(S.ofans.fans)+" subs";
  return h+"</div>";
}
