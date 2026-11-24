import { X as TmtCloseGlyph, ArrowLeft, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import type { Mission, Profile, DifficultyId } from "@/types";
import { DIFFICULTY_MAP, DIFFICULTY_UI_LABELS } from "@/data/constants";
import { DIFFICULTY_ORDER } from "@/types";
import { missionsForDifficulty, getDifficultyStatus, getStageCompletionStatus } from "@/lib/progress";
import { WORLDS_BY_DIFFICULTY } from "@/data/worlds";
import type { WorldDefinition } from "@/types";
import { GameScreen } from "@/components/layout/GameScreen";
import { GameButton } from "../game/GameButton";
import { cn } from "@/lib/utils";
import { CATEGORY_MAP } from "@/data/constants";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";
import { GameNotice } from "@/components/layout/GameNotice";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

// ══════════════════════════════════════════
// Map Configuration
// ══════════════════════════════════════════
const NODE_HEIGHT = 140; // Vertical spacing between nodes
const X_PATTERN = [
  50, 70, 85, 65, 35, 15, 30, 50, 75, 80,
  60, 40, 20, 30, 55, 80, 70, 50, 30, 20
]; // X coordinate percentages for nodes to create a winding path
const TERRAIN_BLEND_STAGES = 3;
const TERRAIN_ASSET_ROOT = `${import.meta.env.BASE_URL}assets/field-guide/`;
const TERRAIN_BY_THEME: Record<string, string> = {
  forest: "hutan",
  grassland: "padang-rumput",
  city: "kota",
  river_bridge: "sungai-jembatan",
  beach: "pantai",
  cave: "gua",
  valley: "lembah",
  mountain: "pegunungan",
};
const TERRAIN_BY_WORLD: Record<string, string> = {
  "tk-rumah-misteri": "rumah-teka-teki",
  "sdk-rumah-tekateki": "rumah-teka-teki",
  "sma-kota-modern": "kota-modern",
  "sma-sistem-kota": "kota-modern",
  "sma-gerbang-utama": "gerbang-utama",
  "univ-puncak-mastermind": "puncak-mastermind",
};

function getTerrainSource(world: WorldDefinition) {
  const name = TERRAIN_BY_WORLD[world.id] ?? TERRAIN_BY_THEME[world.backgroundTheme];
  return name ? `${TERRAIN_ASSET_ROOT}wilayah/${name}.webp` : `${TERRAIN_ASSET_ROOT}jalur-kota-ilmu.webp`;
}

function blendAtBoundary(stage: number, boundary: number) {
  const progress = Math.max(0, Math.min(1, (stage - boundary + TERRAIN_BLEND_STAGES) / (2 * TERRAIN_BLEND_STAGES)));
  return progress * progress * (3 - 2 * progress);
}

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
  const terrainRef = useRef<HTMLDivElement>(null);

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
    if (!currentMission) {
      const lastMissionNumber = missions[missions.length - 1]?.number ?? 0;
      return currentStageNum > lastMissionNumber ? Math.max(0, worlds.length - 1) : 0;
    }
    const idx = worlds.findIndex(w =>
      currentMission.worldArea === w.id ||
      (currentMission.number >= w.stageRange[0] && currentMission.number <= w.stageRange[1])
    );
    return idx !== -1 ? idx : 0;
  }, [missions, currentStageNum, worlds]);

  const [activeSegmentIndex, setActiveSegmentIndex] = useState(currentWorldIndex);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  useEffect(() => {
    setActiveSegmentIndex(currentWorldIndex);
  }, [profile.difficulty, currentWorldIndex]);

  // Pending upgrade
  const hasPendingUpgrade = profile.difficultyUpgradeAvailable && profile.pendingDifficultyUpgrade;

  const segments = useMemo(() => {
    let unlocked = true;
    const visible = [];
    for (const [index, world] of worlds.entries()) {
      const stages = missions.filter(m =>
        m.worldArea === world.id || (m.number >= world.stageRange[0] && m.number <= world.stageRange[1])
      );
      visible.push({ index, world, stages, unlocked });
      if (!unlocked) break;
      unlocked = stages.length > 0 && stages.every(m => (profile.missionProgress[m.id]?.stars ?? 0) > 0);
    }
    return visible;
  }, [missions, profile.missionProgress, worlds]);

  const selectedSegment = Math.min(activeSegmentIndex, segments.length - 1);
  const activeWorld = worlds[selectedSegment];
  const finalStage = worlds[worlds.length - 1]?.stageRange[1] ?? 0;

  const syncMapViewport = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const center = container.scrollTop + container.clientHeight / 2;
    for (const section of Array.from(container.querySelectorAll<HTMLElement>("[data-map-section]"))) {
      const top = section.offsetTop;
      if (center < top || center >= top + section.offsetHeight) continue;
      const index = Number(section.dataset.mapSection);
      const world = worlds[index];
      if (!world) return;
      const fraction = 1 - (center - top) / section.offsetHeight;
      const [first, last] = world.stageRange;
      const stage = first - 1 + fraction * (last - first + 1);
      const journey = stage / finalStage;
      const terrain = terrainRef.current;
      if (terrain) {
        terrain.style.setProperty("--terrain-offset", `${-34 * (1 - journey)}%`);
        const previous = index > 0 && stage < first - 1 + TERRAIN_BLEND_STAGES;
        const backLayer = previous ? index - 1 : index;
        const frontLayer = backLayer + 1;
        const boundary = worlds[backLayer].stageRange[1];
        const blend = blendAtBoundary(stage, boundary);
        for (const layer of Array.from(terrain.children)) {
          if (!(layer instanceof HTMLElement)) continue;
          const layerIndex = Number(layer.dataset.terrainLayer);
          const opacity = layerIndex === backLayer ? 1 : layerIndex === frontLayer ? blend : 0;
          layer.style.setProperty("--terrain-opacity", String(opacity));
        }
      }
      setActiveSegmentIndex(index);
      return;
    }
  }, [finalStage, worlds]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const current = container.querySelector<HTMLElement>("[data-current-stage]");
    const section = current?.closest<HTMLElement>("[data-map-section]");
    container.scrollTop = current && section
      ? section.offsetTop + current.offsetTop - container.clientHeight * .58
      : currentStageNum > finalStage ? 0 : container.scrollHeight;
    syncMapViewport();
  }, [profile.difficulty, currentStageNum, finalStage, segments.length, syncMapViewport]);

  function goToSegment(index: number) {
    const container = scrollContainerRef.current;
    const section = container?.querySelector<HTMLElement>(`[data-map-section="${index}"]`);
    if (!container || !section) return;
    const enteringFromBelow = index > selectedSegment;
    container.scrollTop = enteringFromBelow
      ? section.offsetTop + section.offsetHeight - container.clientHeight
      : section.offsetTop;
    syncMapViewport();
  }

  if (!activeWorld) return null;

  return (
    <GameScreen className="relative field-map" bgClass="bg-[#fbf8f0]">
      {/* Header — sticky */}
      <header className="field-map-header field-wrap">
        <button type="button"
          onClick={onBack}
          className="field-back"
          aria-label="Kembali"
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>
        
        {/* Difficulty selector button */}
        <button type="button"
          onClick={() => setShowDifficultySelector(!showDifficultySelector)}
          className="field-back field-map-difficulty"
          aria-label={`Pilih tingkat kesulitan, saat ini ${diff.shortLabel}`}
          aria-expanded={showDifficultySelector}
        >
          {diff.shortLabel}<ChevronDown size={16} aria-hidden="true" />
        </button>
        
        <div className="field-map-heading">
          <h1 className="font-display font-black text-xl">
            {activeWorld.name}
          </h1>
          <p className="text-sm font-bold">
            Wilayah {selectedSegment + 1} dari {worlds.length} · Misi {activeWorld.stageRange[0]}–{activeWorld.stageRange[1]}
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
                <button type="button"
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
                  className={`tmt-choice-button w-full rounded-xl p-2.5 flex items-center gap-3 text-left transition-all active:scale-[0.98] ${
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
          <GameNotice tone="warning" onClose={() => setLockedMessage(null)}>{lockedMessage}</GameNotice>
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
            <button type="button" data-action="primary"
              onClick={() => onHomeUpgrade?.()}
              className="tmt-action-button shrink-0 px-4 py-2 rounded-xl bg-gradient-meadow border-b-3 border-[#1B5E20] text-white font-black text-sm shadow-sm active:translate-y-1 active:border-b-0 transition-all"
            >
              🚀 Naik
            </button>
          </div>
        </div>
      )}

      {/* Map Segment Container */}
      <div className="field-map-track">
        <div ref={terrainRef} className="field-map-terrain" aria-hidden="true">
          {segments.map(({ index, world }) => (
            <img
              key={world.id}
              data-terrain-layer={index}
              data-terrain-initial={index === currentWorldIndex ? "" : undefined}
              className="field-map-biome"
              src={getTerrainSource(world)}
              alt=""
              decoding="async"
            />
          ))}
        </div>
        <div ref={scrollContainerRef} className="field-map-scroll" onScroll={syncMapViewport}>
          {[...segments].reverse().map(({ index, world, stages, unlocked }) => (
            <MapSegment
              key={world.id}
              index={index}
              missions={stages}
              profile={profile}
              world={world}
              highestCompleted={highestCompleted}
              isUnlocked={unlocked}
              onOpenMission={setSelectedMission}
            />
          ))}
        </div>
        {!segments[selectedSegment]?.unlocked && (
          <p className="field-map-locked"><Lock size={14} aria-hidden="true" /> Selesaikan wilayah sebelumnya untuk membuka jalur ini.</p>
        )}
      </div>

      <nav className="field-map-nav field-wrap" aria-label="Navigasi wilayah">
        <button type="button" className="field-back" disabled={selectedSegment <= 0} onClick={() => goToSegment(selectedSegment - 1)}>
          <ChevronDown size={17} aria-hidden="true" /> Sebelumnya
        </button>
        <button type="button" className="field-button" disabled={selectedSegment >= segments.length - 1} onClick={() => goToSegment(selectedSegment + 1)}>
          Berikutnya <ChevronUp size={17} aria-hidden="true" />
        </button>
      </nav>
    
      <Dialog open={!!selectedMission} onOpenChange={(open) => { if (!open) setSelectedMission(null); }}>
        {selectedMission && (
          <DialogContent hideCloseButton className="w-[calc(100%-2rem)] max-w-sm max-h-[88dvh] overflow-y-auto rounded-3xl border p-6 shadow-2xl">
            <DialogDescription className="sr-only">Pratinjau misi yang dipilih dan tombol untuk memulainya.</DialogDescription>
            <button 
              type="button"
              aria-label="Tutup pratinjau misi"
              className="tmt-icon-button absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold flex items-center justify-center hover:bg-stone-300"
              onClick={() => setSelectedMission(null)}
            >
              <TmtCloseGlyph aria-hidden="true" />
            </button>
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-[#49625a]">Misi {selectedMission.number}</p>
              <DialogTitle className="text-2xl font-black text-[#173c3a] font-display mt-1 px-5">
                {selectedMission.title}
              </DialogTitle>
              <div className="inline-flex items-center gap-2 bg-white/75 px-3 py-1.5 rounded-full text-sm font-bold text-[#49625a] mt-3">
                <span>{CATEGORY_MAP[selectedMission.category]?.emoji || "🎮"}</span>
                <span>{CATEGORY_MAP[selectedMission.category]?.short || "Petualangan"}</span>
              </div>
            </div>
            <GameButton variant="primary" size="xl" full onClick={() => {
              const m = selectedMission;
              setSelectedMission(null);
              onOpenMission(m);
            }}>
              Mulai Petualangan
            </GameButton>
          </DialogContent>
        )}
      </Dialog>

    </GameScreen>
  );
}

// ══════════════════════════════════════════
// Map Segment Component
// ══════════════════════════════════════════
interface MapSegmentProps {
  index: number;
  missions: Mission[];
  profile: Profile;
  world: WorldDefinition;
  highestCompleted: number;
  isUnlocked: boolean;
  onOpenMission: (m: Mission) => void;
}

function MapSegment({ index, missions, profile, world, highestCompleted, isUnlocked, onOpenMission }: MapSegmentProps) {
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
    pathD = `M 50 100 L ${nodes[0].x} ${100 - nodes[0].y}`;
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
    
    const last = nodes[nodes.length - 1];
    const midpoint = (100 - last.y) / 2;
    pathD += ` C ${last.x} ${midpoint}, 50 ${midpoint}, 50 0`;
  }

  return (
    <section
      data-map-section={index}
      aria-label={world.name}
      className="relative w-full field-map-segment"
      style={{ height: segmentHeight }}
    >
      {/* Decorative SVG Path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* Shadow/Border of path */}
        <path d={pathD} stroke="#578975" strokeWidth="26" fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" opacity="0.38" />
        {/* Main Dirt Path */}
        <path d={pathD} stroke="#fff4d7" strokeWidth="21" fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        {/* Inner dashed detail */}
        <path d={pathD} stroke="#aa8954" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" strokeDasharray="7 12" />
      </svg>
      <span className="field-map-waypoint">
        {!isUnlocked && <Lock size={13} aria-hidden="true" />}
        {world.name}
      </span>

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
            data-current-stage={state === "current" ? "" : undefined}
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

    </section>
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
      <button type="button"
        data-state={state}
        data-special={isBoss || isReward ? "" : undefined}
        className={cn(
          "field-stage relative rounded-full flex items-center justify-center text-white font-display font-black shadow-pop transition-transform",
          sizeClass, bgClass, borderClass, animation, finalStageGlow,
          state === "completed" && "shadow-[0_0_12px_rgba(255,215,0,0.3)]",
          state !== "locked" && "active:translate-y-1 active:shadow-pop-sm group-hover:scale-105"
        )}
        onClick={onClick}
        disabled={state === "locked"}
        aria-label={`Stage ${number}, ${state === "locked" ? "terkunci" : state === "completed" ? "selesai" : state === "current" ? "tahap aktif" : state === "boss" ? "tantangan bos" : state === "reward" ? "tahap hadiah" : "tersedia"}${stars > 0 ? `, ${stars} bintang` : ""}${isFinalStage ? ", misi akhir" : ""}`}
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
