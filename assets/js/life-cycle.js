function openModal(html){ $("modal").innerHTML=html; $("modalOverlay").classList.remove("hidden"); }
function closeModal(){ $("modalOverlay").classList.add("hidden"); }
function showResult(title,html,cb){
  openModal('<h2>'+title+'</h2><div class="mresult">'+html+'</div>'+
    '<button class="btn" id="mOk">Continue ➜</button>');
  $("mOk").onclick=function(){ closeModal(); renderAll(); if(cb)cb(); checkDead(); };
}
function eventChoice(ev){
  var h='<h2>'+ev.icon+" "+ev.title+'</h2><div class="mtext">'+ev.text()+'</div>';
  ev.choices.forEach(function(ch,i){
    var sub=(typeof ch.sub==="function")?ch.sub():ch.sub;
    h+='<button class="btn small" id="evc'+i+'">'+ch.t+
       (sub?'<span class="sub">'+sub+'</span>':"")+'</button>';
  });
  openModal(h);
  ev.choices.forEach(function(ch,i){
    $("evc"+i).onclick=function(){
      var res=ch.go();
      saveGame();
      if(res) showResult(ev.icon+" "+ev.title, res, ev.after);
      else { renderAll(); checkDead(); }
    };
  });
}
function modalOpen(){ return !$("modalOverlay").classList.contains("hidden"); }
function onAge(){
  if(!S||!S.alive||modalOpen()) return;
  closeMenu();
  if(S.prison>0){ serveYear(); return; }
  var lastPaper=S.recap||[];
  S.recap=[];
  S.age++;
  if(S.age>40) delta("looks",-R(1,3),{silent:true});
  if(S.age>60) delta("looks",-R(1,3),{silent:true});
  if(S.age>40) delta("health",-R(1,2),{silent:true});
  if(S.age>60) delta("health",-R(2,4),{silent:true});
  if(S.age>55&&S.stats.fame>0) delta("fame",-R(1,3),{silent:true});
  if(S.stats.happiness>60) delta("happiness",-2,{silent:true});
  var ad=S.stats.addiction;
  if(ad>=70){
    delta("health",-R(4,10)); delta("happiness",-6);
    if(chance(0.07)){ overdose(); return; }
  } else if(ad>=40){ delta("health",-R(2,6)); }
  if(S.tier>=1&&(S.albums>0||S.singles>0)){
    var roy=Math.round((S.albums*2500+S.singles*400)*(1+S.stats.fame/40));
    moneyDelta(roy,"💿 Royalty check");
  }
  if(S.age>=18){
    var atHome=S.kids.filter(function(k){return k.liveWith!==false;}).length;
    var living=4000+Math.round(S.stats.fame*120)+atHome*8000+(S.partner?2500:0);
    moneyDelta(-living,"🧾 Living expenses");
  }
  if(S.alimony>0){ moneyDelta(-S.alimonyAmt,"⚖️ Alimony"); S.alimony--; }
  childSupportYear();
  if(S.prep) moneyDelta(-3600,"🛡️ PrEP");
  if(S.hiv&&S.hivMeds) moneyDelta(-12000,"💊 HIV meds");
  hivYear();
  lifestyleYear();
  if(S.stats.money<0){ delta("happiness",-5); toast("📉 You are in debt!","⚠️"); }
  S.kids.forEach(function(k){
    k.age++;
    if(!k.trait) k.trait=pick(KID_TRAITS);
    if(k.age===13) toast("👶 "+k.name+" is 13 and a "+k.trait+".","🧬");
    if(k.age===16&&k.trait==="nepo star"){ delta("fame",3); recapAdd(k.name+" started posting covers."); }
    if(k.age===16&&k.trait==="trainwreck"){ delta("happiness",-4); recapAdd(k.name+" is already in the tabs."); }
  });
  if(S.partner){
    ensureMeters(S.partner);
    S.partner.rel=clamp(S.partner.rel-R(2,6),0,100);
    S.partner.flirt=clamp(S.partner.flirt-R(3,8),0,100);
    S.partner.attach=clamp(S.partner.attach-R(2,6),0,100);
    S.partner.sexual=clamp(S.partner.sexual-R(1,4),0,100);
    S.partner.heat=clamp(S.partner.heat-R(5,12),0,100);
    if(S.side.length) S.partner.jealous=clamp(S.partner.jealous+R(4,10),0,100);
    if(S.partner.rel<=0||S.partner.attach<=0){
      var ex=S.partner; S.partner=null;
      toast("💔 "+ex.name+" left you. Neglect kills love.","💔");
    } else if(S.partner.heat>=80&&S.partner.sexual>=70&&chance(0.2)){
      toast("😤 "+S.partner.name+" is sexually frustrated. Take care of them.","🔥");
      S.partner.rel=clamp(S.partner.rel-8,0,100);
    }
  }
  if(S.biz&&S.biz.length){
    S.biz.forEach(function(b){
      var p=Math.round(b.value*RF(-0.05,0.25));
      moneyDelta(p,(p>=0?"📈 ":"📉 ")+b.name+": "+fmtMoney(p));
      if(b.name==="Indie Label"&&chance(0.25)){
        var hp=Math.round(b.value*0.5);
        moneyDelta(hp,"💿 Label hit!");
        delta("fame",4); confetti(60);
        toast("💿 Your label's artist dropped a HIT!","🔥");
      }
    });
  }
  if(S.band){
    var BB=S.band;
    BB.members.forEach(function(m){
      m.ego=clamp(Math.round(m.ego+(S.stats.fame>50?R(1,3):R(0,1))),0,100);
      m.happy=clamp(m.happy+R(-4,2),0,100);
    });
    BB.chem=clamp(Math.round(BB.chem+R(-3,1)),0,100);
    if(BB.chem<=0) breakupBand();
  }
  if(S.rival){
    S.rival.heat-=10;
    if(S.rival.heat<=0){
      toast("🕊️ The beef with "+S.rival.name+" fizzled out.","🕊️");
      S.rival=null;
    }
  }
  friendsYear();
  socialYear();
  crewYear();
  if(modalOpen()){ renderAll(); saveGame(); return; }
  if(S.side.length>0&&S.partner&&chance(0.08+0.07*S.side.length)){
    exposed(); renderAll(); saveGame(); return;
  }
  if(deathCheck()) return;
  renderAll(); saveGame();
  var ev=pickEvent();
  if(ev) eventChoice(ev);
  else if(lastPaper.length) showYearPaper(lastPaper);
}
function pickEvent(){
  var pool=EVENTS.filter(function(e){ try{return e.cond();}catch(err){return false;} });
  if(!pool.length) return null;
  var tot=0, i;
  pool.forEach(function(e){ tot+=e.wt; });
  var roll=Math.random()*tot;
  for(i=0;i<pool.length;i++){ roll-=pool[i].wt; if(roll<=0) return pool[i]; }
  return pool[pool.length-1];
}
function overdose(){
  shakeIt();
  if(chance(0.45)){
    delta("health",-R(20,35)); delta("happiness",-12);
    delta("addiction",-R(5,15));
    toast("🚨 You OD'd — paramedics brought you back!","🏥");
    achieve("od","Cheated Death");
    renderAll(); saveGame();
  } else {
    die("💀 Overdose. The drugs finally won at age "+S.age+".");
  }
}
function deathCheck(){
  if(S.stats.health<=0){ die("💔 Your body gave out after years of abuse. You were "+S.age+"."); return true; }
  if(S.age>=18&&S.stats.fame>=30&&chance(0.012*diffMul())){
    die("🚗 Car wreck leaving a club at "+S.age+". The other car was paparazzi."); return true;
  }
  if(S.age>=16&&S.stats.notoriety>=40&&chance(0.01*diffMul())){
    die("🔫 Shot outside a show at "+S.age+". Wrong afterparty."); return true;
  }
  if(S.age>70&&chance((S.age-70)*0.045*diffMul())){ die("🕊️ Died peacefully in your sleep at "+S.age+"."); return true; }
  if(S.age>=112){ die("🕊️ Lived to "+S.age+" — time simply ran out."); return true; }
  return false;
}
function checkDead(){
  if(S&&S.alive&&S.stats.health<=0) die("💔 Your body gave out. You were "+S.age+".");
}
  function busted(crimeName){
  shakeIt();
  delta("notoriety",R(5,12));
  delta("happiness",-R(5,12));
  var yrs=clamp(R(1,5)+(S.record?2:0)+(S.stats.notoriety>50?2:0),1,10);
  openModal('<h2>🚔 BUSTED!</h2><div class="mtext">Caught red-handed: <b>'+crimeName+
    '</b>.<br>The trial is next week. How do you plead?</div>'+
    '<button class="btn gold small" id="tLaw">⚖️ Hire Hotshot Lawyer<span class="sub">'+fmtMoney(50000)+' · may beat the case</span></button>'+
    '<button class="btn ghost small" id="tPub">🧑‍⚖️ Public Defender<span class="sub">free · face the music</span></button>');
  $("tLaw").onclick=function(){
    if(S.stats.money<50000){ toast("You cannot afford the lawyer!","⚠️"); return; }
    moneyDelta(-50000,"⚖️ Legal fees");
    if(chance(0.55)){
      delta("notoriety",R(3,8));
      showResult("⚖️ ACQUITTED!","The jury loved you. Case dismissed — and the headlines made you <b>more</b> famous.",null);
      achieve("beatcase","Beat The Case");
    } else {
      startPrison(Math.max(1,yrs-2),"The lawyer got your sentence reduced, but you are still going away.");
    }
  };
  $("tPub").onclick=function(){
    startPrison(yrs,"The public defender barely tried. Guilty as charged.");
  };
}
function startPrison(yrs,note){
  S.prison=yrs; S.prisonTotal+=yrs; S.record=true;
  showBanner("🔒 "+yrs+" YEARS","sentenced!");
  showResult("🔒 PRISON",note+"<br><br>You will serve <b>"+yrs+" years</b>. Use the 🔒 Prison Yard menu and the SERVE YEAR button.",null);
  achieve("prison","Jailbird");
}
function serveYear(){
  S.age++;
  S.prison--;
  delta("health",-R(3,7)); delta("happiness",-R(5,10));
  delta("addiction",-R(10,20)); delta("fame",-R(2,5));
  moneyDelta(-500,"🍫 Commissary snacks");
  S.kids.forEach(function(k){ k.age++; });
  if(S.partner&&chance(0.15)){
    var ex=S.partner; S.partner=null;
    toast("💔 "+ex.name+" could not do the prison years. Gone.","💔");
  }
  if(deathCheck()) return;
  if(S.prison<=0){ release(); return; }
  renderAll(); saveGame();
  prisonEvent();
}
function prisonEvent(){
  var evs=[
    {t:"🍜 Cellmate's Contraband",x:"Your cellmate offers you prison hooch and pills.",c:[
      {t:"Take it",go:function(){delta("addiction",R(8,15));delta("happiness",R(6,12));return "It takes the edge off. The craving comes roaring back.";}},
      {t:"Refuse",go:function(){delta("happiness",-4);delta("health",3);return "You stay clean. Your body thanks you.";}}]},
    {t:"🥊 Yard Confrontation",x:"A lifer steps to you in front of everyone.",c:[
      {t:"Throw hands",go:function(){delta("health",-R(8,16));delta("notoriety",R(6,12));delta("happiness",4);return "You lose a tooth but earn respect. Nobody steps to you again.";}},
      {t:"Back down",go:function(){delta("happiness",-R(6,12));delta("health",2);return "You live to fight another day. The yard laughs.";}}]},
    {t:"🔗 Gang Recruitment",x:"The shot-callers want you running with them.",c:[
      {t:"Join up",go:function(){delta("notoriety",R(10,18));delta("health",5);achieve("gang","Prison Gang");return "Protection, at a price. Your name carries weight now.";}},
      {t:"Stay solo",go:function(){if(chance(0.35)){shakeIt();delta("health",-R(10,18));return "They jump you in the showers for disrespecting them.";}delta("happiness",-3);return "You keep your head down and survive the week.";}}]},
    {t:"💌 Letter From Home",x:"A letter arrives — "+(S.kids.length?("a crayon drawing from "+S.kids[0].name):"a fan letter from outside")+".",c:[
      {t:"Read it twice",go:function(){delta("happiness",R(8,14));return "Tears on concrete. You remember what you are surviving for.";}}]},
    {t:"🔪 Shanked!",x:"No warning. A shiv in the lunch line.",c:[
      {t:"Survive it",go:function(){shakeIt();delta("health",-R(12,20));return "You wake up in the infirmary stitched up. Close call.";}}]}
  ];
  var ev=pick(evs);
  var h='<h2>'+ev.t+'</h2><div class="mtext">'+ev.x+'</div>';
  ev.c.forEach(function(ch,i){ h+='<button class="btn small" id="pc'+i+'">'+ch.t+'</button>'; });
  openModal(h);
  ev.c.forEach(function(ch,i){
    $("pc"+i).onclick=function(){
      var res=ch.go(); saveGame();
      showResult(ev.t,res,null);
    };
  });
}
function release(){
  S.prison=0;
  delta("notoriety",R(5,10)); delta("happiness",R(10,18));
  showBanner("🦅 FREE!","sentence served");
  confetti(130);
  openModal('<h2>🦅 RELEASED</h2><div class="mtext">The gates clang open. You squint at the sun — a <b>free</b> '+
    (S.gender==="F"?"woman":"man")+' with a record and a story to tell.</div>'+
    '<button class="btn gold" id="relOk">Walk free ➜</button>');
  $("relOk").onclick=function(){ closeModal(); renderAll(); saveGame(); };
  achieve("free","Free Bird");
}
function exposed(){
  shakeIt();
  var sp=S.side.map(function(p){return p.name;}).join(", ");
  S.side=[];
  delta("notoriety",R(10,20)); delta("happiness",-R(10,18));
  if(!S.partner){
    showResult("📸 EXPOSED!","The tabloids splash photos of you with <b>"+sp+"</b> across every front page.",null);
    return;
  }
  if(S.partner.spouse){
    var half=Math.round(S.stats.money*0.5);
    moneyDelta(-half,"⚖️ Divorce settlement");
    var halfAB=Math.round((assetValue()+bizValue())/2);
    if(halfAB>0) moneyDelta(-halfAB,"⚖️ Asset split");
    S.divorces++; S.spouses=Math.max(0,S.spouses-1);
    S.alimony=5; S.alimonyAmt=Math.max(5000,Math.round(S.peakWorth*0.02));
    var nm=S.partner.name; S.partner=null;
    showResult("💔 EXPOSED!",nm+" found out about <b>"+sp+"</b> and divorced you on the spot.<br><br>Settlement: <b>"+fmtMoney(half)+"</b>"+(halfAB>0?" + <b>"+fmtMoney(halfAB)+"</b> in assets":"")+" + alimony for 5 years.",null);
    achieve("cheater","Certified Player");
  } else {
    var nm2=S.partner.name; S.partner=null;
    showResult("💔 EXPOSED!",nm2+" found out about <b>"+sp+"</b> and dumped you by text.",null);
  }
}
