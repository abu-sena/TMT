import { useState } from "react";
import type { Profile, ProfileSettings } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useCloudSync } from "@/hooks/useCloudSync";
import { ParentGate } from "@/components/safety/ParentGate";
import { ConfirmResetModal } from "@/components/safety/ConfirmResetModal";

interface Props {
  profile: Profile;
  onBack: () => void;
  onUpdate: (s: Partial<ProfileSettings>) => void;
  onReset: () => void;
  onDeleteAll: () => void;
  onSwitchProfile: () => void;
  onExportProfile: () => void;
  onExportAll: () => void;
  onPrivacy: () => void;
}

export function SettingsScreen({
  profile, onBack, onUpdate, onReset, onDeleteAll,
  onSwitchProfile, onExportProfile, onExportAll, onPrivacy,
}: Props) {
  const s = profile.settings;

  // Parent gate states
  const [gateOpen, setGateOpen] = useState(false);
  const [gateAction, setGateAction] = useState<"reset" | "delete" | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const openGate = (action: "reset" | "delete") => {
    setGateAction(action);
    setGateOpen(true);
  };

  const onGatePass = () => {
    setGateOpen(false);
    if (gateAction === "reset") setResetModalOpen(true);
    if (gateAction === "delete") setDeleteModalOpen(true);
    setGateAction(null);
  };

  const screenTimeOptions = [0, 30, 45, 60, 90];

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-12 w-12 rounded-[18px] bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95 transition-transform"
          aria-label="Kembali"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">
            Pengaturan
          </h1>
          <p className="text-xs sm:text-sm text-[#5A3515]/80">
            Sesuaikan permainan
          </p>
        </div>
        <div className="text-2xl sm:text-3xl shrink-0">⚙️</div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain content-wrapper space-y-3">
        {/* Audio */}
        <GameCard tone="cream" padded={false}>
          <Row
            label="🔊 Suara Efek"
            value={s.sound}
            onToggle={(v) => onUpdate({ sound: v })}
            hint="Bunyi saat menjawab dan naik level"
          />
          <Divider />
          <Row
            label="🎵 Musik Latar"
            value={s.music}
            onToggle={(v) => onUpdate({ music: v })}
            hint="Musik ceria selama bermain"
          />
        </GameCard>

        {/* Screen Time */}
        <GameCard tone="cream" padded={false}>
          <div className="flex items-center justify-between px-4 py-3 text-left">
            <div className="flex-1 min-w-0">
              <div className="font-bold">⏰ Pengingat Waktu Bermain</div>
              <div className="text-xs text-muted-foreground">
                {s.screenTimeReminder && s.screenTimeMinutes > 0
                  ? `Mengingatkan setiap ${s.screenTimeMinutes} menit`
                  : "Nonaktif"}
              </div>
            </div>
            <span
              onClick={() =>
                onUpdate({
                  screenTimeReminder: !s.screenTimeReminder,
                  screenTimeMinutes: !s.screenTimeReminder ? 45 : 0,
                })
              }
              className={`relative inline-flex h-7 w-12 rounded-full border-2 transition-colors cursor-pointer ${
                s.screenTimeReminder
                  ? "bg-gradient-meadow border-leaf-dark"
                  : "bg-stone-300 border-stone-400"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  s.screenTimeReminder ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
          </div>
          {s.screenTimeReminder && (
            <>
              <Divider />
              <div className="px-4 py-2">
                <div className="text-xs font-bold text-[#8C6B45] mb-1.5">
                  Durasi sebelum pengingat:
                </div>
                <div className="flex flex-wrap gap-2">
                  {screenTimeOptions.filter(Boolean).map((mins) => (
                    <button
                      key={mins}
                      onClick={() => onUpdate({ screenTimeMinutes: mins })}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        s.screenTimeMinutes === mins
                          ? "bg-gradient-meadow border-[#2E8B12] text-white shadow-sm"
                          : "bg-white border-[#CBB794] text-[#5A3515] hover:border-[#8C6B45]"
                      }`}
                    >
                      {mins} mnt
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </GameCard>

        {/* Cloud sync */}
        <GameCard tone="cream" padded={false}>
          <GoogleConnectCard />
        </GameCard>

        {/* Info */}
        <GameCard tone="cream" padded={false}>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-bold">🌐 Bahasa</div>
              <div className="text-xs text-muted-foreground">Indonesia</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-gradient-meadow text-primary-foreground text-xs font-bold">
              ID
            </span>
          </div>
          <Divider />
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-bold">📶 Mode Offline</div>
              <div className="text-xs text-muted-foreground">
                Semua misi tersimpan lokal
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-gradient-coin text-[#5A3515] text-xs font-bold">
              Aktif
            </span>
          </div>
        </GameCard>

        {/* Privacy */}
        <GameButton
          variant="secondary"
          size="md"
          full
          leadingIcon="🔒"
          onClick={onPrivacy}
        >
          Privasi & Keamanan Data
        </GameButton>

        {/* Switch profile */}
        <GameButton
          variant="secondary"
          size="md"
          full
          leadingIcon="👤"
          onClick={onSwitchProfile}
        >
          Ganti Profil
        </GameButton>

        {/* Export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <GameButton
            variant="secondary"
            size="md"
            full
            leadingIcon="📋"
            onClick={onExportProfile}
          >
            Ekspor Profil
          </GameButton>
          <GameButton
            variant="secondary"
            size="md"
            full
            leadingIcon="💾"
            onClick={onExportAll}
          >
            Ekspor Semua
          </GameButton>
        </div>

        {/* Destructive actions — gated */}
        <GameButton
          variant="danger"
          size="md"
          full
          leadingIcon="🗑️"
          onClick={() => openGate("reset")}
        >
          Reset Progres
        </GameButton>

        <GameButton
          variant="ghost"
          size="sm"
          full
          onClick={() => openGate("delete")}
        >
          Hapus Semua Data Lokal
        </GameButton>

        <div className="pt-2 text-center text-xs text-[#5A3515]/70">
          TMT · v1.0
        </div>
      </main>

      <div className="shrink-0 content-wrapper pb-safe pt-2">
        <GameButton variant="ghost" size="md" full onClick={onBack}>
          🏠 Beranda
        </GameButton>
      </div>

      {/* Parent gate */}
      <ParentGate
        open={gateOpen}
        title="Konfirmasi Orang Tua"
        onPass={onGatePass}
        onCancel={() => {
          setGateOpen(false);
          setGateAction(null);
        }}
      />

      {/* Reset confirmation */}
      <ConfirmResetModal
        open={resetModalOpen}
        profileName={profile.name}
        mode="reset-profile"
        onConfirm={() => {
          setResetModalOpen(false);
          onReset();
        }}
        onCancel={() => setResetModalOpen(false)}
      />

      {/* Delete all confirmation */}
      <ConfirmResetModal
        open={deleteModalOpen}
        profileName=""
        mode="delete-all"
        onConfirm={() => {
          setDeleteModalOpen(false);
          onDeleteAll();
        }}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

function Row({
  label, value, onToggle, hint,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      onClick={() => onToggle(!value)}
      className="w-full flex items-center justify-between px-4 py-3 text-left"
    >
      <div>
        <div className="font-bold">{label}</div>
        {hint ? (
          <div className="text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </div>
      <span
        className={`relative inline-flex h-7 w-12 rounded-full border-2 transition-colors ${
          value
            ? "bg-gradient-meadow border-leaf-dark"
            : "bg-stone-300 border-stone-400"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-[#8C6B45]/20 mx-3" />;
}

function GoogleConnectCard() {
  const { user, status, cloudMeta, errorMsg, connect, disconnect, backup, restore } =
    useCloudSync();

  return (
    <div className="px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold flex items-center gap-1">
            ☁️ Sinkron Google
          </div>
          <div className="text-xs text-muted-foreground">
            Opsional — cadangkan progres
          </div>
        </div>
        {!user && status !== "syncing" && (
          <button
            onClick={connect}
            className="px-4 py-2 min-h-[2.75rem] rounded-full bg-[#1a73e8] text-white text-xs font-bold shadow-sm active:translate-y-px"
          >
            Hubungkan
          </button>
        )}
        {user && status !== "syncing" && (
          <button
            onClick={disconnect}
            className="px-4 py-2 min-h-[2.75rem] rounded-full bg-stone-200 text-stone-700 text-xs font-bold active:translate-y-px"
          >
            Putuskan
          </button>
        )}
        {status === "syncing" && (
          <span className="text-xs font-bold text-[#8C6B45] animate-pulse">
            Memuat...
          </span>
        )}
      </div>

      {user && (
        <div className="mt-2 p-3 rounded-[18px] bg-black/5 border border-black/5 flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full bg-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-stone-300 grid place-items-center text-xl">
              👤
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <div className="font-bold text-sm truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-2 text-xs font-bold text-[#A02020] bg-[#A02020]/10 px-3 py-2 rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {status === "success" && (
        <div className="mt-2 text-xs font-bold text-[#2E8B12] bg-[#2E8B12]/10 px-3 py-2 rounded-xl">
          ✅ Tersinkronisasi dengan Awan.
        </div>
      )}

      {status === "conflict" && cloudMeta && (
        <div className="mt-2 p-3 rounded-[18px] bg-gradient-sun border-2 border-[#D48806]">
          <div className="font-black text-sm text-[#5A3515] mb-1">
            Ditemukan Data Tersimpan!
          </div>
          <div className="text-xs text-[#8C6B45] mb-3">
            Terdapat progres dari perangkat{" "}
            <strong>{cloudMeta.deviceName}</strong> dengan total{" "}
            <strong>{cloudMeta.totalMissionsCompleted} misi</strong> selesai.
          </div>
          <div className="flex gap-2">
            <button
              onClick={restore}
              className="flex-1 py-1.5 rounded-xl bg-[#5A3515] text-white text-xs font-bold active:translate-y-px shadow-sm"
            >
              Gunakan Cloud
            </button>
            <button
              onClick={backup}
              className="flex-1 py-1.5 rounded-xl bg-white text-[#5A3515] text-xs font-bold border-2 border-[#D4B483] active:translate-y-px"
            >
              Timpa Cloud
            </button>
          </div>
        </div>
      )}

      {user && status === "idle" && (
        <div className="mt-1 flex justify-end gap-2">
          <button
            onClick={restore}
            className="text-xs font-bold text-[#185E9F] underline underline-offset-2"
          >
            Tarik Data
          </button>
          <button
            onClick={backup}
            className="text-xs font-bold text-[#2E8B12] underline underline-offset-2"
          >
            Simpan Data
          </button>
        </div>
      )}
    </div>
  );
}
