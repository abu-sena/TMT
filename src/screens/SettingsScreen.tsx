import { useState } from "react";
import { ArrowLeft, ChevronRight, Download, House, RotateCcw, ShieldCheck, Trash2, UserRound, Wrench, type LucideIcon } from "lucide-react";
import type { Profile, ProfileSettings } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useCloudSync } from "@/hooks/useCloudSync";
import { ParentGate } from "@/components/safety/ParentGate";
import { ConfirmResetModal } from "@/components/safety/ConfirmResetModal";
import { resetTechnicalData } from "@/lib/technical-reset";

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
  onReload: () => void;
}

export function SettingsScreen({
  profile, onBack, onUpdate, onReset, onDeleteAll,
  onSwitchProfile, onExportProfile, onExportAll, onPrivacy, onReload,
}: Props) {
  const s = profile.settings;

  // Parent gate states
  const [gateOpen, setGateOpen] = useState(false);
  const [gateAction, setGateAction] = useState<"reset" | "delete" | "technical" | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [technicalResetModalOpen, setTechnicalResetModalOpen] = useState(false);
  const [technicalResetResult, setTechnicalResetResult] = useState<string | null>(null);
  const [technicalResetDone, setTechnicalResetDone] = useState(false);

  const openGate = (action: "reset" | "delete" | "technical") => {
    setGateAction(action);
    setGateOpen(true);
  };

  const onGatePass = () => {
    setGateOpen(false);
    if (gateAction === "reset") setResetModalOpen(true);
    if (gateAction === "delete") setDeleteModalOpen(true);
    if (gateAction === "technical") setTechnicalResetModalOpen(true);
    setGateAction(null);
  };

  const handleTechnicalReset = () => {
    const result = resetTechnicalData(profile.id);
    setTechnicalResetModalOpen(false);
    setTechnicalResetResult(result.message);
    setTechnicalResetDone(true);
  };

  const screenTimeOptions = [30, 45, 60, 90];

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button type="button"
          onClick={onBack}
          className="tmt-icon-button h-11 w-11"
          aria-label="Kembali"
        >
          <ArrowLeft aria-hidden="true" size={19} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">
            Pengaturan
          </h1>
          <p className="text-xs sm:text-sm text-[#5A3515]/80">
            Sesuaikan permainan
          </p>
        </div>

      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain content-wrapper space-y-3">
        {/* Audio */}
        <GameCard tone="cream" padded={false}>
          <Row
            label="Suara efek"
            value={s.sound}
            onToggle={(v) => onUpdate({ sound: v })}
            hint="Bunyi saat menjawab dan naik level"
          />
        </GameCard>

        {/* Screen Time */}
        <GameCard tone="cream" padded={false}>
          <Row
            label="Pengingat waktu bermain"
            hint={s.screenTimeReminder && s.screenTimeMinutes > 0 ? "Mengingatkan setiap " + s.screenTimeMinutes + " menit" : "Nonaktif"}
            value={s.screenTimeReminder}
            onToggle={value => onUpdate({ screenTimeReminder: value, screenTimeMinutes: value ? 45 : 0 })}
          />
          {s.screenTimeReminder && (
            <>
              <Divider />
              <div className="px-4 py-2">
                <div className="text-xs font-bold text-[#8C6B45] mb-1.5">
                  Durasi sebelum pengingat:
                </div>
                <div className="flex flex-wrap gap-2">
                  {screenTimeOptions.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onUpdate({ screenTimeMinutes: mins })}
                      aria-pressed={s.screenTimeMinutes === mins}
                      className="tmt-settings-choice flex-1"
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

        <section className="tmt-settings-section" aria-labelledby="settings-local-data">
          <h2 id="settings-local-data">Profil dan data</h2>
          <div className="tmt-settings-group">
            <SettingsAction icon={ShieldCheck} label="Privasi & keamanan data" onClick={onPrivacy} />
            <SettingsAction icon={UserRound} label="Ganti profil" onClick={onSwitchProfile} />
            <SettingsAction icon={Download} label="Ekspor profil" onClick={onExportProfile} />
            <SettingsAction icon={Download} label="Ekspor semua data" onClick={onExportAll} />
          </div>
        </section>

        <section className="tmt-settings-section" aria-labelledby="settings-maintenance">
          <h2 id="settings-maintenance">Perawatan aplikasi</h2>
          <div className="tmt-settings-group">
            <SettingsAction
              icon={Wrench}
              label="Reset data teknis"
              description="Bersihkan cache dan data teknis. Profil, progres, poin, dan laporan tetap tersimpan."
              onClick={() => openGate("technical")}
            />
          </div>
        </section>

        {/* Result after technical reset */}
        {technicalResetDone && technicalResetResult && (
          <div className="rounded-[28px] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-2 border-[#2E8B12] p-4 shadow-card text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="font-display font-black text-sm text-[#2E8B12] mb-2">
              Data Teknis Berhasil Direset
            </div>
            <p className="text-xs font-bold text-[#5A3515] whitespace-pre-line mb-3">
              {technicalResetResult}
            </p>
            <p className="text-[10px] text-[#8C6B45] mb-3">
              Capaian, poin, lencana, dan laporan tetap aman.
            </p>
            <div className="flex gap-2">
              <GameButton
                variant="primary"
                size="md"
                onClick={onReload}
              >
                🔄 Muat Ulang Aplikasi
              </GameButton>
              <GameButton
                variant="ghost"
                size="md"
                onClick={() => {
                  setTechnicalResetDone(false);
                  setTechnicalResetResult(null);
                }}
              >
                🏠 Kembali
              </GameButton>
            </div>
          </div>
        )}

        <section className="tmt-settings-section tmt-settings-risk" aria-labelledby="settings-risk-title">
          <h2 id="settings-risk-title">Reset dan hapus</h2>
          <div className="tmt-settings-group">
            <SettingsAction icon={RotateCcw} label="Reset progres" description="Reset perjalanan profil aktif." onClick={() => openGate("reset")} destructive />
            <SettingsAction icon={Trash2} label="Hapus semua data lokal" description="Hapus profil dan data game di perangkat ini." onClick={() => openGate("delete")} destructive />
          </div>
        </section>

        <div className="pt-2 text-center text-xs text-[#5A3515]/70">
          TMT · v1.0
        </div>
      </main>

      <footer className="tmt-settings-footer shrink-0 content-wrapper pb-safe pt-2">
        <GameButton variant="ghost" size="md" full leadingIcon={<House />} onClick={onBack}>
          Beranda
        </GameButton>
      </footer>

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

      {/* Technical Reset confirmation modal */}
      {technicalResetModalOpen && (
        <TechnicalResetConfirmModal
          onConfirm={handleTechnicalReset}
          onCancel={() => setTechnicalResetModalOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Technical Reset Confirmation Modal
 * Gentle warning — not a destructive action.
 */
function TechnicalResetConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="surface-panel tmt-dialog-surface rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border-4 border-[#D4B483] text-center">
        <div className="text-5xl mb-3">🛠️</div>
        <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">
          Reset Data Teknis?
        </h2>
        <p className="text-sm font-bold text-[#8C6B45] mb-1">
          Fitur ini akan menghapus cache, session sementara, dan data teknis
          yang bisa mengganggu setelah update aplikasi.
        </p>
        <p className="text-xs font-bold text-[#2E8B12] mb-4">
          ✅ Capaian misi, poin, lencana, profil, dan laporan{" "}
          <strong>tidak akan dihapus</strong>.
        </p>

        {/* Confirmation checkbox */}
        <label className="flex items-center gap-3 p-3 rounded-[18px] bg-[#FDF8F0] border border-[#E8DCC2] mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="h-5 w-5 accent-[#2E8B12]"
          />
          <span className="text-xs font-bold text-[#5A3515] text-left">
            Saya paham bahwa hanya data teknis yang dihapus.
          </span>
        </label>

        <div className="flex gap-3">
          <GameButton variant="ghost" size="md" onClick={onCancel} full>
            Batal
          </GameButton>
          <GameButton
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={!checked}
            full
          >
            Reset Data Teknis
          </GameButton>
        </div>
      </div>
    </div>
  );
}

function SettingsAction({ icon: Icon, label, description, onClick, destructive = false }: {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button type="button" className="tmt-settings-row" data-destructive={destructive || undefined} onClick={onClick}>
      <span className="tmt-settings-row-icon"><Icon size={19} aria-hidden="true" /></span>
      <span className="tmt-settings-row-copy">
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <ChevronRight className="tmt-settings-row-arrow" size={16} aria-hidden="true" />
    </button>
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
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onToggle(!value)}
      className="tmt-settings-row tmt-settings-toggle"
    >
      <div>
        <div className="font-bold">{label}</div>
        {hint ? (
          <div className="text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </div>
      <span aria-hidden="true"
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
          <button type="button" data-action="primary"
            onClick={connect}
            className="tmt-action-button px-4 py-2 min-h-[2.75rem] rounded-full bg-[#1a73e8] text-white text-xs font-bold shadow-sm active:translate-y-px"
          >
            Hubungkan
          </button>
        )}
        {user && status !== "syncing" && (
          <button type="button" data-action="danger-outline"
            onClick={disconnect}
            className="tmt-action-button px-4 py-2 min-h-[2.75rem] rounded-full bg-stone-200 text-stone-700 text-xs font-bold active:translate-y-px"
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
            <button type="button" data-action="primary"
              onClick={restore}
              className="tmt-action-button flex-1 py-1.5 rounded-xl bg-[#5A3515] text-white text-xs font-bold active:translate-y-px shadow-sm"
            >
              Gunakan Cloud
            </button>
            <button type="button" data-action="danger-outline"
              onClick={backup}
              className="tmt-action-button flex-1 py-1.5 rounded-xl bg-white text-[#5A3515] text-xs font-bold border-2 border-[#D4B483] active:translate-y-px"
            >
              Timpa Cloud
            </button>
          </div>
        </div>
      )}

      {user && status === "idle" && (
        <div className="mt-1 flex justify-end gap-2">
          <button type="button"
            onClick={restore}
            className="tmt-text-button text-xs font-bold text-[#185E9F] underline underline-offset-2"
          >
            Tarik Data
          </button>
          <button type="button"
            onClick={backup}
            className="tmt-text-button text-xs font-bold text-[#2E8B12] underline underline-offset-2"
          >
            Simpan Data
          </button>
        </div>
      )}
    </div>
  );
}
