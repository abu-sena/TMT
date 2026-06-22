/**
 * Standalone GameApp — client-only version for Capacitor SPA builds.
 *
 * This is a direct copy of the GameApp component from routes/index.tsx,
 * extracted so Capacitor can import it without TanStack Router's SSR context.
 *
 * All game logic is identical to the SSR version.
 */

import { useMemo, useState, useRef, useEffect } from "react";
import type { BadgeDef, Mission, ScreenId, DifficultyId } from "@/types";
import { CATEGORIES, DIFFICULTY_UI_LABELS, DIFFICULTY_MAP } from "@/data/constants";
import { applyXP } from "@/lib/leveling";
import { checkBadges, missionsForDifficulty, newlyUnlockedBadges, getNextDifficulty, isFinalStage, hasClaimedDifficultyCompletionReward, hasCompletedStage500, getDifficultyCompletionRewardDef, markFinalRewardPending, claimDifficultyCompletionReward, unlockNextDifficulty, setPendingDifficultyUpgrade, clearPendingDifficultyUpgrade, isFirstCompletion, markDifficultyCompleted, hasAnyPendingFinalRewards, getPendingFinalRewardDifficulty } from "@/lib/progress";
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
// New mini-game screens
import { CariBerbedaScreen } from "@/screens/MiniGameCariBerbedaScreen";
import { BenarSalahScreen } from "@/screens/MiniGameBenarSalahScreen";
import { PilihKesimpulanScreen, DetektifScreen, TebakAturanScreen } from "@/screens/MiniGameLogikaScreens";
import { NasihatLembutScreen, DilemaBijakScreen, UrutkanAdabScreen } from "@/screens/MiniGameAdabScreens";
import { UbahPosisiGame, CocokBayanganGame, JalurTercepatGame, MisiKeluargaScreen } from "@/screens/MiniGameSpasialKeluargaScreens";
import { MiniGameRantaiWarnaScreen } from "@/screens/MiniGameRantaiWarnaScreen";
import { MiniGameJalurAngkaScreen } from "@/screens/MiniGameJalurAngkaScreen";
import { ColorCodeGame } from "@/screens/MiniGameColorCodeScreen";
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
import { DifficultyCompletionBox } from "@/components/rewards/DifficultyCompletionBox";
import { DifficultyUnlockModal } from "@/components/rewards/DifficultyUnlockModal";
import { MasteryCompleteModal } from "@/components/rewards/MasteryCompleteModal";

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
  const [lastResultStage500, setLastResultStage500] = useState<{
    difficulty: string;
    hasPendingReward: boolean;
    hasClaimedReward: boolean;
    nextDifficulty: string | null;
    isUniversitas: boolean;
  } | null>(null);

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
  // Stage 500 difficulty completion flow (REPLACES old upgrade system)
  const [completionBoxOpen, setCompletionBoxOpen] = useState(false);
  const [completionDifficulty, setCompletionDifficulty] = useState<string | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [masteryModalOpen, setMasteryModalOpen] = useState(false);
  const completionCheckedRef = useRef(false);
  const [pendingCompletion, setPendingCompletion] = useState(false);

  // Android back button handler
  const backHandler = useAndroidBackButton({
    screen,
    hasModal: popupMission !== null || parentGateOpen || screenTimeReminderOpen || celebrationOpen || completionBoxOpen || unlockModalOpen || masteryModalOpen,
    onBack: () => {
      soundService.play("back_click");
      if (popupMission) { setPopupMission(null); return; }
      if (parentGateOpen) { setParentGateOpen(false); setScreen("home"); return; }
      if (screenTimeReminderOpen) { setScreenTimeReminderOpen(false); return; }
      if (celebrationOpen) { setCelebrationOpen(false); return; }
      if (completionBoxOpen) { /* Keep box open - user must claim or use nanti button */ return; }
      if (unlockModalOpen) { setUnlockModalOpen(false); return; }
      if (masteryModalOpen) { setMasteryModalOpen(false); return; }
      
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
        case "minigame-center":
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

  // Note: Old "checkDifficultyUpgrade" (complete all missions) has been deprecated.
  // Difficulty unlock now ONLY happens via stage 500 completion flow.

  // ── Boot-time data repair: fix incomplete Stage 500 progression state ──
  useEffect(() => {
    if (!hydrated || !store.profiles.length) return;
    let needsUpdate = false;
    const updatedProfiles = store.profiles.map(profile => {
      let updated = { ...profile };

      // Check each difficulty: if stage 500 completed but reward not pending/claimed
      for (const diff of (["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as DifficultyId[])) {
        const stage500Completed = hasCompletedStage500(updated, diff);
        const rewardClaimed = hasClaimedDifficultyCompletionReward(updated, diff);
        const rewardPending = !!updated.pendingFinalRewardDifficulty;

        if (stage500Completed && !rewardClaimed && !rewardPending) {
          // Stage 500 completed but reward never marked pending — repair
          updated = markFinalRewardPending(updated, diff);
          needsUpdate = true;
          console.log(`[TMT Repair] Created pending reward for ${diff} (stage 500 completed but no reward state)`);
        }

        if (rewardClaimed) {
          // Ensure difficulty is marked completed
          if (!updated.completedDifficulties.includes(diff)) {
            updated = markDifficultyCompleted(updated, diff);
            needsUpdate = true;
            console.log(`[TMT Repair] Marked ${diff} as completed (reward already claimed)`);
          }

          // Ensure next difficulty is unlocked (except universitas)
          if (diff !== "universitas") {
            const next = getNextDifficulty(diff);
            if (next && !updated.unlockedDifficulties.includes(next)) {
              updated = unlockNextDifficulty(updated, diff) || updated;
              needsUpdate = true;
              console.log(`[TMT Repair] Unlocked ${next} (${diff} reward already claimed)`);
            }
          }

          // If current difficulty is the completed one but no upgrade pending, offer upgrade
          if (updated.currentDifficulty === diff && diff !== "universitas") {
            const next = getNextDifficulty(diff);
            if (next && !updated.pendingDifficultyUpgrade && !updated.difficultyUpgradeAvailable) {
              updated = setPendingDifficultyUpgrade(updated, next);
              needsUpdate = true;
              console.log(`[TMT Repair] Created pending upgrade from ${diff} to ${next}`);
            }
          }
        }
      }

      // Universitas should never have pending upgrade
      if (updated.difficulty === "universitas" && updated.pendingDifficultyUpgrade) {
        updated = clearPendingDifficultyUpgrade(updated);
        needsUpdate = true;
        console.log(`[TMT Repair] Cleared invalid pending upgrade for Universitas`);
      }

      return updated;
    });

    if (needsUpdate) {
      // Apply repairs batch
      for (const repaired of updatedProfiles) {
        const original = store.profiles.find(p => p.id === repaired.id);
        if (original && JSON.stringify(original) !== JSON.stringify(repaired)) {
          updateProfile(repaired.id, repaired);
        }
      }
    }
  }, [hydrated]);

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

    // xpResult will be calculated below after reward multiplier is determined
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

    const prevProgress = prev.missionProgress[activeMission.id];
    const prevCompletedCount = prevProgress?.completedCount ?? 0;
    const priorStars = prevProgress?.stars ?? 0;
    const priorBest = prevProgress?.bestPoints ?? 0;
    const newStars = Math.max(priorStars, score.stars);
    const newBestPoints = Math.max(priorBest, score.finalPoint);
    const wasNewlyCompleted = priorStars === 0 && score.stars > 0;
    const newCompletedCount = prevCompletedCount + (wasNewlyCompleted ? 1 : 0);
    const minutesPlayed = Math.ceil(result.elapsedSeconds / 60);

    // ── Reward multiplier: 1.0 first completion, 0.25 replay ──
    const isFirstCompletion = prevCompletedCount === 0 && result.isCorrect;
    const isReplay = prevCompletedCount >= 1 && result.isCorrect;
    const rewardMultiplier = isFirstCompletion ? 1.0 : (isReplay ? 0.25 : 1.0);
    const awardedPoints = Math.max(0, Math.floor(score.finalPoint * rewardMultiplier));
    const awardedXP = Math.max((result.isCorrect ? 1 : 0), Math.floor(score.xpGain * rewardMultiplier));
    const awardedCoins = result.isCorrect
      ? Math.floor((activeMission.isBossMission ? 25 : 5) * rewardMultiplier)
      : 0;

    const xpResultAdjusted = applyXP(prev, awardedXP);

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

    const now = Date.now();
    const existingProgress = prev.missionProgress[activeMission.id];

    const updated = {
      ...prev,
      xp: xpResultAdjusted.xp,
      level: xpResultAdjusted.level,
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

    const newBadgeIds = checkBadges(updated);
    const unlocked = newlyUnlockedBadges(prev.badges, newBadgeIds);
    updated.badges = newBadgeIds;

    // Check if this stage reward has been claimed before (first time only)
    if (isFirstCompletion && result.isCorrect && !prev.claimedStageRewardIds.includes(activeMission.id)) {
      updated.claimedStageRewardIds = [...prev.claimedStageRewardIds, activeMission.id];
    }

    updateProfile(prev.id, updated);

    setLastResult({
      mission: activeMission,
      isCorrect: result.isCorrect,
      stars: score.stars,
      finalPoint: awardedPoints,
      xpGain: awardedXP,
      leveledUp: xpResultAdjusted.leveledUp,
      newBadges: unlocked,
      breakdown: score.breakdown,
      bossStepResults: result.bossStepResults,
      isFirstCompletion,
    });
    
    // Play sound based on result
    if (result.isCorrect) {
      soundService.play("answer_correct");
      if (score.stars >= 3) soundService.play("star_earned");
      if (xpResultAdjusted.leveledUp) soundService.play("level_up");
      if (unlocked.length > 0) soundService.play("badge_unlock");
      setTimeout(() => soundService.play("success_complete"), 500);
    } else {
      soundService.play("answer_wrong");
    }

    // Check if any rewards unlocked due to level up
    if (xpResultAdjusted.leveledUp) {
      const newRewards = checkRewardsForProfile(prev.id, xpResultAdjusted.level);
      if (newRewards.length > 0) {
        setCelebrationRewards(newRewards);
        setCelebrationIndex(0);
        // Show celebration after result screen
        setTimeout(() => setCelebrationOpen(true), 1500);
      }
    }
    
    // ═══ Stage 500 Completion Check (PRIMARY UNLOCK MECHANISM) ═══
    // Stage 300 is NOT a completion trigger.
    // Only stage 500 triggers difficulty completion.
    if (result.isCorrect && isFinalStage(activeMission.number)) {
      const diff = activeMission.difficulty;
      const alreadyClaimed = hasClaimedDifficultyCompletionReward(updated, diff);
      const alreadyPending = !!updated.pendingFinalRewardDifficulty;
      
      // Store stage 500 info for ResultScreen
      setLastResultStage500({
        difficulty: diff,
        hasPendingReward: !alreadyClaimed && !alreadyPending,
        hasClaimedReward: alreadyClaimed,
        nextDifficulty: alreadyClaimed ? getNextDifficulty(diff) : null,
        isUniversitas: diff === "universitas",
      });

      if (!alreadyClaimed && !alreadyPending) {
        // Mark the reward as pending (box will appear)
        const withPending = markFinalRewardPending(updated, diff);
        updateProfile(prev.id, withPending);
        // Store completion for later box display
        setPendingCompletion(true);
        setCompletionDifficulty(diff);
      }
    } else {
      setLastResultStage500(null);
    }
    
    // Log replay vs first completion for debugging
    if (isFirstCompletion) {
      console.log(`[TMT] First completion: stage ${activeMission.number} (${activeMission.difficulty}), full reward`);
    } else if (result.isCorrect) {
      console.log(`[TMT] Replay: stage ${activeMission.number} (${activeMission.difficulty}), 1/4 reward`);
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

  // ═══ Stage 500 Difficulty Completion Handlers ═══

  const handleCompletionBoxClaim = () => {
    if (!activeProfile || !completionDifficulty) return;
    const diff = completionDifficulty as import("@/types").DifficultyId;
    const current = store.profiles.find(p => p.id === activeProfile.id);
    if (!current) return;

    // Anti-double-claim: check if already claimed
    if (hasClaimedDifficultyCompletionReward(current, diff)) {
      setCompletionBoxOpen(false);
      return;
    }

    // Claim the reward (includes EXP, coins, gems, badges)
    const claimed = claimDifficultyCompletionReward(current, diff);
    if (!claimed) return;

    updateProfile(current.id, claimed);
    setCompletionBoxOpen(false);
    soundService.play("badge_unlock");

    // Show appropriate modal after reward
    setTimeout(() => {
      if (diff === "universitas") {
        // Universitas is final — Mastery Complete!
        setMasteryModalOpen(true);
      } else {
        // Unlock next difficulty (does NOT change current difficulty)
        const withUnlock = unlockNextDifficulty(claimed, diff);
        if (withUnlock) {
          updateProfile(activeProfile.id, withUnlock);
        }
        setUnlockModalOpen(true);
      }
    }, 600);
  };

  const handleCompletionBoxClose = () => {
    // User wants to claim later — keep pending state, reward box stays available
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

    // Apply the difficulty upgrade — change current difficulty to next
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
    soundService.play("level_up");
    
    // Navigate to map for new difficulty
    setScreen("map");
  };

  const handleUnlockLater = () => {
    if (!activeProfile || !completionDifficulty) return;
    const diff = completionDifficulty as import("@/types").DifficultyId;
    const current = store.profiles.find(p => p.id === activeProfile.id);
    if (!current) return;

    const nextDiff = getNextDifficulty(diff);
    if (!nextDiff) return;

    // Set pending upgrade — user stays on current difficulty but can upgrade later
    const withPending = setPendingDifficultyUpgrade(current, nextDiff);
    updateProfile(current.id, withPending);

    setUnlockModalOpen(false);
    setCompletionDifficulty(null);
  };

  const handleUnlockModalClose = () => {
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

    // Apply the pending difficulty upgrade — switch to next difficulty
    const upgraded = clearPendingDifficultyUpgrade({
      ...current,
      difficulty: pendingDiff,
      currentDifficulty: pendingDiff,
      upgradedAt: Date.now(),
    });

    updateProfile(current.id, upgraded);
    soundService.play("level_up");
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

  // Old upgrade handlers removed — difficulty unlock is now ONLY via stage 500 completion.

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
          onOpenPendingBox={handleOpenPendingBox}
          onHomeUpgrade={handleHomeUpgrade}
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
        isStage500={!!lastResultStage500}
        stage500Difficulty={lastResultStage500?.difficulty}
        hasPendingFinalReward={lastResultStage500?.hasPendingReward}
        hasClaimedFinalReward={lastResultStage500?.hasClaimedReward}
        nextDifficulty={lastResultStage500?.nextDifficulty}
        isUniversitas={lastResultStage500?.isUniversitas}
        onOpenRewardBox={() => {
          if (lastResultStage500?.difficulty) {
            const current = store.profiles.find(p => p.id === activeProfile!.id);
            if (current && current.pendingFinalRewardDifficulty) {
              setCompletionDifficulty(current.pendingFinalRewardDifficulty);
              setCompletionBoxOpen(true);
            } else {
              // Fallback: use the difficulty from result
              setCompletionDifficulty(lastResultStage500.difficulty as DifficultyId);
              setCompletionBoxOpen(true);
            }
          }
        }}
        onNextMission={() => {
          const nm = nextMission();
          if (nm) { setActiveMission(nm); setLastResult(null); setLastResultStage500(null); setScreen("play"); }
          else { setLastResult(null); setLastResultStage500(null); setScreen("map"); }
        }}
        onBackToMap={() => { setLastResult(null); setLastResultStage500(null); setScreen("map"); }}
      />
    );
  }

  if (screen === "badges") return <BadgesScreen profile={activeProfile} onBack={() => setScreen("home")} />;
  if (screen === "stats") return <StatsScreen profile={activeProfile} onBack={() => setScreen("home")} />;
  if (screen === "daily-missions") return <DailyMissionsScreen profile={activeProfile} onBack={() => setScreen("home")} />;

  if (screen === "minigame-hitung") return <MiniGameHitungScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-pola") return <MiniGamePolaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-ingatan") return <MiniGameIngatanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-cari-beda") return <CariBerbedaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

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

  if (screen === "minigame-detektif") return <DetektifScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-tebak-aturan") return <TebakAturanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-kesimpulan") return <PilihKesimpulanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-benar-salah") return <BenarSalahScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

  if (screen === "minigame-ubah-posisi") return <UbahPosisiGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-cocok-bayangan") return <CocokBayanganGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-jalur-tercepat") return <JalurTercepatGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-kode-warna") return <ColorCodeGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-rantai-warna") return <MiniGameRantaiWarnaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-jalur-angka") return <MiniGameJalurAngkaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

  if (screen === "minigame-misi-keluarga") return <MisiKeluargaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;
  if (screen === "minigame-family-challenge") return <BattleScreen profiles={store.profiles} onBack={() => setScreen("minigame-center")} backRef={miniGameBackRef} />;

  // Mini Game Center — flat list (no package step)
  if (screen === "minigame-center") {
    return (
      <MiniGameCenter
        profile={activeProfile}
        onBack={() => setScreen("home")}
        onNavigate={setScreen}
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
        <SettingsScreen profile={activeProfile} onBack={() => setScreen("home")} onReload={() => window.location.reload()}
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
            onClose={handleUnlockModalClose}
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
