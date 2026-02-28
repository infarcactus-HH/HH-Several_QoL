import { SubModule } from "../../base";
import { simv4FixCss } from "../../css/modules";
import { LeagueOpponentIncomplete } from "../../types";
import { HHPlusPlusReplacer } from "../../utils/HHPlusPlusreplacer";

export default class simv4Fix implements SubModule {
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private opponentsRequestSubmitted = new Set<number>();
  private opponentsSimmed = new Set<number>();
  private lastOpponentClickedId: number | null = null;
  run() {
    console.log("Running simv4Fix");
    this.injectCSS();
    HHPlusPlusReplacer.doWhenSelectorAvailable(".league_table > .data-list", ($el) => {
      this.hookTableClick();
      new MutationObserver(() => {
        this.hookTableClick();
      }).observe($el[0], { childList: true });
    });
  }
  async injectCSS() {
    GM_addStyle(simv4FixCss);
  }
  private hookTableClick() {
    $(".league_table > .data-list > .body-row").on("click.SeveralQoL", (clickEvent) => {
      const idMember = Number(
        clickEvent.delegateTarget.querySelector("[id-member].nickname")?.getAttribute("id-member"),
      );
      if (isNaN(idMember)) {
        console.warn("Could not find idMember for clicked opponent");
        return;
      }
      let opponent = (unsafeWindow.opponents_list as Array<LeagueOpponentIncomplete>).find(
        (opponent) => opponent.player.id_fighter === idMember,
      );
      if (!opponent) {
        console.warn("Could not find opponent for idMember ", idMember);
        return;
      } else if (this.opponentsSimmed.has(idMember)) {
        console.log("Already computed opponent data for id ", idMember);
        if (this.lastOpponentClickedId === idMember) {
          console.log("Same opponent clicked twice, applying QoL changes");
          HHPlusPlusReplacer.doWhenSelectorAvailable(
            `.player_team_block:not(.result-QoLed)`,
            (el) => {
              el.addClass("result-QoLed");
            },
          );
        } else {
          this.lastOpponentClickedId = idMember;
          HHPlusPlusReplacer.doWhenSelectorAvailable(
            `.player_team_block .player-name[title='${opponent.nickname}']`,
            () => {
              const LeaguePlusPlusTeamBlock = document.querySelector(".player_team_block");
              if (LeaguePlusPlusTeamBlock) {
                LeaguePlusPlusTeamBlock.className += " result-QoLed";
              }
            },
          );
        }
      } else if (!this.opponentsRequestSubmitted.has(idMember)) {
        console.log("Queueing fetch for opponent id ", idMember);
        this.opponentsRequestSubmitted.add(idMember);
        this.enqueueRequest(() => this.fetchOpponentData(idMember, opponent));
      }
    });
  }
  private enqueueRequest(task: () => Promise<void>): void {
    this.requestQueue.push(task);
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }
  private async processQueue(): Promise<void> {
    this.isProcessingQueue = true;
    while (this.requestQueue.length > 0) {
      const task = this.requestQueue.shift()!;
      await task();
    }
    this.isProcessingQueue = false;
  }
  private fetchOpponentData(idMember: number, opponent: LeagueOpponentIncomplete): Promise<void> {
    return new Promise((resolve) => {
      const urlToFetch = shared.general.getDocumentHref(
        `/leagues-pre-battle.html?id_opponent=${idMember}`,
      );
      fetch(urlToFetch)
        .then(async (response) => {
          response.text().then(async (html) => {
            const opponentFighterRegex =
              /var hero_data = ({.+});\n.+\n\s+var opponent_fighter = {\n\s+player:(.+}),\n.+\n\s};\n\svar leagues_cycling/gm;
            const match = opponentFighterRegex.exec(html);
            if (match && match[2]) {
              const selfData = JSON.parse(match[1]);
              const opponentData = JSON.parse(match[2]);
              console.log("Fetched opponent data for id ", idMember, opponentData);
              const simResultFullRequest = unsafeWindow.HHBattleSimulator.simulateFromFightersEx(
                "Full",
                selfData,
                opponentData,
              );
              const simResultFull = await simResultFullRequest;
              const pointsTable = this.createPointsTable(simResultFull);
              Object.defineProperty(opponent, "power", {
                get() {
                  return simResultFull.avgPoints;
                },
                set() {
                  // Silently ignore write attempts
                },
                configurable: false,
              });
              if (opponent.sim) {
                selfData.id_team = opponent.sim.forSim.playerTeam.id_team;
                opponent.sim.forSim.opponentTeam = opponentData;
                opponent.sim.forSim.playerTeam = selfData;
                opponent.sim.forSim.result = simResultFullRequest;
                opponent.sim.forSim.battleTable = "Not supported yet";
                opponent.sim.forSim.hasAssumptions = false;
                delete opponent.sim.forSim.boosterResults;
                delete opponent.sim.forSim.boosterTable;
                delete opponent.sim.forSim.skillResults;
                delete opponent.sim.forSim.skillTable;
              }
              const currentlySelectedMemberId = Number(
                document
                  .querySelector(".data-row.selected [id-member].nickname")
                  ?.getAttribute("id-member"),
              );
              const LeaguePlusPlusTeamBlock = document.querySelector(".player_team_block");
              const simResultPointElement = document.querySelector(".sim-result.sim-right");
              const simResultPercentageElement = document.querySelector(".sim-result.sim-left");
              if (
                currentlySelectedMemberId === idMember &&
                simResultPointElement &&
                simResultPercentageElement &&
                LeaguePlusPlusTeamBlock
              ) {
                simResultPointElement.setAttribute("tooltip", pointsTable);
                simResultPointElement.querySelector(".sim-points")!.textContent =
                  this.toLeaguePointsPerFight(simResultFull.avgPoints);
                simResultPercentageElement.querySelector(".sim-chance")!.textContent =
                  this.toPercentage(simResultFull.chance);
                simResultPercentageElement.setAttribute("tooltip", `Not supported yet`);
                LeaguePlusPlusTeamBlock.className += " result-QoLed";
              }
            } else {
              console.warn(
                "Could not find opponent_fighter data in fetched HTML for id ",
                idMember,
              );
            }
          });
        })
        .catch((error) => {
          console.error("Error fetching opponent data: ", error);
        })
        .finally(() => {
          this.opponentsSimmed.add(idMember);
          resolve();
        });
    });
  }
  // From simv4
  private createPointsTable(result: any): string {
    function clamp(value: number, min: number, max: number): number {
      return value <= min ? min : value >= max ? max : value;
    }
    function getGammaCorrectedValue(value: number): number {
      return Math.round(255 * Math.sqrt(clamp(value, 0, 1)));
    }
    function getRatingColor(rate: number): string {
      const red = getGammaCorrectedValue(2 - 2 * rate);
      const green = getGammaCorrectedValue(2 * rate);
      return `rgb(${red}, ${green}, 0)`;
    }
    function getPointsColor(points: number): string {
      const rate = ((clamp(points, 3, 25) - 3) / 22) ** 3;
      return getRatingColor(rate);
    }
    const toPrecisePercentage = (value: number): string => {
      const percentage = value * 100;
      if (percentage >= 100) return "100%";
      if (percentage >= 0.01) return `${this.truncateSoftly(percentage, 2)}%`; // 0.01%-99.99%
      if (percentage >= 0) return `${this.truncateSoftly(percentage, 3)}%`; // 0% or 0.001%-0.009%
      return "0%";
    };

    if ("pointsTable" in result) {
      const max = Math.sqrt(result.pointsTable.reduce((p: any, c: any) => Math.max(p, c), 0));
      const rows = result.pointsTable
        .map((e: any, i: any) => ({ points: i, probability: e }))
        .filter((e: any) => e.probability > 0)
        .sort((x: any, y: any) => y.points - x.points)
        .flatMap((e: any) => [
          `<tr style="color: ${getPointsColor(e.points)};">`,
          "<td>",
          e.points.toFixed(),
          "</td>",
          '<td class="sim-bar-container">',
          `<div class="sim-bar" style="width: ${(e.probability * 5) / max}rem;"></div>`,
          toPrecisePercentage(e.probability),
          "</td>",
          "</tr>",
        ]);

      return $('<table class="sim-points-table"></table>').append(rows.join("")).prop("outerHTML");
    } else {
      function row(...args: any[]): string {
        return ["<tr>", ...args, "</tr>"].join("");
      }
      function column(span: number, content: any): string {
        return span >= 2 ? `<td colspan="${span}">${content}</td>` : `<td>${content}</td>`;
      }
      function columns(span: number, contents: any[]): string {
        return contents.map((e) => column(span, e)).join("");
      }
      const toPreciseLeaguePointsPerFight = (value: number): string => {
        if (value >= 25) return "25";
        if (value > 24.9) return (25 - parseFloat((25 - value).toPrecision(2))).toLocaleString();
        return this.truncateSoftly(value, 2);
      };
      return $('<table class="sim-table"></table>')
        .append(row(column(2, "Points")))
        .append(row(columns(1, ["Max", result.maxPoints.toFixed()])))
        .append(row(columns(1, ["Avg", toPreciseLeaguePointsPerFight(result.avgPoints)])))
        .append(row(columns(1, ["Min", result.minPoints.toFixed()])))
        .prop("outerHTML");
    }
  }
  private truncateSoftly(value: number, digit: number = 0): string {
    return (Math.floor(Math.round(value * 10 ** (digit + 1)) / 10) / 10 ** digit).toLocaleString();
  }
  private toLeaguePointsPerFight(value: number): string {
    if (value >= 25) return "25";
    if (value > 24.9) return this.truncateSoftly(value, 3);
    return this.truncateSoftly(value, 2);
  }
  private toPercentage(value: number): string {
    const percentage = value * 100;
    if (percentage >= 100) return "100%";
    if (percentage >= 10) return `${this.truncateSoftly(percentage, 1)}%`; // 10%-99.9%
    if (percentage >= 0.01) return `${this.truncateSoftly(percentage, 2)}%`; // 0.01%-9.99%
    if (percentage >= 0) return `${this.truncateSoftly(percentage, 3)}%`; // 0% or 0.001%-0.009%
    return "0%";
  }
}
