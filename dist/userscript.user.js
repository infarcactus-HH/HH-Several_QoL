// ==UserScript==
// @name         Several QoL
// @namespace    http://tampermonkey.net/
// @version      1.3.0
// @description  A userscript for QoL for the Haremverse
// @author       infarcactus
// @license      GPLv3
// @match        https://*.haremheroes.com/*
// @match        https://*.hentaiheroes.com/*
// @match        https://*.gayharem.com/*
// @match        https://*.comixharem.com/*
// @match        https://*.hornyheroes.com/*
// @match        https://*.pornstarharem.com/*
// @match        https://*.transpornstarharem.com/*
// @match        https://*.gaypornstarharem.com/*
// @match        https://*.mangarpg.com/*
// @updateURL    https://github.com/infarcactus-HH/HH-Several_QoL/raw/refs/heads/main/dist/userscript.user.js
// @downloadURL  https://github.com/infarcactus-HH/HH-Several_QoL/raw/refs/heads/main/dist/userscript.user.js
// @grant        GM.addStyle
// @grant        GM_addStyle
// @grant        GM.openInTab
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

"use strict";(()=>{var u=class{constructor(n){this.hasRun=!1;this.group="severalQoL",this.configSchema=n}};var T={baseKey:"popupPlusPlus",label:"<span tooltip='Stacking popups,click on popups to make it disappear'>Popup++</span>",default:!0},f=class extends u{constructor(){super(T)}shouldRun(){return!0}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0,GM.addStyle("#toast-popups {display:inherit!important;}");let n={},e=null;delete shared.general.objectivePopup.show,shared.general.objectivePopup.show=function(o){if(this.LastPoints==null&&(this.LastPoints={}),!(!o.objective_points||o.battle_result)){if(!o.objective_points){let s=o.objective_points;if(Object.keys(this.pointsBox).length)for(let a in s)this.pointsBox[a]?this.pointsBox[a].name===s[a].name&&(this.pointsBox[a].points_gained+=s[a].points_gained):this.pointsBox[a]=s[a];else this.pointsBox=o.objective_points;o?.end?.rewards?.hasOwnProperty("lose")}t(this,o.objective_points)}};function t(o,s){let a=new Set;Object.keys(s).map((i=>{let l=s[i];if(!n[i])n[i]=l,l.points_gained>0&&a.add(i);else{let p=l.points_gained;p>0&&a.add(i),n[i].points_gained+=p}}));let r=$(`<div class="popup_wrapper"><div id="objective_popup" class="popup"><div class="noti_box"><div class="points">${Object.keys(n).map((i=>{let l=n[i];return`<div class="row animate" style="transition: all 20ms;"><div class="contest_name">${l.title}:</div><div class="contest_points"><div class="points_name" style="animation:none;">${l.name}: </div><div class="points_num" style="animation:none;"><div class="points_i" style="animation:none;">+${number_format_lang(l.points_gained)}</div></div></div></div>`})).join("")}</div></div></div></div></div>`);$("#toast-popups .popup_wrapper").remove(),$("#toast-popups").css("display","unset"),$("#toast-popups"),$("#toast-popups").append(r),$("#toast-popups").css("display","unset"),e&&(clearTimeout(e),e=null),e=setTimeout(()=>{r.remove(),e=null,n={}},5e3),r.on("click.removePopup",function(){r.remove(),e=null,n={}})}}};var C={baseKey:"girlsToWiki",label:"Girls to Wiki (HH)",default:!1,subSettings:[{key:"infoBubbleNameToWiki",default:!0,label:"Info bubble name clickable to wiki"},{key:"portraitToWiki",default:!1,label:"Make portrait clickable to wiki"}]},b=class extends u{constructor(){super(C)}shouldRun(){return location.host.includes("heroes")}run(n){this.hasRun||!this.shouldRun()||(this.hasRun=!0,n?.infoBubbleNameToWiki&&setInterval(()=>{H()},500),n?.portraitToWiki&&setInterval(()=>{O()},500))}};function H(){$(".new_girl_info .girl_name_wrap > h5[style!='cursor: pointer;']").each(function(){let d=$(this);d.css("cursor","pointer"),d.on("click.InfoBubbleToWiki",function(){let n=d.attr("hh_title");if(!n)return;let e=n.replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${e}`,{active:!0})})})}function O(){$(".slot_girl_shards > [data-new-girl-tooltip][style!='cursor: pointer;']").each(function(){let d=$(this),n=d.attr("data-new-girl-tooltip");if(!n)return;let e=n.match(/"name":"(.+)","rarity/);e&&e[1]&&(d.css("cursor","pointer"),d.on("click.ImgToWiki",function(t){t.stopPropagation();let o=e[1].replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${o}`,{active:!0})}))})}var _=class extends u{constructor(){let n={baseKey:"entirePaid",label:"Removes only $ options",default:!1};super(n)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle(".pass_reward.reward_wrapper{display:none!important;}"),GM.addStyle("#gsp_btn_holder{display:none!important;}"),GM.addStyle(".rewards_seasons_row .rewards_pair .tier_number{top:100%!important;}"),GM.addStyle("#get_mega_pass_shop_btn{display:none!important;}"),GM.addStyle("#bundles_tab{display:none!important;}"),GM.addStyle(".purchase-shop{display:none!important;}"))}};var B={baseKey:"tighterPoPs",label:"Tighter PoPs (requires css tweaks for PoP)",default:!0},P=class extends u{constructor(){super(B)}shouldRun(){return location.pathname.includes("/activities.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle("#pop .pop_list .pop-action-btn {margin-bottom: 0.4rem!important;margin-top: 0rem!important;}#pop .pop_list .pop_list_scrolling_area .pop_thumb img {height: 90px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_expanded {height: 89px!important;background: linear-gradient(0deg, #00000087, transparent)!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container, .activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_active {min-height: 89px!important;height: 89px!important;margin-bottom: 5px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb>.pop_thumb_level {top: -93px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb.pop_thumb_active[status=pending_reward]>.pop_thumb_space {top: -126px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .collect_notif {margin-top: -91px!important;margin-left: 121px!important;}.activities-container .pop_thumb_progress_bar {margin-top: 21px!important;}"))}};var g=class{static doWhenSelectorAvailable(n,e){if($(n).length)e();else{let t=new MutationObserver(()=>{$(n).length&&(t.disconnect(),e())});t.observe(document.documentElement,{childList:!0,subtree:!0})}}};var G={baseKey:"labyTeamPreset",label:"<span tooltip='Add a button to register laby team presets, and to apply it'>Laby Team Preset</span>",default:!0},v=class extends u{constructor(){super(G);this.savedTeamPresetKey="SeveralQoL_LabyTeamPreset"}shouldRun(){return location.pathname.includes("/edit-labyrinth-team.html")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let e=$(".boss-bang-panel"),t=$('<button class="green_button_L" tooltip="Save preset for later runs">Save Preset</button>');t.on("click",()=>{this.saveCurrentPreset(),o.removeAttr("disabled")}),e.append(t);let o=$(`<button class="green_button_L" tooltip="Use previously saved preset & leave page" ${localStorage.getItem(this.savedTeamPresetKey)?"":"disabled"}>Fill Preset</button>`);o.on("click",()=>{this.loadSavedPreset()}),g.doWhenSelectorAvailable(".change-team-panel .player-team .average-lvl",()=>{$(".change-team-panel .player-team .average-lvl").replaceWith(o)})}saveCurrentPreset(){let e=[];$(".team-hexagon .team-member-container").each(function(){let t=$(this).attr("data-team-member-position"),o=$(this).attr("data-girl-id");$(this).is("[data-girl-id]")&&t&&o&&(e[t]=o)}),console.log("Saving preset: ",e),localStorage.setItem(this.savedTeamPresetKey,JSON.stringify(e))}loadSavedPreset(){let e=localStorage.getItem(this.savedTeamPresetKey);if(!e){console.warn("No saved preset found");return}try{let t=JSON.parse(e);console.log("Loading preset: ",t);let o={class:"Hero",action:"edit_team",girls:t,battle_type:"labyrinth",id_team:unsafeWindow.teamId};console.log("AJAX settings: ",o),shared.general.hh_ajax(o,s=>{shared.general.navigate(unsafeWindow.redirectUrl)})}catch(t){console.error("Failed to load preset:",t)}}};var w=class extends u{constructor(){let n={baseKey:"noAnnoyingPopups",label:"Removes annoying popup appearing automaticly for shops, paths, news",default:!1};super(n)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,document.cookie="disabledPopups=PassReminder,Bundles,News; path=/")}};var M={baseKey:"whaleBossTournament",label:"Renames WBT to Whale Boss Tournament",default:!1},x=class extends u{constructor(){super(M)}shouldRun(){return location.pathname.includes("/home.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,g.doWhenSelectorAvailable(".world-boss .title",()=>{$(".world-boss .title").text("Whale Boss Tournament")}))}};var j={baseKey:"placesOfPowerPlusPlus",label:"Places of Power++ (Beta)",default:!1},y=class extends u{constructor(){super(j);this.hasBuiltCustomPoPGirlsList=!1;this.popPresets={}}convertCriteriaKey(e){return e.replace("_","")}buildPopGirlAssignments(){if(this.hasBuiltCustomPoPGirlsList)return;let e=new Set;Object.values(pop_hero_girls).forEach(t=>{t.id_places_of_power!==null&&e.add(t.id_girl)}),Object.values(pop_data).forEach(t=>{(t.status==="pending_reward"||t.status==="can_start")&&this.assignGirlsToPoP(t.id_places_of_power,e)}),this.hasBuiltCustomPoPGirlsList=!0}assignGirlsToPoP(e,t){let o=Object.values(pop_data).find(i=>i.id_places_of_power===e);if(!o)return;console.log(`[PoP ${e}] Assigning girls - Status: ${o.status}`);let s=o.criteria,a=o.max_team_power,r=this.popPresets[e]&&this.popPresets[e].length>0;if(r&&o.status==="pending_reward"){console.log(`[PoP ${e}] Reusing existing preset with ${this.popPresets[e].length} girls`);let i=this.popPresets[e].filter(p=>{let m=Object.values(pop_hero_girls).find(c=>c.id_girl===p);return m&&(m.id_places_of_power===null||m.id_places_of_power===e)}),l=this.calculatePresetPower(i,s);if(l>=a){i.forEach(p=>t.add(p)),console.log(`[PoP ${e}] Preset is valid (power: ${l}/${a})`);return}else console.log(`[PoP ${e}] Preset insufficient (power: ${l}/${a}), filling...`),this.fillFromPreset(e,i,a,s,t)}else{console.log(`[PoP ${e}] Creating new assignment (hasPreset: ${r})`);let i=this.selectOptimalGirls(e,a,s,t);this.popPresets[e]=i,i.forEach(l=>t.add(l))}}calculatePresetPower(e,t){let o=0,s=this.convertCriteriaKey(t);for(let a of e){let r=Object.values(pop_hero_girls).find(i=>i.id_girl===a);r&&(o+=r[s])}return o}fillFromPreset(e,t,o,s,a){console.log(`[PoP ${e}] Filling from preset with ${t.length} girls`),t.forEach(c=>a.add(c));let r=this.calculatePresetPower(t,s),i=o-r;console.log(`[PoP ${e}] Current power: ${r}, Target: ${o}, Remaining: ${i}`);let l=Object.values(pop_hero_girls).filter(c=>!t.includes(c.id_girl)&&!a.has(c.id_girl)&&(c.id_places_of_power===null||c.id_places_of_power===e));console.log(`[PoP ${e}] Available girls for filling: ${l.length}`);let p=this.selectGirlsForRemainingPower(l,i,s);console.log(`[PoP ${e}] Adding ${p.length} additional girls:`,p),this.popPresets[e]=[...t,...p],p.forEach(c=>a.add(c));let m=this.calculatePresetPower(this.popPresets[e],s);console.log(`[PoP ${e}] Final power: ${m}, Total girls: ${this.popPresets[e].length}`)}selectOptimalGirls(e,t,o,s){console.log(`[PoP ${e}] Selecting optimal girls - Target power: ${t}, Criteria: ${o}`);let a=Object.values(pop_hero_girls).filter(i=>i.id_places_of_power===null||i.id_places_of_power===e);if(console.log(`[PoP ${e}] Total girls in roster: ${Object.values(pop_hero_girls).length}`),console.log(`[PoP ${e}] Already assigned girls: ${s.size}`),console.log(`[PoP ${e}] Available girls for selection: ${a.length}`),a.length===0)return console.error(`[PoP ${e}] No available girls! All girls might be assigned to other PoPs.`),[];let r=this.selectGirlsForRemainingPower(a,t,o);return console.log(`[PoP ${e}] Selected ${r.length} girls:`,r),r}selectGirlsForRemainingPower(e,t,o){let s=[],a=this.convertCriteriaKey(o),r=[...e].sort((i,l)=>l[a]-i[a]);for(let i of r){let l=i[a];if(l<=t)t-=l,s.push(i.id_girl);else if(s.length===0||t>0){let p=l-t,m=i;for(let c=r.indexOf(i)+1;c<r.length;c++){let h=r[c],S=h[a],R=S-t;if(S<=t)break;R<p&&(p=R,m=h)}t>0&&(s.push(m.id_girl),t-=m[a]);break}}return s}sendClaimRequest(e){shared.animations.loadingAnimation.start();let t=pop_data[parseInt(e)];if($(".claimPoPButton").prop("disabled",!0),t.ends_in===null||t.ends_in!==0)$(".claimPoPButton").css("display","none"),$(".startPoPButton").css("display",""),pop_data[parseInt(e)].status="can_start";else{let s=$(".pop-record.selected");s.next().trigger("click"),s.remove()}let o={namespace:"h\\PlacesOfPower",class:t.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"claim",id_place_of_power:t.id_places_of_power};shared.general.hh_ajax(o,s=>{let a=$(".pop-claimed-rewards-items");if(a.length){if(s.rewards.data.rewards){console.log(s.rewards.data.rewards);let r=shared.reward.newReward.multipleSlot(s.rewards.data.rewards);a.append(r)}shared.animations.loadingAnimation.stop()}})}calculateTimeToFinish(e,t){let o=this.convertCriteriaKey(e.criteria),s=0;for(let r of t){let i=Object.values(pop_hero_girls).find(l=>l.id_girl===r);i&&(s+=i[o])}if(s>=e.max_team_power)return 360*60;let a=e.level_power/s;return Math.floor(a*60)}sendFillRequest(e){shared.animations.loadingAnimation.start();let t=pop_data[parseInt(e)];if(t.status!=="can_start")return;$(".startPoPButton").css("display","none"),$(".claimPoPButton").css("display","");let o=t.id_places_of_power;this.hasBuiltCustomPoPGirlsList||(console.warn(`[PoP ${o}] Girl assignments not built yet, building now...`),this.buildPopGirlAssignments());let s=this.popPresets[o]||[];if(s.length===0){console.error(`[PoP ${o}] No girls selected for PoP. Preset:`,this.popPresets[o]),console.error(`[PoP ${o}] Available presets:`,Object.keys(this.popPresets)),alert("No girls were assigned to this PoP. This might happen if all your girls are already assigned to other PoPs.");return}console.log(`[PoP ${o}] Starting PoP with ${s.length} girls:`,s);let a={namespace:"h\\PlacesOfPower",class:t.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"start",id_place_of_power:o,selected_girls:s},r=$('<div class="pop-timer"></div>'),i=shared.timer.buildTimer(this.calculateTimeToFinish(t,s),"","pop-active-timer",!1);r.append(i),$(".pop-record.selected").append(r),shared.timer.activateTimers("pop-record.selected .pop-active-timer",()=>{}),shared.general.hh_ajax(a,l=>{shared.animations.loadingAnimation.stop()})}buildPopDetails(e){let t=$(".pop-details-container");if(!t.length)return;t.children().not(".pop-claimed-rewards-container").remove();let o=pop_data[parseInt(e)];if(!o)return;let s=$('<div class="pop-details-left"></div>');t.append(s);let a=$("<img></img>");a.attr("src",o.girl?o.girl.avatar:"https://hh.hh-content.com/pictures/girls/1/avb0-1200x.webp?a=1"),s.append(a);let r=$("<div class='pop-details-right'></div>");t.prepend(r);let i=$(`<div class="pop-title">${o.title}</div>`);r.append(i);let l=$('<div class="pop-rewards-container"></div>');for(let[c,h]of Object.entries(o.rewards))if(h.loot){let S=shared.reward.newReward.multipleSlot(h);l.append(S);break}r.append(l);let p=$(`<button class="purple_button_L claimPoPButton" ${o.status!="pending_reward"?"disabled":""}>Claim</button>`);r.append(p),p.on("click",()=>{this.sendClaimRequest(e)});let m=$('<button class="blue_button_L startPoPButton">Fill & Start</button>');if(m.on("click",()=>{this.sendFillRequest(e)}),r.append(m),o.status!=="can_start"?m.css("display","none"):p.css("display","none"),!$(".pop-claimed-rewards-container").length){let c=$("<div class='pop-claimed-rewards-container'></div>");t.append(c),c.append("<b>Claimed Rewards:</b>");let h=$("<div class='pop-claimed-rewards-items'></div>");c.append(h)}}shouldRun(){return location.pathname.includes("/activities.html")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let e=$(".switch-tab[data-tab='pop']");e.contents()[0].nodeValue="Places of Power++",e.attr("tooltip","By infarctus"),e.on("click",()=>{this.buildPopGirlAssignments(),this.buildCustomPopInfo()}),this.injectCustomStyles()}buildCustomPopInfo(){let e=$("#pop_info");if(!e.length)return;e.empty();let t=$('<div class="pop-details-container"></div>');e.append(t);let o=$('<div class="pop-records-container"></div>'),s="";Object.entries(pop_data).forEach(([a,r])=>{let i=$('<div class="pop-record"></div>');i.attr("data-pop-id",a),i.css("background-image",`url(${r.image})`),i.on("click",()=>{$(".pop-record").removeClass("selected"),i.addClass("selected"),this.buildPopDetails(a)});let l=$(`<img src="https://hh.hh-content.com/pictures/misc/items_icons/${r.class}.png" class="pop-icon" />`);i.append(l);let p=$(`<div class="pop-lvl">Lv. ${r.level}</div>`);if(i.append(p),r.status==="in_progress"){let m=$('<div class="pop-timer"></div>'),c=shared.timer.buildTimer(r.remaining_time,"","pop-active-timer",!1);m.append(c),i.append(m)}o.append(i),i.attr("tooltip",r.title)}),e.append(o),$(".pop-record").first().trigger("click"),shared.timer.activateTimers("pop-active-timer",()=>{})}injectCustomStyles(){GM.addStyle(`
      /* Main PoP details container - left side area */
      .pop-details-container {
        position: absolute;
        top: 60px;
        left: 10px;
        width: 685px;
        float: left;
        min-height: 200px;
      }

      /* Girl image container - left side of details area */
      .pop-details-left {
        position: absolute;
        width: 300px;
        max-height: 300px;
      }

      /* Girl portrait image with gradient fade */
      .pop-details-left img {
        height: 800px;
        mask-image: linear-gradient(to top, transparent 45%, black 60%);
        overflow: clip;
        display: block;
      }

      /* Info panel - right side of details area */
      .pop-details-right {
        position: absolute;
        max-width: 320px;
        width: 320px;
        left: 340px;
      }

      /* PoP title text */
      .pop-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      /* Rewards display container */
      .pop-rewards-container {
        display: flex;
        justify-content: space-between;
        max-width: 320px;
      }

      /* Claim and Fill & Start buttons */
      .claimPoPButton, .startPoPButton {
        margin-top: 5px;
        width: -webkit-fill-available;
      }

      /* Claimed rewards section at bottom */
      .pop-claimed-rewards-container {
        position: absolute;
        bottom: 10px;
        left: 340px;
        max-width: 320px;
        width: 320px;
        margin-top: 10px;
      }

      /* Claimed rewards items wrapper */
      .pop-claimed-rewards-items {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-start;
        column-gap: 20px;
        row-gap: 5px;
        max-width: 320px;
      }

      /* PoP thumbnail grid container - right side */
      .pop-records-container {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 4px !important;
        justify-content: start;
        align-items: start;
        width: 300px !important;
        margin-bottom: 10px;
        position: absolute !important;
        top: 60px !important;
        right: 15px !important;
      }

      /* Individual PoP thumbnail card */
      .pop-record {
        background-size: cover;
        background-position: center;
        position: relative;
        padding: 6px;
        border-radius: 3px;
        min-height: 58px;
        width: 100px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        cursor: pointer;
      }

      /* Selected PoP thumbnail highlight */
      .pop-record.selected {
        border: 2px solid #ffcc00 !important;
        box-shadow: 0 0 10px rgba(255, 204, 0, 0.5) !important;
      }

      /* PoP class icon (top left of thumbnail) */
      .pop-icon {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 15px;
        height: 15px;
        filter: drop-shadow(0 0 1px rgba(0,0,0,0.6)) drop-shadow(1px 1px 1px rgba(0,0,0,0.6)) drop-shadow(-1px -1px 1px rgba(0,0,0,0.6)) drop-shadow(1px -1px 1px rgba(0,0,0,0.6)) drop-shadow(-1px 1px 1px rgba(0,0,0,0.6));
      }

      /* PoP level badge (top right of thumbnail) */
      .pop-lvl {
        position: absolute;
        top: 3px;
        right: 3px;
        background: rgba(0,0,0,0.6);
        font-size: 12px;
        color: #ffb827;
      }

      /* Timer display (bottom of thumbnail) */
      .pop-timer {
        position: absolute;
        bottom: 3px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 1px 3px;
        border-radius: 1px;
        font-size: 8px;
      }
    `)}};var k=class{constructor(){this.allModules=[new f,new v,new w,new _,new b,new P,new x,new y];if(unsafeWindow.hhPlusPlusConfig===void 0){Promise.race([new Promise(n=>{$(document).one("hh++-bdsm:loaded",()=>n("hh++-bdsm:loaded"))}),new Promise(n=>setTimeout(()=>n("timeout"),50))]).then(n=>{n==="hh++-bdsm:loaded"?this.run():this.runWithoutBdsm()});return}this.run()}run(){unsafeWindow.hhPlusPlusConfig.registerGroup({key:"severalQoL",name:"<span tooltip='by infarctus'>Several QoL</span>"}),this.allModules.forEach(n=>{unsafeWindow.hhPlusPlusConfig.registerModule(n)}),unsafeWindow.hhPlusPlusConfig.loadConfig(),unsafeWindow.hhPlusPlusConfig.runModules()}runWithoutBdsm(){this.allModules.forEach(n=>{try{let e=n.configSchema;if(n.shouldRun())if(e.subSettings){let t=e.subSettings.reduce((o,s)=>(o[s.key]=!0,o),{});n.run(t)}else n.run(void 0)}catch(e){console.error("Error running module",n,e)}})}};new k;})();
