// ==UserScript==
// @name         Several QoL
// @namespace    http://tampermonkey.net/
// @version      1.3.1
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

"use strict";(()=>{var m=class{constructor(n){this.hasRun=!1;this.group="severalQoL",this.configSchema=n}};var T={baseKey:"popupPlusPlus",label:"<span tooltip='Stacking popups,click on popups to make it disappear'>Popup++</span>",default:!0},b=class extends m{constructor(){super(T)}shouldRun(){return!0}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0,GM.addStyle("#toast-popups {display:inherit!important;}");let n={},e=null;delete shared.general.objectivePopup.show,shared.general.objectivePopup.show=function(o){if(this.LastPoints==null&&(this.LastPoints={}),!(!o.objective_points||o.battle_result)){if(!o.objective_points){let i=o.objective_points;if(Object.keys(this.pointsBox).length)for(let s in i)this.pointsBox[s]?this.pointsBox[s].name===i[s].name&&(this.pointsBox[s].points_gained+=i[s].points_gained):this.pointsBox[s]=i[s];else this.pointsBox=o.objective_points;o?.end?.rewards?.hasOwnProperty("lose")}t(this,o.objective_points)}};function t(o,i){let s=new Set;Object.keys(i).map((a=>{let l=i[a];if(!n[a])n[a]=l,l.points_gained>0&&s.add(a);else{let p=l.points_gained;p>0&&s.add(a),n[a].points_gained+=p}}));let r=$(`<div class="popup_wrapper"><div id="objective_popup" class="popup"><div class="noti_box"><div class="points">${Object.keys(n).map((a=>{let l=n[a];return`<div class="row animate" style="transition: all 20ms;"><div class="contest_name">${l.title}:</div><div class="contest_points"><div class="points_name" style="animation:none;">${l.name}: </div><div class="points_num" style="animation:none;"><div class="points_i" style="animation:none;">+${number_format_lang(l.points_gained)}</div></div></div></div>`})).join("")}</div></div></div></div></div>`);$("#toast-popups .popup_wrapper").remove(),$("#toast-popups").css("display","unset"),$("#toast-popups"),$("#toast-popups").append(r),$("#toast-popups").css("display","unset"),e&&(clearTimeout(e),e=null),e=setTimeout(()=>{r.remove(),e=null,n={}},5e3),r.on("click.removePopup",function(){r.remove(),e=null,n={}})}}};var C={baseKey:"girlsToWiki",label:"Girls to Wiki (HH)",default:!1,subSettings:[{key:"infoBubbleNameToWiki",default:!0,label:"Info bubble name clickable to wiki"},{key:"portraitToWiki",default:!1,label:"Make portrait clickable to wiki"}]},_=class extends m{constructor(){super(C)}shouldRun(){return location.host.includes("heroes")}run(n){this.hasRun||!this.shouldRun()||(this.hasRun=!0,n?.infoBubbleNameToWiki&&setInterval(()=>{H()},500),n?.portraitToWiki&&setInterval(()=>{M()},500))}};function H(){$(".new_girl_info .girl_name_wrap > h5[style!='cursor: pointer;']").each(function(){let d=$(this);d.css("cursor","pointer"),d.on("click.InfoBubbleToWiki",function(){let n=d.attr("hh_title");if(!n)return;let e=n.replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${e}`,{active:!0})})})}function M(){$(".slot_girl_shards > [data-new-girl-tooltip][style!='cursor: pointer;']").each(function(){let d=$(this),n=d.attr("data-new-girl-tooltip");if(!n)return;let e=n.match(/"name":"(.+)","rarity/);e&&e[1]&&(d.css("cursor","pointer"),d.on("click.ImgToWiki",function(t){t.stopPropagation();let o=e[1].replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${o}`,{active:!0})}))})}var P=class extends m{constructor(){let n={baseKey:"entirePaid",label:"Removes only $ options",default:!1};super(n)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle(".pass_reward.reward_wrapper{display:none!important;}"),GM.addStyle("#gsp_btn_holder{display:none!important;}"),GM.addStyle(".rewards_seasons_row .rewards_pair .tier_number{top:100%!important;}"),GM.addStyle("#get_mega_pass_shop_btn{display:none!important;}"),GM.addStyle("#bundles_tab{display:none!important;}"),GM.addStyle(".purchase-shop{display:none!important;}"))}};var O={baseKey:"tighterPoPs",label:"Tighter PoPs (requires css tweaks for PoP)",default:!0},v=class extends m{constructor(){super(O)}shouldRun(){return location.pathname.includes("/activities.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle("#pop .pop_list .pop-action-btn {margin-bottom: 0.4rem!important;margin-top: 0rem!important;}#pop .pop_list .pop_list_scrolling_area .pop_thumb img {height: 90px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_expanded {height: 89px!important;background: linear-gradient(0deg, #00000087, transparent)!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container, .activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_active {min-height: 89px!important;height: 89px!important;margin-bottom: 5px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb>.pop_thumb_level {top: -93px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb.pop_thumb_active[status=pending_reward]>.pop_thumb_space {top: -126px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .collect_notif {margin-top: -91px!important;margin-left: 121px!important;}.activities-container .pop_thumb_progress_bar {margin-top: 21px!important;}"))}};var f=class{static doWhenSelectorAvailable(n,e){if($(n).length)e();else{let t=new MutationObserver(()=>{$(n).length&&(t.disconnect(),e())});t.observe(document.documentElement,{childList:!0,subtree:!0})}}};var B={baseKey:"labyTeamPreset",label:"<span tooltip='Add a button to register laby team presets, and to apply it'>Laby Team Preset</span>",default:!0},w=class extends m{constructor(){super(B);this.savedTeamPresetKey="SeveralQoL_LabyTeamPreset"}shouldRun(){return location.pathname.includes("/edit-labyrinth-team.html")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let e=$(".boss-bang-panel"),t=$('<button class="green_button_L" tooltip="Save preset for later runs">Save Preset</button>');t.on("click",()=>{this.saveCurrentPreset(),o.removeAttr("disabled")}),e.append(t);let o=$(`<button class="green_button_L" tooltip="Use previously saved preset & leave page" ${localStorage.getItem(this.savedTeamPresetKey)?"":"disabled"}>Fill Preset</button>`);o.on("click",()=>{this.loadSavedPreset()}),f.doWhenSelectorAvailable(".change-team-panel .player-team .average-lvl",()=>{$(".change-team-panel .player-team .average-lvl").replaceWith(o)})}saveCurrentPreset(){let e=[];$(".team-hexagon .team-member-container").each(function(){let t=$(this).attr("data-team-member-position"),o=$(this).attr("data-girl-id");$(this).is("[data-girl-id]")&&t&&o&&(e[t]=o)}),console.log("Saving preset: ",e),localStorage.setItem(this.savedTeamPresetKey,JSON.stringify(e))}loadSavedPreset(){let e=localStorage.getItem(this.savedTeamPresetKey);if(!e){console.warn("No saved preset found");return}try{let t=JSON.parse(e);console.log("Loading preset: ",t);let o={class:"Hero",action:"edit_team",girls:t,battle_type:"labyrinth",id_team:unsafeWindow.teamId};console.log("AJAX settings: ",o),shared.general.hh_ajax(o,i=>{shared.general.navigate(unsafeWindow.redirectUrl)})}catch(t){console.error("Failed to load preset:",t)}}};var x=class extends m{constructor(){let n={baseKey:"noAnnoyingPopups",label:"Removes annoying popup appearing automaticly for shops, paths, news",default:!1};super(n)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,document.cookie="disabledPopups=PassReminder,Bundles,News; path=/")}};var j={baseKey:"whaleBossTournament",label:"Renames WBT to Whale Boss Tournament",default:!1},y=class extends m{constructor(){super(j)}shouldRun(){return location.pathname.includes("/home.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,f.doWhenSelectorAvailable(".world-boss .title",()=>{$(".world-boss .title").text("Whale Boss Tournament")}))}};var G={baseKey:"placesOfPowerPlusPlus",label:"Places of Power++ (Beta)",default:!1},S=class extends m{constructor(){super(G);this.popPresets={}}convertCriteriaKey(e){return e.replace("_","")}buildSinglePopAssignment(e){let t=new Set;Object.values(pop_hero_girls).forEach(o=>{o.id_places_of_power!==null&&t.add(o.id_girl)}),Object.entries(this.popPresets).forEach(([o,i])=>{parseInt(o)!==e&&i.forEach(s=>t.add(s))}),this.assignGirlsToPoP(e,t)}assignGirlsToPoP(e,t){let o=Object.values(pop_data).find(a=>a.id_places_of_power===e);if(!o)return;let i=o.criteria,s=o.max_team_power;if(this.popPresets[e]&&this.popPresets[e].length>0&&o.status==="pending_reward"){let a=this.popPresets[e].filter(p=>{let u=Object.values(pop_hero_girls).find(c=>c.id_girl===p);return u&&(u.id_places_of_power===null||u.id_places_of_power===e)});if(this.calculatePresetPower(a,i)>=s){a.forEach(p=>t.add(p));return}else this.fillFromPreset(e,a,s,i,t)}else{let a=this.selectOptimalGirls(e,s,i,t);this.popPresets[e]=a,a.forEach(l=>t.add(l))}}calculatePresetPower(e,t){let o=0,i=this.convertCriteriaKey(t);for(let s of e){let r=Object.values(pop_hero_girls).find(a=>a.id_girl===s);r&&(o+=r[i])}return o}fillFromPreset(e,t,o,i,s){t.forEach(c=>s.add(c));let r=this.calculatePresetPower(t,i),a=o-r,l=Object.values(pop_hero_girls).filter(c=>!t.includes(c.id_girl)&&!s.has(c.id_girl)&&(c.id_places_of_power===null||c.id_places_of_power===e)),p=this.selectGirlsForRemainingPower(l,a,i);this.popPresets[e]=[...t,...p],p.forEach(c=>s.add(c));let u=this.calculatePresetPower(this.popPresets[e],i)}selectOptimalGirls(e,t,o,i){let s=Object.values(pop_hero_girls).filter(a=>!i.has(a.id_girl)&&(a.id_places_of_power===null||a.id_places_of_power===e));return s.length===0?(console.error(`[PoP ${e}] No available girls! All girls might be assigned to other PoPs.`),[]):this.selectGirlsForRemainingPower(s,t,o)}selectGirlsForRemainingPower(e,t,o){let i=[],s=this.convertCriteriaKey(o),r=[...e].sort((a,l)=>l[s]-a[s]);for(let a of r){let l=a[s];if(l<=t)t-=l,i.push(a.id_girl);else if(i.length===0||t>0){let p=l-t,u=a;for(let c=r.indexOf(a)+1;c<r.length;c++){let h=r[c],g=h[s],k=g-t;if(g<=t)break;k<p&&(p=k,u=h)}t>0&&(i.push(u.id_girl),t-=u[s]);break}}return i}sendClaimRequest(e){shared.animations.loadingAnimation.start();let t=pop_data[parseInt(e)];if($(".claimPoPButton").prop("disabled",!0),t.ends_in===null||t.ends_in!==0)$(".claimPoPButton").css("display","none"),$(".startPoPButton").css("display",""),pop_data[parseInt(e)].status="can_start",$(".pop-record.selected .collect_notif").remove();else{let i=$(".pop-record.selected");i.next().trigger("click"),i.remove()}let o={namespace:"h\\PlacesOfPower",class:t.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"claim",id_place_of_power:t.id_places_of_power};shared.general.hh_ajax(o,i=>{let s=$(".pop-claimed-rewards-items");if(s.length){if(i.rewards.data.rewards){let r=shared.reward.newReward.multipleSlot(i.rewards.data.rewards);s.append(r)}shared.animations.loadingAnimation.stop()}})}calculateTimeToFinish(e,t){let o=this.convertCriteriaKey(e.criteria),i=0;for(let r of t){let a=Object.values(pop_hero_girls).find(l=>l.id_girl===r);a&&(i+=a[o])}if(i>=e.max_team_power)return 360*60;let s=e.level_power/i;return Math.floor(s*60)}sendFillRequest(e){shared.animations.loadingAnimation.start();let t=pop_data[parseInt(e)];if(t.status!=="can_start")return;let o=t.id_places_of_power;console.log(`[PoP ${o}] Building girl assignment for this PoP...`),this.buildSinglePopAssignment(o);let i=this.popPresets[o]||[];if(i.length===0){alert("No girls were assigned to this PoP. This might happen if all your girls are already assigned to other PoPs."),shared.animations.loadingAnimation.stop();return}let s=this.convertCriteriaKey(t.criteria),r=0;for(let u of i){let c=Object.values(pop_hero_girls).find(h=>h.id_girl===u);c&&(r+=c[s])}if(r<t.max_team_power&&!confirm(`Warning: This PoP is not fully maxed!

Current Power: ${Math.floor(r)}
Max Power: ${t.max_team_power}

This will take longer than 6 hours to complete.
Do you want to continue?`)){$(".startPoPButton").css("display",""),$(".claimPoPButton").css("display","none"),shared.animations.loadingAnimation.stop();return}$(".startPoPButton").css("display","none"),$(".claimPoPButton").css("display","");let a={namespace:"h\\PlacesOfPower",class:t.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"start",id_place_of_power:o,selected_girls:i},l=$('<div class="pop-timer"></div>'),p=shared.timer.buildTimer(this.calculateTimeToFinish(t,i),"","pop-active-timer",!1);l.append(p),$(".pop-record.selected").append(l),shared.timer.activateTimers("pop-record.selected .pop-active-timer",()=>{}),shared.general.hh_ajax(a,u=>{shared.animations.loadingAnimation.stop()})}buildPopDetails(e){let t=$(".pop-details-container");if(!t.length)return;t.children().not(".pop-claimed-rewards-container").remove();let o=pop_data[parseInt(e)];if(!o)return;let i=$('<div class="pop-details-left"></div>');t.append(i);let s=$("<img></img>");s.attr("src",o.girl?o.girl.avatar:IMAGES_URL+"/pictures/girls/1/avb0-1200x.webp?a=1"),i.append(s);let r=$('<div class="pop-navigation-buttons-original blue_button_L">Visit Original</div>');r.on("click",()=>{shared.general.navigate("/activities.html?tab=pop&index=")}),i.append(r);let a=$("<div class='pop-details-right'></div>");t.prepend(a);let l=$(`<a tooltip="Visit this PoP original page" class="pop-title" href="${shared.general.getDocumentHref("/activities.html?tab=pop&index="+o.id_places_of_power)}">${o.title}</div>`);a.append(l);let p=$('<div class="pop-rewards-container"></div>');for(let[h,g]of Object.entries(o.rewards))if(g.loot){let k=shared.reward.newReward.multipleSlot(g);p.append(k);break}a.append(p);let u=$(`<button class="purple_button_L claimPoPButton" ${o.status!="pending_reward"?"disabled":""}>Claim</button>`);a.append(u),u.on("click",()=>{this.sendClaimRequest(e)});let c=$('<button class="blue_button_L startPoPButton">Fill & Start</button>');if(c.on("click",()=>{this.sendFillRequest(e)}),a.append(c),o.status!=="can_start"?c.css("display","none"):u.css("display","none"),!$(".pop-claimed-rewards-container").length){let h=$("<div class='pop-claimed-rewards-container'></div>");t.append(h),h.append("<b>Claimed Rewards:</b>");let g=$("<div class='pop-claimed-rewards-items'></div>");h.append(g)}}shouldRun(){return location.pathname.includes("/activities.html")&&!location.search.includes("?tab=pop&index=")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let e=$(".switch-tab[data-tab='pop']");e.contents()[0].nodeValue="Places of Power++",e.attr("tooltip","By infarctus"),e.on("click",()=>{this.buildCustomPopInfo()}),this.injectCustomStyles()}buildCustomPopInfo(){let e=$("#pop_info");if(!e.length)return;e.empty();let t=$('<div class="pop-details-container"></div>');e.append(t);let o=$('<div class="pop-records-container"></div>');Object.entries(pop_data).forEach(([i,s])=>{let r=$('<div class="pop-record"></div>');r.attr("data-pop-id",i),r.css("background-image",`url(${s.image})`),r.on("click",()=>{$(".pop-record").removeClass("selected"),r.addClass("selected"),this.buildPopDetails(i)});let a=$(`<img src="https://hh.hh-content.com/pictures/misc/items_icons/${s.class}.png" class="pop-icon" />`);r.append(a);let l=$(`<div class="pop-lvl">Lv. ${s.level}</div>`);if(r.append(l),s.status==="in_progress"){let p=$('<div class="pop-timer"></div>'),u=shared.timer.buildTimer(s.remaining_time,"","pop-active-timer",!1);p.append(u),r.append(p)}if(s.status==="pending_reward"){let p=$('<div class="collect_notif"></div>');r.append(p)}o.append(r),r.attr("tooltip",s.title)}),e.append(o),$(".pop-record").first().trigger("click"),shared.timer.activateTimers("pop-active-timer",()=>{})}injectCustomStyles(){GM.addStyle(`
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
    `)}};var R=class{constructor(){this.allModules=[new b,new w,new x,new P,new _,new v,new y,new S];if(unsafeWindow.hhPlusPlusConfig===void 0){Promise.race([new Promise(n=>{$(document).one("hh++-bdsm:loaded",()=>n("hh++-bdsm:loaded"))}),new Promise(n=>setTimeout(()=>n("timeout"),50))]).then(n=>{n==="hh++-bdsm:loaded"?this.run():this.runWithoutBdsm()});return}this.run()}run(){unsafeWindow.hhPlusPlusConfig.registerGroup({key:"severalQoL",name:"<span tooltip='by infarctus'>Several QoL</span>"}),this.allModules.forEach(n=>{unsafeWindow.hhPlusPlusConfig.registerModule(n)}),unsafeWindow.hhPlusPlusConfig.loadConfig(),unsafeWindow.hhPlusPlusConfig.runModules()}runWithoutBdsm(){this.allModules.forEach(n=>{try{let e=n.configSchema;if(n.shouldRun())if(e.subSettings){let t=e.subSettings.reduce((o,i)=>(o[i.key]=!0,o),{});n.run(t)}else n.run(void 0)}catch(e){console.error("Error running module",n,e)}})}};new R;})();
