"use strict";

var EXP_SETTINGS_KEY="rockstarLifeSettingsV1";
var EXP_SAVE_PREFIX="rockstarLifeSlot";
var GENRES=["Rock","Metal","Punk","Pop Rock","Alternative","Indie","Country Rock","Electronic Rock"];
var BACKGROUNDS=[
  {id:"garage",name:"Garage Kid",icon:"🏚️",desc:"+10 talent · starts broke"},
  {id:"nepo",name:"Industry Family",icon:"🥂",desc:"+$25K · +10 fame · expectations"},
  {id:"busker",name:"Street Busker",icon:"🪙",desc:"+8 talent · +8 grit"},
  {id:"viral",name:"Viral Teen",icon:"📱",desc:"+25K followers · +5 fame"}
];
var TOUR_CITIES=["Los Angeles","New York","Chicago","Austin","Nashville","London","Tokyo","Berlin","Sydney","Mexico City"];
var VENUES=[
  {name:"Dive Bar",cap:250,cost:1500,fame:1},
  {name:"Theater",cap:1800,cost:12000,fame:3},
  {name:"Arena",cap:15000,cost:90000,fame:7},
  {name:"Stadium",cap:65000,cost:400000,fame:12}
];
var PRODUCTIONS=[
  {name:"Backline Only",cost:0,mult:0.8,health:0},
  {name:"Full Lights",cost:25000,mult:1.15,health:2},
  {name:"Pyro Spectacle",cost:120000,mult:1.55,health:5}
];
var WORLD_NAMES=["Nova Hex","The Last Signals","Cherry Vandal","Saint Static","Glass Rebellion","Luna Graves","Chrome Youth","Dead Letters"];
var _lifeDraft=null;

function defaultExpansionSettings(){
  return {sound:true,music:false,largeText:false,highContrast:false,reduceMotion:false,safeMode:false,tutorial:true};
}
function loadExpansionSettings(){
  try{
    var raw=localStorage.getItem(EXP_SETTINGS_KEY);
    var base=defaultExpansionSettings(),saved=raw?JSON.parse(raw):{},key;
    for(key in saved){if(Object.prototype.hasOwnProperty.call(saved,key))base[key]=saved[key];}
    return base;
  }catch(e){ return defaultExpansionSettings(); }
}
function saveExpansionSettings(){
  if(!S) return;
  try{ localStorage.setItem(EXP_SETTINGS_KEY,JSON.stringify(S.settings)); }catch(e){}
  applyExpansionSettings();
}
function ensureExpansionState(){
  if(!S) return;
  if(!S.profile) S.profile={stageName:S.name,genre:"Rock",background:"garage"};
  if(!S.profile.hometown) S.profile.hometown=pick(CITIES);
  if(S.profile.skin===undefined) S.profile.skin=0;
  if(S.profile.hair===undefined) S.profile.hair=0;
  if(!S.releases) S.releases=[];
  if(!S.chartHistory) S.chartHistory=[];
  if(!S.label) S.label=null;
  if(!S.labelOffers) S.labelOffers=[];
  if(!S.tourHistory) S.tourHistory=[];
  if(!S.world) S.world={year:0,trend:pick(GENRES),artists:[]};
  if(!S.world.artists) S.world.artists=[];
  if(!S.collection) S.collection={awards:[],records:[],headlines:[],certifications:[]};
  if(!S.settings) S.settings=loadExpansionSettings();
  else {var merged=loadExpansionSettings(),key;for(key in S.settings){if(Object.prototype.hasOwnProperty.call(S.settings,key))merged[key]=S.settings[key];}S.settings=merged;}
  if(!S.daily) S.daily={date:"",id:"",done:false};
  if(!S.weekly) S.weekly={week:"",progress:0,done:false};
  if(S.relationshipYears===undefined) S.relationshipYears=0;
  if(S.careerStreams===undefined) S.careerStreams=0;
  if(S.careerSales===undefined) S.careerSales=0;
  if(S.creativeControl===undefined) S.creativeControl=100;
  applyExpansionSettings();
}

function beginExpandedLifeSetup(gender,sexuality,difficulty){
  _lifeDraft={gender:gender,sexuality:sexuality,difficulty:difficulty,genre:"Rock",background:"garage",stageName:""};
  showExpandedIdentity();
}
function showExpandedIdentity(){
  var genreButtons=GENRES.map(function(g,i){return '<button class="btn small '+(i===0?'gold':'ghost')+'" onclick="chooseExpandedGenre('+i+')">🎵 '+g+'</button>';}).join("");
  openModal('<h2>🎭 Build Your Artist</h2><div class="mtext">Choose the sound that will define your first era.</div>'+genreButtons);
}
function chooseExpandedGenre(i){ _lifeDraft.genre=GENRES[i]||"Rock"; showExpandedBackground(); }
function showExpandedBackground(){
  var h='<h2>📖 Origin Story</h2><div class="mtext">Every legend starts somewhere.</div>';
  BACKGROUNDS.forEach(function(b){h+='<button class="btn small" onclick="finishExpandedLife(\''+b.id+'\')">'+b.icon+' '+b.name+'<span class="sub">'+b.desc+'</span></button>';});
  openModal(h);
}
function finishExpandedLife(background){
  _lifeDraft.background=background;
  newLife(_lifeDraft.gender,_lifeDraft.sexuality,_lifeDraft.difficulty);
  ensureExpansionState();
  S.profile.genre=_lifeDraft.genre;
  S.profile.background=background;
  if(background==="garage") S.stats.talent=clamp(S.stats.talent+10,0,100);
  if(background==="nepo"){S.stats.money=25000;S.stats.fame=10;S.tier=tierForFame(10);}
  if(background==="busker"){S.stats.talent=clamp(S.stats.talent+8,0,100);S.stats.health=clamp(S.stats.health+8,0,100);}
  if(background==="viral"){S.followers=25000;S.stats.fame=5;}
  closeModal(); showScreen("game"); renderAll(); saveGame();
  if(S.settings.tutorial) showTutorial();
}
function showTutorial(){
  openModal('<h2>🎸 Welcome to Rockstar Life</h2><div class="mtext">Age forward to advance the story. Use <b>Career → Music Studio</b> to write and release songs, then negotiate labels and plan tours. Every choice changes your money, health, relationships, reputation, and legacy.</div><button class="btn gold" onclick="closeModal()">Start the story</button><button class="btn ghost small" onclick="disableTutorial()">Don\'t show again</button>');
}
function disableTutorial(){S.settings.tutorial=false;saveExpansionSettings();closeModal();}

function expansionMenuSummary(kind){
  if(!S) return "";
  ensureExpansionState();
  if(kind==="music"){
    var latest=S.releases[0];
    return '<div class="kv">🎭 <b>'+(S.profile.stageName||S.name)+'</b> · '+S.profile.genre+'<br>🎧 '+fmtNum(S.careerStreams)+' streams · 💿 '+fmtNum(S.careerSales)+' sales'+(latest?'<br>Latest: <b>'+latest.title+'</b> · peak #'+latest.peak:'')+'</div>';
  }
  if(kind==="industry") return '<div class="kv">🔥 Current trend: <b>'+S.world.trend+'</b><br>'+(S.label?('📝 '+S.label.name+' · '+S.label.royalty+'% royalty · '+S.creativeControl+'% control'):'🕊️ Independent artist')+'<br>🌎 '+S.world.artists.length+' active rival artists</div>';
  if(kind==="touring") return '<div class="kv">🚌 Tours completed: <b>'+S.tourHistory.length+'</b><br>Last gross: '+fmtMoney(S.tourHistory.length?S.tourHistory[0].gross:0)+'</div>';
  if(kind==="collection") return collectionSummary();
  if(kind==="settings") return '<div class="kv">Changes save automatically and apply immediately.</div>';
  if(kind==="saves") return '<div class="kv">Your normal autosave remains active. Slots are manual snapshots.</div>';
  return "";
}

function expansionBuildMenu(kind,it){
  ensureExpansionState();
  if(kind==="music"){
    it.push({icon:"✍️",label:"Write Song",sub:"name it · quality depends on talent and mood",act:"exp_write",cls:"cyan"});
    it.push({icon:"🎵",label:"Release Single",sub:fmtMoney(S.label?0:10000)+" · charts, streams & certification",act:"exp_single",min:14,cls:"gold"});
    it.push({icon:"💿",label:"Create Album",sub:fmtMoney(S.label?0:50000)+" · package your best songs",act:"exp_album",min:14,cls:"gold"});
    it.push({icon:"📊",label:"View Charts",sub:"current releases and rival artists",act:"exp_charts",cls:"ghost"});
    it.push({icon:"🎛️",label:"Change Genre",sub:"follow the trend or define your own era",act:"exp_genre",cls:"ghost"});
    it.push({icon:"🎭",label:"Set Stage Name",sub:S.profile.stageName||S.name,act:"exp_stage",cls:"ghost"});
    it.push({icon:"🧑‍🎤",label:"Artist Profile",sub:"appearance, hometown & identity",act:"exp_profile",cls:"ghost"});
  }
  if(kind==="industry"){
    it.push({icon:"📝",label:S.label?"Review Contract":"Seek Label Offers",sub:S.label?S.label.name:"compare advance, royalty & control",act:"exp_labels",min:14,cls:"gold"});
    it.push({icon:"⚔️",label:"Rivals & Collaborators",sub:"beef, collaborate or reconcile",act:"exp_rivals",min:14,cls:"red"});
    it.push({icon:"🌎",label:"Industry Pulse",sub:"genre trends and active artists",act:"exp_world",cls:"cyan"});
    it.push({icon:"🏆",label:"Awards Cabinet",sub:S.collection.awards.length+" trophies",act:"exp_awards",cls:"gold"});
  }
  if(kind==="touring"){
    it.push({icon:"🗺️",label:"Plan Tour",sub:"choose city, venue and production",act:"exp_tour",min:16,cls:"red"});
    it.push({icon:"📒",label:"Tour History",sub:S.tourHistory.length+" completed runs",act:"exp_tourhistory",cls:"ghost"});
  }
  if(kind==="collection"){
    it.push({icon:"💿",label:"Discography",sub:S.releases.length+" releases",act:"exp_discography",cls:"gold"});
    it.push({icon:"🏆",label:"Awards & Records",sub:S.collection.awards.length+" awards · "+S.collection.records.length+" records",act:"exp_awards",cls:"gold"});
    it.push({icon:"📰",label:"Career Headlines",sub:S.collection.headlines.length+" saved moments",act:"exp_headlines",cls:"cyan"});
    it.push({icon:"🎯",label:"Daily & Weekly Challenges",sub:dailyChallengeText()+" · weekly "+S.weekly.progress+"/3",act:"exp_daily",cls:"green"});
    it.push({icon:"🖼️",label:"Share Career Card",sub:"generate a shareable summary",act:"exp_share",cls:"cyan"});
  }
  if(kind==="saves"){
    [1,2,3].forEach(function(n){it.push({icon:"💾",label:"Save Slot "+n,sub:slotDescription(n),act:"exp_save"+n,cls:"green"});it.push({icon:"▶️",label:"Load Slot "+n,sub:slotDescription(n),act:"exp_load"+n,cls:"ghost"});});
    it.push({icon:"📤",label:"Export Save",sub:"download a backup file",act:"exp_export",cls:"cyan"});
    it.push({icon:"📥",label:"Import Save",sub:"restore a Rockstar Life backup",act:"exp_import",cls:"cyan"});
  }
  if(kind==="settings"){
    addSettingItem(it,"Sound Effects","sound","🔊");
    addSettingItem(it,"Ambient Music","music","🎶");
    addSettingItem(it,"Large Text","largeText","🔎");
    addSettingItem(it,"High Contrast","highContrast","◐");
    addSettingItem(it,"Reduce Motion","reduceMotion","🧘");
    addSettingItem(it,"Reduced Explicit Content","safeMode","🛡️");
    addSettingItem(it,"Tutorial","tutorial","❔");
  }
  if(kind==="partner"&&S.partner){
    it.push({icon:"🥂",label:"Celebrate Anniversary",sub:"relationship ++ · creates a memory",act:"exp_anniversary",cls:"gold"});
    it.push({icon:"🛋️",label:"Couples Therapy",sub:fmtMoney(1200)+" · repair trust and jealousy",act:"exp_couplestherapy",cls:"cyan"});
    if(S.partner.spouse) it.push({icon:"💍",label:"Renew Vows",sub:fmtMoney(12000)+" · major commitment",act:"exp_vows",cls:"gold"});
  }
  if(S.settings.safeMode){it.forEach(function(item){if(item.label)item.label=sanitizeExplicit(item.label);if(item.sub)item.sub=sanitizeExplicit(item.sub);});}
}
function addSettingItem(it,label,key,icon){it.push({icon:icon,label:label,sub:S.settings[key]?"ON":"OFF",act:"exp_setting_"+key,cls:S.settings[key]?"green":"ghost"});}

function expansionHandleAction(name){
  var menuMap={musicMenu:"music",industryMenu:"industry",touringMenu:"touring",collectionMenu:"collection",settingsMenu:"settings",savesMenu:"saves"};
  if(menuMap[name]){openSub(menuMap[name]);return true;}
  if(name.indexOf("exp_")!==0) return false;
  if(name.indexOf("exp_setting_")===0){toggleExpansionSetting(name.slice(12));return true;}
  if(name.indexOf("exp_save")===0){saveSlot(parseInt(name.slice(8),10));return true;}
  if(name.indexOf("exp_load")===0){loadSlot(parseInt(name.slice(8),10));return true;}
  var handlers={
    exp_write:showSongWriter,exp_single:function(){showReleaseBuilder("single");},exp_album:function(){showReleaseBuilder("album");},
    exp_charts:showCharts,exp_genre:showGenrePicker,exp_stage:showStageNameEditor,exp_profile:showArtistProfile,exp_labels:showLabelDesk,
    exp_rivals:showRivals,exp_world:showWorldPulse,exp_awards:showAwards,exp_tour:showTourPlanner,
    exp_tourhistory:showTourHistory,exp_discography:showDiscography,exp_headlines:showHeadlines,
    exp_daily:showDailyChallenge,exp_share:shareCareerCard,exp_export:exportSave,exp_import:showImportSave,
    exp_anniversary:celebrateAnniversary,exp_couplestherapy:couplesTherapy,exp_vows:renewVows
  };
  if(handlers[name]){handlers[name]();return true;}
  return false;
}

function showSongWriter(){
  if(S.age<12){toast("You must be at least 12 to write a full song.","🔒");return;}
  openModal('<h2>✍️ Write a Song</h2><div class="mtext">Capture this moment. Strong happiness and talent improve the demo.</div><input id="songTitle" class="text-input" maxlength="36" placeholder="Song title"><button class="btn gold" onclick="writeExpandedSong()">Save Demo</button><button class="btn ghost" onclick="closeModal()">Cancel</button>');
}
function writeExpandedSong(){
  var input=$("songTitle"),title=(input&&input.value||"").trim();
  if(!title) title=pick(["Midnight","Neon","Broken","Velvet","Electric"])+" "+pick(["Hearts","Ghost","Fever","Highway","Prayer"]);
  var quality=clamp(Math.round(S.stats.talent*.65+S.stats.happiness*.2+R(-10,18)+(S.world.trend===S.profile.genre?5:0)),1,100);
  S.songs.unshift({title:title,quality:quality,genre:S.profile.genre,age:S.age,released:false});
  delta("talent",2);recapAdd("Wrote “"+title+"” (quality "+quality+").");
  closeModal();toast("Demo saved: “"+title+"” · "+quality+" quality","✍️");saveGame();
}
function showReleaseBuilder(type){
  var cost=type==="album"?50000:10000;
  if(S.age<14){toast("You must be at least 14 to release music.","🔒");return;}
  if(!S.label&&S.stats.money<cost){toast("You need "+fmtMoney(cost)+".","💸");return;}
  var eligible=S.songs.filter(function(s){return !s.released;});
  var label=type==="album"?"Album title":"Single title";
  openModal('<h2>'+(type==="album"?'💿 Create Album':'🎵 Release Single')+'</h2><div class="mtext">'+eligible.length+' unreleased demo(s). '+(S.label?S.label.name+' covers recording.':'Independent cost: '+fmtMoney(cost))+'.</div><input id="releaseTitle" class="text-input" maxlength="40" placeholder="'+label+'"><button class="btn gold" onclick="releaseExpandedMusic(\''+type+'\')">Release It</button><button class="btn ghost" onclick="closeModal()">Cancel</button>');
}
function releaseExpandedMusic(type){
  var cost=type==="album"?50000:10000;
  if(!S.label) moneyDelta(-cost,"🎛️ Recording budget");
  var input=$("releaseTitle"),title=(input&&input.value||"").trim();
  if(!title) title=pick(["Midnight Static","Velvet Riot","No Saints Left","Electric Mercy","Beautiful Damage"]);
  var tracks=S.songs.filter(function(s){return !s.released;}).slice(0,type==="album"?10:1);
  var songQuality=tracks.length?tracks.reduce(function(n,s){return n+s.quality;},0)/tracks.length:S.stats.talent*.7;
  tracks.forEach(function(s){s.released=true;});
  var trend=S.world.trend===S.profile.genre?12:-3;
  var labelBoost=S.label?Math.round(S.label.marketing/6):0;
  var quality=clamp(Math.round(songQuality*.55+S.stats.talent*.25+S.stats.looks*.08+trend+labelBoost+R(-12,15)),1,100);
  var peak=quality>=94?1:quality>=86?R(2,5):quality>=75?R(6,20):quality>=60?R(21,60):R(61,100);
  var streams=Math.round(Math.pow(101-peak,2)*R(1800,8500)*(type==="album"?2.5:1));
  var sales=Math.round(streams/(type==="album"?900:1400));
  var gross=Math.round(streams*.004+sales*(type==="album"?10:1.1));
  var cut=S.label?S.label.royalty/100:1;
  var income=Math.round(gross*cut);
  var release={title:title,type:type,genre:S.profile.genre,quality:quality,peak:peak,streams:streams,sales:sales,age:S.age,weeks:1,cert:""};
  release.cert=certForRelease(release);
  S.releases.unshift(release);S.chartHistory.unshift({age:S.age,title:title,peak:peak});
  S.careerStreams+=streams;S.careerSales+=sales;
  if(type==="album"){S.albums++;if(S.albumsOwed>0)S.albumsOwed--;}else S.singles++;
  moneyDelta(income,"🎧 First-week royalties");delta("fame",Math.max(1,Math.round((101-peak)/7)));confetti(peak<=10?120:50);
  addHeadline("“"+title+"” debuted at #"+peak+(release.cert?" and went "+release.cert:"")+".");
  if(peak===1){achieve("numberone","Number One");addRecord("#1: "+title);}
  checkMusicAwards(release);completeDaily("release");progressWeekly();
  closeModal();showResult(peak<=10?"🔥 CHART HIT":"📊 RELEASED",'<b>'+title+'</b><br>Peak #'+peak+' · '+fmtNum(streams)+' streams · '+fmtNum(sales)+' sales'+(release.cert?'<br><span class="badge">'+release.cert+'</span>':""));saveGame();
}
function certForRelease(r){if(r.streams>=1000000000)return "Diamond";if(r.streams>=250000000)return "5× Platinum";if(r.streams>=50000000)return "Platinum";if(r.streams>=10000000)return "Gold";return "";}

function showCharts(){
  var rows=S.releases.slice(0,10).map(function(r){return '<div class="chart-row"><div class="chart-pos">#'+r.peak+'</div><div><b>'+r.title+'</b><div class="chart-meta">'+r.type+' · '+r.genre+' · '+fmtNum(r.streams)+' streams</div></div><div>'+(r.cert?'<span class="badge">'+r.cert+'</span>':'—')+'</div></div>';}).join("");
  var rivals=S.world.artists.slice(0,3).map(function(a,i){return '<div class="chart-row"><div class="chart-pos">#'+(i+1)+'</div><div><b>'+a.name+'</b><div class="chart-meta">'+a.genre+' · rival release</div></div><div>🔥</div></div>';}).join("");
  openModal('<h2>📊 Global Top 100</h2><div class="mtext">Your best peaks and this year\'s competition.</div>'+(rows||'<div class="kv">No releases yet.</div>')+rivals+'<button class="btn" onclick="closeModal()">Done</button>');
}
function showGenrePicker(){var h='<h2>🎛️ Choose Your Era</h2><div class="mtext">Current industry trend: <b>'+S.world.trend+'</b></div>';GENRES.forEach(function(g,i){h+='<button class="btn small '+(g===S.profile.genre?'gold':'ghost')+'" onclick="setExpandedGenre('+i+')">'+g+'</button>';});openModal(h);}
function setExpandedGenre(i){S.profile.genre=GENRES[i]||"Rock";closeModal();toast("New era: "+S.profile.genre,"🎛️");saveGame();}
function showStageNameEditor(){openModal('<h2>🎭 Stage Name</h2><input id="stageName" class="text-input" maxlength="28" value="'+escapeHtml(S.profile.stageName||S.name)+'"><button class="btn gold" onclick="saveStageName()">Take the Stage</button>');}
function saveStageName(){var v=($("stageName").value||"").trim();if(v)S.profile.stageName=v;closeModal();renderAll();saveGame();}
function showArtistProfile(){
  var homes=CITIES.map(function(c,i){return '<option value="'+i+'"'+(c===S.profile.hometown?' selected':'')+'>'+c+'</option>';}).join("");
  openModal('<h2>🧑‍🎤 Artist Profile</h2><div class="mtext">Shape the identity fans see between eras.</div><div class="kv">Skin style <b>#'+(S.profile.skin+1)+'</b><button class="btn small ghost" onclick="cycleSkin()">Change</button></div><div class="kv">Hair style <b>#'+(S.profile.hair+1)+'</b><button class="btn small ghost" onclick="cycleHair()">Change</button></div><label class="field-label">Hometown</label><select id="artistHometown" class="text-input">'+homes+'</select><button class="btn gold" onclick="saveArtistProfile()">Save Profile</button><button class="btn ghost" onclick="closeModal()">Cancel</button>');
}
function cycleSkin(){S.profile.skin=(S.profile.skin+1)%6;showArtistProfile();}
function cycleHair(){S.profile.hair=(S.profile.hair+1)%8;showArtistProfile();}
function saveArtistProfile(){var e=$("artistHometown");S.profile.hometown=CITIES[parseInt(e.value,10)]||S.profile.hometown;closeModal();toast("Artist profile updated.","🧑‍🎤");saveGame();}

function generateLabelOffers(){
  S.labelOffers=[
    {name:"Neon House",advance:50000,royalty:18,control:80,marketing:35,albums:2},
    {name:"Titan Records",advance:250000,royalty:12,control:45,marketing:75,albums:4},
    {name:"Velvet Crown",advance:800000,royalty:8,control:20,marketing:100,albums:6}
  ].filter(function(o,i){return S.stats.fame>=i*20;});
}
function showLabelDesk(){
  if(S.label){openModal('<h2>📝 '+S.label.name+'</h2><div class="mtext">Advance '+fmtMoney(S.label.advance)+' · '+S.label.royalty+'% royalty · '+S.creativeControl+'% creative control · '+S.albumsOwed+' albums owed.</div><button class="btn red" onclick="buyOutLabel()">Buy Out Contract<span class="sub">'+fmtMoney(S.label.advance*2)+'</span></button><button class="btn" onclick="closeModal()">Back</button>');return;}
  generateLabelOffers();var h='<h2>📝 Label Offers</h2><div class="mtext">Bigger advances usually mean less money and control later.</div>';
  S.labelOffers.forEach(function(o,i){h+='<button class="btn small gold" onclick="acceptLabel('+i+')">'+o.name+'<span class="sub">'+fmtMoney(o.advance)+' advance · '+o.royalty+'% royalty · '+o.control+'% control · '+o.albums+' albums</span></button>';});
  h+='<button class="btn ghost" onclick="closeModal()">Stay Independent</button>';openModal(h);
}
function acceptLabel(i){var o=S.labelOffers[i];if(!o)return;S.label=o;S.signed=true;S.advance=o.advance;S.albumsOwed=o.albums;S.creativeControl=o.control;moneyDelta(o.advance,"📝 Label advance");addHeadline("Signed with "+o.name+" for "+fmtMoney(o.advance)+".");closeModal();confetti(90);saveGame();}
function buyOutLabel(){if(!S.label)return;var price=S.label.advance*2;if(!needCash(price))return;moneyDelta(-price,"🕊️ Contract buyout");S.label=null;S.signed=false;S.albumsOwed=0;S.creativeControl=100;closeModal();toast("Independent again.","🕊️");saveGame();}

function ensureWorldArtists(){while(S.world.artists.length<4){var n=pick(WORLD_NAMES);if(!S.world.artists.some(function(a){return a.name===n;}))S.world.artists.push({name:n,genre:pick(GENRES),fame:R(25,90),heat:R(0,50),relation:R(20,70)});}}
function showRivals(){ensureWorldArtists();var h='<h2>⚔️ Rivals & Collaborators</h2>';S.world.artists.forEach(function(a,i){h+='<div class="kv"><b>'+a.name+'</b> · '+a.genre+' · fame '+a.fame+'<br><button class="btn small cyan" onclick="collabWorld('+i+')">🤝 Collaborate</button><button class="btn small red" onclick="beefWorld('+i+')">🥩 Start Beef</button></div>';});h+='<button class="btn" onclick="closeModal()">Done</button>';openModal(h);}
function collabWorld(i){var a=S.world.artists[i];if(!a)return;var success=R(0,100)<(S.stats.talent+a.fame)/2;if(success){delta("fame",R(5,12));moneyDelta(R(10000,100000),"🤝 Feature royalties");a.relation+=15;addHeadline("Surprise collaboration with "+a.name+" shook the charts.");}else{delta("happiness",-4);a.relation-=8;}closeModal();toast(success?"The collaboration is a hit!":"Creative differences killed the session.","🤝");saveGame();}
function beefWorld(i){var a=S.world.artists[i];if(!a)return;a.heat=clamp(a.heat+35,0,100);a.relation=clamp(a.relation-25,0,100);S.rival={name:a.name,heat:a.heat};delta("notoriety",8);S.followers+=R(5000,80000);addHeadline("Public feud with "+a.name+" dominated the feeds.");closeModal();toast("The feud is live.","🥩");saveGame();}
function showWorldPulse(){ensureWorldArtists();openModal('<h2>🌎 Industry Pulse</h2><div class="mtext"><b>'+S.world.trend+'</b> is dominating this year.</div>'+S.world.artists.map(function(a){return '<div class="kv">'+a.name+' · '+a.genre+' · fame '+a.fame+'</div>';}).join("")+'<button class="btn" onclick="closeModal()">Done</button>');}

function showTourPlanner(){
  var cityOptions=TOUR_CITIES.map(function(c,i){return '<option value="'+i+'">'+c+'</option>';}).join("");
  var venueOptions=VENUES.map(function(v,i){return '<option value="'+i+'">'+v.name+' · '+fmtNum(v.cap)+' cap · '+fmtMoney(v.cost)+'</option>';}).join("");
  var prodOptions=PRODUCTIONS.map(function(p,i){return '<option value="'+i+'">'+p.name+' · '+fmtMoney(p.cost)+'</option>';}).join("");
  openModal('<h2>🚌 Plan Tour</h2><div class="mtext">Book a five-show run. Fame drives demand; production drives ticket price.</div><label class="field-label">Anchor city</label><select id="tourCity" class="text-input">'+cityOptions+'</select><label class="field-label">Venue</label><select id="tourVenue" class="text-input">'+venueOptions+'</select><label class="field-label">Production</label><select id="tourProd" class="text-input">'+prodOptions+'</select><button class="btn red" onclick="runExpandedTour()">Hit the Road</button><button class="btn ghost" onclick="closeModal()">Cancel</button>');
}
function runExpandedTour(){
  var city=TOUR_CITIES[parseInt($("tourCity").value,10)],venue=VENUES[parseInt($("tourVenue").value,10)],prod=PRODUCTIONS[parseInt($("tourProd").value,10)];
  var cost=(venue.cost+prod.cost)*5;if(!needCash(cost))return;
  moneyDelta(-cost,"🚌 Tour production");var demand=clamp((S.stats.fame+S.stats.talent)/160,0.12,1);var attendance=Math.round(venue.cap*5*demand*RF(.75,1.15));var ticket=Math.round((25+S.stats.fame*1.8)*prod.mult);var gross=attendance*ticket;var profit=Math.round(gross*.72);
  moneyDelta(profit,"🎟️ Tour settlement");delta("fame",venue.fame+R(1,5));delta("health",-(R(5,12)+prod.health));delta("happiness",R(-5,8));S.tours++;S.tourHistory.unshift({age:S.age,city:city,venue:venue.name,production:prod.name,attendance:attendance,gross:gross,profit:profit});
  addHeadline(venue.name+" tour launched from "+city+" and grossed "+fmtMoney(gross)+".");completeDaily("tour");progressWeekly();closeModal();confetti(100);showResult("🚌 TOUR COMPLETE",fmtNum(attendance)+' fans · '+fmtMoney(gross)+' gross · '+fmtMoney(profit)+' profit');saveGame();
}
function showTourHistory(){openModal('<h2>📒 Tour History</h2>'+(S.tourHistory.map(function(t){return '<div class="kv"><b>Age '+t.age+' · '+t.venue+'</b><br>'+t.city+' · '+t.production+' · '+fmtNum(t.attendance)+' fans · '+fmtMoney(t.gross)+'</div>';}).join("")||'<div class="kv">No tours yet.</div>')+'<button class="btn" onclick="closeModal()">Done</button>');}

function expansionYear(){
  ensureExpansionState();
  S.world.year++;
  if(chance(.35)) S.world.trend=pick(GENRES);
  ensureWorldArtists();
  S.world.artists.forEach(function(a){a.fame=clamp(a.fame+R(-6,8),0,100);a.heat=clamp(a.heat-R(3,12),0,100);});
  if(chance(.18)){var newcomer={name:pick(WORLD_NAMES),genre:pick(GENRES),fame:R(15,55),heat:0,relation:50};S.world.artists.unshift(newcomer);S.world.artists=S.world.artists.slice(0,6);recapAdd(newcomer.name+" broke into the industry.");}
  S.releases.forEach(function(r){r.weeks++;var decay=Math.max(.5,1-r.weeks*.035);var newStreams=Math.round(r.streams*RF(.08,.25)*decay);r.streams+=newStreams;S.careerStreams+=newStreams;var income=Math.round(newStreams*.004*(S.label?S.label.royalty/100:1));if(income>0)moneyDelta(income,"🎧 Catalog streaming");var cert=certForRelease(r);if(cert&&cert!==r.cert){r.cert=cert;S.collection.certifications.push(r.title+" · "+cert);toast(r.title+" is now "+cert+"!","💿");}});
  if(S.partner) S.relationshipYears++;
  checkDailyChallenge();
  saveGame();
}

function checkMusicAwards(r){
  if(r.peak<=10&&chance(.45)){var award=pick(["Starlight Song of the Year","Global Rock Award","Critics Crown","Fan Choice Trophy"]);if(S.collection.awards.indexOf(award)<0){S.collection.awards.push(award);toast("Nominated: "+award,"🏆");}}
}
function addRecord(text){if(S.collection.records.indexOf(text)<0)S.collection.records.unshift(text);}
function addHeadline(text){S.collection.headlines.unshift({age:S.age,text:text});if(S.collection.headlines.length>30)S.collection.headlines.pop();recapAdd(text);}
function collectionSummary(){return '<div class="kv">🏆 '+S.collection.awards.length+' awards · 💿 '+S.collection.certifications.length+' certifications<br>🎧 '+fmtNum(S.careerStreams)+' career streams · 💵 '+fmtNum(S.careerSales)+' sales<br>📈 Best chart peak: #'+(S.releases.length?Math.min.apply(null,S.releases.map(function(r){return r.peak;})):"—")+'</div>';}
function showDiscography(){openModal('<h2>💿 Discography</h2>'+(S.releases.map(function(r){return '<div class="kv"><b>'+r.title+'</b> <span class="badge">'+r.type+'</span><br>'+r.genre+' · peak #'+r.peak+' · '+fmtNum(r.streams)+' streams '+(r.cert?'· '+r.cert:'')+'</div>';}).join("")||'<div class="kv">No releases yet.</div>')+'<button class="btn" onclick="closeModal()">Done</button>');}
function showAwards(){openModal('<h2>🏆 Awards & Records</h2><div class="kv"><b>Trophies</b><br>'+(S.collection.awards.join("<br>")||"None yet")+'</div><div class="kv"><b>Records</b><br>'+(S.collection.records.join("<br>")||"None yet")+'</div><div class="kv"><b>Certifications</b><br>'+(S.collection.certifications.join("<br>")||"None yet")+'</div><button class="btn" onclick="closeModal()">Done</button>');}
function showHeadlines(){openModal('<h2>📰 Career Headlines</h2>'+(S.collection.headlines.map(function(h){return '<div class="kv">Age '+h.age+' · '+h.text+'</div>';}).join("")||'<div class="kv">Your story is just beginning.</div>')+'<button class="btn" onclick="closeModal()">Done</button>');}

function dailyId(){return new Date().toISOString().slice(0,10);}
function dailyChallengeText(){checkDailyChallenge();var map={release:"Release new music",tour:"Complete a tour",social:"Gain 1,000 followers"};return (S.daily.done?"✅ ":"")+(map[S.daily.id]||"Build your legacy");}
function checkDailyChallenge(){var d=dailyId();if(S.daily.date!==d){S.daily={date:d,id:["release","tour","social"][new Date().getUTCDate()%3],done:false,startFollowers:S.followers};}if(S.daily.id==="social"&&S.followers-(S.daily.startFollowers||0)>=1000)completeDaily("social");}
function completeDaily(id){if(S.daily.date!==dailyId())checkDailyChallenge();if(S.daily.id===id&&!S.daily.done){S.daily.done=true;moneyDelta(5000,"🎯 Daily challenge");delta("happiness",5);toast("Daily challenge complete!","🎯");}}
function weekId(){var d=new Date(),first=new Date(Date.UTC(d.getUTCFullYear(),0,1)),day=Math.floor((d-first)/86400000);return d.getUTCFullYear()+"-W"+Math.ceil((day+first.getUTCDay()+1)/7);}
function checkWeeklyChallenge(){var w=weekId();if(S.weekly.week!==w)S.weekly={week:w,progress:0,done:false};}
function progressWeekly(){checkWeeklyChallenge();if(S.weekly.done)return;S.weekly.progress++;if(S.weekly.progress>=3){S.weekly.progress=3;S.weekly.done=true;moneyDelta(25000,"🏁 Weekly challenge");delta("fame",4);toast("Weekly challenge complete!","🏁");}}
function showDailyChallenge(){checkWeeklyChallenge();openModal('<h2>🎯 Challenges</h2><div class="kv"><b>Daily</b><br>'+dailyChallengeText()+'<br>Reward: $5,000 and happiness.</div><div class="kv"><b>Weekly</b><br>'+(S.weekly.done?'✅ ':'')+'Complete any 3 releases or tours · '+S.weekly.progress+'/3<br>Reward: $25,000 and fame.</div><button class="btn" onclick="closeModal()">Done</button>');}

function celebrateAnniversary(){if(!S.partner)return;S.partner.rel=clamp(S.partner.rel+15,0,100);bumpMeters(S.partner,{attach:12,jealous:-10});delta("happiness",8);galleryAdd("Anniversary with "+S.partner.name);addHeadline("Celebrated a private anniversary with "+S.partner.name+".");toast("A night worth remembering.","🥂");afterAct();}
function couplesTherapy(){if(!S.partner||!needCash(1200))return;moneyDelta(-1200,"🛋️ Couples therapy");S.partner.rel=clamp(S.partner.rel+12,0,100);bumpMeters(S.partner,{attach:8,jealous:-20,heat:-10});toast("Hard truths. Better footing.","🛋️");afterAct();}
function renewVows(){if(!S.partner||!S.partner.spouse||!needCash(12000))return;moneyDelta(-12000,"💍 Vow renewal");S.partner.rel=100;bumpMeters(S.partner,{attach:25,jealous:-25});delta("happiness",12);confetti(90);addHeadline("Renewed vows with "+S.partner.name+".");afterAct();}

function toggleExpansionSetting(key){if(S.settings[key]===undefined)return;S.settings[key]=!S.settings[key];saveExpansionSettings();if(key==="music")toggleAmbientMusic();openMenu("settings");}
function applyExpansionSettings(){if(!S||!S.settings)return;document.body.classList.toggle("large-text",!!S.settings.largeText);document.body.classList.toggle("high-contrast",!!S.settings.highContrast);document.body.classList.toggle("reduce-motion",!!S.settings.reduceMotion);}
var _audioContext=null,_ambientOsc=null;
function playUiSound(){if(!S||!S.settings||!S.settings.sound)return;try{_audioContext=_audioContext||new (window.AudioContext||window.webkitAudioContext)();var o=_audioContext.createOscillator(),g=_audioContext.createGain();o.frequency.value=220;o.type="triangle";g.gain.setValueAtTime(.025,_audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,_audioContext.currentTime+.08);o.connect(g);g.connect(_audioContext.destination);o.start();o.stop(_audioContext.currentTime+.08);}catch(e){}}
function toggleAmbientMusic(){try{if(S.settings.music&&!_ambientOsc){_audioContext=_audioContext||new (window.AudioContext||window.webkitAudioContext)();_ambientOsc=_audioContext.createOscillator();var g=_audioContext.createGain();_ambientOsc.frequency.value=82;_ambientOsc.type="sine";g.gain.value=.012;_ambientOsc.connect(g);g.connect(_audioContext.destination);_ambientOsc.start();}else if(!S.settings.music&&_ambientOsc){_ambientOsc.stop();_ambientOsc=null;}}catch(e){}}
document.addEventListener("click",function(){playUiSound();},{passive:true});

function slotDescription(n){try{var r=localStorage.getItem(EXP_SAVE_PREFIX+n);if(!r)return "empty";var x=JSON.parse(r);return x.name+" · age "+x.age+" · "+TIERS[x.tier].name;}catch(e){return "unavailable";}}
function saveSlot(n){ensureExpansionState();try{localStorage.setItem(EXP_SAVE_PREFIX+n,JSON.stringify(S));toast("Career saved to slot "+n+".","💾");openMenu("saves");}catch(e){toast("Could not save this slot.","⚠️");}}
function loadSlot(n){try{var r=localStorage.getItem(EXP_SAVE_PREFIX+n);if(!r){toast("That slot is empty.","💾");return;}S=JSON.parse(r);ensureExpansionState();saveGame();closeModal();closeMenu();showScreen("game");renderAll();toast("Slot "+n+" loaded.","▶️");}catch(e){toast("That save is damaged.","⚠️");}}
function exportSave(){try{var data=JSON.stringify({game:"Rockstar Life",version:4,savedAt:new Date().toISOString(),state:S},null,2);var blob=new Blob([data],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rockstar-life-"+(S.profile.stageName||S.name).replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".json";a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);toast("Save exported.","📤");}catch(e){toast("Export failed.","⚠️");}}
function showImportSave(){openModal('<h2>📥 Import Save</h2><div class="mtext">Choose a Rockstar Life JSON backup. Your current autosave will be replaced.</div><input id="saveImport" class="text-input" type="file" accept="application/json"><button class="btn cyan" onclick="importSave()">Import</button><button class="btn ghost" onclick="closeModal()">Cancel</button>');}
function importSave(){var f=$("saveImport").files[0];if(!f){toast("Choose a backup first.","📥");return;}var reader=new FileReader();reader.onload=function(){try{var d=JSON.parse(reader.result);var state=d.state||d;if(!state||!state.stats||!state.name)throw new Error();S=state;ensureExpansionState();saveGame();closeModal();closeMenu();showScreen("game");renderAll();toast("Career restored.","📥");}catch(e){toast("That is not a valid save.","⚠️");}};reader.readAsText(f);}

function shareCareerCard(){
  var c=document.createElement("canvas");c.width=1080;c.height=1080;var x=c.getContext("2d"),g=x.createLinearGradient(0,0,1080,1080);g.addColorStop(0,"#10051c");g.addColorStop(1,"#050308");x.fillStyle=g;x.fillRect(0,0,1080,1080);x.fillStyle="#f5c86e";x.font="900 72px sans-serif";x.fillText("ROCKSTAR LIFE",70,120);x.fillStyle="#fff";x.font="900 64px sans-serif";x.fillText(S.profile.stageName||S.name,70,245);x.fillStyle="#c9b8d9";x.font="32px sans-serif";x.fillText(S.profile.genre+" · "+TIERS[S.peakTier].name+" · age "+S.age,70,305);var lines=["Peak fame  "+Math.round(S.peakFame),"Career streams  "+fmtNum(S.careerStreams),"Awards  "+S.collection.awards.length,"Albums  "+S.albums,"Tours  "+S.tours,"Net worth  "+fmtMoney(netWorth())];x.font="700 40px sans-serif";lines.forEach(function(line,i){x.fillStyle=i%2?"#fff":"#f5c86e";x.fillText(line,90,430+i*85);});x.fillStyle="#8d7ba3";x.font="28px sans-serif";x.fillText("every life is a song",70,1010);c.toBlob(function(blob){if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],"rockstar-life.png",{type:"image/png"})]})){navigator.share({title:"My Rockstar Life",files:[new File([blob],"rockstar-life.png",{type:"image/png"})]}).catch(function(){});}else{var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rockstar-life-card.png";a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);}},"image/png");toast("Career card created.","🖼️");}

function finalizeExpandedLegacy(){ensureExpansionState();var legend={name:S.profile.stageName||S.name,genre:S.profile.genre,streams:S.careerStreams,awards:S.collection.awards.length,releases:S.releases.length,tours:S.tours};try{localStorage.setItem("rockstarLifeLastLegend",JSON.stringify(legend));}catch(e){}}
function expandedLegacyLine(){ensureExpansionState();return " · "+fmtNum(S.careerStreams)+" streams · "+S.collection.awards.length+" awards · "+S.releases.length+" releases";}
function inheritExpansionLegacy(old){
  if(!old||!old.profile)return;ensureExpansionState();S.profile.genre=old.profile.genre;S.profile.hometown=old.profile.hometown;S.profile.stageName=(old.profile.stageName||old.name)+" II";S.careerStreams=Math.round((old.careerStreams||0)*.1);S.collection.records=["Inherited the "+(old.profile.stageName||old.name)+" legacy"];S.world=old.world||S.world;addHeadline("A new generation inherited the family catalog and name.");
}

function escapeHtml(v){return String(v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function sanitizeExplicit(html){return String(html).replace(/sex tape/gi,"private video").replace(/hookup/gi,"encounter").replace(/nudes/gi,"exclusive posts").replace(/cock|dick/gi,"body").replace(/fuck(?:ing|ed)?/gi,"hook up").replace(/slut/gi,"wild one");}
var _baseOpenModal=openModal;
openModal=function(html){ensureExpansionState();_baseOpenModal(S&&S.settings&&S.settings.safeMode?sanitizeExplicit(html):html);};
var _baseShowResult=showResult;
showResult=function(title,html,cb){ensureExpansionState();_baseShowResult(title,S&&S.settings&&S.settings.safeMode?sanitizeExplicit(html):html,cb);};

ensureWorldBoot();
function ensureWorldBoot(){
  try{if(S){ensureExpansionState();checkDailyChallenge();}}catch(e){}
}
