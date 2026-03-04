import { AlwaysRunningModule } from "../base";
import { membersList } from "../types";
import { PlayerStorageHandler } from "../utils/StorageHandler";

export default class PlayerClubTracking extends AlwaysRunningModule {
  static shouldRun_() {
    return location.pathname === "/clubs.html";
  }
  run_() {
    if (this._hasRun || !PlayerClubTracking.shouldRun_()) {
      return;
    }
    this._hasRun = true;
    console.log("PlayerClubTracking module running");
    const membersList = unsafeWindow.members_list as membersList;
    if (!membersList || membersList.length === 0) {
      return;
    }
    const idClubmates = membersList.map((member) => member.id_member);
    PlayerStorageHandler.setPlayerClubmatesIds_(idClubmates);
  }
}
