import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../base";
import { temporaryPoPBarCss } from "../css/modules";
import runTimingHandler from "../runTimingHandler";
import { TooltipHook } from "../SingletonModules/TooltipHook";
import { UnsafeWindow_Activities } from "../types/unsafeWindows/activities";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { PlayerStorageHandler } from "../utils/StorageHandler";
import html from "../utils/html";

type HHPlusPlusBdsmPatch_configSchema = {
  baseKey: "hhPlusPlusBdsmPatch";
  label: "<span tooltip='Add some things BDSM will add at some point'>HH++ BDSM Patch (Temporary fix/addons)</span>";
  default: true;
  subSettings: [
    {
      key: "temporaryPoPBar";
      label: "Temporary PoP Bar";
      default: true;
    },
  ];
};

export default class HHPlusPlusBdsmPatch extends HHModule {
  readonly configSchema: HHModule_ConfigSchema = {
    baseKey: "hhPlusPlusBdsmPatch",
    label:
      "<span tooltip='Add some things BDSM may add at some point'>HH++ BDSM Patch (Temporary fix/addons)</span>",
    default: true,
    subSettings: [
      {
        key: "temporaryPoPBar",
        label: "PoP/Mission Bar",
        default: true,
      },
    ],
  };
  static shouldRun_() {
    return true;
  }
  async run(subSettings: SubSettingsType<HHPlusPlusBdsmPatch_configSchema>) {
    if (this._hasRun || !HHPlusPlusBdsmPatch.shouldRun_()) {
      return;
    }
    this._hasRun = true;
    await runTimingHandler.afterGameScriptsRun_();
    if (subSettings.temporaryPoPBar) {
      this._addPoPBar();
    }
  }
  private _addPoPBar() {
    let popRemainingTimeSec = 0,
      popDurationTimeSec = 1;
    let activityRemainingTimeSec = 0,
      activityDurationTimeSec = 1;

    // Get PoP data
    if (location.pathname !== "/activities.html") {
      const hhTrackedTimes = JSON.parse(localStorage.getItem("HHPlusPlusTrackedTimes") || "{}");
      if (hhTrackedTimes.pop && hhTrackedTimes.popDuration) {
        popRemainingTimeSec = hhTrackedTimes.pop - server_now_ts;
        popDurationTimeSec = hhTrackedTimes.popDuration || 1;
      }
    } else {
      let currWindow = unsafeWindow as UnsafeWindow_Activities;
      if (currWindow.pop_data) {
        let popDatas = Object.values(currWindow.pop_data).filter((data) => data.remaining_time);
        if (popDatas.length > 0) {
          const soonestPop = popDatas.reduce((soonest, data) => {
            return data.remaining_time! < soonest.remaining_time! ? data : soonest;
          });
          popRemainingTimeSec = soonestPop.remaining_time;
          popDurationTimeSec = soonestPop.duration || 1;
        }
      }
    }

    // Get Activity data
    const missionEndTime = PlayerStorageHandler.getPlayerMissionState_();
    const missionDuration = PlayerStorageHandler.getPlayerMissionDuration_();
    if (missionEndTime !== null && missionDuration !== null) {
      activityRemainingTimeSec = Math.max(0, missionEndTime - Math.floor(Date.now() / 1000));
      activityDurationTimeSec = missionDuration;
    }

    // Always show at least the PoP bar - don't return early

    let displayRemainingTimeSec, displayDurationTimeSec, displayType: "pop" | "activity";
    let currentHref: string;

    // Primary display is PoP, only show mission if it finishes sooner or if activity finished sooner but wasn't cleared
    if (missionEndTime !== null && activityRemainingTimeSec < popRemainingTimeSec) {
      // Mission finishes sooner than PoP
      displayRemainingTimeSec = activityRemainingTimeSec;
      displayDurationTimeSec = activityDurationTimeSec;
      displayType = "activity";
      currentHref = shared.general.getDocumentHref("/activities.html?tab=missions");
    } else {
      // Show PoP in all other cases (default behavior)
      displayRemainingTimeSec = popRemainingTimeSec;
      displayDurationTimeSec = popDurationTimeSec;
      displayType = "pop";
      currentHref = shared.general.getDocumentHref("/activities.html?tab=pop");
    }

    const DateNowInit = Date.now();

    // Clamp progress between 0 and 1
    const elapsed = displayDurationTimeSec - displayRemainingTimeSec;
    const progress = Math.max(0, Math.min(1, elapsed / displayDurationTimeSec));

    // SVG circular progress ring parameters
    const size = 36;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);

    const isFinished = progress >= 1;
    const containerClass = isFinished
      ? "sqol-activity-bar-container sqol-activity-bar-finished"
      : "sqol-activity-bar-container";

    const activityIconSrc = "https://nutaku.haremheroes.com/images/design/menu/missions.svg";
    const popIconSrc =
      "https://hh.hh-content.com/pictures/gallery/18/200x/379e7b87f856f75d6016f0242415d028.webp";
    const iconSrc = displayType === "pop" ? popIconSrc : activityIconSrc;
    const altText = displayType === "pop" ? "PoP" : "Activity";

    const $activityBar = $(html`
      <a
        href="${currentHref}"
        class="${containerClass}"
        tooltip="<div class='activity-tooltip-template'><div class='activity-tooltip-item'>PoP : <br/>50m 50s</div><div class='activity-tooltip-item'>Activity: <br/>50m 50s</div></div>"
        tooltip_extra_classes="QoL-custom-tooltip activity-tooltip"
        timeToFinish="${displayRemainingTimeSec}"
        popTimeToFinish="${popRemainingTimeSec}"
        activityTimeToFinish="${activityRemainingTimeSec}"
        displayType="${displayType}"
      >
        <svg class="sqol-activity-bar-ring" viewBox="0 0 ${size} ${size}">
          <circle
            class="sqol-activity-bar-ring-bg"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke-width="${strokeWidth}"
          />
          <circle
            class="sqol-activity-bar-ring-progress"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${dashOffset}"
          />
        </svg>
        <img class="sqol-activity-bar-icon" src="${iconSrc}" alt="${altText}" />
      </a>
    `);

    GM_addStyle(temporaryPoPBarCss);

    HHPlusPlusReplacer.doWhenSelectorAvailable_(
      "#contains_all header>.script-booster-status",
      ($scriptBoostStatus) => {
        $scriptBoostStatus.after($activityBar);

        // Update tooltip every second
        const updateTooltip = () => {
          const hhTrackedTimesUpdated = JSON.parse(
            localStorage.getItem("HHPlusPlusTrackedTimes") || "{}",
          );
          const missionEndTimeUpdated = PlayerStorageHandler.getPlayerMissionState_();
          const missionDurationUpdated = PlayerStorageHandler.getPlayerMissionDuration_();

          let popTimeRemaining = 0;
          let activityTimeRemaining = 0;

          if (hhTrackedTimesUpdated.pop && hhTrackedTimesUpdated.popDuration) {
            popTimeRemaining =
              hhTrackedTimesUpdated.pop - server_now_ts + (DateNowInit - Date.now()) / 1000;
          }

          if (missionEndTimeUpdated !== null && missionDurationUpdated !== null) {
            activityTimeRemaining = Math.max(
              0,
              missionEndTimeUpdated - Math.floor(Date.now() / 1000),
            );
          }

          // Determine which to show now (recheck every second)
          let currentDisplayType: "pop" | "activity";
          let newHref: string;

          // Primary display is PoP, only show mission if it finishes sooner or if activity finished sooner but wasn't cleared
          if (missionEndTimeUpdated !== null && activityTimeRemaining < popTimeRemaining) {
            // Mission finishes sooner than PoP
            currentDisplayType = "activity";
            newHref = shared.general.getDocumentHref("/activities.html?tab=missions");
          } else {
            // Show PoP in all other cases (default behavior)
            currentDisplayType = "pop";
            newHref = shared.general.getDocumentHref("/activities.html?tab=pop");
          }

          // Update href if it changed
          $activityBar.attr("href", newHref);

          // Update display type and icon if needed
          const prevDisplayType = $activityBar.attr("displayType") as "pop" | "activity";
          if (prevDisplayType !== currentDisplayType) {
            if (currentDisplayType === "pop") {
              $activityBar.find("img").attr("src", popIconSrc).attr("alt", "PoP");
            } else {
              $activityBar.find("img").attr("src", activityIconSrc).attr("alt", "Activity");
            }
            $activityBar.attr("displayType", currentDisplayType);
          }

          $activityBar.attr("popTimeToFinish", popTimeRemaining);
          $activityBar.attr("activityTimeToFinish", activityTimeRemaining);
          $activityBar.attr("timeToFinish", Math.min(popTimeRemaining, activityTimeRemaining));

          // Update SVG progress ring
          let popDurationUpdated = 0;
          const hhTrackedTimesForDuration = JSON.parse(
            localStorage.getItem("HHPlusPlusTrackedTimes") || "{}",
          );
          if (hhTrackedTimesForDuration.popDuration) {
            popDurationUpdated = hhTrackedTimesForDuration.popDuration;
          }

          let displayDurationForRing = 1;
          if (currentDisplayType === "pop" && popDurationUpdated > 0) {
            displayDurationForRing = popDurationUpdated;
          } else if (currentDisplayType === "activity" && missionDurationUpdated) {
            displayDurationForRing = missionDurationUpdated;
          }

          const elapsedForRing =
            displayDurationForRing -
            (currentDisplayType === "pop" ? popTimeRemaining : activityTimeRemaining);
          const progressForRing = Math.max(0, Math.min(1, elapsedForRing / displayDurationForRing));
          const dashOffsetForRing = circumference * (1 - progressForRing);

          $activityBar
            .find(".sqol-activity-bar-ring-progress")
            .attr("stroke-dashoffset", dashOffsetForRing);

          // Update flashing class if progress is complete
          if (progressForRing >= 1) {
            if (!$activityBar.hasClass("sqol-activity-bar-finished")) {
              $activityBar.addClass("sqol-activity-bar-finished");
            }
          } else {
            if ($activityBar.hasClass("sqol-activity-bar-finished")) {
              $activityBar.removeClass("sqol-activity-bar-finished");
            }
          }
        };

        const tooltipInterval = setInterval(updateTooltip, 1000);
      },
    );
    TooltipHook.getInstance_().addTooltipOverride_(
      "[tooltip].sqol-activity-bar-container",
      ".activity-tooltip",
      (currentTarget, tooltipElement) => {
        const popTime = Number($(currentTarget).attr("popTimeToFinish") || "0");
        const activityTime = Number($(currentTarget).attr("activityTimeToFinish") || "0");
        console.log("Updating tooltip, popTime:", popTime, "activityTime:", activityTime);

        const content: string[] = [];

        if (popTime > 0) {
          const timer = shared.timer.buildTimer(popTime, "", "pop-timer");
          content.push(`<div class="activity-tooltip-item">PoP: ${timer}</div>`);
        }

        if (activityTime > 0) {
          const timer = shared.timer.buildTimer(activityTime, "", "activity-timer");
          content.push(`<div class="activity-tooltip-item">Activity: ${timer}</div>`);
        }

        if (content.length === 0) {
          $(tooltipElement).empty().append(`All activities are ready !`);
        } else {
          $(tooltipElement)
            .empty()
            .append(`<div class="activity-tooltip-content">${content.join("")}</div>`);
          shared.timer.activateTimers("pop-timer", () => {});
          shared.timer.activateTimers("activity-timer", () => {});
        }
      },
    );
  }
}
