import { HHModule } from "../types/HH++";
import EventInfo_Event from "./EventInfo/EventInfo_Event";
import EventInfo_Home from "./EventInfo/EventInfo_Home";
import EventInfo_Pathes from "./EventInfo/EventInfo_Pathes";

export default class EventInfo extends HHModule {
  readonly configSchema = {
    baseKey: "eventInfo",
    label:
      "<span tooltip='Click on the Information top right of event (only DP, SM, CbC, OD for now)'>Event Info (WIP): Show guides, tips, tricks & more info events</span>",
    default: true,
  };
  shouldRun() {
    return (
      location.pathname === "/event.html" ||
      location.pathname === "/home.html" ||
      location.pathname === "/path-of-glory.html" ||
      location.pathname === "/path-of-valor.html"
    );
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;

    const path = location.pathname;

    if (path === "/home.html") {
      this.runHome();
      return;
    }
    if (path === "/event.html") {
      this.runEvent();
      return;
    }
    if( path === "/path-of-glory.html" || path === "/path-of-valor.html"){
      this.runPathes();
      return;
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
}
