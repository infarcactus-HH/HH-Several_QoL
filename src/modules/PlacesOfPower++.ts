import {
  global_pop_hero_girls_incomplete,
  PlacesOfPowerData,
} from "../types/GameTypes";
import { HHModule } from "../types/HH++";

declare const pop_data: Record<number, PlacesOfPowerData>;
declare const pop_hero_girls: Record<number, global_pop_hero_girls_incomplete>; // id_places_of_power

const configSchema = {
  baseKey: "placesOfPowerPlusPlus",
  label: "Places of Power++ (Beta)",
  default: false,
} as const;

export default class PlacesOfPowerPlusPlus extends HHModule {
  //private _selectedPopKey: string = "";
  private popPresets: Record<number, number[]> = {}; // id_places_of_power -> array of girl IDs
  private girlBackToPool: Set<number> = new Set();

  constructor() {
    super(configSchema);
  }

  /**
   * Convert criteria from pop_data format (carac_1) to pop_hero_girls format (carac1)
   */
  private convertCriteriaKey(
    criteria: string
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
   * Build girl assignment for a single PoP only
   */
  buildSinglePopAssignment(popId: number) {
    // Track which girls are already assigned (either in game or in our presets)
    const assignedGirls = new Set<number>();

    // Add girls that are currently assigned in the game
    Object.values(pop_hero_girls).forEach((girl) => {
      if (
        girl.id_places_of_power !== null &&
        !this.girlBackToPool.has(girl.id_places_of_power)
      ) {
        assignedGirls.add(girl.id_girl);
      }
    });

    // Add girls that are already in other PoP presets
    //Object.entries(this.popPresets).forEach(([presetPopId, girlIds]) => {
    //  // Don't count girls from this PoP's own preset (we're rebuilding it)
    //  if (parseInt(presetPopId) !== popId) {
    //    girlIds.forEach((girlId) => assignedGirls.add(girlId));
    //  }
    //});

    // Assign girls to this specific PoP
    this.assignGirlsToPoP(popId, assignedGirls);
  }

  /**
   * Assign girls to a specific PoP, reusing preset if available
   */
  assignGirlsToPoP(popId: number, assignedGirls: Set<number>) {
    const popData = Object.values(pop_data).find(
      (p) => p.id_places_of_power === popId
    );
    if (!popData) return;

    const criteria = popData.criteria;
    const targetPower = popData.max_team_power;

    const selectedGirls = this.selectOptimalGirls(
      popId,
      targetPower,
      criteria,
      assignedGirls
    );
    this.popPresets[popId] = selectedGirls;
  }

  /**
   * Calculate total power of a preset
   */
  calculatePresetPower(girlIds: number[], criteria: string): number {
    let totalPower = 0;
    const criteriaKey = this.convertCriteriaKey(criteria);
    for (const girlId of girlIds) {
      const girl = Object.values(pop_hero_girls).find(
        (g) => g.id_girl === girlId
      );
      if (girl) {
        totalPower += girl[criteriaKey];
      }
    }
    return totalPower;
  }

  /**
   * Select optimal girls for a PoP from scratch
   */
  selectOptimalGirls(
    popId: number,
    targetPower: number,
    criteria: string,
    assignedGirls: Set<number>
  ): number[] {
    const availableGirls = Object.values(pop_hero_girls);

    if (availableGirls.length === 0) {
      console.error(
        `[PoP ${popId}] No available girls! All girls might be assigned to other PoPs.`
      );
      return [];
    }

    const selectedGirls = this.selectGirlsForRemainingPower(
      availableGirls,
      targetPower,
      criteria
    );

    return selectedGirls;
  }

  /**
   * Core selection algorithm - picks girls to meet power requirement
   */
  selectGirlsForRemainingPower(
    availableGirls: global_pop_hero_girls_incomplete[],
    remainingPower: number,
    criteria: string
  ): number[] {
    const selectedGirls: number[] = [];
    const criteriaKey = this.convertCriteriaKey(criteria);

    // Sort girls by power in descending order (highest power first)
    const sortedGirls = [...availableGirls].sort(
      (a, b) => b[criteriaKey] - a[criteriaKey]
    );

    for (const girl of sortedGirls) {
      const girlPower = girl[criteriaKey];

      // If adding this girl keeps us below or at requirement, add her
      if (girlPower <= remainingPower) {
        remainingPower -= girlPower;
        selectedGirls.push(girl.id_girl);
      }
      // If we must go over, find the best candidate (minimum overshoot)
      else if (selectedGirls.length === 0 || remainingPower > 0) {
        let bestOvershoot = girlPower - remainingPower;
        let bestGirl = girl;

        for (
          let i = sortedGirls.indexOf(girl) + 1;
          i < sortedGirls.length;
          i++
        ) {
          const nextGirl = sortedGirls[i];
          const nextPower = nextGirl[criteriaKey];
          const nextOvershoot = nextPower - remainingPower;

          // If we find one that fits perfectly or undershoots, use it
          if (nextPower <= remainingPower) {
            break;
          }

          // Track the minimum overshoot
          if (nextOvershoot < bestOvershoot) {
            bestOvershoot = nextOvershoot;
            bestGirl = nextGirl;
          }
        }

        // Add the best girl (minimum overshoot) if we need to go over
        if (remainingPower > 0) {
          selectedGirls.push(bestGirl.id_girl);
          remainingPower -= bestGirl[criteriaKey];
        }
        break;
      }
    }

    return selectedGirls;
  }

  readdGirlsFromCurrentPoP(popKey: string) {
    const popId = parseInt(popKey);
    for (const pop_hero_girlsEntry of Object.values(pop_hero_girls)) {
      if (pop_hero_girlsEntry.id_places_of_power === popId) {
        this.girlBackToPool.add(pop_hero_girlsEntry.id_girl);
      }
    }
  }

  selectNextPoP($currentPoPRecordSelected: JQuery<HTMLElement>) {
    if ($currentPoPRecordSelected.length === 0) return;
    if ($currentPoPRecordSelected.next().length !== 0) {
      $currentPoPRecordSelected.next().trigger("click");
    } else {
      $(".pop-record").first().trigger("click");
    }
  }

  sendClaimRequest(popKey: string) {
    this.readdGirlsFromCurrentPoP(popKey);
    shared.animations.loadingAnimation.start();
    const currentPoPData = pop_data[parseInt(popKey)];
    $(".claimPoPButton").prop("disabled", true);
    if (currentPoPData.ends_in === null || currentPoPData.ends_in !== 0) {
      $(".claimPoPButton").css("display", "none");
      $(".startPoPButton").css("display", "");
      pop_data[parseInt(popKey)].status = "can_start";
      $(".pop-record.selected .collect_notif").remove();
    } else {
      const $currentPoPRecordSelected = $(".pop-record.selected");
      this.selectNextPoP($currentPoPRecordSelected);
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
      const girl = Object.values(pop_hero_girls).find(
        (g) => g.id_girl === girlId
      );
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

    // Use the preset that was already calculated
    const popId = currentPoPData.id_places_of_power;

    // Build assignment for this specific PoP only
    console.log(`[PoP ${popId}] Building girl assignment for this PoP...`);
    this.buildSinglePopAssignment(popId);

    const selectedGirls = this.popPresets[popId] || [];

    if (selectedGirls.length === 0) {
      alert(
        `No girls were assigned to this PoP. This might happen if all your girls are already assigned to other PoPs.`
      );
      delete this.popPresets[popId]; // Delete preset entry
      shared.animations.loadingAnimation.stop();
      return;
    }

    // Check if the team is maxed (capped)
    const criteriaKey = this.convertCriteriaKey(currentPoPData.criteria);
    let totalPower = 0;
    for (const girlId of selectedGirls) {
      const girl = Object.values(pop_hero_girls).find(
        (g) => g.id_girl === girlId
      );
      if (girl) {
        totalPower += girl[criteriaKey];
      }
    }

    // If not capped, ask for confirmation
    if (totalPower < currentPoPData.max_team_power) {
      const shouldContinue = confirm(
        `Warning: This PoP is not fully maxed!\n\n` +
          `Current Power: ${Math.floor(totalPower)}\n` +
          `Max Power: ${currentPoPData.max_team_power}\n\n` +
          `This will take longer than 6 hours to complete.\n` +
          `Do you want to continue?`
      );
      if (!shouldContinue) {
        delete this.popPresets[popId]; // Delete preset entry
        // Revert UI changes
        $(".startPoPButton").css("display", "");
        $(".claimPoPButton").css("display", "none");
        shared.animations.loadingAnimation.stop();
        return;
      }
    }
    // You're sure it will proceed from here
    selectedGirls.forEach((girlId) => this.girlBackToPool.delete(girlId));

    $(".startPoPButton").css("display", "none");
    $(".claimPoPButton").css("display", "");

    // Here you would send the actual request to start the PoP with the selected girls
    // Example structure:
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
    shared.timer.activateTimers(
      "pop-record.selected .pop-active-timer",
      () => {}
    );
    pop_data[parseInt(popKey)].status = "in_progress";
    shared.general.hh_ajax(n, (_response: any) => {
      shared.animations.loadingAnimation.stop();
      this.selectNextPoP($(".pop-record.selected"));
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
    $PopSwitcher.on("click", () => {
      this.buildCustomPopInfo();
    });
    this.injectCustomStyles();
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
    GM.addStyle(`
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
    `);
  }
}
