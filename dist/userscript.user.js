// ==UserScript==
// @name         Several QoL
// @namespace    http://tampermonkey.net/
// @version      1.4.1
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

"use strict";(()=>{var d=class{constructor(s){this.hasRun=!1;this.group="severalQoL",this.configSchema=s}};var C={baseKey:"popupPlusPlus",label:"<span tooltip='Stacking popups,click on popups to make it disappear'>Popup++</span>",default:!0},b=class extends d{constructor(){super(C)}shouldRun(){return!0}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0,GM.addStyle("#toast-popups {display:inherit!important;}");let s={},e=null;delete shared.general.objectivePopup.show,shared.general.objectivePopup.show=function(o){if(this.LastPoints==null&&(this.LastPoints={}),!(!o.objective_points||o.battle_result)){if(!o.objective_points){let i=o.objective_points;if(Object.keys(this.pointsBox).length)for(let a in i)this.pointsBox[a]?this.pointsBox[a].name===i[a].name&&(this.pointsBox[a].points_gained+=i[a].points_gained):this.pointsBox[a]=i[a];else this.pointsBox=o.objective_points;o?.end?.rewards?.hasOwnProperty("lose")}t(this,o.objective_points)}};function t(o,i){let a=new Set;Object.keys(i).map((r=>{let l=i[r];if(!s[r])s[r]=l,l.points_gained>0&&a.add(r);else{let p=l.points_gained;p>0&&a.add(r),s[r].points_gained+=p}}));let n=$(`<div class="popup_wrapper"><div id="objective_popup" class="popup"><div class="noti_box"><div class="points">${Object.keys(s).map((r=>{let l=s[r];return`<div class="row animate" style="transition: all 20ms;"><div class="contest_name">${l.title}:</div><div class="contest_points"><div class="points_name" style="animation:none;">${l.name}: </div><div class="points_num" style="animation:none;"><div class="points_i" style="animation:none;">+${number_format_lang(l.points_gained)}</div></div></div></div>`})).join("")}</div></div></div></div></div>`);$("#toast-popups .popup_wrapper").remove(),$("#toast-popups").css("display","unset"),$("#toast-popups"),$("#toast-popups").append(n),$("#toast-popups").css("display","unset"),e&&(clearTimeout(e),e=null),e=setTimeout(()=>{n.remove(),e=null,s={}},5e3),n.on("click.removePopup",function(){n.remove(),e=null,s={}})}}};var H={baseKey:"girlsToWiki",label:"Girls to Wiki (HH)",default:!1,subSettings:[{key:"infoBubbleNameToWiki",default:!0,label:"Info bubble name clickable to wiki"},{key:"portraitToWiki",default:!1,label:"Make portrait clickable to wiki"}]},_=class extends d{constructor(){super(H)}shouldRun(){return location.host.includes("heroes")}run(s){this.hasRun||!this.shouldRun()||(this.hasRun=!0,s?.infoBubbleNameToWiki&&setInterval(()=>{M()},500),s?.portraitToWiki&&setInterval(()=>{O()},500))}};function M(){$(".new_girl_info .girl_name_wrap > h5[style!='cursor: pointer;']").each(function(){let u=$(this);u.css("cursor","pointer"),u.on("click.InfoBubbleToWiki",function(){let s=u.attr("hh_title");if(!s)return;let e=s.replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${e}`,{active:!0})})})}function O(){$(".slot_girl_shards > [data-new-girl-tooltip][style!='cursor: pointer;']").each(function(){let u=$(this),s=u.attr("data-new-girl-tooltip");if(!s)return;let e=s.match(/"name":"(.+)","rarity/);e&&e[1]&&(u.css("cursor","pointer"),u.on("click.ImgToWiki",function(t){t.stopPropagation();let o=e[1].replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${o}`,{active:!0})}))})}var P=class extends d{constructor(){let s={baseKey:"entirePaid",label:"Removes only $ options",default:!1};super(s)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle(".pass_reward.reward_wrapper{display:none!important;}"),GM.addStyle("#gsp_btn_holder{display:none!important;}"),GM.addStyle(".rewards_seasons_row .rewards_pair .tier_number{top:100%!important;}"),GM.addStyle("#get_mega_pass_shop_btn{display:none!important;}"),GM.addStyle("#bundles_tab{display:none!important;}"),GM.addStyle(".purchase-shop{display:none!important;}"))}};var B={baseKey:"tighterPoPs",label:"Tighter PoPs (requires css tweaks for PoP)",default:!0},v=class extends d{constructor(){super(B)}shouldRun(){return location.pathname.includes("/activities.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle("#pop .pop_list .pop-action-btn {margin-bottom: 0.4rem!important;margin-top: 0rem!important;}#pop .pop_list .pop_list_scrolling_area .pop_thumb img {height: 90px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_expanded {height: 89px!important;background: linear-gradient(0deg, #00000087, transparent)!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container, .activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_active {min-height: 89px!important;height: 89px!important;margin-bottom: 5px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb>.pop_thumb_level {top: -93px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb.pop_thumb_active[status=pending_reward]>.pop_thumb_space {top: -126px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .collect_notif {margin-top: -91px!important;margin-left: 121px!important;}.activities-container .pop_thumb_progress_bar {margin-top: 21px!important;}"))}};var g=class{static doWhenSelectorAvailable(s,e){if($(s).length)e();else{let t=new MutationObserver(()=>{$(s).length&&(t.disconnect(),e())});t.observe(document.documentElement,{childList:!0,subtree:!0})}}};var j={baseKey:"labyTeamPreset",label:"<span tooltip='Add a button to register laby team presets, and to apply it'>Laby Team Preset</span>",default:!0},w=class extends d{constructor(){super(j);this.savedTeamPresetKey="SeveralQoL_LabyTeamPreset"}shouldRun(){return location.pathname.includes("/edit-labyrinth-team.html")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let e=$(".boss-bang-panel"),t=$('<button class="green_button_L" tooltip="Save preset for later runs">Save Preset</button>');t.on("click",()=>{this.saveCurrentPreset(),o.removeAttr("disabled")}),e.append(t);let o=$(`<button class="green_button_L" tooltip="Use previously saved preset & leave page" ${localStorage.getItem(this.savedTeamPresetKey)?"":"disabled"}>Fill Preset</button>`);o.on("click",()=>{this.loadSavedPreset()}),g.doWhenSelectorAvailable(".change-team-panel .player-team .average-lvl",()=>{$(".change-team-panel .player-team .average-lvl").replaceWith(o)})}saveCurrentPreset(){let e=[];$(".team-hexagon .team-member-container").each(function(){let t=$(this).attr("data-team-member-position"),o=$(this).attr("data-girl-id");$(this).is("[data-girl-id]")&&t&&o&&(e[t]=o)}),console.log("Saving preset: ",e),localStorage.setItem(this.savedTeamPresetKey,JSON.stringify(e))}loadSavedPreset(){let e=localStorage.getItem(this.savedTeamPresetKey);if(!e){console.warn("No saved preset found");return}try{let t=JSON.parse(e);console.log("Loading preset: ",t);let o={class:"Hero",action:"edit_team",girls:t,battle_type:"labyrinth",id_team:unsafeWindow.teamId};console.log("AJAX settings: ",o),shared.general.hh_ajax(o,i=>{shared.general.navigate(unsafeWindow.redirectUrl)})}catch(t){console.error("Failed to load preset:",t)}}};var x=class extends d{constructor(){let s={baseKey:"noAnnoyingPopups",label:"Removes annoying popup appearing automaticly for shops, paths, news",default:!1};super(s)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,document.cookie="disabledPopups=PassReminder,Bundles,News; path=/")}};var G={baseKey:"whaleBossTournament",label:"Renames WBT to Whale Boss Tournament",default:!1},y=class extends d{constructor(){super(G)}shouldRun(){return location.pathname.includes("/home.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,g.doWhenSelectorAvailable(".world-boss .title",()=>{$(".world-boss .title").text("Whale Boss Tournament")}))}};var W={baseKey:"placesOfPowerPlusPlus",label:"Places of Power++ (Beta)",default:!1},S=class extends d{constructor(){super(W);this.popPresets={}}convertCriteriaKey(e){return e.replace("_","")}buildSinglePopAssignment(e){let t=new Set;Object.values(pop_hero_girls).forEach(o=>{o.id_places_of_power!==null&&t.add(o.id_girl)}),Object.entries(this.popPresets).forEach(([o,i])=>{parseInt(o)!==e&&i.forEach(a=>t.add(a))}),this.assignGirlsToPoP(e,t)}assignGirlsToPoP(e,t){let o=Object.values(pop_data).find(r=>r.id_places_of_power===e);if(!o)return;let i=o.criteria,a=o.max_team_power;if(this.popPresets[e]&&this.popPresets[e].length>0&&o.status==="pending_reward"){let r=this.popPresets[e].filter(p=>{let m=Object.values(pop_hero_girls).find(c=>c.id_girl===p);return m&&(m.id_places_of_power===null||m.id_places_of_power===e)});if(this.calculatePresetPower(r,i)>=a){r.forEach(p=>t.add(p));return}else this.fillFromPreset(e,r,a,i,t)}else{let r=this.selectOptimalGirls(e,a,i,t);this.popPresets[e]=r,r.forEach(l=>t.add(l))}}calculatePresetPower(e,t){let o=0,i=this.convertCriteriaKey(t);for(let a of e){let n=Object.values(pop_hero_girls).find(r=>r.id_girl===a);n&&(o+=n[i])}return o}fillFromPreset(e,t,o,i,a){t.forEach(c=>a.add(c));let n=this.calculatePresetPower(t,i),r=o-n,l=Object.values(pop_hero_girls).filter(c=>!t.includes(c.id_girl)&&!a.has(c.id_girl)&&(c.id_places_of_power===null||c.id_places_of_power===e)),p=this.selectGirlsForRemainingPower(l,r,i);this.popPresets[e]=[...t,...p],p.forEach(c=>a.add(c));let m=this.calculatePresetPower(this.popPresets[e],i)}selectOptimalGirls(e,t,o,i){let a=Object.values(pop_hero_girls).filter(r=>!i.has(r.id_girl)&&(r.id_places_of_power===null||r.id_places_of_power===e));return a.length===0?(console.error(`[PoP ${e}] No available girls! All girls might be assigned to other PoPs.`),[]):this.selectGirlsForRemainingPower(a,t,o)}selectGirlsForRemainingPower(e,t,o){let i=[],a=this.convertCriteriaKey(o),n=[...e].sort((r,l)=>l[a]-r[a]);for(let r of n){let l=r[a];if(l<=t)t-=l,i.push(r.id_girl);else if(i.length===0||t>0){let p=l-t,m=r;for(let c=n.indexOf(r)+1;c<n.length;c++){let h=n[c],f=h[a],R=f-t;if(f<=t)break;R<p&&(p=R,m=h)}t>0&&(i.push(m.id_girl),t-=m[a]);break}}return i}sendClaimRequest(e){shared.animations.loadingAnimation.start();let t=pop_data[parseInt(e)];if($(".claimPoPButton").prop("disabled",!0),t.ends_in===null||t.ends_in!==0)$(".claimPoPButton").css("display","none"),$(".startPoPButton").css("display",""),pop_data[parseInt(e)].status="can_start",$(".pop-record.selected .collect_notif").remove();else{let i=$(".pop-record.selected");i.next().trigger("click"),i.remove()}let o={namespace:"h\\PlacesOfPower",class:t.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"claim",id_place_of_power:t.id_places_of_power};shared.general.hh_ajax(o,i=>{let a=$(".pop-claimed-rewards-items");if(a.length){if(i.rewards.data.rewards){let n=shared.reward.newReward.multipleSlot(i.rewards.data.rewards);a.append(n)}shared.animations.loadingAnimation.stop()}})}calculateTimeToFinish(e,t){let o=this.convertCriteriaKey(e.criteria),i=0;for(let n of t){let r=Object.values(pop_hero_girls).find(l=>l.id_girl===n);r&&(i+=r[o])}if(i>=e.max_team_power)return 360*60;let a=e.level_power/i;return Math.floor(a*60)}sendFillRequest(e){shared.animations.loadingAnimation.start();let t=pop_data[parseInt(e)];if(t.status!=="can_start")return;let o=t.id_places_of_power;console.log(`[PoP ${o}] Building girl assignment for this PoP...`),this.buildSinglePopAssignment(o);let i=this.popPresets[o]||[];if(i.length===0){alert("No girls were assigned to this PoP. This might happen if all your girls are already assigned to other PoPs."),shared.animations.loadingAnimation.stop();return}let a=this.convertCriteriaKey(t.criteria),n=0;for(let m of i){let c=Object.values(pop_hero_girls).find(h=>h.id_girl===m);c&&(n+=c[a])}if(n<t.max_team_power&&!confirm(`Warning: This PoP is not fully maxed!

Current Power: ${Math.floor(n)}
Max Power: ${t.max_team_power}

This will take longer than 6 hours to complete.
Do you want to continue?`)){$(".startPoPButton").css("display",""),$(".claimPoPButton").css("display","none"),shared.animations.loadingAnimation.stop();return}$(".startPoPButton").css("display","none"),$(".claimPoPButton").css("display","");let r={namespace:"h\\PlacesOfPower",class:t.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"start",id_place_of_power:o,selected_girls:i},l=$('<div class="pop-timer"></div>'),p=shared.timer.buildTimer(this.calculateTimeToFinish(t,i),"","pop-active-timer",!1);l.append(p),$(".pop-record.selected").append(l),shared.timer.activateTimers("pop-record.selected .pop-active-timer",()=>{}),shared.general.hh_ajax(r,m=>{shared.animations.loadingAnimation.stop()})}buildPopDetails(e){let t=$(".pop-details-container");if(!t.length)return;t.children().not(".pop-claimed-rewards-container").remove();let o=pop_data[parseInt(e)];if(!o)return;let i=$('<div class="pop-details-left"></div>');t.append(i);let a=$("<img></img>");a.attr("src",o.girl?o.girl.avatar:IMAGES_URL+"/pictures/girls/1/avb0-1200x.webp?a=1"),i.append(a);let n=$('<div class="pop-navigation-buttons-original blue_button_L">Visit Original</div>');n.on("click",()=>{shared.general.navigate("/activities.html?tab=pop&index=")}),i.append(n);let r=$("<div class='pop-details-right'></div>");t.prepend(r);let l=$(`<a tooltip="Visit this PoP original page" class="pop-title" href="${shared.general.getDocumentHref("/activities.html?tab=pop&index="+o.id_places_of_power)}">${o.title}</div>`);r.append(l);let p=$('<div class="pop-rewards-container"></div>');for(let[h,f]of Object.entries(o.rewards))if(f.loot){let R=shared.reward.newReward.multipleSlot(f);p.append(R);break}r.append(p);let m=$(`<button class="purple_button_L claimPoPButton" ${o.status!="pending_reward"?"disabled":""}>Claim</button>`);r.append(m),m.on("click",()=>{this.sendClaimRequest(e)});let c=$('<button class="blue_button_L startPoPButton">Fill & Start</button>');if(c.on("click",()=>{this.sendFillRequest(e)}),r.append(c),o.status!=="can_start"?c.css("display","none"):m.css("display","none"),!$(".pop-claimed-rewards-container").length){let h=$("<div class='pop-claimed-rewards-container'></div>");t.append(h),h.append("<b>Claimed Rewards:</b>");let f=$("<div class='pop-claimed-rewards-items'></div>");h.append(f)}}shouldRun(){return location.pathname.includes("/activities.html")&&!location.search.includes("?tab=pop&index=")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let e=$(".switch-tab[data-tab='pop']");e.contents()[0].nodeValue="Places of Power++",e.attr("tooltip","By infarctus"),e.on("click",()=>{this.buildCustomPopInfo()}),this.injectCustomStyles()}buildCustomPopInfo(){let e=$("#pop_info");if(!e.length)return;e.empty();let t=$('<div class="pop-details-container"></div>');e.append(t);let o=$('<div class="pop-records-container"></div>');Object.entries(pop_data).forEach(([i,a])=>{let n=$('<div class="pop-record"></div>');n.attr("data-pop-id",i),n.css("background-image",`url(${a.image})`),n.on("click",()=>{$(".pop-record").removeClass("selected"),n.addClass("selected"),this.buildPopDetails(i)});let r=$(`<img src="https://hh.hh-content.com/pictures/misc/items_icons/${a.class}.png" class="pop-icon" />`);n.append(r);let l=$(`<div class="pop-lvl">Lv. ${a.level}</div>`);if(n.append(l),a.status==="in_progress"){let p=$('<div class="pop-timer"></div>'),m=shared.timer.buildTimer(a.remaining_time,"","pop-active-timer",!1);p.append(m),n.append(p)}if(a.status==="pending_reward"){let p=$('<div class="collect_notif"></div>');n.append(p)}o.append(n),n.attr("tooltip",a.title)}),e.append(o),$(".pop-record").first().trigger("click"),shared.timer.activateTimers("pop-active-timer",()=>{})}injectCustomStyles(){GM.addStyle(`
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
    `)}};var I={baseKey:"noReloadFromClaimingDailyChests",label:"No reload from claiming daily chests",default:!0},k=class extends d{constructor(){super(I)}shouldRun(){return!0}run(){if(this.hasRun||!this.shouldRun())return location.pathname.includes("/activities.html");this.hasRun=!0,$(".switch-tab[data-tab='daily_goals']").on("click",()=>{console.log("Clicked daily goals"),g.doWhenSelectorAvailable(".progress-bar-claim-reward",()=>{this.applyNoReloadFix()})})}applyNoReloadFix(){$(".progress-bar-claim-reward").off("click").on("click",function(s){s.stopPropagation(),s.preventDefault(),$(this).prop("disabled",!0);let e={action:"claim_daily_goal_tier_reward",tier:$(this).attr("tier")};shared.general.hh_ajax(e,function(t){let o=t.rewards;shared.reward_popup.Reward.handlePopup(o)})}),$(".progress-bar-claim-reward").attr("tooltip","Several QoL: Claim without reload")}};var T=class{constructor(){this.allModules=[new b,new w,new x,new P,new _,new v,new y,new S,new k];if(unsafeWindow.hhPlusPlusConfig===void 0){Promise.race([new Promise(s=>{$(document).one("hh++-bdsm:loaded",()=>s("hh++-bdsm:loaded"))}),new Promise(s=>setTimeout(()=>s("timeout"),50))]).then(s=>{s==="hh++-bdsm:loaded"?this.run():this.runWithoutBdsm()});return}this.run()}run(){unsafeWindow.hhPlusPlusConfig.registerGroup({key:"severalQoL",name:"<span tooltip='by infarctus'>Several QoL</span>"}),this.allModules.forEach(s=>{unsafeWindow.hhPlusPlusConfig.registerModule(s)}),unsafeWindow.hhPlusPlusConfig.loadConfig(),unsafeWindow.hhPlusPlusConfig.runModules()}runWithoutBdsm(){this.allModules.forEach(s=>{try{let e=s.configSchema;if(s.shouldRun())if(e.subSettings){let t=e.subSettings.reduce((o,i)=>(o[i.key]=!0,o),{});s.run(t)}else s.run(void 0)}catch(e){console.error("Error running module",s,e)}})}};new T;})();
