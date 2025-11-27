import GameHelpers from "./utils/GameHelpers";
import { HHPlusPlusReplacer } from "./utils/HHPlusPlusreplacer";
import { GlobalStorageHandler } from "./utils/StorageHandler";
import updateHandlerCss from "./css/UpdateHandler.css";
import { TrackedGirlRecords } from "./types/ShardTracker";
import { GirlID, Grade } from "./types/GameTypes";
import html from "./utils/html";

export default class UpdateHandler {
  // needs to test it on real script not a link to local file
  static run() {
    const currentVersion = GM_info.script.version;
    const storedVersion = GlobalStorageHandler.getStoredScriptVersion();
    console.log(
      `HH++ Several QoL: Current version ${currentVersion}, stored version ${storedVersion}`
    );
    UpdateHandler.addOptionToHHPlusPlusConfig();
    if (storedVersion === currentVersion) {
      return;
    }
    const [storedMajor, storedMinor, storedPatch] = storedVersion
      .split(".")
      .map(Number);
    //const [currentMajor, currentMinor, currentPatch] = currentVersion
    //  .split(".")
    //  .map(Number);
    if (storedMinor === 21 && storedPatch < 5) {
      //Fix Broken Shard tracked girls storage from between v1.21.3 to 1.21.0
      const values = GM_listValues().filter((v) =>
        v.includes("VillainShardTrackerTrackedGirls")
      );
      values.forEach((v) => {
        const data = GM_getValue(v, {}) as TrackedGirlRecords;
        Object.values(data).forEach((girlRecord) => {
          if (girlRecord.skins) {
            girlRecord.skins.forEach((skin) => {
              if (skin.dropped_shards === null) {
                skin.dropped_shards = 0;
                skin.number_fight = 0;
              }
            });
          }
        });
        GM_setValue(v, data);
      });
    }

    if(storedMinor === 21 && storedPatch < 5) {
      // Switch to PlayerLeagueRank being stored as separate league and rank to an object
      GM_listValues()
        .filter((v) => v.includes("LeagueCurrentRank"))
        .forEach((v) => {
          GM_deleteValue(v);
        });
    }

    if (storedMinor === 21 && storedPatch < 5) {
      //Fix potentially wrongly parsed grades in tracked girls storage from between v1.21.4 to 1.21.0

      // grades for potentially wrongly set girls
      const gradesHH: Record<GirlID, Grade> = { 50249610: 3, 92792577: 3, 118563600: 3, 125597344: 6, 143960742: 6, 199686770: 6, 219651566: 3, 225777755: 6, 230575971: 6, 237137080: 6, 270574600: 6, 309097753: 6, 323149196: 3, 328223265: 6, 330911919: 6, 344662796: 6, 372106614: 6, 376374790: 6, 413198545: 3, 423714615: 3, 423864623: 6, 434436290: 3, 445743639: 6, 451625351: 6, 452255257: 1, 455833593: 6, 474799411: 6, 507945521: 6, 538753178: 3, 550842002: 6, 577768127: 3, 580295730: 3, 617303855: 6, 690645314: 6, 772982297: 3, 804990761: 6, 850285776: 5, 861690823: 6, 886658459: 6, 899533146: 3, 935005622: 6, 948443498: 6, 954976932: 3, 967164534: 6, 973183986: 5, 981990704: 6, 994926972: 5 };
      const gradesCxH: Record<GirlID, Grade> = { 104175263: 3, 114069819: 6, 116128230: 3, 140136826: 3, 141953071: 1, 144579731: 6, 147618406: 6, 215363542: 6, 239681148: 3, 279206945: 3, 283904101: 3, 379189043: 3, 444883622: 3, 460118458: 3, 470677385: 3, 479313467: 5, 480186209: 6, 480202265: 5, 527749796: 3, 573898614: 6, 581319811: 6, 677988426: 3, 758023727: 3, 821038259: 5, 839967399: 3, 923039656: 6, 927113807: 3, 934147842: 6, 938478655: 5, 961765788: 6, 966982384: 6, 973778141: 3, 999151109: 3 };
      const gradesGH: Record<GirlID, Grade> = { 118563600: 3, 125597344: 6, 143960742: 6, 199686770: 6, 206065449: 3, 213233570: 1, 225777755: 6, 230575971: 6, 237137080: 6, 247281495: 3, 270574600: 6, 279051760: 3, 309097753: 6, 323149196: 3, 328223265: 6, 330911919: 6, 344662796: 6, 372106614: 6, 376374790: 6, 413198545: 3, 423714615: 3, 423864623: 6, 434436290: 3, 445743639: 6, 451625351: 6, 455833593: 6, 474799411: 6, 507945521: 6, 530721638: 3, 550842002: 6, 577768127: 3, 580295730: 3, 617303855: 6, 690645314: 6, 712589405: 6, 772982297: 3, 780551182: 3, 804990761: 6, 850285776: 5, 861690823: 6, 886658459: 6, 899533146: 3, 935005622: 6, 948443498: 6, 954976932: 3, 960631959: 6, 967164534: 6, 981990704: 6 };
      const gradesPsH: Record<GirlID, Grade> = { 101153047: 3, 114336439: 3, 146695697: 5, 183212158: 3, 230973002: 3, 231724666: 3, 257517207: 3, 264101012: 3, 295382943: 3, 296537297: 3, 297170634: 6, 314510458: 3, 396472004: 3, 437221289: 6, 483424352: 5, 508254527: 5, 518489705: 3, 653504776: 6, 656281921: 5, 674185624: 3, 686233571: 5, 686486032: 3, 709879124: 3, 775558965: 3, 840914604: 6, 866805363: 6, 869508297: 5, 945604178: 5, 986766165: 3 };
      const gradesGPsH: Record<GirlID, Grade> = { 132402253: 3, 172105527: 3, 279481228: 3, 319875013: 3, 339061440: 3 };
      const gradesTPsH: Record<GirlID, Grade> = { 1: 3, 121144525: 3, 122484257: 3, 129394075: 3, 132762958: 3, 165792295: 3, 171883542: 3, 218118569: 3, 219589262: 3, 229180984: 3, 269567651: 3, 270927503: 3, 279733880: 3, 284864117: 3, 303777744: 3, 304482219: 3, 313362316: 3, 318747451: 3, 323873919: 3, 326134747: 3, 338699357: 3, 341704891: 3, 348879045: 3, 360319370: 3, 368469209: 3, 378503948: 3, 393195592: 3, 393928303: 3, 423240108: 5, 465699978: 3, 484962893: 3, 488275225: 3, 500141122: 3, 514825887: 3, 540573241: 3, 541021806: 3, 566307486: 3, 587994605: 3, 601454529: 3, 619131345: 3, 625889131: 3, 651345338: 3, 661298782: 3, 688910029: 3, 699471796: 3, 704722252: 3, 761012504: 3, 771348244: 3, 811833436: 3, 812521921: 3, 812699711: 5, 815875270: 3, 830814672: 3, 834210785: 3, 837317838: 5, 862585404: 3, 865845259: 3, 879068134: 3, 879574564: 3, 890429878: 3, 910924260: 3, 917101548: 3, 936618900: 3, 961792252: 3, 962247749: 3, 973412147: 3 };

      GM_listValues()
        .filter((v) => v.includes("VillainShardTrackerTrackedGirls"))
        .forEach((v) => {
          const data = GM_getValue(v, {}) as TrackedGirlRecords;
          const correctGrades = (()=>{
            switch (v) {
              case 'nutakuVillainShardTrackerTrackedGirls':
              case 'hentaiVillainShardTrackerTrackedGirls':
                return gradesHH;
              case 'nutaku_cVillainShardTrackerTrackedGirls':
              case 'comix_cVillainShardTrackerTrackedGirls':
                return gradesCxH;
              case 'gh_nutakuVillainShardTrackerTrackedGirls':
              case 'gayVillainShardTrackerTrackedGirls':
                return gradesGH;
              case 'nutaku_tVillainShardTrackerTrackedGirls':
              case 'star_tVillainShardTrackerTrackedGirls':
                return gradesPsH;
              case 'nutaku_stargayVillainShardTrackerTrackedGirls':
              case 'dotcom_stargayVillainShardTrackerTrackedGirls':
                return gradesGPsH;
              case 'nutaku_startransVillainShardTrackerTrackedGirls':
              case 'dotcom_startransVillainShardTrackerTrackedGirls':
                return gradesTPsH;
              default:
                console.warn(`unknown key: ${v}`);
                return {};
            }
          })();
          Object.entries(data).forEach(([id, girlRecord]) => {
            girlRecord.grade = correctGrades[+id] ?? girlRecord.grade;
          });
          GM_setValue(v, data);
        });
    }

    if (storedMinor === 20 && GlobalStorageHandler.getShowUpdatePopup()) {
      UpdateHandler.injectCSS();
      GameHelpers.createCommonPopup("update-several-qol", (popup, t) => {
        const $container = popup.$dom_element.find(".container-special-bg");
        $container.append(
          $(
            `<div class="banner">Several QoL - Update to ${currentVersion}</div>`
          )
        );
        $container.append(
          $(html`
            <div class="changelog-content hh-scroll">
              <h2> New Feature : Villain Shard Tracker !</h2>
              <p>
                This feature automatically tracks your drop rates for Legendary & Mythic shards <br>
                Will soon include some stats crunching etc... <br>
                Interface is still a WIP but basic features are here ! <br>
              </p>
              <h3>Popup-- </h3>
              <p>
                Some New Features, go check them out
              </p>
            </div>
          `)
        );
        const $footer = $(html`
          <div class="footer">
            <span>Thank you for using Several QoL! </span>
            <span style="margin-left:10px" tooltip="Won't be show often only on new features"> Show this popup:</span>
          </div>
        `);
        const $toggleUpdatePopup = $(
          `<input name='severalQoL-show-update-popup' type="checkbox" tooltip="Won't be show often only on new features" checked>`
        );
        $toggleUpdatePopup.on("change", () => {
          const show = $toggleUpdatePopup.prop("checked");
          console.log("Setting show update popup to ", show);
          GlobalStorageHandler.setShowUpdatePopup(show);
        });
        $footer.append($toggleUpdatePopup);
        $container.append($footer);
      });
    } else {
      console.log("No update actions needed");
    }
    GlobalStorageHandler.setStoredScriptVersion(currentVersion);
  }
  static async injectCSS() {
    GM_addStyle(updateHandlerCss);
  }
  static addOptionToHHPlusPlusConfig() {
    let updatePopupEnabled = GlobalStorageHandler.getShowUpdatePopup();
    HHPlusPlusReplacer.doWhenSelectorAvailable(
      ".hh-plus-plus-config-button" +
        (unsafeWindow.hhPlusPlusConfig?.BoobStrapped
          ? ".boob-strapped"
          : ":not(.boob-strapped)"),
      ($element) => {
        console.log("Adding click handler to HH++ config");
        $element.on("click.severalQoLAddConfig", () => {
          $element.off("click.severalQoLAddConfig");
          console.log("clicked on config");
          HHPlusPlusReplacer.doWhenSelectorAvailable(
            ".group-panel[rel='severalQoL']",
            ($panel) => {
              console.log("Injecting option into HH++ config");
              const $container = $(`<div class="config-setting ${
                updatePopupEnabled ? "enabled" : ""
              }">
                    <label class="base-setting">
                      <span tooltip="It will only appear for important update, or new features">Show update Popup</span>
                    </label>
                  </div>`);
              const $checkbox = $(
                `<input type="checkbox" ${
                  updatePopupEnabled ? 'checked="checked"' : ""
                }>`
              );
              $container.find("label").append($checkbox);
              $checkbox.on("change", () => {
                updatePopupEnabled = !updatePopupEnabled;
                console.log(
                  `Update popup enabled set to ${updatePopupEnabled}`
                );
                GlobalStorageHandler.setShowUpdatePopup(updatePopupEnabled);
                if (updatePopupEnabled) {
                  $container.addClass("enabled");
                } else {
                  $container.removeClass("enabled");
                }
              });
              $panel.children().first().append($container);
            }
          );
        });
      }
    );
  }
}
