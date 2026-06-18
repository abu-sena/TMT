import type { CloudSaveData, CloudSaveMeta } from "./types";
import { storageService } from "../storage/service";
import type { VersionedStore } from "../storage/types";

const MOCK_CLOUD_KEY = "mock_google_drive_save";

/**
 * Placeholder for Google Drive AppData or Firebase Cloud Firestore sync.
 * Simulates network latency.
 */
class CloudSaveServiceImpl {
  
  /**
   * Checks if there's a save in the cloud and returns its metadata.
   */
  async checkCloudSave(): Promise<CloudSaveMeta | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const raw = localStorage.getItem(MOCK_CLOUD_KEY);
        if (!raw) {
          resolve(null);
          return;
        }
        try {
          const data: CloudSaveData = JSON.parse(raw);
          resolve(data.meta);
        } catch {
          resolve(null);
        }
      }, 600);
    });
  }

  /**
   * Pushes the current local VersionedStore to the cloud.
   */
  async pushBackup(store: VersionedStore): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Calculate simple stats for metadata
          const totalCompleted = store.data.profiles.reduce((sum, p) => sum + p.totalMissionsCompleted, 0);
          
          const cloudData: CloudSaveData = {
            meta: {
              lastSyncedAt: new Date().toISOString(),
              deviceName: "My Device",
              totalMissionsCompleted: totalCompleted,
            },
            store: store,
          };
          localStorage.setItem(MOCK_CLOUD_KEY, JSON.stringify(cloudData));
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 1200); // Simulate upload time
    });
  }

  /**
   * Pulls the store from the cloud and overwrites the local storage.
   */
  async pullRestore(): Promise<VersionedStore> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const raw = localStorage.getItem(MOCK_CLOUD_KEY);
        if (!raw) {
          reject(new Error("No cloud save found"));
          return;
        }
        try {
          const data: CloudSaveData = JSON.parse(raw);
          // Overwrite local db with the downloaded data
          storageService.importDebugSnapshot({
            exportedAt: new Date().toISOString(),
            appName: "TMT (Cloud Restore)",
            schemaVersion: data.store.version,
            store: data.store,
          }, true);
          resolve(data.store);
        } catch (e) {
          reject(e);
        }
      }, 1500); // Simulate download time
    });
  }
}

export const cloudSaveService = new CloudSaveServiceImpl();
