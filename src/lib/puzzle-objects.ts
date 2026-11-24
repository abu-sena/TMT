export const PUZZLE_OBJECTS = [
  { id: "cat", name: "Kucing", family: "animals", index: 0 },
  { id: "dog", name: "Anjing", family: "animals", index: 1 },
  { id: "rabbit", name: "Kelinci", family: "animals", index: 2 },
  { id: "turtle", name: "Kura-kura", family: "animals", index: 3 },
  { id: "apple", name: "Apel", family: "fruit", index: 4 },
  { id: "pear", name: "Pir", family: "fruit", index: 5 },
  { id: "banana", name: "Pisang", family: "fruit", index: 6 },
  { id: "strawberry", name: "Stroberi", family: "fruit", index: 7 },
  { id: "car", name: "Mobil", family: "transport", index: 8 },
  { id: "bus", name: "Bus sekolah", family: "transport", index: 9 },
  { id: "airplane", name: "Pesawat", family: "transport", index: 10 },
  { id: "bicycle", name: "Sepeda", family: "transport", index: 11 },
  { id: "mug", name: "Cangkir", family: "household", index: 12 },
  { id: "teapot", name: "Teko", family: "household", index: 13 },
  { id: "watering-can", name: "Penyiram tanaman", family: "household", index: 14 },
  { id: "umbrella", name: "Payung", family: "household", index: 15 },
] as const;

export type PuzzleObject = (typeof PUZZLE_OBJECTS)[number];
export type PuzzleObjectId = PuzzleObject["id"];

export function getPuzzleObject(id: string): PuzzleObject | undefined {
  return PUZZLE_OBJECTS.find((object) => object.id === id);
}
