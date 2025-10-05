// ==UserScript==
// @name         Several QoL
// @namespace    http://tampermonkey.net/
// @version      1.4.3
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

"use strict";(()=>{var p=class{constructor(i){this.hasRun=!1;this.group="severalQoL",this.configSchema=i}};var C={baseKey:"popupPlusPlus",label:"<span tooltip='Stacking popups,click on popups to make it disappear'>Popup++</span>",default:!0},b=class extends p{constructor(){super(C)}shouldRun(){return!0}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0,GM.addStyle("#toast-popups {display:inherit!important;}");let i={},e=null;delete shared.general.objectivePopup.show,shared.general.objectivePopup.show=function(t){if(this.LastPoints==null&&(this.LastPoints={}),!(!t.objective_points||t.battle_result)){if(!t.objective_points){let a=t.objective_points;if(Object.keys(this.pointsBox).length)for(let s in a)this.pointsBox[s]?this.pointsBox[s].name===a[s].name&&(this.pointsBox[s].points_gained+=a[s].points_gained):this.pointsBox[s]=a[s];else this.pointsBox=t.objective_points;t?.end?.rewards?.hasOwnProperty("lose")}o(this,t.objective_points)}};function o(t,a){let s=new Set;Object.keys(a).map((n=>{let l=a[n];if(!i[n])i[n]=l,l.points_gained>0&&s.add(n);else{let d=l.points_gained;d>0&&s.add(n),i[n].points_gained+=d}}));let r=$(`<div class="popup_wrapper"><div id="objective_popup" class="popup"><div class="noti_box"><div class="points">${Object.keys(i).map((n=>{let l=i[n];return`<div class="row animate" style="transition: all 20ms;"><div class="contest_name">${l.title}:</div><div class="contest_points"><div class="points_name" style="animation:none;">${l.name}: </div><div class="points_num" style="animation:none;"><div class="points_i" style="animation:none;">+${number_format_lang(l.points_gained)}</div></div></div></div>`})).join("")}</div></div></div></div></div>`);$("#toast-popups .popup_wrapper").remove(),$("#toast-popups").css("display","unset"),$("#toast-popups"),$("#toast-popups").append(r),$("#toast-popups").css("display","unset"),e&&(clearTimeout(e),e=null),e=setTimeout(()=>{r.remove(),e=null,i={}},5e3),r.on("click.removePopup",function(){r.remove(),e=null,i={}})}}};var H={baseKey:"girlsToWiki",label:"Girls to Wiki (HH)",default:!1,subSettings:[{key:"infoBubbleNameToWiki",default:!0,label:"Info bubble name clickable to wiki"},{key:"portraitToWiki",default:!1,label:"Make portrait clickable to wiki"}]},_=class extends p{constructor(){super(H)}shouldRun(){return location.host.includes("heroes")}run(i){this.hasRun||!this.shouldRun()||(this.hasRun=!0,i?.infoBubbleNameToWiki&&setInterval(()=>{B()},500),i?.portraitToWiki&&setInterval(()=>{G()},500))}};function B(){$(".new_girl_info .girl_name_wrap > h5[style!='cursor: pointer;']").each(function(){let c=$(this);c.css("cursor","pointer"),c.on("click.InfoBubbleToWiki",function(){let i=c.attr("hh_title");if(!i)return;let e=i.replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${e}`,{active:!0})})})}function G(){$(".slot_girl_shards > [data-new-girl-tooltip][style!='cursor: pointer;']").each(function(){let c=$(this),i=c.attr("data-new-girl-tooltip");if(!i)return;let e=i.match(/"name":"(.+)","rarity/);e&&e[1]&&(c.css("cursor","pointer"),c.on("click.ImgToWiki",function(o){o.stopPropagation();let t=e[1].replace(/ /g,"-");GM.openInTab(`https://harem-battle.club/wiki/Harem-Heroes/HH:${t}`,{active:!0})}))})}var P=class extends p{constructor(){let i={baseKey:"entirePaid",label:"Removes only $ options",default:!1};super(i)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle(".pass_reward.reward_wrapper{display:none!important;}"),GM.addStyle("#gsp_btn_holder{display:none!important;}"),GM.addStyle(".rewards_seasons_row .rewards_pair .tier_number{top:100%!important;}"),GM.addStyle("#get_mega_pass_shop_btn{display:none!important;}"),GM.addStyle("#bundles_tab{display:none!important;}"),GM.addStyle(".purchase-shop{display:none!important;}"))}};var M={baseKey:"tighterPoPs",label:"Tighter PoPs (requires css tweaks for PoP)",default:!0},v=class extends p{constructor(){super(M)}shouldRun(){return location.pathname.includes("/activities.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,GM.addStyle("#pop .pop_list .pop-action-btn {margin-bottom: 0.4rem!important;margin-top: 0rem!important;}#pop .pop_list .pop_list_scrolling_area .pop_thumb img {height: 90px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_expanded {height: 89px!important;background: linear-gradient(0deg, #00000087, transparent)!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container, .activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb_container .pop_thumb_active {min-height: 89px!important;height: 89px!important;margin-bottom: 5px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb>.pop_thumb_level {top: -93px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .pop_thumb.pop_thumb_active[status=pending_reward]>.pop_thumb_space {top: -126px!important;}.activities-container #pop .pop_list .pop_list_scrolling_area .collect_notif {margin-top: -91px!important;margin-left: 121px!important;}.activities-container .pop_thumb_progress_bar {margin-top: 21px!important;}"))}};var g=class{static doWhenSelectorAvailable(i,e){if($(i).length)e();else{let o=new MutationObserver(()=>{$(i).length&&(o.disconnect(),e())});o.observe(document.documentElement,{childList:!0,subtree:!0})}}};var O={baseKey:"labyTeamPreset",label:"<span tooltip='Add a button to register laby team presets, and to apply it'>Laby Team Preset</span>",default:!0},w=class extends p{constructor(){super(O);this.savedTeamPresetKey="SeveralQoL_LabyTeamPreset"}shouldRun(){return location.pathname.includes("/edit-labyrinth-team.html")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let e=$(".boss-bang-panel"),o=$('<button class="green_button_L" tooltip="Save preset for later runs">Save Preset</button>');o.on("click",()=>{this.saveCurrentPreset(),t.removeAttr("disabled")}),e.append(o);let t=$(`<button class="green_button_L" tooltip="Use previously saved preset & leave page" ${localStorage.getItem(this.savedTeamPresetKey)?"":"disabled"}>Fill Preset</button>`);t.on("click",()=>{this.loadSavedPreset()}),g.doWhenSelectorAvailable(".change-team-panel .player-team .average-lvl",()=>{$(".change-team-panel .player-team .average-lvl").replaceWith(t)})}saveCurrentPreset(){let e=[];$(".team-hexagon .team-member-container").each(function(){let o=$(this).attr("data-team-member-position"),t=$(this).attr("data-girl-id");$(this).is("[data-girl-id]")&&o&&t&&(e[o]=t)}),console.log("Saving preset: ",e),localStorage.setItem(this.savedTeamPresetKey,JSON.stringify(e))}loadSavedPreset(){let e=localStorage.getItem(this.savedTeamPresetKey);if(!e){console.warn("No saved preset found");return}try{let o=JSON.parse(e);console.log("Loading preset: ",o);let t={class:"Hero",action:"edit_team",girls:o,battle_type:"labyrinth",id_team:unsafeWindow.teamId};console.log("AJAX settings: ",t),shared.general.hh_ajax(t,a=>{shared.general.navigate(unsafeWindow.redirectUrl)})}catch(o){console.error("Failed to load preset:",o)}}};var x=class extends p{constructor(){let i={baseKey:"noAnnoyingPopups",label:"Removes annoying popup appearing automaticly for shops, paths, news",default:!1};super(i)}shouldRun(){return!0}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,document.cookie="disabledPopups=PassReminder,Bundles,News; path=/")}};var j={baseKey:"whaleBossTournament",label:"Renames WBT to Whale Boss Tournament",default:!1},y=class extends p{constructor(){super(j)}shouldRun(){return location.pathname.includes("/home.html")}run(){this.hasRun||!this.shouldRun()||(this.hasRun=!0,g.doWhenSelectorAvailable(".world-boss .title",()=>{$(".world-boss .title").text("Whale Boss Tournament")}))}};var I={baseKey:"placesOfPowerPlusPlus",label:"Places of Power++ (Beta)",default:!1},S=class extends p{constructor(){super(I);this.popPresets={};this.girlBackToPool=new Set}convertCriteriaKey(e){return e.replace("_","")}buildSinglePopAssignment(e){let o=new Set;Object.values(pop_hero_girls).forEach(t=>{t.id_places_of_power!==null&&!this.girlBackToPool.has(t.id_places_of_power)&&o.add(t.id_girl)}),this.assignGirlsToPoP(e,o)}assignGirlsToPoP(e,o){let t=Object.values(pop_data).find(n=>n.id_places_of_power===e);if(!t)return;let a=t.criteria,s=t.max_team_power,r=this.selectOptimalGirls(e,s,a,o);this.popPresets[e]=r}calculatePresetPower(e,o){let t=0,a=this.convertCriteriaKey(o);for(let s of e){let r=Object.values(pop_hero_girls).find(n=>n.id_girl===s);r&&(t+=r[a])}return t}selectOptimalGirls(e,o,t,a){let s=Object.values(pop_hero_girls);return s.length===0?(console.error(`[PoP ${e}] No available girls! All girls might be assigned to other PoPs.`),[]):this.selectGirlsForRemainingPower(s,o,t)}selectGirlsForRemainingPower(e,o,t){let a=[],s=this.convertCriteriaKey(t),r=[...e].sort((n,l)=>l[s]-n[s]);for(let n of r){let l=n[s];if(l<=o)o-=l,a.push(n.id_girl);else if(a.length===0||o>0){let d=l-o,u=n;for(let m=r.indexOf(n)+1;m<r.length;m++){let h=r[m],f=h[s],R=f-o;if(f<=o)break;R<d&&(d=R,u=h)}o>0&&(a.push(u.id_girl),o-=u[s]);break}}return a}readdGirlsFromCurrentPoP(e){let o=parseInt(e);for(let t of Object.values(pop_hero_girls))t.id_places_of_power===o&&this.girlBackToPool.add(t.id_girl)}sendClaimRequest(e){this.readdGirlsFromCurrentPoP(e),shared.animations.loadingAnimation.start();let o=pop_data[parseInt(e)];if($(".claimPoPButton").prop("disabled",!0),o.ends_in===null||o.ends_in!==0)$(".claimPoPButton").css("display","none"),$(".startPoPButton").css("display",""),pop_data[parseInt(e)].status="can_start",$(".pop-record.selected .collect_notif").remove();else{let a=$(".pop-record.selected");a.next().trigger("click"),a.remove()}let t={namespace:"h\\PlacesOfPower",class:o.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"claim",id_place_of_power:o.id_places_of_power};shared.general.hh_ajax(t,a=>{let s=$(".pop-claimed-rewards-items");if(s.length){if(a.rewards.data.rewards){let r=shared.reward.newReward.multipleSlot(a.rewards.data.rewards);s.append(r)}shared.animations.loadingAnimation.stop()}})}calculateTimeToFinish(e,o){let t=this.convertCriteriaKey(e.criteria),a=0;for(let r of o){let n=Object.values(pop_hero_girls).find(l=>l.id_girl===r);n&&(a+=n[t])}if(a>=e.max_team_power)return 360*60;let s=e.level_power/a;return Math.floor(s*60)}sendFillRequest(e){shared.animations.loadingAnimation.start();let o=pop_data[parseInt(e)];if(o.status!=="can_start")return;let t=o.id_places_of_power;console.log(`[PoP ${t}] Building girl assignment for this PoP...`),this.buildSinglePopAssignment(t);let a=this.popPresets[t]||[];if(a.length===0){alert("No girls were assigned to this PoP. This might happen if all your girls are already assigned to other PoPs."),delete this.popPresets[t],shared.animations.loadingAnimation.stop();return}let s=this.convertCriteriaKey(o.criteria),r=0;for(let u of a){let m=Object.values(pop_hero_girls).find(h=>h.id_girl===u);m&&(r+=m[s])}if(r<o.max_team_power&&!confirm(`Warning: This PoP is not fully maxed!

Current Power: ${Math.floor(r)}
Max Power: ${o.max_team_power}

This will take longer than 6 hours to complete.
Do you want to continue?`)){delete this.popPresets[t],$(".startPoPButton").css("display",""),$(".claimPoPButton").css("display","none"),shared.animations.loadingAnimation.stop();return}a.forEach(u=>this.girlBackToPool.delete(u)),$(".startPoPButton").css("display","none"),$(".claimPoPButton").css("display","");let n={namespace:"h\\PlacesOfPower",class:o.type==="standard"?"PlaceOfPower":"TempPlaceOfPower",action:"start",id_place_of_power:t,selected_girls:a},l=$('<div class="pop-timer"></div>'),d=shared.timer.buildTimer(this.calculateTimeToFinish(o,a),"","pop-active-timer",!1);l.append(d),$(".pop-record.selected").append(l),shared.timer.activateTimers("pop-record.selected .pop-active-timer",()=>{}),shared.general.hh_ajax(n,u=>{shared.animations.loadingAnimation.stop()})}buildPopDetails(e){let o=$(".pop-details-container");if(!o.length)return;o.children().not(".pop-claimed-rewards-container").remove();let t=pop_data[parseInt(e)];if(!t)return;let a=$('<div class="pop-details-left"></div>');o.append(a);let s=$("<img></img>");s.attr("src",t.girl?t.girl.avatar:IMAGES_URL+"/pictures/girls/1/avb0-1200x.webp?a=1"),a.append(s);let r=$('<div class="pop-navigation-buttons-original blue_button_L">Visit Original</div>');r.on("click",()=>{shared.general.navigate("/activities.html?tab=pop&index=")}),a.append(r);let n=$("<div class='pop-details-right'></div>");o.prepend(n);let l=$(`<a tooltip="Visit this PoP original page" class="pop-title" href="${shared.general.getDocumentHref("/activities.html?tab=pop&index="+t.id_places_of_power)}">${t.title}</div>`);n.append(l);let d=$('<div class="pop-rewards-container"></div>');for(let[h,f]of Object.entries(t.rewards))if(f.loot){let R=shared.reward.newReward.multipleSlot(f);d.append(R);break}n.append(d);let u=$(`<button class="purple_button_L claimPoPButton" ${t.status!="pending_reward"?"disabled":""}>Claim</button>`);n.append(u),u.on("click",()=>{this.sendClaimRequest(e)});let m=$('<button class="blue_button_L startPoPButton">Fill & Start</button>');if(m.on("click",()=>{this.sendFillRequest(e)}),n.append(m),t.status!=="can_start"?m.css("display","none"):u.css("display","none"),!$(".pop-claimed-rewards-container").length){let h=$("<div class='pop-claimed-rewards-container'></div>");o.append(h),h.append("<b>Claimed Rewards:</b>");let f=$("<div class='pop-claimed-rewards-items'></div>");h.append(f)}}shouldRun(){return location.pathname.includes("/activities.html")&&!location.search.includes("?tab=pop&index=")}run(){if(this.hasRun||!this.shouldRun())return;this.hasRun=!0;let e=$(".switch-tab[data-tab='pop']");e.contents()[0].nodeValue="Places of Power++",e.attr("tooltip","By infarctus"),e.on("click",()=>{this.buildCustomPopInfo()}),this.injectCustomStyles()}buildCustomPopInfo(){let e=$("#pop_info");if(!e.length)return;e.empty();let o=$('<div class="pop-details-container"></div>');e.append(o);let t=$('<div class="pop-records-container"></div>');Object.entries(pop_data).forEach(([a,s])=>{let r=$('<div class="pop-record"></div>');r.attr("data-pop-id",a),r.css("background-image",`url(${s.image})`),r.on("click",()=>{$(".pop-record").removeClass("selected"),r.addClass("selected"),this.buildPopDetails(a)});let n=$(`<img src="https://hh.hh-content.com/pictures/misc/items_icons/${s.class}.png" class="pop-icon" />`);r.append(n);let l=$(`<div class="pop-lvl">Lv. ${s.level}</div>`);if(r.append(l),s.status==="in_progress"){let d=$('<div class="pop-timer"></div>'),u=shared.timer.buildTimer(s.remaining_time,"","pop-active-timer",!1);d.append(u),r.append(d)}if(s.status==="pending_reward"){let d=$('<div class="collect_notif"></div>');r.append(d)}t.append(r),r.attr("tooltip",s.title)}),e.append(t),$(".pop-record").first().trigger("click"),shared.timer.activateTimers("pop-active-timer",()=>{})}injectCustomStyles(){GM.addStyle(`
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
    `)}};var W={baseKey:"noReloadFromClaimingDailyChests",label:"No reload from claiming daily chests",default:!0},k=class extends p{constructor(){super(W)}shouldRun(){return!0}run(){if(this.hasRun||!this.shouldRun())return location.pathname.includes("/activities.html");this.hasRun=!0,$(".switch-tab[data-tab='daily_goals']").on("click",()=>{console.log("Clicked daily goals"),g.doWhenSelectorAvailable(".progress-bar-claim-reward",()=>{this.applyNoReloadFix()})})}applyNoReloadFix(){$(".progress-bar-claim-reward").off("click").on("click",function(i){i.stopPropagation(),i.preventDefault(),$(this).prop("disabled",!0);let e={action:"claim_daily_goal_tier_reward",tier:$(this).attr("tier")};shared.general.hh_ajax(e,function(o){let t=o.rewards;shared.reward_popup.Reward.handlePopup(t)})}),$(".progress-bar-claim-reward").attr("tooltip","Several QoL: Claim without reload")}};var T=class{constructor(){this.allModules=[new b,new w,new x,new P,new _,new v,new y,new S,new k];if(unsafeWindow.hhPlusPlusConfig===void 0){Promise.race([new Promise(i=>{$(document).one("hh++-bdsm:loaded",()=>i("hh++-bdsm:loaded"))}),new Promise(i=>setTimeout(()=>i("timeout"),50))]).then(i=>{i==="hh++-bdsm:loaded"?this.run():this.runWithoutBdsm()});return}this.run()}run(){unsafeWindow.hhPlusPlusConfig.registerGroup({key:"severalQoL",name:"<span tooltip='by infarctus'>Several QoL</span>"}),this.allModules.forEach(i=>{unsafeWindow.hhPlusPlusConfig.registerModule(i)}),unsafeWindow.hhPlusPlusConfig.loadConfig(),unsafeWindow.hhPlusPlusConfig.runModules()}runWithoutBdsm(){this.allModules.forEach(i=>{try{let e=i.configSchema;if(i.shouldRun())if(e.subSettings){let o=e.subSettings.reduce((t,a)=>(t[a.key]=!0,t),{});i.run(o)}else i.run(void 0)}catch(e){console.error("Error running module",i,e)}})}};new T;})();
