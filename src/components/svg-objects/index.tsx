import React from "react";

export type SVGObjectProps = {
  isShadow?: boolean;
  missingPart?: string | null;
  className?: string;
};

// ==========================================
// 1. Kucing (Cat)
// Parts: tail, leftEar, rightEar, whiskers
// ==========================================
export const CatSvg = ({ isShadow, missingPart, className = "" }: SVGObjectProps) => {
  const fill = isShadow ? "#1A1A1A" : "#F59E0B";
  const detailFill = isShadow ? "#1A1A1A" : "#D97706";
  const eyeFill = isShadow ? "#1A1A1A" : "#FFFFFF";
  const pupilFill = isShadow ? "#1A1A1A" : "#000000";

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} aria-hidden="true">
      {/* Tail */}
      {missingPart !== "tail" && (
        <path d="M 80 70 C 95 70 95 40 85 40 C 75 40 80 60 70 60" fill="none" stroke={fill} strokeWidth="8" strokeLinecap="round" />
      )}
      
      {/* Body */}
      <ellipse cx="50" cy="65" rx="30" ry="25" fill={fill} />
      
      {/* Legs */}
      <rect x="30" y="75" width="10" height="20" rx="5" fill={fill} />
      <rect x="60" y="75" width="10" height="20" rx="5" fill={fill} />
      
      {/* Head */}
      <circle cx="40" cy="40" r="25" fill={fill} />
      
      {/* Left Ear */}
      {missingPart !== "leftEar" && (
        <polygon points="15,35 25,15 35,25" fill={fill} stroke={fill} strokeWidth="2" strokeLinejoin="round" />
      )}
      
      {/* Right Ear */}
      {missingPart !== "rightEar" && (
        <polygon points="45,25 55,15 65,35" fill={fill} stroke={fill} strokeWidth="2" strokeLinejoin="round" />
      )}
      
      {/* Face details (hidden in shadow to make it a flat silhouette) */}
      {!isShadow && (
        <>
          <circle cx="30" cy="35" r="5" fill={eyeFill} />
          <circle cx="30" cy="35" r="2" fill={pupilFill} />
          <circle cx="50" cy="35" r="5" fill={eyeFill} />
          <circle cx="50" cy="35" r="2" fill={pupilFill} />
          <polygon points="35,45 45,45 40,50" fill={detailFill} />
        </>
      )}

      {/* Whiskers */}
      {missingPart !== "whiskers" && (
        <>
          <line x1="10" y1="40" x2="25" y2="42" stroke={isShadow ? "#1A1A1A" : "#000"} strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="48" x2="25" y2="46" stroke={isShadow ? "#1A1A1A" : "#000"} strokeWidth="2" strokeLinecap="round" />
          <line x1="70" y1="40" x2="55" y2="42" stroke={isShadow ? "#1A1A1A" : "#000"} strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="48" x2="55" y2="46" stroke={isShadow ? "#1A1A1A" : "#000"} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

// ==========================================
// 2. Mobil (Car)
// Parts: frontWheel, backWheel, window, bumper
// ==========================================
export const CarSvg = ({ isShadow, missingPart, className = "" }: SVGObjectProps) => {
  const bodyFill = isShadow ? "#1A1A1A" : "#EF4444";
  const windowFill = isShadow ? "#1A1A1A" : "#93C5FD";
  const wheelFill = isShadow ? "#1A1A1A" : "#374151";
  const bumperFill = isShadow ? "#1A1A1A" : "#9CA3AF";

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} aria-hidden="true">
      {/* Bumper */}
      {missingPart !== "bumper" && (
        <rect x="5" y="60" width="90" height="10" rx="3" fill={bumperFill} />
      )}

      {/* Top Cabin */}
      <path d="M 25 45 L 35 25 L 65 25 L 75 45 Z" fill={bodyFill} />
      
      {/* Window */}
      {missingPart !== "window" && (
        <path d="M 32 40 L 38 28 L 62 28 L 68 40 Z" fill={windowFill} />
      )}

      {/* Main Body */}
      <rect x="10" y="45" width="80" height="20" rx="5" fill={bodyFill} />
      
      {/* Front Wheel */}
      {missingPart !== "frontWheel" && (
        <>
          <circle cx="25" cy="65" r="12" fill={wheelFill} />
          {!isShadow && <circle cx="25" cy="65" r="5" fill="#D1D5DB" />}
        </>
      )}

      {/* Back Wheel */}
      {missingPart !== "backWheel" && (
        <>
          <circle cx="75" cy="65" r="12" fill={wheelFill} />
          {!isShadow && <circle cx="75" cy="65" r="5" fill="#D1D5DB" />}
        </>
      )}
    </svg>
  );
};

// ==========================================
// 3. Rumah (House)
// Parts: chimney, door, window, roofDetail
// ==========================================
export const HouseSvg = ({ isShadow, missingPart, className = "" }: SVGObjectProps) => {
  const wallFill = isShadow ? "#1A1A1A" : "#FEF3C7";
  const roofFill = isShadow ? "#1A1A1A" : "#DC2626";
  const detailFill = isShadow ? "#1A1A1A" : "#3B82F6";
  const doorFill = isShadow ? "#1A1A1A" : "#8B5A2B";

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} aria-hidden="true">
      {/* Chimney */}
      {missingPart !== "chimney" && (
        <rect x="65" y="20" width="10" height="25" fill={doorFill} />
      )}

      {/* Main Wall */}
      <rect x="20" y="45" width="60" height="45" fill={wallFill} />
      
      {/* Roof */}
      <polygon points="10,45 50,15 90,45" fill={roofFill} stroke={roofFill} strokeWidth="2" strokeLinejoin="round" />
      
      {/* Roof Detail (Small window) */}
      {missingPart !== "roofDetail" && (
        <circle cx="50" cy="35" r="5" fill={detailFill} />
      )}

      {/* Door */}
      {missingPart !== "door" && (
        <rect x="40" y="60" width="20" height="30" fill={doorFill} />
      )}

      {/* Window */}
      {missingPart !== "window" && (
        <>
          <rect x="25" y="55" width="12" height="12" fill={detailFill} />
          <rect x="63" y="55" width="12" height="12" fill={detailFill} />
        </>
      )}
    </svg>
  );
};

// ==========================================
// 4. Bunga (Flower)
// Parts: leftLeaf, rightLeaf, leftPetal, rightPetal
// ==========================================
export const FlowerSvg = ({ isShadow, missingPart, className = "" }: SVGObjectProps) => {
  const stemFill = isShadow ? "#1A1A1A" : "#10B981";
  const petalFill = isShadow ? "#1A1A1A" : "#EC4899";
  const centerFill = isShadow ? "#1A1A1A" : "#FBBF24";

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} aria-hidden="true">
      {/* Stem */}
      <rect x="47" y="50" width="6" height="45" fill={stemFill} />
      
      {/* Left Leaf */}
      {missingPart !== "leftLeaf" && (
        <path d="M 47 70 C 30 70 20 60 47 60 Z" fill={stemFill} />
      )}

      {/* Right Leaf */}
      {missingPart !== "rightLeaf" && (
        <path d="M 53 75 C 70 75 80 65 53 65 Z" fill={stemFill} />
      )}

      {/* Left Petal */}
      {missingPart !== "leftPetal" && (
        <circle cx="35" cy="40" r="12" fill={petalFill} />
      )}

      {/* Right Petal */}
      {missingPart !== "rightPetal" && (
        <circle cx="65" cy="40" r="12" fill={petalFill} />
      )}

      {/* Top Petal */}
      <circle cx="50" cy="25" r="12" fill={petalFill} />
      
      {/* Bottom Petal */}
      <circle cx="50" cy="55" r="12" fill={petalFill} />

      {/* Center */}
      <circle cx="50" cy="40" r="12" fill={centerFill} />
    </svg>
  );
};

// ==========================================
// 5. Roket (Rocket)
// Parts: leftFin, rightFin, window, flame
// ==========================================
export const RocketSvg = ({ isShadow, missingPart, className = "" }: SVGObjectProps) => {
  const bodyFill = isShadow ? "#1A1A1A" : "#F3F4F6";
  const finFill = isShadow ? "#1A1A1A" : "#EF4444";
  const windowFill = isShadow ? "#1A1A1A" : "#3B82F6";
  const flameFill = isShadow ? "#1A1A1A" : "#F59E0B";

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} aria-hidden="true">
      {/* Flame */}
      {missingPart !== "flame" && (
        <path d="M 40 80 L 50 95 L 60 80 Z" fill={flameFill} />
      )}

      {/* Left Fin */}
      {missingPart !== "leftFin" && (
        <polygon points="35,60 20,80 35,80" fill={finFill} />
      )}

      {/* Right Fin */}
      {missingPart !== "rightFin" && (
        <polygon points="65,60 80,80 65,80" fill={finFill} />
      )}

      {/* Rocket Body */}
      <path d="M 35 40 C 35 15 50 5 50 5 C 50 5 65 15 65 40 L 65 80 L 35 80 Z" fill={bodyFill} />
      
      {/* Cone Tip */}
      <path d="M 38 25 C 45 15 50 5 50 5 C 50 5 55 15 62 25 Z" fill={finFill} />

      {/* Window */}
      {missingPart !== "window" && (
        <>
          <circle cx="50" cy="45" r="8" fill={windowFill} />
          {!isShadow && <circle cx="50" cy="45" r="6" fill="#93C5FD" />}
        </>
      )}
    </svg>
  );
};

export const SVG_REGISTRY: Record<string, React.FC<SVGObjectProps>> = {
  cat: CatSvg,
  car: CarSvg,
  house: HouseSvg,
  flower: FlowerSvg,
  rocket: RocketSvg,
};
