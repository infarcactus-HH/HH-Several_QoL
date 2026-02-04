export interface BadgeConfig {
  type: string;
  tooltip: string;
  cssClass: string;
  userIds: string[];
}

export class Several_QoL_Badges {
  static getBadgeConfigurations(): BadgeConfig[] {
    const configs: BadgeConfig[] = [];

    // Script Contributors
    const contributors = this.getMajorContributorsForGame();
    if (contributors.length > 0) {
      configs.push({
        type: "contributor",
        tooltip: "Major Script Contributor",
        cssClass: "S_QoL-major-contributor",
        userIds: contributors,
      });
    }

    /* // Donors
    const donors = this.getDonorsForGame();
    if (donors.length > 0) {
      configs.push({
        type: "donor",
        tooltip: "Donor",
        cssClass: "S_QoL-donor",
        userIds: donors,
      });
    }

    // Patreon Supporters
    const patreonSupporters = this.getPatreonSupportersForGame();
    if (patreonSupporters.length > 0) {
      configs.push({
        type: "patreon",
        tooltip: "Patreon Supporter",
        cssClass: "S_QoL-patreon",
        userIds: patreonSupporters,
      });
    }*/

    return configs;
  }

  private static getMajorContributorsForGame(): string[] {
    if ("nutaku" === HH_UNIVERSE) {
      return [
        "3239327", // infarctus
        "4443024", // xenicat / xnh0x
      ];
    }
    if ("hentai" === HH_UNIVERSE) {
      return [
        "583627", // Arez
      ];
    }
    return [];
  }
}
