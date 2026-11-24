import { cn } from "@/lib/utils";

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

const MEMORY_SPRITE_SHEET = "./assets/2d/minigames/tmt-memory-objects-v2.webp";

interface Props {
  value: string;
  className?: string;
  decorative?: boolean;
}

/** Shows a custom memory-game sprite, while keeping the remaining emoji pool intact. */
export function MemoryObjectIcon({ value, className, decorative = false }: Props) {
  const index = MEMORY_OBJECTS.findIndex((object) => object.id === value);
  const object = index >= 0 ? MEMORY_OBJECTS[index] : null;

  if (!object) {
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : value}
        aria-hidden={decorative || undefined}
      >
        {value}
      </span>
    );
  }

  const column = index % 4;
  const row = Math.floor(index / 4);

  return (
    <span
      className={cn("inline-block shrink-0 bg-center bg-no-repeat", className)}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : object.label}
      aria-hidden={decorative || undefined}
      style={{
        backgroundImage: `url(${MEMORY_SPRITE_SHEET})`,
        backgroundSize: "400% 300%",
        backgroundPosition: `${column * (100 / 3)}% ${row * 50}%`,
      }}
    />
  );
}

export function getMemoryObjectLabel(value: string) {
  return MEMORY_OBJECTS.find((object) => object.id === value)?.label ?? value;
}
