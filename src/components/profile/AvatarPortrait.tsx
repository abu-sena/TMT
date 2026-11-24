import { cn } from "@/lib/utils";
import { AVATARS } from "@/data/constants";

interface Props {
  avatar: string;
  className?: string;
}

const AVATAR_SHEET = "/assets/2d/concepts/tmt-avatar-icons-v2.webp";

/** Renders a new shinobi sprite ID, while continuing to display saved emoji avatars. */
export function AvatarPortrait({ avatar, className }: Props) {
  const index = AVATARS.findIndex(({ id }) => id === avatar);
  if (index < 0) {
    return (
      <span className={cn("inline-flex items-center justify-center text-2xl", className)} role="img" aria-label={`Avatar ${avatar}`}>
        {avatar || "🧒"}
      </span>
    );
  }

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
