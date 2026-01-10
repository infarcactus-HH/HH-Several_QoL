import { HHModule } from "../base";
import { LabyTeamPresetPentaDrillCss } from "../css/modules";
import { penta_drill_all_teams, penta_drill_team_data, StoredPentaDrillTeam } from "../types";
import GameHelpers from "../utils/GameHelpers";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import {
  LabyTeamStorageHandler,
  WBTTeamStorageHandler,
  PentaDrillTeamStorageHandler,
} from "../utils/StorageHandler";
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
      location.pathname === "/world-boss-pre-battle.html" ||
      location.pathname === "/edit-penta-drill-team"
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
    } else if (location.pathname === "/edit-penta-drill-team") {
      this.PentaDrillTeamPageRun();
    } else {
      this.editTeamPageRun();
    }
  }
  PentaDrillTeamPageRun() {
    const $centralButtonsPanel = $(".boss-bang-panel");
    injectCSS();

    const $OpenPresetManagerBtn = $(
      `<button class="green_button_L manage-presets">Manage presets</button>`,
    );

    $OpenPresetManagerBtn.on("click", () => {
      GameHelpers.createCommonPopup("laby_team_preset_manager", (popup, _t) => {
        const $container = popup.$dom_element.find(".container-special-bg");
        $container.append(`<div class="title">Penta Drill Team Preset Manager</div>`);

        // Main content area with scroll
        const $contentArea = $(html`
          <div class="hh-scroll penta-drill-content-area">
            <div id="preset-list"></div>
          </div>
        `);

        // Team registerer at the bottom
        const $registererArea = $(html`
          <div class="penta-drill-registerer-area">
            <input
              id="team-name-input"
              type="text"
              placeholder="Team name"
              class="penta-drill-team-name-input"
            />
            <button class="green_button_L penta-drill-register-btn" id="register-team-btn">
              Register
            </button>
          </div>
        `);

        $container.append($contentArea, $registererArea);

        // Render presets
        this.renderPentaDrillPresets($contentArea.find("#preset-list"));

        // Register button handler
        $registererArea.find("#register-team-btn").on("click", () => {
          const teamName =
            ($registererArea.find("#team-name-input").val() as string) || "Unnamed Team";
          this.registerCurrentPentaDrillTeam(teamName);
          $registererArea.find("#team-name-input").val("");
          this.renderPentaDrillPresets($contentArea.find("#preset-list"));
        });
      });
    });
    $centralButtonsPanel.prepend($OpenPresetManagerBtn);

    async function injectCSS() {
      GM_addStyle(LabyTeamPresetPentaDrillCss);
    }
  }

  private renderPentaDrillPresets($container: JQuery) {
    $container.empty();
    const presets = PentaDrillTeamStorageHandler.getPentaDrillTeams();

    if (presets.length === 0) {
      $container.append('<div class="penta-drill-empty-state">No presets saved yet</div>');
      return;
    }

    presets.forEach((preset, index) => {
      const $presetItem = $(html`
        <div class="penta-drill-preset-item">
          <button
            class="penta-drill-delete-btn delete-preset-btn"
            data-preset-index="${index}"
          ></button>
          <div class="penta-drill-preset-name">${preset.name || "Unnamed Team"}</div>
          <button
            class="blue_button_L penta-drill-apply-btn apply-preset-btn"
            data-preset-index="${index}"
          >
            Apply
          </button>
        </div>
      `);

      $presetItem.find(".delete-preset-btn").on("click", () => {
        this.deletePentaDrillPreset(index);
        this.renderPentaDrillPresets($container);
      });

      $presetItem.find(".apply-preset-btn").on("click", () => {
        this.applyPentaDrillPreset(index);
      });

      $container.append($presetItem);
    });
  }

  private registerCurrentPentaDrillTeam(teamName: string) {
    let teams: Record<number, [number, number, number, number, number, number, number]> = {};

    (unsafeWindow.all_teams as penta_drill_all_teams).forEach((e, index) => {
      teams[index] = e.girls_ids;
    });

    PentaDrillTeamStorageHandler.addPentaDrillTeam({
      teams,
      name: teamName,
    });

    console.log("Registered penta drill team:", teamName, teams);
    //this.sendApplyPentaDrillPresetRequest(teams);
  }

  private applyPentaDrillPreset(index: number) {
    const presets = PentaDrillTeamStorageHandler.getPentaDrillTeams();
    const preset = presets[index];

    if (!preset) {
      console.warn("Preset not found at index", index);
      return;
    }

    console.log("Applying penta drill preset:", preset.name, preset.teams);
    this.sendApplyPentaDrillPresetRequest(preset.teams);
  }

  private deletePentaDrillPreset(index: number) {
    const presets = PentaDrillTeamStorageHandler.getPentaDrillTeams();
    if (index >= 0 && index < presets.length) {
      PentaDrillTeamStorageHandler.deletePentaDrillTeam(index);
      console.log("Deleted penta drill preset at index:", index);
    }
  }
  private sendApplyPentaDrillPresetRequest(team: StoredPentaDrillTeam["teams"]) {
    const teamsList: Record<number, Array<number>> = {};
    const teamSlots: Record<number, number> = {};
    Object.values(team).forEach((team, index) => {
      const currAllTeam = (unsafeWindow.all_teams as penta_drill_all_teams)[index];
      teamsList[currAllTeam.id_team] = team;
      teamSlots[currAllTeam.id_team] = currAllTeam.slot_index;
    });
    const params: {
      action: string;
      teams_list: Record<number, Array<number>>;
      team_slots: Record<number, number>;
      battle_type: string;
      id_team?: number;
    } = {
      action: "edit_multiple_teams",
      teams_list: teamsList,
      team_slots: teamSlots,
      battle_type: "penta_drill",
    };
    if (0 !== unsafeWindow.teamId) {
      params.id_team = unsafeWindow.teamId;
    }
    shared.general.hh_ajax(params, (_data: any) => {
      shared.general.navigate(unsafeWindow.redirectUrl);
    });
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
