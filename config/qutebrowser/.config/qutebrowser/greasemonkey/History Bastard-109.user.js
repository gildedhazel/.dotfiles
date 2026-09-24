// ==UserScript==
// @id             History Bastard
// @name           History Bastard
// @namespace      localhost
// @author         https://steamcommunity.com/id/_naknak_/
// @homepage       https://steamcommunity.com/id/_naknak_/
// @description    Bastardize Steam inventory history and SCM listings/history: count repeated items, sort by item name, note properties, un-rename, highlight/summarize held trades, fluid layout, and more!
// @match          *://steamcommunity.com/*/inventoryhistory*
// @match          *://steamcommunity.com/*/tradehistory*
// @run-at         document-idle
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @downloadURL    https://naknak.net/tf2/historybastard/historybastard.user.js
// @nocompat Chrome
// @nocompat
// @version        109
// ==/UserScript==
/* jshint esversion:6 */
/*
----------TODO 
expand indexed result
saveable options
download
disable chunked.json dl
do something about out-of-space
toggle_unheld_visible should twiggle filterbox
index of held trades past and present
--------- DONE
harmonize page/index matching behav
show 3/20/100/999
show only held should hide unheld indexed results
mark held in index
RLE BASTARD_DATES
index info button
harmonize clickable elements
lsex peek
steamid_dec input 'http://steamcommunity.com/id/_naknak_/inventoryhistory/?p=1#' is invalid on search "scorch"
heldbut Uncaught ReferenceError: update_highlight is not defined 
filterX not appearing on #filter-x pageload
highlighting - new rows
delay sneaky crawl on index search
metadata (date, N, lasttrade) & use larger of saved or seen lasttrade for index_stats
ct.innerHTML toggle_info doesn't work
fetch stuck on pg2
textbuts accumulate on fetch
held summary flashes on pageload
------------ 
This program is free software: you can redistribute it and/or modify it under the terms 
of the GNU General Public License as published by the Free Software Foundation, either 
version 3 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details. <http://www.gnu.org/licenses/>
======================================================================================================
CHANGELOG
======================================================================================================
v109: add Gas Passer and The Dragon's Fury to craftable wep list
v108: fix uploader so that CHANGELOG and date on newest version are right
v107: remove formatdates() as valve changed date/timestamp structure
v106: "load more" on ../inventoryhistory works; remove dead code related to index/SCM; remove sheep
v105: support other language "Unusual Effect"
v104: document-idle replaces document-start
v103: remove lz4.js and SCM integration
v101: include tradehistory
v100: re-release, update URL
v99: disable GUID generation (bugfix for Steam rework of history)
v98: release, .tradehistory_items_received became .tradehistory_items
v97: release, daybreak working again
v96: release, fix formatdates() after steam broke it
v87: BETA heldtext bugfix
v86: BETA metadata
v85: BETA daterange bugfix
v84: BETA css
v83: BETA peek cosmetics
v82: BETA move sneaky_crawl, vanity resolver into setTimeouts, store SEQ_LAST_INDEXED, 
v81: BETA compact result msg
v80: BETA formatting
v79: BETA hoverpagedate z-index
v78: BETA no minify
v77: BETA whitespace-only minify
v76: BETA filter not persisting
v75: BETA minification
v74: BETA lsex peek
=end changelog==========================================================================================
*/
// all the CSS is at the bottom.  Here are some global options you can change:
var globals = [{
	name: "defaults",
	reLocation: /^/,
	reIndescribable: / Case$| Key$/, // don't bother examining these for descriptive properties.  This is a performance enhancement.
	reIndescribableType: / Container$| Tool$| Craft Item$| Ticket$| Crate$| Package$| Trading Card$/, //  run against the item's type.
	IndescribableExact: ["Refined Metal", "Reclaimed Metal", "Scrap Metal", "Mann Co. Supply Crate Key", "Gift Wrap", "Backpack Expander", "Tour of Duty Ticket", "Mann Co. Store Package", "Name Tag", "Description Tag"], // needs exact match
	Craftweps: [  // used to decide what items to accumulate under "Craftable weapon"
		 "Your Eternal Reward"        ,  "The Warrior's Spirit"         ,  "Tomislav"               ,  "The Wrap Assassin"          ,  "The Wrangler"               ,  "The Winger",
		 "The Widowmaker"             ,  "The Vita-Saw"                 ,  "The Vaccinator"         ,  "The Ullapool Caber"         ,  "The Ubersaw"                ,  "The Tribalman's Shiv",
		 "The Tide Turner"            ,  "The Third Degree"             ,  "The Sydney Sleeper"     ,  "The Spy-cicle"              ,  "The Splendid Screen"        ,  "The Southern Hospitality",
		 "The Solemn Vow"             ,  "The Soda Popper"              ,  "The Shortstop"          ,  "The Short Circuit"          ,  "The Shahanshah"             ,  "The Scottish Resistance",
		 "The Scottish Handshake"     ,  "The Scotsman's Skullcutter"   ,  "The Scorch Shot"        ,  "The Sandvich"               ,  "The Sandman"                ,  "The Righteous Bison",
		 "The Reserve Shooter"        ,  "The Rescue Ranger"            ,  "The Red-Tape Recorder"  ,  "The Razorback"              ,  "The Rainblower"             ,  "The Quickiebomb Launcher",
		 "The Quick-Fix"              ,  "The Powerjack"                ,  "The Postal Pummeler"    ,  "The Pomson 6000"            ,  "The Phlogistinator"         ,  "The Persian Persuader",
		 "The Pain Train"             ,  "The Overdose"                 ,  "The Original"           ,  "The Neon Annihilator"       ,  "The Market Gardener"        ,  "The Mantreads",
		 "The Manmelter"              ,  "The Machina"                  ,  "The Loose Cannon"       ,  "The Lollichop"              ,  "The Loch-n-Load"            ,  "The Liberty Launcher",
		 "The Kritzkrieg"             ,  "The Killing Gloves of Boxing" ,  "The Jag"                ,  "The Iron Bomber"            ,  "The Huntsman"               ,  "The Homewrecker",
		 "The Holy Mackerel"          ,  "The Holiday Punch"            ,  "The Hitman's Heatmaker" ,  "The Half-Zatoichi"          ,  "The Gunslinger"             ,  "The Gunboats",
		 "Frontier Justice"           ,  "The Fortified Compound"       ,  "The Flying Guillotine"  ,  "The Flare Gun"              ,  "The Fan O'War"              ,  "The Family Business",
		 "The Eyelander"              ,  "The Eviction Notice"          ,  "The Eureka Effect"      ,  "The Escape Plan"            ,  "The Equalizer"              ,  "The Enforcer",
		 "The Disciplinary Action"    ,  "The Direct Hit"               ,  "The Diamondback"        ,  "Detonator"                  ,  "The Degreaser"              ,  "The Dead Ringer",
		 "The Dalokohs Bar"           ,  "Crusader's Crossbow"          ,  "The Cozy Camper"        ,  "The Cow Mangler 5000"       ,  "The Concheror"              ,  "The Cloak and Dagger",
		 "The Cleaner's Carbine"      ,  "The Classic"                  ,  "The Chargin' Targe"     ,  "The Candy Cane"             ,  "The Bushwacka"              ,  "The Buff Banner",
		 "The Buffalo Steak Sandvich" ,  "The Buffalo Steak Sandvich"   ,  "The Brass Beast"        ,  "The Boston Basher"          ,  "The Bootlegger"             ,  "The Blutsauger",
		 "The Black Box"              ,  "The Big Earner"               ,  "The Beggar's Bazooka"   ,  "The Bazaar Bargain"         ,  "The Battalion's Backup"     ,  "The B.A.S.E. Jumper",
		 "The Back Scratcher"         ,  "The Back Scatter"             ,  "The Backburner"         ,  "The Axtinguisher"           ,  "The Atomizer"               ,  "The Amputator",
		 "The Ambassador"             ,  "The Air Strike"               ,  "The Sun-on-a-Stick"     ,  "Sharpened Volcano Fragment" ,  "Pretty Boy's Pocket Pistol" ,  "Nessie's Nine Iron",
		 "Natascha"                   ,  "Mad Milk"                     ,  "L'Etranger"             ,  "Jarate"                     ,  "Gloves of Running Urgently" ,  "The Fists of Steel",
		 "Darwin's Danger Shield"     ,  "Crit-a-Cola"                  ,  "Conniver's Kunai"       ,  "Bonk! Atomic Punch"         ,  "Baby Face's Blaster"        ,  "Ali Baba's Wee Booties",
		 "The Claidheamh Mòr"         ,  "The Sticky Jumper"            ,  "The Rocket Jumper"      ,  "The Huo-Long Heater"        ,  "The Panic Attack"           ,  "The Force-A-Nature",
		 "The Hot Hand"               ,  "The Thermal Thruster"         ,  "The Second Banana"      ,  "The Dragon's Fury"          ,  "The Gas Passer"
	 ],
	 /*jshint -W014*/
	reProp:[   // run against each line from hoverbox; captures are concatenated into a superscript description.  All these RE are OR'd together
		/^(?:Sheen|Paint Color|★ Unusual Effect|★ Unusual efekt|★ Usædvanlig effekt|★ Ungewöhnlicher Effekt|★ Efecto Inusual|★ Epätavallinen tehoste|★ Effet inhabituel|★ Rendkívüli effekt|★ Effetto Insolito|★ Bijzonder effect|★ Nietypowy efekt|★ Efeito Incomum|★ Efect neobișnuit|★ Необычный эффект|★ Ovanlig Effekt|★ Olağandışı Efek|Killstreaker|Halloween): *([^(]+).*/,
		/^(Elite|Assassin|Commando|Mercenary|Freelance|Civilian)( Grade ).*?(?:\((Battle Scarred|Factory New|Minimal Wear|Field-Tested|Well-Worn)\))?$/,
		/^\((?!Kill Assists:)(?!Teammates Whipped)(.*): [,\d]+\)$/,
		/^.*\(?(Battle Scarred|Factory New|Minimal Wear|Field-Tested|Well-Worn)\)?$/,
		/^(?![(])(?!This is a limited)(?!StatTrak™ Confirmed)(?!This item has been renamed)(?!Kills:)(.*): [\d,]+$/,
		/^\( (No)t Usable i(n) (Craft)ing \)/,
		/^(Medal no. \d+)$/
	].map(function(re) { return re.source; } ).join("|"),
	steamID: function() { return typeof g_steamID === 'undefined' ?  "00000000000000000" : g_steamID; },
	monthNames:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
	maxFetches: 100, // maximum number of caching fetches per page load
	canonicalizeAppids: [440, 730, 570], // prefer market-URL-name to actual item name for these appids.
	// For steam items, item name is better ("18 Gems" vs "Gems").  For game items that can be renamed, market name is better.
	escrowDuration: 24*15+0.5, // hours, to decide whether held summary is completed. +.5 for late release
	epoch: 2011, // first year of inventory history; is used to store timestamps compactly
	localStorageMax: /firefox/i.test(navigator.userAgent) ? 10239977 : 5242880, // characters; each character is 2 bytes.  
	localStorageTargetPctUsed: 96, // when usage is higher than this, compress chunks (oldest first) to reclaim space.  Steam uses about 1%.  A full uncompressed chunk uses 2-3%.
    crawlDelaySeconds: 10,
	maxDoubleCheckingFetches: 30, // maximum number of complete pages to double-check (for cancelled held trades) when index is complete
	minSneakyDelaySec: 40, // minimum time between sneaky fetches
	localStorageMaxPctUsed: 99, // when usage is higher than this, delete chunks (oldest first) to reclaim space
	ignorePagesAbove: 99999, // actual real-life limit, with 5M storage, is about 4000 
	indexResultRows: 3,
	indexVersion: "v41", // when this changes, all old indices on disk are removed!
	configurable: [
		{
			p:"ignorePagesAbove",
			t:"don't index beyond page",
			u:"",
			h:"One meg holds about 300 uncompressed or 900 compressed pages. 0 disables indexing.",
			v:validate_int,
			d:99999,
			min:0,
			max:999999999
		},
		{
			p:"localStorageTargetPctUsed",
			t:"compress old indexes to keep localStorage usage below",
			u:"%",
			h:"The default is usually fine.  0 or 100 disables automatic compression (you can still manually compress using the Local Storage Explorer).", 
			v:validate_int,
			d:99,
			min:0,
			max:100
		},
		{
			p:"minSneakyDelaySec",
			t:"delay at least",
			u:"seconds between sneaky fetches",
			h:`This value affects the regularity of background indexing.  Actual delay is longer if another tab is updating the index or if you're doing lookups.  
				Lower values make sneaky crawling faster.  
				Use a higher value if you see the "Too many requests" error during normal usage.  
				15 seconds is the lowest value allowed, to avoid sneaky crawls from interfering with each other and to keep clear of Steam's rate-limiting.`,
			v:validate_int,
			d:40,
			min:15,
			max:999999999
		},
		{
			p:"crawlDelaySec",
			t:"delay at least ",
			u:"seconds between crawler fetches",
			h:`This value affects foreground crawling speed.  Steam allows 25 fetches per 5 minutes, or 12 seconds per on average.  
				This delay doesn't include load times, so you can go lower than 12 before seeing the "Too many requests" error.  
				Use a lower value if your internet is very slow.  Use a higher value if the crawler interferes with your normal inventory history use.`,
			v:validate_int,
			d:10,
			min:3,
			max:99
		},
		{
			p:"enableSneakyCrawling",
			t:"Enable sneaky crawling",
			u:"",
			h:`If disabled, no background crawling will occur.  You can still run the foreground crawler to fill gaps in the index.  Not recommended!  
				Disabling background crawling will lead to undetectable single-trade gaps in the index which are created when a held trade is cancelled on an unvisited page.`,
			f:"checkbox",
			d:true
		},
		{
			p:"enableVanityResolution",
			t:"Resolve custom URLs to steam IDs",
			u:"",
			h:`If enabled, History Bastard will fetch the user's profile XML (if using http) or full profile (if using https, where Valve disallows XML fetches for unknown reasons)
			 in order to index their a steamID instead of a vanity URL.  These fetches don't count against Steam's 25-per-5-minutes limit.  Consider disabling this if you pay for
			 data, or if you don't care about searching by steamID.`,
			 f:"checkbox",
			 d:true
		},
		{
			p:"maxFetches",
			t:"sneakily crawl at most",
			u:"pages per tab",
			h:`browser extensions and other variables can cause background fetches to leak memory.  Use a lower value if long-running tabs are crashing. 0 means unlimited.`,
			v:validate_int,
			d:100,
			min:0,
			max:99999999
		},
		{
			p:"indexResultRows",
			t:"show",
			u:"indexed results",
			h:"You can always see more by clicking the <b>More</b> button.  Large result sets can use a lot of memory and CPU.",
			v:validate_int,
			d:3,
			min:0,
			max:1000
		},
		{  
			p:"localStorageMax",
			t:"maximum size of localStorage",
			u:"characters",
			h:`if you know your localStorage is some other size than the default, enter it here.  Note that a character is two bytes. 
				You can get find the approximate maximum by running <a href=https://arty.name/localstorage.html>this test</a>.
				Chrome is fixed at 5M.  
				Firefox defaults to 10M, can be changed by entering <b>about:config</b> in the address bar and adjusting the value of <tt>dom.storage.default_quota</tt>.`,
			v:validate_int,
			d:/firefox/i.test(navigator.userAgent) ? 10239977 : 5242880, 
			min:1024*1024,
			max:1024*1024*1024
		},
	]
}, {
	name: "INV",
	reLocation: /steamcommunity.com\/.*\/\w+history/,
	rePropMap: /HistoryPageCreateItemHover\( '(trade\d+_\w+item\d+)', '?(\d+)'?, '?(\d+)'?, '?(\w+)'?, '?(\d+)'? \);/g,
	isDynamic: false,
	props: function() {		return typeof g_rgHistoryInventory === "undefined" ? [] : g_rgHistoryInventory;	},
	qDate: ".tradehistory_date",
	qDateMoveTo: ".tradehistory_timestamp",
	qProfile: ".tradehistory_event_description a:not(.bptf):not(.btn)",
	qItem: ".history_item",
	qFilterSibling: ".tradehistoryrow",
	qRow: ".tradehistoryrow",
	qItemName: ".history_item_name",
}, { 
    name: "INVcrawling",
    reLocation: /steamcommunity.com\/.*\/inventoryhistory\/*(\?p=\d*)?#+crawl(-t0-\d+|-pagesDone-\d+|-pagesThisTab-\d+)*$/,
},
{ 
    name: "INVinsideCrawlFrame",
    reLocation: /steamcommunity.com\/.*\/inventoryhistory\/*(\?p=\d*)?#+incrawl$/,
},
{
	name: "SCM",
	reLocation: /steamcommunity.com\/market/,
	rePropMap: /CreateItemHoverFromContainer\( g_rgAssets, '(\w+)', '?(\d+)'?, '?(\d+)'?, '?(\d+)'?, '?(\d+)'? \);/g,
	isDynamic: true,
	props: function() {		return typeof g_rgAssets === "undefined" ? [] : g_rgAssets;	},
	qDate: ".market_listing_listed_date",
	qProfile: ".market_listing_whoactedwith .playerAvatar a",
	qItem: ".market_listing_item_name",
	qItemName: ".market_listing_item_name_link",
	qRow: ".market_listing_row",
	qIcon: ".market_listing_item_img",
	qFilterParent: ".market_tab_well_tabs",
}, {
	name: "SCMlisting", // also matches SCM
	reLocation: /steamcommunity.com\/market\/listings\/\d/,
	qFilterParent: ".market_listing_nav",
	isDynamic: false,
}];
/* jshint -W084 */
var HB = null;
for (var i = 0, h; h = globals[i]; ++i)	if (h.reLocation.test(document.location.href)) {
	 if (HB) jQuery.extend(HB, h);
	 else HB = h;
	 HB["is" + h.name] = true;
}
BASTARD_PROPERTY_MAP = propmap("", (HB.props)(), document.getElementsByTagName("script"));
BASTARD_PROPERTY_MAP_EXTENDED = false;
BASTARD_THISPAGE = BASTARD_HIGHEST_FETCHED_PAGE = a2pg(window.location);
BASTARD_NEXTPAGE = false;
if (HB.isDynamic) watch_xhr();
// if (HB.isINV && !HB.isINVinsideCrawlFrame && google && google.charts) google.charts.load('current', {packages: ['corechart']});

// console.log ("t0 nitems=" + jQuery(".history_item").length);
// if (HB.isINV && window.location.protocol !== "http:") window.location.protocol="http:"; // else XML-fetch of usernames will fail
jQuery(document).ready(function HB_onready() {
	perf("bastardization");
	applyStyles();
	if (isFail()) return;
	if (HB.isINVcrawling) applyCrawlStyle(); // crawlstyle hides failure-to-load messages, so do it after failure checking
	BASTARD_STEAMID=HB.steamID();
	var scr=document.getElementsByTagName("script");
	if (BASTARD_PROPERTY_MAP_EXTENDED) jQuery.extend(BASTARD_PROPERTY_MAP, propmap("", (HB.props)(), scr));
	else BASTARD_PROPERTY_MAP=propmap("", (HB.props)(), scr); // perf: if watch() found no new props, faster to overwrite than deep-copy
	console.log(BASTARD_PROPERTY_MAP);
	glance();
	go();
	perf("bastardization");
	 // diddlestatus3();
});

function isFail() {
	 var err;
	 if (
	     (err=document.querySelector("#mainContents > .profile_fatalerror:first-child > .profile_fatalerror_message")) // "Inventory History is temprarily unavailable" or "You've made too many requests"
		 ||
		((err=document.querySelector("body > p:first-child")) && /^\s*Reference #[\da-f.]+\s*$/.test(err.textContent)) // nginx internal error
		||
		(err=document.querySelector(".error_ctn #message .sectionText + h3")) // Failed loading profile data
	 ) {
			setTimeout(function() { window.location.reload(); }, 700);
			return E("div", { c:"HB_reloading", t:"But History Bastard is on the case! Reloading...", P:err});
	 }
	 else return false;
}
// 	                                                                       
// 	 ,,                                                            q   p   
// 	*MM                                         .6*"  `7MM          \ /    
// 	 MM                                  __,  ,M'       MM       o=--*--=o 
// 	 MM,dMMb.   ,6"Yb.  ,pP"Ybd  .gP"Ya `7MM ,Mbmmm.    MM  ,MP'    / \    
// 	 MM    `Mb 8)   MM  8I   `" ,M'   Yb  MM 6M'  `Mb.  MM ;Y      d   b   
// 	 MM     M8  ,pm9MM  `YMMMa. 8M""""""  MM MI     M8  MM;Mm              
// 	 MM.   ,M9 8M   MM  L.   I8 YM.    ,  MM WM.   ,M9  MM `Mb.            
// 	 P^YbmdP'  `Moo9^Yo.M9mmmP'  `Mbmmd'.JMML.WMbmmd9 .JMML. YA.           

function lz416k(plaintext) {
    var b=new TextEncoder("utf8").encode(plaintext),
	    len=b.length,
        padding= 7-((len % 7) || 7),
        s=padding ? [ String.fromCharCode(padding) ] : [],
        i;
        // console.log({len:len, padding:padding});
    for (i=0; i<len; i+=7) s.push( String.fromCharCode.apply(null, [ 
        0x4e00+(b[i]<<6) +(b[i+1]>>2),
        0x4e00+          ((b[i+1]&3)<<12) +(b[i+2]<<4) +(b[i+3]>>4),
        0x4e00+                                        ((b[i+3]&15)<<10) +(b[i+4]<<2) +(b[i+5]>>6),
        0x4e00+ /* undef>>0===0; need op for this straggler in case i+6 is OOB */     ((b[i+5]&63)<<8)+(b[i+6]||0) 
    ]));
    //    console.log({i:i, s:s});
    // console.log( "b16k_en: " + b.length + " => " + s.join('').length );
    return s.join('');
}

function unlz416k(s) { 
    var slen=s.length,
        padding=s.charCodeAt(0) < 7 ? s.charCodeAt(0) : 0,
        hasPadding=padding ? 1:0,
        blen=(s.length - hasPadding) / 4 * 7 - padding,
        b= new Uint8Array(blen),
        i=0,
        j=0;
       // console.log("b16k_de: " + slen + " => " + blen);
    for (i=hasPadding; i<slen; i+=4) { 
        var c = [ s.charCodeAt(i)-0x4e00, s.charCodeAt(i+1)-0x4e00, s.charCodeAt(i+2)-0x4e00, s.charCodeAt(i+3)-0x4e00 ];
        b[j++] =   c[0]>>6;
        b[j++] = ((c[0]&63)<<2) +(c[1]>>12);
        b[j++] =                 (c[1]>>4)&255;
        b[j++] =                ((c[1]&15)<<4) + (c[2]>>10);
        b[j++] =                                ((c[2]>>2)&255);
        b[j++] =                                ((c[2]&3)<<6) + (c[3]>>8);
        b[j++] =                                                 c[3]&255;
    }
    return new TextDecoder("utf8").decode( b );
}

function base16k_enc(i,width) {
	var s="", word;
	for (i = +i; i || !s; i=(i-word)/16384) { 
		word=i%16384;
		s += String.fromCharCode(word+0x4e00);
	}
	if (s.length < width) s+= "\u4e00".repeat(width - s.length);
	return s;
}
function base16k_dec(s) {
    return          (s.charCodeAt(0)-0x4e00) + 
    (s.length > 1 ? (s.charCodeAt(1)-0x4e00)*0x4000 : 0) +  
    (s.length > 2 ? (s.charCodeAt(2)-0x4e00)*0x10000000 : 0) +
    (s.length > 3 ? (s.charCodeAt(3)-0x4e00)*0x40000000000 : 0);
}
function steamid_enc(s) { 
	s=s.replace(/^http.*(?:\/profiles\/(?=\d+$)|\/id(?=\/[\w-]+$))/,'');
	if (/^76561\d{12}$/.test(s)) return base16k_enc(s.substr(5), 3);
	else if (/^\/[\w-]+$/.test(s)) return s;
	else throw new Error("steamid_enc input " + s  +" is invalid");
}
function steamid_dec(s) { 
	s=s.replace(/^[\x00-\x1f]/,'');
	var delim=s.indexOf("\x04"), name="", id=s;
	if (delim > -1) { 
		id=s.substr(0, delim);
		name=s.substr(delim);
	}
	if (id.length !== 3 && id[0]!=="/") throw new Error("steamid_dec input '" + s + "' is invalid");
	if (id[0]==="/") return "https://steamcommunity.com/id" + id + name;
	else return "https://steamcommunity.com/profiles/76561" + base16k_dec(id) + name;
}
function date_dec(s) { 
	if (!s || s.length!==1 || s===" ") return "";
	var date=base16k_dec(s[0]);
	return (date % 32) + " " + HB.monthNames[(date>>5) & 15] + ", " + ((date>>9) + HB.epoch);
}
function datetime_dec(s) { 
	if (s.length!==2) return;
	var date=base16k_dec(s[0]),
		time=base16k_dec(s[1]),
		y= (date>>9) + HB.epoch,
		m= HB.monthNames[ (date>>5) & 15 ],
		d= fixed(date & 31,2),
		hh=fixed(time>>6,2,"0"),
		mm=fixed(time&63,2,"0");
	return `${d} ${m}, ${y} ${hh}:${mm}`;
}

function datetime_enc(dt) {
	var enc = "", date;
	if (typeof dt === "number") { //timet
		date=new Date( dt * 1000 );
		enc = base16k_enc(( date.getHours() << 6) + date.getMinutes() );
	} else {
		var	time = dt.match(/(.*)\b([012]?\d):([0-5]\d)(?:\d\d)? *((?:[pa]m?)?)\b(.*)/i),
			datestr=dt;
		if (time) {
			var hh = +time[2],
				mm = +time[3],
				pm = /[Pp]/.test(time[4]),
				ampm = !!time[4];
			if (ampm) {
				if (hh === 12 && !pm) hh = 0;
				else if (hh < 12 && pm) hh += 12;
			}
			datestr = time[1] + time[5];
			enc = base16k_enc((hh << 6) + mm);
		}
		date = new Date(Date.parse(datestr));
	}
	if (+date) {
		if (!enc) enc = ".";
		var y = date.getFullYear(),
			m = date.getMonth(),
			d = date.getDate();
		if (y === 2001) { // then return regexp that includes last year and the year before that
			y = new Date().getFullYear() % HB.epoch;
			var md = (m << 5) + d;
			enc = '[' + base16k_enc((y << 9) + md) + base16k_enc(((y - 1) << 9) + md) + base16k_enc(((y - 2) << 9) + md) + ']' + enc;
		} else {
			y %= HB.epoch;
			enc = base16k_enc((y << 9) + (m << 5) + d) + enc;
		}
	}
	if (!enc) return console.error("datetime_enc couldn't encode input '" + dt + "'");
	else return enc;
}
// colors are encoded in base 4096, 12 bits per char, using the private use area U+E000 – U+F8FF
function color_dec(s) {    
	var hex="#" + fixed( (s.charCodeAt(0) - 0xe000).toString(16), 3, "0") + fixed( (s.charCodeAt(1) - 0xe000).toString(16), 3, "0");
	return hex==="#1000000" ? "inherit" : hex;
}
function color_enc(s) {    
	if (/^\s*rgba?\s*\((\s*\d+\s*,){2}\s*\d+/.test(s)) { 
		var rgb=s.split(/\D+/);
		return String.fromCharCode( ((+rgb[1])<<4) + ((+rgb[2])>>4) + 0xe000 ) + String.fromCharCode( (((+rgb[2])%16)<<8) + (+rgb[3]) + 0xe000 );
	} else { 
		s=s.replace(/^#|^0x/,'');
		if (s.length===3) s=s.replace(/(.)/g, '$1$1');
		if (s==="inherit" || s.length<6) s="1000000";
		if (s.length<7) s="0".repeat(7-s.length) + s;
		return String.fromCharCode( parseInt(s.substr(0,4),16) +  0xe000) + String.fromCharCode( parseInt(s.substr(4),16) +  0xe000);
	}
}


function options_dialog() { 
	return E("div", {id:"HB_options", c:"HB_info"});
}

var BASTARD_DELETE_UNDO={};

function localStorage_explorer() { 
	perf("localStorage_explorer");
	var e=document.getElementById("HB_lsex") || E("div", {id:"HB_lsex", c:"HB_info"}),
		wt=weigh_localStorage(),
		denom=index_n(),
		bins=Object.keys(wt.keys).sort(),
		n_bins=bins.length,
		undo=Object.keys(BASTARD_DELETE_UNDO),
		n_undo=undo.length,
		smerc=E("", {c:"mercury red"}),
		sdigital=E("", {c:"digital", t:wt.pct + `% of ${Math.round(HB.localStorageMax/1048576)}M localStorage used (${Math.round(wt.bastard/denom)} chars per trade)` }),
		i;
	console.log({wt});
	if (e.textContent) e.textContent='';
	E("div", {c:"thermometer small", P:e, C:[ smerc, sdigital ]});
	smerc.style.width=wt.pct + "%";
	if (wt.pct>90) smerc.style.backgroundColor=`rgb( ${Math.round(wt.pct)}, ${Math.round(100-wt.pct)}, 0)`;

	if(n_undo) { 
		var ul=E("ul", {P:e, c:"undo"});
		for (i=0; i<n_undo; ++i) ul.appendChild( wt2li( "undo", undo[i], BASTARD_DELETE_UNDO[undo[i]].length, BASTARD_DELETE_UNDO[undo[i]].substr(0,200) ) );
	}
	for (i=0; i<n_bins; ++i) { 
		var bin=bins[i],
			binned=wt.keys[bin],
			peek=wt.peek[bin],
			keys=Object.keys(binned).sort().sort(trailing_numeric),
			n_keys=keys.length,
			ulbin=n_keys ? E("ul", {P:e, c:bin}) : "",
			j;
		for (j=0; j<n_keys; ++j) ulbin.appendChild( wt2li(bin, keys[j], binned[keys[j]], peek[keys[j]]) );
	}
	perf("localStorage_explorer");
	return e;
}
function wt2li(bin, key, sz, peek) {
	var reMe = new RegExp("^HB_" + BASTARD_STEAMID + "_(\\d+|meta(?:data)?|lastupdate)$"),
		reHbOther = new RegExp("^HB_(?!" + BASTARD_STEAMID + ")(\\d{17}_(?:\\d+|meta|lastupdate))$"),
		lump = key.replace(reMe, '$1').replace(reHbOther, '$1'),
		desc,
		li = E("li", {c: "lsex_entry", C: [
			E("", {c: "lsex_size", t: sz }),
			E("", {c: "lsex_key", t: (/^\d+$/.test(lump) ? "chunk " : "") + lump }), 
			(desc = E("", {c: "desc"}))
		]});
	if (bin === "undo") E("a", {
		P: li,
		h: "#",
		onclick: f_undelete_ls(key),
		c: "lsex_undel xs grn btn",
		title: "Undelete"
	});
	if (bin !== "undo" && lump !== "meta") E("a", {
		P: li,
		h: "#",
		onclick: f_delete_ls(key),
		c: "lsex_del sm round delete btn",
		title: "Delete this item (can be undone!)"
	});
	if (bin !== "bastard") E("", {
		P: li,
		c: "lsex_peek",
		t: JSON.stringify(peek) + (sz - key.length > peek.length ? "..." : "")
	});

	if (bin === "bastard") {
		if (/^\d+$/.test(lump)) {
			var chunk = +lump,
				chunkin = BASTARD_INDEX[chunk],
				cstat = " " + (chunkin.compressed ? "" : "un") + "compressed",
				match;
			desc.textContent = s(chunkin.n, "trade", " ").replace(/\s+$/, '') + (
				(match = BASTARD_DATES[chunk].match(/(\S)(?:.*(\S))?/)) ? ": " + date_dec(match[1]) + "-" + date_dec(match[2] || match[1]) : ""
			).replace(/(: |-)\d+ /g, '$1').replace(/,/g, '').replace(/ (\w+ \d{4})(-.* \1)/, ' $2').replace(/ (\d{4})(-.* \1)/, '$2');
			E("", {P: li, c: "lsex_state" + cstat });
			E("a", {P: li, h: "#", onclick: f_toggle_compressed(chunk), c: "lsex_undel xs grn btn" + cstat });
		} else if (lump === "meta") {
			var meta = index_metastamp(),
				upd = new Date(parseInt(meta, 10)).toString();
			desc.innerHTML = "updated " + upd + "<br>" + meta.slice(1).join(" ").replace(/: /g, ':');
		}
	}
	return li;
}

function f_toggle_compressed(chunk) { 
	return function toggle_compressed() {
		Retr();
		var chunkin=BASTARD_INDEX[chunk];
		if (!chunkin) console.error("can't toggle compression on chunk "+chunk+" because it doesn't exist!");
		else {
			chunkin.compressed=!chunkin.compressed;
			chunkin.dirty=true;
			Stor(chunk);
		}
		localStorage_explorer();
		return false;
	};
}

function f_delete_ls(key) { 
	return function delete_ls() { 
		BASTARD_DELETE_UNDO[key]=localStorage.getItem(key);
		localStorage.removeItem(key);
		localStorage_explorer();
		return false;
	};
}

function f_undelete_ls(key) { 
	return function undelete_ls() { 
		localStorage.setItem(key, BASTARD_DELETE_UNDO[key]);
		delete BASTARD_DELETE_UNDO[key];
		localStorage_explorer();
		return false;
	};
}

function validate_int(v, def, min, max) {
	if (!/\d/.test(v)) return def;
	v=parseInt(v, 10); 
	if (v<0) v=def;
	if (v<min) v=min;
	if (v>max) v=max;
	return v;
}
function validate_int_array(v, def, min, max) {
	if (!/\d/.test(v)) return def;
	var seen={},
		vals=v.split(/\D+/).filter( function(n) { 
			if (!v.length || +v < min || +v > max || seen[v]) return false;
			/*jshint -W093*/
			else return seen[v]=true;
		}).sort(numeric);
	if (!vals.length) return def;
	return vals;
}
// 	                                                                                    
// 	  ,,                    ,,                                                          
// 	  db                  `7MM                               mm            mm           
// 	                        MM                               MM            MM           
// 	`7MM  `7MMpMMMb.   ,M""bMM  .gP"Ya `7M'   `MF' ,pP"Ybd mmMMmm  ,6"Yb.mmMMmm ,pP"Ybd 
// 	  MM    MM    MM ,AP    MM ,M'   Yb  `VA ,V'   8I   `"   MM   8)   MM  MM   8I   `" 
// 	  MM    MM    MM 8MI    MM 8M""""""    XMX     `YMMMa.   MM    ,pm9MM  MM   `YMMMa. 
// 	  MM    MM    MM `Mb    MM YM.    ,  ,V' VA.   L.   I8   MM   8M   MM  MM   L.   I8 
// 	.JMML..JMML  JMML.`Wbmd"MML.`Mbmmd'.AM.   .MA. M9mmmP'   `Mbmo`Moo9^Yo.`MbmoM9mmmP' 
// 	                                                                                    
// 	         

function index_stats() { 
	perf("index_stats");
	Retr();
	var oldblocktext=[],
		updating= !!document.getElementById("index_pageblocks"),
		oldblocks=updating && document.querySelectorAll( "#index_pageblocks .alldone"),
		n_oldblocks=updating && oldblocks.length,
		oldpct=updating && +document.getElementById("index_complete_pct").textContent,
		oldn=updating && +document.getElementById("index_complete_n").textContent,
		i;
	if (updating) for (i=0; i<n_oldblocks; ++i) oldblocktext.push( oldblocks[i].textContent );
	var has=new Map(),
		n_has=index_n(),
		incomplete_pages=index_holes(n_has),
		k_incomplete=[ ...incomplete_pages.keys() ],
		n_incomplete=k_incomplete.length,
		firstundone=k_incomplete[0] || 0,
		tpct=Math.round(index_pct(n_has)),
		laststatus="",
		lastblock,
		page,
		countdown=document.getElementById("index_stats_nextpageload"),
		countdowntext=countdown ? countdown.textContent : "",
		meta=index_metastamp(),
		meta_n_trades=+meta[2],
		n_trades = BASTARD_LASTTRADE > meta_n_trades ? BASTARD_LASTTRADE : meta_n_trades,
		n_pages=Math.ceil(n_trades/30),
	    denom=n_has || 1,
	    crawlanchor=HB.isINVcrawling ? "#crawl" : "",
		suse=weigh_localStorage(),
		e=document.getElementById("HB_index") || E("div", {id:"HB_index", c:"HB_info"}),
		tmerc=E("", {c:"mercury"}),
		tdigital=E("", {c:"digital", C:[
			E("", { id:"index_complete_pct", c:((updating && oldpct!==tpct) ?"":"un")+"changed", t:tpct }),
			document.createTextNode("% of all trades indexed ("),
			E("", { id:"index_complete_n", c:((updating && oldn!==n_has) ?"":"un")+"changed", t:n_has }),
			document.createTextNode(` / ${n_trades})`)
		]}),
		blocks=E("div", { id:"index_pageblocks", P:e }),
		crawlnext="?p=" + (firstundone || 1), // + (BASTARD_CRAWL ? `-t0-${BASTARD_CRAWL.t0}-pagesDone-${BASTARD_CRAWL.pagesDone}-pagesThisTab-${BASTARD_CRAWL.pagesThisTab}` : ""),
		estdisk=Math.round( suse.bastard/denom*n_trades/1024 ) || "<1",
		dth=(Date.now() - BASTARD_CRAWL.t0)/3600/1000,
		estend=hours2text( incomplete_pages.size * 17/3600, true );

	e.textContent='';
	if (HB.isINVcrawling) {
		e.classList.add("crawling");
		if (firstundone) { 
			E("a", { c:"crawl_abort lg red btn", h:"#", onclick:stop_crawler, t:"Make it stop!", P:e });
			E("a", { c:"crawl_pause lg toggle btn", h:"#", onclick:pause_crawler, id:"crawler_pause", P:e });
		} else { 
			e.classList.add("complete");
			E("a", { c:"crawl_done btn mm", h:"?p=1", id:"crawler_done", P:e });
		}
	}

	tmerc.style.width=tpct + "%";
	E("div", {c:"thermometer", P:e, C:[ tmerc, tdigital ]});

	for (page=1; page<=n_pages; ++page) { 
		var status=incomplete_pages.has(page) ? (incomplete_pages.get(page) ? "some" : "none") : "alldone";
		if (status===laststatus) {
			lastblock.textContent=(lastblock.textContent.replace(/-\d+/,'') + "-" + page).replace(/^page /,'pages ');
			lastblock.setAttribute("p1", page);
		}
		else { 
			lastblock=E("a", {c:"index_pageblock "+status, t:"page "+page, P:blocks, h:"?p="+page+crawlanchor });
			lastblock.setAttribute("p0", page);
			lastblock.setAttribute("p1", page);
		}
		laststatus=status;
		if(n_has==n_trades && page<n_pages-1) page=n_pages-1;
	}
	var doneblocks=blocks.querySelectorAll(":scope > .alldone"),
	n_doneblocks=doneblocks.length;
	for (i=0; i<n_doneblocks; ++i) { 
		var block=doneblocks[i];
		// console.log({new:   page2daterange(  block.getAttribute("p0")), old:   page2daterange(  block.getAttribute("p1")), range:page2daterange(  block.getAttribute("p0"), block.getAttribute("p1")) });
		E("", {P:block, t:": " + page2daterange(  block.getAttribute("p0"), block.getAttribute("p1")).replace(/^[123]?\d-[123]\d /,'').replace(/(^|-)[123]?\d /g,'$1').replace(/,/g, '').replace(/^(\w+ \d{4})-\1/, '$1') });
		if (updating && oldblocktext.indexOf(block.textContent)===-1) block.classList.add("changed");
	}
	e.appendChild(blocks);
	/*
	if (BASTARD_CRAWL.usedJSHeapSize && BASTARD_CRAWL.usedJSHeapSize.length > 1 && google && google.visualization) { 
		var gdata=new google.visualization.DataTable();
		gdata.addColumn('datetime', 'Time of Day');
		gdata.addColumn('number', 'megs');
		gdata.addRows( BASTARD_CRAWL.usedJSHeapSize );
		var graph=new google.visualization.LineChart( E("div", {id:"index_stats_mem", P:e}) );
		graph.draw( gdata, { 
			width:420,
			height:160,
			title:"Memory used by heap (MB)",
			titleTextStyle: {color:'#6b747f'},
			chartArea: { width: "85%" },
			pointSize: 5,
			hAxis:{ format:'HH:mm', gridlines:{color:"#182433"}, textStyle:{color:'#6b747f'}, baselineColor:'#1B2838' },
			vAxis:{                 gridlines:{color:"#182433"}, textStyle:{color:'#6b747f'} },
			legend:'none',
			colors:[ '#2B405A' ],
			backgroundColor: '#1b2838',
		 });
	}
*/
	E("div", {c:"index_stats_mostrecent", P:e, t:`Most recent activity was page ${seq2page(+(index_metastamp())[6])} indexed ${hours2text((Date.now() - index_timestamp())/1000/3600)}.` });
	if (firstundone) {
		if (HB.isINVcrawling) {
			var dttxt=(BASTARD_CRAWL.t0 && dth > 0.01) ? " in " + hours2text( dth, true ) : "",
				dtpp=(BASTARD_CRAWL.pagesDone > 5) ?  dth * 3600 / BASTARD_CRAWL.pagesDone : "",
				dtpptxt=dtpp ? ` (${Math.round(dtpp)} seconds per page, ${Math.round(3600/dtpp)} pages per hour)` : "",
				progress=BASTARD_CRAWL.pagesDone ? `The crawler has indexed ${s( BASTARD_CRAWL.pagesDone, "page","",dttxt+dtpptxt).replace(/ $/,'')}.` : "";


			if (BASTARD_CRAWL.pagesDone > 5) estend=hours2text( incomplete_pages.size * dtpp/3600, true );

			E("div", {c:"index_stats_estimates", P:e, innerHTML:`Estimated crawl completion time is ${estend}.<br>Estimated final size is ${(estdisk/1024).toFixed(1)}M.`});
			E("div", {c:"index_stats_progress", P:e, t:progress});
			E("div", {id:"index_stats_nextpageload", P:e, t:countdowntext});
			document.title="crawl pg" + BASTARD_CRAWL.nextPage + ", " + tpct + "%";
			setTimeout( start_crawler, 0 );
		}
		else E("div", {c:"index_stats_incomplete", P:e, innerHTML:`Your index is incomplete. 
				<a href="${crawlnext}#crawl" class=index_stats_startcrawl>Start crawling now to fill it up!</a><br>Estimated crawl time is ${estend}.
				<br><a href="${crawlnext}#crawl" class="index_stats_startcrawl_btn xl grn btn">Unleash the Crawler!</a>
			`});
	}
	else {
		E("div", {c:"index_stats_complete", t:"Your index is complete.  Enjoy!", P:e });
		e.classList.add("complete");
	}
	perf("index_stats", mem());
	return e;
}

function index_n() { 
	var n=0;
	for (chunk=0; chunk<BASTARD_CHUNKS; ++chunk) if (BASTARD_INDEX[chunk]) n+=BASTARD_INDEX[chunk].n;
	return n;
}
function index_pct(n) { 
	return ((n || index_n()) / (BASTARD_LASTTRADE || 1) * 100).toFixed(1);
}

function index_holes(n, firstonly) { 
	if (!n || (typeof n !== "number")) n=index_n();
	var chunk,
		chunkin,
		seq,
		offs,
		page,
		has=new Map(),
		has_by_page=new Map();
	BASTARD_CRAWL.nextPage=false;
	Retr();
	if (n === BASTARD_LASTTRADE) return firstonly ? false: has_by_page;
	for (chunk=BASTARD_LASTCHUNK; chunk>-1; --chunk) { 
		chunkin=BASTARD_INDEX[chunk];
		if (!chunkin || !chunkin.full) { 
			if (chunkin && BASTARD_DATES[chunk]) has.set(chunk, new Set( BASTARD_DATES[chunk].split('').map(function(c,i) { return c===" "? -1:i; }) ));
			else has.set(chunk, new Set());
	
			if (firstonly) {
				seq=(chunk===BASTARD_LASTCHUNK ? BASTARD_LASTCHUNK_N-1 : 1023) + chunk*1024;
				var stop=chunk*1024-1;
				for (1; seq>stop; --seq) {
					if (seq>=BASTARD_LO_SEQ && seq<=BASTARD_HI_SEQ) continue;
					offs=seq & 1023;
					if (!chunkin || (!has.get(chunk).has(offs) && !chunkin.trade[offs]) ) {
						BASTARD_CRAWL.nextPage=seq2page(seq);
						// console.log( [ seq, seq2page(seq), BASTARD_CRAWL.nextPage ] );
						return BASTARD_CRAWL.nextPage;
					}
				}
			}
		}
	}
	//console.log({has, BASTARD_DATES});
	for (seq=BASTARD_MAX_SEQ; seq>-1; --seq) { 
		offs=seq & 1023;
		page=seq2page(seq);
		chunk=seq>>10;
		chunkin=BASTARD_INDEX[chunk];
		// console.log({ seq, offs, page, chunk });
		if (!has_by_page.has(page)) has_by_page.set(page,0);
		if (!chunkin) continue;
		if (chunkin.full || has.get(chunk).has(offs) || chunkin.trade[offs] ) has_by_page.set(page, has_by_page.get(page)+1);
	}
	for (page=BASTARD_PAGES; page; --page) { 
		var hp=has_by_page.get(page);
		if (hp===30 || (page===BASTARD_PAGES && hp===BASTARD_LASTPAGE_N)) has_by_page.delete(page);
		else BASTARD_CRAWL.nextPage=page;
	}
	return firstonly ? false: has_by_page;
}

function mem() { 
	// var m=performance.memory;
	// return `jsHeapSizeLimit ${(m.jsHeapSizeLimit/1e6).toFixed(1)}M   totalJSHeapSize ${(m.totalJSHeapSize/1e6).toFixed(1)}M   usedJSHeapSize ${(m.usedJSHeapSize/1e6).toFixed(1)}M`;
	return "";
}
function f_sneaky_crawl(defaultpage, n) {
	return function sneaky_crawl() {
		Retr();
		var frameid = "sneakyCrawlFrame",
			frame = (document.getElementById(frameid) || E("iframe", { id: frameid, S: document.getElementById("mainContents") })),
			page = index_holes(true, true) || defaultpage++,
			collision=index_dt() < HB.minSneakyDelaySec*0.7,
			recent_lookup=( Date.now() - BASTARD_SEARCH.t ) < 60000,
			delay= HB.minSneakyDelaySec*1000 + ( recent_lookup || collision)*(20000 + performance.now());
		LOG("sneaky crawling page " + page + " (next sneaky crawl in " + Math.round(delay/1000) + " seconds)");
		frame.setAttribute("src", "?p=" + page + "#incrawl");
		if(!n) n=0;
		if (++n < HB.maxFetches && defaultpage < HB.maxDoubleCheckingFetches) BASTARD_CRAWL.crawlSched=setTimeout(  f_sneaky_crawl(defaultpage, n), delay );
	};
}

function start_crawler(frame) { 
	if (!frame) frame="crawlFrame";
	if (typeof frame==="string") frame=( document.getElementById(frame) || E( "iframe", { id:"crawlFrame", S:document.getElementById("mainContents") } ) );
	//if (frame) frame.parentElement.removeChild(frame);
	LOG("crawling "+BASTARD_CRAWL.nextPage); 
	reset_crawler_timers();
	BASTARD_CRAWL.nextLoad = BASTARD_CRAWL.lastLoad ? BASTARD_CRAWL.lastLoad  + HB.crawlDelaySeconds*1000 : 0;
	BASTARD_CRAWL.crawlSched = setTimeout( function() { frame.setAttribute( "src", "?p=" + BASTARD_CRAWL.nextPage + "#incrawl" ); }, BASTARD_CRAWL.nextLoad - performance.now());
	BASTARD_CRAWL.pollSched = setTimeout(poll_crawler, 2000);
	BASTARD_CRAWL.displaySched = setTimeout( update_crawler_timer, 0);
}
function poll_crawler() { 
	var frame=document.getElementById("crawlFrame"),
		frameContent=frame.contentDocument || frame.contentWindow.document,
		indexed=frameContent.getElementsByClassName("indexed"),
		rows=frameContent.getElementsByClassName("tradehistoryrow");
	//if (rows.length && indexed.length === rows.length)	console.log({BASTARD_INDEX_T, dt:index_dt()});
	if (rows.length && indexed.length === rows.length) { 
		LOG("crawled");
	 	BASTARD_CRAWL.pagesDone++;
	 	BASTARD_CRAWL.pagesThisTab++;
		frame.parentElement.removeChild(frame);
		reset_crawler_timers();
		BASTARD_CRAWL.lastLoad=performance.now();
		BASTARD_CRAWL.usedJSHeapSize.push( memDataPt() );
		index_stats();
		localStorage_explorer();
	}
	else BASTARD_CRAWL.pollSched=setTimeout( poll_crawler, 300);
}
	
function stop_crawler() { 
	reset_crawler_timers();
	window.location.href="?p=1";
	return false;
}
function reset_crawler_timers() { 
	if ( BASTARD_CRAWL.crawlSched )   clearTimeout( BASTARD_CRAWL.crawlSched );
	if ( BASTARD_CRAWL.pollSched  )   clearTimeout( BASTARD_CRAWL.pollSched );
	if ( BASTARD_CRAWL.displaySched ) clearTimeout( BASTARD_CRAWL.displaySched );
	BASTARD_CRAWL.crawlSched=0;
	BASTARD_CRAWL.pollSched=0;
	BASTARD_CRAWL.displaySched=0;
	BASTARD_CRAWL.timer=HB.delay_seconds;
	var span=document.getElementById("index_stats_nextpageload");
	if (span) span.textContent='';
}
function pause_crawler() { 
	reset_crawler_timers();
	var btn=document.getElementById("crawler_pause"),
		span=document.getElementById("index_stats_nextpageload");
	if (btn) { 
		if (btn.classList.contains("paused")) start_crawler();
		else if (span) {
			span.textContent=`Page ${BASTARD_CRAWL.nextPage} loading when you `;
			E("a", {onclick:pause_crawler, P:span, h:"#", t:"unpause."});
		}
		btn.classList.toggle("paused");
	}
	return false;
}
function update_crawler_timer() { 
	var span=document.getElementById("index_stats_nextpageload");
	var t=Math.round( (BASTARD_CRAWL.nextLoad - performance.now()) /1000);
	span.textContent=`Page ${BASTARD_CRAWL.nextPage} loading ` + (t>0 ? s(t, "second", "in ", "." + "…".repeat(t-1)) : "right about now!");
	if (t>0) BASTARD_CRAWL.displaySched=setTimeout(update_crawler_timer, 400); 
}
function memDataPt() { 
	// return([ new Date(),  Math.round(performance.memory.usedJSHeapSize / 1048576) ]);
	return ([ 0,0 ]);
}
BASTARD_CRAWL={ 
		t0: 0,
		pagesDone: 0,
		pagesThisTab: 0,
		displaySched: 0,
		pollSched: 0,
		crawlSched: 0,
		nextLoad: 0,
		lastLoad: 0,
		nextPage: 0,
		usedJSHeapSize: [ memDataPt() ]
};
function init_crawler() {
	BASTARD_CRAWL.t0=Date.now();
	var args=window.location.href.replace(/.*#crawl-*/,'').split(/-/),
		n_args=args.length,
		i;
	for (i=0; i<n_args-1; i+=2) { 
		if (args[i]==="t0" && +args[i+1]) BASTARD_CRAWL.t0 = +args[i+1];
		else if (args[i]==="pagesDone") BASTARD_CRAWL.pagesDone = +args[i+1];
		else if (args[i]==="pagesThisTab") BASTARD_CRAWL.pagesThisTab = +args[i+1];
	}
	toggle_info();
}
function weigh_localStorage(plus) {
	var used = {
			bastard: plus||0,
			foreign_bastard: 0,
			other: 0,
			keys: { 
				bastard:{},
				foreign_bastard:{},
				other:{}
			},
			peek: { 
				bastard:{},
				foreign_bastard:{},
				other:{}
			}
		},
		reMe=new RegExp("^HB_" + BASTARD_STEAMID + "_(\\d+|meta(?:data)?|lastupdate)$"),
		reHbOther=new RegExp("^HB_(?!" + BASTARD_STEAMID + ")(\\d{17}_(?:\\d+|meta|lastupdate))$"),
		n_keys = localStorage.length,
		key,
		i;
	for (i = 0; (i<n_keys) && (key=localStorage.key(i)); ++i) {
		var bin = reMe.test(key) ? "bastard" : ( reHbOther.test(key) ? "foreign_bastard" : "other" ),
			sz = key.length + localStorage[key].length,
			peek = localStorage[key].substr(0,200);
		used[bin] += sz;
		used.keys[bin][key] = sz;
		used.peek[bin][key] = peek;
	}
	used.t = used.bastard + used.foreign_bastard + used.other;
	used.pct = Math.round(used.t / HB.localStorageMax * 100);
	used.bkb = Math.round(used.bastard / 1024); // actually kilo-chars
	return used;
}
// 	                                   
// 	                                   
// 	                                   
// 	                                   
// 	 ,dW"Yvd  pd*"*b. `7Mb,od8 .gP"Ya  
// 	,W'   MM (O)   j8   MM' "',M'   Yb 
// 	8M    MM     ,;j9   MM    8M"""""" 
// 	YA.   MM  ,-='      MM    YM.    , 
// 	 `MbmdMM Ammmmmmm .JMML.   `Mbmmd' 
// 	      MM                           
// 	    .JMML.                         
function q2re(query) { 
		var trydate,
		bWho="\\x03",
		bProf="\\x04",
		bHeld="\\x05",
		bWhen="\\x06",
		bRGline="[\\x01\\x02]",
		bRGPline="[\\x01-\\x03]",
		sot="\\x00",
		skip="[^\\f]*?",
		line="[^\\x00-\\x08\\x0a\\x0c-\\x1f]*", // allow tab and vtab
		eot="(.)(.)(....)(.)",
		reHeld = '(?:'+ bHeld + '(..))?',
		reWho  = '('  + bWho  + line + ')?',
		reProf = '('  + bProf + line + ')',
		reWhen = bWhen + '(..)',
		reQ="",
		prof = [],
		what = [],
		reSteamID64 = /(\D|^)(76561\d{12})(\D|$)/,
		reItemid = /([ \/:]|^)(\d{9,12})([ \/]|$)/;
	if (/(?=.*[^\W\d]{2})^.*(^|\D)(3[01]|[012]?\d)(\D|$)/.test(query) && ( trydate=Date.parse( query) )) { 
		reWhen = bWhen + '(' + datetime_enc(query) + ')';
		query="";
	}
	else {
		if ( reSteamID64.test(query)) {  // steamid 
			prof.push( steamid_enc(query.match( reSteamID64 )[2]) + `(?=[${bWhen}${bHeld}])` );
			query=query.replace(/\S*76561\d{12}\S*/g, '');
		} 
		if ( /\/id\/[\w-]{3}/.test(query) ) { // vanity url
			prof.push( query.replace(/.*\/id(\/[\w-]{3,}).*/, '$1') + line);
			query=query.replace(/\S*\/id\/[\w-]{3,}\S*/g, '');
		} 
		if (prof.length) reProf=`(${bProf}(?:${prof.join("|")}))`;
		if ( reItemid.test(query))  { // itemid
			var itemid=base16k_enc( query.replace(/^.*?(\D|^)(\d{9,12}).*$/g,'$2'), 3);
			reQ = `(${bRGline})(${itemid}[\ue000-\uf000]{2}${line})`;
			query='';
		}
		query=qesc(qtrim(query));
		if (query) {
			what = query.split(" ");
			var n_what=what.length, 
				i,
				bLine=prof.length ? bRGline : bRGPline;

			for (i=0; i<n_what; ++i) {
				reQ += `(?=${bLine}${line}?${what[i]})`;
			}
			reQ+=`(${bLine})(${line})`;

		}
	}
	var re=`${sot}${skip}${reQ}${reQ && skip}${reWho}${reProf}${reHeld}${reWhen}${eot}`;
	return re;
}
function qtrim(q) { 
	return q.replace(/https?:\/\//g,'').replace(/\s+/g,' ').replace(/^ +| $/g,'').replace(/[\x00-\x1f"]/g, '');
}
function qesc(q) {
	return q.replace(/([()\[\]\{\}+?*.$\^|,:#<!\\"-])/g, '\\$1').replace(/^ ?(\d+)x */, '$1[ˣx]');
}
function index_poll_for_changes() {
	if (Retr()) {
		var fbox = document.getElementById("filterbox"),
			filtered = fbox && /\S/.test(fbox.value),
			undated = document.querySelectorAll('.pagelink:not(.pagelink_dated)'),
			n_undated = undated.length,
			stats=document.getElementById("HB_index"),
			updateable=[ n_undated && "page number hints",  filtered && "filter results", stats && "stats" ].filter( function(x) { return !!x; });
			// console.log({ n_undated, stats, filtered, updateable });
		if (updateable.length) {
			LOG(`index has been modified by sneaky crawler or another tab. Updating ${updateable.join(" and ")}`);
			BASTARD_CRAWL.usedJSHeapSize.push( memDataPt() );
			for (var i = 0; i < n_undated; ++i) {
				var link = undated[i],
					pageno = link.getAttribute("data-pageno"),
					title = pageno ? page2daterange(pageno) : "";
				if (title) {
					E("", { c:"hoverpagedate", t:title, P:link });
					link.title = title;
					link.classList.add("pagelink_dated");
				}
			}
			if (stats) { index_stats(); localStorage_explorer(); }
		}
	}
	return setTimeout(index_poll_for_changes, 500);
}
function numeric(a,b) { return +a - +b; }
function reverse_numeric(a,b) { return +b - +a; }
function trailing_numeric(a,b) { 
	var ac=+( a.replace(/.*?(\d*)$/,'$1') || -1),
	    bc=+( b.replace(/.*?(\d*)$/,'$1') || -1);
	return ac-bc;
}

BASTARD_INDEX=[];
BASTARD_DATES=[];
BASTARD_INDEX_T=0;
var BASTARD_SEARCH=empty_search();
function empty_search(q) { 
	var box=document.getElementById("indexresults"),
		n_shown=(box && box.querySelectorAll(".index_result").length) || 0;
	/*jshint -W093*/
	return BASTARD_SEARCH={ query:(q||""), results:[], chunk:BASTARD_INDEX.length-1, n_shown, n_wanted:HB.indexResultRows, t:0 };
}
// 	                                                                                                      
function n_others(trade, n, n_total, verb) {
	if (+n === 0) return +n_total - 1;
	else if (/\./.test(n)) {
		var items = trade.match(({received: /\x01(?!\d+\.\d\dˣMetal)(?:\d+ˣ)?/g, gave: /\x02(?!\d+\.\d\dˣMetal)(?:\d+ˣ)?/g })[verb]),
			n_items = items.length,
			n_other = 0,
			i;
		for (i = 0; i < n_items; ++i) n_other += +items[i].replace(/\D+/g, '') || 1;
		return n_other;
	} else return +n_total - +n;
}
function ndx2seq(ndx, chunk) { 
	return chunk*1024 + base16k_dec( ndx.substr(-1) );
}

function hit2jso(hit) {
	if (hit.o) return hit.o;
	var match=hit.hit.match(hit.re),
		eom = match.length - 1,
		column = match[1].charCodeAt(0),
		line = match[2],
		seq = hit.seq || (hit.chunk * 1024 + base16k_dec(match[eom])),
		who = match[eom - 7] || match[2],
		prof = steamid_dec(match[eom - 6]),
		verbs=[ "", "received", "gave", "traded with", "traded on" ];

	console.log({ trade:JSON.stringify(match[0]), match:[""].concat(match.slice(1)), seq,chunk:hit.chunk, page:seq2page(seq), BASTARD_LASTTRADE});
	/*jshint -W093*/
	return hit.o={
		trade: match[0],
		column,
		line,
		url: prof,
		who: who,
		held: match[eom - 5] ? datetime_dec(match[eom - 5]) : "",
		when: datetime_dec(match[eom - 4]),
		received_n: base16k_dec(match[eom - 3]),
		gave_n: base16k_dec(match[eom - 2]),
		guid: base16k_dec(match[eom - 1]),
		seq,
		page: seq2page(seq),
		verb: verbs[column]
	};
}
// 	                                   
// 	                                   
// 	`7MM"""Mq.           mm            
// 	  MM   `MM.          MM            
// 	  MM   ,M9  .gP"Ya mmMMmm `7Mb,od8 
// 	  MMmmdM9  ,M'   Yb  MM     MM' "' 
// 	  MM  YM.  8M""""""  MM     MM     
// 	  MM   `Mb.YM.    ,  MM     MM     
// 	.JMML. .JMM.`Mbmmd'  `Mbmo.JMML.   
// 	                                   
// 	            

function Retr(chunks, retries) {
	if (!Array.isArray(chunks)) {
		if (typeof chunks === "object") chunks = [Object.keys(chunks)];
		else if (chunks === 0 || +chunks) chunks = [+chunks];
		else chunks = Chunks();
	}
	var n_chunks = chunks.length,
		i,
		task = ("retr " + (chunks.length > 1 ? chunks.length + " chunks" : "chunk " + chunks.toString())),
		n_cached = 0,
		cache_invalidated = "",
		t0 = index_timestamp();
	perf(task);

	for (i = 0; i < n_chunks; ++i) {
		var chunk = chunks[i];
		if (typeof chunk === "string") chunk = parseInt(chunk.replace(/^HB.*_/, ''), 10);
		if (BASTARD_INDEX[chunk]) {
			if (index_dt() < 0) cache_invalidated = "cache invalidated by more recent write";
			else {
				n_cached++;
				continue;
			}
		}
		initChunk(chunk);
		var chunkin = BASTARD_INDEX[chunk],
			key = chunkey(chunk),
			version;

		[version, chunkin.n, BASTARD_DATES[chunk], chunkin.ndx] = deserialize(localStorage.getItem(key));
		if (!version || version !== HB.indexVersion) {
			LOG(`index chunk ${chunk} (${key}) is obsolete, removing`);
			localStorage.removeItem(key);
			initChunk(chunk);
			continue;
		}
		if (!chunkin.n || !BASTARD_DATES[chunk].length || !chunkin.ndx.length) {
			LOG(`index chunk ${chunk} (${key}) is corrupt, removing`);
			localStorage.removeItem(key);
			initChunk(chunk);
			continue;
		}
		chunkin.full = isFull(chunk);
		chunkin.compressed = isCompressed(chunk);

	}
	if (index_timestamp() !== t0) {
		if (!retries) retries = 1;
		if (retries > 20) throw new Error("History Bastard can't read of the on-disk index because it keeps changing.  This shouldn't happen.  Giving up.");
		LOG(`index changed during Retr() [ timestamp=${index_timestamp()} t0=${t0} ] re-reading`);
		perf(task, "discard");
		return Retr(chunks, retries + 1);
	} else {
		BASTARD_INDEX_T = index_timestamp();
		var actual = n_chunks - n_cached;
		if (actual) perf(task, s(n_cached, "chunk", "(", " already cached)") + cache_invalidated);
		else perf(task, "discard");
		return n_chunks - n_cached;
	}
}
function serialize(version, n, dates, ndx, compress) { 
	return version + base16k_enc(n) + dates_rle(dates) + "|" + (compress ? lz416k(ndx) : ndx); 
}
function deserialize(raw) { 
	if (!raw) return [ null, null, null, null ];
	var	verlen=HB.indexVersion.length,
		delim=raw.indexOf("|");
	return [ raw.substr(0, verlen), base16k_dec(raw[verlen]), dates_rld(raw.substr(verlen+1, delim-verlen-1)), raw.substr(delim+1) ]; // could still be compressed
}

function dates_rle(dates) { 
    return dates.replace(/(.)(\1+)/g, function(whole, c, n) { return String.fromCharCode(0xe000 + n.length+1) + c; });
}

function dates_rld(dates) { 
    return dates.replace(/([\ue000-\uf000])([^\ue000-\uf000])/g, function(whole, n, c) { return c.repeat(n.charCodeAt(0)-0xe000); });
}

function initChunk(chunk) { 
	BASTARD_INDEX[chunk]={ ndx:"", trade:[], chunk, n:0, dirty:false, full:false, version:HB.indexVersion, compressed:false, retrieval_time:Date.now() };
}
function Decompress(chunk) { 
	if (isCompressed(chunk)) {
		perf ("decompress "+chunk);
		BASTARD_INDEX[chunk].ndx =  unlz416k(BASTARD_INDEX[chunk].ndx) ;
		perf ("decompress "+chunk);
	}
} 
function isCompressed(chunk) { 
	if (typeof chunk === "number" || /^-?\d{1,8}$/.test(chunk)) return BASTARD_INDEX[chunk] && BASTARD_INDEX[chunk].ndx && BASTARD_INDEX[chunk].ndx.length && /[^\f\x00]/.test(BASTARD_INDEX[chunk].ndx[0]);
	else return chunk && chunk.length && /[^\f\x00]/.test(chunk[0]);
}
function isFull(chunk) {
	return 	BASTARD_INDEX[chunk] && (
		BASTARD_INDEX[chunk].n === 1024 || ( chunk===BASTARD_LASTCHUNK && BASTARD_INDEX[chunk].n === BASTARD_LASTCHUNK_N )
	);
}



// 	                               
// 	                               
// 	 .M"""bgd mm                   
// 	,MI    "Y MM                   
// 	`MMb.   mmMMmm ,pW"Wq.`7Mb,od8 
// 	  `YMMNq. MM  6W'   `Wb MM' "' 
// 	.     `MM MM  8M     M8 MM     
// 	Mb     dM MM  YA.   ,A9 MM     
// 	P"Ybmmd"  `Mbmo`Ybmd9'.JMML.   
// 	                               
// 	                               
function Stor() {
	var chunks = Object.keys(BASTARD_INDEX),
		n_chunks = chunks.length,
		i,
		written = [],
		n_compressed = 0;
	perf ("Stor");
	for (i=0; i<n_chunks; ++i) {
		var chunk=chunks[i],
			chunkin=BASTARD_INDEX[chunk];
		if (!chunkin) continue;
		if (chunkin.dirty) {
			LOG("storing chunk "+chunk);
			Decompress(chunk);
			//	 GM_setValue(chunkey(chunk), HB.indexVersion + BASTARD_INDEX[chunk].ndx.match(/.(?=\f)/g).join("") + BASTARD_INDEX[chunk].ndx);		
			var trades=chunkin.ndx.split("\f"),
				n=0,
				dates="",
				j,
				k=chunkey(chunk);
			for (j=0; j<1024; ++j) {
				if (chunkin.trade[j] && chunkin.trade[j].length) trades[j]=chunkin.trade[j];
				dates+= trades[j] ? trades[j].substr(-9,1) : " ";
				n += !!trades[j];
			}
			var ndx=trades.join("\f"),
				wt=50 + ndx.length*(chunkin.compressed ? 0.4 : 1); // approx.
			if (weigh_localStorage(wt).pct >= HB.localStorageTargetPctUsed ) { 
				var verlen=HB.indexVersion.length;
				for (var c=0; c<BASTARD_CHUNKS && weigh_localStorage(wt).pct >=HB.localStorageTargetPctUsed; ++c) { 
					var ck=chunkey(c),
					    [ cversion, cn, cdates, cndx ] = deserialize( localStorage.getItem(ck) );
					if (cversion === HB.indexVersion && !isCompressed(cndx)) {
						LOG(`localStorage usage exceeds ${HB.localStorageTargetPctUsed}, compressing chunk ${c}`);
						localStorage.setItem(ck, serialize(cversion, cn, cdates, cndx, true));
						if (BASTARD_INDEX[c]) BASTARD_INDEX[c].compressed=true;
					}
				}
			}
			localStorage.setItem(k, serialize(HB.indexVersion, n, dates, ndx, chunkin.compressed));
			chunkin.ndx=ndx;
			chunkin.dirty=false;
			written.push(chunk);
			n_compressed+=chunkin.compressed;
			//console.log({ n_written, len:trades.join("\f").length, n_compressed });
		}
	}
	index_metastamp(!!written.length);
	perf("Stor", `wrote ${s(written.length, "chunk", "", written.length?" ("+written.toString()+")":"", true)}${s(n_compressed, "compressed", ", ","")}`);
}
function Chunks() {
	var	re=new RegExp(`^HB_${BASTARD_STEAMID}_\\d+$`),
		n_keys=localStorage.length,
		i,
		chunks=[];
	for (i=0; i<n_keys; ++i) if (re.test(localStorage.key(i))) chunks.push(localStorage.key(i));
	return chunks;
}

function page2seq(page) { 
	return 30*(BASTARD_LASTPAGE - page) + ((BASTARD_LASTTRADE % 30) || 30) - 1 ;
}
function seq2page(seq) {
	return Math.ceil( (BASTARD_LASTTRADE - (typeof seq==="number" ? seq : base16k_dec(seq)) )/30);
}
function chunkey(chunk) {
	return /^HB_\d+_\d+$/.test(chunk) ? chunk : "HB_" + BASTARD_STEAMID  + "_" + parseInt(chunk, 10);
}
function metakey() { 
	return "HB_" + BASTARD_STEAMID  + "_meta";
}
function index_dt() { 
	return ( BASTARD_INDEX_T - index_timestamp() ) / 1000;
}
function index_timestamp() { 
	return parseInt( localStorage.getItem(metakey()), 10) || 0;
}
function index_metastamp(set) { 
	if(set) {
		var meta=[ 
			BASTARD_INDEX_T=Date.now(), 
			 "trades:", +BASTARD_LASTTRADE,
			 "indexed:", index_n(), 
			 "lastseq:", BASTARD_SEQ_LAST_INDEXED
		 ];
		localStorage.setItem(metakey(), meta.join("\v") );
		return meta;
	}
	else return (localStorage.getItem(metakey()) || "0\vN_trades:\v0\vN_indexed:\v0").split("\v");
}
// 	  db                  `7MM                                    
// 	                        MM                                    
// 	`7MM  `7MMpMMMb.   ,M""bMM  .gP"Ya `7M'   `MF'.gP"Ya `7Mb,od8 
// 	  MM    MM    MM ,AP    MM ,M'   Yb  `VA ,V' ,M'   Yb  MM' "' 
// 	  MM    MM    MM 8MI    MM 8M""""""    XMX   8M""""""  MM     
// 	  MM    MM    MM `Mb    MM YM.    ,  ,V' VA. YM.    ,  MM     
// 	.JMML..JMML  JMML.`Wbmd"MML.`Mbmmd'.AM.   .MA.`Mbmmd'.JMML.   
// 	                                                              
// 	                                                              
BASTARD_SEQ_LAST_INDEXED=-1;
function indexer() {
	 if (--BASTARD_INDEX_PENDING) return;
	 else if ( BASTARD_FETCHING || (BASTARD_VANITY_UNRESOLVED && performance.now()<30000) ) return defer_indexer(100);
	 perf("indexer");
	 var rows=document.querySelectorAll(HB.qRow + "[data-seq]:not(.indexed)"),
			n_rows=rows.length,
			i,
			dirty=0,
			indexed=[];
	 for (i=0; i<n_rows; ++i) {
			var row=rows[i], 
				seq=Seq(row), 
				chunk=seq>>10, 
				offs=seq & 1023,
				chunkin=BASTARD_INDEX[chunk] || Retr(chunk) && BASTARD_INDEX[chunk],
				cksum= row2cksum(row),
				ssq=cksum.substr(-1),
				reSum=new RegExp ( cksum + '(?=\f|$)' ),
				reSsq=new RegExp ( ssq + '(?=\f|$)' );
			if (chunkin.compressed) Decompress(chunk);
			if (!reSum.test(chunkin.ndx)) { 
				chunkin.trade[offs] = row2ndx(row);
				if (!chunkin.dirty) chunkin.dirty=!!(++dirty);
				if (!reSsq.test(chunkin.ndx)) chunkin.n++;
				BASTARD_SEQ_LAST_INDEXED=seq;
			}
			indexed.push(row);
	 }

	 if (dirty) Stor();
	 var n_indexed=indexed.length;
	 for (i=0; i<n_indexed; ++i) indexed[i].classList.add("indexed");
	 perf("indexer", s(dirty, "dirty chunk", "", " stored", true) );
	 if(!HB.isINVcrawling && !HB.isINVinsideCrawlFrame && BASTARD_THISPAGE===11) download( BASTARD_INDEX, "chunked.json" );
	 if (document.getElementById("HB_index")) index_stats();
}
BASTARD_INDEX_PENDING=0;
function defer_indexer(ms) {
	 BASTARD_INDEX_PENDING++;
	 return setTimeout( indexer, ms || 500 );
}
BASTARD_T0={};
function perf(thing, message) {
	 if (BASTARD_T0[thing]) {
			if (!message) message="";
			if (message!=="discard") LOG( thing + " done in " + Math.round(performance.now() - BASTARD_T0[thing])+ "ms " + message ) ;
			BASTARD_T0[thing]=0;
	 }
	 else BASTARD_T0[thing]=performance.now();
}


// 	                                                                           
// 	                                                            ,,             
// 	                                                          `7MM             
// 	                                                            MM             
// 	`7Mb,od8 ,pW"Wq.`7M'    ,A    `MF'pd*"*b. `7MMpMMMb.   ,M""bMM  `7M'   `MF'
// 	  MM' "'6W'   `Wb VA   ,VAA   ,V (O)   j8   MM    MM ,AP    MM    `VA ,V'  
// 	  MM    8M     M8  VA ,V  VA ,V      ,;j9   MM    MM 8MI    MM      XMX    
// 	  MM    YA.   ,A9   VVV    VVV    ,-='      MM    MM `Mb    MM    ,V' VA.  
// 	.JMML.   `Ybmd9'     W      W    Ammmmmmm .JMML  JMML.`Wbmd"MML..AM.   .MA.
// 	                                                                           
// 	                                                                           
/*
trade record:

FIELD     	CHARS	    RE 				        LITERAL CONTENTS
\x00			1        				        
rec		    	v		/(\x01[^\x02-\x04]*)/	   
giv		    	v		/(\x02[^\x03-\x04]*)/        
\x03			1         
steamname   	1-64	/\x03\S+ ([^\x04]*)/  		                       text
\x04
id64/van		2-33    /\x03(\/?[\w-]+|...) /  	                       3 base16k digits or /vanity_URL
\x06
date		 	1       /(.).{8}\f/             	.substr(-9,1)       1 base16k digit
time         	1       /(.).{7}\f/ 	       	    .substr(-8,1)       1 base16k digit
nrec		 	1		/(.).{6}\f/		       	    .substr(-7,1)       1 base16k digit
ngiv		 	1		/(.).{5}\f/		       	    .substr(-6,1)       1 base16k digit
guid            4       /(....).\f/					.substr(-5,4)       4 base16k digits
chunkoffs	    1		/(.)\f/     	       	    .substr(-1)         1 base16k digit
<FF> 0xC \f 	1		delimiter inserted by Stor() on join		        

item record:
\x01 (rec) or \x02 (giv)
optional 3 base16k itemid 
2 base4096 color (\ue000-\uefff)
optional nˣ
item name
optional \t<color><desc><color><desc>...

*/
function row2ndx(row) {
	var f=row2fields(row),
	    id = steamid_enc( f.url ),
		dt=datetime_enc( f.datetime ),
		ng=base16k_enc(f.given.n),
		nr=base16k_enc(f.received.n),
		r=compactgr(f.received, "\x01"),
		g=compactgr(f.given, "\x02"),
		who=f.who.replace(/[\x00-\x1f]/g,''),
		ssq=Ssq(row),
		ndx=`\x00${r}${g}\x03${who}\x04${id}\x06${dt}${nr}${ng}${f.guid}${ssq}`;
	//console.log({f, ndx});
	return ndx;
}
function row2cksum(row) { 
	return row.getAttribute("data-guid") + base16k_enc( +row.getAttribute("data-seq") & 1023 );
}
function compactgr(o, delim) {
	 var text="",  n_items=o.items.length;
	 for (var i = 0; i < n_items; i++) {
		var item=o.items[i],
			n_descs=item.descriptions.length,
			j;
		text += delim + (item.id && /^\d{9,12}$/.test(item.id.toString()) ? base16k_enc(item.id, 3) : "") + color_enc(item.color) + ((item.n!=="1" ? item.n+"ˣ":"")+item.name).replace(/[\x00-\x08\x0a-\x1f]/g,'');
		if (n_descs) text+="\t";
		for (j=0; j<n_descs; ++j) text+=color_enc(item.colors[j]) + item.descriptions[j].replace(/\s\s+/g, ' ').replace(/[\x00-\x08\x0a-\x1f]/g,'').replace(/^ | $/g,'');
	 }
	 return text;
}

function row2txt(row) {
	 var f=row2fields(row);
	 return `${f.datetime}${f.hold} ${f.who} <${f.url}>${fmtgr(f.received)}\n${fmtgr(f.given)}`;
}
function fmtgr(o) {
	var n = o.n || "no",
		text = "\n______________________________" + n + " item" + (n === 1 ? "" : "s") + " " + o.direction + (n === "no" ? "" : ":") + "\n",
		n_items = o.items.length;
	for (var i = 0; i < n_items; i++) {
		var item = o.items[i];
		text += fixed((item.n === "1" ? "" : item.n + " x "), 9) + item.name;
		if (item.descriptions.length) text += ": " + item.descriptions.join(", ");
		text += "\n" + item.craftweps;
	}
	return text.replace(/\s+$/, '');
}
// 	                                                                                     
// 	                                              ,...,,           ,,        ,,          
// 	                                            .d' ""db         `7MM      `7MM          
// 	                                            dM`                MM        MM          
// 	`7Mb,od8 ,pW"Wq.`7M'    ,A    `MF'pd*"*b.  mMMmm`7MM  .gP"Ya   MM   ,M""bMM  ,pP"Ybd 
// 	  MM' "'6W'   `Wb VA   ,VAA   ,V (O)   j8   MM    MM ,M'   Yb  MM ,AP    MM  8I   `" 
// 	  MM    8M     M8  VA ,V  VA ,V      ,;j9   MM    MM 8M""""""  MM 8MI    MM  `YMMMa. 
// 	  MM    YA.   ,A9   VVV    VVV    ,-='      MM    MM YM.    ,  MM `Mb    MM  L.   I8 
// 	.JMML.   `Ybmd9'     W      W    Ammmmmmm .JMML..JMML.`Mbmmd'.JMML.`Wbmd"MML.M9mmmP' 
// 	                                                                                     
// 	                                                                                     
function row2fields(row) {
	 var
		 datetime = fixed(row.querySelector(":scope .tradehistory_date").textContent.replace(/[^\w ,]/,''), 12) + fixed(row.querySelector(":scope .tradehistory_timestamp").textContent.replace(/[^\d:pam]/g,''), 8),
		 proflink = row.querySelector(":scope " + HB.qProfile),
		 url = proflink.href,
		 who = proflink.textContent.replace(/^\s+|\s+$/g, ''),
		 guid = row.getAttribute("data-guid"),
		 gr={ given:{ direction:"given",n:0, items:[] }, received:{ direction:"received", n:0, items:[] } },
		 directions=Object.keys(gr),
		 n_directions=directions.length,
		 d,
		 hold="",
		 heldendtimet="";
		 
		 if (row.classList.contains("held")) {
		 	var he= row.querySelector(":scope .heldendtime");
		 	hold=" " + he.textContent.replace(/\s\d+:.*/, '');
			heldendtimet=+he.getAttribute("data-timet");
		}

		 for (d=0; d<n_directions; ++d) {
				var direction=directions[d],
					 items = row.querySelectorAll(`:scope .tradehistory_items_${direction} .history_item`),
					 n_items=items.length,
					 group = row.querySelector(`:scope .tradehistory_items_${direction}`);

				gr[direction].n = +(group ? group.getAttribute("data-n") : 0);
				for (var i = 0; i < n_items; i++) {
					 var item=items[i],
						n=qst(".nx", item) || "1",
						craftweps=( item.getAttribute("data-craftweps") || "" ),
						id=( item.getAttribute("data-id") || "" ),
						namespan=item.querySelector(":scope .history_item_name"),
						name=namespan.firstChild.textContent,
						descriptions=[],
						colors=[],
						color=item.getAttribute("data-color") || "inherit"; 

						var alldesc=namespan.querySelector(":scope > .descs");
						if (alldesc) { 
							var descs=alldesc.childNodes,
								n_descs=descs.length,
								j;
							for (j=0; j<n_descs; ++j) { 
								var desc=descs[j];
								if (desc.nodeType === 3 && desc.textContent === ", ") continue;
								descriptions.push( desc.textContent );
								colors.push ( (desc.style && desc.style.color) || "inherit" );
							}
						}
					 gr[direction].items.push( { name, n, descriptions, colors, craftweps, color, id } );
				}
		 }
	return { datetime, proflink, url, who, given:gr.given, received:gr.received, hold, guid, heldendtimet };
}
function Guid(row, id) {
	if (row.getAttribute('data-guid')) return +(row.getAttribute('data-guid'));
	else if (typeof id === "object" && id.hasOwnProperty("id")) id = id.id;
	else if (!id) id = row.querySelector(":scope .history_item").id;
	var classNo = +BASTARD_PROPERTY_MAP[id].id.replace(/\D*\d*$|^\D*/g, '') % 0xffff,
		itemNo = +BASTARD_PROPERTY_MAP[id].id.replace(/.*\D/, ''),
		rgFlag = /_receiveditem\d+$/.test(id) ? 0 : 0x10000000000000;
	return base16k_enc(rgFlag + 0x1000000000 * classNo + itemNo, 4);
}
function Seq(row, id) {
	if (row.getAttribute('data-seq')) return +(row.getAttribute('data-seq'));
	else if (typeof id === "object" && id.hasOwnProperty("id")) id = id.id;
	else if (!id) id = row.querySelector(":scope .history_item").id;
	var match = (id.match(/(\d+)(?!\d|$)/g) || [0, 0]).reverse();
	return BASTARD_LASTTRADE - (BASTARD_FIRSTONPAGE + (+match[0]) + (+(match[1] || 1) - 1) * 30);
}
function Ssq(row,id) {
	 return  base16k_enc( Seq(row,id) & 1023 );
}

function download(data, filename){
		if(!data) {
			console.error('Console.save: No data');
			return;
		}
		if(!filename) filename = 'console.json';
		if(typeof data === "object") data = JSON.stringify(data, undefined, 4);
		var blob = new Blob([data], {type: 'text/json'}),
			e    = document.createEvent('MouseEvents'),
			a    = document.createElement('a');
		a.download = filename;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
		e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
}


/// //
//                                          ,,
//                             mm         `7MM
//                             MM           MM
//   `7M'    ,A    `MF',6"Yb.mmMMmm ,p6"bo  MMpMMMb.
//     VA   ,VAA   ,V 8)   MM  MM  6M'  OO  MM    MM
//      VA ,V  VA ,V   ,pm9MM  MM  8M       MM    MM
//       VVV    VVV   8M   MM  MM  YM.    , MM    MM
//        W      W    `Moo9^Yo.`MbmoYMbmd'.JMML  JMML.
//
// ok so: SCM loads history with XMLHttpRequest, uses the response to build hover boxes, then throws away the non-HTML data it used.
// We need that data to add descriptions, so we hook XHR.open and save response text from interesting (/myhistory|mylistings/) URLs.
// In Firefox, @grant <anything> sandboxes the userscript, making the new XHR.open off-limits to the page that's trying to invoke it.
// To escape the sandbox, we inject the hook in a <script> tag, where it will run in normal context and be visible to the page.
// The injected code can't access HB functions or data (all sandboxed), so it copies responses into BASTARD_XHR_RESPONSE (which it created).
// The hook fires a custom event, BastardXHRComplete.  
// Back inside HB, event listener hears BastardXHRComplete, invokes on_xhr() and reads BASTARD_XHR_RESPONSE to process new responses.
function watch_xhr() {
	injectJS(bastard_xhr_tap);
	document.addEventListener('BastardXHRComplete', on_xhr);
}

function bastard_xhr_tap() {
	BASTARD_XHR_RESPONSE = [];
	var origOpen = XMLHttpRequest.prototype.open,
		event = document.createEvent("MutationEvents");

	event.initEvent("BastardXHRComplete", true, true);

	XMLHttpRequest.prototype.open = function() {
		if (arguments.length >= 2 && /myhistory|mylistings/.test(arguments[1])) {
			var url = arguments[1];
			console.log("loading " + arguments[1]);

			this.addEventListener('readystatechange', function bastard_xhr_complete() {
				BASTARD_XHR_RESPONSE.push(this.responseText);
				document.dispatchEvent(event);
				console.log("loaded " + url);
			});
		}
		origOpen.apply(this, arguments);
	};
}
function on_xhr(event) {
	var n=0;
	while (BASTARD_XHR_RESPONSE.length) {
		var resp=BASTARD_XHR_RESPONSE.shift();
		if (resp && /\}\s*$/.test(resp)) {
			LOG("parsing XHR response of length " + resp.length);
			var json=JSON.parse( resp );
			jQuery.extend(BASTARD_PROPERTY_MAP, propmap("", json.assets, json.hovers));
			BASTARD_PROPERTY_MAP_EXTENDED = true;
			n++;
		}
	}
	setTimeout(glance, 50);
	setTimeout( () => { console.log("xhr"); glance(); dedup() }, 500);
}

function injectJS(func) {
	 E( "script", { type:"text/javascript", t: '(' + func.toString() + ')()', P:document.getElementsByTagName('head')[0] || document.body || document.documentElement } );
}

/// //
//              ,,
//            `7MM
//              MM
//    .P"Ybmmm  MM   ,6"Yb.  `7MMpMMMb.  ,p6"bo   .gP"Ya
//   :MI  I8    MM  8)   MM    MM    MM 6M'  OO  ,M'   Yb
//    WmmmP"    MM   ,pm9MM    MM    MM 8M       8M""""""
//   8M         MM  8M   MM    MM    MM YM.    , YM.    ,
//    YMMMMMb .JMML.`Moo9^Yo..JMML  JMML.YMbmd'   `Mbmmd'
//   6'     dP
//   Ybmmmd'
function glance(scope) {
        // console.log("HB glance() started");
	if (typeof scope !== "string") scope = "";
	describe(scope);
	bptflinks(scope);
	settitle();
        if (/\/inventoryhistory(?!\/)/.test(document.URL)) setTimeout( () => { glance(); dedup(); } , 2000);
}
/// //
//
//
//
//    .P"Ybmmm ,pW"Wq.
//   :MI  I8  6W'   `Wb
//    WmmmP"  8M     M8
//   8M       YA.   ,A9
//    YMMMMMb  `Ybmd9'
//   6'     dP
//   Ybmmmd'
function go() {
        findheld();
        dedup();
	settitle();
        filterrow();
}


// 	                                                        
// 	                                ,,          ,,          
// 	                  mm     mm     db   mm   `7MM          
// 	                  MM     MM          MM     MM          
// 	,pP"Ybd  .gP"Ya mmMMmm mmMMmm `7MM mmMMmm   MM  .gP"Ya  
// 	8I   `" ,M'   Yb  MM     MM     MM   MM     MM ,M'   Yb 
// 	`YMMMa. 8M""""""  MM     MM     MM   MM     MM 8M"""""" 
// 	L.   I8 YM.    ,  MM     MM     MM   MM     MM YM.    , 
// 	M9mmmP'  `Mbmmd'  `Mbmo  `Mbmo.JMML. `Mbmo.JMML.`Mbmmd' 
// 	                                                        
// 	                                                        
function settitle() {
        var thispagelink = document.querySelector('.pagelink_this'),
          thispage = BASTARD_THISPAGE,
          lastpage = BASTARD_HIGHEST_FETCHED_PAGE,
          pagestxt = thispage;
        if (lastpage !== thispage) pagestxt += (lastpage - thispage > 1 ? "-" : "&") + lastpage;
        //console.log( daterange(document.getElementById("mainContents")) )
        if (thispage) document.title = (HB.isINVcrawling?'crawl'+' pg' +pagestxt +':' :'hist') + " " + daterange(document.getElementById("mainContents"));
}


//
//
//   `7MMpdMAo.`7Mb,od8 ,pW"Wq.`7MMpdMAo.`7MMpMMMb.pMMMb.   ,6"Yb. `7MMpdMAo.
//     MM   `Wb  MM' "'6W'   `Wb MM   `Wb  MM    MM    MM  8)   MM   MM   `Wb
//     MM    M8  MM    8M     M8 MM    M8  MM    MM    MM   ,pm9MM   MM    M8
//     MM   ,AP  MM    YA.   ,A9 MM   ,AP  MM    MM    MM  8M   MM   MM   ,AP
//     MMbmmd' .JMML.   `Ybmd9'  MMbmmd' .JMML  JMML  JMML.`Moo9^Yo. MMbmmd'
//     MM                        MM                                  MM
//   .JMML.                    .JMML.                              .JMML.
function propmap(prefix, props, maps) {
	if (typeof maps === "string") maps = [maps];
	var map = {},
		n_maps = maps.length,
		i,
		hit;
	/* jshint -W084 */
	if (typeof props !== "object") return map;
	for (i=0; i<n_maps; ++i) while (hit=HB.rePropMap.exec(maps[i].textContent || maps[i])) if (hit[2] in props) map[prefix + hit[1]] = props[hit[2]][hit[3]][hit[4]];
	return map;
}
/// //
//
//   `7MMF'        .g8""8q.     .g8"""bgd
//     MM        .dP'    `YM. .dP'     `M
//     MM        dM'      `MM dM'       `
//     MM        MM        MM MM
//     MM      , MM.      ,MP MM.    `7MMF'
//     MM     ,M `Mb.    ,dP' `Mb.     MM
//   .JMMmmmmMMM   `"bmmd"'     `"bmmmdPY
//
//
function LOG(msg) {
	console.log(`[t+${(performance.now()/1000).toFixed(2)}s] History Bastard v${GM_info.script.version} page ${BASTARD_THISPAGE || window.location.href.replace(/.*\//,'')}: ${msg}`);
}

/// //
//
//
//
//    ,6"Yb.  .P"Ybmmm .gP"Ya
//   8)   MM :MI  I8  ,M'   Yb
//    ,pm9MM  WmmmP"  8M""""""
//   8M   MM 8M       YM.    ,
//   `Moo9^Yo.YMMMMMb  `Mbmmd'
//           6'     dP
//           Ybmmmd'
// age in hours.  If time omitted, date assumed to be time_t seconds value
function age(date, time) {
	if (!date) return 9e9;
	return ( Date.now()/1000 - (time ? dt2timet(date,time) : +date) ) / 3600;
}

function dt2timet(d, t) { 
	if(!d) return 0;
	if (!/\b20\d\d\b/.test(d)) d += " " + new Date().getFullYear();
	var hmampm = (t || "").match(/(\d+):(\d\d)\s*(p?)/i),
		timet=Math.round(Date.parse(d) / 1000);
	if (!hmampm) return timet;
	var h = +hmampm[1],
		m = +hmampm[2],
		pm = !!hmampm[3];
	h = (h === 12 && !pm) ? 0 : h + 12*(h < 12 && pm);
	return timet + h*3600 + m*60;
}



//   ,pP"Ybd
//   8I   `"
//   `YMMMa.
//   L.   I8
//   M9mmmP'
//
//
function s(n, what, pre, post, regardless) {
	return ((n || regardless) ? (pre ? pre + " " : "") + n + " " + what + (n === 1 ? "" : "s") + (post ? post : " ") : "");
}
/// //
//     ,,                   ,,      ,...
//   `7MM                 `7MM    .d' ""
//     MM                   MM    dM`
//     MMpMMMb.   ,6"Yb.    MM   mMMmm
//     MM    MM  8)   MM    MM    MM
//     MM    MM   ,pm9MM    MM    MM
//     MM    MM  8M   MM    MM    MM
//   .JMML  JMML.`Moo9^Yo..JMML..JMML.
//
//
function half(n) {
	n = Math.round(n * 2) / 2 + 0.0000001;
	var wholes = Math.floor(n);
	var h = Math.round((n - wholes) * 2);
	return (wholes + h ? wholes + (h ? "½" : "") : "");
	//   return (wholes+half ? wholes + [ "", "¼", "½", "¾" ][quarters] : "");
}
/// //
//     ,,
//   `7MM                                                      mm                       mm
//     MM                                                      MM                       MM
//     MMpMMMb.  ,pW"Wq.`7MM  `7MM  `7Mb,od8 ,pP"Ybd  pd*"*b.mmMMmm .gP"Ya `7M'   `MF'mmMMmm
//     MM    MM 6W'   `Wb MM    MM    MM' "' 8I   `" (O)   j8  MM  ,M'   Yb  `VA ,V'    MM
//     MM    MM 8M     M8 MM    MM    MM     `YMMMa.     ,;j9  MM  8M""""""    XMX      MM
//     MM    MM YA.   ,A9 MM    MM    MM     L.   I8  ,-='     MM  YM.    ,  ,V' VA.    MM
//   .JMML  JMML.`Ybmd9'  `Mbod"YML..JMML.   M9mmmP' Ammmmmmm  `Mbmo`Mbmmd'.AM.   .MA.  `Mbmo
//
//
function hours2text(hours, unsigned) {
	var sign = unsigned ? "" : (hours < 0 ? " from now" : " ago");
	hours = Math.abs(hours);
	var minutes=0,
		seconds=0,
		days=0,
		weeks=0;
	if (hours > 960) {
		weeks = half(hours/24/7);
		hours = 0;
	} else if (hours > 30) {
		days = half(hours / 24);
		hours = 0;
	} else if (hours < 1.26) {
		minutes = hours * 60;
		hours = 0;
		if (minutes < 1.6) {
			seconds = Math.round(minutes * 60 / 10) * 10;
			minutes = 0;
			if (seconds < 30) seconds = "";
		} else minutes = Math.round(minutes);
	} else if (hours < 10) hours = half(hours);
	else hours = Math.round(hours);
	return ((s(days, "day") + s(weeks, "week") +  s(hours, "hour") + s(minutes, "minute") + s(seconds, "second")) || "seconds").replace(/\s+$/,'') + sign;
}
/// //
//                             ,,
//                           `7MM                                                          mm
//                             MM                                                          MM
//    .gP"Ya `7MMpMMMb.   ,M""bMM  ,pP"Ybd  ,pW"Wq.   ,pW"Wq.`7MMpMMMb.  .gP"Ya  ,pP"Ybd mmMMmm
//   ,M'   Yb  MM    MM ,AP    MM  8I   `" 6W'   `Wb 6W'   `Wb MM    MM ,M'   Yb 8I   `"   MM
//   8M""""""  MM    MM 8MI    MM  `YMMMa. 8M     M8 8M     M8 MM    MM 8M"""""" `YMMMa.   MM
//   YM.    ,  MM    MM `Mb    MM  L.   I8 YA.   ,A9 YA.   ,A9 MM    MM YM.    , L.   I8   MM
//    `Mbmmd'.JMML  JMML.`Wbmd"MML.M9mmmP'  `Ybmd9'   `Ybmd9'.JMML  JMML.`Mbmmd' M9mmmP'   `Mbmo
//
//
function endsoonest() {
	var soonest = 9e9,
		ends=document.querySelectorAll(".heldendtime"),
		n_ends=ends.length,
		i;
	for (i=0; i<n_ends; ++i) {
		var t = ends[i].getAttribute("data-timet");
		if (t < soonest) soonest = t;
	}
	return n_ends ? hours2text(age(soonest)) : "";
}

/// //
//                                ,,                                                   ,,          ,,
//                              `7MM           mm                                    `7MM   mm     db
//                                MM           MM                                      MM   MM
//   `7MM  `7MM `7MMpdMAo.   ,M""bMM   ,6"Yb.mmMMmm .gP"Ya    .gP"Ya `7MMpMMMb.   ,M""bMM mmMMmm `7MM  `7MMpMMMb.pMMMb.  .gP"Ya  ,pP"Ybd
//     MM    MM   MM   `Wb ,AP    MM  8)   MM  MM  ,M'   Yb  ,M'   Yb  MM    MM ,AP    MM   MM     MM    MM    MM    MM ,M'   Yb 8I   `"
//     MM    MM   MM    M8 8MI    MM   ,pm9MM  MM  8M""""""  8M""""""  MM    MM 8MI    MM   MM     MM    MM    MM    MM 8M"""""" `YMMMa.
//     MM    MM   MM   ,AP `Mb    MM  8M   MM  MM  YM.    ,  YM.    ,  MM    MM `Mb    MM   MM     MM    MM    MM    MM YM.    , L.   I8
//     `Mbod"YML. MMbmmd'   `Wbmd"MML.`Moo9^Yo.`Mbmo`Mbmmd'   `Mbmmd'.JMML  JMML.`Wbmd"MML. `Mbmo.JMML..JMML  JMML  JMML.`Mbmmd' M9mmmP'
//                MM
//              .JMML.                                   mmmmmmm
function update_endtimes() {
	var n = 0,
		c = 0,
		waith = 0.5,
		soonest = -9e9;
	jQuery(".heldendtime").each(function() {
		n++;
		var d = this.getAttribute("data-date"),
			t = this.getAttribute("data-time"),
			timet = +this.getAttribute("data-timet"),
			h = age(timet);
		if (h > soonest) soonest = h;
		if (waith > Math.abs(h) / 60) waith = Math.abs(h) / 60;
		var txt = "— " + (h < 0 ? "on hold until " : "completed ") + d + t + " (" + hours2text(h) + ")";
		if (this.textContent !== txt) {
			if (/^—/.test(this.textContent)) jQuery(this).replaceWith(jQuery(this).clone().removeClass("unchanged").text(txt));
			else this.textContent = txt;
			c++;
		}
	});
	if (waith < 2.5 / 3600) waith = 2.5 / 3600;
	if (n) setTimeout(update_endtimes, Math.round(waith * 3600 * 1000));
	var s = document.getElementById("heldtext_end"),
		soontxt = hours2text(soonest);
	if (s) {
		if (s.textContent && s.textContent !== soontxt) jQuery(s).replaceWith(jQuery(s).clone().removeClass("unchanged").text(soontxt));
		else s.textContent = soontxt;
	}
}

/// //
//
//   `7MM"""YMM
//     MM    `7
//     MM   d
//     MMmmMM
//     MM   Y  ,
//     MM     ,M
//   .JMMmmmmMMM
//
//
function E(type, opt) {
	/* jshint -W030 */
	// t: text
	// c: class
	// h: href
	// P: parent
	// C: child
	// S: sibling (if parent also specified, try sibling first)
	var e = document.createElement(type || "span");
	if (!opt) return e;
	"t" in opt && (e.textContent = opt.t, delete opt.t);
	"c" in opt && (e.className = opt.c, delete opt.c);
	"h" in opt && (e.href = opt.h, delete opt.h);
	"color" in opt && (e.style.color = opt.color, delete opt.color);
	if ("S" in opt) {
		if (typeof opt.S !== "object") opt.S = document.querySelector(opt.S);
		if (opt.S || !("P" in opt)) {
			opt.S.parentElement.insertBefore(e, opt.S);
			delete opt.P;
		}
		delete opt.S;
	}
	if ("P" in opt) {
		if (typeof opt.P !== "object") opt.P = document.querySelector(opt.P);
		opt.P.appendChild(e);
		delete opt.P;
	}
	if ("C" in opt) {
		/* jshint -W084 */
		if (Array.isArray(opt.C)) {
			for (var c = 0, n_children=opt.C.length; c<n_children; ++c) if (typeof opt.C[c] === "object") e.appendChild(opt.C[c]);
		}
		else e.appendChild(opt.C);
		delete opt.C;
	}
	for (var prop in opt) e[prop] = opt[prop];
	return e;
}

/// //
//            ,,                                 ,...,,    ,,
//          `7MM                               .d' ""db  `7MM   mm
//            MM                               dM`         MM   MM
//    ,p6"bo  MM  .gP"Ya   ,6"Yb.  `7Mb,od8   mMMmm`7MM    MM mmMMmm .gP"Ya `7Mb,od8
//   6M'  OO  MM ,M'   Yb 8)   MM    MM' "'    MM    MM    MM   MM  ,M'   Yb  MM' "'
//   8M       MM 8M""""""  ,pm9MM    MM        MM    MM    MM   MM  8M""""""  MM
//   YM.    , MM YM.    , 8M   MM    MM        MM    MM    MM   MM  YM.    ,  MM
//    YMbmd'.JMML.`Mbmmd' `Moo9^Yo..JMML.    .JMML..JMML..JMML. `Mbmo`Mbmmd'.JMML.
//
//                                       mmmmmmm
function clear_filter() {
	document.getElementById("filterbox").value = '';
	document.getElementById("indexresults").textContent = '';
	update_filter_term();
}



// 	                                                                                                                                          
// 	                             ,,                             ,...,,    ,,                                                                  
// 	                           `7MM           mm              .d' ""db  `7MM   mm                      mm                                     
// 	                             MM           MM              dM`         MM   MM                      MM                                     
// 	`7MM  `7MM `7MMpdMAo.   ,M""bMM   ,6"Yb.mmMMmm .gP"Ya    mMMmm`7MM    MM mmMMmm .gP"Ya `7Mb,od8  mmMMmm .gP"Ya `7Mb,od8 `7MMpMMMb.pMMMb.  
// 	  MM    MM   MM   `Wb ,AP    MM  8)   MM  MM  ,M'   Yb    MM    MM    MM   MM  ,M'   Yb  MM' "'    MM  ,M'   Yb  MM' "'   MM    MM    MM  
// 	  MM    MM   MM    M8 8MI    MM   ,pm9MM  MM  8M""""""    MM    MM    MM   MM  8M""""""  MM        MM  8M""""""  MM       MM    MM    MM  
// 	  MM    MM   MM   ,AP `Mb    MM  8M   MM  MM  YM.    ,    MM    MM    MM   MM  YM.    ,  MM        MM  YM.    ,  MM       MM    MM    MM  
// 	  `Mbod"YML. MMbmmd'   `Wbmd"MML.`Moo9^Yo.`Mbmo`Mbmmd'  .JMML..JMML..JMML. `Mbmo`Mbmmd'.JMML.      `Mbmo`Mbmmd'.JMML.   .JMML  JMML  JMML.
// 	             MM                                                                                                                           
// 	           .JMML.                                   mmmmmmm                                  mmmmmmm                                      

var BASTARD_HIGHLIGHT_RE_ROWS=[],
	BASTARD_HIGHLIGHT_PENDING=0;

function update_filter_term(event) {
	/* jshint -W084 */
	clear_highlights();
	var rows = document.querySelectorAll(HB.qRow + (HB.isINV ? ", #indexresults > .index_result" : "")),
		filt = fast_filter(rows);
	// have to do it like this because execution order of deferred highlights is not guaranteed.  If we pass them, a stale set could run last.
	BASTARD_HIGHLIGHT_RE_ROWS = [filt.reOr, filt.matching_rows];
	BASTARD_HIGHLIGHT_PENDING++;
	setTimeout(deferred_highlight_new_term, 200);
	BASTARD_PENDING_LOOKUPS++;
	// console.log(filt);
	var pages = document.querySelectorAll(".pagelink"),
		n_pages = pages.length,
		anchor = filt.empty ? "" : "#filter-" + filt.raw,
		i;
	for (i = 0; i < n_pages; ++i) pages[i].href = pages[i].href.replace(/(#.*)?$/, anchor);
	if (anchor || /#filter-.+/.test(window.location.href)) window.location.href = window.location.href.replace(/(#.*)?$/, anchor || "#");
	update_filter_count();
}
function update_filter_count() { 
	var	ct=document.getElementById("filterct"),		
		n_shown=document.querySelectorAll(HB.qRow+":not(.filtered):not(.hidden)").length,
		box=document.getElementById("indexresults"),
		cti=document.getElementById("indexresultct"),		
		n_ishown=box.querySelectorAll(":scope > .index_result:not(.filtered):not(.hidden)").length,
		search=BASTARD_SEARCH,
		n_results=search.results.length,
		more=search.more,
		empty = !/\S/.test( document.getElementById("filterbox").value ),
		nextstep=(!search.more && n_results < search.n_wanted*10) ?  n_results :  search.n_wanted*10,
		butshow=box.classList.contains("hidden") ? " hidden":"",
		n_indexed=index_n(),
		meta=index_metastamp(),
		meta_n_trades=+meta[2],
		n_trades = BASTARD_LASTTRADE > meta_n_trades ? BASTARD_LASTTRADE : meta_n_trades,
		pct_indexed=(Math.round(n_indexed / n_trades * 1000)/10).toFixed(1);
	ct.textContent = empty ? "" : s(n_shown, "matching " + (HB.isSCM ? "row" : "trade"), "", (HB.isINV ? " here":""), true);

	console.log({n_ishown});
	if (search.query) { 
		if (n_results) cti.textContent=`and ${more?"at least ":""} ${n_results} indexed ` + (n_ishown<n_results ? `(showing ${n_ishown}) ` : "");
		else cti.textContent="and no indexed results ";
		if (n_indexed !== n_trades) E("a", {h:"#History Bastard Dashboard", onclick:toggle_info, t:`index only ${pct_indexed}% complete`, P:cti});
		if (n_ishown) E( "a", { onclick:toggle_indexed_visible, c:"lookup sm round toggle btn"+butshow, title:"Toggle display of indexed results", P:cti });
	}
	else cti.textContent='';
}


var BASTARD_PENDING_LOOKUPS = 0;

function t2hle(t, re) { 
	var match = t.match(re);
	return match ? 
		E("", { c: "contains_highlight", C: [ document.createTextNode(match[1]), E("",{c:"highlight", t:match[2]}), t2hle(match[3],re) ]})
		: document.createTextNode(t);
}
/// //
//     ,,          ,,            ,,          ,,    ,,            ,,
//   `7MM          db          `7MM        `7MM    db          `7MM        mm
//     MM                        MM          MM                  MM        MM
//     MMpMMMb.  `7MM  .P"Ybmmm  MMpMMMb.    MM  `7MM  .P"Ybmmm  MMpMMMb.mmMMmm
//     MM    MM    MM :MI  I8    MM    MM    MM    MM :MI  I8    MM    MM  MM
//     MM    MM    MM  WmmmP"    MM    MM    MM    MM  WmmmP"    MM    MM  MM
//     MM    MM    MM 8M         MM    MM    MM    MM 8M         MM    MM  MM
//   .JMML  JMML..JMML.YMMMMMb .JMML  JMML..JMML..JMML.YMMMMMb .JMML  JMML.`Mbmo
//                    6'     dP                       6'     dP
//                    Ybmmmd'                         Ybmmmd'
function highlight(node, re, found) {
	if (node && re.test(node.textContent)) {
		var root = node;
		node = node.firstChild;
		while (node) {
			var t=node.textContent;
			if (node.nodeType === 3 && re.test(t)) {
				var hle = t2hle( t, re);
				node.parentElement.replaceChild(hle, node);
				node = hle;
				found = true;
			} else if (node.nodeType === 1 && re.test(t)) {
				if (highlight(node, re, found)) found = true;
			}
			node = node.nextSibling;
		}

		if (!found) {
			root.classList.add("loose_highlight");
			return true;
		}
	}
	return found;
}
function deferred_highlight_new_term() {
	if (--BASTARD_HIGHLIGHT_PENDING || !BASTARD_HIGHLIGHT_RE_ROWS.length) return;
	for (var i = 0, n_rows = BASTARD_HIGHLIGHT_RE_ROWS[1].length; i < n_rows; ++i) highlight(BASTARD_HIGHLIGHT_RE_ROWS[1][i], BASTARD_HIGHLIGHT_RE_ROWS[0]);
	BASTARD_HIGHLIGHT_RE_ROWS = [];
}
	
function highlight_new_rows(rows) {
	if (typeof rows === "string") rows=document.querySelectorAll(rows);
	var filt=fast_filter(rows);
	if (filt.empty) return;
	for (var i=0, n_rows=filt.matching_rows.length; i<n_rows; ++i) highlight(filt.matching_rows[i], filt.reOr);
	update_filter_count();
}
function clear_highlights() {
	var highlit = document.querySelectorAll(`.contains_highlight`),
		n_highlit = highlit.length,
		loose = document.querySelectorAll(".loose_highlight"),
		n_loose = loose.length,
		i;

	for (i = 0; i < n_loose; ++i) loose[i].classList.remove("loose_highlight");
	for (i = 0; i < n_highlit; ++i) {
		var h = highlit[i];
		h.parentElement.insertBefore(document.createTextNode(h.textContent), h);
		h.parentElement.removeChild(h);
	}
}
function fast_filter(rows) { 
	var n = 0,
		raw = document.getElementById("filterbox").value.replace(/\s+$/,'').replace(/[\x00-\x1f\s]+/g, ' '),
		itemid="",
		steamid="",
		terms=qtrim(raw),
		empty=!/\S/.test(terms);

	if (/\b76561\d{12}\b/.test(raw)) { 
		steamid="/profiles/" + terms.replace(/.*(76561\d{12}).*/,'$1');
		terms=terms.replace(/\S*76561\d{12}\S*/,'');
	}
	if (/(^| )\d{9,12}( |$)/.test(raw)) { 
		itemid=terms.replace(/.*?( |^)(\d{9,12})( |$).*/,'$2');
		terms=terms.replace(/ *\d{9,12} */,' ');
	}
	terms=terms.replace(/ +$/,'');
	var reTerm = qesc(qtrim(terms)),
		reTerms = reTerm.split(/\s+/).filter(function(t) { return t.length; }),
		reOr = new RegExp("^([\\s\\S]*?)" + '(' + (reTerms.join("|") || ".") + ')' + "([\\s\\S]*)", 'i'),
		reAnd = new RegExp( "^" + reTerms.map(function(t) { return '(?=[\\s\\S]*' + t + ')'; }).join(''), 'i'),
		n_rows=rows.length,
		xs = document.getElementsByClassName("filterX"),
		n_xs=xs.length,
		matching_rows=[],
		evenodd=["even","odd"],
		i;
console.log({reOr, reAnd, reTerms});
	for (i=0; i<n_rows; ++i) {
		var elem, row=rows[i];
		if (
			empty
			||
			(reTerm && reAnd.test(row.textContent))
			|| 
			(itemid && (elem=row.querySelector(`:scope .history_item[data-id='${itemid}']`)))
			|| 
			(steamid && (elem=row.querySelector(`:scope a[href$='${steamid}']:not(.index_page)`))) 
		) {
			row.classList.remove("filtered", ...evenodd);
			if (elem) elem.classList.add("loose_highlight");
			else if (!empty) {
				matching_rows.push(row);
			}
			if (!row.classList.contains("hidden")) row.classList.add(evenodd[ n++ % 2 ]);
		} else {
			row.classList.add("filtered");
		}
	}
	for (i=0; i<n_xs; ++i) {
		if (empty) xs[i].classList.remove("active");
		else xs[i].classList.add("active");
	}

	return { reOr, reAnd, matching_rows, empty, raw, reTerm };
}



/// //
//       ,...,,    ,,
//     .d' ""db  `7MM   mm
//     dM`         MM   MM
//    mMMmm`7MM    MM mmMMmm .gP"Ya `7Mb,od8 `7Mb,od8 ,pW"Wq.`7M'    ,A    `MF'
//     MM    MM    MM   MM  ,M'   Yb  MM' "'   MM' "'6W'   `Wb VA   ,VAA   ,V
//     MM    MM    MM   MM  8M""""""  MM       MM    8M     M8  VA ,V  VA ,V
//     MM    MM    MM   MM  YM.    ,  MM       MM    YA.   ,A9   VVV    VVV
//   .JMML..JMML..JMML. `Mbmo`Mbmmd'.JMML.   .JMML.   `Ybmd9'     W      W
//
//
function filterrow() {
	var box;
	if (HB.isSCMlisting && document.querySelector(".market_commodity_explanation")) return; // nothing to filter on a commodity
        if (document.getElementById("filterbox")) return;
	E("span", {
		c: "filterrow",
		C: [
				 box = E("input", { id: "filterbox", placeholder: HB.isINV ? "keyword, steamID, date, itemID": "Filter by keyword" }),
				 E("", { c: "filterX", onclick: clear_filter }),
				 E("", { id: "filterct" }),
				 E("", { id: "indexresultct" }),
				 E("div", { id: "indexresults" })
		],
		S: HB.qFilterSibling,
		P: HB.qFilterParent
	});
	box.addEventListener('input', update_filter_term);
	var match = window.location.href.match(/#filter-(.*)$/);
	if (match) {
		box.value = match[1];
		update_filter_term();
	}
	setTimeout(function() {
		box.focus();
	}, 50);
}

function toggle_info() { 
	var info=document.getElementById("HB_info");
	if (info) info.classList.toggle("hidden");
	else { 
		info=E("div", { id:"HB_info", S:document.getElementById("mainContents"), c:HB.isINVcrawling ?"shown":"hidden", C:[
			index_stats(),
			localStorage_explorer(),
			// options_dialog(),
			E("a", {h:"#", c:"info_close sm round toggle btn", onclick:toggle_info })
		]});
		if (!HB.isINVcrawling) setTimeout( toggle_info, 0 );
	}
	info.style.maxHeight=(info.scrollHeight+200)+'px';

	return false;
}
/// //
//          ,,                 ,,
//        `7MM               `7MM
//          MM                 MM
//     ,M""bMM  .gP"Ya    ,M""bMM `7MM  `7MM `7MMpdMAo.
//   ,AP    MM ,M'   Yb ,AP    MM   MM    MM   MM   `Wb
//   8MI    MM 8M"""""" 8MI    MM   MM    MM   MM    M8
//   `Mb    MM YM.    , `Mb    MM   MM    MM   MM   ,AP
//    `Wbmd"MML.`Mbmmd'  `Wbmd"MML. `Mbod"YML. MMbmmd'
//                                             MM
//                                           .JMML.
function dedup() {
	var Metal = "\x00 1 Metal",
		Craftwep = "\x00 2 Craftwep",
		prioritySort = new Map([
			[ "Mann Co. Supply Crate Key", "\x00 0 Key" ],
			[ "Refined Metal", Metal ],
			[ "Reclaimed Metal", Metal ],
			[ "Scrap Metal", Metal ]
		]),
		metalValue = new Map([
			[ "Refined Metal",   9 ],
			[ "Reclaimed Metal", 3 ],
			[ "Scrap Metal",     1 ]
		]),
		rows = document.querySelectorAll(".tradehistory_items:not(.deduped), #heldrow .tradehistory_items:not(.deduped)"),
		n_rows = rows.length,
		i;
	for (i=0; i<n_rows; ++i) { 
		var row=rows[i],
			items = row.getElementsByClassName("history_item"),
			n_items=items.length,
			sorted = row.cloneNode(false),
			map = {},
			count = {},
			bestmetal = 0,
			craftweps = [],
			j;
		sorted.setAttribute("data-n", n_items);
                sorted.classList.add("deduped");
                // console.log({row});
		for (j=0; j<n_items; ++j) { 
			var item=items[j],
				txt=item.textContent,
				sortkey;
			if (item.getAttribute("data-is-craftwep")) {
				sortkey=Craftwep;
				craftweps.push(txt);
			} else {
				sortkey=prioritySort.get(txt) || (item.getAttribute("data-color") + txt);
			}

			if (sortkey === Metal) {
				var mv=metalValue.get(txt);
				count[Metal] = mv + (count[Metal] || 0);
				if (mv > bestmetal) {
					bestmetal=mv;
					map[Metal]=item;
				}
			} else {
				if (!count[sortkey]) {
					map[sortkey]=item;
					count[sortkey]=0;
				}
				count[sortkey]++;
			}
		}

		if (count[Craftwep]) dedup_craftweps(craftweps, map[Craftwep]);
		var keys=Object.keys(map).sort(),
			n_keys=keys.length;
		for (j=0; j<n_keys; ++j) { 
			var k = keys[j],
				e = map[k],
				n = count[k];
			if (k === Metal) {
				e.querySelector(":scope .history_item_name").textContent = "Metal";
				e.insertBefore(nx(scrap2ref(n), "metal"), e.firstChild);
			} 
			else if (n > 1) e.insertBefore(nx(n), e.firstChild);
			else e.classList.add("one");
			sorted.appendChild(e);
		}
		row.parentNode.replaceChild(sorted, row);
	}
}
function dedup_craftweps(weps, e) {
	weps.sort();
	var lastuniq = "",
		n_of_wep = {},
		nweps=weps.length;
	for (var w=0; w<nweps; ++w) {
		var wep = weps[w];
		if (wep in n_of_wep) {
			weps[lastuniq] = fixed(++n_of_wep[wep] + "x ", 14) + wep.replace(/^\s+/, '');
			weps[w] = "";
		} else {
			lastuniq = w;
			n_of_wep[wep] = 1;
			weps[w] = fixed("", 14) + wep;
		}
	}
	weps = weps.filter(function(wep) {
		return wep.length;
	});
	var desc = document.createElement("span");
	desc.className = "descs";
	var manifest = "";
	if (nweps > 3) {
		desc.appendChild(document.createTextNode(scrap2ref(nweps / 2) + " smelt value"));
		manifest = weps.join("\n") + "\n";
	} else {
		desc.appendChild(document.createTextNode(weps.join(", ")));
	}
	e.setAttribute("data-craftweps", manifest);
	var name = e.querySelector(":scope .history_item_name");
	name.textContent = "Craftable weapon";
	name.appendChild(desc);
}
function scrap2ref(scrap) {
	return Math.round(scrap / 9 * 10000).toString().replace(/(\d\d)\d\d$/, '.$1');
}
function fixed(t, w, p) {
	var pad = w - t.toString().length;
	return (p || " ").repeat(pad > 0 ? pad : 0) + t;
}
function nx(n, cl) {
	var span = document.createElement("span");
	span.className = "nx " + (typeof cl === "string" ? cl : "");
	span.textContent = n;
	return span;
}

/// //
//    ,,                           ,...  ,,    ,,
//   *MM                  mm     .d' ""`7MM    db              `7MM
//    MM                  MM     dM`     MM                      MM
//    MM,dMMb.`7MMpdMAo.mmMMmm  mMMmm    MM  `7MM  `7MMpMMMb.    MM  ,MP',pP"Ybd
//    MM    `Mb MM   `Wb  MM     MM      MM    MM    MM    MM    MM ;Y   8I   `"
//    MM     M8 MM    M8  MM     MM      MM    MM    MM    MM    MM;Mm   `YMMMa.
//    MM.   ,M9 MM   ,AP  MM     MM      MM    MM    MM    MM    MM `Mb. L.   I8
//    P^YbmdP'  MMbmmd'   `Mbmo.JMML.  .JMML..JMML..JMML  JMML..JMML. YA.M9mmmP'
//              MM
//            .JMML.
function bptflinks(scope) {
	// perf("bptflinks " + scope);
	var done='bptflinked',
			rows = document.querySelectorAll(`${scope}${HB.qRow}:not(.${done})`),
		n_rows=rows.length;

	for (var i=0; i<n_rows; ++i) {
		var row=rows[i],
				 a=row.querySelector(":scope " + HB.qProfile),
				 item, steamid, path;
			if (!a || !a.href || !(path=(a.href.match(/(\/profiles\/\d+|\/id\/[-\w]+)$/) || ["", ""])[1])) continue;
			if (/^\/id/.test(path)) {
				 if (item=row.querySelector(':scope .tradehistory_items_given > .history_item[data-owner]')) path=a.href="/profiles/"+item.getAttribute("data-owner");
				 else vanityurl2steamid(a);
			}
		E("a", {
			c: 'bptf',
			h: 'https://backpack.tf' + path,
			S: a.nextElementSibling,
			P: a.parentElement
		});
		row.classList.add(done);
	}
	// perf("bptflinks " + scope);
}
/// //
//          ,,                                     ,,  ,,
//        `7MM                                     db *MM
//          MM                                         MM
//     ,M""bMM  .gP"Ya  ,pP"Ybd  ,p6"bo `7Mb,od8 `7MM  MM,dMMb.   .gP"Ya
//   ,AP    MM ,M'   Yb 8I   `" 6M'  OO   MM' "'   MM  MM    `Mb ,M'   Yb
//   8MI    MM 8M"""""" `YMMMa. 8M        MM       MM  MM     M8 8M""""""
//   `Mb    MM YM.    , L.   I8 YM.    ,  MM       MM  MM.   ,M9 YM.    ,
//    `Wbmd"MML.`Mbmmd' M9mmmP'  YMbmd' .JMML.   .JMML.P^YbmdP'   `Mbmmd'
//
//
function describe(scope) {
	// perf("describe " + (scope || ""));
	var areCraftweps = new Set( HB.Craftweps ),
		areIndescribable = new Set( HB.IndescribableExact );
	//console.log(scope);
	var reLevel = /^(?:Limited )?Level (0|1|7|42|69|99|100) (?!Tool$|Special Taunt$|Craft Item$|Ticket$)\S.*$/,
		reWear = /\s*\((Battle Scarred|Factory New|Minimal Wear|Field-Tested|Well-Worn)\)$/,
		items = document.querySelectorAll(scope + " " + HB.qItem + ":not(.described)"),
		n_items = items.length,
		color_unique="7D6D00",
		appid_unique=440;
	/* jshint -W084 */
	for (var i = 0; i < n_items; i++) {
		var item = items[i],
			inv = BASTARD_PROPERTY_MAP[item.id],
			isCraftwep = false;
		if ((typeof inv !== "object") || !inv.name) continue;
		item.classList.add("described");
		if (typeof inv.owner === "string" && inv.owner !== BASTARD_STEAMID) item.setAttribute("data-owner", inv.owner);
		if (typeof inv.name_color === "string") item.setAttribute("data-color", inv.name_color);
		if (HB.isSCM && inv.market_hash_name && inv.appid) link_relative(item, HB.qIcon, "/market/listings/" + inv.appid + "/" + inv.market_hash_name, "bastard_scmlink");
		if (areIndescribable.has(inv.name) || HB.reIndescribable.test(inv.name) || HB.reIndescribableType.test(inv.type)) continue;
if (inv.name ===   "AWP | Fever Dream") console.log(inv);

if (inv.name ===   "Unusual Pugilist's Protector") console.log(inv);
		var namespan = item.querySelector(":scope > " + HB.qItemName) || item,
			descs = E("", { c: "descs" });
		if (inv.market_hash_name && (
				(namespan.textContent.substr(0, 2) === "''" && descs.appendChild(document.createTextNode(namespan.textContent))) //renamed
				|| (HB.canonicalizeAppids.indexOf(+inv.appid) > -1 && inv.name !== inv.market_hash_name)
			)) namespan.textContent = inv.market_hash_name;
		else if (inv.name_color && inv.name_color === color_unique && inv.appid && inv.appid === appid_unique &&  areCraftweps.has(inv.name)) isCraftwep = true; // might be falsified later, if descs appear

		if (reWear.test(namespan.textContent)) namespan.textContent = namespan.textContent.replace(reWear, '');
		if (!isCraftwep && reLevel.test(inv.type)) {
			if (descs.textContent) descs.appendChild(document.createTextNode(", "));
			E("", { c: "desc", t: inv.type.replace(reLevel, 'lv$1'), P: descs });
		}
		for (var j = 0, description; inv.descriptions && (description = inv.descriptions[j]); j++) {
			var match;
			if (description.value && (match = description.value.replace(/^\s+|\s+$/g, '').match(HB.reProp))) {
				var color = "",
					text = match.slice(1).join("").replace(/^\s+|\s+$/g, '');
				if (description.value.substr(0, 9) === "Halloween") color = '#f92';
				else if (text === 'NonCraft') color = '#c55';
				else if ("color" in description) color = "#" + description.color;
				if (descs.textContent) descs.appendChild(document.createTextNode(", "));
				E("", { c: "desc", t: text, color: color, P: descs });
			}
		}
		if (HB.isINV && inv.id) item.setAttribute("data-id", inv.id);

		if (descs.textContent) namespan.appendChild(descs);
		else if (isCraftwep) item.setAttribute("data-is-craftwep", 1);
	}
	// perf("describe " + (scope || ""), "end");
}

BASTARD_VANITY_STEAMID_MAP={};
BASTARD_VANITY_UNRESOLVED=0;
function vanityurl2steamid(a) {
	/* jshint -W093 */
	var van=typeof a === "string" ? a : (a.href.match(/(\/id\/[\w-]+)$/) || ["", ""])[1],
		http=window.location.protocol === "http:",
		suffix="/" + ( http ? "?xml=1" : "" ),
		re= ( http ?   	/^<.?xml[^>]+>\s*<profile>\s*<steamID64>(76561\d{12})</i  :
						/<script(?: type="text\/javascript")?>\s*g_rgProfileData ?= ?{"url":"[^"]+","steamid":"(76561\d{12})"/
			);

	if (!van) return;
	if (!BASTARD_VANITY_STEAMID_MAP[van]) BASTARD_VANITY_STEAMID_MAP[van]=[ a ];
	else return BASTARD_VANITY_STEAMID_MAP[van].push(a);
	BASTARD_VANITY_UNRESOLVED++;
	perf(`resolve ${fixed(van,36)}`);
	setTimeout(function() { 
		var r = new XMLHttpRequest();
		r.open("GET", van + suffix, true);
		r.onreadystatechange = f_vanityResponse(van,r,re);
		r.send(null);
	}, 20);
	 // steam redirects https:...?xml=1 to http, so just fetch http directly
	 //	 GM_xmlhttpRequest({ method:"GET", url:"http://"+window.location.host+van+"/?xml=1", onload:vanityOnReady(a,van,t0) });
}
function f_vanityResponse(van,r,re) {
 return function vanityResponse() {
 	if (r.readyState===4 && r.status!==200) console.log({ readyState:r.readyState, status:r.status, van });
		if (r.readyState !== 4 || r.status !== 200 || !r.responseText) return;
		var id=(r.responseText.match(re) || ["", ""])[1];
		if (!id) {
			if (performance.now() < 30000) setTimeout( function vanityRetry() { vanityurl2steamid(van); BASTARD_VANITY_UNRESOLVED--; }, 1000 );
			perf(`resolved ${van}`,  " UNSUCCESSFULLY" + s(BASTARD_VANITY_UNRESOLVED, "more name", "-", " to resolve", true));
			return;
		} else { 
		var av=BASTARD_VANITY_STEAMID_MAP[van],
			n_av=av.length,
			i;
		for (i=0; i<n_av; ++i) av[i].href="/profiles/" + id;
		BASTARD_VANITY_UNRESOLVED--;
		perf(`resolve ${fixed(van,36)}`, s(n_av, "place", "to " + id + " in") + s(BASTARD_VANITY_UNRESOLVED, "more name", "-", " to resolve", true));
	}
 };
}
function link_relative(parent, selector, url, className) {
	/* jshint -W084 */
	var e,
		done = "data-" + className + "ed";
	if (parent.getAttribute(done)) return;
	var ancestor = parent;
	while ((ancestor = ancestor.parentElement) && !(e = ancestor.querySelector(":scope " + selector))) {}
	if (e && !e.getAttribute(done)) {
		E("a", {	c:className, h:url, S:e, C:e  });
		parent.setAttribute(done, 1);
		e.setAttribute(done, 1);
	}
}

/// //
//                                   ,,                                                              ,,    ,,
//     mm                       mm  *MM                   mm     .g8""8q.                .g8"""bgd `7MM    db        `7MM
//     MM                       MM   MM                   MM   .dP'    `YM.            .dP'     `M   MM                MM
//   mmMMmm .gP"Ya `7M'   `MF'mmMMmm MM,dMMb.`7MM  `7MM mmMMmm dM'      `MM `7MMpMMMb. dM'       `   MM  `7MM  ,p6"bo  MM  ,MP'
//     MM  ,M'   Yb  `VA ,V'    MM   MM    `Mb MM    MM   MM   MM        MM   MM    MM MM            MM    MM 6M'  OO  MM ;Y
//     MM  8M""""""    XMX      MM   MM     M8 MM    MM   MM   MM.      ,MP   MM    MM MM.           MM    MM 8M       MM;Mm
//     MM  YM.    ,  ,V' VA.    MM   MM.   ,M9 MM    MM   MM   `Mb.    ,dP'   MM    MM `Mb.     ,'   MM    MM YM.    , MM `Mb.
//     `Mbmo`Mbmmd'.AM.   .MA.  `MbmoP^YbmdP'  `Mbod"YML. `Mbmo  `"bmmd"'   .JMML  JMML. `"bmmmd'  .JMML..JMML.YMbmd'.JMML. YA.
//
//
function textbutOnClick() {
	var row = this.parentNode.parentNode.parentNode;
	var textpop = row.querySelector(":scope .textpop");
	if (row.querySelector(":scope .textpop.open")) {
		row.querySelector(":scope .textpop.open").className = "textpop closed";
		this.classList.add("hidden");
	} else if (row.querySelector(":scope .textpop.closed")) {
		row.querySelector(":scope .textpop.closed").className = "textpop open";
		this.classList.remove("hidden");
	} else {
			var textarea;
			this.classList.remove("hidden");
			E( "div", {
				 c:"textpop open",
				 C: [
					(textarea=E( "textarea", { c:"textpop_content", value:row2txt(row) } )),
					E( "a", {title:"close text log", h:"#", c:"X_close", onclick:closebutOnClick} )
				 ],
				 P:this.parentNode
			});
		textarea.style.height = (textarea.scrollHeight-12) + "px";
			textarea.select();
			textarea.focus();
	}
	return false;
}
function closebutOnClick(e) {
	 this.parentNode.className="textpop closed";
	 var btn=this.parentNode.parentNode.querySelector(":scope .text.btn");
	 btn.classList.add("hidden");
	 return false;
}

function qst(s, p) {
	 var e=(p||document).querySelector( (p?":scope ":"") + s);
	 return e ? e.textContent : "";
}
function textbuts(scope) {
	var rows = scope ? document.querySelectorAll(scope + " .tradehistory_event_description") : document.getElementsByClassName("tradehistory_event_description"),
		n = rows.length;
	for (var i = 0; i < n; ++i) {
		E("a", {
			title: "See a text log of this trade",
			h: "#",
			c: "text hidden sm round toggle btn",
			onclick: textbutOnClick,
			S: rows[i].firstChild
		});
	}
}


/// //
//                                  ,,
//                                  db                       mm
//                                                           MM
//   `7MMpdMAo.  ,6"Yb.  .P"Ybmmm `7MM  `7MMpMMMb.   ,6"Yb.mmMMmm .gP"Ya
//     MM   `Wb 8)   MM :MI  I8     MM    MM    MM  8)   MM  MM  ,M'   Yb
//     MM    M8  ,pm9MM  WmmmP"     MM    MM    MM   ,pm9MM  MM  8M""""""
//     MM   ,AP 8M   MM 8M          MM    MM    MM  8M   MM  MM  YM.    ,
//     MMbmmd'  `Moo9^Yo.YMMMMMb  .JMML..JMML  JMML.`Moo9^Yo.`Mbmo`Mbmmd'
//     MM               6'     dP
//   .JMML.             Ybmmmd'
function paginate() {
	/* jshint -W120 */
	Retr();
	var horizon = 4,
		pagelinks = document.getElementsByClassName("pagelink"),
		thispage = BASTARD_THISPAGE,
		phtml = "<div class=pagination>",
		last = -1;
	if (!pagelinks.length) return;
	BASTARD_LASTPAGE = a2pg(pagelinks[pagelinks.length - 1]);
	if (thispage > BASTARD_LASTPAGE) BASTARD_LASTPAGE = thispage;
	BASTARD_FETCHED = 0;
	if (thispage <= horizon) horizon *= 6;
	else if (thispage <= horizon * 2) horizon *= 4;

	for (var i = 1; i <= BASTARD_LASTPAGE; i++) {
		var distance = Math.abs(thispage - i),
			direction = Math.sign(thispage - i),
			interval = 10 * (1 + Math.floor((distance - horizon) / 10)),
			jump = interval - (i % interval) - 1;
		if (i < thispage) jump = Math.floor(jump / 2);
		phtml+=pagerhtml(i, distance);
		if (i + jump > thispage - horizon - 1 && i + jump < thispage + horizon) jump = 0;
		if (i >= horizon && distance > horizon && jump > 0 && i < BASTARD_LASTPAGE) {
			//console.log( [ i, distance, interval, jump ]);
			i += jump;
			if (i > BASTARD_LASTPAGE - 1) i = BASTARD_LASTPAGE - 1;
		}
	}
	 phtml+=`<a class="pagebtn pagelink ${thispage>=BASTARD_LASTPAGE ? 'disabled':''}" href="?p=${thispage+1}">&gt;</a></div>`;
	 var targets=document.querySelectorAll(".inventory_history_pagingrow .inventory_history_nextbtn");
	 for (var t=0, target; target=targets[t]; ++t) target.innerHTML=phtml;
}

function a2pg(a) {
	return +((a.href.match(/[?&]after_time=(\d+)/) || [1, 1])[1]);
}

function pagerhtml(n, distance) {
	var title =  distance ? page2daterange(n) : daterange(document.getElementById("mainContents"), 30);
	var className = 'pagelink pagelink' + n + (distance ? "" : " pagelink_this") + (title === 'empty' ? " pagelink_empty" : (title.length ? " pagelink_dated" : "")),
		opacity = 1 - 0.8 * Math.log(distance) / Math.log(BASTARD_LASTPAGE),
		hover = title ? `<span class="hoverpagedate">${title}</span>` : "";
	return `<a class="${className}" href="?p=${n}" title="${title}" data-pageno="${n}" style="opacity: ${opacity};">${n} ${hover}</a>`;
}

function page2daterange(n, old) { 
	if (!old) old=n;
	var hi_seq=page2seq(n),
		lo_seq=(old===BASTARD_LASTPAGE) ? 1 : page2seq(old)-29,
		hi_chunk=hi_seq >> 10,
		lo_chunk=lo_seq >> 10,
		hi_off=hi_seq & 1023,
		lo_off=lo_seq & 1023,
		hi_date=BASTARD_DATES[hi_chunk] && BASTARD_DATES[hi_chunk][hi_off] && date_dec( BASTARD_DATES[hi_chunk][hi_off] ) || "",
		lo_date=BASTARD_DATES[lo_chunk] && BASTARD_DATES[lo_chunk][lo_off] && date_dec( BASTARD_DATES[lo_chunk][lo_off] ) || "",
		range=lo_date + (lo_date && hi_date && "-") + hi_date;    
	return range.replace(/, (\d{4})(-.*, \1)/, '$2').replace(/ +([A-Z][a-z][a-z])(-\d+ +\1)/, '$2').replace(/^(\d+)-(\1\s)/, '$2');
}
/// //
//          ,,
//        `7MM           mm
//          MM           MM
//     ,M""bMM   ,6"Yb.mmMMmm .gP"Ya `7Mb,od8 ,6"Yb.  `7MMpMMMb.  .P"Ybmmm .gP"Ya
//   ,AP    MM  8)   MM  MM  ,M'   Yb  MM' "'8)   MM    MM    MM :MI  I8  ,M'   Yb
//   8MI    MM   ,pm9MM  MM  8M""""""  MM     ,pm9MM    MM    MM  WmmmP"  8M""""""
//   `Mb    MM  8M   MM  MM  YM.    ,  MM    8M   MM    MM    MM 8M       YM.    ,
//    `Wbmd"MML.`Moo9^Yo.`Mbmo`Mbmmd'.JMML.  `Moo9^Yo..JMML  JMML.YMMMMMb  `Mbmmd'
//                                                               6'     dP
//                                                               Ybmmmd'
function daterange(e, max) {
	var first, last;
	if (typeof e === "string") {
		var match, re = /<div class="tradehistory_date">(\d\d? +\w\w\w, +\d\d\d\d)<\/div>\s*<div class="tradehistory_content">/g;
		/* jshint -W084 */
		while (match = re.exec(e)) {
			if (!first) first = match[1];
			last = match[1];
		}
	} else {
		var dates = e.getElementsByClassName("tradehistory_date");
		if (!dates.length) return "";
		last = dates[((max && max < dates.length) ? max : dates.length) - 1].textContent;
		first = dates[0].textContent.replace(/^\s+|\s+$/g,'');
	}
	if (!(first && last)) return "";
	console.log(`${last}-${first}`.replace(/\s*\d+:\d\d[ap]m\s*/g,''));
	return `${last}-${first}`.replace(/\s*\d+:\d\d[ap]m\s*/g,'').replace(/, (\d{4})(-.*, \1)/, '$2').replace(/ +([A-Z][a-z][a-z])(-\d+ +\1)/, '$2').replace(/^(\d+)-(\1\s)/, '$2');
}


/// //
//          ,,                                                    ,,
//        `7MM           mm                                       db                                                       mm
//          MM           MM                                                                                                MM
//     ,M""bMM  .gP"Ya mmMMmm .gP"Ya `7Mb,od8 `7MMpMMMb.pMMMb.  `7MM  `7MMpMMMb.  .gP"Ya   `7MMpMMMb.  .gP"Ya `7M'   `MF'mmMMmm `7MMpdMAo.  ,6"Yb.  .P"Ybmmm .gP"Ya
//   ,AP    MM ,M'   Yb  MM  ,M'   Yb  MM' "'   MM    MM    MM    MM    MM    MM ,M'   Yb    MM    MM ,M'   Yb  `VA ,V'    MM     MM   `Wb 8)   MM :MI  I8  ,M'   Yb
//   8MI    MM 8M""""""  MM  8M""""""  MM       MM    MM    MM    MM    MM    MM 8M""""""    MM    MM 8M""""""    XMX      MM     MM    M8  ,pm9MM  WmmmP"  8M""""""
//   `Mb    MM YM.    ,  MM  YM.    ,  MM       MM    MM    MM    MM    MM    MM YM.    ,    MM    MM YM.    ,  ,V' VA.    MM     MM   ,AP 8M   MM 8M       YM.    ,
//    `Wbmd"MML.`Mbmmd'  `Mbmo`Mbmmd'.JMML.   .JMML  JMML  JMML..JMML..JMML  JMML.`Mbmmd'  .JMML  JMML.`Mbmmd'.AM.   .MA.  `Mbmo  MMbmmd'  `Moo9^Yo.YMMMMMb  `Mbmmd'
//                                                                                                                                MM               6'     dP
//                                                                                     mmmmmmm                                  .JMML.             Ybmmmd'
function determine_nextpage() {
	BASTARD_NEXTPAGE = BASTARD_HIGHEST_FETCHED_PAGE < BASTARD_LASTPAGE ? BASTARD_HIGHEST_FETCHED_PAGE + 1 : 0;
	return BASTARD_NEXTPAGE;
}

var BASTARD_HELD_PER_STEAM=0;
function f_tradeoffers_held_response(r) { 
	return function tradeoffers_held_response() { 
		if (r.readyState !== 4 || r.status !== 200 || !r.responseText) return;
		var match=r.responseText.match(/<div class="trade_offers_escrow_explanation">\s*<div class="title">(\d+)/);
		if (match) findheld( BASTARD_HELD_PER_STEAM = +match[1] );
		else if (/<div class="rightcol_controls">/.test(r.responseText)) BASTARD_HELD_PER_STEAM=0;
		else console.error("/my/tradeoffers/sent gave an error, dunno how many held trades you have");
	};
}

/// //
//       ,...,,                    ,,    ,,                 ,,        ,,
//     .d' ""db                  `7MM  `7MM               `7MM      `7MM
//     dM`                         MM    MM                 MM        MM
//    mMMmm`7MM  `7MMpMMMb.   ,M""bMM    MMpMMMb.  .gP"Ya   MM   ,M""bMM
//     MM    MM    MM    MM ,AP    MM    MM    MM ,M'   Yb  MM ,AP    MM
//     MM    MM    MM    MM 8MI    MM    MM    MM 8M""""""  MM 8MI    MM
//     MM    MM    MM    MM `Mb    MM    MM    MM YM.    ,  MM `Mb    MM
//   .JMML..JMML..JMML  JMML.`Wbmd"MML..JMML  JMML.`Mbmmd'.JMML.`Wbmd"MML.
//
//
function findheld(scope) {
	var rows=document.querySelectorAll( (typeof scope === "number" || !scope) ? ".tradehistoryrow" : scope ),
		n_rows=rows.length,
		lastrow=n_rows ? rows[n_rows-1] : "",
		lastdate=lastrow.querySelector(":scope .tradehistory_date").textContent,
		lasttime=lastrow.querySelector(":scope .tradehistory_timestamp").textContent,
		hours = +age(lastdate, lasttime),
		newheld=[],
		i;
	if (typeof scope === "number") return heldbannertext(hours);

	if (!scope && BASTARD_THISPAGE===1 && !BASTARD_HELD_PER_STEAM) { 
		var r = new XMLHttpRequest();
		r.open("GET", "/my/tradeoffers/sent", true);
		r.onreadystatechange = f_tradeoffers_held_response(r);
		r.send(null);
	}
	for (i=0; i<n_rows; ++i) { 
		var row=rows[i];
		if (row.querySelector(":scope > .tradehistory_content > .tradehistory_items_received > span.history_item")) { // held
			row.classList.add("held");
			row.classList.add("new");
			newheld.push(row);
		}
	}

	if (!document.getElementById("heldrow")) {
		E("div", { id: "heldrow", c:"empty", S: document.getElementById("mainContents").firstChild,	C: [
			E("div", { id: "heldbanner", C: [
				E("a", {	h: "#",	c: "unheld sm round toggle btn", 	id: "heldbut",		onclick: toggle_unheld_visible, title:"Toggle display of unheld trades" }),
				E("div", {id:"heldbannertext"}),
				E("span", {	c: "warning",	id: "heldwarning" }),
			]}),
			E("div", {	id: "heldrecraw",	c: "held_raw_internal received"				}),
			E("div", {	id: "heldgivraw",	c: "held_raw_internal given"				}),
			E("div", {	id: "heldrec",		c: "tradehistory_items tradehistory_items_received"	}),
			E("div", {	id: "heldgiv",		c: "tradehistory_items tradehistory_items_given"		}),
		]});
	}

	cloneAppendCloneReplace( ".held.new .tradehistory_items_received .history_item", "heldrecraw", "heldrec" );
	cloneAppendCloneReplace( ".held.new .tradehistory_items_given .history_item",    "heldgivraw", "heldgiv" );
	heldbannertext(hours);

	var	n_newheld=newheld.length;
	for (i=0; i<n_newheld; ++i) newheld[i].classList.remove("new");
	if (n_newheld) update_endtimes();
}

function cloneAppendCloneReplace(src, stage, target) { 
	if (typeof src === "string") src=document.querySelectorAll(src);
	if (typeof stage === "string") stage=document.getElementById(stage);
	if (typeof target === "string") target=document.getElementById(target);
	for (var i=0, n_src=src.length; i<n_src; ++i) stage.appendChild( src[i].cloneNode(true) );
	var copy=stage.cloneNode(true);
	copy.id=target.id;
	copy.className=target.className;
	target.parentElement.replaceChild( copy, target );
}
/// //
//     ,,                 ,,        ,,  ,,
//   `7MM               `7MM      `7MM *MM                                                           mm                       mm
//     MM                 MM        MM  MM                                                           MM                       MM
//     MMpMMMb.  .gP"Ya   MM   ,M""bMM  MM,dMMb.   ,6"Yb.  `7MMpMMMb.  `7MMpMMMb.  .gP"Ya `7Mb,od8 mmMMmm .gP"Ya `7M'   `MF'mmMMmm
//     MM    MM ,M'   Yb  MM ,AP    MM  MM    `Mb 8)   MM    MM    MM    MM    MM ,M'   Yb  MM' "'   MM  ,M'   Yb  `VA ,V'    MM
//     MM    MM 8M""""""  MM 8MI    MM  MM     M8  ,pm9MM    MM    MM    MM    MM 8M""""""  MM       MM  8M""""""    XMX      MM
//     MM    MM YM.    ,  MM `Mb    MM  MM.   ,M9 8M   MM    MM    MM    MM    MM YM.    ,  MM       MM  YM.    ,  ,V' VA.    MM
//   .JMML  JMML.`Mbmmd'.JMML.`Wbmd"MML.P^YbmdP'  `Moo9^Yo..JMML  JMML..JMML  JMML.`Mbmmd'.JMML.     `Mbmo`Mbmmd'.AM.   .MA.  `Mbmo
//
//
function heldbannertext(hours) {
	/*jshint -W093*/
	var n_shown=document.querySelectorAll(".tradehistoryrow.held").length,
		n = BASTARD_HELD_PER_STEAM || n_shown,
		r=document.querySelectorAll("#heldrecraw .history_item").length,
		g=document.querySelectorAll("#heldgivraw .history_item").length,
		id = "heldbannertext",
		banner = document.getElementById(id),
		warning = document.getElementById("heldwarning"),
		ctn = document.getElementById("heldrow"),
		fetchbtn=document.getElementById("heldneverending"),
		soonest=endsoonest(),
		idpre = "heldtext_",
		more = n!==n_shown,
		warningexists=document.querySelectorAll("a.heldtext.steam").length ? "unchanged":"",
		fields = [
			["n", s(n, "trade"), r ? " and " : " "],
			["rec", s(r, "incoming item"), " held" + (g ? "; " : "")],
			["giv", s(g, "outgoing held item"), " — soonest release is "],
			["end", soonest || "unknown", ""]
		],
		children = [];
	if (!n) return banner.textContent=warning.innerHTML='';
	for (var i=0, f; f=fields[i]; ++i) {
		var cid = idpre + f[0],
			old = document.getElementById(cid),
			cl = "heldtext";
		//if (old && f[0] === "end") console.log([old.textContent, f[1]]);
		if ((!banner.textContent) || (old && f[1] === old.textContent)) cl += " unchanged";
		children.push(E("", {c: cl, id: cid, t: f[1] }));
		children.push(document.createTextNode(f[2]));
	}
	if (soonest && more) children.push(E("b", {t:" (possibly sooner)"}));
	banner.parentElement.replaceChild( E("div", {id: id, C: children}), banner);
	warning.innerHTML = (BASTARD_HELD_PER_STEAM ? 
			( more ? `Steam says <a href=/my/tradeoffers/sent class="heldtext steam ${warningexists}">you have ${s(n, "trade")} on hold</a> but this page ${n_shown?"only shows "+n_shown : "shows none"}.  Load more pages to find the rest!` :"" )
			: 
			( hours < HB.escrowDuration ? (n_shown ? "More" : "Some") + " held trades may be on the next page: only " + hours2text(hours,true) + " of history was found here." : "" )
		);
	if (n || warning.innerHTML) ctn.classList.remove("empty"); else ctn.classList.add("empty");
	if (warning.innerHTML) fetchbtn.classList.remove("inactive"); else fetchbtn.classList.add("inactive");
}

/// //
//                                        ,,                                     ,,                 ,,        ,,                ,,            ,,  ,,        ,,
//     mm                               `7MM                                   `7MM               `7MM      `7MM                db            db *MM      `7MM
//     MM                                 MM                                     MM                 MM        MM                                  MM        MM
//   mmMMmm ,pW"Wq.   .P"Ybmmm  .P"Ybmmm  MM  .gP"Ya   `7MM  `7MM  `7MMpMMMb.    MMpMMMb.  .gP"Ya   MM   ,M""bMM   `7M'   `MF'`7MM  ,pP"Ybd `7MM  MM,dMMb.  MM  .gP"Ya
//     MM  6W'   `Wb :MI  I8   :MI  I8    MM ,M'   Yb    MM    MM    MM    MM    MM    MM ,M'   Yb  MM ,AP    MM     VA   ,V    MM  8I   `"   MM  MM    `Mb MM ,M'   Yb
//     MM  8M     M8  WmmmP"    WmmmP"    MM 8M""""""    MM    MM    MM    MM    MM    MM 8M""""""  MM 8MI    MM      VA ,V     MM  `YMMMa.   MM  MM     M8 MM 8M""""""
//     MM  YA.   ,A9 8M        8M         MM YM.    ,    MM    MM    MM    MM    MM    MM YM.    ,  MM `Mb    MM       VVV      MM  L.   I8   MM  MM.   ,M9 MM YM.    ,
//     `Mbmo`Ybmd9'   YMMMMMb   YMMMMMb .JMML.`Mbmmd'    `Mbod"YML..JMML  JMML..JMML  JMML.`Mbmmd'.JMML.`Wbmd"MML.      W     .JMML.M9mmmP' .JMML.P^YbmdP'.JMML.`Mbmmd'
//                   6'     dP 6'     dP
//                   Ybmmmd'   Ybmmmd'             mmmmmmm                                                     mmmmmmm
function toggle_unheld_visible(e) {
	var rows = document.querySelectorAll(".tradehistoryrow:not(.held), .index_result:not(.held)");
	for (var i = 0; i < rows.length; i++) rows[i].classList.toggle("hidden");
	document.getElementById("heldbut").classList.toggle("hidden");
	if ( document.getElementById("filterbox")) update_filter_count();
	return false;
}

function ID(id) {
	 return document.getElementById(id) || null;
}

function CN(cn) {
	 return document.getElementsByClassName(cn);
}

// 	                                                                                         
// 	                             ,,                                      ,,                  
// 	                           `7MM             .M"""bgd mm            `7MM                  
// 	                             MM            ,MI    "Y MM              MM                  
// 	 ,6"Yb. `7MMpdMAo.`7MMpdMAo. MM `7M'   `MF'`MMb.   mmMMmm `7M'   `MF'MM  .gP"Ya  ,pP"Ybd 
// 	8)   MM   MM   `Wb  MM   `Wb MM   VA   ,V    `YMMNq. MM     VA   ,V  MM ,M'   Yb 8I   `" 
// 	 ,pm9MM   MM    M8  MM    M8 MM    VA ,V   .     `MM MM      VA ,V   MM 8M"""""" `YMMMa. 
// 	8M   MM   MM   ,AP  MM   ,AP MM     VVV    Mb     dM MM       VVV    MM YM.    , L.   I8 
// 	`Moo9^Yo. MMbmmd'   MMbmmd'.JMML.   ,V     P"Ybmmd"  `Mbmo    ,V   .JMML.`Mbmmd' M9mmmP' 
// 	          MM        MM             ,V                        ,V                          
// 	        .JMML.    .JMML.        OOb"                      OOb"                           
//
function Style(css) { 
    var s = document.createElement('style');
    s.type='text/css';
    document.getElementsByTagName('head')[0].appendChild(s).textContent=css;
}

function applyCrawlStyle() { 
	if(HB.isINVcrawling) Style("#mainContents { display:none } #crawlFrame { border:6px double gold; width:90%; min-width:400px; height:600px; margin-left:5%; }");
}

function applyStyles() {
	var css=`
#mainContents,
.maincontent,
.pagecontent       { width:100%!important; margin:0!important; max-width:100%!important; padding:0 }
.X_close           { border:2px solid #444; color:#444; padding:5px 2px 7px 2px }
.X_close,
.Y_open            { position:absolute; background:#111 ; border-radius:30px; display:block; font-family:sans-serif; font-size:13px; line-height:0; right:-3px; text-transform:none; top:-3px; transition:border-color 0.5s, color 0.5s}
.X_close:before    { content:"x" }
.X_close:hover     { border:2px solid #aaa; color:#fff }
.Y_open            { border:2px solid #030; color:#040; font-size:11px ; padding:5px 2px 7px 2px}
.Y_open:before     { content:"✓" }
.Y_open:hover      { border:2px solid #2a2; color:#2f2 }
.daybreak          { border-top:3px solid #1B2838 }
.descs .desc       { color:#767676 }
.held .tradehistory_event_description > br,
.market_confirmation_opt_out_removed,
.header_installsteam_btn_content,
.header_installsteam_btn_leftcap,
.tradehistory_items_plusminus,
${ HB.qRow }.filtered,
.profile_small_header_bg,
.tradehistoryrow.hidden,
.index_result.hidden,
#account_pulldown,
.held .heldnotice,
.textpop.closed,
.held_raw_internal,
#heldrow.empty     { display:none }
.nx                { color:#0FF; display:inline-block; font-size:14px; font-weight:700; min-width:31px; padding-right:1px; text-align:right; vertical-align:top }
.nx.metal          { font-size:11px; font-weight:400 }
.nx::after         { content:"ˣ" }
.tradehistory_date { font-weight:400; display:inline; float:right; font-size:inherit; margin:0 6px; width:95px; background-color:inherit; }
.bptf              { display:inline-block;  height:16px; vertical-align:bottom; width:16px; background:url(
  data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEVMaXFad4yuucH6+vuwkh8mAAAAAXRSTlMAQObYZgAAAD5JREFUCNdjYICD0NBQIBH204EhLPxpAEP07KkhDPn/v4YyxK9+GgrhAgmwhAND9OupDAxhz6eAtAUgzGAAAHW8FcypFaFSAAAAAElFTkSuQmCC
  ) no-repeat      }
.descs             { vertical-align:super; display:block; font-size:10px }
.descs.inline      { vertical-align:super; display:inline; font-size:10px }
#indexresultct,
#filterct          { color:#AF9300; font-style:italic; font-size:14px; padding-right:8px; }
.filterX           { visibility:hidden; font-size:12px; border-radius:25px; background:#666; color:#333; font-weight:bold; cursor:pointer; line-height:14px; height:14px; width:14px; text-align: center;}
.filterX:before    { content:"✖" }
.filterX:hover:before { color:#ccc }
@keyframes flashpinkgold   {   from {background-color:pink;}    to {background-color:gold;} }
.highlight         { border-radius:2px!important; color:black!important; animation:flashpinkgold 1s ease-in 0s forwards; background-color:gold; }
.contains_highlight { border-bottom:2px solid gold; }
.loose_highlight   { border:1px dotted gold!important; border-radius:2px; }
#filterbox::-webkit-input-placeholder { color:#666; font-style:italic }
#filterbox::-moz-placeholder { color:#666; font-style:italic }
	`;


	if (HB.isSCM) css+=`
#filterbox         { border-radius:3px; background-color:#333; border-color:#555; color:#FFF; margin:4px; padding:3px 2px 3px 8px; width:9em; }
.filterrow         { background:transparent; display:inline-block; }
.filterX.active    { visibility:visible; position:relative; left:-23px; top:-1px; }
.market_tab_well_tab_contents                      { min-width:170px }
#BG_bottom                                         { width:95%; max-width:1200px }
#BG_top > .market_header .market_header_logo,
#BG_top > .market_header,
#BG_top                                            { height:auto }
#BG_top > .user_info                               { top:auto; bottom:1px }
.credit_heading,
.debit_heading                                     { line-height:normal!important }
.described                                         { font-weight:normal }
.described ~ .market_listing_game_name,
.described + br                                    { display:none }
.gained .market_listing_gainorloss                 { color:#999 }
.gained .what_happened:before                      { content:"bought from" }
.gained,
.lost                                              { transition-duration:0.5s; background-color:rgba(0, 0, 0, 0.4) }
.lost .market_listing_gainorloss                   { color:#f00 }
.lost .what_happened:before                        { content:"sold to" }
.market_listing_cancel_button,
.market_listing_edit_buttons,
.market_listing_edit_button                        { margin-top:1px; height:33px }
.market_listing_edit_buttons                       { width:140px; height:30px }
.market_listing_gainorloss                         { width:24px; font-size:28px; line-height:28px }
.market_listing_item_img                           { margin:1px 8px 1px 0 }
.market_listing_listed_date                        { width:74px }
.market_listing_row .sih-fraud                     { display:none }
.market_listing_row .what_happened:before          { font-size:10px; color:#666; display:block }
.market_listing_row .bptf                          {  margin-bottom:4px }
.market_listing_table_header .market_listing_my_price:not(.market_listing_buyorder_qty),
.credit_heading,
.debit_heading                                     { line-height:14px; cursor:pointer }
.market_listing_whoactedwith_name_block            { padding-left:21px; margin-top:4px }
.my_listing_section .market_listing_item_name_block,
.market_listing_my_price > span.market_table_value { margin-top:2px; margin-bottom:0 }
.my_listing_section .market_listing_right_cell,
.my_listing_section .market_listing_left_cell      { line-height:33px }
.my_listing_section .market_listing_row            { margin-top:1px }
.neg                                               { color:#f33 }
.sorted_by_this::after                             { display:block; color:gold; content:"▼"; line-height:8px }
	`;


	if(HB.isINV) css+=`

.btn  { color:#fff;    
		text-align: center;    
		display: inline-block;
		vertical-align: middle;   
		text-decoration: none;
		text-shadow: 1px 1px 0px black;
		border-radius: 25px;
		overflow:hidden;
		margin:2px 4px 1px 4px;
		font-style: initial;
	}
.inactive                   { display:none }
body .btn.xl                     { width:380px; height:20px; font-size:16px; margin-left:12px;   line-height:20px }
body .btn.lg:not(.round)         { width:140px; height:20px; font-size:16px; margin-left:6px;    line-height:20px }
body .btn.mm                     { width:130px; height:14px; font-size:12px; padding-bottom:2px;  line-height:14px }
body .btn.sm:not(.round)         { width:100px; height:14px; font-size:12px; padding-bottom:2px; line-height:14px }
body .btn.xs                     { width:70px;  height:14px; font-size:12px; padding-bottom:2px; line-height:14px }
body .btn.xxs                    { width:38px;  height:14px; font-size:12px; padding-bottom:2px; line-height:14px }
body .btn.sm.round               { width:13px;  height:13px; font-size:11px; font-weight:bold;   line-height:13px; border: 1 px solid #333; }
body .btn.sm.square              { width:13px;  height:13px; font-size:11px; font-weight:bold;   line-height:13px; border: 1 px solid #333; border-radius:3px; }
body .btn.lg.round               { width:53px;  height:53px; font-size:19px; font-weight:bold;   line-height:20px; border-radius:60px}
body .btn.grn  			{ background: linear-gradient(to bottom, #030 15%,#010 100%); border: 1px solid #030; }
body .btn.grn:hover 																							{ background: linear-gradient(to bottom, #010 31%,#030 100%); }
body .btn.yel 			{ background: linear-gradient(to bottom, #770 15%,#330 100%); border: 1px solid #550; }
body .btn.yel:hover      																						{ background: linear-gradient(to bottom, #220 31%,#550 100%); }
body .btn.delete,
body .btn.red 			{ background: linear-gradient(to bottom, #500 15%,#100 100%); border: 1px solid #400; }
body .btn.delete:hover,
body .btn.red:hover      																						{ background: linear-gradient(to bottom, #200 31%,#500 100%); }
body .btn.blu           { background: linear-gradient(to bottom, #06c 31%,#026 100%); border: 1px solid #048; }
body .btn.blu:hover      																						{ background: linear-gradient(to bottom, #026 31%,#06c 100%); }
body .btn.toggle        { background: linear-gradient(to bottom, #037 31%,#014 100%); border: 1px solid #026 }
body .btn.toggle:hover      												  								{ background: linear-gradient(to bottom, #014 31%,#037 100%); border:1px solid #04b; }
body .btn.delete::before { content:"✗"; }

.filterX.active    { visibility:visible; position:absolute; left:246px; top:6px; }

#HB_lsex .btn { float:right; vertical-align:middle; margin:2px 6px 2px 0; }
#HB_lsex .lsex_undel.btn::before { content:"Restore" }
.text.btn,  
.unheld.btn,
.info_close.btn { float:right; }

.info.toggle.btn                { position:absolute; top:3px; right:110px; box-shadow: 0px 0px 12px #444; overflow:hidden; border:2px solid #333; opacity:0.5; }
.info.toggle.btn:hover          { box-shadow: 0px 0px 8px #028; border:2px solid #029; opacity:1; }
.info.toggle.btn > img          { display: block;margin: 0 auto; position:absolute; left:4px }
.info.toggle.btn > img.sheep1   { transition:transform 0.5s ease-in-out; }
.info.toggle.btn:hover > img.sheep1 { transform: rotate(360deg); }
.info.toggle.btn > img.sheep2   { opacity:0.3; }
.info_close.btn                 { margin:20px; box-shadow: 0px 0px 4px white; }
.toggle.btn:before              { content:"\u2796" }
.toggle.hidden.btn:before       { content:"\u2795" }
.fetch.btn.load                 { cursor:progress; background:linear-gradient(to bottom, #026 5%,#06c 100%); }
.fetch.btn.one:before           { content:"Load page " }
.fetch.btn.xl.one               { margin-left:calc(50% - 265px); margin-right:10px; }
.fetch.btn.five:before          { content:"Load 5 pages" }
.fetch.btn.load:before          { content:"Loading page " }
.crawl_done.btn::before         { content:"That's great!" }
.crawl_done.btn 				{ background: linear-gradient(to bottom,  #050 15%,#020 100%);border: 1px solid #040;}
.crawl_done.btn:hover           { background: linear-gradient(to bottom,  #020 31%,#050 100%);}
.crawl_pause.btn::before        { content:"Make it pause!" }
.crawl_pause.btn.paused::before { content:"Resume crawl!" }
.text.toggle.btn.hidden::before               { content:"T" }
.lookup_more.toggle.btn::before { content:"" }
.info.round.toggle.btn::before     { content:"" }
.index_stats_startcrawl_btn       { box-shadow: 0px 0px 6px #444; }
.index_stats_startcrawl_btn:hover { box-shadow: 0px 0px 2px #294; }

body div#global_header .content { height: 80px }
#filterbox                              { border-radius:3px; background-color:#333; border-color:#555; color:#FFF; margin:0px 6px 8px 10px; padding:3px 2px 3px 8px; width:18em }
.filterrow                              { display:block; background:black; position:relative }
#heldbanner                             { font-size:16px; color:#999; line-height:22px; margin-left:20px; padding-bottom:3px; padding-top:20px;  }
#heldbanner .warning,
.HB_reloading                           { color:#e77; font-size:14px; }
#heldrow                                { overflow:hidden; padding-bottom:6px; background:linear-gradient(to bottom, #171a21, #0c0000 20%) }
#indexresults .index_result.held,
#mainContents .tradehistoryrow.held     { background-color:#0c0000 }
@keyframes slide {  from {right:-180px} to {right:-30px} }
@keyframes fade  { 0% {right:-30px} from {opacity:1} to {opacity:0}  100% { visibility:hidden } }
.active.load { animation:slide 0.8s forwards; right:-300px  }
.active.fail { animation:fade 3s ease-in 20s forwards; right:-30px  }
.active.succ { animation:fade 1s ease-in 2s forwards;  right:-30px  }
.active:hover { animation-play-state: paused; }
.neverending_history.ctn 		{ background: linear-gradient(to bottom,#1b2838,#000 30%); padding-top:8px; }
#neverending_status                   {
										cursor:pointer;
										position: fixed;
										bottom:30px;
										color: white;
										border-radius: 20px;
										padding: 0px 36px 0px 30px;
										min-height:30px;
										width: 180px;
										vertical-align:middle;
										box-shadow: 2px 2px black;
										border: 1px solid black;
										overflow:hidden;
										display:none;
										right:-30px;
										 }
#neverending_status_head { font-size: 15px; }
#neverending_status_body { font-size: 11px; color:#aaa }
#neverending_status.active            { display: block; z-index:444; }
#neverending_status.active:before      {
										font-weight: bold;
										font-size: 18px;
										font-family: serif;
										border-radius: 15px;
										margin-right: 20px;
										display: inline-block;
										text-shadow:2px 2px black;
										vertical-align: middle;
										line-height:20px;
										position:absolute;
										left:6px;
										top:4px;
										 }
#neverending_status.active.load:before {  background: linear-gradient(to bottom,black,#137);  content: "⌛";  padding:0 3px; }
#neverending_status.active.load        {  background: linear-gradient(to bottom,#137,black) }
#neverending_status.active.succ:before {  background: linear-gradient(to bottom,black,#040); content: "✓"; padding:0 3px;  }
#neverending_status.active.succ        {  background: linear-gradient(to bottom,#040,black) }
#neverending_status.active.fail:before {  background: linear-gradient(to bottom,black,#400);  content: "✗";padding:0 3px 2px 3px; }
#neverending_status.active.fail        {  background: linear-gradient(to bottom,#400,black) }
.held .tradehistory_event_description          { color:#666 }
@keyframes flashpink { from { background-color:pink} to { background-color:inherit } }
.heldtext:not(.unchanged),
.heldendtime:not(.unchanged)                        { animation:flashpink 1s ease-in 0s forwards;  }
.history_item .history_item_name              { display:inline-block; line-height:normal; white-space:normal; word-wrap:break-word }
.history_item.one                             { padding-left:32px }
.history_item::after                          { color:#ccc; border-radius:4px; font-size:10px; margin-left:2px; padding:1px 2px; vertical-align:top }
.inventory_history_pagingrow                  { margin-bottom:0; border-bottom:none ; background:linear-gradient(to bottom,  #1b2838,#000,#000,#000); height:auto}
.inventory_history_pagingrow ~ .inventory_history_pagingrow {background:linear-gradient(to bottom,  #000 70%,#1b2838); padding-bottom:20px }
.toggle_indexed_but::before   { content:"[hide indexed results]" }
.toggle_indexed_but.hidden::before   { content:"[show]" }
.expand_indexed_but::before { content:"[show more]"}
.expand_indexed_but,
.toggle_indexed_but                            { color:#444; font-family:monospace;  text-decoration:underline; margin-left:4px; line-height:normal; font-size:11px; vertical-align:super; font-style:normal}
#indexresults.hidden,
.expand_indexed_but.expanded { display:none }
.thermometer { 	
	display: inline-block;
	height: 20px; 
  position: relative;
	background: rgba(0,0,0,0.1);	
	border-radius: 9px;	
	padding: 2px 3px 3px 3px;	
	box-shadow: inset 0 -1px 1px rgba(255,255,255,0.3);
	border: 1px solid rgba(0,0,0,0.2);
	width:390px;
	margin:2px 0;
	vertical-align:bottom;
}
.thermometer.small            {height:16px}
.thermometer.small > .digital {font-size:12px}
.thermometer > .digital {
	right:18px;
	position: absolute;
	top:3px;
	font-size:15px;
	color:#8ba;
	line-height:normal;
	text-shadow: 2px 2px black;
}
.thermometer > .mercury {
  display: block;
  height: 100%;
  border-radius: 6px; 
  background-color: #2B405A;
  box-shadow:     inset 0 2px 9px  #444,    inset 0 -2px 6px #444;
  border-right:1px solid black;
  overflow: hidden;
  right:0px;
}
#index_pageblocks { margin-bottom:8px; }
#sneakyCrawlFrame {display:none}
#indexresults { background:linear-gradient(to top, #1B2838, #000 12px); padding:4px 0 12px 0;}
#HB_index.crawling.complete::before        { content:"History Bastard has finished crawling your history!"; color:#4a4; font-weight:bold}
#HB_index.crawling::before                 { content:"History Bastard is crawling your inventory history to enable full-text searches!"; color:#944; }
#HB_index::before						  {	content:"History Bastard Index Statistics"; }
#HB_options::before                       { content:"History Bastard Options"; }
#HB_lsex                                  { width:460px; }
#HB_lsex::before                          { content:"Local Storage Explorer"; }
#HB_lsex ul                               { line-height:1.5em; padding-left: 10px; }
#HB_lsex .lsex_state.compressed:before    { content:" Compressed" }
#HB_lsex .lsex_state.uncompressed:before  { content:" Uncompressed" }
#HB_lsex .btn.compressed:before           { content:"Decompress";font-size:11px; }
#HB_lsex .btn.uncompressed:before         { content:"Compress" }
#HB_lsex li:hover                         { background:rgba(0,0,0,0.2); }
#HB_lsex li        .lsex_state            { float:right }   
#HB_lsex li:hover  .lsex_state            { display:none; }   
#HB_lsex li       .btn                    { display:none;}
#HB_lsex li:hover .btn                    { display:inline-block;}
#HB_lsex ul::before                       { text-decoration:underline; }
#HB_lsex ul.bastard::before               { content:"My History Bastard"; }
#HB_lsex ul.foreign_bastard::before       { content:"Other History Bastards"; }
#HB_lsex ul.other::before                 { content:"Other Items"; }
#HB_lsex ul.undo::before                  { content:"Deleted Items (gone forever on refresh unless you undelete!)"; }
#HB_lsex .lsex_size                       { text-align:right; width:72px; display:inline-block;     margin-right: 4px; }
#HB_lsex .lsex_size::after                { content:"char "; font-size:10px; opacity:0.5; text-align:super; }
#HB_lsex .lsex_key                        { color:#9ab; display:inline-block }
#HB_lsex .bastard .lsex_key               { width:74px }
#HB_lsex .bastard .desc                   { display:inline-block; font-size:11.5px }
#HB_lsex li       .lsex_peek                       { display:none }
#HB_lsex li:hover .lsex_peek                       { display:block; font-size:11.5px; display:block; font-size:11.5px; opacity:0.8; }
#HB_lsex li:hover .lsex_peek::before               { content:"data:"; color:#aaa; font-weight:bold;}


#HB_info.hidden { max-height:0!important; }
#HB_info {  transition: max-height 0.2s ease-in; overflow-y:hidden; }
.HB_info::before { font-size:20px; 
				display:block; 
				color:#5b646f;
				line-height:2em;
			  }
.HB_info {  display:inline-block;
			margin:10px;
			padding:5px 20px 20px 20px; 
			color:#6b747f; 
			line-height:2em; border:4px solid #182433; 
			width: 400px;
			vertical-align: top;
		 }
.index_pageblock  { display:inline-block; 
							color:rgba(255,255,255,.5); 
							text-shadow: 1px 1px 0px rgba(0,0,0,.5); 
							box-shadow: 1px 1px rgba(255,255,255,0.2); 
							padding:0px 5px 0px 5px; 
							margin:10px 0 0 8px; 
							border-radius:3px ;
							font-size: 12px;
							line-height:2em;
							vertical-align:middle;
					  }

#index_complete_n.changed,
#index_complete_pct.changed            { animation:flashpink 1s ease-in 0s forwards }
.index_pageblock::before                { font-size:20px; vertical-align:bottom; }
.index_pageblock.some                   { background-color:#263335 }
.index_pageblock.none                   { background-color:#282635 }
.index_pageblock.alldone                { background-color:#182433 }
.index_pageblock.some::before           { content:"\u25d5"; font-size:28px; }
.index_pageblock.none::before           { content:"✗" }
.index_pageblock.alldone::before        { content:"✓" }
@keyframes flashpinkbluegray            { from { background-color:pink} to { background-color:#182433 } }
.index_pageblock.alldone.changed        { animation:flashpinkbluegray 1s ease-in 0s forwards;  }
.index_stats_startcrawl                       { text-decoration:underline; }
.index_result                                 { display:block; padding:10px 4px 14px 10px; line-height:1em; }
.index_result.even                            { background:#0c0d0d }
.index_result.odd                             { background:#090909 }
.index_result::before                         { content:" • "; color:#222 }
.index_result .bptf                           { vertical-align:top; margin-left:2px }
.index_item                                   { display:inline-block; max-width:300px; vertical-align:top  }
.pagebreak                                    { background:linear-gradient(to bottom,#1b2838,#000,#000,#1b2838); padding:8px 80px; color:white; font-size:18px; font-weight:700; line-height:32px }
.index_page::after                            { content:": " }
.index_page::before,
.pagebreak::before                            { content:"Page " }
.pagination                                   { line-height:normal; padding-top:10px; }
.pagination .pagebtn                          { line-height:normal; display:inline; margin-left:4px; padding:0 10px;  }
.pagination .pagebtn.disabled                 { display:none!important }
.pagination .pagelink                         { line-height:18px; text-align:center; vertical-align:bottom; position:relative }
.pagination .pagelink > .hoverpagedate        { display:none; color:white; font-weight:bold; position:absolute; right:30px; top:-6px; width:82px; line-height:18px; background:#111; border:2px solid #444; border-radius:4px; z-index:99 }
.pagination .pagelink:hover > .hoverpagedate,
.pagination .pagelink:hover                   { opacity:1!important; }
.pagination .pagelink:hover > .hoverpagedate  { display:inline-block }
.pagination .pagelink:nth-child(even)         { color:#ccc }
.pagination .pagelink:nth-child(odd)          { color:#999 }
.pagination .pagelink_dated:nth-child(even)   { color:#ade }
.pagination .pagelink_dated:nth-child(odd)    { color:#c98 }
.pagination .pagelink_empty                   { display:none }
.pagination .pagelink_this                    { color:gold!important; font-weight:bold }
.pagination .pagelink_this                    { margin-left:8px; margin-right:8px }
.pagination .pagelink_loaded                  { color:#ee9!important }
.textpop                                      {  float:left; margin:6px 10px 4px; position:relative; width:auto; z-index:99 }
.textpop.open                                 { display:inline-block }
.textpop_content      { 
						background-color:rgba(220,220,220,0.5);   
						border-radius:6px; border-color: #555; 
						font-size:11px; color:#000; 
						padding:6px 20px 8px 6px; 
						width:auto; width:550px; 
						font-family: monospace; 
						min-height:100px; 
					}
.tradehistory_event_description               { padding-bottom:2px; padding-top:1px; }
.tradehistory_items_given                     { line-height:normal; margin:8px 0; padding-left:25px;}
.tradehistory_items_given .history_item       { margin-left:2px; display:inline-block; margin-bottom:4px; vertical-align:top }
.tradehistory_items_given .history_item_name  { width:220px; font-size:12px; vertical-align:top }
.tradehistory_items_given .nx                 { font-size:12px }
.tradehistory_items                  { line-height:normal; margin-bottom:1px; padding-left:10px }
.tradehistory_items .history_item    { min-height:44px; display:inline-block; max-height:120px; overflow:hidden; vertical-align:top }
.tradehistory_items .history_item_name { width:200px }
.tradehistory_items img              { margin-left:0; height:40px; vertical-align:top; width:40px }
.tradehistory_timestamp                       { float:right; color:#777 }
.tradehistoryrow                              { margin:0; padding:2px 0px 0px 3px }
.tradehistoryrow.even                         { background-color:#121313 }
.tradehistoryrow.odd                          { background-color:#0f1010 }
.textpop_content::-webkit-scrollbar           { width: 11px; height: 11px; }
.textpop_content::-webkit-scrollbar-track     { -webkit-box-shadow: inset 0 0 6px #555; border-radius: 4px; }
.textpop_content::-webkit-scrollbar-thumb     { border-radius: 4px; -webkit-box-shadow: inset 0 0 8px #000; color: }
	`;


	if(HB.isINVinsideCrawlFrame) css+=`
#global_header,
.filterrow,
#heldrow,
.neverending_history,
.btn { display:none!important }
	`;
	Style(css);
} 
//EOF