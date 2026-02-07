import { HHModule, HHModule_ConfigSchema, SubSettingsType } from "../base";
import { temporaryPoPBarCss } from "../css/modules";
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
  static shouldRun() {
    return true;
  }
  run(subSettings: SubSettingsType<HHPlusPlusBdsmPatch_configSchema>) {
    if (this.hasRun || !HHPlusPlusBdsmPatch.shouldRun()) {
      return;
    }
    this.hasRun = true;
    if (subSettings.temporaryPoPBar) {
      this.addPoPBar();
    }
  }
  private addPoPBar() {
    const hhTrackedTimes = JSON.parse(localStorage.getItem("HHPlusPlusTrackedTimes") || "{}");
    if (!hhTrackedTimes.pop || !hhTrackedTimes.popDuration) {
      return;
    }
    const remainingTimeSec = hhTrackedTimes.pop - server_now_ts;
    const durationTimeSec = hhTrackedTimes.popDuration;

    const DateNowInit = Date.now();

    // Clamp progress between 0 and 1
    const elapsed = durationTimeSec - remainingTimeSec;
    const progress = Math.max(0, Math.min(1, elapsed / durationTimeSec));

    // Format remaining time for tooltip
    const clampedRemaining = Math.max(0, remainingTimeSec);
    const hours = Math.floor(clampedRemaining / 3600);
    const minutes = Math.floor((clampedRemaining % 3600) / 60);
    const seconds = Math.floor(clampedRemaining % 60);
    const timeTooltip =
      hours > 0
        ? `${hours}h ${minutes}m ${seconds}s`
        : minutes > 0
          ? `${minutes}m ${seconds}s`
          : `${seconds}s`;

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
        tooltip="${timeTooltip} remaining"
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

    HHPlusPlusReplacer.doWhenSelectorAvailable(
      "#contains_all header>.script-booster-status",
      ($scriptBoostStatus) => {
        $scriptBoostStatus.after($popBar);

        // Update tooltip every second
        const updateTooltip = () => {
          console.log("Updating PoP tooltip");

          const hhTrackedTimesUpdated = JSON.parse(
            localStorage.getItem("HHPlusPlusTrackedTimes") || "{}",
          );
          if (!hhTrackedTimesUpdated.pop || !hhTrackedTimesUpdated.popDuration) {
            clearInterval(tooltipInterval);
            return;
          }

          const remainingTimeSecUpdated =
            hhTrackedTimesUpdated.pop - server_now_ts + (DateNowInit - Date.now()) / 1000;
          const clampedRemainingUpdated = Math.max(0, remainingTimeSecUpdated);
          const hoursUpdated = Math.floor(clampedRemainingUpdated / 3600);
          const minutesUpdated = Math.floor((clampedRemainingUpdated % 3600) / 60);
          const secondsUpdated = Math.floor(clampedRemainingUpdated % 60);
          const timeTooltipUpdated =
            hoursUpdated > 0
              ? `${hoursUpdated}h ${minutesUpdated}m ${secondsUpdated}s`
              : minutesUpdated > 0
                ? `${minutesUpdated}m ${secondsUpdated}s`
                : `${secondsUpdated}s`;

          $popBar.attr("tooltip", `${timeTooltipUpdated} remaining`);

          if (clampedRemainingUpdated <= 0) {
            clearInterval(tooltipInterval);
            $popBar.addClass("sqol-pop-bar-finished");
          }
        };

        const tooltipInterval = setInterval(updateTooltip, 1000);
      },
    );
  }
}
