import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { LabyTeamStorageHandler, WBTTeamStorageHandler } from "../utils/StorageHandler";

export default class LabyTeamPresets extends HHModule {
  readonly configSchema = {
    baseKey: "labyTeamPreset",
    label:
      "<span tooltip='Add a button to register laby team presets, and to apply it (also for WBT)'>Laby Team Preset</span>",
    default: true,
  };
  private StorageHandlerTeam = location.pathname === "/edit-labyrinth-team.html" ? LabyTeamStorageHandler : WBTTeamStorageHandler

  shouldRun() {
    return (
      location.pathname === "/edit-labyrinth-team.html" ||
      location.pathname === "/edit-world-boss-team.html"
    );
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.migrateLocalStorageIfNeeded();
    const $centralPannel = $(".boss-bang-panel");
    const $savePresetBtn = $(
      `<button class="green_button_L" tooltip="Save preset for later runs">Save Preset</button>`
    );
    $savePresetBtn.on("click", () => {
      this.saveCurrentPreset();
      $FillPresetBtn.removeAttr("disabled");
    });
    $centralPannel.append($savePresetBtn);

    const $FillPresetBtn = $(
      `<button class="green_button_L" tooltip="Use previously saved preset & leave page" ${
        !this.StorageHandlerTeam.getTeamPreset() ? "disabled" : ""
      }>Fill Preset</button>`
    );
    $FillPresetBtn.on("click", () => {
      this.loadSavedPreset();
    });
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".change-team-panel .player-team .average-lvl",
      () => {
        const $averageLvl = $(".change-team-panel .player-team .average-lvl");
        $averageLvl.replaceWith($FillPresetBtn);
      }
    );
  }
  migrateLocalStorageIfNeeded() {
    const oldKey = "SeveralQoL_LabyTeamPreset";
    const existingOldPreset = localStorage.getItem(oldKey);
    if (existingOldPreset) {
      LabyTeamStorageHandler.setTeamPreset(JSON.parse(existingOldPreset));
      localStorage.removeItem(oldKey);
      console.log(
        `Migrated old laby team preset from key ${oldKey} to storage handler`
      );
    }
  }

  private saveCurrentPreset() {
    let n: Record<number,string> = {};
    $(".team-hexagon .team-member-container").each(function () {
      const position = $(this).attr("data-team-member-position") as (number | undefined);
      const girlId = $(this).attr("data-girl-id");
      if ($(this).is("[data-girl-id]") && position && girlId) {
        n[position] = girlId;
      }
    });
    console.log("Saving preset: ", n);
    this.StorageHandlerTeam.setTeamPreset(n);
  }
  private loadSavedPreset() {
    const preset = this.StorageHandlerTeam.getTeamPreset();
    if (!preset) {
      console.warn("No saved preset found");
      return;
    }
    try {
      console.log("Loading preset: ", preset);
      const settings = {
        class: "Hero",
        action: "edit_team",
        girls: preset,
        battle_type: location.pathname === "/edit-labyrinth-team.html" ? "labyrinth" : "world_boss",
        id_team: unsafeWindow.teamId,
      };

      console.log("AJAX settings: ", settings);

      shared.general.hh_ajax(settings, (_data: any) => {
        shared.general.navigate(unsafeWindow.redirectUrl);
      });
    } catch (error) {
      console.error("Failed to load preset:", error);
    }
  }
}
