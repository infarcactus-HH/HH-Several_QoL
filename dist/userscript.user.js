// ==UserScript==
// @name         Several QoL
// @namespace    http://tampermonkey.net/
// @version      1.5.2
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

"use strict";(()=>{var d=class{constructor(a){this.hasRun=!1;this.group="severalQoL",this.configSchema=a}};var C={baseKey:"popupPlusPlus",label:"<span tooltip='Stacking popups,click on popups to make it disappear'>Popup++</span>",default:!0},b=class extends d{constructor(){super(C)}shouldRun(){return!0}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0,GM.addStyle("#toast-popups {display:inherit!important;}");let a={},t=null;delete shared.general.objectivePopup.show,shared.general.objectivePopup.show=function(o){if(this.LastPoints==null&&(this.LastPoints={}),!(!o.objective_points||o.battle_result)){if(!o.objective_points){let i=o.objective_points;if(Object.keys(this.pointsBox).length)for(let s in i)this.pointsBox[s]?this.pointsBox[s].name===i[s].name&&(this.pointsBox[s].points_gained+=i[s].points_gained):this.pointsBox[s]=i[s];else this.pointsBox=o.objective_points;o?.end?.rewards?.hasOwnProperty("lose")}e(this,o.objective_points)}};function e(o,i){let s=new Set;Object.keys(i).map((n=>{let l=i[n];if(!a[n])a[n]=l,l.points_gained>0&&s.add(n);else{let c=l.points_gained;c>0&&s.add(n),a[n].points_gained+=c}}));let r=$(`<div class="popup_wrapper"><div id="objective_popup" class="popup"><div class="noti_box"><div class="points">${Object.keys(a).map((n=>{let l=a[n];return`<div class="row animate" style="transition: all 20ms;"><div class="contest_name">${l.title}:</div><div class="contest_points"><div class="points_name" style="animation:none;">${l.name}: </div><div class="points_num" style="animation:none;"><div class="points_i" style="animation:none;">+${number_format_lang(l.points_gained)}</div></div></div></div>`})).join("")}</div></div></div></div></div>`);$("#toast-popups .popup_wrapper").remove(),$("#toast-popups").css("display","unset"),$("#toast-popups"),$("#toast-popups").append(r),$("#toast-popups").css("display","unset"),t&&(clearTimeout(t),t=null),t=setTimeout(()=>{r.remove(),t=null,a={}},5e3),r.on("click.removePopup",function(){r.remove(),t=null,a={}})}}};var H={baseKey:"girlsToWiki",label:"Girls to Wiki (HH)",default:!1,subSettings:[{key:"infoBubbleNameToWiki",default:!0,label:"Info bubble name clickable to wiki"},{key:"portraitToWiki",default:!1,label:"Make portrait clickable to wiki"}]},_=class extends d{constructor(){super(H)}shouldRun(){return location.host.includes("heroes")}run(a){this.hasRun||!this.shouldRun()||(this.hasRun=!0,a?.infoBubbleNameToWiki&&setInterval(()=>{G()},500),a?.portraitToWiki&&setInterval(()=>{M()},500))}};function G(){$(".new_girl_info .girl_name_wrap > h5[style!='cursor: pointer;']").each(function(){let u=$(this);u.css("cursor","pointer"),u.on("click.InfoBubbleToWiki",function(){let a=u.attr("hh_title");if(!a)return;let t=a.replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${t}`,{active:!0})})})}function M(){$(".slot_girl_shards > [data-new-girl-tooltip][style!='cursor: pointer;']").each(function(){let u=$(this),a=u.attr("data-new-girl-tooltip");if(!a)return;let t=a.match(/"name":"(.+)","rarity/);t&&t[1]&&(u.css("cursor","pointer"),u.on("click.ImgToWiki",function(e){e.stopPropagation();let o=t[1].replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${o}`,{active:!0})}))})}var P=class extends d{constructor(){let a={baseKey:"entirePaid",label:"Removes only $ options",default:!1};super(a)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle(".pass_reward.reward_wrapper{display:none!important;}"),GM.addStyle("#gsp_btn_holder{display:none!important;}"),GM.addStyle(".rewards_seasons_row .rewards_pair .tier_number{top:100%!important;}"),GM.addStyle("#get_mega_pass_shop_btn{display:none!important;}"),GM.addStyle("#bundles_tab{display:none!important;}"),GM.addStyle(".purchase-shop{display:none!important;}"))}};var B={baseKey:"tighterPoPs",label:"Tighter PoPs (requires css tweaks for PoP)",default:!0},v=class extends d{constructor(){super(B)}shouldRun(){return location.pathname.includes("/activities.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle("#pop .pop_list .pop-action-btn {margin-bottom: 0.4rem!important;margin-top: 0rem!important;}#pop .pop_list .pop_list_scrolling_area .pop_thumb img {height: 90px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_expanded {height: 89px!important;background: linear-gradient(0deg, #00000087, transparent)!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container, .activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_active {min-height: 89px!important;height: 89px!important;margin-bottom: 5px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb>.pop_thumb_level {top: -93px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb.pop_thumb_active[status=pending_reward]>.pop_thumb_space {top: -126px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .collect_notif {margin-top: -91px!important;margin-left: 121px!important;}.activities-container .pop_thumb_progress_bar {margin-top: 21px!important;}"))}};var g=class{static doWhenSelectorAvailable(a,t){if($(a).length)t();else{let e=new MutationObserver(()=>{$(a).length&&(e.disconnect(),t())});e.observe(document.documentElement,{childList:!0,subtree:!0})}}};var O={baseKey:"labyTeamPreset",label:"<span tooltip='Add a button to register laby team presets, and to apply it'>Laby Team Preset</span>",default:!0},w=class extends d{constructor(){super(O);this.savedTeamPresetKey="SeveralQoL_LabyTeamPreset"}shouldRun(){return location.pathname.includes("/edit-labyrinth-team.html")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let t=$(".boss-bang-panel"),e=$('<button class="green_button_L" tooltip="Save preset for later runs">Save Preset</button>');e.on("click",()=>{this.saveCurrentPreset(),o.removeAttr("disabled")}),t.append(e);let o=$(`<button class="green_button_L" tooltip="Use previously saved preset & leave page" ${localStorage.getItem(this.savedTeamPresetKey)?"":"disabled"}>Fill Preset</button>`);o.on("click",()=>{this.loadSavedPreset()}),g.doWhenSelectorAvailable(".change-team-panel .player-team .average-lvl",()=>{$(".change-team-panel .player-team .average-lvl").replaceWith(o)})}saveCurrentPreset(){let t=[];$(".team-hexagon .team-member-container").each(function(){let e=$(this).attr("data-team-member-position"),o=$(this).attr("data-girl-id");$(this).is("[data-girl-id]")&&e&&o&&(t[e]=o)}),console.log("Saving preset: ",t),localStorage.setItem(this.savedTeamPresetKey,JSON.stringify(t))}loadSavedPreset(){let t=localStorage.getItem(this.savedTeamPresetKey);if(!t){console.warn("No saved preset found");return}try{let e=JSON.parse(t);console.log("Loading preset: ",e);let o={class:"Hero",action:"edit_team",girls:e,battle_type:"labyrinth",id_team:unsafeWindow.teamId};console.log("AJAX settings: ",o),shared.general.hh_ajax(o,i=>{shared.general.navigate(unsafeWindow.redirectUrl)})}catch(e){console.error("Failed to load preset:",e)}}};var x=class extends d{constructor(){let a={baseKey:"noAnnoyingPopups",label:"Removes annoying popup appearing automaticly for shops, paths, news",default:!1};super(a)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,document.cookie="disabledPopups=PassReminder,Bundles,News; path=/")}};var I={baseKey:"whaleBossTournament",label:"Renames WBT to Whale Boss Tournament",default:!1},y=class extends d{constructor(){super(I)}shouldRun(){return location.pathname.includes("/home.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,g.doWhenSelectorAvailable(".world-boss .title",()=>{$(".world-boss .title").text("Whale Boss Tournament")}))}};var j={baseKey:"placesOfPowerPlusPlus",label:"Places of Power++ (Beta)",default:!1},k=class extends d{constructor(){super(j);this.popPresets={};this.girlBackToPool=new Set}convertCriteriaKey(t){return t.replace("_","")}assignGirlsToPoP(t){let e=Object.values(pop_data).find(r=>r.id_places_of_power===t);if(!e)return;let o=e.criteria,i=e.max_team_power,s=this.selectOptimalGirls(t,i,o);this.popPresets[t]=s}calculatePresetPower(t,e){let o=0,i=this.convertCriteriaKey(e);for(let s of t){let r=Object.values(pop_hero_girls).find(n=>n.id_girl===s);r&&(o+=r[i])}return o}selectOptimalGirls(t,e,o){let i=Object.values(pop_hero_girls);if(i.length===0)return console.error(`[PoP ${t}] No available girls! All girls might be assigned to other PoPs.`),[];let s=[],r=[];for(let p of i)this.girlBackToPool.has(p.id_girl)?s.push(p):r.push(p);let n=this.selectGirlsForRemainingPower(s,e,o),l=this.convertCriteriaKey(o),c=0;for(let p of n){let m=i.find(h=>h.id_girl===p);m&&(c+=m[l])}if(c<e){let p=this.selectGirlsForRemainingPower(r,e-c,o);n.push(...p)}return n}selectGirlsForRemainingPower(t,e,o){let i=[],s=this.convertCriteriaKey(o),r=[...t].sort((n,l)=>l[s]-n[s]);for(let n of r){let l=n[s];if(l<=e)e-=l,i.push(n.id_girl);else if(i.length===0||e>0){let c=l-e,p=n;for(let m=r.indexOf(n)+1;m<r.length;m++){let h=r[m],f=h[s],R=f-e;if(f<=e)break;R<c&&(c=R,p=h)}e>0&&(i.push(p.id_girl),e-=p[s]);break}}return i}readdGirlsFromCurrentPoP(t){let e=parseInt(t);for(let o of Object.values(pop_hero_girls))o.id_places_of_power===e&&this.girlBackToPool.add(o.id_girl)}selectNextPoP(t){t.length!==0&&(t.next().length!==0?t.next().trigger("click"):$(".pop-record").first().trigger("click"))}sendClaimRequest(t){this.readdGirlsFromCurrentPoP(t),shared.animations.loadingAnimation.start();let e=pop_data[parseInt(t)];if($(".claimPoPButton").prop("disabled",!0),e.ends_in===null||e.ends_in!==0)$(".claimPoPButton").css("display","none"),$(".startPoPButton").css("display",""),pop_data[parseInt(t)].status="can_start",$(".pop-record.selected .collect_notif").remove();else{let i=$(".pop-record.selected");this.selectNextPoP(i),i.remove()}let o={namespace:"h\\PlacesOfPower",class:e.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"claim",id_place_of_power:e.id_places_of_power};shared.general.hh_ajax(o,i=>{let s=$(".pop-claimed-rewards-items");if(s.length){if(i.rewards.data.rewards){let r=shared.reward.newReward.multipleSlot(i.rewards.data.rewards);s.append(r)}shared.animations.loadingAnimation.stop()}})}calculateTimeToFinish(t,e){let o=this.convertCriteriaKey(t.criteria),i=0;for(let r of e){let n=Object.values(pop_hero_girls).find(l=>l.id_girl===r);n&&(i+=n[o])}if(i>=t.max_team_power)return 360*60;let s=t.level_power/i;return Math.floor(s*60)}sendFillRequest(t){shared.animations.loadingAnimation.start();let e=pop_data[parseInt(t)];if(e.status!=="can_start")return;let o=e.id_places_of_power;console.log(`[PoP ${o}] Building girl assignment for this PoP...`),this.assignGirlsToPoP(o);let i=this.popPresets[o]||[];if(i.length===0){alert("No girls were assigned to this PoP. This might happen if all your girls are already assigned to other PoPs."),delete this.popPresets[o],shared.animations.loadingAnimation.stop();return}let s=this.convertCriteriaKey(e.criteria),r=0;for(let p of i){let m=Object.values(pop_hero_girls).find(h=>h.id_girl===p);m&&(r+=m[s])}if(r<e.max_team_power&&!confirm(`Warning: This PoP is not fully maxed!

Current Power: ${Math.floor(r)}
Max Power: ${e.max_team_power}

This will take longer than 6 hours to complete.
Do you want to continue?`)){delete this.popPresets[o],$(".startPoPButton").css("display",""),$(".claimPoPButton").css("display","none"),shared.animations.loadingAnimation.stop();return}i.forEach(p=>this.girlBackToPool.delete(p)),$(".startPoPButton").css("display","none"),$(".claimPoPButton").css("display","");let n={namespace:"h\\PlacesOfPower",class:e.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"start",id_place_of_power:o,selected_girls:i},l=$('<div class="pop-timer"></div>'),c=shared.timer.buildTimer(this.calculateTimeToFinish(e,i),"","pop-active-timer",!1);l.append(c),$(".pop-record.selected").append(l),shared.timer.activateTimers("pop-record.selected .pop-active-timer",()=>{}),pop_data[parseInt(t)].status="in_progress",shared.general.hh_ajax(n,p=>{shared.animations.loadingAnimation.stop(),this.selectNextPoP($(".pop-record.selected"))})}buildPopDetails(t){let e=$(".pop-details-container");if(!e.length)return;e.children().not(".pop-claimed-rewards-container").remove();let o=pop_data[parseInt(t)];if(!o)return;let i=$('<div class="pop-details-left"></div>');e.append(i);let s=$("<img></img>");s.attr("src",o.girl?o.girl.avatar:IMAGES_URL+"/pictures/girls/1/avb0-1200x.webp?a=1"),i.append(s);let r=$('<div class="pop-navigation-buttons-original blue_button_L">Visit Original</div>');r.on("click",()=>{shared.general.navigate("/activities.html?tab=pop&index=")}),i.append(r);let n=$("<div class='pop-details-right'></div>");e.prepend(n);let l=$(`<a tooltip="Visit this PoP original page" class="pop-title" href="${shared.general.getDocumentHref("/activities.html?tab=pop&index="+o.id_places_of_power)}">${o.title}</div>`);n.append(l);let c=$('<div class="pop-rewards-container"></div>');for(let[h,f]of Object.entries(o.rewards))if(f.loot){let R=shared.reward.newReward.multipleSlot(f);c.append(R);break}n.append(c);let p=$(`<button class="purple_button_L claimPoPButton" ${o.status!="pending_reward"?"disabled":""}>Claim</button>`);n.append(p),p.on("click",()=>{this.sendClaimRequest(t)});let m=$('<button class="blue_button_L startPoPButton">Fill & Start</button>');if(m.on("click",()=>{this.sendFillRequest(t)}),n.append(m),o.status!=="can_start"?m.css("display","none"):p.css("display","none"),!$(".pop-claimed-rewards-container").length){let h=$("<div class='pop-claimed-rewards-container'></div>");e.append(h),h.append("<b>Claimed Rewards:</b>");let f=$("<div class='pop-claimed-rewards-items'></div>");h.append(f)}}shouldRun(){return location.pathname.includes("/activities.html")&&!location.search.includes("?tab=pop&index=")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let t=$(".switch-tab[data-tab='pop']");t.contents()[0].nodeValue="Places of Power++",t.attr("tooltip","By infarctus"),t.on("click",()=>{this.buildCustomPopInfo()}),this.injectCustomStyles()}buildCustomPopInfo(){let t=$("#pop_info");if(!t.length)return;t.empty();let e=$('<div class="pop-details-container"></div>');t.append(e);let o=$('<div class="pop-records-container"></div>');Object.entries(pop_data).forEach(([i,s])=>{let r=$('<div class="pop-record"></div>');r.attr("data-pop-id",i),r.css("background-image",`url(${s.image})`),r.on("click",()=>{$(".pop-record").removeClass("selected"),r.addClass("selected"),this.buildPopDetails(i)});let n=$(`<img src="https://hh.hh-content.com/pictures/misc/items_icons/${s.class}.png" class="pop-icon" />`);r.append(n);let l=$(`<div class="pop-lvl">Lv. ${s.level}</div>`);if(r.append(l),s.status==="in_progress"){let c=$('<div class="pop-timer"></div>'),p=shared.timer.buildTimer(s.remaining_time,"","pop-active-timer",!1);c.append(p),r.append(c)}if(s.status==="pending_reward"){let c=$('<div class="collect_notif"></div>');r.append(c)}o.append(r),r.attr("tooltip",s.title)}),t.append(o),$(".pop-record").first().trigger("click"),shared.timer.activateTimers("pop-active-timer",()=>{})}injectCustomStyles(){GM.addStyle(`
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
      /* Visit Original button */
      .pop-navigation-buttons-original {
        top: 0px;
        position: absolute;
        padding: 2px 4px;
        font-size: 10px;
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
        color: white;
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
      
      /* Claim treasure on finished PoP (bottom right of thumbnail) */
      .collect_notif {
        position: absolute;
        bottom: 3px;
        right: 3px;
      }
    `)}};var W={baseKey:"noReloadFromClaimingDailyChests",label:"No reload from claiming daily chests",default:!0},S=class extends d{constructor(){super(W)}shouldRun(){return!0}run(){if(this.hasRun||!this.shouldRun())return location.pathname.includes("/activities.html");this.hasRun=!0,$(".switch-tab[data-tab='daily_goals']").on("click",()=>{console.log("Clicked daily goals"),g.doWhenSelectorAvailable(".progress-bar-claim-reward",()=>{this.applyNoReloadFix()})})}applyNoReloadFix(){$(".progress-bar-claim-reward").off("click").on("click",function(a){a.stopPropagation(),a.preventDefault(),$(this).prop("disabled",!0);let t={action:"claim_daily_goal_tier_reward",tier:$(this).attr("tier")};shared.general.hh_ajax(t,function(e){let o=e.rewards;shared.reward_popup.Reward.handlePopup(o)})}),$(".progress-bar-claim-reward").attr("tooltip","Several QoL: Claim without reload")}};var T=class{constructor(){this.allModules=[new b,new w,new x,new P,new _,new v,new y,new k,new S];if(unsafeWindow.hhPlusPlusConfig===void 0){Promise.race([new Promise(a=>{$(document).one("hh++-bdsm:loaded",()=>a("hh++-bdsm:loaded"))}),new Promise(a=>setTimeout(()=>a("timeout"),50))]).then(a=>{a==="hh++-bdsm:loaded"?this.run():this.runWithoutBdsm()});return}this.run()}run(){unsafeWindow.hhPlusPlusConfig.registerGroup({key:"severalQoL",name:"<span tooltip='by infarctus'>Several QoL</span>"}),this.allModules.forEach(a=>{unsafeWindow.hhPlusPlusConfig.registerModule(a)}),unsafeWindow.hhPlusPlusConfig.loadConfig(),unsafeWindow.hhPlusPlusConfig.runModules()}runWithoutBdsm(){this.allModules.forEach(a=>{try{let t=a.configSchema;if(a.shouldRun())if(t.subSettings){let e=t.subSettings.reduce((o,i)=>(o[i.key]=!0,o),{});a.run(e)}else a.run(void 0)}catch(t){console.error("Error running module",a,t)}})}};new T;})();
