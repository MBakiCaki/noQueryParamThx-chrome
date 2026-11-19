(() => {
  "use strict";

  function cleanUrl(rawUrl, baseUrl) {
    if (typeof rawUrl !== "string") return null;
    try {
      const url = new URL(rawUrl, baseUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      url.search = "";
      return url.href;
    } catch {
      return null;
    }
  }

  globalThis.CleanLink = Object.freeze({ cleanUrl });
})();
