/**
 * Battle — battle utilities
 */
import type {
  BattlePlayer,
  BattleSession,
  BattleRound,
  BattleTurn,
  BattleAward,
  BattleMode,
  DifficultyId,
  Profile,
} from "@/types";

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Rotate order by roundIndex: round 0 = initial, round 1 = first rotation, etc. */
export function rotateOrder(order: string[], roundIndex: number): string[] {
  const n = order.length;
  const rot = roundIndex % n;
  return [...order.slice(rot), ...order.slice(0, rot)];
}

/** Build all round orders from initial order */
export function buildRoundOrders(initialOrder: string[], roundCount: number): string[][] {
  return Array.from({ length: roundCount }, (_, i) => rotateOrder(initialOrder, i));
}

/** Determine game type for a round */
export function getRoundGameType(roundIndex: number, battleMode: BattleMode): "hitung" | "pola" | "adab" | "ingatan" {
  if (battleMode === "hitung") return "hitung";
  if (battleMode === "pola") return "pola";
  if (battleMode === "adab") return "adab";
  if (battleMode === "ingatan") return "ingatan";
  if (battleMode === "boss-duel") return "hitung"; // Boss uses multi-step, default to hitung for timer
  if (battleMode === "family-challenge") {
    // Family cycles through all types
    const types: Array<"hitung" | "pola" | "adab" | "ingatan"> = ["hitung", "pola", "adab", "ingatan"];
    return types[roundIndex % 4];
  }
  // Campuran: cycle through types
  const types: Array<"hitung" | "pola" | "adab" | "ingatan"> = ["hitung", "pola", "adab", "ingatan"];
  return types[roundIndex % 4];
}

/** Get timer seconds for a difficulty */
export function getBattleTimer(gameType: "hitung" | "pola" | "adab" | "ingatan" | "boss-duel", difficulty: DifficultyId): number {
  const timers: Record<string, Record<string, number>> = {
    hitung: { tk: 10, "sd-bawah": 7, "sd-atas": 5, smp: 5, sma: 5, universitas: 5 },
    pola: { tk: 10, "sd-bawah": 7, "sd-atas": 5, smp: 5, sma: 5, universitas: 5 },
    adab: { tk: 12, "sd-bawah": 10, "sd-atas": 8, smp: 8, sma: 8, universitas: 10 },
    ingatan: { tk: 8, "sd-bawah": 6, "sd-atas": 5, smp: 5, sma: 4, universitas: 4 },
    "boss-duel": { tk: 15, "sd-bawah": 12, "sd-atas": 10, smp: 10, sma: 8, universitas: 8 },
  };
  return timers[gameType]?.[difficulty] ?? 7;
}

/** Get option count for a difficulty */
export function getBattleOptionCount(difficulty: DifficultyId): number {
  if (difficulty === "tk") return 4;
  if (difficulty === "sd-bawah") return 5;
  return 6;
}

// ─── Hitung question generator ───

export interface HitungQuestion {
  type: "hitung";
  a: number;
  b: number;
  op: string;
  answer: number;
  display: string;
}

export function generateHitungQuestion(difficulty: DifficultyId): HitungQuestion {
  const isTK = difficulty === "tk";
  const maxAdd = isTK ? 10 : difficulty === "sd-bawah" ? 30 : 100;
  const maxSub = isTK ? 10 : difficulty === "sd-bawah" ? 30 : 100;
  const allowMul = !isTK;
  const allowDiv = difficulty !== "tk" && difficulty !== "sd-bawah";

  const ops: string[] = ["+", "-"];
  if (allowMul) ops.push("×");
  if (allowDiv) ops.push("÷");

  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, ans: number;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * maxAdd) + 1;
      b = Math.floor(Math.random() * maxAdd) + 1;
      ans = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * maxSub) + Math.floor(maxSub / 2);
      b = Math.floor(Math.random() * (a - 1)) + 1;
      ans = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * (isTK ? 5 : 10)) + 2;
      b = Math.floor(Math.random() * (isTK ? 3 : 10)) + 2;
      ans = a * b;
      break;
    case "÷":
      b = Math.floor(Math.random() * 8) + 2;
      ans = Math.floor(Math.random() * 10) + 2;
      a = b * ans;
      break;
    default:
      a = 1; b = 1; ans = 2;
  }

  return {
    type: "hitung",
    a, b, op,
    answer: ans,
    display: `${a} ${op} ${b} = ?`,
  };
}

export function generateHitungChoices(answer: number, count: number): number[] {
  const choices = new Set<number>();
  choices.add(answer);
  while (choices.size < count) {
    const offset = Math.floor(Math.random() * Math.max(4, Math.floor(answer * 0.3))) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const d = Math.max(0, answer + sign * offset);
    choices.add(d);
  }
  return shuffleArray([...choices]);
}

// ─── Pola question generator ───

export interface PolaQuestion {
  type: "pola";
  sequence: string[];
  answer: string;
  display: string;
}

const POLA_EMOJIS = [
  ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠"],
  ["⭐", "🔷", "🔶", "💎", "🌙", "☀️"],
  ["🍎", "🍌", "🍉", "🍇", "🍓", "🍒"],
  ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼"],
];

export function generatePolaQuestion(difficulty: DifficultyId): PolaQuestion {
  const set = POLA_EMOJIS[Math.floor(Math.random() * POLA_EMOJIS.length)];
  const a = set[0], b = set[1];

  // For TK: simple ABAB, for higher: various patterns
  const patternType = difficulty === "tk" ? "ABAB" :
    ["ABAB", "AAB", "ABC"][Math.floor(Math.random() * 3)];

  let sequence: string[], answer: string;
  if (patternType === "ABAB") {
    sequence = [a, b, a, b];
    answer = a;
  } else if (patternType === "AAB") {
    sequence = [a, a, b, a, a];
    answer = b;
  } else {
    const c = set[2];
    sequence = [a, b, c, a, b];
    answer = c;
  }

  return {
    type: "pola",
    sequence,
    answer,
    display: sequence.join(" ") + " ?",
  };
}

export function generatePolaChoices(answer: string, count: number): string[] {
  const allEmojis = POLA_EMOJIS.flat();
  const choices = new Set<string>();
  choices.add(answer);
  while (choices.size < count) {
    const e = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    choices.add(e);
  }
  return shuffleArray([...choices]);
}

// ─── Adab question generator ───

export interface AdabQuestion {
  type: "adab";
  situation: string;
  options: string[];
  bestIndex: number;
  acceptableIndex?: number;
  explanation: string;
  emoji: string;
}

const ADAB_BATTLE_QUESTIONS: AdabQuestion[] = [
  {
    type: "adab",
    situation: "Temanmu lupa membawa pensil. Apa sikap terbaik?",
    options: ["Meminjamkan dengan senang hati", "Mengejeknya", "Diam saja pura-pura tidak tahu", "Mengambil pensil orang lain untuknya", "Memarahinya karena lalai", "Menyembunyikan pensilnya"],
    bestIndex: 0,
    explanation: "Menolong teman adalah akhlak yang baik. Kita belajar peduli dan tidak mengejek orang yang sedang kesulitan.",
    emoji: "✏️",
  },
  {
    type: "adab",
    situation: "Kamu melihat sampah di halaman masjid. Apa yang kamu lakukan?",
    options: ["Memungut dan membuangnya", "Pura-pura tidak lihat", "Menyuruh orang lain", "Menendangnya ke selokan", "Meninggalkan masjid saja", "Melapor tapi tidak membersihkan"],
    bestIndex: 0,
    explanation: "Kebersihan sebagian dari iman. Menjaga kebersihan rumah Allah adalah bentuk kecintaan kita.",
    emoji: "🕌",
  },
  {
    type: "adab",
    situation: "Adikmu tidak sengaja memecahkan gelas. Reaksimu?",
    options: ["Menghibur dan membantu membersihkan", "Memarahinya dengan keras", "Melaporkan sambil berteriak", "Memukulnya pelan", "Menyuruhnya bersihkan sendiri", "Mengabaikannya"],
    bestIndex: 0,
    acceptableIndex: 4,
    explanation: "Memaafkan dan membantu adalah cerminan kasih sayang. Allah Maha Pemaaf.",
    emoji: "💔",
  },
  {
    type: "adab",
    situation: "Kamu tidak sengaja menyenggol teman hingga bukunya jatuh.",
    options: ["Minta maaf dan bantu memungut", "Langsung pergi", "Tertawa menganggapnya lucu", "Menyalahkan teman lain", "Diam pura-pura tidak sengaja", "Membentaknya"],
    bestIndex: 0,
    explanation: "Meminta maaf adalah tanda keberanian. Segera minta maaf jika berbuat salah.",
    emoji: "📚",
  },
  {
    type: "adab",
    situation: "Ibu sedang lelah setelah bekerja. Apa yang kamu lakukan?",
    options: ["Membantu pekerjaan rumah", "Bermain game terus", "Meminta uang jajan", "Menyuruh ibu masak", "Mengeluh rumah berantakan", "Pergi bermain ke luar"],
    bestIndex: 0,
    explanation: "Berbakti kepada orang tua adalah kewajiban. Ridha Allah ada pada ridha orang tua.",
    emoji: "👩",
  },
  {
    type: "adab",
    situation: "Kamu dapat nilai bagus dan dipuji guru. Sikapmu?",
    options: ["Bersyukur, tidak sombong", "Menyombongkan diri", "Merendahkan teman", "Bilang karena beruntung", "Diam tidak peduli", "Paksa minta hadiah"],
    bestIndex: 0,
    explanation: "Kepintaran adalah karunia Allah. Jangan sombong.",
    emoji: "🏆",
  },
  {
    type: "adab",
    situation: "Temanmu sedih karena mainannya hilang.",
    options: ["Menghibur dan membantu mencari", "Mengejeknya ceroboh", "Mengabaikannya", "Bilang 'beli lagi aja'", "Tertawa melihatnya sedih", "Ambil mainan lain"],
    bestIndex: 0,
    explanation: "Menghibur teman itu mulia. Senyummu adalah sedekah.",
    emoji: "😢",
  },
  {
    type: "adab",
    situation: "Kamu menemukan dompet berisi uang di jalan.",
    options: ["Cari pemiliknya / beri tahu dewasa", "Ambil uangnya saja", "Simpan sendiri", "Buang lagi", "Bagi-bagi ke teman", "Diam tidak peduli"],
    bestIndex: 0,
    explanation: "Kejujuran adalah pangkal kebaikan. Amanah harus dijaga.",
    emoji: "👛",
  },
  {
    type: "adab",
    situation: "Teman sekelasmu berbeda agama dan sedang puasa. Kamu mau makan.",
    options: ["Makan di tempat lain", "Makan di depannya biasa", "Ajak dia makan bersama", "Ejek puasanya", "Paksa dia ikut makan", "Pura-pura tidak peduli"],
    bestIndex: 0,
    explanation: "Menghormati keyakinan orang lain adalah akhlak terpuji.",
    emoji: "🤝",
  },
  {
    type: "adab",
    situation: "Orang tua memintamu berhenti main dan belajar.",
    options: ["Segera berhenti, belajar semangat", "Pura-pura tidak dengar", "Menunda-nunda terus", "Marah dan membantah", "Sembunyi di kamar", "Negosiasi minta 1 jam lagi"],
    bestIndex: 0,
    explanation: "Taat kepada orang tua adalah kunci keberkahan.",
    emoji: "📖",
  },
];

export function generateAdabQuestion(): AdabQuestion {
  return ADAB_BATTLE_QUESTIONS[Math.floor(Math.random() * ADAB_BATTLE_QUESTIONS.length)];
}

export function generateAdabChoices(options: string[], bestIndex: number, count: number): { idx: number; text: string }[] {
  // Take up to `count` options, ensuring the best is included
  let indices: number[];
  if (options.length <= count) {
    indices = options.map((_, i) => i);
  } else {
    const must = new Set([bestIndex]);
    const rest = options.map((_, i) => i).filter(i => i !== bestIndex);
    const selected = shuffleArray(rest).slice(0, count - 1);
    indices = shuffleArray([bestIndex, ...selected]);
  }
  return indices.map(i => ({ idx: i, text: options[i] }));
}

// ─── Scoring ───

export function calculateBattleScore(
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitMs: number,
  difficulty: DifficultyId,
  isBestChoice?: boolean,
): { baseScore: number; speedBonus: number; difficultyBonus: number; finalScore: number } {
  if (!isCorrect) {
    return { baseScore: 0, speedBonus: 0, difficultyBonus: 0, finalScore: 0 };
  }

  const baseScore = 100;
  const speedRatio = Math.max(0, 1 - responseTimeMs / timeLimitMs);
  const speedBonus = Math.round(speedRatio * 50);

  const diffMap: Record<string, number> = {
    tk: 5, "sd-bawah": 15, "sd-atas": 30, smp: 40, sma: 50, universitas: 65,
  };
  const difficultyBonus = diffMap[difficulty] ?? 20;

  // For adab best choice, boost base
  const adabBoost = isBestChoice ? 50 : 0;

  const finalScore = baseScore + speedBonus + difficultyBonus + adabBoost;
  return { baseScore, speedBonus, difficultyBonus, finalScore };
}

// ─── Awards ───

export function calculateAwards(
  players: BattlePlayer[],
  scores: Record<string, number>,
  turns: BattleTurn[],
): BattleAward[] {
  const awards: BattleAward[] = [];
  const playerTurns = new Map<string, BattleTurn[]>();
  turns.forEach(t => {
    const list = playerTurns.get(t.profileId) || [];
    list.push(t);
    playerTurns.set(t.profileId, list);
  });

  // Fastest average response
  let fastest: { id: string; name: string; avg: number } | null = null;
  // Most accurate
  let teliti: { id: string; name: string; accuracy: number } | null = null;
  // Most adab best choices
  let bijak: { id: string; name: string; count: number } | null = null;

  for (const p of players) {
    const pt = playerTurns.get(p.profileId) || [];
    if (pt.length === 0) continue;

    // Fastest
    const correctTurns = pt.filter(t => t.isCorrect);
    if (correctTurns.length > 0) {
      const avg = correctTurns.reduce((s, t) => s + t.responseTimeMs, 0) / correctTurns.length;
      if (!fastest || avg < fastest.avg) {
        fastest = { id: p.profileId, name: p.profileName, avg };
      }
    }

    // Most accurate
    const accuracy = pt.filter(t => t.isCorrect).length / pt.length;
    if (!teliti || accuracy > teliti.accuracy) {
      teliti = { id: p.profileId, name: p.profileName, accuracy };
    }

    // Most adab best choices
    const adabTurns = pt.filter(t => t.gameType === "adab" && t.isCorrect);
    if (adabTurns.length > 0) {
      if (!bijak || adabTurns.length > bijak.count) {
        bijak = { id: p.profileId, name: p.profileName, count: adabTurns.length };
      }
    }
  }

  if (fastest) {
    awards.push({ profileId: fastest.id, profileName: fastest.name, award: "Paling Cepat", emoji: "⚡", description: "Rata-rata waktu tercepat!" });
  }
  if (teliti) {
    awards.push({ profileId: teliti.id, profileName: teliti.name, award: "Paling Teliti", emoji: "🎯", description: "Akurasi jawaban tertinggi!" });
  }
  if (bijak) {
    awards.push({ profileId: bijak.id, profileName: bijak.name, award: "Paling Bijak", emoji: "💖", description: "Terbanyak memilih sikap adab terbaik!" });
  }

  // Comeback terbaik (largest score increase between rounds)
  let comeback: { id: string; name: string; improvement: number } | null = null;
  for (const p of players) {
    const pt = playerTurns.get(p.profileId) || [];
    if (pt.length < 2) continue;
    const roundScores: number[] = [];
    for (const t of pt) {
      const idx = t.roundNumber - 1;
      roundScores[idx] = (roundScores[idx] || 0) + t.finalScore;
    }
    for (let i = 1; i < roundScores.length; i++) {
      const improvement = roundScores[i] - roundScores[i - 1];
      if (improvement > 0 && (!comeback || improvement > comeback.improvement)) {
        comeback = { id: p.profileId, name: p.profileName, improvement };
      }
    }
  }
  if (comeback) {
    awards.push({ profileId: comeback.id, profileName: comeback.name, award: "Comeback Terbaik", emoji: "🔥", description: `Meningkat ${comeback.improvement} poin dari ronde sebelumnya!` });
  }

  // Paling Konsisten (lowest variance)
  let konsisten: { id: string; name: string; variance: number } | null = null;
  for (const p of players) {
    const pt = playerTurns.get(p.profileId) || [];
    if (pt.length < 2) continue;
    const scores = pt.filter(t => t.isCorrect).map(t => t.finalScore);
    if (scores.length < 2) continue;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + (b - avg) ** 2, 0) / scores.length;
    if (!konsisten || variance < konsisten.variance) {
      konsisten = { id: p.profileId, name: p.profileName, variance };
    }
  }
  if (konsisten) {
    awards.push({ profileId: konsisten.id, profileName: konsisten.name, award: "Paling Konsisten", emoji: "📊", description: "Skor paling stabil setiap ronde!" });
  }

  // Sahabat Amanah (most adab best choices OR most moral decisions)
  if (bijak && !awards.some(a => a.profileId === bijak!.id && a.award === "Sahabat Amanah")) {
    awards.push({ profileId: bijak.id, profileName: bijak.name, award: "Sahabat Amanah", emoji: "🤝", description: "Terbanyak memilih sikap terpuji!" });
  }

  // Participation award for everyone
  for (const p of players) {
    if (!awards.some(a => a.profileId === p.profileId)) {
      awards.push({ profileId: p.profileId, profileName: p.profileName, award: "Paling Semangat", emoji: "🌟", description: "Semangat bertanding sampai akhir!" });
    }
  }

  return awards;
}

// ════════════════════════════════════════════════════════
// Ingatan (Memory) Duel — Question Generator
// ════════════════════════════════════════════════════════

export interface IngatanQuestion {
  type: "ingatan";
  items: string[];
  answer: string;
  display: string;
  memorizeTime: number;
}

const INGATAN_EMOJIS = [
  "🍎", "🍌", "🍉", "🍇", "🍓", "🍒",
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼",
  "🚗", "🚕", "🚙", "🚌", "🏎️", "🚲",
  "🔴", "🔵", "🟡", "🟢", "🟣", "🟠",
  "⭐", "💎", "🌈", "🔥", "❄️", "🎵",
  "🌙", "☀️", "🌸", "🍀", "🎈", "🎁",
  "📚", "✏️", "🔑", "🏠", "🌲", "⚓",
  "👑", "🏆", "🎯", "💡", "🎨", "🔔",
];

export function generateIngatanQuestion(difficulty: DifficultyId): IngatanQuestion {
  // Determine how many items to show based on difficulty
  let itemCount: number;
  let memorizeTime: number;
  if (difficulty === "tk") {
    itemCount = 3;
    memorizeTime = 5;
  } else if (difficulty === "sd-bawah") {
    itemCount = 4;
    memorizeTime = 4;
  } else if (difficulty === "sd-atas") {
    itemCount = 5;
    memorizeTime = 3;
  } else if (difficulty === "smp" || difficulty === "sma") {
    itemCount = 6;
    memorizeTime = 2.5;
  } else {
    // universitas
    itemCount = 7;
    memorizeTime = 2;
  }

  const pool = shuffleArray([...INGATAN_EMOJIS]);
  const items = pool.slice(0, itemCount);
  // The correct answer is one of the items
  const answer = items[Math.floor(Math.random() * items.length)];

  return {
    type: "ingatan",
    items,
    answer,
    display: items.join(" "),
    memorizeTime,
  };
}

export function generateIngatanChoices(answer: string, count: number): string[] {
  const choices = new Set<string>();
  choices.add(answer);
  const pool = shuffleArray([...INGATAN_EMOJIS].filter(e => e !== answer));
  while (choices.size < count) {
    choices.add(pool[choices.size - 1] || pool[0]);
  }
  return shuffleArray([...choices]);
}

// ════════════════════════════════════════════════════════
// Boss Duel — Multi-step Challenge Generator
// ════════════════════════════════════════════════════════

export interface BossDuelStep {
  type: "hitung" | "pola" | "adab" | "ingatan";
  instruction: string;
  question: any;
  choices: any[];
  correctAnswer: any;
  explanation: string;
  points: number;
}

export function generateBossDuelSteps(difficulty: DifficultyId): BossDuelStep[] {
  const steps: BossDuelStep[] = [];

  if (difficulty === "tk") {
    // Simple 2-step: count + adab
    const hq = generateHitungQuestion(difficulty);
    const hChoices = generateHitungChoices(hq.answer, 4);
    steps.push({
      type: "hitung",
      instruction: "Langkah 1: Hitung dulu ya!",
      question: hq,
      choices: hChoices.map(n => ({ value: n, label: String(n) })),
      correctAnswer: hq.answer,
      explanation: `Jawabannya ${hq.answer}. Bagus!`,
      points: 100,
    });

    const aq = generateAdabQuestion();
    const aChoices = generateAdabChoices(aq.options, aq.bestIndex, 4);
    steps.push({
      type: "adab",
      instruction: "Langkah 2: Pilih sikap terbaik!",
      question: aq,
      choices: aChoices,
      correctAnswer: aq.bestIndex,
      explanation: aq.explanation,
      points: 150,
    });
  } else if (difficulty === "universitas") {
    // Complex 3-step: systems + ethics + argument
    steps.push({
      type: "hitung",
      instruction: "Langkah 1: Analisis data",
      question: { display: `Perusahaan: Pendapatan 500M, Biaya 320M, Pajak 25%. Berapa laba bersih?` },
      choices: shuffleArray([
        { value: 135, label: "135M" },
        { value: 180, label: "180M" },
        { value: 120, label: "120M" },
        { value: 150, label: "150M" },
      ]),
      correctAnswer: 135,
      explanation: "500 - 320 = 180, pajak 25% = 45. Laba bersih = 180 - 45 = 135M.",
      points: 120,
    });

    const aq = generateAdabQuestion();
    const aChoices = generateAdabChoices(aq.options, aq.bestIndex, 5);
    steps.push({
      type: "adab",
      instruction: "Langkah 2: Keputusan etis",
      question: aq,
      choices: aChoices,
      correctAnswer: aq.bestIndex,
      explanation: aq.explanation,
      points: 150,
    });

    steps.push({
      type: "pola",
      instruction: "Langkah 3: Analisis strategi",
      question: {
        display: `Strategi A untung 30%, risiko rendah. Strategi B untung 80%, risiko tinggi. Mana yang paling bijak untuk dana pensiun?`,
      },
      choices: shuffleArray([
        { value: "A", label: "Strategi A (aman)" },
        { value: "B", label: "Strategi B (berisiko)" },
        { value: "C", label: "Gabungan A dan B" },
        { value: "D", label: "Tidak investasi" },
      ]),
      correctAnswer: "A",
      explanation: "Dana pensiun perlu keamanan. Strategi A paling tepat untuk tujuan jangka panjang yang aman.",
      points: 130,
    });
  } else {
    // Standard 2-step: hitung + adab
    const hq = generateHitungQuestion(difficulty);
    const hChoices = generateHitungChoices(hq.answer, difficulty === "sd-bawah" ? 5 : 6);
    steps.push({
      type: "hitung",
      instruction: "Langkah 1: Hitung dengan teliti!",
      question: hq,
      choices: hChoices.map(n => ({ value: n, label: String(n) })),
      correctAnswer: hq.answer,
      explanation: `Jawaban yang benar adalah ${hq.answer}.`,
      points: 100,
    });

    const aq = generateAdabQuestion();
    const aChoices = generateAdabChoices(aq.options, aq.bestIndex, 5);
    steps.push({
      type: "adab",
      instruction: "Langkah 2: Pilih sikap paling tepat!",
      question: aq,
      choices: aChoices,
      correctAnswer: aq.bestIndex,
      explanation: aq.explanation,
      points: 150,
    });
  }

  return steps;
}

// ════════════════════════════════════════════════════════
// Family Challenge — Cooperative Target
// ════════════════════════════════════════════════════════

export function getFamilyTargetScore(playerCount: number, roundCount: number, difficulty: DifficultyId): number {
  const base = playerCount * roundCount * 100;
  const diffMultiplier: Record<string, number> = {
    tk: 0.7, "sd-bawah": 1.0, "sd-atas": 1.2, smp: 1.4, sma: 1.6, universitas: 2.0,
  };
  return Math.round(base * (diffMultiplier[difficulty] || 1.0));
}
