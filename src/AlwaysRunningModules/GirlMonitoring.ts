import { AlwaysRunningModule } from "../base";
import { GirlGlobalStorage } from "../types/storage/GirlGlobalStorage";

export default class GirlMonitoring extends AlwaysRunningModule {
  static shouldRun() {
    return true;
  }
  run() {
    if (this.hasRun) {
      return;
    }
    this.hasRun = true;
    console.log("PlayerGirlMonitoring module running");
    this.tryDataMigration();
    switch (location.pathname) {
    }
  }
  private async tryDataMigration() {
    const GM_Key_MigrationFlag = HH_UNIVERSE + "PlayerGirlMonitoringDataMigrated";
    if (GM_getValue(GM_Key_MigrationFlag, false)) {
      return;
    }
    if (unsafeWindow.HHPlusPlus?.Helpers?.getGirlDictionary) {
      const girlDictionary = (await unsafeWindow.HHPlusPlus.Helpers.getGirlDictionary()) as Map<
        string,
        any
      >;
      console.log("HH++ girlDictionary :");
      console.log(girlDictionary);
      const transformedGirls: GirlGlobalStorage = {};
      girlDictionary.forEach((girlData: any, girlId: string) => {
        const transformedData = this.transformHHPlusPlusGirlData(girlData);
        transformedGirls[girlId] = transformedData;
      });
    }
  }
  private transformHHPlusPlusGirlData(girlData: any): GirlGlobalStorage[number] {
    // Transform a single girlData object to GirlGlobalStorage[number] format
    return {
      name: girlData.name,
      rarity: girlData.rarity,
      shards: girlData.shards,
      skins: girlData.skins
        ? girlData.skins.map((skin: any) => ({
            id_girl_grade_skin: skin.id_girl_grade_skin,
            shards: skin.shards_count,
          }))
        : [],
    };
  }
}
