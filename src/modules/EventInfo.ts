import { HHModule } from "../types/HH++";
import EventInfo_Event from "./EventInfo/EventInfo_Event";
import EventInfo_Home from "./EventInfo/EventInfo_Home";

export default class EventInfo extends HHModule {
  readonly configSchema = {
    baseKey: "eventInfo",
    label:
      "<span tooltip='Click on the Information top right of event (only DP, SM, CbC, OD for now)'>Event Info (WIP): Show guides, tips, tricks & more info events</span>",
    default: true,
  };
  shouldRun() {
    return (
      location.pathname.includes("/event.html") ||
      location.pathname.includes("/home.html")
    );
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;

    if (location.pathname.includes("/home.html")) {
      this.runHome();
      return;
    }
    if (location.pathname.includes("/event.html")) {
      this.runEvent();
      return;
    }
    
  }
  runHome() {
    new EventInfo_Home().run();
  }
  runEvent() {
    new EventInfo_Event().run();
  }
}
