/**
 * Nasihat dengan Lembut + Dilema Bijak + Urutkan Adab — Adab mini-games
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { Profile, MiniGameSession } from "@/types";
import { createMiniGameSession } from "@/lib/minigame-engine";
import { shuffleArray } from "@/lib/utils";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { MiniGameResultScreen } from "./MiniGameResultScreen";
import { useGameStore } from "@/lib/storage";
import type React from "react";

// ═══════════════════════════
// Nasihat dengan Lembut
// ═══════════════════════════

interface NasihatQuestion {
  situation: string;
  options: string[];
  bestIdx: number;
  acceptableIdx?: number;
  explanation: string;
  emoji: string;
}

const NASIHAT_QUESTIONS: NasihatQuestion[] = [
  { situation: "Temanmu membuang sampah sembarangan di kelas.", options: ["'Yuk buang sampah di tempatnya agar kelas kita bersih dan nyaman.'", "'Kamu jorok sekali! Dasar pemalas!'", "'Aku tidak mau berteman dengan orang jorok.'", "'Biar saja, bukan urusanku.'"], bestIdx: 0, explanation: "Nasihat yang baik disampaikan dengan lembut tanpa mempermalukan. Menjaga kebersihan adalah sebagian dari iman.", emoji: "🗑️" },
  { situation: "Adikmu malas belajar dan lebih suka bermain game.", options: ["'Ayo kita belajar bareng 15 menit dulu, nanti main game deh!'", "'Kamu bodoh kalau tidak belajar!'", "'Terserah, nanti nilaimu jelek sendiri.'", "'Aku laporkan ke Ayah saja.'"], bestIdx: 0, explanation: "Mengajak dengan cara positif lebih efektif. Belajar bersama membuat suasana menyenangkan.", emoji: "📚" },
  { situation: "Temanmu berkata kasar saat marah.", options: ["'Aku paham kamu marah, tapi yuk gunakan kata-kata yang baik.'", "'Mulutmu sampah! Diam kamu!'", "'Aku tidak sudi bicara denganmu lagi.'", "'Memangnya aku peduli?'"], bestIdx: 0, explanation: "Mengingatkan dengan empati. 'Perkataan yang baik adalah sedekah.' (HR. Bukhari)", emoji: "💬" },
  { situation: "Kamu melihat teman mencontek saat ujian.", options: ["Beri tahu diam-diam: 'Lebih baik jujur walaupun susah, hasilnya berkah nanti.'", "'Awas ya, aku laporkan ke guru!'", "'Bagus, aku juga mau contek dong.'", "'Pura-pura tidak lihat saja.'"], bestIdx: 0, explanation: "Menasihati secara pribadi lebih baik daripada mempermalukan di depan umum. Kejujuran lebih berharga.", emoji: "📝" },
  { situation: "Teman sekelasmu berbeda agama dan kamu ingin mengajaknya mengenal Islam.", options: ["Berteman baik dulu, tunjukkan akhlak Islam yang mulia dengan perbuatan.", "'Agamamu salah! Pindah ke Islam sekarang!'", "'Aku tidak mau berteman dengan yang beda agama.'", "'Diam saja, bukan urusanku.'"], bestIdx: 0, explanation: "Dakwah yang paling efektif adalah dengan akhlak yang baik. 'Berilah kabar gembira, jangan membuat orang lari.' (HR. Muslim)", emoji: "🤝" },
  { situation: "Orang tuamu lelah dan memintamu membereskan kamar, tapi kamu sedang asyik bermain.", options: ["'Baik Bu/Yah. Sebentar ya, 5 menit lagi selesai main, langsung aku bereskan.'", "'Ah, nanti saja! Aku lagi sibuk!'", "'Kenapa harus aku? Suruh kakak saja!'", "Pura-pura tidak mendengar."], bestIdx: 0, explanation: "Merespon dengan sopan dan memberikan kepastian waktu adalah bentuk bakti. 'Ridha Allah ada pada ridha orang tua.'", emoji: "🏠" },
];

function NasihatGameScreen({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "result">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState(NASIHAT_QUESTIONS[0]);
  const [shuffled, setShuffled] = useState<{idx: number; text: string}[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [session, setSession] = useState<MiniGameSession | null>(null);
  const qStartRef = useRef(Date.now());
  const usedRef = useRef(new Set<number>());

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "nasihat");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const endGame = useCallback(() => {
    const avgTime = answerTimes.length > 0 ? answerTimes.reduce((a,b)=>a+b,0)/answerTimes.length : 0;
    const sess = createMiniGameSession(profile, "nasihat", "adab", score, correctCount, Math.round(avgTime*100)/100, answerTimes.length>0?Math.min(...answerTimes):0, answerTimes.length>0?Math.max(...answerTimes):0, 1, profile.difficulty, correctCount, NASIHAT_QUESTIONS.length - qIdx + 1 - correctCount);
    setSession(sess);
    addMiniGameSession(sess);
    setPhase("result");
  }, [answerTimes, profile, score, correctCount, qIdx, addMiniGameSession]);

  const nextQ = useCallback(() => {
    if (qIdx >= NASIHAT_QUESTIONS.length) { endGame(); return; }
    setSelected(null);
    const available = NASIHAT_QUESTIONS.map((_, i) => i).filter(i => !usedRef.current.has(i));
    if (available.length === 0) { endGame(); return; }
    const idx = available[Math.floor(Math.random() * available.length)];
    usedRef.current.add(idx);
    setQuestion(NASIHAT_QUESTIONS[idx]);
    setQIdx(prev => prev + 1);
    setShuffled(shuffleArray(NASIHAT_QUESTIONS[idx].options.map((text, i) => ({ idx: i, text }))));
    qStartRef.current = Date.now();
  }, [qIdx, endGame]);

  const handleSelect = (idx: number) => {
    setSelected(idx);
    const elapsed = (Date.now() - qStartRef.current) / 1000;
    setAnswerTimes(t => [...t, elapsed]);
    if (idx === question.bestIdx) { setScore(s => s + 150); setCorrectCount(c => c + 1); }
    else if (idx === question.acceptableIdx) { setScore(s => s + 80); setCorrectCount(c => c + 1); }
  };

  const startGame = () => { setScore(0); setCorrectCount(0); setAnswerTimes([]); setQIdx(0); usedRef.current = new Set(); setPhase("playing"); nextQ(); };

  useEffect(() => { backRef.current = () => { if (phase === "playing" || phase === "feedback") { onBack(); return true; } if (phase === "result") { setPhase("start"); return true; } return false; }; return () => { backRef.current = null; }; }, [backRef, phase, onBack]);

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="heart" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <div className="text-6xl mb-4">💬</div>
        <h1 className="font-display font-black text-3xl mb-1">Nasihat dengan Lembut</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Pilih kata-kata terbaik untuk menasihati dengan cara yang baik.</p>
        {personalBest > 0 && (<div className="mb-4 p-3 rounded-2xl bg-black/20"><div className="text-xs uppercase opacity-70">Rekor Terbaik</div><div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div></div>)}
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );

  if (phase === "result" && session) return (<MiniGameResultScreen profile={profile} session={session} gameTitle="Nasihat dengan Lembut" gameIcon="💬" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />);

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button onClick={onBack} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95">✕</button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794]">⭐ {score}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] ml-auto">{qIdx}/{NASIHAT_QUESTIONS.length}</div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
        <GameCard tone="cream" className="w-full max-w-sm text-center py-6 mb-4 border-4 shrink-0 border-[#CBB794]">
          <div className="text-3xl mb-2">{question.emoji}</div>
          <p className="font-bold text-sm sm:text-base text-[#5A3515] leading-snug">{question.situation}</p>
        </GameCard>
        {selected !== null && (
          <div className="w-full max-w-sm mb-4">
            <div className={`rounded-2xl p-4 text-sm font-bold border-2 ${selected === question.bestIdx ? "bg-[#E8F5E9] border-[#2E8B12] text-[#2E8B12]" : selected === question.acceptableIdx ? "bg-[#FFF9E6] border-[#D48806] text-[#D48806]" : "bg-[#FFEBEE] border-[#A02020] text-[#A02020]"}`}>
              <p className="leading-relaxed">{question.explanation}</p>
            </div>
            <div className="mt-3"><GameButton variant="primary" size="md" full onClick={nextQ}>{qIdx >= NASIHAT_QUESTIONS.length ? "Lihat Hasil" : "Lanjut →"}</GameButton></div>
          </div>
        )}
        {selected === null && (
          <div className="space-y-2 w-full max-w-sm">
            {shuffled.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(opt.idx)}
                className="w-full text-left p-3 rounded-2xl bg-white border-3 border-[#CBB794] text-[#5A3515] font-bold text-sm shadow-pop active:translate-y-1 transition-all hover:border-[#A02020] flex items-center gap-2">
                <span className="text-lg shrink-0">{["💬","🔷","📌","🔹","💠","🔸"][i % 6]}</span>
                <span className="leading-tight">{opt.text}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════
// Dilema Bijak (for SMP/SMA/Univ)
// ═══════════════════════════

const DILEMA_QUESTIONS = [
  { prompt: "Ketua kelompok adalah teman dekatmu, tapi ia tidak mengerjakan tugasnya. Tindakan paling bijak?", choices: ["Ajak bicara baik-baik, ingatkan tanggung jawabnya", "Diamkan saja karena teman", "Laporkan ke guru tanpa bicara dulu", "Kerjakan sendiri semua tugasnya"], bestIdx: 0, acceptableIdx: undefined, explanation: "Pendekatan personal dulu sebelum eskalasi. Teman sejati saling mengingatkan dalam kebaikan." },
  { prompt: "Kamu melihat atasanmu melakukan kecurangan kecil. Melaporkan bisa membuatmu dipecat. Apa yang kamu lakukan?", choices: ["Nasihati secara pribadi dulu, beri kesempatan berubah", "Laporkan langsung ke pihak berwenang", "Diam dan ikut serta", "Sebarkan gosip ke teman-teman"], bestIdx: 0, explanation: "Amar ma'ruf nahi mungkar dimulai dari cara yang paling lembut. Memberi kesempatan adalah keadilan." },
  { prompt: "Proyek tim deadline besok. Satu anggota tidak mengerjakan bagiannya. Kamu sebagai ketua harus memutuskan.", choices: ["Bantu dia selesaikan malam ini sambil beri feedback", "Keluarkan dia dari tim dan kerjakan sendiri", "Biarkan proyek tidak selesai sebagai pelajaran", "Marahi dia di depan tim"], bestIdx: 0, acceptableIdx: 2, explanation: "Pemimpin bertanggung jawab atas hasil tim. Membantu sambil memberi feedback membangun budaya tim yang baik." },
];

function DilemaGameScreen({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "result">("start");
  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState(DILEMA_QUESTIONS[0]);
  const [shuffled, setShuffled] = useState<{idx: number; text: string}[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [session, setSession] = useState<MiniGameSession | null>(null);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "dilema");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const nextQ = useCallback(() => {
    if (qIdx >= DILEMA_QUESTIONS.length - 1) {
      const sess = createMiniGameSession(profile, "dilema", "adab", score, qIdx + 1, 0, 0, 0, 1, profile.difficulty, qIdx + 1, 0);
      setSession(sess); addMiniGameSession(sess); setPhase("result"); return;
    }
    setSelected(null);
    const next = DILEMA_QUESTIONS[qIdx + 1];
    setQuestion(next);
    setQIdx(prev => prev + 1);
    setShuffled(shuffleArray(next.choices.map((t, i) => ({ idx: i, text: t }))));
  }, [qIdx, score, profile, addMiniGameSession]);

  const startGame = () => { setScore(0); setQIdx(0); setSelected(null); setPhase("playing");
    setQuestion(DILEMA_QUESTIONS[0]);
    setShuffled(shuffleArray(DILEMA_QUESTIONS[0].choices.map((t, i) => ({ idx: i, text: t }))));
  };

  useEffect(() => { backRef.current = () => { if (phase === "playing") { onBack(); return true; } if (phase === "result") { setPhase("start"); return true; } return false; }; return () => { backRef.current = null; }; }, [backRef, phase, onBack]);

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="heart" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <div className="text-6xl mb-4">⚖️</div>
        <h1 className="font-display font-black text-3xl mb-1">Dilema Bijak</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Hadapi situasi yang tidak hitam-putih. Pilih keputusan paling bijaksana.</p>
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );

  if (phase === "result" && session) return (<MiniGameResultScreen profile={profile} session={session} gameTitle="Dilema Bijak" gameIcon="⚖️" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />);

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button onClick={onBack} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95">✕</button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] ml-auto">{qIdx + 1}/{DILEMA_QUESTIONS.length}</div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
        <GameCard tone="cream" className={`w-full max-w-sm text-center py-6 mb-4 border-4 shrink-0 ${selected !== null ? (selected === question.bestIdx ? "border-[#2E8B12] bg-[#E8F5E9]" : "border-[#D48806] bg-[#FFF9E6]") : "border-[#CBB794]"}`}>
          <div className="text-3xl mb-2">⚖️</div>
          <p className="font-bold text-sm sm:text-base text-[#5A3515] leading-snug px-2">{question.prompt}</p>
        </GameCard>
        {selected !== null && (
          <div className="w-full max-w-sm mb-4 p-4 rounded-2xl bg-white/80 border-2 border-[#CBB794]">
            <p className="text-sm font-bold text-[#5A3515]">{question.explanation}</p>
            <div className="mt-3"><GameButton variant="primary" size="md" full onClick={nextQ}>{qIdx >= DILEMA_QUESTIONS.length - 1 ? "Lihat Hasil" : "Lanjut →"}</GameButton></div>
          </div>
        )}
        {selected === null && (
          <div className="space-y-2 w-full max-w-sm">
            {shuffled.map((opt, i) => (
              <button key={i} onClick={() => { setSelected(opt.idx); if (opt.idx === question.bestIdx) setScore(s => s + 150); else if (opt.idx === question.acceptableIdx) setScore(s => s + 80); }}
                className="w-full text-left p-3 rounded-2xl bg-white border-3 border-[#CBB794] text-[#5A3515] font-bold text-sm shadow-pop active:translate-y-1 transition-all hover:border-[#185E9F]">
                <span className="text-lg mr-2">{["💬","🔷","📌","🔹"][i % 4]}</span>{opt.text}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════
// Urutkan Adab
// ═══════════════════════════

interface UrutkanAdabStep {
  id: number;
  text: string;
  correctOrder: number;
}

interface UrutkanAdabQuestion {
  title: string;
  correctSteps: UrutkanAdabStep[];
  shuffledSteps: UrutkanAdabStep[];
  emoji: string;
  explanation?: string;
  successText?: string;
  failureText?: string;
}

function buildUrutkanAdabQuestions(): UrutkanAdabQuestion[] {
  const rawQuestions = [
    { title: "Urutan berwudhu", steps: ["Niat", "Cuci tangan", "Berkumur", "Cuci muka", "Cuci tangan sampai siku", "Usap kepala", "Cuci kaki"], emoji: "💧" },
    { title: "Urutan sebelum makan", steps: ["Cuci tangan", "Duduk", "Baca doa makan (Bismillah)", "Makan dengan tangan kanan", "Baca doa selesai (Alhamdulillah)"], emoji: "🍽️" },
    { title: "Urutan meminjam barang", steps: ["Ucapkan salam", "Minta izin meminjam", "Gunakan dengan hati-hati", "Kembalikan", "Ucapkan terima kasih"], emoji: "🤝" },
    { title: "Urutan masuk masjid", steps: ["Masuk dengan kaki kanan", "Baca doa masuk masjid", "Shalat tahiyatul masjid", "Duduk dengan tenang", "Keluar dengan kaki kiri"], emoji: "🕌" },
  ];

  return rawQuestions.map(q => {
    const correctSteps: UrutkanAdabStep[] = q.steps.map((text, i) => ({
      id: i,
      text,
      correctOrder: i,
    }));

    // Shuffle steps, re-shuffle if same as correct order
    let shuffledSteps: UrutkanAdabStep[];
    do {
      shuffledSteps = shuffleArray(correctSteps);
    } while (shuffledSteps.every((s, i) => s.correctOrder === i));

    return {
      title: q.title,
      correctSteps,
      shuffledSteps,
      emoji: q.emoji,
      successText: "Benar! Ini urutan adab yang baik.",
      failureText: "Belum tepat. Yuk lihat urutan yang lebih baik.",
    };
  });
}

function prepareUrutkanQuestion(raw: UrutkanAdabQuestion): UrutkanAdabQuestion {
  // Re-shuffle for each play
  let shuffledSteps: UrutkanAdabStep[];
  do {
    shuffledSteps = shuffleArray(raw.correctSteps);
  } while (shuffledSteps.every((s, i) => s.correctOrder === i));

  return {
    ...raw,
    shuffledSteps,
  };
}

function UrutkanAdabScreen({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "result">("start");
  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [questions] = useState<UrutkanAdabQuestion[]>(() => buildUrutkanAdabQuestions());
  const [question, setQuestion] = useState<UrutkanAdabQuestion>(questions[0]);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [session, setSession] = useState<MiniGameSession | null>(null);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "urutkan-adab");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const shuffledIds = question.shuffledSteps.map(s => s.id);
  const availableShuffledIds = shuffledIds.filter(id => !userOrder.includes(id));

  const tapStep = (shuffledStepId: number) => {
    if (showResult || (availableShuffledIds.length === 0 && userOrder.length < shuffledIds.length)) return;
    if (!userOrder.includes(shuffledStepId)) {
      setUserOrder(prev => [...prev, shuffledStepId]);
      if (userOrder.length + 1 === shuffledIds.length) {
        // All selected — validate against correct order
        const isCorrect = userOrder.concat(shuffledStepId).every((id, i) => {
          const step = question.correctSteps.find(s => s.id === id);
          return step?.correctOrder === i;
        });
        setShowResult(true);
        if (isCorrect) setScore(s => s + 200);
      }
    }
  };

  const resetSteps = () => { setShowResult(false); setUserOrder([]); };

  const nextQ = () => {
    if (qIdx >= questions.length - 1) {
      const sess = createMiniGameSession(profile, "urutkan-adab", "adab", score, qIdx + 1, 0, 0, 0, 1, profile.difficulty, qIdx + 1, 0);
      setSession(sess); addMiniGameSession(sess); setPhase("result"); return;
    }
    const nextIdx = qIdx + 1;
    setQIdx(nextIdx);
    setQuestion(prepareUrutkanQuestion(questions[nextIdx]));
    resetSteps();
  };

  const startGame = () => {
    setScore(0); setQIdx(0); setShowResult(false);
    setQuestion(prepareUrutkanQuestion(questions[0]));
    setUserOrder([]);
    setPhase("playing");
  };

  useEffect(() => { backRef.current = () => { if (phase === "playing" || phase === "feedback") { onBack(); return true; } if (phase === "result") { setPhase("start"); return true; } return false; }; return () => { backRef.current = null; }; }, [backRef, phase, onBack]);

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="heart" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <div className="text-6xl mb-4">📋</div>
        <h1 className="font-display font-black text-3xl mb-1">Urutkan Adab</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Susun langkah-langkah adab dalam urutan yang benar.</p>
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );

  if (phase === "result" && session) return (<MiniGameResultScreen profile={profile} session={session} gameTitle="Urutkan Adab" gameIcon="📋" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />);

  // Check if the final answer is correct
  const isAnswerCorrect = showResult && userOrder.length === shuffledIds.length &&
    userOrder.every((id, i) => {
      const step = question.correctSteps.find(s => s.id === id);
      return step?.correctOrder === i;
    });

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button onClick={onBack} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95">✕</button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] ml-auto">{qIdx + 1}/{questions.length}</div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
        <GameCard tone="cream" className={`w-full max-w-sm text-center py-6 mb-4 border-4 shrink-0 ${showResult ? (isAnswerCorrect ? "border-[#2E8B12] bg-[#E8F5E9]" : "border-[#A02020] bg-[#FFEBEE]") : "border-[#CBB794]"}`}>
          <div className="text-3xl mb-2">{question.emoji}</div>
          <h2 className="font-display font-black text-xl text-[#5A3515]">{question.title}</h2>
        </GameCard>
        {showResult && (
          <div className="w-full max-w-sm mb-4 space-y-1">
            {isAnswerCorrect ? (
              <div className="mb-2 p-3 rounded-xl bg-[#E8F5E9] text-[#2E8B12] text-sm font-bold text-center border border-[#2E8B12]/30">
                {question.successText || "Benar! Ini urutan adab yang baik."}
              </div>
            ) : (
              <div className="mb-2 p-3 rounded-xl bg-[#FFEBEE] text-[#A02020] text-sm font-bold text-center border border-[#A02020]/30">
                {question.failureText || "Belum tepat. Yuk lihat urutan yang lebih baik."}
              </div>
            )}
            <div className="text-xs font-bold text-[#8C6B45] mb-2">Urutan yang benar:</div>
            {question.correctSteps.sort((a, b) => a.correctOrder - b.correctOrder).map((s, i) => {
              const userSelectedId = userOrder[i];
              const isStepCorrect = userSelectedId === s.id;
              return (
                <div key={s.id} className={`p-2 rounded-xl text-sm font-bold flex items-center gap-2 ${isStepCorrect ? "bg-[#E8F5E9] text-[#2E8B12]" : "bg-[#FFEBEE] text-[#A02020]"}`}>
                  <span>{i + 1}.</span><span>{s.text}</span>
                  <span className="ml-auto">{isStepCorrect ? "✅" : "❌"}</span>
                </div>
              );
            })}
            <div className="mt-3"><GameButton variant="primary" size="md" full onClick={nextQ}>{qIdx >= questions.length - 1 ? "Lihat Hasil" : "Lanjut →"}</GameButton></div>
          </div>
        )}
        {!showResult && (
          <div className="space-y-2 w-full max-w-sm">
            <div className="text-xs font-bold text-[#8C6B45] mb-1">Tap langkah sesuai urutan (1, 2, 3...)</div>
            {question.shuffledSteps.map((s) => {
              const tapped = userOrder.includes(s.id);
              const order = userOrder.indexOf(s.id);
              return (
                <button key={s.id} onClick={() => tapStep(s.id)} disabled={tapped}
                  className={`w-full text-left p-3 rounded-2xl border-3 font-bold text-sm transition-all ${tapped ? "bg-[#E8F5E9] border-[#2E8B12] text-[#2E8B12]" : "bg-white border-[#CBB794] text-[#5A3515] hover:border-[#185E9F]"} shadow-pop active:translate-y-1`}>
                  {tapped ? `✅ ${order + 1}. ${s.text}` : `${s.text}`}
                </button>
              );
            })}
            {userOrder.length > 0 && (
              <button onClick={resetSteps} className="w-full py-2 text-xs font-bold text-[#A02020] underline">🔄 Ulangi susunan</button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export { NasihatGameScreen as NasihatLembutScreen, DilemaGameScreen as DilemaBijakScreen, UrutkanAdabScreen };
