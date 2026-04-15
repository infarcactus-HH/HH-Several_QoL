import { SubModule } from "../../base";
import type {
  AjaxShardGirlUpdate,
  DoBattlesTrollsResponse,
  GirlID,
  GirlRarity,
  TrackedGirl,
} from "../../types";
import type { GirlGlobalStorage } from "../../types/storage/GirlGlobalStorage";
import type { UnsafeWindow_Season } from "../../types/unsafeWindows/season";
import {
  GirlGlobalStorageHandler,
  SeasonShardTrackerStorageHandler,
} from "../../utils/StorageHandler";
import GameHelpers from "../../utils/GameHelpers";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";
import { villainShardTrackerCss } from "../../css/modules";
import html from "../../utils/html";
import AjaxCompleteHook from "../../SingletonModules/AjaxCompleteHook";
import runTimingHandler from "../../runTimingHandler";

type GirlDictionaryPatch = {
  name?: string;
  rarity?: GirlRarity;
  ico?: string;
  poseImage?: string;
  shards?: number;
};

type SeasonShardLike = {
  id_girl: GirlID;
  rarity: GirlRarity;
  name?: string;
  ico?: string;
  avatar?: string;
  graded2?: string;
  is_girl_owned?: boolean;
  value?: number;
  previous_value?: number;
};

type SeasonOpponent = {
  player?: {
    id_fighter?: number;
  };
  rewards?: {
    shards?: Array<any>;
    data?: {
      shards?: Array<any>;
    };
  };
};

export default class SeasonShardTracker implements SubModule {
  private static readonly TRACKED_BATTLE_ACTION = "do_battles_seasons";

  private _shouldTrackShards = false;
  private readonly _trackedRarities: Array<GirlRarity> = ["mythic", "legendary"];

  static shouldRun_() {
    return (
      location.pathname.includes("/season-arena.html") ||
      location.pathname.includes("/season-battle.html")
    );
  }

  private async _injectCSS() {
    GM_addStyle(villainShardTrackerCss);
  }

  async run_() {
    if (!SeasonShardTracker.shouldRun_()) {
      return;
    }
    await runTimingHandler.afterGameScriptsRun_();

    if (location.pathname === "/season-arena.html") {
      this._injectCSS();
      this._makeLogPopup();
      this._handleArenaPage();
    } else {
      this._handleBattlePage();
    }

    if (!this._shouldTrackShards) {
      return;
    }

    if (!SeasonShardTrackerStorageHandler.getCurrentTrackingState_().girlIds.length) {
      return;
    }

    console.log("SeasonShardTracker module is running.");
    this._hookSeasonAjaxComplete();
  }

  private _hookSeasonAjaxComplete() {
    AjaxCompleteHook.getInstance_().addCallback_((_event, xhr, settings) => {
      if (!this._shouldTrackShards || typeof settings?.data !== "string") {
        return;
      }

      const action = this._extractRequestAction_(settings.data);
      if (action !== SeasonShardTracker.TRACKED_BATTLE_ACTION) {
        return;
      }

      const response = xhr.responseJSON as DoBattlesTrollsResponse;
      this._processBattleResponse_(response, settings.data);
    });
  }

  private _extractRequestAction_(requestData: string): string | undefined {
    const actionMatch = requestData.match(/(?:^|&)action=([^&]+)/);
    return actionMatch?.[1];
  }

  private _extractNumberOfBattles_(requestData: string): number {
    const battlesMatch = requestData.match(/number_of_battles=(\d+)/);
    return battlesMatch ? parseInt(battlesMatch[1], 10) : 1;
  }

  private _toNumberOrUndefined_(value: unknown): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private _normalizeAjaxShardDrop_(rawShard: any): AjaxShardGirlUpdate | undefined {
    const id_girl = this._toNumberOrUndefined_(rawShard?.id_girl);
    const value = this._toNumberOrUndefined_(rawShard?.value);
    const previous_value = this._toNumberOrUndefined_(rawShard?.previous_value);
    const rarity = rawShard?.rarity as GirlRarity | undefined;

    if (
      id_girl === undefined ||
      value === undefined ||
      previous_value === undefined ||
      !rarity ||
      !this._trackedRarities.includes(rarity)
    ) {
      return undefined;
    }

    return {
      ...rawShard,
      id_girl: id_girl as GirlID,
      value,
      previous_value,
      rarity,
    } as AjaxShardGirlUpdate;
  }

  private _processBattleResponse_(
    response: DoBattlesTrollsResponse | undefined,
    requestData: string,
  ): void {
    if (!response?.rewards?.data) {
      return;
    }

    const numberOfBattles = this._extractNumberOfBattles_(requestData);
    const rewards = response.rewards.data;
    // Do not track losses for seasons — treat all requested battles as successful
    const successfulBattles = numberOfBattles;

    const shardDrops = (rewards.shards ?? [])
      .map((rawShard) => this._normalizeAjaxShardDrop_(rawShard))
      .filter((shard): shard is AjaxShardGirlUpdate => shard !== undefined);
    const dropsByGirlId = new Map<GirlID, AjaxShardGirlUpdate>(
      shardDrops.map((shard) => [shard.id_girl, shard]),
    );

    const currentTrackingState = SeasonShardTrackerStorageHandler.getCurrentTrackingState_();
    if (!currentTrackingState.girlIds.length) {
      this._shouldTrackShards = false;
      return;
    }

    const globalStorage = GirlGlobalStorageHandler.getGirlGlobalStorage_();
    let dictionaryChanged = this._mergeRewardsIntoGirlDictionary_(globalStorage, shardDrops);

    const completedGirlIds: GirlID[] = [];
    currentTrackingState.girlIds.forEach((girlID) => {
      const trackedGirl = SeasonShardTrackerStorageHandler.getTrackedGirl_(girlID);
      if (!trackedGirl) {
        return;
      }

      this._fillTrackedGirlFromDictionary_(girlID, trackedGirl, globalStorage);
      trackedGirl.last_fight_time = Date.now();

      this._applyDropUpdate_(trackedGirl, successfulBattles, dropsByGirlId.get(girlID));
      SeasonShardTrackerStorageHandler.upsertTrackedGirl_(girlID, trackedGirl);

      dictionaryChanged =
        this._upsertGirlDictionaryEntry_(globalStorage, girlID, {
          name: trackedGirl.name,
          rarity: trackedGirl.rarity,
          ico: trackedGirl.ico,
          shards: trackedGirl.last_shards_count,
        }) || dictionaryChanged;

      if (this._isTrackingCompleted_(trackedGirl)) {
        completedGirlIds.push(girlID);
      }
    });

    if (dictionaryChanged) {
      GirlGlobalStorageHandler.setGirlGlobalStorage_(globalStorage);
    }

    if (completedGirlIds.length) {
      this._removeCompletedGirlsFromTracking_(completedGirlIds);
    }
  }

  private _removeCompletedGirlsFromTracking_(completedGirlIds: GirlID[]) {
    const currentTrackingState = SeasonShardTrackerStorageHandler.getCurrentTrackingState_();
    const newTrackedGirlIds = currentTrackingState.girlIds.filter(
      (id) => !completedGirlIds.includes(id),
    );

    if (newTrackedGirlIds.length === 0) {
      this._shouldTrackShards = false;
      SeasonShardTrackerStorageHandler.setCurrentTrackingState_([]);
      return;
    }

    SeasonShardTrackerStorageHandler.setCurrentTrackingState_(newTrackedGirlIds);
  }

  private _applyDropUpdate_(
    trackedGirl: TrackedGirl,
    successfulBattles: number,
    dropInfo: AjaxShardGirlUpdate | undefined,
  ): void {
    if (!dropInfo) {
      this._addFightsToTrackedGirl_(trackedGirl, successfulBattles);
      return;
    }

    if (dropInfo.previous_value > 100) {
      alert(
        "SeasonShardTracker: encountered unusable shard payload, this fight was skipped in tracking.\nIF YOU WANT TO REPORT SEND A SCREENSHOT OF THE DROP",
      );
      console.warn("SeasonShardTracker unusable shard drop info:", dropInfo);
      return;
    }

    this._applyGirlShardDrop_(trackedGirl, dropInfo, successfulBattles);
  }

  private _addFightsToTrackedGirl_(trackedGirl: TrackedGirl, nbFights: number): void {
    if (nbFights <= 0) {
      return;
    }
    trackedGirl.number_fight += nbFights;
  }

  private _applyGirlShardDrop_(
    trackedGirl: TrackedGirl,
    dropInfo: AjaxShardGirlUpdate,
    successfulBattles: number,
  ): void {
    trackedGirl.last_shards_count = Math.min(dropInfo.value, 100);
    trackedGirl.number_fight += Math.max(successfulBattles, 0);
    trackedGirl.dropped_shards += Math.max(dropInfo.value - dropInfo.previous_value, 0);
  }

  private _isTrackingCompleted_(trackedGirl: TrackedGirl): boolean {
    return trackedGirl.last_shards_count === 100;
  }

  private _mergeRewardsIntoGirlDictionary_(
    globalStorage: GirlGlobalStorage,
    rewards: AjaxShardGirlUpdate[],
  ): boolean {
    let hasChanges = false;
    rewards.forEach((reward) => {
      hasChanges =
        this._upsertGirlDictionaryEntry_(globalStorage, reward.id_girl, {
          name: reward.name,
          rarity: reward.rarity,
          ico: reward.ico,
          poseImage: reward.avatar,
          shards: reward.value,
        }) || hasChanges;
    });
    return hasChanges;
  }

  private _fillTrackedGirlFromDictionary_(
    id_girl: GirlID,
    trackedGirl: TrackedGirl,
    globalStorage: GirlGlobalStorage,
  ): void {
    const globalGirl = globalStorage[id_girl];
    if (!globalGirl) {
      return;
    }

    if ((!trackedGirl.name || /^Girl \d+$/.test(trackedGirl.name)) && globalGirl.name) {
      trackedGirl.name = globalGirl.name;
    }

    if (
      globalGirl.ico &&
      (!trackedGirl.ico || trackedGirl.ico.indexOf("/pictures/gallery/") === -1)
    ) {
      trackedGirl.ico = GameHelpers.buildGirlIconPathFromHash_(
        id_girl,
        globalGirl.ico,
        trackedGirl.ico,
      );
    }

    const globalRarity = this._rarityFromNumber_(globalGirl.rarity);
    if (globalRarity && (trackedGirl.rarity === "common" || trackedGirl.rarity === "starting")) {
      trackedGirl.rarity = globalRarity;
    }
  }

  private _upsertGirlDictionaryEntry_(
    globalStorage: GirlGlobalStorage,
    id_girl: GirlID,
    patch: GirlDictionaryPatch,
  ): boolean {
    const key = String(id_girl);
    const existingEntry = globalStorage[key];
    const mergedEntry = existingEntry
      ? { ...existingEntry }
      : {
          name: patch.name ?? `Girl ${id_girl}`,
          rarity: patch.rarity !== undefined ? this._rarityToNumber_(patch.rarity) : 1,
        };

    let hasChanges = !existingEntry;
    if (patch.name && (!mergedEntry.name || /^Girl \d+$/.test(mergedEntry.name))) {
      mergedEntry.name = patch.name;
      hasChanges = true;
    }

    if (patch.rarity !== undefined) {
      const rarity = this._rarityToNumber_(patch.rarity);
      if (mergedEntry.rarity === undefined || rarity > mergedEntry.rarity) {
        mergedEntry.rarity = rarity;
        hasChanges = true;
      }
    }

    const icoHash = this._extractHashFromUrlOrHash_(patch.ico);
    if (icoHash && !mergedEntry.ico) {
      mergedEntry.ico = icoHash;
      hasChanges = true;
    }

    const poseHash = this._extractHashFromUrlOrHash_(patch.poseImage);
    if (poseHash && !mergedEntry.poseImage) {
      mergedEntry.poseImage = poseHash;
      hasChanges = true;
    }

    if (patch.shards !== undefined) {
      const normalizedShards = Math.min(Math.max(patch.shards, 0), 100);
      if (mergedEntry.shards === undefined || normalizedShards > mergedEntry.shards) {
        mergedEntry.shards = normalizedShards;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      globalStorage[key] = mergedEntry;
    }

    return hasChanges;
  }

  private _extractHashFromUrlOrHash_(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    if (!value.includes("/")) {
      return value;
    }
    const match = value.match(/\/pictures\/gallery\/\d+\/[^/]+\/\d+-([a-fA-F0-9]+)\.png/);
    if (!match) {
      return undefined;
    }
    return match[1].toLowerCase();
  }

  private _rarityToNumber_(rarity: GirlRarity): number {
    const map: Record<GirlRarity, number> = {
      starting: 0,
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 4,
      mythic: 5,
    };
    return map[rarity] ?? 1;
  }

  private _rarityFromNumber_(rarity: number | undefined): GirlRarity | undefined {
    const map: Record<number, GirlRarity> = {
      0: "starting",
      1: "common",
      2: "rare",
      3: "epic",
      4: "legendary",
      5: "mythic",
    };
    if (rarity === undefined) {
      return undefined;
    }
    return map[rarity];
  }

  private _normalizeSeasonShardLike_(rawShard: any): SeasonShardLike | undefined {
    const id_girl = this._toNumberOrUndefined_(rawShard?.id_girl);
    const rarity = rawShard?.rarity as GirlRarity | undefined;
    if (id_girl === undefined || !rarity || !this._trackedRarities.includes(rarity)) {
      return undefined;
    }

    return {
      id_girl: id_girl as GirlID,
      rarity,
      name: rawShard?.name,
      ico: rawShard?.ico,
      avatar: rawShard?.avatar,
      graded2: rawShard?.graded2,
      is_girl_owned: Boolean(rawShard?.is_girl_owned),
      value: this._toNumberOrUndefined_(rawShard?.value),
      previous_value: this._toNumberOrUndefined_(rawShard?.previous_value),
    };
  }

  private _collectGirlsFromOpponents_(): SeasonShardLike[] {
    const opponents = (unsafeWindow as { opponents?: SeasonOpponent[] }).opponents;
    if (!Array.isArray(opponents) || !opponents.length) {
      return [];
    }

    const result: SeasonShardLike[] = [];
    opponents.forEach((opponent) => {
      const shardRows = [
        ...(Array.isArray(opponent.rewards?.shards) ? opponent.rewards!.shards! : []),
        ...(Array.isArray(opponent.rewards?.data?.shards) ? opponent.rewards!.data!.shards! : []),
      ];
      shardRows.forEach((rawShard) => {
        const normalizedShard = this._normalizeSeasonShardLike_(rawShard);
        if (normalizedShard) {
          result.push(normalizedShard);
        }
      });
    });

    return result;
  }

  private _collectGirlsFromSeasonWindow_(): SeasonShardLike[] {
    const seasonsGirls = (unsafeWindow as Partial<UnsafeWindow_Season>).seasons_girls;
    if (!Array.isArray(seasonsGirls)) {
      return [];
    }

    const result: SeasonShardLike[] = [];
    seasonsGirls.forEach((seasonGirl) => {
      const normalized: SeasonShardLike = {
        id_girl: seasonGirl.id_girl as GirlID,
        rarity: seasonGirl.rarity as GirlRarity,
        name: seasonGirl.name,
        ico: seasonGirl.ico,
        avatar: seasonGirl.avatar,
        graded2: seasonGirl.graded2,
        is_girl_owned: seasonGirl.is_girl_owned,
        value: this._toNumberOrUndefined_(seasonGirl.value),
        previous_value: this._toNumberOrUndefined_(seasonGirl.previous_value),
      };
      if (this._trackedRarities.includes(normalized.rarity)) {
        result.push(normalized);
      }
    });

    return result;
  }

  private _mergeSeasonGirls_(girls: SeasonShardLike[]): SeasonShardLike[] {
    const merged = new Map<GirlID, SeasonShardLike>();

    girls.forEach((girl) => {
      const previous = merged.get(girl.id_girl);
      if (!previous) {
        merged.set(girl.id_girl, { ...girl });
        return;
      }

      merged.set(girl.id_girl, {
        ...previous,
        ...girl,
        rarity: girl.rarity ?? previous.rarity,
        is_girl_owned: Boolean(previous.is_girl_owned || girl.is_girl_owned),
        value:
          girl.value !== undefined ? Math.max(girl.value, previous.value ?? 0) : previous.value,
        previous_value:
          girl.previous_value !== undefined
            ? Math.max(girl.previous_value, previous.previous_value ?? 0)
            : previous.previous_value,
      });
    });

    return Array.from(merged.values());
  }

  private _handleArenaPage() {
    const opponentGirls = this._mergeSeasonGirls_(this._collectGirlsFromOpponents_());
    const fallbackGirls = this._mergeSeasonGirls_(this._collectGirlsFromSeasonWindow_());
    const girlsToTrackSource = opponentGirls.length ? opponentGirls : fallbackGirls;
    const candidateGirls = girlsToTrackSource.filter((girl) => {
      return !girl.is_girl_owned || (girl.value ?? 0) < 100;
    });

    if (!candidateGirls.length) {
      SeasonShardTrackerStorageHandler.setCurrentTrackingState_([]);
      this._shouldTrackShards = false;
      return;
    }

    this._shouldTrackShards = true;
    const globalStorage = GirlGlobalStorageHandler.getGirlGlobalStorage_();
    let dictionaryChanged = false;
    const trackedGirlIds: GirlID[] = [];

    candidateGirls.forEach((seasonGirl) => {
      trackedGirlIds.push(seasonGirl.id_girl);
      dictionaryChanged =
        this._upsertGirlDictionaryFromSeasonSource_(globalStorage, seasonGirl) || dictionaryChanged;

      const existingTrackedGirl = SeasonShardTrackerStorageHandler.getTrackedGirl_(
        seasonGirl.id_girl,
      );
      if (existingTrackedGirl) {
        this._updateExistingTrackedGirl_(existingTrackedGirl, seasonGirl, globalStorage);
        return;
      }

      const trackedGirlRecord = this._createTrackedGirlRecord_(seasonGirl, globalStorage);
      SeasonShardTrackerStorageHandler.upsertTrackedGirl_(seasonGirl.id_girl, trackedGirlRecord);
    });

    if (dictionaryChanged) {
      GirlGlobalStorageHandler.setGirlGlobalStorage_(globalStorage);
    }

    SeasonShardTrackerStorageHandler.setCurrentTrackingState_(trackedGirlIds);
  }

  private _upsertGirlDictionaryFromSeasonSource_(
    globalStorage: GirlGlobalStorage,
    seasonGirl: SeasonShardLike,
  ): boolean {
    return this._upsertGirlDictionaryEntry_(globalStorage, seasonGirl.id_girl, {
      name: seasonGirl.name,
      rarity: seasonGirl.rarity,
      ico: seasonGirl.ico,
      poseImage: seasonGirl.avatar,
      shards: seasonGirl.is_girl_owned ? 100 : seasonGirl.value,
    });
  }

  private _createTrackedGirlRecord_(
    seasonGirl: SeasonShardLike,
    globalStorage: GirlGlobalStorage,
  ): TrackedGirl {
    const globalGirl = globalStorage[seasonGirl.id_girl];
    const trackedGirlRecord: TrackedGirl = {
      name: seasonGirl.name ?? globalGirl?.name ?? `Girl ${seasonGirl.id_girl}`,
      ico:
        seasonGirl.ico ??
        GameHelpers.buildGirlIconPathFromHash_(seasonGirl.id_girl, globalGirl?.ico, seasonGirl.ico),
      rarity: seasonGirl.rarity ?? this._rarityFromNumber_(globalGirl?.rarity) ?? "common",
      number_fight: 0,
      dropped_shards: 0,
      grade: seasonGirl.graded2?.match(/<g/g)?.length ?? 0,
      last_fight_time: 0,
    };

    if (seasonGirl.is_girl_owned || (seasonGirl.value ?? 0) >= 100 || globalGirl?.shards === 100) {
      trackedGirlRecord.last_shards_count = 100;
    }

    this._fillTrackedGirlFromDictionary_(seasonGirl.id_girl, trackedGirlRecord, globalStorage);
    return trackedGirlRecord;
  }

  private _updateExistingTrackedGirl_(
    existingTrackedGirl: TrackedGirl,
    seasonGirl: SeasonShardLike,
    globalStorage: GirlGlobalStorage,
  ): void {
    let hasChanges = false;

    const previousName = existingTrackedGirl.name;
    const previousIco = existingTrackedGirl.ico;
    const previousRarity = existingTrackedGirl.rarity;
    this._fillTrackedGirlFromDictionary_(seasonGirl.id_girl, existingTrackedGirl, globalStorage);
    if (
      previousName !== existingTrackedGirl.name ||
      previousIco !== existingTrackedGirl.ico ||
      previousRarity !== existingTrackedGirl.rarity
    ) {
      hasChanges = true;
    }

    if (seasonGirl.name && /^Girl \d+$/.test(existingTrackedGirl.name)) {
      existingTrackedGirl.name = seasonGirl.name;
      hasChanges = true;
    }

    if (
      seasonGirl.ico &&
      (!existingTrackedGirl.ico || existingTrackedGirl.ico.indexOf("/pictures/gallery/") === -1)
    ) {
      existingTrackedGirl.ico = seasonGirl.ico;
      hasChanges = true;
    }

    if (
      seasonGirl.rarity &&
      (existingTrackedGirl.rarity === "common" || existingTrackedGirl.rarity === "starting")
    ) {
      existingTrackedGirl.rarity = seasonGirl.rarity;
      hasChanges = true;
    }

    if (
      existingTrackedGirl.last_shards_count !== 100 &&
      (seasonGirl.is_girl_owned || (seasonGirl.value ?? 0) >= 100)
    ) {
      existingTrackedGirl.last_shards_count = 100;
      hasChanges = true;
    }

    if (hasChanges) {
      SeasonShardTrackerStorageHandler.upsertTrackedGirl_(seasonGirl.id_girl, existingTrackedGirl);
    }
  }

  private _handleBattlePage() {
    const currentTrackingState = SeasonShardTrackerStorageHandler.getCurrentTrackingState_();
    if (currentTrackingState.girlIds.length) {
      this._shouldTrackShards = true;
    }
  }

  private _createGirlEntry(id_girl: GirlID, girl: TrackedGirl): JQuery<HTMLElement> {
    const globalStorage = GirlGlobalStorageHandler.getGirlGlobalStorage_();
    this._fillTrackedGirlFromDictionary_(id_girl, girl, globalStorage);
    const globalGirl = globalStorage[id_girl];
    const iconSrc = GameHelpers.buildGirlIconPathFromHash_(id_girl, globalGirl?.ico, girl.ico);

    const girlDiv = $(html`
      <div id_girl="${id_girl}">
        <div girl="${id_girl}" class="harem-girl">
          <div class="left">
            <img class="${girl.rarity}" src="${iconSrc}" alt="" />
          </div>
          <div class="right">
            <h4>${girl.name}</h4>
            <div class="g_infos">
              <div class="graded">${"<g></g>".repeat(girl.grade)}</div>
            </div>
            ${this._generateDropDisplay(girl.dropped_shards, girl.number_fight)}
          </div>
        </div>
      </div>
    `);

    girlDiv.on("click", () => {
      this._generateGirlDetail(id_girl, girl);
    });

    return girlDiv;
  }

  private _generateGirlDetail(id_girl: GirlID, girl: TrackedGirl) {
    const globalStorage = GirlGlobalStorageHandler.getGirlGlobalStorage_();
    this._fillTrackedGirlFromDictionary_(id_girl, girl, globalStorage);
    const globalGirl = globalStorage[id_girl];
    const poseSrc = GameHelpers.buildGirlPosePathFromHash_(id_girl, globalGirl?.poseImage);
    const $girlDetail = $(
      "#popup-drop-log-several-qol > .container-special-bg > .drop-log > .girl-detail",
    ).empty();

    const girlDetail = html`
      <div class="girl-detail-container">
        <img src="${poseSrc}" class="background-pose" alt="${girl.name}" />
        <div class="girl-detail-content">
          <h2>${girl.name}</h2>
          <div class="graded-detail">${"<g></g>".repeat(girl.grade)}</div>
          <div class="detail-stats">
            <h3>Season Stats</h3>
            ${this._generateDropDisplay(girl.dropped_shards, girl.number_fight)}
          </div>
          <div class="detail-actions">
            <button class="delete-girl-btn" type="button">Delete Tracked Data</button>
          </div>
        </div>
      </div>
    `;
    $girlDetail.append(girlDetail);

    $("#container-drop-log-several-qol div[girl]").removeClass("opened");
    $(`#container-drop-log-several-qol div[girl="${id_girl}"]`).addClass("opened");

    $girlDetail.find(".delete-girl-btn").on("click", () => {
      if (
        confirm(
          `Are you sure you want to delete all tracked data for ${girl.name}? This action cannot be undone.`,
        )
      ) {
        SeasonShardTrackerStorageHandler.removeTrackedGirl_(id_girl);
        $girlDetail.empty();
        $(`#container-drop-log-several-qol div[id_girl="${id_girl}"]`).remove();
      }
    });
  }

  private _generateDropDisplay(shards: number, fights: number): string {
    const percent = (fights === 0 ? 0 : (100 * shards) / fights).toFixed(2) + "%";
    return html`
      <div class="drop-display">
        <div class="total-shards">
          <span class="label">${shards}</span>
          <span class="icon shards"></span>
        </div>
        <div class="total-fights">
          <span class="label">${fights}</span>
          <span class="icon kiss"></span>
        </div>
        <div class="drop-rate">
          <span class="label">${percent}</span>
        </div>
      </div>
    `;
  }

  private _createGirlList(): JQuery<HTMLElement> {
    const $girlList = $('<div class="girl-grid hh-scroll"></div>');
    Object.entries(SeasonShardTrackerStorageHandler.getTrackedGirls_())
      .filter(
        ([_, girl]) =>
          girl.number_fight + (girl.skins ?? []).reduce((sum, skin) => sum + skin.number_fight, 0) >
          0,
      )
      .sort(([_, a], [__, b]) => b.last_fight_time - a.last_fight_time)
      .map(([id, girl]) => this._createGirlEntry(+id, girl))
      .forEach(($girlEntry) => {
        $girlList.append($girlEntry);
      });
    return $girlList;
  }

  private _makeLogPopup() {
    const title = "Season Shard Drop Log";
    const $dropLog = $('<div class="drop-log"></div>');
    $dropLog.append(this._createGirlList());
    $dropLog.append(html`<div class="girl-detail hh-scroll"></div>`);

    HHPlusPlusReplacer.doWhenSelectorAvailable_("#season-arena > .player_team_block", ($host) => {
      if ($("#show-drop-log-season-several-qol").length) {
        return;
      }

      $host.css("position", "relative");
      const $showLogButton = $(html`
        <span id="show-drop-log-season-several-qol">
          <img
            tooltip
            hh_title="show season drop log"
            src="https://hh.hh-content.com/design/ic_books_gray.svg"
            alt="show season log"
          />
        </span>
      `);
      $showLogButton.css({
        position: "absolute",
        right: "0px",
        top: "15px",
        zIndex: "5",
      });

      $host.append($showLogButton);
      $showLogButton.on("click", () => {
        GameHelpers.createPopup_("common", "drop-log-several-qol", $dropLog, title);
        $("#popup-drop-log-several-qol > .container-special-bg > .drop-log > .girl-grid")
          .children()
          .first()
          .trigger("click");
      });
    });
  }
}
