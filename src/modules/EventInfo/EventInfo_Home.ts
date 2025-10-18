import { SubModule } from "../../types/subModules";
import { StorageHandlerEventInfo } from "../../utils/StorageHandler";

export default class EventInfo_Home implements SubModule {
  run() {
    const SMShopRefreshTime =
      StorageHandlerEventInfo.getSMShopRefreshTimeComparedToServerTS();
    const $smEventTimerBox = $("[rel='sm_event']").find(".timer-box");
    if (SMShopRefreshTime != 0 && !$smEventTimerBox) {
      StorageHandlerEventInfo.setSMShopRefreshTimeComparedToServerTS(0);
      return;
    }
    if (SMShopRefreshTime > server_now_ts) {
      const t = shared.timer.buildTimer(
        SMShopRefreshTime - server_now_ts,
        GT.design.market_new_stock,
        "severalQoL-event-timer nc-expiration-label",
        !1
      );
      GM.addStyle(
        `[rel='sm_event'] .severalQoL-event-timer {padding-bottom: 0px!important}`
      );
      $smEventTimerBox.prepend(t);
      shared.timer.activateTimers("severalQoL-event-timer.nc-expiration-label");
    } else {
      $smEventTimerBox.prepend(
        `<div class="severalQoL-event-timer expired">${GT.design.sm_event_restock_now}</div>`
      );
    }
  }
  async injectCSS() {
    const css = require("../css/EventInfo/EventInfo_Home.css").default;
    GM_addStyle(css);
  }
}
