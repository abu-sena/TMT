import { ArrowRight, BookOpen, Compass, Gamepad2, House, Settings, ShieldCheck, Star } from "lucide-react";
import type { Profile, ScreenId } from "@/types";
import { DIFFICULTY_MAP, DIFFICULTY_UI_LABELS } from "@/data/constants";
import { xpProgress } from "@/lib/leveling";
import { hasAnyPendingFinalRewards } from "@/lib/progress";
import { useGameStore } from "@/lib/storage";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";
import { DashboardIcon, TmtEmblem } from "@/components/TmtBrandArt";

interface Props {
  profile: Profile;
  onNavigate: (screen: ScreenId) => void;
  onSwitchProfile: () => void;
  onOpenPendingBox?: () => void;
  onHomeUpgrade?: () => void;
}

const shortcuts = [
  { screen: "daily-missions", label: "Misi Harian", description: "Kebaikan sehari-hari", icon: "daily", tone: "honey" },
  { screen: "minigame-center", label: "Mini-Game", description: "Asah nalar sambil bermain", icon: "minigame", tone: "lilac" },
  { screen: "battle", label: "Battle", description: "Tantangan bersama", icon: "battle", tone: "peach" },
  { screen: "badges", label: "Koleksi Lencana", description: "Lihat pencapaianmu", icon: "medal", tone: "mint" },
] as const;

const resources = [
  { key: "hearts", icon: "energy", label: "Energi", tone: "peach" },
  { key: "coins", icon: "coin", label: "Koin", tone: "honey" },
  { key: "points", icon: "gem", label: "Permata", tone: "mint" },
] as const;

export function HomeScreen({ profile, onNavigate, onSwitchProfile, onOpenPendingBox, onHomeUpgrade }: Props) {
  const { store } = useGameStore();
  const xp = xpProgress(profile);
  const difficulty = DIFFICULTY_MAP[profile.difficulty];
  const rewardBox = hasAnyPendingFinalRewards(profile);
  const upgrade = profile.difficultyUpgradeAvailable ? profile.pendingDifficultyUpgrade : null;
  const rewards = (store.rewardMilestones ?? []).filter(reward => reward.profileId === profile.id && reward.isActive && !reward.isClaimed);
  const ready = rewards.filter(reward => reward.isUnlocked).length;
  const nextReward = rewards.filter(reward => !reward.isUnlocked).sort((a, b) => a.targetLevel - b.targetLevel)[0];
  const firstMission = profile.totalMissionsCompleted === 0;

  return (
    <div className="field-shell field-home">
      <main className="field-scroll">
        <div className="field-wrap field-home-content">
          <header className="field-home-header">
            <div className="field-brand">
              <TmtEmblem className="field-brand-emblem" />
              <div><strong>TMT</strong><small>The Mastermind Trials</small></div>
            </div>
            <button type="button" className="field-avatar-button" aria-label="Ganti profil" onClick={onSwitchProfile}>
              <AvatarPortrait avatar={profile.avatar} className="size-11 rounded-full" />
            </button>
          </header>
          <section className="field-landscape field-home-hero" aria-labelledby="home-greeting">
            <div className="field-hero-copy">
              <p className="field-kicker">Petualangan ilmu &amp; akhlak</p>
              <h1 id="home-greeting">Halo, {profile.name}!</h1>
              <p>{firstMission ? "Langkah pertamamu menuju Kota Ilmu dimulai di sini." : "Ada hal baru untuk ditemukan di Kota Ilmu."}</p>
              <button type="button" className="field-button" onClick={() => onNavigate("map")}>
                {firstMission ? "Mulai misi pertama" : "Lanjutkan misi"} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </section>
          <section className="field-progress" aria-label="Progres petualang">
            <div className="field-level">
              <div><strong>Level {profile.level}</strong><span>{difficulty.shortLabel}</span></div>
              <progress max={100} value={xp.percent} aria-label={"Pengalaman level, " + xp.current + " dari " + xp.needed + " XP"} />
            </div>
            <dl className="field-resources">
              {resources.map(({ key, icon, label, tone }) => (
                <div key={key} data-tone={tone}>
                  <DashboardIcon name={icon} />
                  <dt>{label}</dt>
                  <dd>{profile[key]}</dd>
                </div>
              ))}
            </dl>
          </section>
          {rewardBox && onOpenPendingBox && <button type="button" className="field-notice" onClick={onOpenPendingBox}><DashboardIcon name="gift" /><span>Hadiah akhir level siap dibuka</span><ArrowRight size={17} /></button>}
          {!rewardBox && upgrade && onHomeUpgrade && <button type="button" className="field-notice" onClick={onHomeUpgrade}><Star size={21} /> <span>Level {DIFFICULTY_UI_LABELS[upgrade]} terbuka</span><ArrowRight size={17} /></button>}
          <section aria-labelledby="quick-access">
            <h2 className="field-section-title" id="quick-access">Akses cepat</h2>
            <div className="field-shortcuts">
              {shortcuts.map(({ screen, label, description, icon, tone }) => (
                <button type="button" key={screen} data-tone={tone} onClick={() => onNavigate(screen)}>
                  <DashboardIcon name={icon} />
                  <span><strong>{label}</strong><small>{description}</small></span>
                  <ArrowRight className="field-shortcut-arrow" size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
          {(ready > 0 || nextReward) && (
            <button type="button" className="field-notice" onClick={() => onNavigate("my-rewards")}>
              <DashboardIcon name="gift" /><span>{ready > 0 ? ready + " hadiah siap diklaim" : nextReward?.rewardTitle + " · Level " + nextReward?.targetLevel}</span><ArrowRight size={17} />
            </button>
          )}
          <div className="field-utility">
            <button type="button" onClick={() => onNavigate("parent")}><ShieldCheck size={17} /> Orang tua</button>
            <button type="button" onClick={() => onNavigate("settings")}><Settings size={17} /> Pengaturan</button>
          </div>
        </div>
      </main>
      <nav className="field-nav" aria-label="Navigasi utama">
        <span aria-current="page"><House size={21} />Beranda</span>
        <button type="button" onClick={() => onNavigate("map")}><Compass size={21} />Peta</button>
        <button type="button" onClick={() => onNavigate("minigame-center")}><Gamepad2 size={21} />Bermain</button>
        <button type="button" onClick={() => onNavigate("stats")}><BookOpen size={21} />Progres</button>
      </nav>
    </div>
  );
}
