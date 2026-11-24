import { cn } from "@/lib/utils";
import { AVATARS } from "@/data/constants";

interface Props {
  avatar: string;
  className?: string;
}

const AVATAR_SHEET = "./assets/field-guide/petualang.webp";

/** Existing portrait IDs retain their slot after the art update. */
export function AvatarPortrait({ avatar, className }: Props) {
  const savedIndex = AVATARS.findIndex(({ id }) => id === avatar);
  if (savedIndex < 0) {
    return (
      <span
        className={cn("inline-flex items-center justify-center text-2xl", className)}
        role="img"
        aria-label={`Avatar ${avatar || "petualang"}`}
      >
        {avatar || "🧒"}
      </span>
    );
  }

  const index = savedIndex;

  const { label } = AVATARS[index];
  const column = index % 3;
  const row = Math.floor(index / 3);

  return (
    <span
      className={cn("inline-block shrink-0 overflow-hidden bg-center bg-no-repeat", className)}
      role="img"
      aria-label={label}
      style={{
        backgroundImage: `url(${AVATAR_SHEET})`,
        backgroundSize: "300% 200%",
        backgroundPosition: `${column * 50}% ${row * 100}%`,
      }}
    />
  );
}
