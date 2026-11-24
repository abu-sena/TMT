import type { DifficultyId } from "@/types";
import { PUZZLE_OBJECTS, type PuzzleObject } from "./puzzle-objects";
import { shuffleArray } from "./utils";

export type MainObject = Pick<PuzzleObject, "id" | "name" | "family" | "index">;

export interface ShadowChoice {
  id: string;
  objectId: string;
  rotation: number;
  mirrored: boolean;
  isCorrect: boolean;
}

export interface ShadowMatchQuestion {
  id: string;
  difficulty: DifficultyId;
  stage: number;
  mainObject: MainObject;
  correctShadow: ShadowChoice;
  shuffledChoices: ShadowChoice[];
  explanation: string;
}

const BASE_CHOICE_COUNTS: Record<DifficultyId, number> = {
  tk: 3,
  "sd-bawah": 3,
  "sd-atas": 4,
  smp: 4,
  sma: 5,
  universitas: 5,
};

const MAX_CHOICE_COUNTS: Record<DifficultyId, number> = {
  tk: 4,
  "sd-bawah": 5,
  "sd-atas": 5,
  smp: 6,
  sma: 6,
  universitas: 6,
};

export function getDifficultyChoiceCount(difficulty: DifficultyId, roundIndex = 0): number {
  const base = BASE_CHOICE_COUNTS[difficulty] ?? 4;
  const maximum = MAX_CHOICE_COUNTS[difficulty] ?? 6;
  return Math.min(maximum, base + Math.floor(Math.max(0, roundIndex) / 3));
}

function toMainObject(object: PuzzleObject): MainObject {
  return { id: object.id, name: object.name, family: object.family, index: object.index };
}

export function generateShadowMatchQuestion(difficulty: DifficultyId, roundIndex = 0): ShadowMatchQuestion {
  const stage = Math.min(10, Math.max(1, Math.floor(roundIndex) + 1));
  const mainObject = shuffleArray([...PUZZLE_OBJECTS])[0];
  const choiceCount = getDifficultyChoiceCount(difficulty, roundIndex);
  const correctShadow: ShadowChoice = {
    id: `choice-correct-${mainObject.id}`,
    objectId: mainObject.id,
    rotation: 0,
    mirrored: false,
    isCorrect: true,
  };

  const familyDistractors = shuffleArray(PUZZLE_OBJECTS.filter((object) => object.family === mainObject.family && object.id !== mainObject.id));
  const otherDistractors = shuffleArray(PUZZLE_OBJECTS.filter((object) => object.family !== mainObject.family));
  const distractors: ShadowChoice[] = [];

  const rotationDecoyCount = stage >= 7 ? Math.min(2, choiceCount - 1) : 0;
  const naturalDistractorLimit = choiceCount - 1 - rotationDecoyCount;
  const familyTarget = stage < 4 ? 0 : stage < 7 ? Math.min(2, naturalDistractorLimit) : naturalDistractorLimit;
  for (const object of familyDistractors.slice(0, familyTarget)) {
    distractors.push({
      id: `choice-${object.id}`,
      objectId: object.id,
      rotation: 0,
      mirrored: false,
      isCorrect: false,
    });
  }

  for (const object of otherDistractors) {
    if (distractors.length >= naturalDistractorLimit) break;
    distractors.push({
      id: `choice-${object.id}`,
      objectId: object.id,
      rotation: 0,
      mirrored: false,
      isCorrect: false,
    });
  }

  // The final rounds add near-identical silhouettes in slightly different orientations.
  // The exact, upright silhouette remains the one and only correct answer.
  if (stage >= 7) {
    const angles = shuffleArray([10, -10, 16, -16, 22, -22]);
    while (distractors.length < choiceCount - 1) {
      const angle = angles[distractors.length % angles.length];
      distractors.push({
        id: `choice-${mainObject.id}-rotated-${distractors.length}`,
        objectId: mainObject.id,
        rotation: angle,
        mirrored: stage >= 9 && distractors.length % 2 === 1,
        isCorrect: false,
      });
    }
  }

  const shuffledChoices = shuffleArray([correctShadow, ...distractors]);
  const explanation = stage < 4
    ? "Cocokkan garis luar bayangan dengan gambar berwarna."
    : stage < 7
      ? "Bentuknya makin mirip. Perhatikan siluet dan ciri khas objeknya."
      : "Periksa arah dan garis luar setiap bayangan dengan teliti.";

  return {
    id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    difficulty,
    stage,
    mainObject: toMainObject(mainObject),
    correctShadow,
    shuffledChoices,
    explanation,
  };
}

export function createShuffledChoices(choices: ShadowChoice[]): ShadowChoice[] {
  return shuffleArray([...choices]);
}

export function validateShadowMatchAnswer(question: ShadowMatchQuestion, selectedChoiceId: string): boolean {
  return question.shuffledChoices.find((choice) => choice.id === selectedChoiceId)?.isCorrect ?? false;
}
