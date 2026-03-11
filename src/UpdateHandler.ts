import GameHelpers from "./utils/GameHelpers";
import { HHPlusPlusReplacer } from "./utils/HHPlusPlusreplacer";
import { GlobalStorageHandler } from "./utils/StorageHandler";
import updateHandlerCss from "./css/UpdateHandler.css";
import { GirlID, Grade, TrackedGirlRecords } from "./types";
import html from "./utils/html";
import runTimingHandler from "./runTimingHandler";
import AddDummyToHHPlusPlus from "./SingletonModules/AddDummyToHHPlusPlus";

export default class UpdateHandler {
  // needs to test it on real script not a link to local file
  static async run_() {
    const currentVersion = GM_info.script.version;
    const storedVersion = GlobalStorageHandler.getStoredScriptVersion_();
    console.log(
      `HH++ Several QoL: Current version ${currentVersion}, stored version ${storedVersion}`,
    );
    UpdateHandler._addOptionToHHPlusPlusConfig();
    if (storedVersion === currentVersion) {
      return;
    }
    const [storedMajor, storedMinor, storedPatch] = storedVersion.split(".").map(Number);
    //const [currentMajor, currentMinor, currentPatch] = currentVersion
    //  .split(".")
    //  .map(Number);

    if (storedMajor == 2 && storedMinor == 0 && GlobalStorageHandler.getShowUpdatePopup_()) {
      UpdateHandler._injectCSS();
      await runTimingHandler.afterGameScriptsRun_();
      GameHelpers.createCommonPopup_("update-several-qol", (popup, _t) => {
        const $container = popup.$dom_element.find(".container-special-bg");
        $container.append(`<div class="banner">Several QoL - Update to ${currentVersion}</div>`);
        $container.append(html`
          <div class="changelog-content hh-scroll">
            <h2>New Module : Better NSFW Censor</h2>
            <p>
              HH++ censor is a bit lacking and all the blur is easily spottable from a distance, so this is more sneaky and less blurry
            </p>
            <h3>Misc</h3>
            <p>
              [VillainShardTracker] Made x1 a lot more reliable</br>
              [No reload claiming dailies] Removed a race condition</br>
              [PoP Bar] Now also does daily mission tracking, if you want a toggle for only PoP complain on discord/forum</br>
              [simv4 fix] Fixed Booster sim/skill sim not working when switching to an opponent and coming back</br>
              [Request Handler] Added a RequestHandler to queue requests & avoid getting IP blocked (you can freely use opponent history & simv4 fix without worrying about that) </br>
            </p>
          </div>
        `);
        const $footer = $(html`
          <div class="footer">
            <span>Thank you for using Several QoL! </span>
            <span style="margin-left:10px" tooltip="Won't be show often only on new features">
              Show this popup:</span
            >
          </div>
        `);
        const $toggleUpdatePopup = $(
          `<input name='severalQoL-show-update-popup' type="checkbox" tooltip="Won't be shown often only on new features" checked>`,
        );
        $toggleUpdatePopup.on("change", () => {
          const show = $toggleUpdatePopup.prop("checked");
          console.log("Setting show update popup to ", show);
          GlobalStorageHandler.setShowUpdatePopup_(show);
        });
        $footer.append($toggleUpdatePopup);
        $container.append($footer);
      });
    } else {
      console.log("No update actions needed");
    }
    GlobalStorageHandler.setStoredScriptVersion_(currentVersion);
  }
  private static async _injectCSS() {
    GM_addStyle(updateHandlerCss);
  }
  private static _addOptionToHHPlusPlusConfig() {
    AddDummyToHHPlusPlus.getInstance_().addDummy_({
      label: `<span tooltip="It will only appear for important update, or new features">Show update Popup</span>`,
      active: GlobalStorageHandler.getShowUpdatePopup_(),
      callback: (newValue) => {
        console.log(`Update popup enabled set to ${newValue}`);
        GlobalStorageHandler.setShowUpdatePopup_(newValue);
      },
    });
  }
}
