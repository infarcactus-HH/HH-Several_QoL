import type { love_raids } from "../types/GameTypes/love_raids";
import { HHModule } from "../types/HH++";
import { HHPlusPlusReplacer } from "../utils/HHPlusPlusreplacer";
import { LoveRaidsStorageHandler } from "../utils/StorageHandler";

declare const love_raids: Array<love_raids> | undefined;
declare const GT_design_love_raid: string;
declare const GT_design_girl_town_event_owned_v2: string;

export default class LoveRaids extends HHModule {
  readonly configSchema = {
    baseKey: "loveRaids",
    label: "Additional Love Raids tweaks",
    default: true,
  };
  static shouldRun() {
    return (
      location.pathname.includes("/home.html") ||
      (unsafeWindow.love_raids !== undefined && love_raids?.length)
    );
  }
  run() {
    if (this.hasRun || !LoveRaids.shouldRun()) {
      return;
    }
    this.hasRun = true;
    if (location.pathname === "/love-raids.html") {
      this.loveRaidsPageModifications();
    } else {
      console.log("Not on love raids page, skipping modifications");
    }
  }
  loveRaidsPageModifications() {
    if (love_raids === undefined) {
      console.log("love_raids data is undefined, cannot modify page");
      return;
    }
    injectCSS();
    if (true) {
      // need to add the condition
      GM_addStyle(`.raid-card.grey-overlay{display:none!important;}`);
    }
    // clean up notifications for raids that no longer exist
    const loveRaidNotifs = LoveRaidsStorageHandler.getLoveRaidNotifications();
    let currentLoveRaidNotifs = loveRaidNotifs.filter((id) =>
      love_raids.some((raid) => raid.id_raid === id)
    ); // can also be used later in the script
    LoveRaidsStorageHandler.setLoveRaidNotifications(currentLoveRaidNotifs);

    const reducedLoveRaids = love_raids.map((raid) => {
      const { id_raid, all_is_owned } = raid;
      let start, end;
      if (raid["status"] === "ongoing") {
        const { seconds_until_event_end } = raid;
        start = 0; // irrelevant since it is running
        end = server_now_ts + seconds_until_event_end;
      } else {
        const { event_duration_seconds, seconds_until_event_start } = raid;
        start = server_now_ts + seconds_until_event_start;
        end = start + event_duration_seconds;
      }
      return { all_is_owned, id_raid, start, end };
    });
    HHPlusPlusReplacer.doWhenSelectorAvailable(".raid-card", () => {
      LoveRaidsStorageHandler.setReducedLoveRaids(reducedLoveRaids);
      modifyPageWithoutGirlDict(reducedLoveRaids);
      unsafeWindow.HHPlusPlus?.Helpers?.getGirlDictionary().then(
        (girlDict: any) => {
          modifyPageWithGirlDict(girlDict, reducedLoveRaids);
        }
      );
    });

    function modifyPageWithGirlDict(
      girlDict: any,
      reducedLoveRaids: Array<{
        all_is_owned: boolean;
        id_raid: number;
        start: number;
        end: number;
      }>
    ) {
      if (love_raids === undefined) {
        return;
      }
      const girls = love_raids.map((raid) =>
        girlDict.get(raid.id_girl.toString())
      );
      $(".raid-card").each((index, raidCard) => {
        if (!girls[index]) {
          return;
        }
        const $raidCard = $(raidCard);
        const { name, shards } = girls[index];
        const {
          id_girl,
          girl_data: { grade_skins },
        } = love_raids[index];
        const haremLink = shared.general.getDocumentHref(
          `/characters/${id_girl}`
        );
        const wikiLink = unsafeWindow.HHPlusPlus.Helpers.getWikiLink(
          name,
          id_girl,
          unsafeWindow.HHPlusPlus.I18n.getLang()
        );
        if (grade_skins.length) {
          if (!raidCard.classList.contains("multiple-girl")) {
            const leftImage = $(raidCard.querySelector(".girl-img.left")!);
            raidCard.classList.add("multiple-girl");
            raidCard.classList.remove("single-girl");
            $raidCard
              .find("div.raid-content")
              .append(
                $(
                  `<div class="right-girl-container">` +
                    `<img class="girl-img right" src="" alt="Right" style="margin-top: ${leftImage.css(
                      "marginTop"
                    )}">` +
                    `</div>`
                )
              );
            $raidCard.find(".info-box .info-container .classic-girl").after(
              $(
                `<div class="classic-girl">` +
                  `<div class="shards-container">` +
                  `<div class="progress-container">` +
                  `<div class="shards_bar_wrapper">` +
                  `<div class="shards">` +
                  `<span class="skins_shard_icn"></span>` +
                  `<p><span>?/33</span></p>` +
                  `</div>` +
                  `<div class="shards_bar skins-shards">` +
                  `<div class="bar basic-progress-bar-fill pink" style="width: 0"></div>` +
                  `</div>` +
                  `</div>` +
                  `</div>` +
                  `<a href="" class="redirect_button blue_button_L" disabled="">Go</a>
                    </div>` +
                  `<div class="border-bottom"></div>` +
                  `</div>`
              )
            );
          }
          const rightImage = raidCard.querySelector(
            ".girl-img.right"
          ) as HTMLImageElement;
          if (!rightImage.src.includes("grade_skins")) {
            // there is no good way to tell which skin it will be so this will always show the first
            rightImage.src = `${IMAGES_URL}/pictures/girls/${id_girl}/grade_skins/grade_skin1.png`;
          }
        }
        const objectives = raidCard.querySelectorAll(".classic-girl");
        const girl = objectives[0];
        const skin = objectives[1];
        // @prettier-ignore
        //raidCard.querySelector(".raid-name > span > span")!.textContent = `${name} ${GT.design.love_raid}`;
        HHPlusPlusReplacer.doWhenSelectorAvailable(
          ".raid-name span span",
          () => {
            $raidCard
              .find(".raid-name > span > span")
              .first()
              .text(`${name} ${GT.design.love_raid}`);
            $raidCard
              .find(".girl-name")
              .html(`<a href="${wikiLink}" target="_blank">${name}</a>`);
          }
        );

        // add go buttons if there aren't any
        addMissingGoButton(girl);
        addMissingGoButton(skin);

        // enable go buttons of owned girls/skins
        const goButtons = raidCard.querySelectorAll(
          ".redirect_button"
        ) as NodeListOf<HTMLLinkElement>;
        if (shards === 100) {
          if (girl) {
            (girl.querySelector(".objective") as HTMLElement).innerText =
              GT.design.girl_town_event_owned_v2;
            goButtons[0].removeAttribute("disabled");
            goButtons[0].href = haremLink;
          }
          if (skin) {
            const skinProgressOrNull = (
              skin.querySelector(".shards_bar .bar") as HTMLDivElement | null
            )?.style?.width;
            if (skinProgressOrNull) {
              if (parseFloat(skinProgressOrNull) === 100) {
                goButtons[1].removeAttribute("disabled");
                goButtons[1].href = haremLink;
              }
            }
          }
        }
      });
    }
    function modifyPageWithoutGirlDict(
      reducedLoveRaids: Array<{
        all_is_owned: boolean;
        id_raid: number;
        start: number;
        end: number;
      }>
    ) {
      HHPlusPlusReplacer.doWhenSelectorAvailable(
        // removes the eye from HH++
        ".raid-content > .eye.btn-control",
        () => {
          $(".raid-content > .eye.btn-control").remove();
        }
      );
      HHPlusPlusReplacer.doWhenSelectorAvailable(".raid-card", () => {
        if (love_raids === undefined) {
          return;
        }
        $(".raid-card").each((index, element) => {
          const raidData = love_raids[index];
          if (raidData === undefined) {
            console.warn("love_raids data is undefined for index ", index);
            return;
          }
          const $element = $(element);
          if (!raidData.all_is_owned) {
            showGirlAvatarForHidden(raidData, $element);
            HHPlusPlusReplacer.doWhenSelectorAvailable(
              ".raid-name > .type_icon",
              () => {
                addNotificationForFavoriteRaid(raidData, $element);
              }
            );
            return;
          }
          // Notif for "favorite" raids
        });
        function showGirlAvatarForHidden(
          raidData: love_raids,
          $element: JQuery<HTMLElement>
        ) {
          if (
            raidData.announcement_type_name !== "full" &&
            raidData.status !== "ongoing"
          ) {
            // mysterious ones
            const $girlImg = $element.find(".girl-img.avatar");
            $girlImg.attr(
              "src",
              raidData.girl_data.ico
                .replace(/\/avb0/, "/ava0")
                .toImageUrl("ava")
            ); // set the image to normal avatar
            if ($girlImg.css("visibility") === "hidden") {
              // sometimes hidden by default ?
              $girlImg.css("visibility", "visible");
            }
          }
        }
        function addNotificationForFavoriteRaid(
          raidData: love_raids,
          $element: JQuery<HTMLElement>
        ) {
          const $raidName = $element.find(".raid-name");
          if (currentLoveRaidNotifs.includes(raidData.id_raid)) {
            $raidName.attr("data-notify", "true");
          }
          const $notifyToggle = $(`<span class="notify-toggle"></span>`);
          $notifyToggle.on("click", (event) => {
            event.stopPropagation();
            if (currentLoveRaidNotifs.includes(raidData.id_raid)) {
              currentLoveRaidNotifs = currentLoveRaidNotifs.filter(
                (id) => id !== raidData.id_raid
              );
              $raidName.attr("data-notify", "false");
            } else {
              currentLoveRaidNotifs.push(raidData.id_raid);
              $raidName.attr("data-notify", "true");
            }
            LoveRaidsStorageHandler.setLoveRaidNotifications(
              currentLoveRaidNotifs
            );
          });
          $raidName.append($notifyToggle);
          console.log("Added notify toggle ", $notifyToggle);
        }
      });
    }
    function addMissingGoButton(element: Element | null) {
      if (element && !$(element).find(".redirect_button").length) {
        $(element)
          .find(".shards-container")
          .append(`<a class="redirect_button blue_button_L" disabled>Go</a>`);
      }
    }
    async function injectCSS() {
      GM_addStyle(
        `.notify-toggle {background-image: url(${IMAGES_URL}/ic_new.png);`
      );
      const css = require("./css/LoveRaids.css").default;
      GM_addStyle(css);
    }
  }
}
