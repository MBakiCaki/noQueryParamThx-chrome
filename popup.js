"use strict";

document.querySelector("#version").textContent = chrome.runtime.getManifest().version;
document.querySelector("#demo").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("deneme.html") });
});

(async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: "CLEAN_LINK_STATUS" }, { frameId: 0 });
    if (!response?.ready) throw new Error("not ready");
    document.body.dataset.state = "ready";
    document.querySelector("#status").textContent = "Bu sayfada hazır ✓";
    const action = response.lastAction;
    if (!action) {
      document.querySelector("#help").textContent = "Bu sayfada henüz bağlantı yakalanmadı. Ctrl + orta tık yapınca kısa bir bildirim görünecek.";
      return;
    }
    document.querySelector("#last").hidden = false;
    document.querySelector("#result").textContent = {
      opening: "Sekme açılıyor…", opened: "Temiz adres yeni sekmeye gönderildi.", failed: "Tıklama algılandı, ancak sekme açılamadı."
    }[action.status] || "Tıklama algılandı.";
    document.querySelector("#original").textContent = action.originalUrl;
    document.querySelector("#clean").textContent = action.url;
  } catch {
    document.body.dataset.state = "unavailable";
    document.querySelector("#status").textContent = "Bu sayfada etkin değil";
    document.querySelector("#help").textContent = "Normal bir web sayfasındaysan Ctrl + R ile yenile. Hâlâ etkin değilse Chrome → Uzantılar → Temiz Bağlantı → Ayrıntılar → Site erişimi bölümünden bu siteye izin ver. Chrome'un kendi sayfaları desteklenmez.";
  }
})();
