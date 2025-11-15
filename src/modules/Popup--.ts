import {
  HHModule,
  HHModule_ConfigSchema,
  SubSettingsType,
} from "../types/HH++";

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
  run(subSettings: SubSettingsType<Popupminusminus_ConfigSchema>) {
    if (this.hasRun || !PopupMinusMinus.shouldRun()) {
      return;
    }
    this.hasRun = true;
    if (subSettings.noLevelUpPopup) {
      const originalPopupQueuManagerAdd = shared.PopupQueueManager.add;
      shared.PopupQueueManager.add = function ({ popup: t }) {
        if (
          t.type === "common" &&
          t.$dom_element.children().filter("#level_up.hero_leveling").length ===
            1
        ) {
          console.log("Blocked level up popup", t);
          return;
        }
        console.log("Allowed popup", t);
        return originalPopupQueuManagerAdd.call(this, { popup: t });
      };
    }
    if (subSettings.noMissionPopup) {
      const originalRewardHandlePopup = shared.reward_popup.Reward.handlePopup;
      shared.reward_popup.Reward.handlePopup = function (t: any) {
        if (t.callback === "handleMissionPopup") {
          console.log("Blocked mission popup", t);
          // Game handler
          $(".missions_wrap > .mission_object").length ||
            (t.callbackArgs.isGiftClaimed
              ? (t.callbackArgs.displayAfterGift(), $(".end_gift").hide())
              : (t.callbackArgs.displayGift(), $("#missions_counter").hide())),
            $('#missions button[rel="claim"]')
              .addClass("button_glow")
              .prop("disabled", !1);
          return;
        }
        console.log("Allowed reward popup", t);
        return originalRewardHandlePopup.call(this, t);
      };
    }
    if (subSettings.noAnnoyingReminders) {
      this.noAnnoyingReminders();
    }
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
}
