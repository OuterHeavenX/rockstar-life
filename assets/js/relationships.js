function hitRoll(base){
  var b=base;
  if(S.band) b-=(S.band.chem-50)/5;
  if(S.songs&&S.songs.length) b-=Math.min(12,S.songs.length*2);
  if(S.cancelled) b+=8;
  if(S.traits&&S.traits.indexOf("iron lungs")>=0) b-=4;
  if(S.traits&&S.traits.indexOf("cursed voice")>=0) b+=6;
  return (S.stats.talent*0.6+S.stats.looks*0.2+S.stats.fame*0.2+R(0,20))>=b;
}
var CANDS=[];
function dating(){
  CANDS=[genPerson(),genPerson(),genPerson()];
  var h='<h2>📱 HeartStrings</h2><div class="mtext">Three matches nearby… '+
    (S.gender==="M"||S.sexuality==="lesbian"?"women only.":S.sexuality==="straight"?"men only.":"women or men. Never two men.")+'</div>';
  CANDS.forEach(function(c,i){
    h+='<button class="btn small" onclick="pickMate('+i+')">💘 '+(c.gender==="F"?"👩 ":"👨 ")+c.name+
       '<span class="sub">looks '+Math.round(c.looks)+' · '+(c.fame>30?"semi-famous":"unknown")+' · '+c.persona+' · '+c.kink+'</span></button>';
  });
  h+='<button class="btn ghost small" onclick="closeModal()">Nah, stay single</button>';
  openModal(h);
}
function pickMate(i){
  var c=CANDS[i];
  if(S.gender==="M"&&c.gender==="M"){ toast("Not your scene.","🚫"); return; }
  S.partner=c; closeModal();
  confetti(40); toast("💘 You are dating "+c.name+"!","💘");
  renderAll(); saveGame();
}
function hookActsFor(p){
  var pk=pairKey(p);
  if(pk==="mf") return [
    {id:"bj",icon:"👄",label:"Blowjob",sub:"her mouth on your cock",oral:1},
    {id:"throat",icon:"💦",label:"Facefuck",sub:"use her throat",oral:1},
    {id:"tits",icon:"🍈",label:"Titfuck",sub:"between her tits",oral:1},
    {id:"eat",icon:"👅",label:"Eat Her Out",sub:"until she soaks your face",oral:1},
    {id:"dog",icon:"🐕",label:"From Behind",sub:"bent over whatever's closest",oral:0},
    {id:"anal",icon:"🍑",label:"Anal",sub:"tight, sloppy, filthy",oral:0},
    {id:"public",icon:"🚻",label:"Bathroom Stall",sub:"someone could walk in",oral:0},
    {id:"finish",icon:"🥛",label:"Finish on Her Face",sub:"after she sucks you sloppy",oral:1}
  ];
  if(pk==="fm") return [
    {id:"bj",icon:"👄",label:"Blow Him",sub:"your mouth on his cock",oral:1},
    {id:"throat",icon:"💦",label:"Take It Deep",sub:"he fucks your throat",oral:1},
    {id:"eat",icon:"👅",label:"Get Eaten Out",sub:"his mouth between your legs",oral:1},
    {id:"dog",icon:"🐄",label:"Ride Him",sub:"you on top, dripping",oral:0},
    {id:"anal",icon:"🍑",label:"Anal",sub:"he takes your ass",oral:0},
    {id:"public",icon:"🚻",label:"Club Bathroom",sub:"stall hookup",oral:0},
    {id:"finish",icon:"🥛",label:"Finish in Your Mouth",sub:"swallow or wear it",oral:1}
  ];
  return [
    {id:"bj",icon:"👄",label:"Sit on Her Face",sub:"ride her tongue",oral:1},
    {id:"eat",icon:"👅",label:"Eat Her Out",sub:"until her thighs shake",oral:1},
    {id:"tits",icon:"✋",label:"Fingerbang",sub:"crooked, soaked, relentless",oral:1},
    {id:"dog",icon:"🍆",label:"Strap-On",sub:"you fuck her",oral:0},
    {id:"anal",icon:"🍑",label:"Strap Her Ass",sub:"if she can take it",oral:0},
    {id:"public",icon:"🚻",label:"Bathroom Stall",sub:"hands and mouth",oral:1},
    {id:"finish",icon:"💦",label:"Make Her Squirt",sub:"wreck her",oral:1}
  ];
}
function sexActScene(p,act){
  var name=p.name.split(" ")[0];
  var pk=pairKey(p);
  var L={};
  if(pk==="mf"){
    L.bj=[name+" drops to her knees in whatever she's wearing and pulls you out. She licks the head, then takes you to the back of her throat and stays there, drooling down her chin, looking up while you hold her hair.","She sucks you sloppy — spit strings, gagging when you push, hand working what she can't fit. She pulls off to breathe, spit hanging off her lip, then goes right back down."];
    L.throat=["You fuck her mouth. "+name+"'s hands are on your thighs. You hold her head and use her throat until she gags, eyes wet, spit all over her tits. She doesn't tell you to stop.","She opens up and lets you use her. Every thrust hits her throat. Makeup runs. When you pull out she's a mess and she leans back in for the rest."];
    L.tits=[name+" squeezes her tits around your cock and jerks you with them, spit for lube, licking the head every time it pops through. You come on her chest. She smears it.","She puts you between her tits and talks filthy while she works you. Wet sounds. You finish across her collarbone."];
    L.eat=["You put "+name+" on her back, throw a leg over your shoulder, and eat her until she's grinding on your mouth. Two fingers in her, tongue on her clit. She comes on your face.","You bury your face between her thighs and don't come up. She's soaked. She grabs your hair and rides your tongue through it."];
    L.dog=[name+" bends over the nearest surface. You push into her wet and fuck her from behind, one hand on her hip, one in her hair. She comes clenching. You keep going.","Jeans at her knees. You slide in and pound her. The slap of skin. She reaches back to spread herself and tells you not to stop."];
    L.anal=["You work her ass open with spit and a thumb, then push in slow. "+name+" swears, then pushes back. You fuck her ass until she's shaking and you finish in her.","She face-down, ass up. You spit and take her ass. Tight. Filthy. She comes from a hand on her clit while you're buried in her."];
    L.public=["Club bathroom. You lock it late. "+name+"'s on her knees on the tile sucking you when someone knocks. You come in her mouth anyway. She swallows and fixes her lipstick.","Green room toilet. You bend her over the sink and fuck her in the mirror. Footsteps outside. She bites her lip and takes it quieter."];
    L.finish=[name+" sucks you sloppy until you pull out and come on her face — cheeks, lips, a stripe on her tongue. She laughs, licks what she can reach, and doesn't wipe it off right away.","You finish across her tongue and her tits. She looks wrecked on purpose. Photo-worthy. You do not take one. Probably."];
  } else if(pk==="fm"){
    L.bj=["You drop to your knees and take "+name+" in your mouth. You work him sloppy, spit down your chin, looking up while he holds your hair. He throbs on your tongue.","You suck him until your jaw aches. He hits the back of your throat. You don't pull off until he makes that sound."];
    L.throat=[name+" fucks your throat. Your eyes water. Spit everywhere. He uses your mouth like that's what you showed up for. It is.","He holds your head and thrusts. You gag and stay on it. When he lets you breathe you go back down."];
    L.eat=[name+" puts your thighs over his shoulders and eats you like he's starving. Fingers crooked inside you, tongue flat on your clit, until you come on his face.","He doesn't stop when you twitch. He pins your hips and licks you through it until you're swearing."];
    L.dog=["You push him down and sink onto his cock, dripping. You ride him until you come. He grabs your ass and finishes in you — or tries to.","He bends you over and slams into you from behind. You watch it in whatever glass is there. You come first."];
    L.anal=["Spit, a finger, then he takes your ass. It burns, then it doesn't. "+name+" fucks you slow and filthy while you rub your clit and come with him in you.","You tell him he can. He does. Face-down, loud, sloppy. You feel it for the rest of the night."];
    L.public=["Stall door that doesn't lock right. You suck him first, then he lifts you and fucks you standing, hand over your mouth when people come in.","Afterparty bathroom. Skirt up. He finishes and you walk back out wet."];
    L.finish=["He comes in your mouth. You swallow most of it and let the rest sit on your tongue so he can see.","He pulls out of your mouth and finishes on your lips and chest. You don't wipe it until you're in the hallway."];
  } else {
    L.bj=["You sit on "+name+"'s face and grind on her tongue until you're dripping down her chin. She grabs your ass and doesn't let you up until you come.","She pulls you onto her mouth. You ride it. Her nose against you. You come shaking and stay there anyway."];
    L.eat=["You pin "+name+"'s thighs open and eat her out sloppy — two fingers, tongue, sucking her clit until she soaks your chin and tries to close her legs. You don't let her.","She tastes like sex. You don't stop. She comes once, then again with your fingers hooked and your mouth on her."];
    L.tits=["You finger her until she's a mess, palm on her clit, two fingers pumping. "+name+" comes on your hand and you make her lick it off.","Three fingers. She's loud. You don't ease up. She squirts on your wrist and laughs like she didn't mean to."];
    L.dog=["You strap up and fuck "+name+" on her back, then from behind. The toy is slick with her. She comes on it and tells you harder.","She gets on all fours. You hold her hips and fuck her until the headboard slams and her arms give out."];
    L.anal=["Lube, then the strap in her ass, slow. "+name+" swears and reaches back for you. You fuck her ass while you rub her clit until she comes wrecked.","She asked for it. You give it to her. Tight, filthy, her face in the pillow."];
    L.public=["Bathroom stall. Your hand is in her jeans, hers is in yours. You finger each other standing up and kiss to stay quiet. She comes first. You follow.","You drop to your knees on club tile and eat her out with her back against the door. Someone knocks. She comes anyway."];
    L.finish=["You work "+name+" until she squirts on your fingers and your mouth. She's shaking. You kiss her with it still on your lips.","She comes so hard she curses your name. You don't stop until she pushes you off, laughing, wrecked."];
  }
  var arr=L[act]||L.bj||L.eat;
  return pick(arr)+" <i>("+(p.kink||"filthy")+")</i>";
}
function hookupApp(){
  CANDS=[genPerson(),genPerson(),genPerson()];
  var h='<h2>🔥 After Dark</h2><div class="mtext">No bios. No brunch. Pick a body, then pick the act. '+
    (S.gender==="M"||S.sexuality==="lesbian"?"Women only.":S.sexuality==="straight"?"Men only.":"Women or men — never two men.")+'</div>';
  CANDS.forEach(function(c,i){
    h+='<button class="btn small red" onclick="pickHookup('+i+')">🔥 '+(c.gender==="F"?"👩 ":"👨 ")+c.name+
       '<span class="sub">looks '+Math.round(c.looks)+' · '+c.persona+' · '+c.kink+'</span></button>';
  });
  h+='<button class="btn ghost small" onclick="closeModal()">Not in the mood</button>';
  openModal(h);
}
function pickHookup(i){
  var c=CANDS[i];
  if(S.gender==="M"&&c.gender==="M"){ toast("Not your scene.","🚫"); return; }
  if(!pairingOk(c.gender)){ toast("Not your scene.","🚫"); return; }
  if(isRestrained(c)){ toast("There's a restraining order.","🚫"); return; }
  showHookLocs(c);
}
function showHookLocs(p){
  CANDS._hook=p;
  var h='<h2>📍 Where?</h2><div class="mtext">'+p.name.split(" ")[0]+" is down. Pick a spot.</div>";
  HOOK_LOCS.forEach(function(l,i){
    h+='<button class="btn small" onclick="pickHookLoc('+i+')">'+l.icon+" "+l.label+'</button>';
  });
  h+='<button class="btn ghost small" onclick="closeModal()">Never mind</button>';
  openModal(h);
}
function pickHookLoc(i){
  var l=HOOK_LOCS[i]; if(!l) return;
  CANDS._loc=l;
  showHookActs(CANDS._hook);
}
function callRegular(){
  if(!S.regulars||!S.regulars.length){ toast("No regulars yet.","🔁"); return; }
  var h='<h2>🔁 Regulars</h2><div class="mtext">They already know how you like it.</div>';
  S.regulars.forEach(function(r,i){
    h+='<button class="btn small red" onclick="pickRegular('+i+')">🔥 '+(r.gender==="F"?"👩 ":"👨 ")+r.name+
       '<span class="sub">'+(r.kink||"")+'</span></button>';
  });
  h+='<button class="btn ghost small" onclick="closeModal()">Not tonight</button>';
  openModal(h);
}
function pickRegular(i){
  var r=S.regulars[i]; if(!r) return;
  if(isRestrained(r)){ toast("Paper says no.","🚫"); return; }
  showHookLocs(ensureMeters(r));
}
function startThreesome(){
  var p=S.partner; if(!p) return;
  var third=S.regulars.filter(function(r){return pairingOk(r.gender)&&r.name!==p.name;})[0]||genPerson();
  if(S.gender==="M"&&(p.gender!=="F"||third.gender!=="F")){ toast("Only two women. No men together.","🚫"); return; }
  if(S.gender==="F"&&p.gender==="M"&&third.gender==="M"){ toast("No two men.","🚫"); return; }
  if(S.gender==="F"&&S.sexuality==="lesbian"&&(p.gender!=="F"||third.gender!=="F")){ toast("Women only.","🚫"); return; }
  delta("happiness",R(12,20));
  bumpMeters(p,{sexual:10,heat:-20,jealous:R(5,15),rel:R(-4,8)});
  rememberRegular(third);
  galleryAdd("Threesome with "+p.name.split(" ")[0]+" + "+third.name.split(" ")[0]);
  recapAdd("A third stayed the night.");
  achieve("trio","Third Wheel");
  if(p.jealous>70&&chance(0.35)){ toast("After, "+p.name+" is not okay.","💚"); p.rel=clamp(p.rel-15,0,100); }
  showResult("🍑 Threesome",
    S.gender==="M"||(p.gender==="F"&&third.gender==="F")
      ?("You, "+p.name.split(" ")[0]+", and "+third.name.split(" ")[0]+". Mouths, hands, a strap or you. Nobody sleeps. The sheets are a crime scene.")
      :("You and "+p.name.split(" ")[0]+" pull "+third.name.split(" ")[0]+" in. It's loud and sloppy and somebody knocks a lamp over."));
}
function fileRO(){
  var pool=(S.regulars||[]).concat(S.sugar?[S.sugar]:[]);
  if(!pool.length){ toast("No one to ban yet.","🚫"); return; }
  var h='<h2>🚫 Paper</h2><div class="mtext">Who do you never want in the building again?</div>';
  pool.forEach(function(p,i){
    h+='<button class="btn small red" onclick="doRO('+i+')">🚫 '+p.name+'</button>';
  });
  h+='<button class="btn ghost small" onclick="closeModal()">Cancel</button>';
  CANDS._ro=pool;
  openModal(h);
}
function doRO(i){
  var p=CANDS._ro&&CANDS._ro[i]; if(!p) return;
  if(S.restraining.indexOf(p.name)<0) S.restraining.push(p.name);
  S.regulars=(S.regulars||[]).filter(function(r){return r.name!==p.name;});
  if(S.sugar&&S.sugar.name===p.name) S.sugar=null;
  closeModal(); toast("🚫 "+p.name+" is legally not your problem.","⚖️");
  recapAdd("RO filed on "+p.name+".");
}
function fireEnt(i){
  var e=S.entourage[i]; if(!e) return;
  S.entourage.splice(i,1);
  if(e.loyal<40||chance(0.35)){
    delta("notoriety",R(6,12)); S.cancelled=S.cancelled||chance(0.15);
    toast("📰 "+e.name+" sold a story on the way out.","📣");
    recapAdd(e.role+" leaked after getting fired.");
  } else toast("✂️ "+e.name+" is out. Clean.","👔");
}
function showHookActs(p){
  CANDS._hook=p;
  var acts=hookActsFor(p);
  var loc=CANDS._loc;
  var h='<h2>🔥 '+p.name.split(" ")[0]+'</h2><div class="mtext">'+(loc?(loc.icon+" "+loc.label+" · "):"")+"What do you want tonight?</div>";
  acts.forEach(function(a,i){
    h+='<button class="btn small red" onclick="pickHookAct('+i+')">'+a.icon+" "+a.label+
       '<span class="sub">'+a.sub+(a.oral?" · mouth / hands":" · penetration")+'</span></button>';
  });
  h+='<button class="btn ghost small" onclick="hookupApp()">‹ Different body</button>';
  openModal(h);
}
function pickHookAct(i){
  var p=CANDS._hook; if(!p) return;
  var a=hookActsFor(p)[i]; if(!a) return;
  S.hookups=(S.hookups||0)+1;
  if(S.hookups>=10) achieve("player","After Dark Regular");
  if(S.stats.fame>=25&&chance(0.18)) delta("notoriety",R(4,10));
  var loc=CANDS._loc;
  askSex(p,"hookup",{rel:0,hap:R(10,18),oral:!!a.oral,act:a.id,actLabel:a.icon+" "+a.label,
    loc:loc?(loc.icon+" "+loc.label):""});
}
