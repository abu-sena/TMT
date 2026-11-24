import type { Mission, BossMission } from "@/types";
import { MultipleChoiceRenderer } from "./MultipleChoiceRenderer";
import { BossMissionRenderer } from "./BossMissionRenderer";
import { PlaceholderRenderer } from "./PlaceholderRenderer";

/**
 * CHALLENGE_RENDERER_MAP — single source of truth for routing challengeType → renderer.
 * Each entry maps a challengeType string to a React component that renders the mission.
 * 
 * Some renderers use simple mock UI with choices until full mini-game engines are integrated.
 * Multiple choice fallback handles missions with options[] even without a mapped renderer.
 */

// Simulated / light mock renderers for challenge types without full game engines yet.
// These show a friendly MC-style UI using the mission's choices.
function createChoiceRenderer(name: string, icon: string, description: string) {
  return function ChoiceRenderer(props: any) {
    const { mission, revealed, selectedId, wrongIds, onSelect } = props;
    const options = mission.options || [];
    const isCorrect = selectedId === mission.correctAnswer;

    return (
      <div className="flex flex-col items-center justify-start p-4 text-center h-full overflow-y-auto">
        <div className="text-5xl mb-2">{icon}</div>
        <h2 className="text-xl font-black text-[#5A3515] mb-1 font-display">{mission.title || name}</h2>
        <p className="text-xs font-bold text-[#8C6B45] mb-1">{description}</p>
        <div className="bg-white/70 rounded-2xl p-4 mb-4 w-full border-2 border-[#CBB794]">
          {mission.story && (
            <p className="text-sm text-[#5A3515] mb-2 font-medium">{mission.story}</p>
          )}
          <p className="text-base font-bold text-[#185E9F]">{mission.instruction}</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {options.map((opt: any) => {
            const isSelected = selectedId === opt.id;
            const isWrong = wrongIds?.includes(opt.id);
            const isAnswerCorrect = opt.id === mission.correctAnswer;
            let btnClass = "bg-white border-[#CBB794] hover:border-[#185E9F] text-[#5A3515]";
            if (isWrong) btnClass = "bg-[#FFCDD2] border-[#D32F2F] text-[#A02020] line-through";
            else if (revealed && isAnswerCorrect) btnClass = "bg-[#C8E6C9] border-[#2E8B12] text-[#2E8B12]";
            else if (isSelected && !revealed) btnClass = "bg-[#E3F2FD] border-[#185E9F] text-[#185E9F]";
            
            return (
              <button type="button"
                key={opt.id}
                onClick={() => !revealed && !isWrong && onSelect(opt.id)}
                disabled={revealed || isWrong}
                className={`tmt-choice-button rounded-2xl border-[3px] px-4 py-3 font-bold text-sm transition-all active:scale-95 ${btnClass}`}
              >
                {opt.emoji && <span className="mr-2">{opt.emoji}</span>}
                {opt.label}
                {isWrong && <span className="ml-2">✕</span>}
                {revealed && isAnswerCorrect && <span className="ml-2">✓</span>}
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className={`mt-4 rounded-2xl p-3 w-full max-w-xs ${isCorrect ? "bg-[#E8F5E9] border-2 border-[#2E8B12]" : "bg-[#FFEBEE] border-2 border-[#D32F2F]"}`}>
            <p className="text-sm font-bold text-[#5A3515]">{mission.explanation}</p>
          </div>
        )}
      </div>
    );
  };
}

const NumeracyMissionRenderer = createChoiceRenderer("Numerasi", "📖", "Literasi & Numerasi");
const BestAttitudeRenderer = createChoiceRenderer("Pilih Sikap Terbaik", "🌟", "Pilih sikap yang sesuai dengan adab Islami.");
const GentleAdviceRenderer = createChoiceRenderer("Nasihat dengan Lembut", "💬", "Pilih kata-kata terbaik untuk menasihati teman.");
const ShadowMatchGame = createChoiceRenderer("Cocokkan Bayangan", "👤", "Pilih bayangan yang cocok dengan gambar.");
const PositionShiftGame = createChoiceRenderer("Ubah Posisi", "🔄", "Tentukan posisi akhir setelah mengikuti instruksi.");
const FastestPathGame = createChoiceRenderer("Jalur Tercepat", "🐒", "Pilih jalur tercepat untuk mencapai tujuan.");
const ColorCodeGame = createChoiceRenderer("Kode Warna", "🎨", "Pecahkan kode berdasarkan urutan warna.");
const DetectiveCluesGame = createChoiceRenderer("Detektif Petunjuk", "🕵️", "Ikuti petunjuk untuk memecahkan misteri.");
const GuessRuleGame = createChoiceRenderer("Tebak Aturan", "📐", "Temukan aturan dari contoh yang diberikan.");
const ChooseConclusionGame = createChoiceRenderer("Pilih Kesimpulan", "💡", "Pilih kesimpulan yang paling tepat.");
const TrueFalseGame = createChoiceRenderer("Benar atau Salah", "✅", "Tentukan benar atau salah pernyataan.");
const CariBerbedaGame = createChoiceRenderer("Cari yang Berbeda", "🔍", "Temukan yang berbeda dari kumpulan.");
const IngatanCepatRenderer = createChoiceRenderer("Ingatan Cepat", "🧠", "Ingat dan pilih jawaban yang tepat.");
const PolaRenderer = createChoiceRenderer("Pola", "🔣", "Kenali pola dan pilih kelanjutannya.");
const DilemaBijakRenderer = createChoiceRenderer("Dilema Bijak", "⚖️", "Pilih keputusan paling bijaksana.");

/**
 * Single routing table for challenge types.
 * When adding a new mini-game, add its challengeType here with the corresponding renderer.
 */
export const CHALLENGE_RENDERER_MAP: Record<string, React.FC<any>> = {
  // Numeracy
  numeracy_basic: NumeracyMissionRenderer,
  arithmetic_reasoning: NumeracyMissionRenderer,
  color_code_math: ColorCodeGame,
  // Adab / Moral
  best_attitude: BestAttitudeRenderer,
  gentle_advice: GentleAdviceRenderer,
  order_adab: GentleAdviceRenderer,
  dilemma_wisdom: DilemaBijakRenderer,
  // Spasial / Visual
  shadow_match: ShadowMatchGame,
  position_shift: PositionShiftGame,
  fastest_path: FastestPathGame,
  shape_odd_one: CariBerbedaGame,
  visual_pattern: PolaRenderer,
  spatial_position: PositionShiftGame,
  match_shadow: ShadowMatchGame,
  change_position: PositionShiftGame,
  // Logic / Pattern
  color_code: ColorCodeGame,
  detective_clues: DetectiveCluesGame,
  guess_rule: GuessRuleGame,
  choose_conclusion: ChooseConclusionGame,
  true_false: TrueFalseGame,
  logic_pattern: PolaRenderer,
  cause_effect: ChooseConclusionGame,
  constraint_reasoning: DetectiveCluesGame,
  pick_conclusion: ChooseConclusionGame,
  true_or_false: TrueFalseGame,
  spot_difference: CariBerbedaGame,
  memory_speed: IngatanCepatRenderer,
  pattern_speed: PolaRenderer,
  pattern_recognition: PolaRenderer,
  // Boss / Review / Reward
  boss_mixed: BossMissionRenderer,
  review_mixed: ChooseConclusionGame,
  final_challenge: BossMissionRenderer,
  reward_gift: ChooseConclusionGame,
  // Moral / Wisdom
  wisdom_dilemma: DilemaBijakRenderer,
  moral_choice: BestAttitudeRenderer,
  moral_decision: BestAttitudeRenderer,
  // Legacy missionType mappings (for stages using missionType as challengeType)
  tk_adab_basic: BestAttitudeRenderer,
  tk_counting: NumeracyMissionRenderer,
  tk_pre_literacy: NumeracyMissionRenderer,
  tk_pattern_simple: PolaRenderer,
  tk_visual_match: ShadowMatchGame,
  tk_creativity_simple: ChooseConclusionGame,
  multiple_choice: NumeracyMissionRenderer,
  numeracy_story: NumeracyMissionRenderer,
  spatial_reasoning: PositionShiftGame,
  systems_thinking: ChooseConclusionGame,
  lateral_thinking: GuessRuleGame,
  general_reasoning: DetectiveCluesGame,
  argument_evaluation: ChooseConclusionGame,
  ethical_leadership: DilemaBijakRenderer,
  university_case_analysis: ChooseConclusionGame,
  boss_mission: BossMissionRenderer,
};

interface Props {
  mission: Mission;
  revealed: boolean;
  selectedId: string | null;
  wrongIds: string[];
  onSelect: (id: string) => void;
  onBossComplete?: (results: { stepId: string; selectedId: string; isCorrect: boolean; attempts: number; hintsUsed: number }[]) => void;
}

export function MissionRendererRouter(props: Props) {
  const m = props.mission;
  const mt = m.missionType;
  const ct = (m as any).challengeType;

  // 1. Boss missions
  if (mt === "boss_mission") {
    return (
      <BossMissionRenderer
        {...props}
        mission={m as BossMission}
        onBossComplete={props.onBossComplete ?? (() => {})}
      />
    );
  }

  // 2. Specific Challenge Renderers
  if (ct && CHALLENGE_RENDERER_MAP[ct]) {
    const Renderer = CHALLENGE_RENDERER_MAP[ct];
    return <Renderer {...props} />;
  }

  // 3. Fallback to Multiple Choice if options exist
  if ("options" in m && (m as any).options?.length > 0) {
    return <MultipleChoiceRenderer {...props} mission={m as any} />;
  }

  // 4. Ultimate fallback
  return <PlaceholderRenderer {...props} />;
}
