import React from "react";

export type AssetCategory = "hewan" | "buah" | "benda" | "kendaraan" | "bentuk";

export interface ShadowMatchAssetDef {
  id: string;
  name: string;
  category: AssetCategory;
  render: (props: { variant?: "color" | "shadow"; size?: number; className?: string }) => React.ReactNode;
}

// Helper to determine fill color
const getFill = (variant: "color" | "shadow" | undefined, defaultColor: string) => {
  return variant === "shadow" ? "#1a1a1a" : defaultColor;
};

// ── Hewan ──
const Gajah = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#9E9E9E")} d="M80 50c0-16.6-13.4-30-30-30S20 33.4 20 50v30h15V60h30v20h15V50z" />
    <circle cx="35" cy="45" r="5" fill={getFill(variant, "#424242")} />
    <path fill={getFill(variant, "#757575")} d="M80 50c5 0 15 10 15 25v15h-10V60h-5V50z" />
    <path fill={getFill(variant, "#E0E0E0")} d="M40 60c-5 0-10-5-10-10h5c0 2.8 2.2 5 5 5v5z" />
  </svg>
);

const Jerapah = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#FFB300")} d="M30 40c0-20 5-30 20-30s20 10 20 30v40H30V40z" />
    {variant !== "shadow" && (
      <>
        <circle cx="45" cy="50" r="4" fill="#8D6E63" />
        <circle cx="55" cy="65" r="5" fill="#8D6E63" />
        <circle cx="40" cy="70" r="3" fill="#8D6E63" />
        <circle cx="55" cy="40" r="3" fill="#8D6E63" />
        <circle cx="40" cy="25" r="2" fill="#424242" />
        <circle cx="60" cy="25" r="2" fill="#424242" />
      </>
    )}
  </svg>
);

const Kelinci = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#E0E0E0")} d="M30 50c0-11 9-20 20-20s20 9 20 20c0 16-9 40-20 40S30 66 30 50z" />
    <path fill={getFill(variant, "#E0E0E0")} d="M35 35c-5-10-10-25-5-25s10 10 15 20L35 35z" />
    <path fill={getFill(variant, "#E0E0E0")} d="M65 35c5-10 10-25 5-25s-10 10-15 20L65 35z" />
    {variant !== "shadow" && (
      <>
        <circle cx="40" cy="45" r="3" fill="#424242" />
        <circle cx="60" cy="45" r="3" fill="#424242" />
        <circle cx="50" cy="55" r="2" fill="#FF8A80" />
      </>
    )}
  </svg>
);

const Burung = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#03A9F4")} d="M20 50c0-16.6 13.4-30 30-30s30 13.4 30 30-13.4 30-30 30-30-13.4-30-30z" />
    <path fill={getFill(variant, "#FFC107")} d="M80 50l15-5-15-5v10z" />
    <path fill={getFill(variant, "#0288D1")} d="M20 50c-10 5-15 15-5 25C10 70 5 60 20 50z" />
    {variant !== "shadow" && <circle cx="65" cy="40" r="4" fill="#424242" />}
  </svg>
);

const Ikan = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#FF9800")} d="M20 50C20 30 40 20 60 50C40 80 20 70 20 50Z" />
    <path fill={getFill(variant, "#FF9800")} d="M20 50l-15-15v30z" />
    {variant !== "shadow" && <circle cx="50" cy="45" r="3" fill="#424242" />}
  </svg>
);

const Singa = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="40" fill={getFill(variant, "#8D6E63")} />
    <circle cx="50" cy="50" r="25" fill={getFill(variant, "#FFCA28")} />
    {variant !== "shadow" && (
      <>
        <circle cx="40" cy="45" r="3" fill="#424242" />
        <circle cx="60" cy="45" r="3" fill="#424242" />
        <path d="M45 60 Q 50 65 55 60" stroke="#424242" strokeWidth="2" fill="transparent" />
      </>
    )}
  </svg>
);

// ── Buah ──
const Apel = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#E53935")} d="M50 85c-20 0-35-15-35-35 0-15 10-25 25-25 5 0 10 5 10 5s5-5 10-5c15 0 25 10 25 25 0 20-15 35-35 35z" />
    <path fill={getFill(variant, "#795548")} d="M48 25c-5-10 0-20 0-20h4s5 10 0 20h-4z" />
    <path fill={getFill(variant, "#43A047")} d="M50 15c10-5 20 0 20 10-10 5-20 0-20-10z" />
  </svg>
);

const Pisang = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#FFEB3B")} d="M20 80c40 10 60-10 60-40 0 0-10 10-30 10S20 20 20 20C10 50 10 70 20 80z" />
    <path fill={getFill(variant, "#795548")} d="M15 85c5-5 10-5 10-5l-5-10c0 0-5 5-5 15z" />
  </svg>
);

const Jeruk = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="55" r="35" fill={getFill(variant, "#FF9800")} />
    {variant !== "shadow" && (
      <>
        <circle cx="35" cy="40" r="2" fill="#F57C00" />
        <circle cx="60" cy="70" r="2" fill="#F57C00" />
        <circle cx="45" cy="80" r="2" fill="#F57C00" />
      </>
    )}
    <path fill={getFill(variant, "#43A047")} d="M50 20c15-5 25 5 25 15-15 5-25-5-25-15z" />
  </svg>
);

const Anggur = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#795548")} d="M48 20c-5-10 0-20 0-20h4s5 10 0 20h-4z" />
    <circle cx="50" cy="30" r="12" fill={getFill(variant, "#9C27B0")} />
    <circle cx="35" cy="40" r="12" fill={getFill(variant, "#AB47BC")} />
    <circle cx="65" cy="40" r="12" fill={getFill(variant, "#AB47BC")} />
    <circle cx="50" cy="50" r="12" fill={getFill(variant, "#9C27B0")} />
    <circle cx="40" cy="65" r="12" fill={getFill(variant, "#BA68C8")} />
    <circle cx="60" cy="65" r="12" fill={getFill(variant, "#BA68C8")} />
    <circle cx="50" cy="80" r="12" fill={getFill(variant, "#CE93D8")} />
  </svg>
);

const Semangka = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#4CAF50")} d="M10 50 A 40 40 0 0 0 90 50 Z" />
    <path fill={getFill(variant, "#F44336")} d="M15 50 A 35 35 0 0 0 85 50 Z" />
    {variant !== "shadow" && (
      <>
        <circle cx="30" cy="60" r="2" fill="#212121" />
        <circle cx="50" cy="70" r="2" fill="#212121" />
        <circle cx="70" cy="60" r="2" fill="#212121" />
        <circle cx="40" cy="65" r="2" fill="#212121" />
        <circle cx="60" cy="65" r="2" fill="#212121" />
      </>
    )}
  </svg>
);

// ── Benda ──
const Buku = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#1976D2")} d="M10 20h40v60H10z" />
    <path fill={getFill(variant, "#2196F3")} d="M50 20h40v60H50z" />
    {variant !== "shadow" && (
      <>
        <path fill="#E3F2FD" d="M15 25h30v50H15z" />
        <path fill="#BBDEFB" d="M55 25h30v50H55z" />
        <path fill="#90CAF9" d="M20 35h20v4H20zm0 10h20v4H20zm40-10h20v4H60zm0 10h20v4H60z" />
      </>
    )}
  </svg>
);

const Sepatu = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#F44336")} d="M20 60c-10 0-10 10-10 20h70c10 0 10-10 10-20L70 40H40L20 60z" />
    <path fill={getFill(variant, "#424242")} d="M10 80h80v10H10z" />
    {variant !== "shadow" && (
      <>
        <path fill="#E0E0E0" d="M25 65l15-15h5L30 65h-5zm10 5l15-15h5L40 70h-5z" />
      </>
    )}
  </svg>
);

const Tas = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#9C27B0")} d="M20 40h60v50H20z" rx="10" />
    <path fill={getFill(variant, "#AB47BC")} d="M30 50h40v30H30z" rx="5" />
    <path fill="none" stroke={getFill(variant, "#7B1FA2")} strokeWidth="8" d="M30 40V20c0-10 40-10 40 0v20" />
  </svg>
);

const Bola = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="40" fill={getFill(variant, "#E0E0E0")} />
    {variant !== "shadow" && (
      <path fill="#424242" d="M50 10c0 0 20 20 0 40s-20 40 0 40c22 0 40-18 40-40S72 10 50 10z" />
    )}
  </svg>
);

// ── Kendaraan ──
const Mobil = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#E53935")} d="M10 50h80v20H10z" rx="5" />
    <path fill={getFill(variant, "#D32F2F")} d="M25 30h50v20H25z" rx="5" />
    {variant !== "shadow" && (
      <>
        <path fill="#81D4FA" d="M30 35h15v10H30zm25 0h15v10H55z" />
      </>
    )}
    <circle cx="25" cy="70" r="12" fill={getFill(variant, "#424242")} />
    <circle cx="75" cy="70" r="12" fill={getFill(variant, "#424242")} />
    {variant !== "shadow" && (
      <>
        <circle cx="25" cy="70" r="6" fill="#E0E0E0" />
        <circle cx="75" cy="70" r="6" fill="#E0E0E0" />
      </>
    )}
  </svg>
);

const Pesawat = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#E0E0E0")} d="M10 50 Q 50 40 90 50 Q 50 60 10 50 Z" />
    <path fill={getFill(variant, "#BDBDBD")} d="M30 50 L 50 20 L 60 50 Z" />
    <path fill={getFill(variant, "#9E9E9E")} d="M30 50 L 50 80 L 60 50 Z" />
    {variant !== "shadow" && (
      <>
        <circle cx="65" cy="50" r="2" fill="#424242" />
        <circle cx="70" cy="50" r="2" fill="#424242" />
        <circle cx="75" cy="50" r="2" fill="#424242" />
        <path fill="#81D4FA" d="M85 48 L 90 50 L 85 52 Z" />
      </>
    )}
  </svg>
);

const Kapal = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#FF5722")} d="M20 70 L 80 70 L 70 90 L 30 90 Z" />
    <path fill={getFill(variant, "#F5F5F5")} d="M35 50 L 65 50 L 65 70 L 35 70 Z" />
    <path fill={getFill(variant, "#E0E0E0")} d="M45 30 L 55 30 L 55 50 L 45 50 Z" />
    {variant !== "shadow" && (
      <>
        <circle cx="40" cy="80" r="4" fill="#BDBDBD" />
        <circle cx="50" cy="80" r="4" fill="#BDBDBD" />
        <circle cx="60" cy="80" r="4" fill="#BDBDBD" />
        <path fill="#81D4FA" d="M40 55 H 45 V 65 H 40 Z M 55 55 H 60 V 65 H 55 Z" />
      </>
    )}
  </svg>
);

const Sepeda = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="25" cy="65" r="15" fill="none" stroke={getFill(variant, "#424242")} strokeWidth="4" />
    <circle cx="75" cy="65" r="15" fill="none" stroke={getFill(variant, "#424242")} strokeWidth="4" />
    <path fill="none" stroke={getFill(variant, "#F44336")} strokeWidth="4" d="M25 65 L 45 35 L 75 65" />
    <path fill="none" stroke={getFill(variant, "#F44336")} strokeWidth="4" d="M45 35 L 60 65 L 25 65" />
    <path fill="none" stroke={getFill(variant, "#9E9E9E")} strokeWidth="4" d="M75 65 L 65 25" />
    <path fill="none" stroke={getFill(variant, "#9E9E9E")} strokeWidth="4" d="M25 65 L 20 25" />
    <path fill={getFill(variant, "#212121")} d="M60 20 H 70 V 25 H 60 Z M 15 20 H 25 V 25 H 15 Z" />
  </svg>
);

// ── Bentuk ──
const Bintang = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <polygon fill={getFill(variant, "#FFEB3B")} points="50,10 61,39 92,39 67,58 76,88 50,70 24,88 33,58 8,39 39,39" />
  </svg>
);

const Hati = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path fill={getFill(variant, "#E91E63")} d="M50 85 C 50 85, 10 55, 10 30 A 20 20 0 0 1 50 30 A 20 20 0 0 1 90 30 C 90 55, 50 85, 50 85 Z" />
  </svg>
);

const Lingkaran = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="40" fill={getFill(variant, "#4CAF50")} />
  </svg>
);

const Segitiga = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <polygon fill={getFill(variant, "#2196F3")} points="50,15 90,85 10,85" />
  </svg>
);

const Persegi = ({ variant, size = 64, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <rect x="15" y="15" width="70" height="70" rx="5" fill={getFill(variant, "#FF9800")} />
  </svg>
);


export const SHADOW_MATCH_OBJECTS: ShadowMatchAssetDef[] = [
  // Hewan
  { id: "gajah", name: "Gajah", category: "hewan", render: Gajah },
  { id: "jerapah", name: "Jerapah", category: "hewan", render: Jerapah },
  { id: "kelinci", name: "Kelinci", category: "hewan", render: Kelinci },
  { id: "burung", name: "Burung", category: "hewan", render: Burung },
  { id: "ikan", name: "Ikan", category: "hewan", render: Ikan },
  { id: "singa", name: "Singa", category: "hewan", render: Singa },
  // Buah
  { id: "apel", name: "Apel", category: "buah", render: Apel },
  { id: "pisang", name: "Pisang", category: "buah", render: Pisang },
  { id: "jeruk", name: "Jeruk", category: "buah", render: Jeruk },
  { id: "anggur", name: "Anggur", category: "buah", render: Anggur },
  { id: "semangka", name: "Semangka", category: "buah", render: Semangka },
  // Benda
  { id: "buku", name: "Buku", category: "benda", render: Buku },
  { id: "sepatu", name: "Sepatu", category: "benda", render: Sepatu },
  { id: "tas", name: "Tas", category: "benda", render: Tas },
  { id: "bola", name: "Bola", category: "benda", render: Bola },
  // Kendaraan
  { id: "mobil", name: "Mobil", category: "kendaraan", render: Mobil },
  { id: "pesawat", name: "Pesawat", category: "kendaraan", render: Pesawat },
  { id: "kapal", name: "Kapal", category: "kendaraan", render: Kapal },
  { id: "sepeda", name: "Sepeda", category: "kendaraan", render: Sepeda },
  // Bentuk
  { id: "bintang", name: "Bintang", category: "bentuk", render: Bintang },
  { id: "hati", name: "Hati", category: "bentuk", render: Hati },
  { id: "lingkaran", name: "Lingkaran", category: "bentuk", render: Lingkaran },
  { id: "segitiga", name: "Segitiga", category: "bentuk", render: Segitiga },
  { id: "persegi", name: "Persegi", category: "bentuk", render: Persegi },
];
