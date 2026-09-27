function legacyScore(){
  var worth=S.peakWorth>0?Math.round(Math.log10(S.peakWorth+1)*220):0;
  var soc=S.followers>0?Math.round(Math.log10(S.followers+1)*150):0;
  return Math.max(0,Math.round(S.peakFame*12+worth+S.kids.length*400+S.spouses*200+
    S.ach.length*300+S.age*5+S.tier*150-S.prisonTotal*50+S.crew.length*150+soc));
}
function die(cause){
  if(!S||!S.alive) return;
  S.alive=false; S.cause=cause;
  var sc=legacyScore(), best=getBest(), isBest=sc>best&&sc>0;
  if(isBest) setBest(sc);
  clearSave(); closeMenu(); closeModal();
  var T=TIERS[S.peakTier];
  $("deathName").textContent=S.name+" · age "+S.age;
  $("deathCause").textContent=cause;
  var hl=[
    ["Peak tier",T.icon+" "+T.name],["Peak net worth",fmtMoney(S.peakWorth)],
    ["Marriages",S.spouses],["Kids",S.kids.length],
    ["Prison time",S.prisonTotal+"y"],["Peak fame",Math.round(S.peakFame)],
    ["Followers","📱 "+fmtNum(S.followers)],["Street crew","😎 "+S.crew.length]
  ];
  $("deathHL").innerHTML=hl.map(function(x){
    return '<div class="hl"><div class="k">'+x[0]+'</div><div class="v">'+x[1]+'</div>';
  }).join("");
  $("legacyScore").textContent=sc.toLocaleString("en-US");
  $("deathAch").textContent=S.ach.length?
    "🏆 "+S.ach.length+" achievement"+(S.ach.length>1?"s":"")+" unlocked — a life fully lived.":
    "No achievements. A quiet life, off the charts.";
  if(isBest) setTimeout(function(){ showBanner("👑 NEW BEST LEGACY!",sc.toLocaleString("en-US")+" points"); confetti(120); },400);
  var kb=$("btnKid");
  if(S.kids.length>0){
    var ei=0, ii;
    for(ii=1;ii<S.kids.length;ii++){ if(S.kids[ii].age>S.kids[ei].age) ei=ii; }
    kb.classList.remove("hidden");
    kb.textContent="👶 Continue as "+S.kids[ei].name;
    kb.onclick=(function(idx){ return function(){ continueAsKid(idx); }; })(ei);
  } else kb.classList.add("hidden");
  showScreen("death");
}
function hasLiveSave(){
  try{ var r=localStorage.getItem(SAVE_KEY); if(!r) return false;
    var s=JSON.parse(r); return !!(s&&s.alive); }catch(e){ return false; }
}
$("btnNew").onclick=function(){ setupLife(); };
$("btnRebirth").onclick=function(){ setupLife(); };
$("btnContinue").onclick=function(){
  if(loadGame()){ showScreen("game"); renderAll(); toast("Welcome back, rockstar.","🎸");
    if(S._bailed){ S._bailed=false; saveGame(); toast("👪 Your parents bailed you out of debt. Kids don't pay bills anymore.","💸"); } }
};
$("ageBtn").onclick=onAge;
var mb=document.querySelectorAll(".menu-btn");
for(var mi=0;mi<mb.length;mi++){
  (function(b){ b.onclick=function(){ openMenu(b.getAttribute("data-menu")); }; })(mb[mi]);
}
$("menuOverlay").addEventListener("click",function(e){ if(e.target===$("menuOverlay")) closeMenu(); });
(function initTitle(){
  $("btnContinue").classList.toggle("hidden",!hasLiveSave());
  var b=getBest();
  if(b>0){ $("bestLine").classList.remove("hidden");
    $("bestLine").textContent="👑 Best legacy: "+b.toLocaleString("en-US"); }
})();
window.__rockstarReady=true;
