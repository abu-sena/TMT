import { ArrowLeft as TmtBackGlyph } from "lucide-react";
import { useState, useMemo } from "react";
import type { Profile, RewardMilestone, RewardStatus, ScreenId } from "@/types";
import { REWARD_ICONS } from "@/types";
import { useGameStore } from "@/lib/storage";
import { GameButton } from "../game/GameButton";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";

interface Props {
  profiles: Profile[];
  onBack: () => void;
}

const STATUS_LABELS: Record<RewardStatus, string> = {
  menunggu: "Menunggu",
  siap_diberikan: "Siap Diberikan",
  sudah_diberikan: "Sudah Diberikan",
  nonaktif: "Nonaktif",
};

const STATUS_COLORS: Record<RewardStatus, string> = {
  menunggu: "bg-[#FFF3CD] text-[#856404] border-[#FFC107]",
  siap_diberikan: "bg-[#D4EDDA] text-[#155724] border-[#28A745]",
  sudah_diberikan: "bg-[#CCE5FF] text-[#004085] border-[#007BFF]",
  nonaktif: "bg-[#E2E3E5] text-[#6C757D] border-[#ADB5BD]",
};

const REWARD_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#FF8C00", "#98D8C8",
  "#F7DC6F", "#BB8FCE",
];

function getStatus(reward: RewardMilestone): RewardStatus {
  if (!reward.isActive) return "nonaktif";
  if (reward.isClaimed) return "sudah_diberikan";
  if (reward.isUnlocked) return "siap_diberikan";
  return "menunggu";
}

export function RewardSetupScreen({ profiles, onBack }: Props) {
  const { store, addReward, updateReward, deleteReward } = useGameStore();
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    store.activeProfileId || profiles[0]?.id || ""
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClaim, setConfirmClaim] = useState<string | null>(null);

  // Form state
  const [formProfileId, setFormProfileId] = useState(selectedProfileId);
  const [formTargetLevel, setFormTargetLevel] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState<string>(REWARD_ICONS[0].emoji);
  const [formColor, setFormColor] = useState(REWARD_COLORS[0]);
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState("");

  const rewards = (store.rewardMilestones || []).filter(
    (r) => r.profileId === selectedProfileId
  );

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const resetForm = () => {
    setFormProfileId(selectedProfileId);
    setFormTargetLevel("");
    setFormTitle("");
    setFormDescription("");
    setFormIcon(REWARD_ICONS[0].emoji);
    setFormColor(REWARD_COLORS[0]);
    setFormActive(true);
    setFormError("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (reward: RewardMilestone) => {
    setEditingId(reward.id);
    setFormProfileId(reward.profileId);
    setFormTargetLevel(String(reward.targetLevel));
    setFormTitle(reward.rewardTitle);
    setFormDescription(reward.rewardDescription || "");
    setFormIcon(reward.rewardIcon);
    setFormColor(reward.rewardColor || REWARD_COLORS[0]);
    setFormActive(reward.isActive);
    setFormError("");
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const level = Number(formTargetLevel);
    if (!formTargetLevel || isNaN(level) || level < 1) {
      setFormError("Level target harus angka minimal 1.");
      return false;
    }
    if (!formTitle.trim()) {
      setFormError("Nama hadiah wajib diisi.");
      return false;
    }
    if (formTitle.trim().length > 40) {
      setFormError("Nama hadiah maksimal 40 karakter.");
      return false;
    }
    if (formDescription.length > 120) {
      setFormError("Deskripsi maksimal 120 karakter.");
      return false;
    }
    // Check for duplicate active reward at same level
    const profile = profiles.find((p) => p.id === formProfileId);
    if (profile && level <= profile.level && !editingId) {
      // Level already reached - show confirmation
      setFormError("");
      return true; // allow but warn
    }
    const duplicate = rewards.find(
      (r) => r.targetLevel === level && r.id !== editingId && r.isActive
    );
    if (duplicate) {
      setFormError("Sudah ada hadiah aktif di level ini.");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const level = Number(formTargetLevel);

    const rewardData: Partial<RewardMilestone> = {
      profileId: formProfileId,
      targetLevel: level,
      rewardTitle: formTitle.trim(),
      rewardDescription: formDescription.trim() || undefined,
      rewardIcon: formIcon,
      rewardColor: formColor,
      isActive: formActive,
    };

    if (editingId) {
      updateReward(editingId, rewardData);
    } else {
      const now = Date.now();
      addReward({
        id: crypto.randomUUID(),
        profileId: formProfileId,
        targetLevel: level,
        rewardTitle: formTitle.trim(),
        rewardDescription: formDescription.trim() || undefined,
        rewardIcon: formIcon,
        rewardColor: formColor,
        isActive: formActive,
        isUnlocked: false,
        isClaimed: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const handleClaim = (reward: RewardMilestone) => {
    updateReward(reward.id, { isClaimed: true, claimedAt: Date.now() });
    setConfirmClaim(null);
  };

  const handleToggleActive = (reward: RewardMilestone) => {
    updateReward(reward.id, { isActive: !reward.isActive });
  };

  const handleDelete = (id: string) => {
    deleteReward(id);
    setConfirmDelete(null);
  };

  const activeCount = rewards.filter((r) => r.isActive && !r.isClaimed).length;
  const nextReward = rewards
    .filter((r) => r.isActive && !r.isUnlocked)
    .sort((a, b) => a.targetLevel - b.targetLevel)[0];

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#FDF8F0] via-[#F7EDDC] to-[#E8DCC2] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-4 pt-safe mt-2 pb-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button type="button"
            onClick={onBack}
            className="tmt-icon-button h-12 w-12 rounded-[18px] bg-white border-2 border-[#D4B483] text-[#5A3515] grid place-items-center text-xl shadow-sm hover:bg-[#F5E6B3] active:translate-y-[2px] transition-all"
            aria-label="Kembali"
          >
            <TmtBackGlyph aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-black text-xl text-[#5A3515] leading-tight truncate">
              Pengaturan Hadiah
            </h1>
            <p className="text-xs font-bold text-[#8C6B45]">Hadiah dunia nyata untuk ananda</p>
          </div>
          <div className="text-3xl">🎁</div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 max-w-lg mx-auto space-y-4 pb-4">
        {/* Profile selector */}
        <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card">
          <label className="text-xs font-bold uppercase text-[#8C6B45] mb-1 block">
            Profil Anak
          </label>
          <div className="flex flex-wrap gap-2">
            {profiles.map((p) => (
              <button type="button"
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={`tmt-choice-button px-3 py-1.5 rounded-[18px] text-sm font-bold border-2 transition-all ${
                  p.id === selectedProfileId
                    ? "bg-gradient-meadow border-[#2E8B12] text-white shadow-sm"
                    : "bg-white border-[#CBB794] text-[#5A3515]"
                }`}
              >
                <AvatarPortrait avatar={p.avatar} className="w-7 h-7 rounded-full" /> {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {selectedProfile && (
          <div className="rounded-[28px] bg-gradient-to-br from-[#FFF9E6] to-[#F5E6B3] border-2 border-[#D4B483] p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs font-bold uppercase text-[#8C6B45]">Ringkasan Hadiah</div>
                <div className="font-display font-black text-sm text-[#5A3515]">
                  {activeCount} hadiah aktif
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-[#8C6B45]">Level Saat Ini</div>
                <div className="font-display font-black text-lg text-[#5A3515]">
                  {selectedProfile.level}
                </div>
              </div>
            </div>
            {nextReward && (
              <div className="text-xs font-bold text-[#5A3515]">
                🎯 Hadiah berikutnya:{" "}
                <span className="text-[#2E8B12]">
                  {nextReward.rewardIcon} {nextReward.rewardTitle} (Level {nextReward.targetLevel})
                </span>
              </div>
            )}
            <button type="button" data-action="primary"
              onClick={() => {
                resetForm();
                setFormProfileId(selectedProfileId);
                setShowForm(true);
              }}
              className="tmt-action-button mt-3 w-full py-2.5 rounded-[18px] bg-gradient-meadow border-2 border-[#2E8B12] text-white font-black text-sm shadow-candy-sm active:translate-y-[2px] transition-all"
            >
              ＋ Tambah Hadiah Baru
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card space-y-3">
            <h3 className="font-display font-black text-sm text-[#5A3515]">
              {editingId ? "✏️ Edit Hadiah" : "🎁 Tambah Hadiah Baru"}
            </h3>

            {/* Profile select in form */}
            <div>
              <label className="text-xs font-bold text-[#8C6B45] block mb-1">Profil Anak</label>
              <select
                value={formProfileId}
                onChange={(e) => setFormProfileId(e.target.value)}
                className="w-full rounded-[18px] border-2 border-[#CBB794] bg-white px-3 py-2 text-sm font-bold text-[#5A3515] outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Level */}
            <div>
              <label className="text-xs font-bold text-[#8C6B45] block mb-1">Target Level</label>
              <input
                type="number"
                min="1"
                value={formTargetLevel}
                onChange={(e) => { setFormTargetLevel(e.target.value); setFormError(""); }}
                placeholder="Contoh: 10"
                className="w-full rounded-[18px] border-2 border-[#CBB794] bg-white px-3 py-2 text-sm font-bold text-[#5A3515] outline-none focus:border-[#2E8B12]"
              />
            </div>

            {/* Reward Title */}
            <div>
              <label className="text-xs font-bold text-[#8C6B45] block mb-1">Nama Hadiah *</label>
              <input
                type="text"
                maxLength={40}
                value={formTitle}
                onChange={(e) => { setFormTitle(e.target.value); setFormError(""); }}
                placeholder="Contoh: Es Krim"
                className="w-full rounded-[18px] border-2 border-[#CBB794] bg-white px-3 py-2 text-sm font-bold text-[#5A3515] outline-none focus:border-[#2E8B12]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-[#8C6B45] block mb-1">Deskripsi (opsional)</label>
              <input
                type="text"
                maxLength={120}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Deskripsi singkat hadiah..."
                className="w-full rounded-[18px] border-2 border-[#CBB794] bg-white px-3 py-2 text-sm font-bold text-[#5A3515] outline-none focus:border-[#2E8B12]"
              />
            </div>

            {/* Icon picker */}
            <div>
              <label className="text-xs font-bold text-[#8C6B45] block mb-1">Icon Hadiah</label>
              <div className="flex flex-wrap gap-2">
                {REWARD_ICONS.map((icon) => (
                  <button type="button"
                    key={icon.emoji}
                    onClick={() => setFormIcon(icon.emoji)}
                    className={`tmt-choice-button h-10 w-10 rounded-[18px] border-2 grid place-items-center text-xl transition-all ${
                      formIcon === icon.emoji
                        ? "border-[#2E8B12] bg-[#2E8B12]/10 shadow-sm scale-110"
                        : "border-[#CBB794] bg-white"
                    }`}
                    title={icon.label}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="text-xs font-bold text-[#8C6B45] block mb-1">Warna Tema</label>
              <div className="flex flex-wrap gap-2">
                {REWARD_COLORS.map((color) => (
                  <button type="button"
                    key={color}
                    onClick={() => setFormColor(color)}
                    className="tmt-choice-button h-8 w-8 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: formColor === color ? "#5A3515" : "transparent",
                      transform: formColor === color ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8C6B45]">Hadiah Aktif</span>
              <button type="button"
                onClick={() => setFormActive(!formActive)}
                className={`tmt-choice-button relative inline-flex h-7 w-12 rounded-full border-2 transition-colors ${
                  formActive ? "bg-gradient-meadow border-[#2E8B12]" : "bg-stone-300 border-stone-400"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    formActive ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Error */}
            {formError && (
              <div className="text-xs font-bold text-[#A02020] bg-[#A02020]/10 px-3 py-2 rounded-[18px]">
                ⚠️ {formError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <GameButton variant="ghost" size="md" full onClick={resetForm}>
                Batal
              </GameButton>
              <GameButton variant="primary" size="md" full onClick={handleSubmit}>
                {editingId ? "Simpan" : "Tambah"}
              </GameButton>
            </div>
          </div>
        )}

        {/* Rewards List */}
        <div>
          <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-2">
            📋 Daftar Hadiah — {selectedProfile?.name}
          </h3>
          {rewards.length === 0 ? (
            <div className="rounded-[28px] bg-white border-2 border-dashed border-[#CBB794] p-6 text-center">
              <div className="text-4xl mb-2">🎁</div>
              <p className="text-sm font-bold text-[#8C6B45]">
                Belum ada hadiah untuk profil ini.
              </p>
              <p className="text-xs text-[#8C6B45]/60 mt-1">
                Tambah hadiah dunia nyata yang bisa dibuka anak saat mencapai level tertentu.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rewards
                .sort((a, b) => a.targetLevel - b.targetLevel)
                .map((reward) => {
                  const status = getStatus(reward);
                  const profile = profiles.find((p) => p.id === reward.profileId);
                  return (
                    <div
                      key={reward.id}
                      className="rounded-[28px] bg-white border-2 border-[#D4B483] p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 rounded-[18px] grid place-items-center text-2xl shrink-0 border-2 border-[#D4B483]"
                          style={{ backgroundColor: reward.rewardColor || "#FFF" }}
                        >
                          {reward.rewardIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-black text-sm text-[#5A3515] truncate">
                            {reward.rewardTitle}
                          </div>
                          <div className="text-xs font-bold text-[#8C6B45]">
                            Level {reward.targetLevel}
                            {profile && (
                              <span className="ml-1">
                                · {profile.name}
                              </span>
                            )}
                          </div>
                          {reward.rewardDescription && (
                            <div className="text-[10px] text-[#8C6B45]/70 mt-0.5 truncate">
                              {reward.rewardDescription}
                            </div>
                          )}
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[status]}`}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {!reward.isClaimed && reward.isUnlocked && (
                          <button type="button" data-action="primary"
                            onClick={() => setConfirmClaim(reward.id)}
                            className="tmt-action-button px-2 py-1 rounded-[14px] bg-gradient-meadow border border-[#2E8B12] text-white text-[10px] font-bold active:translate-y-px transition-all"
                          >
                            ✅ Sudah Diberikan
                          </button>
                        )}
                        <button type="button" data-action="secondary"
                          onClick={() => handleEdit(reward)}
                          className="tmt-action-button px-2 py-1 rounded-[14px] bg-white border border-[#CBB794] text-[#5A3515] text-[10px] font-bold active:translate-y-px transition-all"
                        >
                          ✏️ Edit
                        </button>
                        <button type="button"
                          onClick={() => handleToggleActive(reward)}
                          className={`tmt-choice-button px-2 py-1 rounded-[14px] border text-[10px] font-bold active:translate-y-px transition-all ${
                            reward.isActive
                              ? "bg-[#FFF3CD] border-[#FFC107] text-[#856404]"
                              : "bg-[#D4EDDA] border-[#28A745] text-[#155724]"
                          }`}
                        >
                          {reward.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        <button type="button" data-action="danger-outline"
                          onClick={() => setConfirmDelete(reward.id)}
                          className="tmt-action-button px-2 py-1 rounded-[14px] bg-[#FCE4EC] border border-[#A02020]/30 text-[#A02020] text-[10px] font-bold active:translate-y-px transition-all"
                        >
                          🗑️ Hapus
                        </button>
                      </div>

                      {/* Claim confirmation */}
                      {confirmClaim === reward.id && (
                        <div className="mt-2 p-2 rounded-[18px] bg-[#D4EDDA] border border-[#28A745] text-xs font-bold text-[#155724] flex items-center gap-2">
                          <span>Tandai sudah diberikan?</span>
                          <button type="button"
                            onClick={() => handleClaim(reward)}
                            className="tmt-choice-button px-2 py-0.5 rounded-[14px] bg-[#28A745] text-white text-[10px]"
                          >
                            Ya
                          </button>
                          <button type="button" data-action="neutral"
                            onClick={() => setConfirmClaim(null)}
                            className="tmt-action-button px-2 py-0.5 rounded-[14px] bg-white border border-[#155724] text-[#155724] text-[10px]"
                          >
                            Batal
                          </button>
                        </div>
                      )}

                      {/* Delete confirmation */}
                      {confirmDelete === reward.id && (
                        <div className="mt-2 p-2 rounded-[18px] bg-[#FCE4EC] border border-[#A02020] text-xs font-bold text-[#A02020] flex items-center gap-2">
                          <span>Hapus hadiah ini?</span>
                          <button type="button" data-action="danger-outline"
                            onClick={() => handleDelete(reward.id)}
                            className="tmt-action-button px-2 py-0.5 rounded-[14px] bg-[#A02020] text-white text-[10px]"
                          >
                            Hapus
                          </button>
                          <button type="button" data-action="neutral"
                            onClick={() => setConfirmDelete(null)}
                            className="tmt-action-button px-2 py-0.5 rounded-[14px] bg-white border border-[#A02020] text-[#A02020] text-[10px]"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      <div className="shrink-0 px-4 pb-safe pt-2">
        <div className="max-w-lg mx-auto">
          <GameButton variant="ghost" size="md" full onClick={onBack}>
            🏠 Kembali ke Dashboard
          </GameButton>
        </div>
      </div>
    </div>
  );
}
