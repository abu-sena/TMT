import { cn } from "@/lib/utils";
import { MiniGameSprite } from "./MiniGameArt";

export const MEMORY_OBJECTS = [
  { id: "fruit-apple", label: "Apel" },
  { id: "fruit-banana", label: "Pisang" },
  { id: "fruit-watermelon", label: "Semangka" },
  { id: "fruit-grapes", label: "Anggur" },
  { id: "fruit-strawberry", label: "Stroberi" },
  { id: "fruit-cherries", label: "Ceri" },
  { id: "animal-puppy", label: "Anjing" },
  { id: "animal-kitten", label: "Kucing" },
  { id: "animal-rabbit", label: "Kelinci" },
  { id: "animal-fox", label: "Rubah" },
  { id: "animal-bear", label: "Beruang" },
  { id: "animal-panda", label: "Panda" },
] as const;

const baseEmoji = ["🍎", "🍌", "🍉", "🍇", "🍓", "🍒", "🐶", "🐱", "🐰", "🦊", "🐻", "🐼"];
const props = [
  ["🚗", "Mobil merah"], ["🚕", "Taksi"], ["🚙", "Mobil hijau kebiruan"], ["🚌", "Bus"],
  ["🏎️", "Mobil balap"], ["🚲", "Sepeda"], ["⭐", "Bintang"], ["💎", "Permata"],
  ["🌈", "Pelangi"], ["🔥", "Api"], ["❄️", "Keping salju"], ["🎵", "Not musik"],
] as const;
const nature = [
  ["🌙", "Bulan sabit"], ["☀️", "Matahari"], ["🌸", "Bunga"],
  ["🍀", "Semanggi"], ["🎈", "Balon"], ["🎁", "Hadiah"],
] as const;
const colors: Record<string, { label: string; fill: string }> = {
  "🔴": { label: "Lingkaran merah", fill: "#c65049" },
  "🔵": { label: "Lingkaran biru", fill: "#467ed0" },
  "🟡": { label: "Lingkaran kuning", fill: "#edc044" },
  "🟢": { label: "Lingkaran hijau", fill: "#4a9a63" },
  "🟣": { label: "Lingkaran ungu", fill: "#9368bd" },
  "🟠": { label: "Lingkaran jingga", fill: "#e68a44" },
};

function getSprite(value: string) {
  const memory = MEMORY_OBJECTS.findIndex((object, index) => object.id === value || baseEmoji[index] === value);
  if (memory !== -1) return { atlas: "memory" as const, index: memory, label: MEMORY_OBJECTS[memory].label };
  const prop = props.findIndex(([emoji]) => emoji === value);
  if (prop !== -1) return { atlas: "props" as const, index: prop, label: props[prop][1] };
  const symbol = nature.findIndex(([emoji]) => emoji === value);
  if (symbol !== -1) return { atlas: "nature" as const, index: symbol, label: nature[symbol][1] };
}

interface Props {
  value: string;
  className?: string;
  decorative?: boolean;
}

export function MemoryObjectIcon({ value, className, decorative = false }: Props) {
  const sprite = getSprite(value);
  if (sprite) return <MiniGameSprite atlas={sprite.atlas} index={sprite.index} label={decorative ? undefined : sprite.label} className={className} />;

  const color = colors[value];
  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      role={!decorative && color ? "img" : undefined}
      aria-label={decorative ? undefined : color?.label}
      aria-hidden={decorative || undefined}
    >
      {color ? <span aria-hidden="true" className="mini-game-color-chip" style={{ backgroundColor: color.fill }} /> : value}
    </span>
  );
}

export function getMemoryObjectLabel(value: string) {
  return getSprite(value)?.label ?? colors[value]?.label ?? value;
}
