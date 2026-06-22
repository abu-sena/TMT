import { DifficultyId } from "@/types";
import { shuffleArray } from "./utils";
import type { ShapeType } from "@/components/CodeShape";

export interface CodeMapping {
  shape: ShapeType;
  color: string;
  value: number;
}

export interface Operand {
  shape: ShapeType;
  color: string;
  value: number;
}

export interface ColorCodeQuestion {
  id: string;
  difficulty: DifficultyId;
  codeMap: CodeMapping[];
  operationType: "addition" | "subtraction" | "multiplication" | "mixed" | "algebra";
  operands: Operand[];
  expressionDisplay: string; // e.g. "⭐ + 🔺 = ?"
  correctAnswer: number;
  choices: number[];
  shuffledChoices: number[];
  explanation: string;
}

const ALL_SHAPES: { shape: ShapeType; color: string }[] = [
  { shape: "square", color: "#EF4444" },     // red
  { shape: "star", color: "#FBBF24" },       // yellow
  { shape: "circle", color: "#F97316" },     // orange
  { shape: "triangle", color: "#22C55E" },   // green
  { shape: "diamond", color: "#3B82F6" },    // blue
  { shape: "pentagon", color: "#D946EF" },   // purple
  { shape: "heart", color: "#EC4899" },      // pink
  { shape: "rectangle", color: "#7DD3FC" },  // light blue
  { shape: "hexagon", color: "#8B5CF6" },    // violet/brownish
];

export function generateColorCodeQuestion(difficulty: DifficultyId, _stage?: number): ColorCodeQuestion {
  // 1. Generate code map based on difficulty
  let shapeCount = 4;
  let maxNum = 4;
  if (difficulty === "tk") { shapeCount = 4; maxNum = 4; }
  else if (difficulty === "sd-bawah") { shapeCount = 6; maxNum = 6; }
  else { shapeCount = 9; maxNum = 9; }

  const shapesPool = shuffleArray([...ALL_SHAPES]).slice(0, shapeCount);
  const valuesPool = shuffleArray(Array.from({ length: maxNum }, (_, i) => i + 1));
  
  const codeMap: CodeMapping[] = shapesPool.map((s, i) => ({
    shape: s.shape,
    color: s.color,
    value: difficulty === "tk" || difficulty === "sd-bawah" ? i + 1 : valuesPool[i], // Linear for kids, random for adults
  }));

  // 2. Generate operation based on difficulty
  let operands: Operand[] = [];
  let correctAnswer = 0;
  let expressionDisplay = "";
  let explanation = "";
  let operationType: ColorCodeQuestion["operationType"] = "addition";

  const pickOperand = () => codeMap[Math.floor(Math.random() * codeMap.length)];

  if (difficulty === "tk" || difficulty === "sd-bawah") {
    // A + B
    const op1 = pickOperand();
    const op2 = pickOperand();
    operands = [op1, op2];
    correctAnswer = op1.value + op2.value;
    expressionDisplay = `[${op1.shape}] + [${op2.shape}] = ?`;
    explanation = `${op1.value} + ${op2.value} = ${correctAnswer}`;
  } 
  else if (difficulty === "sd-atas") {
    // A + B - C or A - B
    const isThree = Math.random() > 0.5;
    if (!isThree) {
      // Ensure positive result
      let op1 = pickOperand();
      let op2 = pickOperand();
      if (op1.value < op2.value) [op1, op2] = [op2, op1];
      const isSub = Math.random() > 0.5;
      
      operands = [op1, op2];
      if (isSub) {
        operationType = "subtraction";
        correctAnswer = op1.value - op2.value;
        expressionDisplay = `[${op1.shape}] - [${op2.shape}] = ?`;
        explanation = `${op1.value} - ${op2.value} = ${correctAnswer}`;
      } else {
        correctAnswer = op1.value + op2.value;
        expressionDisplay = `[${op1.shape}] + [${op2.shape}] = ?`;
        explanation = `${op1.value} + ${op2.value} = ${correctAnswer}`;
      }
    } else {
      const op1 = pickOperand();
      const op2 = pickOperand();
      const op3 = pickOperand();
      operands = [op1, op2, op3];
      // A + B - C
      correctAnswer = op1.value + op2.value - op3.value;
      expressionDisplay = `[${op1.shape}] + [${op2.shape}] - [${op3.shape}] = ?`;
      explanation = `${op1.value} + ${op2.value} - ${op3.value} = ${correctAnswer}`;
    }
  }
  else if (difficulty === "smp") {
    // A x B or A + B x C
    const isMult = Math.random() > 0.5;
    if (isMult) {
      const op1 = pickOperand();
      const op2 = pickOperand();
      operands = [op1, op2];
      operationType = "multiplication";
      correctAnswer = op1.value * op2.value;
      expressionDisplay = `[${op1.shape}] × [${op2.shape}] = ?`;
      explanation = `${op1.value} × ${op2.value} = ${correctAnswer}`;
    } else {
      const op1 = pickOperand();
      const op2 = pickOperand();
      const op3 = pickOperand();
      operands = [op1, op2, op3];
      operationType = "mixed";
      correctAnswer = op1.value + (op2.value * op3.value);
      expressionDisplay = `[${op1.shape}] + [${op2.shape}] × [${op3.shape}] = ?`;
      explanation = `Kerjakan perkalian dulu: ${op1.value} + (${op2.value} × ${op3.value}) = ${correctAnswer}`;
    }
  }
  else if (difficulty === "sma") {
    // (A + B) x C
    const op1 = pickOperand();
    const op2 = pickOperand();
    const op3 = pickOperand();
    operands = [op1, op2, op3];
    operationType = "mixed";
    correctAnswer = (op1.value + op2.value) * op3.value;
    expressionDisplay = `([${op1.shape}] + [${op2.shape}]) × [${op3.shape}] = ?`;
    explanation = `Kerjakan dalam kurung dulu: (${op1.value} + ${op2.value}) × ${op3.value} = ${correctAnswer}`;
  }
  else {
    // Universitas: Algebra / Missing Operand
    // A + ? = C
    const op1 = pickOperand();
    const op2 = pickOperand();
    operands = [op1, op2];
    operationType = "algebra";
    const sum = op1.value + op2.value;
    correctAnswer = op2.value;
    expressionDisplay = `[${op1.shape}] + ? = ${sum}`;
    explanation = `${op1.value} + ? = ${sum}, maka ? = ${sum} - ${op1.value} = ${correctAnswer} ([${op2.shape}])`;
  }

  // 3. Generate Choices
  let numChoices = 4;
  if (difficulty === "tk") numChoices = 3;
  if (difficulty === "smp" || difficulty === "sma" || difficulty === "universitas") numChoices = 6;

  const choicesSet = new Set<number>();
  choicesSet.add(correctAnswer);

  // Generate plausible distractors
  while(choicesSet.size < numChoices) {
    let distractor = correctAnswer + (Math.floor(Math.random() * 10) - 5);
    if (difficulty === "smp" || difficulty === "sma") {
       // more spread for multiplication
       distractor = correctAnswer + (Math.floor(Math.random() * 20) - 10);
    }
    if (distractor !== correctAnswer && distractor >= 0 && !choicesSet.has(distractor)) {
      choicesSet.add(distractor);
    }
  }

  const choices = Array.from(choicesSet);
  const shuffledChoices = shuffleArray([...choices]);

  return {
    id: `cc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    difficulty,
    codeMap,
    operationType,
    operands,
    expressionDisplay,
    correctAnswer,
    choices,
    shuffledChoices,
    explanation
  };
}

export function validateColorCodeAnswer(question: ColorCodeQuestion, selectedAnswer: number): boolean {
  return selectedAnswer === question.correctAnswer;
}
