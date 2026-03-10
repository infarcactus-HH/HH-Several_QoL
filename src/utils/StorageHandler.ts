import type {
  GirlID,
  TrackedGirl,
  TrackedGirlRecords,
  StoredPlayerLeagueRank,
  StoredPlayerSeasonInfo,
  league_player_record,
  StoredPlayerPentaDrillInfo,
  StoredPentaDrillTeam,
  BadgeDataCache,
} from "../types";
import { GirlGlobalStorage } from "../types/storage/GirlGlobalStorage";
import { ReducedLoveRaids } from "../types/storage/love_raids";

export class GlobalStorageHandler {
  static setStoredScriptVersion_(version: string): void {
    GM_setValue("StoredScriptVersion", version);
  }
  static getStoredScriptVersion_(): string {
    return GM_getValue("StoredScriptVersion", "0.0.0");
  }
  static setShowUpdatePopup_(show: boolean): void {
    GM_setValue("ShowUpdatePopup", show);
  }
  static getShowUpdatePopup_(): boolean {
    return GM_getValue("ShowUpdatePopup", true);
  }
  static setBadgeCache_(cache: BadgeDataCache): void {
    GM_setValue("S_QoL_badge_cache", cache);
  }
  static getBadgeCache_(): BadgeDataCache | null {
    return GM_getValue("S_QoL_badge_cache", null);
  }
  static setBetterNsfwCensorEnabled_(enabled: boolean): void {
    GM_setValue("BetterNSFWCensorEnabled", enabled);
  }
  static getBetterNsfwCensorEnabled_(): boolean {
    return GM_getValue("BetterNSFWCensorEnabled", false);
  }
}

export class PlayerStorageHandler {
  static setPlayerLeagueRank_(info: StoredPlayerLeagueRank): void {
    GM_setValue(HH_UNIVERSE + "PlayerLeagueRank", info);
  }
  static getPlayerLeagueRank_(): StoredPlayerLeagueRank {
    return GM_getValue(HH_UNIVERSE + "PlayerLeagueRank", { league: 1, rank: -1 });
  }
  static setPlayerSeasonInfo_(info: StoredPlayerSeasonInfo): void {
    GM_setValue(HH_UNIVERSE + "PlayerSeasonInfo", info);
  }
  static getPlayerSeasonInfo_(): StoredPlayerSeasonInfo | null {
    return GM_getValue(HH_UNIVERSE + "PlayerSeasonInfo", null);
  }
  /**
   * @param bonus percentage bonus for gems gained from prestige
   */
  static setPlayerGemsPrestigeBonus_(bonus: number): void {
    GM_setValue(HH_UNIVERSE + "PlayerGemsPrestigeBonus", bonus);
  }
  /**
   * @returns percentage bonus for gems gained from prestige, 0 if not set
   */
  static getPlayerGemsPrestigeBonus_(): number {
    return GM_getValue(HH_UNIVERSE + "PlayerGemsPrestigeBonus", 0);
  }
  static setPlayerPentaDrillInfo_(info: StoredPlayerPentaDrillInfo): void {
    GM_setValue(HH_UNIVERSE + "PlayerPentaDrillInfo", info);
  }
  static getPlayerPentaDrillInfo_(): StoredPlayerPentaDrillInfo | null {
    return GM_getValue(HH_UNIVERSE + "PlayerPentaDrillInfo", null);
  }
  static setPlayerClubmatesIds_(ids: number[]): void {
    GM_setValue(HH_UNIVERSE + "PlayerClubmatesIds", ids);
  }
  static getPlayerClubmatesIds_(): number[] {
    return GM_getValue(HH_UNIVERSE + "PlayerClubmatesIds", []);
  }
  static setPlayerMissionState_(time_remaining: number | null) {
    GM_setValue(HH_UNIVERSE + "PlayerMissionState", time_remaining);
  }
  static getPlayerMissionState_(): number | null {
    return GM_getValue(HH_UNIVERSE + "PlayerMissionState", null);
  }
  static setPlayerMissionDuration_(duration: number | null) {
    GM_setValue(HH_UNIVERSE + "PlayerMissionDuration", duration);
  }
  static getPlayerMissionDuration_(): number | null {
    return GM_getValue(HH_UNIVERSE + "PlayerMissionDuration", null);
  }
}

export class LeagueStorageHandler {
  static setLeaguePLayerRecord_(data: league_player_record): void {
    GM_setValue(HH_UNIVERSE + "LeaguePlayerRecord", data);
  }
  static getLeaguePlayerRecord_(): league_player_record {
    return GM_getValue(HH_UNIVERSE + "LeaguePlayerRecord", {});
  }
}

export class EventInfoStorageHandler {
  static setSMShopRefreshTimeComparedToServerTS_(ts: number): void {
    // gives like timeout + server_now_ts
    GM_setValue(HH_UNIVERSE + "SMShopRefreshTime", ts);
  }
  static getSMShopRefreshTimeComparedToServerTS_(): number {
    return GM_getValue(HH_UNIVERSE + "SMShopRefreshTime", 0);
  }
  static setPoVEndTimeComparedToServerTS_(ts: number): void {
    // gives like end_time + server_now_ts
    GM_setValue(HH_UNIVERSE + "PoVEndTime", ts);
  }
  static getPoVEndTimeComparedToServerTS_(): number {
    return GM_getValue(HH_UNIVERSE + "PoVEndTime", 0);
  }
  static setPoGEndTimeComparedToServerTS_(ts: number): void {
    // gives like end_time + server_now_ts
    GM_setValue(HH_UNIVERSE + "PoGEndTime", ts);
  }
  static getPoGEndTimeComparedToServerTS_(): number {
    return GM_getValue(HH_UNIVERSE + "PoGEndTime", 0);
  }
}

export class LabyTeamStorageHandler {
  static setTeamPreset_(data: Record<number, string>): void {
    GM_setValue(HH_UNIVERSE + "LabyTeamPreset", data);
  }
  static getTeamPreset_(): Record<number, string> | undefined {
    return GM_getValue(HH_UNIVERSE + "LabyTeamPreset", undefined);
  }
}
export class WBTTeamStorageHandler {
  static setTeamPreset_(data: Record<number, string>): void {
    GM_setValue(HH_UNIVERSE + "WBTTeamPreset", data);
  }
  static getTeamPreset_(): Record<number, string> | undefined {
    return GM_getValue(HH_UNIVERSE + "WBTTeamPreset", undefined);
  }
  static setWBTId_(id: number): void {
    GM_setValue(HH_UNIVERSE + "WBTId", id);
  }
  static getWBTId_(): number {
    return GM_getValue(HH_UNIVERSE + "WBTId", -1);
  }
}

export class PentaDrillTeamStorageHandler {
  static addPentaDrillTeam_(team: StoredPentaDrillTeam): void {
    const existingTeams = this.getPentaDrillTeams_();
    existingTeams.push(team);
    GM_setValue(HH_UNIVERSE + "PentaDrillTeams", existingTeams);
  }
  static getPentaDrillTeams_(): Array<StoredPentaDrillTeam> {
    return GM_getValue(HH_UNIVERSE + "PentaDrillTeams", []);
  }
  static deletePentaDrillTeam_(index: number): void {
    const existingTeams = this.getPentaDrillTeams_();
    if (index >= 0 && index < existingTeams.length) {
      existingTeams.splice(index, 1);
      GM_setValue(HH_UNIVERSE + "PentaDrillTeams", existingTeams);
    }
  }
}

export class LoveRaidsStorageHandler {
  static setReducedLoveRaids_(data: ReducedLoveRaids): void {
    GM_setValue(HH_UNIVERSE + "ReducedLoveRaids", data);
  }
  static getReducedLoveRaids_(): ReducedLoveRaids {
    return GM_getValue(HH_UNIVERSE + "ReducedLoveRaids", []);
  }
  static setLoveRaidNotifications_(raidNotifs: Array<number>): void {
    GM_setValue(HH_UNIVERSE + "LoveRaidNotifications", raidNotifs);
  }
  static getLoveRaidNotifications_(): Array<number> {
    return GM_getValue(HH_UNIVERSE + "LoveRaidNotifications", []);
  }
  static setShouldHideCompletedRaids_(shouldHide: boolean) {
    GM_setValue("HideCompletedLoveRaids", shouldHide);
  }
  static getShouldHideCompletedRaids_(): boolean {
    return GM_getValue("HideCompletedLoveRaids", true);
  }
  static setHideHiddenRaids_(shouldHide: boolean) {
    GM_setValue(HH_UNIVERSE + "HideHiddenLoveRaids", shouldHide);
  }
  static getHideHiddenRaids_(): boolean {
    return GM_getValue(HH_UNIVERSE + "HideHiddenLoveRaids", false);
  }
}

export class sessionStorageHandler {
  static setSessID_(sessID: string): void {
    GM_setValue(location.hostname + "SessID", sessID);
  }
  static getSessID_(): string {
    return GM_getValue(location.hostname + "SessID", "");
  }
  static clearSessID_(): void {
    GM_deleteValue(location.hostname + "SessID");
  }
}

// XXX: it'll be more like a villain tracker if we start tracking boosters or
//   other bonus stuff too
export class ShardTrackerStorageHandler {
  static setCurrentTrackingState_(trollID: number, girlIds: GirlID[] = []): void {
    // XXX: we forgot to rename the key
    GM_setValue(HH_UNIVERSE + "VillainShardTrackerTrackingState", {
      trollID,
      girlIds,
    });
  }

  private static _currentStoredRecords: TrackedGirlRecords | null = null; // Cannot get or set without going through this variable
  static getCurrentTrackingState_(): { trollID: number; girlIds: GirlID[] } {
    return GM_getValue(HH_UNIVERSE + "VillainShardTrackerTrackingState", {
      trollID: -1,
      girlIds: [],
    }) as { trollID: number; girlIds: GirlID[] };
  }

  static getTrackedGirls_(): TrackedGirlRecords {
    if (this._currentStoredRecords === null) {
      this._currentStoredRecords = GM_getValue(HH_UNIVERSE + "VillainShardTrackerTrackedGirls", {});
    }
    return this._currentStoredRecords!;
  }

  static setTrackedGirls_(records: TrackedGirlRecords): void {
    this._currentStoredRecords = records;
    GM_setValue(HH_UNIVERSE + "VillainShardTrackerTrackedGirls", this._currentStoredRecords);
  }

  static getTrackedGirl_(id_girl: GirlID): TrackedGirl | undefined {
    const records = this.getTrackedGirls_();
    return records[id_girl];
  }

  static upsertTrackedGirl_(id_girl: GirlID, record: TrackedGirl): void {
    const records = this.getTrackedGirls_();
    this.setTrackedGirls_({ ...records, [id_girl]: record });
  }

  static removeTrackedGirl_(id_girl: GirlID): void {
    const records = this.getTrackedGirls_();
    if (records[id_girl]) {
      const { [id_girl]: _removed, ...rest } = records;
      this.setTrackedGirls_(rest);
    }
  }
}

export class GirlGlobalStorageHandler {
  static setGirlGlobalStorage_(data: GirlGlobalStorage): void {
    GM_setValue(HH_UNIVERSE + "GirlGlobalStorage", data);
  }
  static getGirlGlobalStorage_(): GirlGlobalStorage {
    return GM_getValue(HH_UNIVERSE + "GirlGlobalStorage", {});
  }
}
