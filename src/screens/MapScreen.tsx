import { useMemo, useState, useEffect, useRef } from "react";
import type { Mission, Profile, DifficultyId } from "@/types";
import { DIFFICULTY_MAP, DIFFICULTY_UI_LABELS } from "@/data/constants";
import { DIFFICULTY_ORDER } from "@/types";
import { missionsForDifficulty, getDifficultyStatus, getStageCompletionStatus } from "@/lib/progress";
import { WORLDS_BY_DIFFICULTY } from "@/data/worlds";
import type { WorldDefinition } from "@/types";
import { GameScreen } from "@/components/layout/GameScreen";
import { FixedBottomActionArea } from "@/components/layout/FixedBottomActionArea";
import { GameButton } from "../game/GameButton";
import { cn } from "@/lib/utils";
import { CATEGORY_MAP } from "@/data/constants";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";

// ══════════════════════════════════════════
// Map Configuration
// ══════════════════════════════════════════
const NODE_HEIGHT = 140; // Vertical spacing between nodes
const X_PATTERN = [
  50, 70, 85, 65, 35, 15, 30, 50, 75, 80,
  60, 40, 20, 30, 55, 80, 70, 50, 30, 20
]; // X coordinate percentages for nodes to create a winding path

interface MapProps {
  profile: Profile;
  onBack: () => void;
  onOpenMission: (m: Mission) => void;
  onChangeDifficulty?: (diff: DifficultyId) => void;
  onHomeUpgrade?: () => void;
}

// ══════════════════════════════════════════
// Main Map Screen
// ══════════════════════════════════════════
export function MapScreen({ profile, onBack, onOpenMission, onChangeDifficulty, onHomeUpgrade }: MapProps) {
  const missions = useMemo(() => missionsForDifficulty(profile.difficulty), [profile.difficulty]);
  const diff = DIFFICULTY_MAP[profile.difficulty];
  const worlds = useMemo(() => WORLDS_BY_DIFFICULTY[profile.difficulty] || [], [profile.difficulty]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Difficulty selector state
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  // Highest completed stage
  const highestCompleted = useMemo(() => {
    const completedNums = missions
      .filter(m => (profile.missionProgress[m.id]?.stars ?? 0) > 0)
      .map(m => m.number);
    return completedNums.length > 0 ? Math.max(...completedNums) : 0;
  }, [missions, profile.missionProgress]);

  const currentStageNum = highestCompleted + 1;

  // Find which world the player is currently in
  const currentWorldIndex = useMemo(() => {
    const currentMission = missions.find(m => m.number === currentStageNum);
    if (!currentMission) return 0;
    const idx = worlds.findIndex(w =>
      currentMission.worldArea === w.id ||
      (currentMission.number >= w.stageRange[0] && currentMission.number <= w.stageRange[1])
    );
    return idx !== -1 ? idx : 0;
  }, [missions, currentStageNum, worlds]);

  const [activeSegmentIndex, setActiveSegmentIndex] = useState(currentWorldIndex);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Pending upgrade
  const hasPendingUpgrade = profile.difficultyUpgradeAvailable && profile.pendingDifficultyUpgrade;

  // Auto scroll to current segment when changing segments
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Scroll to bottom (since start of path is at bottom)
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeSegmentIndex]);

  // Initial scroll to current stage inside the active segment on mount
  useEffect(() => {
    if (scrollContainerRef.current && activeSegmentIndex === currentWorldIndex) {
      // We want to scroll so the current stage is visible.
      // Since it's from bottom to top, we can calculate roughly.
      // For now, let the user scroll up naturally from the bottom of the segment.
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [activeSegmentIndex, currentWorldIndex]);

  const activeWorld = worlds[activeSegmentIndex];
  
  // Missions for current segment
  const segmentMissions = useMemo(() => {
    if (!activeWorld) return [];
    return missions.filter(m =>
      m.worldArea === activeWorld.id ||
      (m.number >= activeWorld.stageRange[0] && m.number <= activeWorld.stageRange[1])
    );
  }, [missions, activeWorld]);

  // Unlock state
  const isSegmentUnlocked = useMemo(() => {
    if (activeSegmentIndex === 0) return true;
    const prevWorld = worlds[activeSegmentIndex - 1];
    if (!prevWorld) return true;
    
    // Check if previous world is completed
    const prevMissions = missions.filter(m =>
      m.worldArea === prevWorld.id ||
      (m.number >= prevWorld.stageRange[0] && m.number <= prevWorld.stageRange[1])
    );
    return prevMissions.length > 0 && prevMissions.every(m => (profile.missionProgress[m.id]?.stars ?? 0) > 0);
  }, [activeSegmentIndex, worlds, missions, profile.missionProgress]);

  if (!activeWorld) return null;

  return (
    <GameScreen className="relative" bgClass="bg-[#81D4FA]">
      {/* Header — sticky */}
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3 relative z-20 bg-gradient-to-b from-black/20 to-transparent">
        <button
          onClick={onBack}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-[18px] bg-white/90 border-4 border-[#CBB794] text-[#5A3515] grid place-items-center text-2xl shadow-pop-sm shrink-0 active:translate-y-[2px]"
          aria-label="Kembali"
        >
          ←
        </button>
        
        {/* Difficulty selector button */}
        <button
          onClick={() => setShowDifficultySelector(!showDifficultySelector)}
          className="h-12 sm:h-14 px-3 rounded-[18px] bg-white/90 border-3 border-[#CBB794] text-[#5A3515] flex items-center gap-1.5 shadow-pop-sm shrink-0 active:translate-y-[2px]"
          aria-label="Pilih Level Kesulitan"
        >
          <span className="text-xl">{diff.emoji}</span>
          <span className="font-display font-black text-xs sm:text-sm">{diff.shortLabel}</span>
          <span className="text-xs">{showDifficultySelector ? "▲" : "▼"}</span>
        </button>
        
        <div className="flex-1 min-w-0 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/50 shadow-sm">
          <h1 className="font-display font-black text-xl text-[#5A3515] truncate">
            {activeWorld.name}
          </h1>
          <p className="text-[#8C6B45] text-xs font-bold truncate">
            Stage {currentStageNum} · Segmen {activeSegmentIndex + 1} dari {worlds.length}
          </p>
        </div>
      </header>

      {/* Difficulty Selector Dropdown */}
      {showDifficultySelector && (
        <div className="shrink-0 content-wrapper relative z-30 mx-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border-3 border-[#CBB794] shadow-2xl p-3 space-y-1.5">
            <h3 className="font-display font-black text-sm text-[#5A3515] text-center mb-1">
              Pilih Level Kesulitan
            </h3>
            {DIFFICULTY_ORDER.map((d) => {
              const status = getDifficultyStatus(profile, d);
              const info = DIFFICULTY_MAP[d];
              const progress = getStageCompletionStatus(profile, d);
              
              return (
                <button
                  key={d}
                  onClick={() => {
                    if (status === "locked") {
                      setLockedMessage(`Selesaikan 500 misi di level sebelumnya untuk membuka level ${info.label}.`);
                      return;
                    }
                    if (status === "active") {
                      setShowDifficultySelector(false);
                      return;
                    }
                    onChangeDifficulty?.(d);
                    setShowDifficultySelector(false);
                  }}
                  className={`w-full rounded-xl p-2.5 flex items-center gap-3 text-left transition-all active:scale-[0.98] ${
                    status === "active"
                      ? "bg-[#185E9F]/10 border-2 border-[#185E9F]"
                      : status === "completed"
                        ? "bg-[#2E8B12]/10 border-2 border-[#2E8B12]"
                        : status === "unlocked"
                          ? "bg-white/70 border-2 border-[#CBB794] hover:bg-[#E8F5E9]/50"
                          : "bg-stone-100/70 border-2 border-stone-300 opacity-60"
                  }`}
                >
                  <span className="text-2xl shrink-0">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-[#5A3515]">{info.label}</span>
                      {status === "active" && (
                        <span className="text-[10px] bg-[#185E9F] text-white px-2 py-0.5 rounded-full font-bold">📍 Aktif</span>
                      )}
                      {status === "completed" && (
                        <span className="text-[10px] bg-[#2E8B12] text-white px-2 py-0.5 rounded-full font-bold">✅ Selesai</span>
                      )}
                      {status === "locked" && (
                        <span className="text-[10px] bg-stone-400 text-white px-2 py-0.5 rounded-full font-bold">🔒</span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-[#8C6B45]">
                      {progress.label} stage
                    </div>
                  </div>
                  {status === "unlocked" && (
                    <span className="text-[#2E8B12] text-xs font-black">➜</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked difficulty message toast */}
      {lockedMessage && (
        <div className="shrink-0 content-wrapper mx-4">
          <div className="bg-[#FFF3E0] border-2 border-[#FF9800] rounded-2xl p-3 flex items-start gap-2">
            <span className="text-xl shrink-0">🔒</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#E65100]">{lockedMessage}</p>
            </div>
            <button onClick={() => setLockedMessage(null)} className="text-sm text-[#8C6B45] shrink-0">✕</button>
          </div>
        </div>
      )}

      {/* Pending Upgrade Banner ("Nanti Dulu" was chosen) */}
      {hasPendingUpgrade && profile.pendingDifficultyUpgrade && !showDifficultySelector && (
        <div className="shrink-0 content-wrapper mx-4 mb-2">
          <div className="bg-gradient-to-r from-[#E8F5E9] to-[#A5D6A7] border-3 border-[#2E8B12] rounded-2xl p-3 flex items-center gap-3">
            <span className="text-2xl shrink-0">{DIFFICULTY_MAP[profile.pendingDifficultyUpgrade]?.emoji || "🚀"}</span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-black text-sm text-[#2E8B12]">
                {DIFFICULTY_UI_LABELS[profile.pendingDifficultyUpgrade] || profile.pendingDifficultyUpgrade} sudah terbuka!
              </p>
              <p className="text-[10px] font-bold text-[#5A3515]">Siap naik tingkat?</p>
            </div>
            <button
              onClick={() => onHomeUpgrade?.()}
              className="shrink-0 px-4 py-2 rounded-xl bg-gradient-meadow border-b-3 border-[#1B5E20] text-white font-black text-sm shadow-sm active:translate-y-1 active:border-b-0 transition-all"
            >
              🚀 Naik
            </button>
          </div>
        </div>
      )}

      {/* Map Segment Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 min-h-0 relative w-full overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth"
      >
        <MapSegment 
          missions={segmentMissions}
          profile={profile}
          world={activeWorld}
          highestCompleted={highestCompleted}
          isUnlocked={isSegmentUnlocked}
          onOpenMission={setSelectedMission}
        />
      </div>

      {/* Segment Navigator */}
      <FixedBottomActionArea sticky={false} className="z-20 pointer-events-none">
        <div className="flex justify-between items-center gap-4 pointer-events-auto">
          <GameButton
            variant="ghost"
            size="md"
            disabled={activeSegmentIndex === 0}
            onClick={() => setActiveSegmentIndex(i => Math.max(0, i - 1))}
            className="bg-white/90 backdrop-blur-sm border-2 border-[#CBB794] shadow-pop-sm flex-1"
          >
            ↓ Sebelumnya
          </GameButton>
          
          <GameButton
            variant="primary"
            size="md"
            disabled={activeSegmentIndex === worlds.length - 1 || !isSegmentUnlocked}
            onClick={() => setActiveSegmentIndex(i => Math.min(worlds.length - 1, i + 1))}
            className="flex-1 shadow-pop-sm"
          >
            Berikutnya ↑
          </GameButton>
        </div>
      </FixedBottomActionArea>
    
      {selectedMission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setSelectedMission(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border-4 border-[#8C6B45] shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold flex items-center justify-center hover:bg-stone-300"
              onClick={() => setSelectedMission(null)}
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#5A3515] font-display mb-1">
                Stage {selectedMission.number}
              </h2>
              <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full text-sm font-bold text-stone-600 mb-4">
                <span>{CATEGORY_MAP[selectedMission.category]?.emoji || "🎮"}</span>
                <span>Jenis: {CATEGORY_MAP[selectedMission.category]?.short || selectedMission.category}</span>
              </div>
              <p className="text-lg text-[#8C6B45] font-bold">
                Tantangan:<br/>
                <span className="text-[#E91E63]">{selectedMission.challengeType?.replace(/_/g, " ").toUpperCase() || selectedMission.missionType.replace(/_/g, " ").toUpperCase()}</span>
              </p>
            </div>
            <GameButton variant="primary" size="xl" full onClick={() => {
              const m = selectedMission;
              setSelectedMission(null);
              onOpenMission(m);
            }}>
              Mulai Petualangan
            </GameButton>
          </div>
        </div>
      )}

    </GameScreen>
  );
}

// ══════════════════════════════════════════
// Map Segment Component
// ══════════════════════════════════════════
interface MapSegmentProps {
  missions: Mission[];
  profile: Profile;
  world: WorldDefinition;
  highestCompleted: number;
  isUnlocked: boolean;
  onOpenMission: (m: Mission) => void;
}

function MapSegment({ missions, profile, world, highestCompleted, isUnlocked, onOpenMission }: MapSegmentProps) {
  // Determine Map Background style based on world index/theme
  // Using themeColor as a base, and adding pseudo-elements or images if possible
  const segmentHeight = missions.length * NODE_HEIGHT + 300;
  
  // Calculate exact coordinates for each node
  const nodes = missions.map((m, i) => {
    const xPct = X_PATTERN[i % X_PATTERN.length];
    const yPx = 150 + (i * NODE_HEIGHT); // from bottom
    const yPct = (yPx / segmentHeight) * 100;
    
    return {
      mission: m,
      x: xPct,
      y: yPct, // percentage from bottom
      yPx: yPx,
    };
  });

  // SVG Path generation (smooth bezier from bottom to top)
  let pathD = "";
  if (nodes.length > 0) {
    pathD = `M ${nodes[0].x} ${100 - nodes[0].y}`; // start at node 0 (bottom-most, which is 100-y in SVG viewbox)
    for (let i = 0; i < nodes.length - 1; i++) {
      const p1 = nodes[i];
      const p2 = nodes[i+1];
      const svgY1 = 100 - p1.y;
      const svgY2 = 100 - p2.y;
      
      const cx1 = p1.x;
      const cy1 = svgY1 - Math.abs(svgY1 - svgY2) / 2;
      const cx2 = p2.x;
      const cy2 = svgY1 - Math.abs(svgY1 - svgY2) / 2;
      
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${svgY2}`;
    }
    
    // Extend path a bit at start and end
    if (nodes.length > 1) {
      pathD = `M ${nodes[0].x} 100 L ${nodes[0].x} ${100 - nodes[0].y} ` + pathD;
      const last = nodes[nodes.length - 1];
      pathD += ` L ${last.x} 0`;
    }
  }

  // Determine background style based on world.backgroundTheme
  const getBgStyle = () => {
    const themeBackgrounds: Record<string, string> = {
      forest: "linear-gradient(to top, #2E7D32, #66BB6A, #A5D6A7)",
      grassland: "linear-gradient(to top, #558B2F, #9CCC65, #C5E1A5)",
      river_bridge: "linear-gradient(to top, #0288D1, #4FC3F7, #B3E5FC)",
      cave: "linear-gradient(to top, #3E2723, #6D4C41, #8D6E63)",
      mountain: "linear-gradient(to top, #37474F, #607D8B, #90A4AE)",
      beach: "linear-gradient(to top, #00838F, #4DD0E1, #FFF9C4)",
      valley: "linear-gradient(to top, #5D4037, #8BC34A, #DCEDC8)",
      city: "linear-gradient(to top, #37474F, #546E7A, #B0BEC5)",
    };
    return { background: themeBackgrounds[world.backgroundTheme] || themeBackgrounds.forest };
  };

  return (
    <div 
      className="relative w-full transition-opacity duration-500" 
      style={{ height: segmentHeight, ...getBgStyle(), opacity: isUnlocked ? 1 : 0.6 }}
    >
      {/* Decorative SVG Path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* Shadow/Border of path */}
        <path d={pathD} stroke="#8C6B45" strokeWidth="46" fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        {/* Main Dirt Path */}
        <path d={pathD} stroke="#FFE0B2" strokeWidth="40" fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        {/* Inner dashed detail */}
        <path d={pathD} stroke="#FFB74D" strokeWidth="4" fill="none" vectorEffect="non-scaling-stroke" strokeDasharray="15 25" />
      </svg>

      {/* Decorative Elements (Randomly placed clouds/trees) */}
      <MapDecorations seed={world.id} segmentHeight={segmentHeight} />

      {/* Stage Nodes */}
      {nodes.map(({ mission: m, x, yPx }) => {
        const prog = profile.missionProgress[m.id];
        const stars = prog?.stars ?? 0;
        
        let state: "locked" | "available" | "current" | "completed" | "boss" | "reward" = "locked";
        
        if (!isUnlocked) {
          state = "locked";
        } else if (stars > 0) {
          state = "completed";
        } else if (m.number === highestCompleted + 1) {
          state = "current";
        } else if (m.number <= highestCompleted + 1) {
          state = "available";
        }

        const isBoss = (m as any).isBossMission || m.id.includes("boss") || world.bossStages.includes(m.number);
        const isReward = (m as any).giftBoxReward || (m as any).isRewardStage;
        // Stage 500 is the final stage — show as special golden boss node
        const isFinalStage = m.number === 500;

        if (state !== "locked" && state !== "completed" && state !== "current") {
          // fallback available
          if (isBoss) state = "boss";
          if (isReward) state = "reward";
        }

        return (
          <div 
            key={m.id} 
            className="absolute transform -translate-x-1/2 translate-y-1/2 z-10 flex flex-col items-center"
            style={{ left: `${x}%`, bottom: `${yPx}px` }}
          >
            <StageNode 
              number={m.number} 
              state={state} 
              stars={stars} 
              isBoss={isBoss || isFinalStage}
              isReward={isReward}
              isFinalStage={isFinalStage}
              onClick={() => state !== "locked" && onOpenMission(m)} 
            />
            {state === "current" && <PlayerMarker avatar={profile.avatar} />}
          </div>
        );
      })}

      {/* Top overlay indicator */}
      {!isUnlocked && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white/90 px-6 py-4 rounded-[2rem] border-4 border-[#8C6B45] shadow-2xl text-center max-w-[80%]">
            <div className="text-5xl mb-2">🔒</div>
            <h3 className="font-display font-black text-xl text-[#5A3515]">Area Terkunci</h3>
            <p className="text-sm font-bold text-[#8C6B45]">Selesaikan segmen sebelumnya untuk membuka jalan ini.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// Stage Node Component
// ══════════════════════════════════════════
interface StageNodeProps {
  number: number;
  state: "locked" | "available" | "current" | "completed" | "boss" | "reward";
  stars: number;
  isBoss?: boolean;
  isReward?: boolean;
  isFinalStage?: boolean;
  onClick: () => void;
}

function StageNode({ number, state, stars, isBoss, isReward, isFinalStage, onClick }: StageNodeProps) {
  // Candy Crush style colors
  // Blue for normal/completed, Green for active, Gray for locked, Gold for Boss
  // Stage 500 is the final boss with golden glow
  
  let bgClass = "";
  let borderClass = "";
  let icon = number.toString();
  let animation = "";

  switch(state) {
    case "locked":
      bgClass = "bg-gradient-to-b from-stone-300 to-stone-400";
      borderClass = "border-stone-500";
      icon = "🔒";
      break;
    case "completed":
      bgClass = "bg-gradient-to-b from-[#4FC3F7] to-[#0288D1]"; // Blue
      borderClass = "border-[#01579B]";
      break;
    case "current":
    case "available":
      bgClass = "bg-gradient-to-b from-[#81C784] to-[#388E3C]"; // Green
      borderClass = "border-[#1B5E20]";
      animation = "animate-bob";
      break;
    case "boss":
      bgClass = "bg-gradient-to-b from-[#FFB74D] to-[#F57C00]"; // Orange/Gold
      borderClass = "border-[#E65100]";
      icon = "👑";
      animation = "animate-bob";
      break;
    case "reward":
      bgClass = "bg-gradient-to-b from-[#BA68C8] to-[#7B1FA2]"; // Purple
      borderClass = "border-[#4A148C]";
      icon = "🎁";
      animation = "animate-bob";
      break;
  }

  // Stage 500 special glow
  const finalStageGlow = isFinalStage ? "shadow-[0_0_15px_rgba(255,215,0,0.6)]" : "";

  if (state === "completed" && isBoss) {
    bgClass = "bg-gradient-to-b from-[#FFB74D] to-[#F57C00]";
    borderClass = "border-[#E65100]";
  }

  const isBig = isBoss || isReward;
  const sizeClass = isBig ? "w-20 h-20 sm:w-24 sm:h-24" : "w-16 h-16 sm:w-20 sm:h-20";

  return (
    <div className="relative group">
      {isFinalStage && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#FFD700]/90 text-[#5A3515] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#D48806] z-20">
          ⭐ Final
        </div>
      )}
      {/* World Impact: glow ring on completed nodes */}
      {state === "completed" && (
        <>
          <div className="absolute inset-0 rounded-full bg-[#FFD700]/15 animate-pulse-glow scale-150 pointer-events-none" />
          <div className="absolute -top-1 -right-1 text-xs z-20 pointer-events-none">✨</div>
        </>
      )}
      <button 
        className={cn(
          "relative rounded-full border-[4px] sm:border-[5px] flex items-center justify-center text-white font-display font-black shadow-pop transition-transform",
          sizeClass, bgClass, borderClass, animation, finalStageGlow,
          state === "completed" && "shadow-[0_0_12px_rgba(255,215,0,0.3)]",
          state !== "locked" && "active:translate-y-1 active:shadow-pop-sm group-hover:scale-105"
        )}
        onClick={onClick}
        disabled={state === "locked"}
      >
        {/* Inner highlight for 3D effect */}
        {isFinalStage && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#FFD700]/30 to-transparent pointer-events-none animate-pulse" />
        )}
        {state === "completed" && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#FFD700]/10 to-transparent pointer-events-none" />
        )}
        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        
        <span className={cn(
          "relative z-10 drop-shadow-md",
          isBig ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
        )}>
          {isFinalStage ? "🏆" : icon}
        </span>
      </button>

      {/* Stars Arch */}
      {(state === "completed" || stars > 0) && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none z-20 w-[120%] justify-center">
          {[1, 2, 3].map((star) => (
            <div 
              key={star}
              className={cn(
                "text-lg sm:text-xl drop-shadow-md transform",
                star === 1 ? "-rotate-12 translate-y-2" : star === 2 ? "-translate-y-1" : "rotate-12 translate-y-2",
                star <= stars ? "text-[#FFD700] filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" : "text-black/30 brightness-50"
              )}
            >
              ★
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// Player Marker Component
// ══════════════════════════════════════════
function PlayerMarker({ avatar }: { avatar: string }) {
  return (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center animate-bounce">
      <div className="w-12 h-14 bg-[#8BC34A] border-4 border-white rounded-[24px] rounded-bl-none rotate-45 shadow-lg flex items-center justify-center">
        <div className="-rotate-45 drop-shadow-sm">
          <AvatarPortrait avatar={avatar || "🧒"} className="w-8 h-8 rounded-full" />
        </div>
      </div>
      <div className="w-4 h-2 bg-black/20 rounded-[100%] mt-2 blur-sm"></div>
    </div>
  );
}

// ══════════════════════════════════════════
// Map Decorations (Trees, Rocks, etc.)
// ══════════════════════════════════════════
function MapDecorations({ seed, segmentHeight }: { seed: string, segmentHeight: number }) {
  // Deterministic random generator based on string
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const decorations = useMemo(() => {
    const items = [];
    const count = Math.floor(segmentHeight / 200); // roughly 1 decoration per 200px
    for (let i = 0; i < count; i++) {
      // pseudo-random using hash and index
      const randX = ((hash * (i + 1) * 17) % 80) + 10; // 10% to 90%
      const randY = ((hash * (i + 2) * 23) % segmentHeight);
      const type = ((hash * (i + 3)) % 5); // 0-4
      
      let emoji = "🌲";
      let size = "text-4xl";
      switch(type) {
        case 0: emoji = "🌳"; size = "text-5xl"; break;
        case 1: emoji = "🌲"; size = "text-4xl"; break;
        case 2: emoji = "🍄"; size = "text-2xl"; break;
        case 3: emoji = "🪨"; size = "text-3xl"; break;
        case 4: emoji = "🌸"; size = "text-2xl"; break;
      }

      // Avoid center path (approximate X 40-60%)
      const finalX = randX > 40 && randX < 60 ? (randX > 50 ? 75 : 25) : randX;

      items.push({ id: i, x: finalX, y: randY, emoji, size });
    }
    return items;
  }, [hash, segmentHeight]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {decorations.map(d => (
        <div 
          key={d.id}
          className={`absolute transform -translate-x-1/2 translate-y-1/2 drop-shadow-md opacity-80 ${d.size}`}
          style={{ left: `${d.x}%`, bottom: `${d.y}px` }}
        >
          {d.emoji}
        </div>
      ))}
    </div>
  );
}
