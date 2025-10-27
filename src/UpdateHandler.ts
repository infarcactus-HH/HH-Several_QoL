import GameHelpers from "./utils/GameHelpers";
import { HHPlusPlusReplacer } from "./utils/HHPlusPlusreplacer";
import { GlobalStorageHandler } from "./utils/StorageHandler";
import updateHandlerCss from "./css/UpdateHandler.css";

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
    //const [storedMajor, storedMinor, storedPatch] = storedVersion
    //  .split(".")
    //  .map(Number);
    //const [currentMajor, currentMinor, currentPatch] = currentVersion
    //  .split(".")
    //  .map(Number);

    if (storedVersion === "1.16.4" && GlobalStorageHandler.getShowUpdatePopup()) {
      console.log("popup");
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
            `<div class="changelog-content">
              <h2> New Feature : PoV/PoG: Hide 'Claim All' until last day </h2>
              <p>
                This feature hides the 'Claim All' button in Path of Valor and Path of Glory until the last day<br>
                It's not enabled by default so if you want to use it, please enable it in the settings.
              </p>
              <h2> New feature : Update popup </h2>
              <p>
                A new popup will appear on important updates or new features to inform you about the changes.<br>
                You can disable this popup in the settings. (It won't appear often I promise)
              </p>
            </div>`
          )
        );
        const $footer = $(`<div class="footer">
              <span>Thank you for using Several QoL! </span> <span style="margin-left:10px" tooltip="Won't be show often only on new features"> Show this popup:</span>
            </div>`);
        const $toggleUpdatePopup = $(`<input name='severalQoL-show-update-popup' type="checkbox" tooltip="Won't be show often only on new features" checked></input>`);
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
      ".hh-plus-plus-config-button",
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
