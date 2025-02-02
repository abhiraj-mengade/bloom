import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    // Show a prompt to user about new content being available
    if (confirm("New content available. Reload?")) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});
