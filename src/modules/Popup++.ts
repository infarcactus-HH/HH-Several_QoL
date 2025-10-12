import { HHModule } from "../types/HH++";

export default class PopupPlusPlus extends HHModule {
  readonly configSchema = {
    baseKey: "popupPlusPlus",
    label:
      "<span tooltip='Stacking popups,click on the popup to make it disappear'>Popup++</span>",
    default: true,
  };
  shouldRun() {
    return true;
  }
  run() {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;
    GM.addStyle("#toast-popups {display:inherit!important;}");
    let lastPoints: any = {};
    let timeOut: NodeJS.Timeout | null = null;
    delete shared.general.objectivePopup.show;
    shared.general.objectivePopup.show = function (t: any) {
      if (this.LastPoints == undefined) {
        this.LastPoints = {};
      }
      if (!t.objective_points || t.battle_result) {
        return;
      }
      if (!t.objective_points) {
        // OG function if it's not for objective points
        const n = t.objective_points;
        if (Object.keys(this.pointsBox).length) {
          for (let t in n) {
            this.pointsBox[t]
              ? this.pointsBox[t].name === n[t].name &&
                (this.pointsBox[t].points_gained += n[t].points_gained)
              : (this.pointsBox[t] = n[t]);
          }
        } else {
          this.pointsBox = t.objective_points;
        }
        t?.end?.rewards?.hasOwnProperty("lose"); //|| this.popOverlayPoints(t.next_step)
      }
      customPopup(this, t.objective_points);
    };
    function customPopup(_objectivePopupthis: any, objective_points: any) {
      const changedObjectives = new Set();
      Object.keys(objective_points).map((n) => {
        const currObjective = objective_points[n];
        if (!lastPoints[n]) {
          lastPoints[n] = currObjective;
          if (currObjective.points_gained > 0) {
            changedObjectives.add(n);
          }
        } else {
          const newPointsGained = currObjective.points_gained;
          if (newPointsGained > 0) {
            changedObjectives.add(n);
          }
          lastPoints[n].points_gained += newPointsGained;
        }
      });
      const $popup = $(
        `<div class="popup_wrapper"><div id="objective_popup" class="popup"><div class="noti_box"><div class="points">${Object.keys(
          lastPoints
        )
          .map((n) => {
            const currObjective = lastPoints[n];
            const animateClass = "row animate";
            return `<div class="${animateClass}" style="transition: all 20ms;"><div class="contest_name">${
              currObjective.title
            }:</div><div class="contest_points"><div class="points_name" style="animation:none;">${
              currObjective.name
            }: </div><div class="points_num" style="animation:none;"><div class="points_i" style="animation:none;">+${number_format_lang(
              currObjective.points_gained
            )}</div></div></div></div>`;
          })
          .join("")}</div></div></div></div></div>`
      );
      $("#toast-popups .popup_wrapper").remove();
      $("#toast-popups").css("display", "unset");
      $("#toast-popups");
      $("#toast-popups").append($popup);
      $("#toast-popups").css("display", "unset");
      if (timeOut) {
        clearTimeout(timeOut);
        timeOut = null;
      }
      timeOut = setTimeout(() => {
        $popup.remove();
        timeOut = null;
        lastPoints = {};
      }, 5000);
      $popup.on("click.removePopup", function () {
        $popup.remove();
        timeOut = null;
        lastPoints = {};
      });
    }
  }
}
