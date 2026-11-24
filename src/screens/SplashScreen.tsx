import { useEffect } from "react";
import { TmtEmblem } from "@/components/TmtBrandArt";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <main className="field-shell field-opening">
      <div>
        <h1><TmtEmblem alt="TMT — The Mastermind Trials" className="field-opening-mark" /></h1>
        <p>Petualangan sang Mastermind</p>
        <div className="tmt-splash-loading" role="status" aria-label="Memuat petualangan">
          <span /><span /><span />
        </div>
      </div>
    </main>
  );
}
