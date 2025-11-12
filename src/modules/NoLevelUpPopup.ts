import { HHModule } from "../types/HH++";

export default class NoLevelUpPopup extends HHModule {
  readonly configSchema = {
    baseKey: "noLevelUpPopup",
    label: "No Level Up Popup",
    default: false,
  };
  static shouldRun() {
    return true;
  }
  run() {
    if (this.hasRun || !NoLevelUpPopup.shouldRun()) {
      return;
    }
    this.hasRun = true;
    const originalPopupQueuManagerAdd = shared.PopupQueueManager.add;
    shared.PopupQueueManager.add = function ({ popup: t }) {
      if (
        t.type === "common" &&
        t.$dom_element.children().filter("#level_up.hero_leveling").length === 1
      ) {
        console.log("Blocked level up popup", t);
        return;
      }
      console.log("Allowed popup", t);
      return originalPopupQueuManagerAdd.call(this, { popup: t });
    };
  }
}
