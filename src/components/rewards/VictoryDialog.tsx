import * as Dialog from "@radix-ui/react-dialog";
import { useRef, type ReactNode } from "react";
import { GameButton } from "@/components/ui/GameButton";

const artPath = `${import.meta.env.BASE_URL}assets/field-guide/`;

type Reward = { label: string; value: string; icon: "points" | "xp" };

function VictoryToken({ slot, className }: { slot: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`tmt-victory-token ${className ?? ""}`}
      style={{
        backgroundImage: `url("${artPath}victory-tokens.webp")`,
        backgroundPosition: `${(slot % 2) * 100}% ${Math.floor(slot / 2) * 100}%`,
      }}
    />
  );
}

export function VictoryDialog({ title, context, stars, rewards, children, onClose, onPrimary, primaryLabel, onSecondary, secondaryLabel }: {
  title: string;
  context: string;
  stars: number;
  rewards: Reward[];
  children?: ReactNode;
  onClose: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  onSecondary?: () => void;
  secondaryLabel?: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="tmt-victory-overlay" />
        <Dialog.Content
          className="tmt-victory-dialog"
          onPointerDownOutside={event => event.preventDefault()}
          onOpenAutoFocus={event => {
            event.preventDefault();
            titleRef.current?.focus({ preventScroll: true });
          }}
        >
          <div className="tmt-victory-crest">
            <img src={`${artPath}victory-crest.webp`} alt="" />
            <Dialog.Title ref={titleRef} tabIndex={-1} data-focus-reset>{title}</Dialog.Title>
          </div>
          <div className="tmt-victory-panel">
            <Dialog.Description>{context}</Dialog.Description>
            <div className="tmt-victory-stars" role="img" aria-label={`${stars} dari 3 bintang`}>
              {[1, 2, 3].map(star => <VictoryToken key={star} slot={star <= stars ? 0 : 1} />)}
            </div>
            <dl className="tmt-victory-rewards">
              {rewards.map(reward => (
                <div key={reward.label}>
                  <VictoryToken slot={reward.icon === "points" ? 2 : 3} />
                  <dt>{reward.label}</dt>
                  <dd>{reward.value}</dd>
                </div>
              ))}
            </dl>
            {children}
            <div className="tmt-victory-actions" data-two-actions={onSecondary ? "" : undefined}>
              {onSecondary && <GameButton variant="secondary" size="md" onClick={onSecondary}>{secondaryLabel}</GameButton>}
              <GameButton size="md" onClick={onPrimary}>{primaryLabel}</GameButton>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
