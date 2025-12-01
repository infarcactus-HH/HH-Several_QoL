import { HHModule } from "../base";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { sessionStorageHandler } from "../utils/StorageHandler";

export default class FixSessID extends HHModule {
  readonly configSchema = {
    baseKey: "fixSessID",
    label:
      "<span tooltip='For example when viewing some scenes'>[NUTAKU] Fix session in URLs</span>",
    default: location.hostname.startsWith("nutaku"),
  };
  static shouldRun() {
    return location.hostname.startsWith("nutaku");
  }
  run() {
    if (this.hasRun || !FixSessID.shouldRun()) {
      return;
    }
    this.hasRun = true;
    if (location.pathname === "/home.html") {
      $(document).on(
        "click.severalQoL_toggleFixSessID",
        `input[name="severalQoL_fixSessID"]`,
        () => {
          sessionStorageHandler.clearSessID();
        },
      );
    }
    console.log("FixSessID module running");
    if (!unsafeWindow.PLATFORM_SESS || !unsafeWindow.PLATFORM_COOKIELESS) {
      return;
    }
    sessionStorageHandler.setSessID(unsafeWindow.PLATFORM_SESS as string);
    $(document).on("click", "#girl_preview_btn", () => {
      HHPlusPlusReplacer.doWhenSelectorAvailable(".scene-preview_wrapper.unlocked", ($element) => {
        $element.each((_, sceneDiv) => {
          const $scenePreviewImage = $(sceneDiv).find("img.scene-preview");
          if ($scenePreviewImage.length === 0) {
            return;
          }
          $scenePreviewImage.attr("src", function (_, src) {
            if (src.includes("sess=")) {
              return src;
            }
            console.log("FixSessID: fixing sessID in URL:", src);
            const sessID = unsafeWindow.PLATFORM_SESS as string;
            return src + `?sess=${sessID}`;
          });
        });
      });
    });
  }
}
