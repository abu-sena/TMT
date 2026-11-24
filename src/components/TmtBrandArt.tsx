const artRoot = `${import.meta.env.BASE_URL}assets/field-guide/`;

export function TmtEmblem({ className, alt = "" }: { className?: string; alt?: string }) {
  return <img src={`${artRoot}tmt-mark.png`} className={className} alt={alt} width={720} height={720} />;
}

const slots = {
  daily: 0,
  minigame: 1,
  battle: 2,
  medal: 3,
  energy: 4,
  coin: 5,
  gem: 6,
  gift: 7,
} as const;

export type DashboardIconName = keyof typeof slots;

export function DashboardIcon({ name, className = "" }: { name: DashboardIconName; className?: string }) {
  const slot = slots[name];
  return (
    <span
      aria-hidden="true"
      className={`tmt-dashboard-icon ${className}`}
      style={{
        backgroundImage: `url("${artRoot}dashboard-icons.webp")`,
        backgroundPosition: `${(slot % 4) * 100 / 3}% ${Math.floor(slot / 4) * 100}%`,
      }}
    />
  );
}
