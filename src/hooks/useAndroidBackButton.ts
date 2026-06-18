/**
 * Android Back Button Handler
 * Uses Capacitor App plugin for back button, with fallback for web
 *
 * Priority:
 * 1. Close modals/popups
 * 2. Mini-game screens: delegate to internal handler via ref
 * 3. Internal screens: navigate back
 * 4. Home screen: double-press to exit
 */

import { useEffect, useRef, useCallback } from "react";
import { App } from "@capacitor/app";
import type { ScreenId } from "@/types";

interface BackButtonConfig {
  screen: ScreenId;
  hasModal: boolean;
  onBack: () => void;
  onExitConfirm?: () => void;
  homeToastActive?: boolean;
}

// Track exit press timing for "press again to exit" on home
let lastBackPress = 0;
const EXIT_DELAY = 2000; // 2 seconds

export function useAndroidBackButton(config: BackButtonConfig) {
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    let removeListener: { remove: () => void } | null = null;
    let cleanupBrowser: (() => void) | null = null;

    const tryCapacitorBack = async () => {
      try {
        // Try to use Capacitor App plugin
        removeListener = await App.addListener("backButton", () => {
          const cfg = configRef.current;

          // 1. If modal/popup is open, close it first
          if (cfg.hasModal) {
            cfg.onBack();
            return;
          }

          // 2. Handle back based on current screen
          switch (cfg.screen) {
            case "play":
              // Confirm before leaving mission
              if (cfg.onExitConfirm) {
                cfg.onExitConfirm();
              } else {
                cfg.onBack();
              }
              break;

            case "minigame-hitung":
            case "minigame-pola":
            case "minigame-ingatan":
            case "minigame-adab":
            case "battle":
              // Mini-game screens handle their own back via internal state
              cfg.onBack();
              break;

            case "home":
              // Double-press to exit
              const now = Date.now();
              if (cfg.homeToastActive) {
                // Already showing toast — this is the second press
                App.exitApp();
              } else if (now - lastBackPress < EXIT_DELAY) {
                // Fast double-press without waiting for toast
                App.exitApp();
              } else {
                lastBackPress = now;
                cfg.onBack(); // triggers toast
              }
              break;

            case "result":
            case "badges":
            case "stats":
            case "settings":
            case "privacy":
            case "daily-missions":
            case "parent":
            case "map":
            case "profile-select":
              cfg.onBack();
              break;

            default:
              cfg.onBack();
          }
        });
      } catch (e) {
        // Capacitor not available, use browser fallback
        console.log("[BackButton] Capacitor not available, using browser fallback");
        cleanupBrowser = setupBrowserBack();
      }
    };

    const setupBrowserBack = (): (() => void) => {
      const handlePopState = (e: PopStateEvent) => {
        const cfg = configRef.current;
        if (cfg.hasModal) {
          cfg.onBack();
          e.preventDefault();
          window.history.pushState(null, "", window.location.href);
          return;
        }

        if (cfg.screen === "home") {
          const now = Date.now();
          if (cfg.homeToastActive || now - lastBackPress < EXIT_DELAY) {
            return; // Let browser handle exit (close tab)
          }
          lastBackPress = now;
          cfg.onBack();
          e.preventDefault();
          window.history.pushState(null, "", window.location.href);
          return;
        }

        cfg.onBack();
        e.preventDefault();
        window.history.pushState(null, "", window.location.href);
      };

      window.addEventListener("popstate", handlePopState);
      window.history.pushState(null, "", window.location.href);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    };

    tryCapacitorBack();

    return () => {
      if (removeListener) {
        removeListener.remove();
      }
      if (cleanupBrowser) {
        cleanupBrowser();
      }
    };
  }, []);
}

/**
 * Simple hook to manage the back button stack
 */
export function useBackButtonStack() {
  const stackRef = useRef<Array<{ screen: ScreenId; onBack: () => void }>>([]);

  const push = useCallback((screen: ScreenId, onBack: () => void) => {
    stackRef.current.push({ screen, onBack });
  }, []);

  const pop = useCallback(() => {
    stackRef.current.pop();
  }, []);

  const handleBack = useCallback(() => {
    const current = stackRef.current[stackRef.current.length - 1];
    if (current) {
      current.onBack();
    }
  }, []);

  return { push, pop, handleBack, stackRef };
}
