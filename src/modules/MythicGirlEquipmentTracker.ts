import { HHModule } from "../base";
import { GirlEquipmentTrackerCss } from "../css/modules";
import { GirlArmorItem, GirlEquipmentListResponse } from "../types";
import { girls_data_listIncomplete } from "../types/game/waifu";
import GameHelpers from "../utils/GameHelpers";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";

export default class MythicGirlEquipmentTracker extends HHModule {
  readonly configSchema = {
    baseKey: "girlEquipmentTracker",
    label:
      "<span tooltip='Go to edit your waifu on front page or go to Harem++ and click on icon with Girl Equip on it'>Girl Equipment Tracker</span>",
    default: true,
  };
  girlEquipmentButton: JQuery<HTMLElement> = $(
    `<button id="open-girl-equipment-popup-button" class="square_blue_btn" tooltip="Mythic Girl Equipment Tracker" disabled><img src="/images/pictures/design/pachinko/ic_girl_armor_tooltip_icon.png"></img></button>`,
  );

  private equipmentData: { [figure: number]: { [slotIndex: number]: Array<number> } } = {};

  static shouldRun() {
    return "/waifu.html" === location.pathname;
  }

  run() {
    if (this.hasRun || !MythicGirlEquipmentTracker.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.injectCSS();
    this.init();
    this.AddButton();
  }

  private AddButton() {
    this.girlEquipmentButton.on("click", () => {
      console.log("Clicked girl equipment button");
      this.showEquipmentPopup();
    });
    if (location.hash !== "") {
      HHPlusPlusReplacer.doWhenSelectorAvailable(".harem-toolbar > .spacer", ($el) => {
        $el.after(this.girlEquipmentButton);
      });
    } else {
      HHPlusPlusReplacer.doWhenSelectorAvailable(".change-girl-panel #filter_girls", ($el) => {
        $el.wrap("<div style='display: flex;'></div>");
        $el.after(this.girlEquipmentButton);
      });
    }
  }

  private showEquipmentPopup() {
    const $equipmentEquipmentListContainer = $("<div class='equipment-list-container'></div>");
    $equipmentEquipmentListContainer.append(this.generateEquipmentTable("all"));

    const $container = $("<div class='girl-equipment-popup-container'></div>");

    // Add filter toggle
    const filterToggle = $("<div class='filter-toggle'><span>Level:</span></div>");
    const $filterAllBtn = $("<span class='filter-btn' data-filter='all'>All</span>");
    const $filter10Btn = $("<span class='filter-btn disabled' data-filter='10'>10</span>");
    filterToggle.append($filterAllBtn, $filter10Btn);
    $filter10Btn.on("click", () => {
      $filterAllBtn.addClass("disabled");
      $filter10Btn.removeClass("disabled");
      $equipmentEquipmentListContainer.html(this.generateEquipmentTable("10"));
    });
    $filterAllBtn.on("click", () => {
      $filterAllBtn.removeClass("disabled");
      $filter10Btn.addClass("disabled");
      $equipmentEquipmentListContainer.html(this.generateEquipmentTable("all"));
    });
    $container.append(filterToggle);
    $container.append($equipmentEquipmentListContainer);

    GameHelpers.createPopup(
      "common",
      "girl-equipment-tracker-popup",
      $container,
      "Mythic Girl Equipment Tracker",
    );
  }

  private generateEquipmentTable(filter: "all" | "10"): string {
    let html = "";

    // Iterate through each figure (1-12)
    for (let figure = 1; figure <= 12; figure++) {
      html += `<div class="figure-group" data-figure="${figure}">`;
      html += `<div class="figure-title-row"><img class="figure-title-img" src="${IMAGES_URL}/pictures/design/battle_positions/${figure}.png" alt="Figure ${figure}" /><span class="figure-title">${GT.figures[figure]}</span></div>`;
      html += '<table class="figure-equipment-table">';
      html += '<tr class="slot-header-row">';

      // Add slot headers (1-6)
      for (let slot = 1; slot <= 6; slot++) {
        html += `<th></th>`;
      }
      html += "</tr>";

      // Add 7 rows for items
      for (let row = 0; row < 7; row++) {
        html += '<tr class="equipment-row">';
        for (let slot = 1; slot <= 6; slot++) {
          // Get items for this figure and slot
          const levels = this.equipmentData[figure]?.[slot] || [];

          // Filter based on criteria
          const filteredLevels = levels.filter((level) => {
            if (filter === "10") {
              return level === 10;
            }
            return true; // for "all" filter
          });
          filteredLevels.sort((a, b) => b - a); // Sort levels in descending order

          // Display item if available, otherwise empty cell
          if (row < filteredLevels.length) {
            html += `<td class="equipment-item level-${filteredLevels[row]}">${filteredLevels[row]}</td>`;
          } else {
            html += '<td class="equipment-item empty"></td>';
          }
        }
        html += "</tr>";
      }

      html += "</table>";
      html += "</div>";
    }
    return html;
  }

  private async init() {
    const a = this.fetchAllSlots();
    const b = this.getEquipDataFromEquippedGirls();
    await Promise.all([a, b]);
    console.log("Initialization complete. Equipment data:", this.equipmentData);
    this.girlEquipmentButton.prop("disabled", false);
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
            const figure = armorItem.variation.figure;
            const slotIndex = armorItem.slot_index;
            if (!this.equipmentData[figure]) {
              this.equipmentData[figure] = {};
            }
            if (!this.equipmentData[figure][slotIndex]) {
              this.equipmentData[figure][slotIndex] = [];
            }
            this.equipmentData[figure][slotIndex].push(armorItem.level);
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
          const figure = item.variation.figure;
          const slotIndex = item.slot_index;
          if (!this.equipmentData[figure]) {
            this.equipmentData[figure] = {};
          }
          if (!this.equipmentData[figure][slotIndex]) {
            this.equipmentData[figure][slotIndex] = [];
          }
          this.equipmentData[figure][slotIndex].push(item.level);
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

  private async injectCSS() {
    GM_addStyle(GirlEquipmentTrackerCss);
  }
}
