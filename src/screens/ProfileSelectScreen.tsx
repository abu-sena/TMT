import { useState } from "react";
import type { DifficultyId, Profile, Gender } from "@/types";
import { AVATARS, DIFFICULTIES } from "@/data/constants";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { ProfileCard } from "../game/ProfileCard";
import { GameInput } from "../game/GameInput";
import { DifficultyCard } from "../game/DifficultyCard";
import { cn } from "@/lib/utils";
import { GameScreen } from "@/components/layout/GameScreen";
import { FixedBottomActionArea } from "@/components/layout/FixedBottomActionArea";

interface Props {
  profiles: Profile[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string, avatar: string, difficulty: DifficultyId, gender: Gender) => void;
  onUpdate: (id: string, name: string, avatar: string, difficulty: DifficultyId, gender: Gender) => void;
  onDelete: (id: string) => void;
  onContinue: (firstProfileCreated?: boolean) => void;
}

export function ProfileSelectScreen({ profiles, activeId, onSelect, onCreate, onUpdate, onDelete, onContinue }: Props) {
  const [creating, setCreating] = useState(profiles.length === 0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [gender, setGender] = useState<Gender>("unspecified");
  const [diff, setDiff] = useState<DifficultyId>("sd-bawah");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) return;
    const isFirstProfile = profiles.length === 0 && !editingProfileId;
    if (editingProfileId) {
      onUpdate(editingProfileId, name.trim(), avatar, diff, gender);
    } else {
      onCreate(name.trim(), avatar, diff, gender);
    }
    setName("");
    setCreating(false);
    setEditingProfileId(null);
    setAvatar(AVATARS[0]);
    setGender("unspecified");
    setDiff("sd-bawah");
    if (isFirstProfile) onContinue(true);
  };

  const startEdit = (profile: Profile) => {
    setName(profile.name);
    setAvatar(profile.avatar);
    setGender(profile.gender || "unspecified");
    setDiff(profile.difficulty);
    setEditingProfileId(profile.id);
    setCreating(true);
  };

  const cancelEdit = () => {
    setName("");
    setCreating(false);
    setEditingProfileId(null);
    setAvatar(AVATARS[0]);
    setGender("unspecified");
    setDiff("sd-bawah");
  };

  return (
    <GameScreen bgClass="bg-gradient-sky">
      {/* Scrollable main area */}
      <div className="flex-1 min-h-0 px-5 pt-12 pb-4 overflow-y-auto overscroll-contain">
        <header className="text-center mb-8">
          <div className="text-6xl animate-bob-sm">👨‍👩‍👧</div>
          <h1 className="font-display font-black text-4xl text-game-title mt-3 uppercase">
            {profiles.length === 0 ? "Buat Profil Petualang" : "Pilih Profil"}
          </h1>
          <p className="text-base text-[#5A3515]/80 font-bold mt-2">
            {profiles.length === 0
              ? "Pilih nama panggilan, avatar, dan tingkat tantanganmu. Jenis kelamin disetel ke Tidak ditentukan dan bisa diubah nanti."
              : "Banyak anak bisa main di satu perangkat."}
          </p>
        </header>

        <div className="content-wrapper space-y-4 max-w-lg mx-auto pb-4">
          {profiles.map((p) => (
            <div key={p.id} className="flex gap-2">
              <div className="flex-1 min-w-0">
                <ProfileCard
                  profile={p}
                  selected={p.id === activeId}
                  onClick={() => onSelect(p.id)}
                />
              </div>
              <button
                onClick={() => startEdit(p)}
                className="h-[72px] w-16 shrink-0 rounded-[18px] bg-gradient-sky text-white grid place-items-center shadow-candy-sm border-2 border-[#185E9F] active:translate-y-[4px] text-xl"
                aria-label="Edit profil"
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  if (confirm(`Hapus profil ${p.name}?`)) onDelete(p.id);
                }}
                className="h-[72px] w-16 shrink-0 rounded-[18px] bg-gradient-heart text-white grid place-items-center shadow-candy-sm border-2 border-[#A02020] active:translate-y-[4px] text-2xl"
                aria-label="Hapus profil"
              >
                🗑️
              </button>
            </div>
          ))}

          {!creating ? (
            <GameButton variant="secondary" size="lg" full onClick={() => { cancelEdit(); setCreating(true); }} leadingIcon="➕">
              Tambah Profil Anak
            </GameButton>
          ) : (
            <GameCard tone="cream" padded className="space-y-5 shadow-card">
              <h3 className="font-display font-black text-lg text-[#5A3515] text-center">
                {editingProfileId
                  ? "✏️ Edit Profil"
                  : profiles.length === 0
                    ? "🆕 Profil Petualang Baru"
                    : "🆕 Profil Baru"}
              </h3>
              <GameInput
                label="Nama panggilan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Aisha"
              />
              
              {editingProfileId ? <div>
                <span id="gender-label" className="text-xs font-bold uppercase text-[#8C6B45]">Jenis Kelamin</span>
                <div role="group" aria-labelledby="gender-label" className="mt-2 flex gap-2">
                  {[
                    { id: "male" as Gender, label: "👦 Laki-laki" },
                    { id: "female" as Gender, label: "👧 Perempuan" },
                    { id: "unspecified" as Gender, label: "🌈 Tidak ditentukan" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGender(g.id)}
                      className={cn(
                        "flex-1 py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all",
                        gender === g.id
                          ? "bg-gradient-meadow text-white border-[#2E8B12] shadow-candy-sm"
                          : "bg-[#FFF9E6] text-[#8C6B45] border-[#D4B483] hover:border-[#8C6B45]",
                      )}
                      aria-pressed={gender === g.id}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div> : null}
              
              <div>
                <span id="avatar-label" className="text-xs font-bold uppercase text-[#8C6B45]">Pilih Avatar</span>
                <div role="group" aria-labelledby="avatar-label" className="mt-2 flex flex-wrap gap-2 justify-start">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] text-2xl sm:text-3xl grid place-items-center border-[3px] transition-all",
                        avatar === a
                          ? "bg-gradient-meadow border-[#2E8B12] scale-110 shadow-candy-sm"
                          : "bg-[#FFF9E6] border-[#D4B483] hover:border-[#8C6B45]",
                      )}
                      aria-pressed={avatar === a}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <span id="difficulty-label" className="text-xs font-bold uppercase text-[#8C6B45]">Tingkat Kesulitan</span>
                <div role="group" aria-labelledby="difficulty-label" className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DIFFICULTIES.map((d) => (
                    <DifficultyCard
                      key={d.id}
                      difficulty={d}
                      selected={diff === d.id}
                      aria-pressed={diff === d.id}
                      onSelect={() => setDiff(d.id)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                {profiles.length > 0 ? (
                  <GameButton variant="wood" size="md" full onClick={cancelEdit}>
                    Batal
                  </GameButton>
                ) : null}
                <GameButton variant="primary" size="md" full onClick={submit} disabled={!name.trim()}>
                  {editingProfileId
                    ? "Simpan Perubahan"
                    : profiles.length === 0
                      ? "Simpan & Lihat Peta"
                      : "Simpan Profil"}
                </GameButton>
              </div>
            </GameCard>
          )}
        </div>
      </div>

      {/* Bottom "Main!" button — always visible */}
      {activeId && !creating ? (
        <FixedBottomActionArea>
          <GameButton variant="primary" size="xl" full onClick={() => onContinue()} trailingIcon="🚀" className="shadow-pop">
            MAIN SEKARANG!
          </GameButton>
        </FixedBottomActionArea>
      ) : null}
    </GameScreen>
  );
}
