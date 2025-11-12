import { HHModule } from "../types/HH++";

export default class NoMissionPopup extends HHModule {
  readonly configSchema = {
    baseKey: "noMissionPopup",
    label: "No Mission Popup",
    default: false,
  };
  static shouldRun() {
    return location.pathname === "/activities.html";
  }
  run() {
    if (this.hasRun || !NoMissionPopup.shouldRun()) {
      return;
    }
    this.hasRun = true;
    const originalRewardHandlePopup = shared.reward_popup.Reward.handlePopup;
    delete shared.reward_popup.Reward.handlePopup;
    shared.reward_popup.Reward.handlePopup = function (t: any) {
      if (t.callback === "handleMissionPopup") {
        console.log("Blocked mission popup", t);
        // Game handler
        $(".missions_wrap > .mission_object").length ||
          (t.isGiftClaimed
            ? (t.displayAfterGift(), $(".end_gift").hide())
            : (t.displayGift(), $("#missions_counter").hide())),
          $('#missions button[rel="claim"]')
            .addClass("button_glow")
            .prop("disabled", !1);
        return;
      }
      console.log("Allowed reward popup", t);
      return originalRewardHandlePopup.call(this, t);
    };
  }
}
