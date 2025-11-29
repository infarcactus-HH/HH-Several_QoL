import { SubModule } from "../../types/subModules";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";

export default class EventInfo_Seasonal implements SubModule {
  private readonly EventInfoSeasonalLinks: string[] = [
    "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-310475",
    "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-310068",
    "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-310473",
  ];
  run() {
    const currentSeasonalType = unsafeWindow.event_functionalities
      ?.id_seasonal_event_type as number;
    if (!currentSeasonalType || !this.EventInfoSeasonalLinks[currentSeasonalType - 1]) {
      console.log("SE Info: No known seasonal event detected");
      return;
    }
    this.replaceSeasonalNotifButton(this.EventInfoSeasonalLinks[currentSeasonalType - 1]);
  }
  replaceSeasonalNotifButton(link: string) {
    if (!link) {
      return;
    }
    HHPlusPlusReplacer.doWhenSelectorAvailable(".button-notification-action.notif_button_s", () => {
      $(".button-notification-action.notif_button_s")
        .attr("tooltip", "Several QoL: More Info on this event")
        .off("click")
        .on("click", (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          GM_openInTab(link, {
            active: true,
          });
        });
    });
  }
}
