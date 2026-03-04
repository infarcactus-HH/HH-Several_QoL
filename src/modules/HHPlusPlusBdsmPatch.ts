import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../base";
import { temporaryPoPBarCss } from "../css/modules";
import { TooltipHook } from "../SingletonModules/TooltipHook";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
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
      "<span tooltip='Add some things BDSM will add at some point'>HH++ BDSM Patch (Temporary fix/addons)</span>",
    default: true,
    subSettings: [
      {
        key: "temporaryPoPBar",
        label: "Temporary PoP Bar",
        default: true,
      },
    ],
  };
  static shouldRun_() {
    return true;
  }
  run(subSettings: SubSettingsType<HHPlusPlusBdsmPatch_configSchema>) {
    if (this._hasRun || !HHPlusPlusBdsmPatch.shouldRun_()) {
      return;
    }
    this._hasRun = true;
    if (subSettings.temporaryPoPBar) {
      this._addPoPBar();
    }
  }
  private _addPoPBar() {
    const hhTrackedTimes = JSON.parse(localStorage.getItem("HHPlusPlusTrackedTimes") || "{}");
    if (hhTrackedTimes.pop === undefined || hhTrackedTimes.popDuration === undefined) {
      return;
    }
    const remainingTimeSec = hhTrackedTimes.pop - server_now_ts;
    const durationTimeSec = Math.max(hhTrackedTimes.popDuration, 1); // Avoid division by zero

    const DateNowInit = Date.now();

    // Clamp progress between 0 and 1
    const elapsed = durationTimeSec - remainingTimeSec;
    const progress = Math.max(0, Math.min(1, elapsed / durationTimeSec));

    // SVG circular progress ring parameters
    const size = 36;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);

    const isFinished = progress >= 1;
    const containerClass = isFinished
      ? "sqol-pop-bar-container sqol-pop-bar-finished"
      : "sqol-pop-bar-container";

    const $popBar = $(html`
      <a
        href="${shared.general.getDocumentHref("/activities.html?tab=pop")}"
        class="${containerClass}"
        tooltip="50m 50s"
        tooltip_extra_classes="QoL-custom-tooltip PoP-tooltip"
        timeToFinish="${remainingTimeSec}"
      >
        <svg class="sqol-pop-bar-ring" viewBox="0 0 ${size} ${size}">
          <circle
            class="sqol-pop-bar-ring-bg"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke-width="${strokeWidth}"
          />
          <circle
            class="sqol-pop-bar-ring-progress"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${dashOffset}"
          />
        </svg>
        <img
          class="sqol-pop-bar-icon"
          src="https://hh.hh-content.com/pictures/gallery/18/200x/379e7b87f856f75d6016f0242415d028.webp"
          alt="PoP"
        />
      </a>
    `);

    GM_addStyle(temporaryPoPBarCss);

    HHPlusPlusReplacer.doWhenSelectorAvailable_(
      "#contains_all header>.script-booster-status",
      ($scriptBoostStatus) => {
        $scriptBoostStatus.after($popBar);

        // Update tooltip every second
        const updateTooltip = () => {
          const hhTrackedTimesUpdated = JSON.parse(
            localStorage.getItem("HHPlusPlusTrackedTimes") || "{}",
          );
          if (!hhTrackedTimesUpdated.pop || !hhTrackedTimesUpdated.popDuration) {
            clearInterval(tooltipInterval);
            return;
          }

          const remainingTimeSecUpdated =
            hhTrackedTimesUpdated.pop - server_now_ts + (DateNowInit - Date.now()) / 1000;

          $popBar.attr("timeToFinish", remainingTimeSecUpdated);

          if (remainingTimeSecUpdated <= 0) {
            clearInterval(tooltipInterval);
            $popBar.addClass("sqol-pop-bar-finished");
          }
        };

        const tooltipInterval = setInterval(updateTooltip, 1000);
      },
    );
    TooltipHook.getInstance_().addTooltipOverride(
      "[tooltip].sqol-pop-bar-container",
      ".PoP-tooltip",
      (currentTarget, tooltipElement) => {
        const timeToFinish = Number($(currentTarget).attr("timeToFinish") || "0");
        const timer = shared.timer.buildTimer(timeToFinish, "", "PoP-tooltip-timer");
        $(tooltipElement).empty().append(`<div class="PoP-tooltip-content">${timer}</div>`);
        shared.timer.activateTimers("PoP-tooltip-timer", () => {});
      },
    );
  }
}
