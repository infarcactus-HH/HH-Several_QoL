import { HHModule, type SubSettingsType } from "../types/HH++";

const PeopleToWikiConfig = {
  baseKey: "peopleToWiki",
  label: "People to Wiki(HH,GH,GPSH)",
  default: false,
  subSettings: [
    {
      key: "infoBubbleNameToWiki",
      default: true,
      label: "Info bubble name clickable to wiki",
    },
    {
      key: "portraitToWiki",
      default: false,
      label: "Make portrait clickable to wiki",
    },
  ],
} as const;

export default class People extends HHModule<typeof PeopleToWikiConfig> {
  constructor() {
    super(PeopleToWikiConfig);
  }
  shouldRun() {
    return (
      location.host.includes("heroes") ||
      location.host.includes("gayharem") ||
      location.host.includes("gaypornstarharem")
    );
  }
  run(subSettings: SubSettingsType<typeof PeopleToWikiConfig>) {
    if (this.hasRun || !this.shouldRun()) {
      return;
    }
    this.hasRun = true;

    // Now TypeScript should know these are the correct keys
    if (subSettings?.infoBubbleNameToWiki) {
      setInterval(() => {
        this.applyInfoBubbleToWiki();
      }, 500);
    }
    if (subSettings?.portraitToWiki) {
      setInterval(() => {
        this.applyImageToWiki();
      }, 500);
    }
  }
  applyInfoBubbleToWiki() {
    $(".new_girl_info .girl_name_wrap > h5[style!='cursor: pointer;']").each(
      function () {
        const $this = $(this);
        $this.css("cursor", "pointer");
        $this.on("click.InfoBubbleToWiki", function () {
          const girlName = $this.attr("hh_title");
          if (!girlName) return;
          const formattedGirlName = girlName.replace(/ /g, "-");
          GM.openInTab(
            `https://harem-battle.club/wiki/Harem-Heroes/HH:${formattedGirlName}`,
            { active: true }
          );
        });
      }
    );
  }
  applyImageToWiki() {
    $(
      ".slot_girl_shards > [data-new-girl-tooltip][style!='cursor: pointer;']"
    ).each(function () {
      const $this = $(this);
      const tooltip = $this.attr("data-new-girl-tooltip");
      if (!tooltip) return;
      const match = tooltip.match(/"name":"(.+)","rarity/);
      if (match && match[1]) {
        $this.css("cursor", "pointer");
        $this.on("click.ImgToWiki", function (e) {
          e.stopPropagation();
          const formattedGirlName = match[1].replace(/ /g, "-");
          GM.openInTab(
            `https://harem-battle.club/wiki/Harem-Heroes/HH:${formattedGirlName}`,
            { active: true }
          );
        });
      }
    });
  }

  getWikiPageForCurrentGame(formattedName: string) {
    if (location.host.includes("heroes.com")) {
      return `https://harem-battle.club/wiki/Harem-Heroes/HH:${formattedName}`;
    } else if (location.host.includes("gayharem")) {
      return `https://harem-battle.club/wiki/Gay-Harem/GH:${formattedName}`;
    } else if (location.host.includes("gaypornstarharem")) {
      return `https://harem-battle.club/wiki/Gay-Pornstar-Harem/GPSH:${formattedName}`;
    }
  }
}
