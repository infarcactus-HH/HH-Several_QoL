import type {
  TrackedGirl,
  TrackedGirlRecords,
} from "../types/MythicTracking";

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
  static setLeagueCurrentRank(rank: number): void {
    GM_setValue(HH_UNIVERSE + "LeagueCurrentRank", rank);
  }
  static getLeagueCurrentRank(): number {
    return GM_getValue(HH_UNIVERSE + "LeagueCurrentRank", -1);
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

export class sessionStorageHandler {
  static setSessID(sessID: string): void {
    GM_setValue(location.hostname + "SessID", sessID);
  }
  static getSessID(): string {
    return GM_getValue(location.hostname + "SessID", "");
  }
  static clearSessID(): void {
    GM_deleteValue(location.hostname + "SessID");
  }
}

// TODO: this name is getting trimmed too
export class legendaryMythicTrackingStorageHandler {
  static setCurrentTrackingState(
    trollID: number,
    girlIds: number[] = []
  ): void {
    GM_setValue(HH_UNIVERSE + "LegendaryMythicCurrentTrackingState", {
      trollID,
      girlIds,
    });
  }
  static getCurrentTrackingState(): { trollID: number; girlIds: number[] } {
    return GM_getValue(HH_UNIVERSE + "LegendaryMythicCurrentTrackingState", {
      trollID: -1,
      girlIds: [],
    }) as { trollID: number; girlIds: number[] };
  }

  static getTrackedGirls(): TrackedGirlRecords {
    return GM_getValue(HH_UNIVERSE + "LegendaryMythicTrackedGirls", {});
  }
  static setTrackedGirls(records: TrackedGirlRecords): void {
    GM_setValue(HH_UNIVERSE + "LegendaryMythicTrackedGirls", records);
  }
  static getTrackedGirl(id_girl: number): TrackedGirl | undefined {
    const records = this.getTrackedGirls();
    return records[id_girl];
  }
  static upsertTrackedGirl(
    id_girl: number,
    record: TrackedGirl
  ): void {
    const records = this.getTrackedGirls();
    this.setTrackedGirls({ ...records, [id_girl]: record });
  }
  static removeTrackedGirl(id_girl: number): void {
    const records = this.getTrackedGirls();
    if (records[id_girl]) {
      const { [id_girl]: _removed, ...rest } = records;
      this.setTrackedGirls(rest);
    }
  }
}
