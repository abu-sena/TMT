import { useEffect, useState } from "react";

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (logoLoaded && minTimeElapsed) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
  }, [logoLoaded, minTimeElapsed, onDone]);

  const handleLogoLoad = () => setLogoLoaded(true);
  const handleLogoError = () => setLogoLoaded(true); // fallback — proceed even if logo fails

  return (
    <div className="h-[100dvh] w-full grid place-items-center relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0A1628 0%, #0F2847 30%, #1B3A5C 60%, #1E4D7B 100%)",
      }}
    >
      {/* Animated background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, #FFD700 0%, #1E90FF 40%, transparent 70%)",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      />
      
      {/* Decorative particles/stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#87CEEB" : "#FFFFFF",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Cloud decorations */}
      <div className="absolute top-8 left-4 text-4xl sm:text-5xl opacity-20 animate-bob select-none">☁️</div>
      <div className="absolute top-20 right-6 text-3xl sm:text-4xl opacity-15 animate-bob select-none" style={{ animationDelay: "0.8s" }}>☁️</div>
      <div className="absolute bottom-32 left-1/4 text-5xl sm:text-6xl opacity-10 animate-bob select-none" style={{ animationDelay: "1.6s" }}>☁️</div>

      <div className="relative text-center px-4 sm:px-6 flex flex-col items-center">
        {/* Logo Image */}
        <div className="relative mb-4 sm:mb-6">
          {/* Glow ring behind logo */}
          <div className="absolute inset-0 rounded-full opacity-40 blur-2xl"
            style={{
              background: "radial-gradient(circle, #FFD700 0%, #1E90FF 60%, transparent 100%)",
              transform: "scale(1.3)",
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          />
          <img
            src="./assets/logo.png"
            alt="TMT Logo"
            onLoad={handleLogoLoad}
            onError={handleLogoError}
            className="relative z-10 w-[min(82vw,520px)] h-auto max-h-[40vh] object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]"
            style={{
              filter: "drop-shadow(0 4px 20px rgba(30,144,255,0.4))",
            }}
          />
        </div>

        {/* Subtitle */}
        <p className="font-bold text-[#87CEEB] uppercase tracking-[0.25em] text-xs sm:text-sm mb-8 sm:mb-10 select-none"
          style={{ textShadow: "0 0 10px rgba(135,206,235,0.5)" }}
        >
          Petualangan Ilmu &amp; Akhlak
        </p>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-[#87CEEB]/70 font-bold text-xs sm:text-sm select-none">Memuat Petualangan...</p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full animate-bob"
                style={{
                  backgroundColor: i === 0 ? "#FFD700" : i === 1 ? "#1E90FF" : "#87CEEB",
                  animationDelay: `${i * 150}ms`,
                  boxShadow: `0 0 6px ${i === 0 ? "#FFD700" : i === 1 ? "#1E90FF" : "#87CEEB"}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS animations injected inline for safety */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bob { animation: bob 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
