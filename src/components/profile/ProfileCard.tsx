import type { Profile } from "@/types";
import { DIFFICULTY_MAP } from "@/data/constants";
import { cn } from "@/lib/utils";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";

interface Props {
  profile: Profile;
  onClick?: () => void;
  selected?: boolean;
}

export function ProfileCard({ profile, onClick, selected }: Props) {
  const diff = DIFFICULTY_MAP[profile.difficulty];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected ?? false}
      className={cn("tmt-choice-button",
        "w-full rounded-3xl border-2 p-3 flex items-center gap-3 text-left transition-all shadow-card",
        selected
          ? "bg-[#116764] border-[#116764] text-white"
          : "bg-gradient-cream border-[#8C6B45]/40 hover:-translate-y-0.5",
      )}
    >
      <AvatarPortrait avatar={profile.avatar} className="h-14 w-14 rounded-2xl border-2 border-[#8C6B45]/40 shadow-pop-sm" />
      <div className="min-w-0 flex-1">
        <div className="font-display font-bold text-lg truncate">{profile.name}</div>
        <div className={cn("text-xs flex flex-wrap gap-x-2 gap-y-0.5", selected ? "text-primary-foreground/90" : "text-muted-foreground")}>
          <span>{diff.emoji} {diff.label}</span>
          <span>Lv {profile.level}</span>
          <span>⭐ {profile.points}</span>
        </div>
      </div>
    </button>
  );
}
