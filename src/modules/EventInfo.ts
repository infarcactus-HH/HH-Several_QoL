import { sm_event_dataIncomplete } from "../types/GameTypes";
import { HHModule } from "../types/HH++";
import GameHelpers from "../utils/GameHelpers";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { StorageHandlerEventInfo } from "../utils/StorageHandler";

type EventInfo_Events =
  | "dp_event" // Double Pen
  | "cumback_contest"
  | "sm_event" // SM
  | "event"; // Org Days

export default class EventInfo extends HHModule {
  private readonly EventInfoLinks: Record<string, string> = {
    dp_event:
      "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-304655",
    sm_event:
      "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-309998",
    cumback_contest:
      "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-304660",
    event:
      "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-304653",
  };
  readonly configSchema = {
    baseKey: "eventInfo",
    label:
      "<span tooltip='Click on the Information top right of event (only DP, SM, CbC, OD for now)'>Event Info (WIP): Show guides, tips, tricks & more info events</span>",
    default: true,
  };
  shouldRun() {
    return (
      location.pathname.includes("/event.html") ||
      location.pathname.includes("/home.html")
    );
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.injectCSS();
    if (location.pathname.includes("/home.html")) {
      this.runHome();
      return;
    }
    const eventInSearchParams = new URLSearchParams(location.search).get("tab");
    const eventType = eventInSearchParams?.replace(/_\d+$/, "");
    this.whichEventToCall(eventType as EventInfo_Events | undefined);
  }
  injectCSS() {
    const css = require("./css/EventInfo.css").default;
    console.log(GM.addStyle(css));
  }
  runHome() {
    const SMShopRefreshTime = StorageHandlerEventInfo.getSMShopRefreshTimeComparedToServerTS();
    const $smEventTimerBox = $("[rel='sm_event']").find(".timer-box");
    if (SMShopRefreshTime != 0 && !$smEventTimerBox) {
      StorageHandlerEventInfo.setSMShopRefreshTimeComparedToServerTS(0);
      return;
    }
    if (SMShopRefreshTime > server_now_ts) {
      const t = shared.timer.buildTimer(
        SMShopRefreshTime - server_now_ts,
        GT.design.sm_event_restock_in,
        "severalQoL-event-timer nc-expiration-label",
        !1
      );
      GM.addStyle(
        `[rel='sm_event'] .severalQoL-event-timer {padding-bottom: 0px!important}`
      );
      console.log(
        StorageHandlerEventInfo.getSMShopRefreshTimeComparedToServerTS()
      );
      $smEventTimerBox.prepend(t);
      shared.timer.activateTimers("severalQoL-event-timer.nc-expiration-label");
    } else {
      $smEventTimerBox.prepend(`<div class="severalQoL-event-timer expired">Restock Now!</div>`)
    }
  }
  helperCreateNotifButton(event: EventInfo_Events) {
    const $notifButton = $(
      `<div class="button-notification-action notif_button_s sm-event-info-button" tooltip="Several QoL: More Info on this event"></div>`
    );
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".nc-panel-header .nc-pull-right",
      () => {
        $(".nc-panel-header .nc-pull-right").prepend($notifButton);
      }
    );
    $notifButton.off("click").on("click", (e) => {
      GM.openInTab(this.EventInfoLinks[event], { active: true });
    });
    return $notifButton;
  }
  helperReplaceNotifButton(event: EventInfo_Events) {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".button-notification-action.notif_button_s",
      () => {
        $(".button-notification-action.notif_button_s")
          .attr("tooltip", "Several QoL: More Info on this event")
          .off("click")
          .on("click", (e) => {
            GM.openInTab(this.EventInfoLinks[event], { active: true });
          });
      }
    );
  }
  whichEventToCall(eventType: EventInfo_Events | undefined) {
    if (!eventType) {
      return;
    }
    switch (eventType) {
      case "dp_event":
        this.dp_eventRun();
        return;
      case "sm_event":
        this.sm_eventRun();
        return;
      case "cumback_contest":
        this.helperCreateNotifButton("cumback_contest");
        return;
      case "event":
        this.helperCreateNotifButton("event");
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
                    `Before going\n into more details read <a target="_blank" href="${this.EventInfoLinks["dp_event"]}"><strong>this</strong></a> guide made by bolitho` +
                    `<br><br>There are important things to note for this event:<br>` +
                    `First there are some missions that are not in the daily missions list that can appear on easy & hard side :<br>` +
                    `- Claim chest n°X on daily missions (idk if you can land on a chest you already claimed)<br>` +
                    `- Claim X number of PoP<br>` +
                    `- Gain PoV potions<br>` +
                    `- Get shards<br>` +
                    `- Score points in contests<br>` +
                    `<br>` +
                    `There's one that's <strong>really annoying</strong> that can only appear on the hard side:<br>` +
                    `- Restock market<br>` +
                    `<br>` +
                    `One info not given is that a challenge cannot be the same on both easy & hard side as such try to lock an annoying mission on the hard side before you get stuck with "Restock Market"` +
                    `</span></div>`
                );
            });
          });
      }
    );
  }
  sm_eventRun() {
    this.helperReplaceNotifButton("sm_event");
    const sm_event_data = unsafeWindow.sm_event_data as sm_event_dataIncomplete;
    // base game function
    const t = shared.timer.buildTimer(
      sm_event_data.seconds_until_event_end,
      GT.design.event_ends_in,
      "event-timer nc-expiration-label",
      !1
    );
    $(".nc-pull-right").append(t);
    shared.timer.activateTimers("event-timer.nc-expiration-label");
    // end base game function
    $("#sultry-mysteries-tabs > #shop_tab").on(
      "click.SeveralQoLEventInfo",
      function () {
        $(this).off("click.SeveralQoLEventInfo");
        HHPlusPlusReplacer.doWhenSelectorAvailable(".shop-timer.timer", () => {
          const shopRefreshesIn =
            $(".shop-timer.timer").attr("data-time-stamp");
          if (!shopRefreshesIn || isNaN(Number(shopRefreshesIn))) {
            return;
          }
          const timeShopRefreshesIn =
            Number(shopRefreshesIn) + Math.floor(Date.now() / 1000);
          StorageHandlerEventInfo.setSMShopRefreshTimeComparedToServerTS(
            timeShopRefreshesIn
          );
        });
      }
    );
    const storedSMShopRefreshTime =
      StorageHandlerEventInfo.getSMShopRefreshTimeComparedToServerTS();
    if (storedSMShopRefreshTime > server_now_ts) {
      const t = shared.timer.buildTimer(
        storedSMShopRefreshTime - server_now_ts,
        "",
        "severalQoL-event-shop-timer nc-expiration-label",
        !1
      );
      $("#sultry-mysteries-tabs > #shop_tab").append(t);
      shared.timer.activateTimers(
        "severalQoL-event-shop-timer.nc-expiration-label"
      );
    }
  }
}
