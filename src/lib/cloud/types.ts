import type { VersionedStore } from "../storage/types";

export type SyncStatus = "idle" | "syncing" | "success" | "error" | "conflict";

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface CloudSaveMeta {
  lastSyncedAt: string; // ISO string
  deviceName: string;
  totalMissionsCompleted: number;
}

export interface CloudSaveData {
  meta: CloudSaveMeta;
  store: VersionedStore;
}
