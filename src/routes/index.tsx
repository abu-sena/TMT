import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import type { BadgeDef, Mission, ScreenId } from "@/types";
import { CATEGORIES, DIFFICULTY_UI_LABELS } from "@/data/constants";
import { applyXP } from "@/lib/leveling";
import {
  checkBadges,
  missionsForDifficulty,
  newlyUnlockedBadges,
  isFinalStage,
  hasClaimedDifficultyCompletionReward,
  hasCompletedStage500,
  getDifficultyCompletionRewardDef,
  markFinalRewardPending,
  claimDifficultyCompletionReward,
  unlockNextDifficulty,
  getNextDifficulty,
  hasAnyPendingFinalRewards,
  getPendingFinalRewardDifficulty,
  setPendingDifficultyUpgrade,
  clearPendingDifficultyUpgrade,
  isFirstCompletion,
} from "@/lib/progress";
import { scoreMission } from "@/lib/scoring";
import { createProfile, useGameStore } from "@/lib/storage";
import { MISSIONS } from "@/data/missions";

import { SplashScreen } from "@/screens/SplashScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { ProfileSelectScreen } from "@/screens/ProfileSelectScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { MapScreen } from "@/screens/MapScreen";
import { PlayScreen } from "@/screens/PlayScreen";
import { ResultScreen } from "@/screens/ResultScreen";
import { BadgesScreen } from "@/screens/BadgesScreen";
import { StatsScreen } from "@/screens/StatsScreen";
import { DailyMissionsScreen } from "@/screens/DailyMissionsScreen";
import { MiniGameCenter } from "@/screens/MiniGameCenter";
import { MiniGameHitungScreen } from "@/screens/MiniGameHitungScreen";
import { MiniGamePolaScreen } from "@/screens/MiniGamePolaScreen";
import { MiniGameIngatanScreen } from "@/screens/MiniGameIngatanScreen";
import { MiniGameAdabScreen } from "@/screens/MiniGameAdabScreen";
import { CariBerbedaScreen } from "@/screens/MiniGameCariBerbedaScreen";
import { BenarSalahScreen } from "@/screens/MiniGameBenarSalahScreen";
import { PilihKesimpulanScreen, DetektifScreen, TebakAturanScreen } from "@/screens/MiniGameLogikaScreens";
import { ColorCodeGame } from "@/screens/MiniGameColorCodeScreen";
import { NasihatLembutScreen, DilemaBijakScreen, UrutkanAdabScreen } from "@/screens/MiniGameAdabScreens";
import { UbahPosisiGame, CocokBayanganGame, JalurTercepatGame, MisiKeluargaScreen } from "@/screens/MiniGameSpasialKeluargaScreens";
import { MiniGameRantaiWarnaScreen } from "@/screens/MiniGameRantaiWarnaScreen";
import { MiniGameJalurAngkaScreen } from "@/screens/MiniGameJalurAngkaScreen";
import { BattleScreen } from "@/screens/BattleScreen";
import { ParentScreen } from "@/screens/ParentScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { PrivacyScreen } from "@/screens/PrivacyScreen";
import { RewardSetupScreen } from "@/screens/RewardSetupScreen";
import { MyRewardsScreen } from "@/screens/MyRewardsScreen";
import { MissionPopup } from "@/components/missions/MissionPopup";
import { ParentGate } from "@/components/safety/ParentGate";
import { ScreenTimeReminder } from "@/components/safety/ScreenTimeReminder";
import { DifficultyCompletionBox } from "@/components/rewards/DifficultyCompletionBox";
import { DifficultyUnlockModal } from "@/components/rewards/DifficultyUnlockModal";
import { MasteryCompleteModal } from "@/components/rewards/MasteryCompleteModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TMT — Petualangan Ilmu & Akhlak" },
      { name: "description", content: "Game edukasi anak Indonesia. Tingkatkan adab, nalar, dan kepemimpinan lewat misi seru yang bisa dimainkan offline." },
      { property: "og:title", content: "TMT — Petualangan Ilmu & Akhlak" },
      { property: "og:description", content: "Game edukasi anak Indonesia. Tingkatkan adab, nalar, dan kepemimpinan lewat misi seru." },
    ],
  }),
  component: GameApp,
});

interface ResultData {
  mission: Mission;
  isCorrect: boolean;
  stars: number;
  finalPoint: number;
  xpGain: number;
  leveledUp: boolean;
  newBadges: BadgeDef[];
  breakdown: any;
  bossStepResults?: any[];
  isFirstCompletion: boolean;
}

function GameApp() {
  const {
    hydrated,
    store,
    activeProfile,
    setOnboardingDone,
    addProfile,
    selectProfile,
    updateProfile,
    deleteProfile,
    resetProfileProgress,
    exportDebugSnapshot,
    exportProfile,
  } = useGameStore();

  const [screen, setScreen] = useState<ScreenId>("splash");
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [popupMission, setPopupMission] = useState<Mission | null>(null);
  const [lastResult, setLastResult] = useState<ResultData | null>(null);
  // Screen time tracking
  const sessionStartRef = useRef(Date.now());
  const screenTimeReminderOpenRef = useRef(false);
  const [screenTimeReminderOpen, setScreenTimeReminderOpen] = useState(false);
  const [screenTimeMinutes, setScreenTimeMinutes] = useState(0);
  const [parentGateOpen, setParentGateOpen] = useState(false);
  const [homeToast, setHomeToast] = useState(false);
  const homeToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dummyBackRef = useRef<(() => boolean) | null>(null); // SSR dummy — no Capacitor

  // Stage 500 difficulty completion flow
  const [completionBoxOpen, setCompletionBoxOpen] = useState(false);
  const [completionDifficulty, setCompletionDifficulty] = useState<string | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [masteryModalOpen, setMasteryModalOpen] = useState(false);
  const [pendingCompletion, setPendingCompletion] = useState(false);

  // Sync ref with state so interval closure always sees latest value
  useEffect(() => {
    screenTimeReminderOpenRef.current = screenTimeReminderOpen;
  }, [screenTimeReminderOpen]);

  // Check screen time when profile changes
  useEffect(() => {
    if (activeProfile?.settings?.screenTimeReminder && activeProfile.settings.screenTimeMinutes > 0) {
      sessionStartRef.current = Date.now();
      screenTimeReminderOpenRef.current = false;
      setScreenTimeReminderOpen(false);
      const limit = activeProfile.settings.screenTimeMinutes * 60 * 1000;
      const timer = setInterval(() => {
        const elapsed = Date.now() - sessionStartRef.current;
        if (elapsed >= limit && !screenTimeReminderOpenRef.current) {
          setScreenTimeReminderOpen(true);
          setScreenTimeMinutes(activeProfile.settings.screenTimeMinutes);
        }
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [activeProfile?.settings?.screenTimeReminder, activeProfile?.settings?.screenTimeMinutes]);

  // Show parent gate when navigating to parent dashboard
  useEffect(() => {
    if (screen === "parent") {
      setParentGateOpen(true);
    }
  }, [screen]);

  const onSplashDone = () => {
    if (!store.onboardingDone) setScreen("onboarding");
    else if (!activeProfile) setScreen("profile-select");
    else setScreen("home");
  };

  const onStartOnboarding = () => {
    setOnboardingDone();
    setScreen("profile-select");
  };

  // ----- MISSION FLOW -----
  const orderedMissions = useMemo(
    () => (activeProfile ? missionsForDifficulty(activeProfile.difficulty) : []),
    [activeProfile],
  );

  const startMission = (m: Mission) => {
    setActiveMission(m);
    setPopupMission(null);
    setScreen("play");
  };

  const handleFinishMission = (result: {
    isCorrect: boolean;
    hintsUsed: number;
    attempts: number;
    selectedId: string;
    elapsedSeconds: number;
    isBestChoice: boolean;
    bossStepResults?: any[];
  }) => {
    if (!activeMission || !activeProfile) return;

    // Guard: ensure profile hasn't changed since mission started
    const currentProfile = store.profiles.find(p => p.id === activeProfile.id);
    if (!currentProfile) return;
    const prev = currentProfile;

    // ── Determine if this is a first completion or replay ──
    const prevProgress = prev.missionProgress[activeMission.id];
    const prevCompletedCount = prevProgress?.completedCount ?? 0;
    const priorStars = prevProgress?.stars ?? 0;
    const isFirstCompletion = prevCompletedCount === 0 && result.isCorrect;
    const isReplay = prevCompletedCount >= 1 && result.isCorrect;

    // ── Calculate reward multiplier ──
    // First completion: multiplier = 1.0 (full reward)
    // Replay: multiplier = 0.25 (1/4 reward)
    const rewardMultiplier = isFirstCompletion ? 1.0 : (isReplay ? 0.25 : 1.0);

    const score = scoreMission({
      mission: activeMission,
      isCorrect: result.isCorrect,
      hintsUsed: result.hintsUsed,
      attempts: result.attempts,
      streak: prev.streak,
      adabApplied: true,
      isBestChoice: result.isBestChoice,
      elapsedSeconds: result.elapsedSeconds,
    });

    // Apply reward multiplier for replay
    const awardedPoints = Math.max(0, Math.floor(score.finalPoint * rewardMultiplier));
    const awardedXP = Math.max((result.isCorrect ? 1 : 0), Math.floor(score.xpGain * rewardMultiplier));
    const awardedCoins = result.isCorrect
      ? Math.floor((activeMission.isBossMission ? 25 : 5) * rewardMultiplier)
      : 0;

    const xpResult = applyXP(prev, awardedXP);

    // categoryStats — count primary and secondary categories
    const stats = { ...prev.categoryStats };
    const cats = [activeMission.category, activeMission.secondaryCategory].filter(Boolean) as (typeof CATEGORIES)[number]["id"][];
    for (const c of cats) {
      stats[c] = {
        correct: stats[c].correct + (result.isCorrect ? 1 : 0),
        total: stats[c].total + 1,
      };
    }

    // For boss missions, also count step categories
    if (result.bossStepResults && activeMission.missionType === "boss_mission") {
      const bossMission = activeMission as any;
      if (bossMission.steps) {
        for (let i = 0; i < bossMission.steps.length; i++) {
          const step = bossMission.steps[i];
          const stepResult = result.bossStepResults[i];
          const catId = step?.category as "literasi-numerasi" | "spasial" | "pola" | "kreativitas" | "systems" | "moral" | "penalaran" | undefined;
          if (catId && stepResult && stats[catId]) {
            stats[catId] = {
              correct: stats[catId].correct + (stepResult.isCorrect ? 1 : 0),
              total: stats[catId].total + 1,
            };
          }
        }
      }
    }

    const priorBest = prevProgress?.bestPoints ?? 0;
    const newStars = Math.max(priorStars, score.stars);
    const newBestPoints = Math.max(priorBest, score.finalPoint);
    const wasNewlyCompleted = priorStars === 0 && score.stars > 0;
    const newCompletedCount = prevCompletedCount + (wasNewlyCompleted ? 1 : 0);

    // Track play time: add elapsed seconds converted to minutes (rounded up to nearest minute)
    const minutesPlayed = Math.ceil(result.elapsedSeconds / 60);

    // Check adab: primary/secondary moral + boss mission moral steps
    const isAdabMission = activeMission.category === "moral" ||
      activeMission.secondaryCategory === "moral" ||
      (activeMission.missionType === "boss_mission" && result.bossStepResults?.some((sr, i) => {
        const bossMission = activeMission as any;
        const step = bossMission.steps?.[i];
        return step?.category === "moral" && sr.isCorrect;
      }));
    let newAdabStreak = prev.adabStreak;
    const today = new Date().toISOString().split("T")[0];

    if (result.isCorrect && isAdabMission) {
      const prevAdabDate = prev.lastAdabDate;
      if (prevAdabDate === today) {
        newAdabStreak = prev.adabStreak;
      } else if (prevAdabDate) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (prevAdabDate === yesterday) {
          newAdabStreak = prev.adabStreak + 1;
        } else {
          newAdabStreak = 1;
        }
      } else {
        newAdabStreak = 1;
      }
    }

    const now = Date.now();
    const existingProgress = prev.missionProgress[activeMission.id];

    const updated = {
      ...prev,
      xp: xpResult.xp,
      level: xpResult.level,
      points: prev.points + awardedPoints,
      coins: prev.coins + awardedCoins,
      hearts: result.isCorrect ? prev.hearts : Math.max(0, prev.hearts - 1),
      streak: result.isCorrect ? prev.streak + 1 : 0,
      adabStreak: newAdabStreak,
      lastPlayDate: today,
      lastAdabDate: isAdabMission && result.isCorrect ? today : prev.lastAdabDate,
      timePlayedMinutes: prev.timePlayedMinutes + minutesPlayed,
      totalMissionsCompleted: prev.totalMissionsCompleted + (wasNewlyCompleted ? 1 : 0),
      categoryStats: stats,
      missionProgress: {
        ...prev.missionProgress,
        [activeMission.id]: {
          missionId: activeMission.id,
          stars: newStars,
          bestPoints: newBestPoints,
          attempts: (existingProgress?.attempts ?? 0) + 1,
          completedCount: newCompletedCount,
          firstCompletedAt: existingProgress?.firstCompletedAt ?? (wasNewlyCompleted ? now : 0),
          bestChoiceSelected: existingProgress?.bestChoiceSelected || result.isBestChoice,
          fastestTimeSeconds: Math.min(existingProgress?.fastestTimeSeconds ?? Infinity, result.elapsedSeconds),
          completedAt: now,
        },
      },
    };

    // Check if this stage reward has been claimed before (gift box only first time)
    if (isFirstCompletion && result.isCorrect) {
      updated.claimedStageRewardIds = [...prev.claimedStageRewardIds, activeMission.id];
    }

    const newBadgeIds = checkBadges(updated);
    const unlocked = newlyUnlockedBadges(prev.badges, newBadgeIds);
    updated.badges = newBadgeIds;

    updateProfile(prev.id, updated);
    setLastResult({
      mission: activeMission,
      isCorrect: result.isCorrect,
      stars: score.stars,
      finalPoint: awardedPoints,
      xpGain: awardedXP,
      leveledUp: xpResult.leveledUp,
      newBadges: unlocked,
      breakdown: score.breakdown,
      bossStepResults: result.bossStepResults,
      isFirstCompletion,
    } as any);

    // ═══ Stage 500 Completion Check ═══
    if (result.isCorrect && isFinalStage(activeMission.number)) {
      const diff = activeMission.difficulty;
      if (!hasClaimedDifficultyCompletionReward(updated, diff) && !updated.pendingFinalRewardDifficulty) {
        const withPending = markFinalRewardPending(updated, diff);
        updateProfile(prev.id, withPending);
        setPendingCompletion(true);
        setCompletionDifficulty(diff);
      }
    }

    setScreen("result");
  };

  // After result screen: show completion box if pending
  useEffect(() => {
    if (screen === "result" && pendingCompletion && completionDifficulty) {
      const timer = setTimeout(() => {
        setCompletionBoxOpen(true);
        setPendingCompletion(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [screen, pendingCompletion, completionDifficulty]);

  // ═══ Difficulty Completion Handlers ═══

  const handleCompletionBoxClaim = () => {
    if (!activeProfile || !completionDifficulty) return;
    const diff = completionDifficulty as import("@/types").DifficultyId;
    const current = store.profiles.find(p => p.id === activeProfile.id);
    if (!current) return;

    const claimed = claimDifficultyCompletionReward(current, diff);
    if (!claimed) return;

    updateProfile(current.id, claimed);
    setCompletionBoxOpen(false);

    setTimeout(() => {
      if (diff === "universitas") {
        setMasteryModalOpen(true);
      } else {
        const withUnlock = unlockNextDifficulty(claimed, diff);
        if (withUnlock) {
          updateProfile(current.id, withUnlock);
        }
        setUnlockModalOpen(true);
      }
    }, 600);
  };

  const handleCompletionBoxClose = () => {
    setCompletionBoxOpen(false);
    setPendingCompletion(false);
  };

  const handleUnlockNow = () => {
    if (!activeProfile || !completionDifficulty) return;
    const diff = completionDifficulty as import("@/types").DifficultyId;
    const current = store.profiles.find(p => p.id === activeProfile.id);
    if (!current) return;

    const nextDiff = getNextDifficulty(diff);
    if (!nextDiff) return;

    // Apply the difficulty upgrade
    const upgraded = clearPendingDifficultyUpgrade({
      ...current,
      difficulty: nextDiff,
      currentDifficulty: nextDiff,
      difficultyUpgradeAvailable: false,
      pendingDifficultyUpgrade: null,
      upgradedAt: Date.now(),
    });

    updateProfile(current.id, upgraded);
    setUnlockModalOpen(false);
    setCompletionDifficulty(null);
    setScreen("map");
  };

  const handleUnlockLater = () => {
    if (!activeProfile || !completionDifficulty) return;
    const diff = completionDifficulty as import("@/types").DifficultyId;
    const current = store.profiles.find(p => p.id === activeProfile.id);
    if (!current) return;

    const nextDiff = getNextDifficulty(diff);
    if (!nextDiff) return;

    // Set pending upgrade — user stays on current difficulty
    const withPending = setPendingDifficultyUpgrade(current, nextDiff);
    updateProfile(current.id, withPending);

    setUnlockModalOpen(false);
    setCompletionDifficulty(null);
  };

  const handleMasteryClose = () => {
    setMasteryModalOpen(false);
    setCompletionDifficulty(null);
  };

  const handleMasteryViewBadges = () => {
    setMasteryModalOpen(false);
    setCompletionDifficulty(null);
    setScreen("badges");
  };

  const handleMasteryBackToMap = () => {
    setMasteryModalOpen(false);
    setCompletionDifficulty(null);
    setScreen("map");
  };

  // Handle "Naik Tingkat" from Home or Map
  const handleHomeUpgrade = () => {
    if (!activeProfile) return;
    const current = store.profiles.find(p => p.id === activeProfile.id);
    if (!current) return;
    
    const pendingDiff = current.pendingDifficultyUpgrade;
    if (!pendingDiff) return;

    // Apply the pending difficulty upgrade
    const upgraded = clearPendingDifficultyUpgrade({
      ...current,
      difficulty: pendingDiff,
      currentDifficulty: pendingDiff,
      difficultyUpgradeAvailable: false,
      pendingDifficultyUpgrade: null,
      upgradedAt: Date.now(),
    });

    updateProfile(current.id, upgraded);
    setScreen("map");
  };

  // Handle "Buka Hadiah" from Home (reopen pending reward box)
  const handleOpenPendingBox = () => {
    if (!activeProfile) return;
    const current = store.profiles.find(p => p.id === activeProfile.id);
    if (!current || !current.pendingFinalRewardDifficulty) return;
    setCompletionDifficulty(current.pendingFinalRewardDifficulty);
    setCompletionBoxOpen(true);
  };

  const nextMission = (): Mission | null => {
    if (!activeMission) return null;
    const idx = orderedMissions.findIndex((m) => m.id === activeMission.id);
    if (idx === -1) return null;
    return orderedMissions[idx + 1] ?? null;
  };

  // ----- RENDER -----
  // Show TMT SplashScreen during hydration — never show blank/fallback
  if (!hydrated) {
    return <SplashScreen onDone={() => {}} />;
  }

  if (screen === "splash") return <SplashScreen onDone={onSplashDone} />;
  if (screen === "onboarding") return <OnboardingScreen onStart={onStartOnboarding} />;

  if (screen === "profile-select") {
    return (
      <ProfileSelectScreen
        profiles={store.profiles}
        activeId={store.activeProfileId}
        onSelect={selectProfile}
        onCreate={(name, avatar, diff, gender) => addProfile(createProfile(name, avatar, diff, gender))}
        onUpdate={(id, name, avatar, diff, gender) => updateProfile(id, { name, avatar, gender, difficulty: diff })}
        onDelete={deleteProfile}
        onContinue={(firstProfileCreated) => setScreen(firstProfileCreated ? "map" : "home")}
      />
    );
  }

  if (!activeProfile) {
    // safety
    setTimeout(() => setScreen("profile-select"), 0);
    return null;
  }

  if (screen === "home") {
    return (
      <>
        <HomeScreen
          profile={activeProfile}
          onNavigate={(s) => setScreen(s)}
          onSwitchProfile={() => setScreen("profile-select")}
          onOpenPendingBox={handleOpenPendingBox}
          onHomeUpgrade={handleHomeUpgrade}
        />
        {homeToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-[#5A3515]/90 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg">
            Tekan sekali lagi untuk keluar
          </div>
        )}
      </>
    );
  }

  if (screen === "map") {
    const popupStars = popupMission ? activeProfile.missionProgress[popupMission.id]?.stars ?? 0 : 0;
    return (
      <>
        <MapScreen
          profile={activeProfile}
          onBack={() => setScreen("home")}
          onOpenMission={(m) => setPopupMission(m)}
          onChangeDifficulty={(diff) => {
            const current = store.profiles.find(p => p.id === activeProfile.id);
            if (current) {
              updateProfile(current.id, { difficulty: diff, currentDifficulty: diff });
            }
          }}
          onHomeUpgrade={handleHomeUpgrade}
        />
        {popupMission ? (
          <MissionPopup
            mission={popupMission}
            stars={popupStars}
            onClose={() => setPopupMission(null)}
            onPlay={() => startMission(popupMission)}
          />
        ) : null}
      </>
    );
  }

  if (screen === "play" && activeMission) {
    return (
      <PlayScreen
        mission={activeMission}
        onFinish={handleFinishMission}
        onQuit={() => setScreen("map")}
      />
    );
  }

  if (screen === "result" && lastResult) {
    return (
      <ResultScreen
        {...lastResult}
        onNextMission={() => {
          const nm = nextMission();
          if (nm) {
            setActiveMission(nm);
            setLastResult(null);
            setScreen("play");
          } else {
            setScreen("map");
          }
        }}
        onBackToMap={() => {
          setLastResult(null);
          setScreen("map");
        }}
      />
    );
  }

  if (screen === "badges") return <BadgesScreen profile={activeProfile} onBack={() => setScreen("home")} />;
  if (screen === "stats") return <StatsScreen profile={activeProfile} onBack={() => setScreen("home")} />;
  if (screen === "daily-missions") return <DailyMissionsScreen profile={activeProfile} onBack={() => setScreen("home")} />;

  if (screen === "minigame-center") {
    return (
      <MiniGameCenter
        profile={activeProfile}
        onBack={() => setScreen("home")}
        onNavigate={setScreen}
      />
    );
  }

  if (screen === "minigame-hitung") return <MiniGameHitungScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-pola") return <MiniGamePolaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-ingatan") return <MiniGameIngatanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-cari-beda") return <CariBerbedaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;

  // ═══════════════════════════════════════════
  // Game Adab — disembunyikan dari Mini-Game (2026-06-22)
  // Redirect ke Mini-Game Center dengan pesan
  // ═══════════════════════════════════════════
  if (screen === "minigame-pilih-sikap" || screen === "minigame-nasihat" || screen === "minigame-urutkan-adab" || screen === "minigame-dilema") {
    const gameName =
      screen === "minigame-pilih-sikap" ? "Pilih Sikap Terbaik" :
      screen === "minigame-nasihat" ? "Nasihat dengan Lembut" :
      screen === "minigame-urutkan-adab" ? "Urutkan Adab" :
      "Dilema Bijak";
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full border-4 border-[#FF9800]/30 shadow-2xl animate-pop-in">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">
              Game Tidak Tersedia
            </h2>
            <p className="text-sm font-bold text-[#8C6B45] mb-1">
              "{gameName}" tidak tersedia lagi di menu Mini-Game.
            </p>
            <p className="text-xs text-[#8C6B45]/70 mb-6">
              Game adab tetap bisa dimainkan di Peta Petualangan ya! ✨
            </p>
            <button
              onClick={() => setScreen("minigame-center")}
              className="w-full py-3 rounded-2xl bg-gradient-meadow border-b-4 border-[#2E8B12] text-white font-black text-base active:translate-y-1 active:border-b-0 transition-all"
            >
              🎮 Kembali ke Mini-Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "minigame-detektif") return <DetektifScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-tebak-aturan") return <TebakAturanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-kesimpulan") return <PilihKesimpulanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-benar-salah") return <BenarSalahScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-kode-warna") return <ColorCodeGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;

  if (screen === "minigame-ubah-posisi") return <UbahPosisiGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-cocok-bayangan") return <CocokBayanganGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-jalur-tercepat") return <JalurTercepatGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-rantai-warna") return <MiniGameRantaiWarnaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-jalur-angka") return <MiniGameJalurAngkaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;

  if (screen === "minigame-misi-keluarga") return <MisiKeluargaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-family-challenge") return <BattleScreen profiles={store.profiles} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;

  if (screen === "battle") return <BattleScreen profiles={store.profiles} onBack={() => setScreen("home")} backRef={dummyBackRef} />;

  if (screen === "parent") {
    return (
      <>
        <ParentGate
          open={parentGateOpen}
          title="Dashboard Orang Tua"
          onPass={() => setParentGateOpen(false)}
          onCancel={() => {
            setParentGateOpen(false);
            setScreen("home");
          }}
        />
        <ParentScreen profile={activeProfile} profiles={store.profiles} onBack={() => setScreen("home")} onExportProfile={() => {
          const data = exportProfile(activeProfile.id);
          if (data) downloadJSON(`tmt-profile-${activeProfile.id.slice(0, 8)}.json`, data);
        }} onExportAll={() => downloadJSON("tmt-full-export.json", exportDebugSnapshot())} onManageRewards={() => setScreen("reward-setup")} />
      </>
    );
  }
  if (screen === "reward-setup") return <RewardSetupScreen profiles={store.profiles} onBack={() => setScreen("parent")} />;
  if (screen === "my-rewards") return <MyRewardsScreen profile={activeProfile} onBack={() => setScreen("home")} />;

  if (screen === "privacy") return <PrivacyScreen onBack={() => setScreen("settings")} />;
  if (screen === "settings") {
    return (
      <>
        <SettingsScreen
          profile={activeProfile}
          onBack={() => setScreen("home")}
          onUpdate={(patch) =>
            updateProfile(activeProfile.id, { settings: { ...activeProfile.settings, ...patch } })
          }
          onReset={() => resetProfileProgress(activeProfile.id)}
          onDeleteAll={() => {
            // Clear all localStorage and reload
            localStorage.clear();
            window.location.reload();
          }}
          onSwitchProfile={() => setScreen("profile-select")}
          onExportProfile={() => {
            const data = exportProfile(activeProfile.id);
            if (data) downloadJSON(`tmt-profile-${activeProfile.id.slice(0, 8)}.json`, data);
          }}
          onExportAll={() => downloadJSON("tmt-full-export.json", exportDebugSnapshot())}
          onPrivacy={() => setScreen("privacy")}
          onReload={() => window.location.reload()}
        />
        <ScreenTimeReminder
          open={screenTimeReminderOpen}
          minutes={screenTimeMinutes}
          onDismiss={() => setScreenTimeReminderOpen(false)}
          onExtend={() => {
            sessionStartRef.current = Date.now();
            setScreenTimeReminderOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Stage 500 Completion Box */}
      {completionBoxOpen && completionDifficulty && (
        <DifficultyCompletionBox
          difficulty={completionDifficulty as import("@/types").DifficultyId}
          onOpen={handleCompletionBoxClaim}
          onClose={handleCompletionBoxClose}
        />
      )}

      {/* Difficulty Unlock Modal (stage 500) */}
      {unlockModalOpen && completionDifficulty && (() => {
        const nextDiff = getNextDifficulty(completionDifficulty as import("@/types").DifficultyId);
        if (!nextDiff) return null;
        return (
          <DifficultyUnlockModal
            currentDifficulty={completionDifficulty as import("@/types").DifficultyId}
            nextDifficulty={nextDiff}
            onUpgradeNow={handleUnlockNow}
            onUpgradeLater={handleUnlockLater}
            onClose={() => setUnlockModalOpen(false)}
          />
        );
      })()}

      {/* Mastery Complete Modal (Universitas) */}
      {masteryModalOpen && (
        <MasteryCompleteModal
          onViewBadges={handleMasteryViewBadges}
          onBackToMap={handleMasteryBackToMap}
          onClose={handleMasteryClose}
        />
      )}
    </>
  );

  // referenced for type narrowing (no-op)
  void MISSIONS;
}

/**
 * Trigger a browser download of a JSON blob.
 */
function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
