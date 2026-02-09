import { AlwaysRunningModule } from "../base";
import { PlayerBadgesCss, PlayerBadges_TighterLeaderboards } from "../css/AlwaysRunningModules";
import { labyLeaderboardXHRResponse } from "../types";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { Several_QoL_Badges } from "../utils/Several_QoL_Badges";

export default class PlayerBadges extends AlwaysRunningModule {
  static shouldRun() {
    return [
      "/penta-drill.html",
      "/pantheon.html",
      "/season.html",
      "/labyrinth.html",
      "/path-of-valor.html",
      "/path-of-glory.html",
      "/activities.html",
      "/leagues.html",
    ].some((path) => location.pathname === path);
  }
  readonly badgeConfigs = Several_QoL_Badges.getBadgeConfigurations();
  run() {
    if (this.hasRun || !PlayerBadges.shouldRun()) {
      return;
    }
    this.hasRun = true;
    this.injectCSS();
    console.log("PlayerBadges module running");
    if (this.badgeConfigs.length === 0) {
      return;
    }

    switch (location.pathname) {
      case "/activities.html":
        HHPlusPlusReplacer.doWhenSelectorAvailable(".lead_table_view .leadTable > tr", ($el) => {
          this.addContestLeaderboardBadges($el);
        });
        break;
      case "/leagues.html":
        this.addLeagueBadges();
        break;
      default:
        this.hookAjaxComplete();
        break;
    }
  }
  private addLeagueBadges() {
    HHPlusPlusReplacer.doWhenSelectorAvailable(".league_table > .data-list", ($el) => {
      this.applyBadgesToLeagueRows($el);
      new MutationObserver(() => this.applyBadgesToLeagueRows($el)).observe($el[0], {
        childList: true,
      });
    });
  }

  private applyBadgesToLeagueRows($el: JQuery<HTMLElement>) {
    $el.children(".body-row").each((_, el) => {
      const rowNickname = el.querySelector(".nickname");
      const playerId = rowNickname?.getAttribute("id-member");
      if (!playerId) return;

      this.badgeConfigs.forEach((config) => {
        if (config.userIds.includes(playerId)) {
          rowNickname?.after(this.generateBadgeElement(config.tooltip, config.cssClass));
        }
      });
    });
  }
  private hookAjaxComplete() {
    $(document).ajaxComplete((_event, xhr, settings) => {
      if (!(typeof settings?.data === "string")) {
        return;
      }
      console.log("LeaderboardTweaks detected AJAX:", settings.data);
      if (settings.data.startsWith("action=labyrinth_leaderboard")) {
        HHPlusPlusReplacer.doWhenSelectorAvailable(
          "#leaderboard_holder:has(#outer-hero-row) #leaderboard_list > .leaderboard_row",
          ($el) => {
            this.addLabyrinthLeaderboardBadges(
              $el,
              xhr.responseJSON! as labyLeaderboardXHRResponse,
            );
          },
        );
      } else if (settings.data === "action=leaderboard&feature=path_of_valor") {
        console.log("Detected Path of Valor leaderboard AJAX");
        HHPlusPlusReplacer.doWhenSelectorAvailable(
          "#pov_leaderboard_tab_container #leaderboard_list > .leaderboard_row",
          ($el) => {
            this.addStandardLeaderboardBadges(
              $el,
              "#pov_leaderboard_tab_container #outer-hero-row .leaderboard-nickname-align",
            );
          },
        );
      } else if (settings.data === "action=leaderboard&feature=path_of_glory") {
        console.log("Detected Path of Glory leaderboard AJAX");
        HHPlusPlusReplacer.doWhenSelectorAvailable(
          "#pog_leaderboard_tab_container #leaderboard_list > .leaderboard_row",
          ($el) => {
            this.addStandardLeaderboardBadges(
              $el,
              "#pog_leaderboard_tab_container #outer-hero-row .leaderboard-nickname-align",
            );
          },
        );
      } else if (settings.data.startsWith("action=leaderboard")) {
        console.log("Detected Standard leaderboard AJAX");
        HHPlusPlusReplacer.doWhenSelectorAvailable(
          "#leaderboard_holder:has(.build-at-bottom) > #leaderboard_list > .leaderboard_row",
          ($el) => {
            this.addStandardLeaderboardBadges($el);
          },
        );
      }
    });
  }
  private addLabyrinthLeaderboardBadges(
    $leaderboard_rowsListElement: JQuery<HTMLElement>,
    response: labyLeaderboardXHRResponse,
  ) {
    const currentPlayerId = response.hero_data?.id_member.toString();

    // Add badges to current player's row
    currentPlayerId &&
      this.badgeConfigs.forEach((config) => {
        if (config.userIds.includes(currentPlayerId)) {
          HHPlusPlusReplacer.doWhenSelectorAvailable(
            "#outer-hero-row .leaderboard-nickname-align",
            ($el) => {
              $el.append(this.generateBadgeElement(config.tooltip, config.cssClass));
              console.log("Added badge to current player in labyrinth leaderboard");
            },
          );
        }
      });

    // For some strange reasons the elements no longer contain the sorting_id so we use the response data
    console.log($leaderboard_rowsListElement.length);
    $leaderboard_rowsListElement.each((index, el) => {
      const playerData = response.leaderboard[index];
      if (!playerData) return;
      const sortingId = playerData.id_member.toString();
      this.badgeConfigs.forEach((config) => {
        if (config.userIds.includes(sortingId)) {
          el.querySelector(".leaderboard-nickname-align")?.appendChild(
            this.generateBadgeElement(config.tooltip, config.cssClass),
          );
          console.log(`Added badge to player ${playerData.nickname} in labyrinth leaderboard`, el);
        }
      });
    });
  }
  private addStandardLeaderboardBadges(
    $leaderboard_rowsListElement: JQuery<HTMLElement>,
    customHeroSelector?: string,
  ) {
    const currentPlayerId = shared.Hero.infos.id.toString();

    // Add badges to current player's row
    this.badgeConfigs.forEach((config) => {
      if (config.userIds.includes(currentPlayerId)) {
        document
          .querySelector(customHeroSelector ?? "#outer-hero-row .leaderboard-nickname-align")
          ?.appendChild(this.generateBadgeElement(config.tooltip, config.cssClass));
      }
    });

    // Add badges to other players' rows
    $leaderboard_rowsListElement.each((_, el) => {
      const sortingId = el.getAttribute("sorting_id");
      if (!sortingId) return;

      this.badgeConfigs.forEach((config) => {
        if (config.userIds.includes(sortingId)) {
          el.querySelector(".leaderboard-nickname-align")?.appendChild(
            this.generateBadgeElement(config.tooltip, config.cssClass),
          );
        }
      });
    });
  }
  private addContestLeaderboardBadges($contestTablesEntries: JQuery<HTMLElement>) {
    $contestTablesEntries.each((_, entries) => {
      const userId = entries.getAttribute("sorting_id");
      if (!userId) return;

      this.badgeConfigs.forEach((config) => {
        if (config.userIds.includes(userId)) {
          entries.children[1].appendChild(
            this.generateBadgeElement(config.tooltip, config.cssClass),
          );
        }
      });
    });
  }
  private generateBadgeElement(tooltipText: string, additionalClasses?: string): HTMLSpanElement {
    const badge = document.createElement("span");
    badge.className = `S_QoL-leaderboard-badge ${additionalClasses ?? ""}`;
    badge.setAttribute("tooltip", tooltipText);
    $(badge).on("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
      GM_openInTab("https://www.patreon.com/infarcactusHH", { active: true });
    });
    return badge;
  }
  private async injectCSS() {
    GM_addStyle(PlayerBadgesCss);
    GM_addStyle(PlayerBadges_TighterLeaderboards);
  }
}
