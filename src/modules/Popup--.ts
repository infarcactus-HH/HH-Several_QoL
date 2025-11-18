import {
  HHModule,
  HHModule_ConfigSchema,
  SubSettingsType,
} from "../types/HH++";
import { popupForQueue } from "../types/GameTypes";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

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
    },
    {
      key: "noPoVPoGClaimPopup";
      default: false;
      label: "<span tooltip='Does not remove girl obtained popup'>No PoV/PoG claim Popup</span>";
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
      {
        key: "noPoVPoGClaimPopup",
        default: false,
        label:
          "<span tooltip='Does not remove girl obtained popup'>No PoV/PoG claim Popup</span>",
      },
    ],
  };
  static shouldRun() {
    return true;
  }
  popupQueueManagerAddOverrides: Array<{
    fn: (t: popupForQueue["popup"]) => boolean;
    permanent: boolean;
  }> = [];
  reward_popupRewardHandlePopupOverrides: Array<{
    fn: (t: any) => boolean;
    permanent: boolean;
  }> = []; // carefull with this one
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
    if (subSettings.noPoVPoGClaimPopup && ["/path-of-glory.html", "/path-of-valor.html"].includes(location.pathname)) {
      this.noPoVPoGClaimPopup();
    }
  }
  overridePopups() {
    const self = this;
    const originalPopupQueuManagerAdd = shared.PopupQueueManager.add;
    shared.PopupQueueManager.add = function ({ popup: t }) {
      for (let i = self.popupQueueManagerAddOverrides.length - 1; i >= 0; i--) {
        const overrideData = self.popupQueueManagerAddOverrides[i];
        const shouldBlock = overrideData.fn(t);
        if (shouldBlock) {
          console.log("Blocked popup by override", t);
          // Remove if no more usages left
          if (!overrideData.permanent) {
            self.popupQueueManagerAddOverrides.splice(i, 1);
          }
          return; // blocked by override
        }
      }
      console.log("Allowed popup", t);
      return originalPopupQueuManagerAdd.call(this, { popup: t });
    };

    const originalRewardHandlePopup = shared.reward_popup.Reward.handlePopup;
    shared.reward_popup.Reward.handlePopup = function (t: any) {
      for (
        let i = self.reward_popupRewardHandlePopupOverrides.length - 1;
        i >= 0;
        i--
      ) {
        const overrideData = self.reward_popupRewardHandlePopupOverrides[i];
        const shouldBlock = overrideData.fn(t);
        if (shouldBlock) {
          console.log("Blocked reward popup by override", t);
          // Remove if no more usages left
          if (!overrideData.permanent) {
            self.reward_popupRewardHandlePopupOverrides.splice(i, 1);
          }
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
    this.reward_popupRewardHandlePopupOverrides.push({
      fn: (t: any) => {
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
      },
      permanent: true,
    });
  }
  noLevelUpPopup() {
    this.popupQueueManagerAddOverrides.push({
      fn: (t: popupForQueue["popup"]) => {
        if (
          t.type === "common" &&
          t.$dom_element.children().filter("#level_up.hero_leveling").length ===
            1
        ) {
          return true;
        }
        return false;
      },
      permanent: true,
    });
  }
  noPoVPoGClaimPopup() {
    HHPlusPlusReplacer.doWhenSelectorAvailable("button[rel='claim']", ($el) => {
      console.log("Setting up PoV/PoG popup blocker");
      $el.on("click.noPovPoGPopup", () => {
        this.popupQueueManagerAddOverrides.push({
          fn: (t: popupForQueue["popup"]) => {
            if (t.type === "common" && t.popup_name === "rewards") {
              t.onClose();
              console.log("Blocked PoV/PoG popup", t);
              return true;
            }
            return false;
          },
          permanent: false,
        });
      });
    });
  }
}
