import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import EventInfo_Event from "./EventInfo/EventInfo_Event";
import EventInfo_Home from "./EventInfo/EventInfo_Home";
import EventInfo_Pathes from "./EventInfo/EventInfo_Pathes";
import EventInfo_Seasonal from "./EventInfo/EventInfo_Seasonal";

export default class EventInfo extends HHModule {
  readonly configSchema = {
    baseKey: "eventInfo",
    label:
      "<span tooltip='Click on the Information top right of event*'>Event Info : Show guides, tips, tricks & more info on events</span>",
    default: true,
  };
  static shouldRun() {
    return (
      location.pathname === "/event.html" ||
      location.pathname === "/home.html" ||
      location.pathname === "/path-of-glory.html" ||
      location.pathname === "/path-of-valor.html" ||
      location.pathname === "/seasonal.html" ||
      location.pathname === "/world-boss-event" ||
      location.pathname === "/season.html" ||
      location.pathname === "/love-raids.html"
    );
  }
  run() {
    if (this.hasRun || !EventInfo.shouldRun()) {
      return;
    }
    this.hasRun = true;

    const path = location.pathname;

    console.log("EventInfo module running on path:", path);

    switch (path) {
      case "/home.html":
        this.runHome();
        break;
      case "/event.html":
        this.runEvent();
        break;
      case "/path-of-glory.html":
      case "/path-of-valor.html":
        this.runPathes();
        break;
      case "/seasonal.html": // Mega Event
        this.runSeasonal();
        break;
      case "/season.html":
        this.runSeason();
        break;
      case "/love-raids.html":
        this.runLoveRaids();
        break;
    }
  }
  runHome() {
    new EventInfo_Home().run();
  }
  runEvent() {
    new EventInfo_Event().run();
  }
  runPathes() {
    new EventInfo_Pathes().run();
  }
  runSeasonal() {
    new EventInfo_Seasonal().run();
  }
  runSeason() {
    this.helperReplaceNotifButton(
      "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-310674",
    );
  }
  runLoveRaids() {
    this.helperReplaceNotifButton(
      "https://forum.kinkoid.com/index.php?/topic/31207-vademecum-rerum-gestarum-ex-haremverse-a-guide-to-the-events/#comment-316577",
    );
  }

  helperReplaceNotifButton(url: string) {
    HHPlusPlusReplacer.doWhenSelectorAvailable(".button-notification-action.notif_button_s", () => {
      console.log("EventInfo: Replacing notif button link for more info");
      $(".button-notification-action.notif_button_s")
        .attr("tooltip", "Several QoL: More Info on this event")
        .off("click")
        .on("click", (e) => {
          GM_openInTab(url, { active: true });
        });
    });
  }
}
