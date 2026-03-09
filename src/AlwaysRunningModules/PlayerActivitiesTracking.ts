import { AlwaysRunningModule } from "../base";
import runTimingHandler from "../runTimingHandler";
import { UnsafeWindow_Activities } from "../types/unsafeWindows/activities";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { PlayerStorageHandler } from "../utils/StorageHandler";

export default class PlayerActivitiesTracking extends AlwaysRunningModule {
  static shouldRun_() {
    return location.pathname === "/activities.html";
  }
  async run_() {
    if (this._hasRun || !PlayerActivitiesTracking.shouldRun_()) {
      return;
    }
    this._hasRun = true;
    await runTimingHandler.afterGameScriptsRun_();
    console.log("PlayerActivitiesTracking module running");
    this._trackPlayerMissions();
  }
  private _trackPlayerMissions() {
    const currWindow = unsafeWindow as UnsafeWindow_Activities;
    if (!currWindow.player_missions) {
      PlayerStorageHandler.setPlayerMissionState_(null);
      PlayerStorageHandler.setPlayerMissionDuration_(null);
      return;
    }
    const pendingMission = currWindow.player_missions.find(
      (mission) => mission.state === "pending",
    );
    if (!pendingMission) {
      PlayerStorageHandler.setPlayerMissionState_(null);
      PlayerStorageHandler.setPlayerMissionDuration_(null);
    } else {
      PlayerStorageHandler.setPlayerMissionState_(
        Math.floor(Date.now() / 1000) + pendingMission.remaining_time,
      );
      PlayerStorageHandler.setPlayerMissionDuration_(pendingMission.duration);
    }
    HHPlusPlusReplacer.doWhenSelectorAvailable_(
      "[id^='mission-'] [rel='mission_start']",
      ($mission_starts) => {
        console.log("missions:", $mission_starts);
        $mission_starts.on("click.S_QoL", (event) => {
          console.log("Mission start clicked, updating mission state");
          const target = event.currentTarget as HTMLElement;
          const duration = JSON.parse(
            target.closest("[id^='mission-']")?.getAttribute("data-d") || "{}",
          ).duration;
          if (!duration) {
            console.error("Could not find mission duration, not updating mission state");
            return;
          }
          PlayerStorageHandler.setPlayerMissionState_(Math.floor(Date.now() / 1000) + duration);
          PlayerStorageHandler.setPlayerMissionDuration_(duration);
        });
      },
    );
  }
}
