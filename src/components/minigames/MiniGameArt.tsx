import type { ReactNode } from "react";
import { preload } from "react-dom";
import { cn } from "@/lib/utils";
import { getPuzzleObject } from "@/lib/puzzle-objects";

const assetRoot = `${import.meta.env.BASE_URL}assets/field-guide/minigames/`;
const atlases = {
  memory: [4, 3],
  props: [4, 3],
  nature: [3, 2],
  path: [3, 2],
  catalog: [4, 4],
  puzzles: [4, 4],
} as const;

type Atlas = keyof typeof atlases;

export function preloadMiniGameSprites(...names: Atlas[]) {
  for (const name of names) preload(`${assetRoot}${name}.webp`, { as: "image" });
}

export function MiniGameSprite({ atlas, index, label, className }: {
  atlas: Atlas;
  index: number;
  label?: string;
  className?: string;
}) {
  const [columns, rows] = atlases[atlas];
  return (
    <span
      className={cn("mini-game-sprite", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label || undefined}
      style={{
        backgroundImage: `url("${assetRoot}${atlas}.webp")`,
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: `${(index % columns) * 100 / (columns - 1)}% ${Math.floor(index / columns) * 100 / (rows - 1)}%`,
      }}
    />
  );
}

export function PuzzleObjectArt({ objectId, className, silhouette = false, rotation = 0, mirrored = false }: {
  objectId: string;
  className?: string;
  silhouette?: boolean;
  rotation?: number;
  mirrored?: boolean;
}) {
  const object = getPuzzleObject(objectId);
  if (!object) return null;
  const [columns, rows] = atlases.puzzles;
  return (
    <span
      className={cn("mini-game-sprite", className)}
      role="img"
      aria-label={silhouette
        ? `Siluet ${object.name}${rotation ? `, diputar ${Math.abs(rotation)} derajat` : ""}${mirrored ? ", dicerminkan" : ""}`
        : object.name}
      style={{
        backgroundImage: `url("${assetRoot}puzzles-v2.webp")`,
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: `${(object.index % columns) * 100 / (columns - 1)}% ${Math.floor(object.index / columns) * 100 / (rows - 1)}%`,
        filter: silhouette ? "brightness(0)" : undefined,
        transform: `rotate(${rotation}deg) scaleX(${mirrored ? -1 : 1})`,
      }}
    />
  );
}

const catalogSlots: Record<string, number> = {
  "hitung-kilat": 0, hitung: 0,
  "pola-kilat": 1, pola: 1,
  "ingatan-cepat": 2, ingatan: 2,
  "cari-berbeda": 3,
  "kode-warna": 4, "color-code": 4,
  "cocok-bayangan": 5,
  "ubah-posisi": 6,
  "jalur-tercepat": 7,
  "detektif-petunjuk": 8,
  "tebak-aturan": 9,
  "pilih-kesimpulan": 10,
  "benar-atau-salah": 11, "benar-salah": 11,
  "rantai-warna": 12,
  "jalur-angka": 13,
};

export function MiniGameIcon({ gameId, fallback, className }: {
  gameId: string;
  fallback?: ReactNode;
  className?: string;
}) {
  const index = catalogSlots[gameId];
  if (index === undefined) return <span className={className} aria-hidden="true">{fallback}</span>;
  return <MiniGameSprite atlas="catalog" index={index} className={className} />;
}

const pathTiles: Record<string, { index: number; label: string }> = {
  "🐒": { index: 0, label: "Monyet, titik awal" },
  "🍌": { index: 1, label: "Pisang, tujuan" },
  "🪵": { index: 2, label: "Batang kayu, rintangan" },
  "🐾": { index: 3, label: "Jalur terbuka" },
};

export function getPathTileLabel(value: string) {
  return pathTiles[value]?.label ?? value;
}

export function PathTileArt({ value, className }: { value: string; className?: string }) {
  const tile = pathTiles[value];
  if (!tile) return null;
  return <MiniGameSprite atlas="path" index={tile.index} className={className} />;
}
