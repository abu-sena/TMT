/**
 * Standalone GameApp — client-only version for Capacitor SPA builds.
 *
 * This is a direct copy of the GameApp component from routes/index.tsx,
 * extracted so Capacitor can import it without TanStack Router's SSR context.
 *
 * All game logic is identical to the SSR version.
 */

import { useMemo, useState, useRef, useEffect } from "react";
import type { BadgeDef, Mission, ScreenId } from "@/types";
import { CATEGORIES, DIFFICULTY_UI_LABELS, DIFFICULTY_MAP } from "@/data/constants";
import { applyXP } from "@/lib/leveling";
import { checkBadges, missionsForDifficulty, newlyUnlockedBadges, checkDifficultyUpgrade, getNextDifficulty } from "@/lib/progress";
import { scoreMission } from "@/lib/scoring";
import { createProfile, useGameStore } from "@/lib/storage";
import { MISSIONS } from "@/data/missions";
import { soundService } from "@/lib/soundService";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";

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
import { MiniGameHitungScreen } from "@/screens/MiniGameHitungScreen";
import { MiniGamePolaScreen } from "@/screens/MiniGamePolaScreen";
import { MiniGameIngatanScreen } from "@/screens/MiniGameIngatanScreen";
import { MiniGameAdabScreen } from "@/screens/MiniGameAdabScreen";
import { MiniGameCenter } from "@/screens/MiniGameCenter";
import { MiniGamePackageScreen } from "@/screens/MiniGamePackageScreen";
// New mini-game screens
import { CariBerbedaScreen } from "@/screens/MiniGameCariBerbedaScreen";
import { BenarSalahScreen } from "@/screens/MiniGameBenarSalahScreen";
import { PilihKesimpulanScreen, DetektifScreen, TebakAturanScreen } from "@/screens/MiniGameLogikaScreens";
import { NasihatLembutScreen, DilemaBijakScreen, UrutkanAdabScreen } from "@/screens/MiniGameAdabScreens";
import { UbahPosisiGame, CocokBayanganGame, JalurTercepatGame, MisiKeluargaScreen } from "@/screens/MiniGameSpasialKeluargaScreens";
import { BattleScreen } from "@/screens/BattleScreen";
import { ParentScreen } from "@/screens/ParentScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { PrivacyScreen } from "@/screens/PrivacyScreen";
import { RewardSetupScreen } from "@/screens/RewardSetupScreen";
import { MyRewardsScreen } from "@/screens/MyRewardsScreen";
import { MissionPopup } from "@/components/missions/MissionPopup";
import { ParentGate } from "@/components/safety/ParentGate";
import { ScreenTimeReminder } from "@/components/safety/ScreenTimeReminder";
import { RewardCelebration } from "@/components/rewards/RewardCelebration";

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
}

export function GameAppStandalone() {
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
    checkRewardsForProfile,
  } = useGameStore();

  // ── Boot state ──
  const [screen, setScreen] = useState<ScreenId>("splash");
  const [isBooting, setIsBooting] = useState(true);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);
  const [hasActiveProfile, setHasActiveProfile] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [minSplashTime, setMinSplashTime] = useState(false);
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

  // Ref for mini-game screens to register their back handlers
  const miniGameBackRef = useRef<(() => boolean) | null>(null);

  // Reward celebration state
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationRewards, setCelebrationRewards] = useState<import("@/types").RewardMilestone[]>([]);
  const [celebrationIndex, setCelebrationIndex] = useState(0);
  const rewardsCheckedRef = useRef(false);

  // Mini-game package navigation state
  const [activeMiniGamePackage, setActiveMiniGamePackage] = useState<string | null>(null);

  // Difficulty upgrade state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [pendingUpgradeDifficulty, setPendingUpgradeDifficulty] = useState<string | null>(null);
  const upgradeCheckedRef = useRef(false);

  // Android back button handler
  const backHandler = useAndroidBackButton({
    screen,
    hasModal: popupMission !== null || parentGateOpen || screenTimeReminderOpen || celebrationOpen,
    onBack: () => {
      soundService.play("back_click");
      if (popupMission) { setPopupMission(null); return; }
      if (parentGateOpen) { setParentGateOpen(false); setScreen("home"); return; }
      if (screenTimeReminderOpen) { setScreenTimeReminderOpen(false); return; }
      if (celebrationOpen) { setCelebrationOpen(false); return; }
      
      // Mini-game screens: delegate to internal handler
      if (screen.startsWith("minigame-") && miniGameBackRef.current) {
        const handled = miniGameBackRef.current();
        if (handled) return;
      }
      
      switch (screen) {
        case "map": setScreen("home"); break;
        case "play": setScreen("map"); break;
        case "result": setScreen("map"); break;
        case "badges": case "stats": case "settings": case "privacy": case "parent": case "daily-missions":
        case "minigame-hitung": case "minigame-pola": case "minigame-ingatan": case "minigame-adab":
        case "minigame-center": case "minigame-package":
        case "battle": case "my-rewards":
          setScreen("home"); break;
        case "reward-setup": setScreen("parent"); break;
        case "home":
          // Double-press toast
          if (homeToast) {
            // Second press — handled by exit flow
          } else {
            setHomeToast(true);
            if (homeToastTimerRef.current) clearTimeout(homeToastTimerRef.current);
            homeToastTimerRef.current = setTimeout(() => setHomeToast(false), 2000);
          }
          break;
        case "profile-select": break;
        default: setScreen("home");
      }
    },
    onExitConfirm: () => {
      soundService.play("soft_error");
      if (screen.startsWith("minigame-")) {
        setScreen("home");
      } else {
        setScreen("map");
      }
    },
    homeToastActive: homeToast,
  });

  // Sound preload on mount
  useEffect(() => {
    soundService.preload().catch(() => {});
  }, []);

  // ── Boot sequence ──
  // Ensure minimum splash display time for branding
  useEffect(() => {
    const t = setTimeout(() => setMinSplashTime(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Track hydration
  useEffect(() => {
    if (hydrated) {
      setIsStorageHydrated(true);
      setHasActiveProfile(!!activeProfile);
    }
  }, [hydrated, activeProfile]);

  // Complete boot when splash min time elapsed AND storage is hydrated
  useEffect(() => {
    if (minSplashTime && (isStorageHydrated || bootError)) {
      setIsBooting(false);
    }
  }, [minSplashTime, isStorageHydrated, bootError]);

  // Check rewards on app load
  useEffect(() => {
    if (hydrated && activeProfile && !rewardsCheckedRef.current) {
      rewardsCheckedRef.current = true;
      const newlyUnlocked = checkRewardsForProfile(activeProfile.id, activeProfile.level);
      if (newlyUnlocked.length > 0 && screen === "home") {
        setCelebrationRewards(newlyUnlocked);
        setCelebrationIndex(0);
        setCelebrationOpen(true);
      }
    }
  }, [hydrated, activeProfile?.id]);

  useEffect(() => {
    screenTimeReminderOpenRef.current = screenTimeReminderOpen;
  }, [screenTimeReminderOpen]);

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

  useEffect(() => {
    if (screen === "parent") setParentGateOpen(true);
  }, [screen]);

  // Check rewards when navigating to home
  useEffect(() => {
    if (screen === "home" && activeProfile) {
      const newlyUnlocked = checkRewardsForProfile(activeProfile.id, activeProfile.level);
      if (newlyUnlocked.length > 0) {
        setCelebrationRewards(newlyUnlocked);
        setCelebrationIndex(0);
        setCelebrationOpen(true);
      }
    }
  }, [screen]);

  // Check difficulty upgrade eligibility after mission completion
  useEffect(() => {
    if (activeProfile && !upgradeCheckedRef.current && (screen === "result" || screen === "map")) {
      upgradeCheckedRef.current = true;
      const nextDiff = checkDifficultyUpgrade(activeProfile);
      if (nextDiff) {
        setPendingUpgradeDifficulty(nextDiff);
        // Small delay so result screen renders first, then modal appears
        setTimeout(() => setUpgradeModalOpen(true), 1200);
      }
    }
  }, [activeProfile?.id, screen]);

  // ---- Splash / onboarding flow ----
  const onSplashDone = () => {
    // Complete boot and route to appropriate screen
    setIsBooting(false);
    if (!store.onboardingDone) setScreen("onboarding");
    else if (!activeProfile) setScreen("profile-select");
    else setScreen("home");
  };

  const onStartOnboarding = () => {
    setOnboardingDone();
    setScreen("profile-select");
    soundService.play("button_click");
  };

  // ---- Mission flow ----
  const orderedMissions = useMemo(
    () => (activeProfile ? missionsForDifficulty(activeProfile.difficulty) : []),
    [activeProfile],
  );

  const startMission = (m: Mission) => {
    setActiveMission(m);
    setPopupMission(null);
    setScreen("play");
    soundService.play("mission_start");
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
    const currentProfile = store.profiles.find(p => p.id === activeProfile.id);
    if (!currentProfile) return;
    const prev = currentProfile;

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

    const xpResult = applyXP(prev, score.xpGain);
    const stats = { ...prev.categoryStats };
    const cats = [activeMission.category, activeMission.secondaryCategory].filter(Boolean) as (typeof CATEGORIES)[number]["id"][];
    for (const c of cats) {
      stats[c] = { correct: stats[c].correct + (result.isCorrect ? 1 : 0), total: stats[c].total + 1 };
    }

    if (result.bossStepResults && activeMission.missionType === "boss_mission") {
      const bossMission = activeMission as any;
      if (bossMission.steps) {
        for (let i = 0; i < bossMission.steps.length; i++) {
          const step = bossMission.steps[i];
          const stepResult = result.bossStepResults[i];
          const catId = step?.category as "literasi-numerasi" | "spasial" | "pola" | "kreativitas" | "systems" | "moral" | "penalaran" | undefined;
          if (catId && stepResult && stats[catId]) {
            stats[catId] = { correct: stats[catId].correct + (stepResult.isCorrect ? 1 : 0), total: stats[catId].total + 1 };
          }
        }
      }
    }

    const priorStars = prev.missionProgress[activeMission.id]?.stars ?? 0;
    const priorBest = prev.missionProgress[activeMission.id]?.bestPoints ?? 0;
    const newStars = Math.max(priorStars, score.stars);
    const newBestPoints = Math.max(priorBest, score.finalPoint);
    const wasNewlyCompleted = priorStars === 0 && score.stars > 0;
    const minutesPlayed = Math.ceil(result.elapsedSeconds / 60);

    const isAdabMission = activeMission.category === "moral" ||
      activeMission.secondaryCategory === "moral" ||
      (activeMission.missionType === "boss_mission" && result.bossStepResults?.some((sr, i) => {
        const bossMission = activeMission as any;
        return bossMission.steps?.[i]?.category === "moral" && sr.isCorrect;
      }));

    let newAdabStreak = prev.adabStreak;
    const today = new Date().toISOString().split("T")[0];
    const prevAdabDate = prev.lastAdabDate;

    if (result.isCorrect && isAdabMission) {
      if (prevAdabDate === today) {
        newAdabStreak = prev.adabStreak;
      } else if (prevAdabDate) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (prevAdabDate === yesterday) newAdabStreak = prev.adabStreak + 1;
        else newAdabStreak = 1;
      } else {
        newAdabStreak = 1;
      }
    }

    const updated = {
      ...prev,
      xp: xpResult.xp,
      level: xpResult.level,
      points: prev.points + score.finalPoint,
      coins: prev.coins + (result.isCorrect ? (activeMission.isBossMission ? 25 : 5) : 0),
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
          attempts: (prev.missionProgress[activeMission.id]?.attempts ?? 0) + 1,
          bestChoiceSelected: prev.missionProgress[activeMission.id]?.bestChoiceSelected || result.isBestChoice,
          fastestTimeSeconds: Math.min(prev.missionProgress[activeMission.id]?.fastestTimeSeconds ?? Infinity, result.elapsedSeconds),
          completedAt: Date.now(),
        },
      },
    };

    const newBadgeIds = checkBadges(updated);
    const unlocked = newlyUnlockedBadges(prev.badges, newBadgeIds);
    updated.badges = newBadgeIds;
    updateProfile(prev.id, updated);

    setLastResult({
      mission: activeMission,
      isCorrect: result.isCorrect,
      stars: score.stars,
      finalPoint: score.finalPoint,
      xpGain: score.xpGain,
      leveledUp: xpResult.leveledUp,
      newBadges: unlocked,
      breakdown: score.breakdown,
      bossStepResults: result.bossStepResults,
    });
    
    // Play sound based on result
    if (result.isCorrect) {
      soundService.play("answer_correct");
      if (score.stars >= 3) soundService.play("star_earned");
      if (xpResult.leveledUp) soundService.play("level_up");
      if (unlocked.length > 0) soundService.play("badge_unlock");
      setTimeout(() => soundService.play("success_complete"), 500);
    } else {
      soundService.play("answer_wrong");
    }

    // Check if any rewards unlocked due to level up
    if (xpResult.leveledUp) {
      const newRewards = checkRewardsForProfile(prev.id, xpResult.level);
      if (newRewards.length > 0) {
        setCelebrationRewards(newRewards);
        setCelebrationIndex(0);
        // Show celebration after result screen
        setTimeout(() => setCelebrationOpen(true), 1500);
      }
    }
    
    setScreen("result");
  };

  const nextMission = (): Mission | null => {
    if (!activeMission) return null;
    const idx = orderedMissions.findIndex((m) => m.id === activeMission.id);
    if (idx === -1) return null;
    return orderedMissions[idx + 1] ?? null;
  };

  // ---- Difficulty Upgrade Handlers ----
  const handleUpgradeConfirm = () => {
    if (!activeProfile || !pendingUpgradeDifficulty) return;
    const next = pendingUpgradeDifficulty as import("@/types").DifficultyId;

    // Add current difficulty to completed
    const completed = [...(activeProfile.completedDifficulties || [])];
    if (!completed.includes(activeProfile.difficulty)) {
      completed.push(activeProfile.difficulty);
    }

    // Unlock next difficulty
    const unlocked = [...(activeProfile.unlockedDifficulties || [])];
    if (!unlocked.includes(next)) {
      unlocked.push(next);
    }

    updateProfile(activeProfile.id, {
      difficulty: next,
      currentDifficulty: next,
      unlockedDifficulties: unlocked,
      completedDifficulties: completed,
      difficultyUpgradeAvailable: false,
      upgradedAt: Date.now(),
    });

    setUpgradeModalOpen(false);
    setPendingUpgradeDifficulty(null);
    upgradeCheckedRef.current = false;
    soundService.play("level_up");
  };

  const handleUpgradeLater = () => {
    if (!activeProfile) return;
    // Mark upgrade as available but don't change difficulty
    updateProfile(activeProfile.id, {
      difficultyUpgradeAvailable: true,
    });
    setUpgradeModalOpen(false);
    setPendingUpgradeDifficulty(null);
    upgradeCheckedRef.current = false;
  };

  // ---- Render ----
  // During boot, always show SplashScreen first (never show blank/loading page)
  if (isBooting) {
    return <SplashScreen onDone={() => {}} />;
  }

  // Boot error — show recovery screen
  if (bootError) {
    return (
      <div className="h-[100dvh] bg-gradient-sky grid place-items-center overscroll-contain">
        <div className="text-center px-6 max-w-sm">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="font-display font-black text-2xl text-[#5A3515] mb-2">Ada Kendala Kecil</h1>
          <p className="text-sm font-bold text-[#8C6B45] mb-4">Data permainan sedang diperbaiki. Jangan khawatir, progresmu aman!</p>
          <button
            onClick={() => { setBootError(null); setIsBooting(false); }}
            className="px-6 py-3 rounded-2xl bg-gradient-meadow text-white font-black text-lg border-b-4 border-[#2E8B12] active:translate-y-1 active:border-b-0 transition-all"
          >
            Lanjutkan Petualangan
          </button>
        </div>
      </div>
    );
  }

  // Fallback: during hydration without splash (shouldn't normally happen)
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
        onContinue={() => setScreen("home")}
      />
    );
  }

  if (!activeProfile) {
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
        />
        {homeToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-[#5A3515]/90 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg animate-bob">
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
        <MapScreen profile={activeProfile} onBack={() => setScreen("home")} onOpenMission={(m) => setPopupMission(m)} />
        {popupMission ? (
          <MissionPopup mission={popupMission} stars={popupStars} onClose={() => setPopupMission(null)} onPlay={() => startMission(popupMission)} />
        ) : null}
      </>
    );
  }

  if (screen === "play" && activeMission) {
    return <PlayScreen mission={activeMission} onFinish={handleFinishMission} onQuit={() => setScreen("map")} />;
  }

  if (screen === "result" && lastResult) {
    return (
      <ResultScreen
        {...lastResult}
        onNextMission={() => {
          const nm = nextMission();
          if (nm) { setActiveMission(nm); setLastResult(null); setScreen("play"); }
          else setScreen("map");
        }}
        onBackToMap={() => { setLastResult(null); setScreen("map"); }}
      />
    );
  }

  if (screen === "badges") return <BadgesScreen profile={activeProfile} onBack={() => setScreen("home")} />;
  if (screen === "stats") return <StatsScreen profile={activeProfile} onBack={() => setScreen("home")} />;
  if (screen === "daily-missions") return <DailyMissionsScreen profile={activeProfile} onBack={() => setScreen("home")} onPlayMission={() => {}} onPlayMiniGame={() => {}} />;

  if (screen === "minigame-hitung") return <MiniGameHitungScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-pola") return <MiniGamePolaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-ingatan") return <MiniGameIngatanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-cari-beda") return <CariBerbedaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

  if (screen === "minigame-pilih-sikap") return <MiniGameAdabScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-nasihat") return <NasihatLembutScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-urutkan-adab") return <UrutkanAdabScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-dilema") return <DilemaBijakScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

  if (screen === "minigame-detektif") return <DetektifScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-tebak-aturan") return <TebakAturanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-kesimpulan") return <PilihKesimpulanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-benar-salah") return <BenarSalahScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

  if (screen === "minigame-ubah-posisi") return <UbahPosisiGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-cocok-bayangan") return <CocokBayanganGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-jalur-tercepat") return <JalurTercepatGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

  if (screen === "minigame-misi-keluarga") return <MisiKeluargaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-family-challenge") return <BattleScreen profiles={store.profiles} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

  // Mini Game Center & Package screens
  if (screen === "minigame-center") {
    return (
      <MiniGameCenter
        profile={activeProfile}
        onBack={() => setScreen("home")}
        onNavigate={setScreen}
        onOpenPackage={(pkgId) => {
          setActiveMiniGamePackage(pkgId);
          setScreen("minigame-package");
        }}
      />
    );
  }

  if (screen === "minigame-package" && activeMiniGamePackage) {
    return (
      <MiniGamePackageScreen
        profile={activeProfile}
        packageId={activeMiniGamePackage as import("@/types").MiniGamePackageId}
        onBack={() => setScreen("minigame-center")}
        onPlayGame={(s) => setScreen(s)}
      />
    );
  }

  if (screen === "battle") return <BattleScreen profiles={store.profiles} onBack={() => setScreen("home")} backRef={miniGameBackRef} />;

  if (screen === "parent") {
    return (
      <>
        <ParentGate open={parentGateOpen} title="Dashboard Orang Tua" onPass={() => setParentGateOpen(false)} onCancel={() => { setParentGateOpen(false); setScreen("home"); }} />
        <ParentScreen profile={activeProfile} profiles={store.profiles} onBack={() => setScreen("home")}
          onExportProfile={() => { const data = exportProfile(activeProfile.id); if (data) downloadJSON(`tmt-game-${activeProfile.id.slice(0, 8)}.json`, data); }}
          onExportAll={() => downloadJSON("tmt-game-full.json", exportDebugSnapshot())}
          onManageRewards={() => setScreen("reward-setup")} />
      </>
    );
  }

  if (screen === "reward-setup") {
    return (
      <RewardSetupScreen
        profiles={store.profiles}
        onBack={() => setScreen("parent")}
      />
    );
  }

  if (screen === "my-rewards") {
    return <MyRewardsScreen profile={activeProfile} onBack={() => setScreen("home")} />;
  }

  if (screen === "privacy") return <PrivacyScreen onBack={() => setScreen("settings")} />;

  if (screen === "settings") {
    return (
      <>
        <SettingsScreen profile={activeProfile} onBack={() => setScreen("home")}
          onUpdate={(patch) => updateProfile(activeProfile.id, { settings: { ...activeProfile.settings, ...patch } })}
          onReset={() => resetProfileProgress(activeProfile.id)}
          onDeleteAll={() => { localStorage.clear(); window.location.reload(); }}
          onSwitchProfile={() => setScreen("profile-select")}
          onExportProfile={() => { const data = exportProfile(activeProfile.id); if (data) downloadJSON(`tmt-game-${activeProfile.id.slice(0, 8)}.json`, data); }}
          onExportAll={() => downloadJSON("tmt-game-full.json", exportDebugSnapshot())}
          onPrivacy={() => setScreen("privacy")} />
        <ScreenTimeReminder open={screenTimeReminderOpen} minutes={screenTimeMinutes}
          onDismiss={() => setScreenTimeReminderOpen(false)}
          onExtend={() => { sessionStartRef.current = Date.now(); setScreenTimeReminderOpen(false); }} />
      </>
    );
  }

  return (
    <>
      {celebrationOpen && (
        <RewardCelebration
          open={celebrationOpen}
          rewards={celebrationRewards}
          currentIndex={celebrationIndex}
          onClose={() => setCelebrationOpen(false)}
          onViewRewards={() => {
            setCelebrationOpen(false);
            setScreen("my-rewards");
          }}
          onNext={() => {
            if (celebrationIndex < celebrationRewards.length - 1) {
              setCelebrationIndex(celebrationIndex + 1);
            } else {
              setCelebrationOpen(false);
            }
          }}
        />
      )}

      {/* Difficulty Upgrade Modal */}
      {upgradeModalOpen && pendingUpgradeDifficulty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-[#FFF9E6] to-[#FFE0A3] rounded-[2rem] p-6 text-center shadow-2xl max-w-sm w-full border-4 border-[#D48806] animate-pop-in">
            <div className="text-6xl mb-3">🎓</div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#5A3515] leading-tight mb-2">
              Selamat!
            </h2>
            <p className="text-sm font-bold text-[#8C6B45] mb-1">
              Kamu sudah menyelesaikan semua misi
            </p>
            <p className="text-base font-black text-[#185E9F] mb-3">
              {DIFFICULTY_MAP[activeProfile?.difficulty || "sd-bawah"]?.label || activeProfile?.difficulty}
            </p>
            <p className="text-sm font-bold text-[#5A3515] mb-4">
              Mau naik ke{" "}
              <span className="text-[#2E8B12] font-black text-base">
                {pendingUpgradeDifficulty ? (DIFFICULTY_UI_LABELS[pendingUpgradeDifficulty as import("@/types").DifficultyId] || pendingUpgradeDifficulty) : ""}
              </span>
              ?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleUpgradeConfirm}
                className="w-full py-3 rounded-2xl bg-gradient-meadow border-b-4 border-[#2E8B12] text-white font-black text-lg shadow-sm active:translate-y-1 active:border-b-0 transition-all"
              >
                🚀 Naik Tingkat
              </button>
              <button
                onClick={handleUpgradeLater}
                className="w-full py-3 rounded-2xl bg-white/60 border-2 border-[#D4B483] text-[#5A3515] font-black text-base shadow-sm active:translate-y-1 transition-all"
              >
                ⏳ Nanti Dulu
              </button>
            </div>

            <p className="text-[10px] font-bold text-[#8C6B45] mt-3">
              Progresmu saat ini tetap aman dan bisa dilihat kapan saja.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

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
