import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function applyConfiguredFavicon() {
  try {
    const config = JSON.parse(localStorage.getItem("smj_config") || "{}") as { faviconUrl?: string };
    const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

    if (!config.faviconUrl) {
      if (existing) {
        existing.remove();
      }
      return;
    }

    if (existing) {
      existing.href = config.faviconUrl;
      return;
    }

    const link = document.createElement("link");
    link.rel = "icon";
    link.href = config.faviconUrl;
    document.head.appendChild(link);
  } catch {
    // ignore invalid local settings
  }
}

applyConfiguredFavicon();
window.addEventListener("storage", applyConfiguredFavicon);
window.addEventListener("smj-config-updated", applyConfiguredFavicon);

createRoot(document.getElementById("root")!).render(<App />);
