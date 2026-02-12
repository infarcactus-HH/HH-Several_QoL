import { HHModule } from "../base";
import { GirlArmorItem, GirlArmorItemMythic, GirlEquipmentListResponse } from "../types";
import { girls_data_listIncomplete } from "../types/game/waifu";

type StoredEquipment = {
  slotIndex: GirlArmorItem["slot_index"];
  figure: number | null;
  level: GirlArmorItem["level"];
};

export default class GirlEquipmentTracker extends HHModule {
  readonly configSchema = {
    baseKey: "girlEquipmentTracker",
    label: "Girl Equipment Tracker",
    default: true,
  };

  private equipmentData: StoredEquipment[] = [];

  static shouldRun() {
    return "/waifu.html" === location.pathname;
  }

  run() {
    if (this.hasRun || !GirlEquipmentTracker.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.init();
  }

  private async init() {
    const a = this.fetchAllSlots();
    const b = this.getEquipDataFromEquippedGirls();
    await Promise.all([a, b]);
    console.log("Initialization complete. Equipment data:", this.equipmentData);
  }

  // Run asynchronously to gain time
  private async getEquipDataFromEquippedGirls() {
    const girlsDataList = unsafeWindow.girls_data_list as girls_data_listIncomplete | undefined;
    if (!girlsDataList) {
      alert("Unable to access girls_data_list");
      return;
    }
    for (const girlData of girlsDataList) {
      if (girlData.armor.length > 0) {
        girlData.armor.forEach((armorItem) => {
          if (armorItem.rarity === "mythic") {
            this.equipmentData.push({
              slotIndex: armorItem.slot_index,
              figure: armorItem.variation.figure,
              level: armorItem.level,
            });
          }
        });
      }
    }
  }

  private async fetchAllSlots() {
    const slots: GirlArmorItem["slot_index"][] = [1, 2, 3, 4, 5, 6];
    for (const slot of slots) {
      await this.fetchEquipmentWithPagination(slot);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Delay between slot fetches to avoid overwhelming the server
    }
  }

  id_girl_item_armor: any = [];

  private fetchEquipmentWithPagination(
    slotIndex: GirlArmorItem["slot_index"],
    page: number = 1,
  ): Promise<void> {
    return new Promise((resolve) => {
      const params = {
        action: "girl_equipment_list",
        slot_index: slotIndex,
        sort_by: "rarity",
        sorting_order: "desc",
        page: page,
        id_girl: 1,
      };

      shared.general.hh_ajax(params, (response: GirlEquipmentListResponse) => {
        const mythicItems = response.items.filter((item) => item.rarity === "mythic");
        // Store the items from this page
        mythicItems.forEach((item) => {
          this.equipmentData.push({
            slotIndex: item.slot_index,
            figure: item.variation.figure,
            level: item.level,
          });
        });

        // Check if all items are mythic, if so fetch the next page
        if (mythicItems.length === response.items.length && response.items.length > 0) {
          // Fetch next page for this slot
          this.fetchEquipmentWithPagination(slotIndex, page + 1).then(resolve);
        } else {
          resolve();
        }
      });
    });
  }

  getEquipmentBySlot(slotIndex: GirlArmorItem["slot_index"]): StoredEquipment[] {
    return this.equipmentData.filter((item) => item.slotIndex === slotIndex);
  }

  getAllEquipment(): StoredEquipment[] {
    return this.equipmentData;
  }
}
