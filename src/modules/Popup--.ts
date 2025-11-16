import {
  HHModule,
  HHModule_ConfigSchema,
  SubSettingsType,
} from "../types/HH++";
import { popupForQueue } from "../types/GameTypes";

type Popupminusminus_ConfigSchema = {
  baseKey: "popupMinusMinus";
  label: "Popup--";
  default: false;
  subSettings: [
    {
      key: "noAnnoyingReminders";
      default: true;
      label: "<span tooltip hh_title='Does not work inside nutaku frame if you have violentmonkey<br>Removes annoying popup appearing automatically for shops, paths, news'>No Annoying Reminders/Popups</span>";
    },
    {
      key: "noMissionPopup";
      default: true;
      label: "No Mission Popup";
    },
    {
      key: "noLevelUpPopup";
      default: false;
      label: "No Level Up Popup";
    }
  ];
};

export default class PopupMinusMinus extends HHModule {
  readonly configSchema: HHModule_ConfigSchema = {
    baseKey: "popupMinusMinus",
    label: "Popup--",
    default: false,
    subSettings: [
      {
        key: "noAnnoyingReminders",
        default: true,
        label:
          "<span tooltip hh_title='Does not work inside nutaku frame if you have violentmonkey<br>Removes annoying popup appearing automatically for shops, paths, news'>No Annoying Reminders/Popups</span>",
      },
      {
        key: "noMissionPopup",
        default: true,
        label: "No Mission Popup",
      },
      {
        key: "noLevelUpPopup",
        default: false,
        label: "No Level Up Popup",
      },
    ],
  };
  static shouldRun() {
    return true;
  }
  popupQueueManagerAddOverrides: Array<(t: popupForQueue["popup"]) => boolean> =
    [];
  reward_popupRewardHandlePopupOverrides: Array<(t: any) => boolean> = []; // carefull with this one
  run(subSettings: SubSettingsType<Popupminusminus_ConfigSchema>) {
    if (this.hasRun || !PopupMinusMinus.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.overridePopups();

    if (subSettings.noLevelUpPopup) {
      this.noLevelUpPopup();
    }
    if (
      subSettings.noMissionPopup &&
      location.pathname === "/activities.html"
    ) {
      this.noMissionPopup();
    }
    if (subSettings.noAnnoyingReminders) {
      this.noAnnoyingReminders();
    }
  }
  overridePopups() {
    const self = this;
    const originalPopupQueuManagerAdd = shared.PopupQueueManager.add;
    shared.PopupQueueManager.add = function ({ popup: t }) {
      for (const override of self.popupQueueManagerAddOverrides) {
        const shouldBlock = override(t);
        if (shouldBlock) {
          console.log("Blocked popup by override", t);
          return; // blocked by override
        }
      }
      console.log("Allowed popup", t);
      return originalPopupQueuManagerAdd.call(this, { popup: t });
    };

    const originalRewardHandlePopup = shared.reward_popup.Reward.handlePopup;
    shared.reward_popup.Reward.handlePopup = function (t: any) {
      for (const override of self.reward_popupRewardHandlePopupOverrides) {
        const shouldBlock = override(t);
        if (shouldBlock) {
          console.log("Blocked reward popup by override", t);
          return; // blocked by override
        }
      }
      console.log("Allowed reward popup", t);
      return originalRewardHandlePopup.call(this, t);
    };
  }
  noAnnoyingReminders() {
    setCookie();
    function setCookie() {
      console.log("Setting cookie to disable annoying popups");
      try {
        GM_cookie.set({
          name: "disabledPopups",
          value: "PassReminder,Bundles,News",
          domain: location.hostname.split(".").slice(-2).join("."),
          secure: true,
          path: "/",
          sameSite: "no_restriction",
          expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
        });
      } catch (e) {
        document.cookie =
          "disabledPopups=PassReminder,Bundles,News; path=/; max-age=" +
          60 * 60 * 24 * 30;
      }
    }
    if (location.pathname === "/home.html") {
      console.log("Setting up listener to delete cookie on checkbox click");
      $(document).on(
        "change",
        "input[name='severalQoL_popupMinusMinus_noAnnoyingReminders']",
        function (event) {
          const isChecked = (event.target as HTMLInputElement).checked;
          if (!isChecked) {
            try {
              GM_cookie.delete(
                {
                  name: "disabledPopups",
                },
                function (error: boolean) {
                  if (error) {
                    console.error("Error deleting cookie:", error);
                  } else {
                    console.log("Cookie deleted successfully");
                  }
                }
              );
            } catch (e) {
              document.cookie = "disabledPopups=; path=/; max-age=0";
            }
          } else {
            setCookie();
          }
        }
      );
    }
  }
  noMissionPopup() {
    this.reward_popupRewardHandlePopupOverrides.push((t: any) => {
      if (t.callback === "handleMissionPopup") {
        console.log("Blocked mission popup", t);
        shared.Hero.updates(t.heroChangesUpdate, false);
        // Game handler
        $(".missions_wrap > .mission_object").length ||
          (t.callbackArgs.isGiftClaimed
            ? (t.callbackArgs.displayAfterGift(), $(".end_gift").hide())
            : (t.callbackArgs.displayGift(), $("#missions_counter").hide())),
          $('#missions button[rel="claim"]')
            .addClass("button_glow")
            .prop("disabled", !1);
        return true;
      }
      return false;
    });
  }
  noLevelUpPopup() {
    this.popupQueueManagerAddOverrides.push((t: popupForQueue["popup"]) => {
      if (
        t.type === "common" &&
        t.$dom_element.children().filter("#level_up.hero_leveling").length === 1
      ) {
        return true;
      }
      return false;
    });
  }
}
