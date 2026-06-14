import { useState } from "react";
import type { DifficultyId, Profile } from "@/game/types";
import { AVATARS, DIFFICULTIES } from "@/game/constants";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { ProfileCard } from "../game/ProfileCard";
import { cn } from "@/lib/utils";

interface Props {
  profiles: Profile[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string, avatar: string, difficulty: DifficultyId) => void;
  onDelete: (id: string) => void;
  onContinue: () => void;
}

export function ProfileSelectScreen({ profiles, activeId, onSelect, onCreate, onDelete, onContinue }: Props) {
  const [creating, setCreating] = useState(profiles.length === 0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [diff, setDiff] = useState<DifficultyId>("sd-kecil");

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), avatar, diff);
    setName("");
    setCreating(false);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-sky px-5 pt-10 pb-8">
      <header className="text-center mb-5">
        <div className="text-5xl">👨‍👩‍👧</div>
        <h1 className="font-display font-black text-2xl text-[color:var(--wood-dark)] mt-1">
          Pilih Profil
        </h1>
        <p className="text-sm text-[color:var(--wood-dark)]/80">
          Banyak anak bisa main di satu perangkat.
        </p>
      </header>

      <div className="max-w-md mx-auto space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className="flex gap-2">
            <div className="flex-1">
              <ProfileCard
                profile={p}
                selected={p.id === activeId}
                onClick={() => onSelect(p.id)}
              />
            </div>
            <button
              onClick={() => {
                if (confirm(`Hapus profil ${p.name}?`)) onDelete(p.id);
              }}
              className="h-14 w-12 rounded-2xl bg-white border-2 border-[color:var(--heart)]/40 text-[color:var(--heart)] grid place-items-center shadow-pop-sm"
              aria-label="Hapus profil"
            >
              🗑️
            </button>
          </div>
        ))}

        {!creating ? (
          <GameButton variant="secondary" size="lg" full onClick={() => setCreating(true)} leadingIcon="➕">
            Tambah Profil Anak
          </GameButton>
        ) : (
          <GameCard tone="cream" className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Nama</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama panggilan"
                className="mt-1 w-full rounded-2xl border-2 border-[color:var(--wood)]/40 bg-white px-4 py-3 text-base font-bold focus:outline-none focus:border-[color:var(--leaf-dark)]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Pilih Avatar</label>
              <div className="mt-1 grid grid-cols-6 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={cn(
                      "aspect-square rounded-2xl text-2xl grid place-items-center border-2 transition-all",
                      avatar === a
                        ? "bg-gradient-meadow border-leaf-dark scale-105 shadow-pop-sm"
                        : "bg-white border-[color:var(--wood)]/30",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Tingkat Kesulitan</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDiff(d.id)}
                    className={cn(
                      "rounded-2xl border-2 p-2 text-left transition-all",
                      diff === d.id
                        ? "bg-gradient-sun border-[color:var(--wood)] shadow-pop-sm"
                        : "bg-white border-[color:var(--wood)]/30",
                    )}
                  >
                    <div className="font-display font-bold text-sm">{d.emoji} {d.label}</div>
                    <div className="text-[11px] text-muted-foreground">{d.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              {profiles.length > 0 ? (
                <GameButton variant="ghost" size="md" full onClick={() => setCreating(false)}>
                  Batal
                </GameButton>
              ) : null}
              <GameButton variant="primary" size="md" full onClick={submit} disabled={!name.trim()}>
                Simpan
              </GameButton>
            </div>
          </GameCard>
        )}

        {activeId ? (
          <div className="pt-2">
            <GameButton variant="primary" size="xl" full onClick={onContinue} trailingIcon="→">
              Main!
            </GameButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
