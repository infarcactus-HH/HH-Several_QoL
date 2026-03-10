import { AlwaysRunningModule } from "../base";
import runTimingHandler from "../runTimingHandler";
import { CompleteGirl } from "../types";
import { HaremPlusPlusAllGirlsCache_Incomplete } from "../types/Harem++";
import { GirlGlobalStorage } from "../types/storage/GirlGlobalStorage";
import { UnsafeWindow_Activities } from "../types/unsafeWindows/activities";
import { UnsafeWindow_pentaDrill } from "../types/unsafeWindows/pentaDrill";
import { GirlGlobalStorageHandler } from "../utils/StorageHandler";

type GirlEntry = GirlGlobalStorage[string];
type GirlSkin = NonNullable<GirlEntry["skins"]>[number];

export default class GirlMonitoring extends AlwaysRunningModule {
  static shouldRun_() {
    return true;
  }

  async run_() {
    if (this._hasRun) return;
    this._hasRun = true;

    console.log("PlayerGirlMonitoring module running");
    await this._migrateHHPlusPlus();
    await this._migrateHaremPlusPlus();
    await runTimingHandler.afterGameScriptsRun_();

    if (location.pathname === "/activities.html") {
      this._fromActivitiesPage();
    } else if (location.pathname === "/event.html") {
      this._fromEventPage();
    } else if (location.pathname === "/penta-drill.html") {
      this._fromPentaDrillPage();
    }
  }

  // ── Entry merging ────────────────────────────────────────────────────────────

  /**
   * Merges an incoming girl entry into an existing one.
   * Existing non-null values take priority; shards are kept at max.
   */
  mergeEntry_(existing: GirlEntry | undefined, incoming: GirlEntry): GirlEntry {
    if (!existing) return incoming;

    const merged: GirlEntry = {
      name: existing.name || incoming.name,
      rarity: existing.rarity ?? incoming.rarity,
      shards: Math.max(existing.shards, incoming.shards),
    };

    const ico = incoming.ico ?? existing.ico;
    if (ico != null) merged.ico = ico;

    const poseImage = incoming.poseImage ?? existing.poseImage;
    if (poseImage != null) merged.poseImage = poseImage;

    const skins = this._mergeSkins(existing.skins, incoming.skins);
    if (skins != undefined) merged.skins = skins;

    return merged;
  }

  /** Merges all entries from `incoming` into `base`, applying mergeEntry_ per girl. */
  mergeStorage_(base: GirlGlobalStorage, incoming: GirlGlobalStorage): GirlGlobalStorage {
    const result: GirlGlobalStorage = { ...base };
    for (const [id, entry] of Object.entries(incoming)) {
      result[id] = this.mergeEntry_(result[id], entry);
    }
    return result;
  }

  // ── Page handlers ────────────────────────────────────────────────────────────

  private _fromActivitiesPage() {
    const PoPGirls = (unsafeWindow as UnsafeWindow_Activities).pop_hero_girls;
    if (!PoPGirls) return;

    const stored = GirlGlobalStorageHandler.getGirlGlobalStorage();
    for (const girlData of Object.values(PoPGirls)) {
      const incoming: GirlEntry = {
        name: girlData.name,
        rarity: this._rarityFromString(girlData.rarity),
        shards: 100,
        ico: this._extractIconHash(girlData.avatar),
        poseImage: this._extractPoseImageHash(girlData.avatar),
      };
      stored[girlData.id_girl] = this.mergeEntry_(stored[girlData.id_girl], incoming);
    }
    GirlGlobalStorageHandler.setGirlGlobalStorage(stored);
  }
  private _fromEventPage() {
    const eventGirls = (unsafeWindow.event_girls ??
      unsafeWindow.event_data?.girls ??
      unsafeWindow.current_event?.girls) as CompleteGirl[] | undefined;
    if (!eventGirls) return;
    const stored = GirlGlobalStorageHandler.getGirlGlobalStorage();
    eventGirls.forEach((girl) => {
      stored[girl.id_girl] = this.mergeEntry_(stored[girl.id_girl], this._fromCompleteGirl(girl));
      console.log("Merged event girl data for", girl.name, stored[girl.id_girl]);
    });
    GirlGlobalStorageHandler.setGirlGlobalStorage(stored);
  }

  private _fromPentaDrillPage() {
    const drillGirl = (unsafeWindow as UnsafeWindow_pentaDrill).penta_drill_data.girl_data;
    if (!drillGirl) return;
    const stored = GirlGlobalStorageHandler.getGirlGlobalStorage();
    stored[drillGirl.id_girl] = this.mergeEntry_(
      stored[drillGirl.id_girl],
      this._fromCompleteGirl(drillGirl),
    );
    console.log("Merged penta drill girl data for", drillGirl.name, stored[drillGirl.id_girl]);
    GirlGlobalStorageHandler.setGirlGlobalStorage(stored);
  }

  // ── Migrations ───────────────────────────────────────────────────────────────

  private async _migrateHHPlusPlus() {
    const prefix = location.ancestorOrigins.length
      ? location.ancestorOrigins[0]
      : location.hostname;
    const migrationKey = prefix + "_PlayerGirlMonitoringHHPlusPLusDataMigrated";

    if (GM_getValue(migrationKey, false)) {
      console.log("HH++ data migration already completed, skipping");
      return;
    }
    if (!unsafeWindow.HHPlusPlus?.Helpers?.getGirlDictionary) return;

    try {
      const girlDictionary = (await unsafeWindow.HHPlusPlus.Helpers.getGirlDictionary()) as Map<
        string,
        any
      >;
      console.log("HH++ girlDictionary:", girlDictionary);

      const incoming: GirlGlobalStorage = {};
      girlDictionary.forEach((data, id) => {
        incoming[id] = this._fromHHPlusPlus(data);
      });

      const merged = this.mergeStorage_(GirlGlobalStorageHandler.getGirlGlobalStorage(), incoming);
      GirlGlobalStorageHandler.setGirlGlobalStorage(merged);
      GM_setValue(migrationKey, true);
      console.log(`HH++ migration done: ${Object.keys(incoming).length} girls`);
    } catch (error) {
      console.error("Failed to migrate HH++ data:", error);
    }
  }

  private async _migrateHaremPlusPlus() {
    const prefix = location.ancestorOrigins.length
      ? location.ancestorOrigins[0]
      : location.hostname;
    const migrationKey = prefix + "_PlayerGirlMonitoringHaremPlusPlusDataMigrated";

    if (GM_getValue(migrationKey, false)) return;

    try {
      const haremData = await this._loadHaremPlusPlusCache();
      console.log("Harem++ haremData:", haremData);

      const incoming: GirlGlobalStorage = {};
      haremData.forEach((data: HaremPlusPlusAllGirlsCache_Incomplete) => {
        incoming[data.id] = this._fromHaremPlusPlus(data);
      });

      const merged = this.mergeStorage_(GirlGlobalStorageHandler.getGirlGlobalStorage(), incoming);
      GirlGlobalStorageHandler.setGirlGlobalStorage(merged);
      GM_setValue(migrationKey, true);
      console.log(`Harem++ migration done: ${Object.keys(incoming).length} girls`);
    } catch (error) {
      console.error("Failed to migrate Harem++ data:", error);
    }
  }

  private async _loadHaremPlusPlusCache(): Promise<HaremPlusPlusAllGirlsCache_Incomplete[]> {
    const DATA_CACHE = "harem-cache-0.10.0";
    const HAREM_DATA_REQUEST = "/quickHaremData2.json";

    if (!(await caches.has(DATA_CACHE))) throw new Error("Harem++ cache not found");
    const cache = await caches.open(DATA_CACHE);
    const response = await cache.match(new Request(HAREM_DATA_REQUEST));
    if (!response) throw new Error("Harem data not found in cache");
    return (await response.json()).allGirls;
  }

  // ── Transforms ───────────────────────────────────────────────────────────────

  private _fromHHPlusPlus(girlData: any): GirlEntry {
    const entry: GirlEntry = {
      name: girlData.name,
      rarity: this._rarityFromString(girlData.rarity),
      shards: girlData.shards ?? 0,
    };
    if (girlData.skins?.length > 0) {
      entry.skins = girlData.skins.map(
        (skin: any): GirlSkin => ({
          skinIco: this._extractIconHash(skin.ico_path),
          id_girl_grade_skin: skin.id_girl_grade_skin,
          shards: skin.shards_count ?? 0,
          num_order: skin.num_order,
        }),
      );
    }
    return entry;
  }

  private _fromHaremPlusPlus(girlData: HaremPlusPlusAllGirlsCache_Incomplete): GirlEntry {
    const entry: GirlEntry = {
      name: girlData.name,
      rarity: girlData.rarity,
      shards: girlData.shards,
    };
    const ico = this._extractIconHash(girlData.icon0);
    if (ico != null) entry.ico = ico;
    const poseImage = this._extractPoseImageHash(girlData.poseImage0);
    if (poseImage != null) entry.poseImage = poseImage;
    if (girlData.gradeSkins?.length > 0) {
      entry.skins = girlData.gradeSkins.map(
        (skin): GirlSkin => ({
          skinIco: this._extractIconHash(skin.ico_path),
          id_girl_grade_skin: skin.id_girl_grade_skin,
          shards: 0,
          num_order: skin.num_order,
          skinPose: this._extractPoseImageHash(skin.image_path),
        }),
      );
    }
    return entry;
  }

  private _fromCompleteGirl(girlData: CompleteGirl): GirlEntry {
    return {
      name: girlData.name,
      rarity: this._rarityFromString(girlData.rarity),
      shards: 100,
      ico: this._extractIconHash(girlData.avatar),
      poseImage: this._extractPoseImageHash(girlData.avatar),
      skins: girlData.preview.grade_skins_data.map((skin) => ({
        skinIco: this._extractIconHash(skin.ico_path),
        id_girl_grade_skin: skin.id_girl_grade_skin,
        shards: 0,
        num_order: skin.num_order,
        skinPose: this._extractPoseImageHash(skin.image_path),
      })),
    };
  }

  // ── Skin merging ─────────────────────────────────────────────────────────────

  private _mergeSkins(
    existing: GirlSkin[] | undefined,
    incoming: GirlSkin[] | undefined,
  ): GirlSkin[] | undefined {
    if (!existing) return incoming;
    if (!incoming) return existing;

    const skinMap = new Map<number, GirlSkin>(existing.map((s) => [s.id_girl_grade_skin, s]));
    for (const newSkin of incoming) {
      const prev = skinMap.get(newSkin.id_girl_grade_skin);
      skinMap.set(
        newSkin.id_girl_grade_skin,
        prev ? { ...prev, shards: Math.max(prev.shards, newSkin.shards) } : newSkin,
      );
    }
    return Array.from(skinMap.values());
  }

  // ── Utilities ────────────────────────────────────────────────────────────────

  private _rarityFromString(rarity: string): number {
    const map: Record<string, number> = {
      starting: 0,
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 4,
      mythic: 5,
    };
    return map[rarity] ?? 1;
  }

  private _extractPoseImageHash(url: string): string | undefined {
    if (!url) return undefined;
    if (url.includes("/avb0") || url.includes("/grade_skins")) return undefined;
    const match = url.match(/\/pictures\/gallery\/\d+\/[^/]+\/\d+-(.+?)\.png/);
    if (!match) {
      console.warn("Failed to extract pose image hash from URL:", url);
      return undefined;
    }
    return this._hexToBase64Url(match[1]);
  }

  private _extractIconHash(url: string | undefined): string | undefined {
    if (!url) return undefined;
    const match = url.match(/\/pictures\/gallery\/\d+\/[^/]+\/\d+-(.+?)\.png/);
    if (!match) return undefined;
    return this._hexToBase64Url(match[1]);
  }

  // ── Minification / unminification ────────────────────────────────────────────

  /** Converts a stored base64url hash back to a lowercase hex string. */
  unminifyHash_(hash: string): string {
    return this._base64UrlToHex(hash);
  }

  /** Converts a stored ico hash back to a lowercase hex string. */
  unminifyIconHash_(hash: string): string {
    return this._base64UrlToHex(hash);
  }

  /** Converts a stored poseImage hash back to a lowercase hex string. */
  unminifyPoseImageHash_(hash: string): string {
    return this._base64UrlToHex(hash);
  }

  private _hexToBase64Url(hex: string): string {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  private _base64UrlToHex(base64url: string): string {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    let hex = "";
    for (let i = 0; i < binary.length; i++) {
      hex += binary.charCodeAt(i).toString(16).padStart(2, "0");
    }
    return hex;
  }
}
