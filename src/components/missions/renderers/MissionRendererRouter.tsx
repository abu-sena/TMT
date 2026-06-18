import type { Mission } from "@/types";
import type { BossMission } from "@/types";
import { MultipleChoiceRenderer } from "./MultipleChoiceRenderer";
import { BossMissionRenderer } from "./BossMissionRenderer";
import { PlaceholderRenderer } from "./PlaceholderRenderer";

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

  // Boss missions get the full multi-step renderer
  if (mt === "boss_mission") {
    return (
      <BossMissionRenderer
        {...props}
        mission={m as BossMission}
        onBossComplete={props.onBossComplete ?? (() => {})}
      />
    );
  }

  // All other mission types use the multiple choice renderer
  if ("options" in m && (m as any).options?.length > 0) {
    return <MultipleChoiceRenderer {...props} mission={m as any} />;
  }

  // Ultimate fallback
  return <PlaceholderRenderer {...props} />;
}
