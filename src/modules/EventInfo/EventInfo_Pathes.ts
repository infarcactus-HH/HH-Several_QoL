import { SubModule } from "../../types/subModules";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";
import { EventInfoStorageHandler } from "../../utils/StorageHandler";

export default class EventInfo_Pathes implements SubModule {
  run() {
    this.injectCSS();
    const timeRemaining = +(unsafeWindow.time_remaining as string);

    if (window.location.pathname === "/path-of-valor.html") {
      EventInfoStorageHandler.setPoVEndTimeComparedToServerTS(
        server_now_ts + timeRemaining
      );
      this.replacePoVNotifButton();
    } else if (window.location.pathname === "/path-of-glory.html") {
      EventInfoStorageHandler.setPoGEndTimeComparedToServerTS(
        server_now_ts + timeRemaining
      );
      this.replacePoGNotifButton();
    }
  }
  async injectCSS() {
    const css = require("../css/EventInfo/EventInfo_Event.css").default;
    GM_addStyle(css);
  }
  replacePoVNotifButton() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".button-notification-action.notif_button_s",
      () => {
        $(".button-notification-action.notif_button_s")
          .attr("tooltip", "Several QoL: More Info on this event")
          .off("click")
          .on("click", (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            GM.openInTab(
              "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-310477",
              { active: true }
            );
          });
      }
    );
  }
  replacePoGNotifButton() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".button-notification-action.notif_button_s",
      () => {
        $(".button-notification-action.notif_button_s")
          .attr("tooltip", "Several QoL: More Info on this event")
          .off("click")
          .on("click", (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            GM.openInTab(
              "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-310673",
              { active: true }
            );
          });
      }
    );
  }
}
