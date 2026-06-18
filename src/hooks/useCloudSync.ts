import { useState, useEffect, useCallback } from "react";
import { googleAuthService } from "../lib/cloud/GoogleAuthService";
import { cloudSaveService } from "../lib/cloud/CloudSaveService";
import { storageService } from "../lib/storage/service";
import type { GoogleUser, SyncStatus, CloudSaveMeta } from "../lib/cloud/types";
import { useGameStore } from "../lib/storage";

export function useCloudSync() {
  const { store, updateProfile, activeProfile, bumpVersion } = useGameStore();

  const [user, setUser] = useState<GoogleUser | null>(googleAuthService.getUser());
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [cloudMeta, setCloudMeta] = useState<CloudSaveMeta | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Read initial connection state from profile settings
  useEffect(() => {
    if (activeProfile?.settings.googleConnected && !user) {
      // In a real app, this would be `googleAuthService.silentLogin()`
      // For the mock, we just trigger a normal login to hydrate the user state.
      // To prevent constant popups, we'll only do it if explicitly requested by the user,
      // so for the mock we'll leave it as is unless they click "Connect".
    }
  }, [activeProfile, user]);

  const connect = async () => {
    setStatus("syncing");
    setErrorMsg(null);
    try {
      const gUser = await googleAuthService.login();
      setUser(gUser);
      
      if (activeProfile) {
        updateProfile(activeProfile.id, {
          settings: { ...activeProfile.settings, googleConnected: true }
        });
      }

      // Check if there is an existing save in the cloud
      const meta = await cloudSaveService.checkCloudSave();
      if (meta) {
        setCloudMeta(meta);
        setStatus("conflict"); // Needs user decision: restore or overwrite
      } else {
        // First time, backup local data automatically
        await backup();
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || "Failed to connect to Google");
    }
  };

  const disconnect = async () => {
    setStatus("syncing");
    await googleAuthService.logout();
    setUser(null);
    setStatus("idle");
    setCloudMeta(null);
    if (activeProfile) {
      updateProfile(activeProfile.id, {
        settings: { ...activeProfile.settings, googleConnected: false }
      });
    }
  };

  const backup = async () => {
    setStatus("syncing");
    setErrorMsg(null);
    try {
      // Push the entire store cache using the singleton storage service
      const rawStore = storageService.load();
      
      await cloudSaveService.pushBackup(rawStore);
      
      const newMeta = await cloudSaveService.checkCloudSave();
      setCloudMeta(newMeta);
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || "Gagal mencadangkan data.");
    }
  };

  const restore = async () => {
    setStatus("syncing");
    setErrorMsg(null);
    try {
      await cloudSaveService.pullRestore();
      bumpVersion(); // force React to re-render all components
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || "Gagal memulihkan data.");
    }
  };

  return {
    user,
    status,
    cloudMeta,
    errorMsg,
    connect,
    disconnect,
    backup,
    restore,
  };
}
