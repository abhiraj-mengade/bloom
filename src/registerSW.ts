import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Show a prompt to user about new content being available
    if (confirm("New content available. Reload?")) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});
