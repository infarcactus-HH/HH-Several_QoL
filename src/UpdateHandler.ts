import GameHelpers from "./utils/GameHelpers";
import { HHPlusPlusReplacer } from "./utils/HHPlusPlusreplacer";
import { GlobalStorageHandler } from "./utils/StorageHandler";
import updateHandlerCss from "./css/UpdateHandler.css";
import type { TrackedGirlRecords } from "./types/ShardTracker";

export default class UpdateHandler {
  // needs to test it on real script not a link to local file
  static run() {
    const currentVersion = GM_info.script.version;
    const storedVersion = GlobalStorageHandler.getStoredScriptVersion();
    console.log(
      `HH++ Several QoL: Current version ${currentVersion}, stored version ${storedVersion}`
    );
    UpdateHandler.addOptionToHHPlusPlusConfig();
    if (storedVersion === currentVersion) {
      return;
    }
    const [storedMajor, storedMinor, storedPatch] = storedVersion
      .split(".")
      .map(Number);
    //const [currentMajor, currentMinor, currentPatch] = currentVersion
    //  .split(".")
    //  .map(Number);
    if (storedMinor === 20 && storedPatch < 4) {
      //Fix Broken Shard tracked girls storage from between v1.20.3 to 1.20.0
      const values = GM_listValues().filter((v) =>
        v.includes("VillainShardTrackerTrackedGirls")
      );
      values.forEach((v) => {
        const data = GM_getValue(v, {}) as TrackedGirlRecords;
        Object.values(data).forEach((girlRecord) => {
          if (girlRecord.skins) {
            girlRecord.skins.forEach((skin) => {
              if (skin.dropped_shards === null) {
                skin.dropped_shards = 0;
                skin.number_fight = 0;
              }
            });
          }
        });
        GM_setValue(v, data);
      });
    }

    if (storedMinor === 20 && GlobalStorageHandler.getShowUpdatePopup()) {
      if (!location.hostname.startsWith("nutaku")) {
        return; // only show update popup on nutaku for this update
      }
      UpdateHandler.injectCSS();
      GameHelpers.createCommonPopup("update-several-qol", (popup, t) => {
        const $container = popup.$dom_element.find(".container-special-bg");
        $container.append(
          $(
            `<div class="banner">Several QoL - Update to ${currentVersion}</div>`
          )
        );
        $container.append(
          $(
            `<div class="changelog-content hh-scroll">
              <h2> New Feature : Villain SHard Tracker !</h2>
              <p>
                This feature automaticly tracks your drop rates for Legendary & Mythic shards <br>
                Will soon include some stats crunching etc... <br>
                Interface is still a WIP but basic features are here ! <br>
              </p>
              <h3>Popup-- </h3>
              <p>
                Some New Features, go check them out
              </p>
            </div>`
          )
        );
        const $footer = $(`<div class="footer">
              <span>Thank you for using Several QoL! </span> <span style="margin-left:10px" tooltip="Won't be show often only on new features"> Show this popup:</span>
            </div>`);
        const $toggleUpdatePopup = $(
          `<input name='severalQoL-show-update-popup' type="checkbox" tooltip="Won't be show often only on new features" checked></input>`
        );
        $toggleUpdatePopup.on("change", () => {
          const show = $toggleUpdatePopup.prop("checked");
          console.log("Setting show update popup to ", show);
          GlobalStorageHandler.setShowUpdatePopup(show);
        });
        $footer.append($toggleUpdatePopup);
        $container.append($footer);
      });
    } else {
      console.log("No update actions needed");
    }
    GlobalStorageHandler.setStoredScriptVersion(currentVersion);
  }
  static async injectCSS() {
    GM_addStyle(updateHandlerCss);
  }
  static addOptionToHHPlusPlusConfig() {
    let updatePopupEnabled = GlobalStorageHandler.getShowUpdatePopup();
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".hh-plus-plus-config-button" +
        (unsafeWindow.hhPlusPlusConfig?.BoobStrapped
          ? ".boob-strapped"
          : ":not(.boob-strapped)"),
      ($element) => {
        console.log("Adding click handler to HH++ config");
        $element.on("click.severalQoLAddConfig", () => {
          $element.off("click.severalQoLAddConfig");
          console.log("clicked on config");
          HHPlusPlusReplacer.doWhenSelectorAvailable(
            ".group-panel[rel='severalQoL']",
            ($panel) => {
              console.log("Injecting option into HH++ config");
              const $container = $(`<div class="config-setting ${
                updatePopupEnabled ? "enabled" : ""
              }">
                    <label class="base-setting">
                      <span tooltip="It will only appear for important update, or new features">Show update Popup</span>
                    </label>
                  </div>`);
              const $checkbox = $(
                `<input type="checkbox" ${
                  updatePopupEnabled ? 'checked="checked"' : ""
                }>`
              );
              $container.find("label").append($checkbox);
              $checkbox.on("change", () => {
                updatePopupEnabled = !updatePopupEnabled;
                console.log(
                  `Update popup enabled set to ${updatePopupEnabled}`
                );
                GlobalStorageHandler.setShowUpdatePopup(updatePopupEnabled);
                if (updatePopupEnabled) {
                  $container.addClass("enabled");
                } else {
                  $container.removeClass("enabled");
                }
              });
              $panel.children().first().append($container);
            }
          );
        });
      }
    );
  }
}
