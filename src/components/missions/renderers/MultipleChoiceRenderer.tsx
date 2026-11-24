import type { MultipleChoiceMission } from "@/types";

interface Props {
  mission: MultipleChoiceMission;
  revealed: boolean;
  selectedId: string | null;
  wrongIds: string[];
  onSelect: (id: string) => void;
}

export function MultipleChoiceRenderer({ mission, revealed, selectedId, wrongIds, onSelect }: Props) {
  return (
    <div className="space-y-4 w-full">
      <header className="field-mission-story">
        <h1>{mission.title}</h1>
        <p>{mission.story}</p>
      </header>
      <h2 className="field-mission-question" id="mission-question">{mission.instruction}</h2>
      <div className="space-y-2" role="group" aria-labelledby="mission-question">
        {mission.options.map((option, index) => {
          const selected = selectedId === option.id;
          const tried = wrongIds.includes(option.id);
          const right = revealed && option.id === mission.correctAnswer;
          const wrong = revealed && selected && !right;
          const state = right ? "right" : wrong ? "wrong" : tried ? "tried" : selected ? "selected" : "idle";
          return (
            <button key={option.id} type="button" className="field-answer" data-state={state} aria-pressed={selected} disabled={revealed || tried} onClick={() => onSelect(option.id)}>
              <span aria-hidden="true">{right ? "✓" : wrong || tried ? "×" : String.fromCharCode(65 + index)}</span>
              <strong>{option.label}</strong>
              {(right || wrong || tried) && <small className="ml-auto">{right ? "Benar" : "Keliru"}</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
