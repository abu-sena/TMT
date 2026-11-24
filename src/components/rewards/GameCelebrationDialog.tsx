import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { GameButton } from "@/components/ui/GameButton";

const celebrationSprites = { victory: [0, 0], level: [1, 0], medal: [0, 1], break: [1, 1] } as const;
type CelebrationKind = keyof typeof celebrationSprites;

export function CelebrationArt({ kind }: { kind: CelebrationKind }) {
  const [column, row] = celebrationSprites[kind];
  return (
    <span
      className="tmt-celebration-art"
      aria-hidden="true"
      style={{
        backgroundImage: `url("${import.meta.env.BASE_URL}assets/field-guide/celebration-icons.webp")`,
        backgroundPosition: `${column * 100}% ${row * 100}%`,
      }}
    />
  );
}

export function GameCelebrationDialog({ kind, title, description, children, onContinue }: {
  kind: CelebrationKind;
  title: string;
  description: string;
  children?: ReactNode;
  onContinue: () => void;
}) {
  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onContinue(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="field-dialog-overlay" />
        <Dialog.Content className="field-dialog tmt-dialog-surface tmt-celebration-dialog">
          <CelebrationArt kind={kind} />
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          {children}
          <Dialog.Close asChild>
            <GameButton size="md" full className="mt-5">Lanjut</GameButton>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
