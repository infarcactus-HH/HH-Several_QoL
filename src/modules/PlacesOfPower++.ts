import {
  global_pop_hero_girls_incomplete,
  PlacesOfPowerData,
} from "../types/GameTypes";
import { HHModule, SubSettingsType } from "../types/HH++";
import placesOfPowerCss from "../css/modules/PlacesOfPower++.css";

declare const pop_data: Record<number, PlacesOfPowerData>;
declare const pop_hero_girls: Record<number, global_pop_hero_girls_incomplete>; // id_places_of_power
declare const hh_prices_auto_start: number;
declare const hh_prices_auto_claim: number;

type configSchema = {
  baseKey: "placesOfPowerPlusPlus";
  label: "<span tooltip='Global overhaul of PoPs especially for claiming & filling manually'>Places of Power++</span>";
  default: true;
  subSettings: [
    {
      key: "rewardPopup";
      default: true;
      label: "Show reward popup on PoP claim";
    }
  ];
};

export default class PlacesOfPowerPlusPlus extends HHModule {
  readonly configSchema = {
    baseKey: "placesOfPowerPlusPlus",
    label:
      "<span tooltip='Global overhaul of PoPs especially for claiming & filling manually'>Places of Power++</span>",
    default: true,
    subSettings: [
      {
        key: "rewardPopup",
        default: true,
        label: "Show reward popup on PoP claim",
      },
    ],
  };
  private sortedGirlsCache: Record<1 | 2 | 3, number[]> = {
    1: [],
    2: [],
    3: [],
  };
  private isLoadingGirls = false;
  private currentPoPGirls: Record<number, number[]> = {}; // popId -> array of girl IDs
  private readonly minPercentToStartPoP: number = 0.05; // Minimum percent of max power required to start a PoP (5%)
  private hasPopupEnabled: boolean = false;

  private readonly criteriaToClassMap: Record<
    PlacesOfPowerData["criteria"],
    1 | 2 | 3
  > = {
    carac_1: 1,
    carac_2: 2,
    carac_3: 3,
  };

  // prettier-ignore
  private readonly idealPoPOrder = [ // From HH++ slightly tweaked
    '1', '2', '3',      // primary pops
    '13', '14', '15',   // orb      / water
    '7', '8', '9',      // koban    / light
    '4', '5', '6',      // ymen     / darkness
    '16', '17', '18',   // booster  / fire
    '22', '23', '24',   // gift     / sun
    '19', '20', '21',   // ticket   / stone
    '10', '11', '12',   // gem      / nature & psychic
  ];

  static shouldRun() {
    return (
      location.pathname.includes("/activities.html") &&
      !location.search.includes("?tab=pop&index=") &&
      unsafeWindow.pop_data !== undefined
    );
  }
  run(subSettings: SubSettingsType<configSchema>) {
    if (this.hasRun || !PlacesOfPowerPlusPlus.shouldRun()) {
      return;
    }
    this.hasPopupEnabled = subSettings?.rewardPopup ?? true;
    this.hasRun = true;
    const $PopSwitcher = $(".switch-tab[data-tab='pop']");
    $PopSwitcher.contents()[0].nodeValue = "Places of Power++";
    $PopSwitcher.attr("tooltip", "By infarctus");
    $PopSwitcher.on("click", async () => {
      // Wait for girls to finish updating before building UI
      if (this.isLoadingGirls) {
        shared.animations.loadingAnimation.start();
        while (this.isLoadingGirls) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        shared.animations.loadingAnimation.stop();
      }
      this.buildCustomPopInfo();
    });
    this.injectCustomStyles();
    const popToStart = Object.values(pop_data).find(
      (pop) => pop.status === "can_start" || pop.status === "pending_reward"
    );
    if (true || popToStart) {
      this.girlsHandler();
    }
  }

  updateSuckless() {
    if (unsafeWindow.suckless && unsafeWindow.suckless.parsePopData) {
      console.log("Updating other scripts PoP tracked time", pop_data);
      unsafeWindow.suckless.parsePopData(pop_data);
    }
  }

  updateOtherScriptsPoPTrackedTime() {
    this.updateSuckless();
    const localStorageKey = "HHPlusPlusTrackedTimes";
    if (!localStorage.getItem(localStorageKey)) {
      console.log("No HHPlusPlusTrackedTimes found in localStorage");
      return;
    }
    const trackedTimes: Record<string, any> = JSON.parse(
      localStorage.getItem(localStorageKey) || "{}"
    );
    if (
      trackedTimes.pop == undefined ||
      trackedTimes.popDuration == undefined
    ) {
      console.log("No trackedTimes.pop or trackedTimes.popDuration found");
      return;
    }
    const endingsIn = Object.values(pop_data)
      .map(({ remaining_time, time_to_finish }) => ({
        endAt: remaining_time,
        duration: time_to_finish,
      }))
      .filter(({ endAt }) => endAt)
      .sort((a, b) => (a.endAt > b.endAt ? 1 : -1));

    const soonest = endingsIn[0] || { endAt: 0, duration: 0 };
    const nowTs = Math.floor(Date.now() / 1e3);
    trackedTimes.pop = nowTs + soonest.endAt;
    trackedTimes.popDuration = soonest.duration;
    localStorage.setItem(localStorageKey, JSON.stringify(trackedTimes));
  }

  createOrUpdateKobanButtons() {
    let popToClaim = false;
    let popToFill = false;
    for (const popEntry of Object.values(pop_data)) {
      if (popEntry.status === "pending_reward") {
        popToClaim = true;
      }
      if (popEntry.status === "can_start") {
        popToFill = true;
      }
      if (popToClaim && popToFill) break;
    }
    if ($(".pop-koban-buttons-container").length) {
      $(".pop-koban-buttons-container").remove();
    }
    const $popKobanButtonContainer = $(
      `<div class="pop-koban-buttons-container"></div>`
    );
    const $popKobanClaimAllButton = $(
      `<btn class="pop-koban-button pop-claim-all orange_button_L" price="${hh_prices_auto_claim}" ${
        popToClaim ? "" : "disabled"
      }>` +
        `<div class="action-label">Claim All</div>` +
        `<div class="action-cost">` +
        `<div class="hc-cost">` +
        `<span class="hard_currency_icn"></span>${hh_prices_auto_claim}` +
        `</div></div></div>`
    );
    const self = this;
    $popKobanClaimAllButton.on("click", function () {
      let t = $(this);
      if (t.attr("disabled") !== undefined) {
        return;
      }
      let n = t.attr("price");
      shared.general.hc_confirm(n!, () => {
        shared.animations.loadingAnimation.start();
        t.prop("disabled", true);
        shared.general.hh_ajax(
          {
            action: "pop_claim_all",
          },
          (response: any) => {
            for (const popEntry of Object.values(pop_data)) {
              if (popEntry.status === "pending_reward") {
                delete self.currentPoPGirls[popEntry.id_places_of_power];
                popEntry.status = "can_start";
              }
            }
            if (self.hasPopupEnabled) {
              shared.reward_popup.Reward.handlePopup(response.rewards);
            }
            $(".pop-record .collect_notif").remove();
            self.buildPopDetails("1");
            $("pop-record").first().trigger("click");
            shared.animations.loadingAnimation.stop();
          }
        );
      });
    });
    $popKobanButtonContainer.append($popKobanClaimAllButton);
    const $popKobanFillAllButton = $(
      `<btn class="pop-koban-button pop-fill-all orange_button_L" price="${hh_prices_auto_start}" ${
        popToFill ? "" : "disabled"
      }>` +
        `<div class="action-label">Fill All</div>` +
        `<div class="action-cost">` +
        `<div class="hc-cost">` +
        `<span class="hard_currency_icn"></span>${hh_prices_auto_start}` +
        `</div></div></div>`
    );
    $popKobanFillAllButton.on("click", function () {
      //base game function except for the update of pop_data
      let t = $(this);
      if (t.attr("disabled") !== undefined) return;
      let n = t.attr("price");
      shared.general.hc_confirm(n!, () => {
        t.prop("disabled", !0),
          shared.general.hh_ajax(
            {
              action: "pop_auto_start_all",
            },
            function () {
              t.prop("disabled", !1);
              location.reload();
            }
          );
      });
    });
    $popKobanButtonContainer.append($popKobanFillAllButton);
    $("#pop_info").append($popKobanButtonContainer);
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

    const selectedGirls = this.selectOptimalGirls(popId, targetPower, criteria);
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
    const sortedGirlIds = this.sortedGirlsCache[classNumber];

    if (sortedGirlIds.length === 0) {
      console.error(`[PoP ${popId}] No girls available in storage!`);
      return [];
    }

    // Get set of girls already assigned to other PoPs
    const assignedGirls = new Set<number>();
    for (const [otherPopId, girlIds] of Object.entries(this.currentPoPGirls)) {
      if (parseInt(otherPopId) !== popId) {
        girlIds.forEach((id) => assignedGirls.add(id));
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
            if (nextPower === remainingPower) {
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
    let $next = $currentPoPRecordSelected
      .nextAll()
      .filter(function () {
        const popId = $(this).data("pop-id");
        const popData = pop_data[popId];
        return !popData.locked && popData && popData.status !== "in_progress";
      })
      .first();
    if ($next.length) {
      $next.trigger("click");
      return;
    }
    // If none found after, try from the start (excluding those with pending_reward)
    $next = $(".pop-record")
      .filter(function () {
        const popId = $(this).data("pop-id");
        const popData = pop_data[popId];
        return !popData.locked && popData && popData.status !== "in_progress";
      })
      .first();
    if ($next.length) {
      $next.trigger("click");
    } else {
      for (const popEntry of Object.values(pop_data)) {
        if (!popEntry.locked && popEntry.status !== "in_progress") {
          $(`[data-pop-id='${popEntry.id_places_of_power}']`).trigger("click");
          return;
        }
      }
      // fallback: select the first
      $(".pop-record").first().trigger("click");
    }
  }
  selectNextPoPFromClaim() {
    const $currentPoPRecordSelected = $(".pop-record.selected");
    if (
      $currentPoPRecordSelected.nextAll().find(".collect_notif").length !== 0
    ) {
      // find those after in priority
      $currentPoPRecordSelected
        .nextAll()
        .find(".collect_notif")
        .first()
        .parent()
        .trigger("click");
      return;
    }
    const $nextWithNotif = $(".pop-record").find(".collect_notif").first();
    if ($nextWithNotif.length) {
      $nextWithNotif.parent().trigger("click");
      return;
    } else {
      for (const popEntry of Object.values(pop_data)) {
        if (!popEntry.locked && popEntry.status === "can_start") {
          $(`[data-pop-id='${popEntry.id_places_of_power}']`).trigger("click");
          return;
        }
      }
    }
    $(".pop-record").first().trigger("click"); // default to first
  }

  sendClaimRequest(popKey: string) {
    shared.animations.loadingAnimation.start();
    const popKeyInt = parseInt(popKey);
    this.readdGirlsFromCurrentPoP(popKey);
    const currentPoPData = pop_data[popKeyInt];
    $(".claimPoPButton").prop("disabled", true);
    if (currentPoPData.ends_in === null || currentPoPData.ends_in !== 0) {
      $(".claimPoPButton").css("display", "none");
      $(".startPoPButton").css("display", "");
      currentPoPData.status = "can_start";
      currentPoPData.ends_in = null;
      currentPoPData.time_to_finish = 0;
      $(".pop-record.selected .collect_notif").remove();
    } else {
      const $currentPoPRecordSelected = $(".pop-record.selected");
      this.selectNextPoPFromFill($currentPoPRecordSelected);
      delete pop_data[popKeyInt];
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
    delete this.currentPoPGirls[currentPoPData.id_places_of_power];
    shared.general.hh_ajax(n, (response: any) => {
      if (this.hasPopupEnabled) {
        shared.reward_popup.Reward.handlePopup(response.rewards);
      }
      this.selectNextPoPFromClaim();
      this.updateSuckless();
      shared.animations.loadingAnimation.stop();
    });
  }

  calculateTimeToFinishSeconds(
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
    const popKeyInt = parseInt(popKey);
    const currentPoPData = pop_data[popKeyInt];
    if (currentPoPData.status !== "can_start") return;

    const popId = currentPoPData.id_places_of_power;

    // Build assignment for this specific PoP only
    console.log(`[PoP ${popId}] Building assignment for this PoP...`);
    const selectedGirls = this.assignGirlsToPoP(popId) || [];
    this.currentPoPGirls[popId] = selectedGirls;

    if (selectedGirls.length === 0) {
      alert(
        `No ${GT.design.Girls} were assigned to this PoP. This might happen if all your ${GT.design.Girls} are already assigned to other PoPs.`
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

    if (
      totalPower / currentPoPData.max_team_power <
      this.minPercentToStartPoP
    ) {
      alert("Not enough power to start this PoP.");
      delete this.currentPoPGirls[popId];
      shared.animations.loadingAnimation.stop();
      return;
    }

    const timeToFinishSeconds = this.calculateTimeToFinishSeconds(
      currentPoPData,
      selectedGirls
    );

    // If not capped, ask for confirmation
    if (totalPower < currentPoPData.max_team_power) {
      const shouldContinue = confirm(
        `Warning: This PoP is not fully maxed!\n\n` +
          `Current Power: ${Math.floor(totalPower)}\n` +
          `Max Power: ${currentPoPData.max_team_power}\n\n` +
          `This will take ${(timeToFinishSeconds / 60 / 60).toFixed(
            2
          )} hours to complete.` +
          `\nDo you want to continue?`
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
      timeToFinishSeconds,
      "",
      "pop-active-timer",
      false
    );
    $timer.append(timerElement);
    $(".pop-record.selected").append($timer);
    pop_data[popKeyInt].status = "in_progress";
    pop_data[popKeyInt].time_to_finish = timeToFinishSeconds;
    pop_data[popKeyInt].end_ts =
      timeToFinishSeconds + Math.floor(Date.now() / 1e3);

    shared.general.hh_ajax(n, (_response: any) => {
      shared.timer.activateTimers(
        "pop-record.selected .pop-active-timer",
        () => {}
      );
      this.selectNextPoPFromFill($(".pop-record.selected"));
      this.updateOtherScriptsPoPTrackedTime();
      shared.animations.loadingAnimation.stop();
    });
  }

  buildPopDetails(popKey: string) {
    const $popDetails = $(".pop-details-container");
    if (!$popDetails.length) return;
    const currentPoPData = pop_data[parseInt(popKey)];
    if (!currentPoPData) return;

    $popDetails.empty();

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

    for (const [_key, reward] of Object.entries(currentPoPData.rewards)) {
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
    this.createOrUpdateKobanButtons();
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
    // Order them according to idealPoPOrder (if an id appears there), then fallback to numeric id order
    const orderedEntries = Object.entries(pop_data).sort(
      ([_aKey, aRec], [_bKey, bRec]) => {
        const aId = String(aRec.id_places_of_power ?? _aKey);
        const bId = String(bRec.id_places_of_power ?? _bKey);
        const idxA = this.idealPoPOrder.indexOf(aId);
        const idxB = this.idealPoPOrder.indexOf(bId);
        if (idxA !== -1 || idxB !== -1) {
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        }
        // fallback to numeric order
        return Number(aId) - Number(bId);
      }
    );

    orderedEntries.forEach(([key, popRecord]) => {
      const isLocked = popRecord.locked || 0;
      const $popRecord = $(
        `<div class="${isLocked ? "pop-record-locked" : "pop-record"}"></div>`
      );
      $popRecord.attr("data-pop-id", key);
      // Set background image inline (can't be done in CSS)
      $popRecord.css("background-image", `url(${popRecord.image})`);

      // Add click handler for selection
      if (!isLocked) {
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
      }

      $popRecordsContainer.append($popRecord);
      $popRecord.attr("tooltip", popRecord.title);
    });

    // Add the container to the top of popInfo
    $popInfo.append($popRecordsContainer);
    //Select first PoP by default
    if ($(".pop-record").find(".collect_notif").length !== 0) {
      $(".pop-record").find(".collect_notif").first().parent().trigger("click");
    } else {
      $(".pop-record").first().trigger("click");
    }

    shared.timer.activateTimers("pop-active-timer", (timer) => {
      const $popRecord = timer.$dom_element.parent().parent().parent();
      if ($popRecord.hasClass("selected")) {
        $(".claimPoPButton").prop("disabled", false);
      }
      const popId = $popRecord.data("pop-id");
      pop_data[popId].status = "pending_reward";
      pop_data[popId].remaining_time = 0;
      $popRecord.append('<div class="collect_notif"></div>');
    });
  }
  async injectCustomStyles() {
    // Inject module-specific styling when the PoP UI is displayed
    GM_addStyle(placesOfPowerCss);
  }

  async girlsHandler() {
    this.isLoadingGirls = true;

    const byClass: { [k in 1 | 2 | 3]: { id: number; carac: number }[] } = {
      1: [],
      2: [],
      3: [],
    };

    for (const g of Object.values(pop_hero_girls)) {
      if (!g || g.id_girl == null) continue;
      byClass[1].push({ id: g.id_girl, carac: g.carac1 });
      byClass[2].push({ id: g.id_girl, carac: g.carac2 });
      byClass[3].push({ id: g.id_girl, carac: g.carac3 });
      if (g.id_places_of_power != null) {
        if (!this.currentPoPGirls[g.id_places_of_power]) {
          this.currentPoPGirls[g.id_places_of_power] = [];
        }
        this.currentPoPGirls[g.id_places_of_power].push(g.id_girl);
      }
    }

    this.sortedGirlsCache[1] = byClass[1]
      .sort((a, b) => b.carac - a.carac)
      .map((x) => x.id);
    this.sortedGirlsCache[2] = byClass[2]
      .sort((a, b) => b.carac - a.carac)
      .map((x) => x.id);
    this.sortedGirlsCache[3] = byClass[3]
      .sort((a, b) => b.carac - a.carac)
      .map((x) => x.id);

    this.isLoadingGirls = false;
  }
}
