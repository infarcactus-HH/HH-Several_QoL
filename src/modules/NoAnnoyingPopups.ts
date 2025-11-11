import { HHModule } from "../types/HH++";

export default class NoAnnoyingPopups extends HHModule {
  readonly configSchema = {
    baseKey: "noAnnoyingPopups",
    label:
      "<span tooltip='Does not work inside nutaku frame if you have violentmonkey'>Removes annoying popup appearing automatically for shops, paths, news</span>",
    default: false,
  } as const;
  static shouldRun() {
    return true;
  }
  run() {
    if (this.hasRun || !NoAnnoyingPopups.shouldRun()) {
      return;
    }
    this.hasRun = true;
    setCookie();
    //
    function setCookie() {
      console.log("Setting cookie to disable annoying popups");
      try {
        GM_cookie.set({
          name: "disabledPopups",
          value: "PassReminder,Bundles,News",
          domain: location.hostname.split(".").slice(-2).join("."),
          secure: true,
          path: "/",
          sameSite: "no_restriction",
          expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
        });
      } catch (e) {
        document.cookie =
          "disabledPopups=PassReminder,Bundles,News; path=/; max-age=" +
          60 * 60 * 24 * 30;
      }
    }
    if (location.pathname === "/home.html") {
      console.log("Setting up listener to delete cookie on checkbox click");
      $(document).on(
        "change",
        "input[name='severalQoL_noAnnoyingPopups']",
        function (event) {
          const isChecked = (event.target as HTMLInputElement).checked;
          if (!isChecked) {
            try {
              GM_cookie.delete(
                {
                  name: "disabledPopups",
                },
                function (error: boolean) {
                  if (error) {
                    console.error("Error deleting cookie:", error);
                  } else {
                    console.log("Cookie deleted successfully");
                  }
                }
              );
            } catch (e) {
              document.cookie = "disabledPopups=; path=/; max-age=0";
            }
          } else {
            setCookie();
          }
        }
      );
    }
  }
}
