function needAge(n){ if(S.age<n){ toast("You must be at least "+n+" for that.","🔞"); return false; } return true; }
function needCash(n){ if(S.stats.money<n){ toast("You need "+fmtMoney(n)+".","💸"); return false; } return true; }
function afterAct(){
  renderAll(); saveGame(); checkDead();
  if(S&&S.alive&&!modalOpen()&&curMenu){
    var k=curMenu.kind, c=curMenu.ctx;
    if(k==="partner"&&!S.partner){ menuStack=[]; openMenu("love"); return; }
    if(k==="side"&&!S.side[c]){ menuStack=[]; openMenu("love"); return; }
    if(k==="member"&&(!S.band||!S.band.members[c])){ menuStack=[]; openMenu(S.band?"band":"career"); return; }
    if(k==="worker"&&!S.crew[c]){ menuStack=[]; openMenu("crime"); return; }
    if(k==="friend"&&!S.friends[c]){ menuStack=[]; openMenu("friends"); return; }
    if(k==="band"&&!S.band){ menuStack=[]; openMenu("career"); return; }
    openMenu(k,c);
  } else closeMenu();
}
function lifestyleYear(){
  if(S.age<18) return;
  if(S.hepc){ delta("health",-R(3,6)); delta("happiness",-2); }
  if(S.cancelled){ delta("fame",-R(3,7),{silent:true}); S.followers=Math.round((S.followers||0)*0.85); }
  if(S.sugar){
    moneyDelta(-S.sugar.monthly*12,"💎 Kept "+S.sugar.name.split(" ")[0]);
    if(S.stats.money<0){ toast("💎 You can't afford the arrangement. They walked.","💸"); S.sugar=null; }
  }
  if(S.blackmail){
    moneyDelta(-S.blackmail.monthly*12,"📼 Blackmail");
    if(S.stats.money<0||chance(0.08)){
      delta("notoriety",R(10,16)); S.cancelled=true; shakeIt();
      recapAdd("The blackmail tape leaked.");
      toast("📼 They leaked it. You're trending for the worst reason.","🚫");
      S.blackmail=null; achieve("leaked","Leaked");
    }
  }
  (S.entourage||[]).forEach(function(e){
    moneyDelta(-e.cost,"👔 "+e.role);
    e.loyal=clamp(e.loyal+R(-6,3),0,100);
    if(e.loyal<=15&&chance(0.4)){
      recapAdd(e.name+" leaked you to a blog.");
      delta("notoriety",R(6,12)); toast("📰 "+e.role+" "+e.name+" leaked.","📣");
    }
  });
  if(S.ofans&&S.ofans.on){
    var pay=Math.round((S.ofans.fans||0)*RF(0.04,0.12));
    if(pay>0) moneyDelta(pay,"📱 Fan page");
    S.ofans.fans=Math.max(0,Math.round(S.ofans.fans*RF(0.85,1.25)));
    if(chance(0.07)){ delta("notoriety",5); toast("📱 A fan-page clip escaped the paywall.","📸"); }
  }
  if(S.drinkDeal) moneyDelta(Math.round(20000+S.stats.fame*400),"⚡ Drink royalties");
  if(S.crypto>0&&chance(0.5)){
    var old=S.crypto, next=Math.round(old*RF(0.2,2.4));
    S.crypto=next;
    recapAdd("Crypto: "+fmtMoney(old)+" → "+fmtMoney(next));
  }
}
function showYearPaper(lines){
  lines=lines||S.recap||[];
  if(!lines.length){ toast("Quiet year. No headlines.","📰"); return; }
  showResult("📰 YEAR IN REVIEW", lines.map(function(x){return "• "+x;}).join("<br>"));
}
function pairingOk(g){
  if(S.gender==="M") return g==="F";
  var sx=S.sexuality||"bi";
  if(sx==="lesbian") return g==="F";
  if(sx==="straight") return g==="M";
  return g==="F"||g==="M";
}
function genPerson(){
  var f;
  if(S&&S.gender==="M") f=true;
  else if(S&&S.sexuality==="lesbian") f=true;
  else if(S&&S.sexuality==="straight"&&S.gender==="F") f=false;
  else f=chance(0.55);
  return ensureMeters({
    name:(f?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST),
    gender:f?"F":"M", looks:R(20,100), fame:R(0,60), rel:50,
    spouse:false, engaged:false, persona:pick(PERSONAS), kink:pick(KINKS),
    hiv:chance(0.06), dirty:chance(0.25)
  });
}
function ensureMeters(p){
  if(!p) return p;
  if(p.flirt==null) p.flirt=R(18,48);
  if(p.attach==null) p.attach=R(12,40);
  if(p.sexual==null) p.sexual=R(22,58);
  if(p.jealous==null) p.jealous=R(8,48);
  if(p.heat==null) p.heat=R(15,50);
  if(!p.gender){
    var fn=(p.name||"").split(" ")[0];
    p.gender=FIRST_F.indexOf(fn)>=0?"F":"M";
  }
  return p;
}
function meterLine(p){
  ensureMeters(p);
  return "😏 flirt "+Math.round(p.flirt)+"% · 🥺 attach "+Math.round(p.attach)+
    "% · 🔥 sexual "+Math.round(p.sexual)+"%<br>💚 jealous "+Math.round(p.jealous)+
    "% · 🌡️ heat "+Math.round(p.heat)+"%";
}
function bumpMeters(p,map){
  if(!p) return;
  ensureMeters(p);
  Object.keys(map).forEach(function(k){
    if(p[k]==null) return;
    p[k]=clamp(Math.round(p[k]+map[k]),0,100);
  });
}
function pPronoun(p){
  ensureMeters(p);
  return p.gender==="F"
    ? {s:"she",o:"her",p:"her",n:"woman",S:"She",P:"Her"}
    : {s:"he",o:"him",p:"his",n:"man",S:"He",P:"His"};
}
function pairKey(p){
  if(S.gender==="F"&&p.gender==="F") return "ff";
  if(S.gender==="F") return "fm";
  return "mf";
}
function sexScene(p,kind){
  var name=p.name.split(" ")[0];
  var kink=p.kink||pick(KINKS);
  var pk=pairKey(p);
  var pool;
  if(pk==="ff"){
    pool={
      bed:[
        "You pin "+name+" to the mattress and bury your mouth between her thighs until she's shaking and soaked. She grabs your hair and grinds on your tongue, then flips you and returns the favor until you come on her fingers.",
        name+" straps up. She fucks you slow at first, then brutal, thumb on your clit the whole time. You come on the toy. She doesn't stop. You come again, louder.",
        "Sixty-nine until both of you are a mess. "+name+" tastes like sex. She sits on your face after and doesn't let you up until her thighs clamp and she curses your name.",
        "Scissoring turns sloppy. Her cunt is slick against yours. You rub until you're both dripping down the sheets, kissing with teeth."
      ],
      hookup:[
        name+"'s dress is around her waist in the bathroom. You go down on her against the sink, two fingers crooked, until she comes in your mouth and pulls you up by the hair to kiss it back into her.",
        "No small talk. She pushes you onto the bed, sits on your face, and rides your tongue. Then she straps you and fucks you like she paid for the hour."
      ],
      hotel:[
        "The suite robe doesn't last. "+name+" eats you out on the marble counter, then straps you on the bed until the headboard slams and you can't form words.",
        "Room-service champagne on her tits, your mouth following it down. You fuck each other with hands and a toy until dawn. Nobody sleeps."
      ],
      side:[
        "A fake name at the desk. "+name+" is already wet when you get a hand in her underwear. You finger her in the elevator. In the room you bury your face in her and don't come up for air.",
        "She bends you over the hotel desk and uses the strap until your legs shake. You leave separately. You can still feel her."
      ],
      quickie:[
        "Green room. Lock the door. Your hand is down "+name+"'s pants in seconds. She's soaked. She comes on your fingers, bites your shoulder, and walks back out like nothing happened.",
        "Bathroom stall. She drops to her knees, tongue flat on your clit, two fingers in you. Four minutes. You both look wrecked."
      ],
      tape:[
        "The phone catches everything: "+name+"'s mouth on you, your mouth on her, the strap, the noise she makes when she comes. You watch it back. You don't delete it.",
        name+" looks at the lens while she rides your face. Close-up of how wet she is. Your name when she finishes. The internet would eat this alive."
      ]
    };
  } else if(pk==="fm"){
    pool={
      bed:[
        name+" goes down on you like he's starving, two fingers in you, until you come on his tongue. Then he folds your legs back and fucks you deep, raw or not, until he fills you.",
        "You ride him facing him, grinding your clit on his cock, dripping down his hips. He grabs your ass and thrusts up until you clamp around him and he comes inside.",
        "He puts you on all fours and eats you from behind before he slams into you. The slap of skin. You come first. He doesn't pull out.",
        name+" talks filthy the whole time — how tight you are, how he's going to ruin you. He does. You come so hard your thighs shake."
      ],
      hookup:[
        "His hand is under your skirt before the door shuts. "+name+" fucks you against the wall, one leg up, thumb on your clit, and finishes in you with a groan.",
        "You push him onto the bed and sink down on his cock. Wet. Loud. You come on him. He flips you and pounds you through it."
      ],
      hotel:[
        "The suite is wasted on sleep. "+name+" spends half the night with his mouth between your legs, the other half buried in you until the sheets are wrecked.",
        "Shower, then the glass, then the floor. He fucks you from behind looking at you in the mirror. You come twice. He comes in you."
      ],
      side:[
        "A side door. "+name+" is hard in your hand in the car. In the room he eats you out on the desk, then bends you over it and fucks you quiet — then not quiet.",
        "You drop to your knees and take him down your throat. He pulls you up, puts you on the bed, and doesn't last long once he's inside. You make him go again."
      ],
      quickie:[
        "Green room. You shove him into a chair and ride him with your skirt still on. He comes in you. You walk onstage wet.",
        "Bathroom stall. He lifts you, fucks you standing, hand over your mouth. Two minutes. Both of you leave separately."
      ],
      tape:[
        "The phone is on the nightstand. "+name+" films himself sliding into you, your face when you come, the mess he leaves. You swore you'd delete it.",
        "Close-ups. You on top. Him behind. Your voice saying don't stop. The clip is porn. You keep it."
      ]
    };
  } else {
    pool={
      bed:[
        name+" drops to her knees and takes your cock down her throat until she gags, spit running down her chin. You fuck her mouth, then put her on her back and bury yourself in her cunt until she comes clenching around you.",
        "You eat her until she's shaking and soaked, then slide in in one thrust. She's tight and wet. You fuck her through two orgasms and finish on her tongue when she asks for it.",
        name+" rides you reverse, ass slapping your hips, reaching back to rub her clit. She comes first, messy. You grab her waist and pound up into her until you fill her.",
        "Prone bone. You pin her wrists and fuck her deep and filthy. She moans into the pillow and soaks the sheets. You don't pull out."
      ],
      hookup:[
        "The lock clicks. "+name+"'s jeans are around her thighs and your cock is in her mouth. You fuck her standing up, one hand on her throat, and come in her.",
        "No tour. She pulls you out, strokes you, and sinks down wet. She rides until the headboard hits. You finish inside. She doesn't ask you to stay."
      ],
      hotel:[
        "The suite is for this. "+name+" spends half the night with your cock in her throat, the other half face-down, ass up, taking it until she comes screaming into a pillow.",
        "Champagne, shower, floor. You eat her on the glass, then fuck her through it, watching her tits flatten against the window. You come in her. She licks you clean."
      ],
      side:[
        "Fake name at the desk. "+name+" is already wet. You finger her in the elevator, then bend her over the bed and fuck her like you paid for the room just to ruin her.",
        "She sucks you in the rental car, sloppy and deep. In the room you eat her out on the desk and then take her from behind until she leaves bite marks you'll have to hide."
      ],
      quickie:[
        "Green room. Lock. "+name+" is on her knees in seconds, gagging on you. You come down her throat and walk back onstage tasting like her lip gloss.",
        "Bathroom stall. She braces on the sink. You fuck her fast and sloppy, thumb on her clit, and pull out on her ass because there's no time. Both of you leave separately."
      ],
      tape:[
        "Phone on the nightstand. "+name+" looks at the lens while she sinks down on your cock, talking filthy, showing how you stretch her. She comes on camera. So do you.",
        "Close-ups of her cunt taking you, spit strings, her face when you fuck her stupid. You said you'd delete it. You watch it instead."
      ]
    };
  }
  var arr=pool[kind]||pool.bed;
  return pick(arr)+" <i>("+kink+")</i>";
}
var SEX_T=null;
function askSex(p,kind,extra){
  if(!p) return;
  if(S.gender==="M"&&p.gender==="M"){ toast("Not your scene.","🚫"); return; }
  extra=extra||{};
  SEX_T={p:p,kind:kind,extra:extra};
  if(extra.oral){
    openModal('<h2>🔥 '+p.name.split(" ")[0]+'</h2><div class="mtext">'+(extra.actLabel||"Mouth only.")+
      '<br>Lower risk. Not zero.</div>'+
      '<button class="btn red small" onclick="pickProtection(false)">💦 Do it</button>'+
      '<button class="btn ghost small" onclick="closeModal()">Not now</button>');
    return;
  }
  var risk=p.hiv||p.dirty||kind==="hookup"||kind==="side"||kind==="quickie";
  openModal('<h2>🔥 '+p.name.split(" ")[0]+'</h2><div class="mtext">How do you want it?'+
    (extra.actLabel?'<br>'+extra.actLabel:'')+
    (risk?'<br><b>Higher risk partner.</b>':'')+
    (S.hivKnown&&S.hiv?'<br>🩸 You are HIV+. Raw can pass it.':'')+
    (S.prep?'<br>🛡️ PrEP is on.':'')+'</div>'+
    '<button class="btn red small" onclick="pickProtection(true)">🍆 Raw<span class="sub">feels better · pregnancy + HIV risk</span></button>'+
    '<button class="btn cyan small" onclick="pickProtection(false)">🛡️ Condom<span class="sub">safer · still filthy</span></button>'+
    '<button class="btn ghost small" onclick="closeModal()">Not now</button>');
}
function pickProtection(raw){
  var t=SEX_T; SEX_T=null; if(!t){ closeModal(); return; }
  finishSex(t.p,t.kind,raw,t.extra||{});
}
function hivRisk(p,raw,kind,extra){
  if(S.hiv) return;
  extra=extra||{};
  var base=raw?0.10:0.012;
  if(extra.oral) base=0.015;
  base*=diffMul();
  if(kind==="hookup"||kind==="side"||kind==="quickie") base*=1.6;
  if(p&&(p.hiv||p.dirty)) base*=2.2;
  if(S.prep) base*=0.3;
  if(S.stats.addiction>50) base*=1.25;
  return chance(base);
}
function infectPartner(p,raw){
  if(!S.hiv||!raw||!p) return false;
  if(p.hiv) return false;
  if(chance(S.hivMeds?0.04:0.18)){ p.hiv=true; return true; }
  return false;
}
function canConceive(p){
  if(!p) return false;
  if(S.gender==="M"&&p.gender==="F") return true;
  if(S.gender==="F"&&p.gender==="M") return true;
  return false;
}
function childSupportAmt(){
  return Math.max(600, Math.round((800+S.stats.fame*18+Math.min(4000,Math.max(0,S.stats.money)*0.002))*diffMul()));
}
function addBaby(p,fromHookup){
  var kn=pick(FIRST_M.concat(FIRST_F))+" "+S.name.split(" ")[1];
  var liveWith=!fromHookup && S.partner===p;
  var monthly=childSupportAmt();
  S.kids.push({name:kn,age:0,other:p?p.name:null,support:fromHookup||!liveWith,liveWith:liveWith,trait:pick(KID_TRAITS)});
  if(fromHookup || (p&&S.partner!==p) || (S.gender==="M"&&p&&p.gender==="F"&&!liveWith)){
    S.babyMamas.push({name:S.gender==="M"?p.name:(p?p.name:"Unknown"), kid:kn, monthly:monthly, active:true, arrears:0});
    achieve("babymama","Baby Mama Drama");
  }
  delta("happiness",6);
  confetti(80);
  showBanner("👶 IT'S A BABY!",kn+(fromHookup?" · support incoming":""));
  achieve("parent","Parent");
  return kn;
}
function childSupportYear(){
  if(!S.babyMamas||!S.babyMamas.length) return;
  var total=0;
  S.babyMamas.forEach(function(b){
    if(!b.active) return;
    total+=b.monthly*12;
  });
  if(total<=0) return;
  if(S.skipSupport){
    S.skipSupport=false;
    S.supportArrears=(S.supportArrears||0)+total;
    S.evadeStreak=(S.evadeStreak||0)+1;
    delta("notoriety",R(4,9));
    toast("🏃 You skipped "+fmtMoney(total)+" in support. Arrears: "+fmtMoney(S.supportArrears),"⚖️");
    var heat=0.12+S.evadeStreak*0.10+(S.supportArrears>50000?0.15:0);
    if(chance(heat)) supportWarrant();
    return;
  }
  S.evadeStreak=0;
  moneyDelta(-total,"👩‍🍼 Child support ("+fmtMoney(Math.round(total/12))+"/mo)");
  if(S.supportArrears>0){
    var bite=Math.min(S.supportArrears, Math.max(2000,Math.round(S.supportArrears*0.25)));
    moneyDelta(-bite,"⚖️ Arrears garnish");
    S.supportArrears=Math.max(0,S.supportArrears-bite);
  }
  if(S.stats.money<0){
    S.supportArrears+=(total);
    delta("happiness",-8); delta("notoriety",3);
    toast("👩‍🍼 You couldn't cover support. It rolled into arrears.","⚖️");
    if(chance(0.25)) supportWarrant();
  }
}
function supportWarrant(){
  S.warrant=true;
  shakeIt();
  delta("notoriety",R(8,14));
  openModal('<h2>⚖️ SUPPORT WARRANT</h2><div class="mtext">A judge froze a chunk of your life. Unpaid child support. You owe <b>'+
    fmtMoney(S.supportArrears||0)+'</b>.</div>'+
    '<button class="btn green small" id="swPay">💸 Pay it all now</button>'+
    '<button class="btn red small" id="swRun">🏃 Keep running</button>');
  $("swPay").onclick=function(){
    var owe=S.supportArrears||0;
    if(owe>0) moneyDelta(-owe,"⚖️ Paid arrears");
    S.supportArrears=0; S.warrant=false; S.evadeStreak=0;
    showResult("⚖️ Cleared","The warrant is quashed. For now.");
  };
  $("swRun").onclick=function(){
    if(chance(0.55)){
      busted("Failure to pay child support");
    } else {
      delta("notoriety",6);
      showResult("🏃 Still running","You slipped the hearing. The debt is still there.");
    }
  };
}
function hivYear(){
  if(!S.hiv) return;
  S.hivYears=(S.hivYears||0)+1;
  if(!S.hivKnown&&chance(0.25)){
    S.hivKnown=true;
    toast("🩸 Routine bloodwork. You are HIV+.","🩸");
  }
  if(S.hivMeds){
    delta("health",-R(1,4),{silent:true});
    delta("happiness",-1,{silent:true});
  } else {
    delta("health",-R(10,18));
    delta("happiness",-6);
    var kill=0.08+S.hivYears*0.025+(S.stats.health<30?0.15:0);
    if(S.stats.health<=12||chance(kill)){
      die("🩸 AIDS. Untreated HIV took you at "+S.age+".");
    }
  }
}
function finishSex(p,kind,raw,extra){
  extra=extra||{};
  ensureMeters(p);
  var notes=[];
  if(extra.oral) notes.push("Mouth and hands. No penetration.");
  else if(!raw) notes.push("You used a condom. Still filthy. Safer.");
  else notes.push("Raw. No latex. Every thrust is skin on skin.");
  bumpMeters(p,{sexual:R(8,16),heat:-R(20,40),attach:R(3,10),flirt:R(2,6),rel:extra.rel||R(5,12)});
  if(p.rel!=null) p.rel=clamp(p.rel+(extra.rel||R(5,12)),0,100);
  delta("happiness",extra.hap||R(10,18));
  delta("health",extra.health|| -R(1,4));
  if(extra.fame) delta("fame",extra.fame);
  achieve("laid","Slept Around");
  if(extra.act==="bj"||extra.act==="throat"||extra.act==="finish") achieve("head","Got Head");
  var infected=false;
  if(hivRisk(p,raw,kind,extra)){
    S.hiv=true; S.hivKnown=chance(0.35);
    infected=true;
    if(S.hivKnown) notes.push("🩸 Later you feel off. A test confirms it: HIV+.");
    else notes.push("Something feels wrong after. You ignore it.");
    achieve("poz","Poz");
  }
  if(!extra.oral && infectPartner(p,raw)) notes.push("You might have passed it. "+p.name.split(" ")[0]+" doesn't know.");
  var pregChance=extra.oral?0:(raw?0.14:0.02);
  pregChance*=diffMul();
  if(S.traits&&S.traits.indexOf("fertile")>=0) pregChance*=1.6;
  if(kind==="hookup"||kind==="side"||kind==="quickie") pregChance*=0.85;
  if(pregChance&&canConceive(p)&&chance(pregChance)&&S.age>=18){
    var fromHook=kind==="hookup"||kind==="side"||kind==="quickie"||S.partner!==p;
    var kn=addBaby(p,fromHook);
    if(fromHook&&S.gender==="M")
      notes.push("Weeks later "+p.name.split(" ")[0]+" texts: late. "+kn+" exists. You're on the hook for "+fmtMoney(childSupportAmt())+"/mo.");
    else if(fromHook&&S.gender==="F")
      notes.push("You're late. "+kn+" is coming. Childcare is now a line item.");
    else
      notes.push(p.name.split(" ")[0]+" is late. "+kn+" is on the way.");
  }
  if(kind==="hookup"||kind==="quickie"||kind==="side"){
    rememberRegular(p);
    galleryAdd((extra.actLabel||"Hookup")+" with "+p.name+(extra.loc?(" @ "+extra.loc):""));
    recapAdd("A filthy night with "+p.name.split(" ")[0]+".");
    if(!S.blackmail&&chance(0.08*diffMul())){
      S.blackmail={name:p.name,monthly:Math.max(2000,Math.round(1500+S.stats.fame*40))};
      notes.push("📼 "+p.name.split(" ")[0]+" kept a video. "+fmtMoney(S.blackmail.monthly)+"/mo or it goes public.");
      achieve("blackmail","Compromised");
    }
    if(!S.hepc&&raw&&chance(0.04*diffMul())){
      S.hepc=true; notes.push("🧪 Weeks later: Hep C. Treat it or it grinds you down.");
    }
    if(S.stats.addiction>55&&chance(0.08*diffMul())){
      notes.push("You did their stash too.");
      delta("addiction",R(6,12));
      if(chance(0.25*diffMul())){ overdose(); return; }
    }
  }
  var body=extra.act?sexActScene(p,extra.act):sexScene(p,kind==="bed"?"bed":kind);
  if(extra.loc) body=extra.loc+" — "+body;
  var title=extra.actLabel||(kind==="hookup"?"🔥 Hookup":kind==="hotel"?"🛏️ Hotel Suite":kind==="tape"?"📹 Tape":kind==="quickie"?"🚿 Quickie":kind==="side"?"🌙 Rendezvous":"🔥 "+p.name.split(" ")[0]);
  var caught=extra.caught&&chance(extra.caught);
  showResult(title, body+(extra.oral||raw?"":"<br><br>Latex on. Still nasty.")+"<br><br>"+notes.join(" "),
    caught?function(){ exposed(); }:null);
}
  function A(name){
  if(!S||!S.alive||modalOpen()) return;
  if(S.prison>0&&name.indexOf("p_")!==0) return;
  if(name==="drugMenu"){ openSub("drugs"); return; }
  if(name==="bandMenu"){ openSub("band"); return; }
  if(name==="partnerMenu"){ openSub("partner"); return; }
  if(name==="entmenu"){ openSub("ent"); return; }
  if(name.indexOf("fireent")===0){ fireEnt(parseInt(name.slice(7),10)); afterAct(); return; }
  if(name==="menuBack"){ menuBack(); return; }
  if(name.indexOf("sideMenu")===0){ openSub("side",parseInt(name.slice(8),10)); return; }
  if(name.indexOf("memberMenu")===0){ openSub("member",parseInt(name.slice(10),10)); return; }
  if(name.indexOf("workerMenu")===0){ openSub("worker",parseInt(name.slice(10),10)); return; }
  if(name.indexOf("friendMenu")===0){ openSub("friend",parseInt(name.slice(10),10)); return; }
  if(name.indexOf("fireMember")===0){ fireMember(parseInt(name.slice(10),10)); return; }
  if(name.indexOf("buyAsset")===0){ buyAsset(parseInt(name.slice(8),10)); afterAct(); return; }
  if(name.indexOf("sellAsset")===0){ sellAsset(parseInt(name.slice(9),10)); afterAct(); return; }
  if(name.indexOf("buyBiz")===0){ buyBiz(parseInt(name.slice(6),10)); afterAct(); return; }
  if(name.indexOf("sellBiz")===0){ sellBiz(parseInt(name.slice(7),10)); afterAct(); return; }
  var T=TIERS[S.tier];
  switch(name){
    case "k_pots": delta("talent",R(2,4)); delta("happiness",2);
      if(chance(0.2)){ delta("happiness",-3); toast("Mom says the pots are NOT drums. She is wrong.","🥁"); }
      else toast("Kitchen session! The neighbors are concerned.","🥁"); break;
    case "k_hum": delta("talent",R(1,3)); delta("happiness",1); break;
    case "k_air": delta("talent",R(1,3)); delta("happiness",R(2,4));
      toast("Air guitar solo in the living room. Flawless.","🎸"); break;
    case "k_draw": delta("talent",R(1,2)); delta("happiness",2);
      toast("You drew yourself headlining a stadium. Manifesting.","🖍️"); break;
    case "k_nap": delta("health",R(2,4)); delta("happiness",R(1,3)); break;
    case "k_toys": delta("happiness",R(3,6)); break;
    case "k_cartoons": delta("happiness",R(2,4)); break;
    case "k_snacks": delta("happiness",R(2,5)); delta("health",-R(1,3));
      toast("Cookies taste like victory.","🍪"); break;
    case "k_outside": delta("health",R(3,5)); delta("happiness",R(1,3)); break;
    case "k_hide": delta("happiness",R(2,4));
      if(chance(0.25)) toast("Nobody found you for an hour. Legendary hiding spot.","🫣"); break;
    case "k_tantrum": delta("happiness",R(4,8));
      if(chance(0.25)){ delta("happiness",-6); toast("GROUNDED. The tantrum backfired spectacularly.","😤"); }
      else toast("You screamed about nothing for 20 minutes. Cathartic.","😤"); break;
    case "practice": if(!needAge(10))break;
      delta("talent",S.stats.talent>80?R(1,3):R(2,6)); delta("happiness",-1); break;
    case "gig": if(!needAge(14))break;
      moneyDelta(gigPay(),"🎙️ Gig payday"); delta("fame",T.gf);
      delta("happiness",R(2,6)); delta("health",-R(1,3));
      if(chance(0.15)) delta("addiction",2); break;
    case "single": if(!needAge(14))break;
      if(!S.signed&&!needCash(10000))break;
      if(!S.signed) moneyDelta(-10000,"🎵 Studio time");
      S.singles++;
      if(hitRoll(58)){ delta("fame",R(8,16));
        moneyDelta(Math.round(R(30000,200000)*(1+S.tier*0.4)),"🎵 Single royalties");
        confetti(90); achieve("hit","Hit Single"); showBanner("🎵 HIT SINGLE!","climbing the charts");
      } else { delta("fame",R(1,4)); moneyDelta(R(2000,9000),"🎵 Single sales"); toast("The single flopped.","📉"); }
      break;
    case "album": if(!needAge(14))break;
      if(!S.signed&&!needCash(50000))break;
      if(!S.signed) moneyDelta(-50000,"💿 Studio time");
      S.albums++; if(S.signed&&S.albumsOwed>0)S.albumsOwed--;
      if(hitRoll(62)){ delta("fame",R(12,22));
        moneyDelta(Math.round(R(150000,800000)*(1+S.tier*0.4)),"💿 Album sales");
        confetti(120); achieve("album","Chart-Topper"); showBanner("💿 #1 ALBUM!","platinum baby");
      } else { delta("fame",R(2,6)); moneyDelta(R(10000,40000),"💿 Album sales"); toast("The album underperformed.","📉"); }
      break;
    case "tour": if(!needAge(16))break;
      moneyDelta(Math.round(gigPay()*10),"🚌 Tour revenue");
      delta("fame",R(10,18)); delta("health",-R(10,18));
      delta("happiness",-R(5,12)); delta("addiction",R(5,15));
      S.tours++; confetti(100);
      if(chance(0.2)){ delta("health",-10); toast("Tour bus fender-bender!","🚌"); }
      achieve("tour","Road Warrior"); break;
    case "labelInfo":
      openModal('<h2>📝 Label Deal</h2><div class="mtext">You owe Big Loud Records <b>'+S.albumsOwed+
        '</b> more album(s). They paid your studio costs — deliver the hits.</div><button class="btn" onclick="closeModal()">Got it</button>');
      break;
    case "formBand": if(!needAge(14))break;
      if(!needCash(5000))break;
      moneyDelta(-5000,"🤘 Band costs"); formBand(); break;
    case "b_jam":
      S.band.chem=clamp(S.band.chem+5,0,100);
      S.band.members.forEach(function(m){ m.happy=clamp(m.happy+3,0,100); });
      delta("happiness",3); toast("🎶 Tight jam. The band is gelling.","🤘"); break;
    case "compliment": { var cp=S.partner; if(!cp)break;
      cp.rel=clamp(cp.rel+R(3,8),0,100); bumpMeters(cp,{flirt:R(5,10),attach:R(3,7)}); delta("happiness",2);
      toast(pick(["You told "+cp.name+" they're the best thing that ever happened to you. ❤️",
        "You left a love note on the fridge. ❤️","You slow-danced in the kitchen. ❤️"]),"💐"); break; }
    case "pgift": { var pg=S.partner; if(!pg||!needCash(1000))break;
      moneyDelta(-1000,"🎁 Gift"); pg.rel=clamp(pg.rel+R(8,15),0,100); delta("happiness",3);
      toast("💐 "+pg.name+" loved the gift.","🎁"); break; }
    case "getaway": { var gw=S.partner; if(!gw||!needCash(8000))break;
      moneyDelta(-8000,"🏝️ Getaway"); gw.rel=clamp(gw.rel+R(12,20),0,100);
      delta("happiness",8); delta("fame",2); confetti(60);
      toast("🏝️ Papped on a beach with "+gw.name+". Iconic.","📸"); break; }
    case "argue": { var ag=S.partner; if(!ag)break;
      if(chance(0.3)){ ag.rel=clamp(ag.rel-R(15,25),0,100); delta("happiness",-R(6,12)); shakeIt();
        toast("🗯️ Huge fight. Doors were slammed.","💔"); }
      else { ag.rel=clamp(ag.rel+R(2,6),0,100); delta("happiness",2);
        toast("Cleared the air. Stronger for it.","💬"); } break; }
    case "rendezvous": { var rv=S.side[subCtx]; if(!rv)break;
      askSex(rv,"side",{rel:R(8,14),hap:R(10,18),caught:0.25}); break; }
    case "sidebang": { var qb=S.side[subCtx]; if(!qb)break;
      askSex(qb,"quickie",{rel:R(4,9),hap:R(6,12),health:-1,caught:0.12}); break; }
    case "sidegift": { var sg=S.side[subCtx]; if(!sg||!needCash(500))break;
      moneyDelta(-500,"🎁 Gift"); sg.rel=clamp(sg.rel+R(6,12),0,100);
      toast("🎁 "+sg.name+" feels spoiled.","😏"); break; }
    case "endit": { var ei=S.side[subCtx]; if(!ei)break;
      S.side.splice(subCtx,1); delta("happiness",-5);
      toast("✂️ You ended it with "+ei.name+". Clean break.","😮‍💨"); break; }
    case "praise": { var pr=bandMember(); if(!pr)break;
      pr.happy=clamp(pr.happy+R(5,10),0,100); pr.ego=clamp(pr.ego+R(2,5),0,100);
      S.band.chem=clamp(S.band.chem+2,0,100);
      toast("👏 "+pr.name+" is beaming.","🤘"); break; }
    case "bbonus": { var bb=bandMember(); if(!bb||!needCash(5000))break;
      moneyDelta(-5000,"💵 Bonus"); bb.happy=clamp(bb.happy+R(10,16),0,100);
      bb.ego=clamp(bb.ego+R(3,6),0,100);
      toast("💵 "+bb.name+" just got paid.","🤘"); break; }
    case "hangout": { var ho=bandMember(); if(!ho)break;
      ho.happy=clamp(ho.happy+R(4,8),0,100); S.band.chem=clamp(S.band.chem+R(3,6),0,100);
      delta("happiness",3); toast("🍻 Beers with "+ho.name+". Good times.","🤘"); break; }
    case "reprimand": { var rp=bandMember(); if(!rp)break;
      rp.ego=clamp(rp.ego-R(5,10),0,100); rp.happy=clamp(rp.happy-R(6,12),0,100);
      if(chance(0.2)){ var out=rp.name, role=rp.role;
        S.band.members[subCtx]=newMember(role);
        S.band.chem=clamp(S.band.chem-15,0,100);
        toast("😠 "+out+" stormed out! A replacement was found.","🔥");
        if(S.band.chem<=0) breakupBand(); }
      else toast("😠 "+rp.name+" took the criticism. Barely.","🤘"); break; }
    case "recruit": if(!needAge(18))break;
      if(S.crew.length>=6){ toast("Your operation is at capacity (6).","😎"); break; }
      if(!needCash(5000))break;
      if(S.stats.looks+S.stats.fame+R(0,60)<70){
        moneyDelta(-2000,"😎 Recruiting");
        toast("Nobody's biting. Build your looks and fame first.","😎"); break; }
      moneyDelta(-5000,"😎 New associate");
      S.crew.push(crewGen());
      confetti(50); achieve("mogul","Street Mogul");
      toast("😎 "+S.crew[S.crew.length-1].name+" joined the operation.","💼"); break;
    case "w_cut": { var wc=crewW(); if(!wc)break;
      if(!(wc.pot>0)){ toast("Nothing banked yet — the team is still working.","💼"); break; }
      moneyDelta(wc.pot,"💼 Collected cut");
      wc.pot=0; wc.loyalty=clamp(Math.round(wc.loyalty-R(2,5)),0,100); break; }
    case "w_out": { var wo=crewW(); if(!wo||!needCash(1000))break;
      moneyDelta(-1000,"🌃 Night out");
      wo.loyalty=clamp(Math.round(wo.loyalty+R(8,15)),0,100);
      wo.heat=Math.max(0,wo.heat-R(3,8));
      delta("happiness",5); toast("🌃 Good night out. Loyalty up.","😎"); break; }
    case "w_loose": { var wl=crewW(); if(!wl)break;
      S.crew.splice(subCtx,1);
      if(wl.loyalty<30&&chance(0.4)){ busted("An ex-associate flipped"); }
      else { delta("happiness",-3); toast("✂️ You cut ties with "+wl.name+".","😮‍💨"); } break; }
    case "sm_post": {
      var g=Math.round(R(100,800)*(1+S.stats.fame/25));
      if(chance(0.06)){ g*=5; confetti(70); toast("📱 Your post went MEGA-VIRAL!","🔥"); }
      S.followers+=g; delta("fame",R(0,2)); delta("happiness",2);
      toast("📱 +"+fmtNum(g)+" followers","📈"); break; }
    case "sm_live": {
      var sw=Math.round(R(-2000,12000)*(1+S.stats.fame/20));
      S.followers=Math.max(0,S.followers+sw);
      delta("happiness",R(2,6));
      if(sw>=0) toast("🔴 Live was a hit! +"+fmtNum(sw)+" followers","📱");
      else toast("🔴 Live flopped… "+fmtNum(sw)+" followers","📉");
      if(chance(0.12)){ delta("notoriety",R(5,10)); shakeIt();
        toast("🔴 You said something unhinged on live. Clipped everywhere.","😬"); } break; }
    case "sm_beef": {
      var spike=Math.round(R(5000,30000)*(1+S.stats.fame/25));
      S.followers+=spike;
      delta("notoriety",R(4,8)); delta("fame",R(2,5)); confetti(60);
      if(!S.rival){
        S.rival={name:(chance(0.5)?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST),heat:60};
        toast("🥩 You started beef with "+S.rival.name+"! +"+fmtNum(spike)+" followers","📱");
      } else {
        S.rival.heat=clamp(S.rival.heat+15,0,100);
        toast("🥩 You reignited the beef with "+S.rival.name+"! +"+fmtNum(spike)+" followers","📱");
      } break; }
    case "sm_brand":
      if(S.cancelled){ toast("Brands ran when you got cancelled.","🚫"); break; }
      if(S.followers<100000){ toast("You need 100K followers for brand deals. ("+fmtNum(S.followers)+")","📱"); break; }
      moneyDelta(Math.round(S.followers*RF(0.08,0.2)),"💰 Brand deal");
      S.followers=Math.round(S.followers*0.95);
      delta("happiness",-2); confetti(70);
      toast("💰 Sold out (lovingly).","📱"); break;
    case "mkfriends":
      if(S.friends.length>=5){ toast("Your circle is full (5).","🧑‍🤝‍🧑"); break; }
      if(S.friends.length<3) genFriends();
      else { S.friends.push(newFriend());
        toast("🧑‍🤝‍🧑 New friend: "+S.friends[S.friends.length-1].name+"!","🎉"); } break;
    case "fr_hang": { var fh=frFriend(); if(!fh||!needCash(100))break;
      moneyDelta(-100,"🍻 Hangout");
      fh.closeness=clamp(Math.round(fh.closeness+R(2,5)),0,100);
      delta("happiness",R(4,9)); toast("🍻 Good times with "+fh.name+".","🧑‍🤝‍🧑"); break; }
    case "fr_party": { var fp=frFriend(); if(!fp)break;
      fp.closeness=clamp(Math.round(fp.closeness+R(3,6)),0,100);
      delta("happiness",R(8,14)); delta("addiction",R(4,10));
      if(chance(0.12)){ busted("Wild party"); } break; }
    case "fr_talk": { var ft=frFriend(); if(!ft)break;
      ft.closeness=clamp(Math.round(ft.closeness+R(5,10)),0,100);
      delta("happiness",R(5,10)); delta("addiction",-R(3,6));
      toast("💬 Real talk with "+ft.name+". You feel lighter.","🧑‍🤝‍🧑"); break; }
    case "social":
      var flex=S.assets.some(function(a){return a.name==="Mansion"||a.name==="Private Jet";})?2:0;
      delta("fame",R(1,4)+Math.floor(S.tier/2)+flex);
      S.followers+=Math.round(R(50,400)*(1+S.stats.fame/25));
      if(flex&&chance(0.5)) toast("📸 Flexing the lifestyle…","✨");
      if(chance(0.08)){ delta("fame",R(8,15)); confetti(50); toast("📱 Your post went VIRAL!","🔥"); }
      break;
    case "party": delta("happiness",R(8,15)); delta("addiction",R(5,12)); delta("health",-R(3,8));
      if(chance(0.10)){ busted("Trashing a hotel room"); }
      break;
    case "salon": if(!needCash(200))break;
      moneyDelta(-200,"💇 Salon"); delta("looks",R(2,6)); delta("happiness",3); break;
    case "surgery": if(!needAge(18)||!needCash(15000))break;
      moneyDelta(-15000,"🔪 Surgery");
      if(chance(0.08)){ shakeIt(); delta("looks",-R(10,20)); delta("health",-R(8,15)); toast("🔪 BOTCHED SURGERY!","🚨"); }
      else { delta("looks",R(8,15)); delta("happiness",5); toast("You look brand new.","✨"); }
      break;
    case "gala": if(!needCash(10000))break;
      moneyDelta(-10000,"🎗️ Donation"); delta("fame",R(3,7)); delta("happiness",R(4,8)); delta("notoriety",-3);
      confetti(40); break;
    case "writesong": if(!needAge(12))break;
      var good=S.stats.talent+R(0,30)+(S.traits&&S.traits.indexOf("cursed voice")>=0?-10:0);
      if(good>=55){
        var title=pick(["Midnight","Velvet","Static","Neon","Blood"])+" "+pick(["Hymn","Riot","Fever","Gospel","Hole"]);
        S.songs.push({title:title,qual:good});
        delta("talent",R(1,3)); recapAdd("Wrote \""+title+"\".");
        toast("✍️ Banked \""+title+"\". Next single hits easier.","🎵");
      } else toast("✍️ Nothing usable. Keep practicing.","📉");
      break;
    case "collab": if(!needAge(18))break;
      var other=S.rival?S.rival.name:(pick(FIRST_F.concat(FIRST_M))+" "+pick(LAST));
      if(chance(0.55)){ delta("fame",R(6,14)); moneyDelta(R(20000,120000),"🤝 Feature check"); confetti(60); recapAdd("Collab with "+other+" ate."); toast("🤝 Feature with "+other+" slapped.","🎤"); }
      else { delta("fame",-R(2,6)); toast("🤝 The "+other+" verse buried you.","📉"); }
      break;
    case "docu": if(!needAge(21))break;
      if(chance(0.4)){ moneyDelta(R(80000,400000),"🎬 Doc advance"); delta("fame",R(4,10)); recapAdd("The documentary was kind."); toast("🎬 They made you look mythic.","🎬"); }
      else { delta("notoriety",R(8,16)); S.cancelled=S.cancelled||chance(0.25); recapAdd("The doc aired the dirt."); showResult("🎬 THE CUT","They used the tape, the kids, the arrests. Beautiful cinematography. You look like a cautionary tale."); }
      break;
    case "uncancel": if(!needCash(20000))break;
      moneyDelta(-20000,"🕊️ PR firm");
      if(chance(0.45)){ S.cancelled=false; delta("fame",4); toast("🕊️ People moved on. Mostly.","📣"); }
      else toast("🕊️ The internet has a long memory.","🚫");
      break;
    case "ofans": if(!needAge(18))break;
      if(!S.ofans.on){ S.ofans.on=true; S.ofans.fans=Math.round(200+S.stats.fame*80+S.followers*0.01); achieve("ofans","Paid Content"); toast("📱 Page is live. The internet is feral.","🔥"); break; }
      S.ofans.posts++; S.ofans.fans+=Math.round(R(50,800)*(1+S.stats.looks/80));
      moneyDelta(Math.round(S.ofans.fans*RF(0.05,0.2)),"📱 Post payout");
      if(chance(0.1)){ delta("notoriety",R(4,10)); toast("📱 Someone clipped it off-platform.","📸"); }
      break;
    case "crypto": if(!needAge(18))break;
      if(S.crypto>0){
        moneyDelta(S.crypto,"🪙 Cashed crypto"); recapAdd("Sold bags for "+fmtMoney(S.crypto)); S.crypto=0; break;
      }
      if(!needCash(5000))break;
      var bag=R(5000,Math.max(5000,Math.min(S.stats.money,200000)));
      if(!needCash(bag)) bag=5000;
      moneyDelta(-bag,"🪙 Bought the dip");
      S.crypto=Math.round(bag*RF(0.3,1.8));
      toast("🪙 Bags packed. Age up to see if it moons.","🪙");
      break;
    case "merchdrop": if(!needAge(16))break;
      var mer=Math.round((3000+S.stats.fame*400)*RF(0.6,2.2));
      moneyDelta(mer,"👕 Merch drop"); recapAdd("Merch drop printed "+fmtMoney(mer));
      break;
    case "drinkdeal": if(!needAge(18))break;
      if(S.stats.fame<40){ toast("You're not famous enough to sell heart palpitations.","⚡"); break; }
      if(S.cancelled){ toast("Brands won't touch you while you're cancelled.","🚫"); break; }
      S.drinkDeal=true; moneyDelta(R(40000,200000),"⚡ Signing bonus");
      achieve("drink","Caffeinated"); toast("⚡ Your face is on a can.","⚡"); break;
    case "hireent": if(!needAge(18))break;
      if(S.entourage.length>=5){ toast("That's a full circus.","👔"); break; }
      var er=ENT_ROLES.filter(function(r){return !S.entourage.some(function(e){return e.role===r.role;});});
      if(!er.length){ toast("Every role is filled.","👔"); break; }
      var pickR=pick(er);
      if(!needCash(pickR.cost))break;
      moneyDelta(-pickR.cost,"👔 Hired "+pickR.role);
      S.entourage.push({role:pickR.role,icon:pickR.icon,cost:pickR.cost,name:pick(FIRST_F.concat(FIRST_M))+" "+pick(LAST),loyal:R(40,70)});
      toast("👔 "+S.entourage[S.entourage.length-1].name+" is your new "+pickR.role+".","👔");
      break;
    case "gym": if(!needCash(50))break;
      moneyDelta(-50,"🏋️ Gym"); delta("health",R(3,7)); delta("looks",R(1,3)); break;
    case "checkup": if(!needCash(500))break;
      moneyDelta(-500,"🩺 Checkup"); delta("health",R(4,9)); break;
    case "meditate": delta("happiness",R(4,9)); delta("health",2); break;
    case "therapy": if(!needCash(300))break;
      moneyDelta(-300,"🛋️ Therapy"); delta("happiness",R(6,12)); delta("addiction",-R(3,8)); break;
    case "rehab": if(!needCash(25000))break;
      moneyDelta(-25000,"🏥 Rehab"); delta("addiction",-S.stats.addiction);
      delta("health",5); delta("happiness",-5); achieve("clean","Clean & Sober"); break;
    case "hivtest": if(!needAge(18)||!needCash(200))break;
      moneyDelta(-200,"🩸 Lab work");
      S.hivKnown=true;
      if(S.hiv){ shakeIt(); showResult("🩸 HIV TEST","Positive. You have HIV. Start meds or it will kill you."); achieve("poz","Poz"); }
      else showResult("🩸 HIV TEST","Negative. For now. Raw hookups are still a dice roll.");
      break;
    case "hivmeds": if(!needAge(18)||!needCash(12000))break;
      moneyDelta(-12000,"💊 First year of meds"); S.hivMeds=true; S.hivKnown=true;
      delta("happiness",4); toast("💊 Cocktail started. This is what keeps you alive.","🩸"); break;
    case "startprep": if(!needAge(18)||!needCash(3600))break;
      moneyDelta(-3600,"🛡️ PrEP"); S.prep=true;
      toast("🛡️ PrEP is on. Infection risk drops hard — it is not zero.","💊"); break;
    case "stopprep": S.prep=false; toast("PrEP cancelled.","🛡️"); break;
    case "d_weed": if(!needAge(14))break;
      delta("happiness",R(4,8)); delta("addiction",R(3,6)); delta("health",-R(1,3)); break;
    case "d_coke": if(!needAge(16))break;
      delta("happiness",R(8,14)); delta("addiction",R(8,14)); delta("health",-R(4,8));
      if(chance(0.05)) busted("Cocaine possession"); break;
    case "d_heroin": if(!needAge(16))break;
      delta("happiness",R(12,20)); delta("addiction",R(15,22)); delta("health",-R(8,14));
      if(chance(0.12)){ overdose(); } else if(chance(0.06)) busted("Heroin possession");
      break;
    case "dating": if(!needAge(18))break; dating(); break;
    case "hookup": if(!needAge(18))break; hookupApp(); break;
    case "callregular": if(!needAge(18))break; callRegular(); break;
    case "keepsugar": if(!needAge(18))break;
      if(S.sugar){ toast("You're already keeping "+S.sugar.name+".","💎"); break; }
      var sg=genPerson();
      sg.monthly=Math.max(3000,Math.round(4000+S.stats.fame*50));
      if(!needCash(sg.monthly))break;
      moneyDelta(-sg.monthly,"💎 First month");
      S.sugar=sg; recapAdd("Kept "+sg.name+".");
      toast("💎 "+sg.name+" is on retainer. "+fmtMoney(sg.monthly)+"/mo.","💎"); break;
    case "seesugar": if(!S.sugar)break;
      if(isRestrained(S.sugar)){ toast("There's a paper on that.","🚫"); break; }
      showHookLocs(S.sugar); break;
    case "threesome": if(!needAge(18)||!S.partner)break;
      startThreesome(); break;
    case "visitkid": {
      var vk=S.kids.filter(function(k){return k.liveWith===false||k.support;})[0];
      if(!vk){ toast("They're all under your roof.","👶"); break; }
      delta("happiness",R(5,12));
      if(vk.trait==="hater") delta("happiness",-4);
      recapAdd("Weekend with "+vk.name+" ("+ (vk.trait||"kid") +").");
      toast("📆 "+vk.name+" · "+(vk.trait||"kid")+". You showed up.","👶"); break; }
    case "payblackmail":
      if(!S.blackmail){ toast("Nobody's holding a tape.","📼"); break; }
      if(!needCash(S.blackmail.monthly*12))break;
      moneyDelta(-S.blackmail.monthly*12,"📼 Paid the year");
      if(chance(0.2)){ toast("📼 They want more next year.","📼"); S.blackmail.monthly=Math.round(S.blackmail.monthly*1.25); }
      else toast("📼 Quiet. For now.","📼");
      break;
    case "treathepc": if(!S.hepc||!needCash(40000))break;
      moneyDelta(-40000,"🧪 Hep C treatment"); S.hepc=false; delta("health",8); toast("🧪 Cleared.","🧪"); break;
    case "showrecap": showYearPaper(S.recap); break;
    case "showgallery":
      if(!S.gallery||!S.gallery.length){ toast("No saved nights.","🖼️"); break; }
      showResult("🖼️ NIGHT GALLERY", S.gallery.map(function(g){return "age "+g.age+" — "+g.line;}).join("<br>"));
      break;
    case "showkids":
      if(!S.kids.length){ toast("No kids.","👶"); break; }
      showResult("👶 THE KIDS", S.kids.map(function(k){
        return k.name+" · "+k.age+" · "+(k.trait||"?")+(k.liveWith===false?" · with the other parent":" · with you");
      }).join("<br>"));
      break;
    case "filero": if(!needAge(18))break; fileRO(); break;
    case "flirt": {
      var fl=S.partner; if(!fl)break;
      bumpMeters(fl,{flirt:R(8,16),heat:R(4,10),rel:R(2,5)});
      fl.rel=clamp(fl.rel+R(2,5),0,100); delta("happiness",2);
      toast(pick(["You talk filthy in their ear until they're squirming.","You keep finding excuses to touch them.","They blush. Then they look at your mouth."]),"😉"); break; }
    case "sext": {
      var sx=S.partner; if(!sx)break;
      bumpMeters(sx,{sexual:R(8,14),heat:R(10,18),flirt:R(3,8)});
      delta("happiness",3);
      toast("📱 You send something you should not send in writing. They send worse back.","🔥"); break; }
    case "intimate": {
      var ip=S.partner; if(!ip)break;
      ensureMeters(ip);
      if(ip.flirt<20){ toast(ip.name+" wants to be seduced first. (Flirt 20+ )","😏"); break; }
      askSex(ip,"bed",{rel:R(6,14),hap:R(8,16)}); break; }
    case "hotelsuite": {
      var hs=S.partner; if(!hs)break;
      ensureMeters(hs);
      if(hs.sexual<35){ toast("The spark isn't there yet. (Sexual 35+)","🛏️"); break; }
      if(!needCash(2500))break;
      moneyDelta(-2500,"🛏️ Hotel suite");
      confetti(50);
      askSex(hs,"hotel",{rel:R(12,20),hap:R(12,20),fame:chance(0.3)?2:0}); break; }
    case "sextape": {
      var st=S.partner; if(!st)break;
      ensureMeters(st);
      if(st.sexual<55){ toast("They're not freaky enough on camera yet. (Sexual 55+)","📹"); break; }
      S.tapes=(S.tapes||0)+1;
      S.followers+=Math.round(R(2000,18000)*(1+S.stats.fame/20));
      achieve("tape","Director's Cut");
      askSex(st,"tape",{rel:R(4,10),hap:R(10,16),fame:R(3,8)});
      if(chance(0.35)){ delta("notoriety",R(10,18)); shakeIt(); toast("📹 The tape leaked. Of course it did.","📸"); }
      break; }
    case "date": if(!needCash(500))break;
      moneyDelta(-500,"🍷 Date night");
      ensureMeters(S.partner);
      S.partner.rel=clamp(S.partner.rel+R(5,12),0,100);
      bumpMeters(S.partner,{attach:R(6,12),flirt:R(4,8),jealous:-R(2,6)});
      delta("happiness",R(5,10)); juiceAt($("menuPanel"),"+"+Math.round(S.partner.rel)+"% ❤️","#ff9de2",18); break;
    case "propose": if(!needCash(2000))break;
      if(S.partner.rel<60){ toast(S.partner.name+" is not ready. (Need 60% relationship)","💔"); break; }
      moneyDelta(-2000,"💍 Engagement ring"); S.partner.engaged=true;
      confetti(80); toast("💍 "+S.partner.name+" said YES!","💒"); break;
    case "marry": {
      var cost=5000+Math.round(S.stats.fame*400);
      if(!needCash(cost))break;
      moneyDelta(-cost,"💒 Wedding"); S.partner.spouse=true; S.spouses++;
      delta("happiness",15); confetti(130); showBanner("💒 MARRIED!","to "+S.partner.name);
      achieve("married","Married"); break; }
    case "child":
      moneyDelta(-3000,"👶 Baby costs");
      S.kids.push({name:pick(FIRST_M.concat(FIRST_F))+" "+S.name.split(" ")[1],age:0,other:S.partner?S.partner.name:null,liveWith:true,support:false,trait:pick(KID_TRAITS)});
      if(S.partner) bumpMeters(S.partner,{attach:15,jealous:-10});
      delta("happiness",10); confetti(110); showBanner("👶 IT'S A BABY!",S.kids[S.kids.length-1].name+" is born");
      achieve("parent","Parent"); break;
    case "breakup": toast("💔 You dumped "+S.partner.name+".","💔");
      S.partner=null; delta("happiness",-R(8,15)); break;
    case "divorce": {
      var half=Math.round(S.stats.money*0.5);
      moneyDelta(-half,"⚖️ Divorce settlement"); S.divorces++;
      var av=assetValue()+bizValue();
      if(av>0) moneyDelta(-Math.round(av/2),"⚖️ Asset split");
      S.alimony=5; S.alimonyAmt=Math.max(5000,Math.round(S.peakWorth*0.02));
      toast("⚖️ Divorced. Half your money is gone.","💔");
      S.partner=null; delta("happiness",-15); delta("notoriety",5); break; }
    case "cheat":
      if(!chance(0.65)){ toast("No luck tonight.","🌙"); break; }
      var sp=genPerson(); S.side.push(sp);
      toast("😏 You met "+sp.name+"…","🌙");
      if(chance(0.30)) exposed();
      break;
    case "evadesupport":
      if(!S.babyMamas.some(function(b){return b.active;})){ toast("Nobody to stiff.","👩‍🍼"); break; }
      if(S.skipSupport){ toast("Already ducking support this year.","🏃"); break; }
      S.skipSupport=true;
      delta("happiness",2);
      toast("🏃 You'll skip this year's support when you age up. Courts may notice.","⚖️");
      break;
    case "payarrears":
      if(!(S.supportArrears>0)){ toast("You're current. No arrears.","💸"); break; }
      if(!needCash(S.supportArrears))break;
      moneyDelta(-S.supportArrears,"⚖️ Paid child support arrears");
      S.supportArrears=0; S.warrant=false; S.evadeStreak=0;
      delta("notoriety",-4); delta("happiness",3);
      toast("⚖️ Paid in full. Warrant cleared.","👩‍🍼");
      break;
    case "custody": {
      var targets=S.kids.filter(function(k){return k.liveWith===false;});
      if(!targets.length){
        targets=S.kids.filter(function(k){return k.other && k.support;});
      }
      if(!targets.length){ toast("No kid to fight over — they're already with you.","⚖️"); break; }
      if(!needCash(15000))break;
      moneyDelta(-15000,"⚖️ Custody lawyer");
      var kid=targets[0];
      var win=0.42;
      if(S.stats.fame>50) win+=0.08;
      if(S.stats.notoriety>40) win-=0.12;
      if(S.stats.addiction>40) win-=0.12;
      if(S.hivKnown&&S.hiv&&!S.hivMeds) win-=0.15;
      if(S.supportArrears>0||S.warrant) win-=0.18;
      if(S.stats.happiness>60) win+=0.06;
      if(chance(win)){
        kid.liveWith=true; kid.support=false;
        S.babyMamas.forEach(function(b){ if(b.kid===kid.name){ b.active=false; b.monthly=0; } });
        delta("happiness",10); confetti(70);
        showResult("⚖️ CUSTODY WON",kid.name+" lives with you now. Support on that kid stops. The other parent is furious.");
        achieve("custody","Got Custody");
      } else {
        S.babyMamas.forEach(function(b){ if(b.active) b.monthly=Math.round(b.monthly*1.25); });
        delta("happiness",-8); delta("notoriety",6); shakeIt();
        showResult("⚖️ CUSTODY LOST","The judge sided with "+(kid.other||"the other parent")+". Monthly support just went up 25%. You look like the villain in the blogs.");
      }
      break; }
    case "c_fight": if(!needAge(12))break;
      if(chance(0.6)){ delta("notoriety",R(4,9)); delta("happiness",5); }
      else { delta("health",-R(8,15)); shakeIt(); }
      if(chance(0.25)) busted("Bar fight");
      break;
    case "c_heckler":
      if(S.stats.fame<15){ toast("Nobody knows you yet. No hecklers.","🎤"); break; }
      delta("notoriety",R(5,10)); delta("happiness",6);
      if(chance(0.25)) busted("Assaulting a heckler");
      break;
    case "c_steal":
      moneyDelta(Math.round(R(1000,9000)*(1+S.tier)),"💼 Stolen merch money");
      if(chance(0.30)) busted("Stealing from the venue");
      break;
    case "c_deal": if(!needAge(16))break;
      moneyDelta(R(5000,30000),"🌿 Drug money"); delta("addiction",R(5,10)); delta("notoriety",R(4,8));
      if(chance(0.35)) busted("Drug dealing");
      break;
    case "c_tax":
      if(S.stats.money<200000){ toast("You need "+fmtMoney(200000)+" to make evasion worthwhile.","🧾"); break; }
      moneyDelta(Math.round(S.stats.money*0.15),"🧾 'Saved' on taxes");
      if(chance(0.25)) busted("Tax evasion");
      break;
    case "p_behave": S.goodTime=(S.goodTime||0)+1; delta("happiness",-2); toast("Good behavior noted. ("+S.goodTime+"✓)","😇"); break;
    case "p_fight": delta("health",-R(6,14)); delta("notoriety",R(5,10)); shakeIt(); break;
    case "p_gang": delta("notoriety",R(8,14)); delta("health",5); achieve("gang","Prison Gang"); break;
    case "p_parole": {
      var served=S.prisonTotal-S.prison;
      if(served<Math.ceil(S.prisonTotal/2)){ toast("Too early — serve half your sentence first.","🕊️"); break; }
      if(chance(0.35+(S.goodTime||0)*0.08)){ release(); }
      else { toast("Parole DENIED. See you next year.","🕊️"); delta("happiness",-8); }
      break; }
    case "p_escape":
      if(chance(0.22)){ delta("notoriety",15); showBanner("🏃 ESCAPED!","you are free… and wanted"); release(); }
      else { S.prison+=2; S.prisonTotal+=2; delta("health",-10); shakeIt(); toast("Caught! +2 years in solitary.","🔒"); }
      break;
  }
  afterAct();
}
