/**
 * Pilih Kesimpulan + Detektif Petunjuk + Tebak Aturan — Logic mini-games
 * Combined in one file for efficiency
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

// ═══════════════════════════════════════
// Shared Mini-Game Framework
// ═══════════════════════════════════════

interface Question {
  prompt: string;
  choices: string[];
  correctIdx: number;
  explanation: string;
}

type GamePhase = "start" | "playing" | "feedback" | "result";

function LogicGameScreen({
  profile, onBack, backRef, title, icon, questions, gameId, packageId,
}: {
  profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null>;
  title: string; icon: string; questions: Question[];
  gameId: string; packageId: import("@/types").MiniGamePackageId;
}) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<GamePhase>("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState<Question>(questions[0]);
  const [shuffled, setShuffled] = useState<{idx: number; text: string}[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [session, setSession] = useState<MiniGameSession | null>(null);
  const qStartRef = useRef(Date.now());
  const usedRef = useRef(new Set<number>());

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === gameId);
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const endGame = useCallback(() => {
    const avgTime = answerTimes.length > 0 ? answerTimes.reduce((a,b)=>a+b,0)/answerTimes.length : 0;
    const sess = createMiniGameSession(profile, gameId, packageId, score, correctCount, Math.round(avgTime*100)/100, answerTimes.length>0?Math.min(...answerTimes):0, answerTimes.length>0?Math.max(...answerTimes):0, 1, profile.difficulty, correctCount+wrongCount, wrongCount);
    setSession(sess);
    addMiniGameSession(sess);
    setPhase("result");
  }, [answerTimes, profile, score, correctCount, wrongCount, gameId, packageId, addMiniGameSession]);

  const nextQ = useCallback(() => {
    if (correctCount + wrongCount >= Math.min(questions.length, 15)) { endGame(); return; }
    setSelectedIdx(null);
    const available = questions.map((_, i) => i).filter(i => !usedRef.current.has(i));
    if (available.length === 0) { usedRef.current.clear(); available.push(...questions.map((_, i) => i)); }
    const idx = available[Math.floor(Math.random() * available.length)];
    usedRef.current.add(idx);
    const q = questions[idx];
    setQuestion(q);
    setQIdx(prev => prev + 1);
    setShuffled(shuffleArray(q.choices.map((text, i) => ({ idx: i, text }))));
    qStartRef.current = Date.now();
  }, [correctCount, wrongCount, questions, endGame]);

  const handleSelect = (idx: number) => {
    const elapsed = (Date.now() - qStartRef.current) / 1000;
    setSelectedIdx(idx);
    setAnswerTimes(t => [...t, elapsed]);
    if (idx === question.correctIdx) {
      setScore(s => s + 100 + Math.round(Math.min(elapsed, 30) * 3));
      setCorrectCount(c => c + 1);
    } else {
      setWrongCount(w => w + 1);
    }
  };

  const startGame = () => { setScore(0); setCorrectCount(0); setWrongCount(0); setAnswerTimes([]); usedRef.current = new Set(); setPhase("playing"); setCorrectCount(0); nextQ(); };

  useEffect(() => { backRef.current = () => { if (phase === "playing" || phase === "feedback") { onBack(); return true; } if (phase === "result") { setPhase("start"); return true; } return false; }; return () => { backRef.current = null; }; }, [backRef, phase, onBack]);

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="blue" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="font-display font-black text-3xl mb-1">{title}</h1>
        <p className="text-sm font-bold opacity-80 mb-4">{questions.length} soal menanti!</p>
        {personalBest > 0 && (<div className="mb-4 p-3 rounded-2xl bg-black/20"><div className="text-xs uppercase opacity-70">Rekor Terbaik</div><div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div></div>)}
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );

  if (phase === "result" && session) return (
    <MiniGameResultScreen profile={profile} session={session} gameTitle={title} gameIcon={icon} isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />
  );

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button onClick={onBack} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95">✕</button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794]">⭐ {score}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] ml-auto">{correctCount + wrongCount}/{Math.min(questions.length, 15)}</div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
        <GameCard tone="cream" className={`w-full max-w-sm py-6 mb-4 border-4 shrink-0 ${selectedIdx !== null ? (selectedIdx === question.correctIdx ? "border-[#2E8B12] bg-[#E8F5E9]" : "border-[#A02020] bg-[#FFEBEE]") : "border-[#CBB794]"}`}>
          <div className="px-3">
            {question.prompt.split("\n").map((line, i) => (
              <p key={i} className={`font-bold text-sm sm:text-base text-[#5A3515] leading-snug ${i > 0 ? "mt-0.5" : ""}`}>{line}</p>
            ))}
          </div>
        </GameCard>
        {selectedIdx !== null && (
          <div className="w-full max-w-sm mb-4 p-4 rounded-2xl bg-white/80 border-2 border-[#CBB794]">
            <p className="text-sm font-bold text-[#5A3515]">{question.explanation}</p>
            <div className="mt-3"><GameButton variant="primary" size="md" full onClick={nextQ}>{correctCount + wrongCount >= Math.min(questions.length, 15) ? "Lihat Hasil" : "Lanjut →"}</GameButton></div>
          </div>
        )}
        {selectedIdx === null && (
          <div className="space-y-2 w-full max-w-sm">
            {shuffled.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(opt.idx)}
                className="w-full text-left p-3 rounded-2xl bg-white border-3 border-[#CBB794] text-[#5A3515] font-bold text-sm shadow-pop active:translate-y-1 transition-all hover:border-[#185E9F]">
                <span className="text-lg mr-2">{String.fromCharCode(65 + i)}.</span>{opt.text}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════
// Game Data
// ═══════════════════════════════════════

const KESIMPULAN_QUESTIONS: Question[] = [
  { prompt: "Semua murid hadir. Ahmad adalah murid. Maka...", choices: ["Ahmad hadir", "Ahmad tidak hadir", "Ahmad guru", "Tidak bisa diketahui"], correctIdx: 0, explanation: "Karena semua murid hadir dan Ahmad adalah murid, maka Ahmad pasti hadir." },
  { prompt: "Jika hujan, jalan basah. Sekarang jalan basah. Maka...", choices: ["Pasti hujan", "Mungkin hujan, mungkin tidak", "Tidak mungkin hujan", "Jalan pasti kering"], correctIdx: 1, explanation: "Jalan basah tidak selalu berarti hujan. Bisa juga karena disiram atau banjir." },
  { prompt: "Semua buah mengandung vitamin. Apel adalah buah. Maka...", choices: ["Apel mengandung vitamin", "Apel tidak mengandung vitamin", "Apel adalah sayur", "Tidak bisa diketahui"], correctIdx: 0, explanation: "Karena semua buah mengandung vitamin dan apel adalah buah, maka apel mengandung vitamin." },
  { prompt: "Ani lebih tinggi dari Budi. Budi lebih tinggi dari Cici. Siapa paling pendek?", choices: ["Ani", "Budi", "Cici", "Sama tinggi"], correctIdx: 2, explanation: "Urutan: Ani > Budi > Cici. Cici paling pendek." },
  { prompt: "Setiap hari sabtu Ahmad berenang. Hari ini sabtu. Maka...", choices: ["Ahmad pasti berenang", "Ahmad mungkin berenang", "Ahmad tidak berenang", "Ini bukan hari sabtu"], correctIdx: 0, explanation: "Karena setiap sabtu Ahmad berenang, dan hari ini sabtu, maka Ahmad berenang." },
  { prompt: "Beberapa burung bisa berenang. Penguin adalah burung. Maka...", choices: ["Penguin pasti bisa terbang", "Penguin mungkin bisa berenang", "Penguin pasti bisa berenang", "Penguin bukan burung"], correctIdx: 1, explanation: "Hanya BEBERAPA burung bisa berenang. Kita tidak tahu apakah penguin termasuk." },
  { prompt: "Semua logam menghantarkan listrik. Besi adalah logam. Maka...", choices: ["Besi menghantarkan listrik", "Besi tidak menghantarkan listrik", "Besi adalah plastik", "Tidak bisa diketahui"], correctIdx: 0, explanation: "Karena semua logam menghantarkan listrik dan besi adalah logam, maka besi menghantarkan listrik." },
  { prompt: "Jika kita jujur, orang percaya. Ahmad jujur. Maka...", choices: ["Orang percaya Ahmad", "Orang tidak percaya Ahmad", "Ahmad pembohong", "Tidak ada hubungannya"], correctIdx: 0, explanation: "Karena jujur membuat orang percaya, dan Ahmad jujur, maka orang percaya Ahmad." },
  { prompt: "Semua mamalia menyusui. Paus adalah mamalia. Maka...", choices: ["Paus menyusui anaknya", "Paus bertelur", "Paus adalah ikan", "Paus tidak menyusui"], correctIdx: 0, explanation: "Paus adalah mamalia laut. Semua mamalia menyusui anaknya, termasuk paus." },
  { prompt: "Beberapa siswa membawa bekal. Siti adalah siswa. Maka...", choices: ["Siti pasti bawa bekal", "Siti mungkin bawa bekal", "Siti tidak bawa bekal", "Siti bukan siswa"], correctIdx: 1, explanation: "Hanya BEBERAPA siswa yang bawa bekal. Siti mungkin bawa, mungkin tidak." },
];

const DETEKTIF_QUESTIONS: Question[] = [
  { prompt: "Ali lebih tinggi dari Budi. Budi lebih tinggi dari Cici. Hasan lebih pendek dari Cici. Siapa paling pendek?", choices: ["Ali", "Budi", "Cici", "Hasan"], correctIdx: 3, explanation: "Ali > Budi > Cici > Hasan. Hasan paling pendek." },
  { prompt: "Ada 4 rumah berjajar: merah, biru, hijau, kuning. Rumah merah di ujung kiri. Rumah biru di samping hijau. Di mana rumah kuning?", choices: ["Ujung kiri", "Antara merah dan biru", "Ujung kanan", "Antara hijau dan biru"], correctIdx: 2, explanation: "Urutan: Merah - ? - ? - ?. Biru di samping hijau. Kuning di ujung kanan." },
  { prompt: "Ibu membeli 3 buah: apel, jeruk, dan mangga. Apel bukan yang termahal. Mangga lebih mahal dari jeruk. Mana yang termurah?", choices: ["Apel", "Jeruk", "Mangga", "Semua sama"], correctIdx: 1, explanation: "Mangga > Apel > Jeruk. Jeruk paling murah." },
  { prompt: "Di perpustakaan, buku matematika di sebelah kiri buku bahasa. Buku IPA di sebelah kanan buku bahasa. Buku apa di tengah?", choices: ["Matematika", "Bahasa", "IPA", "Tidak bisa diketahui"], correctIdx: 1, explanation: "Urutan: Matematika - Bahasa - IPA. Buku Bahasa di tengah." },
  { prompt: "Rani lebih cepat dari Dewi. Siska lebih lambat dari Dewi. Siapa paling cepat?", choices: ["Rani", "Dewi", "Siska", "Tidak bisa diketahui"], correctIdx: 0, explanation: "Rani > Dewi > Siska. Rani paling cepat." },
];

const TEBAK_ATURAN_QUESTIONS: Question[] = [
  { prompt: "2 → 5\n4 → 9\n6 → 13\n8 → ?", choices: ["15", "17", "19", "21"], correctIdx: 1, explanation: "Aturan: x2 + 1. 8×2+1 = 17." },
  { prompt: "1 → 1\n2 → 4\n3 → 9\n4 → ?", choices: ["12", "16", "20", "25"], correctIdx: 1, explanation: "Aturan: kuadrat. 4² = 16." },
  { prompt: "3 → 10\n5 → 16\n7 → 22\n9 → ?", choices: ["26", "28", "30", "32"], correctIdx: 1, explanation: "Aturan: x3 + 1. 9×3+1 = 28." },
  { prompt: "🔴🟡 → 🟠\n🔵🟡 → 🟢\n🔴🔵 → ?", choices: ["🟣", "🟤", "⚫", "🟡"], correctIdx: 0, explanation: "Aturan: campuran warna. Merah+Biru = Ungu." },
  { prompt: "A → 1\nB → 2\nC → 3\nE → ?", choices: ["4", "5", "6", "7"], correctIdx: 1, explanation: "Aturan: posisi alfabet. A=1, B=2, C=3, D=4, E=5." },
  { prompt: "10 → 5\n20 → 10\n30 → 15\n50 → ?", choices: ["20", "25", "30", "35"], correctIdx: 1, explanation: "Aturan: dibagi 2. 50÷2 = 25." },
];

// ═══════════════════════════════════════
// Exported Screens
// ═══════════════════════════════════════

export function PilihKesimpulanScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <LogicGameScreen {...props} title="Pilih Kesimpulan" icon="💡" questions={KESIMPULAN_QUESTIONS} gameId="pilih-kesimpulan" packageId="logika" />;
}
export function DetektifScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <LogicGameScreen {...props} title="Detektif Petunjuk" icon="🕵️" questions={DETEKTIF_QUESTIONS} gameId="detektif-petunjuk" packageId="logika" />;
}
export function TebakAturanScreen(props: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  return <LogicGameScreen {...props} title="Tebak Aturan" icon="📐" questions={TEBAK_ATURAN_QUESTIONS} gameId="tebak-aturan" packageId="logika" />;
}
