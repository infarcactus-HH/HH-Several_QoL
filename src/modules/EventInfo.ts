import { HHModule } from "../types/HH++";
import GameHelpers from "../utils/GameHelpers";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

type EventInfo_Events =
  | "dp_event" // Double Pen
  | "cumback_contest"
  | "sm_event" // SM
  | "event"; // Org Days

export default class EventInfo extends HHModule {
  readonly configSchema = {
    baseKey: "eventInfo",
    label:
      "<span tooltip='Click on the Information top right of event (only DP for now)'>Event Info (WIP): Show guides tips & tricks for events</span>",
    default: true,
  };
  shouldRun() {
    return location.pathname.includes("/event.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.injectCSS();
    const eventInSearchParams = new URLSearchParams(location.search).get("tab");
    const eventType = eventInSearchParams?.replace(/_\d+$/, "");
    this.whichEventToCall(eventType as EventInfo_Events | undefined);
  }
  injectCSS() {
    const css = require("./css/EventInfo.css").default;
    GM.addStyle(css);
  }
  whichEventToCall(eventType: EventInfo_Events | undefined) {
    if (!eventType) {
      return;
    }
    switch (eventType) {
      case "dp_event":
        this.dp_eventRun();
        return;
      default:
        return; // not yet implemented or nothing to display
    }
  }
  dp_eventRun() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".button-notification-action.notif_button_s",
      () => {
        $(".button-notification-action.notif_button_s")
          .attr("tooltip", "Several QoL: More Info on this event")
          .off("click")
          .on("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            GameHelpers.createCommonPopup("event_info", (popup, _t) => {
              popup.$dom_element
                .find(".container-special-bg")
                .append(
                  `<div class="banner">Several QoL - Event Info - DP</div>` +
                    `<div class="event-content dp_event"><span>` +
                    `Before going\n into more details read <a href="https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-304655"><strong>this</strong></a> guide made by bolitho` +
                    `<br><br>There are important things to note for this event:<br>` +
                    `First there are some missions that are not in the daily missions list that can appear on easy & hard side :<br>` +
                    `- Claim chest n°X on daily missions (idk if you can land on a chest you already claimed)<br>` +
                    `- Claim X number of PoP<br>` +
                    `- Gain PoV potions<br>` +
                    `- Get shards<br>` +
                    `- Score points in contests<br>` +
                    `<br>` +
                    `There's one that's <strong>really annoying</strong> that can only appear on the hard side:<br>`+
                    `- Restock market<br>` +
                    `<br>` +
                    `One info not given is that a challenge cannot be the same on both easy & hard side as such try to lock an annoying mission on the hard side before you get stuck with "Restock Market"`+
                    `</span></div>`
                );
            });
          });
      }
    );
  }
}
