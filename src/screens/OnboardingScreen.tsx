import { ArrowRight, Map, Star, UserRound } from "lucide-react";
import { TmtEmblem } from "@/components/TmtBrandArt";

const steps = [
  { icon: UserRound, label: "Pilih nama dan avatar petualangmu." },
  { icon: Map, label: "Temukan misi pertama di peta." },
  { icon: Star, label: "Selesaikan misi dan raih bintang untuk membuka perjalanan baru." },
];

export function OnboardingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="field-shell field-entry">
      <main className="field-scroll">
        <div className="field-wrap field-entry-content">
          <div className="field-entry-art field-landscape" aria-hidden="true" />
          <div className="field-kicker mt-5 flex items-center gap-2"><TmtEmblem className="field-onboarding-emblem" /> TMT</div>
          <h1>Jelajahi Kota Ilmu</h1>
          <p>Asah nalar dan belajar berbuat baik lewat misi di sepanjang perjalananmu.</p>
          <ol className="field-entry-steps">
            {steps.map(({ icon: Icon, label }) => (
              <li key={label}><Icon size={20} aria-hidden="true" />{label}</li>
            ))}
          </ol>
          <p className="text-sm">Bisa dimainkan tanpa internet. Progres tersimpan di perangkat ini.</p>
        </div>
      </main>
      <footer className="field-entry-footer">
        <button type="button" className="field-button" onClick={onStart}>Mulai petualangan <ArrowRight size={18} aria-hidden="true" /></button>
      </footer>
    </div>
  );
}
