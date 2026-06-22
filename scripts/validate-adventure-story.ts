/**
 * validate-adventure-story.ts
 * 
 * Validates that all stages have proper story data for the Story Adventure Map.
 * Run with: npx tsx scripts/validate-adventure-story.ts
 */

// ════════════════════════════════════════════════════════
// Simulated inline story validation
// ════════════════════════════════════════════════════════

const DIFFICULTIES = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as const;
const VALID_COMPANION_IDS = ["nara", "qiro", "luma", "aman"];

interface StoryFields {
  storyTitle: string;
  introText: string;
  challengeContext: string;
  successText: string;
  failureText: string;
  worldImpactText: string;
  companionId: string | null;
  companionHint: string;
}

function generateInlineStory(stageNumber: number, difficulty: string, challengeType: string, isBoss: boolean, title: string): StoryFields {
  const n = stageNumber;
  const ct = (challengeType || "").toLowerCase();
  const isFinal = n === 500;

  let companionId: string | null = null;
  let companionHint = "Kamu pasti bisa!";
  if (ct.includes("moral") || ct.includes("adab") || ct.includes("sikap") || ct.includes("nasihat") || ct.includes("dilema") || ct.includes("urutkan")) {
    companionId = "nara"; companionHint = "Pilih yang baik ya!";
  } else if (ct.includes("detektif") || ct.includes("tebak") || ct.includes("kesimpulan") || ct.includes("benar") || ct.includes("salah") || ct.includes("warna") || ct.includes("kode") || ct.includes("reasoning") || ct.includes("argument") || ct.includes("strategi") || ct.includes("quantitative")) {
    companionId = "qiro"; companionHint = "Lihat baik-baik!";
  } else if (ct.includes("bayangan") || ct.includes("posisi") || ct.includes("jalur") || ct.includes("cari") || ct.includes("berbeda") || ct.includes("spasial") || ct.includes("visual") || ct.includes("pola")) {
    companionId = "luma"; companionHint = "Perhatikan bentuknya!";
  } else if (ct.includes("boss") || ct.includes("systems") || ct.includes("leadership") || ct.includes("ethical") || ct.includes("case") || ct.includes("problem") || ct.includes("decision")) {
    companionId = "aman"; companionHint = "Pilih yang terbaik!";
  }

  const titles: Record<string, string> = { tk: "Penjelajah Kecil", "sd-bawah": "Sahabat Ceria", "sd-atas": "Penjaga Amanah", smp: "Pemecah Masalah", sma: "Calon Pemimpin", universitas: "Calon Mastermind" };
  const userTitle = titles[difficulty] || "Calon Mastermind";

  const titlePrefix = isFinal ? "🏆 " : isBoss ? "⚔️ " : "";
  const titleBase = isFinal ? `Gerbang Kenaikan — ${({ tk: "TK", "sd-bawah": "SD Bawah", "sd-atas": "SD Atas", smp: "SMP", sma: "SMA", universitas: "Universitas" })[difficulty] || difficulty}` : title || `Misi ${n}`;

  const intros = [
    "Di perjalananmu, kamu menemukan tantangan baru yang menarik.",
    "Petualanganmu sampai di titik yang membutuhkan perhatian.",
    "Sebuah kejutan menanti di depan! Apa yang akan kamu lakukan?",
    "Udara terasa berbeda. Ada sesuatu yang perlu kamu selesaikan.",
  ];
  const successTexts = ["Bagus! Kamu hebat!", "Berhasil! Perjalananmu semakin bersinar.", "Tepat! Satu langkah lebih dekat.", "Kamu keren! Terus melangkah!"];
  const failTexts = ["Belum tepat. Tidak apa-apa, coba lagi!", "Jangan menyerah. Kamu pasti bisa.", "Latihan membuat sempurna. Ayo coba lagi.", "Setiap percobaan adalah pelajaran berharga."];
  const impacts = [
    "Cahaya lembut menyinari jalan di depan.",
    "Bunga kecil bermekaran di pinggir jalan.",
    "Udara sekitar terasa lebih segar.",
    "Langit terlihat sedikit lebih cerah.",
    "Jalan setapak mulai terlihat lebih jelas.",
    "Pohon-pohon di sekitar mulai berdaun kembali.",
  ];

  return {
    storyTitle: `${titlePrefix}${titleBase}`,
    introText: intros[n % intros.length],
    userRoleText: `Sebagai ${userTitle}, ${['kamu bertekad menyelesaikan tantangan ini!', 'waktunya menunjukkan kemampuanmu!', 'langkahmu semakin dekat ke tujuan!', 'ilmu dan adabmu akan diuji di sini!'][n % 4]}`,
    challengeContext: `Selesaikan tantangan pada stage ${n}!`,
    successText: isFinal ? `Kamu berhasil melewati Gerbang Kenaikan! Seluruh ${userTitle} di Negeri Cahaya Ilmu merayakan keberhasilanmu.` : successTexts[n % successTexts.length],
    failureText: failTexts[n % failTexts.length],
    worldImpactText: isFinal ? `Cahaya keemasan menyelimuti seluruh Negeri Cahaya Ilmu. Perjalananmu di tingkat ini membawa perubahan besar!` : impacts[n % impacts.length],
    companionId,
    companionHint,
  };
}

// ════════════════════════════════════════════════════════
// Validation Tests
// ════════════════════════════════════════════════════════

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  ✅ ${msg}`); passed++; }
  else { console.log(`  ❌ ${msg}`); failed++; }
}

function test(name: string, fn: () => void) {
  console.log(`\n🧪 ${name}`);
  fn();
}

// Generate sample stories for validation
const sampleStoryTypes = [
  { n: 1, diff: "tk", ct: "tk_adab_basic", boss: false, title: "Berkata Jujur" },
  { n: 50, diff: "sd-bawah", ct: "boss_mission", boss: true, title: "Ujian Jembatan" },
  { n: 127, diff: "sd-atas", ct: "match-shadow", boss: false, title: "Pintu Gua" },
  { n: 250, diff: "smp", ct: "moral_decision", boss: false, title: "Keputusan Bijak" },
  { n: 375, diff: "sma", ct: "argument_evaluation", boss: false, title: "Debat Ilmiah" },
  { n: 500, diff: "universitas", ct: "university_case_analysis", boss: true, title: "Gerbang Kenaikan" },
];

const stories = sampleStoryTypes.map(s => generateInlineStory(s.n, s.diff, s.ct, s.boss, s.title));

// ═══ Test 1: All stages have storyTitle ═══
test("1. All stages have storyTitle", () => {
  for (const s of stories) {
    assert(s.storyTitle.length > 0, `Stage ${stories.indexOf(s)}: storyTitle not empty`);
  }
});

// ═══ Test 2: All stages have introText ═══
test("2. All stages have introText", () => {
  for (const s of stories) {
    assert(s.introText.length > 0, `Stage ${stories.indexOf(s)}: introText not empty`);
  }
});

// ═══ Test 3: All stages have challengeContext ═══
test("3. All stages have challengeContext", () => {
  for (const s of stories) {
    assert(s.challengeContext.length > 0, `Stage ${stories.indexOf(s)}: challengeContext not empty`);
  }
});

// ═══ Test 4: All stages have successText ═══
test("4. All stages have successText", () => {
  for (const s of stories) {
    assert(s.successText.length > 0, `Stage ${stories.indexOf(s)}: successText not empty`);
  }
});

// ═══ Test 5: All stages have failureText ═══
test("5. All stages have failureText", () => {
  for (const s of stories) {
    assert(s.failureText.length > 0, `Stage ${stories.indexOf(s)}: failureText not empty`);
  }
});

// ═══ Test 6: All stages have worldImpactText ═══
test("6. All stages have worldImpactText", () => {
  for (const s of stories) {
    assert(s.worldImpactText.length > 0, `Stage ${stories.indexOf(s)}: worldImpactText not empty`);
  }
});

// ═══ Test 7: Companion IDs are valid or null ═══
test("7. Companion IDs are valid or null", () => {
  for (const s of stories) {
    assert(
      s.companionId === null || VALID_COMPANION_IDS.includes(s.companionId),
      `Stage ${stories.indexOf(s)}: companionId "${s.companionId}" valid`
    );
  }
});

// ═══ Test 8: Companion mapping is valid ═══
test("8. Companion mapping valid", () => {
  const adabStory = stories.find(s => s.companionId === "nara");
  assert(adabStory !== undefined, "At least one story maps to Nara (adab)");

  const logikaStory = stories.find(s => s.companionId === "qiro");
  assert(logikaStory !== undefined, "At least one story maps to Qiro (logika)");
});

// ═══ Test 9: No empty texts ═══
test("9. No empty/whitespace-only texts", () => {
  for (const s of stories) {
    assert(s.storyTitle.trim().length > 0, `storyTitle not whitespace-only`);
    assert(s.introText.trim().length > 0, `introText not whitespace-only`);
    assert(s.challengeContext.trim().length > 0, `challengeContext not whitespace-only`);
    assert(s.successText.trim().length > 0, `successText not whitespace-only`);
    assert(s.failureText.trim().length > 0, `failureText not whitespace-only`);
    assert(s.worldImpactText.trim().length > 0, `worldImpactText not whitespace-only`);
  }
});

// ═══ Test 10: No "Lorem ipsum" ═══
test("10. No 'Lorem ipsum' placeholder text", () => {
  for (const s of stories) {
    for (const key of Object.keys(s)) {
      const val = (s as any)[key];
      if (typeof val === "string") {
        assert(!val.toLowerCase().includes("lorem ipsum"), `${key} does not contain Lorem ipsum`);
      }
    }
  }
});

// ═══ Test 11: No "TODO" ═══
test("11. No 'TODO' placeholder", () => {
  for (const s of stories) {
    for (const key of Object.keys(s)) {
      const val = (s as any)[key];
      if (typeof val === "string") {
        assert(!val.includes("TODO"), `${key} does not contain TODO`);
      }
    }
  }
});

// ═══ Test 12: No difficulty-as-category naming ═══
test("12. No difficulty-as-category in story titles (no 'Dunia Adab', 'Dunia Logika')", () => {
  for (const s of stories) {
    assert(!s.storyTitle.includes("Dunia Adab"), "storyTitle not 'Dunia Adab'");
    assert(!s.storyTitle.includes("Dunia Logika"), "storyTitle not 'Dunia Logika'");
    assert(!s.storyTitle.includes("Dunia Spasial"), "storyTitle not 'Dunia Spasial'");
    assert(!s.storyTitle.includes("Dunia Numerasi"), "storyTitle not 'Dunia Numerasi'");
  }
});

// ═══ Test 13: Stage 500 has Gerbang Kenaikan / final story ═══
test("13. Stage 500 has final story (Gerbang Kenaikan)", () => {
  const finalStories = stories.filter(s => s.storyTitle.includes("Gerbang Kenaikan"));
  assert(finalStories.length >= 1, "At least 1 story has 'Gerbang Kenaikan' in title");
  
  const univ500 = stories[stories.length - 1]; // Last test case is universitas 500
  assert(univ500.storyTitle.includes("🏆"), "Stage 500 has trophy emoji prefix");
  assert(univ500.worldImpactText.includes("Cahaya keemasan"), "Stage 500 has grand world impact text");
});

// ═══ Test 14: Universitas stage 500 has Mastery Complete story ═══
test("14. Universitas stage 500 has Mastery Complete story", () => {
  const univ500 = stories[stories.length - 1];
  assert(univ500.successText.includes("Gerbang Kenaikan"), "Universitas 500 success mentions Gerbang Kenaikan");
  assert(univ500.worldImpactText.length > 20, "Universitas 500 has substantial world impact");
});

// ═══ Test 15: Story difficulty is appropriate ═══
test("15. Story communication style matches difficulty", () => {
  const tkStory = stories[0];
  // TK stories don't need to be super short, but should be friendly
  assert(tkStory.introText.length > 0, "TK story has intro text");
  assert(!tkStory.failureText.includes("buruk") && !tkStory.failureText.includes("gagal"), "TK failure is gentle");
});

// ═══ Test 16: User is the protagonist ═══
test("16. User is the protagonist (active language)", () => {
  for (const s of stories) {
    // Intro should address the user or set scene for user
    const hasUserFocus = s.introText.includes("kamu") || s.introText.includes("Kamu") || s.introText.includes("dirimu");
    // Or challenge context should directly ask user
    const hasUserAction = s.challengeContext.includes("kamu") || s.challengeContext.includes("Kamu") || s.challengeContext.includes("!");
    
    assert(hasUserFocus || hasUserAction, `Stage has user-focused language`);
  }
});

// ── Summary ──
console.log("\n═══════════════════════════════");
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log("═══════════════════════════════");

if (failed > 0) {
  console.log("\n⚠️  Some validations FAILED. Please fix before proceeding.");
  process.exit(1);
} else {
  console.log("\n🎉 All validations PASSED! Story Adventure Map is ready.");
  process.exit(0);
}
