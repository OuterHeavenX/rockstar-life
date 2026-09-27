var FTRAITS=["loyal","wild","funny","ambitious","chill"];
function fmtNum(n){
  n=Math.round(n||0);
  if(n>=1e9) return (n/1e9).toFixed(2)+"B";
  if(n>=1e6) return (n/1e6).toFixed(2)+"M";
  if(n>=1e3) return (n/1e3).toFixed(1)+"K";
  return String(n);
}
function crewGen(){
  return {name:(chance(0.5)?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST),
    lvl:1, loyalty:R(40,60), heat:0, pot:0};
}
function newFriend(){
  return {name:(chance(0.5)?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST),
    closeness:R(40,60), trait:pick(FTRAITS)};
}
function genFriends(){
  while(S.friends.length<3) S.friends.push(newFriend());
  confetti(50);
  toast("🧑‍🤝‍🧑 Your crew: "+S.friends.map(function(f){return f.name;}).join(", "),"🎉");
}
function crewW(){ return (S.crew&&S.crew[subCtx])||null; }
function frFriend(){ return (S.friends&&S.friends[subCtx])||null; }
function socialSummary(){
  var h='<div class="kv">📱 <b>'+fmtNum(S.followers)+'</b> followers';
  if(S.followers>=100000) h+='<br>💰 brand deals unlocked';
  else if(S.followers>0) h+='<br>'+fmtNum(100000-S.followers)+' to go for brand deals';
  return h+'</div>';
}
function friendsSummary(){
  var h='<div class="kv">🧑‍🤝‍🧑 Your crew: <b>'+S.friends.length+'</b>';
  if(S.friends.length)
    h+='<br>'+S.friends.map(function(f){return f.name.split(" ")[0]+" ("+Math.round(f.closeness)+"%)";}).join(" · ");
  return h+'</div>';
}
function workerSummary(i){
  var w=S.crew[i]; if(!w) return "";
  return '<div class="kv">💼 <b>'+w.name+'</b><br>level '+w.lvl+
    ' · loyalty '+Math.round(w.loyalty)+'% · heat '+Math.round(w.heat)+'%'+
    '<br>💰 banked cut: <b>'+fmtMoney(w.pot||0)+'</b></div>';
}
function friendSummary(i){
  var f=S.friends[i]; if(!f) return "";
  return '<div class="kv">🧑‍🤝‍🧑 <b>'+f.name+'</b><br><i>"'+f.trait+'"</i> · closeness '+
    Math.round(f.closeness)+'%</div>';
}
function crewYear(){
  if(!S.crew||!S.crew.length) return;
  var heat=0;
  S.crew.forEach(function(w){
    var earn=Math.round(w.lvl*(300+w.loyalty*8)*RF(0.8,1.2));
    w.pot=(w.pot||0)+earn;
    w.loyalty=clamp(Math.round(w.loyalty-R(1,4)),0,100);
    w.heat+=R(2,6);
    heat+=w.heat;
    if(w.loyalty>70&&w.lvl<10&&chance(0.15)){
      w.lvl++;
      toast("📈 "+w.name+" leveled up to "+w.lvl+"!","😎");
    }
  });
  if(chance(Math.min(0.5,0.02+heat*0.0015))) busted("Running a street operation");
}
function socialYear(){
  if(S.followers>0) S.followers=Math.max(0,Math.round(S.followers*0.97));
  if(S.followers>=1000000)
    moneyDelta(Math.round(S.followers*0.02),"📱 Sponsor payouts");
  var miles=[10000,100000,1000000,10000000];
  while(S.smMile<miles.length&&S.followers>=miles[S.smMile]){
    S.smMile++;
    delta("fame",5); confetti(80);
    showBanner("📱 "+fmtNum(miles[S.smMile-1])+" FOLLOWERS!","social media milestone");
    achieve("sm"+S.smMile,"Social Star "+S.smMile);
  }
}
function friendsYear(){
  if(S.age===13&&!S.friends.length) genFriends();
  for(var i=S.friends.length-1;i>=0;i--){
    var f=S.friends[i];
    f.closeness=clamp(Math.round(f.closeness-R(2,5)),0,100);
    if(f.closeness<=0){
      S.friends.splice(i,1);
      toast("💔 You and "+f.name+" drifted apart.","😔");
    }
  }
}
function newMember(role){
  return {name:(chance(0.5)?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST),
    role:role||pick(["Drums","Bass","Guitar"]),
    skill:R(40,80), ego:R(20,60), happy:R(50,80)};
}
function formBand(){
  var B={name:pick(BAND_ADJ)+" "+pick(BAND_NOUN), chem:60, members:[]};
  ["Drums","Bass","Guitar"].forEach(function(r){ B.members.push(newMember(r)); });
  S.band=B;
  confetti(100); showBanner("🤘 BAND FORMED!",B.name);
  achieve("band","Band Leader");
  toast("🤘 "+B.name+" is born!","🎸");
}
function breakupBand(){
  if(!S.band) return;
  var n=S.band.name; S.band=null;
  delta("fame",-5);
  showBanner("💔 BAND BREAKUP",n+" is no more");
  toast("💔 "+n+" broke up. Creative differences.","💔");
  achieve("breakup","Band Breakup");
}
function fireMember(i){
  var B=S.band; if(!B||!B.members[i]) return;
  if(!needCash(2000)) return;
  moneyDelta(-2000,"🔥 Auditions");
  var out=B.members[i];
  B.members[i]=newMember(out.role);
  B.chem=clamp(B.chem-10,0,100);
  toast("🔥 "+out.name+" is OUT. "+B.members[i].name+" is in.","🤘");
  if(B.chem<=0) breakupBand();
  renderAll(); saveGame(); checkDead();
  if(S&&S.alive&&!modalOpen()){ menuStack=[]; openMenu(S.band?"band":"career"); }
  else closeMenu();
}
function odDeath(){
  var B=S.band; if(!B) return "The band is already gone.";
  var i=B.members.indexOf(_bod); if(i>=0) B.members.splice(i,1);
  B.chem=clamp(B.chem-25,0,100);
  delta("fame",5); shakeIt();
  toast("📰 Tragedy press: the world mourns "+_bod.name+".","📰");
  if(B.members.length===0||B.chem<=0){
    breakupBand();
    return _bod.name+" did not make it. Without them, the band falls apart.";
  }
  return _bod.name+" did not make it. The show, somehow, goes on.";
}
function awardSpeech(){
  openModal('<h2>🏆 You Won!</h2><div class="mtext">You clutch the trophy. The mic is yours…</div>'+
    '<button class="btn cyan small" id="spGrace">🥂 Gracious speech</button>'+
    '<button class="btn red small" id="spRant">🍾 Drunken rant</button>');
  $("spGrace").onclick=function(){
    delta("happiness",5); delta("fame",3);
    showResult("🏆 Acceptance Speech","You thank your mom, your fans, and your band. The crowd swoons.",null);
  };
  $("spRant").onclick=function(){
    delta("notoriety",R(10,20)); delta("fame",R(3,8)); delta("happiness",8); shakeIt();
    showResult("🏆 Acceptance Speech","You rant for 11 minutes about the industry, your ex, and pigeons. The clip gets 80M views.",null);
  };
}
function continueAsKid(idx){
  var old=S, n=old.kids.length, ei=idx||0;
  var heir=old.kids[ei];
  var oldPeakWorth=old.peakWorth;
  var fn=(heir.name||"").split(" ")[0];
  var heirF=FIRST_F.indexOf(fn)>=0;
  newLife(heirF?"F":"M", heirF?"bi":"straight");
  S.name=heir.name;
  S.gender=heirF?"F":"M";
  S.age=heir.age;
  S.stats.money=Math.floor(old.stats.money/n);
  S.stats.looks=R(30,90);
  S.stats.talent=clamp(R(30,90)+(old.peakTier>=5?10:0),0,100);
  S.assets=old.assets.filter(function(a,i){ return i%n===ei; });
  S.biz=(old.biz||[]).filter(function(b,i){ return i%n===ei; });
  S.stats.fame=Math.round(old.peakFame*0.3);
  if(S.stats.fame>S.peakFame) S.peakFame=S.stats.fame;
  S.tier=tierForFame(S.stats.fame);
  if(S.tier>S.peakTier) S.peakTier=S.tier;
  S.peakWorth=Math.max(0,netWorth(),Math.floor(oldPeakWorth/n));
  if(typeof inheritExpansionLegacy==="function") inheritExpansionLegacy(old);
  toast("👶 Nepo baby! You inherit the name and a head start.","🌟");
  confetti(90);
  showScreen("game"); renderAll(); saveGame();
  if(S.gender==="F"){
    openModal('<h2>👶 New generation</h2><div class="mtext">'+S.name+' inherited the name. Who does she date?</div>'+
      '<button class="btn red small" onclick="setSexuality(\'lesbian\')">💜 Lesbian<span class="sub">women only</span></button>'+
      '<button class="btn gold small" onclick="setSexuality(\'straight\')">💙 Straight<span class="sub">men only</span></button>'+
      '<button class="btn cyan small" onclick="setSexuality(\'bi\')">💗 Bisexual</button>');
  }
}
function setSexuality(sx){
  if(!S) return;
  if(S.gender==="M") sx="straight";
  S.sexuality=sx;
  closeModal(); renderAll(); saveGame();
  toast((S.gender==="F"?"👩 ":"👨 ")+sx,"💘");
}
