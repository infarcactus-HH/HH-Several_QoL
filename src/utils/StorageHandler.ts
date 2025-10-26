export class GlobalStorageHandler {
  static setStoredScriptVersion(version: string): void {
    GM_setValue("StoredScriptVersion", version);
  }
  static getStoredScriptVersion(): string {
    return GM_getValue("StoredScriptVersion", "0.0.0");
  }
  static setShowUpdatePopup(show: boolean): void {
    GM_setValue("ShowUpdatePopup", show);
  }
  static getShowUpdatePopup(): boolean {
    return GM_getValue("ShowUpdatePopup", true);
  }
}

export class LeagueStorageHandler {
  static setLeaguePLayerRecord(
    data: Array<{
      bestPlace: number;
      timesReached: number;
      checkExpiresAt: number;
    }>
  ): void {
    GM_setValue(HH_UNIVERSE + "LeaguePlayerRecord", data);
  }
  static getLeaguePlayerRecord(): Array<{
    bestPlace: number;
    timesReached: number;
    checkExpiresAt: number;
  }> {
    return GM_getValue(HH_UNIVERSE + "LeaguePlayerRecord", {});
  }
}

export class EventInfoStorageHandler {
  static setSMShopRefreshTimeComparedToServerTS(ts: number): void {
    // gives like timeout + server_now_ts
    GM_setValue(HH_UNIVERSE + "SMShopRefreshTime", ts);
  }
  static getSMShopRefreshTimeComparedToServerTS(): number {
    return GM_getValue(HH_UNIVERSE + "SMShopRefreshTime", 0);
  }
  static setPoVEndTimeComparedToServerTS(ts: number): void {
    // gives like end_time + server_now_ts
    GM_setValue(HH_UNIVERSE + "PoVEndTime", ts);
  }
  static getPoVEndTimeComparedToServerTS(): number {
    return GM_getValue(HH_UNIVERSE + "PoVEndTime", 0);
  }
  static setPoGEndTimeComparedToServerTS(ts: number): void {
    // gives like end_time + server_now_ts
    GM_setValue(HH_UNIVERSE + "PoGEndTime", ts);
  }
  static getPoGEndTimeComparedToServerTS(): number {
    return GM_getValue(HH_UNIVERSE + "PoGEndTime", 0);
  }
}

export class LabyTeamStorageHandler {
  static setTeamPreset(data: Record<number, string>): void {
    GM_setValue(HH_UNIVERSE + "LabyTeamPreset", data);
  }
  static getTeamPreset(): Record<number, string> | undefined {
    return GM_getValue(HH_UNIVERSE + "LabyTeamPreset", undefined);
  }
}
export class WBTTeamStorageHandler {
  static setTeamPreset(data: Record<number, string>): void {
    GM_setValue(HH_UNIVERSE + "WBTTeamPreset", data);
  }
  static getTeamPreset(): Record<number, string> | undefined {
    return GM_getValue(HH_UNIVERSE + "WBTTeamPreset", undefined);
  }
  static setWBTId(id: number): void {
    GM_setValue(HH_UNIVERSE + "WBTId", id);
  }
  static getWBTId(): number {
    return GM_getValue(HH_UNIVERSE + "WBTId", -1);
  }
}

export class LoveRaidsStorageHandler {
  static setReducedLoveRaids(
    data: Array<{
      all_is_owned: boolean;
      id_raid: number;
      start: number;
      end: number;
    }>
  ): void {
    GM_setValue(HH_UNIVERSE + "ReducedLoveRaids", data);
  }
  static getReducedLoveRaids(): Array<{
    all_is_owned: boolean;
    id_raid: number;
    start: number;
    end: number;
  }> {
    return GM_getValue(HH_UNIVERSE + "ReducedLoveRaids", []);
  }
  static setLoveRaidNotifications(raidNotifs: Array<number>): void {
    GM_setValue(HH_UNIVERSE + "LoveRaidNotifications", raidNotifs);
  }
  static getLoveRaidNotifications(): Array<number> {
    return GM_getValue(HH_UNIVERSE + "LoveRaidNotifications", []);
  }
  static setShouldHideCompletedRaids(shouldHide: boolean) {
    GM_setValue("HideCompletedLoveRaids", shouldHide);
  }
  static getShouldHideCompletedRaids(): boolean {
    return GM_getValue("HideCompletedLoveRaids", true);
  }
}
