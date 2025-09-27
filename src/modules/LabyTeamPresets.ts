import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
const configSchema = {
  baseKey: "labyTeamPreset",
  label: "<span tooltip='Add a button to register laby team presets, and to apply it'>Laby Team Preset</span>",
  default: true,
} as const;

export default class LabyTeamPresets extends HHModule {
  private savedTeamPresetKey = "SeveralQoL_LabyTeamPreset";
  constructor() {
    super(configSchema);
  }
  shouldRun() {
    return location.pathname.includes("/edit-labyrinth-team.html");
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
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
      `<button class="green_button_L" tooltip="Use previously saved preset & leave page" ${!localStorage.getItem(this.savedTeamPresetKey) ? "disabled" : ""}>Fill Preset</button>`
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

  private saveCurrentPreset() {
    let n : any = [];
    $(".team-hexagon .team-member-container").each(function () {
      const position = $(this).attr("data-team-member-position");
      const girlId = $(this).attr("data-girl-id");
      if ($(this).is("[data-girl-id]") && position && girlId) {
        n[position] = girlId;
      }
    });
    console.log("Saving preset: ", n);
    localStorage.setItem(this.savedTeamPresetKey, JSON.stringify(n));
    
  }
  private loadSavedPreset() {
    const preset = localStorage.getItem(this.savedTeamPresetKey);
    if (!preset) {
      console.warn("No saved preset found");
      return;
    }
    try {
      const teamArray: number[] = JSON.parse(preset);
      console.log("Loading preset: ", teamArray);
      const settings = {
        class: "Hero",
        action: "edit_team",
        girls: teamArray,
        battle_type: "labyrinth",
        id_team: unsafeWindow.teamId
      }

      console.log("AJAX settings: ", settings);

      shared.general.hh_ajax(settings, (_data: any) => {
        shared.general.navigate(unsafeWindow.redirectUrl);
      });
      
    } catch (error) {
      console.error("Failed to load preset:", error);
    }
  }
}
