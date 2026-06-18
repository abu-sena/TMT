/**
 * Benar atau Salah — True/False mini-game
 * Logika package
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { Profile, MiniGameSession } from "@/types";
import { createMiniGameSession } from "@/lib/minigame-engine";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { MiniGameResultScreen } from "./MiniGameResultScreen";
import { useGameStore } from "@/lib/storage";
import type React from "react";

interface Props { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null>; }

const STATEMENTS = [
  { text: "Semua kucing berkaki empat.", answer: true, explain: "Benar! Semua kucing memang berkaki empat." },
  { text: "Matahari terbit dari barat.", answer: false, explain: "Salah! Matahari terbit dari timur." },
  { text: "Air mendidih pada suhu 100°C di permukaan laut.", answer: true, explain: "Benar! Titik didih air adalah 100°C pada tekanan normal." },
  { text: "Semua burung bisa terbang.", answer: false, explain: "Salah! Ada burung yang tidak bisa terbang seperti penguin dan burung unta." },
  { text: "Indonesia adalah negara kepulauan.", answer: true, explain: "Benar! Indonesia adalah negara kepulauan terbesar di dunia." },
  { text: "1 + 1 = 3", answer: false, explain: "Salah! 1 + 1 = 2." },
  { text: "Bulan mengelilingi bumi.", answer: true, explain: "Benar! Bulan adalah satelit alami bumi." },
  { text: "Ikan bernapas dengan paru-paru.", answer: false, explain: "Salah! Ikan bernapas dengan insang." },
  { text: "Tumbuhan membuat makanan sendiri melalui fotosintesis.", answer: true, explain: "Benar! Tumbuhan menggunakan cahaya matahari untuk membuat makanan." },
  { text: "Semua logam bisa mengapung di air.", answer: false, explain: "Salah! Kebanyakan logam tenggelam di air." },
  { text: "Jujur adalah akhlak terpuji.", answer: true, explain: "Benar! Kejujuran adalah sifat yang mulia." },
  { text: "Berbohong itu baik.", answer: false, explain: "Salah! Berbohong adalah perbuatan tercela." },
  { text: "Segitiga memiliki 3 sisi.", answer: true, explain: "Benar! Segitiga selalu memiliki 3 sisi." },
  { text: "Semua persegi panjang adalah persegi.", answer: false, explain: "Salah! Persegi panjang bisa memiliki panjang dan lebar berbeda. Persegi adalah persegi panjang dengan semua sisi sama." },
  { text: "Al-Quran adalah kitab suci umat Islam.", answer: true, explain: "Benar! Al-Quran adalah pedoman hidup umat Islam." },
  { text: "Senyum adalah sedekah.", answer: true, explain: "Benar! Rasulullah SAW bersabda bahwa senyum adalah sedekah." },
  { text: "Membantu orang tua adalah perbuatan tercela.", answer: false, explain: "Salah! Membantu orang tua adalah perbuatan mulia dan berbakti." },
  { text: "Air hujan berasal dari awan.", answer: true, explain: "Benar! Hujan turun dari awan yang mengandung uap air." },
  { text: "Setiap hari minggu adalah hari senin.", answer: false, explain: "Salah! Minggu dan Senin adalah hari yang berbeda." },
  { text: "Belajar dengan tekun akan membuat kita pintar.", answer: true, explain: "Benar! Belajar dengan tekun akan menambah pengetahuan." },
];

export function BenarSalahScreen({ profile, onBack, backRef }: Props) {
  const { addMiniGameSession, store } = useGameStore();
  const [screen, setScreen] = useState<"start" | "playing" | "feedback" | "result">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState(STATEMENTS[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerCount, setTimerCount] = useState(20);
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [session, setSession] = useState<MiniGameSession | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qStartRef = useRef(Date.now());
  const usedRef = useRef(new Set<number>());

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "benar-atau-salah");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const clearTimers = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const endGame = useCallback(() => {
    clearTimers();
    const totalQ = correctCount + wrongCount;
    const avgTime = answerTimes.length > 0 ? answerTimes.reduce((a,b)=>a+b,0)/answerTimes.length : 0;
    const sess = createMiniGameSession(profile, "benar-atau-salah", "logika", score, correctCount, Math.round(avgTime*100)/100, answerTimes.length>0?Math.min(...answerTimes):0, answerTimes.length>0?Math.max(...answerTimes):0, 1, profile.difficulty, totalQ, wrongCount);
    setSession(sess);
    addMiniGameSession(sess);
    setScreen("result");
  }, [clearTimers, answerTimes, profile, score, correctCount, wrongCount, addMiniGameSession]);

  const nextQuestion = useCallback(() => {
    clearTimers();
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (correctCount + wrongCount >= 20) { endGame(); return; }

    const available = STATEMENTS.map((_, i) => i).filter(i => !usedRef.current.has(i));
    if (available.length === 0) { usedRef.current.clear(); available.push(...STATEMENTS.map((_, i) => i)); }
    const idx = available[Math.floor(Math.random() * available.length)];
    usedRef.current.add(idx);

    setQuestion(STATEMENTS[idx]);
    setQIndex(prev => prev + 1);
    setTimerCount(profile.difficulty === "tk" ? 15 : profile.difficulty === "sd-bawah" ? 12 : 10);
    qStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimerCount(t => { if (t <= 1) { clearTimers(); handleTimeout(); return 0; } return t - 1; });
    }, 1000);
  }, [correctCount, wrongCount, profile.difficulty, clearTimers, endGame]);

  const handleTimeout = () => { setWrongCount(w => w + 1); setSelectedAnswer(null); setShowFeedback(true); };

  const handleAnswer = (ans: boolean) => {
    clearTimers();
    const elapsed = (Date.now() - qStartRef.current) / 1000;
    setSelectedAnswer(ans);
    setShowFeedback(true);
    setAnswerTimes(t => [...t, elapsed]);

    if (ans === question.answer) {
      const speedBonus = Math.round((timerCount / 10) * 30);
      setScore(s => s + 100 + speedBonus);
      setCorrectCount(c => c + 1);
    } else {
      setWrongCount(w => w + 1);
    }
  };

  const startGame = () => {
    setScore(0); setCorrectCount(0); setWrongCount(0); setAnswerTimes([]);
    usedRef.current = new Set();
    setScreen("playing");
    nextQuestion();
  };

  useEffect(() => () => clearTimers(), [clearTimers]);
  useEffect(() => { backRef.current = () => { if (screen === "playing") { clearTimers(); onBack(); return true; } if (screen === "result") { setScreen("start"); return true; } return false; }; return () => { backRef.current = null; }; }, [backRef, screen, onBack, clearTimers]);

  if (screen === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="blue" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="font-display font-black text-3xl mb-1">Benar atau Salah</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Tentukan apakah pernyataan ini benar atau salah! 20 soal.</p>
        {personalBest > 0 && (<div className="mb-4 p-3 rounded-2xl bg-black/20"><div className="text-xs uppercase opacity-70">Rekor Terbaik</div><div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div></div>)}
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );

  if (screen === "result" && session) return (
    <MiniGameResultScreen profile={profile} session={session} gameTitle="Benar atau Salah" gameIcon="✅" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setScreen("start")} />
  );

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button onClick={() => { clearTimers(); onBack(); }} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shadow-sm shrink-0 active:scale-95">✕</button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794]">⭐ {score}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] ml-auto">{correctCount + wrongCount}/20</div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center min-h-0">
        <GameCard tone="cream" className={`w-full max-w-sm text-center py-8 mb-4 border-4 shrink-0 ${showFeedback ? (selectedAnswer === question.answer ? "border-[#2E8B12] bg-[#E8F5E9]" : "border-[#A02020] bg-[#FFEBEE]") : "border-[#CBB794]"}`}>
          <p className="font-bold text-lg sm:text-xl text-[#5A3515] leading-snug px-4">{question.text}</p>
        </GameCard>
        {showFeedback && (
          <div className="w-full max-w-sm mb-4 p-4 rounded-2xl bg-white/80 border-2 border-[#CBB794]">
            <p className="text-sm font-bold text-[#5A3515]">{question.explain}</p>
            <div className="mt-3"><GameButton variant="primary" size="md" full onClick={nextQuestion}>{correctCount + wrongCount >= 20 ? "Lihat Hasil" : "Lanjut →"}</GameButton></div>
          </div>
        )}
        {!showFeedback && (
          <div className="flex gap-3 w-full max-w-sm">
            <button onClick={() => handleAnswer(true)} className="flex-1 py-6 rounded-2xl bg-gradient-meadow border-b-4 border-[#2E8B12] text-white font-black text-2xl shadow-lg active:translate-y-1 active:border-b-0 transition-all">✅ Benar</button>
            <button onClick={() => handleAnswer(false)} className="flex-1 py-6 rounded-2xl bg-gradient-heart border-b-4 border-[#A02020] text-white font-black text-2xl shadow-lg active:translate-y-1 active:border-b-0 transition-all">❌ Salah</button>
          </div>
        )}
      </main>
      <div className="text-center text-xs font-bold text-[#8C6B45]/70 pt-2 shrink-0">⏱ {timerCount}s</div>
    </div>
  );
}
