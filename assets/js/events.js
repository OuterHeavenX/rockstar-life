var _rv={name:""};
var _bod=null;
var _poach=null,_arr=null,_fd=null,_fb=null;
var EVENTS=[
{id:"heckler",wt:10,icon:"🖕",title:"Heckler!",cond:function(){return S.stats.fame>=15;},
 text:function(){return "Mid-song, a drunk in the front row screams that you sold out. The crowd goes quiet…";},
 choices:[
  {t:"🎸 Smash your guitar on him",sub:"rockstar rage",go:function(){delta("notoriety",R(8,15));delta("happiness",8);if(chance(0.3)){busted("Assault with a guitar");return null;}return "Security drags him out. The clip gets 10M views overnight.";}},
  {t:"🎤 Roast him on the mic",sub:"wit over fists",go:function(){delta("fame",R(4,9));delta("happiness",5);return "The crowd HOWLS. He slinks out. Legendary moment.";}},
  {t:"🙄 Ignore him",sub:"stay classy",go:function(){delta("happiness",-5);return "You finish the set. He tells everyone you are washed.";}}]},
{id:"label",wt:8,icon:"💿",title:"Record Deal!",cond:function(){return S.age>=16&&S.stats.fame>=30&&!S.signed;},
 text:function(){return "A major label exec slides a contract across the table: a <b>"+fmtMoney(250000)+"</b> advance for 2 albums. Your indie friends call it selling out.";},
 choices:[
  {t:"✍️ SIGN IT",sub:"take the money",go:function(){S.signed=true;S.advance=250000;S.albumsOwed=2;moneyDelta(250000,"💿 Record advance");confetti(120);showBanner("💿 SIGNED!","record deal");achieve("signed","Signed Artist");return "Advance wired. Studio time booked. The machine is behind you now — deliver those 2 albums.";}},
  {t:"🚫 Stay independent",sub:"keep your soul",go:function(){delta("happiness",8);delta("fame",3);return "You walk away. The underground respects you more than ever.";}}]},
{id:"groupie",wt:9,icon:"💋",title:"Backstage Temptation",cond:function(){return S.age>=18&&S.stats.fame>=25;},
 text:function(){return "After the show, a gorgeous stranger slips backstage and makes their intentions very clear…";},
 choices:[
  {t:"😏 Indulge",go:function(){delta("happiness",R(10,16));if(S.partner&&chance(0.35)){exposed();return null;}return "What happens backstage stays backstage. Probably.";}},
  {t:"🙏 Decline politely",go:function(){delta("happiness",-4);return "You sign an autograph instead. Classy.";}}]},
{id:"tabloid",wt:8,icon:"📰",title:"Tabloid Lies",cond:function(){return S.stats.fame>=45;},
 text:function(){return "A tabloid claims you threw a TV out of a hotel window and fought a swan. None of it is true. All of it is hilarious.";},
 choices:[
  {t:"⚖️ Sue them",sub:fmtMoney(30000)+" legal",go:function(){if(S.stats.money<30000){return "You cannot afford the lawyer. The story runs anyway.";}moneyDelta(-30000,"⚖️ Legal fees");delta("fame",R(5,10));moneyDelta(R(40000,120000),"📰 Settlement");return "You win big. The apology is printed in 4-point font.";}},
  {t:"🤷 Ignore it",go:function(){delta("happiness",-5);delta("fame",2);return "Any press is good press, right? Right??";}}]},
{id:"tax",wt:6,icon:"🧾",title:"IRS Audit",cond:function(){return S.stats.money>=400000;},
 text:function(){return "The IRS wants to look at your books. Your accountant is sweating through his suit.";},
 choices:[
  {t:"💸 Pay what you owe",sub:function(){return fmtMoney(Math.round(S.stats.money*0.25));},go:function(){var o=Math.round(S.stats.money*0.25);moneyDelta(-o,"🧾 Back taxes");return "Painful, but you sleep at night now.";}},
  {t:"😈 Cook the books",go:function(){if(chance(0.5)){moneyDelta(Math.round(S.stats.money*0.1),"🧾 'Creative' accounting");delta("notoriety",8);return "Your accountant is a wizard. The IRS finds nothing.";}busted("Tax evasion");return null;}}]},
{id:"barfight",wt:8,icon:"🍺",title:"Bar Brawl",cond:function(){return S.age>=18&&S.age<=45;},
 text:function(){return "A rival band's roadie spills your drink and squares up. The whole bar is watching.";},
 choices:[
  {t:"🥊 Throw the first punch",go:function(){delta("notoriety",R(5,10));delta("health",-R(5,12));delta("happiness",6);if(chance(0.25)){busted("Bar fight assault");return null;}return "Chairs fly. You win. The bartender bans you for life.";}},
  {t:"🚶 Walk away",go:function(){delta("happiness",-3);return "You leave to applause from absolutely no one.";}}]},
{id:"charity",wt:7,icon:"🎗️",title:"Charity Ask",cond:function(){return S.stats.fame>=30;},
 text:function(){return "A children's music charity asks you to headline their gala — for free, obviously.";},
 choices:[
  {t:"❤️ Donate & play",sub:fmtMoney(10000),go:function(){if(S.stats.money<10000){delta("fame",2);return "You play for free instead — broke but beloved.";}moneyDelta(-10000,"🎗️ Donation");delta("fame",R(4,8));delta("happiness",R(6,12));return "The kids cry happy tears. So do you, a little.";}},
  {t:"🙄 Decline",go:function(){delta("notoriety",4);delta("happiness",-3);return "The headline writes itself: 'Rockstar too busy for sick kids.'";}}]},
{id:"bandmate",wt:7,icon:"🥁",title:"Band Drama",cond:function(){return S.tier>=3;},
 text:function(){return "Your drummer showed up 3 hours late AGAIN, and the bassist is threatening to quit over it.";},
 choices:[
  {t:"🔥 Fire the drummer",go:function(){delta("talent",R(2,6));delta("happiness",-6);return "The new drummer is a metronome with arms. The old one writes a diss track.";}},
  {t:"🤝 Keep the peace",go:function(){delta("happiness",6);delta("talent",-2);return "Group hug. The next show is sloppy but joyful.";}}]},
{id:"movie",wt:5,icon:"🎬",title:"Movie Role",cond:function(){return S.stats.fame>=60;},
 text:function(){return "Hollywood wants you as the lead in a rock biopic. The pay is stupid.";},
 choices:[
  {t:"🎬 Take the role",go:function(){var pay=R(500000,2000000);moneyDelta(pay,"🎬 Movie paycheck");delta("fame",R(8,15));delta("happiness",8);confetti(80);return "You cannot act, but nobody cares. Box office gold.";}},
  {t:"🎸 Music only",go:function(){delta("happiness",4);return "You stay true to the stage.";}}]},
{id:"festival",wt:7,icon:"🎪",title:"Festival Headline",cond:function(){return S.tier>=4;},
 text:function(){return "The biggest festival on earth offers you the closing slot: 100,000 people, one night.";},
 choices:[
  {t:"🔥 HEADLINE IT",go:function(){var pay=Math.round(gigPay()*12);moneyDelta(pay,"🎪 Festival payday");delta("fame",R(8,14));delta("health",-R(8,14));delta("addiction",R(4,10));confetti(100);return "100,000 voices scream your name. You feel immortal. Your liver disagrees.";}},
  {t:"😴 Rest instead",go:function(){delta("health",R(8,14));delta("happiness",-4);return "You watch it on TV. FOMO is real.";}}]},
{id:"stalker",wt:5,icon:"👁️",title:"Stalker Fan",cond:function(){return S.stats.fame>=55;},
 text:function(){return "A fan has been outside your house for 6 days. They know your dog's name. You do not have a dog.";},
 choices:[
  {t:"🚫 Restraining order",sub:fmtMoney(20000),go:function(){if(S.stats.money<20000){delta("happiness",-8);return "You cannot afford it. You start sleeping with the lights on.";}moneyDelta(-20000,"⚖️ Legal fees");delta("happiness",8);return "Legally, they must stay 500 feet away. You buy better locks anyway.";}},
  {t:"😰 Ignore it",go:function(){delta("happiness",-R(8,14));delta("notoriety",3);return "It gets worse before it gets better.";}}]},
{id:"viral",wt:8,icon:"📱",title:"Viral Moment",cond:function(){return S.age<40&&S.stats.fame<60;},
 text:function(){return "Your friend dares you to post a ridiculous 15-second cover. It could blow up… or flop.";},
 choices:[
  {t:"📤 Post it",go:function(){if(chance(0.5)){delta("fame",R(10,18));confetti(70);achieve("viral","Viral Sensation");return "47 MILLION views. Labels are calling. Again.";}delta("fame",1);return "312 views. Your mom liked it twice.";}},
  {t:"🙈 Too cool for that",go:function(){return "You maintain your mystique. And your obscurity.";}}]},
{id:"manager",wt:6,icon:"💼",title:"Shady Manager",cond:function(){return S.signed&&S.stats.money>50000;},
 text:function(){return "Your accountant notices your manager has been skimming 20% off the top. For years.";},
 choices:[
  {t:"⚖️ Confront & sue",go:function(){if(chance(0.5)){var rec=R(50000,200000);moneyDelta(rec,"⚖️ Recovered funds");delta("notoriety",5);return "You win back "+fmtMoney(rec)+". He manages a tribute band now.";}moneyDelta(-30000,"⚖️ Legal fees");return "He had better lawyers. Of course he did.";}},
  {t:"😤 Fire quietly",go:function(){delta("happiness",-5);return "Gone, no drama. The money is gone too.";}}]},
{id:"healthscare",wt:6,icon:"🫀",title:"Health Scare",cond:function(){return S.age>=45;},
 text:function(){return "Chest pains at 3am. The doctor's face goes serious.";},
 choices:[
  {t:"🏥 Full workup",sub:fmtMoney(5000),go:function(){if(S.stats.money<5000){delta("health",-R(8,14));return "You skip it. The pain comes back worse.";}moneyDelta(-5000,"🏥 Medical bills");delta("health",R(10,18));return "Caught early. The doctor calls you lucky. You feel mortal.";}},
  {t:"💪 Walk it off",go:function(){shakeIt();delta("health",-R(10,18));return "It was NOT indigestion. You spend a week in bed.";}}]},
{id:"award",wt:5,icon:"🏆",title:"Award Nomination",cond:function(){return S.stats.fame>=70;},
 text:function(){return "You are nominated for Artist of the Year. The ceremony is tonight.";},
 choices:[
  {t:"🤵 Attend",go:function(){if(chance(0.5)){delta("fame",R(10,16));confetti(110);showBanner("🏆 ARTIST OF THE YEAR","you won!");achieve("grammy","Artist of the Year");return "AND THE WINNER IS… YOU! Tearful speech. Standing ovation.";}delta("fame",4);return "You lose to a 19-year-old DJ. You smile through it.";}},
  {t:"🛋️ Skip it",go:function(){delta("fame",-3);return "The cameras notice the empty seat.";}}]},
{id:"kidtrouble",wt:7,icon:"👶",title:"Kid Trouble",cond:function(){return S.kids.length>0;},
 text:function(){var k=pick(S.kids);return "Your kid "+k.name+" ("+k.age+") got caught "+pick(["shoplifting","spray-painting the school","hot-wiring the neighbor's car","starting a garage band at 2am"])+". The principal wants a word.";},
 choices:[
  {t:"💸 Bail them out",sub:fmtMoney(8000),go:function(){moneyDelta(-Math.min(8000,Math.max(0,S.stats.money))||0,"👶 Kid bail");delta("happiness",5);return "Like parent, like child. You cannot even be mad.";}},
  {t:"🧱 Tough love",go:function(){delta("happiness",-6);return "Grounded for a month. They will thank you in 20 years.";}}]},
{id:"dealer",wt:6,icon:"🌿",title:"Back-Alley Offer",cond:function(){return S.age>=16&&S.stats.addiction<50;},
 text:function(){return "A dealer backstage offers you 'the good stuff' — on the house, this time.";},
 choices:[
  {t:"😈 Take it",go:function(){delta("happiness",R(8,14));delta("addiction",R(10,18));delta("health",-R(4,9));if(chance(0.15)){busted("Drug possession");return null;}return "One time won't hurt. (It always hurts.)";}},
  {t:"🚫 Pass",go:function(){delta("happiness",-2);return "You walk away. Barely.";}}]},
{id:"vocals",wt:5,icon:"🎙️",title:"Shot Voice",cond:function(){return S.stats.talent>=40&&S.age>=30;},
 text:function(){return "Your voice is shot after the tour. A specialist offers experimental vocal cord surgery.";},
 choices:[
  {t:"🔪 Surgery",sub:fmtMoney(12000)+" · risky",go:function(){if(S.stats.money<12000){return "You cannot afford it. Honey and rest it is.";}moneyDelta(-12000,"🏥 Surgery");if(chance(0.85)){delta("talent",R(5,12));return "The surgery is a miracle. You hit notes you never could.";}shakeIt();delta("talent",-R(8,15));delta("health",-10);return "Something went wrong. Your upper register is gone.";}},
  {t:"🍯 Rest & honey",go:function(){delta("talent",2);delta("health",4);return "Boring, but your voice recovers.";}}]},
{id:"reunion",wt:5,icon:"👴",title:"Reunion Tour",cond:function(){return S.age>=50&&S.tier>=5;},
 text:function(){return "Promoters offer a fortune for a reunion tour: the original lineup, stadiums, one summer.";},
 choices:[
  {t:"🎸 ONE MORE TOUR",go:function(){var pay=Math.round(gigPay()*15);moneyDelta(pay,"🎸 Reunion payday");delta("fame",R(10,18));delta("health",-R(10,18));confetti(100);achieve("reunion","One More Tour");return "Sold out everywhere. The kids who weren't born when you started are in the front row.";}},
  {t:"🌅 Retire gracefully",go:function(){delta("happiness",R(10,16));return "You tend your garden. Legends do not need encores.";}}]},
{id:"tattoo",wt:7,icon:"🖋️",title:"Ink Therapy",cond:function(){return S.age>=16&&S.age<=40;},
 text:function(){return "3am after a show. The tattoo parlor across the street is still open…";},
 choices:[
  {t:"🖋️ Get the sleeve",go:function(){delta("looks",R(3,8));if(chance(0.15)){delta("health",-6);return "It looks sick. It also gets infected. Worth it? …Yes.";}return "Full sleeve. You look 40% more rockstar instantly.";}},
  {t:"😴 Sleep instead",go:function(){delta("health",3);return "Responsible. Boring. Healthy.";}}]},
{id:"exposed2",wt:4,icon:"📸",title:"Paparazzi!",cond:function(){return S.side.length>0&&S.stats.fame>=30;},
 text:function(){return "A paparazzo caught you leaving a hotel with someone who is NOT your partner.";},
 choices:[
  {t:"💸 Pay them off",sub:fmtMoney(25000),go:function(){if(S.stats.money<25000){exposed();return null;}moneyDelta(-25000,"📸 Hush money");delta("notoriety",4);return "Photos buried. Your wallet is lighter, your secret is safe.";}},
  {t:"🤷 Let it run",go:function(){exposed();return null;}}]},
{id:"sting",wt:5,icon:"🚨",title:"Undercover Sting!",cond:function(){return S.age>=18&&S.crew.length>0;},
 text:function(){return "Cops are asking questions about your operation. A detective wants to 'talk'.";},
 choices:[
  {t:"🤐 Lay low",sub:"cool the heat",go:function(){S.crew.forEach(function(w){w.heat=Math.max(0,w.heat-15);});delta("happiness",-5);return "You go quiet for a month. The heat dies down.";}},
  {t:"💸 Bribe the detective",sub:"$20,000",go:function(){if(S.stats.money<20000){busted("Bribing an officer");return null;}moneyDelta(-20000,"💸 Bribe");if(chance(0.6)){S.crew.forEach(function(w){w.heat=0;});return "The detective takes the envelope and forgets your name.";}busted("Bribing an officer");return null;}},
  {t:"🏃 Ghost them",go:function(){if(chance(0.5)){delta("notoriety",8);S.crew.forEach(function(w){w.heat+=10;});return "You vanish for a while. They will be back.";}busted("Evading an investigation");return null;}}]},
{id:"poached",wt:5,icon:"💃",title:"Poached!",cond:function(){return S.age>=18&&S.crew.length>0;},
 text:function(){var w=pick(S.crew);_poach=w;return "A rival operator is trying to poach <b>"+w.name+"</b> with promises of a better split.";},
 choices:[
  {t:"💰 Match the offer",sub:"$10,000 bonus",go:function(){if(S.stats.money<10000){var gi=S.crew.indexOf(_poach);if(gi>=0)S.crew.splice(gi,1);return _poach.name+" walks. You could not compete.";}moneyDelta(-10000,"💰 Retention bonus");_poach.loyalty=clamp(_poach.loyalty+15,0,100);return _poach.name+" stays. Loyalty is expensive.";}},
  {t:"👋 Let them walk",go:function(){var li=S.crew.indexOf(_poach);if(li>=0)S.crew.splice(li,1);delta("happiness",-5);return _poach.name+" is gone. The game is the game.";}}]},
{id:"bustedassoc",wt:4,icon:"🚔",title:"Associate Arrested",cond:function(){return S.age>=18&&S.crew.length>0;},
 text:function(){var w=pick(S.crew);_arr=w;return "<b>"+w.name+"</b> got picked up last night. They are sitting in county right now.";},
 choices:[
  {t:"💸 Post bail",sub:"$15,000",go:function(){if(S.stats.money<15000){var bi=S.crew.indexOf(_arr);if(bi>=0)S.crew.splice(bi,1);return "You could not afford bail. "+_arr.name+" is out of the game.";}moneyDelta(-15000,"💸 Bail");_arr.loyalty=clamp(_arr.loyalty+10,0,100);_arr.heat+=10;return _arr.name+" is back out. They will not forget this.";}},
  {t:"✂️ Cut ties",go:function(){var ci=S.crew.indexOf(_arr);if(ci>=0)S.crew.splice(ci,1);delta("notoriety",4);if(chance(0.35)){busted("An associate flipped on you");return null;}return "You ghost them. Cold, but safe. Probably.";}}]},
{id:"frienddrama",wt:5,icon:"😤",title:"Friend Drama",cond:function(){return S.friends.length>=2;},
 text:function(){var a=pick(S.friends),b=a;while(b===a)b=pick(S.friends);_fd={a:a,b:b};
  return "<b>"+a.name+"</b> and <b>"+b.name+"</b> had a huge blowup. Both want you to pick a side.";},
 choices:[
  {t:"🤝 Take their side",sub:function(){return _fd.a.name;},go:function(){_fd.a.closeness=clamp(_fd.a.closeness+8,0,100);_fd.b.closeness=clamp(_fd.b.closeness-18,0,100);delta("happiness",-4);return "You back "+_fd.a.name+". "+_fd.b.name+" is furious.";}},
  {t:"🤝 Take their side",sub:function(){return _fd.b.name;},go:function(){_fd.b.closeness=clamp(_fd.b.closeness+8,0,100);_fd.a.closeness=clamp(_fd.a.closeness-18,0,100);delta("happiness",-4);return "You back "+_fd.b.name+". "+_fd.a.name+" is furious.";}},
  {t:"🕊️ Stay neutral",sub:"lose a little of both",go:function(){_fd.a.closeness=clamp(_fd.a.closeness-6,0,100);_fd.b.closeness=clamp(_fd.b.closeness-6,0,100);delta("happiness",-2);return "You refuse to pick. Both are annoyed, but the friendship survives.";}}]},
{id:"friendbail",wt:4,icon:"🙏",title:"Friend in Need",cond:function(){return S.friends.length>0;},
 text:function(){var f=pick(S.friends);_fb=f;return "<b>"+f.name+"</b> is in a jam and needs "+fmtMoney(5000)+", no questions asked.";},
 choices:[
  {t:"💸 Help them out",sub:"$5,000",go:function(){if(S.stats.money<5000){_fb.closeness=clamp(_fb.closeness-15,0,100);return "You could not help. "+_fb.name+" understands. Mostly.";}moneyDelta(-5000,"🙏 Helping a friend");_fb.closeness=clamp(_fb.closeness+12,0,100);delta("happiness",4);return _fb.name+" owes you one. Real ones remember.";}},
  {t:"🚫 Can't right now",go:function(){_fb.closeness=clamp(_fb.closeness-10,0,100);delta("happiness",-4);return "They say it is fine. It is not fine.";}}]},
{id:"friendfame",wt:4,icon:"🌟",title:"Famous Friend",cond:function(){return S.friends.length>0&&S.stats.fame>=20;},
 text:function(){var f=pick(S.friends);return "Your friend <b>"+f.name+"</b> just blew up on their own — and shouted you out in every interview!";},
 choices:[
  {t:"🎉 Ride the wave",go:function(){delta("fame",R(4,9));confetti(60);return "Their fans become your fans. Friendship pays.";}}]},
{id:"rivalstart",wt:7,icon:"🎤",title:"Shots Fired!",cond:function(){return S.age>=18&&S.stats.fame>=35&&!S.rival;},
 text:function(){ _rv={name:(chance(0.5)?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST)};
  return "Rising star <b>"+_rv.name+"</b> called you 'washed' in an interview. The clip has 12M views.";},
 choices:[
  {t:"🎤 Drop a diss track",sub:"start a war",go:function(){
    S.rival={name:_rv.name,heat:70};
    delta("notoriety",R(8,15)); delta("fame",R(5,10)); confetti(80);
    showBanner("⚔️ BEEF!","you vs "+_rv.name);
    return "The diss track is SCORCHING. "+_rv.name+" responds within the hour. It is ON.";}},
  {t:"🕊️ Squash it publicly",sub:"be the bigger star",go:function(){
    delta("happiness",5); delta("fame",R(1,4));
    return "You praise "+_rv.name+" on live TV. The internet calls you classy. Boring, but classy.";}},
  {t:"🙄 Ignore it",go:function(){return "You say nothing. The clip dies down in a week.";}}]},
{id:"rivalry",wt:8,icon:"⚔️",title:"The Beef Continues",cond:function(){return !!S.rival&&S.rival.heat>0;},
 text:function(){return "You and <b>"+S.rival.name+"</b> are still going at it. The blogs are eating it up (heat "+Math.round(S.rival.heat)+"%).";},
 choices:[
  {t:"📊 Chart battle",sub:"streams vs streams",go:function(){
    S.rival.heat=clamp(S.rival.heat+10,0,100);
    if(S.stats.talent+R(0,40)>=55){ delta("fame",8); confetti(70);
      return "Your track outsells theirs 3-to-1. "+S.rival.name+" deletes a tweet."; }
    delta("fame",-8);
    return "Their song is everywhere. Yours is… somewhere. Ouch.";}},
  {t:"🏆 Award-show confrontation",sub:"make a scene",go:function(){
    delta("notoriety",R(6,12)); shakeIt();
    S.rival.heat=clamp(S.rival.heat+15,0,100);
    return "You grab the mic during their acceptance speech. Security escorts you out. Iconic.";}},
  {t:"🤝 Accept their collab offer",sub:"end the beef, get paid",go:function(){
    var pay=R(50000,200000), nm=S.rival.name;
    moneyDelta(pay,"🤝 Collab paycheck"); delta("fame",10); confetti(90);
    S.rival=null;
    return "You and "+nm+" drop a surprise collab. 5x platinum. The beef is officially over — you are both richer.";}}]},
{id:"starlight",wt:6,icon:"⭐",title:"Starlight Music Awards",cond:function(){return S.age>=16&&S.stats.fame>=40&&S.awardYear!==S.age;},
 text:function(){return "The <b>Starlight Music Awards</b> are tonight, and you are on the list. The red carpet awaits…";},
 choices:[
  {t:"🎩 Attend",sub:"walk the carpet",go:function(){
    S.awardYear=S.age;
    var noms=1+Math.floor(S.albums/2)+(S.stats.fame>=70?1:0), wins=0, i;
    for(i=0;i<noms;i++){ if(chance(S.stats.fame/150)) wins++; }
    if(wins>0){
      delta("fame",wins*6); confetti(110);
      showBanner("🏆 AWARD WINNER!",wins+" of "+noms+" nominations");
      achieve("starlight","Starlight Winner");
      awardSpeech(); return null;
    }
    delta("fame",2);
    return "You went home empty-handed ("+noms+" nominations, 0 wins) — but the afterparty was legendary.";}},
  {t:"🛋️ Skip it",sub:"stay home",go:function(){
    S.awardYear=S.age; delta("fame",-2);
    return "The cameras linger on your empty seat. The blogs notice.";}}]},
{id:"appfound",wt:6,icon:"📱",title:"They Found After Dark",
 cond:function(){return S.age>=18&&S.partner&&S.hookups>0;},
 text:function(){return S.partner.name+" found the app. Your last search is still in the recents.";},
 choices:[
  {t:"😭 Confess",go:function(){ bumpMeters(S.partner,{jealous:20,attach:-10,rel:-12}); S.partner.rel=clamp(S.partner.rel-12,0,100); return "Ugly night. They're still here. For now.";}},
  {t:"🤥 Deny",go:function(){ if(chance(0.4)){ bumpMeters(S.partner,{jealous:8}); return "They want to believe you. They don't, but they want to."; } S.partner=null; delta("happiness",-12); return "Dumped by sunrise. The app is still installed.";}},
  {t:"😏 Invite them in",go:function(){ bumpMeters(S.partner,{sexual:12,heat:10,jealous:6}); return "They download it too. This will get messier.";}}]},
{id:"hookupgig",wt:5,icon:"🎤",title:"Hookup at the Gig",
 cond:function(){return S.age>=18&&S.regulars&&S.regulars.length&&S.stats.fame>=15;},
 text:function(){return S.regulars[0].name+" is in the front row mouthing every filthy thing you did.";},
 choices:[
  {t:"😎 Lean into it",go:function(){delta("fame",3);delta("notoriety",4);return "Security has to peel them off the barrier. Clip goes mildly viral.";}},
  {t:"🚫 Throw them out",go:function(){S.restraining.push(S.regulars[0].name); return "They're outside with a sign tomorrow.";}}]},
{id:"tellall",wt:5,icon:"📺",title:"Tell-All Interview",
 cond:function(){return S.age>=18&&(S.babyMamas.length>0||S.hookups>=5);},
 text:function(){return (S.babyMamas[0]?S.babyMamas[0].name:"An old hookup")+" sold a tell-all. Cameras in a beige studio. Your name in the chyron.";},
 choices:[
  {t:"💸 Kill the special",sub:"$40,000",go:function(){ if(S.stats.money<40000){ delta("notoriety",8); return "You couldn't buy it. It airs Thursday."; } moneyDelta(-40000,"📺 Kill fee"); return "Buried. They'll try again in two years.";}},
  {t:"📺 Let it rip",go:function(){ delta("notoriety",R(8,16)); delta("fame",R(3,8)); S.cancelled=S.cancelled||chance(0.2); recapAdd("The tell-all aired."); return "Ratings were disgusting. So were the details.";}}]},
{id:"cancelmob",wt:5,icon:"🚫",title:"The App Comes for You",
 cond:function(){return S.age>=18&&S.stats.fame>=35&&!S.cancelled&&(S.stats.notoriety>30||S.hookups>8);},
 text:function(){return "A montage of your worst clips is the whole internet today.";},
 choices:[
  {t:"🫡 Apology video",go:function(){ if(chance(0.4)){ return "It plays. People mock the apology and then forget you."; } S.cancelled=true; delta("fame",-8); return "The apology becomes the new clip. You're cancelled.";}},
  {t:"🔥 Double down",go:function(){ S.cancelled=true; delta("notoriety",10); delta("fame",5); return "You told them to cope. Half the fans left. The other half bought merch.";}}]},
{id:"stagefall",wt:4,icon:"🤕",title:"Stage Dive Gone Wrong",
 cond:function(){return S.age>=16&&S.tier>=3;},
 text:function(){return "You jump. The crowd does not catch.";},
 choices:[
  {t:"💀 Eat it",go:function(){ shakeIt(); delta("health",-R(10,20)); delta("fame",4); return "Broken tooth. Legendary clip. Your dentist weeps.";}},
  {t:"🎤 Recover",go:function(){ delta("happiness",3); return "You roll, grab the mic, finish the song on your knees. Professionals.";}}]},
{id:"highset",wt:4,icon:"🥴",title:"Perform Wrecked",
 cond:function(){return S.age>=16&&S.stats.addiction>=35;},
 text:function(){return "You're supposed to walk on in four minutes. You can barely find the stage.";},
 choices:[
  {t:"🎸 Do the set anyway",go:function(){ delta("addiction",4); if(chance(0.35)){ delta("fame",-6); return "You forgot whole verses. The reviews are mercy killings."; } delta("fame",5); return "Sloppy and mythic. They think you meant it.";}},
  {t:"🚫 Cancel the show",go:function(){ delta("fame",-3); delta("health",4); return "Riot over a rain check. Your liver sends a thank-you note.";}}]},
{id:"awardsnub",wt:3,icon:"🏆",title:"Awards Snub",
 cond:function(){return S.stats.fame>=55;},
 text:function(){return "Your category plays. They call someone else's name. Cameras find your face.";},
 choices:[
  {t:"🥂 Clap",go:function(){ delta("happiness",-4); return "You clap like a hostage. The gif is kind, barely.";}},
  {t:"🍾 Walk out",go:function(){ delta("notoriety",6); return "You leave mid-speech. The host makes a joke. It lands.";}}]},
{id:"supportcourt",wt:6,icon:"⚖️",title:"Child Support Hearing",
 cond:function(){return S.age>=18&&S.babyMamas&&S.babyMamas.some(function(b){return b.active;})&&(S.supportArrears>0||S.warrant||S.evadeStreak>0);},
 text:function(){return "You're in family court. The other parent wants <b>"+fmtMoney(S.supportArrears||0)+"</b> plus a piece of your future checks.";},
 choices:[
  {t:"💸 Pay everything",go:function(){
    var owe=S.supportArrears||0;
    if(owe>0) moneyDelta(-owe,"⚖️ Court-ordered support");
    S.supportArrears=0; S.warrant=false; S.evadeStreak=0;
    delta("happiness",-4);
    return "You write the check in the hallway. The judge closes the file.";}},
  {t:"🎤 Charm the judge",go:function(){
    if(chance(0.4+S.stats.fame/400)){
      S.supportArrears=Math.round((S.supportArrears||0)*0.5);
      S.warrant=false;
      return "The judge is a fan. Arrears get cut in half. You still owe "+fmtMoney(S.supportArrears)+".";
    }
    S.supportArrears=Math.round((S.supportArrears||0)*1.2)+5000;
    delta("notoriety",5);
    return "The judge hates rockstars. Arrears just went up.";}},
  {t:"🚪 Walk out",go:function(){
    delta("notoriety",10); S.warrant=true;
    if(chance(0.4)){ busted("Contempt of family court"); return null; }
    return "Contempt filing incoming. You made it worse.";}}]},
{id:"custodyambush",wt:4,icon:"👶",title:"Custody Ambush",
 cond:function(){return S.age>=18&&S.kids.some(function(k){return k.liveWith===false||k.support;});},
 text:function(){return "The other parent shows up with cameras and a lawyer. They want full custody and a bigger check.";},
 choices:[
  {t:"⚖️ Fight it",sub:"$8,000",go:function(){
    if(S.stats.money<8000){ delta("happiness",-6); return "You couldn't afford counsel. They look like the stable parent on TV."; }
    moneyDelta(-8000,"⚖️ Emergency counsel");
    if(chance(0.5)){ delta("happiness",5); return "You hold the line. Custody does not change. This time."; }
    S.babyMamas.forEach(function(b){ if(b.active) b.monthly=Math.round(b.monthly*1.2); });
    return "They win a bump. Support is up 20%.";}},
  {t:"📺 Stay quiet",go:function(){delta("happiness",-5);delta("fame",2);return "The clip still spreads. Any press is press.";}}]},
{id:"bandquit",wt:4,icon:"🚪",title:"Band Drama!",cond:function(){return !!S.band;},
 text:function(){return "Your "+pick(S.band.members).role.toLowerCase()+" is threatening to quit over 'creative differences' (money).";},
 choices:[
  {t:"🔍 Hold auditions",sub:"$2,000",go:function(){
    var B=S.band, qi=0, fi;
    for(fi=1;fi<B.members.length;fi++) if(B.members[fi].happy<B.members[qi].happy) qi=fi;
    var out=B.members[qi];
    if(S.stats.money<2000){
      B.chem=clamp(B.chem-20,0,100);
      if(B.chem<=0){ breakupBand(); return "You could not afford auditions. "+out.name+" walked — and the band fell apart."; }
      return "You could not afford auditions. "+out.name+" walked.";
    }
    moneyDelta(-2000,"🔍 Auditions");
    B.members[qi]=newMember(out.role);
    B.chem=clamp(B.chem-10,0,100);
    if(B.chem<=0){ breakupBand(); return out.name+" is out, "+B.members[qi].name+" is in — but the magic is gone. The band splits."; }
    return out.name+" is OUT. "+B.members[qi].name+" ("+B.members[qi].role+") is in!";}},
  {t:"🎤 Power through shorthanded",go:function(){
    var B2=S.band; B2.chem=clamp(B2.chem-20,0,100);
    if(B2.chem<=0){ breakupBand(); return "The tension snaps. The band breaks up on the spot."; }
    return "You carry on with grit and duct tape. Rough, but rock.";}}]},
{id:"bandfight",wt:4,icon:"🥊",title:"Backstage Brawl!",cond:function(){return !!S.band;},
 text:function(){return "Two bandmates are screaming at each other backstage. A guitar is already broken.";},
 choices:[
  {t:"🤝 Mediate",go:function(){
    var B=S.band; B.chem=clamp(B.chem-5,0,100);
    B.members.forEach(function(m){ m.happy=clamp(m.happy+5,0,100); });
    return "Peace talks work. Awkward hug. Show goes on.";}},
  {t:"🍿 Let them brawl",go:function(){
    var B2=S.band; B2.chem=clamp(B2.chem-15,0,100);
    delta("notoriety",5); delta("happiness",5); shakeIt();
    if(B2.chem<=0){ breakupBand(); return "The fight ends the band. Legendary breakup, terrible idea."; }
    return "Bloody noses, great story. The crowd never knew.";}}]},
{id:"bandod",wt:3,icon:"🚨",title:"Band Emergency!",cond:function(){return !!S.band&&S.band.members.length>0;},
 text:function(){ _bod=pick(S.band.members);
  return "<b>"+_bod.name+"</b> ("+_bod.role+") OD'd after the show. They are in the hospital — it is touch and go.";},
 choices:[
  {t:"🏥 Pay for rehab",sub:"$30,000",go:function(){
    if(S.stats.money<30000) return odDeath();
    moneyDelta(-30000,"🏥 Rehab");
    _bod.happy=clamp(_bod.happy+10,0,100);
    S.band.chem=clamp(S.band.chem-5,0,100);
    return _bod.name+" pulls through. The band rallies — shakily.";}},
  {t:"⚰️ Let fate decide",go:function(){ return odDeath(); }}]}
];
