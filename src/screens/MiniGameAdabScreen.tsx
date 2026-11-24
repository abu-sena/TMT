import { useState, useEffect, useRef, useCallback } from "react";
import type { Profile, MiniGameSession } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import type React from "react";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Props {
  profile: Profile;
  onBack: () => void;
  backRef: React.MutableRefObject<(() => boolean) | null>;
}

function getConfig(difficulty: string) {
  if (difficulty === "tk") return { timeLimit: 12, label: "Adab Ceria" };
  if (difficulty === "sd-bawah") return { timeLimit: 10, label: "Adab Cepat" };
  return { timeLimit: 8, label: "Adab Cepat" };
}

interface AdabQuestion {
  situation: string;
  options: string[];
  bestIndex: number;
  acceptableIndex?: number;
  explanation: string;
  emoji: string;
}

const ADAB_QUESTIONS: AdabQuestion[] = [
  {
    situation: "Temanmu lupa membawa pensil. Apa sikap terbaik?",
    options: ["Meminjamkan dengan senang hati", "Mengejeknya", "Menyembunyikan pensilnya", "Diam saja pura-pura tidak tahu", "Mengambil pensil orang lain untuknya", "Memarahinya karena lalai"],
    bestIndex: 0,
    explanation: "Menolong teman adalah akhlak yang baik. Kita belajar peduli dan tidak mengejek orang yang sedang kesulitan.",
    emoji: "✏️",
  },
  {
    situation: "Kamu melihat sampah berserakan di halaman masjid. Apa yang kamu lakukan?",
    options: ["Memungutnya dan membuang ke tempat sampah", "Pura-pura tidak lihat", "Menyuruh orang lain membersihkan", "Melapor ke guru tapi tidak membersihkan", "Menendangnya ke selokan", "Meninggalkan masjid saja"],
    bestIndex: 0,
    explanation: "Kebersihan sebagian dari iman. Menjaga kebersihan rumah Allah adalah bentuk kecintaan kita kepada-Nya.",
    emoji: "🕌",
  },
  {
    situation: "Adikmu tidak sengaja memecahkan gelas. Bagaimana reaksimu?",
    options: ["Menghiburnya dan membantu membersihkan", "Memarahinya dengan keras", "Melaporkan ke orang tua sambil berteriak", "Memukulnya pelan", "Menyuruhnya membersihkan sendiri", "Mengabaikannya"],
    bestIndex: 0,
    acceptableIndex: 4,
    explanation: "Memaafkan dan membantu adalah cerminan kasih sayang. Allah Maha Pemaaf dan menyukai hamba-Nya yang pemaaf.",
    emoji: "💔",
  },
  {
    situation: "Teman sekelasmu berbeda agama dan sedang berpuasa. Kamu ingin makan di depannya. Apa yang sebaiknya dilakukan?",
    options: ["Makan di tempat lain atau tidak di depannya", "Makan di depannya biasa saja", "Mengajaknya makan bersama", "Mengejek puasanya", "Memaksanya untuk ikut makan", "Pura-pura tidak peduli"],
    bestIndex: 0,
    explanation: "Menghormati keyakinan orang lain adalah akhlak terpuji. Islam mengajarkan toleransi dan saling menghargai.",
    emoji: "🤝",
  },
  {
    situation: "Kamu tidak sengaja menyenggol teman hingga bukunya jatuh. Apa yang kamu lakukan?",
    options: ["Meminta maaf dan membantu memungut bukunya", "Langsung pergi", "Tertawa dan menganggapnya lucu", "Menyalahkan teman lain", "Diam sambil pura-pura tidak sengaja", "Membentaknya karena tidak hati-hati"],
    bestIndex: 0,
    explanation: "Meminta maaf adalah tanda keberanian dan kerendahan hati. Segera minta maaf jika berbuat salah.",
    emoji: "📚",
  },
  {
    situation: "Ibu sedang lelah setelah bekerja seharian. Apa yang kamu lakukan?",
    options: ["Membantu pekerjaan rumah tanpa diminta", "Bermain game terus tanpa peduli", "Meminta uang jajan", "Menyuruh ibu membuatkan makanan", "Mengeluh karena rumah berantakan", "Pergi bermain ke luar"],
    bestIndex: 0,
    explanation: "Berbakti kepada orang tua adalah kewajiban. Ridha Allah ada pada ridha orang tua.",
    emoji: "👩",
  },
  {
    situation: "Kamu mendapat nilai bagus dan dipuji guru. Bagaimana sikapmu?",
    options: ["Bersyukur dan tidak menyombongkan diri", "Menyombongkan diri ke semua teman", "Merendahkan teman yang nilainya kurang", "Bilang kalau itu karena beruntung saja", "Diam saja tidak peduli", "Meminta hadiah ke orang tua dengan paksa"],
    bestIndex: 0,
    explanation: "Segala kepintaran adalah karunia Allah. Jangan sombong karena Allah tidak menyukai orang sombong.",
    emoji: "🏆",
  },
  {
    situation: "Temanmu sedih karena mainannya hilang. Apa yang kamu lakukan?",
    options: ["Menghiburnya dan membantu mencari", "Mengejeknya karena ceroboh", "Mengabaikannya", "Mengatakan 'biarin, beli lagi aja'", "Tertawa melihatnya sedih", "Mengambil mainan lain untuk diri sendiri"],
    bestIndex: 0,
    explanation: "Menghibur teman yang sedih adalah perbuatan mulia. Senyummu kepada saudaramu adalah sedekah.",
    emoji: "😢",
  },
  {
    situation: "Ada teman yang suka berkata kasar. Bagaimana sebaiknya?",
    options: ["Mengingatkan dengan lembut bahwa itu tidak baik", "Membalas dengan kata kasar juga", "Melaporkan ke guru sambil membesar-besarkan", "Mengajak teman lain untuk menjauhinya", "Diam saja karena bukan urusan kita", "Merekam dan menyebarkannya"],
    bestIndex: 0,
    explanation: "Mengingatkan dengan lembut adalah bentuk amar ma'ruf. Gunakan kata-kata yang baik.",
    emoji: "🗣️",
  },
  {
    situation: "Kamu menemukan dompet berisi uang di jalan. Apa yang kamu lakukan?",
    options: ["Mencari pemiliknya atau memberitahu orang dewasa", "Mengambil uangnya saja", "Menyimpannya untuk diri sendiri", "Membuangnya lagi", "Membagi-bagikan uangnya ke teman", "Diam saja tidak peduli"],
    bestIndex: 0,
    explanation: "Kejujuran adalah pangkal kebaikan. Mengembalikan barang temuan adalah amanah yang harus dijaga.",
    emoji: "👛",
  },
  {
    situation: "Saat shalat berjamaah, teman di sampingmu mengajak bicara. Apa yang kamu lakukan?",
    options: ["Tetap fokus shalat dan mengabaikannya", "Membalas bicaranya", "Mendorongnya pelan", "Tertawa kecil", "Keluar dari shaf", "Melapor ke imam saat shalat"],
    bestIndex: 0,
    explanation: "Khusyuk dalam shalat sangat penting. Allah berfirman: 'Sungguh beruntung orang-orang yang khusyuk dalam shalatnya.'",
    emoji: "🤲",
  },
  {
    situation: "Orang tuamu memintamu berhenti bermain dan belajar. Apa yang kamu lakukan?",
    options: ["Segera berhenti dan belajar dengan semangat", "Pura-pura tidak dengar", "Menunda-nunda terus", "Marah dan membantah", "Bersembunyi di kamar", "Bernegosiasi minta main 1 jam lagi dulu"],
    bestIndex: 0,
    explanation: "Taat kepada orang tua adalah kunci keberkahan. Selama bukan dalam kemaksiatan, perintah orang tua wajib ditaati.",
    emoji: "📖",
  },
];

function getStage(correctCount: number): number {
  if (correctCount <= 3) return 1;
  if (correctCount <= 7) return 2;
  if (correctCount <= 12) return 3;
  if (correctCount <= 18) return 4;
  if (correctCount <= 28) return 5;
  return 6;
}

export function MiniGameAdabScreen({ profile, onBack, backRef }: Props) {
  const cfg = getConfig(profile.difficulty);
  const { store, addMiniGameSession } = useGameStore();

  const [screen, setScreen] = useState<"start" | "playing" | "result" | "leaderboard">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [stage, setStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(cfg.timeLimit);
  const [question, setQuestion] = useState<AdabQuestion>(ADAB_QUESTIONS[0]);
  const [shuffledOptions, setShuffledOptions] = useState<{ idx: number; text: string }[]>([]);
  const [feedback, setFeedback] = useState<"best" | "acceptable" | "wrong" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [showExit, setShowExit] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [timerPaused, setTimerPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef(Date.now());

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "adab");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);
  const leaderboard = store.miniGameLeaderboards["adab"] || [];

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const endGame = useCallback(() => {
    clearTimers();
    const avgTime = answerTimes.length > 0
      ? answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length
      : cfg.timeLimit;

    const session: MiniGameSession = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      gameType: "adab",
      score,
      correctCount,
      averageAnswerTime: Math.round(avgTime * 100) / 100,
      fastestAnswerTime: answerTimes.length > 0 ? Math.min(...answerTimes) : 0,
      slowestAnswerTime: answerTimes.length > 0 ? Math.max(...answerTimes) : 0,
      maxStage: stage,
      difficulty: profile.difficulty,
      playedAt: Date.now(),
    };
    addMiniGameSession(session);
    setScreen("result");
  }, [clearTimers, answerTimes, cfg.timeLimit, profile, score, correctCount, stage, addMiniGameSession]);

  const nextQuestion = useCallback(() => {
    clearTimers();
    setTimerPaused(false);
    
    const available = ADAB_QUESTIONS.map((_, i) => i).filter(i => !usedQuestions.has(i));
    const pool = available.length > 0 ? available : ADAB_QUESTIONS.map((_, i) => i);
    const idx = pool[Math.floor(Math.random() * pool.length)];

    const newUsed = new Set(usedQuestions);
    newUsed.add(idx);
    if (newUsed.size > ADAB_QUESTIONS.length / 2) newUsed.clear();
    setUsedQuestions(newUsed);

    const q = ADAB_QUESTIONS[idx];
    setQuestion(q);
    // Fisher-Yates shuffle for options
    const shuffled = shuffleArray(q.options.map((text, i) => ({ idx: i, text })));
    setShuffledOptions(shuffled);
    setTimeLeft(cfg.timeLimit);
    setFeedback(null);
    setFeedbackText("");
    questionStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearTimers(); endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [cfg.timeLimit, usedQuestions, clearTimers, endGame]);

  const handleAnswer = (originalIdx: number) => {
    clearTimers();
    setTimerPaused(true); // Pause timer for explanation
    const elapsed = (Date.now() - questionStartRef.current) / 1000;
    const stg = getStage(correctCount);
    setStage(stg);

    if (originalIdx === question.bestIndex) {
      const speedBonus = Math.round(Math.min(timeLeft / cfg.timeLimit, 1) * 30);
      const diffBonus = stg * 10;
      const questionScore = 200 + speedBonus + diffBonus;

      setScore(s => s + questionScore);
      setCorrectCount(c => c + 1);
      setAnswerTimes(t => [...t, elapsed]);
      setFeedback("best");
      setFeedbackText(question.explanation);
    } else if (originalIdx === question.acceptableIndex) {
      const questionScore = 100;
      setScore(s => s + questionScore);
      setCorrectCount(c => c + 1);
      setAnswerTimes(t => [...t, elapsed]);
      setFeedback("acceptable");
      setFeedbackText("Jawaban bisa diterima. Tapi ada yang lebih baik: " + question.options[question.bestIndex]);
    } else {
      setFeedback("wrong");
      setFeedbackText(question.explanation);
      setAnswerTimes(t => [...t, elapsed]);
    }
  };

  const handleContinue = () => {
    if (feedback === "wrong") {
      endGame();
    } else {
      nextQuestion();
    }
  };

  const startGame = () => {
    setScore(0); setCorrectCount(0); setStage(1); setAnswerTimes([]);
    setFeedback(null); setFeedbackText(""); setUsedQuestions(new Set());
    setTimerPaused(false);
    setScreen("playing");

    const q = ADAB_QUESTIONS[Math.floor(Math.random() * ADAB_QUESTIONS.length)];
    const shuffled = shuffleArray(q.options.map((text, i) => ({ idx: i, text })));
    setQuestion(q);
    setShuffledOptions(shuffled);
    setTimeLeft(cfg.timeLimit);
    questionStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearTimers(); endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Register back handler for Android back button
  useEffect(() => {
    backRef.current = () => {
      if (screen === "playing") {
        if (feedback) {
          // If showing explanation, show exit confirmation instead of skipping
          setShowExit(true);
        } else {
          setShowExit(true);
        }
        return true;
      }
      if (screen === "leaderboard") {
        setScreen("start");
        return true;
      }
      if (screen === "result") {
        setScreen("start");
        return true;
      }
      return false;
    };
    return () => { backRef.current = null; };
  }, [backRef, screen, feedback, setShowExit, setScreen]);

  // ── Start Screen ──
  if (screen === "start") {
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
        <GameCard tone="heart" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
          <div className="text-6xl mb-4">💖</div>
          <h1 className="font-display font-black text-3xl mb-1">{cfg.label}</h1>
          <p className="text-sm font-bold opacity-80 mb-4">Pilih sikap terbaik dari situasi sehari-hari. Jawaban salah = selesai.</p>
          {personalBest > 0 && (
            <div className="mb-4 p-3 rounded-2xl bg-black/20">
              <div className="text-xs uppercase font-bold opacity-70">Rekor Terbaik</div>
              <div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div>
            </div>
          )}
          {leaderboard.length > 0 && (
            <div className="mb-4 text-left">
              <div className="text-xs uppercase font-bold opacity-70 mb-1">Top 3</div>
              {leaderboard.slice(0, 3).map((e, i) => (
                <div key={e.id} className="flex items-center gap-2 text-sm"><span className="font-black">{["🥇","🥈","🥉"][i]}</span><AvatarPortrait avatar={e.avatar} className="w-6 h-6 rounded-full" /><span className="truncate flex-1">{e.profileName}</span><span className="font-black">{e.score}</span></div>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton>
            <GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton>
          </div>
          <button onClick={() => setScreen("leaderboard")} className="mt-3 text-xs font-bold text-white/70 underline">Lihat Leaderboard</button>
        </GameCard>
      </div>
    );
  }

  // ── Leaderboard ──
  if (screen === "leaderboard") {
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
        <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
          <button onClick={() => setScreen("start")} className="h-12 w-12 rounded-2xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95">←</button>
          <div className="flex-1"><h1 className="font-display font-black text-xl text-[#5A3515]">Leaderboard</h1><p className="text-xs text-[#5A3515]/70">{cfg.label}</p></div>
          <div className="text-2xl">🏆</div>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-2 pb-6">
          {leaderboard.length === 0 ? (
            <GameCard tone="cream" className="text-center py-8"><div className="text-5xl mb-2">🏆</div><p className="font-bold text-[#8C6B45]">Belum ada pemain.</p></GameCard>
          ) : leaderboard.map((e, i) => (
            <div key={e.id} className={`rounded-2xl p-3 flex items-center gap-3 border-2 ${e.profileId === profile.id ? "bg-gradient-meadow/20 border-[#2E8B12]" : "bg-white/80 border-[#CBB794]/50"}`}>
              <div className="text-2xl font-black w-10 text-center shrink-0">{i<3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}</div>
              <AvatarPortrait avatar={e.avatar} className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 min-w-0"><div className="font-bold text-[#5A3515] truncate text-sm">{e.profileName}</div><div className="text-[10px] text-[#8C6B45]">{e.correctCount} benar</div></div>
              <div className="font-display font-black text-xl text-[#5A3515] shrink-0">{e.score}</div>
            </div>
          ))}
        </main>
        <div className="shrink-0 content-wrapper pb-safe pt-2"><GameButton variant="ghost" size="md" full onClick={() => setScreen("start")}>🏠 Kembali</GameButton></div>
      </div>
    );
  }

  // ── Result ──
  if (screen === "result") {
    const avgTime = answerTimes.length > 0 ? (answerTimes.reduce((a,b)=>a+b,0)/answerTimes.length).toFixed(1) : "—";
    const isNewBest = score > personalBest;
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
        <GameCard tone="heart" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
          <div className="text-6xl mb-3">{isNewBest ? "👑" : "🏆"}</div>
          <h2 className="font-display font-black text-2xl mb-1">Permainan Selesai!</h2>
          {isNewBest && <p className="text-yellow-300 font-black text-sm mb-3 animate-bob">🎉 Rekor Baru!</p>}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-black/20 rounded-2xl p-3"><div className="text-3xl font-black text-yellow-300">{score}</div><div className="text-[10px] uppercase font-bold opacity-70">Skor</div></div>
            <div className="bg-black/20 rounded-2xl p-3"><div className="text-3xl font-black">{correctCount}</div><div className="text-[10px] uppercase font-bold opacity-70">Benar</div></div>
            <div className="bg-black/20 rounded-2xl p-3"><div className="text-3xl font-black">{stage}</div><div className="text-[10px] uppercase font-bold opacity-70">Stage</div></div>
            <div className="bg-black/20 rounded-2xl p-3"><div className="text-3xl font-black">{avgTime}s</div><div className="text-[10px] uppercase font-bold opacity-70">Rata² Waktu</div></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-3"><GameButton variant="ghost" full onClick={onBack}>Home</GameButton><GameButton variant="primary" full onClick={startGame}>Main Lagi</GameButton></div>
          <button onClick={() => setScreen("leaderboard")} className="text-xs font-bold text-white/70 underline">Lihat Leaderboard</button>
        </GameCard>
      </div>
    );
  }

  // ── Exit modal ──
  if (showExit) {
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
        <GameCard tone="cream" className="text-center w-full max-w-sm p-6 border-4 border-[#CBB794]">
          <div className="text-5xl mb-3">🚪</div>
          <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">Keluar dari mini-game?</h2>
          <p className="text-sm font-bold text-[#8C6B45] mb-4">Skor sesi ini belum disimpan.</p>
          <div className="flex flex-col sm:flex-row gap-3"><GameButton variant="ghost" full onClick={() => setShowExit(false)}>Lanjut Main</GameButton><GameButton variant="danger" full onClick={onBack}>Keluar</GameButton></div>
        </GameCard>
      </div>
    );
  }

  const timerPercent = (timeLeft / cfg.timeLimit) * 100;
  const timerColor = timeLeft <= 2 ? "#A02020" : timeLeft <= 4 ? "#D48806" : "#2E8B12";

  // ── Playing Screen ──
  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button onClick={() => setShowExit(true)} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shadow-sm shrink-0 active:scale-95">✕</button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm sm:text-lg border-2 border-[#CBB794]">⭐ {score}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm sm:text-lg border-2 border-[#CBB794]">✅ {correctCount}</div>
        {timerPaused && (
          <div className="bg-yellow-100 px-3 py-1.5 rounded-full font-black text-[#D48806] text-xs sm:text-sm border-2 border-[#D48806] ml-auto">⏸ Pause</div>
        )}
      </header>

      <div className="h-3 rounded-full bg-black/10 mb-4 shrink-0 overflow-hidden border border-white/50">
        <div className="h-full rounded-full transition-all duration-100" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
        {/* Question card */}
        <GameCard tone="cream" className={`w-full max-w-sm text-center py-6 sm:py-8 mb-4 border-4 shrink-0 ${
          feedback === "best" ? "border-[#2E8B12] bg-[#E8F5E9]" :
          feedback === "acceptable" ? "border-[#D48806] bg-[#FFF9E6]" :
          feedback === "wrong" ? "border-[#A02020] bg-[#FFEBEE]" :
          "border-[#CBB794]"
        }`}>
          <div className="text-3xl mb-2">{question.emoji}</div>
          <p className="font-display font-bold text-lg sm:text-xl text-[#5A3515] leading-snug px-2">
            {question.situation}
          </p>
        </GameCard>

        {/* Explanation card */}
        {feedback && (
          <div className="w-full max-w-sm mb-3">
            <div className={`rounded-2xl p-4 text-sm font-bold border-2 ${
              feedback === "best" ? "bg-[#E8F5E9] border-[#2E8B12] text-[#2E8B12]" :
              feedback === "acceptable" ? "bg-[#FFF9E6] border-[#D48806] text-[#D48806]" :
              "bg-[#FFEBEE] border-[#A02020] text-[#A02020]"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">
                  {feedback === "best" ? "🌟" : feedback === "acceptable" ? "💡" : "📖"}
                </span>
                <span className="font-display font-black text-base">
                  {feedback === "best" ? "Pelajaran Adab" : feedback === "acceptable" ? "Hikmah" : "Pelajaran"}
                </span>
              </div>
              <p className="leading-relaxed">{feedbackText}</p>
            </div>
            <div className="mt-3">
              <GameButton
                variant={feedback === "wrong" ? "danger" : "primary"}
                size="md"
                full
                onClick={handleContinue}
              >
                {feedback === "wrong" ? "Lihat Hasil" : "Lanjut Tantangan"}
              </GameButton>
            </div>
          </div>
        )}

        {/* Options grid — only shown when no feedback */}
        {feedback === null && (
          <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
            {shuffledOptions.map((opt) => (
              <button
                key={opt.idx}
                onClick={() => handleAnswer(opt.idx)}
                className="w-full text-left p-3 sm:p-4 rounded-2xl bg-white border-3 border-[#CBB794] text-[#5A3515] font-bold text-sm sm:text-base shadow-pop active:translate-y-[4px] active:shadow-sm transition-all hover:border-[#A02020] hover:bg-[#FFF0F0] min-h-[3.5rem] flex items-center gap-2 max-w-full overflow-hidden box-border"
              >
                <span className="text-lg shrink-0">{["💬","🔷","📌","🔹","💠","🔸"][opt.idx % 6]}</span>
                <span className="leading-tight break-words">{opt.text}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      <div className="text-center text-xs font-bold text-[#8C6B45]/70 pt-2 shrink-0">
        {timerPaused ? "⏸ Timer dijeda — baca pelajarannya dulu!" : `⏱ ${cfg.timeLimit} detik · Pilih sikap terbaik`}
      </div>
    </div>
  );
}
