import { HHModule } from "../base";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { LabyTeamStorageHandler, WBTTeamStorageHandler } from "../utils/StorageHandler";
import html from "../utils/html";

export default class LabyTeamPresets extends HHModule {
  readonly configSchema = {
    baseKey: "labyTeamPreset",
    label:
      "<span tooltip='Add a button to register laby team presets, and to apply it (also for WBT)'>Laby Team Preset</span>",
    default: true,
  };
  private StorageHandlerTeam =
    location.pathname === "/edit-labyrinth-team.html"
      ? LabyTeamStorageHandler
      : WBTTeamStorageHandler;

  static shouldRun() {
    return (
      location.pathname === "/edit-labyrinth-team.html" ||
      location.pathname === "/edit-world-boss-team.html" ||
      location.pathname === "/world-boss-pre-battle.html"
    );
  }
  run() {
    if (this.hasRun || !LabyTeamPresets.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.migrateLocalStorageIfNeeded();
    if (location.pathname === "/world-boss-pre-battle.html") {
      this.WBTPreBattlePageRun();
    } else {
      this.editTeamPageRun();
    }
  }
  WBTPreBattlePageRun() {
    const currentWBTId = unsafeWindow.event_data?.id_world_boss_event as number | undefined;
    if (!currentWBTId) {
      return;
    }
    const savedWBTId = WBTTeamStorageHandler.getWBTId();
    if (currentWBTId === savedWBTId) {
      return;
    }
    HHPlusPlusReplacer.doWhenSelectorAvailable("#perform_opponent.blue_button_L", () => {
      $("#perform_opponent.blue_button_L")
        .removeClass("blue_button_L")
        .addClass("red_button_L")
        .attr("tooltip", "Set your WBT Team before continuing")
        .text("Perform without saved team ?");
    });
    WBTTeamStorageHandler.setWBTId(currentWBTId);
  }
  editTeamPageRun() {
    const $centralPanel = $(".boss-bang-panel");
    const $savePresetBtn = $(
      html`<button class="green_button_L" tooltip="Save preset for later runs">
        Save Preset
      </button>`,
    );
    $savePresetBtn.on("click", () => {
      this.saveCurrentPreset();
      $FillPresetBtn.removeAttr("disabled");
    });
    $centralPanel.append($savePresetBtn);

    const $FillPresetBtn = $(html`
      <button
        class="green_button_L"
        tooltip="Use previously saved preset & leave page"
        ${!this.StorageHandlerTeam.getTeamPreset() ? "disabled" : ""}
      >
        Fill Preset
      </button>
    `);
    $FillPresetBtn.on("click", () => {
      this.loadSavedPreset();
    });
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".change-team-panel .player-team .average-lvl",
      () => {
        const $averageLvl = $(".change-team-panel .player-team .average-lvl");
        $averageLvl.replaceWith($FillPresetBtn);
      },
    );
  }
  migrateLocalStorageIfNeeded() {
    const oldKey = "SeveralQoL_LabyTeamPreset";
    const existingOldPreset = localStorage.getItem(oldKey);
    if (existingOldPreset) {
      LabyTeamStorageHandler.setTeamPreset(JSON.parse(existingOldPreset));
      localStorage.removeItem(oldKey);
      console.log(`Migrated old laby team preset from key ${oldKey} to storage handler`);
    }
  }

  private saveCurrentPreset() {
    let n: Record<number, string> = {};
    $(".team-hexagon .team-member-container").each(function () {
      const position = $(this).attr("data-team-member-position") as number | undefined;
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
