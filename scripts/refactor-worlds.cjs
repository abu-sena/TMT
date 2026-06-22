const fs = require('fs');

let content = fs.readFileSync('src/data/worlds.ts', 'utf-8');

// Replace categoryFocus with backgroundTheme
content = content.replace(/categoryFocus:\s*\[.*?\],\n/g, 'backgroundTheme: "default",\n');

// Rename some worlds to be more generic adventure themes
const replacements = [
  // TK
  ["Taman Adab Ceria", "Hutan Ceria"],
  ["tk-taman-adab", "tk-hutan-ceria"],
  ["Kebun Angka", "Kebun Petualang"],
  ["tk-kebun-angka", "tk-kebun-petualang"],
  ["Pulau Bentuk", "Pulau Bentuk (Visual)"], // just simple replace
  ["Rumah Pola", "Rumah Misteri"],
  ["tk-rumah-pola", "tk-rumah-misteri"],
  ["Galeri Warna", "Galeri Keajaiban"],
  ["tk-galeri-warna", "tk-galeri-keajaiban"],

  // SD Bawah
  ["Taman Adab", "Taman Pelangi"],
  ["sdk-taman-adab", "sdk-taman-pelangi"],
  ["Kota Angka", "Kota Penjelajah"],
  ["sdk-kota-angka", "sdk-kota-penjelajah"],
  ["Jembatan Pola", "Jembatan Petualang"],
  ["sdk-jembatan-pola", "sdk-jembatan-petualang"],
  ["Rumah Ingatan", "Rumah Teka-teki"],
  ["sdk-rumah-ingatan", "sdk-rumah-tekateki"],
  ["Lapangan Kebaikan", "Lembah Fokus"],
  ["sdk-lapangan-kebaikan", "sdk-lembah-fokus"],

  // SD Atas
  ["Kota Numerasi", "Kota Pintar"],
  ["sdm-kota-numerasi", "sdm-kota-pintar"],
  ["Menara Pola", "Menara Puncak"],
  ["sdm-menara-pola", "sdm-menara-puncak"],
  ["Gua Ingatan", "Gua Misteri"],
  ["sdm-gua-ingatan", "sdm-gua-misteri"],
  ["Lembah Logika", "Lembah Awan"],
  ["sdm-lembah-logika", "sdm-lembah-awan"],
  ["Kampung Amanah", "Kampung Damai"],
  ["sdm-kampung-amanah", "sdm-kampung-damai"],

  // SMP
  ["Benteng Logika", "Benteng Kokoh"],
  ["smp-benteng-logika", "smp-benteng-kokoh"],
  ["Majelis Musyawarah", "Markas Strategi"],
  ["smp-majelis-musyawarah", "smp-markas-strategi"],
  ["Laboratorium Sistem", "Lab Sains"],
  ["smp-laboratorium-sistem", "smp-lab-sains"],
  ["Pasar Amanah", "Pasar Ramai"],
  ["smp-pasar-amanah", "smp-pasar-ramai"],
  ["Menara Strategi", "Menara Petualang"],
  ["smp-menara-strategi", "smp-menara-petualang"],

  // SMA
  ["Kota Kepemimpinan", "Kota Modern"],
  ["sma-kota-kepemimpinan", "sma-kota-modern"],
  ["Dewan Musyawarah", "Dewan Pertemuan"],
  ["sma-dewan-musyawarah", "sma-dewan-pertemuan"],
  ["Sistem Peradaban", "Sistem Kota"],
  ["sma-sistem-peradaban", "sma-sistem-kota"],
  ["Arena Argumen", "Arena Pengetahuan"],
  ["sma-arena-argumen", "sma-arena-pengetahuan"],
  ["Gerbang Mastermind", "Gerbang Utama"],
  ["sma-gerbang-mastermind", "sma-gerbang-utama"],

  // Univ
  ["Akademi Analisis", "Akademi Puncak"],
  ["univ-akademi-analisis", "univ-akademi-puncak"],
  ["Dewan Etika", "Dewan Cendekia"],
  ["univ-dewan-etika", "univ-dewan-cendekia"],
  ["Laboratorium Sistem Kompleks", "Pusat Riset"],
  ["univ-lab-sistem-kompleks", "univ-pusat-riset"],
  ["Forum Kepemimpinan", "Forum Elit"],
  ["univ-forum-kepemimpinan", "univ-forum-elit"],
  ["Puncak Mastermind", "Puncak Mastermind"],
];

for (const [from, to] of replacements) {
  // Global replace
  content = content.split(from).join(to);
}

// Map backgrounds
content = content.replace(/backgroundTheme: "default"/g, 'backgroundTheme: "forest"'); // Just set all to forest for now, or map it.

// Fix STAGE_DISTRIBUTIONS to just have { worldId, count }
// We can actually just redefine STAGE_DISTRIBUTIONS manually, or let it be but change the interface.
content = content.replace(/export interface StageDistribution \{[\s\S]*?\}/, `export interface StageDistribution {
  count: number;
  worldId: string;
}`);

// For the STAGE_DISTRIBUTIONS object, we need to strip 'category'
content = content.replace(/\{ category: "[^"]+", count: (\d+), worldId: "([^"]+)" \},?/g, '{ count: $1, worldId: "$2" },');

fs.writeFileSync('src/data/worlds.ts', content, 'utf-8');
console.log('Done refactoring worlds.ts');
