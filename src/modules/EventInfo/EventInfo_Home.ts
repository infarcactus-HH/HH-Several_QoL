import { SubModule } from "../../types/subModules";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";
import { EventInfoStorageHandler } from "../../utils/StorageHandler";
import eventInfoHomeCss from "../../css/modules/EventInfo/EventInfo_Home.css";

export default class EventInfo_Home implements SubModule {
  run() {
    this.injectCSS();
    HHPlusPlusReplacer.doWhenSelectorAvailable("[rel='path-of-valor']", () => {
      this.PoVPoGHandler();
    });
    this.SMEventHandler();
  }
  async injectCSS() {
    GM_addStyle(eventInfoHomeCss);
  }
  SMEventHandler() {
    const SMShopRefreshTime =
      EventInfoStorageHandler.getSMShopRefreshTimeComparedToServerTS();
    const $smEventTimerBox = $("[rel='sm_event']").find(".timer-box");
    if (SMShopRefreshTime != 0 && !$smEventTimerBox) {
      EventInfoStorageHandler.setSMShopRefreshTimeComparedToServerTS(0);
      return;
    }
    if (SMShopRefreshTime > server_now_ts) {
      const t = shared.timer.buildTimer(
        SMShopRefreshTime - server_now_ts,
        GT.design.market_new_stock,
        "severalQoL-event-timer nc-expiration-label",
        !1
      );
      $smEventTimerBox.prepend(t);
      shared.timer.activateTimers("severalQoL-event-timer.nc-expiration-label");
    } else {
      $smEventTimerBox.prepend(
        `<div class="severalQoL-event-timer expired">${GT.design.sm_event_restock_now}</div>`
      );
    }
  }
  PoVPoGHandler() {
    const PoVEndTime =
      EventInfoStorageHandler.getPoVEndTimeComparedToServerTS();
    const PoGEndTime =
      EventInfoStorageHandler.getPoGEndTimeComparedToServerTS();
    if (PoVEndTime !== 0) {
      addPoVPoGTimer(PoVEndTime, $("[rel='path-of-valor']"), 14 * 24 * 60 * 60); // 14 days
    }
    if (PoGEndTime !== 0) {
      addPoVPoGTimer(PoGEndTime, $("[rel='path-of-glory']"), 35 * 24 * 60 * 60); // 35 days
    }

    function addPoVPoGTimer(
      endTime: number,
      $aHrefElement: JQuery<HTMLElement>,
      incrementSeconds: number
    ) {
      while (endTime < server_now_ts) {
        endTime += incrementSeconds; // in case the time stored is old, we increment until it's in the future
      }
      const timer = shared.timer.buildTimer(
        endTime - server_now_ts,
        GT.design.event_ends_in,
        "severalQoL-PoVPoG-timer nc-expiration-label",
        false
      );
      $aHrefElement.find(".white_text").append(timer);
    }
    shared.timer.activateTimers(
      "severalQoL-PoVPoG-timer.nc-expiration-label",
      () => {}
    );
  }
}
