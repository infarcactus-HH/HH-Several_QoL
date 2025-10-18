import { SubModule } from "../../types/subModules";
import { StorageHandlerEventInfo } from "../../utils/StorageHandler";

export default class EventInfo_Pathes implements SubModule {
    readonly PoVCycleDurationSeconds = 14 * 24 * 60 * 60; // 14 days
    readonly PoGCycleDurationSeconds = 35 * 24 * 60 * 60; // 35 days
  run() {
      const timeRemaining = +(unsafeWindow.time_remaining as string);
     if (window.location.pathname === '/path-of-valor.html') {
        StorageHandlerEventInfo.setPoVEndTimeComparedToServerTS(
            server_now_ts + timeRemaining
        );
     } else if (window.location.pathname === '/path-of-glory.html') {
        StorageHandlerEventInfo.setPoGEndTimeComparedToServerTS(
            server_now_ts + timeRemaining
        );
     }
  }
}
