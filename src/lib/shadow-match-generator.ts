import { DifficultyId } from "@/types";
import { shuffleArray } from "./utils";

export interface MainObject {
  id: string; // The key in SVG_REGISTRY (e.g. 'cat', 'car')
  name: string;
  parts: string[]; // Possible parts that can be missing
}

export interface ShadowChoice {
  id: string;
  objectId: string; // The key in SVG_REGISTRY
  missingPart: string | null; // The part that is missing (null if correct)
  isCorrect: boolean;
}

export interface ShadowMatchQuestion {
  id: string;
  difficulty: DifficultyId;
  mainObject: MainObject;
  correctShadow: ShadowChoice;
  shuffledChoices: ShadowChoice[];
  explanation: string;
}

export const SVG_OBJECT_DEFS: MainObject[] = [
  { id: "cat", name: "Kucing", parts: ["tail", "leftEar", "rightEar", "whiskers"] },
  { id: "car", name: "Mobil", parts: ["frontWheel", "backWheel", "window", "bumper"] },
  { id: "house", name: "Rumah", parts: ["chimney", "door", "window", "roofDetail"] },
  { id: "flower", name: "Bunga", parts: ["leftLeaf", "rightLeaf", "leftPetal", "rightPetal"] },
  { id: "rocket", name: "Roket", parts: ["leftFin", "rightFin", "window", "flame"] },
];

export function getDifficultyChoiceCount(difficulty: DifficultyId): number {
  switch (difficulty) {
    case "tk": return 3;
    case "sd-bawah": return 4;
    case "sd-atas": return 4;
    case "smp": return 5;
    case "sma": return 6;
    case "universitas": return 6;
    default: return 4;
  }
}

export function generateShadowMatchQuestion(difficulty: DifficultyId): ShadowMatchQuestion {
  // 1. Pilih 1 objek utama secara acak
  const shuffledObjects = shuffleArray([...SVG_OBJECT_DEFS]);
  const mainObject = shuffledObjects[0];

  // 2. Tentukan jumlah pilihan berdasarkan difficulty
  const choiceCount = getDifficultyChoiceCount(difficulty);

  // 3. Buat correct shadow (utuh, tidak ada bagian yang hilang)
  const correctShadow: ShadowChoice = {
    id: `choice-correct-${mainObject.id}`,
    objectId: mainObject.id,
    missingPart: null,
    isCorrect: true,
  };

  // 4. Pilih distractor
  let distractorChoices: ShadowChoice[] = [];
  
  if (difficulty === "tk" || difficulty === "sd-bawah") {
    // Mudah: Distractor adalah objek yang benar-benar berbeda
    const differentObjects = shuffledObjects.slice(1);
    for (let i = 0; i < choiceCount - 1; i++) {
      distractorChoices.push({
        id: `choice-diff-${differentObjects[i].id}`,
        objectId: differentObjects[i].id,
        missingPart: null, // Utuh tapi bentuknya beda total
        isCorrect: false,
      });
    }
  } else if (difficulty === "sd-atas" || difficulty === "smp") {
    // Sedang: Campuran antara objek beda dan objek sama dengan bagian hilang
    const differentObj = shuffledObjects[1];
    distractorChoices.push({
      id: `choice-diff-${differentObj.id}`,
      objectId: differentObj.id,
      missingPart: null,
      isCorrect: false,
    });
    
    // Sisanya ambil objek yang sama tapi ada bagian yang hilang
    const partsToHide = shuffleArray([...mainObject.parts]);
    for (let i = 0; i < choiceCount - 2; i++) {
      distractorChoices.push({
        id: `choice-missing-${partsToHide[i]}`,
        objectId: mainObject.id,
        missingPart: partsToHide[i],
        isCorrect: false,
      });
    }
  } else {
    // Susah (SMA / Universitas): SEMUA distractor adalah objek yang persis sama, hanya beda bagian yang hilang!
    // Ini sangat mirip dengan gambar referensi di mana semua pilihan adalah hewan yang sama tapi ada 1 hal kecil yang hilang.
    const partsToHide = shuffleArray([...mainObject.parts]);
    for (let i = 0; i < choiceCount - 1; i++) {
      // Jika bagian yang bisa dihilangkan kurang dari jumlah opsi, kita akan ulang partnya
      // (Pada kenyataannya setiap objek punya 4 part. Untuk 6 pilihan (1 benar, 5 distractor), 
      // part ke-5 bisa jadi rotasi atau duplikat part tapi secara default kita ambil berputar).
      const partIndex = i % mainObject.parts.length;
      distractorChoices.push({
        id: `choice-missing-${partsToHide[partIndex]}-${i}`,
        objectId: mainObject.id,
        missingPart: partsToHide[partIndex],
        isCorrect: false,
      });
    }
  }

  const allChoices = [correctShadow, ...distractorChoices];

  // 5. Shuffle pilihan menggunakan Fisher-Yates
  const shuffledChoices = createShuffledChoices(allChoices);

  return {
    id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    difficulty,
    mainObject,
    correctShadow,
    shuffledChoices,
    explanation: `Bentuk yang tepat memiliki semua detail lengkap. Perhatikan bagian yang hilang pada bayangan lain!`,
  };
}

export function createShuffledChoices(choices: ShadowChoice[]): ShadowChoice[] {
  return shuffleArray([...choices]);
}

export function validateShadowMatchAnswer(question: ShadowMatchQuestion, selectedChoiceId: string): boolean {
  // Validator menggunakan pencocokan ID eksplisit
  const selectedChoice = question.shuffledChoices.find(c => c.id === selectedChoiceId);
  if (!selectedChoice) return false;
  
  return selectedChoice.isCorrect;
}
