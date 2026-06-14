import { useEffect } from "react";

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="min-h-[100dvh] grid place-items-center bg-gradient-sky relative overflow-hidden">
      {/* clouds */}
      <div className="absolute top-10 left-6 text-5xl opacity-80 animate-bob">☁️</div>
      <div className="absolute top-24 right-8 text-4xl opacity-70 animate-bob" style={{ animationDelay: "0.8s" }}>☁️</div>
      {/* ground */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-meadow rounded-t-[50%]" />
      <div className="absolute bottom-2 left-8 text-3xl">🌳</div>
      <div className="absolute bottom-4 right-10 text-4xl">🌲</div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-5xl animate-bob">🦊</div>

      <div className="relative text-center px-6 -translate-y-10">
        <div className="text-7xl mb-3 animate-bob">📜</div>
        <h1 className="font-display font-black text-5xl text-[color:var(--wood-dark)] drop-shadow-[0_3px_0_oklch(0.95_0.05_95)]">
          Adab Quest
        </h1>
        <p className="mt-2 font-bold text-[color:var(--wood-dark)]/80">
          Petualangan Ilmu &amp; Akhlak
        </p>
        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full bg-[color:var(--wood-dark)]/60 animate-bob"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
