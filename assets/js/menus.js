function lifeSummary(){
  var T=TIERS[S.tier];
  var h='<div class="kv">🎤 '+T.icon+" "+T.name+(S.signed?" (signed)":"")
    +" · 💿 "+S.singles+" singles, "+S.albums+" albums, "+S.tours+" tours"
    +"<br>💍 Marriages: "+S.spouses+" · Divorces: "+S.divorces
    +" · 🔒 Prison time: "+S.prisonTotal+"y"+(S.record?" (record)":"")
    +"<br>🏆 Achievements: "+(S.ach.length?S.ach.length:"none")
    +(S.hivKnown&&S.hiv?"<br>🩸 HIV+":"")
    +(S.babyMamas&&S.babyMamas.length?"<br>👩‍🍼 Baby mamas: "+S.babyMamas.length:"")
    +(S.traits&&S.traits.length?"<br>🧬 "+S.traits.join(" · "):"")
    +(S.cancelled?"<br>🚫 CANCELLED":"")
    +(S.songs&&S.songs.length?"<br>🎵 songs written: "+S.songs.length:"")+"</div>";
  return h;
}
function bandSummary(){
  var B=S.band;
  if(!B) return "";
  var h='<div class="kv">🤘 <b>'+B.name+'</b> · chemistry '+Math.round(B.chem)+'%';
  B.members.forEach(function(m){
    h+="<br>"+m.role+": "+m.name+" · skill "+Math.round(m.skill)+
       " · ego "+Math.round(m.ego)+" · 😊 "+Math.round(m.happy);
  });
  return h+"</div>";
}
function assetSummary(){
  var h='<div class="kv">💰 Net worth: <b>'+fmtMoney(netWorth())+'</b><br>'+
    "cash "+fmtMoney(S.stats.money)+" · assets "+fmtMoney(assetValue())+" · biz "+fmtMoney(bizValue());
  if(S.assets.length) h+="<br>🏠 "+S.assets.map(function(a){return a.name;}).join(", ");
  if(S.biz.length) h+="<br>🏢 "+S.biz.map(function(b){return b.name;}).join(", ");
  return h+"</div>";
}
function partnerSummary(){
  var p=S.partner; if(!p) return "";
  ensureMeters(p);
  return '<div class="kv">💑 <b>'+p.name+'</b> · '+(p.gender==="F"?"👩":"👨")+" · "+
    (p.spouse?"💍 married":(p.engaged?"💒 engaged":"❤️ dating"))+
    '<br>relationship '+Math.round(p.rel)+'% · looks '+Math.round(p.looks)+
    (p.persona?' · <i>"'+p.persona+'"</i>':"")+
    '<br>'+meterLine(p)+
    (p.kink?'<br>🔥 '+p.kink:"")+'</div>';
}
function sideSummary(i){
  var sp=S.side[i]; if(!sp) return "";
  ensureMeters(sp);
  return '<div class="kv">😈 <b>'+sp.name+'</b> · '+(sp.gender==="F"?"👩":"👨")+
    '<br>relationship '+Math.round(sp.rel)+'% · looks '+Math.round(sp.looks)+
    '<br>'+meterLine(sp)+
    (sp.kink?'<br>🔥 '+sp.kink:"")+
    '<br><i>nobody knows… yet</i></div>';
}
function memberSummary(i){
  var m=S.band&&S.band.members[i]; if(!m) return "";
  return '<div class="kv">'+(ROLE_ICON[m.role]||"🤘")+' <b>'+m.name+'</b> · '+m.role+
    '<br>skill '+Math.round(m.skill)+' · ego '+Math.round(m.ego)+' · 😊 '+Math.round(m.happy)+'%</div>';
}
function bandMember(){ return (S.band&&S.band.members[subCtx])||null; }
function buildMenu(kind,ctx){
  var T=TIERS[S.tier], it=[];
  if(ctx===undefined) ctx=subCtx;
  if(kind==="career"){
   if(S.age<=7){
    it.push({icon:"🥁",label:"Bang on Pots",sub:"talent + · very loud",act:"k_pots",cls:"cyan"});
    it.push({icon:"🎤",label:"Hum Along to Radio",sub:"talent +",act:"k_hum",cls:"cyan"});
    it.push({icon:"🎸",label:"Air Guitar",sub:"talent + · happiness +",act:"k_air",cls:""});
    it.push({icon:"🖍️",label:"Draw Band Posters",sub:"the dream starts here",act:"k_draw",cls:"ghost"});
   } else {
    it.push({icon:"🎼",label:"Music Studio",sub:"write, record, release & chart",act:"musicMenu",cls:"gold"});
    it.push({icon:"🏙️",label:"Music Industry",sub:"labels, rivals, trends & awards",act:"industryMenu",cls:"cyan"});
    it.push({icon:"🚌",label:"Tour Planner",sub:"cities, venues & production",act:"touringMenu",min:16,cls:"red"});
    it.push({icon:"🎸",label:"Practice",sub:"Talent + · free",act:"practice",min:10,cls:"cyan"});
    it.push({icon:"🎙️",label:"Play Gig",sub:"+"+fmtMoney(gigPay())+" · +"+T.gf+" fame",act:"gig",min:14,cls:"green"});
    if(!S.band)
      it.push({icon:"🤘",label:"Form Band",sub:fmtMoney(5000)+" · min age 14",act:"formBand",min:14,cls:"gold"});
    else
      it.push({icon:"🤘",label:S.band.name,sub:"chemistry "+Math.round(S.band.chem)+"% · manage",act:"bandMenu",cls:"gold"});
    it.push({icon:"🎵",label:"Release Single",sub:fmtMoney(10000)+" studio cost",act:"single",min:14,cls:"gold"});
    if(S.tier>=3||S.signed)
      it.push({icon:"💿",label:"Release Album",sub:fmtMoney(50000)+" studio cost",act:"album",min:14,cls:"gold"});
    if(S.tier>=4)
      it.push({icon:"🚌",label:"Go on Tour",sub:"big money + fame, costs health",act:"tour",min:16,cls:"red"});
    if(S.signed&&S.albumsOwed>0)
      it.push({icon:"📝",label:"Label obligation",sub:S.albumsOwed+" album(s) owed",act:"labelInfo",cls:"ghost"});
    it.push({icon:"✍️",label:"Write a Song",sub:"talent check · bank a track",act:"writesong",min:12,cls:"cyan"});
    it.push({icon:"🤝",label:"Collab / Feature",sub:"fame swing · min 18",act:"collab",min:18,cls:"gold"});
    it.push({icon:"🎬",label:"Sit for a Documentary",sub:"cash or they air the dirt",act:"docu",min:21,cls:""});
    if(S.cancelled)
      it.push({icon:"🕊️",label:"Apology Tour",sub:fmtMoney(20000)+" · try to un-cancel",act:"uncancel",min:18,cls:"ghost"});
   }
  }
  if(kind==="activities"){
   if(S.age<=7){
    it.push({icon:"😴",label:"Nap",sub:"health + · happiness +",act:"k_nap",cls:"cyan"});
    it.push({icon:"🧸",label:"Play with Toys",sub:"happiness ++",act:"k_toys",cls:""});
    it.push({icon:"📺",label:"Watch Cartoons",sub:"happiness +",act:"k_cartoons",cls:"ghost"});
    it.push({icon:"🍪",label:"Eat Snacks",sub:"happiness + · health -",act:"k_snacks",cls:""});
    it.push({icon:"🌳",label:"Play Outside",sub:"health + · happiness +",act:"k_outside",cls:"green"});
    it.push({icon:"🫣",label:"Hide and Seek",sub:"happiness +",act:"k_hide",cls:"cyan"});
    it.push({icon:"😤",label:"Throw Tantrum",sub:"happiness ++ · risky",act:"k_tantrum",cls:"red"});
   } else {
    it.push({icon:"📱",label:"Social Media Post",sub:"free · fame +",act:"social",cls:"cyan"});
    it.push({icon:"🎉",label:"Party",sub:"happiness ++ · risky",act:"party",min:16,cls:""});
    it.push({icon:"💇",label:"Salon",sub:fmtMoney(200)+" · looks +",act:"salon",cls:"ghost"});
    it.push({icon:"🔪",label:"Plastic Surgery",sub:fmtMoney(15000)+" · looks ++ · botch risk!",act:"surgery",min:18,cls:"red"});
    it.push({icon:"💊",label:"Take Drugs",sub:"the dark side…",act:"drugMenu",min:14,cls:"red"});
    it.push({icon:"🎗️",label:"Charity Gala",sub:fmtMoney(10000)+" · fame + karma",act:"gala",cls:"green"});
    it.push({icon:"📱",label:(S.ofans&&S.ofans.on?"Fan Page":"Start Fan Page"),sub:S.ofans&&S.ofans.on?(fmtNum(S.ofans.fans)+" subs · post"):"18+ nudes / clips for cash",act:"ofans",min:18,cls:"red"});
    it.push({icon:"🪙",label:"Crypto Gamble",sub:"moon or rug",act:"crypto",min:18,cls:"gold"});
    it.push({icon:"👕",label:"Merch Drop",sub:"one-night cash grab",act:"merchdrop",min:16,cls:"green"});
    if(!S.drinkDeal)
      it.push({icon:"⚡",label:"Energy Drink Deal",sub:"needs fame 40+",act:"drinkdeal",min:18,cls:"gold"});
    it.push({icon:"👔",label:"Hire Entourage",sub:"payroll · they can leak",act:"hireent",min:18,cls:""});
    if(S.entourage&&S.entourage.length)
      it.push({icon:"🧾",label:"Entourage",sub:S.entourage.length+" on payroll · manage",act:"entmenu",min:18,cls:"ghost"});
   }
  }
  if(kind==="health"){
    it.push({icon:"🏋️",label:"Gym",sub:fmtMoney(50)+" · health + looks +",act:"gym",cls:"green"});
    it.push({icon:"🩺",label:"Doctor Checkup",sub:fmtMoney(500)+" · health +",act:"checkup",cls:"cyan"});
    it.push({icon:"🧘",label:"Meditate",sub:"free · happiness +",act:"meditate",cls:"ghost"});
    it.push({icon:"🛋️",label:"Therapy",sub:fmtMoney(300)+" · happiness + addiction -",act:"therapy",cls:"cyan"});
    it.push({icon:"🏥",label:"Rehab",sub:fmtMoney(25000)+" · addiction → 0",act:"rehab",cls:"gold"});
    it.push({icon:"🩸",label:"STD / HIV Test",sub:fmtMoney(200)+" · know your status",act:"hivtest",min:18,cls:"red"});
    if(S.hiv&&S.hivKnown&&!S.hivMeds)
      it.push({icon:"💊",label:"Start HIV Meds",sub:fmtMoney(12000)+"/yr · stay alive",act:"hivmeds",min:18,cls:"gold"});
    if(!S.hiv&&!S.prep)
      it.push({icon:"🛡️",label:"Start PrEP",sub:fmtMoney(3600)+"/yr · cuts infection risk",act:"startprep",min:18,cls:"cyan"});
    if(S.prep)
      it.push({icon:"🛡️",label:"Stop PrEP",sub:"cancel the prescription",act:"stopprep",min:18,cls:"ghost"});
    if(S.hepc)
      it.push({icon:"🧪",label:"Treat Hep C",sub:fmtMoney(40000)+" · cure it",act:"treathepc",min:18,cls:"gold"});
  }
  if(kind==="life"){
    it.push({icon:"📰",label:"This Year's Headlines",sub:(S.recap&&S.recap.length?S.recap.length+" notes":"quiet year so far"),act:"showrecap",cls:"cyan"});
    it.push({icon:"🖼️",label:"Night Gallery",sub:(S.gallery&&S.gallery.length?S.gallery.length+" saved nights":"nothing filthy saved yet"),act:"showgallery",cls:"red"});
    if(S.kids.length)
      it.push({icon:"👶",label:"The Kids",sub:S.kids.length+" · personalities included",act:"showkids",cls:"green"});
    it.push({icon:"🚫",label:"Restraining Orders",sub:(S.restraining&&S.restraining.length?S.restraining.length+" people banned":"file one on a regular"),act:"filero",min:18,cls:"ghost"});
    it.push({icon:"🏆",label:"Collection & Records",sub:"awards, releases, headlines & challenges",act:"collectionMenu",cls:"gold"});
    it.push({icon:"💾",label:"Save Slots",sub:"three careers · import / export",act:"savesMenu",cls:"cyan"});
    it.push({icon:"⚙️",label:"Settings",sub:"audio, accessibility & content",act:"settingsMenu",cls:"ghost"});
  }
  if(kind==="ent"){
    (S.entourage||[]).forEach(function(e,i){
      it.push({icon:e.icon||"👔",label:e.role+" · "+e.name,
        sub:"loyal "+Math.round(e.loyal)+"% · "+fmtMoney(e.cost)+"/yr · fire",act:"fireent"+i,cls:"red"});
    });
    if(!S.entourage.length) it.push({icon:"👔",label:"Nobody on payroll",sub:"hire from Activities",act:"hireent",cls:"ghost"});
  }
  if(kind==="love"){
    if(!S.partner){
      it.push({icon:"📱",label:"Dating App",sub:"find someone to date",act:"dating",min:18,cls:""});
    } else{
      it.push({icon:"📱",label:"Dating App",sub:"find someone new",act:"dating",min:18,cls:"ghost"});
    }
    it.push({icon:"🔥",label:"After Dark",sub:"hookups · pick the act · 18+",act:"hookup",min:18,cls:"red"});
    if(S.regulars&&S.regulars.length)
      it.push({icon:"🔁",label:"Call a Regular",sub:S.regulars.map(function(r){return r.name.split(" ")[0];}).join(" · "),act:"callregular",min:18,cls:"red"});
    if(!S.sugar)
      it.push({icon:"💎",label:"Keep Someone",sub:"sugar arrangement · monthly",act:"keepsugar",min:18,cls:"gold"});
    else
      it.push({icon:"💎",label:"See "+S.sugar.name.split(" ")[0],sub:fmtMoney(S.sugar.monthly)+"/mo kept · exclusive",act:"seesugar",min:18,cls:"gold"});
    if(S.partner)
      it.push({icon:"🍑",label:"Threesome",sub:"you + partner + one more · no MM",act:"threesome",min:18,cls:"red"});
    if(S.kids.some(function(k){return k.liveWith===false||k.support;}))
      it.push({icon:"📆",label:"Visitation Weekend",sub:"see a kid who doesn't live with you",act:"visitkid",min:18,cls:"cyan"});
    if(S.blackmail)
      it.push({icon:"📼",label:"Pay Blackmail",sub:fmtMoney(S.blackmail.monthly)+"/mo or they leak",act:"payblackmail",min:18,cls:"red"});
    if(S.partner){
      var p0=S.partner;
      it.push({icon:"💑",label:p0.name,
        sub:(p0.spouse?"💍 Married":(p0.engaged?"💒 Engaged":"❤️ Dating"))+" · rel "+Math.round(p0.rel)+"% · manage",
        act:"partnerMenu",cls:"gold"});
      it.push({icon:"😏",label:"Cheat",sub:"find a secret side piece",act:"cheat",cls:"red"});
    }
    S.side.forEach(function(sp,i){
      it.push({icon:"😈",label:sp.name,
        sub:"side piece · rel "+Math.round(sp.rel)+"% · manage",act:"sideMenu"+i,cls:"red"});
    });
    if(S.age>=18 && S.babyMamas && S.babyMamas.some(function(b){return b.active;})){
      it.push({head:true,label:"👩‍🍼 CHILD SUPPORT"});
      var due=S.babyMamas.reduce(function(s,b){return s+(b.active?b.monthly:0);},0);
      it.push({icon:"💸",label:"Pay Arrears",sub:(S.supportArrears>0?("owe "+fmtMoney(S.supportArrears)):("current "+fmtMoney(due)+"/mo")),act:"payarrears",min:18,cls:"green"});
      it.push({icon:"🏃",label:"Skip Support This Year",sub:"save cash · court risk",act:"evadesupport",min:18,cls:"red"});
      it.push({icon:"⚖️",label:"Fight for Custody",sub:fmtMoney(15000)+" lawyer · take the kid",act:"custody",min:18,cls:"gold"});
    }
  }
  if(kind==="crime"){
    it.push({icon:"🍺",label:"Bar Fight",sub:"notoriety + · risky",act:"c_fight",min:12,cls:"red"});
    it.push({icon:"🎤",label:"Assault Heckler",sub:"requires fame 15+",act:"c_heckler",cls:"red"});
    it.push({icon:"💼",label:"Steal from Venue",sub:"quick cash · risky",act:"c_steal",cls:"red"});
    it.push({icon:"🌿",label:"Deal Drugs",sub:"big cash · big risk",act:"c_deal",min:16,cls:"red"});
    it.push({icon:"🧾",label:"Tax Evasion",sub:"requires "+fmtMoney(200000),act:"c_tax",cls:"red"});
    it.push({head:true,label:"😎 THE GAME"});
    it.push({icon:"😎",label:"Recruit Associate",sub:fmtMoney(5000)+" · looks+fame check · 18+",act:"recruit",min:18,cls:"gold"});
    S.crew.forEach(function(w,i){
      it.push({icon:"💼",label:w.name,
        sub:"lvl "+w.lvl+" · loyalty "+Math.round(w.loyalty)+"% · banked "+fmtMoney(w.pot||0)+" · manage",
        act:"workerMenu"+i,min:18,cls:"red"});
    });
  }
  if(kind==="social"){
    it.push({icon:"📸",label:"Post",sub:"followers + · free",act:"sm_post",cls:"cyan"});
    it.push({icon:"🔴",label:"Go Live",sub:"big swing · scandal risk",act:"sm_live",cls:"red"});
    it.push({icon:"🥩",label:"Start Beef",sub:"followers spike · heat +",act:"sm_beef",cls:"gold"});
    it.push({icon:"💰",label:"Brand Deal",sub:"needs 100K followers · cash out",act:"sm_brand",cls:"green"});
  }
  if(kind==="friends"){
    if(!S.friends.length)
      it.push({icon:"🧑‍🤝‍🧑",label:"Make Friends",sub:"find your crew",act:"mkfriends",cls:"cyan"});
    S.friends.forEach(function(f,i){
      it.push({icon:"🧑‍🤝‍🧑",label:f.name,
        sub:f.trait+" · closeness "+Math.round(f.closeness)+"% · hang out",act:"friendMenu"+i,cls:""});
    });
    if(S.friends.length>0&&S.friends.length<5)
      it.push({icon:"➕",label:"New Friend",sub:"expand the circle",act:"mkfriends",cls:"ghost"});
  }
  if(kind==="worker"){
    var w=S.crew[ctx]; if(!w) return it;
    it.push({icon:"💼",label:"Collect Cut",sub:(w.pot>0?("take "+fmtMoney(w.pot)):"nothing banked yet"),act:"w_cut",min:18,cls:"green"});
    it.push({icon:"🌃",label:"Team Night Out",sub:fmtMoney(1000)+" · loyalty ++",act:"w_out",min:18,cls:""});
    it.push({icon:"✂️",label:"Cut Ties",sub:"remove from the operation",act:"w_loose",min:18,cls:"red"});
  }
  if(kind==="friend"){
    var ff=S.friends[ctx]; if(!ff) return it;
    it.push({icon:"🍻",label:"Hang Out",sub:fmtMoney(100)+" · happiness +",act:"fr_hang",cls:"cyan"});
    it.push({icon:"🎉",label:"Party",sub:"happiness ++ · vice risk",act:"fr_party",cls:"red"});
    it.push({icon:"💬",label:"Deep Talk",sub:"stress relief · closeness +",act:"fr_talk",cls:"ghost"});
  }
  if(kind==="drugs"){
    it.push({icon:"🌿",label:"Weed",sub:"mild · cheap",act:"d_weed",cls:"ghost"});
    it.push({icon:"❄️",label:"Cocaine",sub:"strong · risky",act:"d_coke",min:16,cls:"red"});
    it.push({icon:"💉",label:"Heroin",sub:"extreme · deadly",act:"d_heroin",min:16,cls:"red"});
  }
  if(kind==="prison"){
    it.push({icon:"😇",label:"Behave",sub:"good time · parole chance +",act:"p_behave",cls:"green"});
    it.push({icon:"🥊",label:"Start a Fight",sub:"notoriety + · health -",act:"p_fight",cls:"red"});
    it.push({icon:"🔗",label:"Join a Gang",sub:"protection · notoriety ++",act:"p_gang",cls:"red"});
    it.push({icon:"🕊️",label:"Parole Hearing",sub:"only after half served",act:"p_parole",cls:"cyan"});
    it.push({icon:"🏃",label:"Escape Attempt",sub:"freedom or solitary",act:"p_escape",cls:"gold"});
  }
  if(kind==="band"){
    it.push({icon:"🎶",label:"Jam Session",sub:"chemistry + · morale + · free",act:"b_jam",cls:"cyan"});
    S.band.members.forEach(function(m,i){
      it.push({icon:ROLE_ICON[m.role]||"🤘",label:m.name,
        sub:m.role+" · 😊 "+Math.round(m.happy)+"% · manage",act:"memberMenu"+i,cls:""});
    });
  }
  if(kind==="partner"){
    var p=S.partner; if(!p) return it;
    it.push({icon:"😉",label:"Flirt",sub:"free · flirt + heat +",act:"flirt",cls:"ghost"});
    it.push({icon:"📱",label:"Sext",sub:"free · sexual + · tease them",act:"sext",cls:"cyan"});
    it.push({icon:"🍷",label:"Date Night",sub:fmtMoney(500)+" · attachment + flirt +",act:"date",cls:"cyan"});
    it.push({icon:"🔥",label:"Get Intimate",sub:"needs flirt 20 · pick protection",act:"intimate",cls:"red"});
    it.push({icon:"🛏️",label:"Hotel Suite",sub:fmtMoney(2500)+" · needs sexual 35",act:"hotelsuite",cls:"gold"});
    if(S.stats.fame>=15)
      it.push({icon:"📹",label:"Make a Sex Tape",sub:"needs sexual 55 · leak risk",act:"sextape",cls:"red"});
    it.push({icon:"💐",label:"Compliment",sub:"free · relationship +",act:"compliment",cls:"ghost"});
    it.push({icon:"🎁",label:"Buy Gift",sub:fmtMoney(1000)+" · relationship ++",act:"pgift",cls:""});
    it.push({icon:"🏝️",label:"Romantic Getaway",sub:fmtMoney(8000)+" · relationship +++",act:"getaway",cls:"gold"});
    it.push({icon:"🗯️",label:"Argue",sub:"risky · clear the air or blow up",act:"argue",cls:"red"});
    if(!p.spouse){
      if(!p.engaged)
        it.push({icon:"💍",label:"Propose",sub:fmtMoney(2000)+" ring · needs 60% rel",act:"propose",cls:"gold"});
      else
        it.push({icon:"💒",label:"Get Married",sub:"wedding scales with fame",act:"marry",cls:"gold"});
      it.push({icon:"💔",label:"Break Up",sub:"end it",act:"breakup",cls:"ghost"});
    } else {
      it.push({icon:"👶",label:"Have a Child",sub:"the pitter-patter…",act:"child",cls:"green"});
      it.push({icon:"⚖️",label:"Divorce",sub:"it will cost you",act:"divorce",cls:"red"});
    }
  }
  if(kind==="side"){
    var sp=S.side[ctx]; if(!sp) return it;
    it.push({icon:"🌙",label:"Secret Rendezvous",sub:"explicit · getting-caught risk",act:"rendezvous",cls:"red"});
    it.push({icon:"🚿",label:"Quickie",sub:"fast and filthy · lower risk",act:"sidebang",cls:"red"});
    it.push({icon:"🎁",label:"Send Gift",sub:fmtMoney(500)+" · relationship +",act:"sidegift",cls:""});
    it.push({icon:"✂️",label:"End It",sub:"cut them loose quietly",act:"endit",cls:"ghost"});
  }
  if(kind==="member"){
    var m=S.band&&S.band.members[ctx]; if(!m) return it;
    var fn=m.name.split(" ")[0];
    it.push({icon:"👏",label:"Praise "+fn,sub:"morale + · ego +",act:"praise",cls:"cyan"});
    it.push({icon:"💵",label:"Give Bonus",sub:fmtMoney(5000)+" · morale ++",act:"bbonus",cls:"green"});
    it.push({icon:"🍻",label:"Hang Out",sub:"bond · chemistry +",act:"hangout",cls:""});
    it.push({icon:"😠",label:"Reprimand",sub:"ego down · they might walk",act:"reprimand",cls:"red"});
    it.push({icon:"🔥",label:"Fire "+fn,sub:fmtMoney(2000)+" auditions",act:"fireMember"+ctx,cls:"red"});
  }
  if(kind==="assets"){
    it.push({head:true,label:"💰 TOYS"});
    ASSETCAT.forEach(function(c,i){
      it.push({icon:c.icon,label:c.name,sub:"buy · "+fmtMoney(c.cost),act:"buyAsset"+i,cls:"green"});
    });
    S.assets.forEach(function(a,i){
      it.push({icon:"💸",label:"Sell "+a.name,sub:"worth ~"+fmtMoney(Math.round(a.value)),act:"sellAsset"+i,cls:"ghost"});
    });
    it.push({head:true,label:"🏢 BUSINESSES"});
    BIZCAT.forEach(function(c,i){
      var lock=c.minTier&&S.tier<c.minTier;
      it.push({icon:c.icon,label:c.name,
        sub:lock?("requires "+TIERS[c.minTier].name):("buy · "+fmtMoney(c.cost)),
        act:"buyBiz"+i,cls:lock?"ghost":"gold"});
    });
    S.biz.forEach(function(b,i){
      it.push({icon:"💸",label:"Sell "+b.name,sub:"worth ~"+fmtMoney(Math.round(b.value)),act:"sellBiz"+i,cls:"ghost"});
    });
  }
  if(typeof expansionBuildMenu==="function") expansionBuildMenu(kind,it);
  return it;
}
function gigPay(){
  var T=TIERS[S.tier];
  var p=Math.round(T.gig*(1+S.stats.fame/80)*RF(0.8,1.3));
  if(S.band) p=Math.round(p*(1+S.band.chem/200));
  return p;
}
function buyAsset(i){
  var c=ASSETCAT[i]; if(!c) return;
  if(!needCash(c.cost)) return;
  moneyDelta(-c.cost,"💰 Bought "+c.name);
  S.assets.push({name:c.name,value:c.cost,icon:c.icon});
  if(c.name==="Mansion"||c.name==="Private Jet"){
    confetti(90); showBanner(c.icon+" "+c.name.toUpperCase()+"!","living large");
  }
  achieve("asset"+i,c.name+" Owner");
}
function sellAsset(i){
  var a=S.assets[i]; if(!a) return;
  var v=Math.round(a.value*RF(0.85,1.15));
  S.assets.splice(i,1);
  moneyDelta(v,"💰 Sold "+a.name);
}
function buyBiz(i){
  var c=BIZCAT[i]; if(!c) return;
  if(c.minTier&&S.tier<c.minTier){ toast("Requires "+TIERS[c.minTier].name+" status.","🔞"); return; }
  if(!needCash(c.cost)) return;
  moneyDelta(-c.cost,"🏢 Bought "+c.name);
  S.biz.push({name:c.name,value:c.cost,icon:c.icon});
  confetti(70); achieve("biz"+i,c.name+" Mogul");
}
function sellBiz(i){
  var b=S.biz[i]; if(!b) return;
  var v=Math.round(b.value*RF(0.8,1.1));
  S.biz.splice(i,1);
  moneyDelta(v,"🏢 Sold "+b.name);
}
