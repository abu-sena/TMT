import { useState } from "react";
import { Check } from "lucide-react";
import type { DifficultyId, Profile, Gender } from "@/types";
import { AVATARS, DIFFICULTIES } from "@/data/constants";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { ProfileCard } from "../game/ProfileCard";
import { GameInput } from "../game/GameInput";
import { DifficultyCard } from "../game/DifficultyCard";
import { cn } from "@/lib/utils";
import { GameScreen } from "@/components/layout/GameScreen";
import { FixedBottomActionArea } from "@/components/layout/FixedBottomActionArea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [avatar, setAvatar] = useState<string>(AVATARS[0].id);
  const [gender, setGender] = useState<Gender>("unspecified");
  const [diff, setDiff] = useState<DifficultyId>("sd-bawah");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

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
    setAvatar(AVATARS[0].id);
    setGender("unspecified");
    setDiff("sd-bawah");
    if (isFirstProfile) onContinue(true);
  };

  const startEdit = (profile: Profile) => {
    setName(profile.name);
    setAvatar(profile.avatar || AVATARS[0].id);
    setGender(profile.gender || "unspecified");
    setDiff(profile.difficulty);
    setEditingProfileId(profile.id);
    setCreating(true);
  };

  const cancelEdit = () => {
    setName("");
    setCreating(false);
    setEditingProfileId(null);
    setAvatar(AVATARS[0].id);
    setGender("unspecified");
    setDiff("sd-bawah");
  };

  return (
    <GameScreen bgClass="bg-gradient-sky">
      {/* Scrollable main area */}
      <div className="flex-1 min-h-0 px-5 pt-12 pb-4 overflow-y-auto overscroll-contain">
        <header className="field-profile-heading">
          <h1>
            {profiles.length === 0 ? "Buat profil petualang" : "Siapa yang akan bermain?"}
          </h1>
          <p>
            {profiles.length === 0
              ? "Pilih karakter, nama panggilan, dan tingkat tantanganmu."
              : "Pilih profil untuk melanjutkan perjalananmu."}
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
              <button type="button"
                onClick={() => startEdit(p)}
                className="tmt-choice-button h-[72px] w-16 shrink-0 rounded-[18px] bg-gradient-sky text-white grid place-items-center shadow-candy-sm border-2 border-[#185E9F] active:translate-y-[4px] text-xl"
                aria-label="Edit profil"
              >
                ✏️
              </button>
              <button type="button"
                onClick={() => setProfileToDelete(p)}
                className="tmt-choice-button h-[72px] w-16 shrink-0 rounded-[18px] bg-gradient-heart text-white grid place-items-center shadow-candy-sm border-2 border-[#A02020] active:translate-y-[4px] text-2xl"
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
              {editingProfileId ? <div>
                <span id="gender-label" className="text-xs font-bold uppercase text-[#8C6B45]">Jenis Kelamin</span>
                <div role="group" aria-labelledby="gender-label" className="mt-2 flex gap-2">
                  {[
                    { id: "male" as Gender, label: "👦 Laki-laki" },
                    { id: "female" as Gender, label: "👧 Perempuan" },
                    { id: "unspecified" as Gender, label: "🌈 Tidak ditentukan" },
                  ].map((g) => (
                    <button type="button"
                      key={g.id}
                      onClick={() => setGender(g.id)}
                      className={cn("tmt-choice-button",
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
                <span id="avatar-label" className="text-sm font-bold text-[#254746]">Pilih avatarmu</span>
                <div role="group" aria-labelledby="avatar-label" className="field-avatar-grid mt-2">
                  {AVATARS.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setAvatar(id)}
                      className="field-avatar-option"
                      aria-label={label}
                      aria-pressed={avatar === id}
                      type="button"
                    >
                      <AvatarPortrait avatar={id} className="size-full rounded-xl" />
                      {avatar === id && <Check className="field-avatar-check" size={20} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </div>
              <GameInput
                label="Nama panggilan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Aisha"
              />
              
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
      <AlertDialog open={profileToDelete !== null} onOpenChange={open => { if (!open) setProfileToDelete(null); }}>
        <AlertDialogContent className="w-[calc(100%_-_2rem)] max-w-sm rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus profil {profileToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Progres yang tersimpan pada profil ini ikut terhapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild><GameButton variant="secondary" size="md">Batal</GameButton></AlertDialogCancel>
            <AlertDialogAction asChild>
              <GameButton variant="danger" size="md" onClick={() => { if (profileToDelete) onDelete(profileToDelete.id); }}>
                Hapus profil
              </GameButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GameScreen>
  );
}
