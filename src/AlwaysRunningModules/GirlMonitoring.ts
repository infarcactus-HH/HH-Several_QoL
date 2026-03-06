import { AlwaysRunningModule } from "../base";
import { HaremPlusPlusAllGirlsCache_Incomplete } from "../types/Harem++";
import { GirlGlobalStorage } from "../types/storage/GirlGlobalStorage";
import { GirlGlobalStorageHandler } from "../utils/StorageHandler";

type GirlSkin = NonNullable<GirlGlobalStorage[string]["skins"]>[number];

export default class GirlMonitoring extends AlwaysRunningModule {
  static shouldRun() {
    return true;
  }
  async run() {
    if (this.hasRun) {
      return;
    }
    this.hasRun = true;
    console.log("PlayerGirlMonitoring module running");
    //this.testReset();
    await this._tryDataMigrationHHPlusPLus();
    await this._tryDataMigrationHaremPlusPLus();
    switch (location.pathname) {
    }
  }
  private testReset() {
    let prefix = location.ancestorOrigins.length ? location.ancestorOrigins[0] : location.hostname;
    GM_deleteValue(prefix + "_PlayerGirlMonitoringHHPlusPLusDataMigrated");
    GM_deleteValue(prefix + "_PlayerGirlMonitoringHaremPlusPlusDataMigrated");
    GirlGlobalStorageHandler.setGirlGlobalStorage({});
  }
  private async _tryDataMigrationHHPlusPLus() {
    let prefix = location.ancestorOrigins.length ? location.ancestorOrigins[0] : location.hostname;
    const migrationKeyHHPlusPlus = prefix + "_PlayerGirlMonitoringHHPlusPLusDataMigrated";
    if (GM_getValue(migrationKeyHHPlusPlus, false)) {
      console.log("HH++ data migration already completed, skipping");
      return;
    }
    if (unsafeWindow.HHPlusPlus?.Helpers?.getGirlDictionary) {
      try {
        const girlDictionary = (await unsafeWindow.HHPlusPlus.Helpers.getGirlDictionary()) as Map<
          string,
          any
        >;
        console.log("HH++ girlDictionary:");
        console.log(girlDictionary);

        const transformedGirls: GirlGlobalStorage = {};
        girlDictionary.forEach((girlData: any, girlId: string) => {
          transformedGirls[girlId] = this._transformHHPlusPlusGirlData(girlData);
        });

        // Merge with existing data instead of overwriting
        const existingGirls = GirlGlobalStorageHandler.getGirlGlobalStorage();
        const mergedGirls: GirlGlobalStorage = this._mergeGirlData(existingGirls, transformedGirls);
        GirlGlobalStorageHandler.setGirlGlobalStorage(mergedGirls);

        // Mark migration as complete
        GM_setValue(migrationKeyHHPlusPlus, true);
        console.log(
          `HH++ data migration completed: ${Object.keys(transformedGirls).length} girls migrated`,
        );
      } catch (error) {
        console.error("Failed to migrate HH++ data:", error);
      }
    }
  }
  private async _tryDataMigrationHaremPlusPLus() {
    let prefix = location.ancestorOrigins.length ? location.ancestorOrigins[0] : location.hostname;
    const migrationKeyHaremPlusPlus = prefix + "_PlayerGirlMonitoringHaremPlusPlusDataMigrated";
    if (GM_getValue(migrationKeyHaremPlusPlus, false)) {
      return;
    }

    async function loadHaremDataFromCache() {
      const DATA_CACHE = "harem-cache-0.10.0";
      const HAREM_DATA_REQUEST2 = "/quickHaremData2.json";

      try {
        if (await caches.has(DATA_CACHE)) {
          const cache = await caches.open(DATA_CACHE);
          const response = await cache.match(new Request(HAREM_DATA_REQUEST2));
          if (response) {
            return (await response.json()).allGirls;
          }
        }
      } catch (error) {
        console.warn("Failed to load harem data from cache:", error);
      }
      throw new Error("Harem data not found in cache");
    }

    try {
      const haremData =
        (await loadHaremDataFromCache()) as Array<HaremPlusPlusAllGirlsCache_Incomplete>;
      console.log("Harem++ haremData:");
      console.log(haremData);

      const transformedGirls: GirlGlobalStorage = {};
      haremData.forEach((girlData: HaremPlusPlusAllGirlsCache_Incomplete) => {
        transformedGirls[girlData.id] = this._transformHaremPlusPlusGirlData(girlData);
      });

      // Merge with existing data (in case some girls exist from HH++ migration)
      const existingGirls = GirlGlobalStorageHandler.getGirlGlobalStorage();
      const mergedGirls: GirlGlobalStorage = this._mergeGirlData(existingGirls, transformedGirls);
      console.log("Merged girl data after Harem++ migration:");
      console.log(mergedGirls);
      GirlGlobalStorageHandler.setGirlGlobalStorage(mergedGirls);

      // Mark migration as complete
      GM_setValue(migrationKeyHaremPlusPlus, true);
      console.log(
        `Harem++ data migration completed: ${Object.keys(transformedGirls).length} girls migrated`,
      );
    } catch (error) {
      console.error("Failed to migrate Harem++ data:", error);
    }
  }
  private _mergeGirlData(
    existing: GirlGlobalStorage,
    newData: GirlGlobalStorage,
  ): GirlGlobalStorage {
    const result: GirlGlobalStorage = { ...existing };

    for (const [girlId, newGirl] of Object.entries(newData)) {
      const existingGirl = result[girlId];

      if (!existingGirl) {
        // No existing data, use new data
        result[girlId] = newGirl;
      } else {
        const girlIdResult = result[girlId];
        // Merge: take best values from both sources
        result[girlId] = {
          name: existingGirl.name || newGirl.name,
          rarity: existingGirl.rarity || newGirl.rarity,
          shards: Math.max(existingGirl.shards, newGirl.shards),
        };
        if (existingGirl.ico || newGirl.ico) {
          result[girlId].ico = existingGirl.ico || newGirl.ico;
        }
        if (existingGirl.poseImage || newGirl.poseImage) {
          result[girlId].poseImage = existingGirl.poseImage || newGirl.poseImage;
        }
        if (existingGirl.skins || newGirl.skins) {
          result[girlId].skins = this._mergeSkins(existingGirl.skins, newGirl.skins);
        }
      }
    }

    return result;
  }

  private _mergeSkins(
    existing: GirlSkin[] | undefined,
    newSkins: GirlSkin[] | undefined,
  ): GirlSkin[] | undefined {
    if (!existing) return newSkins;
    if (!newSkins) return existing;

    const skinMap = new Map<number, GirlSkin>();

    // Add existing skins first
    existing.forEach((skin) => {
      skinMap.set(skin.id_girl_grade_skin, skin);
    });

    // Merge new skins: take highest shard count
    newSkins.forEach((newSkin) => {
      const existingSkin = skinMap.get(newSkin.id_girl_grade_skin);
      if (!existingSkin) {
        skinMap.set(newSkin.id_girl_grade_skin, newSkin);
      } else {
        const mergedSkin: GirlSkin = {
          ...existingSkin,
          shards: Math.max(existingSkin.shards, newSkin.shards),
        };
        skinMap.set(newSkin.id_girl_grade_skin, mergedSkin);
      }
    });

    return Array.from(skinMap.values());
  }

  private _convertRarity(rarity: string): number {
    const rarityMap: Record<string, number> = {
      starting: 0,
      common: 1,
      rare: 2,
      epic: 3,
      legendary: 4,
      mythic: 5,
    };
    return rarityMap[rarity] ?? 1;
  }
  private _transformHHPlusPlusGirlData(girlData: any): GirlGlobalStorage[string] {
    // Transform a single girlData object to GirlGlobalStorage format
    const result: GirlGlobalStorage[string] = {
      name: girlData.name,
      rarity: this._convertRarity(girlData.rarity),
      shards: girlData.shards ?? 0,
    };

    if (girlData.skins && girlData.skins.length > 0) {
      result.skins = girlData.skins.map((skin: any) => ({
        ico_path: skin.ico_path,
        id_girl_grade_skin: skin.id_girl_grade_skin,
        shards: skin.shards_count,
        num_order: skin.num_order,
      }));
    }

    return result;
  }
  private _transformHaremPlusPlusGirlData(
    girlData: HaremPlusPlusAllGirlsCache_Incomplete,
  ): GirlGlobalStorage[string] {
    // Transform Harem++ girl data to GirlGlobalStorage format
    const result: GirlGlobalStorage[string] = {
      name: girlData.name,
      rarity: girlData.rarity,
      shards: girlData.shards,
    };

    const poseImageHash = this._extractAndMinifyPoseImage(girlData.poseImage0);
    if (poseImageHash) {
      result.poseImage = poseImageHash;
    }

    const icoHash = this._extractAndMinifyIcon(girlData.icon0);
    if (icoHash) {
      result.ico = icoHash;
    }

    if (girlData.gradeSkins && girlData.gradeSkins.length > 0) {
      result.skins = girlData.gradeSkins.map((skin) => ({
        skinIco: this._extractAndMinifyIcon(skin.ico_path),
        id_girl_grade_skin: skin.id_girl_grade_skin,
        shards: 0, // Harem++ cache doesn't have shard count per skin
        num_order: skin.num_order,
        skinPose: this._extractAndMinifyPoseImage(skin.image_path),
      }));
    }

    return result;
  }
  private _extractAndMinifyPoseImage(poseImage: string): string | undefined {
    if (!poseImage) {
      return undefined;
    }
    if (poseImage.includes("/avb0") || poseImage.includes("/grade_skins")) {
      return undefined;
    }

    // Extract gallery path and hash from URL like:
    // "https://hh.hh-content.com/pictures/gallery/70/1200x-black/41414350-7c325f588fb0a2aa0b05bf3720368e6b.png"
    const match = poseImage.match(/\/pictures\/gallery\/\d+\/[^/]+\/\d+-(.+)\.png/);
    if (!match) {
      console.warn("Failed to extract pose image info from URL:", poseImage);
      return undefined;
    }
    const hexHash = match[1];

    // Minify hex hash to base64url (32 hex chars -> 22 base64url chars)
    // Each hex char = 4 bits, each base64 char = 6 bits
    // 32 * 4 = 128 bits -> 128 / 6 = ~22 chars
    const poseImageHash = this._hexToBase64Url(hexHash);

    return poseImageHash;
  }

  private _extractAndMinifyIcon(ico: string | undefined) {
    if (!ico) {
      return undefined;
    }

    // Extract hash from icon URL like:
    // "https://hh.hh-content.com/pictures/gallery/70/ico/41414350-7c325f588fb0a2aa0b05bf3720368e6b.png"
    const match = ico.match(/\/pictures\/gallery\/\d+\/[^/]+\/\d+-(.+)\.png$/);
    if (!match) {
      return undefined;
    }

    const hexHash = match[1];
    const icoHash = this._hexToBase64Url(hexHash);

    return icoHash;
  }

  private _hexToBase64Url(hex: string): string {
    // Convert hex string to bytes
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }

    // Convert bytes to base64
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // Convert to base64url (URL-safe, no padding)
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
}
