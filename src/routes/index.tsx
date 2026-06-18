import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import type { BadgeDef, Mission, ScreenId } from "@/types";
import { CATEGORIES } from "@/data/constants";
import { applyXP } from "@/lib/leveling";
import { checkBadges, missionsForDifficulty, newlyUnlockedBadges } from "@/lib/progress";
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
import { MiniGamePackageScreen } from "@/screens/MiniGamePackageScreen";
import { MiniGameHitungScreen } from "@/screens/MiniGameHitungScreen";
import { MiniGamePolaScreen } from "@/screens/MiniGamePolaScreen";
import { MiniGameIngatanScreen } from "@/screens/MiniGameIngatanScreen";
import { MiniGameAdabScreen } from "@/screens/MiniGameAdabScreen";
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
  const dummyBackRef = useRef<(() => boolean) | null>(null); // SSR dummy — no Capacitor

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

  const handleFinishMission = (result: { isCorrect: boolean; hintsUsed: number; attempts: number; selectedId: string; elapsedSeconds: number; isBestChoice: boolean; bossStepResults?: any[] }) => {
    if (!activeMission || !activeProfile) return;

    // Guard: ensure profile hasn't changed since mission started
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

    const priorBest = prev.missionProgress[activeMission.id]?.bestPoints ?? 0;
    const priorStars = prev.missionProgress[activeMission.id]?.stars ?? 0;
    const newStars = Math.max(priorStars, score.stars);
    const newBestPoints = Math.max(priorBest, score.finalPoint);
    const wasNewlyCompleted = priorStars === 0 && score.stars > 0;

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
    const lastDate = prev.lastPlayDate;

    if (result.isCorrect && isAdabMission) {
      const prevAdabDate = prev.lastAdabDate;
      if (prevAdabDate === today) {
        // Already played an adab mission today — don't double-count
        newAdabStreak = prev.adabStreak;
      } else if (prevAdabDate) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (prevAdabDate === yesterday) {
          newAdabStreak = prev.adabStreak + 1;
        } else {
          newAdabStreak = 1; // Gap — streak broken
        }
      } else {
        newAdabStreak = 1; // First ever adab mission
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
    } as any);
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
        onCreate={(name, avatar, diff, gender) => addProfile(createProfile(name, avatar, diff, gender))}
        onUpdate={(id, name, avatar, diff, gender) => updateProfile(id, { name, avatar, gender, difficulty: diff })}
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
    const popupStars = popupMission ? activeProfile.missionProgress[popupMission.id]?.stars ?? 0 : 0;
    return (
      <>
        <MapScreen
          profile={activeProfile}
          onBack={() => setScreen("home")}
          onOpenMission={(m) => setPopupMission(m)}
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
  if (screen === "daily-missions") return <DailyMissionsScreen profile={activeProfile} onBack={() => setScreen("home")} onPlayMission={() => {}} onPlayMiniGame={() => {}} />;

  if (screen === "minigame-center") {
    return (
      <MiniGameCenter
        profile={activeProfile}
        onBack={() => setScreen("home")}
        onNavigate={setScreen}
        onOpenPackage={(pkgId) => {
          // Simple: store in state and navigate to package screen
          setScreen("minigame-package");
        }}
      />
    );
  }

  if (screen === "minigame-package") {
    return (
      <MiniGamePackageScreen
        profile={activeProfile}
        packageId={"fokus-cepat"}
        onBack={() => setScreen("minigame-center")}
        onPlayGame={(s) => setScreen(s)}
      />
    );
  }

  if (screen === "minigame-hitung") return <MiniGameHitungScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-pola") return <MiniGamePolaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-ingatan") return <MiniGameIngatanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-cari-beda") return <CariBerbedaScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;

  if (screen === "minigame-pilih-sikap") return <MiniGameAdabScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-nasihat") return <NasihatLembutScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-urutkan-adab") return <UrutkanAdabScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-dilema") return <DilemaBijakScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;

  if (screen === "minigame-detektif") return <DetektifScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-tebak-aturan") return <TebakAturanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-kesimpulan") return <PilihKesimpulanScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-benar-salah") return <BenarSalahScreen profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;

  if (screen === "minigame-ubah-posisi") return <UbahPosisiGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-cocok-bayangan") return <CocokBayanganGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;
  if (screen === "minigame-jalur-tercepat") return <JalurTercepatGame profile={activeProfile} onBack={() => setScreen("minigame-center")} backRef={dummyBackRef} />;

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

  return null;

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
