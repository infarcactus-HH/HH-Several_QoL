import {
  global_pop_hero_girls_incomplete,
  PlacesOfPowerData,
} from "../types/GameTypes";
import { HHModule } from "../types/HH++";
import { GirlsStorageHandler } from "../utils/StorageHandler";

declare const pop_data: Record<number, PlacesOfPowerData>;
declare const pop_hero_girls: Record<number, global_pop_hero_girls_incomplete>; // id_places_of_power

const configSchema = {
  baseKey: "placesOfPowerPlusPlus",
  label: "Places of Power++ (Beta)",
  default: false,
} as const;

export default class PlacesOfPowerPlusPlus extends HHModule {
  private isUpdatingGirls: boolean = false;
  private currentPoPGirls: Record<number, number[]> = {}; // popId -> array of girl IDs

  private readonly criteriaToClassMap: Record<PlacesOfPowerData["criteria"], 1 | 2 | 3> = {
    "carac_1": 1,
    "carac_2": 2,
    "carac_3": 3,
  };

  constructor() {
    super(configSchema);
  }

  /**
   * Convert criteria from pop_data format (carac_1) to pop_hero_girls format (carac1)
   */
  private convertCriteriaKey(
    criteria: PlacesOfPowerData["criteria"]
  ): keyof Pick<
    global_pop_hero_girls_incomplete,
    "carac1" | "carac2" | "carac3"
  > {
    // Convert carac_1 -> carac1, carac_2 -> carac2, carac_3 -> carac3
    return criteria.replace("_", "") as keyof Pick<
      global_pop_hero_girls_incomplete,
      "carac1" | "carac2" | "carac3"
    >;
  }

  /**
   * Assign girls to a specific PoP
   */
  assignGirlsToPoP(popId: number) {
    const popData = Object.values(pop_data).find(
      (p) => p.id_places_of_power === popId
    );
    if (!popData) return;

    const criteria = popData.criteria;
    const targetPower = popData.max_team_power;

    const selectedGirls = this.selectOptimalGirls(
      popId,
      targetPower,
      criteria
    );
    return selectedGirls;
  }

  /**
   * Select optimal girls for a PoP from scratch using pre-sorted lists
   */
  selectOptimalGirls(
    popId: number,
    targetPower: number,
    criteria: PlacesOfPowerData["criteria"]
  ): number[] {
    const criteriaKey = this.convertCriteriaKey(criteria);
    
    const classNumber = this.criteriaToClassMap[criteria];
    
    // Get pre-sorted list of girl IDs for this class (already sorted by power, descending)
    const sortedGirlIds = GirlsStorageHandler.getEnumGirlsOrderedByClass(classNumber);
    
    if (sortedGirlIds.length === 0) {
      console.error(
        `[PoP ${popId}] No girls available in storage!`
      );
      return [];
    }

    // Get set of girls already assigned to other PoPs
    const assignedGirls = new Set<number>();
    for (const [otherPopId, girlIds] of Object.entries(this.currentPoPGirls)) {
      if (parseInt(otherPopId) !== popId) {
        girlIds.forEach(id => assignedGirls.add(id));
      }
    }

    const selectedGirls: number[] = [];
    let remainingPower = targetPower;

    // Iterate through pre-sorted girls (highest power first)
    for (const girlId of sortedGirlIds) {
      // Skip if girl is already assigned to another PoP
      if (assignedGirls.has(girlId)) {
        continue;
      }

      const girl = pop_hero_girls[girlId];
      if (!girl) continue;

      const girlPower = girl[criteriaKey];

      // If adding this girl keeps us at or below target, add her
      if (girlPower <= remainingPower) {
        remainingPower -= girlPower;
        selectedGirls.push(girlId);
        
        // If we've hit the target exactly, stop
        if (remainingPower === 0) {
          break;
        }
      }
      // If we need to overshoot, find the best candidate (minimum overshoot)
      else if (selectedGirls.length === 0 || remainingPower > 0) {
        // Look ahead to find the girl with minimum overshoot
        let bestGirlId = girlId;        
        const currentIndex = sortedGirlIds.indexOf(girlId);
        for (let i = currentIndex + 1; i < sortedGirlIds.length; i++) {
          const nextGirlId = sortedGirlIds[i];
          
          // Skip if already assigned
          if (assignedGirls.has(nextGirlId)) continue;
          
          const nextGirl = pop_hero_girls[nextGirlId];
          if (!nextGirl) continue;
          
          const nextPower = nextGirl[criteriaKey];
          
          // If we find one that fits perfectly or undershoots, use it immediately
          if (nextPower <= remainingPower) {
            if(nextPower === remainingPower) {
              bestGirlId = nextGirlId;
            }
            break;
          }
          bestGirlId = nextGirlId;
        }
        
        selectedGirls.push(bestGirlId);
        break;
      }
    }

    return selectedGirls;
  }

  readdGirlsFromCurrentPoP(popKey: string) {
    const popId = parseInt(popKey);
    delete this.currentPoPGirls[popId];
  }

  selectNextPoPFromFill($currentPoPRecordSelected: JQuery<HTMLElement>) {
    if ($currentPoPRecordSelected.length === 0) return;
    if ($currentPoPRecordSelected.next().length !== 0) {
      $currentPoPRecordSelected.next().trigger("click");
    } else {
      $(".pop-record").first().trigger("click");
    }
  }
  selectNextPoPFromClaim($currentPoPRecordSelected: JQuery<HTMLElement>) {
    if ($currentPoPRecordSelected.length === 0) return;
    if( $(".pop-record > .collect_notif").length !== 0) {
      $(".pop-record > .collect_notif").first().parent().trigger("click");
    } else {
      $(".pop-record").first().trigger("click");
    }
  }

  sendClaimRequest(popKey: string) {
    shared.animations.loadingAnimation.start();
    this.readdGirlsFromCurrentPoP(popKey);
    const currentPoPData = pop_data[parseInt(popKey)];
    $(".claimPoPButton").prop("disabled", true);
    if (currentPoPData.ends_in === null || currentPoPData.ends_in !== 0) {
      $(".claimPoPButton").css("display", "none");
      $(".startPoPButton").css("display", "");
      pop_data[parseInt(popKey)].status = "can_start";
      $(".pop-record.selected .collect_notif").remove();
    } else {
      const $currentPoPRecordSelected = $(".pop-record.selected");
      this.selectNextPoPFromFill($currentPoPRecordSelected);
      $currentPoPRecordSelected.remove();
    }
    const n = {
      namespace: "h\\PlacesOfPower",
      class:
        currentPoPData.type === "standard"
          ? "PlaceOfPower"
          : "TempPlaceOfPower",
      action: "claim",
      id_place_of_power: currentPoPData.id_places_of_power,
    };
    shared.general.hh_ajax(n, (response: any) => {
      const $claimedRewardsContainerItems = $(".pop-claimed-rewards-items");
      if (!$claimedRewardsContainerItems.length) return;
      if (response.rewards.data.rewards) {
        const rewardElement = shared.reward.newReward.multipleSlot(
          response.rewards.data.rewards
        );
        $claimedRewardsContainerItems.append(rewardElement);
      }
      this.selectNextPoPFromFill($(".pop-record.selected"));
      shared.animations.loadingAnimation.stop();
    });
  }

  calculateTimeToFinish(
    popData: PlacesOfPowerData,
    selectedGirls: number[]
  ): number {
    const criteriaKey = this.convertCriteriaKey(popData.criteria);

    // Calculate total power of selected girls
    let totalPower = 0;
    for (const girlId of selectedGirls) {
      const girl = pop_hero_girls[girlId];
      if (girl) {
        totalPower += girl[criteriaKey];
      }
    }

    // If total power exceeds max_team_power, it takes 6 hours
    if (totalPower >= popData.max_team_power) {
      return 6 * 60 * 60; // 6 hours in seconds
    }

    // Otherwise, calculate time based on level_power / total_power (in minutes), convert to seconds
    const timeInMinutes = popData.level_power / totalPower;
    return Math.floor(timeInMinutes * 60); // Convert minutes to seconds
  }

  sendFillRequest(popKey: string) {
    shared.animations.loadingAnimation.start();
    const currentPoPData = pop_data[parseInt(popKey)];
    if (currentPoPData.status !== "can_start") return;

    const popId = currentPoPData.id_places_of_power;

    // Build assignment for this specific PoP only
    console.log(`[PoP ${popId}] Building girl assignment for this PoP...`);
    const selectedGirls = this.assignGirlsToPoP(popId)  || [];
    this.currentPoPGirls[popId] = selectedGirls;

    if (selectedGirls.length === 0) {
      alert(
        `No girls were assigned to this PoP. This might happen if all your girls are already assigned to other PoPs.`
      );
      delete this.currentPoPGirls[popId];
      shared.animations.loadingAnimation.stop();
      return;
    }

    // Check if the team is maxed (capped)
    const criteriaKey = this.convertCriteriaKey(currentPoPData.criteria);
    let totalPower = 0;
    for (const girlId of selectedGirls) {
      const girl = pop_hero_girls[girlId];
      if (girl) {
        totalPower += girl[criteriaKey];
      }
    }

    // If not capped, ask for confirmation
    if (totalPower < currentPoPData.max_team_power) {
      const shouldContinue = confirm(
        `Warning: This PoP is not fully maxed!\n\nCurrent Power: ${Math.floor(totalPower)}\nMax Power: ${currentPoPData.max_team_power}\n\nThis will take longer than 6 hours to complete.\nDo you want to continue?`
      );
      if (!shouldContinue) {
        delete this.currentPoPGirls[popId];
        // Revert UI changes
        $(".startPoPButton").css("display", "");
        $(".claimPoPButton").css("display", "none");
        shared.animations.loadingAnimation.stop();
        return;
      }
    }

    $(".startPoPButton").css("display", "none");
    $(".claimPoPButton").css("display", "");

    // Send the actual request to start the PoP with the selected girls
    const n = {
      namespace: "h\\PlacesOfPower",
      class:
        currentPoPData.type === "standard"
          ? "PlaceOfPower"
          : "TempPlaceOfPower",
      action: "start",
      id_place_of_power: popId,
      selected_girls: selectedGirls,
    };

    const $timer = $('<div class="pop-timer"></div>');

    const timerElement = shared.timer.buildTimer(
      this.calculateTimeToFinish(currentPoPData, selectedGirls),
      "",
      "pop-active-timer",
      false
    );
    $timer.append(timerElement);
    $(".pop-record.selected").append($timer);
    pop_data[parseInt(popKey)].status = "in_progress";
    
    shared.general.hh_ajax(n, (_response: any) => {
      shared.timer.activateTimers(
        "pop-record.selected .pop-active-timer",
        () => {}
      );
      this.selectNextPoPFromFill($(".pop-record.selected"));
      shared.animations.loadingAnimation.stop();
    });
  }

  buildPopDetails(popKey: string) {
    const $popDetails = $(".pop-details-container");
    if (!$popDetails.length) return;
    $popDetails.children().not(".pop-claimed-rewards-container").remove();
    const currentPoPData = pop_data[parseInt(popKey)];
    if (!currentPoPData) return;

    // Girl image on the left
    const $popDetailsLeft = $('<div class="pop-details-left"></div>');
    $popDetails.append($popDetailsLeft);
    const $girlImageHolder = $("<img></img>");
    $girlImageHolder.attr(
      "src",
      currentPoPData.girl
        ? currentPoPData.girl.avatar
        : IMAGES_URL + "/pictures/girls/1/avb0-1200x.webp?a=1"
    );
    $popDetailsLeft.append($girlImageHolder);

    const $navigationButtons = $(
      '<div class="pop-navigation-buttons-original blue_button_L">Visit Original</div>'
    );
    $navigationButtons.on("click", () => {
      shared.general.navigate("/activities.html?tab=pop&index=");
    });
    $popDetailsLeft.append($navigationButtons);

    // Details (title, rewards, buttons) on the right
    const $popDetailsRight = $("<div class='pop-details-right'></div>");
    $popDetails.prepend($popDetailsRight);

    const $title = $(
      `<a tooltip="Visit this PoP original page" class="pop-title" href="${shared.general.getDocumentHref(
        "/activities.html?tab=pop&index=" + currentPoPData.id_places_of_power
      )}">${currentPoPData.title}</div>`
    );
    $popDetailsRight.append($title);

    // Create rewards container
    const $rewardsContainer = $('<div class="pop-rewards-container"></div>');

    for (const [key, reward] of Object.entries(currentPoPData.rewards)) {
      if (reward.loot) {
        const rewardElement = shared.reward.newReward.multipleSlot(reward);
        $rewardsContainer.append(rewardElement);
        break;
      }
    }

    $popDetailsRight.append($rewardsContainer);

    const $claimBtn = $(
      `<button class="purple_button_L claimPoPButton" ${
        currentPoPData.status != "pending_reward" ? "disabled" : ""
      }>Claim</button>`
    );
    $popDetailsRight.append($claimBtn);
    $claimBtn.on("click", () => {
      this.sendClaimRequest(popKey);
    });

    const $startFillBtn = $(
      `<button class="blue_button_L startPoPButton">Fill & Start</button>`
    );
    $startFillBtn.on("click", () => {
      this.sendFillRequest(popKey);
    });
    $popDetailsRight.append($startFillBtn);
    if (currentPoPData.status !== "can_start") {
      $startFillBtn.css("display", "none");
    } else {
      $claimBtn.css("display", "none");
    }

    if (!$(".pop-claimed-rewards-container").length) {
      const $claimedRewardsContainer = $(
        "<div class='pop-claimed-rewards-container'></div>"
      );
      $popDetails.append($claimedRewardsContainer);
      $claimedRewardsContainer.append("<b>Claimed Rewards:</b>");
      const $claimedRewardsContainerItems = $(
        "<div class='pop-claimed-rewards-items'></div>"
      );
      $claimedRewardsContainer.append($claimedRewardsContainerItems);
    }
  }

  shouldRun() {
    return (
      location.pathname.includes("/activities.html") &&
      !location.search.includes("?tab=pop&index=")
    );
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    const $PopSwitcher = $(".switch-tab[data-tab='pop']");
    $PopSwitcher.contents()[0].nodeValue = "Places of Power++";
    $PopSwitcher.attr("tooltip", "By infarctus");
    $PopSwitcher.on("click", async () => {
      // Wait for girls to finish updating before building UI
      if(this.isUpdatingGirls){
        shared.animations.loadingAnimation.start();
        while (this.isUpdatingGirls) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        shared.animations.loadingAnimation.stop();
      }
      this.buildCustomPopInfo();
    });
    this.injectCustomStyles();
    this.girlsHandler()
      .then(() => {
        this.whichGirlsInPoP();
      });
  }

  buildCustomPopInfo() {
    const $popInfo = $("#pop_info");
    if (!$popInfo.length) return;

    $popInfo.empty();

    // Create left container for PoP details
    const $popDetailsContainer = $('<div class="pop-details-container"></div>');
    $popInfo.append($popDetailsContainer);

    // Create container for PoP records
    const $popRecordsContainer = $('<div class="pop-records-container"></div>');

    // Iterate through pop_data records
    Object.entries(pop_data).forEach(([key, popRecord]) => {
      const $popRecord = $(`<div class="pop-record"></div>`);
      $popRecord.attr("data-pop-id", key);
      // Set background image inline (can't be done in CSS)
      $popRecord.css("background-image", `url(${popRecord.image})`);

      // Add click handler for selection
      $popRecord.on("click", () => {
        // Remove selection styling from all records
        $(".pop-record").removeClass("selected");
        // Add selection styling to clicked record
        $popRecord.addClass("selected");
        // Update details view
        this.buildPopDetails(key);
      });

      // Create icon (top left)
      const $icon = $(
        `<img src="https://hh.hh-content.com/pictures/misc/items_icons/${popRecord.class}.png" class="pop-icon" />`
      );
      $popRecord.append($icon);

      const $lvl = $(`<div class="pop-lvl">Lv. ${popRecord.level}</div>`);
      $popRecord.append($lvl);

      if (popRecord.status === "in_progress") {
        // Create timer
        const $timer = $('<div class="pop-timer"></div>');

        const timerElement = shared.timer.buildTimer(
          popRecord.remaining_time,
          "",
          "pop-active-timer",
          false
        );
        $timer.append(timerElement);
        $popRecord.append($timer);
      }
      if (popRecord.status === "pending_reward") {
        const $claimNotif = $(`<div class="collect_notif"></div>`);
        $popRecord.append($claimNotif);
      }

      $popRecordsContainer.append($popRecord);
      $popRecord.attr("tooltip", popRecord.title);
    });

    // Add the container to the top of popInfo
    $popInfo.append($popRecordsContainer);
    //Select first PoP by default
    $(".pop-record").first().trigger("click");

    shared.timer.activateTimers("pop-active-timer", () => {});
  }
  injectCustomStyles() {
    // Lazy load CSS only when needed
    const css = require("./css/PlacesOfPower++.css").default;
    GM.addStyle(css);
  }


  /**
   * Binary search to find insertion index for a girl based on her power
   * Returns the index where the girl should be inserted (descending order)
   */
  private binarySearchInsertIndex(
    orderedIds: number[], 
    girlPower: number, 
    caracKey: keyof Pick<global_pop_hero_girls_incomplete, "carac1" | "carac2" | "carac3">
  ): number {
    let left = 0;
    let right = orderedIds.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const midGirl = pop_hero_girls[orderedIds[mid]];
      
      if (!midGirl) {
        // If girl not found, move to next position
        left = mid + 1;
        continue;
      }
      
      const midPower = midGirl[caracKey];
      
      // Descending order: insert before if new girl has higher power
      if (girlPower > midPower) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    
    return left;
  }

  async girlsHandler() {
    const numberOfGirlsStored = GirlsStorageHandler.getStoredGirlsNumber();
    const currentNumberOfGirls = Object.keys(pop_hero_girls).length;
    
    if((currentNumberOfGirls - numberOfGirlsStored) < 5) {
      return; // Don't update every time
    }
    this.isUpdatingGirls = true;
    
    const allGirls = Object.values(pop_hero_girls);
    
    // Full sort for initial setup (0-100 girls)
    if (numberOfGirlsStored <= 100 ) {
      console.log(`[PoP++] Performing full sort for ${currentNumberOfGirls} girls`);
      
      // Sort girls by carac1 (class 1) and store their IDs in order
      const girlsByCarac1 = [...allGirls].sort((a, b) => b.carac1 - a.carac1);
      const orderedIdsCarac1 = girlsByCarac1.map(g => g.id_girl);
      GirlsStorageHandler.setEnumGirlsOrderedByClass(orderedIdsCarac1, 1);
      
      // Sort girls by carac2 (class 2) and store their IDs in order
      const girlsByCarac2 = [...allGirls].sort((a, b) => b.carac2 - a.carac2);
      const orderedIdsCarac2 = girlsByCarac2.map(g => g.id_girl);
      GirlsStorageHandler.setEnumGirlsOrderedByClass(orderedIdsCarac2, 2);
      
      // Sort girls by carac3 (class 3) and store their IDs in order
      const girlsByCarac3 = [...allGirls].sort((a, b) => b.carac3 - a.carac3);
      const orderedIdsCarac3 = girlsByCarac3.map(g => g.id_girl);
      GirlsStorageHandler.setEnumGirlsOrderedByClass(orderedIdsCarac3, 3);
      
      GirlsStorageHandler.setStoredGirlsNumber(currentNumberOfGirls);
      console.log(`[PoP++] Full sort completed`);
    } 
    // Binary search insertion for incremental updates if there's >100 girls stored
    else {
      // Get existing sorted lists (already arrays)
      const orderedIdsCarac1 = GirlsStorageHandler.getEnumGirlsOrderedByClass(1);
      const orderedIdsCarac2 = GirlsStorageHandler.getEnumGirlsOrderedByClass(2);
      const orderedIdsCarac3 = GirlsStorageHandler.getEnumGirlsOrderedByClass(3);
      
      // Find new girls (not in stored lists)
      const existingIds = new Set(orderedIdsCarac1); // Any list works, they all have the same IDs
      const newGirls = allGirls.filter(girl => !existingIds.has(girl.id_girl));
      
      // Insert each new girl into sorted position using binary search
      for (const newGirl of newGirls) {
        // Insert into carac1 list
        const index1 = this.binarySearchInsertIndex(orderedIdsCarac1, newGirl.carac1, "carac1");
        orderedIdsCarac1.splice(index1, 0, newGirl.id_girl);
        
        // Insert into carac2 list
        const index2 = this.binarySearchInsertIndex(orderedIdsCarac2, newGirl.carac2, "carac2");
        orderedIdsCarac2.splice(index2, 0, newGirl.id_girl);
        
        // Insert into carac3 list
        const index3 = this.binarySearchInsertIndex(orderedIdsCarac3, newGirl.carac3, "carac3");
        orderedIdsCarac3.splice(index3, 0, newGirl.id_girl);
      }
      
      // Store updated lists (already arrays, no conversion needed)
      GirlsStorageHandler.setEnumGirlsOrderedByClass(orderedIdsCarac1, 1);
      GirlsStorageHandler.setEnumGirlsOrderedByClass(orderedIdsCarac2, 2);
      GirlsStorageHandler.setEnumGirlsOrderedByClass(orderedIdsCarac3, 3);
      
      GirlsStorageHandler.setStoredGirlsNumber(currentNumberOfGirls);
      console.log(`[PoP++] Binary search insertion completed for ${newGirls.length} new girls`);
    }
  }

  whichGirlsInPoP(){
    for(const popEntry of Object.values(pop_data)){
      let girlsInThisPop: number[] = [];
      popEntry.girls.forEach(girl => {
        if(girl.assigned === popEntry.id_places_of_power){
          girlsInThisPop.push(girl.id_girl);
        }
      })
      this.currentPoPGirls[popEntry.id_places_of_power] = girlsInThisPop;
    }
    this.isUpdatingGirls = false;
  }
}
