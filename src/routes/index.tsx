import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { BadgeDef, Mission, ScreenId } from "@/game/types";
import { CATEGORIES } from "@/game/constants";
import { applyXP, checkBadges, missionsForDifficulty, newlyUnlockedBadges, scoreMission } from "@/game/logic";
import { createProfile, useGameStore } from "@/game/store";
import { MISSIONS } from "@/game/missions";

import { SplashScreen } from "@/components/screens/SplashScreen";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { ProfileSelectScreen } from "@/components/screens/ProfileSelectScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { MapScreen } from "@/components/screens/MapScreen";
import { PlayScreen } from "@/components/screens/PlayScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import { BadgesScreen } from "@/components/screens/BadgesScreen";
import { StatsScreen } from "@/components/screens/StatsScreen";
import { ParentScreen } from "@/components/screens/ParentScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { MissionPopup } from "@/components/game/MissionPopup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adab Quest — Petualangan Ilmu & Akhlak" },
      { name: "description", content: "Game edukasi anak Indonesia. Tingkatkan adab, nalar, dan kepemimpinan lewat misi seru yang bisa dimainkan offline." },
      { property: "og:title", content: "Adab Quest — Petualangan Ilmu & Akhlak" },
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
  } = useGameStore();

  const [screen, setScreen] = useState<ScreenId>("splash");
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [popupMission, setPopupMission] = useState<Mission | null>(null);
  const [lastResult, setLastResult] = useState<ResultData | null>(null);

  // route to right entry screen after hydration
  useEffect(() => {
    if (!hydrated) return;
    if (screen !== "splash") return;
    // wait for splash timer; splash calls onDone -> we decide
  }, [hydrated, screen]);

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

  const handleFinishMission = (result: { isCorrect: boolean; hintsUsed: number; attempts: number; selectedId: string }) => {
    if (!activeMission || !activeProfile) return;
    const score = scoreMission({
      mission: activeMission,
      isCorrect: result.isCorrect,
      hintsUsed: result.hintsUsed,
      attempts: result.attempts,
      streak: activeProfile.streak,
      adabApplied: true,
    });

    const prev = activeProfile;
    const xpResult = applyXP(prev, score.xpGain);

    // categoryStats — count primary and secondary categories
    const stats = { ...prev.categoryStats };
    const cats = [activeMission.category, activeMission.secondaryCategory].filter(Boolean) as (typeof CATEGORIES)[number]["id"][];
    for (const c of cats) {
      stats[c] = {
        correct: stats[c].correct + (result.isCorrect ? 1 : 0),
        total: stats[c].total + 1,
      };
    }

    const priorBest = prev.missionProgress[activeMission.id]?.bestPoints ?? 0;
    const priorStars = prev.missionProgress[activeMission.id]?.stars ?? 0;
    const newStars = Math.max(priorStars, score.stars);
    const newBestPoints = Math.max(priorBest, score.finalPoint);
    const wasNewlyCompleted = priorStars === 0 && score.stars > 0;

    const updated = {
      ...prev,
      xp: xpResult.xp,
      level: xpResult.level,
      points: prev.points + score.finalPoint,
      coins: prev.coins + (result.isCorrect ? 5 : 0),
      hearts: result.isCorrect ? prev.hearts : Math.max(0, prev.hearts - 1),
      streak: result.isCorrect ? prev.streak + 1 : 0,
      totalMissionsCompleted: prev.totalMissionsCompleted + (wasNewlyCompleted ? 1 : 0),
      categoryStats: stats,
      missionProgress: {
        ...prev.missionProgress,
        [activeMission.id]: {
          missionId: activeMission.id,
          stars: newStars,
          bestPoints: newBestPoints,
          attempts: (prev.missionProgress[activeMission.id]?.attempts ?? 0) + 1,
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
    });
    setScreen("result");
  };

  const nextMission = (): Mission | null => {
    if (!activeMission) return null;
    const idx = orderedMissions.findIndex((m) => m.id === activeMission.id);
    if (idx === -1) return null;
    return orderedMissions[idx + 1] ?? null;
  };

  // ----- RENDER -----
  if (!hydrated) {
    return <div className="min-h-[100dvh] bg-gradient-sky grid place-items-center text-2xl">📜</div>;
  }

  if (screen === "splash") return <SplashScreen onDone={onSplashDone} />;
  if (screen === "onboarding") return <OnboardingScreen onStart={onStartOnboarding} />;

  if (screen === "profile-select") {
    return (
      <ProfileSelectScreen
        profiles={store.profiles}
        activeId={store.activeProfileId}
        onSelect={selectProfile}
        onCreate={(name, avatar, diff) => addProfile(createProfile(name, avatar, diff))}
        onDelete={deleteProfile}
        onContinue={() => setScreen("home")}
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
      <HomeScreen
        profile={activeProfile}
        onNavigate={(s) => setScreen(s)}
        onSwitchProfile={() => setScreen("profile-select")}
      />
    );
  }

  if (screen === "map") {
    return (
      <MapScreen
        profile={activeProfile}
        onBack={() => setScreen("home")}
        onOpenMission={(m) => setPopupMission(m)}
      />
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
  if (screen === "parent") return <ParentScreen profile={activeProfile} onBack={() => setScreen("home")} />;
  if (screen === "settings") {
    return (
      <SettingsScreen
        profile={activeProfile}
        onBack={() => setScreen("home")}
        onUpdate={(patch) =>
          updateProfile(activeProfile.id, { settings: { ...activeProfile.settings, ...patch } })
        }
        onReset={() => resetProfileProgress(activeProfile.id)}
        onSwitchProfile={() => setScreen("profile-select")}
      />
    );
  }

  return null;

  // referenced for type narrowing (no-op)
  void MISSIONS;
}
