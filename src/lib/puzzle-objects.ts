export const PUZZLE_OBJECTS = [
  { id: "cat", name: "Kucing", family: "animals", index: 0 },
  { id: "dog", name: "Anjing", family: "animals", index: 1 },
  { id: "rabbit", name: "Kelinci", family: "animals", index: 2 },
  { id: "fox", name: "Rubah", family: "animals", index: 3 },
  { id: "apple", name: "Apel", family: "fruit", index: 4 },
  { id: "pear", name: "Pir", family: "fruit", index: 5 },
  { id: "tomato", name: "Tomat", family: "fruit", index: 6 },
  { id: "plum", name: "Prem", family: "fruit", index: 7 },
  { id: "car", name: "Mobil kecil", family: "transport", index: 8 },
  { id: "taxi", name: "Taksi", family: "transport", index: 9 },
  { id: "minivan", name: "Minivan", family: "transport", index: 10 },
  { id: "suv", name: "SUV", family: "transport", index: 11 },
  { id: "mug", name: "Mug", family: "drinkware", index: 12 },
  { id: "teacup", name: "Cangkir dan tatakan", family: "drinkware", index: 13 },
  { id: "travel-cup", name: "Gelas perjalanan", family: "drinkware", index: 14 },
  { id: "thermos", name: "Termos", family: "drinkware", index: 15 },
] as const;

export type PuzzleObject = (typeof PUZZLE_OBJECTS)[number];
export type PuzzleObjectId = PuzzleObject["id"];

export function getPuzzleObject(id: string): PuzzleObject | undefined {
  return PUZZLE_OBJECTS.find((object) => object.id === id);
}
