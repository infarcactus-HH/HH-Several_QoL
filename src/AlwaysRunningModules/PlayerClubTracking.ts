import { AlwaysRunningModule } from "../base";
import { membersList } from "../types";
import { PlayerStorageHandler } from "../utils/StorageHandler";

export default class PlayerClubTracking extends AlwaysRunningModule {
  static shouldRun() {
    return location.pathname === "/clubs.html";
  }
  run() {
    if (this.hasRun || !PlayerClubTracking.shouldRun()) {
      return;
    }
    this.hasRun = true;
    console.log("PlayerClubTracking module running");
    const membersList = unsafeWindow.members_list as membersList;
    if (!membersList || membersList.length === 0) {
      return;
    }
    const idClubmates = membersList.map((member) => member.id_member);
    PlayerStorageHandler.setPlayerClubmatesIds(idClubmates);
  }
}
